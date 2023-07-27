import { component$ } from "@builder.io/qwik";
import type {
  Collection,
  MovieMedia,
  MovieMediaDetails,
} from "~/services/types";
import {
  formatYear,
  formatRating,
  formatCurrency,
  formatLanguage,
  formatDate,
  formatCrew,
} from "~/utils/fomat";
import { ButtonPrimary } from "./button-primary";
import { MediaCarousel } from "./media-carousel";
import { MediaCard } from "./media-card";

interface MovieDetailsProps {
  movie: MovieMediaDetails;
  recMovies: Collection<MovieMedia>;
  simMovies: Collection<MovieMedia>;
  colMovies?: Collection<MovieMedia>;
  lang: string;
}

export const MovieDetails = component$(
  ({ movie, recMovies, simMovies, colMovies, lang }: MovieDetailsProps) => {
    return (
      <div class="pt-[20vh] lg:mx-20 xl:mx-40 font-normal">
        <section class="my-4">
          <h2 class="text-4xl font-extrabold">
            {movie.title}{" "}
            {movie.release_date && (
              <span class="text-2xl font-bold italic">
                ({formatYear(movie.release_date)})
              </span>
            )}
          </h2>
          {movie.original_title && <div>{movie.original_title}</div>}
        </section>

        <section class="my-4">
          {movie.vote_average! > 0 && (
            <div class="text-md font-bold">
              {formatRating(movie.vote_average!)}{" "}
              {movie.vote_count && movie.vote_count > 0 && (
                <span class="text-md font-bold italic">
                  ({movie.vote_count})
                </span>
              )}
            </div>
          )}
          {movie.imdb_id && <div>{movie.imdb_id}</div>}
        </section>

        <section class="my-4">
          <ButtonPrimary text="Trailers" />
          <ButtonPrimary text="Torrents" />
        </section>

        <section class="text-sm">
          <ul class="flex flex-wrap items-center justify-start text-teal-950 dark:text-teal-50 ">
            <li>
              {movie.release_date && (
                <div class="after:content-['\3164\2022\3164']">
                  {formatDate(movie.release_date, lang)}{" "}
                </div>
              )}
            </li>
            <li>
              {movie.genres && movie.genres.length > 0 && (
                <div class="after:content-['\3164\2022\3164'] ">
                  {movie.genres.map((g) => g.name).join(", ")}
                </div>
              )}
            </li>
            <li>
              {movie.runtime! > 0 && (
                <div class="after:content-['\3164\2022\3164']">
                  {movie.runtime} minutes
                </div>
              )}
            </li>

            <li>
              {movie.production_countries && (
                <div class="after:content-['\3164\2022\3164']">
                  {movie.production_countries.map((c) => c.name).join(", ")}
                </div>
              )}
            </li>

            <li>
              {movie.original_language && (
                <div>{formatLanguage(movie.original_language)}</div>
              )}
            </li>
          </ul>
        </section>

        <section class="my-2 text-sm">
          {movie.production_companies && (
            <div>
              {movie.production_companies.map((c) => c.name).join(", ")}
            </div>
          )}
        </section>

        <section class="my-2 flex flex-wrap text-sm">
          {movie.budget! > 0 && (
            <div class="me-4 ">
              <span class="me-2">Budget:</span>
              {formatCurrency(movie.budget!, lang)}
            </div>
          )}
          {movie.revenue! > 0 && (
            <div class="me-2">
              <span class="me-2">Revenue:</span>
              {formatCurrency(movie.revenue!, lang)}
            </div>
          )}
        </section>

        <section class="my-8">
          <div>{movie.overview}</div>
          {movie.tagline && (
            <blockquote class="text-sm italic font-semibold text-right">
              <p class="text-sm italic font-medium leading-relaxed">
                {movie.tagline}
              </p>
            </blockquote>
          )}
        </section>

        <MediaCarousel title="Actors" type="person" lang={lang}>
          {movie.credits?.cast!.slice(0, 10).map((c) => (
            <>
              <div class="carousel-item">
                <MediaCard
                  title={c.name!}
                  width={300}
                  picfile={c.profile_path!}
                  isPerson={true}
                  isHorizontal={false}
                  charName={c.character!}
                  id={c.id}
                  type="person"
                  lang={lang}
                />
              </div>
            </>
          ))}
        </MediaCarousel>

        {movie.credits && movie.credits.crew && (
          <MediaCarousel title="Crew" type="person" lang={lang}>
            {formatCrew(movie.credits.crew)
              .slice(0, 10)
              .map((c) => (
                <>
                  <div class="carousel-item">
                    <MediaCard
                      title={c.name!}
                      width={300}
                      picfile={c.profile_path!}
                      isPerson={true}
                      isHorizontal={false}
                      charName={c.job!}
                      id={c.id}
                      type="person"
                      lang={lang}
                    />
                  </div>
                </>
              ))}
          </MediaCarousel>
        )}

        {colMovies && (
          <MediaCarousel
            title="Collection Movies"
            type="person"
            category="updated"
            lang={lang}
          >
            {colMovies.parts.map((m) => (
              <>
                <MediaCard
                  title={m.original_title!}
                  width={500}
                  rating={m.vote_average!}
                  year={
                    (m.release_date && formatYear(m.release_date)) || undefined
                  }
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                  id={m.id}
                  type="movie"
                  lang={lang}
                />
              </>
            ))}
          </MediaCarousel>
        )}

        {recMovies.results && recMovies.results.length > 0 && (
          <MediaCarousel
            title="Recommended Movies"
            type="person"
            category="updated"
            lang={lang}
          >
            {recMovies.results.map((m) => (
              <>
                <MediaCard
                  title={m.original_title!}
                  width={500}
                  rating={m.vote_average!}
                  year={
                    (m.release_date && formatYear(m.release_date)) || undefined
                  }
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                  id={m.id}
                  type="movie"
                  lang={lang}
                />
              </>
            ))}
          </MediaCarousel>
        )}

        {simMovies.results && simMovies.results.length > 0 && (
          <MediaCarousel
            title="Similar Movies"
            type="person"
            category="updated"
            lang={lang}
          >
            {simMovies.results.map((m) => (
              <>
                <MediaCard
                  title={m.original_title!}
                  width={500}
                  rating={m.vote_average!}
                  year={
                    (m.release_date && formatYear(m.release_date)) || undefined
                  }
                  picfile={m.backdrop_path}
                  isPerson={false}
                  isHorizontal={true}
                  id={m.id}
                  type="movie"
                  lang={lang}
                />
              </>
            ))}
          </MediaCarousel>
        )}
      </div>
    );
  }
);
