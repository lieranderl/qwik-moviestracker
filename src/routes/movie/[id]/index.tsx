import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MovieDetails } from "~/components/movie-details";
import type { MovieFull, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import {
  getCollectionMovies,
  getMediaDetails,
  getMediaRecom,
} from "~/services/tmdb";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const [movie, recMovies] = await Promise.all([
      getMediaDetails({
        id,
        language: lang,
        type: MediaType.Movie,
      }) as Promise<MovieFull>,
      getMediaRecom({
        id: id,
        language: lang,
        type: MediaType.Movie,
        query: "recommendations",
      }) as Promise<MovieShort[]>,
    ]);
    if (movie.belongs_to_collection) {
      const colMovies = await getCollectionMovies({
        id: movie.belongs_to_collection.id,
        language: lang,
      });
      return {
        movie,
        recMovies,
        colMovies,
        lang,
      };
    }
    const colMovies = [] as MovieShort[];
    return { movie, recMovies, colMovies, lang };
  } catch (error) {
    event.redirect(302, paths.notFound(lang));
  }
  const movie = {} as MovieFull;
  const recMovies = [] as MovieShort[];
  const colMovies = [] as MovieShort[];
  return { movie, recMovies, colMovies, lang };
});

export default component$(() => {
  const resource = useContentLoader();

  return (
    <>
      <div class="absolute bg-fixed bg-gradient-to-b w-screen h-screen from-teal-50 to-teal-50 dark:from-teal-950 dark:to-teal-950 opacity-70"></div>
      <div class="absolute  pt-[100px] overflow-auto w-screen h-screen font-bold ">
        <div class="container mx-auto px-4">
          <MovieDetails
            movie={resource.value.movie}
            recMovies={resource.value.recMovies}
            colMovies={resource.value.colMovies}
            lang={resource.value.lang}
          />
        </div>
      </div>

      <div
        class="bg-fixed w-screen h-screen bg-no-repeat bg-cover bg-center -z-20"
        style={
          "background-image: url(https://image.tmdb.org/t/p/original" +
          resource.value.movie.backdrop_path +
          ")"
        }
      />
    </>
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
