import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getTvShowDetails } from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const movie = await getTvShowDetails({ id, language: lang });
    return { id, lang, movie };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div>{resource.value!.lang}</div>
      <div>{resource.value!.id}</div>
      <div>{resource.value!.movie.name}</div>
      <div>{resource.value!.movie.first_air_date?.substring(0,4)}</div>
    </>
  );
});
