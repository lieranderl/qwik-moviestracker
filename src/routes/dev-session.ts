import type { Session } from "@auth/core/types";
import {
  MediaType,
  type ImdbRating,
  type MovieFull,
  type MovieShort,
} from "~/services/models";

export const DEV_SESSION_BYPASS_COOKIE = "moviestracker_dev_session";
export const DEV_SESSION_BYPASS_VALUE = "playwright";
export const DEV_MOVIE_DETAIL_ID = 990001;

type DevSessionOptions = {
  bypassCookie?: string | null;
  bypassFlag?: string | null;
  lang: string;
  nodeEnv?: string | null;
  now?: Date;
};

export const isDevSessionBypassEnabled = ({
  bypassFlag,
  nodeEnv,
}: Pick<DevSessionOptions, "bypassFlag" | "nodeEnv">) => {
  return bypassFlag === "1" && nodeEnv !== "production";
};

export const hasDevSessionBypassCookie = ({
  bypassCookie,
  bypassFlag,
  nodeEnv,
}: Pick<DevSessionOptions, "bypassCookie" | "bypassFlag" | "nodeEnv">) => {
  return (
    isDevSessionBypassEnabled({
      bypassFlag,
      nodeEnv,
    }) && bypassCookie === DEV_SESSION_BYPASS_VALUE
  );
};

export const createDevSession = ({
  bypassCookie,
  bypassFlag,
  lang,
  nodeEnv,
  now = new Date(),
}: DevSessionOptions): Session | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    })
  ) {
    return null;
  }

  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);

  return {
    expires: expires.toISOString(),
    id: "playwright-user",
    language: lang,
    user: {
      email: "playwright@local.test",
      image: null,
      name: "Playwright User",
    },
  };
};

type DevMovieDetailOptions = Pick<
  DevSessionOptions,
  "bypassCookie" | "bypassFlag" | "lang" | "nodeEnv"
> & {
  id: number;
};

type DevMovieDetailFixture = {
  lang: string;
  movie: MovieFull;
  recMovies: MovieShort[];
  colMovies: MovieShort[];
  imdb: ImdbRating | null;
};

const DEV_MOVIE_DETAIL = {
  id: DEV_MOVIE_DETAIL_ID,
  media_type: MediaType.Movie,
  title: "Playwright in Paris",
  original_title: "Playwright in Paris",
  tagline: "A deterministic movie for browser tests.",
  overview:
    "An intentionally static movie payload used to verify authenticated detail routes without upstream API dependencies.",
  release_date: "2024-02-14",
  runtime: 126,
  backdrop_path: "/playwright-backdrop.jpg",
  poster_path: "/playwright-poster.jpg",
  original_language: "en",
  vote_average: 7.8,
  vote_count: 1284,
  budget: 42000000,
  revenue: 120500000,
  genres: [
    { id: 18, name: "Drama" },
    { id: 53, name: "Thriller" },
  ],
  production_companies: [
    {
      id: 710,
      name: "Deterministic Pictures",
      origin_country: "US",
    },
  ],
  production_countries: [
    {
      iso_3166_1: "US",
      name: "United States of America",
    },
  ],
  external_ids: {
    id: DEV_MOVIE_DETAIL_ID,
    imdb_id: "tt9900010",
    wikidata_id: "Q990001",
  },
  credits: {
    cast: [
      {
        id: 501,
        name: "Ada Lovelace",
        character: "Nora Vale",
        profile_path: null,
      },
    ],
    crew: [
      {
        id: 601,
        name: "Grace Hopper",
        job: "Director",
        profile_path: null,
      },
    ],
  },
} satisfies MovieFull;

const DEV_MOVIE_RECOMMENDATIONS = [
  {
    id: 990002,
    title: "Assertions at Dawn",
    release_date: "2023-09-01",
    vote_average: 7.1,
    backdrop_path: "/assertions-at-dawn.jpg",
  },
] satisfies MovieShort[];

const DEV_MOVIE_IMDB = {
  Id: "tt9900010",
  Rating: "7.9",
  Votes: "128,400",
} satisfies ImdbRating;

export const createDevMovieDetail = ({
  bypassCookie,
  bypassFlag,
  id,
  lang,
  nodeEnv,
}: DevMovieDetailOptions): DevMovieDetailFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    }) ||
    id !== DEV_MOVIE_DETAIL_ID
  ) {
    return null;
  }

  return {
    lang,
    movie: DEV_MOVIE_DETAIL,
    recMovies: DEV_MOVIE_RECOMMENDATIONS,
    colMovies: [],
    imdb: DEV_MOVIE_IMDB,
  };
};
