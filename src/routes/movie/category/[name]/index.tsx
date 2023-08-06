/* eslint-disable qwik/valid-lexical-scope */
import {
  component$,
  $,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { ButtonPrimary, ButtonSize } from "~/components/button-primary";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { MovieFirestore, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getFirebaseMovies, getTrendingMedia } from "~/services/tmdb";
import { categoryToDb, categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  if (
    event.params.name === "updated" ||
    event.params.name === "hdr10" ||
    event.params.name === "dolbyvision"
  ) {
    try {
      const [movies] = await Promise.all([
        getFirebaseMovies({
          entries: 20,
          language: lang,
          startTime: Timestamp.now().toMillis(),
          db_name: categoryToDb(event.params.name),
          sortDirection: "desc",
          need_backdrop: false,
        }),
      ]);
      return {
        movies: movies as MovieFirestore[],
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch {
      throw event.redirect(302, "/404");
    }
  } else {
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
      throw event.redirect(302, "/404");
    }
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const firebaseStore = useStore({
    moviesLastTimeFound: Timestamp.now().toMillis(),
  });
  const moviesSig = useStore(resource.value.movies as MovieFirestore[]);
  const isloadingMovies = useSignal(false);
  const pageSig = useSignal(1);

  useVisibleTask$((ctx) => {
    ctx.track(() => {
      moviesSig.length;
    });
    if (
      resource.value.category === "updated" ||
      resource.value.category === "hdr10" ||
      resource.value.category === "dolbyvision"
    ) {
      if (moviesSig.length === 0) return;
      firebaseStore.moviesLastTimeFound =
        moviesSig[moviesSig.length - 1].lastTimeFound!;
    } else {
      pageSig.value = pageSig.value + 1;
    }
  });

  const getNewMovies = $(async () => {
    isloadingMovies.value = true;

    const moviesFunc = server$(function () {
      if (
        resource.value.category === "updated" ||
        resource.value.category === "hdr10" ||
        resource.value.category === "dolbyvision"
      ) {
        return getFirebaseMovies({
          entries: 20,
          language: resource.value.lang,
          startTime: firebaseStore.moviesLastTimeFound,
          db_name: resource.value.db,
          sortDirection: "desc",
          need_backdrop: false,
        });
      } else {
        return getTrendingMedia({
          page: pageSig.value,
          language: resource.value.lang,
          type: MediaType.Movie,
          needbackdrop: false,
        });
      }
    });

    const movies = (await moviesFunc()) as MovieFirestore[];
    moviesSig.push(...movies);
    console.log(moviesSig.length);
    isloadingMovies.value = false;
  });

  return (
    <div class="container mx-auto px-4 pt-[64px]">
      <MediaGrid
        title={categoryToTitle(resource.value.category, MediaType.Movie)}
      >
        {moviesSig.length > 0 &&
          moviesSig.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={300}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={parseInt(
                    m.release_date ? m.release_date.substring(0, 4) : "0",
                    10
                  )}
                  picfile={m.poster_path}
                  isPerson={false}
                  isHorizontal={false}
                />
              </a>
            </>
          ))}
      </MediaGrid>
      <div class="flex justify-center my-4">
        <ButtonPrimary
          text="Load more"
          onClick={getNewMovies}
          isLoading={isloadingMovies.value}
          size={ButtonSize.lg}
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
      content: "Catalog of movies",
    },
  ],
};
