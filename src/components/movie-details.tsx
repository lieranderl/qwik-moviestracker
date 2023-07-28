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
              <div class="text-md font-bold">
                {formatRating(movie.vote_average!)}{" "}
                {movie.vote_count && movie.vote_count > 0 && (
                  <span class="text-sm font-bold italic">
                    ({movie.vote_count})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* {movie.imdb_id && <div>{movie.imdb_id}</div>} */}
          {movie.vote_average! > 0 && (
            <div class="flex items-center">
              <div class="w-8 h-8 fill-teal-950 dark:fill-teal-50 me-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M89.5 323.6H53.93V186.2H89.5V323.6zM156.1 250.5L165.2 186.2H211.5V323.6H180.5V230.9L167.1 323.6H145.8L132.8 232.9L132.7 323.6H101.5V186.2H147.6C148.1 194.5 150.4 204.3 151.9 215.6L156.1 250.5zM223.7 323.6V186.2H250.3C267.3 186.2 277.3 187.1 283.3 188.6C289.4 190.3 294 192.8 297.2 196.5C300.3 199.8 302.3 203.1 303 208.5C303.9 212.9 304.4 221.6 304.4 234.7V282.9C304.4 295.2 303.7 303.4 302.5 307.6C301.4 311.7 299.4 315 296.5 317.3C293.7 319.7 290.1 321.4 285.8 322.3C281.6 323.1 275.2 323.6 266.7 323.6H223.7zM259.2 209.7V299.1C264.3 299.1 267.5 298.1 268.6 296.8C269.7 294.8 270.4 289.2 270.4 280.1V226.8C270.4 220.6 270.3 216.6 269.7 214.8C269.4 213 268.5 211.8 267.1 210.1C265.7 210.1 263 209.7 259.2 209.7V209.7zM316.5 323.6V186.2H350.6V230.1C353.5 227.7 356.7 225.2 360.1 223.5C363.7 222 368.9 221.1 372.9 221.1C377.7 221.1 381.8 221.9 385.2 223.3C388.6 224.8 391.2 226.8 393.2 229.5C394.9 232.1 395.9 234.8 396.3 237.3C396.7 239.9 396.1 245.3 396.1 253.5V292.1C396.1 300.3 396.3 306.4 395.3 310.5C394.2 314.5 391.5 318.1 387.5 320.1C383.4 324 378.6 325.4 372.9 325.4C368.9 325.4 363.7 324.5 360.2 322.9C356.7 321.1 353.5 318.4 350.6 314.9L348.5 323.6L316.5 323.6zM361.6 302.9C362.3 301.1 362.6 296.9 362.6 290.4V255C362.6 249.4 362.3 245.5 361.5 243.8C360.8 241.9 357.8 241.1 355.7 241.1C353.7 241.1 352.3 241.9 351.6 243.4C351 244.9 350.6 248.8 350.6 255V291.4C350.6 297.5 351 301.4 351.8 303C352.4 304.7 353.9 305.5 355.9 305.5C358.1 305.5 360.1 304.7 361.6 302.9L361.6 302.9zM418.4 32.04C434.1 33.27 447.1 47.28 447.1 63.92V448.1C447.1 464.5 435.2 478.5 418.9 479.1C418.6 479.1 418.4 480 418.1 480H29.88C29.6 480 29.32 479.1 29.04 479.9C13.31 478.5 1.093 466.1 0 449.7L.0186 61.78C1.081 45.88 13.82 33.09 30.26 31.1H417.7C417.9 31.1 418.2 32.01 418.4 32.04L418.4 32.04zM30.27 41.26C19 42.01 10.02 51.01 9.257 62.4V449.7C9.63 455.1 11.91 460.2 15.7 464C19.48 467.9 24.51 470.3 29.89 470.7H418.1C429.6 469.7 438.7 459.1 438.7 448.1V63.91C438.7 58.17 436.6 52.65 432.7 48.45C428.8 44.24 423.4 41.67 417.7 41.26L30.27 41.26z" />
                </svg>
              </div>
              <div class="text-md font-bold">
                {formatRating(movie.vote_average!)}{" "}
                {movie.vote_count && movie.vote_count > 0 && (
                  <span class="text-sm font-bold italic">
                    ({movie.vote_count})
                  </span>
                )}
              </div>
            </div>
          )}
          </div>
         

          
        </section>

        <section class="my-4">
          <ButtonPrimary text="Trailers" />
          <ButtonPrimary text="Torrents" />
        </section>

        <section class="text-sm">
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
