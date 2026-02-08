import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMedias, getTrendingMedia } from "~/services/tmdb";
import { categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  if (event.params.name === "trending") {
    try {
      const res = await getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: false,
      });
      return {
        tv: res as TvShort[],
        category: event.params.name,
        lang: lang,
      };
    } catch {
      throw event.redirect(302, paths.notFound(lang));
    }
  }

  if (event.params.name === "toprated") {
    try {
      const res = await getMedias({
        page: 1,
        language: lang,
        query: "top_rated",
        type: MediaType.Tv,
        needbackdrop: false,
      });
      return {
        tv: res as TvShort[],
        category: event.params.name,
        lang: lang,
      };
    } catch {
      throw event.redirect(302, paths.notFound(lang));
    }
  }
  return {
    tv: [] as TvShort[],
    category: event.params.name,
    lang: lang,
  };
});

export default component$(() => {
  const resource = useContentLoader();
  const moviesSig = useSignal(resource.value.tv as TvShort[]);
  const isloadingMovies = useSignal(false);
  const pageSig = useSignal(1);
  const hasMoreMovies = useSignal(resource.value.tv.length >= 20);
  const sentinelRef = useSignal<Element>();

  const fetchTvPage = server$(
    async (page: number, category: string, lang: string) => {
      if (category === "toprated") {
        return (await getMedias({
          page: page,
          language: lang,
          query: "top_rated",
          type: MediaType.Tv,
          needbackdrop: false,
        })) as TvShort[];
      }
      return (await getTrendingMedia({
        page: page,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: false,
      })) as TvShort[];
    },
  );

  const getNewMovies = $(async () => {
    if (isloadingMovies.value || !hasMoreMovies.value) {
      return;
    }

    isloadingMovies.value = true;
    const nextPage = pageSig.value + 1;
    const nextTv = (await fetchTvPage(
      nextPage,
      resource.value.category,
      resource.value.lang,
    )) as TvShort[];

    if (nextTv.length === 0) {
      hasMoreMovies.value = false;
      isloadingMovies.value = false;
      return;
    }

    moviesSig.value = [...moviesSig.value, ...nextTv];
    pageSig.value = nextPage;
    hasMoreMovies.value = nextTv.length >= 20;
    isloadingMovies.value = false;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const target = sentinelRef.value;
    if (!target || !hasMoreMovies.value) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          void getNewMovies();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(target);
    cleanup(() => observer.disconnect());
  });

  return (
    <div class="animate-fadeIn container mx-auto px-4 pt-[64px] pb-10">
      <MediaGrid
        title={categoryToTitle(
          resource.value.category,
          MediaType.Tv,
          resource.value.lang,
        )}
      >
        {moviesSig.value.length > 0 &&
          moviesSig.value.map((m) => (
            <a
              key={m.id}
              href={paths.media(MediaType.Tv, m.id, resource.value.lang)}
            >
              <MediaCard
                title={m.name ? m.name : ""}
                width={300}
                rating={m.vote_average ? m.vote_average : 0}
                year={Number.parseInt(
                  m.first_air_date ? m.first_air_date.substring(0, 4) : "0",
                  10,
                )}
                picfile={m.poster_path}
                isPerson={false}
                isHorizontal={false}
              />
            </a>
          ))}
      </MediaGrid>
      <div class="my-4 flex justify-center">
        <div ref={sentinelRef} class="h-8 w-full" />
        {isloadingMovies.value && (
          <span class="loading loading-ring loading-lg" />
        )}
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
