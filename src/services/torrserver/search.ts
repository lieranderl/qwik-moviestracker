import type { TorrServerSearchResult } from "../torrserver";
import { parseTorrServerSearchResults } from "./payloads";
import { requestTorrServer } from "./transport";

const search = async (
  baseUrl: string,
  path: "search" | "torznab/search",
  query: string,
): Promise<TorrServerSearchResult[]> => {
  const raw = await requestTorrServer<TorrServerSearchResult[] | null>(
    baseUrl,
    { method: "GET", path, query: { query } },
  );
  return parseTorrServerSearchResults(raw);
};

export const searchRutor = (
  baseUrl: string,
  query: string,
): Promise<TorrServerSearchResult[]> => search(baseUrl, "search", query);

export const searchTorznab = (
  baseUrl: string,
  query: string,
): Promise<TorrServerSearchResult[]> =>
  search(baseUrl, "torznab/search", query);
