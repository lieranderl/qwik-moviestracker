import type { Torrent } from "~/services/models";

export type DynamicRangeFilter = "" | "dv" | "hdr" | "hdr10" | "hdr10plus";
export type TorrentBadgeTone = "feature" | "quality" | "tracker" | "video";

export type TorrentBadge = {
  label: string;
  tone: TorrentBadgeTone;
};

const dynamicRangeLabels: Record<Exclude<DynamicRangeFilter, "">, string> = {
  dv: "Dolby Vision",
  hdr: "HDR",
  hdr10: "HDR10",
  hdr10plus: "HDR10+",
};

const hdrVideoTypes = new Set([
  "dolby vision",
  "dv",
  "hdr",
  "hdr10",
  "hdr10+",
  "hdr10plus",
]);

const addUniqueBadge = (
  badges: TorrentBadge[],
  seen: Set<string>,
  label: string | undefined,
  tone: TorrentBadgeTone,
) => {
  const normalized = label?.trim();
  if (!normalized) {
    return;
  }

  const key = normalized.toLocaleLowerCase();
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  badges.push({ label: normalized, tone });
};

export const getDynamicRangeLabel = (value: DynamicRangeFilter) =>
  value ? dynamicRangeLabels[value] : "";

export const getTorrentDynamicRangeValue = (
  torrent: Torrent,
): DynamicRangeFilter => {
  if (torrent.DV) {
    return "dv";
  }
  if (torrent.HDR10plus) {
    return "hdr10plus";
  }
  if (torrent.HDR10) {
    return "hdr10";
  }
  if (torrent.HDR) {
    return "hdr";
  }

  return "";
};

export const getTorrentBadges = (torrent: Torrent) => {
  const badges: TorrentBadge[] = [];
  const seen = new Set<string>();

  addUniqueBadge(badges, seen, torrent.Tracker, "tracker");
  addUniqueBadge(
    badges,
    seen,
    torrent.QualityLabel || (torrent.K4 ? "4K" : torrent.FHD ? "FHD" : ""),
    "quality",
  );

  addUniqueBadge(
    badges,
    seen,
    getDynamicRangeLabel(getTorrentDynamicRangeValue(torrent)),
    "feature",
  );

  const videoType = torrent.VideoType?.trim();
  if (videoType && !hdrVideoTypes.has(videoType.toLocaleLowerCase())) {
    addUniqueBadge(badges, seen, videoType.toUpperCase(), "video");
  }

  return badges;
};
