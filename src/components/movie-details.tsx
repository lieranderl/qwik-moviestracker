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
import { SiThemoviedatabase } from "@qwikest/icons/simpleicons";

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
          <h2 class="text-5xl font-extrabold me-1">{movie.title}</h2>
          {movie.original_title && (
            <div class="text-xl">{movie.original_title}</div>
          )}
        </section>

        <section class="mb-4 text-lg">
          <div class="flex flex-wrap items-center">
            {movie.vote_average! > 0 && (
              <div class="flex items-center me-4">
                <div class="text-[2.5rem] me-2">
                  <SiThemoviedatabase />
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
