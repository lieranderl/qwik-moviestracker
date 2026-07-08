import { component$, type PropFunction } from "@builder.io/qwik";
import { TorrServerModal } from "./torrserver-modal";
import { formatBytes, getFileTitle } from "./torrserver-utils";

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
  onSelectFile$?: PropFunction<(file: TorrServerFileEntry) => void>;
  open: boolean;
  playActionLabel?: string;
  selectActionLabel?: string;
  selectedLabel?: string;
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
    onSelectFile$,
    open,
    playActionLabel = "Play",
    selectActionLabel = "Select for viewed",
    selectedLabel = "Selected",
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
        closeLabel="Close torrent files"
        onClose$={onClose$}
      >
        {loading ? (
          <div class="flex flex-col items-center gap-3 py-10">
            <span class="loading loading-spinner loading-lg text-primary" />
            <p class="text-base-content/70 text-sm">{loadingLabel}</p>
            {typeof loadingProgress === "number" && (
              <progress
                class="progress progress-primary w-48"
                max={100}
                value={loadingProgress}
              />
            )}
          </div>
        ) : files.length === 0 ? (
          <div class="alert border-base-200 bg-base-200/40 shadow-none">
            <div>
              <p class="font-semibold">{emptyTitle}</p>
              <p class="text-base-content/70 text-sm leading-relaxed">
                {emptyDescription}
              </p>
            </div>
          </div>
        ) : (
          <div class="space-y-3">
            {files.map((file) => {
              const sizeLabel =
                file.sizeLabel ?? formatBytes(file.size ?? null);
              const titleLabel = file.label || getFileTitle(file.path);

              return (
                <article
                  key={file.id}
                  class="card border-base-200 bg-base-100 border shadow-sm"
                >
                  <div class="card-body gap-4 p-4">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div class="min-w-0 space-y-3">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="badge badge-outline rounded-full font-medium">
                            {sizeLabel}
                          </span>
                          {file.isPrimary && (
                            <span class="badge badge-primary rounded-full font-medium">
                              {selectedLabel}
                            </span>
                          )}
                        </div>

                        <div class="space-y-1">
                          <h4 class="min-w-0 text-base font-semibold wrap-break-word md:text-lg">
                            {titleLabel}
                          </h4>
                          {file.path && file.path !== titleLabel && (
                            <p class="text-base-content/65 text-xs leading-relaxed break-all">
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

                      <div class="flex flex-wrap gap-2">
                        {onSelectFile$ && (
                          <button
                            type="button"
                            aria-pressed={file.isPrimary}
                            class={`btn min-h-11 flex-1 sm:flex-none ${
                              file.isPrimary ? "btn-primary" : "btn-outline"
                            }`}
                            disabled={file.isPrimary}
                            onClick$={async () => onSelectFile$(file)}
                          >
                            {file.isPrimary ? selectedLabel : selectActionLabel}
                          </button>
                        )}
                        {onPlayFile$ && (
                          <button
                            type="button"
                            class="btn btn-primary min-h-11 flex-1 sm:flex-none"
                            onClick$={async () => onPlayFile$(file)}
                          >
                            {playActionLabel}
                          </button>
                        )}
                        {file.streamUrl && onOpenStream$ && (
                          <a
                            href={file.streamUrl}
                            class="btn btn-outline min-h-11 flex-1 sm:flex-none"
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
                            class="btn btn-ghost min-h-11 flex-1 sm:flex-none"
                            onClick$={async () => onCopyStreamUrl$(file)}
                          >
                            {copyActionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </TorrServerModal>
    );
  },
);
