import { component$ } from "@builder.io/qwik";

import {
  formatYear,
  formatRating,
  formatCurrency,
  formatLanguage,
  formatDate,
  formatCrew,
} from "~/utils/fomat";
import { MediaCarousel } from "./media-carousel";
import { MediaCard } from "./media-card";
import { paths } from "~/utils/paths";
import { Imdb } from "./imdb";
import {
  langBudget,
  langRevenue,
  langMinutes,
  langActors,
  langCrew,
  langCollectionMovies,
  langRecommendedMovies,
} from "~/utils/languages";
import { TorrentsModal } from "./torrents-list-modal";
import { TrailersModal } from "./trailers-list-modal";
import { ExternalIds } from "./external_ids";
import { MediaType, type MovieFull, type MovieShort } from "~/services/models";

interface MovieDetailsProps {
  movie: MovieFull;
  recMovies: MovieShort[];
  colMovies: MovieShort[];
  lang: string;
}

export const MovieDetails = component$(
  ({ movie, recMovies, colMovies, lang }: MovieDetailsProps) => {
    return (
      <div class="pt-[20vh] lg:mx-20 xl:mx-40 font-normal">
        <section class="mb-4">
          <h2 class="text-5xl font-extrabold me-1">
            <div class="flex items-end">
              {movie.title}
              {movie.release_date && (
                <span class="text-2xl font-bold italic my-1 ms-2">
                  ({formatYear(movie.release_date)})
                </span>
              )}
            </div>
          </h2>
          {movie.original_title && (
            <div class="text-xl">{movie.original_title}</div>
          )}
        </section>

        <section class="mb-4 text-lg">
          <div class="flex flex-wrap items-center">
            {movie.vote_average! > 0 && (
              <div class="flex items-center me-4">
                <div class="text-[2.5rem] fill-primary-dark dark:fill-primary me-2">
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    stroke="none"
                    width="1em"
                    height="1em"
                    data-qwikest-icon=""
                  >
                    <title>The Movie Database</title>
                    <path d="M6.62 12a2.291 2.291 0 0 1 2.292-2.295h-.013A2.291 2.291 0 0 1 11.189 12a2.291 2.291 0 0 1-2.29 2.291h.013A2.291 2.291 0 0 1 6.62 12zm10.72-4.062h4.266a2.291 2.291 0 0 0 2.29-2.291 2.291 2.291 0 0 0-2.29-2.296H17.34a2.291 2.291 0 0 0-2.291 2.296 2.291 2.291 0 0 0 2.29 2.29zM2.688 20.645h8.285a2.291 2.291 0 0 0 2.291-2.292 2.291 2.291 0 0 0-2.29-2.295H2.687a2.291 2.291 0 0 0-2.291 2.295 2.291 2.291 0 0 0 2.29 2.292zm10.881-6.354h.81l1.894-4.586H15.19l-1.154 3.008h-.013l-1.135-3.008h-1.154zm4.208 0h1.011V9.705h-1.011zm2.878 0h3.235v-.93h-2.223v-.933h1.99v-.934h-1.99v-.855h2.107v-.934h-3.112zM1.31 7.941h1.01V4.247h1.31v-.895H0v.895h1.31zm3.747 0h1.011V5.959h1.958v1.984h1.011v-4.59h-1.01v1.711H6.061V3.351H5.057zm5.348 0h3.242v-.933H11.41v-.934h1.99v-.933h-1.99v-.856h2.107v-.934h-3.112zM.162 14.296h1.005v-3.52h.013l1.167 3.52h.765l1.206-3.52h.013v3.52h1.011v-4.59H3.82L2.755 12.7h-.013L1.686 9.705H.156zm14.534 6.353h1.641a3.188 3.188 0 0 0 .98-.149 2.531 2.531 0 0 0 .824-.437 2.123 2.123 0 0 0 .567-.713 2.193 2.193 0 0 0 .223-.983 2.399 2.399 0 0 0-.218-1.07 1.958 1.958 0 0 0-.586-.716 2.405 2.405 0 0 0-.873-.392 4.349 4.349 0 0 0-1.046-.13h-1.519zm1.013-3.656h.596a2.26 2.26 0 0 1 .606.08 1.514 1.514 0 0 1 .503.244 1.167 1.167 0 0 1 .34.412 1.28 1.28 0 0 1 .13.587 1.546 1.546 0 0 1-.13.658 1.127 1.127 0 0 1-.347.433 1.41 1.41 0 0 1-.518.238 2.797 2.797 0 0 1-.649.07h-.538zm4.686 3.656h1.88a2.997 2.997 0 0 0 .613-.064 1.735 1.735 0 0 0 .554-.214 1.221 1.221 0 0 0 .402-.39 1.105 1.105 0 0 0 .155-.606 1.188 1.188 0 0 0-.071-.415 1.01 1.01 0 0 0-.204-.34 1.087 1.087 0 0 0-.317-.24 1.297 1.297 0 0 0-.413-.13v-.012a1.203 1.203 0 0 0 .575-.366.962.962 0 0 0 .216-.648 1.081 1.081 0 0 0-.149-.603 1.022 1.022 0 0 0-.389-.354 1.673 1.673 0 0 0-.54-.169 4.463 4.463 0 0 0-.6-.041h-1.712zm1.011-3.734h.687a1.4 1.4 0 0 1 .24.022.748.748 0 0 1 .22.075.432.432 0 0 1 .16.147.418.418 0 0 1 .061.236.47.47 0 0 1-.055.233.433.433 0 0 1-.146.156.62.62 0 0 1-.204.084 1.058 1.058 0 0 1-.23.026h-.745zm0 1.835h.765a1.96 1.96 0 0 1 .266.02 1.015 1.015 0 0 1 .26.07.519.519 0 0 1 .204.152.406.406 0 0 1 .08.26.481.481 0 0 1-.06.253.519.519 0 0 1-.16.168.62.62 0 0 1-.217.09 1.155 1.155 0 0 1-.237.027H21.4z"></path>
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

        <section class="mb-4 flex">
          {movie.videos!.results!.length > 0 && (
            <div class="mr-2">
              <TrailersModal videos={movie.videos!.results} />
            </div>
          )}

          <TorrentsModal
            title={movie.title!}
            year={formatYear(movie.release_date!)}
            isMovie={true}
            seasons={[]}
            media={movie}
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

        <section class="text-md">
          {movie.production_companies && (
            <div>
              {movie.production_companies.map((c) => c.name).join(", ")}
            </div>
          )}
        </section>

        <section class="flex flex-wrap text-md">
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

        <ExternalIds external_ids={movie.external_ids} type={"tv"} />

        <section class="mb-6">
          <div>{movie.overview}</div>
          {movie.tagline && (
            <blockquote class="text-sm italic font-semibold text-right">
              <p class="text-sm italic font-medium leading-relaxed">
                {movie.tagline}
              </p>
            </blockquote>
          )}
        </section>

        <MediaCarousel
          title={langActors(lang)}
          type={MediaType.Person}
          lang={lang}
        >
          {movie.credits?.cast.slice(0, 10).map((c) => (
            <div class="carousel-item " key={c.id}>
              <a href={paths.media(MediaType.Person, c.id, lang)}>
                <MediaCard
                  title={c.name ? c.name : ""}
                  width={300}
                  year={0}
                  rating={0}
                  picfile={c.profile_path!}
                  isPerson={true}
                  isHorizontal={false}
                  charName={c.character!}
                />
              </a>
            </div>
          ))}
        </MediaCarousel>

        {movie.credits && movie.credits.crew.length > 0 && (
          <MediaCarousel
            title={langCrew(lang)}
            type={MediaType.Person}
            lang={lang}
          >
            {formatCrew(movie.credits.crew!)
              .slice(0, 10)
              .map((c) => (
                <div class="carousel-item " key={c.id}>
                  <a href={paths.media(MediaType.Person, c.id, lang)}>
                    <MediaCard
                      title={c.name!}
                      width={300}
                      year={0}
                      rating={0}
                      picfile={c.profile_path!}
                      isPerson={true}
                      isHorizontal={false}
                      charName={c.job!}
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
              <div class="carousel-item " key={m.id}>
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
              <div class="carousel-item " key={m.id}>
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
    );
  }
);
