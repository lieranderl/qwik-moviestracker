import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { MediaShort, MovieMongo, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { useEnv } from "~/shared/loaders";
import { categoryToDb, categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const env = event.env.get("MONGO_URI") ?? "";

  if (event.params.name === "trending") {
    try {
      const res = await getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: false,
      });
      return {
        movies: res as MovieShort[],
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      console.error(error);
      throw event.redirect(302, paths.notFound(lang));
    }
  } else {
    try {
      console.log("get mongo movies");
      const movies = await withImages(
        (await getMoviesMongo({
          entries_on_page: 20,
          dbName: categoryToDb(event.params.name),
          page: 1,
          language: lang,
          env: env,
        })) as MediaShort[],
        lang,
      );
      return {
        movies: movies as MovieMongo[],
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch (error) {
      console.log(error);
      throw event.redirect(302, paths.notFound(lang));
    }
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const moviesSig = useSignal(resource.value.movies as MediaShort[]);
  const isloadingMovies = useSignal(false);
  const pageSig = useSignal(1);
  const hasMoreMovies = useSignal(resource.value.movies.length >= 20);
  const sentinelRef = useSignal<Element>();
  const envMongoUrl = useEnv().value.envMongoUrl;

  const fetchMovies = server$(
    async (page: number, category: string, lang: string, env: string) => {
      if (category === "trending") {
        return (await getTrendingMedia({
          page: page,
          language: lang,
          type: MediaType.Movie,
          needbackdrop: false,
        })) as MediaShort[];
      }
      return (await withImages(
        (await getMoviesMongo({
          entries_on_page: 20,
          dbName: categoryToDb(category),
          page: page,
          language: lang,
          env: env,
        })) as MediaShort[],
        lang,
      )) as MediaShort[];
    },
  );

  const getNewMovies = $(async () => {
    if (isloadingMovies.value || !hasMoreMovies.value) {
      return;
    }

    isloadingMovies.value = true;
    const nextPage = pageSig.value + 1;
    const nextMovies = (await fetchMovies(
      nextPage,
      resource.value.category,
      resource.value.lang,
      envMongoUrl,
    )) as MediaShort[];

    if (nextMovies.length === 0) {
      hasMoreMovies.value = false;
      isloadingMovies.value = false;
      return;
    }

    moviesSig.value = [...moviesSig.value, ...nextMovies];
    pageSig.value = nextPage;
    hasMoreMovies.value = nextMovies.length >= 20;
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
          MediaType.Movie,
          resource.value.lang,
        )}
      >
        {moviesSig.value.length > 0 &&
          moviesSig.value.map((m) => (
            <a
              href={paths.media(MediaType.Movie, m.id, resource.value.lang)}
              key={m.id}
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={300}
                rating={m.vote_average ? m.vote_average : 0}
                year={
                  m.year
                    ? Number.parseInt(m.year, 10)
                    : Number.parseInt(
                        m.release_date ? m.release_date.substring(0, 4) : "0",
                        10,
                      )
                }
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
      content: "Catalog of movies",
    },
  ],
};
