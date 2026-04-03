import { canUseStorage, readStorageJson, writeStorageJson } from "./browser";
import { paths } from "./paths";

export type LastViewedItem = {
  href: string;
  title: string;
  kind: "movie" | "tv" | "person";
  meta?: string;
  imagePath?: string | null;
};

export type RecentSearch = {
  href: string;
  query: string;
};

const LAST_VIEWED_KEY = "moviestracker:last-viewed";
const RECENT_SEARCHES_KEY = "moviestracker:recent-searches";
const MAX_RECENT_SEARCHES = 5;

export const readLastViewed = () => {
  if (!canUseStorage()) {
    return null;
  }

  return readStorageJson<LastViewedItem | null>(LAST_VIEWED_KEY, null);
};

export const writeLastViewed = (item: LastViewedItem) => {
  if (!canUseStorage()) {
    return;
  }

  writeStorageJson(LAST_VIEWED_KEY, item);
};

export const readRecentSearches = () => {
  if (!canUseStorage()) {
    return [] as RecentSearch[];
  }

  return readStorageJson<RecentSearch[]>(RECENT_SEARCHES_KEY, []);
};

const normalizeRecentSearchQuery = (query: string) => query.trim();

export const createRecentSearchHref = ({
  lang,
  query,
}: {
  lang: string;
  query: string;
}) => `${paths.search(lang)}&q=${encodeURIComponent(normalizeRecentSearchQuery(query))}`;

export const createRecentSearch = ({
  lang,
  query,
}: {
  lang: string;
  query: string;
}): RecentSearch => {
  const normalizedQuery = normalizeRecentSearchQuery(query);

  return {
    href: createRecentSearchHref({
      lang,
      query: normalizedQuery,
    }),
    query: normalizedQuery,
  };
};

export const pushRecentSearch = (search: RecentSearch) => {
  if (!canUseStorage()) {
    return [] as RecentSearch[];
  }

  const nextSearches = readRecentSearches()
    .filter((entry) => entry.query.toLowerCase() !== search.query.toLowerCase())
    .slice(0, MAX_RECENT_SEARCHES - 1);

  const dedupedSearches = [search, ...nextSearches];
  writeStorageJson(RECENT_SEARCHES_KEY, dedupedSearches);
  return dedupedSearches;
};

export const pushRecentSearchQuery = ({
  lang,
  query,
}: {
  lang: string;
  query: string;
}) => {
  const normalizedQuery = normalizeRecentSearchQuery(query);

  if (!normalizedQuery) {
    return readRecentSearches();
  }

  return pushRecentSearch(
    createRecentSearch({
      lang,
      query: normalizedQuery,
    }),
  );
};
