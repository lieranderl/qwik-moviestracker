import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PersonDetails } from "~/components/person-details";
import { getPerson } from "~/services/tmdb";
import type { PersonMediaDetails } from "~/services/types";


export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const person: PersonMediaDetails = await getPerson({
      id,
      language: lang,
    });
    return { id, lang, person };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();

  return (
    <>
        <div class="container pt-[100px] mx-auto px-4">
          <PersonDetails person={resource.value!.person} />    
        </div>
    </>
  );
});
