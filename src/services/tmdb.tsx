import type {
  Collection,
  Genre,
  MediaDetails,
  MediaType,
  MovieMedia,
  MovieMediaDetails,
  PersonMediaDetails,
  ProductionMedia,
  TvMedia,
  TvMediaDetails,
} from "./types";
import type { getMoviesIdsType } from "./firestore";
import { getMoviesIds } from "./firestore";

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
    const images = await fetchTMDB<any>(`tv/${item.id}/images`, {
      include_image_language: "en",
    });
    if (images.backdrops.length == 0) return item;
    const backdrop = images.backdrops[0];
    item.backdrop_path = backdrop.file_path;
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
    const images = await fetchTMDB<any>(`movie/${item.id}/images`, {
      include_image_language: "en",
    });
    if (images.backdrops.length == 0) return item;
    const backdrop = images.backdrops[0];
    item.backdrop_path = backdrop.file_path;
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
    db_name: string
    sortDirection?: "asc" | "desc";
}

export const getFirebaseMovies = async ({
    entries,
    startTime,
    language,
    db_name,
    sortDirection,
  }: getFirebaseMoviesType) => {
    const getMoviesIdsInput: getMoviesIdsType = {
      page: entries,
      dbName: db_name,
      startTime: startTime,
    };
    const mIds = await getMoviesIds(getMoviesIdsInput);
    const movies: MovieMediaDetails[] = [];
  
    for (const mId of mIds) {
      const m = await getMovie({ id: mId.id, language: language })
      m.lastTimeFound = mId.lastTimeFound;
      movies.push(m);
    }
    if (sortDirection === "asc") {
        const newtorMovies = movies.sort((a,b)=>(a.lastTimeFound! - b.lastTimeFound!));
        return newtorMovies;
    } else {
        const newtorMovies = movies.sort((a,b)=>(b.lastTimeFound! - a.lastTimeFound!));
        return newtorMovies;
    }

    
  };




type GetMovie = {
  id: number;
  language: string;
  append_to_response?: string;
};

export const getMovie = async ({
  id,
  language,
  append_to_response,
}: GetMovie) => {
  const result = await fetchTMDB<MovieMediaDetails>(`movie/${id}`, {
    //"videos,credits,images,external_ids,release_dates"
    append_to_response: append_to_response ? append_to_response : "",
    include_image_language: "en",
    language: language,
  });
  const images = await fetchTMDB<any>(`movie/${result.id}/images`, {
    include_image_language: "en",
  });
  if (images.backdrops.length == 0)
    return { ...result, media_type: "movie" as const };
  result.backdrop_path = images.backdrops[0].file_path;

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

type GetTvShow = {
  id: number;
};

export const getTvShow = async ({ id }: GetTvShow) => {
  const result = await fetchTMDB<TvMediaDetails>(`tv/${id}`, {
    append_to_response: "videos,credits,images,external_ids,content_ratings",
    include_image_language: "en",
  });
  return { ...result, media_type: "tv" as const };
};

type GetTvShows = {
  query: string;
  page: number;
};

export const getTvShows = async ({ query, page }: GetTvShows) => {
  const result = await fetchTMDB<Collection<TvMedia>>(`tv/${query}`, {
    page: String(page),
  });
  const results = result.results?.map((item) => ({
    ...item,
    media_type: "tv" as const,
  }));
  return { ...result, results };
};

type GetPerson = {
  id: number;
};

export const getPerson = async ({ id }: GetPerson) => {
  const result = await fetchTMDB<PersonMediaDetails>(`person/${id}`, {
    append_to_response: "images,combined_credits,external_ids",
    include_image_language: "en",
  });
  return { ...result, media_type: "person" as const };
};

type Search = {
  query: string;
  page: number;
};

export const search = ({ query, page }: Search) => {
  return fetchTMDB<Collection<ProductionMedia>>("search/multi", {
    page: String(page),
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
