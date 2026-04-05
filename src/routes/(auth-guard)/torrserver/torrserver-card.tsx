import { component$, type PropFunction } from "@builder.io/qwik";
import {
  LuFolderOpen,
  LuListMusic,
  LuMagnet,
  LuPause,
  LuTrash2,
} from "@qwikest/icons/lucide";
import { MediaCard } from "~/components/media-card";
import type { TorrServerTorrentStatus } from "~/services/torrserver";
import {
  buildMagnetFromHash,
  buildTorrentPlaylistUrl,
} from "~/services/torrserver";
import { formatYear } from "~/utils/format";
import { langText } from "~/utils/languages";
import {
  formatTorrentSize,
  formatTransferSpeed,
  getTorrentHref,
  getTorrentStatusFilter,
  parseTorrentMedia,
} from "./torrserver-state";

export interface TorrentCardProps {
  lang: string;
  onDrop$: PropFunction<(torrent: TorrServerTorrentStatus) => void>;
  onOpenFiles$: PropFunction<(torrent: TorrServerTorrentStatus) => void>;
  onRemove$: PropFunction<(torrent: TorrServerTorrentStatus) => void>;
  serverUrl: string;
  torrent: TorrServerTorrentStatus;
}

export const TorrentCard = component$(
  ({
    lang,
    onDrop$,
    onOpenFiles$,
    onRemove$,
    serverUrl,
    torrent,
  }: TorrentCardProps) => {
    const media = parseTorrentMedia(torrent.data);
    const href = getTorrentHref(media, lang);
    const title = media?.title || media?.name || torrent.title || torrent.name;
    const year = media
      ? formatYear(media.release_date ?? media.first_air_date)
      : 0;
    const statusBucket = getTorrentStatusFilter(torrent);

    return (
      <article class="card border-base-200 bg-base-100 min-w-0 shadow-sm">
        <div class="card-body gap-4 p-3 sm:p-4">
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-outline badge-sm px-3 py-2">
              {torrent.mediaKind === "tv"
                ? langText(lang, "Series", "Сериал")
                : torrent.mediaKind === "movie"
                  ? langText(lang, "Movie", "Фильм")
                  : langText(lang, "Other", "Другое")}
            </span>
            <span class="badge badge-ghost badge-sm px-3 py-2">
              {statusBucket === "active"
                ? langText(lang, "Active", "Активный")
                : statusBucket === "database"
                  ? langText(lang, "Stored", "В базе")
                  : langText(lang, "Other", "Другое")}
            </span>
            {torrent.statusLabel && (
              <span class="badge badge-outline badge-sm px-3 py-2 text-center leading-tight whitespace-normal">
                {torrent.statusLabel}
              </span>
            )}
            <span class="badge badge-outline badge-sm px-3 py-2">
              {formatTorrentSize(torrent.torrent_size)}
            </span>
            <span class="badge badge-outline badge-sm px-3 py-2">
              {langText(
                lang,
                `${torrent.fileCount} files`,
                `${torrent.fileCount} файлов`,
              )}
            </span>
          </div>

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              class="block min-w-0"
            >
              <MediaCard
                title={title}
                width={300}
                rating={media?.vote_average ?? null}
                year={year}
                picfile={torrent.poster}
                variant="poster"
                layout="grid"
              />
            </a>
          ) : (
            <div class="block min-w-0">
              <MediaCard
                title={title}
                width={300}
                rating={media?.vote_average ?? null}
                year={year}
                picfile={torrent.poster}
                variant="poster"
                layout="grid"
              />
            </div>
          )}

          <div class="space-y-3">
            <div class="stats stats-vertical bg-base-200/45 sm:stats-horizontal w-full shadow-none">
              <div class="stat min-w-0 overflow-hidden px-3 py-2">
                <div class="stat-title text-xs">
                  {langText(lang, "Peers", "Пиры")}
                </div>
                <div class="stat-value text-sm">{torrent.total_peers || 0}</div>
                <div class="stat-desc truncate">
                  {torrent.connected_seeders || 0}{" "}
                  {langText(lang, "seeders", "сидеров")}
                </div>
              </div>
              <div class="stat min-w-0 overflow-hidden px-3 py-2">
                <div class="stat-title text-xs">
                  {langText(lang, "Down", "Скач.")}
                </div>
                <div class="stat-value text-success text-sm">
                  {formatTransferSpeed(torrent.download_speed)}
                </div>
              </div>
              <div class="stat min-w-0 overflow-hidden px-3 py-2">
                <div class="stat-title text-xs">
                  {langText(lang, "Up", "Отд.")}
                </div>
                <div class="stat-value text-info text-sm">
                  {formatTransferSpeed(torrent.upload_speed)}
                </div>
              </div>
            </div>

            <p class="text-base-content/70 line-clamp-2 px-1 text-xs wrap-break-word">
              {torrent.name || torrent.title}
            </p>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                onClick$={() => onOpenFiles$(torrent)}
              >
                <LuFolderOpen class="text-base" />
                <span>{langText(lang, "Files", "Файлы")}</span>
              </button>
              <a
                href={buildTorrentPlaylistUrl(serverUrl, torrent.hash)}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline btn-sm"
              >
                <LuListMusic class="text-base" />
                <span>{langText(lang, "Playlist", "Плейлист")}</span>
              </a>
              <a
                href={buildMagnetFromHash(torrent.hash)}
                target="_blank"
                rel="noreferrer"
                class="btn btn-info btn-outline btn-sm"
              >
                <LuMagnet class="text-base" />
                <span>{langText(lang, "Magnet", "Магнет")}</span>
              </a>
              <button
                type="button"
                class="btn btn-warning btn-outline btn-sm"
                onClick$={() => onDrop$(torrent)}
              >
                <LuPause class="text-base" />
                <span>{langText(lang, "Drop", "Стоп")}</span>
              </button>
              <button
                type="button"
                class="btn btn-error btn-outline btn-sm"
                onClick$={() => onRemove$(torrent)}
              >
                <LuTrash2 class="text-base" />
                <span>{langText(lang, "Remove", "Удалить")}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  },
);
