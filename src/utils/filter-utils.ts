import type { Torrent } from "~/services/models";

export interface FilterState {
    k4: boolean;
    hdr: boolean;
    hdr10: boolean;
    hdr10plus: boolean;
    dv: boolean;
    selectedSort: string;
}

export const filterAndSortTorrents = (
    torrents: Torrent[],
    filterState: FilterState,
): Torrent[] => {
    let filtered = [...torrents];

    if (filterState.k4) filtered = filtered.filter((t) => t.K4);
    if (filterState.hdr) filtered = filtered.filter((t) => t.HDR);
    if (filterState.hdr10) filtered = filtered.filter((t) => t.HDR10);
    if (filterState.hdr10plus) filtered = filtered.filter((t) => t.HDR10plus);
    if (filterState.dv) filtered = filtered.filter((t) => t.DV);

    return filtered.sort((a, b) => {
        const valA = a[filterState.selectedSort as keyof Torrent];
        const valB = b[filterState.selectedSort as keyof Torrent];

        if (valA > valB) return -1;
        if (valA < valB) return 1;
        return 0;
    });
};
