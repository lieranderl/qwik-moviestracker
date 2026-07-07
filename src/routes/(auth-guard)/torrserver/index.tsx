import {
  $,
  component$,
  useComputed$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { setValue, useForm } from "@modular-forms/qwik";
import type { PartialValues } from "@modular-forms/qwik";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { ToastManagerContext } from "qwik-toasts";
import { MediaGrid } from "~/components/media-grid";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeading,
} from "~/components/page-feedback";
import {
  TorrServerApiToolsModal,
  TorrServerFileListModal,
  TorrServerSummaryCard,
} from "~/components/torrserver";
import type {
  TorrServerApiSearchResult,
  TorrServerFileEntry,
  TorrServerSummaryBadge,
  TorrServerSummaryMetric,
} from "~/components/torrserver";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import type { TSResult } from "~/services/models";
import {
  activateTorrent,
  addTorrentByLink,
  buildTorrServerDownloadTestUrl,
  buildTorrentPlaylistUrl,
  buildTorrentStreamUrl,
  dropTorrent,
  getTorrServerSettings,
  getTorrServerStats,
  getTorrServerStorageSettings,
  getTorrServerTMDBSettings,
  getTorrServerVersion,
  listTorrent,
  listViewedTorrents,
  markViewedTorrent,
  removeTorrent,
  removeViewedTorrent,
  searchRutor,
  searchTorznab,
  updateTorrServerStorageSettings,
  type TorrServerSearchResult,
  type TorrServerSettings,
  type TorrServerStorageSettings,
  type TorrServerTmdbSettings,
  type TorrServerTorrentStatus,
  type TorrServerViewedItem,
  uploadTorrentFile,
  validateTorrServerUploadFile,
} from "~/services/torrserver";
import { readStorageString } from "~/utils/browser";
import {
  langAddNewTorrServerURL,
  langCountLabel,
  langNoResults,
  langText,
  langTorrServer,
} from "~/utils/languages";
import {
  applyServersState,
  connectionAlertClass,
  filterTorrServerTorrents,
  formatTransferSpeed,
  getDefaultSelectedTorrentHash,
  getHydratedServersState,
  getSelectedFile,
  normalizeServer,
  persistServersStorage,
  sortTorrents,
  type ConnectionState,
  type TorrServerSortKey,
  type TorrServerStatusFilter,
} from "./torrserver-state";
import { TorrentCard } from "./torrserver-card";
import { TorrServerFilters } from "./torrserver-filters";

type TorrServerForm = { ipaddress: string };

const getConnectionLabel = (state: ConnectionState, lang: string): string => {
  switch (state) {
    case "connected":
      return langText(lang, "Connected", "Подключено");
    case "connecting":
      return langText(lang, "Checking", "Проверка");
    case "error":
      return langText(lang, "Failed", "Ошибка");
    default:
      return langText(lang, "Waiting", "Ожидание");
  }
};

export default component$(() => {
  const resource = useQueryParamsLoader();
  const toastManager = useContext(ToastManagerContext);
  const lang = resource.value.lang;

  const selectedTorServer = useSignal("");
  const torrServerList = useSignal<string[]>([]);
  const isCheckingTorrServer = useSignal(false);
  const torrentsSig = useSignal<TorrServerTorrentStatus[]>([]);
  const connectionState = useSignal<ConnectionState>("idle");
  const connectionMessage = useSignal(
    langText(lang, "Add a TorrServer URL.", "Добавьте URL TorrServer."),
  );
  const serverVersion = useSignal("");
  const settingsSig = useSignal<TorrServerSettings | null>(null);
  const storageSettingsSig = useSignal<TorrServerStorageSettings | null>(null);
  const tmdbSettingsSig = useSignal<TorrServerTmdbSettings | null>(null);
  const statsTextSig = useSignal("");
  const viewedItemsSig = useSignal<TorrServerViewedItem[]>([]);
  const activatingHashSig = useSignal("");

  const querySig = useSignal("");
  const statusFilterSig = useSignal<TorrServerStatusFilter>("all");
  const sortKeySig = useSignal<TorrServerSortKey>("recent");
  const selectedTorrentHash = useSignal("");
  const selectedFileId = useSignal<number | null>(null);
  const fileModalOpen = useSignal(false);
  const apiToolsModalOpen = useSignal(false);
  const apiQuerySig = useSignal("");
  const addLinkBusySig = useSignal(false);
  const uploadBusySig = useSignal(false);
  const uploadFileSig = useSignal<File | null>(null);
  const uploadValidationMessageSig = useSignal("");
  const searchBusySig = useSignal(false);
  const searchSourceSig = useSignal<"rutor" | "torznab" | null>(null);
  const searchResultsSig = useSignal<TorrServerSearchResult[]>([]);
  const storageUpdateBusySig = useSignal(false);
  const storageDraftSettingsSig = useSignal("json");
  const storageDraftViewedSig = useSignal("json");
  const viewedActionBusySig = useSignal(false);
  const downloadSizeSig = useSignal("128");
  const addLinkSig = useSignal("");
  const addTitleSig = useSignal("");
  const addCategorySig = useSignal("other");
  const addSaveToDbSig = useSignal(true);

  const validateTorrServer = $((values: PartialValues<TorrServerForm>) => {
    const ip = values.ipaddress?.trim() ?? "";
    if (!ip)
      return {
        ipaddress: langText(
          lang,
          "Please provide a valid URL!",
          "Укажите корректный URL!",
        ),
      };
    try {
      new URL(ip);
      return {};
    } catch {
      return {
        ipaddress: langText(
          lang,
          "Please provide a valid URL!",
          "Укажите корректный URL!",
        ),
      };
    }
  });

  const [newTorrServerForm, { Form, Field }] = useForm<TorrServerForm>({
    loader: { value: { ipaddress: "" } },
    validate: validateTorrServer,
  });

  /* ── Server lifecycle ──────────────────────────────────── */

  const loadServerSnapshot = $(async (serverUrl: string): Promise<void> => {
    torrentsSig.value = [];
    serverVersion.value = "";
    settingsSig.value = null;
    storageSettingsSig.value = null;
    tmdbSettingsSig.value = null;
    statsTextSig.value = "";
    viewedItemsSig.value = [];
    searchResultsSig.value = [];
    searchSourceSig.value = null;

    if (!serverUrl) {
      connectionState.value = "idle";
      connectionMessage.value =
        torrServerList.value.length > 0
          ? langText(
              lang,
              "Select a saved server.",
              "Выберите сохраненный сервер.",
            )
          : langText(lang, "Add a TorrServer URL.", "Добавьте URL TorrServer.");
      return;
    }

    try {
      isCheckingTorrServer.value = true;
      connectionState.value = "connecting";
      connectionMessage.value = langText(
        lang,
        `Connecting to ${serverUrl}...`,
        `Подключение к ${serverUrl}...`,
      );

      const settled = await Promise.allSettled([
        getTorrServerVersion(serverUrl),
        listTorrent(serverUrl),
        getTorrServerSettings(serverUrl),
        getTorrServerStorageSettings(serverUrl),
        getTorrServerTMDBSettings(serverUrl),
        getTorrServerStats(serverUrl),
        listViewedTorrents(serverUrl),
      ]);
      const val = <T,>(r: PromiseSettledResult<T>, fb: T): T =>
        r.status === "fulfilled" ? r.value : fb;

      const version = val(settled[0], "");
      if (!version) throw new Error("Echo endpoint did not respond");

      serverVersion.value = version;
      torrentsSig.value = val(settled[1], []);
      settingsSig.value = val(settled[2], null);
      const storage = val(settled[3], null);
      storageSettingsSig.value = storage;
      tmdbSettingsSig.value = val(settled[4], null);
      statsTextSig.value = val(settled[5], "");
      viewedItemsSig.value = val(settled[6], []);
      if (storage) {
        storageDraftSettingsSig.value =
          storage.settings === "bbolt" ? "bbolt" : "json";
        storageDraftViewedSig.value =
          storage.viewed === "bbolt" ? "bbolt" : "json";
      }
      connectionState.value = "connected";
      connectionMessage.value = langText(
        lang,
        `Connected to ${serverUrl}`,
        `Подключено к ${serverUrl}`,
      );
    } catch (error) {
      console.error(error);
      connectionState.value = "error";
      connectionMessage.value = langText(
        lang,
        `Failed to reach ${serverUrl}`,
        `Не удалось подключиться к ${serverUrl}`,
      );
    } finally {
      isCheckingTorrServer.value = false;
    }
  });

  /* ── Computed state ────────────────────────────────────── */

  const filteredTorrentsSig = useComputed$(() =>
    sortTorrents(
      filterTorrServerTorrents(
        torrentsSig.value as TSResult[],
        querySig.value,
        statusFilterSig.value,
      ) as TorrServerTorrentStatus[],
      sortKeySig.value,
    ),
  );

  const selectedTorrentSig = useComputed$(
    () =>
      filteredTorrentsSig.value.find(
        (t) => t.hash === selectedTorrentHash.value,
      ) ||
      filteredTorrentsSig.value[0] ||
      null,
  );

  const selectedFileSig = useComputed$(() =>
    getSelectedFile(selectedTorrentSig.value?.files, selectedFileId.value),
  );

  const selectedViewedSig = useComputed$(() => {
    const hash = selectedTorrentSig.value?.hash;
    if (!hash) return false;
    const fid = selectedFileSig.value?.id;
    return viewedItemsSig.value.some((item) => {
      if (item.hash !== hash) return false;
      if (fid === null || fid === undefined) return true;
      return item.file_index === fid;
    });
  });

  const fileEntriesSig = useComputed$<TorrServerFileEntry[]>(() => {
    const server = selectedTorServer.value;
    const torrent = selectedTorrentSig.value;
    if (!server || !torrent) return [];
    return torrent.files.map((file) => ({
      id: file.id,
      isPrimary: file.id === selectedFileSig.value?.id,
      note:
        torrent.playableFile?.id === file.id
          ? langText(
              lang,
              "Default playback candidate for this torrent.",
              "Файл по умолчанию для воспроизведения этого торрента.",
            )
          : undefined,
      path: file.path,
      size: file.length,
      streamUrl: buildTorrentStreamUrl(server, {
        filename: file.path,
        index: file.id,
        link: torrent.hash,
        play: true,
      }),
    }));
  });

  const summaryMetrics = useComputed$<TorrServerSummaryMetric[]>(() => [
    {
      label: langText(lang, "Servers", "Серверы"),
      value: torrServerList.value.length,
    },
    {
      label: langText(lang, "Library", "Библиотека"),
      value: isCheckingTorrServer.value ? "..." : torrentsSig.value.length,
    },
    {
      label: langText(lang, "Version", "Версия"),
      value:
        serverVersion.value || langText(lang, "Not connected", "Не подключено"),
    },
    {
      label: langText(lang, "Viewed", "Просмотрено"),
      value: viewedItemsSig.value.length,
    },
  ]);

  const summaryBadges = useComputed$<TorrServerSummaryBadge[]>(() => {
    const badges: TorrServerSummaryBadge[] = [];
    if (settingsSig.value) {
      badges.push({
        label: settingsSig.value.useDisk
          ? langText(lang, "Disk cache", "Дисковый кэш")
          : langText(lang, "Memory cache", "Память"),
        tone: settingsSig.value.useDisk ? "warning" : "info",
      });
    }
    if (storageSettingsSig.value) {
      badges.push({
        label: langText(
          lang,
          `Viewed storage: ${storageSettingsSig.value.viewed}`,
          `Хранилище просмотренного: ${storageSettingsSig.value.viewed}`,
        ),
      });
    }
    return badges;
  });

  /* ── Actions ───────────────────────────────────────────── */

  const hydrateServers = $(() => {
    const s = getHydratedServersState(
      readStorageString("torrServerList"),
      readStorageString("selectedTorServer", ""),
    );
    applyServersState(s.list, s.selected, torrServerList, selectedTorServer);
    persistServersStorage(s);
  });

  const addTorrserver = $(async (values: TorrServerForm) => {
    const srv = normalizeServer(values.ipaddress);
    if (torrServerList.value.includes(srv)) {
      setValue(newTorrServerForm, "ipaddress", "");
      toastManager.addToast({
        message: langText(
          lang,
          `TorrServer ${srv} is already in the list!`,
          `TorrServer ${srv} уже есть в списке!`,
        ),
        type: "error",
        autocloseTime: 5000,
      });
      return;
    }
    const ns = applyServersState(
      [...torrServerList.value, srv],
      srv,
      torrServerList,
      selectedTorServer,
    );
    persistServersStorage(ns);
    setValue(newTorrServerForm, "ipaddress", "");
    toastManager.addToast({
      message: langText(
        lang,
        `TorrServer ${srv} has been added.`,
        `TorrServer ${srv} добавлен.`,
      ),
      type: "success",
      autocloseTime: 5000,
    });
  });

  const removeActiveServer = $(async () => {
    const cur = selectedTorServer.value;
    if (!cur) return;
    const confirmed = globalThis.confirm(
      langText(
        lang,
        `Remove TorrServer ${cur} from this browser?`,
        `Удалить TorrServer ${cur} из этого браузера?`,
      ),
    );
    if (!confirmed) return;
    const next = torrServerList.value.filter((s) => s !== cur);
    const ns = applyServersState(
      next,
      next[0] || "",
      torrServerList,
      selectedTorServer,
    );
    persistServersStorage(ns);
    toastManager.addToast({
      message: langText(
        lang,
        `TorrServer ${cur} has been deleted.`,
        `TorrServer ${cur} удален.`,
      ),
      type: "success",
      autocloseTime: 5000,
    });
  });

  const addLinkToServer = $(async () => {
    if (!selectedTorServer.value) return;
    const link = addLinkSig.value.trim();
    if (!link) {
      toastManager.addToast({
        message: langText(
          lang,
          "Please provide a torrent or magnet link.",
          "Укажите торрент или magnet ссылку.",
        ),
        type: "error",
        autocloseTime: 4000,
      });
      return;
    }
    addLinkBusySig.value = true;
    try {
      await addTorrentByLink(selectedTorServer.value, {
        category: addCategorySig.value || "other",
        link,
        saveToDb: addSaveToDbSig.value,
        title: addTitleSig.value.trim() || link,
      });
      toastManager.addToast({
        message: langText(
          lang,
          "Link has been sent to TorrServer.",
          "Ссылка отправлена в TorrServer.",
        ),
        type: "success",
        autocloseTime: 4000,
      });
      addLinkSig.value = "";
      addTitleSig.value = "";
      await loadServerSnapshot(selectedTorServer.value);
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not add link to TorrServer.",
          "Не удалось добавить ссылку в TorrServer.",
        ),
        type: "error",
        autocloseTime: 5000,
      });
    } finally {
      addLinkBusySig.value = false;
    }
  });

  const uploadTorrentToServer = $(async () => {
    if (!selectedTorServer.value || !uploadFileSig.value) return;
    const validation = validateTorrServerUploadFile(
      uploadFileSig.value,
      uploadFileSig.value.name,
    );
    if (!validation.ok) {
      uploadValidationMessageSig.value = validation.message;
      toastManager.addToast({
        message: validation.message,
        type: "error",
        autocloseTime: 5000,
      });
      return;
    }
    uploadBusySig.value = true;
    try {
      await uploadTorrentFile(selectedTorServer.value, {
        category: "other",
        file: uploadFileSig.value,
        fileName: validation.fileName,
        saveToDb: true,
        title: validation.fileName,
      });
      toastManager.addToast({
        message: langText(
          lang,
          "Torrent file uploaded successfully.",
          "Файл торрента успешно загружен.",
        ),
        type: "success",
        autocloseTime: 5000,
      });
      uploadFileSig.value = null;
      uploadValidationMessageSig.value = "";
      await loadServerSnapshot(selectedTorServer.value);
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Upload failed. Check TorrServer permissions.",
          "Загрузка не удалась. Проверьте права в TorrServer.",
        ),
        type: "error",
        autocloseTime: 5000,
      });
    } finally {
      uploadBusySig.value = false;
    }
  });

  const runApiSearch = $(async (source: "rutor" | "torznab") => {
    if (!selectedTorServer.value || !apiQuerySig.value.trim()) return;
    searchBusySig.value = true;
    searchSourceSig.value = source;
    try {
      searchResultsSig.value =
        source === "rutor"
          ? await searchRutor(selectedTorServer.value, apiQuerySig.value.trim())
          : await searchTorznab(
              selectedTorServer.value,
              apiQuerySig.value.trim(),
            );
    } catch (error) {
      console.error(error);
      searchResultsSig.value = [];
      toastManager.addToast({
        message: langText(
          lang,
          "Search request failed for selected endpoint.",
          "Поисковый запрос к выбранному эндпоинту завершился ошибкой.",
        ),
        type: "error",
        autocloseTime: 5000,
      });
    } finally {
      searchBusySig.value = false;
    }
  });

  const addSearchResultToServer = $(
    async (result: TorrServerApiSearchResult) => {
      if (!selectedTorServer.value) return;
      const link = result.magnet || result.link || result.torrent;
      if (!link) {
        toastManager.addToast({
          message: langText(
            lang,
            "This result does not include a torrent link.",
            "Этот результат не содержит торрент-ссылки.",
          ),
          type: "warning",
          autocloseTime: 4500,
        });
        return;
      }
      addLinkBusySig.value = true;
      try {
        await addTorrentByLink(selectedTorServer.value, {
          category: "other",
          link,
          poster: result.poster || "",
          saveToDb: true,
          title: result.name || link,
        });
        toastManager.addToast({
          message: langText(
            lang,
            "Search result added to TorrServer.",
            "Результат поиска добавлен в TorrServer.",
          ),
          type: "success",
          autocloseTime: 4000,
        });
        await loadServerSnapshot(selectedTorServer.value);
      } catch (error) {
        console.error(error);
        toastManager.addToast({
          message: langText(
            lang,
            "Could not add search result to TorrServer.",
            "Не удалось добавить результат поиска в TorrServer.",
          ),
          type: "error",
          autocloseTime: 5000,
        });
      } finally {
        addLinkBusySig.value = false;
      }
    },
  );

  const updateStorageBackend = $(async () => {
    if (!selectedTorServer.value) return;
    storageUpdateBusySig.value = true;
    try {
      await updateTorrServerStorageSettings(selectedTorServer.value, {
        settings: storageDraftSettingsSig.value === "bbolt" ? "bbolt" : "json",
        viewed: storageDraftViewedSig.value === "bbolt" ? "bbolt" : "json",
      });
      toastManager.addToast({
        message: langText(
          lang,
          "Storage mode updated. Restart TorrServer to fully apply changes.",
          "Режим хранилища обновлен. Перезапустите TorrServer для полного применения.",
        ),
        type: "success",
        autocloseTime: 5500,
      });
      await loadServerSnapshot(selectedTorServer.value);
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not update storage mode.",
          "Не удалось обновить режим хранилища.",
        ),
        type: "error",
        autocloseTime: 5000,
      });
    } finally {
      storageUpdateBusySig.value = false;
    }
  });

  const markSelectedViewed = $(async () => {
    if (!selectedTorServer.value || !selectedTorrentSig.value) return;
    const fi =
      selectedFileSig.value?.id ??
      selectedTorrentSig.value.playableFile?.id ??
      0;
    viewedActionBusySig.value = true;
    try {
      viewedItemsSig.value = await markViewedTorrent(
        selectedTorServer.value,
        selectedTorrentSig.value.hash,
        fi,
      );
      toastManager.addToast({
        message: langText(
          lang,
          "Viewed entry added.",
          "Запись о просмотре добавлена.",
        ),
        type: "success",
        autocloseTime: 3500,
      });
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not mark torrent as viewed.",
          "Не удалось отметить торрент как просмотренный.",
        ),
        type: "error",
        autocloseTime: 4500,
      });
    } finally {
      viewedActionBusySig.value = false;
    }
  });

  const removeSelectedViewed = $(async () => {
    if (!selectedTorServer.value || !selectedTorrentSig.value) return;
    viewedActionBusySig.value = true;
    try {
      viewedItemsSig.value = await removeViewedTorrent(
        selectedTorServer.value,
        selectedTorrentSig.value.hash,
        selectedFileSig.value?.id,
      );
      toastManager.addToast({
        message: langText(
          lang,
          "Viewed entry removed.",
          "Запись о просмотре удалена.",
        ),
        type: "success",
        autocloseTime: 3500,
      });
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not remove viewed entry.",
          "Не удалось удалить запись о просмотре.",
        ),
        type: "error",
        autocloseTime: 4500,
      });
    } finally {
      viewedActionBusySig.value = false;
    }
  });

  const activateAndPollTorrent = $(
    async (hash: string): Promise<TorrServerTorrentStatus | null> => {
      if (!selectedTorServer.value) return null;
      const baseUrl = selectedTorServer.value;
      activatingHashSig.value = hash;
      const activated = await activateTorrent(baseUrl, hash);
      if (activated && activated.files.length > 0) {
        torrentsSig.value = torrentsSig.value.map((t) =>
          t.hash === hash ? activated : t,
        );
        activatingHashSig.value = "";
        return activated;
      }
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const fresh = await activateTorrent(baseUrl, hash);
          if (fresh) {
            torrentsSig.value = torrentsSig.value.map((t) =>
              t.hash === hash ? fresh : t,
            );
            if (fresh.files.length > 0) {
              activatingHashSig.value = "";
              return fresh;
            }
          }
        } catch {
          /* keep polling */
        }
      }
      activatingHashSig.value = "";
      return null;
    },
  );

  const openFilesForTorrent = $(async (torrent: TorrServerTorrentStatus) => {
    selectedTorrentHash.value = torrent.hash;
    selectedFileId.value = getSelectedFile(torrent.files, null)?.id ?? null;
    fileModalOpen.value = true;
    if (torrent.files.length === 0) {
      const activated = await activateAndPollTorrent(torrent.hash);
      if (activated)
        selectedFileId.value =
          getSelectedFile(activated.files, null)?.id ?? null;
    }
  });

  const copyStreamUrl = $(async (file: TorrServerFileEntry) => {
    if (!file.streamUrl) return;
    try {
      await navigator.clipboard.writeText(file.streamUrl);
      toastManager.addToast({
        message: langText(
          lang,
          "Stream URL copied to clipboard.",
          "Ссылка потока скопирована в буфер обмена.",
        ),
        type: "success",
        autocloseTime: 4000,
      });
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not copy the stream URL.",
          "Не удалось скопировать ссылку потока.",
        ),
        type: "error",
        autocloseTime: 4000,
      });
    }
  });

  const openStreamUrl = $((file: TorrServerFileEntry) => {
    if (file.streamUrl)
      window.open(file.streamUrl, "_blank", "noopener,noreferrer");
  });

  const dropTorrentFromServer = $(async (torrent: TorrServerTorrentStatus) => {
    if (!selectedTorServer.value) return;
    const confirmed = globalThis.confirm(
      langText(
        lang,
        `Drop "${torrent.title || torrent.name}" from active playback?`,
        `Остановить "${torrent.title || torrent.name}" в активном воспроизведении?`,
      ),
    );
    if (!confirmed) return;
    try {
      await dropTorrent(selectedTorServer.value, torrent.hash);
      toastManager.addToast({
        message: langText(lang, "Torrent dropped.", "Торрент остановлен."),
        type: "success",
        autocloseTime: 4000,
      });
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: langText(
          lang,
          "Could not drop torrent.",
          "Не удалось остановить торрент.",
        ),
        type: "error",
        autocloseTime: 5000,
      });
    }
  });

  const removeTorrentFromLibrary = $(
    async (torrent: TorrServerTorrentStatus) => {
      if (!selectedTorServer.value) return;
      const confirmed = globalThis.confirm(
        langText(
          lang,
          `Remove "${torrent.title || torrent.name}" from TorrServer?`,
          `Удалить "${torrent.title || torrent.name}" из TorrServer?`,
        ),
      );
      if (!confirmed) return;
      try {
        await removeTorrent(selectedTorServer.value, torrent.hash);
        toastManager.addToast({
          message: langText(
            lang,
            "Torrent has been deleted!",
            "Торрент удален!",
          ),
          type: "success",
          autocloseTime: 5000,
        });
        await loadServerSnapshot(selectedTorServer.value);
      } catch (error) {
        console.error(error);
        toastManager.addToast({
          message:
            error instanceof Error
              ? error.message
              : langText(
                  lang,
                  "Unable to delete torrent!",
                  "Не удалось удалить торрент!",
                ),
          type: "error",
          autocloseTime: 5000,
        });
      }
    },
  );

  /* ── Side effects ──────────────────────────────────────── */

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    hydrateServers();
  });

  useTask$(async ({ track }) => {
    track(() => selectedTorServer.value);
    fileModalOpen.value = false;
    await loadServerSnapshot(selectedTorServer.value);
  });

  useTask$(({ track }) => {
    track(() => filteredTorrentsSig.value);
    selectedTorrentHash.value = getDefaultSelectedTorrentHash(
      filteredTorrentsSig.value as TSResult[],
      selectedTorrentHash.value,
    );
    selectedFileId.value =
      getSelectedFile(selectedTorrentSig.value?.files, selectedFileId.value)
        ?.id ?? null;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    const baseUrl = track(() => selectedTorServer.value);
    const connState = track(() => connectionState.value);
    if (!baseUrl || connState !== "connected") return;
    const poll = async () => {
      try {
        const updated = await listTorrent(baseUrl);
        const current = torrentsSig.value;
        const activatingHash = activatingHashSig.value;
        torrentsSig.value = updated.map((polled) => {
          const existing = current.find((t) => t.hash === polled.hash);
          if (!existing) return polled;
          const preserveFiles =
            existing.files.length > 0 && polled.files.length === 0;
          const preservePreload =
            polled.hash === activatingHash &&
            (existing.preloaded_bytes || 0) > (polled.preloaded_bytes || 0);
          if (preserveFiles || preservePreload) {
            return {
              ...polled,
              ...(preserveFiles && {
                files: existing.files,
                file_stats: existing.file_stats,
                fileCount: existing.fileCount,
                playableFile: existing.playableFile,
              }),
              ...(preservePreload && {
                preloaded_bytes: existing.preloaded_bytes,
              }),
            };
          }
          return polled;
        });
      } catch (error) {
        console.error("Live stats poll failed", error);
      }
    };
    const id = setInterval(poll, 2000);
    cleanup(() => clearInterval(id));
  });

  const visibleCount = filteredTorrentsSig.value.length;

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div class="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <SectionHeading title={langTorrServer(lang)} />

      <div class="grid min-w-0 gap-6">
        {/* ── Connection workspace ─────────────────────────── */}
        <section class="card border-base-200 bg-base-100 border shadow-sm">
          <div class="card-body gap-4 p-4 md:gap-5 md:p-6">
            <div class="space-y-1">
              <h2 class="card-title text-xl">
                {langText(lang, "Servers", "Серверы")}
              </h2>
            </div>

            <Form onSubmit$={addTorrserver} class="space-y-2">
              <Field name="ipaddress">
                {(field, props) => (
                  <div class="space-y-2">
                    <div class="join join-vertical sm:join-horizontal w-full">
                      <label
                        class="input input-bordered join-item flex w-full min-w-0 items-center gap-2 text-base"
                        for="torrserver-url"
                      >
                        <span class="label text-base-content/65 shrink-0 text-xs font-medium tracking-[0.12em] uppercase">
                          {langText(lang, "URL", "Адрес")}
                        </span>
                        <input
                          {...props}
                          id="torrserver-url"
                          type="url"
                          placeholder={langAddNewTorrServerURL(lang)}
                          class="h-11 min-w-0 grow"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={newTorrServerForm.invalid}
                        class="btn btn-primary join-item min-h-11 w-full justify-center sm:w-32 sm:shrink-0"
                      >
                        <HiPlusSolid class="text-lg" />
                        {langText(lang, "Add", "Добавить")}
                      </button>
                    </div>
                    {field.error && (
                      <p class="text-error text-xs">{field.error}</p>
                    )}
                  </div>
                )}
              </Field>
            </Form>

            <div class="space-y-2">
              <label class="label px-0 pt-0" for="active-torrserver">
                <span class="label-text font-medium">
                  {langText(lang, "Active server", "Активный сервер")}
                </span>
              </label>
              <div class="join join-vertical md:join-horizontal w-full">
                <select
                  id="active-torrserver"
                  value={selectedTorServer.value}
                  class="select select-bordered join-item h-11 min-h-11 w-full min-w-0 text-base"
                  onChange$={(_, el) => {
                    selectedTorServer.value = normalizeServer(el.value);
                    persistServersStorage({
                      list: torrServerList.value,
                      selected: selectedTorServer.value,
                    });
                  }}
                >
                  {torrServerList.value.length === 0 && (
                    <option value="">
                      {langText(
                        lang,
                        "No TorrServer added",
                        "TorrServer не добавлен",
                      )}
                    </option>
                  )}
                  {torrServerList.value.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={
                    !selectedTorServer.value || isCheckingTorrServer.value
                  }
                  class="btn btn-outline join-item min-h-11 w-full justify-center md:w-28 md:shrink-0"
                  onClick$={() => loadServerSnapshot(selectedTorServer.value)}
                >
                  {langText(lang, "Refresh", "Обновить")}
                </button>
                <button
                  type="button"
                  disabled={!selectedTorServer.value}
                  class="btn btn-error btn-outline join-item min-h-11 w-full justify-center md:w-32 md:shrink-0"
                  onClick$={removeActiveServer}
                >
                  <HiMinusSolid class="text-lg" />
                  {langText(lang, "Remove", "Удалить")}
                </button>
              </div>
            </div>

            <div
              role="status"
              class={`alert ${connectionAlertClass(connectionState.value)}`}
            >
              <div class="space-y-1">
                <p class="font-semibold">
                  {connectionState.value === "connected"
                    ? langText(
                        lang,
                        "Connection healthy",
                        "Соединение установлено",
                      )
                    : connectionState.value === "connecting"
                      ? langText(lang, "Checking server", "Проверка сервера")
                      : connectionState.value === "error"
                        ? langText(
                            lang,
                            "Connection failed",
                            "Ошибка подключения",
                          )
                        : langText(
                            lang,
                            "Waiting for a server",
                            "Ожидание сервера",
                          )}
                </p>
                <p class="text-sm">{connectionMessage.value}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Summary card ─────────────────────────────────── */}
        <TorrServerSummaryCard
          title={langText(lang, "Server summary", "Сводка сервера")}
          endpoint={
            selectedTorServer.value ||
            langText(lang, "No endpoint selected", "Сервер не выбран")
          }
          version={serverVersion.value}
          connectionLabel={getConnectionLabel(connectionState.value, lang)}
          metrics={summaryMetrics.value}
          badges={summaryBadges.value}
        >
          <div class="grid min-w-0 gap-3 md:grid-cols-2">
            <div class="card border-base-200 bg-base-200/40 border shadow-none">
              <div class="card-body gap-2 p-4">
                <p class="font-semibold">
                  {langText(lang, "Streaming profile", "Профиль стриминга")}
                </p>
                <p class="text-base-content/70 text-sm leading-relaxed">
                  {settingsSig.value
                    ? langText(
                        lang,
                        `Preload ${settingsSig.value.preloadCache}% · Read ahead ${settingsSig.value.readerReadAhead}% · Connections ${settingsSig.value.connectionsLimit}`,
                        `Предзагрузка ${settingsSig.value.preloadCache}% · Чтение вперед ${settingsSig.value.readerReadAhead}% · Подключения ${settingsSig.value.connectionsLimit}`,
                      )
                    : langText(
                        lang,
                        "Connect a server to inspect cache and network tuning.",
                        "Подключите сервер, чтобы увидеть параметры кэша и сети.",
                      )}
                </p>
              </div>
            </div>
            <div class="card border-base-200 bg-base-200/40 border shadow-none">
              <div class="card-body gap-2 p-4">
                <p class="font-semibold">
                  {langText(lang, "Storage and TMDB", "Хранилище и TMDB")}
                </p>
                <p class="text-base-content/70 text-sm leading-relaxed">
                  {storageSettingsSig.value
                    ? langText(
                        lang,
                        `Settings: ${storageSettingsSig.value.settings} · Viewed: ${storageSettingsSig.value.viewed} (${storageSettingsSig.value.viewedCount})`,
                        `Настройки: ${storageSettingsSig.value.settings} · Просмотры: ${storageSettingsSig.value.viewed} (${storageSettingsSig.value.viewedCount})`,
                      )
                    : langText(
                        lang,
                        "Storage details are not available until a server responds.",
                        "Детали хранилища будут доступны после ответа сервера.",
                      )}
                </p>
              </div>
            </div>
          </div>
          <div class="grid gap-2 sm:flex sm:flex-wrap">
            {selectedTorServer.value && (
              <a
                href={buildTorrentPlaylistUrl(
                  selectedTorServer.value,
                  selectedTorrentSig.value?.hash || "",
                  {},
                )}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline md:btn-sm min-h-11 w-full rounded-full sm:w-auto"
              >
                {langText(
                  lang,
                  "Playlist for selected",
                  "Плейлист для выбранного",
                )}
              </a>
            )}
            {selectedTorServer.value && (
              <a
                href={`${selectedTorServer.value}/playlistall/all.m3u`}
                target="_blank"
                rel="noreferrer"
                class="btn btn-ghost md:btn-sm min-h-11 w-full rounded-full sm:w-auto"
              >
                {langText(lang, "Full library M3U", "M3U всей библиотеки")}
              </a>
            )}
            <button
              type="button"
              class="btn btn-outline md:btn-sm min-h-11 w-full rounded-full sm:w-auto"
              disabled={!selectedTorServer.value}
              onClick$={() => {
                apiToolsModalOpen.value = true;
              }}
            >
              {langText(lang, "Tools", "Инструменты")}
            </button>
          </div>
        </TorrServerSummaryCard>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <TorrServerFilters
        lang={lang}
        querySig={querySig}
        sortKeySig={sortKeySig}
        statusFilterSig={statusFilterSig}
      />

      {/* ── Library grid ─────────────────────────────────── */}
      <section>
        {isCheckingTorrServer.value ? (
          <LoadingState
            title={langText(
              lang,
              "Syncing TorrServer",
              "Синхронизация TorrServer",
            )}
            description={langText(
              lang,
              "Loading library and settings.",
              "Загружаем библиотеку и настройки.",
            )}
            compact={true}
          />
        ) : torrServerList.value.length === 0 ? (
          <EmptyState
            title={langText(
              lang,
              "No TorrServer yet",
              "TorrServer еще не добавлен",
            )}
            description={langText(
              lang,
              "Add a URL above to connect.",
              "Добавьте URL выше, чтобы подключиться.",
            )}
            compact={true}
          />
        ) : connectionState.value === "error" ? (
          <ErrorState
            title={langText(
              lang,
              "Unable to load the selected server",
              "Не удалось загрузить выбранный сервер",
            )}
            description={langText(
              lang,
              "Check the URL, make sure TorrServer is online, and try again.",
              "Проверьте URL, убедитесь, что TorrServer доступен, и попробуйте снова.",
            )}
            compact={true}
          />
        ) : !selectedTorServer.value ? (
          <EmptyState
            title={langText(lang, "Select a server", "Выберите сервер")}
            description={langText(
              lang,
              "Choose a saved endpoint.",
              "Выберите сохраненный адрес.",
            )}
            compact={true}
          />
        ) : visibleCount === 0 ? (
          <EmptyState
            title={langNoResults(lang)}
            description={langText(
              lang,
              "No torrents match these filters.",
              "По этим фильтрам торренты не найдены.",
            )}
            compact={true}
          />
        ) : (
          <MediaGrid
            title={langText(lang, "Library", "Библиотека")}
            maxColumns={4}
            headerBadge={langCountLabel(
              lang,
              visibleCount,
              "item",
              "items",
              "элемент",
              "элемента",
              "элементов",
            )}
          >
            {filteredTorrentsSig.value.map((torrent) => (
              <TorrentCard
                key={torrent.hash}
                torrent={torrent}
                lang={lang}
                serverUrl={selectedTorServer.value}
                onDrop$={dropTorrentFromServer}
                onOpenFiles$={openFilesForTorrent}
                onRemove$={removeTorrentFromLibrary}
              />
            ))}
          </MediaGrid>
        )}
      </section>

      {/* ── Modals ────────────────────────────────────────── */}
      <TorrServerFileListModal
        open={fileModalOpen.value}
        title={
          selectedTorrentSig.value?.title ||
          selectedTorrentSig.value?.name ||
          langText(lang, "Torrent files", "Файлы торрента")
        }
        subtitle={selectedTorrentSig.value?.hash}
        files={fileEntriesSig.value}
        loading={
          activatingHashSig.value === selectedTorrentHash.value &&
          activatingHashSig.value !== ""
        }
        loadingLabel={(() => {
          const t = selectedTorrentSig.value;
          if (!t)
            return langText(
              lang,
              "Activating torrent...",
              "Активация торрента...",
            );
          return langText(
            lang,
            `Activating · Peers: ${t.total_peers || 0} · Down: ${formatTransferSpeed(t.download_speed)} · Up: ${formatTransferSpeed(t.upload_speed)}`,
            `Активация · Пиры: ${t.total_peers || 0} · Скачивание: ${formatTransferSpeed(t.download_speed)} · Отдача: ${formatTransferSpeed(t.upload_speed)}`,
          );
        })()}
        loadingProgress={(() => {
          const t = selectedTorrentSig.value;
          if (!t || !t.torrent_size) return 0;
          return ((t.preloaded_bytes || 0) / t.torrent_size) * 100;
        })()}
        onClose$={$(() => {
          fileModalOpen.value = false;
        })}
        onOpenStream$={openStreamUrl}
        onCopyStreamUrl$={copyStreamUrl}
        streamActionLabel={langText(lang, "Stream", "Поток")}
        copyActionLabel={langText(lang, "Copy URL", "Копировать")}
      />

      <TorrServerApiToolsModal
        open={apiToolsModalOpen.value}
        lang={lang}
        serverUrl={selectedTorServer.value}
        onClose$={$(() => {
          apiToolsModalOpen.value = false;
        })}
        addLinkBusy={addLinkBusySig.value}
        linkValue={addLinkSig}
        titleValue={addTitleSig}
        categoryValue={addCategorySig}
        saveToDbValue={addSaveToDbSig}
        onAddLink$={addLinkToServer}
        uploadBusy={uploadBusySig.value}
        uploadFileName={uploadFileSig.value?.name ?? ""}
        uploadValidationMessage={uploadValidationMessageSig.value}
        onUploadFileChange$={$((file: File | null) => {
          if (!file) {
            uploadFileSig.value = null;
            uploadValidationMessageSig.value = "";
            return;
          }
          const validation = validateTorrServerUploadFile(file, file.name);
          if (!validation.ok) {
            uploadFileSig.value = null;
            uploadValidationMessageSig.value = validation.message;
            return;
          }
          uploadFileSig.value = file;
          uploadValidationMessageSig.value = "";
        })}
        onUpload$={uploadTorrentToServer}
        downloadSize={downloadSizeSig}
        downloadTestUrl={
          selectedTorServer.value
            ? buildTorrServerDownloadTestUrl(
                selectedTorServer.value,
                Number(downloadSizeSig.value || "1"),
              )
            : undefined
        }
        apiQuery={apiQuerySig}
        searchBusy={searchBusySig.value}
        searchSource={searchSourceSig.value}
        searchResults={searchResultsSig.value}
        onSearch$={runApiSearch}
        onAddSearchResult$={addSearchResultToServer}
        statsText={statsTextSig.value}
        storageDraftSettings={storageDraftSettingsSig}
        storageDraftViewed={storageDraftViewedSig}
        storageUpdateBusy={storageUpdateBusySig.value}
        onApplyStorage$={updateStorageBackend}
        selectedTorrentLabel={
          selectedTorrentSig.value?.title ||
          selectedTorrentSig.value?.name ||
          ""
        }
        viewedIsMarked={selectedViewedSig.value}
        viewedActionBusy={viewedActionBusySig.value}
        onMarkViewed$={markSelectedViewed}
        onRemoveViewed$={removeSelectedViewed}
      />
    </div>
  );
});
