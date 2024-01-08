import type { MediaType } from "~/services/models";
import {
  langAll,
  langLatestDolbyVisionMovies,
  langLatestHDR10Movies,
  langLatestMovies,
  langTopRatedTvShows,
  langTrendingMovies,
  langTrengingTVShows,
} from "./languages";

export const categoryToDb = (category: string) => {
  if (category === "updated") return "latesttorrentsmovies";
  if (category === "hdr10") return "hdr10movies";
  if (category === "dolbyvision") return "dvmovies";
  if (category === "trending") return "trending";
  return "latesttorrentsmovies";
};

export const categoryToTitle = (
  category: string,
  type: "movie" | "tv",
  lang: string,
) => {
  if (type === "movie") {
    if (category === "updated")
      return `${langAll(lang)} ${langLatestMovies(lang)}`;
    if (category === "hdr10")
      return `${langAll(lang)} ${langLatestHDR10Movies(lang)}`;
    if (category === "dolbyvision")
      return `${langAll(lang)} ${langLatestDolbyVisionMovies(lang)}`;
    if (category === "trending")
      return `${langAll(lang)} ${langTrendingMovies(lang)}`;
    return `${langAll(lang)} ${langLatestMovies(lang)}`;
  } else {
    if (category === "trending")
      return `${langAll(lang)}  ${langTrengingTVShows(lang)}`;
    if (category === "toprated")
      return `${langAll(lang)}  ${langTopRatedTvShows(lang)}`;
    return `${langAll(lang)} ${langTrengingTVShows(lang)}`;
  }
  return "";
};

export const paths = {
  //   genre: (mediaType: MediaType, id: number) => `/genre/${id}/${mediaType}`,
  index: (lang: string) => `/?lang=${lang}`,
  media: (mediaType: MediaType, id: number, lang: string) =>
    `/${mediaType}/${id}/?lang=${lang}`,
  category: (type: string, category: string, lang: string) =>
    `/${type}/category/${category}/?lang=${lang}`,
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
