import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";
import type { LastEpisodeToAir } from "~/services/models";

export type TvEpisodeStatusProps = {
  lang: string;
  last_episode_to_air?: LastEpisodeToAir;
  next_episode_to_air?: LastEpisodeToAir;
  in_production?: boolean;
};

export const TvEpisodeStatus = component$<TvEpisodeStatusProps>(
  ({ lang, last_episode_to_air, next_episode_to_air, in_production }) => {
    const episodeStatusTitle = message(lang, "media.episodeStatus");

    return (
      <section class="card border-base-200 bg-base-100/95 border shadow-sm">
        <div class="card-body gap-4 p-4 md:p-6">
          <h3 class="card-title text-base-content/80 text-lg">
            {episodeStatusTitle}
          </h3>
          {in_production && (
            <table class="table-sm table w-full">
              <tbody>
                {last_episode_to_air && (
                  <tr>
                    <td>
                      {message(lang, "langLastEpisode")}
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
                      {message(lang, "langCurrentSeason")} (
                      {last_episode_to_air.season_number}){" "}
                      {message(lang, "langEnded")}.
                    </td>
                  </tr>
                )}
                {next_episode_to_air && (
                  <tr>
                    <td>
                      {message(lang, "langNextEpisode")}
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
                      {message(lang, "langLastEpisode")}
                      <span class="ps-1">
                        {last_episode_to_air.season_number}.
                        {last_episode_to_air.episode_number}:
                      </span>
                    </td>
                    <td class="ps-4">{last_episode_to_air.air_date}</td>
                  </tr>
                )}
                <tr>
                  <td>{message(lang, "langTvShowEnded")}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>
    );
  },
);
