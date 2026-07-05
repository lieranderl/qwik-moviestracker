import type { Torrent } from "~/services/models";
import { getTorrentDynamicRangeValue } from "~/utils/torrent-format";

interface FilterState {
  category: string;
  dynamicRange: string;
  quality: string;
  season: string;
  selectedSort: string;
  tracker: string;
  videoType: string;
  voice: string;
}

export const filterAndSortTorrents = (
  torrents: Torrent[],
  filterState: FilterState,
): Torrent[] => {
  let filtered = [...torrents];

  if (filterState.tracker) {
    filtered = filtered.filter((t) => t.Tracker === filterState.tracker);
  }
  if (filterState.quality) {
    filtered = filtered.filter((t) => {
      if (filterState.quality === "2160") {
        return t.Quality === 2160 || t.K4;
      }
      if (filterState.quality === "1080") {
        return t.Quality === 1080 || t.FHD;
      }

      return String(t.Quality ?? "") === filterState.quality;
    });
  }
  if (filterState.dynamicRange) {
    filtered = filtered.filter(
      (t) => getTorrentDynamicRangeValue(t) === filterState.dynamicRange,
    );
  }
  if (filterState.videoType) {
    filtered = filtered.filter((t) => t.VideoType === filterState.videoType);
  }
  if (filterState.voice) {
    filtered = filtered.filter((t) => t.Voices?.includes(filterState.voice));
  }
  if (filterState.category) {
    filtered = filtered.filter((t) => t.Categories?.includes(filterState.category));
  }
  if (filterState.season) {
    filtered = filtered.filter((t) =>
      t.Seasons?.some((season) => String(season) === filterState.season),
    );
  }

  return filtered.sort((a, b) => {
    const valA = a[filterState.selectedSort as keyof Torrent] ?? "";
    const valB = b[filterState.selectedSort as keyof Torrent] ?? "";

    if (valA > valB) return -1;
    if (valA < valB) return 1;
    return 0;
  });
};
