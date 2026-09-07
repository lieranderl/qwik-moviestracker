type MovieCategoryDefinition =
  | { source: "trending" }
  | {
      source: "tmdb";
      query: "now_playing" | "popular" | "upcoming";
      useRegion?: true;
    }
  | {
      source: "firestore";
      dbName: "dvmovies" | "hdr10movies" | "latesttorrentsmovies";
    };

export const MOVIE_CATEGORIES = {
  trending: { source: "trending" },
  popular: { source: "tmdb", query: "popular" },
  nowplaying: { source: "tmdb", query: "now_playing", useRegion: true },
  upcoming: { source: "tmdb", query: "upcoming", useRegion: true },
  updated: { source: "firestore", dbName: "latesttorrentsmovies" },
  hdr10: { source: "firestore", dbName: "hdr10movies" },
  dolbyvision: { source: "firestore", dbName: "dvmovies" },
} as const satisfies Record<string, MovieCategoryDefinition>;

export type MovieCategory = keyof typeof MOVIE_CATEGORIES;

type TvCategoryDefinition =
  | { source: "trending" }
  | {
      source: "tmdb";
      query: "airing_today" | "on_the_air" | "popular" | "top_rated";
    };

export const TV_CATEGORIES = {
  trending: { source: "trending" },
  toprated: { source: "tmdb", query: "top_rated" },
  popular: { source: "tmdb", query: "popular" },
  airingtoday: { source: "tmdb", query: "airing_today" },
  ontheair: { source: "tmdb", query: "on_the_air" },
} as const satisfies Record<string, TvCategoryDefinition>;

export type TvCategory = keyof typeof TV_CATEGORIES;

const hasOwn = <T extends object>(value: T, key: PropertyKey): key is keyof T =>
  Object.prototype.hasOwnProperty.call(value, key);

export const isMovieCategory = (value: string): value is MovieCategory =>
  hasOwn(MOVIE_CATEGORIES, value);

export const isTvCategory = (value: string): value is TvCategory =>
  hasOwn(TV_CATEGORIES, value);
