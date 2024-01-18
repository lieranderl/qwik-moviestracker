import { component$ } from "@builder.io/qwik";
import type { LastEpisodeToAir } from "~/services/models";
import {
  langLastEpisode,
  langCurrentSeason,
  langEnded,
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
      <section class="my-4">
        {in_production && (
          <table class="table-fixed" style="max-width: 400px;">
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
          <table class="table-fixed" style="max-width: 400px;">
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
      </section>
    );
  },
);
