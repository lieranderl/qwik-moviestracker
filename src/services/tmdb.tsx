import type {
  Collection,
  Genre,
  MediaDetails,
  MediaType,
  MovieMedia,
  MovieMediaDetails,
  PersonMediaDetails,
  ProductionMedia,
  Torrent,
  TvMedia,
  TvMediaDetails,
} from "./types";
import type { getMoviesIdsType } from "./firestore";
import { getMoviesFirebase } from "./firestore";
import { formatYear } from "~/utils/fomat";
import type { Timestamp } from "firebase/firestore";


const baseURL = "https://api.themoviedb.org/3";

const fetchTMDB = async <T = unknown,>(
  path: string,
  search: Record<string, string> = {}
): Promise<T> => {
  const params = new URLSearchParams({
    ...search,
    api_key: import.meta.env.VITE_TMDB_API_KEY,
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

type GetTrendingTv = {
  page: number;
  language: string;
};

export const getTrendingTv = ({ page }: GetTrendingTv) => {
  return fetchTMDB<Collection<TvMedia>>(`trending/tv/week`, {
    page: String(page),
  });
};

type GetTrendingMovie = {
  page: number;
  language: string;
};

export const getTrendingMovie = ({ page, language }: GetTrendingMovie) => {
  return fetchTMDB<Collection<MovieMedia>>(`trending/movie/week`, {
    page: String(page),
    language: language,
  });
};

export const getMediaBackdrop = async ({
  id,
  media_type,
  langString,
}: {
  id: number;
  media_type: "movie" | "tv";
  langString: string;
}) => {
  try {
    const images = await fetchTMDB<any>(`${media_type}/${id}/images`, {
      include_image_language: langString,
    });
    if (images.backdrops.length == 0) return;
    const backdrop = images.backdrops[0];
    return backdrop.file_path as string;
  } catch (error) {
    console.log("skip backdrop");
  }
};

export const getTrendingTvWithBackdrops = async ({
  page,
  language,
}: GetTrendingTv) => {
  const result = await fetchTMDB<Collection<TvMedia>>(`trending/tv/week`, {
    page: String(page),
    language: language,
  });
  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "tv",
      langString: "en",
    });
    if (backdrop === "") return item;
    item.backdrop_path = backdrop;
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
  } catch (error) {
    console.log("skip tv backdrop");
  }

  return result;
};

export const getTrendingMovieWithBackdrops = async ({
  page,
  language,
}: GetTrendingMovie) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(
    `trending/movie/week`,
    {
      page: String(page),
      language: language,
    }
  );
  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "movie",
      langString: "en",
    });
    if (backdrop === "") return item;
    item.backdrop_path = backdrop;
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

type getFirebaseMoviesType = {
  language: string;
  entries: number;
  startTime: number;
  db_name: string;
  sortDirection?: "asc" | "desc";
  need_backdrop: boolean;
};

export const getFirebaseMovies = async ({
  entries,
  startTime,
  language,
  db_name,
  sortDirection,
  need_backdrop,
}: getFirebaseMoviesType) => {
  const getMoviesIdsInput: getMoviesIdsType = {
    page: entries,
    dbName: db_name,
    startTime: startTime,
  };
  let movies = await getMoviesFirebase(getMoviesIdsInput);
  if (movies.length == 0) return movies;
  movies = await Promise.all(
    movies.map(async (item) => {
      if (need_backdrop) {
        const backdrop = await getMediaBackdrop({
          id: item.id,
          media_type: "movie",
          langString: "en",
        });
        if (backdrop) {
          item.backdrop_path = backdrop;
        } else {
          const backdrop = await getMediaBackdrop({
            id: item.id,
            media_type: "movie",
            langString: "",
          });
          item.backdrop_path = backdrop;
        }
      }

      if (language == "en-US") {
        item.title = item.original_title;
      }
      item.Torrents = [];
      item.lastTimeFound = (item.LastTimeFound! as Timestamp).toMillis();
      item.LastTimeFound = (item.LastTimeFound! as Timestamp).toMillis();

      return item;
    })
  );

  // result.results = await Promise.all(newMovieMedia);
  if (sortDirection === "asc") {
    movies = movies.sort(
      (a, b) => (a.lastTimeFound! as number) - (b.lastTimeFound! as number)
    );
    return movies;
  } else {
    movies = movies.sort(
      (a, b) => (b.lastTimeFound! as number) - (a.lastTimeFound! as number)
    );
    return movies;
  }
};

type GetMovie = {
  id: number;
  language: string;
  append_to_response?: string;
  need_backdrop?: boolean;
};

export const getMovie = async ({
  id,
  language,
  need_backdrop,
}: // append_to_response,
GetMovie) => {
  const result = await fetchTMDB<MovieMediaDetails>(`movie/${id}`, {
    //"videos,credits,images,external_ids,release_dates"
    // append_to_response: append_to_response ? append_to_response : "",
    include_image_language: "en",
    language: language,
  });
  if (need_backdrop) {
    const backdrop = await getMediaBackdrop({
      id: id,
      media_type: "movie",
      langString: "en",
    });
    if (backdrop === "") return { ...result, media_type: "movie" as const };
    result.backdrop_path = backdrop;
  }
  return { ...result, media_type: "movie" as const };
};

export const getMovieDetails = async ({ id, language }: GetMovie) => {
  const result = await fetchTMDB<MovieMediaDetails>(`movie/${id}`, {
    append_to_response: "videos,credits,images,external_ids,release_dates",
    include_image_language: "en",
    language: language,
  });
  return { ...result, media_type: "movie" as const };
};

type GetMovies = {
  query: string;
  page: number;
};

export const getMovies = async ({ query, page }: GetMovies) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(`movie/${query}`, {
    page: String(page),
  });
  const results = result.results?.map((item) => ({
    ...item,
    media_type: "movie" as const,
  }));
  return { ...result, results };
};

type GetSimilarType = {
  id: number;
  lang: string;
};

export const getSimilarMovies = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(
    `movie/${id}/similar`,
    {
      language: lang,
    }
  );

  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "movie",
      langString: "en",
    });
    if (backdrop === "") return item;
    item.backdrop_path = backdrop;
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
    result.results = result.results.sort(
      (a, b) => formatYear(b.release_date!) - formatYear(a.release_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

export const getRecommendationMovies = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(
    `movie/${id}/recommendations`,
    {
      language: lang,
    }
  );
  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "movie",
      langString: "en",
    });
    if (backdrop) {
      item.backdrop_path = backdrop;
    } else {
      const backdrop = await getMediaBackdrop({
        id: item.id,
        media_type: "movie",
        langString: "",
      });
      item.backdrop_path = backdrop;
    }
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
    result.results = result.results.sort(
      (a, b) => formatYear(b.release_date!) - formatYear(a.release_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

export const getCollectionMovies = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(`collection/${id}`, {
    language: lang,
  });
  if (result.parts.length == 0) return result;
  const newMovieMedia = result.parts.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "movie",
      langString: "en",
    });
    if (backdrop === "") return item;
    item.backdrop_path = backdrop;
    return item;
  });
  try {
    result.parts = await Promise.all(newMovieMedia);
    result.parts = result.parts.sort(
      (a, b) => formatYear(b.release_date!) - formatYear(a.release_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

type GetTvShow = {
  id: number;
  language: string;
};

export const getTvShowDetails = async ({ id, language }: GetTvShow) => {
  const result = await fetchTMDB<TvMediaDetails>(`tv/${id}`, {
    append_to_response: "videos,credits,images,external_ids,content_ratings",
    include_image_language: "en",
    language: language,
  });
  return { ...result, media_type: "tv" as const };
};

type GetTvShows = {
  query: string;
  page: number;
  language: string;
};

export const getTvShows = async ({ query, page, language }: GetTvShows) => {
  const result = await fetchTMDB<Collection<TvMedia>>(`tv/${query}`, {
    page: String(page),
    language: language,
  });
  const results = result.results?.map((item) => ({
    ...item,
    media_type: "tv" as const,
  }));
  return { ...result, results };
};

export const getSimilarTv = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<TvMedia>>(`tv/${id}/similar`, {
    language: lang,
  });

  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "tv",
      langString: "en",
    });
    if (backdrop === "") return item;
    item.backdrop_path = backdrop;
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
    result.results = result.results.sort(
      (a, b) => formatYear(b.first_air_date!) - formatYear(a.first_air_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

export const getRecommendationTv = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<TvMedia>>(
    `tv/${id}/recommendations`,
    {
      language: lang,
    }
  );
  if (!result.results) return result;
  const newMovieMedia = result.results.map(async (item) => {
    const backdrop = await getMediaBackdrop({
      id: item.id,
      media_type: "tv",
      langString: "en",
    });
    if (backdrop) {
      item.backdrop_path = backdrop;
    } else {
      const backdrop = await getMediaBackdrop({
        id: item.id,
        media_type: "tv",
        langString: "",
      });
      item.backdrop_path = backdrop;
    }
    return item;
  });
  try {
    result.results = await Promise.all(newMovieMedia);
    result.results = result.results.sort(
      (a, b) => formatYear(b.first_air_date!) - formatYear(a.first_air_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

type GetPerson = {
  id: number;
  language: string;
};

export const getPerson = async ({ id, language }: GetPerson) => {
  const result = await fetchTMDB<PersonMediaDetails>(`person/${id}`, {
    append_to_response: "images,combined_credits,external_ids",
    include_image_language: "en",
    language: language,
  });
  return { ...result, media_type: "person" as const };
};

export const getPersonMovies = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<MovieMedia>>(
    `person/${id}/movie_credits`,
    {
      append_to_response: "credits",
      language: lang,
    }
  );

  try {
    result.cast = result.cast.sort(
      (a, b) => formatYear(b.release_date!) - formatYear(a.release_date!)
    );
    result.crew = result.crew.sort(
      (a, b) => formatYear(b.release_date!) - formatYear(a.release_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

export const getPersonTv = async ({ id, lang }: GetSimilarType) => {
  const result = await fetchTMDB<Collection<TvMedia>>(
    `person/${id}/tv_credits`,
    {
      language: lang,
      append_to_response: "credits",
    }
  );

  try {
    result.cast = result.cast.sort(
      (a, b) => formatYear(b.first_air_date!) - formatYear(a.first_air_date!)
    );
    result.crew = result.crew.sort(
      (a, b) => formatYear(b.first_air_date!) - formatYear(a.first_air_date!)
    );
  } catch (error) {
    console.log("skip movie backdrop");
  }

  return result;
};

type Search = {
  query: string;
  page: number;
  language: string;
};

export const search = ({ query, page, language }: Search) => {
  return fetchTMDB<Collection<ProductionMedia>>("search/multi", {
    page: String(page),
    language: language,
    query,
  });
};

type GetRandomMedia<T> = {
  collections: Collection<T>[];
};

export const getRandomMedia = ({ collections }: GetRandomMedia<any>) => {
  const items = collections.flatMap((collection) => collection.results || []);
  const randomItem = items[Math.floor(Math.random() * items.length)];
  return randomItem;
};

type GetMediaByGenre = {
  media: MediaType;
  genre: number;
  page: number;
};

export const getMediaByGenre = async ({
  media,
  genre,
  page,
}: GetMediaByGenre) => {
  const result = await fetchTMDB<Collection<ProductionMedia>>(
    `discover/${media}`,
    {
      append_to_response: "genres",
      page: String(page),
      with_genres: String(genre),
    }
  );
  const results = result.results?.map((item) => ({
    ...item,
    media_type: media,
  })) as (TvMedia | MovieMedia)[];

  const firstId = results[0].id;
  const first = await fetchTMDB<MediaDetails>(`${media}/${firstId}`);
  const found = first.genres?.find((entry) => entry.id === genre);

  return { ...result, genre: found, results };
};

type GetGenreList = {
  media: MediaType;
};

export const getGenreList = async ({ media }: GetGenreList) => {
  const res = await fetchTMDB<{ genres: Genre[] }>(`genre/${media}/list`, {});
  return res.genres;
};

const baseCGURL = "https://moviestracker-gw-eu-w1-8vmmbwbl.ew.gateway.dev";

export type ImdbRating = {
  Id: string;
  Rating: string;
  Votes: string;
};

const fetchAPI = async <T = unknown,>(
  path: string,
  search: Record<string, string> = {}
): Promise<T> => {
  const params = new URLSearchParams({
    ...search,
    key: import.meta.env.VITE_GC_API_KEY,
  });
  const url = `${baseCGURL}/${path}?${params}`;
  const response = await fetch(url, {
    headers: {
      Origin: "https://moviestracker.web.app",
      Referer: "https://moviestracker.web.app",
    },
  });
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(response.headers);
    console.error(url);
    throw new Error(response.statusText);
  }

  return response.json() as T;
};

export const getImdbRating = (imdb_id: string) => {
  return fetchAPI<ImdbRating>(`getimdb`, { imdb_id });
};

export type getTorrentsType = {
  name: string;
  year: number;
  isMovie: boolean;
};

export const getTorrents = ({ name, year, isMovie }: getTorrentsType) => {
  return fetchAPI<Torrent[]>(`gettorrents`, {
    MovieName: name,
    Year: year.toString(),
    isMovie: String(isMovie),
  });
};


