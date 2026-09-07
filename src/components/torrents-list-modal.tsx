import { message } from "~/utils/i18n";
import { $, component$, useStore } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons";
import { TorrentList } from "~/components/torrent-list";
import type { MediaDetails, Season, Torrent } from "~/services/models";
import {
  getTorrentSearch,
  type getTorrentsType,
} from "~/services/torrent-search";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import { showDialogById } from "~/utils/browser";
import { formatYear } from "~/utils/format";


export interface TorModalPros {
  title: string;
  year: number;
  isMovie: boolean;
  seasons: Season[];
  media: MediaDetails;
  lang: string;
}

export const TorrentsModal = component$(
  ({ title, year, isMovie, seasons, media, lang }: TorModalPros) => {
    const resource = useQueryParamsLoader();
    const torrentsStore = useStore({
      loaded: 0,
      season: undefined as number | undefined,
      total: 0,
      torrents: null as Torrent[] | null,
      year,
    });
    const getTorrentsToggle = $(
      async (name: string, year: number, isMovie: boolean, season?: number) => {
        torrentsStore.torrents = null;
        torrentsStore.season = season;
        torrentsStore.loaded = 0;
        torrentsStore.total = 0;
        torrentsStore.year = year;
        const torrModal = showDialogById("torrentsModal");
        if (torrModal) {
          try {
            const result = await server$((request: getTorrentsType) =>
              getTorrentSearch(request),
            )({ isMovie, name, season, year });
            torrentsStore.loaded = result.loaded;
            torrentsStore.total = result.total;
            torrentsStore.torrents = result.torrents;
          } catch (error) {
            torrentsStore.torrents = [];
            console.error(error);
          }
        }
      },
    );

    return (
      <>
        {seasons.length === 0 && (
          <button
            type="button"
            class="btn btn-outline btn-primary"
            onClick$={() => getTorrentsToggle(title, year, isMovie)}
          >
            {message(resource.value.lang, "langTorrents")}
          </button>
        )}

        {seasons.length > 0 && (
          <div class="dropdown dropdown-end relative z-30">
            <button type="button" class="btn btn-outline btn-primary">
              {message(resource.value.lang, "langTorrents")}
              <HiChevronDownSolid />
            </button>
            <ul class="menu dropdown-content rounded-box bg-base-100 border-base-200 z-30 mt-2 w-60 border p-2 shadow-xl">
              {seasons.map((s) => {
                if (s.season_number === 0 || !s.air_date) {
                  return null;
                }
                return (
                  <li key={s.season_number}>
                    <button
                      type="button"
                      class="text-left"
                      onClick$={() => {
                        const updatedYear = formatYear(s.air_date);
                        getTorrentsToggle(
                          title,
                          updatedYear,
                          isMovie,
                          s.season_number,
                        );
                      }}
                    >
                      {message(lang, "langSeason")}
                      <span class="ml-1">
                        {" "}
                        {s.season_number} ({formatYear(s.air_date)})
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <dialog id="torrentsModal" class="modal">
          <div class="modal-box overlay-enter border-base-200 bg-base-100 max-h-[calc(100dvh-2rem)] w-11/12 max-w-5xl overflow-y-auto border p-0 shadow-xl">
            <div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
              <h3 class="text-xl font-semibold">
                {message(resource.value.lang, "langTorrents")}
              </h3>
              <form method="dialog">
                <button
                  type="submit"
                  aria-label={message(lang, "ui.closeTorrents")}
                  class="btn btn-ghost btn-circle p-0"
                >
                  ✕
                </button>
              </form>
            </div>
            <div class="px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <TorrentList
                torrents={torrentsStore.torrents}
                movie={media}
                lang={lang}
                sourceLoaded={torrentsStore.loaded}
                sourceTotal={torrentsStore.total}
              />
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button type="submit">{message(lang, "ui.close")}</button>
          </form>
        </dialog>
      </>
    );
  },
);
