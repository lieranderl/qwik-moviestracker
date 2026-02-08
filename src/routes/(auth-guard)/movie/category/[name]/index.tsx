import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { MediaShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { useEnv } from "~/shared/loaders";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import { createInfiniteScrollObserver } from "~/utils/infinite-scroll";
import { categoryToDb, categoryToTitle, paths } from "~/utils/paths";

type FetchMovieCategoryPageArgs = {
  category: string;
  env: string;
  lang: string;
  page: number;
};

const fetchMovieCategoryPage = async ({
  category,
  env,
  lang,
  page,
}: FetchMovieCategoryPageArgs): Promise<MediaShort[]> => {
  if (category === "trending") {
    return (await getTrendingMedia({
      page,
      language: lang,
      type: MediaType.Movie,
      needbackdrop: false,
    })) as MediaShort[];
  }

  return (await withImages(
    (await getMoviesMongo({
      entries_on_page: MEDIA_PAGE_SIZE,
      dbName: categoryToDb(category),
      page,
      language: lang,
      env,
    })) as MediaShort[],
    lang,
  )) as MediaShort[];
};

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const env = event.env.get("MONGO_URI") ?? "";
  const category = event.params.name;

  try {
    const movies = await fetchMovieCategoryPage({
      page: 1,
      category,
      lang,
      env,
    });
    return { movies, category, lang };
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
  const hasMoreMovies = useSignal(
    resource.value.movies.length >= MEDIA_PAGE_SIZE,
  );
  const sentinelRef = useSignal<Element>();
  const envMongoUrl = useEnv().value.envMongoUrl;

  const fetchMovies = server$(
    async (page: number, category: string, lang: string, env: string) =>
      await fetchMovieCategoryPage({
        page,
        category,
        lang,
        env,
      }),
  );

  const getNewMovies = $(async () => {
    if (isLoadingMovies.value || !hasMoreMovies.value) {
      return;
    }

    isLoadingMovies.value = true;
    try {
      const nextPage = pageSig.value + 1;
      const nextMovies = (await fetchMovies(
        nextPage,
        resource.value.category,
        resource.value.lang,
        envMongoUrl,
      )) as MediaShort[];

      if (nextMovies.length === 0) {
        hasMoreMovies.value = false;
        return;
      }

      movieItemsSig.value = [...movieItemsSig.value, ...nextMovies];
      pageSig.value = nextPage;
      hasMoreMovies.value = nextMovies.length >= MEDIA_PAGE_SIZE;
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
    <div class="animate-fadeIn container mx-auto px-4 pt-16 pb-10">
      <MediaGrid
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
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={300}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.year ?? m.release_date)}
                picfile={m.poster_path}
                isPerson={false}
                isHorizontal={false}
              />
            </a>
          ))}
      </MediaGrid>
      <div class="my-4 flex justify-center">
        <div ref={sentinelRef} class="h-8 w-full" />
        {isLoadingMovies.value && (
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
      content: "Catalog of movies",
    },
  ],
};
