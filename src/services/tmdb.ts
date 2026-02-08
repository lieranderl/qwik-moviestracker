import { formatYear } from "~/utils/format";
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

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_IMAGE_LANGUAGE = "en";
type BackdropMediaType = MediaType.Movie | MediaType.Tv;

const isBackdropMediaType = (
  type: Exclude<MediaType, MediaType.Seasons>,
): type is BackdropMediaType =>
  type === MediaType.Movie || type === MediaType.Tv;

const fetchTMDB = async <T = unknown>(
  path: string,
  search: Record<string, string> = {},
): Promise<T> => {
  const params = new URLSearchParams({
    ...search,
    api_key: process.env.TMDB_API_KEY || "",
  });
  const url = `${TMDB_API_BASE_URL}/${path}?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }
  return response.json() as T;
};

const withBackdrops = async <T extends MediaShortStrict<BackdropMediaType>>(
  media: T[],
  type: BackdropMediaType,
  setMediaType = false,
) =>
  await Promise.all(
    media.map(async (item) => {
      const [backdropPath] = await getImages({
        id: item.id,
        media_type: type,
        langString: DEFAULT_IMAGE_LANGUAGE,
      });
      item.backdrop_path = backdropPath;
      if (setMediaType) {
        item.media_type = type;
      }
      return item;
    }),
  );

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
    language,
  });
  if (result.total_results === 0) return result.results;
  if (!needbackdrop || !isBackdropMediaType(type)) {
    return result.results;
  }
  return withBackdrops(
    result.results as MediaShortStrict<BackdropMediaType>[],
    type,
  );
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
    const fallbackLang = DEFAULT_IMAGE_LANGUAGE;
    const primaryLang = langString.split("-")[0];

    const fetchImages = async (lang: string) =>
      await fetchTMDB<Images>(`${media_type}/${id}/images`, {
        include_image_language: lang,
      });

    const images = await fetchImages(primaryLang);

    const getFilePath = (
      items: { file_path: string }[],
      fallbackItems: { file_path: string }[],
    ) => {
      if (items.length > 0) return items[0].file_path;
      if (langString !== fallbackLang && fallbackItems.length > 0)
        return fallbackItems[0].file_path;
      return "";
    };

    const fallbackImages =
      langString !== fallbackLang
        ? await fetchImages(fallbackLang)
        : { backdrops: [], posters: [] };

    const backdrop = getFilePath(images.backdrops, fallbackImages.backdrops);
    const poster = getFilePath(images.posters, fallbackImages.posters);

    return [backdrop, poster];
  } catch (error) {
    console.error("Unable to fetch TMDB images", error);
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
    console.error("Unable to fetch TMDB poster", error);
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
    language,
  });

  if (result.total_results === 0) return result.results;
  if (!needbackdrop || !isBackdropMediaType(type)) {
    return result.results;
  }
  return withBackdrops(
    result.results as MediaShortStrict<BackdropMediaType>[],
    type,
    true,
  );
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
    include_image_language: DEFAULT_IMAGE_LANGUAGE,
    language,
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
    language,
  });

  if (result.total_results === 0) return result.results;
  let media = result.results;
  if (isBackdropMediaType(type)) {
    media = await withBackdrops(
      media as MediaShortStrict<BackdropMediaType>[],
      type,
      true,
    );
    if (type === MediaType.Movie) {
      media = media.sort(
        (a, b) => formatYear(b.release_date) - formatYear(a.release_date),
      );
    }
    if (type === MediaType.Tv) {
      media = media.sort(
        (a, b) => formatYear(b.first_air_date) - formatYear(a.first_air_date),
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
    language,
  });
  if (result.parts.length === 0) return result.parts;
  const newMovieMedia = result.parts.map(async (item) => {
    [item.backdrop_path] = await getImages({
      id: item.id,
      media_type: MediaType.Movie,
      langString: DEFAULT_IMAGE_LANGUAGE,
    });
    return item;
  });
  try {
    result.parts = await Promise.all(newMovieMedia);
    result.parts = result.parts.sort(
      (a, b) => formatYear(b.release_date) - formatYear(a.release_date),
    );
  } catch (error) {
    console.error("Unable to fetch collection movie backdrops", error);
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
    language,
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
    language,
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
    language,
    query,
  });
};
