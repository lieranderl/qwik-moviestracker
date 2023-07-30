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
import { paths } from "~/utils/paths";
import { Imdb } from "./imdb";
import { langBudget, langRevenue, langMinutes } from "~/utils/languages";
import { TorrentsModal } from "./torrents-list-modal";

interface MovieDetailsProps {
  movie: MovieMediaDetails;
  recMovies: Collection<MovieMedia>;
  // simMovies: Collection<MovieMedia>;
  colMovies?: Collection<MovieMedia>;
  lang: string;
}

export const MovieDetails = component$(
  ({ movie, recMovies, 
    // simMovies, 
    colMovies, lang }: MovieDetailsProps) => {
    return (
      <div class="pt-[20vh] lg:mx-20 xl:mx-40 font-normal">
        <section class="my-4">
          <h2 class="text-5xl font-extrabold my-1">
            {movie.title}{" "}
            {movie.release_date && (
              <span class="text-3xl font-bold italic">
                ({formatYear(movie.release_date)})
              </span>
            )}
          </h2>
          {movie.original_title && (
            <div class="text-xl">{movie.original_title}</div>
          )}
        </section>

        <section class="my-4 text-lg">
          <div class="flex flex-wrap items-center">
            {movie.vote_average! > 0 && (
              <div class="flex items-center me-4">
                <div class="w-8 h-8 fill-teal-950 dark:fill-teal-50 me-2">
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M25.99 29.198c2.807 0 4.708-1.896 4.708-4.708v-19.781c0-2.807-1.901-4.708-4.708-4.708h-19.979c-2.807 0-4.708 1.901-4.708 4.708v27.292l2.411-2.802v-24.49c0.005-1.266 1.031-2.292 2.297-2.292h19.974c1.266 0 2.292 1.026 2.292 2.292v19.781c0 1.266-1.026 2.292-2.292 2.292h-16.755l-2.417 2.417-0.016-0.016zM11.714 15.286h-2.26v7.599h2.26c5.057 0 5.057-7.599 0-7.599zM11.714 21.365h-0.734v-4.557h0.734c2.958 0 2.958 4.557 0 4.557zM11.276 13.854h1.516v-6.083h1.891v-1.505h-5.302v1.505h1.896zM18.75 9.599l-2.625-3.333h-0.49v7.714h1.542v-4.24l1.573 2.042 1.578-2.042-0.010 4.24h1.542v-7.714h-0.479zM21.313 19.089c0.474-0.333 0.677-0.922 0.698-1.5 0.031-1.339-0.807-2.307-2.156-2.307h-3.005v7.609h3.005c1.24-0.010 2.245-1.021 2.245-2.26v-0.036c0-0.62-0.307-1.172-0.781-1.5zM18.37 16.802h1.354c0.432 0 0.698 0.339 0.698 0.766 0.031 0.406-0.286 0.76-0.698 0.76h-1.354zM19.724 21.37h-1.354v-1.516h1.37c0.411 0 0.745 0.333 0.745 0.745v0.016c0 0.417-0.333 0.755-0.75 0.755z"></path>{" "}
                    </g>
                  </svg>
                </div>
                <div class="font-bold">
                  {formatRating(movie.vote_average!)}{" "}
                  {movie.vote_count && movie.vote_count > 0 && (
                    <span class="text-sm italic">({movie.vote_count})</span>
                  )}
                </div>
              </div>
            )}
            {movie.imdb_id && <Imdb id={movie.imdb_id} />}
          </div>
        </section>

        <section class="my-4 flex">
          <div class="mr-2">
            <ButtonPrimary text="Trailers" size="md" />
          </div>
          <TorrentsModal
            title={movie.title!}
            year={formatYear(movie.release_date!)}
            isMovie={true}
          />
        </section>

        <section class="text-md">
          <ul class="flex flex-wrap items-center justify-start">
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
                  {movie.runtime} {langMinutes(lang)}
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

        <section class="my-1 text-md">
          {movie.production_companies && (
            <div>
              {movie.production_companies.map((c) => c.name).join(", ")}
            </div>
          )}
        </section>

        <section class="my-1 flex flex-wrap text-md">
          {movie.budget! > 0 && (
            <div class="me-4 ">
              <span class="me-2">{langBudget(lang)}:</span>
              {formatCurrency(movie.budget!, lang)}
            </div>
          )}
          {movie.revenue! > 0 && (
            <div class="me-2">
              <span class="me-2">{langRevenue(lang)}:</span>
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
              <a href={paths.media("person", c.id, lang)}>
                <MediaCard
                  title={c.name!}
                  width={300}
                  picfile={c.profile_path!}
                  isPerson={true}
                  isHorizontal={false}
                  charName={c.character!}
                />
              </a>
            </>
          ))}
        </MediaCarousel>

        {movie.credits && movie.credits.crew!.length>0 && (
          <MediaCarousel title="Crew" type="person" lang={lang}>
            {formatCrew(movie.credits.crew!)
              .slice(0, 10)
              .map((c) => (
                <>
                  <a href={paths.media("person", c.id, lang)}>
                    <MediaCard
                      title={c.name!}
                      width={300}
                      picfile={c.profile_path!}
                      isPerson={true}
                      isHorizontal={false}
                      charName={c.job!}
                    />
                  </a>
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
                <a href={paths.media("movie", m.id, lang)}>
                  <MediaCard
                    title={m.title!}
                    width={500}
                    rating={m.vote_average!}
                    year={
                      (m.release_date && formatYear(m.release_date)) ||
                      undefined
                    }
                    picfile={m.backdrop_path}
                    isPerson={false}
                    isHorizontal={true}
                  />
                </a>
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
                <a href={paths.media("movie", m.id, lang)}>
                  <MediaCard
                    title={m.title!}
                    width={500}
                    rating={m.vote_average!}
                    year={
                      (m.release_date && formatYear(m.release_date)) ||
                      undefined
                    }
                    picfile={m.backdrop_path}
                    isPerson={false}
                    isHorizontal={true}
                  />
                </a>
              </>
            ))}
          </MediaCarousel>
        )}

        {/* {simMovies.results && simMovies.results.length > 0 && (
          <MediaCarousel
            title="Similar Movies"
            type="person"
            category="updated"
            lang={lang}
          >
            {simMovies.results.map((m) => (
              <>
                <a href={paths.media("movie", m.id, lang)}>
                  <MediaCard
                    title={m.title!}
                    width={500}
                    rating={m.vote_average!}
                    year={
                      (m.release_date && formatYear(m.release_date)) ||
                      undefined
                    }
                    picfile={m.backdrop_path}
                    isPerson={false}
                    isHorizontal={true}
                  />
                </a>
              </>
            ))}
          </MediaCarousel>
        )} */}
      </div>
    );
  }
);
