import { component$, $, useStore } from "@builder.io/qwik";
import { z, server$ } from "@builder.io/qwik-city";
import { TorrentList } from "~/components/torrent-list";
import type { getTorrentsType } from "~/services/tmdb";
import { getTorrents } from "~/services/tmdb";
import type { Torrent } from "~/services/types";

export const searchTorrSchema = z.object({
  name: z.string().min(3, "Please enter movie name."),
  year: z
    .number()
    .int()
    .nonnegative()
    .max(new Date().getFullYear(), "Please enter a valid year."),
});

export type SearchTorrForm = z.infer<typeof searchTorrSchema>;

export interface TorModalPros {
  title: string;
  year: number;
  isMovie: boolean;
}

export const TorrentsModal = component$(
  ({ title, year, isMovie }: TorModalPros) => {
    // const torrentsSignal = useSignal<Torrent[] | null>(null);
    const torrentsStore = useStore({ torrents: null as Torrent[] | null });
    const getTorrentsToggle = $(async () => {
      torrentsStore.torrents = null;
      try {
        const torrents = await server$(
          ({ name, year, isMovie }: getTorrentsType) => {
            return getTorrents({ name: name, year: year, isMovie: isMovie });
          }
        )({ name: title, year: year, isMovie: isMovie });
        // const torrents = await getTorrents({name: "Аватар: Путь воды", year: "2022", isMovie: true})
        torrentsStore.torrents = torrents;
      } catch (error) {
        torrentsStore.torrents = null;
      }
    });

    return (
      <>
        <button
          data-modal-target="torrentsModal"
          data-modal-toggle="torrentsModal"
          class="px-3 py-2 text-base font-medium text-center text-teal-50 bg-teal-700 rounded-lg hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800"
          type="button"
          onClick$={getTorrentsToggle}
        >
          Torrents
        </button>

        <div
          id="torrentsModal"
          tabIndex={0}
          aria-hidden="true"
          class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
          <div class="relative w-full max-w-4xl max-h-full">
            <div class="relative bg-teal-50 rounded-lg shadow dark:bg-teal-950">
              <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-teal-800">
                <h3 class="text-xl font-semibold ">Torrents</h3>
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
                  year={year}
                  isMovie={isMovie}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);
