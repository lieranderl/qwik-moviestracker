export const MIN_SEARCH_QUERY_LENGTH = 3;

export const normalizeSearchQuery = (query: string) => query.trim();

export const getSearchPhrase = (query: string) => {
	const normalizedQuery = normalizeSearchQuery(query);
	return normalizedQuery.length >= MIN_SEARCH_QUERY_LENGTH
		? normalizedQuery
		: "";
};

export type SearchRequest = {
	language: string;
	page: number;
	query: string;
};

type SearchExecutor<TSearchResults> = (
	request: SearchRequest,
) => Promise<TSearchResults>;

export const createSearchRequest = ({
	language,
	query,
}: {
	language: string;
	query: string;
}) => {
	const phrase = getSearchPhrase(query);
	if (!phrase) {
		return null;
	}

	return {
		language,
		page: 1,
		query: phrase,
	};
};

export const runSearchQuery = async <TSearchResults>({
	execute,
	language,
	query,
}: {
	execute: SearchExecutor<TSearchResults>;
	language: string;
	query: string;
}) => {
	const request = createSearchRequest({
		language,
		query,
	});
	if (!request) {
		return null;
	}

	return execute(request);
};
