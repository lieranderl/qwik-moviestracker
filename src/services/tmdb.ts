import { formatYear } from "~/utils/fomat";
import type {
	Collection,
	Images,
	MediaCollection,
	MediaFull,
	MediaShort,
	MediaShortStrict,
	PersonMedia,
} from "./models";
import { MediaType } from "./models";

const baseURL = "https://api.themoviedb.org/3";
const fetchTMDB = async <T = unknown>(
	path: string,
	search: Record<string, string> = {},
): Promise<T> => {
	const params = new URLSearchParams({
		...search,
		api_key: process.env.TMDB_API_KEY || "",
	});
	const url = `${baseURL}/${path}?${params}`;
	const response = await fetch(url);
	if (!response.ok) {
		// eslint-disable-next-line no-console
		console.error(url);
		throw new Error(response.statusText);
	}
	return response.json() as T;
};

type GetTrendingMedia = {
	page: number;
	language: string;
	type: Exclude<MediaType, MediaType.Seasons>;
	needbackdrop: boolean;
};
export const getTrendingMedia = async ({
	page,
	language,
	type,
	needbackdrop,
}: GetTrendingMedia) => {
	const result = await fetchTMDB<
		MediaCollection<MediaShortStrict<typeof type>>
	>(`trending/${type}/week`, {
		page: String(page),
		language: language,
	});
	if (result.total_results === 0) return result.results;
	let media = result.results;

	if (type === MediaType.Movie || type === MediaType.Tv) {
		if (!needbackdrop) {
			return media;
		}
		media = await Promise.all(
			media.map(async (item) => {
				const movie = item as MediaShortStrict<typeof type>;
				[movie.backdrop_path] = await getImages({
					id: item.id,
					media_type: type,
					langString: "en",
				});
				return movie;
			}),
		);
	}
	return media;
};

export const getImages = async ({
	id,
	media_type,
	langString,
}: {
	id: number;
	media_type: MediaType;
	langString: string;
}): Promise<[string, string]> => {
	try {
		const fallbackLang = "en";
		const primaryLang = langString.split("-")[0];

		const fetchImages = async (lang: string) =>
			await fetchTMDB<Images>(`${media_type}/${id}/images`, {
				include_image_language: lang,
			});

		// Fetch initial images
		const images = await fetchImages(primaryLang);

		// Helper function to get the first file path or fallback to empty string
		const getFilePath = (
			items: { file_path: string }[],
			fallbackItems: { file_path: string }[],
		) => {
			if (items.length > 0) return items[0].file_path;
			if (langString !== fallbackLang && fallbackItems.length > 0)
				return fallbackItems[0].file_path;
			return "";
		};

		// Fetch fallback images if needed
		const fallbackImages =
			langString !== fallbackLang
				? await fetchImages(fallbackLang)
				: { backdrops: [], posters: [] };

		const backdrop = getFilePath(images.backdrops, fallbackImages.backdrops);
		const poster = getFilePath(images.posters, fallbackImages.posters);

		return [backdrop, poster];
	} catch (error) {
		console.error(error);
		console.log("skip images");
		return ["", ""];
	}
};

export const getMediaPoster = async ({
	id,
	media_type,
	langString,
}: {
	id: number;
	media_type: MediaType;
	langString: string;
}) => {
	try {
		const images = await fetchTMDB<Images>(`${media_type}/${id}/images`, {
			include_image_language: langString,
		});
		if (images.posters.length === 0) {
			const images = await fetchTMDB<Images>(`${media_type}/${id}/images`);
			if (images.posters.length === 0) {
				return "";
			}
			const poster = images.posters[0];
			return poster.file_path;
		}
		const poster = images.posters[0];
		return poster.file_path;
	} catch (error) {
		console.error(error);
		console.log("skip poster");
	}
	return "";
};

export const withImages = async (movies: MediaShort[], lang: string) => {
	const m = await Promise.all(
		movies.map(async (item) => {
			const [backdrop, poster] = await getImages({
				id: item.id,
				media_type: MediaType.Movie,
				langString: lang,
			});
			item.backdrop_path = backdrop;
			item.poster_path = poster;
			return item;
		}),
	);
	return m;
};

type GetMedias = {
	query: string;
	page: number;
	language: string;
	type: Exclude<MediaType, MediaType.Seasons>;
	needbackdrop: boolean;
};
export const getMedias = async ({
	query,
	page,
	language,
	type,
	needbackdrop,
}: GetMedias) => {
	const result = await fetchTMDB<
		MediaCollection<MediaShortStrict<typeof type>>
	>(`${type}/${query}`, {
		page: String(page),
		language: language,
	});

	if (result.total_results === 0) return result.results;
	let media = result.results;
	if (type === MediaType.Movie || type === MediaType.Tv) {
		if (!needbackdrop) {
			return media;
		}
		media = await Promise.all(
			media.map(async (item) => {
				const movie = item as MediaShortStrict<typeof type>;
				[movie.backdrop_path] = await getImages({
					id: item.id,
					media_type: type,
					langString: "en",
				});
				movie.media_type = type;
				return movie;
			}),
		);
	}
	return media;
};

type GetMediaDetailsType = {
	id: number;
	language: string;
	append_to_response?: string;
	type: MediaType;
};
export const getMediaDetails = ({
	id,
	language,
	type,
}: GetMediaDetailsType) => {
	return fetchTMDB<MediaFull>(`${type}/${id}`, {
		append_to_response: "videos,credits,images,external_ids,release_dates",
		include_image_language: "en",
		language: language,
	});
};

type GetMediaRecomType = {
	id: number;
	query: string;
	language: string;
	type: Exclude<MediaType, MediaType.Seasons>;
};
export const getMediaRecom = async ({
	id,
	language,
	type,
	query,
}: GetMediaRecomType) => {
	const result = await fetchTMDB<
		MediaCollection<MediaShortStrict<typeof type>>
	>(`${type}/${id}/${query}`, {
		language: language,
	});

	if (result.total_results === 0) return result.results;
	let media = result.results;
	if (type === MediaType.Movie || type === MediaType.Tv) {
		media = await Promise.all(
			media.map(async (item) => {
				const movie = item as MediaShortStrict<typeof type>;
				[movie.backdrop_path] = await getImages({
					id: item.id,
					media_type: type,
					langString: "en",
				});
				movie.media_type = type;
				return movie;
			}),
		);
		if (type === MediaType.Movie) {
			media = media.sort(
				(a, b) =>
					formatYear(b.release_date ?? "0") - formatYear(a.release_date ?? "0"),
			);
		}
		if (type === MediaType.Tv) {
			media = media.sort(
				(a, b) =>
					formatYear(b.first_air_date ?? "0") -
					formatYear(a.first_air_date ?? "0"),
			);
		}
	}
	return media;
};

type GetColMoviesType = {
	id: number;
	language: string;
};
export const getCollectionMovies = async ({
	id,
	language,
}: GetColMoviesType) => {
	const result = await fetchTMDB<Collection>(`collection/${id}`, {
		language: language,
	});
	if (result.parts.length === 0) return result.parts;
	const newMovieMedia = result.parts.map(async (item) => {
		[item.backdrop_path] = await getImages({
			id: item.id,
			media_type: MediaType.Movie,
			langString: "en",
		});
		return item;
	});
	try {
		result.parts = await Promise.all(newMovieMedia);
		result.parts = result.parts.sort(
			(a, b) =>
				formatYear(b.release_date ?? "0") - formatYear(a.release_date ?? "0"),
		);
	} catch (error) {
		console.error(error);
		console.log("skip movie backdrop");
	}
	return result.parts;
};

type GetPerson = {
	id: number;
	language: string;
};

export const getPersonMovies = async ({ id, language }: GetPerson) => {
	const result = await fetchTMDB<PersonMedia>(`person/${id}/movie_credits`, {
		append_to_response: "credits",
		language: language,
	});

	result.cast = result.cast.sort(
		(a, b) => formatYear(b.release_date) - formatYear(a.release_date),
	);
	result.crew = result.crew.sort(
		(a, b) => formatYear(b.release_date) - formatYear(a.release_date),
	);
	return result;
};

export const getPersonTv = async ({ id, language }: GetPerson) => {
	const result = await fetchTMDB<PersonMedia>(`person/${id}/tv_credits`, {
		append_to_response: "credits",
		language: language,
	});

	result.cast = result.cast.sort(
		(a, b) => formatYear(b.first_air_date) - formatYear(a.first_air_date),
	);
	result.crew = result.crew.sort(
		(a, b) => formatYear(b.first_air_date) - formatYear(a.first_air_date),
	);
	return result;
};

type Search = {
	query: string;
	page: number;
	language: string;
};

export const search = ({ query, page, language }: Search) => {
	return fetchTMDB<MediaCollection<MediaFull>>("search/multi", {
		page: String(page),
		language: language,
		query,
	});
};
