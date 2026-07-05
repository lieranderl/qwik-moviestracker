import { $, component$, useContext } from "@builder.io/qwik";
import {
  BsBoxArrowUpRight,
  BsMagnet,
  BsPlusCircle,
} from "@qwikest/icons/bootstrap";
import { ToastManagerContext } from "qwik-toasts";
import type { MediaDetails, Torrent } from "~/services/models";
import { addTorrent } from "~/services/torrserver";
import { readStorageString } from "~/utils/browser";
import { formatRating } from "~/utils/format";
import { langText } from "~/utils/languages";
import {
  getTorrentBadges,
  type TorrentBadgeTone,
} from "~/utils/torrent-format";

interface TorrentListProps {
  lang: string;
  torrent: Torrent;
  movie: MediaDetails;
}

const formatAvailability = (score?: number) =>
  `${Math.round((score ?? 0) * 100)}%`;

const getDisplayTitle = (torrent: Torrent) =>
  [torrent.RussianName, torrent.OriginalName]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(" / ") || torrent.Name;

const getSecondaryTitle = (torrent: Torrent) => {
  const displayTitle = getDisplayTitle(torrent);
  return torrent.Name && torrent.Name !== displayTitle ? torrent.Name : "";
};

const getDateLabel = (torrent: Torrent) =>
  (torrent.Date || torrent.UpdatedDate || "").slice(0, 10);

const getBadgeClass = (tone: TorrentBadgeTone) => {
  switch (tone) {
    case "quality":
      return "badge badge-primary badge-soft";
    case "feature":
      return "badge border-primary/40 bg-primary/10 text-primary font-medium";
    case "video":
      return "badge badge-neutral badge-soft uppercase";
    case "tracker":
      return "badge badge-ghost border-base-300 text-base-content/70";
  }
};

export const TorrentBlock = component$(
  ({ torrent, movie, lang }: TorrentListProps) => {
    const toastManager = useContext(ToastManagerContext);
    const displayTitle = getDisplayTitle(torrent);
    const secondaryTitle = getSecondaryTitle(torrent);
    const dateLabel = getDateLabel(torrent);
    const categoryBadges = (torrent.CategoryLabels?.length
      ? torrent.CategoryLabels
      : torrent.Categories
    )?.slice(0, 3);
    const voiceBadges = torrent.Voices?.slice(0, 3);
    const seasonBadges = torrent.Seasons?.slice(0, 3);
    const torrentBadges = getTorrentBadges(torrent);

    return (
      <div class="card card-border border-base-300 bg-base-100 my-3 shadow-sm">
        <div class="card-body gap-4">
          <div class="flex flex-col gap-4">
            <div class="min-w-0 flex-1 text-start">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                {torrentBadges.map((badge) => (
                  <span class={getBadgeClass(badge.tone)} key={badge.label}>
                    {badge.label}
                  </span>
                ))}
              </div>

              <h4 class="text-base font-semibold leading-snug break-words">
                {displayTitle}
              </h4>
              {secondaryTitle && (
                <p class="text-base-content/65 mt-1 line-clamp-2 text-sm leading-relaxed">
                  {secondaryTitle}
                </p>
              )}
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="badge badge-primary badge-soft">
              {torrent.SizeName || `${formatRating(torrent.Size)} GB`}
            </span>

            <span class="badge badge-success badge-soft rounded">
              {torrent.Seeds} {langText(lang, "seeds", "сидов")}
            </span>

            <span class="badge badge-error badge-soft rounded">
              {torrent.Peers ?? torrent.Leeches} {langText(lang, "peers", "пиров")}
            </span>

            {torrent.AvailabilityScore !== undefined && (
              <span class="badge badge-warning badge-soft rounded">
                {formatAvailability(torrent.AvailabilityScore)}{" "}
                {langText(lang, "availability", "доступность")}
              </span>
            )}

            {dateLabel && (
              <span class="badge badge-ghost rounded">{dateLabel}</span>
            )}
          </div>

          {(categoryBadges?.length || voiceBadges?.length || seasonBadges?.length) && (
            <div class="flex flex-wrap items-center gap-2">
              {categoryBadges?.map((category) => (
                <span class="badge badge-ghost border-base-300" key={`category-${category}`}>
                  {category}
                </span>
              ))}
              {voiceBadges?.map((voice) => (
                <span class="badge badge-ghost border-base-300" key={`voice-${voice}`}>
                  {voice}
                </span>
              ))}
              {seasonBadges?.map((season) => (
                <span class="badge badge-ghost border-base-300" key={`season-${season}`}>
                  S{season}
                </span>
              ))}
            </div>
          )}

          <div class="flex flex-wrap items-center gap-2">
            <a
              href={torrent.Magnet}
              target="_blank"
              rel="noreferrer"
              class="btn btn-outline btn-sm"
            >
              <BsMagnet class="h-4 w-4" />
              Magnet
            </a>
            {torrent.DetailsUrl && (
              <a
                href={torrent.DetailsUrl}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline btn-sm"
              >
                <BsBoxArrowUpRight class="h-4 w-4" />
                {langText(lang, "Source", "Источник")}
              </a>
            )}
            <button
              type="button"
              class="btn btn-primary btn-sm"
              onClick$={$(async () => {
                const torrserv =
                  readStorageString("selectedTorServer", "") || "";
                if (torrserv === "") {
                  toastManager.addToast({
                    message: "TorrServer hasn't been added!",
                    type: "error",
                    autocloseTime: 5000,
                  });
                  return;
                }
                try {
                  await addTorrent(torrserv, torrent, movie);
                  toastManager.addToast({
                    message: "Torrent added!",
                    type: "success",
                    autocloseTime: 5000,
                  });
                } catch (error) {
                  console.error(error);
                  toastManager.addToast({
                    message: "Torrent hasn't been added!",
                    type: "error",
                    autocloseTime: 5000,
                  });
                }
              })}
            >
              <BsPlusCircle class="h-4 w-4" />
              TorrServer
            </button>
          </div>
        </div>
      </div>
    );
  },
);
