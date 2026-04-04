import { component$, useVisibleTask$ } from "@builder.io/qwik";

import { DetailPageContainer } from "~/components/detail-page-layout";
import {
  MediaType,
  type ImdbRating,
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
  langExternalLinks,
  langOverview,
  langQuickActions,
  langRecommendedMovies,
  langRevenue,
  langText,
  langSwipeToBrowse,
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
  imdb: ImdbRating | null;
  certification: LocalizedCertification | null;
  watchProviders: RegionalWatchProviders | null;
  lang: string;
}

export const MovieDetails = component$(
  ({
    movie,
    recMovies,
    colMovies,
    imdb,
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

    return (
      <DetailPageContainer>
        <section class="card border-base-200 bg-base-100/95 border shadow-sm">
          <div class="card-body gap-6">
            <div class="space-y-2">
              <MediaTitle
                name={movie.title ?? ""}
                original_name={movie.original_title}
              />
              {movie.tagline && (
                <p class="text-lg italic opacity-80 md:text-xl">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            <div class="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span class="badge badge-ghost">
                {movie.release_date
                  ? formatYear(movie.release_date)
                  : langText(lang, "N/A", "Нет данных")}
              </span>
              {certification && (
                <span class="badge badge-ghost">
                  {certification.rating} • {certification.region}
                </span>
              )}
              {movie.runtime && movie.runtime > 0 && (
                <span class="badge badge-ghost">
                  {movie.runtime} {langText(lang, "min", "мин")}
                </span>
              )}
              {movie.genres?.map((g) => (
                <span key={g.id} class="badge badge-ghost">
                  {g.name}
                </span>
              ))}
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4">
              <MediaRating
                vote_average={movie.vote_average}
                vote_count={movie.vote_count}
                imdb={imdb}
              />
            </div>
          </div>
        </section>

        <section class="section-reveal card border-base-200 bg-base-100/95 relative z-20 mt-6 border shadow-sm">
          <div class="card-body gap-4">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.14em] uppercase">
                  {langQuickActions(lang)}
                </p>
                <h3 class="text-xl font-semibold">{langExternalLinks(lang)}</h3>
              </div>
              <div class="flex flex-wrap gap-3">
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
            </div>
            <ExternalIds external_ids={movie.external_ids} lang={lang} type={"movie"} />
          </div>
        </section>

        <section class="section-reveal card border-base-200 bg-base-100/95 relative z-0 mt-6 border shadow-sm">
            <div class="card-body">
              <h3 class="card-title text-xl">{langOverview(lang)}</h3>
              <p class="leading-relaxed opacity-90">
                {movie.overview || langText(lang, "No overview available.", "Описание отсутствует.")}
              </p>
            </div>
          </section>

        <div class="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div class="space-y-6">
            <MediaInfo
              release_date={movie.release_date}
              production_countries={movie.production_countries}
              production_companies={movie.production_companies}
              original_language={movie.original_language}
              lang={lang}
            />
          </div>

          {(movie.budget !== undefined && movie.budget > 0) ||
          (movie.revenue !== undefined && movie.revenue > 0) ? (
            <div class="space-y-6">
              <MediaAvailability
                certification={certification}
                watchProviders={watchProviders}
                lang={lang}
              />
              <section class="section-reveal card border-base-200 bg-base-100/95 border shadow-sm">
                <div class="card-body">
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
            </div>
          ) : (
            <MediaAvailability
              certification={certification}
              watchProviders={watchProviders}
              lang={lang}
            />
          )}
        </div>

        <div class="mt-10 space-y-10">
          <MediaCarousel
            hintLabel={langSwipeToBrowse(lang)}
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
              hintLabel={langSwipeToBrowse(lang)}
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
              hintLabel={langSwipeToBrowse(lang)}
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
              hintLabel={langSwipeToBrowse(lang)}
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
