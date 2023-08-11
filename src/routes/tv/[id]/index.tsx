import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { TvDetails } from "~/components/tv-details";
import type { TvFull, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getMediaRecom } from "~/services/tmdb";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const id = parseInt(event.params.id, 10);
  try {
    const [
      tv,
      // simTv,
      recTv,
    ] = await Promise.all([
      getMediaDetails({
        id,
        language: lang,
        type: MediaType.Tv,
      }) as Promise<TvFull>,
      getMediaRecom({
        id: id,
        language: lang,
        type: MediaType.Tv,
        query: "recommendations",
      }) as Promise<TvShort[]>,
    ]);
    return { tv, recTv, lang };
  } catch (error) {
    event.redirect(302, paths.notFound(lang));
  }
  const tv = {} as TvFull;
  const recTv = [] as TvShort[];
  return { tv, recTv, lang };
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="absolute bg-fixed bg-gradient-to-b w-screen h-screen from-teal-50 to-teal-50 dark:from-teal-950 dark:to-teal-950 opacity-70"></div>
      <div class="absolute  pt-[100px] overflow-auto w-screen h-screen font-bold">
        <div class="container mx-auto px-4">
          <TvDetails
            tv={resource.value.tv}
            recTv={resource.value.recTv}
            lang={resource.value.lang}
          />
        </div>
      </div>

      <div
        class="bg-fixed w-screen h-screen bg-no-repeat bg-cover bg-center -z-20"
        style={
          "background-image: url(https://image.tmdb.org/t/p/original" +
          resource.value.tv.backdrop_path +
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
