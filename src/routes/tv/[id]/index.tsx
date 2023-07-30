import { component$ } from "@builder.io/qwik";
import { DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { TvDetails } from "~/components/tv-details";
import {
  getRecommendationTv,
  // getSimilarTv,
  getTvShowDetails,
} from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const [tv, 
      // simTv, 
      recTv] = await Promise.all([
      getTvShowDetails({
        id,
        language: lang,
      }),
      // getSimilarTv({ id: id, lang: lang }),
      getRecommendationTv({ id: id, lang: lang }),
    ]);
    return { tv, 
      // simTv, 
      recTv, lang };
  } catch (error) {
    event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="absolute bg-fixed bg-gradient-to-b w-screen h-screen from-teal-50 to-teal-50 dark:from-teal-950 dark:to-teal-950 opacity-70"></div>
      <div class="absolute  pt-[100px] overflow-auto w-screen h-screen font-bold">
        <div class="container mx-auto px-4">
          <TvDetails
            tv={resource.value!.tv}
            recTv={resource.value!.recTv}
            // simTv={resource.value!.simTv}
            lang={resource.value!.lang}
          />
        </div>
      </div>

      <div
        class="bg-fixed w-screen h-screen bg-no-repeat bg-cover bg-center -z-20"
        style={
          "background-image: url(https://image.tmdb.org/t/p/original" +
          resource.value?.tv.backdrop_path +
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
      content: "Tv Show Details",
    },
  ],
};