import { component$ } from "@builder.io/qwik";

import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { FeedSectionFailure } from "~/components/feed-section-failure";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { SectionHeading } from "~/components/page-feedback";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadTvCollections } from "~/services/feed-loaders";
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
    const {
      tvtrend,
      tvtoprated,
      tvpopular,
      tvairingtoday,
      tvontheair,
      failures,
    } = await loadTvCollections({ lang });

    return {
      tvtrend: tvtrend as TvShort[],
      tvtoprated: tvtoprated as TvShort[],
      tvpopular: tvpopular as TvShort[],
      tvairingtoday: tvairingtoday as TvShort[],
      tvontheair: tvontheair as TvShort[],
      failures,
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
      failure: value.failures.tvtrend,
    },
    {
      category: "popular",
      items: value.tvpopular,
      sectionId: "popular-tv",
      title: langPopularTvShows(lang),
      failure: value.failures.tvpopular,
    },
    {
      category: "toprated",
      items: value.tvtoprated,
      sectionId: "top-rated-tv",
      title: langTopRatedTvShows(lang),
      failure: value.failures.tvtoprated,
    },
    {
      category: "airingtoday",
      items: value.tvairingtoday,
      sectionId: "airing-today-tv",
      title: langAiringTodayTvShows(lang),
      failure: value.failures.tvairingtoday,
    },
    {
      category: "ontheair",
      items: value.tvontheair,
      sectionId: "on-the-air-tv",
      title: langOnTheAirTvShows(lang),
      failure: value.failures.tvontheair,
    },
  ];

  return (
    <div class="space-y-8">
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
            class="btn btn-primary btn-sm w-full rounded-full sm:w-auto"
          >
            {langDiscoverTv(lang)}
          </a>
        </div>
      </section>
      {tvSections.map((section) => (
        <div class="contents" key={section.sectionId}>
          <FeedSectionFailure
            failure={section.failure}
            lang={lang}
            title={section.title}
          />
          <MediaCarousel
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
        </div>
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
