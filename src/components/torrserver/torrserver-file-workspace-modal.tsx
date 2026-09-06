import {
  $,
  component$,
  type PropFunction,
  useContext,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { ToastManagerContext } from "qwik-toasts";
import type {
  TorrServerTorrentStatus,
  TorrServerViewedItem,
} from "~/services/torrserver";
import {
  buildTorrentStreamUrl,
  getDefaultPlayableFile,
  markViewedTorrent,
} from "~/services/torrserver";
import { langText } from "~/utils/languages";
import type { TorrServerFileEntry } from "./torrserver-file-list-modal";
import { TorrServerFileListModal } from "./torrserver-file-list-modal";

export const TorrServerFileWorkspaceModal = component$<{
  lang: string;
  loading: boolean;
  onClose$: PropFunction<() => void>;
  onViewedChanged$: PropFunction<(items: TorrServerViewedItem[]) => void>;
  open: boolean;
  serverUrl: string;
  torrent: TorrServerTorrentStatus | null;
}>(
  ({ lang, loading, onClose$, onViewedChanged$, open, serverUrl, torrent }) => {
    const toastManager = useContext(ToastManagerContext);
    const selectedFileId = useSignal<number | null>(null);

    useTask$(({ track }) => {
      const files = track(() => torrent?.files);
      const hash = track(() => torrent?.hash);
      if (!hash || !files?.length) {
        selectedFileId.value = null;
        return;
      }
      if (!files.some((file) => file.id === selectedFileId.value)) {
        selectedFileId.value = getDefaultPlayableFile(files)?.id ?? null;
      }
    });

    const entries: TorrServerFileEntry[] = (torrent?.files ?? []).map(
      (file) => ({
        id: file.id,
        isPrimary: file.id === selectedFileId.value,
        note:
          torrent?.playableFile?.id === file.id
            ? langText(
                lang,
                "Default playback candidate for this torrent.",
                "Файл по умолчанию для воспроизведения этого торрента.",
              )
            : undefined,
        path: file.path,
        size: file.length,
        streamUrl:
          serverUrl && torrent
            ? buildTorrentStreamUrl(serverUrl, {
                filename: file.path,
                index: file.id,
                link: torrent.hash,
                play: true,
              })
            : undefined,
      }),
    );

    const selectFile = $(async (file: TorrServerFileEntry) => {
      if (!serverUrl || !torrent) return;
      selectedFileId.value = file.id;
      try {
        await onViewedChanged$(
          await markViewedTorrent(serverUrl, torrent.hash, file.id),
        );
      } catch {
        // Viewed-state storage is optional on older TorrServer builds.
      }
    });

    const copyStreamUrl = $(async (file: TorrServerFileEntry) => {
      if (!file.streamUrl) return;
      try {
        await navigator.clipboard.writeText(file.streamUrl);
        toastManager.addToast({
          message: langText(
            lang,
            "Stream URL copied.",
            "Ссылка потока скопирована.",
          ),
          type: "success",
          autocloseTime: 4_000,
        });
      } catch {
        toastManager.addToast({
          message: langText(
            lang,
            "Could not copy the stream URL.",
            "Не удалось скопировать ссылку потока.",
          ),
          type: "error",
          autocloseTime: 4_000,
        });
      }
    });

    const loadingProgress = torrent?.torrent_size
      ? ((torrent.preloaded_bytes || 0) / torrent.torrent_size) * 100
      : 0;

    return (
      <TorrServerFileListModal
        open={open}
        title={
          torrent?.title ||
          torrent?.name ||
          langText(lang, "Torrent files", "Файлы торрента")
        }
        subtitle={torrent?.hash}
        files={entries}
        loading={loading}
        loadingLabel={
          torrent
            ? langText(
                lang,
                `Activating · Peers: ${torrent.total_peers || 0}`,
                `Активация · Пиры: ${torrent.total_peers || 0}`,
              )
            : langText(lang, "Activating torrent...", "Активация торрента...")
        }
        loadingProgress={loadingProgress}
        onClose$={onClose$}
        onSelectFile$={selectFile}
        selectActionLabel={langText(
          lang,
          "Select for viewed",
          "Выбрать для отметки",
        )}
        selectedLabel={langText(lang, "Selected", "Выбран")}
        onCopyStreamUrl$={copyStreamUrl}
        streamActionLabel={langText(lang, "Stream", "Поток")}
        copyActionLabel={langText(lang, "Copy URL", "Копировать")}
      />
    );
  },
);
