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
import {
  getMedias,
  getRegionFromLanguage,
  getTrendingMedia,
  withImages,
} from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import {
  langCountLabel,
  langDiscoverMovies,
  langLatestDolbyVisionMovies,
  langLatestHDR10Movies,
  langLatestMovies,
  langMovies,
  langNowPlayingMovies,
  langPopularMovies,
  langQuickFilters,
  langText,
  langTrendingMovies,
  langUpcomingMovies,
  langSwipeToBrowse,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

type MovieCollectionsData =
  | {
      status: "ready";
      lang: string;
      movies: MovieShort[];
      popularMovies: MovieShort[];
      nowPlayingMovies: MovieShort[];
      upcomingMovies: MovieShort[];
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
  const region = getRegionFromLanguage(lang);

  try {
    const [
      movies,
      popularMovies,
      nowPlayingMovies,
      upcomingMovies,
      torMovies,
      hdrMovies,
      dolbyMovies,
    ] = await Promise.all([
      getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      getMedias({
        page: 1,
        query: "popular",
        language: lang,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      getMedias({
        page: 1,
        query: "now_playing",
        language: lang,
        region,
        type: MediaType.Movie,
        needbackdrop: true,
      }),
      getMedias({
        page: 1,
        query: "upcoming",
        language: lang,
        region,
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
      movies: movies as MovieShort[],
      popularMovies: popularMovies as MovieShort[],
      nowPlayingMovies: nowPlayingMovies as MovieShort[],
      upcomingMovies: upcomingMovies as MovieShort[],
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
        title={langText(
          lang,
          "Movie collections are unavailable",
          "Коллекции фильмов недоступны",
        )}
        description={langText(
          lang,
          "Please refresh the page or try again later.",
          "Обновите страницу или попробуйте позже.",
        )}
        compact={true}
      />
    );
  }

  return (
    <div class="space-y-6">
      <SectionHeading
        eyebrow={langMovies(lang)}
        title={langText(
          lang,
          "Browse movie collections",
          "Просмотр коллекций фильмов",
        )}
        description={langText(
          lang,
          `Move between local premium shelves and TMDB-powered discovery feeds without losing your language context. Now Playing and Upcoming shelves use ${getRegionFromLanguage(lang)} release windows.`,
          `Переключайтесь между локальными премиальными полками и подборками TMDB, не теряя текущий язык. Полки «Сейчас в кино» и «Скоро» используют регион ${getRegionFromLanguage(lang)} для окон релизов.`,
        )}
        badges={[
          langCountLabel(
            lang,
            value.torMovies.length,
            "latest title",
            "latest titles",
            "последний релиз",
            "последних релиза",
            "последних релизов",
          ),
          langCountLabel(
            lang,
            value.popularMovies.length,
            "popular movie",
            "popular movies",
            "популярный фильм",
            "популярных фильма",
            "популярных фильмов",
          ),
          langCountLabel(
            lang,
            value.nowPlayingMovies.length,
            "now playing title",
            "now playing titles",
            "фильм в прокате",
            "фильма в прокате",
            "фильмов в прокате",
          ),
          langCountLabel(
            lang,
            value.upcomingMovies.length,
            "upcoming title",
            "upcoming titles",
            "ожидаемый релиз",
            "ожидаемых релиза",
            "ожидаемых релизов",
          ),
          langCountLabel(
            lang,
            value.hdrMovies.length,
            "HDR10 title",
            "HDR10 titles",
            "HDR10 релиз",
            "HDR10 релиза",
            "HDR10 релизов",
          ),
          langCountLabel(
            lang,
            value.dolbyMovies.length,
            "Dolby Vision title",
            "Dolby Vision titles",
            "релиз Dolby Vision",
            "релиза Dolby Vision",
            "релизов Dolby Vision",
          ),
        ]}
      />
      <section class="alert alert-info alert-soft section-reveal">
        <span class="text-sm leading-relaxed">
          {langText(
            lang,
            "Trending reflects short weekly movement on TMDB. Popularity is a longer-lived score. Use movie discover when you need provider, certification, regional, year, and vote-count filters.",
            "Trending показывает краткосрочное недельное движение на TMDB. Popularity отражает более устойчивый интерес. Используйте поиск фильмов, когда нужны фильтры по провайдеру, сертификату, региону, году и числу голосов.",
          )}
        </span>
      </section>
      <QuickFilterStrip
        label={langQuickFilters(lang)}
        items={[
          {
            active: true,
            href: "#latest-movies",
            label: langLatestMovies(lang),
          },
          { href: "#popular-movies", label: langPopularMovies(lang) },
          { href: "#now-playing-movies", label: langNowPlayingMovies(lang) },
          { href: "#upcoming-movies", label: langUpcomingMovies(lang) },
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
      <div class="flex flex-wrap items-center gap-2">
        <a
          href={paths.movieDiscover(lang)}
          class="btn btn-primary rounded-full"
        >
          {langDiscoverMovies(lang)}
        </a>
      </div>
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
        sectionId="popular-movies"
        title={langPopularMovies(lang)}
        type={MediaType.Movie}
        category="popular"
        lang={lang}
      >
        {value.popularMovies.map((m) => (
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
        sectionId="now-playing-movies"
        title={langNowPlayingMovies(lang)}
        type={MediaType.Movie}
        category="nowplaying"
        lang={lang}
      >
        {value.nowPlayingMovies.map((m) => (
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
        sectionId="upcoming-movies"
        title={langUpcomingMovies(lang)}
        type={MediaType.Movie}
        category="upcoming"
        lang={lang}
      >
        {value.upcomingMovies.map((m) => (
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

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "Movie collections",
      "Коллекции фильмов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(
          lang,
          "Browse movie collections",
          "Просмотр коллекций фильмов",
        ),
      },
    ],
  };
};
