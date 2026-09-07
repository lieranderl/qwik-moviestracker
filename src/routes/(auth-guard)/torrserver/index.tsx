import { message } from "~/utils/i18n";
import {
  $,
  component$,
  noSerialize,
  type NoSerialize,
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
  TorrServerFileWorkspaceModal,
  TorrServerSummaryCard,
} from "~/components/torrserver";
import type {
  TorrServerSummaryBadge,
  TorrServerSummaryMetric,
} from "~/components/torrserver";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import type { TSResult } from "~/services/models";
import {
  activateTorrentUntilReady,
  buildTorrentPlaylistUrl,
  dropTorrent,
  listTorrent,
  removeTorrent,
  type TorrServerSettings,
  type TorrServerStorageSettings,
  type TorrServerTmdbSettings,
  type TorrServerTorrentStatus,
  type TorrServerViewedItem,
} from "~/services/torrserver";
import {
  loadTorrServerWorkspace,
  mergePolledTorrents,
  nextPollDelay,
  transitionConnection,
} from "~/services/torrserver/workspace";
import { readStorageString } from "~/utils/browser";
import { langItemsCount } from "~/utils/languages";
import {
  applyServersState,
  filterTorrServerTorrents,
  getDefaultSelectedTorrentHash,
  getHydratedServersState,
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
      return message(lang, "ui.connected");
    case "connecting":
      return message(lang, "ui.checking");
    case "error":
      return message(lang, "ui.failed");
    default:
      return message(lang, "ui.waiting");
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
  const serverVersion = useSignal("");
  const settingsSig = useSignal<TorrServerSettings | null>(null);
  const storageSettingsSig = useSignal<TorrServerStorageSettings | null>(null);
  const tmdbSettingsSig = useSignal<TorrServerTmdbSettings | null>(null);
  const statsTextSig = useSignal("");
  const viewedItemsSig = useSignal<TorrServerViewedItem[]>([]);
  const activatingHashSig = useSignal("");
  const snapshotRequestId = useSignal(0);
  const snapshotControllerSig = useSignal<NoSerialize<AbortController>>();
  const activationControllerSig = useSignal<NoSerialize<AbortController>>();

  const statusFilterSig = useSignal<TorrServerStatusFilter>("all");
  const sortKeySig = useSignal<TorrServerSortKey>("recent");
  const selectedTorrentHash = useSignal("");
  const fileModalOpen = useSignal(false);
  const apiToolsModalOpen = useSignal(false);

  const validateTorrServer = $((values: PartialValues<TorrServerForm>) => {
    const ip = values.ipaddress?.trim() ?? "";
    if (!ip)
      return {
        ipaddress: message(lang, "ui.pleaseProvideAValidUrl"),
      };
    try {
      new URL(ip);
      return {};
    } catch {
      return {
        ipaddress: message(lang, "ui.pleaseProvideAValidUrl"),
      };
    }
  });

  const [newTorrServerForm, { Form, Field }] = useForm<TorrServerForm>({
    loader: { value: { ipaddress: "" } },
    validate: validateTorrServer,
  });

  /* ── Server lifecycle ──────────────────────────────────── */

  const loadServerSnapshot = $(async (serverUrl: string): Promise<void> => {
    snapshotControllerSig.value?.abort();
    activationControllerSig.value?.abort();
    const requestId = snapshotRequestId.value + 1;
    snapshotRequestId.value = requestId;
    torrentsSig.value = [];
    serverVersion.value = "";
    settingsSig.value = null;
    storageSettingsSig.value = null;
    tmdbSettingsSig.value = null;
    statsTextSig.value = "";
    viewedItemsSig.value = [];

    if (!serverUrl) {
      snapshotControllerSig.value = undefined;
      connectionState.value = transitionConnection(
        connectionState.value,
        "clear",
      );
      return;
    }

    const controller = new AbortController();
    snapshotControllerSig.value = noSerialize(controller);
    try {
      isCheckingTorrServer.value = true;
      connectionState.value = transitionConnection(
        connectionState.value,
        "connect",
      );
      const snapshot = await loadTorrServerWorkspace(
        serverUrl,
        undefined,
        controller.signal,
      );
      if (requestId !== snapshotRequestId.value) return;
      serverVersion.value = snapshot.version;
      torrentsSig.value = snapshot.torrents;
      settingsSig.value = snapshot.settings;
      storageSettingsSig.value = snapshot.storageSettings;
      tmdbSettingsSig.value = snapshot.tmdbSettings;
      statsTextSig.value = snapshot.stats;
      viewedItemsSig.value = snapshot.viewedItems;
      connectionState.value = transitionConnection(
        connectionState.value,
        "success",
      );
    } catch (error) {
      if (requestId !== snapshotRequestId.value) return;
      if (controller.signal.aborted) return;
      console.error(error);
      connectionState.value = transitionConnection(
        connectionState.value,
        "failure",
      );
    } finally {
      if (requestId === snapshotRequestId.value) {
        snapshotControllerSig.value = undefined;
        isCheckingTorrServer.value = false;
      }
    }
  });

  /* ── Computed state ────────────────────────────────────── */

  const filteredTorrentsSig = useComputed$(() =>
    sortTorrents(
      filterTorrServerTorrents(
        torrentsSig.value as TSResult[],
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

  const summaryMetrics = useComputed$<TorrServerSummaryMetric[]>(() => [
    {
      label: message(lang, "ui.servers"),
      value: torrServerList.value.length,
    },
    {
      label: message(lang, "ui.library"),
      value: isCheckingTorrServer.value ? "..." : torrentsSig.value.length,
    },
    {
      label: message(lang, "ui.version"),
      value: serverVersion.value || message(lang, "ui.notConnected"),
    },
    {
      label: message(lang, "ui.viewed"),
      value: viewedItemsSig.value.length,
    },
  ]);

  const summaryBadges = useComputed$<TorrServerSummaryBadge[]>(() => {
    const badges: TorrServerSummaryBadge[] = [];
    if (settingsSig.value) {
      badges.push({
        label: settingsSig.value.useDisk
          ? message(lang, "ui.diskCache")
          : message(lang, "ui.memoryCache"),
        tone: settingsSig.value.useDisk ? "warning" : "info",
      });
    }
    if (storageSettingsSig.value) {
      badges.push({
        label: message(lang, "torrserver.viewedStorage", {
          storage: storageSettingsSig.value.viewed,
        }),
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
        message: message(lang, "torrserver.alreadyExists", { server: srv }),
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
      message: message(lang, "torrserver.added", { server: srv }),
      type: "success",
      autocloseTime: 5000,
    });
  });

  const removeActiveServer = $(async () => {
    const cur = selectedTorServer.value;
    if (!cur) return;
    const confirmed = globalThis.confirm(
      message(lang, "torrserver.removeServerConfirm", { server: cur }),
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
      message: message(lang, "torrserver.deleted", { server: cur }),
      type: "success",
      autocloseTime: 5000,
    });
  });

  const activateAndPollTorrent = $(
    async (hash: string): Promise<TorrServerTorrentStatus | null> => {
      if (!selectedTorServer.value) return null;
      const baseUrl = selectedTorServer.value;
      activationControllerSig.value?.abort();
      const controller = new AbortController();
      activationControllerSig.value = noSerialize(controller);
      activatingHashSig.value = hash;
      try {
        return await activateTorrentUntilReady(baseUrl, hash, {
          signal: controller.signal,
          onUpdate: (fresh) => {
            if (
              controller.signal.aborted ||
              selectedTorServer.value !== baseUrl
            ) {
              return;
            }
            torrentsSig.value = torrentsSig.value.map((t) =>
              t.hash === hash ? fresh : t,
            );
          },
        });
      } catch (error) {
        if (!controller.signal.aborted) throw error;
        return null;
      } finally {
        if (activationControllerSig.value === controller) {
          activationControllerSig.value = undefined;
          activatingHashSig.value = "";
        }
      }
    },
  );

  const openFilesForTorrent = $(async (torrent: TorrServerTorrentStatus) => {
    selectedTorrentHash.value = torrent.hash;
    fileModalOpen.value = true;
    if (torrent.files.length === 0) {
      await activateAndPollTorrent(torrent.hash);
    }
  });

  const dropTorrentFromServer = $(async (torrent: TorrServerTorrentStatus) => {
    if (!selectedTorServer.value) return;
    const confirmed = globalThis.confirm(
      message(lang, "torrserver.dropActiveConfirm", {
        title: torrent.title || torrent.name,
      }),
    );
    if (!confirmed) return;
    try {
      await dropTorrent(selectedTorServer.value, torrent.hash);
      toastManager.addToast({
        message: message(lang, "ui.torrentDropped"),
        type: "success",
        autocloseTime: 4000,
      });
    } catch (error) {
      console.error(error);
      toastManager.addToast({
        message: message(lang, "ui.couldNotDropTorrent"),
        type: "error",
        autocloseTime: 5000,
      });
    }
  });

  const removeTorrentFromLibrary = $(
    async (torrent: TorrServerTorrentStatus) => {
      if (!selectedTorServer.value) return;
      const confirmed = globalThis.confirm(
        message(lang, "torrserver.removeTorrentConfirm", {
          title: torrent.title || torrent.name,
        }),
      );
      if (!confirmed) return;
      try {
        await removeTorrent(selectedTorServer.value, torrent.hash);
        toastManager.addToast({
          message: message(lang, "ui.torrentHasBeenDeleted"),
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
              : message(lang, "ui.unableToDeleteTorrent"),
          type: "error",
          autocloseTime: 5000,
        });
      }
    },
  );

  /* ── Side effects ──────────────────────────────────────── */

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    hydrateServers();
    cleanup(() => {
      snapshotControllerSig.value?.abort();
      activationControllerSig.value?.abort();
    });
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
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
    const baseUrl = track(() => selectedTorServer.value);
    const connState = track(() => connectionState.value);
    if (!baseUrl || connState !== "connected") return;
    let disposed = false;
    let failures = 0;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    const schedule = () => {
      if (disposed || document.visibilityState !== "visible") return;
      timer = setTimeout(() => void poll(), nextPollDelay(failures));
    };

    const poll = async () => {
      if (disposed || running || document.visibilityState !== "visible") return;
      running = true;
      controller = new AbortController();
      try {
        const updated = await listTorrent(baseUrl, controller.signal);
        if (disposed) return;
        torrentsSig.value = mergePolledTorrents(
          torrentsSig.value,
          updated,
          activatingHashSig.value,
        );
        failures = 0;
      } catch (error) {
        if (!controller.signal.aborted) {
          failures += 1;
          console.error("Live stats poll failed", error);
        }
      } finally {
        running = false;
        schedule();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        if (timer) clearTimeout(timer);
        controller?.abort();
        return;
      }
      if (!running) void poll();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();
    cleanup(() => {
      disposed = true;
      if (timer) clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    });
  });

  const visibleCount = filteredTorrentsSig.value.length;

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div class="mx-auto w-full max-w-7xl space-y-6 pb-10 md:space-y-8">
      <SectionHeading
        eyebrow={message(lang, "ui.streamingLibrary")}
        title={message(lang, "langTorrServer")}
        description={message(
          lang,
          "ui.manageSavedTorrserverEndpointsReviewServerHealthAndOpenTorrentFilesFromO",
        )}
      />

      <div class="space-y-6 md:space-y-8">
        {/* ── Connection workspace ─────────────────────────── */}
        <section
          aria-labelledby="torrserver-servers-title"
          class="card border-base-200 bg-base-100 border shadow-sm"
        >
          <div class="card-body gap-5 p-4 md:gap-6 md:p-6">
            <header class="space-y-1">
              <h2 id="torrserver-servers-title" class="card-title md:text-2xl">
                {message(lang, "ui.servers")}
              </h2>
              <p class="text-base-content/65 text-sm leading-relaxed">
                {message(
                  lang,
                  "ui.addAnEndpointChooseTheActiveServerThenRefreshItsCurrentState",
                )}
              </p>
            </header>

            <Form onSubmit$={addTorrserver}>
              <Field name="ipaddress">
                {(field, props) => (
                  <div class="form-control gap-2">
                    <label class="label px-0 py-0" for="torrserver-url">
                      <span class="label-text font-medium">
                        {message(lang, "ui.torrserverUrl")}
                      </span>
                    </label>
                    <div class="join join-vertical sm:join-horizontal w-full">
                      <label
                        class="input input-bordered join-item flex w-full min-w-0 items-center gap-2"
                        for="torrserver-url"
                      >
                        <input
                          {...props}
                          id="torrserver-url"
                          type="url"
                          placeholder={message(lang, "langAddNewTorrServerURL")}
                          aria-describedby={
                            field.error ? "torrserver-url-error" : undefined
                          }
                          aria-invalid={field.error ? "true" : undefined}
                          class="min-w-0 grow"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={newTorrServerForm.invalid}
                        class="btn btn-primary join-item w-full sm:w-32 sm:shrink-0"
                      >
                        <HiPlusSolid class="text-lg" />
                        {message(lang, "ui.add")}
                      </button>
                    </div>
                    {field.error && (
                      <p id="torrserver-url-error" class="text-error text-sm">
                        {field.error}
                      </p>
                    )}
                  </div>
                )}
              </Field>
            </Form>

            <label class="form-control gap-2">
              <span class="label px-0 py-0">
                <span class="label-text font-medium">
                  {message(lang, "ui.activeServer")}
                </span>
              </span>
              <div class="join join-vertical md:join-horizontal w-full">
                <select
                  id="active-torrserver"
                  value={selectedTorServer.value}
                  aria-label={message(lang, "ui.chooseActiveTorrserver")}
                  class="select select-bordered join-item min-h-11 w-full min-w-0"
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
                      {message(lang, "ui.noTorrserverAdded")}
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
                  class="btn btn-outline join-item min-h-11 w-full md:w-28 md:shrink-0"
                  onClick$={() => loadServerSnapshot(selectedTorServer.value)}
                >
                  {message(lang, "ui.refresh")}
                </button>
                <button
                  type="button"
                  disabled={!selectedTorServer.value}
                  class="btn btn-error btn-outline join-item min-h-11 w-full md:w-32 md:shrink-0"
                  onClick$={removeActiveServer}
                >
                  <HiMinusSolid class="text-lg" />
                  {message(lang, "ui.remove")}
                </button>
              </div>
            </label>
          </div>
        </section>

        {/* ── Summary card ─────────────────────────────────── */}
        <TorrServerSummaryCard
          title={message(lang, "ui.serverSummary")}
          description={message(
            lang,
            "ui.currentConnectionCacheStorageAndPlaybackShortcutsForTheSelectedEndpoint",
          )}
          endpoint={
            selectedTorServer.value || message(lang, "ui.noEndpointSelected")
          }
          version={serverVersion.value}
          connectionLabel={getConnectionLabel(connectionState.value, lang)}
          metrics={summaryMetrics.value}
          badges={summaryBadges.value}
        >
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
              <p class="font-semibold">
                {message(lang, "ui.streamingProfile")}
              </p>
              <p class="text-base-content/70 mt-2 text-sm leading-relaxed">
                {settingsSig.value
                  ? message(lang, "torrserver.runtimeSettings", {
                      preload: settingsSig.value.preloadCache,
                      readAhead: settingsSig.value.readerReadAhead,
                      connections: settingsSig.value.connectionsLimit,
                    })
                  : message(
                      lang,
                      "ui.connectAServerToInspectCacheAndNetworkTuning",
                    )}
              </p>
            </div>
            <div class="rounded-box border-base-200 bg-base-200/40 border p-4">
              <p class="font-semibold">{message(lang, "ui.storageAndTmdb")}</p>
              <p class="text-base-content/70 mt-2 text-sm leading-relaxed">
                {storageSettingsSig.value
                  ? message(lang, "torrserver.storageSummary", {
                      settings: storageSettingsSig.value.settings,
                      viewed: storageSettingsSig.value.viewed,
                      count: storageSettingsSig.value.viewedCount,
                    })
                  : message(
                      lang,
                      "ui.storageDetailsAreNotAvailableUntilAServerResponds",
                    )}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {selectedTorServer.value && (
              <a
                href={buildTorrentPlaylistUrl(
                  selectedTorServer.value,
                  selectedTorrentSig.value?.hash || "",
                  {},
                )}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline min-h-11 flex-1 sm:flex-none"
                aria-label={message(lang, "ui.openPlaylistForSelectedTorrent")}
              >
                {message(lang, "ui.playlistForSelected")}
              </a>
            )}
            {selectedTorServer.value && (
              <a
                href={`${selectedTorServer.value}/playlistall/all.m3u`}
                target="_blank"
                rel="noreferrer"
                class="btn btn-outline min-h-11 flex-1 sm:flex-none"
                aria-label={message(lang, "ui.openFullLibraryM3uPlaylist")}
              >
                {message(lang, "ui.fullLibraryM3u")}
              </a>
            )}
            <button
              type="button"
              class="btn btn-primary min-h-11 flex-1 sm:flex-none"
              disabled={!selectedTorServer.value}
              onClick$={() => {
                apiToolsModalOpen.value = true;
              }}
            >
              {message(lang, "ui.tools")}
            </button>
          </div>
        </TorrServerSummaryCard>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <TorrServerFilters
        lang={lang}
        sortKeySig={sortKeySig}
        statusFilterSig={statusFilterSig}
      />

      {/* ── Library grid ─────────────────────────────────── */}
      <section>
        {isCheckingTorrServer.value ? (
          <LoadingState
            title={message(lang, "ui.syncingTorrserver")}
            description={message(lang, "ui.loadingLibraryAndSettings")}
            compact={true}
          />
        ) : torrServerList.value.length === 0 ? (
          <EmptyState
            title={message(lang, "ui.noTorrserverYet")}
            description={message(lang, "ui.addAUrlAboveToConnect")}
            compact={true}
          />
        ) : connectionState.value === "error" ? (
          <ErrorState
            title={message(lang, "ui.unableToLoadTheSelectedServer")}
            description={message(
              lang,
              "ui.checkTheUrlMakeSureTorrserverIsOnlineAndTryAgain",
            )}
            compact={true}
          />
        ) : !selectedTorServer.value ? (
          <EmptyState
            title={message(lang, "ui.selectAServer")}
            description={message(lang, "ui.chooseASavedEndpoint")}
            compact={true}
          />
        ) : visibleCount === 0 ? (
          <EmptyState
            title={message(lang, "langNoResults")}
            description={message(lang, "ui.noTorrentsMatchTheseFilters")}
            compact={true}
          />
        ) : (
          <MediaGrid
            title={message(lang, "ui.library")}
            maxColumns={4}
            headerBadge={langItemsCount(lang, visibleCount)}
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
      <TorrServerFileWorkspaceModal
        open={fileModalOpen.value}
        lang={lang}
        serverUrl={selectedTorServer.value}
        torrent={selectedTorrentSig.value}
        loading={
          activatingHashSig.value === selectedTorrentHash.value &&
          activatingHashSig.value !== ""
        }
        onClose$={$(() => {
          activationControllerSig.value?.abort();
          fileModalOpen.value = false;
        })}
        onViewedChanged$={$((items) => {
          viewedItemsSig.value = items;
        })}
      />
      <TorrServerApiToolsModal
        open={apiToolsModalOpen.value}
        lang={lang}
        serverUrl={selectedTorServer.value}
        onClose$={$(() => {
          apiToolsModalOpen.value = false;
        })}
        onLibraryChanged$={$(() => loadServerSnapshot(selectedTorServer.value))}
        statsText={statsTextSig.value}
      />
    </div>
  );
});
