import { component$, $, useStore, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { TorrentList } from "~/components/torrent-list";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MediaDetails, Season, Torrent } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import { langTorrents } from "~/utils/languages";
import { ButtonPrimary, ButtonSize, ButtonType } from "./button-primary";

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
    const resource = useQueryParamsLoader();
    const selectedYear = useSignal(year);
    const torrentsStore = useStore({ torrents: null as Torrent[] | null });
    const getTorrentsToggle = $(async () => {
      torrentsStore.torrents = null;
      try {
        const torrents = await server$(
          ({ name, year, isMovie }: getTorrentsType) => {
            return getTorrents({ name: name, year: year, isMovie: isMovie });
          },
        )({
          name: title,
          year: selectedYear.value,
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
          <ButtonPrimary
            dataModalTarget="torrentsModal"
            dataModalToggle="torrentsModal"
            size={ButtonSize.md}
            type={ButtonType.button}
            onClick={getTorrentsToggle}
          >
            {langTorrents(resource.value.lang)}
          </ButtonPrimary>
        )}

        {seasons.length > 0 && (
          <>
            <ButtonPrimary
              type={ButtonType.button}
              size={ButtonSize.md}
              dataDropdownToggle="dropdownBottom"
              dataDropdownPlacement="bottom"
            >
              {langTorrents(resource.value.lang)}{" "}
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
            </ButtonPrimary>

            <div
              id="dropdownBottom"
              class="z-10 hidden bg-primary divide-y divide-primary-100 rounded-lg shadow w-44 dark:bg-primary-700"
            >
              <ul
                class="py-2 text-sm text-primary-700 dark:text-primary-200"
                aria-labelledby="dropdownBottomButton"
              >
                {seasons!.map((s) => {
                  if (s.season_number !== 0) {
                    return (
                      <>
                        {s.air_date && (
                          <li>
                            <a
                              data-modal-target="torrentsModal"
                              data-modal-toggle="torrentsModal"
                              onClick$={() => {
                                selectedYear.value = formatYear(
                                  s.air_date ? s.air_date : "",
                                );
                                getTorrentsToggle();
                              }}
                              href="#"
                              class="block px-4 py-2 hover:bg-primary-100 dark:hover:bg-primary-600 dark:hover:text-primary"
                            >
                              Сезон
                              <span class="ml-1">
                                {" "}
                                {s.season_number}(
                                {formatYear(s.air_date ? s.air_date : "")})
                              </span>
                            </a>
                          </li>
                        )}
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
            <div class="relative bg-primary rounded-lg shadow dark:bg-primary-dark">
              <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-primary-800">
                <h3 class="text-xl font-semibold ">
                  {langTorrents(resource.value.lang)}
                </h3>
                <button
                  type="button"
                  class=" bg-transparent hover:bg-primary-100  rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary-800 "
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
  },
);
