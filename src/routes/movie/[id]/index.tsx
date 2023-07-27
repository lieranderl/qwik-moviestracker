import { component$, } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MovieDetails } from "~/components/movie-details";
import {
  getCollectionMovies,
  getMovieDetails,
  getRecommendationMovies,
  getSimilarMovies,
} from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const [movie, simMovies, recMovies] = await Promise.all([
      getMovieDetails({
        id,
        language: lang,
        need_backdrop: false,
      }),
      getSimilarMovies({ id: id, lang: lang }),
      getRecommendationMovies({ id: id, lang: lang }),
    ]);
    if (movie.belongs_to_collection) {
      const colMovies = await getCollectionMovies({id: movie.belongs_to_collection.id, lang: lang});
      return { movie, simMovies, recMovies, colMovies, lang };
    }
    return { movie, simMovies, recMovies, lang };
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
          <MovieDetails
            movie={resource.value!.movie}
            simMovies={resource.value!.simMovies}
            recMovies={resource.value!.recMovies}
            colMovies={resource.value!.colMovies}
            lang={resource.value!.lang}
          />
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
