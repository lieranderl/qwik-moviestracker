import type { Session } from "@auth/core/types";
import {
  MediaType,
  type ImdbRating,
  type MovieFull,
  type MovieMongo,
  type MovieShort,
  type PersonFull,
  type PersonMedia,
  type TvShort,
  type TvFull,
} from "~/services/models";

export const DEV_SESSION_BYPASS_COOKIE = "moviestracker_dev_session";
export const DEV_SESSION_BYPASS_VALUE = "playwright";
export const DEV_MOVIE_DETAIL_ID = 990001;
export const DEV_TV_DETAIL_ID = 990101;
export const DEV_PERSON_DETAIL_ID = 990201;

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

type DevHomeFeedFixture = {
  lang: string;
  movies: MovieShort[];
  tv: TvShort[];
  torMovies: MovieMongo[];
};

type DevTvDetailFixture = {
  lang: string;
  tv: TvFull;
  recTv: TvShort[];
  imdb: ImdbRating | null;
};

type DevPersonDetailFixture = {
  lang: string;
  person: PersonFull;
  perMovies: PersonMedia;
  perTv: PersonMedia;
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
  },
] satisfies MovieShort[];

const DEV_MOVIE_IMDB = {
  Id: "tt9900010",
  Rating: "7.9",
  Votes: "128,400",
} satisfies ImdbRating;

const DEV_HOME_MOVIES = [
  {
    id: DEV_MOVIE_DETAIL_ID,
    media_type: MediaType.Movie,
    title: "Playwright in Paris",
    overview:
      "Open a deterministic featured movie when authenticated browser tests need a stable home feed.",
    release_date: "2024-02-14",
    vote_average: 7.8,
  },
] satisfies MovieShort[];

const DEV_HOME_TV = [
  {
    id: DEV_TV_DETAIL_ID,
    media_type: MediaType.Tv,
    name: "Selectors",
    overview: "A reliable series fixture for authenticated dashboard coverage.",
    first_air_date: "2025-01-10",
    release_date: "2025-01-10",
    vote_average: 7.4,
  },
] satisfies TvShort[];

const DEV_HOME_TOR_MOVIES = [
  {
    id: 880101,
    media_type: MediaType.Movie,
    title: "Hydration Station",
    release_date: "2025-02-20",
    year: "2025",
    vote_average: 6.9,
  },
] satisfies MovieMongo[];

const DEV_TV_DETAIL = {
  id: DEV_TV_DETAIL_ID,
  media_type: MediaType.Tv,
  name: "Selectors",
  original_name: "Selectors",
  tagline: "Every choice is deliberate.",
  overview:
    "A deterministic TV payload used to verify authenticated detail routes without relying on live TMDB responses.",
  first_air_date: "2025-01-10",
  number_of_seasons: 3,
  number_of_episodes: 24,
  in_production: true,
  status: "Returning Series",
  vote_average: 7.6,
  vote_count: 940,
  original_language: "en",
  genres: [
    { id: 18, name: "Drama" },
    { id: 9648, name: "Mystery" },
  ],
  production_companies: [
    {
      id: 801,
      name: "Signal Works",
      origin_country: "US",
    },
  ],
  production_countries: [
    {
      iso_3166_1: "US",
      name: "United States of America",
    },
  ],
  networks: [
    {
      id: 901,
      name: "Fixture Network",
      origin_country: "US",
    },
  ],
  seasons: [
    {
      id: 990111,
      name: "Season 1",
      season_number: 1,
      episode_count: 8,
      air_date: "2025-01-10",
    },
  ],
  created_by: [
    {
      id: 990211,
      name: "Dana Scully",
      profile_path: undefined,
    },
  ],
  last_episode_to_air: {
    id: 990311,
    name: "The Stable Branch",
    air_date: "2025-03-01",
    episode_number: 8,
    season_number: 1,
  },
  next_episode_to_air: {
    id: 990312,
    name: "The Next Rollout",
    air_date: "2025-04-01",
    episode_number: 1,
    season_number: 2,
  },
  external_ids: {
    id: DEV_TV_DETAIL_ID,
    imdb_id: "tt9901010",
  },
  credits: {
    cast: [
      {
        id: DEV_PERSON_DETAIL_ID,
        name: "Lin Carter",
        character: "Mara Quinn",
        profile_path: null,
      },
    ],
    crew: [],
  },
} satisfies TvFull;

const DEV_TV_RECOMMENDATIONS = [
  {
    id: 990102,
    media_type: MediaType.Tv,
    name: "State Machines",
    first_air_date: "2024-10-01",
    release_date: "2024-10-01",
    vote_average: 7.0,
  },
] satisfies TvShort[];

const DEV_TV_IMDB = {
  Id: "tt9901010",
  Rating: "7.7",
  Votes: "94,000",
} satisfies ImdbRating;

const DEV_PERSON_DETAIL = {
  id: DEV_PERSON_DETAIL_ID,
  media_type: MediaType.Person,
  name: "Lin Carter",
  biography:
    "Lin Carter is a deterministic fixture performer used to validate authenticated person detail routes and resume-sensitive local state.",
  gender: 2,
  known_for_department: "Acting",
  birthday: "1987-06-15",
  place_of_birth: "Brussels, Belgium",
  profile_path: undefined,
  poster_path: "",
  external_ids: {
    id: DEV_PERSON_DETAIL_ID,
    imdb_id: "nm9902010",
  },
} satisfies PersonFull;

const DEV_PERSON_MOVIES = {
  id: DEV_PERSON_DETAIL_ID,
  cast: [
    {
      id: DEV_MOVIE_DETAIL_ID,
      backdrop_path: null,
      title: "Playwright in Paris",
      release_date: "2024-02-14",
      first_air_date: "",
      poster_path: null,
      vote_average: 7.8,
      character: "Nora Vale",
    },
  ],
  crew: [
    {
      id: 990202,
      backdrop_path: null,
      title: "Coverage Matrix",
      release_date: "2022-09-01",
      first_air_date: "",
      poster_path: null,
      vote_average: 6.8,
      job: "Producer",
    },
  ],
} satisfies PersonMedia;

const DEV_PERSON_TV = {
  id: DEV_PERSON_DETAIL_ID,
  cast: [
    {
      id: DEV_TV_DETAIL_ID,
      backdrop_path: null,
      name: "Selectors",
      first_air_date: "2025-01-10",
      release_date: "2025-01-10",
      poster_path: null,
      vote_average: 7.6,
      character: "Mara Quinn",
    },
  ],
  crew: [
    {
      id: 990203,
      backdrop_path: null,
      name: "Fallback Lines",
      first_air_date: "2023-05-20",
      release_date: "2023-05-20",
      poster_path: null,
      vote_average: 6.5,
      job: "Executive Producer",
    },
  ],
} satisfies PersonMedia;

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

export const createDevHomeFeed = ({
  bypassCookie,
  bypassFlag,
  lang,
  nodeEnv,
}: Pick<
  DevSessionOptions,
  "bypassCookie" | "bypassFlag" | "lang" | "nodeEnv"
>): DevHomeFeedFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    })
  ) {
    return null;
  }

  return {
    lang,
    movies: DEV_HOME_MOVIES,
    tv: DEV_HOME_TV,
    torMovies: DEV_HOME_TOR_MOVIES,
  };
};

export const createDevTvDetail = ({
  bypassCookie,
  bypassFlag,
  id,
  lang,
  nodeEnv,
}: DevMovieDetailOptions): DevTvDetailFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    }) ||
    id !== DEV_TV_DETAIL_ID
  ) {
    return null;
  }

  return {
    lang,
    tv: DEV_TV_DETAIL,
    recTv: DEV_TV_RECOMMENDATIONS,
    imdb: DEV_TV_IMDB,
  };
};

export const createDevPersonDetail = ({
  bypassCookie,
  bypassFlag,
  id,
  lang,
  nodeEnv,
}: DevMovieDetailOptions): DevPersonDetailFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    }) ||
    id !== DEV_PERSON_DETAIL_ID
  ) {
    return null;
  }

  return {
    lang,
    person: DEV_PERSON_DETAIL,
    perMovies: DEV_PERSON_MOVIES,
    perTv: DEV_PERSON_TV,
  };
};
