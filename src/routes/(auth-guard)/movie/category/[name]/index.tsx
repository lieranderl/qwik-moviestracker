import { message } from "~/utils/i18n";
import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { MediaType } from "~/services/models";
import {
  loadMovieCategoryPage,
  type MovieCategoryItem,
} from "~/services/feed-loaders";
import {
  isMovieCategory,
  MOVIE_CATEGORIES,
  type MovieCategory,
} from "~/services/media-categories";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import { createInfiniteScrollObserver } from "~/utils/infinite-scroll";
import {
  appendPage,
  beginNextPage,
  createPaginationState,
  failPage,
} from "~/utils/pagination-state";
import { categoryToTitle, paths } from "~/utils/paths";

const isFirestoreCategory = (category: MovieCategory) =>
  MOVIE_CATEGORIES[category].source === "firestore";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const projectId =
    event.env.get("GCP_PROJECT") ?? event.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
  const databaseId = event.env.get("FIRESTORE_DATABASE") ?? "moviestracker";
  const category = event.params.name;

  if (!isMovieCategory(category)) {
    throw event.redirect(302, paths.notFound(lang));
  }

  try {
    const result = await loadMovieCategoryPage({
      page: 1,
      category,
      lang,
      projectId,
      databaseId,
    });
    return { ...result, category, lang };
  } catch (error) {
    console.error(error);
    throw event.redirect(302, paths.notFound(lang));
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const pagination = useSignal(
    createPaginationState<MovieCategoryItem>({
      cursor: resource.value.nextCursor,
      items: resource.value.movies as MovieCategoryItem[],
      mode: isFirestoreCategory(resource.value.category) ? "cursor" : "page",
      pageSize: MEDIA_PAGE_SIZE,
    }),
  );
  const sentinelRef = useSignal<Element>();

  const fetchMovies = server$(async function (
    page: number,
    category: MovieCategory,
    lang: string,
    cursor: string | null,
  ) {
    const projectId =
      this.env.get("GCP_PROJECT") ?? this.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
    const databaseId = this.env.get("FIRESTORE_DATABASE") ?? "moviestracker";
    return await loadMovieCategoryPage({
      page,
      category,
      lang,
      cursor,
      projectId,
      databaseId,
    });
  });

  const getNewMovies = $(async () => {
    const next = beginNextPage(pagination.value);
    if (!next.request) return;
    pagination.value = next.state;
    try {
      const nextResult = await fetchMovies(
        next.request.page,
        resource.value.category,
        resource.value.lang,
        next.request.cursor,
      );
      pagination.value = appendPage(pagination.value, {
        cursor: nextResult.nextCursor,
        items: nextResult.movies as MovieCategoryItem[],
      });
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
        void getNewMovies();
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
        headerBadge={message(resource.value.lang, "pagination.loaded", {
          count: pagination.value.items.length,
        })}
        title={categoryToTitle(
          resource.value.category,
          MediaType.Movie,
          resource.value.lang,
        )}
      >
        {pagination.value.items.length > 0 &&
          pagination.value.items.map((m) => (
            <a
              href={paths.media(MediaType.Movie, m.id, resource.value.lang)}
              key={m.id}
              class="media-card-link block h-full"
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={300}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.year ?? m.release_date)}
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
              {message(resource.value.lang, "ui.loadingMoreMovies")}
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
    title: `Moviestracker | ${message(lang, "ui.movieCatalog")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "ui.catalogOfMovies"),
      },
    ],
  };
};
