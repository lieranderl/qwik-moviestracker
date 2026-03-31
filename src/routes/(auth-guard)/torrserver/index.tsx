import {
  $,
  component$,
  type Signal,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { setValue, useForm } from "@modular-forms/qwik";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { LuMagnet } from "@qwikest/icons/lucide";
import { ToastManagerContext } from "qwik-toasts";
import type { InferInput } from "valibot";
import { object, pipe, string, url } from "valibot";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeading,
} from "~/components/page-feedback";
import { MediaType } from "~/services/models";
import type { TSResult } from "~/services/models";
import {
  listTorrent,
  removeTorrent,
  torrServerEcho,
} from "~/services/torrserver";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import {
  readStorageString,
  writeStorageJson,
  writeStorageString,
} from "~/utils/browser";
import { formatYear } from "~/utils/format";
import {
  langAddNewTorrServerURL,
  langNoResults,
  langTorrServer,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

const TORR_SERVER_LIST_KEY = "torrServerList";
const SELECTED_TORR_SERVER_KEY = "selectedTorServer";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

type ParsedTorrentMedia = {
  id: number;
  title?: string;
  name?: string;
  seasons?: unknown;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

export const torrServerSchema = object({
  ipaddress: pipe(string(), url("Please provide a valid URL!")),
});

export type torrServerForm = InferInput<typeof torrServerSchema>;

function normalizeServer(value: string): string {
  return value.trim();
}

function normalizeServerList(list: string[]): string[] {
  return [...new Set(list.map(normalizeServer).filter(Boolean))];
}

function resolveSelectedServer(
  list: string[],
  preferredServer: string,
): string {
  const normalizedPreferredServer = normalizeServer(preferredServer);
  if (normalizedPreferredServer && list.includes(normalizedPreferredServer)) {
    return normalizedPreferredServer;
  }
  return list[0] || "";
}

function parseStoredServerList(rawList: string | null): string[] {
  if (!rawList) {
    return [];
  }
  try {
    const parsedList = JSON.parse(rawList) as unknown;
    if (!Array.isArray(parsedList)) {
      return [];
    }
    return parsedList.filter(
      (item): item is string =>
        typeof item === "string" && normalizeServer(item).length > 0,
    );
  } catch (error) {
    console.error("Failed to parse torrServerList", error);
    const fallbackServer = normalizeServer(rawList);
    return fallbackServer ? [fallbackServer] : [];
  }
}

function getNormalizedServersState(
  servers: string[],
  preferredServer: string,
): { list: string[]; selected: string } {
  const normalizedList = normalizeServerList(servers);
  const nextSelected = resolveSelectedServer(normalizedList, preferredServer);

  return { list: normalizedList, selected: nextSelected };
}

function persistServersStorage(list: string[], selected: string): void {
  writeStorageJson(TORR_SERVER_LIST_KEY, [...list]);
  writeStorageString(SELECTED_TORR_SERVER_KEY, normalizeServer(selected));
}

function applyServersState(
  servers: string[],
  preferredServer: string,
  listSig: Signal<string[]>,
  selectedSig: Signal<string>,
): { list: string[]; selected: string } {
  const nextState = getNormalizedServersState(servers, preferredServer);
  listSig.value = nextState.list;
  selectedSig.value = nextState.selected;
  return nextState;
}

function parseTorrentMedia(data?: string): ParsedTorrentMedia | null {
  if (!data) {
    return null;
  }
  try {
    const parsed = JSON.parse(data) as { movie?: ParsedTorrentMedia };
    return parsed.movie ?? null;
  } catch (error) {
    console.error("Failed to parse torrent metadata", error);
    return null;
  }
}

function getTorrentHref(
  media: ParsedTorrentMedia | null,
  lang: string,
): string | null {
  if (!media?.id) {
    return null;
  }
  return media.seasons
    ? paths.media(MediaType.Tv, media.id, lang)
    : paths.media(MediaType.Movie, media.id, lang);
}

function formatTorrentSize(size?: number): string {
  if (!size || size <= 0) {
    return "Unknown size";
  }
  const sizeInGb = size / 1024 ** 3;
  return `${sizeInGb.toFixed(sizeInGb >= 100 ? 0 : 1)} GB`;
}

function formatStatusLabel(value?: string): string {
  if (!value) {
    return "";
  }
  return value
    .replaceAll(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function connectionAlertClass(state: ConnectionState): string {
  switch (state) {
    case "connected":
      return "alert-success";
    case "connecting":
      return "alert-info";
    case "error":
      return "alert-error";
    default:
      return "alert-ghost border-base-200";
  }
}

export default component$(() => {
  const resource = useQueryParamsLoader();
  const toastManager = useContext(ToastManagerContext);
  const lang = resource.value.lang;
  const selectedTorServer = useSignal("");
  const torrServerList = useSignal<string[]>([]);
  const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
    loader: { value: { ipaddress: "" } },
  });

  const isCheckingTorrServer = useSignal(false);
  const torrentsSig = useSignal([] as TSResult[]);
  const connectionState = useSignal<ConnectionState>("idle");
  const connectionMessage = useSignal(
    "Add a TorrServer URL to start managing your library.",
  );
  const serverVersion = useSignal("");

  const addTorrserver = $(async (values: torrServerForm): Promise<void> => {
    const newServer = normalizeServer(values.ipaddress);
    if (torrServerList.value.includes(newServer)) {
      setValue(newTorrServerForm, "ipaddress", "");
      toastManager.addToast({
        message: `TorrServer ${newServer} is already in the list!`,
        type: "error",
        autocloseTime: 5000,
      });
      return;
    }
    const nextState = applyServersState(
      [...torrServerList.value, newServer],
      newServer,
      torrServerList,
      selectedTorServer,
    );
    persistServersStorage(nextState.list, nextState.selected);
    toastManager.addToast({
      message: `TorrServer ${newServer} has been added.`,
      type: "success",
      autocloseTime: 5000,
    });
    setValue(newTorrServerForm, "ipaddress", "");
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const parsedList = parseStoredServerList(
      readStorageString(TORR_SERVER_LIST_KEY),
    );
    const storedSelected =
      normalizeServer(readStorageString(SELECTED_TORR_SERVER_KEY, "") || "") ||
      "";
    const nextList = [...parsedList];
    if (nextList.length === 0 && storedSelected) {
      nextList.push(storedSelected);
    }
    const nextState = applyServersState(
      nextList,
      storedSelected,
      torrServerList,
      selectedTorServer,
    );
    persistServersStorage(nextState.list, nextState.selected);
  });

  useTask$(async ({ track }) => {
    track(() => selectedTorServer.value);
    torrentsSig.value = [];
    serverVersion.value = "";

    if (!selectedTorServer.value) {
      connectionState.value = "idle";
      connectionMessage.value =
        torrServerList.value.length > 0
          ? "Select a saved server to inspect its library."
          : "Add a TorrServer URL to start managing your library.";
      return;
    }

    try {
      isCheckingTorrServer.value = true;
      connectionState.value = "connecting";
      connectionMessage.value = `Connecting to ${selectedTorServer.value}...`;

      const version = await torrServerEcho(selectedTorServer.value);
      serverVersion.value = version;
      torrentsSig.value = await listTorrent(selectedTorServer.value);

      connectionState.value = "connected";
      connectionMessage.value = `Connected to ${selectedTorServer.value}`;
    } catch (error) {
      console.error(error);
      connectionState.value = "error";
      connectionMessage.value = `Failed to reach ${selectedTorServer.value}`;
    } finally {
      isCheckingTorrServer.value = false;
    }
  });

  return (
    <div class="mx-auto w-full max-w-7xl px-4 pb-10">
      <SectionHeading eyebrow="Tools" title={langTorrServer(lang)} />
      <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed md:text-base">
        Connect a TorrServer instance, manage saved endpoints, and review the
        current library from one focused workspace.
      </p>

      <section class="card border-base-200 bg-base-100/90 mt-6 border shadow-sm backdrop-blur">
        <div class="card-body gap-6">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
            <div class="space-y-5">
              <div class="space-y-1">
                <h2 class="card-title text-xl">Connection workspace</h2>
                <p class="text-base-content/70 text-sm">
                  Add a new endpoint, switch between saved servers, and keep the
                  active library in view below.
                </p>
              </div>

              <Form onSubmit$={addTorrserver} class="space-y-2">
                <Field name="ipaddress">
                  {(field, props) => (
                    <div class="space-y-2">
                      <div class="join w-full">
                        <label
                          class="input input-bordered join-item flex w-full items-center gap-2"
                          for="torrserver-url"
                        >
                          <span class="label text-base-content/65 shrink-0 text-xs font-medium tracking-[0.12em] uppercase">
                            URL
                          </span>
                          <input
                            {...props}
                            id="torrserver-url"
                            type="url"
                            placeholder={langAddNewTorrServerURL(lang)}
                            class="grow"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={newTorrServerForm.invalid}
                          class="btn btn-primary join-item w-32 shrink-0 justify-center"
                        >
                          <HiPlusSolid class="text-lg" />
                          Add
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
                <label class="label pt-0" for="active-torrserver">
                  <span class="label-text font-medium">Active server</span>
                </label>
                <div class="join w-full">
                  <select
                    id="active-torrserver"
                    value={selectedTorServer.value}
                    class="select select-bordered join-item w-full"
                    onChange$={(_, element) => {
                      selectedTorServer.value = normalizeServer(element.value);
                      persistServersStorage(
                        torrServerList.value,
                        selectedTorServer.value,
                      );
                    }}
                  >
                    {torrServerList.value.length === 0 && (
                      <option value="">No TorrServer added</option>
                    )}
                    {torrServerList.value.map((item) => (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedTorServer.value}
                    class="btn btn-error btn-outline join-item w-32 shrink-0 justify-center"
                    onClick$={() => {
                      const currentServer = selectedTorServer.value;
                      if (!currentServer) {
                        return;
                      }
                      const nextList = torrServerList.value.filter(
                        (server) => server !== currentServer,
                      );
                      if (nextList.length !== torrServerList.value.length) {
                        const nextState = applyServersState(
                          nextList,
                          nextList[0] || "",
                          torrServerList,
                          selectedTorServer,
                        );
                        persistServersStorage(
                          nextState.list,
                          nextState.selected,
                        );
                        toastManager.addToast({
                          message: `TorrServer ${currentServer} has been deleted.`,
                          type: "success",
                          autocloseTime: 5000,
                        });
                      }
                    }}
                  >
                    <HiMinusSolid class="text-lg" />
                    Remove
                  </button>
                </div>
                <p class="text-base-content/60 text-xs">
                  Saved locally in this browser for quick switching.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="stats stats-vertical bg-base-200/45 sm:stats-horizontal xl:stats-vertical shadow-none">
                <div class="stat py-4">
                  <div class="stat-title">Saved servers</div>
                  <div class="stat-value text-2xl">
                    {torrServerList.value.length}
                  </div>
                  <div class="stat-desc">Available in this browser</div>
                </div>
                <div class="stat py-4">
                  <div class="stat-title">Library items</div>
                  <div class="stat-value text-2xl">
                    {isCheckingTorrServer.value
                      ? "..."
                      : torrentsSig.value.length}
                  </div>
                  <div class="stat-desc">Loaded from the active server</div>
                </div>
                <div class="stat py-4">
                  <div class="stat-title">Server version</div>
                  <div class="stat-value truncate text-base font-semibold">
                    {serverVersion.value || "Not connected"}
                  </div>
                  <div class="stat-desc truncate">
                    {selectedTorServer.value || "No active server selected"}
                  </div>
                </div>
              </div>

              <div
                role="status"
                class={`alert ${connectionAlertClass(connectionState.value)}`}
              >
                <div class="space-y-1">
                  <p class="font-semibold">
                    {connectionState.value === "connected"
                      ? "Connection healthy"
                      : connectionState.value === "connecting"
                        ? "Checking server"
                        : connectionState.value === "error"
                          ? "Connection failed"
                          : "Waiting for a server"}
                  </p>
                  <p class="text-sm">{connectionMessage.value}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-8">
        {isCheckingTorrServer.value ? (
          <LoadingState
            title="Syncing TorrServer library"
            description="Fetching the current queue and matching media details."
            compact={true}
          />
        ) : torrServerList.value.length === 0 ? (
          <EmptyState
            title="No TorrServer configured yet"
            description="Add your TorrServer URL above to connect and view the library."
            compact={true}
          />
        ) : connectionState.value === "error" ? (
          <ErrorState
            title="Unable to load the selected server"
            description="Check the URL, make sure TorrServer is online, and try again."
            compact={true}
          />
        ) : !selectedTorServer.value ? (
          <EmptyState
            title="Select a saved server"
            description="Choose one of your saved endpoints to load its active library."
            compact={true}
          />
        ) : torrentsSig.value.length === 0 ? (
          <EmptyState
            title={langNoResults(lang)}
            description="Connected successfully, but this TorrServer instance does not have any torrents yet."
            compact={true}
          />
        ) : (
          <MediaGrid title={`Library (${torrentsSig.value.length})`}>
            {torrentsSig.value.map((torrent) => {
              const media = parseTorrentMedia(torrent.data);
              const href = getTorrentHref(media, lang);
              const title =
                media?.title || media?.name || torrent.title || torrent.name;
              const year = media
                ? formatYear(media.release_date ?? media.first_air_date)
                : 0;
              const rating = media?.vote_average ?? null;
              const mediaKind = media?.seasons
                ? "Series"
                : media
                  ? "Movie"
                  : "Torrent";
              const statusLabel = formatStatusLabel(torrent.stat_string);

              const actionCard = (
                <div
                  key={torrent.hash}
                  class="card border-base-200 bg-base-100 min-w-0 shadow-sm"
                >
                  <div class="card-body gap-4 p-3 sm:p-4">
                    <div class="flex flex-wrap gap-2">
                      <span class="badge badge-ghost badge-sm">
                        {mediaKind}
                      </span>
                      {statusLabel && (
                        <span class="badge badge-outline badge-sm px-3 py-2 text-center leading-tight whitespace-normal">
                          {statusLabel}
                        </span>
                      )}
                      <span class="badge badge-outline badge-sm px-3 py-2 leading-tight">
                        {formatTorrentSize(torrent.torrent_size)}
                      </span>
                      {typeof torrent.connected_seeders === "number" && (
                        <span class="badge badge-success badge-sm px-3 py-2 leading-tight">
                          {torrent.connected_seeders} seeders
                        </span>
                      )}
                    </div>

                    <div class="join w-full">
                      <a
                        href={`magnet:?xt=urn:btih:${torrent.hash}`}
                        target="_blank"
                        class="btn btn-info btn-outline btn-sm join-item min-w-0 flex-1 justify-center"
                        rel="noreferrer"
                      >
                        <LuMagnet class="text-base" />
                        <span>Magnet</span>
                      </a>
                      <button
                        type="button"
                        onClick$={async () => {
                          const torrserv = selectedTorServer.value;
                          if (torrserv === "") {
                            toastManager.addToast({
                              message: "TorrServer has not been added!",
                              type: "error",
                              autocloseTime: 5000,
                            });
                            return;
                          }
                          try {
                            try {
                              await removeTorrent(torrserv, torrent.hash);
                            } catch (error) {
                              console.error(error);
                            }

                            toastManager.addToast({
                              message: "Torrent has been deleted!",
                              type: "success",
                              autocloseTime: 5000,
                            });

                            torrentsSig.value = await listTorrent(
                              selectedTorServer.value,
                            );
                          } catch (error) {
                            console.error(error);
                            const e = error as Error;
                            toastManager.addToast({
                              message: e.message || "Unable to delete torrent!",
                              type: "error",
                              autocloseTime: 5000,
                            });
                          }
                        }}
                        class="btn btn-error btn-outline btn-sm join-item min-w-0 flex-1 justify-center"
                      >
                        <HiMinusSolid class="text-base" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        class="block min-w-0"
                        rel="noreferrer"
                      >
                        <MediaCard
                          title={title}
                          width={300}
                          rating={rating}
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
                          rating={rating}
                          year={year}
                          picfile={torrent.poster}
                          variant="poster"
                          layout="grid"
                        />
                      </div>
                    )}

                    <div class="rounded-box bg-base-200/50 text-base-content/65 space-y-1 px-3 py-2 text-xs leading-relaxed">
                      <p class="line-clamp-2 wrap-break-word">
                        {torrent.name || torrent.title}
                      </p>
                      {typeof torrent.total_peers === "number" && (
                        <p class="text-base-content/55">
                          {torrent.total_peers} peers total
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );

              return actionCard;
            })}
          </MediaGrid>
        )}
      </section>
    </div>
  );
});
