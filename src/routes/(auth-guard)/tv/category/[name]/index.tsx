import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMedias, getTrendingMedia } from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import { createInfiniteScrollObserver } from "~/utils/infinite-scroll";
import { categoryToTitle, paths } from "~/utils/paths";

type FetchTvCategoryPageArgs = {
  category: string;
  lang: string;
  page: number;
};

const TV_CATEGORY_QUERIES: Record<string, string | null> = {
  trending: null,
  toprated: "top_rated",
  popular: "popular",
  airingtoday: "airing_today",
  ontheair: "on_the_air",
};

const fetchTvCategoryPage = async ({
  category,
  lang,
  page,
}: FetchTvCategoryPageArgs): Promise<TvShort[]> => {
  const tmdbQuery = TV_CATEGORY_QUERIES[category];

  if (tmdbQuery === null) {
    return (await getTrendingMedia({
      page,
      language: lang,
      type: MediaType.Tv,
      needbackdrop: false,
    })) as TvShort[];
  }

  if (tmdbQuery) {
    return (await getMedias({
      page,
      language: lang,
      query: tmdbQuery,
      type: MediaType.Tv,
      needbackdrop: false,
    })) as TvShort[];
  }

  return [];
};

const isSupportedTvCategory = (category: string) =>
  category in TV_CATEGORY_QUERIES;

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const category = event.params.name;

  if (!isSupportedTvCategory(category)) {
    throw event.redirect(302, paths.notFound(lang));
  }

  try {
    const tv = await fetchTvCategoryPage({
      page: 1,
      category,
      lang,
    });
    return { tv, category, lang };
  } catch {
    throw event.redirect(302, paths.notFound(lang));
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const tvItemsSig = useSignal(resource.value.tv as TvShort[]);
  const isLoadingTv = useSignal(false);
  const pageSig = useSignal(1);
  const hasMoreTv = useSignal(resource.value.tv.length >= MEDIA_PAGE_SIZE);
  const sentinelRef = useSignal<Element>();

  const fetchTvPage = server$(
    async (page: number, category: string, lang: string) =>
      await fetchTvCategoryPage({
        page,
        category,
        lang,
      }),
  );

  const getNewTv = $(async () => {
    if (isLoadingTv.value || !hasMoreTv.value) {
      return;
    }

    isLoadingTv.value = true;
    try {
      const nextPage = pageSig.value + 1;
      const nextTv = (await fetchTvPage(
        nextPage,
        resource.value.category,
        resource.value.lang,
      )) as TvShort[];

      if (nextTv.length === 0) {
        hasMoreTv.value = false;
        return;
      }

      tvItemsSig.value = [...tvItemsSig.value, ...nextTv];
      pageSig.value = nextPage;
      hasMoreTv.value = nextTv.length >= MEDIA_PAGE_SIZE;
    } finally {
      isLoadingTv.value = false;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const target = sentinelRef.value;
    if (!target) {
      return;
    }

    const observer = createInfiniteScrollObserver({
      target,
      hasMore: hasMoreTv.value,
      onIntersect: () => {
        void getNewTv();
      },
    });

    if (!observer) {
      return;
    }

    cleanup(() => observer.disconnect());
  });

  return (
    <div class="pt-4 pb-10">
      <MediaGrid
        description="Scroll down to keep loading more results from this TV shelf."
        eyebrow="Catalog"
        headerBadge={`${tvItemsSig.value.length} loaded`}
        title={categoryToTitle(
          resource.value.category,
          MediaType.Tv,
          resource.value.lang,
        )}
      >
        {tvItemsSig.value.length > 0 &&
          tvItemsSig.value.map((m) => (
            <a
              key={m.id}
              href={paths.media(MediaType.Tv, m.id, resource.value.lang)}
              class="media-card-link block h-full"
            >
              <MediaCard
                title={m.name ? m.name : ""}
                width={300}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.first_air_date)}
                picfile={m.poster_path}
                variant="poster"
                layout="grid"
              />
            </a>
          ))}
      </MediaGrid>
      <div class="my-4 flex justify-center">
        <div ref={sentinelRef} class="h-8 w-full" />
        {isLoadingTv.value && (
          <div class="border-base-200 bg-base-100/88 flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm">
            <span class="loading loading-ring loading-sm" />
            <span>Loading more series…</span>
          </div>
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
