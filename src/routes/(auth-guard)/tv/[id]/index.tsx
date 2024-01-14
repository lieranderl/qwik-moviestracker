import { Resource, component$, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { TvDetails } from "~/components/tv-details";
import type { TvFull, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getMediaRecom } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";
import { HiXCircleSolid } from "@qwikest/icons/heroicons";

export const useContentLoader = routeLoader$(async (event) => {
  const id = parseInt(event.params.id, 10);
  return { id };
});

export default component$(() => {
  const lang = useQueryParamsLoader().value.lang;
  const id = useContentLoader().value.id;

  const useTvdetails = useResource$(async () => {
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
      throw new Error("error");
    }
  });

  return (
    <Resource
      value={useTvdetails}
      onPending={() => <span class="loading loading-spinner"></span>}
      onRejected={(error) => (
        <div role="alert" class="alert alert-error">
          <HiXCircleSolid class="h-6 w-6" />
          <span>{error.message}</span>
        </div>
      )}
      onResolved={(value) => (
        <div
          class="hero min-h-screen bg-fixed "
          style={
            "background-image: url(https://image.tmdb.org/t/p/original" +
            value.tv.backdrop_path +
            ");"
          }
        >
          <div class="hero-overlay bg-opacity-80 bg-base-100"></div>
          <div class="hero-content text-left">
            <div class="container mx-auto px-4">
              <TvDetails tv={value.tv} recTv={value.recTv} lang={value.lang} />
            </div>
          </div>
        </div>
      )}
    />
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
