import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
  getFirebaseMovies,
  getTrendingMovieWithBackdrops,
} from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [
      movies,
      //   tv,
      torMovies,
      hdrMovies,
      dolbyMovies,
    ] = await Promise.all([
      getTrendingMovieWithBackdrops({ page: 1, language: lang }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: "latesttorrentsmovies",
        sortDirection: "desc",
        need_backdrop: true,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: "hdr10movies",
        sortDirection: "desc",
        need_backdrop: true,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: "dvmovies",
        sortDirection: "desc",
        need_backdrop: true,
      }),
    ]);
    return {
      movies,
      torMovies,
      hdrMovies,
      dolbyMovies,
      lang,
    };
  } catch {
    throw event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="container mx-auto px-4 pt-[64px]">
        <MediaCarousel
          title="Latest Movies"
          type="movie"
          category="updated"
          lang={resource.value.lang}
        >
          {resource.value.torMovies.map((m) => (
            <>
              <MediaCard
                title={m.original_title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path}
                isPerson={false}
                isHorizontal={true}
                id={m.id}
                type="movie"
                lang={resource.value.lang}
              />
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Trending Movies"
          type="movie"
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.movies.results!.map((m) => (
            <>
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
                id={m.id}
                type="movie"
                lang={resource.value.lang}
              />
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Latest HDR10 Movies"
          type="movie"
          category="hdr10"
          lang={resource.value.lang}
        >
          {resource.value.hdrMovies.map((m) => (
            <>
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
                id={m.id}
                type="movie"
                lang={resource.value.lang}
              />
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Latest Dolby Vision Movies"
          type="movie"
          category="dolbyvision"
          lang={resource.value.lang}
        >
          {resource.value.dolbyMovies.map((m) => (
            <>
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
                id={m.id}
                type="movie"
                lang={resource.value.lang}
              />
            </>
          ))}
        </MediaCarousel>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Movie",
    },
  ],
};
