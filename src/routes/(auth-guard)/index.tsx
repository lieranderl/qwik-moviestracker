import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { ContinueBrowsingWidget } from "~/components/discovery/continue-browsing";
import { FeaturedSpotlight } from "~/components/discovery/featured-spotlight";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState } from "~/components/page-feedback";
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
  langTrendingMovies,
  langTrengingTVShows,
  langPleaseRefreshOrTryAgain,
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
  return (
    <div class="space-y-5">
      <div class="section-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {langHomeDashboardTitle(lang)}
        </h1>
        <div class="flex flex-wrap items-center gap-2">
          <a
            href={paths.movieDiscover(lang)}
            class="btn btn-primary btn-sm h-10 min-h-10 rounded-full"
          >
            {langDiscoverMovies(lang)}
          </a>
          <a
            href={paths.tvDiscover(lang)}
            class="btn btn-outline btn-sm h-10 min-h-10 rounded-full"
          >
            {langDiscoverTv(lang)}
          </a>
        </div>
      </div>
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
      {value.movies.length > 0 && featuredMovie && (
        <FeaturedSpotlight
          ctaLabel={langOpenDetails(lang)}
          description={
            featuredMovie.overview || langFeaturedSpotlightDescription(lang)
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
        lang={lang}
        lastViewedLabel={langJumpBackIn(lang)}
        recentSearchesLabel={langRecentSearches(lang)}
        resumeLabel={langResume(lang)}
      />
      <MediaCarousel
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
