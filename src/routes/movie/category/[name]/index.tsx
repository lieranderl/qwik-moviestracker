import {
  component$,
  $,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead} from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { ButtonPrimary } from "~/components/button-primary";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { firebaseStoreContext } from "~/root";
import { getFirebaseMovies, getTrendingMovie } from "~/services/tmdb";
import type { MovieMediaDetails } from "~/services/types";
import { categoryToDb, categoryToTitle } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";

  if (event.params.name === "trending") {
    console.log("trending movies");
  }

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
        movies: movies,
        db: categoryToDb(event.params.name),
        category: event.params.name,
        lang: lang,
      };
    } catch {
      throw event.redirect(302, "/404");
    }
  } else {
    try {
      const res = await getTrendingMovie({ page: 1, language: lang });
      return {
        movies: res.results as MovieMediaDetails[],
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
  const firebaseStore = useContext(firebaseStoreContext);
  const moviesSig = useStore(resource.value.movies as MovieMediaDetails[]);
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
        return getTrendingMovie({
          page: pageSig.value,
          language: resource.value.lang,
        });
      }
    });

    const movies = await moviesFunc();

    if ("results" in movies) {
      const res = movies.results as MovieMediaDetails[];
      console.log(res);
      moviesSig.push(...res);
    } else {
      moviesSig.push(...(movies as MovieMediaDetails[]));
    }

    console.log(moviesSig.length);
    isloadingMovies.value = false;
  });

  return (
    <section>
      <MediaGrid title={categoryToTitle(resource.value.category, "movie")}>
        {moviesSig.length > 0 &&
          moviesSig.map((m) => (
            <>
              <MediaCard
                title={m.title!}
                width={300}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.poster_path}
                isPerson={false}
                isHorizontal={false}
                id={m.id}
                type="movie"
                lang={resource.value.lang}
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
    </section>
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
