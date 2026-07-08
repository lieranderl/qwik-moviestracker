import { component$, type PropFunction, type Signal } from "@builder.io/qwik";
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
  return lang.startsWith("ru") ? ru : en;
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
    <section class="card border-base-200 bg-base-200/40 border shadow-none">
      <div class="card-body gap-3 p-4">
        <h3 class="font-semibold">
          {lt(lang, "Add torrent by link", "Добавить торрент по ссылке")}
        </h3>
        <form preventdefault:submit onSubmit$={onAddLink$} class="grid gap-3">
          <label class="form-control">
            <span class="label label-text px-0 pb-1 text-sm font-medium">
              {lt(lang, "Torrent or magnet link", "Torrent или magnet ссылка")}
            </span>
            <input
              type="text"
              class="input input-bordered min-h-11 w-full"
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
          </label>
          <label class="form-control">
            <span class="label label-text px-0 pb-1 text-sm font-medium">
              {lt(lang, "Title", "Заголовок")}
            </span>
            <input
              type="text"
              class="input input-bordered min-h-11 w-full"
              placeholder={lt(
                lang,
                "Optional title",
                "Необязательный заголовок",
              )}
              value={titleValue.value}
              onInput$={(_, el) => {
                titleValue.value = el.value;
              }}
            />
          </label>
          <div class="grid gap-2 sm:grid-cols-2">
            <label class="form-control">
              <span class="label label-text px-0 pb-1 text-sm font-medium">
                {lt(lang, "Category", "Категория")}
              </span>
              <select
                class="select select-bordered min-h-11 w-full"
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
            </label>
            <label class="label rounded-box border-base-200 min-h-11 cursor-pointer justify-start gap-2 border px-3">
              <input
                type="checkbox"
                class="checkbox"
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
            type="submit"
            class="btn btn-primary min-h-11 w-full"
            disabled={!serverUrl || addLinkBusy}
          >
            {addLinkBusy
              ? lt(lang, "Adding...", "Добавление...")
              : lt(lang, "Add link", "Добавить ссылку")}
          </button>
        </form>
      </div>
    </section>
  ),
);

/* ── Upload .torrent file + download test ────────────────── */

const UploadSection = component$(
  ({
    lang,
    onUpload$,
    onUploadFileChange$,
    serverUrl,
    uploadBusy,
    uploadFileName,
    uploadValidationMessage,
  }: {
    lang: string;
    onUpload$: PropFunction<() => void>;
    onUploadFileChange$: PropFunction<(file: File | null) => void>;
    serverUrl: string;
    uploadBusy: boolean;
    uploadFileName: string;
    uploadValidationMessage?: string;
  }) => (
    <section class="card border-base-200 bg-base-200/40 border shadow-none">
      <div class="card-body gap-3 p-4">
        <h3 class="font-semibold">
          {lt(lang, "Upload .torrent file", "Загрузить .torrent файл")}
        </h3>
        <label class="form-control">
          <span class="label label-text px-0 pb-1 text-sm font-medium">
            {lt(lang, ".torrent file", ".torrent файл")}
          </span>
          <input
            type="file"
            accept=".torrent"
            class="file-input file-input-bordered min-h-11 w-full"
            onChange$={(_, element) => {
              onUploadFileChange$(element.files?.[0] ?? null);
            }}
          />
        </label>
        <p
          class={`text-xs ${
            uploadValidationMessage ? "text-error" : "text-base-content/60"
          }`}
        >
          {uploadValidationMessage ||
            uploadFileName ||
            lt(lang, "No file selected", "Файл не выбран")}
        </p>
        <button
          type="button"
          class="btn btn-secondary min-h-11 w-full"
          disabled={
            !serverUrl ||
            !uploadFileName ||
            Boolean(uploadValidationMessage) ||
            uploadBusy
          }
          onClick$={onUpload$}
        >
          {uploadBusy
            ? lt(lang, "Uploading...", "Загрузка...")
            : lt(lang, "Upload", "Загрузить")}
        </button>
      </div>
    </section>
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
    <section class="card border-base-200 bg-base-200/40 border shadow-none">
      <div class="card-body gap-3 p-4">
        <h3 class="font-semibold">
          {lt(lang, "Search and diagnostics", "Поиск и диагностика")}
        </h3>
        <label class="form-control">
          <span class="label label-text px-0 pb-1 text-sm font-medium">
            {lt(lang, "Search query", "Поисковый запрос")}
          </span>
          <input
            type="text"
            class="input input-bordered min-h-11 w-full"
            value={apiQuery.value}
            placeholder={lt(lang, "Search query", "Поисковый запрос")}
            onInput$={(_, element) => {
              apiQuery.value = element.value;
            }}
          />
        </label>
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="btn btn-outline min-h-11"
            disabled={!serverUrl || !apiQuery.value.trim()}
            onClick$={async () => {
              await onSearch$("rutor");
            }}
          >
            /search
          </button>
          <button
            type="button"
            class="btn btn-outline min-h-11"
            disabled={!serverUrl || !apiQuery.value.trim()}
            onClick$={async () => {
              await onSearch$("torznab");
            }}
          >
            /torznab
          </button>
        </div>
        <p class="text-base-content/60 text-xs">
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
        <div class="max-h-48 space-y-2 overflow-auto">
          {searchResults.slice(0, 12).map((result, index) => (
            <div
              key={`${result.link || result.magnet || result.torrent || "result"}-${index}`}
              class="rounded-box bg-base-100 border-base-200 border p-3"
            >
              <p class="truncate text-xs font-medium">
                {result.name || result.link || result.magnet || result.torrent}
              </p>
              <div class="mt-2 flex items-center justify-between gap-2">
                <span class="text-base-content/60 text-xs">
                  {result.seed || result.seeders || result.peer || 0}{" "}
                  {lt(lang, "seeders", "сидеров")}
                </span>
                <button
                  type="button"
                  class="btn btn-primary min-h-11"
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
        <div class="flex flex-wrap gap-2">
          {serverUrl && (
            <a
              href={`${serverUrl}/magnets`}
              target="_blank"
              rel="noreferrer"
              class="btn btn-ghost min-h-11 flex-1 sm:flex-none"
            >
              /magnets
            </a>
          )}
          {serverUrl && (
            <a
              href={`${serverUrl}/stats`}
              target="_blank"
              rel="noreferrer"
              class="btn btn-ghost min-h-11 flex-1 sm:flex-none"
            >
              /stats
            </a>
          )}
          {serverUrl && (
            <a
              href={`${serverUrl}/playlistall/all.m3u`}
              target="_blank"
              rel="noreferrer"
              class="btn btn-ghost min-h-11 flex-1 sm:flex-none"
            >
              /playlistall
            </a>
          )}
        </div>
        <p class="text-base-content/60 line-clamp-4 text-xs leading-relaxed">
          {(statsText || "").slice(0, 420) ||
            lt(
              lang,
              "Statistics text from /stats will appear here after connection.",
              "Текст статистики из /stats появится здесь после подключения.",
            )}
        </p>
      </div>
    </section>
  ),
);

/* ── Main modal ──────────────────────────────────────────── */

export interface TorrServerApiToolsModalProps {
  addLinkBusy: boolean;
  apiQuery: Signal<string>;
  categoryValue: Signal<string>;
  lang: string;
  linkValue: Signal<string>;
  onAddLink$: PropFunction<() => void>;
  onAddSearchResult$: PropFunction<(result: TorrServerApiSearchResult) => void>;
  onClose$: PropFunction<() => void>;
  onSearch$: PropFunction<(source: "rutor" | "torznab") => void>;
  onUpload$: PropFunction<() => void>;
  onUploadFileChange$: PropFunction<(file: File | null) => void>;
  open: boolean;
  saveToDbValue: Signal<boolean>;
  searchBusy: boolean;
  searchResults: TorrServerApiSearchResult[];
  searchSource: "rutor" | "torznab" | null;
  serverUrl: string;
  statsText: string;
  titleValue: Signal<string>;
  uploadBusy: boolean;
  uploadFileName: string;
  uploadValidationMessage?: string;
}

export const TorrServerApiToolsModal = component$(
  (props: TorrServerApiToolsModalProps) => {
    return (
      <TorrServerModal
        open={props.open}
        closeLabel={lt(
          props.lang,
          "Close API tools",
          "Закрыть API-инструменты",
        )}
        title={lt(props.lang, "Tools", "Инструменты")}
        subtitle={lt(
          props.lang,
          "Add torrents, search, and manage playlists.",
          "Добавляйте торренты, ищите и управляйте плейлистами.",
        )}
        onClose$={props.onClose$}
      >
        <div class="grid min-w-0 gap-4 lg:grid-cols-2">
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
            lang={props.lang}
            onUpload$={props.onUpload$}
            onUploadFileChange$={props.onUploadFileChange$}
            serverUrl={props.serverUrl}
            uploadBusy={props.uploadBusy}
            uploadFileName={props.uploadFileName}
            uploadValidationMessage={props.uploadValidationMessage}
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
        </div>
      </TorrServerModal>
    );
  },
);
