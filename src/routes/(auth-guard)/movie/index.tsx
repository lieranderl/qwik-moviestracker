import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { FeaturedCarousel } from "~/components/discovery/featured-spotlight";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { FeedSectionFailure } from "~/components/feed-section-failure";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState } from "~/components/page-feedback";
import {
  createDevMovieCollections,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import type { MovieCatalog, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadMovieCollections } from "~/services/feed-loaders";
import type { FeaturedMovie, FeedFailures } from "~/services/feed-loaders";
import { formatYear } from "~/utils/format";

import { paths } from "~/utils/paths";

type MovieCollectionsData =
  | {
      status: "ready";
      lang: string;
      featuredMovies: FeaturedMovie[];
      movies: MovieShort[];
      upcomingMovies: MovieShort[];
      torMovies: MovieCatalog[];
      hdrMovies: MovieCatalog[];
      dolbyMovies: MovieCatalog[];
      failures: FeedFailures;
    }
  | {
      status: "error";
      lang: string;
    };

export const useMovieCollectionsLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const projectId =
    event.env.get("GCP_PROJECT") ?? event.env.get("GOOGLE_CLOUD_PROJECT") ?? "";
  const databaseId = event.env.get("FIRESTORE_DATABASE") ?? "moviestracker";
  const devMovieCollections = createDevMovieCollections({
    bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
    bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
    lang,
    nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
  });

  if (devMovieCollections) {
    return {
      status: "ready",
      ...devMovieCollections,
      failures: {} as FeedFailures,
    } satisfies MovieCollectionsData;
  }

  try {
    const {
      featuredMovies,
      movies,
      upcomingMovies,
      torMovies,
      hdrMovies,
      dolbyMovies,
      failures,
    } = await loadMovieCollections({ lang, projectId, databaseId });

    return {
      status: "ready",
      lang,
      featuredMovies,
      movies: movies as MovieShort[],
      upcomingMovies: upcomingMovies as MovieShort[],
      torMovies,
      hdrMovies,
      dolbyMovies,
      failures,
    } satisfies MovieCollectionsData;
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      lang,
    } satisfies MovieCollectionsData;
  }
});

export default component$(() => {
  const value = useMovieCollectionsLoader().value;
  const lang = value.lang;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={message(lang, "ui.movieCollectionsAreUnavailable")}
        description={message(lang, "ui.pleaseRefreshThePageOrTryAgainLater")}
        compact={true}
      />
    );
  }

  return (
    <div class="space-y-5">
      <div class="section-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {message(lang, "langMovies")}
        </h1>
        <div class="flex flex-wrap items-center gap-2">
          <a
            href={paths.movieDiscover(lang)}
            class="btn btn-primary btn-sm h-10 min-h-10 rounded-full"
          >
            {message(lang, "langDiscoverMovies")}
          </a>
        </div>
      </div>
      <QuickFilterStrip
        label={message(lang, "langQuickFilters")}
        items={[
          {
            active: true,
            href: "#featured-spotlight",
            label: message(lang, "langHdrDolbyFeatured"),
          },
          {
            href: "#latest-movies",
            label: message(lang, "langLatestMovies"),
          },
          {
            href: "#hdr10-movies",
            label: message(lang, "langLatestHDR10Movies"),
          },
          {
            href: "#dolby-vision-movies",
            label: message(lang, "langLatestDolbyVisionMovies"),
          },
          {
            href: "#trending-movies",
            label: message(lang, "langTrendingMovies"),
          },
          {
            href: "#upcoming-movies",
            label: message(lang, "langUpcomingMovies"),
          },
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
              message(lang, "langHdrDolbyFeatured"),
              String(formatYear(movie.release_date) || ""),
            ],
            overline: message(lang, "langHdrDolbyFeatured"),
            rating: movie.vote_average,
            title: movie.title || message(lang, "langHdrDolbyFeatured"),
          }))}
          label={message(lang, "langHdrDolbyFeatured")}
          nextLabel={message(lang, "ui.nextPage")}
          previousLabel={message(lang, "ui.previousPage")}
        />
      )}
      <FeedSectionFailure
        failure={value.failures.torMovies}
        lang={lang}
        title={message(lang, "langLatestMovies")}
      />
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
              class="media-card-link block"
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
        failure={value.failures.hdrMovies}
        lang={lang}
        title={message(lang, "langLatestHDR10Movies")}
      />
      <MediaCarousel
        sectionId="hdr10-movies"
        title={message(lang, "langLatestHDR10Movies")}
        type={MediaType.Movie}
        category="hdr10"
        lang={lang}
      >
        {value.hdrMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link block"
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
        failure={value.failures.dolbyMovies}
        lang={lang}
        title={message(lang, "langLatestDolbyVisionMovies")}
      />
      <MediaCarousel
        sectionId="dolby-vision-movies"
        title={message(lang, "langLatestDolbyVisionMovies")}
        type={MediaType.Movie}
        category="dolbyvision"
        lang={lang}
      >
        {value.dolbyMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link block"
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
              class="media-card-link block"
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
        failure={value.failures.upcomingMovies}
        lang={lang}
        title={message(lang, "langUpcomingMovies")}
      />
      <MediaCarousel
        sectionId="upcoming-movies"
        title={message(lang, "langUpcomingMovies")}
        type={MediaType.Movie}
        category="upcoming"
        lang={lang}
      >
        {value.upcomingMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link block"
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
    </div>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${message(lang, "ui.movieCollections")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "ui.browseMovieCollections"),
      },
    ],
  };
};
