import { component$ } from "@builder.io/qwik";
import type {
  Collection,
  ProductionMediaDetails,
  TvMedia,
  TvMediaDetails,
} from "~/services/types";
import {
  formatYear,
  formatRating,
  formatDate,
  formatLanguage,
  formatCurrency,
} from "~/utils/fomat";
import { langBudget, langRevenue } from "~/utils/languages";
import { paths } from "~/utils/paths";
import { Imdb } from "./imdb";
import { MediaCard } from "./media-card";
import { MediaCarousel } from "./media-carousel";
import { TorrentsModal } from "./torrents-list-modal";
import { TrailersModal } from "./trailers-list-modal";
import { ExternalIds } from "./external_ids";
import { SiThemoviedatabase } from "@qwikest/icons/simpleicons";
import { HiSquare3Stack3DOutline } from "@qwikest/icons/heroicons";
import { BsDisc } from "@qwikest/icons/bootstrap";

interface TvDetailsProps {
  tv: TvMediaDetails;
  recTv: Collection<TvMedia>;
  // simTv: Collection<TvMedia>;
  lang: string;
}

export const TvDetails = component$(
  ({
    tv,
    recTv,
    // simTv,
    lang,
  }: TvDetailsProps) => {
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
                <div class="text-[2.5rem] fill-teal-950 dark:fill-teal-50 me-2">
                  <SiThemoviedatabase />
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

        <section class="my-4 flex">
          {tv.videos!.results!.length > 0 && (
            <div class="mr-2">
              <TrailersModal videos={tv.videos!.results} />
            </div>
          )}
          <TorrentsModal
            title={tv.name!}
            year={formatYear(tv.first_air_date!)}
            isMovie={false}
            seasons={tv.seasons}
            media={tv as ProductionMediaDetails}
          />
        </section>

        <section class="flex my-4 text-md items-center">
          <div class="me-2 font-bold">{tv.networks[0].name}</div>
          <div class="me-2 text-xl">
            <HiSquare3Stack3DOutline />
          </div>
          <div class="me-2">{tv.number_of_seasons}</div>
          <div class="me-2 text-xl">
            <BsDisc />
          </div>
          <div class="me-2">{tv.number_of_episodes}</div>
        </section>

        <section class="my-4">
          {tv.in_production && (
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
          )}

          {!tv.in_production && (
            <table class="table-fixed" style="max-width: 400px;">
              <tbody>
                {tv.last_episode_to_air && (
                  <tr>
                    <td>
                      Последняя вышедшая серия
                      <span class="ps-1">
                        {tv.last_episode_to_air.season_number}.
                        {tv.last_episode_to_air.episode_number}:
                      </span>
                    </td>
                    <td class="ps-4">{tv.last_episode_to_air.air_date}</td>
                  </tr>
                )}
                <tr>
                  <td>Cериал завершен.</td>
                </tr>
              </tbody>
            </table>
          )}
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

        <ExternalIds external_ids={tv.external_ids} type={"tv"} />

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
          <MediaCarousel title="Created by" type="person" lang={lang}>
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
                    title={m.name!}
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

        {/* {simTv.results && simTv.results.length > 0 && (
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
                    title={m.name!}
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
        )} */}
      </div>
    );
  }
);
