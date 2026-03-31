import { component$ } from "@builder.io/qwik";

import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { SectionHeading } from "~/components/page-feedback";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMedias, getTrendingMedia } from "~/services/tmdb";
import { formatYear } from "~/utils/format";
import {
  langQuickFilters,
  langSwipeToBrowse,
  langTopRatedTvShows,
  langTrengingTVShows,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [tt, tttop] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: true,
      }),
      getMedias({
        page: 1,
        query: "top_rated",
        language: lang,
        type: MediaType.Tv,
        needbackdrop: true,
      }),
    ]);
    const tvtrend = tt as TvShort[];
    const tvtoprated = tttop as TvShort[];
    return {
      tvtrend,
      tvtoprated,
      lang,
    };
  } catch {
    throw event.redirect(302, paths.notFound(lang));
  }
});

export default component$(() => {
  const resource = useContentLoader();
  return (
    <div class="space-y-6">
      <SectionHeading eyebrow="TV Shows" title="Browse TV collections" />
      <QuickFilterStrip
        label={langQuickFilters(resource.value.lang)}
        items={[
          {
            active: true,
            href: "#trending-tv",
            label: langTrengingTVShows(resource.value.lang),
          },
          {
            href: "#top-rated-tv",
            label: langTopRatedTvShows(resource.value.lang),
          },
        ]}
      />
      <MediaCarousel
        hintLabel={langSwipeToBrowse(resource.value.lang)}
        sectionId="trending-tv"
        title={langTrengingTVShows(resource.value.lang)}
        type={MediaType.Tv}
        category="trending"
        lang={resource.value.lang}
      >
        {resource.value.tvtrend.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Tv, m.id, resource.value.lang)}
              class="media-card-link"
            >
              <MediaCard
                title={m.name ? m.name : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.first_air_date)}
                picfile={m.backdrop_path}
                isPerson={false}
                isHorizontal={true}
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(resource.value.lang)}
        sectionId="top-rated-tv"
        title={langTopRatedTvShows(resource.value.lang)}
        type={MediaType.Tv}
        category="toprated"
        lang={resource.value.lang}
      >
        {resource.value.tvtoprated.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Tv, m.id, resource.value.lang)}
              class="media-card-link"
            >
              <MediaCard
                title={m.name ? m.name : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.first_air_date)}
                picfile={m.backdrop_path}
                isPerson={false}
                isHorizontal={true}
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
    </div>
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
