import { component$, type PropFunction } from "@builder.io/qwik";
import { TorrServerModal } from "./torrserver-modal";
import {
  formatBytes,
  getFileTitle,
  getToneSurfaceClass,
} from "./torrserver-utils";


export type TorrServerFileEntry = {
  description?: string;
  id: number;
  isPrimary?: boolean;
  label?: string;
  note?: string;
  path?: string;
  playUrl?: string;
  size?: number;
  sizeLabel?: string;
  streamUrl?: string;
  tags?: string[];
};

export interface TorrServerFileListModalProps {
  copyActionLabel?: string;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  files: TorrServerFileEntry[];
  loading?: boolean;
  loadingLabel?: string;
  loadingProgress?: number;
  onClose$?: PropFunction<() => void>;
  onCopyStreamUrl$?: PropFunction<(file: TorrServerFileEntry) => void>;
  onOpenStream$?: PropFunction<(file: TorrServerFileEntry) => void>;
  onPlayFile$?: PropFunction<(file: TorrServerFileEntry) => void>;
  open: boolean;
  playActionLabel?: string;
  streamActionLabel?: string;
  streamTooltip?: string;
  subtitle?: string;
  title: string;
}

export const TorrServerFileListModal = component$(
  ({
    copyActionLabel = "Copy URL",
    emptyDescription = "No playable files were found for this torrent.",
    emptyTitle = "No files available",
    files,
    loading = false,
    loadingLabel = "Activating torrent and loading file list...",
    loadingProgress,
    onClose$,
    onCopyStreamUrl$,
    onOpenStream$,
    onPlayFile$,
    open,
    playActionLabel = "Play",
    streamActionLabel = "Stream",
    streamTooltip = "Opens in browser. Not all codecs are supported — audio or video may not play. Use Copy URL and paste into an external player (VLC, mpv) for full experience.",
    subtitle,
    title,
  }: TorrServerFileListModalProps) => {
    return (
      <TorrServerModal
        open={open}
        title={title}
        subtitle={subtitle}
        onClose$={onClose$}
      >
        {loading ? (
          <div class="flex flex-col items-center gap-3 py-10">
            <span class="loading loading-spinner loading-lg text-primary" />
            <p class="text-base-content/70 text-sm">{loadingLabel}</p>
            {typeof loadingProgress === "number" && (
              <progress class="progress progress-primary w-48" max={100} value={loadingProgress} />
            )}
          </div>
        ) : files.length === 0 ? (
          <div
            class={`rounded-box border p-5 text-sm shadow-none ${getToneSurfaceClass("neutral")}`}
          >
            <p class="font-semibold">{emptyTitle}</p>
            <p class="text-base-content/70 mt-1 leading-relaxed">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <section class="space-y-3">
            {files.map((file) => {
              const sizeLabel =
                file.sizeLabel ?? formatBytes(file.size ?? null);
              const titleLabel = file.label || getFileTitle(file.path);

              return (
                <article
                  key={file.id}
                  class="rounded-box border-base-200 bg-base-100 border p-4 shadow-sm"
                >
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div class="min-w-0 space-y-3">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="badge badge-outline rounded-full px-3 py-3 font-medium">
                          {sizeLabel}
                        </span>
                      </div>

                      <div class="space-y-1">
                        <h4 class="min-w-0 break-words text-base font-semibold md:text-lg">
                          {titleLabel}
                        </h4>
                        {file.path && file.path !== titleLabel && (
                          <p class="text-base-content/65 break-all text-xs leading-relaxed">
                            {file.path}
                          </p>
                        )}
                        {file.note && (
                          <p class="text-base-content/70 text-sm leading-relaxed">
                            {file.note}
                          </p>
                        )}
                        {file.description && (
                          <p class="text-base-content/60 text-xs leading-relaxed">
                            {file.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div class="flex shrink-0 flex-wrap gap-2">
                      {onPlayFile$ && (
                        <button
                          type="button"
                          class="btn btn-sm btn-primary"
                          onClick$={async () => onPlayFile$(file)}
                        >
                          {playActionLabel}
                        </button>
                      )}
                      {file.streamUrl && onOpenStream$ && (
                        <a
                          href={file.streamUrl}
                          class="btn btn-sm btn-outline tooltip tooltip-bottom"
                          data-tip={streamTooltip}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {streamActionLabel}
                        </a>
                      )}
                      {file.streamUrl && onCopyStreamUrl$ && (
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost"
                          onClick$={async () => onCopyStreamUrl$(file)}
                        >
                          {copyActionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </TorrServerModal>
    );
  },
);
