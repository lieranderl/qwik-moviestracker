import { component$ } from "@builder.io/qwik";

import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { getTrendingTvWithBackdrops, getTvShows } from "~/services/tmdb";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [tvtrend, tvtoprated] = await Promise.all([
      getTrendingTvWithBackdrops({ page: 1, language: lang }),
      getTvShows({ page: 1, query: "top_rated", language: lang }),
    ]);
    return {
      tvtrend,
      tvtoprated,
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
          title="Trending Tv Shows"
          type="tv"
          category="trending"
          lang={resource.value.lang}
        >
          {resource.value.tvtrend.results!.map((m) => (
            <>
              <a href={paths.media("tv", m.id, resource.value.lang)}>
                <MediaCard
                  title={m.name!}
                  width={500}
                  rating={m.vote_average!}
                  year={parseInt(m.first_air_date!.substring(0, 4), 10)}
                  picfile={m.backdrop_path!}
                  isPerson={false}
                  isHorizontal={true}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
        <MediaCarousel
          title="Top Rated Tv Shows"
          type="tv"
          category="toprated"
          lang={resource.value.lang}
        >
          {resource.value.tvtoprated.results!.map((m) => (
            <>
              <a href={paths.media("tv", m.id, resource.value.lang)}>
                <MediaCard
                  title={m.name!}
                  width={500}
                  rating={m.vote_average!}
                  year={parseInt(m.first_air_date!.substring(0, 4), 10)}
                  picfile={m.backdrop_path!}
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
      content: "Tv Shows",
    },
  ],
};
