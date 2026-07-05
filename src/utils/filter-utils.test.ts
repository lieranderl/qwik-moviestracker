import { describe, expect, it } from "bun:test";
import type { Torrent } from "~/services/models";
import { filterAndSortTorrents } from "~/utils/filter-utils";
import { getTorrentBadges } from "~/utils/torrent-format";

const createTorrent = (overrides: Partial<Torrent>): Torrent => ({
  Date: "2026-01-01",
  DetailsUrl: "",
  DV: false,
  FHD: false,
  HDR: false,
  HDR10: false,
  HDR10plus: false,
  Hash: overrides.Name ?? "hash",
  K4: false,
  Leeches: 0,
  Magnet: `magnet:?xt=urn:btih:${overrides.Name ?? "hash"}`,
  Name: "Torrent",
  OriginalName: "",
  RussianName: "",
  Seeds: 0,
  Size: 1,
  Year: "2026",
  ...overrides,
});

const createFilterState = (overrides = {}) => ({
  category: "",
  dynamicRange: "",
  quality: "",
  season: "",
  selectedSort: "Date",
  tracker: "",
  videoType: "",
  voice: "",
  ...overrides,
});

describe("torrent filters", () => {
  it("matches 4K by JacRed quality and legacy K4 fallback", () => {
    const torrents = [
      createTorrent({ Name: "jacred-4k", Quality: 2160 }),
      createTorrent({ K4: true, Name: "legacy-4k" }),
      createTorrent({ Name: "hd", Quality: 1080 }),
    ];

    const filtered = filterAndSortTorrents(
      torrents,
      createFilterState({ quality: "2160" }),
    );

    expect(filtered.map((torrent) => torrent.Name).sort()).toEqual([
      "jacred-4k",
      "legacy-4k",
    ]);
  });

  it("filters by one strongest dynamic range value", () => {
    const torrents = [
      createTorrent({ DV: true, HDR: true, HDR10plus: true, Name: "dv" }),
      createTorrent({ HDR: true, HDR10plus: true, Name: "hdr10plus" }),
      createTorrent({ HDR: true, HDR10: true, Name: "hdr10" }),
      createTorrent({ HDR: true, Name: "hdr" }),
    ];

    expect(
      filterAndSortTorrents(
        torrents,
        createFilterState({ dynamicRange: "dv" }),
      ).map((torrent) => torrent.Name),
    ).toEqual(["dv"]);
    expect(
      filterAndSortTorrents(
        torrents,
        createFilterState({ dynamicRange: "hdr10plus" }),
      ).map((torrent) => torrent.Name),
    ).toEqual(["hdr10plus"]);
    expect(
      filterAndSortTorrents(
        torrents,
        createFilterState({ dynamicRange: "hdr10" }),
      ).map((torrent) => torrent.Name),
    ).toEqual(["hdr10"]);
    expect(
      filterAndSortTorrents(
        torrents,
        createFilterState({ dynamicRange: "hdr" }),
      ).map((torrent) => torrent.Name),
    ).toEqual(["hdr"]);
  });

  it("renders only one HDR-family badge per torrent card", () => {
    const badges = getTorrentBadges(
      createTorrent({
        DV: true,
        HDR: true,
        HDR10: true,
        HDR10plus: true,
        QualityLabel: "4K",
        Tracker: "rutracker",
        VideoType: "hdr",
      }),
    );
    const labels = badges.map((badge) => badge.label);

    expect(labels).toEqual(["rutracker", "4K", "Dolby Vision"]);
    expect(labels).not.toContain("HDR");
    expect(labels).not.toContain("HDR10");
    expect(labels).not.toContain("HDR10+");
  });
});
