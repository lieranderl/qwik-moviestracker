import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {

  getFirebaseMovies,
  getTrendingMovieWithBackdrops,

} from "~/services/tmdb";

const lang = "ru-RU";



export const useContentLoader = routeLoader$(async (event) => {

  try {
    const [
      movies, 
      // tv, 
      torMovies, 
      hdrMovies, 
      // dolbyMovies
    ] = await Promise.all([
      getTrendingMovieWithBackdrops({ page: 1, language: lang }),
      // getTrendingTvWithBackdrops({ page: 1, language: lang}),
      getFirebaseMovies({entries: 20, language: lang, startTime: Timestamp.now().toMillis(), db_name: "latesttorrentsmovies", sortDirection: "desc" }),
      getFirebaseMovies({entries: 20, language: lang, startTime: Timestamp.now().toMillis(), db_name: "hdr10movies", sortDirection: "desc" }),

      // getTorUpdatedMoviesDolbyTrend({entries: 20, language: lang }),
    ]);
    // const newhdrMovies = hdrMovies.movies.sort((a, b) => (torMovies.mIds.indexOf(a.id) - torMovies.mIds.indexOf(b.id)));
    // const newdolbyMovies = dolbyMovies.movies.sort((a, b) => (torMovies.mIds.indexOf(a.id) - torMovies.mIds.indexOf(b.id)));
    
    return { 
      movies, 
      // tv, 
      torMovies, 
      hdrMovies, 
      // newdolbyMovies
    };
  } catch {
    throw event.redirect(302, "/404");
  }
});

export default component$(() => {
  const tmdbResource = useContentLoader();
  return (
    <>
     <MediaCarousel title="Latest Movies" type="latesttorrentsmovies">
        {tmdbResource.value.torMovies.map((m) => (
          <>
            <div class="carousel-item">
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel>
      <MediaCarousel title="Trending Movies">
        {tmdbResource.value.movies.results!.map((m) => (
          <>
            <div class="carousel-item">
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel>
      <MediaCarousel title="Latest HDR10 Movies" type="hdr10movies">
        {tmdbResource.value.hdrMovies.map((m) => (
          <>
            <div class="carousel-item">
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel>
      {/* <MediaCarousel title="Latest DolbyVision Movies">
        {tmdbResource.value.newdolbyMovies.map((m) => (
          <>
            <div class="carousel-item">
              <MediaCard
                title={m.title!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.release_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel>
      <MediaCarousel title="Trenging TV Shows">
        {tmdbResource.value.tv.results!.map((m) => (
          <>
            <div class="carousel-item">
              <MediaCard
                title={m.name!}
                width={500}
                rating={m.vote_average!}
                year={parseInt(m.first_air_date!.substring(0, 4), 10)}
                picfile={m.backdrop_path!}
                isPerson={false}
                isHorizontal={true}
              />
            </div>
          </>
        ))}
      </MediaCarousel> */}
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
