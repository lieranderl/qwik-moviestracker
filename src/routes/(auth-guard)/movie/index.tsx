import { component$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import { ErrorState, SectionHeading } from "~/components/page-feedback";
import type { MediaShort, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import {
  langLatestDolbyVisionMovies,
  langLatestHDR10Movies,
  langLatestMovies,
  langQuickFilters,
  langTrendingMovies,
  langSwipeToBrowse,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

type MovieCollectionsData =
  | {
      status: "ready";
      lang: string;
      movies: MovieShort[];
      torMovies: MediaShort[];
      hdrMovies: MediaShort[];
      dolbyMovies: MediaShort[];
    }
  | {
      status: "error";
      lang: string;
    };

export const useMovieCollectionsLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const envMongoUrl = event.env.get("MONGO_URI") ?? "";

  try {
    const [m, torMovies, hdrMovies, dolbyMovies] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      withImages(
        (await getMoviesMongo({
          page: 1,
          entries_on_page: MEDIA_PAGE_SIZE,
          language: lang,
          dbName: DbType.LastMovies,
          env: envMongoUrl,
        })) as MediaShort[],
        lang,
      ),
      withImages(
        (await getMoviesMongo({
          page: 1,
          entries_on_page: MEDIA_PAGE_SIZE,
          language: lang,
          dbName: DbType.HDR10,
          env: envMongoUrl,
        })) as MediaShort[],
        lang,
      ),
      withImages(
        (await getMoviesMongo({
          page: 1,
          entries_on_page: MEDIA_PAGE_SIZE,
          language: lang,
          dbName: DbType.DV,
          env: envMongoUrl,
        })) as MediaShort[],
        lang,
      ),
    ]);

    return {
      status: "ready",
      lang,
      movies: m as MovieShort[],
      torMovies,
      hdrMovies,
      dolbyMovies,
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
        title="Movie collections are unavailable"
        description="Please refresh the page or try again later."
        compact={true}
      />
    );
  }

  return (
    <div class="space-y-6">
      <SectionHeading
        eyebrow="Movies"
        title="Browse movie collections"
        description="Move between the freshest catalog drops, HDR and Dolby Vision shelves, and the broader trending movie feed from one place."
        badges={[
          `${value.torMovies.length} latest`,
          `${value.hdrMovies.length} HDR10`,
          `${value.dolbyMovies.length} Dolby Vision`,
        ]}
      />
      <QuickFilterStrip
        label={langQuickFilters(lang)}
        items={[
          {
            active: true,
            href: "#latest-movies",
            label: langLatestMovies(lang),
          },
          { href: "#hdr10-movies", label: langLatestHDR10Movies(lang) },
          {
            href: "#dolby-vision-movies",
            label: langLatestDolbyVisionMovies(lang),
          },
          {
            href: "#trending-movies",
            label: langTrendingMovies(lang),
          },
        ]}
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
        sectionId="hdr10-movies"
        title={langLatestHDR10Movies(lang)}
        type={MediaType.Movie}
        category="hdr10"
        lang={lang}
      >
        {value.hdrMovies.map((m) => (
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
        sectionId="dolby-vision-movies"
        title={langLatestDolbyVisionMovies(lang)}
        type={MediaType.Movie}
        category="dolbyvision"
        lang={lang}
      >
        {value.dolbyMovies.map((m) => (
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
    </div>
  );
});

export const head: DocumentHead = {
  title: "Moviestracker",
  meta: [
    {
      name: "description",
      content: "Movies Collections",
    },
  ],
};
