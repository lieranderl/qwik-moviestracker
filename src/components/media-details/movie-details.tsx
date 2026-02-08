import { component$ } from "@builder.io/qwik";

import { MediaType, type MovieFull, type MovieShort } from "~/services/models";
import { formatCrew, formatCurrency, formatYear } from "~/utils/fomat";
import {
  langActors,
  langBudget,
  langCollectionMovies,
  langCrew,
  langOverview,
  langRecommendedMovies,
  langRevenue,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { TorrentsModal } from "../torrents-list-modal";
import { TrailersModal } from "../trailers-list-modal";
import { MediaInfo } from "./media-info";

import { MediaRating } from "./media-rating";
import { MediaTitle } from "./media-title";

interface MovieDetailsProps {
  movie: MovieFull;
  recMovies: MovieShort[];
  colMovies: MovieShort[];
  lang: string;
}

export const MovieDetails = component$(
  ({ movie, recMovies, colMovies, lang }: MovieDetailsProps) => {
    return (
      <div class="container mx-auto min-h-screen max-w-7xl px-2 pt-[18vh] pb-8 md:px-4">
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
                {movie.release_date ? formatYear(movie.release_date) : "N/A"}
              </span>
              {movie.runtime && movie.runtime > 0 && (
                <span class="badge badge-ghost">{movie.runtime} min</span>
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
                imdb_id={movie.imdb_id}
              />
              <div class="flex flex-wrap gap-3">
                {movie.videos && movie.videos.results.length > 0 && (
                  <TrailersModal videos={movie.videos.results} />
                )}
                <TorrentsModal
                  title={movie.title ?? ""}
                  year={formatYear(movie.release_date ?? "0")}
                  isMovie={true}
                  seasons={[]}
                  media={movie}
                  lang={lang}
                />
              </div>
            </div>

            <ExternalIds external_ids={movie.external_ids} type={"movie"} />
          </div>
        </section>

        <section class="card border-base-200 bg-base-100/95 mt-6 border shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-xl">{langOverview(lang)}</h3>
            <p class="leading-relaxed opacity-90">
              {movie.overview || "No overview available."}
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
            <section class="card border-base-200 bg-base-100/95 border shadow-sm">
              <div class="card-body">
                <h3 class="card-title text-base-content/80 text-lg">
                  Box Office
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
          ) : null}
        </div>

        <div class="mt-10 space-y-10">
          <MediaCarousel
            title={langActors(lang)}
            type={MediaType.Person}
            lang={lang}
          >
            {movie.credits?.cast.slice(0, 10).map((c) => (
              <div class="carousel-item" key={c.id}>
                <a href={paths.media(MediaType.Person, c.id, lang)}>
                  <MediaCard
                    title={c.name ? c.name : ""}
                    width={300}
                    year={0}
                    rating={0}
                    picfile={c.profile_path}
                    isPerson={true}
                    isHorizontal={false}
                    charName={c.character}
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
                    <a href={paths.media(MediaType.Person, c.id, lang)}>
                      <MediaCard
                        title={c.name ?? ""}
                        width={300}
                        year={0}
                        rating={0}
                        picfile={c.profile_path}
                        isPerson={true}
                        isHorizontal={false}
                        charName={c.job}
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
                  <a href={paths.media(MediaType.Movie, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={(m.release_date && formatYear(m.release_date)) || 0}
                      picfile={m.backdrop_path}
                      isPerson={false}
                      isHorizontal={true}
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
                  <a href={paths.media(MediaType.Movie, m.id, lang)}>
                    <MediaCard
                      title={m.title ? m.title : ""}
                      width={500}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={(m.release_date && formatYear(m.release_date)) || 0}
                      picfile={m.backdrop_path}
                      isPerson={false}
                      isHorizontal={true}
                    />
                  </a>
                </div>
              ))}
            </MediaCarousel>
          )}
        </div>
      </div>
    );
  },
);
