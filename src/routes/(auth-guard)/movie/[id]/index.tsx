import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { MovieDetails } from "~/components/media-details/movie-details";
import {
  createDevMovieDetail,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type {
  LocalizedCertification,
  MovieFull,
  MovieShort,
  RegionalWatchProviders,
} from "~/services/models";
import { MediaType } from "~/services/models";
import {
  getCollectionMovies,
  getMovieDetails,
  getMediaRecom,
  getOptionalWatchProviders,
  getRegionFromLanguage,
  resolveMovieCertification,
  resolveRegionalWatchProviders,
} from "~/services/tmdb";
import { langText } from "~/utils/languages";

type MovieDetailData =
  | {
      status: "ready";
      lang: string;
      movie: MovieFull;
      recMovies: MovieShort[];
      colMovies: MovieShort[];
      certification: LocalizedCertification | null;
      watchProviders: RegionalWatchProviders | null;
    }
  | {
      status: "error";
      lang: string;
    };

export const useMovieDetailLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = Number.parseInt(event.params.id, 10);

  if (Number.isNaN(id)) {
    return {
      status: "error",
      lang,
    } satisfies MovieDetailData;
  }

  const devMovieDetail = createDevMovieDetail({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    id,
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devMovieDetail) {
    return {
      status: "ready",
      ...devMovieDetail,
    } satisfies MovieDetailData;
  }

  try {
    const movie = await getMovieDetails({
      id,
      language: lang,
    });
    const region = getRegionFromLanguage(lang);

    const [recMovies, colMovies, watchProviderResults] =
      await Promise.all([
        getMediaRecom({
          id,
          language: lang,
          type: MediaType.Movie,
          query: "recommendations",
        }) as Promise<MovieShort[]>,
        movie.belongs_to_collection
          ? getCollectionMovies({
              id: movie.belongs_to_collection.id,
              language: lang,
            })
          : Promise.resolve([] as MovieShort[]),
        getOptionalWatchProviders({
          id,
          type: MediaType.Movie,
        }),
      ]);

    return {
      status: "ready",
      lang,
      movie,
      recMovies,
      colMovies,
      certification: resolveMovieCertification(movie.release_dates, region),
      watchProviders: resolveRegionalWatchProviders(
        watchProviderResults,
        region,
      ),
    } satisfies MovieDetailData;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      lang,
    } satisfies MovieDetailData;
  }
});

export default component$(() => {
  const value = useMovieDetailLoader().value;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={langText(
          value.lang,
          "Movie details are unavailable",
          "Детали фильма недоступны",
        )}
        description={langText(
          value.lang,
          "Please refresh the page or return to the previous screen.",
          "Обновите страницу или вернитесь на предыдущий экран.",
        )}
      />
    );
  }

  return (
    <DetailPageShell backdropPath={value.movie.backdrop_path}>
      <MovieDetails
        movie={value.movie}
        recMovies={value.recMovies}
        colMovies={value.colMovies}
        imdbId={value.movie.imdb_id}
        certification={value.certification}
        watchProviders={value.watchProviders}
        lang={value.lang}
      />
    </DetailPageShell>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "Movie details",
      "Детали фильма",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(lang, "Movie details", "Детали фильма"),
      },
    ],
  };
};
