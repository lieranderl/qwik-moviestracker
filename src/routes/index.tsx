import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
  getTrendingMovieWithBackdrops,
  getTrendingTvWithBackdrops,
} from "~/services/tmdb";

export const useContentLoader = routeLoader$(async (event) => {
  try {
    const [movies, tv] = await Promise.all([
      getTrendingMovieWithBackdrops({ page: 1 }),
      getTrendingTvWithBackdrops({ page: 1 }),
    ]);
    return { movies, tv };
  } catch {
    throw event.redirect(302, "/404");
  }
});

export default component$(() => {
  const resource = useContentLoader();
  const m = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <>
      <MediaCarousel title="Trenging Movies">
        {resource.value.movies.results!.map((m) => (
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
        {resource.value.tv.results!.map((m) => (
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
      </MediaCarousel>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
