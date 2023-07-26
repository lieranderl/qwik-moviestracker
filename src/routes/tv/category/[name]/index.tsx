import {
  component$,
  $,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { ButtonPrimary } from "~/components/button-primary";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { getTrendingTv, getTvShows } from "~/services/tmdb";
import type { TvMediaDetails } from "~/services/types";
import { categoryToTitle } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  if (event.params.name === "trending") {
    try {
      const res = await getTrendingTv({ page: 1, language: lang });
      return {
        tv: res.results as TvMediaDetails[],
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      throw event.redirect(302, "/404");
    }
  }

  if (event.params.name === "toprated") {
    try {
      const res = await getTvShows({
        page: 1,
        language: lang,
        query: "top_rated",
      });
      return {
        tv: res.results as TvMediaDetails[],
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      throw event.redirect(302, "/404");
    }
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const moviesSig = useStore(
    resource.value ? (resource.value.tv as TvMediaDetails[]) : []
  );
  const isloadingMovies = useSignal(false);
  const pageSig = useSignal(1);

  useVisibleTask$((ctx) => {
    ctx.track(() => {
      moviesSig.length;
    });
    pageSig.value = pageSig.value + 1;
  });

  const getNewMovies = $(async () => {
    isloadingMovies.value = true;

    const moviesFunc = server$(function () {
      if (resource.value!.category === "toprated") {
        return getTvShows({
          page: pageSig.value,
          language: resource.value!.lang,
          query: "top_rated",
        });
      } else {
        return getTrendingTv({
          page: pageSig.value,
          language: resource.value!.lang,
        });
      }
    });

    const movies = await moviesFunc();

    if ("results" in movies) {
      const res = movies.results as TvMediaDetails[];
      console.log(res);
      moviesSig.push(...res);
    } else {
      moviesSig.push(...(movies as TvMediaDetails[]));
    }

    console.log(moviesSig.length);
    isloadingMovies.value = false;
  });

  return (
    <div class="container mx-auto px-4 pt-[64px]">
      <MediaGrid title={categoryToTitle(resource.value!.category, "tv")}>
        {moviesSig.length > 0 &&
          moviesSig.map((m) => (
            <>
              <MediaCard
                title={m.name!}
                width={300}
                rating={m.vote_average!}
                year={parseInt(m.first_air_date!.substring(0, 4), 10)}
                picfile={m.poster_path}
                isPerson={false}
                isHorizontal={false}
                id={m.id}
                type="tv"
                lang={resource.value!.lang}
              />
            </>
          ))}
      </MediaGrid>
      <div class="flex justify-center my-4">
        <ButtonPrimary
          text="Load more"
          onClick={getNewMovies}
          isLoading={isloadingMovies.value}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Catalog of Tv Shows",
    },
  ],
};
