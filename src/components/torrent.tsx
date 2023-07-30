import { component$ } from "@builder.io/qwik";
import type { Torrent } from "~/services/types";
import { formatRating } from "~/utils/fomat";
import { ButtonPrimary } from "./button-primary";

interface TorrentListProps {
  torrent: Torrent;
}

export const TorrentBlock = component$(({ torrent }: TorrentListProps) => {
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
              <a href={torrent.Magnet} target="_blank" >
                <ButtonPrimary text="Открыть" size="sm" />
              </a>
              {/* <a href={torrent.Magnet} target="_blank">
                <ButtonPrimary text="Открыть" size="sm" />
              </a> */}
            </div>

            {/* <button type="button" class="btn btn-outline-primary" (click)="addTorrentToTS(torrent.Magnet, '[MOVIESTRACKER] '+torrent.Name, 'http://image.tmdb.org/t/p/w300/'+poster)" [disabled]="(this.torrserverurl$|async)===''">Добавить в TorrServer</button> */}
          </div>
        </div>

        <div class="text-start">
          <div>{torrent.Name}</div>
          <div class="font-light text-sm">{torrent.Date.slice(0, 10)}</div>
        </div>
      </div>
    </>
  );
});
