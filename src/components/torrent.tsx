import { component$, useContext, $ } from "@builder.io/qwik";
import type { ProductionMediaDetails, Torrent } from "~/services/types";
import { formatRating } from "~/utils/fomat";
import { ButtonPrimary } from "./button-primary";
import { addTorrent } from "~/services/torrserver";
import { toastManagerContext } from "./toast/toastStack";

interface TorrentListProps {
  torrent: Torrent;
  movie: ProductionMediaDetails;
}

export const TorrentBlock = component$(
  ({ torrent, movie }: TorrentListProps) => {
    const toastManager = useContext(toastManagerContext);
    return (
      <>
        <div class="rounded my-2 p-2 border border-1 border-teal-700 dark:border-teal-100">
          <div class="flex flex-wrap items-center justify-between">
            <div class="text-start mb-2 font-bold">
              {torrent.K4 && (
                <span class="bg-teal-100 text-teal-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                  4K
                </span>
              )}
              {torrent.DV && (
                <span class="bg-teal-100 text-teal-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                  Dolby Vision
                </span>
              )}
              {torrent.HDR && !torrent.HDR10 && !torrent.HDR10plus && (
                <span class="bg-teal-100 text-teal-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                  HDR
                </span>
              )}
              {torrent.HDR10 && !torrent.HDR10plus && (
                <span class="bg-teal-100 text-teal-800 text-sm  mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                  HDR10
                </span>
              )}
              {torrent.HDR10plus && (
                <span class="bg-teal-100 text-teal-800 text-sm  mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                  HDR10+
                </span>
              )}
            </div>

            <div class="flex flex-wrap items-center">
              <span class="bg-teal-100 text-teal-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-teal-900 dark:text-teal-300">
                {formatRating(torrent.Size)} Gb
              </span>

              <span class="bg-green-100 text-green-800 text-sm  mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                {torrent.Seeds}
              </span>

              <span class="bg-red-100 text-red-800 text-sm  mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                {torrent.Leeches}
              </span>
              <div class="flex space-x-1 my-2">
                <a href={torrent.Magnet} target="_blank">
                  <ButtonPrimary text="Открыть" size="sm" />
                </a>
                <ButtonPrimary
                  text="Добавить в TorrServer"
                  size="sm"
                  onClick={$(async () => {
                    const torrserv =
                      localStorage.getItem("selectedTorServer") || "";
                    if (torrserv === "") {
                      toastManager.addToast({
                        message: "TorrServer не добавлен!",
                        type: "error",
                        autocloseTime: 5000,
                      });
                      return;
                    }
                    try {
                      const result = await addTorrent(torrserv, torrent, movie);

                      console.log(result);
                      toastManager.addToast({
                        message: "Торрент добавлен!",
                        type: "success",
                        autocloseTime: 5000,
                      });
                    } catch (error) {
                      toastManager.addToast({
                        message: "Torrent не добавлен!",
                        type: "error",
                        autocloseTime: 5000,
                      });
                    }
                  })}
                />
              </div>

            </div>
          </div>

          <div class="text-start">
            <div>{torrent.Name}</div>
            <div class="font-light text-sm">{torrent.Date.slice(0, 10)}</div>
          </div>
        </div>
      </>
    );
  }
);
