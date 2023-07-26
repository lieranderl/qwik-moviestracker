import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
  getFirebaseMovies,
  getTrendingMovieWithBackdrops,
  getTrendingTvWithBackdrops,
} from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [
      movies,
      tv,
      torMovies,
      // hdrMovies,
      // dolbyMovies
    ] = await Promise.all([
      getTrendingMovieWithBackdrops({ page: 1, language: lang }),
      getTrendingTvWithBackdrops({ page: 1, language: lang }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: "latesttorrentsmovies",
        sortDirection: "desc",
        need_backdrop: true,
      }),
      // getFirebaseMovies({entries: 20, language: lang, startTime: Timestamp.now().toMillis(), db_name: "hdr10movies", sortDirection: "desc" }),

      // getTorUpdatedMoviesDolbyTrend({entries: 20, language: lang }),
    ]);
    // const newhdrMovies = hdrMovies.movies.sort((a, b) => (torMovies.mIds.indexOf(a.id) - torMovies.mIds.indexOf(b.id)));
    // const newdolbyMovies = dolbyMovies.movies.sort((a, b) => (torMovies.mIds.indexOf(a.id) - torMovies.mIds.indexOf(b.id)));

    return {
      movies,
      tv,
      torMovies,
      // hdrMovies,
      lang,
      // newdolbyMovies
    };
  } catch {
    throw event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <>
      <div class="container mx-auto px-4">
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
          title="Trenging TV Shows"
          type="tv"
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.tv.results!.map((m) => (
            <>
              <MediaCard
                title={m.name!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.first_air_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
                id={m.id}
                type="tv"
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
      content: "Moviestracker",
    },
  ],
};
