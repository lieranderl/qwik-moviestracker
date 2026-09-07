import { message } from "./i18n";
import type { MediaType } from "~/services/models";

export const categoryToTitle = (
  category: string,
  type: "movie" | "tv",
  lang: string,
) => {
  const allLabel = message(lang, "langAll");

  if (type === "movie") {
    switch (category) {
      case "hdr10":
        return `${allLabel} ${message(lang, "langLatestHDR10Movies")}`;
      case "dolbyvision":
        return `${allLabel} ${message(lang, "langLatestDolbyVisionMovies")}`;
      case "popular":
        return `${allLabel} ${message(lang, "ui.popularMovies")}`;
      case "nowplaying":
        return `${allLabel} ${message(lang, "ui.nowPlaying")}`;
      case "upcoming":
        return `${allLabel} ${message(lang, "ui.upcomingMovies")}`;
      case "trending":
        return `${allLabel} ${message(lang, "langTrendingMovies")}`;
      case "updated":
      default:
        return `${allLabel} ${message(lang, "langLatestMovies")}`;
    }
  }

  switch (category) {
    case "popular":
      return `${allLabel} ${message(lang, "ui.popularSeries")}`;
    case "airingtoday":
      return `${allLabel} ${message(lang, "ui.airingToday")}`;
    case "ontheair":
      return `${allLabel} ${message(lang, "ui.onTheAir")}`;
    case "toprated":
      return `${allLabel} ${message(lang, "langTopRatedTvShows")}`;
    case "trending":
    default:
      return `${allLabel} ${message(lang, "langTrengingTVShows")}`;
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
