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
import { formatYear } from "~/utils/fomat";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [movies, tv, torMovies] = await Promise.all([
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
    ]);
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
          type="movie"
          category="updated"
          lang={resource.value.lang}
        >
          {resource.value.torMovies.map((m) => (
            <>
              <a href={paths.media("movie", m.id, resource.value.lang)}>
                <MediaCard
                  title={m.original_title!}
                  width={500}
                  rating={m.vote_average}
                  year={
                    (m.release_date && formatYear(m.release_date)) || undefined
                  }
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
          type="movie"
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.movies.results!.map((m) => (
            <>
              <a href={paths.media("movie", m.id, resource.value.lang)}>
                <MediaCard
                  title={m.title!}
                  width={500}
                  rating={m.vote_average}
                  year={
                    (m.release_date && formatYear(m.release_date)) || undefined
                  }
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
          type="tv"
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.tv.results!.map((m) => (
            <>
              <a href={paths.media("tv", m.id, resource.value.lang)}>
                <MediaCard
                  title={m.name!}
                  width={500}
                  rating={m.vote_average}
                  year={
                    (m.first_air_date && formatYear(m.first_air_date)) ||
                    undefined
                  }
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
