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
  langText,
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
        title={langText(resource.value.lang, "Series", "Сериалы")}
      />
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
      <div class="section-reveal flex flex-wrap items-center gap-2">
        <a
          href={paths.tvDiscover(resource.value.lang)}
          class="btn btn-primary rounded-full"
        >
          {langDiscoverTv(resource.value.lang)}
        </a>
      </div>
      <MediaCarousel
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

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "TV collections",
      "Коллекции сериалов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(
          lang,
          "Browse TV collections",
          "Просмотр коллекций сериалов",
        ),
      },
    ],
  };
};
