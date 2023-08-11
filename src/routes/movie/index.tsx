import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { DbType } from "~/services/firestore";
import type { MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getFirebaseMovies, getTrendingMedia } from "~/services/tmdb";
import { langLatestDolbyVisionMovies, langLatestHDR10Movies, langLatestMovies, langTrendingMovies } from "~/utils/languages";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [m, torMovies, hdrMovies, dolbyMovies] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: DbType.LastMovies,
        sortDirection: "desc",
        need_backdrop: true,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: DbType.HDR10,
        sortDirection: "desc",
        need_backdrop: true,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: DbType.DV,
        sortDirection: "desc",
        need_backdrop: true,
      }),
    ]);
    const movies = m as MovieShort[];
    return {
      movies,
      torMovies,
      hdrMovies,
      dolbyMovies,
      lang,
    };
  } catch {
    throw event.redirect(302, paths.notFound(lang));
  }
});

export default component$(() => {
  const resource = useContentLoader();

  return (
    <>
      <div class="container mx-auto px-4 pt-[64px]">
        <MediaCarousel
          title={langLatestMovies(resource.value.lang)}
          type={MediaType.Movie}
          category="updated"
          lang={resource.value.lang}
        >
          {resource.value.torMovies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={parseInt(
                    m.release_date ? m.release_date.substring(0, 4) : "0",
                    10
                  )}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>

        <MediaCarousel
          title={langLatestHDR10Movies(resource.value.lang)}
          type={MediaType.Movie}
          category="hdr10"
          lang={resource.value.lang}
        >
          {resource.value.hdrMovies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={parseInt(
                    m.release_date ? m.release_date.substring(0, 4) : "0",
                    10
                  )}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>

        <MediaCarousel
          title={langLatestDolbyVisionMovies(resource.value.lang)}
          type={MediaType.Movie}
          category="dolbyvision"
          lang={resource.value.lang}
        >
          {resource.value.dolbyMovies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={parseInt(
                    m.release_date ? m.release_date.substring(0, 4) : "0",
                    10
                  )}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>

        <MediaCarousel
          title={langTrendingMovies(resource.value.lang)}
          type={MediaType.Movie}
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.movies.map((m) => (
            <>
              <a href={paths.media(MediaType.Movie, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title ? m.title : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={parseInt(
                    m.release_date ? m.release_date.substring(0, 4) : "0",
                    10
                  )}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
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
