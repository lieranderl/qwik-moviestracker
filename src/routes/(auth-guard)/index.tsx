import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { ContinueBrowsingWidget } from "~/components/discovery/continue-browsing";
import { FeaturedSpotlight } from "~/components/discovery/featured-spotlight";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState, SectionHeading } from "~/components/page-feedback";
import {
  createDevHomeFeed,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type {
  MediaShort,
  MovieMongo,
  MovieShort,
  TvShort,
} from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import {
  langHome,
  langLatestMovies,
  langContinueBrowsing,
  langDiscoverMovies,
  langDiscoverTv,
  langFeaturedSpotlight,
  langFeaturedSpotlightDescription,
  langHomeDashboardDescription,
  langHomeDashboardTitle,
  langHomeFeedUnavailable,
  langJumpBackIn,
  langOpenDetails,
  langQuickFilters,
  langRecentSearches,
  langResume,
  langStartExploring,
  langTrendingMovies,
  langTrendingMoviesCount,
  langTrengingTVShows,
  langTrendingSeriesCount,
  langSwipeToBrowse,
  langPleaseRefreshOrTryAgain,
  langLatestItemsCount,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

type HomeFeedData =
  | {
      status: "ready";
      lang: string;
      movies: MovieShort[];
      tv: TvShort[];
      torMovies: MovieMongo[];
    }
  | {
      status: "error";
      lang: string;
    };

export const useHomeFeedLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const envMongoUrl = event.env.get("MONGO_URI") ?? "";

  const devHomeFeed = createDevHomeFeed({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devHomeFeed) {
    return {
      status: "ready",
      ...devHomeFeed,
    } satisfies HomeFeedData;
  }

  try {
    const [m, t, tm] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
        needbackdrop: true,
      }),
      withImages(
        (await getMoviesMongo({
          entries_on_page: MEDIA_PAGE_SIZE,
          language: lang,
          dbName: DbType.LastMovies,
          page: 1,
          env: envMongoUrl,
        })) as MediaShort[],
        lang,
      ),
    ]);

    return {
      status: "ready",
      lang,
      movies: m as MovieShort[],
      tv: t as TvShort[],
      torMovies: tm as MovieMongo[],
    } satisfies HomeFeedData;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      lang,
    } satisfies HomeFeedData;
  }
});

export default component$(() => {
  const value = useHomeFeedLoader().value;
  const lang = value.lang;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={langHomeFeedUnavailable(lang)}
        description={langPleaseRefreshOrTryAgain(lang)}
        compact={true}
      />
    );
  }

  const featuredMovie =
    value.movies[(new Date().getDate() - 1) % value.movies.length];
  const homeBadges = [
    langLatestItemsCount(lang, value.torMovies.length),
    langTrendingMoviesCount(lang, value.movies.length),
    langTrendingSeriesCount(lang, value.tv.length),
  ];

  return (
    <div class="space-y-6">
      <SectionHeading
        eyebrow={langHome(lang)}
        title={langHomeDashboardTitle(lang)}
        description={langHomeDashboardDescription(lang)}
        badges={homeBadges}
      />
      <QuickFilterStrip
        label={langQuickFilters(lang)}
        items={[
          {
            active: true,
            href: "#featured-spotlight",
            label: langFeaturedSpotlight(lang),
          },
          {
            href: "#continue-browsing",
            label: langContinueBrowsing(lang),
          },
          { href: "#latest-movies", label: langLatestMovies(lang) },
          { href: "#trending-movies", label: langTrendingMovies(lang) },
          { href: "#trending-tv", label: langTrengingTVShows(lang) },
        ]}
      />
      <div class="flex flex-wrap items-center gap-2">
        <a
          href={paths.movieDiscover(lang)}
          class="btn btn-primary rounded-full"
        >
          {langDiscoverMovies(lang)}
        </a>
        <a href={paths.tvDiscover(lang)} class="btn btn-outline rounded-full">
          {langDiscoverTv(lang)}
        </a>
      </div>
      {value.movies.length > 0 && featuredMovie && (
        <FeaturedSpotlight
          ctaLabel={langOpenDetails(lang)}
          description={
            featuredMovie.overview ||
            langFeaturedSpotlightDescription(lang)
          }
          href={paths.media(MediaType.Movie, featuredMovie.id, lang)}
          imagePath={featuredMovie.backdrop_path}
          meta={[
            langTrendingMovies(lang),
            String(formatYear(featuredMovie.release_date) || "2026"),
          ]}
          overline={langFeaturedSpotlight(lang)}
          rating={featuredMovie.vote_average}
          title={featuredMovie.title || "Featured release"}
        />
      )}
      <ContinueBrowsingWidget
        emptyDescription={langStartExploring(lang)}
        label={langContinueBrowsing(lang)}
        lastViewedLabel={langJumpBackIn(lang)}
        recentSearchesLabel={langRecentSearches(lang)}
        resumeLabel={langResume(lang)}
      />
      <MediaCarousel
        hintLabel={langSwipeToBrowse(lang)}
        sectionId="latest-movies"
        title={langLatestMovies(lang)}
        type={MediaType.Movie}
        category="updated"
        lang={lang}
      >
        {value.torMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link"
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.release_date)}
                picfile={m.backdrop_path}
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(lang)}
        sectionId="trending-movies"
        title={langTrendingMovies(lang)}
        type={MediaType.Movie}
        category="trending"
        lang={lang}
      >
        {value.movies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link"
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
                year={formatYear(m.release_date)}
                picfile={m.backdrop_path}
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <MediaCarousel
        hintLabel={langSwipeToBrowse(lang)}
        sectionId="trending-tv"
        title={langTrengingTVShows(lang)}
        type={MediaType.Tv}
        category="trending"
        lang={lang}
      >
        {value.tv.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Tv, m.id, lang)}
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
    title: `Moviestracker | ${langHomeDashboardTitle(lang)}`,
    meta: [
      {
        name: "description",
        content: langHomeDashboardDescription(lang),
      },
    ],
  };
};
