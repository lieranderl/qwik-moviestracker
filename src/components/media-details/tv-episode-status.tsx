import { component$ } from "@builder.io/qwik";
import type { LastEpisodeToAir } from "~/services/models";
import {
  langCurrentSeason,
  langEnded,
  langLastEpisode,
  langNextEpisode,
  langTvShowEnded,
} from "~/utils/languages";

export type TvEpisodeStatusProps = {
  lang: string;
  last_episode_to_air?: LastEpisodeToAir;
  next_episode_to_air?: LastEpisodeToAir;
  in_production?: boolean;
};

export const TvEpisodeStatus = component$<TvEpisodeStatusProps>(
  ({ lang, last_episode_to_air, next_episode_to_air, in_production }) => {
    return (
      <section class="card border-base-200 bg-base-100/95 border shadow-sm">
        <div class="card-body">
          <h3 class="card-title text-base-content/80 text-lg">
            Episode Status
          </h3>
          {in_production && (
            <table class="table-sm table w-full">
              <tbody>
                {last_episode_to_air && (
                  <tr>
                    <td>
                      {langLastEpisode(lang)}
                      <span class="ps-1">
                        {" "}
                        {last_episode_to_air.season_number}.
                        {last_episode_to_air.episode_number}:
                      </span>
                    </td>
                    <td class="ps-4">{last_episode_to_air.air_date}</td>
                  </tr>
                )}
                {!next_episode_to_air && last_episode_to_air && (
                  <tr>
                    <td>
                      {langCurrentSeason(lang)} (
                      {last_episode_to_air.season_number}) {langEnded(lang)}.
                    </td>
                  </tr>
                )}
                {next_episode_to_air && (
                  <tr>
                    <td>
                      {langNextEpisode(lang)}
                      <span class="ps-1">
                        {next_episode_to_air.season_number}.
                        {next_episode_to_air.episode_number}:
                      </span>
                    </td>
                    <td class="ps-4">{next_episode_to_air.air_date}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {!in_production && (
            <table class="table-sm table w-full">
              <tbody>
                {last_episode_to_air && (
                  <tr>
                    <td>
                      {langLastEpisode(lang)}
                      <span class="ps-1">
                        {last_episode_to_air.season_number}.
                        {last_episode_to_air.episode_number}:
                      </span>
                    </td>
                    <td class="ps-4">{last_episode_to_air.air_date}</td>
                  </tr>
                )}
                <tr>
                  <td>{langTvShowEnded(lang)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  },
);
