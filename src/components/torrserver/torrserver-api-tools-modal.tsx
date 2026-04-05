import {
  component$,
  type PropFunction,
  type Signal,
} from "@builder.io/qwik";
import { TorrServerModal } from "./torrserver-modal";

export type TorrServerApiSearchResult = {
  link?: string;
  magnet?: string;
  name?: string;
  peer?: number;
  poster?: string;
  seed?: number;
  seeders?: number;
  torrent?: string;
};

function lt(lang: string, en: string, ru: string): string {
  return lang === "ru" ? ru : en;
}

/* ── Add torrent by link ─────────────────────────────────── */

const AddLinkSection = component$(
  ({
    addLinkBusy,
    categoryValue,
    lang,
    linkValue,
    onAddLink$,
    saveToDbValue,
    serverUrl,
    titleValue,
  }: {
    addLinkBusy: boolean;
    categoryValue: Signal<string>;
    lang: string;
    linkValue: Signal<string>;
    onAddLink$: PropFunction<() => void>;
    saveToDbValue: Signal<boolean>;
    serverUrl: string;
    titleValue: Signal<string>;
  }) => (
    <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
      <p class="mb-3 text-sm font-semibold">
        {lt(lang, "Add torrent by link", "Добавить торрент по ссылке")}
      </p>
      <div class="space-y-2">
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder={lt(
            lang,
            "magnet:?xt=... or http(s)://...",
            "magnet:?xt=... или http(s)://...",
          )}
          value={linkValue.value}
          onInput$={(_, el) => {
            linkValue.value = el.value;
          }}
        />
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder={lt(lang, "Optional title", "Необязательный заголовок")}
          value={titleValue.value}
          onInput$={(_, el) => {
            titleValue.value = el.value;
          }}
        />
        <div class="grid grid-cols-2 gap-2">
          <select
            class="select select-bordered w-full"
            value={categoryValue.value}
            onChange$={(_, el) => {
              categoryValue.value = el.value;
            }}
          >
            <option value="other">{lt(lang, "Other", "Другое")}</option>
            <option value="movie">{lt(lang, "Movie", "Фильм")}</option>
            <option value="tv">{lt(lang, "TV", "Сериал")}</option>
            <option value="music">{lt(lang, "Music", "Музыка")}</option>
          </select>
          <label class="label rounded-box border-base-200 cursor-pointer justify-start gap-2 border px-3">
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              checked={saveToDbValue.value}
              onChange$={(_, el) => {
                saveToDbValue.value = el.checked;
              }}
            />
            <span class="label-text text-sm">
              {lt(lang, "Save in DB", "Сохранить в БД")}
            </span>
          </label>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm w-full"
          disabled={!serverUrl || addLinkBusy}
          onClick$={onAddLink$}
        >
          {addLinkBusy
            ? lt(lang, "Adding...", "Добавление...")
            : lt(lang, "Add link", "Добавить ссылку")}
        </button>
      </div>
    </div>
  ),
);

/* ── Upload .torrent file + download test ────────────────── */

const UploadSection = component$(
  ({
    downloadSize,
    downloadTestUrl,
    lang,
    onUpload$,
    onUploadFileChange$,
    serverUrl,
    uploadBusy,
    uploadFileName,
  }: {
    downloadSize: Signal<string>;
    downloadTestUrl?: string;
    lang: string;
    onUpload$: PropFunction<() => void>;
    onUploadFileChange$: PropFunction<(file: File | null) => void>;
    serverUrl: string;
    uploadBusy: boolean;
    uploadFileName: string;
  }) => (
    <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
      <p class="mb-3 text-sm font-semibold">
        {lt(lang, "Upload .torrent file", "Загрузить .torrent файл")}
      </p>
      <input
        type="file"
        accept=".torrent,application/x-bittorrent"
        class="file-input file-input-bordered w-full"
        onChange$={(_, element) => {
          onUploadFileChange$(element.files?.[0] ?? null);
        }}
      />
      <p class="text-base-content/60 mt-2 text-xs">
        {uploadFileName || lt(lang, "No file selected", "Файл не выбран")}
      </p>
      <button
        type="button"
        class="btn btn-secondary btn-sm mt-3 w-full"
        disabled={!serverUrl || !uploadFileName || uploadBusy}
        onClick$={onUpload$}
      >
        {uploadBusy
          ? lt(lang, "Uploading...", "Загрузка...")
          : lt(lang, "Upload", "Загрузить")}
      </button>
      <div class="border-base-300 mt-4 space-y-2 border-t pt-3">
        <p class="text-sm font-semibold">
          {lt(lang, "Download speed test", "Тест скорости скачивания")}
        </p>
        <label class="input input-bordered input-sm flex items-center gap-2">
          <span class="text-base-content/70 text-xs">MB</span>
          <input
            type="number"
            min={1}
            class="grow"
            value={downloadSize.value}
            onInput$={(_, element) => {
              downloadSize.value = element.value;
            }}
          />
        </label>
        {downloadTestUrl && (
          <a
            href={downloadTestUrl}
            target="_blank"
            rel="noreferrer"
            class="btn btn-outline btn-xs w-full"
          >
            /download
          </a>
        )}
      </div>
    </div>
  ),
);

/* ── Search and diagnostics ──────────────────────────────── */

const SearchSection = component$(
  ({
    addLinkBusy,
    apiQuery,
    lang,
    onAddSearchResult$,
    onSearch$,
    searchBusy,
    searchResults,
    searchSource,
    serverUrl,
    statsText,
  }: {
    addLinkBusy: boolean;
    apiQuery: Signal<string>;
    lang: string;
    onAddSearchResult$: PropFunction<(r: TorrServerApiSearchResult) => void>;
    onSearch$: PropFunction<(source: "rutor" | "torznab") => void>;
    searchBusy: boolean;
    searchResults: TorrServerApiSearchResult[];
    searchSource: "rutor" | "torznab" | null;
    serverUrl: string;
    statsText: string;
  }) => (
    <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
      <p class="mb-3 text-sm font-semibold">
        {lt(lang, "Search and diagnostics", "Поиск и диагностика")}
      </p>
      <input
        type="text"
        class="input input-bordered w-full"
        value={apiQuery.value}
        placeholder={lt(lang, "Search query", "Поисковый запрос")}
        onInput$={(_, element) => {
          apiQuery.value = element.value;
        }}
      />
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="btn btn-outline btn-sm"
          disabled={!serverUrl || !apiQuery.value.trim()}
          onClick$={async () => {
            await onSearch$("rutor");
          }}
        >
          /search
        </button>
        <button
          type="button"
          class="btn btn-outline btn-sm"
          disabled={!serverUrl || !apiQuery.value.trim()}
          onClick$={async () => {
            await onSearch$("torznab");
          }}
        >
          /torznab
        </button>
      </div>
      <p class="text-base-content/60 mt-2 text-xs">
        {searchBusy
          ? lt(lang, "Searching...", "Поиск...")
          : searchSource
            ? lt(
                lang,
                `Results from ${searchSource}: ${searchResults.length}`,
                `Результаты из ${searchSource}: ${searchResults.length}`,
              )
            : lt(
                lang,
                "Run /search or /torznab to load results here.",
                "Запустите /search или /torznab, чтобы увидеть результаты здесь.",
              )}
      </p>
      <div class="mt-2 max-h-48 space-y-1 overflow-auto">
        {searchResults.slice(0, 12).map((result, index) => (
          <div
            key={`${result.link || result.magnet || result.torrent || "result"}-${index}`}
            class="rounded-box bg-base-100 border-base-300 border px-2 py-2"
          >
            <p class="truncate text-xs font-medium">
              {result.name || result.link || result.magnet || result.torrent}
            </p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-base-content/60 text-[11px]">
                {result.seed || result.seeders || result.peer || 0}{" "}
                {lt(lang, "seeders", "сидеров")}
              </span>
              <button
                type="button"
                class="btn btn-primary btn-xs"
                disabled={!serverUrl || addLinkBusy}
                onClick$={async () => {
                  await onAddSearchResult$(result);
                }}
              >
                {lt(lang, "Add", "Добавить")}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        {serverUrl && (
          <a
            href={`${serverUrl}/magnets`}
            target="_blank"
            rel="noreferrer"
            class="btn btn-ghost btn-xs"
          >
            /magnets
          </a>
        )}
        {serverUrl && (
          <a
            href={`${serverUrl}/stat`}
            target="_blank"
            rel="noreferrer"
            class="btn btn-ghost btn-xs"
          >
            /stat
          </a>
        )}
        {serverUrl && (
          <a
            href={`${serverUrl}/playlistall/all.m3u`}
            target="_blank"
            rel="noreferrer"
            class="btn btn-ghost btn-xs"
          >
            /playlistall
          </a>
        )}
      </div>
      <p class="text-base-content/60 mt-3 line-clamp-4 text-xs leading-relaxed">
        {(statsText || "").slice(0, 420) ||
          lt(
            lang,
            "Statistics text from /stat will appear here after connection.",
            "Текст статистики из /stat появится здесь после подключения.",
          )}
      </p>
    </div>
  ),
);

/* ── Storage and viewed tools ────────────────────────────── */

const StorageSection = component$(
  ({
    lang,
    onApplyStorage$,
    onMarkViewed$,
    onRemoveViewed$,
    selectedTorrentLabel,
    serverUrl,
    storageDraftSettings,
    storageDraftViewed,
    storageUpdateBusy,
    viewedActionBusy,
    viewedIsMarked,
  }: {
    lang: string;
    onApplyStorage$: PropFunction<() => void>;
    onMarkViewed$: PropFunction<() => void>;
    onRemoveViewed$: PropFunction<() => void>;
    selectedTorrentLabel?: string;
    serverUrl: string;
    storageDraftSettings: Signal<string>;
    storageDraftViewed: Signal<string>;
    storageUpdateBusy: boolean;
    viewedActionBusy: boolean;
    viewedIsMarked: boolean;
  }) => (
    <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
      <p class="mb-3 text-sm font-semibold">
        {lt(
          lang,
          "Storage and viewed tools",
          "Инструменты хранилища и просмотренного",
        )}
      </p>
      <div class="space-y-2">
        <label class="label pb-0" for="modal-storage-settings-mode">
          <span class="label-text text-xs">
            {lt(lang, "Settings storage", "Хранилище настроек")}
          </span>
        </label>
        <select
          id="modal-storage-settings-mode"
          class="select select-bordered select-sm w-full"
          value={storageDraftSettings.value}
          onChange$={(_, element) => {
            storageDraftSettings.value =
              element.value === "bbolt" ? "bbolt" : "json";
          }}
        >
          <option value="json">json</option>
          <option value="bbolt">bbolt</option>
        </select>
        <label class="label pb-0" for="modal-storage-viewed-mode">
          <span class="label-text text-xs">
            {lt(lang, "Viewed storage", "Хранилище просмотренного")}
          </span>
        </label>
        <select
          id="modal-storage-viewed-mode"
          class="select select-bordered select-sm w-full"
          value={storageDraftViewed.value}
          onChange$={(_, element) => {
            storageDraftViewed.value =
              element.value === "bbolt" ? "bbolt" : "json";
          }}
        >
          <option value="json">json</option>
          <option value="bbolt">bbolt</option>
        </select>
        <button
          type="button"
          class="btn btn-outline btn-sm mt-1 w-full"
          disabled={!serverUrl || storageUpdateBusy}
          onClick$={onApplyStorage$}
        >
          {storageUpdateBusy
            ? lt(lang, "Applying...", "Применение...")
            : lt(lang, "Apply storage mode", "Применить режим хранилища")}
        </button>
        <p class="text-base-content/60 text-xs">
          {lt(
            lang,
            "TorrServer restart may be required after changing storage backend.",
            "После смены хранилища может потребоваться перезапуск TorrServer.",
          )}
        </p>
      </div>

      <div class="border-base-300 mt-4 space-y-2 border-t pt-3">
        <p class="text-sm font-semibold">
          {lt(lang, "Viewed actions", "Действия просмотренного")}
        </p>
        <p class="text-base-content/70 text-xs">
          {selectedTorrentLabel
            ? lt(
                lang,
                viewedIsMarked
                  ? "Selected torrent/file is currently marked as viewed."
                  : "Selected torrent/file is not marked as viewed.",
                viewedIsMarked
                  ? "Выбранный торрент/файл отмечен как просмотренный."
                  : "Выбранный торрент/файл не отмечен как просмотренный.",
              )
            : lt(
                lang,
                "Select a torrent to set or remove viewed state.",
                "Выберите торрент, чтобы установить или убрать статус просмотренного.",
              )}
        </p>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="btn btn-primary btn-xs"
            disabled={!serverUrl || !selectedTorrentLabel || viewedActionBusy}
            onClick$={onMarkViewed$}
          >
            {lt(lang, "Set viewed", "Отметить")}
          </button>
          <button
            type="button"
            class="btn btn-outline btn-xs"
            disabled={!serverUrl || !selectedTorrentLabel || viewedActionBusy}
            onClick$={onRemoveViewed$}
          >
            {lt(lang, "Remove viewed", "Убрать отметку")}
          </button>
        </div>
      </div>
    </div>
  ),
);

/* ── Main modal ──────────────────────────────────────────── */

export interface TorrServerApiToolsModalProps {
  addLinkBusy: boolean;
  apiQuery: Signal<string>;
  categoryValue: Signal<string>;
  downloadSize: Signal<string>;
  downloadTestUrl?: string;
  lang: string;
  linkValue: Signal<string>;
  onAddLink$: PropFunction<() => void>;
  onAddSearchResult$: PropFunction<
    (result: TorrServerApiSearchResult) => void
  >;
  onApplyStorage$: PropFunction<() => void>;
  onClose$: PropFunction<() => void>;
  onMarkViewed$: PropFunction<() => void>;
  onRemoveViewed$: PropFunction<() => void>;
  onSearch$: PropFunction<(source: "rutor" | "torznab") => void>;
  onUpload$: PropFunction<() => void>;
  onUploadFileChange$: PropFunction<(file: File | null) => void>;
  open: boolean;
  saveToDbValue: Signal<boolean>;
  searchBusy: boolean;
  searchResults: TorrServerApiSearchResult[];
  searchSource: "rutor" | "torznab" | null;
  selectedTorrentLabel?: string;
  serverUrl: string;
  statsText: string;
  storageDraftSettings: Signal<string>;
  storageDraftViewed: Signal<string>;
  storageUpdateBusy: boolean;
  titleValue: Signal<string>;
  uploadBusy: boolean;
  uploadFileName: string;
  viewedActionBusy: boolean;
  viewedIsMarked: boolean;
}

export const TorrServerApiToolsModal = component$(
  (props: TorrServerApiToolsModalProps) => {
    return (
      <TorrServerModal
        open={props.open}
        title={lt(
          props.lang,
          "API tools workspace",
          "Рабочая область API-инструментов",
        )}
        subtitle={lt(
          props.lang,
          "Add magnet links, upload .torrent files, run searches, manage storage and viewed state.",
          "Добавление magnet-ссылок, загрузка .torrent файлов, поиск, управление хранилищем и просмотрами.",
        )}
        onClose$={props.onClose$}
      >
        <div class="grid gap-4 lg:grid-cols-2">
          <AddLinkSection
            addLinkBusy={props.addLinkBusy}
            categoryValue={props.categoryValue}
            lang={props.lang}
            linkValue={props.linkValue}
            onAddLink$={props.onAddLink$}
            saveToDbValue={props.saveToDbValue}
            serverUrl={props.serverUrl}
            titleValue={props.titleValue}
          />

          <UploadSection
            downloadSize={props.downloadSize}
            downloadTestUrl={props.downloadTestUrl}
            lang={props.lang}
            onUpload$={props.onUpload$}
            onUploadFileChange$={props.onUploadFileChange$}
            serverUrl={props.serverUrl}
            uploadBusy={props.uploadBusy}
            uploadFileName={props.uploadFileName}
          />

          <SearchSection
            addLinkBusy={props.addLinkBusy}
            apiQuery={props.apiQuery}
            lang={props.lang}
            onAddSearchResult$={props.onAddSearchResult$}
            onSearch$={props.onSearch$}
            searchBusy={props.searchBusy}
            searchResults={props.searchResults}
            searchSource={props.searchSource}
            serverUrl={props.serverUrl}
            statsText={props.statsText}
          />

          <StorageSection
            lang={props.lang}
            onApplyStorage$={props.onApplyStorage$}
            onMarkViewed$={props.onMarkViewed$}
            onRemoveViewed$={props.onRemoveViewed$}
            selectedTorrentLabel={props.selectedTorrentLabel}
            serverUrl={props.serverUrl}
            storageDraftSettings={props.storageDraftSettings}
            storageDraftViewed={props.storageDraftViewed}
            storageUpdateBusy={props.storageUpdateBusy}
            viewedActionBusy={props.viewedActionBusy}
            viewedIsMarked={props.viewedIsMarked}
          />
        </div>
      </TorrServerModal>
    );
  },
);
