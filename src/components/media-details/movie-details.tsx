import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";

import { DetailPageContainer } from "~/components/detail-page-layout";
import {
  MediaType,
  type LocalizedCertification,
  type MovieFull,
  type MovieShort,
  type RegionalWatchProviders,
} from "~/services/models";
import { formatCrew, formatCurrency, formatYear } from "~/utils/format";
import {
  langActors,
  langBudget,
  langCollectionMovies,
  langCrew,
  langOverview,
  langRecommendedMovies,
  langRevenue,
  langText,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import { writeLastViewed } from "~/utils/recent-activity";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { TorrentsModal } from "../torrents-list-modal";
import { TrailersModal } from "../trailers-list-modal";
import { MediaInfo } from "./media-info";
import { MediaAvailability } from "./media-availability";
import { MediaRating } from "./media-rating";
import { MediaTitle } from "./media-title";

interface MovieDetailsProps {
  movie: MovieFull;
  recMovies: MovieShort[];
  colMovies: MovieShort[];
  imdbId?: string | null;
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
  lang: string;
}

const sectionCardClass =
  "card border-base-200 bg-base-100/95 border shadow-sm";
const sectionBodyClass = "card-body gap-4 p-4 md:p-6";

export const MovieDetails = component$(
  ({
    movie,
    recMovies,
    colMovies,
    imdbId,
    certification,
    watchProviders,
    lang,
  }: MovieDetailsProps) => {
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      writeLastViewed({
        href: paths.media(MediaType.Movie, movie.id, lang),
        title: movie.title ?? langText(lang, "Movie details", "Детали фильма"),
        kind: "movie",
        meta: movie.release_date
          ? `${formatYear(movie.release_date)} • ${langText(lang, "Movie", "Фильм")}`
          : langText(lang, "Movie", "Фильм"),
        imagePath: movie.poster_path ?? movie.backdrop_path,
      });
    });

    const hasBoxOffice =
      (movie.budget !== undefined && movie.budget > 0) ||
      (movie.revenue !== undefined && movie.revenue > 0);

    const hasActions =
      (movie.videos && movie.videos.results.length > 0) || true; // torrents always available

    return (
      <DetailPageContainer>
        {/* ── HERO: Poster + Title + Metadata + Rating + Actions ── */}
        <section class={`${sectionCardClass} sm:card-side`}>
          <figure class="mx-auto w-48 shrink-0 p-4 pb-0 sm:mx-0 sm:w-56 sm:p-6 sm:pr-0 lg:w-64">
            {movie.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                width={342}
                height={513}
                alt={movie.title ?? langText(lang, "Movie poster", "Постер фильма")}
                class="rounded-box h-auto w-full shadow-lg"
              />
            ) : (
              <div class="bg-base-200 rounded-box flex aspect-2/3 w-full items-center justify-center">
                <span class="text-base-content/20 text-5xl select-none" aria-hidden="true">
                  🎬
                </span>
              </div>
            )}
          </figure>
          <div class={`${sectionBodyClass} min-w-0 flex-1`}>
            <MediaTitle
              name={movie.title ?? ""}
              original_name={movie.original_title}
            />

            {movie.tagline && (
              <p class="text-base-content/70 -mt-1 italic md:text-lg">
                {lang === "en-US" ? `"${movie.tagline}"` : movie.tagline}
              </p>
            )}

            {/* Metadata badges */}
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="badge badge-ghost badge-sm">
                {movie.release_date
                  ? formatYear(movie.release_date)
                  : langText(lang, "N/A", "Нет данных")}
              </span>
              {certification && (
                <span class="badge badge-ghost badge-sm">
                  {certification.rating}
                </span>
              )}
              {movie.runtime && movie.runtime > 0 && (
                <span class="badge badge-ghost badge-sm">
                  {movie.runtime} {langText(lang, "min", "мин")}
                </span>
              )}
              {movie.genres?.map((g) => (
                <span key={g.id} class="badge badge-ghost badge-sm">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Rating */}
            <MediaRating
              vote_average={movie.vote_average}
              vote_count={movie.vote_count}
              imdbId={imdbId}
            />

            {/* Primary actions */}
            {hasActions && (
              <div class="card-actions mt-1">
                {movie.videos && movie.videos.results.length > 0 && (
                  <TrailersModal videos={movie.videos.results} />
                )}
                <TorrentsModal
                  title={movie.title ?? ""}
                  year={formatYear(movie.release_date)}
                  isMovie={true}
                  seasons={[]}
                  media={movie}
                  lang={lang}
                />
              </div>
            )}
          </div>
        </section>

        <div class="divider" />

        {/* ── OVERVIEW ── */}
        <section class={sectionCardClass}>
          <div class={sectionBodyClass}>
            <h2 class="card-title text-xl">{langOverview(lang)}</h2>
            {movie.overview ? (
              <p class="leading-relaxed opacity-90">{movie.overview}</p>
            ) : (
              <p class="text-base-content/50 italic">
                {langText(
                  lang,
                  "No overview available.",
                  "Описание отсутствует.",
                )}
              </p>
            )}
          </div>
        </section>

        <div class="divider" />

        {/* ── DETAILS: Production + Availability side-by-side on desktop ── */}
        <div class="grid gap-6 md:grid-cols-2">
          <MediaInfo
            release_date={movie.release_date}
            production_countries={movie.production_countries}
            production_companies={movie.production_companies}
            original_language={movie.original_language}
            lang={lang}
          />
          <MediaAvailability
            certification={certification}
            watchProviders={watchProviders}
            lang={lang}
          />
        </div>

        {/* ── BOX OFFICE (conditional) ── */}
        {hasBoxOffice && (
          <section class={sectionCardClass}>
            <div class={sectionBodyClass}>
              <h3 class="card-title text-base-content/80 text-lg">
                {langText(lang, "Box Office", "Кассовые сборы")}
              </h3>
              <div class="stats stats-vertical bg-transparent">
                {movie.budget !== undefined && movie.budget > 0 && (
                  <div class="stat px-0 py-3">
                    <div class="stat-title">{langBudget(lang)}</div>
                    <div class="stat-value text-lg">
                      {formatCurrency(movie.budget, lang)}
                    </div>
                  </div>
                )}
                {movie.revenue !== undefined && movie.revenue > 0 && (
                  <div class="stat px-0 py-3">
                    <div class="stat-title">{langRevenue(lang)}</div>
                    <div class="stat-value text-lg">
                      {formatCurrency(movie.revenue, lang)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div class="divider" />

        {/* ── EXTERNAL LINKS ── */}
        <ExternalIds
          external_ids={movie.external_ids}
          lang={lang}
          type={"movie"}
        />

        <div class="divider" />

        {/* ── CAST / CREW / COLLECTION / RECOMMENDED ── */}
        <div class="space-y-6">
          <MediaCarousel
            title={langActors(lang)}
            type={MediaType.Person}
            lang={lang}
          >
            {movie.credits?.cast.slice(0, 10).map((c) => (
              <div class="carousel-item" key={c.id}>
                <a
                  href={paths.media(MediaType.Person, c.id, lang)}
                  class="media-card-link"
                >
                  <MediaCard
                    title={c.name ? c.name : ""}
                    width={300}
                    year={0}
                    rating={0}
                    picfile={c.profile_path}
                    variant="person"
                    metaLabel={c.character}
                  />
                </a>
              </div>
            ))}
          </MediaCarousel>

          {movie.credits !== undefined && movie.credits.crew.length > 0 && (
            <MediaCarousel
              title={langCrew(lang)}
              type={MediaType.Person}
              lang={lang}
            >
              {formatCrew(movie.credits.crew)
                .slice(0, 10)
                .map((c) => (
                  <div class="carousel-item" key={c.id}>
                    <a
                      href={paths.media(MediaType.Person, c.id, lang)}
                      class="media-card-link"
                    >
                      <MediaCard
                        title={c.name ?? ""}
                        width={300}
                        year={0}
                        rating={0}
                        picfile={c.profile_path}
                        variant="person"
                        metaLabel={c.job}
                      />
                    </a>
                  </div>
                ))}
            </MediaCarousel>
          )}

          {colMovies.length > 0 && (
            <MediaCarousel
              title={langCollectionMovies(lang)}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {colMovies.map((m) => (
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
          )}

          {recMovies.length > 0 && (
            <MediaCarousel
              title={langRecommendedMovies(lang)}
              type={MediaType.Person}
              category="updated"
              lang={lang}
            >
              {recMovies.map((m) => (
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
          )}
        </div>
      </DetailPageContainer>
    );
  },
);
