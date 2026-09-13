import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";

import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { FeaturedCarousel } from "~/components/discovery/featured-spotlight";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { FeedSectionFailure } from "~/components/feed-section-failure";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
  createDevTvCollections,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadTvCollections } from "~/services/feed-loaders";
import type { FeedFailures } from "~/services/feed-loaders";
import { formatYear } from "~/utils/format";

import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const devTvCollections = createDevTvCollections({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devTvCollections) {
    return {
      ...devTvCollections,
      failures: {} as FeedFailures,
    };
  }

  try {
    const { featuredTv, tvtrend, tvtoprated, tvpopular, tvontheair, failures } =
      await loadTvCollections({ lang });

    return {
      featuredTv,
      tvtrend: tvtrend as TvShort[],
      tvtoprated: tvtoprated as TvShort[],
      tvpopular: tvpopular as TvShort[],
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
      href: "#featured-spotlight",
      label: message(lang, "langFeaturedSpotlight"),
    },
    {
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
      category: "ontheair",
      items: value.tvontheair,
      sectionId: "on-the-air-tv",
      title: message(lang, "langOnTheAirTvShows"),
      failure: value.failures.tvontheair,
    },
  ];

  return (
    <div class="space-y-5">
      <div class="section-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {message(lang, "langSeries")}
        </h1>
        <div class="flex flex-wrap items-center gap-2">
          <a
            href={paths.tvDiscover(lang)}
            class="btn btn-primary btn-sm h-10 min-h-10 rounded-full"
          >
            {message(lang, "langDiscoverTv")}
          </a>
        </div>
      </div>
      <QuickFilterStrip
        label={message(lang, "langQuickFilters")}
        items={quickFilterItems}
      />
      {value.featuredTv.length > 0 && (
        <FeaturedCarousel
          ctaLabel={message(lang, "langOpenDetails")}
          items={value.featuredTv.map(({ artwork, tv }) => ({
            description: tv.overview,
            href: paths.media(MediaType.Tv, tv.id, lang),
            imagePath: artwork.backdropPath,
            logoPath: artwork.logoPath,
            meta: [
              message(lang, "langTrengingTVShows"),
              String(formatYear(tv.first_air_date) || ""),
            ],
            overline: message(lang, "langTrengingTVShows"),
            rating: tv.vote_average,
            title: tv.name || message(lang, "langTrengingTVShows"),
          }))}
          label={message(lang, "langTrengingTVShows")}
          nextLabel={message(lang, "ui.nextPage")}
          previousLabel={message(lang, "ui.previousPage")}
        />
      )}
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
                    rating={m.vote_average}
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
