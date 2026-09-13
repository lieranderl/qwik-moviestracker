import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { FeaturedCarousel } from "~/components/discovery/featured-spotlight";
import { FeedSectionFailure } from "~/components/feed-section-failure";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState } from "~/components/page-feedback";
import {
  createDevHomeFeed,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type { MovieCatalog, MovieShort, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadHomeFeed } from "~/services/feed-loaders";
import type { FeaturedMovie, FeedFailures } from "~/services/feed-loaders";
import { formatYear } from "~/utils/format";

import { paths } from "~/utils/paths";

type HomeFeedData =
  | {
      status: "ready";
      lang: string;
      movies: MovieShort[];
      tv: TvShort[];
      torMovies: MovieCatalog[];
      featuredMovies: FeaturedMovie[];
      failures: FeedFailures;
    }
  | {
      status: "error";
      lang: string;
    };

export const useHomeFeedLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const projectId =
    event.env.get("GCP_PROJECT") ?? event.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
  const databaseId = event.env.get("FIRESTORE_DATABASE") ?? "moviestracker";

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
      featuredMovies: devHomeFeed.movies.map((movie) => ({
        artwork: {
          backdropPath: movie.backdrop_path ?? null,
          logoPath: null,
          posterPath: movie.poster_path ?? null,
        },
        movie,
      })),
      failures: {} as FeedFailures,
    } satisfies HomeFeedData;
  }

  try {
    const { featuredMovies, movies, tv, torMovies, failures } =
      await loadHomeFeed({
        lang,
        projectId,
        databaseId,
      });

    return {
      status: "ready",
      lang,
      movies,
      tv,
      torMovies,
      featuredMovies,
      failures,
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
        title={message(lang, "langHomeFeedUnavailable")}
        description={message(lang, "langPleaseRefreshOrTryAgain")}
        compact={true}
      />
    );
  }

  return (
    <div class="space-y-5">
      <div class="section-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {message(lang, "langHomeDashboardTitle")}
        </h1>
        <div class="flex flex-wrap items-center gap-2">
          <a
            href={paths.movieDiscover(lang)}
            class="btn btn-primary btn-sm h-10 min-h-10 rounded-full"
          >
            {message(lang, "langDiscoverMovies")}
          </a>
          <a
            href={paths.tvDiscover(lang)}
            class="btn btn-outline btn-sm h-10 min-h-10 rounded-full"
          >
            {message(lang, "langDiscoverTv")}
          </a>
        </div>
      </div>
      <QuickFilterStrip
        label={message(lang, "langQuickFilters")}
        items={[
          {
            active: true,
            href: "#featured-spotlight",
            label: message(lang, "langFeaturedSpotlight"),
          },
          { href: "#latest-movies", label: message(lang, "langLatestMovies") },
          {
            href: "#trending-movies",
            label: message(lang, "langTrendingMovies"),
          },
          { href: "#trending-tv", label: message(lang, "langTrengingTVShows") },
        ]}
      />
      {value.featuredMovies.length > 0 && (
        <FeaturedCarousel
          ctaLabel={message(lang, "langOpenDetails")}
          items={value.featuredMovies.map(({ artwork, movie }) => ({
            description: movie.overview,
            href: paths.media(MediaType.Movie, movie.id, lang),
            imagePath: artwork.backdropPath,
            logoPath: artwork.logoPath,
            meta: [
              message(lang, "langTrendingMovies"),
              String(formatYear(movie.release_date) || ""),
            ],
            overline: message(lang, "langFeaturedSpotlight"),
            rating: movie.vote_average,
            title: movie.title || "Featured release",
          }))}
          label={message(lang, "langFeaturedSpotlight")}
          nextLabel={message(lang, "ui.nextPage")}
          previousLabel={message(lang, "ui.previousPage")}
        />
      )}
      <MediaCarousel
        sectionId="latest-movies"
        title={message(lang, "langLatestMovies")}
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
                rating={m.vote_average}
                year={formatYear(m.release_date)}
                picfile={m.backdrop_path}
                tmdbId={m.id}
                mediaType={MediaType.Movie}
                language={lang}
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <FeedSectionFailure
        failure={value.failures.torMovies}
        lang={lang}
        title={message(lang, "langLatestMovies")}
      />
      <MediaCarousel
        sectionId="trending-movies"
        title={message(lang, "langTrendingMovies")}
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
                rating={m.vote_average}
                year={formatYear(m.release_date)}
                picfile={m.backdrop_path}
                tmdbId={m.id}
                mediaType={MediaType.Movie}
                language={lang}
                variant="landscape"
              />
            </a>
          </div>
        ))}
      </MediaCarousel>
      <FeedSectionFailure
        failure={value.failures.movies}
        lang={lang}
        title={message(lang, "langTrendingMovies")}
      />
      <MediaCarousel
        sectionId="trending-tv"
        title={message(lang, "langTrengingTVShows")}
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
      <FeedSectionFailure
        failure={value.failures.tv}
        lang={lang}
        title={message(lang, "langTrengingTVShows")}
      />
    </div>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${message(lang, "langHomeDashboardTitle")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "langHomeDashboardDescription"),
      },
    ],
  };
};
