import { component$, $, useStore, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { TorrentList } from "~/components/torrent-list";
import { useQueryParamsLoader } from "~/routes/layout";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MediaDetails, Season, Torrent } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import { langTorrents } from "~/utils/languages";

export interface TorModalPros {
  title: string;
  year: number;
  isMovie: boolean;
  seasons: Season[];
  media: MediaDetails;
}

export const TorrentsModal = component$(
  ({ title, year, isMovie, seasons, media }: TorModalPros) => {
    // const torrentsSignal = useSignal<Torrent[] | null>(null);
    const resource = useQueryParamsLoader()
    const selectedYear = useSignal(year);
    const torrentsStore = useStore({ torrents: null as Torrent[] | null });
    const getTorrentsToggle = $(async (seyear: number) => {
      torrentsStore.torrents = null;
      try {
        const torrents = await server$(
          ({ name, year, isMovie }: getTorrentsType) => {
            return getTorrents({ name: name, year: year, isMovie: isMovie });
          }
        )({
          name: title,
          year: seyear,
          isMovie: isMovie,
        });
        // const torrents = await getTorrents({name: "Аватар: Путь воды", year: "2022", isMovie: true})
        torrentsStore.torrents = torrents;
      } catch (error) {
        torrentsStore.torrents = [];
      }
    });

    return (
      <>
        {seasons.length == 0 && (
          <button
            data-modal-target="torrentsModal"
            data-modal-toggle="torrentsModal"
            class="px-3 py-2 text-base font-medium text-center text-teal-50 bg-teal-700 rounded-lg hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800"
            type="button"
            onClick$={() => getTorrentsToggle(year)}
          >
            {langTorrents(resource.value.lang)}
          </button>
        )}

        {seasons.length > 0 && (
          <>
            <button
              id="dropdownBottomButton"
              data-dropdown-toggle="dropdownBottom"
              data-dropdown-placement="bottom"
              class="mr-3 mb-3 md:mb-0 text-teal-50 bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800"
              type="button"
            >
              {langTorrents(resource.value.lang)} {" "}
              <svg
                class="w-2.5 h-2.5 ml-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            <div
              id="dropdownBottom"
              class="z-10 hidden bg-teal-50 divide-y divide-teal-100 rounded-lg shadow w-44 dark:bg-teal-700"
            >
              <ul
                class="py-2 text-sm text-teal-700 dark:text-teal-200"
                aria-labelledby="dropdownBottomButton"
              >
                {seasons!.map((s) => {
                  if (s.season_number !== 0) {
                    return (
                      <>
                        <li>
                          <a
                            data-modal-target="torrentsModal"
                            data-modal-toggle="torrentsModal"
                            onClick$={() => {
                              selectedYear.value = formatYear(s.air_date ? s.air_date : "");
                              getTorrentsToggle(formatYear(s.air_date ? s.air_date : ""));
                            }}
                            href="#"
                            class="block px-4 py-2 hover:bg-teal-100 dark:hover:bg-teal-600 dark:hover:text-teal-50"
                          >
                            Сезон
                            <span class="ml-1">
                              {" "}
                              {s.season_number}({formatYear(s.air_date ? s.air_date : "")})
                            </span>
                          </a>
                        </li>
                      </>
                    );
                  }
                })}
              </ul>
            </div>
          </>
        )}

        <div
          id="torrentsModal"
          tabIndex={0}
          aria-hidden="true"
          class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="relative w-full max-w-4xl max-h-full">
            <div class="relative bg-teal-50 rounded-lg shadow dark:bg-teal-950">
              <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-teal-800">
                <h3 class="text-xl font-semibold ">{langTorrents(resource.value.lang)}</h3>
                <button
                  type="button"
                  class=" bg-transparent hover:bg-teal-100  rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-teal-800 "
                  data-modal-hide="torrentsModal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div class="p-6">
                <TorrentList
                  torrents={torrentsStore.torrents}
                  title={title}
                  year={selectedYear}
                  isMovie={isMovie}
                  movie={media}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);
