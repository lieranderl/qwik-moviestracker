import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { Timestamp } from "firebase/firestore";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { DbType } from "~/services/firestore";
import type { MovieFirestore, MovieShort, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getFirebaseMovies, getTrendingMedia } from "~/services/tmdb";
import { formatYear } from "~/utils/fomat";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {

  const lang = event.query.get("lang") || "en-US";
  const needbackdrop = true;
  try {
    const [m, t, tm] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: needbackdrop,
      }),
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: needbackdrop,
      }),
      getFirebaseMovies({
        entries: 20,
        language: lang,
        startTime: Timestamp.now().toMillis(),
        db_name: DbType.LastMovies,
        sortDirection: "desc",
        need_backdrop: needbackdrop,
      }),
    ]);
    const movies = m as MovieShort[];
    const tv = t as TvShort[];
    const torMovies = tm as MovieFirestore[];
    return {
      movies,
      tv,
      torMovies,
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
                  year={(m.release_date && formatYear(m.release_date)) || 0}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Trending Movies"
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
                  year={(m.release_date && formatYear(m.release_date)) || 0}
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Trenging TV Shows"
          type={MediaType.Tv}
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.tv.map((m) => (
            <>
              <a href={paths.media(MediaType.Tv, m.id, resource.value.lang)}>
                <MediaCard
                  title={m.name ? m.name : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={(m.first_air_date && formatYear(m.first_air_date)) || 0}
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
      content: "Moviestracker",
    },
  ],
};
