export type LastViewedItem = {
	href: string;
	title: string;
	kind: "movie" | "tv" | "person";
	meta?: string;
	imagePath?: string | null;
};

type RecentSearch = {
	href: string;
	query: string;
};

const LAST_VIEWED_KEY = "moviestracker:last-viewed";
const RECENT_SEARCHES_KEY = "moviestracker:recent-searches";
const MAX_RECENT_SEARCHES = 5;

const canUseStorage = () =>
	typeof window !== "undefined" && typeof localStorage !== "undefined";

const safeParse = <TData>(value: string | null, fallback: TData): TData => {
	if (!value) {
		return fallback;
	}

	try {
		return JSON.parse(value) as TData;
	} catch {
		return fallback;
	}
};

export const readLastViewed = () => {
	if (!canUseStorage()) {
		return null;
	}

	return safeParse<LastViewedItem | null>(
		localStorage.getItem(LAST_VIEWED_KEY),
		null,
	);
};

export const writeLastViewed = (item: LastViewedItem) => {
	if (!canUseStorage()) {
		return;
	}

	localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(item));
};

export const readRecentSearches = () => {
	if (!canUseStorage()) {
		return [] as RecentSearch[];
	}

	return safeParse<RecentSearch[]>(
		localStorage.getItem(RECENT_SEARCHES_KEY),
		[],
	);
};

export const pushRecentSearch = (search: RecentSearch) => {
	if (!canUseStorage()) {
		return [] as RecentSearch[];
	}

	const nextSearches = readRecentSearches()
		.filter((entry) => entry.query.toLowerCase() !== search.query.toLowerCase())
		.slice(0, MAX_RECENT_SEARCHES - 1);

	const dedupedSearches = [search, ...nextSearches];
	localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(dedupedSearches));
	return dedupedSearches;
};
