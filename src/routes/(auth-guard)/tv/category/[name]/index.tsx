import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadTvCategoryPage } from "~/services/feed-loaders";
import { isTvCategory, type TvCategory } from "~/services/media-categories";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import { createInfiniteScrollObserver } from "~/utils/infinite-scroll";
import { langText } from "~/utils/languages";
import {
  appendPage,
  beginNextPage,
  createPaginationState,
  failPage,
} from "~/utils/pagination-state";
import { categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const category = event.params.name;

  if (!isTvCategory(category)) {
    throw event.redirect(302, paths.notFound(lang));
  }

  try {
    const tv = await loadTvCategoryPage({
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
  const pagination = useSignal(
    createPaginationState<TvShort>({
      items: resource.value.tv as TvShort[],
      mode: "page",
      pageSize: MEDIA_PAGE_SIZE,
    }),
  );
  const sentinelRef = useSignal<Element>();

  const fetchTvPage = server$(
    async (page: number, category: TvCategory, lang: string) =>
      await loadTvCategoryPage({
        page,
        category,
        lang,
      }),
  );

  const getNewTv = $(async () => {
    const next = beginNextPage(pagination.value);
    if (!next.request) return;
    pagination.value = next.state;
    try {
      const nextTv = (await fetchTvPage(
        next.request.page,
        resource.value.category,
        resource.value.lang,
      )) as TvShort[];
      pagination.value = appendPage(pagination.value, { items: nextTv });
    } catch {
      pagination.value = failPage(pagination.value);
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
      hasMore: pagination.value.hasMore,
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
    <div class="space-y-6 pb-10">
      <MediaGrid
        headerBadge={langText(
          resource.value.lang,
          `${pagination.value.items.length} loaded`,
          `${pagination.value.items.length} загружено`,
        )}
        title={categoryToTitle(
          resource.value.category,
          MediaType.Tv,
          resource.value.lang,
        )}
      >
        {pagination.value.items.length > 0 &&
          pagination.value.items.map((m) => (
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
      <div class="flex justify-center">
        <div ref={sentinelRef} class="h-8 w-full" />
        {pagination.value.status === "loading" && (
          <div class="border-base-200 bg-base-100/88 flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm">
            <span class="loading loading-ring loading-sm" />
            <span>
              {langText(
                resource.value.lang,
                "Loading more series…",
                "Загружаем еще сериалы…",
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "TV catalog",
      "Каталог сериалов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(lang, "Catalog of TV shows", "Каталог сериалов"),
      },
    ],
  };
};
