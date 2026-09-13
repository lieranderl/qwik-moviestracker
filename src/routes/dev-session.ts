import type { Session } from "@auth/core/types";
import type { FeaturedMovie, FeaturedTv } from "~/services/feed-loaders";
import {
  type LocalizedCertification,
  MediaType,
  type MovieFull,
  type MovieCatalog,
  type MovieShort,
  type PersonFull,
  type PersonMedia,
  type RegionalWatchProviders,
  type TvShort,
  type TvFull,
} from "~/services/models";

export const DEV_SESSION_BYPASS_COOKIE = "moviestracker_dev_session";
export const DEV_SESSION_BYPASS_VALUE = "playwright";
export const DEV_MOVIE_DETAIL_ID = 990001;
export const DEV_TV_DETAIL_ID = 990101;
export const DEV_PERSON_DETAIL_ID = 990201;

const normalizeNodeEnv = (nodeEnv?: string | null) =>
  nodeEnv?.trim().toLowerCase();

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
  return bypassFlag === "1" && normalizeNodeEnv(nodeEnv) !== "production";
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
      image: "/favicon.svg",
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
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
};

type DevHomeFeedFixture = {
  lang: string;
  movies: MovieShort[];
  tv: TvShort[];
  torMovies: MovieCatalog[];
};

type DevMovieCollectionsFixture = {
  lang: string;
  featuredMovies: FeaturedMovie[];
  movies: MovieShort[];
  upcomingMovies: MovieShort[];
  torMovies: MovieCatalog[];
  hdrMovies: MovieCatalog[];
  dolbyMovies: MovieCatalog[];
};

type DevTvCollectionsFixture = {
  lang: string;
  featuredTv: FeaturedTv[];
  tvtrend: TvShort[];
  tvpopular: TvShort[];
  tvtoprated: TvShort[];
  tvontheair: TvShort[];
};

type DevTvDetailFixture = {
  lang: string;
  tv: TvFull;
  recTv: TvShort[];
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
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

const DEV_MOVIE_CERTIFICATION = {
  rating: "PG-13",
  region: "US",
} satisfies LocalizedCertification;

const DEV_MOVIE_WATCH_PROVIDERS = {
  ads: [],
  buy: [
    {
      provider_id: 2,
      provider_name: "Apple TV",
    },
  ],
  flatrate: [
    {
      provider_id: 8,
      provider_name: "Netflix",
    },
  ],
  free: [],
  link: "https://www.themoviedb.org/movie/990001/watch?locale=US",
  region: "US",
  rent: [
    {
      provider_id: 3,
      provider_name: "Google Play Movies",
    },
  ],
} satisfies RegionalWatchProviders;

const DEV_HOME_MOVIES = [
  {
    id: DEV_MOVIE_DETAIL_ID,
    media_type: MediaType.Movie,
    title: "Playwright in Paris",
    overview:
      "Open a deterministic featured movie when authenticated browser tests need a stable home feed.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "2024-02-14",
    vote_average: 7.8,
  },
  {
    id: 990002,
    media_type: MediaType.Movie,
    title: "Runtime Romance",
    overview: "Two processes discover that timing is everything.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    release_date: "2025-03-21",
    vote_average: 7.4,
  },
  {
    id: 990003,
    media_type: MediaType.Movie,
    title: "Cache Me If You Can",
    overview: "A fast-moving mystery about memory, identity, and expiry.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "2025-06-12",
    vote_average: 7.2,
  },
  {
    id: 990004,
    media_type: MediaType.Movie,
    title: "The Last Assertion",
    overview: "One final test stands between a team and release day.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    release_date: "2026-01-16",
    vote_average: 8.1,
  },
  {
    id: 990005,
    media_type: MediaType.Movie,
    title: "The Fifth Frame",
    overview: "A pristine final frame expands the featured rotation.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "2026-04-24",
    vote_average: 7.9,
  },
  {
    id: 990006,
    media_type: MediaType.Movie,
    title: "A Deliberately Longer Featured Movie Title",
    overview:
      "A longer title verifies that every featured movie keeps the same visual structure.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    release_date: "2026-06-05",
    vote_average: 7.6,
  },
  {
    id: 990007,
    media_type: MediaType.Movie,
    title: "Quiet Metadata",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "2026-08-14",
    vote_average: 7.3,
  },
  {
    id: 990008,
    media_type: MediaType.Movie,
    title: "Eight Seconds Later",
    overview: "The eighth selection completes the cinematic rotation.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    release_date: "2026-10-02",
    vote_average: 8.0,
  },
] satisfies MovieShort[];

const DEV_HOME_TV = [
  {
    id: DEV_TV_DETAIL_ID,
    media_type: MediaType.Tv,
    name: "Selectors",
    overview: "A reliable series fixture for authenticated dashboard coverage.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    first_air_date: "2025-01-10",
    release_date: "2025-01-10",
    vote_average: 7.4,
  },
] satisfies TvShort[];

const DEV_SERIES_ITEMS = [
  DEV_HOME_TV[0],
  {
    id: 990102,
    media_type: MediaType.Tv,
    name: "Popular Paths",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    first_air_date: "2025-02-14",
    release_date: "2025-02-14",
    vote_average: 7.5,
  },
  {
    id: 990103,
    media_type: MediaType.Tv,
    name: "Signal Season",
    overview: "A trending signal reaches an unexpectedly large audience.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    first_air_date: "2025-06-20",
    release_date: "2025-06-20",
    vote_average: 8.0,
  },
  {
    id: 990104,
    media_type: MediaType.Tv,
    name: "Audience Query",
    overview: "A popular mystery driven by one unanswered question.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    first_air_date: "2026-01-09",
    release_date: "2026-01-09",
    vote_average: 7.7,
  },
  {
    id: 990105,
    media_type: MediaType.Tv,
    name: "The Fifth Episode",
    overview: "One final episode completes the featured rotation.",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    first_air_date: "2026-03-13",
    release_date: "2026-03-13",
    vote_average: 7.9,
  },
  {
    id: 990106,
    media_type: MediaType.Tv,
    name: "A Deliberately Longer Featured Series Title",
    overview:
      "A long-running story verifies that every series slide remains aligned.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    first_air_date: "2026-05-22",
    release_date: "2026-05-22",
    vote_average: 7.8,
  },
  {
    id: 990107,
    media_type: MediaType.Tv,
    name: "Silent Synopsis",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    first_air_date: "2026-07-17",
    release_date: "2026-07-17",
    vote_average: 7.6,
  },
  {
    id: 990108,
    media_type: MediaType.Tv,
    name: "The Eighth Signal",
    overview: "The final signal completes the featured series rotation.",
    backdrop_path: "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
    poster_path: "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
    first_air_date: "2026-09-11",
    release_date: "2026-09-11",
    vote_average: 8.2,
  },
] satisfies TvShort[];

const DEV_TRENDING_TV = [
  DEV_SERIES_ITEMS[0],
  DEV_SERIES_ITEMS[2],
  DEV_SERIES_ITEMS[4],
  DEV_SERIES_ITEMS[6],
];

const DEV_POPULAR_TV = [
  DEV_SERIES_ITEMS[1],
  DEV_SERIES_ITEMS[3],
  DEV_SERIES_ITEMS[5],
  DEV_SERIES_ITEMS[7],
];

const DEV_HOME_TOR_MOVIES = [
  {
    id: 880101,
    media_type: MediaType.Movie,
    title: "Hydration Station",
    release_date: "2025-02-20",
    year: "2025",
    vote_average: 0,
  },
] satisfies MovieCatalog[];

const DEV_HDR_MOVIES = [
  { ...DEV_HOME_MOVIES[0], year: "2024" },
  { ...DEV_HOME_MOVIES[2], year: "2025" },
  { ...DEV_HOME_MOVIES[4], year: "2026" },
  { ...DEV_HOME_MOVIES[6], year: "2026" },
] satisfies MovieCatalog[];

const DEV_DOLBY_MOVIES = [
  { ...DEV_HOME_MOVIES[1], year: "2025" },
  { ...DEV_HOME_MOVIES[3], year: "2026" },
  { ...DEV_HOME_MOVIES[5], year: "2026" },
  { ...DEV_HOME_MOVIES[7], year: "2026" },
] satisfies MovieCatalog[];

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

const DEV_TV_CERTIFICATION = {
  rating: "TV-14",
  region: "US",
} satisfies LocalizedCertification;

const DEV_TV_WATCH_PROVIDERS = {
  ads: [],
  buy: [
    {
      provider_id: 10,
      provider_name: "Amazon Video",
    },
  ],
  flatrate: [
    {
      provider_id: 15,
      provider_name: "Hulu",
    },
  ],
  free: [],
  link: "https://www.themoviedb.org/tv/990101/watch?locale=US",
  region: "US",
  rent: [],
} satisfies RegionalWatchProviders;

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
    certification: DEV_MOVIE_CERTIFICATION,
    watchProviders: DEV_MOVIE_WATCH_PROVIDERS,
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

export const createDevMovieCollections = ({
  bypassCookie,
  bypassFlag,
  lang,
  nodeEnv,
}: Pick<
  DevSessionOptions,
  "bypassCookie" | "bypassFlag" | "lang" | "nodeEnv"
>): DevMovieCollectionsFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    })
  ) {
    return null;
  }

  const featuredMovieItems = [
    DEV_HDR_MOVIES[0],
    DEV_DOLBY_MOVIES[0],
    DEV_HDR_MOVIES[1],
    DEV_DOLBY_MOVIES[1],
    DEV_HDR_MOVIES[2],
    DEV_DOLBY_MOVIES[2],
    DEV_HDR_MOVIES[3],
    DEV_DOLBY_MOVIES[3],
  ];

  return {
    lang,
    featuredMovies: featuredMovieItems.map((movie) => ({
      artwork: {
        backdropPath: movie.backdrop_path ?? null,
        logoPath: null,
        posterPath: movie.poster_path ?? null,
      },
      movie,
    })),
    movies: DEV_HOME_MOVIES,
    upcomingMovies: DEV_HOME_MOVIES.slice(1),
    torMovies: DEV_HOME_TOR_MOVIES,
    hdrMovies: DEV_HDR_MOVIES,
    dolbyMovies: DEV_DOLBY_MOVIES,
  };
};

export const createDevTvCollections = ({
  bypassCookie,
  bypassFlag,
  lang,
  nodeEnv,
}: Pick<
  DevSessionOptions,
  "bypassCookie" | "bypassFlag" | "lang" | "nodeEnv"
>): DevTvCollectionsFixture | null => {
  if (
    !hasDevSessionBypassCookie({
      bypassCookie,
      bypassFlag,
      nodeEnv,
    })
  ) {
    return null;
  }

  const featuredItems = [
    DEV_SERIES_ITEMS[0],
    DEV_SERIES_ITEMS[1],
    DEV_SERIES_ITEMS[2],
    DEV_SERIES_ITEMS[3],
    DEV_SERIES_ITEMS[4],
    DEV_SERIES_ITEMS[5],
    DEV_SERIES_ITEMS[6],
    DEV_SERIES_ITEMS[7],
  ];

  return {
    lang,
    featuredTv: featuredItems.map((tv) => ({
      artwork: {
        backdropPath: tv.backdrop_path ?? null,
        logoPath: null,
        posterPath: tv.poster_path ?? null,
      },
      tv,
    })),
    tvtrend: DEV_TRENDING_TV,
    tvpopular: DEV_POPULAR_TV,
    tvtoprated: DEV_SERIES_ITEMS.slice(0, 3),
    tvontheair: DEV_SERIES_ITEMS.slice(2),
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
    certification: DEV_TV_CERTIFICATION,
    watchProviders: DEV_TV_WATCH_PROVIDERS,
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
