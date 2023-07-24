import {
  component$,
  $,
  useContext,
  useVisibleTask$,
  useStore,
  useSignal,
} from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { ButtonPrimary } from "~/components/button-primary";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { firebaseStoreContext } from "~/root";
import { getFirebaseMovies } from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = "ru-RU";
  try {
    const [movies] = await Promise.all([
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        // db_name: "latesttorrentsmovies",
        db_name: event.params.type,
        sortDirection: "desc",
      }),
    ]);
    return {
      movies: movies,
      db: event.params.type,
    };
  } catch {
    throw event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const firebaseStore = useContext(firebaseStoreContext);
  const moviesSig = useStore(resource.value.movies);
  const isloadingMovies = useSignal(false);

  useVisibleTask$((ctx) => {
    ctx.track(() => {
      moviesSig.length;
    });
    firebaseStore.moviesLastTimeFound =
      moviesSig[moviesSig.length - 1].lastTimeFound!;
    console.log(firebaseStore.moviesLastTimeFound);
  });

  const getNewMovies = $(async () => {
    isloadingMovies.value = true;

    const moviesFunc = server$(function () {
      return getFirebaseMovies({
        entries: 20,
        language: "ru-RU",
        startTime: firebaseStore.moviesLastTimeFound,
        db_name: resource.value.db,
        sortDirection: "desc",
      });
    });

    const movies = await moviesFunc();
    // firebaseStore.moviesLastTimeFound =
    //   movies[movies.length - 1].lastTimeFound!;
    moviesSig.push(...movies);
    console.log(moviesSig.length);
    isloadingMovies.value = false;
  });

  return (
    <section>
      <MediaGrid>
        {moviesSig.length > 0 &&
          moviesSig.map((m) => (
            <>
              <div class="carousel-item" key={m.id}>
                <MediaCard
                  title={m.title!}
                  width={300}
                  rating={m.vote_average!}
                  year={parseInt(m.release_date!.substring(0, 4), 10)}
                  picfile={m.poster_path}
                  isPerson={false}
                  isHorizontal={false}
                />
              </div>
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
