import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState } from "~/components/page-feedback";
import { MovieDetails } from "~/components/media-details/movie-details";
import { getOptionalImdbRating } from "~/services/cloud-func-api";
import type { ImdbRating, MovieFull, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import {
  getCollectionMovies,
  getMediaDetails,
  getMediaRecom,
} from "~/services/tmdb";

type MovieDetailData =
  | {
      status: "ready";
      lang: string;
      movie: MovieFull;
      recMovies: MovieShort[];
      colMovies: MovieShort[];
      imdb: ImdbRating | null;
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

  try {
    const movie = (await getMediaDetails({
      id,
      language: lang,
      type: MediaType.Movie,
    })) as MovieFull;

    const [recMovies, colMovies, imdb] = await Promise.all([
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
      getOptionalImdbRating(movie.imdb_id),
    ]);

    return {
      status: "ready",
      lang,
      movie,
      recMovies,
      colMovies,
      imdb,
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
        title="Movie details are unavailable"
        description="Please refresh the page or return to the previous screen."
      />
    );
  }

  return (
    <DetailPageShell backdropPath={value.movie.backdrop_path}>
      <MovieDetails
        movie={value.movie}
        recMovies={value.recMovies}
        colMovies={value.colMovies}
        imdb={value.imdb}
        lang={value.lang}
      />
    </DetailPageShell>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Movie Details",
    },
  ],
};
