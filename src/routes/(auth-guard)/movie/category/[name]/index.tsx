import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { MediaShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMoviesFirestore } from "~/services/firestore";
import {
  getMedias,
  getRegionFromLanguage,
  getTrendingMedia,
  withImages,
} from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import { createInfiniteScrollObserver } from "~/utils/infinite-scroll";
import { langText } from "~/utils/languages";
import { categoryToDb, categoryToTitle, paths } from "~/utils/paths";

type FetchMovieCategoryPageArgs = {
  category: string;
  cursor?: string | null;
  databaseId: string;
  lang: string;
  page: number;
  projectId: string;
};

type MovieCategoryPage = {
  movies: MediaShort[];
  nextCursor: string | null;
};

const MOVIE_TMDB_CATEGORY_QUERIES: Record<string, string | null> = {
  trending: null,
  popular: "popular",
  nowplaying: "now_playing",
  upcoming: "upcoming",
};

const isSupportedMovieCategory = (category: string) =>
  category in MOVIE_TMDB_CATEGORY_QUERIES ||
  category === "updated" ||
  category === "hdr10" ||
  category === "dolbyvision";

const isFirestoreCategory = (category: string) =>
  category === "updated" || category === "hdr10" || category === "dolbyvision";

const fetchMovieCategoryPage = async ({
  category,
  cursor,
  databaseId,
  lang,
  page,
  projectId,
}: FetchMovieCategoryPageArgs): Promise<MovieCategoryPage> => {
  const tmdbQuery = MOVIE_TMDB_CATEGORY_QUERIES[category];

  if (tmdbQuery === null) {
    const movies = (await getTrendingMedia({
      page,
      language: lang,
      type: MediaType.Movie,
      needbackdrop: false,
    })) as MediaShort[];
    return { movies, nextCursor: null };
  }

  if (tmdbQuery) {
    const movies = (await getMedias({
      page,
      language: lang,
      query: tmdbQuery,
      region:
        category === "nowplaying" || category === "upcoming"
          ? getRegionFromLanguage(lang)
          : undefined,
      type: MediaType.Movie,
      needbackdrop: false,
    })) as MediaShort[];
    return { movies, nextCursor: null };
  }

  const result = await getMoviesFirestore({
    entriesOnPage: MEDIA_PAGE_SIZE,
    dbName: categoryToDb(category),
    cursor,
    language: lang,
    projectId,
    databaseId,
  });
  const movies = (await withImages(
    result.movies as MediaShort[],
    lang,
  )) as MediaShort[];
  return { movies, nextCursor: result.nextCursor };
};

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const projectId =
    event.env.get("GCP_PROJECT") ?? event.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
  const databaseId = event.env.get("FIRESTORE_DATABASE") ?? "moviestracker";
  const category = event.params.name;

  if (!isSupportedMovieCategory(category)) {
    throw event.redirect(302, paths.notFound(lang));
  }

  try {
    const result = await fetchMovieCategoryPage({
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
  const movieItemsSig = useSignal(resource.value.movies as MediaShort[]);
  const isLoadingMovies = useSignal(false);
  const pageSig = useSignal(1);
  const cursorSig = useSignal<string | null>(resource.value.nextCursor);
  const hasMoreMovies = useSignal(
    isFirestoreCategory(resource.value.category)
      ? resource.value.nextCursor !== null
      : resource.value.movies.length >= MEDIA_PAGE_SIZE,
  );
  const sentinelRef = useSignal<Element>();

  const fetchMovies = server$(async function (
    page: number,
    category: string,
    lang: string,
    cursor: string | null,
  ) {
    const projectId =
      this.env.get("GCP_PROJECT") ?? this.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
    const databaseId = this.env.get("FIRESTORE_DATABASE") ?? "moviestracker";
    return await fetchMovieCategoryPage({
      page,
      category,
      lang,
      cursor,
      projectId,
      databaseId,
    });
  });

  const getNewMovies = $(async () => {
    if (isLoadingMovies.value || !hasMoreMovies.value) {
      return;
    }

    isLoadingMovies.value = true;
    try {
      const nextPage = pageSig.value + 1;
      const nextResult = await fetchMovies(
        nextPage,
        resource.value.category,
        resource.value.lang,
        cursorSig.value,
      );
      const nextMovies = nextResult.movies as MediaShort[];

      if (nextMovies.length === 0) {
        hasMoreMovies.value = false;
        return;
      }

      movieItemsSig.value = [...movieItemsSig.value, ...nextMovies];
      pageSig.value = nextPage;
      cursorSig.value = nextResult.nextCursor;
      hasMoreMovies.value = isFirestoreCategory(resource.value.category)
        ? nextResult.nextCursor !== null
        : nextMovies.length >= MEDIA_PAGE_SIZE;
    } finally {
      isLoadingMovies.value = false;
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
      hasMore: hasMoreMovies.value,
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
        headerBadge={langText(
          resource.value.lang,
          `${movieItemsSig.value.length} loaded`,
          `${movieItemsSig.value.length} загружено`,
        )}
        title={categoryToTitle(
          resource.value.category,
          MediaType.Movie,
          resource.value.lang,
        )}
      >
        {movieItemsSig.value.length > 0 &&
          movieItemsSig.value.map((m) => (
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
        {isLoadingMovies.value && (
          <div class="border-base-200 bg-base-100/88 flex items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm">
            <span class="loading loading-ring loading-sm" />
            <span>
              {langText(
                resource.value.lang,
                "Loading more movies…",
                "Загружаем еще фильмы…",
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
      "Movie catalog",
      "Каталог фильмов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(lang, "Catalog of movies", "Каталог фильмов"),
      },
    ],
  };
};
