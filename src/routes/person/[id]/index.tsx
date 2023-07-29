import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PersonDetails } from "~/components/person-details";
import { getPerson, getPersonMovies, getPersonTv } from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const [person, perMovies, perTv] = await Promise.all([
      getPerson({
        id,
        language: lang,
      }),
      getPersonMovies({ id: id, lang: lang }),
      getPersonTv({ id: id, lang: lang }),
    ]);
    return { person, perMovies, perTv, lang };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();

  return (
    <>
      <div class="container pt-[100px] mx-auto px-4">
        <PersonDetails
          person={resource.value!.person}
          perMovies={resource.value!.perMovies}
          perTv={resource.value!.perTv}
          lang={resource.value!.lang}
        />
      </div>
    </>
  );
});
