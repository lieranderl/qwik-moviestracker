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
  const value = resource.value;
  const lang = value.lang;
  const quickFilterItems = [
    {
      active: true,
      href: "#trending-tv",
      label: langTrengingTVShows(lang),
    },
    {
      href: "#popular-tv",
      label: langPopularTvShows(lang),
    },
    {
      href: "#top-rated-tv",
      label: langTopRatedTvShows(lang),
    },
    {
      href: "#airing-today-tv",
      label: langAiringTodayTvShows(lang),
    },
    {
      href: "#on-the-air-tv",
      label: langOnTheAirTvShows(lang),
    },
  ];
  const tvSections = [
    {
      category: "trending",
      items: value.tvtrend,
      sectionId: "trending-tv",
      title: langTrengingTVShows(lang),
    },
    {
      category: "popular",
      items: value.tvpopular,
      sectionId: "popular-tv",
      title: langPopularTvShows(lang),
    },
    {
      category: "toprated",
      items: value.tvtoprated,
      sectionId: "top-rated-tv",
      title: langTopRatedTvShows(lang),
    },
    {
      category: "airingtoday",
      items: value.tvairingtoday,
      sectionId: "airing-today-tv",
      title: langAiringTodayTvShows(lang),
    },
    {
      category: "ontheair",
      items: value.tvontheair,
      sectionId: "on-the-air-tv",
      title: langOnTheAirTvShows(lang),
    },
  ];

  return (
    <div class="space-y-5 md:space-y-6">
      <SectionHeading
        eyebrow={langText(lang, "TV collections", "Коллекции сериалов")}
        title={langText(lang, "Series", "Сериалы")}
        description={langText(
          lang,
          "Browse trending, popular, top-rated, airing today, and on-the-air series collections.",
          "Просматривайте трендовые, популярные, рейтинговые, сегодняшние и актуальные коллекции сериалов.",
        )}
      />
      <QuickFilterStrip
        label={langQuickFilters(lang)}
        items={quickFilterItems}
      />
      <section
        aria-label={langDiscoverTv(lang)}
        class="section-reveal card border-base-200 bg-base-100 border shadow-sm"
      >
        <div class="card-body items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div class="space-y-1">
            <h2 class="card-title text-base">
              {langText(lang, "TV discovery", "Поиск сериалов")}
            </h2>
            <p class="text-base-content/65 text-sm leading-relaxed">
              {langText(
                lang,
                "Filter series by region, year, providers, and rating.",
                "Фильтруйте сериалы по региону, году, провайдерам и рейтингу.",
              )}
            </p>
          </div>
          <a
            href={paths.tvDiscover(lang)}
            class="btn btn-primary h-11 min-h-11 w-full rounded-full px-5 sm:w-auto"
          >
            {langDiscoverTv(lang)}
          </a>
        </div>
      </section>
      {tvSections.map((section) => (
        <MediaCarousel
          key={section.sectionId}
          sectionId={section.sectionId}
          title={section.title}
          type={MediaType.Tv}
          category={section.category}
          lang={lang}
        >
          {section.items.map((m) => (
            <div class="carousel-item" key={m.id}>
              <a
                href={paths.media(MediaType.Tv, m.id, lang)}
                class="media-card-link block"
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
      ))}
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
