import { formatYear } from "~/utils/format";
import type {
  CertificationList,
  Collection,
  MediaCollection,
  MediaShortStrict,
  MovieShort,
  MovieFull,
  PersonMedia,
  PersonFull,
  TvShort,
  TvFull,
  WatchProviderCatalog,
  WatchProviderResults,
} from "./models";
import { MediaType } from "./models";
import { createJsonApiClient, getOptionalResult } from "./json-api";
export {
  getRegionFromLanguage,
  resolveMovieCertification,
  resolveRegionalWatchProviders,
  resolveTvCertification,
} from "./tmdb-metadata";

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_IMAGE_LANGUAGE = "en";
const MOVIE_DETAIL_APPEND_RESPONSE =
  "videos,credits,images,external_ids,release_dates";
const TV_DETAIL_APPEND_RESPONSE =
  "videos,credits,images,external_ids,content_ratings";
const PERSON_DETAIL_APPEND_RESPONSE = "images,external_ids";

const tmdbClient = createJsonApiClient({
  baseUrl: TMDB_API_BASE_URL,
  name: "TMDB",
  auth: {
    param: "api_key",
    value: () => process.env.TMDB_API_KEY,
  },
});

const fetchTMDB = async <T = unknown>(
  path: string,
  search: Record<string, boolean | number | string | undefined> = {},
): Promise<T> => {
  return tmdbClient.request<T>(path, { search });
};

const sortByYearDesc = <T>(
  items: T[],
  getDate: (item: T) => null | string | undefined,
) =>
  [...items].sort(
    (left, right) => formatYear(getDate(right)) - formatYear(getDate(left)),
  );

type GetTrendingMedia = {
  page: number;
  language: string;
  type: Exclude<MediaType, MediaType.Seasons>;
};
export const getTrendingMedia = async ({
  page,
  language,
  type,
}: GetTrendingMedia) => {
  const result = await fetchTMDB<
    MediaCollection<MediaShortStrict<typeof type>>
  >(`trending/${type}/week`, {
    page: String(page),
    language,
  });
  return result.results;
};

type GetMedias = {
  query: string;
  page: number;
  language: string;
  type: Exclude<MediaType, MediaType.Seasons>;
  region?: string;
};
export const getMedias = async ({
  query,
  page,
  language,
  type,
  region,
}: GetMedias) => {
  const result = await fetchTMDB<
    MediaCollection<MediaShortStrict<typeof type>>
  >(`${type}/${query}`, {
    page: String(page),
    language,
    ...(region ? { region } : {}),
  });

  return result.results;
};

type GetDetailType = {
  id: number;
  language: string;
};

export const getMovieDetails = ({ id, language }: GetDetailType) => {
  return fetchTMDB<MovieFull>(`${MediaType.Movie}/${id}`, {
    append_to_response: MOVIE_DETAIL_APPEND_RESPONSE,
    include_image_language: DEFAULT_IMAGE_LANGUAGE,
    language,
  });
};

export const getTvDetails = ({ id, language }: GetDetailType) => {
  return fetchTMDB<TvFull>(`${MediaType.Tv}/${id}`, {
    append_to_response: TV_DETAIL_APPEND_RESPONSE,
    include_image_language: DEFAULT_IMAGE_LANGUAGE,
    language,
  });
};

export const getPersonDetails = ({ id, language }: GetDetailType) => {
  return fetchTMDB<PersonFull>(`${MediaType.Person}/${id}`, {
    append_to_response: PERSON_DETAIL_APPEND_RESPONSE,
    include_image_language: DEFAULT_IMAGE_LANGUAGE,
    language,
  });
};

type GetWatchProviders = {
  id: number;
  type: MediaType.Movie | MediaType.Tv;
};

export const getWatchProviders = ({ id, type }: GetWatchProviders) => {
  return fetchTMDB<WatchProviderResults>(`${type}/${id}/watch/providers`);
};

export const getOptionalWatchProviders = async ({
  id,
  type,
}: GetWatchProviders) => {
  return getOptionalResult(
    () =>
      getWatchProviders({
        id,
        type,
      }),
    (error) => {
      console.error("Unable to fetch TMDB watch providers", error);
    },
  );
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

  if (type === MediaType.Movie) {
    return sortByYearDesc(result.results, (item) => item.release_date);
  }

  return sortByYearDesc(result.results, (item) => item.first_air_date);
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
  return sortByYearDesc(result.parts, (item) => item.release_date);
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

  return {
    ...result,
    cast: sortByYearDesc(result.cast, (item) => item.release_date),
    crew: sortByYearDesc(result.crew, (item) => item.release_date),
  };
};

export const getPersonTv = async ({ id, language }: GetPerson) => {
  const result = await fetchTMDB<PersonMedia>(`person/${id}/tv_credits`, {
    append_to_response: "credits",
    language,
  });

  return {
    ...result,
    cast: sortByYearDesc(result.cast, (item) => item.first_air_date),
    crew: sortByYearDesc(result.crew, (item) => item.first_air_date),
  };
};

type Search = {
  query: string;
  page: number;
  language: string;
};

export const search = ({ query, page, language }: Search) => {
  return fetchTMDB<MediaCollection<MovieFull & TvFull & PersonFull>>(
    "search/multi",
    {
      page: String(page),
      language,
      query,
    },
  );
};

type DiscoverMovie = {
  certification?: string;
  language: string;
  minVotes?: number;
  page: number;
  providerId?: number;
  region: string;
  sortBy: string;
  year?: number;
};

export const discoverMovies = ({
  certification,
  language,
  minVotes,
  page,
  providerId,
  region,
  sortBy,
  year,
}: DiscoverMovie) => {
  return fetchTMDB<MediaCollection<MovieShort>>("discover/movie", {
    page: String(page),
    language,
    sort_by: sortBy,
    region,
    watch_region: region,
    ...(minVotes ? { "vote_count.gte": String(minVotes) } : {}),
    ...(year ? { primary_release_year: String(year) } : {}),
    ...(providerId ? { with_watch_providers: String(providerId) } : {}),
    ...(certification
      ? {
          certification,
          certification_country: region,
        }
      : {}),
  });
};

type DiscoverTv = {
  language: string;
  minVotes?: number;
  page: number;
  providerId?: number;
  region: string;
  sortBy: string;
  year?: number;
};

export const discoverTv = ({
  language,
  minVotes,
  page,
  providerId,
  region,
  sortBy,
  year,
}: DiscoverTv) => {
  return fetchTMDB<MediaCollection<TvShort>>("discover/tv", {
    page: String(page),
    language,
    sort_by: sortBy,
    watch_region: region,
    ...(minVotes ? { "vote_count.gte": String(minVotes) } : {}),
    ...(year ? { first_air_date_year: String(year) } : {}),
    ...(providerId ? { with_watch_providers: String(providerId) } : {}),
  });
};

export const getMovieCertificationList = () => {
  return fetchTMDB<CertificationList>("certification/movie/list");
};

export const getOptionalMovieCertificationList = async () => {
  return getOptionalResult(
    () => getMovieCertificationList(),
    (error) => {
      console.error("Unable to fetch TMDB movie certifications", error);
    },
  );
};

export const getTvCertificationList = () => {
  return fetchTMDB<CertificationList>("certification/tv/list");
};

export const getOptionalTvCertificationList = async () => {
  return getOptionalResult(
    () => getTvCertificationList(),
    (error) => {
      console.error("Unable to fetch TMDB TV certifications", error);
    },
  );
};

type GetWatchProviderCatalog = {
  type: MediaType.Movie | MediaType.Tv;
};

export const getWatchProviderCatalog = ({ type }: GetWatchProviderCatalog) => {
  return fetchTMDB<WatchProviderCatalog>(`watch/providers/${type}`);
};

export const getOptionalWatchProviderCatalog = async ({
  type,
}: GetWatchProviderCatalog) => {
  return getOptionalResult(
    () => getWatchProviderCatalog({ type }),
    (error) => {
      console.error("Unable to fetch TMDB watch provider catalog", error);
    },
  );
};
