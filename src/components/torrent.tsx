import { component$, useContext, $ } from "@builder.io/qwik";
import { formatRating } from "~/utils/fomat";
import { ButtonPrimary, ButtonSize } from "./button-primary";
import { addTorrent } from "~/services/torrserver";
import { toastManagerContext } from "./toast/toastStack";
import type { MediaDetails, Torrent } from "~/services/models";

interface TorrentListProps {
  torrent: Torrent;
  movie: MediaDetails;
}

export const TorrentBlock = component$(
  ({ torrent, movie }: TorrentListProps) => {
    const toastManager = useContext(toastManagerContext);
    const labelClass = "bg-primary-100 text-primary-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300"
    return (
      <>
        <div class="rounded my-2 p-2 border border-1 border-primary-700 dark:border-primary-100">
          <div class="flex flex-wrap items-center justify-between">
            <div class="text-start mb-2 font-bold">
              {torrent.K4 && (
                <span class={labelClass}>
                  4K
                </span>
              )}
              {torrent.DV && (
                <span class={labelClass}>
                  Dolby Vision
                </span>
              )}
              {torrent.HDR && !torrent.HDR10 && !torrent.HDR10plus && (
                <span class={labelClass}>
                  HDR
                </span>
              )}
              {torrent.HDR10 && !torrent.HDR10plus && (
                <span class={labelClass}>
                  HDR10
                </span>
              )}
              {torrent.HDR10plus && (
                <span class={labelClass}>
                  HDR10+
                </span>
              )}
            </div>

            <div class="flex flex-wrap items-center">
              <span class={labelClass}>
                {formatRating(torrent.Size)} Gb
              </span>

              <span class="bg-green-100 text-green-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                {torrent.Seeds}
              </span>

              <span class="bg-red-100 text-red-800 text-sm mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                {torrent.Leeches}
              </span>
              <div class="flex space-x-1 my-2">
                <a href={torrent.Magnet} target="_blank">
                  <ButtonPrimary text="Открыть" size={ButtonSize.sm} />
                </a>
                <ButtonPrimary
                  text="Добавить в TorrServer"
                  size={ButtonSize.sm}
                  onClick={$(async () => {
                    const torrserv =
                      localStorage.getItem("selectedTorServer") || "";
                    if (torrserv === "") {
                      toastManager.addToast({
                        message: "TorrServer hasn't been added!",
                        type: "error",
                        autocloseTime: 5000,
                      });
                      return;
                    }
                    try {
                      const result = await addTorrent(torrserv, torrent, movie);

                      console.log(result);
                      toastManager.addToast({
                        message: "Torrent added!",
                        type: "success",
                        autocloseTime: 5000,
                      });
                    } catch (error) {
                      toastManager.addToast({
                        message: "Torrent hasn't been added!",
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
