import { component$ } from "@builder.io/qwik";

import {
  formatYear,
  formatRating,
  formatDate,
  formatLanguage,
} from "~/utils/fomat";
import { paths } from "~/utils/paths";
import { MediaCard } from "./media-card";
import { MediaCarousel } from "./media-carousel";
import { TorrentsModal } from "./torrents-list-modal";
import { TrailersModal } from "./trailers-list-modal";
import { ExternalIds } from "./external_ids";
import { type TvShort, type TvFull, MediaType } from "~/services/models";
import {
  langActors,
  langLastEpisode,
  langNextEpisode,
  langRecommendedTvShows,
  langTvShowEnded,
  langCurrentSeason,
  langEnded,
  langCreatedby,
} from "~/utils/languages";
import { SiThemoviedatabase } from "@qwikest/icons/simpleicons";
import { LuDisc3, LuLayers3 } from "@qwikest/icons/lucide";

interface TvDetailsProps {
  tv: TvFull;
  recTv: TvShort[];
  lang: string;
}
export const TvDetails = component$(({ tv, recTv, lang }: TvDetailsProps) => {
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
              <div class="text-[2.5rem] me-2">
                <SiThemoviedatabase />
              </div>
              <div class="font-bold">
                {tv.vote_average && formatRating(tv.vote_average)}{" "}
                {tv.vote_count && tv.vote_count > 0 && (
                  <span class="text-sm italic">({tv.vote_count})</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section class="mb-4 flex items-center">
        {tv.videos!.results.length > 0 && (
          <div class="mr-2">
            <TrailersModal videos={tv.videos!.results} />
          </div>
        )}
        <TorrentsModal
          title={tv.name ? tv.name : ""}
          year={formatYear(tv.first_air_date ? tv.first_air_date : "")}
          isMovie={false}
          seasons={tv.seasons}
          media={tv}
        />
      </section>

      <section class="flex my-4 text-md items-center">
        <div class="me-2 font-bold">{tv.networks[0].name}</div>
        <div class="me-2 text-xl">
          <LuLayers3 />
        </div>
        <div class="me-2">{tv.number_of_seasons}</div>
        <div class="me-2 text-xl">
          <LuDisc3 />
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
                    {langLastEpisode(lang)}
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
                    {langCurrentSeason(lang)} (
                    {tv.last_episode_to_air.season_number}) {langEnded(lang)}.
                  </td>
                </tr>
              )}
              {tv.next_episode_to_air && (
                <tr>
                  <td>
                    {langNextEpisode(lang)}
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
                    {langLastEpisode(lang)}
                    <span class="ps-1">
                      {tv.last_episode_to_air.season_number}.
                      {tv.last_episode_to_air.episode_number}:
                    </span>
                  </td>
                  <td class="ps-4">{tv.last_episode_to_air.air_date}</td>
                </tr>
              )}
              <tr>
                <td>{langTvShowEnded(lang)}</td>
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

      {/* <section class="my-1 flex flex-wrap text-md">
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
        </section> */}

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
        <MediaCarousel
          title={langCreatedby(lang)}
          type={MediaType.Person}
          lang={lang}
        >
          {tv.created_by.slice(0, 10).map((c) => (
            <>
              <a href={paths.media(MediaType.Person, c.id, lang)}>
                <MediaCard
                  title={c.name!}
                  width={300}
                  year={0}
                  rating={0}
                  picfile={c.profile_path!}
                  isPerson={true}
                  isHorizontal={false}
                />
              </a>
            </>
          ))}
        </MediaCarousel>
      )}

      <MediaCarousel
        title={langActors(lang)}
        type={MediaType.Person}
        lang={lang}
      >
        {tv.credits!.cast.slice(0, 10).map((c) => (
          <>
            <a href={paths.media(MediaType.Person, c.id, lang)}>
              <MediaCard
                title={c.name!}
                width={300}
                year={0}
                rating={0}
                picfile={c.profile_path!}
                isPerson={true}
                isHorizontal={false}
                charName={c.character!}
              />
            </a>
          </>
        ))}
      </MediaCarousel>

      {recTv.length > 0 && (
        <MediaCarousel
          title={langRecommendedTvShows(lang)}
          type={MediaType.Person}
          category="updated"
          lang={lang}
        >
          {recTv.map((m) => (
            <>
              <a href={paths.media(MediaType.Tv, m.id, lang)}>
                <MediaCard
                  title={m.name ? m.name : ""}
                  width={500}
                  rating={m.vote_average ? m.vote_average : 0}
                  year={(m.first_air_date && formatYear(m.first_air_date)) || 0}
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
});
