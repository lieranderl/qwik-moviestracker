import { component$ } from "@builder.io/qwik";
import type { Collection, TvMedia, TvMediaDetails } from "~/services/types";
import {
  formatYear,
  formatRating,
  formatDate,
  formatLanguage,
  formatCurrency,
  formatCrew,
} from "~/utils/fomat";
import { langMinutes, langBudget, langRevenue } from "~/utils/languages";
import { paths } from "~/utils/paths";
import { ButtonPrimary } from "./button-primary";
import { Imdb } from "./imdb";
import { MediaCard } from "./media-card";
import { MediaCarousel } from "./media-carousel";

interface TvDetailsProps {
  tv: TvMediaDetails;
  recTv: Collection<TvMedia>;
  simTv: Collection<TvMedia>;
  lang: string;
}

export const TvDetails = component$(
  ({ tv, recTv, simTv, lang }: TvDetailsProps) => {
    return (
      <div class="pt-[20vh] lg:mx-20 xl:mx-40 font-normal">
        <section class="my-4">
          <h2 class="text-5xl font-extrabold my-1">
            {tv.name}{" "}
            {tv.first_air_date && (
              <span class="text-3xl font-bold italic">
                ({formatYear(tv.first_air_date)})
              </span>
            )}
          </h2>
          {tv.original_name && <div class="text-xl">{tv.original_name}</div>}
        </section>

        <section class="my-4 text-lg">
          <div class="flex flex-wrap items-center">
            {tv.vote_average! > 0 && (
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
                  {formatRating(tv.vote_average!)}{" "}
                  {tv.vote_count && tv.vote_count > 0 && (
                    <span class="text-sm italic">({tv.vote_count})</span>
                  )}
                </div>
              </div>
            )}
            {tv.imdb_id && <Imdb id={tv.imdb_id} />}
          </div>
        </section>

        <section class="my-4">
          <ButtonPrimary text="Trailers" />
          <ButtonPrimary text="Torrents" />
        </section>

        <section class="flex my-4 text-md items-center">
          <div class="me-2 font-bold">{tv.networks[0].name}</div>
          <div class="me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 fill-teal-950 dark:fill-teal-50"
              viewBox="0 0 576 512"
            >
              <path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z" />
            </svg>
          </div>
          <div class="me-2">{tv.number_of_seasons}</div>
          <div class="me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 fill-teal-950 dark:fill-teal-50"
              viewBox="0 0 512 512"
            >
              <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 32a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm-96-32a96 96 0 1 0 192 0 96 96 0 1 0 -192 0zM96 240c0-35 17.5-71.1 45.2-98.8S205 96 240 96c8.8 0 16-7.2 16-16s-7.2-16-16-16c-45.4 0-89.2 22.3-121.5 54.5S64 194.6 64 240c0 8.8 7.2 16 16 16s16-7.2 16-16z" />
            </svg>
          </div>
          <div class="me-2">{tv.number_of_episodes}</div>
        </section>

        <section class="my-4">
          <table class="table-fixed" style="max-width: 400px;">
            <tbody>
              {tv.last_episode_to_air && (
                <tr>
                  <td>
                    Последняя вышедшая серия
                    <span class="ps-1">
                      {" "}
                      {tv.last_episode_to_air.season_number}.
                      {tv.last_episode_to_air.episode_number}:
                    </span>
                  </td>
                  <td class="ps-4">{tv.last_episode_to_air.air_date}</td>
                </tr>
              )}
              {!tv.next_episode_to_air && tv.last_episode_to_air && (
                <tr>
                  <td>
                    Текущий сезон ({tv.last_episode_to_air.season_number})
                    завершен.
                  </td>
                </tr>
              )}
              {tv.next_episode_to_air && (
                <tr>
                  <td>
                    Следующая серия
                    <span class="ps-1">
                      {tv.next_episode_to_air.season_number}.
                      {tv.next_episode_to_air.episode_number}:
                    </span>
                  </td>
                  <td class="ps-4">{tv.next_episode_to_air.air_date}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section class="text-md">
          <ul class="flex flex-wrap items-center justify-start">
            <li>
              {tv.first_air_date && (
                <div class="after:content-['\3164\2022\3164']">
                  {formatDate(tv.first_air_date, lang)}{" "}
                </div>
              )}
            </li>
            <li>
              {tv.genres && tv.genres.length > 0 && (
                <div class="after:content-['\3164\2022\3164'] ">
                  {tv.genres.map((g) => g.name).join(", ")}
                </div>
              )}
            </li>

            <li>
              {tv.production_countries && (
                <div class="after:content-['\3164\2022\3164']">
                  {tv.production_countries.map((c) => c.name).join(", ")}
                </div>
              )}
            </li>

            <li>
              {tv.original_language && (
                <div>{formatLanguage(tv.original_language)}</div>
              )}
            </li>
          </ul>
        </section>

        <section class="my-1 text-md">
          {tv.production_companies && (
            <div>{tv.production_companies.map((c) => c.name).join(", ")}</div>
          )}
        </section>

        <section class="my-1 flex flex-wrap text-md">
          {tv.budget! > 0 && (
            <div class="me-4 ">
              <span class="me-2">{langBudget(lang)}:</span>
              {formatCurrency(tv.budget!, lang)}
            </div>
          )}
          {tv.revenue! > 0 && (
            <div class="me-2">
              <span class="me-2">{langRevenue(lang)}:</span>
              {formatCurrency(tv.revenue!, lang)}
            </div>
          )}
        </section>

        <section class="my-8">
          <div>{tv.overview}</div>
          {tv.tagline && (
            <blockquote class="text-sm italic font-semibold text-right">
              <p class="text-sm italic font-medium leading-relaxed">
                {tv.tagline}
              </p>
            </blockquote>
          )}
        </section>

        {tv.created_by.length > 0 && (
          <MediaCarousel title="Crew" type="person" lang={lang}>
            {tv.created_by.slice(0, 10).map((c) => (
              <>
                <a href={paths.media("person", c.id, lang)}>
                  <MediaCard
                    title={c.name!}
                    width={300}
                    picfile={c.profile_path!}
                    isPerson={true}
                    isHorizontal={false}
                  />
                </a>
              </>
            ))}
          </MediaCarousel>
        )}

        <MediaCarousel title="Actors" type="person" lang={lang}>
          {tv.credits?.cast!.slice(0, 10).map((c) => (
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

        {recTv.results && recTv.results.length > 0 && (
          <MediaCarousel
            title="Recommended Tv Shows"
            type="person"
            category="updated"
            lang={lang}
          >
            {recTv.results.map((m) => (
              <>
                <a href={paths.media("tv", m.id, lang)}>
                  <MediaCard
                    title={m.original_name!}
                    width={500}
                    rating={m.vote_average!}
                    year={
                      (m.first_air_date && formatYear(m.first_air_date)) ||
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

        {simTv.results && simTv.results.length > 0 && (
          <MediaCarousel
            title="Similar TV Shows"
            type="person"
            category="updated"
            lang={lang}
          >
            {simTv.results.map((m) => (
              <>
                <a href={paths.media("tv", m.id, lang)}>
                  <MediaCard
                    title={m.original_name!}
                    width={500}
                    rating={m.vote_average!}
                    year={
                      (m.first_air_date && formatYear(m.first_air_date)) ||
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
      </div>
    );
  }
);
