import { component$ } from "@builder.io/qwik";
import type { Torrent } from "~/services/types";
import { formatRating } from "~/utils/fomat";

interface TorrentListProps {
  torrent: Torrent;
}

export const TorrentBlock = component$(({ torrent }: TorrentListProps) => {
  return (
    <>
      <div class="w-100 my-2 p-2 border border-primary">
        <div class="d-lg-flex align-items-center">
          <div class="text-start flex-grow-1">
            {torrent.K4 && (
              <div class="badge rounded-3 bg-primary text-secondary me-2">
                4K
              </div>
            )}
            {torrent.DV && (
              <div class="badge rounded-3 bg-primary text-secondary me-2">
                Dolby Vision
              </div>
            )}
            {torrent.HDR && !torrent.HDR10 && !torrent.HDR10plus && (
              <div class="badge rounded-3 bg-primary text-secondary me-2">
                HDR
              </div>
            )}
            {torrent.HDR10 && !torrent.HDR10plus && (
              <div class="badge rounded-3 bg-primary text-secondary me-2">
                HDR10
              </div>
            )}
            {torrent.HDR10plus && (
              <div class="badge rounded-3 bg-primary text-secondary me-2">
                HDR10+
              </div>
            )}
            <span class="badge rounded-3 bg-primary text-secondary me-2">
              {formatRating(torrent.Size)} Gb
            </span>
            <span>
              <i class="bi bi-arrow-up text-success"></i>
            </span>
            <span class="badge rounded-pill bg-primary text-secondary">
              {torrent.Seeds}
            </span>
            <span>
              <i class="bi bi-arrow-down text-danger"></i>
            </span>
            <span class="badge rounded-pill bg-primary text-secondary me-2 flex-grow-1">
              {torrent.Leeches}
            </span>
          </div>
          <div class="btn-group btn-group-sm mt-2 mb-2 " role="group">
            <a href={torrent.Magnet} target="_blank">
              <button type="button" class="btn btn-outline-primary">
                Открыть
              </button>
            </a>
            {/* <button type="button" class="btn btn-outline-primary" (click)="addTorrentToTS(torrent.Magnet, '[MOVIESTRACKER] '+torrent.Name, 'http://image.tmdb.org/t/p/w300/'+poster)" [disabled]="(this.torrserverurl$|async)===''">Добавить в TorrServer</button> */}
          </div>
        </div>

        <div class="row pb-1">
          <div class="col text-start">
            <div>{torrent.Name}</div>
            <div class="fw-light">{torrent.Date}</div>
          </div>
        </div>
      </div>
    </>
  );
});
