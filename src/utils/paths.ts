import type { MediaType } from "~/services/models";
import {
  langAll,
  langLatestDolbyVisionMovies,
  langLatestHDR10Movies,
  langLatestMovies,
  langNowPlayingMovies,
  langOnTheAirTvShows,
  langPopularMovies,
  langPopularTvShows,
  langTopRatedTvShows,
  langTrendingMovies,
  langTrengingTVShows,
  langUpcomingMovies,
  langAiringTodayTvShows,
} from "./languages";

const CATEGORY_TO_DB: Record<string, string> = {
  updated: "latesttorrentsmovies",
  hdr10: "hdr10movies",
  dolbyvision: "dvmovies",
  trending: "trending",
};

export const categoryToDb = (category: string) => {
  return CATEGORY_TO_DB[category] ?? CATEGORY_TO_DB.updated;
};

export const categoryToTitle = (
  category: string,
  type: "movie" | "tv",
  lang: string,
) => {
  const allLabel = langAll(lang);

  if (type === "movie") {
    switch (category) {
      case "hdr10":
        return `${allLabel} ${langLatestHDR10Movies(lang)}`;
      case "dolbyvision":
        return `${allLabel} ${langLatestDolbyVisionMovies(lang)}`;
      case "popular":
        return `${allLabel} ${langPopularMovies(lang)}`;
      case "nowplaying":
        return `${allLabel} ${langNowPlayingMovies(lang)}`;
      case "upcoming":
        return `${allLabel} ${langUpcomingMovies(lang)}`;
      case "trending":
        return `${allLabel} ${langTrendingMovies(lang)}`;
      case "updated":
      default:
        return `${allLabel} ${langLatestMovies(lang)}`;
    }
  }

  switch (category) {
    case "popular":
      return `${allLabel} ${langPopularTvShows(lang)}`;
    case "airingtoday":
      return `${allLabel} ${langAiringTodayTvShows(lang)}`;
    case "ontheair":
      return `${allLabel} ${langOnTheAirTvShows(lang)}`;
    case "toprated":
      return `${allLabel} ${langTopRatedTvShows(lang)}`;
    case "trending":
    default:
      return `${allLabel} ${langTrengingTVShows(lang)}`;
  }
};

export const paths = {
  //   genre: (mediaType: MediaType, id: number) => `/genre/${id}/${mediaType}`,
  index: (lang: string) => `/?lang=${lang}`,
  media: (mediaType: MediaType, id: number, lang: string) =>
    `/${mediaType}/${id}/?lang=${lang}`,
  category: (type: string, category: string, lang: string) =>
    `/${type}/category/${category}/?lang=${lang}`,
  movieDiscover: (lang: string) => `/movie/discover/?lang=${lang}`,
  tvDiscover: (lang: string) => `/tv/discover/?lang=${lang}`,
  moviePhotos: (id: number, lang: string) =>
    `/movie/${id}/photos/?lang=${lang}`,
  movieVideo: (id: number, lang: string) => `/movie/${id}/videos/?lang=${lang}`,
  notFound: (lang: string) => `/404/?lang=${lang}`,
  person: (id: number, lang: string) => `/person/${id}/?lang=${lang}`,
  search: (lang: string) => `/search/?lang=${lang}`,
  movie: (lang: string) => `/movie/?lang=${lang}`,
  tv: (lang: string) => `/tv/?lang=${lang}`,
  torrserver: (lang: string) => `/torrserver/?lang=${lang}`,
};
