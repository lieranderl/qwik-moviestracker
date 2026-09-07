import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { FeedSectionFailure } from "~/components/feed-section-failure";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState, SectionHeading } from "~/components/page-feedback";
import type { MovieCatalog, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { loadMovieCollections } from "~/services/feed-loaders";
import type { FeedFailures } from "~/services/feed-loaders";
import { formatYear } from "~/utils/format";

import { paths } from "~/utils/paths";

type MovieCollectionsData =
  | {
      status: "ready";
      lang: string;
      movies: MovieShort[];
      popularMovies: MovieShort[];
      nowPlayingMovies: MovieShort[];
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
  try {
    const {
      movies,
      popularMovies,
      nowPlayingMovies,
      upcomingMovies,
      torMovies,
      hdrMovies,
      dolbyMovies,
      failures,
    } = await loadMovieCollections({ lang, projectId, databaseId });

    return {
      status: "ready",
      lang,
      movies: movies as MovieShort[],
      popularMovies: popularMovies as MovieShort[],
      nowPlayingMovies: nowPlayingMovies as MovieShort[],
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
    <div class="space-y-8">
      <SectionHeading
        eyebrow={message(lang, "ui.movieCollections")}
        title={message(lang, "langMovies")}
        description={message(
          lang,
          "ui.browseLatestPopularNowPlayingUpcomingHdr10DolbyVisionAndTrendingMovieCol",
        )}
      />
      <QuickFilterStrip
        label={message(lang, "langQuickFilters")}
        items={[
          {
            active: true,
            href: "#latest-movies",
            label: message(lang, "langLatestMovies"),
          },
          {
            href: "#popular-movies",
            label: message(lang, "langPopularMovies"),
          },
          {
            href: "#now-playing-movies",
            label: message(lang, "langNowPlayingMovies"),
          },
          {
            href: "#upcoming-movies",
            label: message(lang, "langUpcomingMovies"),
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
        ]}
      />
      <section
        aria-label={message(lang, "langDiscoverMovies")}
        class="section-reveal card border-base-200 bg-base-100 border shadow-sm"
      >
        <div class="card-body items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div class="space-y-1">
            <h2 class="card-title text-base">
              {message(lang, "ui.movieDiscovery")}
            </h2>
            <p class="text-base-content/65 text-sm leading-relaxed">
              {message(lang, "ui.filterMoviesByRegionYearProvidersAndRating")}
            </p>
          </div>
          <a
            href={paths.movieDiscover(lang)}
            class="btn btn-primary btn-sm w-full rounded-full sm:w-auto"
          >
            {message(lang, "langDiscoverMovies")}
          </a>
        </div>
      </section>
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
                rating={m.vote_average ? m.vote_average : 0}
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
        failure={value.failures.popularMovies}
        lang={lang}
        title={message(lang, "langPopularMovies")}
      />
      <MediaCarousel
        sectionId="popular-movies"
        title={message(lang, "langPopularMovies")}
        type={MediaType.Movie}
        category="popular"
        lang={lang}
      >
        {value.popularMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link block"
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
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
        failure={value.failures.nowPlayingMovies}
        lang={lang}
        title={message(lang, "langNowPlayingMovies")}
      />
      <MediaCarousel
        sectionId="now-playing-movies"
        title={message(lang, "langNowPlayingMovies")}
        type={MediaType.Movie}
        category="nowplaying"
        lang={lang}
      >
        {value.nowPlayingMovies.map((m) => (
          <div class="carousel-item" key={m.id}>
            <a
              href={paths.media(MediaType.Movie, m.id, lang)}
              class="media-card-link block"
            >
              <MediaCard
                title={m.title ? m.title : ""}
                width={500}
                rating={m.vote_average ? m.vote_average : 0}
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
                rating={m.vote_average ? m.vote_average : 0}
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
                rating={m.vote_average ? m.vote_average : 0}
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
                rating={m.vote_average ? m.vote_average : 0}
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
                rating={m.vote_average ? m.vote_average : 0}
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
