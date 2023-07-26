import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MovieDetails } from "~/components/movie-details";
import { getMovieDetails } from "~/services/tmdb";
import type { MovieMediaDetails } from "~/services/types";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const movie: MovieMediaDetails = await getMovieDetails({
      id,
      language: lang,
      need_backdrop: false,
    });
    return { id, lang, movie };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();

  return (
    <>
      <div class="absolute bg-fixed bg-gradient-to-b w-screen h-screen from-teal-50 to-teal-50 dark:from-teal-950 dark:to-teal-950 z-10 opacity-70"></div>
      <div class="absolute  pt-[100px] overflow-auto w-screen h-screen z-20 text-teal-950 font-bold dark:text-teal-50 ">
        <div class="container mx-auto px-4">
          <MovieDetails movie={resource.value!.movie} lang={resource.value!.lang} />
        </div>
      </div>

      <div
        class="bg-fixed w-screen h-screen bg-no-repeat bg-cover bg-center"
        style={
          "background-image: url(https://image.tmdb.org/t/p/original" +
          resource.value?.movie.backdrop_path +
          ")"
        }
      />
    </>
  );
});
