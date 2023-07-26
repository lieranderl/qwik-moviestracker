import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getMovieDetails } from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const movie = await getMovieDetails({ id, language: lang, need_backdrop: false});
    return { id, lang, movie };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="bg-fixed" style={"background-image: url(https://image.tmdb.org/t/p/w500"+resource.value?.movie.backdrop_path+")"}>
      <div>{resource.value!.lang}</div>
      <div>{resource.value!.id}</div>
      <div>{resource.value!.movie.title}</div>
      <div>{resource.value!.movie.release_date?.substring(0,4)}</div>
      <div>{resource.value!.movie.release_date?.substring(0,4)}</div>
      </div>
     
    </>
  );
});
