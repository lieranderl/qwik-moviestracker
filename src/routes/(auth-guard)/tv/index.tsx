import { message } from "~/utils/i18n";
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
      label: message(lang, "langTrengingTVShows"),
    },
    {
      href: "#popular-tv",
      label: message(lang, "langPopularTvShows"),
    },
    {
      href: "#top-rated-tv",
      label: message(lang, "langTopRatedTvShows"),
    },
    {
      href: "#airing-today-tv",
      label: message(lang, "langAiringTodayTvShows"),
    },
    {
      href: "#on-the-air-tv",
      label: message(lang, "langOnTheAirTvShows"),
    },
  ];
  const tvSections = [
    {
      category: "trending",
      items: value.tvtrend,
      sectionId: "trending-tv",
      title: message(lang, "langTrengingTVShows"),
      failure: value.failures.tvtrend,
    },
    {
      category: "popular",
      items: value.tvpopular,
      sectionId: "popular-tv",
      title: message(lang, "langPopularTvShows"),
      failure: value.failures.tvpopular,
    },
    {
      category: "toprated",
      items: value.tvtoprated,
      sectionId: "top-rated-tv",
      title: message(lang, "langTopRatedTvShows"),
      failure: value.failures.tvtoprated,
    },
    {
      category: "airingtoday",
      items: value.tvairingtoday,
      sectionId: "airing-today-tv",
      title: message(lang, "langAiringTodayTvShows"),
      failure: value.failures.tvairingtoday,
    },
    {
      category: "ontheair",
      items: value.tvontheair,
      sectionId: "on-the-air-tv",
      title: message(lang, "langOnTheAirTvShows"),
      failure: value.failures.tvontheair,
    },
  ];

  return (
    <div class="space-y-8">
      <SectionHeading
        eyebrow={message(lang, "ui.tvCollections")}
        title={message(lang, "ui.series2")}
        description={message(
          lang,
          "ui.browseTrendingPopularTopRatedAiringTodayAndOnTheAirSeriesCollections",
        )}
      />
      <QuickFilterStrip
        label={message(lang, "langQuickFilters")}
        items={quickFilterItems}
      />
      <section
        aria-label={message(lang, "langDiscoverTv")}
        class="section-reveal card border-base-200 bg-base-100 border shadow-sm"
      >
        <div class="card-body items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div class="space-y-1">
            <h2 class="card-title text-base">
              {message(lang, "ui.tvDiscovery")}
            </h2>
            <p class="text-base-content/65 text-sm leading-relaxed">
              {message(lang, "ui.filterSeriesByRegionYearProvidersAndRating")}
            </p>
          </div>
          <a
            href={paths.tvDiscover(lang)}
            class="btn btn-primary btn-sm w-full rounded-full sm:w-auto"
          >
            {message(lang, "langDiscoverTv")}
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
                    tmdbId={m.id}
                    mediaType={MediaType.Tv}
                    language={lang}
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
    title: `Moviestracker | ${message(lang, "ui.tvCollections")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "ui.browseTvCollections"),
      },
    ],
  };
};
