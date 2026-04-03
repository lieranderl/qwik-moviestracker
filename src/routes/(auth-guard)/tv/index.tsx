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
  langAiringTodayTvShows,
  langDiscoverTv,
  langOnTheAirTvShows,
  langPopularTvShows,
  langQuickFilters,
  langSwipeToBrowse,
  langTopRatedTvShows,
  langTrengingTVShows,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  try {
    const [tvtrend, tvtoprated, tvpopular, tvairingtoday, tvontheair] =
      await Promise.all([
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
        getMedias({
          page: 1,
          query: "popular",
          language: lang,
          type: MediaType.Tv,
          needbackdrop: true,
        }),
        getMedias({
          page: 1,
          query: "airing_today",
          language: lang,
          type: MediaType.Tv,
          needbackdrop: true,
        }),
        getMedias({
          page: 1,
          query: "on_the_air",
          language: lang,
          type: MediaType.Tv,
          needbackdrop: true,
        }),
      ]);

    return {
      tvtrend: tvtrend as TvShort[],
      tvtoprated: tvtoprated as TvShort[],
      tvpopular: tvpopular as TvShort[],
      tvairingtoday: tvairingtoday as TvShort[],
      tvontheair: tvontheair as TvShort[],
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
      <SectionHeading
        eyebrow="TV Shows"
        title="Browse TV collections"
        description="Switch between TMDB discovery feeds for trending, popular, top-rated, and currently airing series."
        badges={[
          `${resource.value.tvtrend.length} trending`,
          `${resource.value.tvpopular.length} popular`,
          `${resource.value.tvtoprated.length} top rated`,
          `${resource.value.tvairingtoday.length} airing today`,
          `${resource.value.tvontheair.length} on the air`,
        ]}
      />
      <section class="alert alert-info alert-soft section-reveal">
        <span class="text-sm leading-relaxed">
          Trending surfaces short-window movement on TMDB, while Popular and
          Discover rely on broader popularity and vote history. Use TV discover
          when you want provider, regional, year, and vote-count filters.
        </span>
      </section>
      <QuickFilterStrip
        label={langQuickFilters(resource.value.lang)}
        items={[
          {
            active: true,
            href: "#trending-tv",
            label: langTrengingTVShows(resource.value.lang),
          },
          {
            href: "#popular-tv",
            label: langPopularTvShows(resource.value.lang),
          },
          {
            href: "#top-rated-tv",
            label: langTopRatedTvShows(resource.value.lang),
          },
          {
            href: "#airing-today-tv",
            label: langAiringTodayTvShows(resource.value.lang),
          },
          {
            href: "#on-the-air-tv",
            label: langOnTheAirTvShows(resource.value.lang),
          },
        ]}
      />
      <div class="flex flex-wrap items-center gap-2">
        <a
          href={paths.tvDiscover(resource.value.lang)}
          class="btn btn-primary rounded-full"
        >
          {langDiscoverTv(resource.value.lang)}
        </a>
      </div>
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
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(resource.value.lang)}
        sectionId="popular-tv"
        title={langPopularTvShows(resource.value.lang)}
        type={MediaType.Tv}
        category="popular"
        lang={resource.value.lang}
      >
        {resource.value.tvpopular.map((m) => (
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
                variant="landscape"
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
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(resource.value.lang)}
        sectionId="airing-today-tv"
        title={langAiringTodayTvShows(resource.value.lang)}
        type={MediaType.Tv}
        category="airingtoday"
        lang={resource.value.lang}
      >
        {resource.value.tvairingtoday.map((m) => (
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
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(resource.value.lang)}
        sectionId="on-the-air-tv"
        title={langOnTheAirTvShows(resource.value.lang)}
        type={MediaType.Tv}
        category="ontheair"
        lang={resource.value.lang}
      >
        {resource.value.tvontheair.map((m) => (
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
                variant="landscape"
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
