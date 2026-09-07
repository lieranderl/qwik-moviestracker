import {
  $,
  component$,
  type PropFunction,
  type Signal,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { ToastManagerContext } from "qwik-toasts";
import { validateTorrServerUploadFile } from "~/services/torrserver";
import { message } from "~/utils/i18n";
import {
  torrServerLibraryClient,
  torrServerSearchClient,
} from "~/services/torrserver/clients";
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
          {message(lang, "torrserver.tools.addTorrentByLink")}
        </h3>
        <form preventdefault:submit onSubmit$={onAddLink$} class="grid gap-3">
          <label class="form-control">
            <span class="label label-text px-0 pb-1 text-sm font-medium">
              {message(lang, "torrserver.tools.torrentOrMagnetLink")}
            </span>
            <input
              type="text"
              class="input input-bordered min-h-11 w-full"
              placeholder={message(
                lang,
                "torrserver.tools.torrentOrMagnetPlaceholder",
              )}
              value={linkValue.value}
              onInput$={(_, el) => {
                linkValue.value = el.value;
              }}
            />
          </label>
          <label class="form-control">
            <span class="label label-text px-0 pb-1 text-sm font-medium">
              {message(lang, "torrserver.tools.title")}
            </span>
            <input
              type="text"
              class="input input-bordered min-h-11 w-full"
              placeholder={message(lang, "torrserver.tools.optionalTitle")}
              value={titleValue.value}
              onInput$={(_, el) => {
                titleValue.value = el.value;
              }}
            />
          </label>
          <div class="grid gap-2 sm:grid-cols-2">
            <label class="form-control">
              <span class="label label-text px-0 pb-1 text-sm font-medium">
                {message(lang, "torrserver.tools.category")}
              </span>
              <select
                class="select select-bordered min-h-11 w-full"
                value={categoryValue.value}
                onChange$={(_, el) => {
                  categoryValue.value = el.value;
                }}
              >
                <option value="other">
                  {message(lang, "torrserver.tools.other")}
                </option>
                <option value="movie">
                  {message(lang, "torrserver.tools.movie")}
                </option>
                <option value="tv">
                  {message(lang, "torrserver.tools.tv")}
                </option>
                <option value="music">
                  {message(lang, "torrserver.tools.music")}
                </option>
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
                {message(lang, "torrserver.tools.saveInDatabase")}
              </span>
            </label>
          </div>
          <button
            type="submit"
            class="btn btn-primary min-h-11 w-full"
            disabled={!serverUrl || addLinkBusy}
          >
            {addLinkBusy
              ? message(lang, "torrserver.tools.adding")
              : message(lang, "torrserver.tools.addLink")}
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
          {message(lang, "torrserver.tools.uploadTorrentFile")}
        </h3>
        <label class="form-control">
          <span class="label label-text px-0 pb-1 text-sm font-medium">
            {message(lang, "torrserver.tools.torrentFile")}
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
            message(lang, "torrserver.tools.noFileSelected")}
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
            ? message(lang, "torrserver.tools.uploading")
            : message(lang, "torrserver.tools.upload")}
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
          {message(lang, "torrserver.tools.searchAndDiagnostics")}
        </h3>
        <label class="form-control">
          <span class="label label-text px-0 pb-1 text-sm font-medium">
            {message(lang, "torrserver.tools.searchQuery")}
          </span>
          <input
            type="text"
            class="input input-bordered min-h-11 w-full"
            value={apiQuery.value}
            placeholder={message(lang, "torrserver.tools.searchQuery")}
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
            ? message(lang, "torrserver.tools.searching")
            : searchSource
              ? message(lang, "torrserver.tools.searchResults", {
                  source: searchSource,
                  count: searchResults.length,
                })
              : message(lang, "torrserver.tools.searchHint")}
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
                  {message(lang, "torrserver.tools.seeders")}
                </span>
                <button
                  type="button"
                  class="btn btn-primary min-h-11"
                  disabled={!serverUrl || addLinkBusy}
                  onClick$={async () => {
                    await onAddSearchResult$(result);
                  }}
                >
                  {message(lang, "torrserver.tools.add")}
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
              href={`${serverUrl}/stat`}
              target="_blank"
              rel="noreferrer"
              class="btn btn-ghost min-h-11 flex-1 sm:flex-none"
            >
              /stat
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
            message(lang, "torrserver.tools.statsHint")}
        </p>
      </div>
    </section>
  ),
);

/* ── Main modal ──────────────────────────────────────────── */

export interface TorrServerApiToolsModalProps {
  lang: string;
  onClose$: PropFunction<() => void>;
  onLibraryChanged$: PropFunction<() => void>;
  open: boolean;
  serverUrl: string;
  statsText: string;
}

export const TorrServerApiToolsModal = component$(
  (props: TorrServerApiToolsModalProps) => {
    const toastManager = useContext(ToastManagerContext);
    const apiQuery = useSignal("");
    const addLinkBusy = useSignal(false);
    const uploadBusy = useSignal(false);
    const uploadFile = useSignal<File | null>(null);
    const uploadValidationMessage = useSignal("");
    const searchBusy = useSignal(false);
    const searchSource = useSignal<"rutor" | "torznab" | null>(null);
    const searchResults = useSignal<TorrServerApiSearchResult[]>([]);
    const linkValue = useSignal("");
    const titleValue = useSignal("");
    const categoryValue = useSignal("other");
    const saveToDbValue = useSignal(true);

    const notify = $(
      (message: string, type: "error" | "success" | "warning") => {
        toastManager.addToast({ message, type, autocloseTime: 5_000 });
      },
    );

    const addLink = $(async () => {
      const link = linkValue.value.trim();
      if (!props.serverUrl || !link) {
        notify(message(props.lang, "torrserver.tools.provideLink"), "error");
        return;
      }
      addLinkBusy.value = true;
      try {
        await torrServerLibraryClient.addByLink(props.serverUrl, {
          category: categoryValue.value || "other",
          link,
          saveToDb: saveToDbValue.value,
          title: titleValue.value.trim() || link,
        });
        linkValue.value = "";
        titleValue.value = "";
        notify(message(props.lang, "torrserver.tools.linkSent"), "success");
        await props.onLibraryChanged$();
      } catch (error) {
        console.error(error);
        notify(message(props.lang, "torrserver.tools.addLinkFailed"), "error");
      } finally {
        addLinkBusy.value = false;
      }
    });

    const onUploadFileChange = $((file: File | null) => {
      if (!file) {
        uploadFile.value = null;
        uploadValidationMessage.value = "";
        return;
      }
      const validation = validateTorrServerUploadFile(file, file.name);
      uploadFile.value = validation.ok ? file : null;
      uploadValidationMessage.value = validation.ok ? "" : validation.message;
    });

    const upload = $(async () => {
      const file = uploadFile.value;
      if (!props.serverUrl || !file) return;
      const validation = validateTorrServerUploadFile(file, file.name);
      if (!validation.ok) {
        uploadValidationMessage.value = validation.message;
        notify(validation.message, "error");
        return;
      }
      uploadBusy.value = true;
      try {
        await torrServerLibraryClient.upload(props.serverUrl, {
          category: "other",
          file,
          fileName: validation.fileName,
          saveToDb: true,
          title: validation.fileName,
        });
        uploadFile.value = null;
        uploadValidationMessage.value = "";
        notify(
          message(props.lang, "torrserver.tools.uploadSucceeded"),
          "success",
        );
        await props.onLibraryChanged$();
      } catch (error) {
        console.error(error);
        notify(message(props.lang, "torrserver.tools.uploadFailed"), "error");
      } finally {
        uploadBusy.value = false;
      }
    });

    const search = $(async (source: "rutor" | "torznab") => {
      const query = apiQuery.value.trim();
      if (!props.serverUrl || !query) return;
      searchBusy.value = true;
      searchSource.value = source;
      try {
        searchResults.value =
          source === "rutor"
            ? await torrServerSearchClient.rutor(props.serverUrl, query)
            : await torrServerSearchClient.torznab(props.serverUrl, query);
      } catch (error) {
        console.error(error);
        searchResults.value = [];
        notify(message(props.lang, "torrserver.tools.searchFailed"), "error");
      } finally {
        searchBusy.value = false;
      }
    });

    const addSearchResult = $(async (result: TorrServerApiSearchResult) => {
      const link = result.magnet || result.link || result.torrent;
      if (!props.serverUrl || !link) {
        notify(
          message(props.lang, "torrserver.tools.resultMissingLink"),
          "warning",
        );
        return;
      }
      addLinkBusy.value = true;
      try {
        await torrServerLibraryClient.addByLink(props.serverUrl, {
          category: "other",
          link,
          poster: result.poster || "",
          saveToDb: true,
          title: result.name || link,
        });
        notify(message(props.lang, "torrserver.tools.resultAdded"), "success");
        await props.onLibraryChanged$();
      } catch (error) {
        console.error(error);
        notify(
          message(props.lang, "torrserver.tools.addResultFailed"),
          "error",
        );
      } finally {
        addLinkBusy.value = false;
      }
    });

    return (
      <TorrServerModal
        open={props.open}
        closeLabel={message(props.lang, "torrserver.tools.close")}
        title={message(props.lang, "torrserver.tools.heading")}
        subtitle={message(props.lang, "torrserver.tools.subtitle")}
        onClose$={props.onClose$}
      >
        <div class="grid min-w-0 gap-4 lg:grid-cols-2">
          <AddLinkSection
            addLinkBusy={addLinkBusy.value}
            categoryValue={categoryValue}
            lang={props.lang}
            linkValue={linkValue}
            onAddLink$={addLink}
            saveToDbValue={saveToDbValue}
            serverUrl={props.serverUrl}
            titleValue={titleValue}
          />

          <UploadSection
            lang={props.lang}
            onUpload$={upload}
            onUploadFileChange$={onUploadFileChange}
            serverUrl={props.serverUrl}
            uploadBusy={uploadBusy.value}
            uploadFileName={uploadFile.value?.name ?? ""}
            uploadValidationMessage={uploadValidationMessage.value}
          />

          <SearchSection
            addLinkBusy={addLinkBusy.value}
            apiQuery={apiQuery}
            lang={props.lang}
            onAddSearchResult$={addSearchResult}
            onSearch$={search}
            searchBusy={searchBusy.value}
            searchResults={searchResults.value}
            searchSource={searchSource.value}
            serverUrl={props.serverUrl}
            statsText={props.statsText}
          />
        </div>
      </TorrServerModal>
    );
  },
);
