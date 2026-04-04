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
import type { PartialValues } from "@modular-forms/qwik";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { LuMagnet } from "@qwikest/icons/lucide";
import { ToastManagerContext } from "qwik-toasts";
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
  langCountLabel,
  langAddNewTorrServerURL,
  langNoResults,
  langTorrServer,
  langText,
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

export type torrServerForm = {
  ipaddress: string;
};

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

function formatTorrentSize(size: number | undefined, lang: string): string {
  if (!size || size <= 0) {
    return langText(lang, "Unknown size", "Неизвестный размер");
  }
  const sizeInGb = size / 1024 ** 3;
  return `${sizeInGb.toFixed(sizeInGb >= 100 ? 0 : 1)} ${langText(lang, "GB", "ГБ")}`;
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
  const validateTorrServer = $((values: PartialValues<torrServerForm>) => {
    const ipaddress = values.ipaddress?.trim() ?? "";
    if (!ipaddress) {
      return {
        ipaddress: langText(
          lang,
          "Please provide a valid URL!",
          "Укажите корректный URL!",
        ),
      };
    }

    try {
      // URL parsing keeps the existing behavior while avoiding extra schema plumbing.
      new URL(ipaddress);
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
  const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
    loader: { value: { ipaddress: "" } },
    validate: validateTorrServer,
  });

  const isCheckingTorrServer = useSignal(false);
  const torrentsSig = useSignal([] as TSResult[]);
  const connectionState = useSignal<ConnectionState>("idle");
  const connectionMessage = useSignal(
    langText(
      lang,
      "Add a TorrServer URL to start managing your library.",
      "Добавьте URL TorrServer, чтобы начать управлять библиотекой.",
    ),
  );
  const serverVersion = useSignal("");

  const addTorrserver = $(async (values: torrServerForm): Promise<void> => {
    const newServer = normalizeServer(values.ipaddress);
    if (torrServerList.value.includes(newServer)) {
      setValue(newTorrServerForm, "ipaddress", "");
      toastManager.addToast({
        message: langText(
          lang,
          `TorrServer ${newServer} is already in the list!`,
          `TorrServer ${newServer} уже есть в списке!`,
        ),
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
      message: langText(
        lang,
        `TorrServer ${newServer} has been added.`,
        `TorrServer ${newServer} добавлен.`,
      ),
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
          ? langText(
              lang,
              "Select a saved server to inspect its library.",
              "Выберите сохраненный сервер, чтобы открыть его библиотеку.",
            )
          : langText(
              lang,
              "Add a TorrServer URL to start managing your library.",
              "Добавьте URL TorrServer, чтобы начать управлять библиотекой.",
            );
      return;
    }

    try {
      isCheckingTorrServer.value = true;
      connectionState.value = "connecting";
      connectionMessage.value = langText(
        lang,
        `Connecting to ${selectedTorServer.value}...`,
        `Подключение к ${selectedTorServer.value}...`,
      );

      const version = await torrServerEcho(selectedTorServer.value);
      serverVersion.value = version;
      torrentsSig.value = await listTorrent(selectedTorServer.value);

      connectionState.value = "connected";
      connectionMessage.value = langText(
        lang,
        `Connected to ${selectedTorServer.value}`,
        `Подключено к ${selectedTorServer.value}`,
      );
    } catch (error) {
      console.error(error);
      connectionState.value = "error";
      connectionMessage.value = langText(
        lang,
        `Failed to reach ${selectedTorServer.value}`,
        `Не удалось подключиться к ${selectedTorServer.value}`,
      );
    } finally {
      isCheckingTorrServer.value = false;
    }
  });

  return (
    <div class="mx-auto w-full max-w-7xl px-4 pb-10">
      <SectionHeading
        eyebrow={langText(lang, "Tools", "Инструменты")}
        title={langTorrServer(lang)}
        description={langText(
          lang,
          "Connect TorrServer, inspect indexed items, and launch playback-ready actions from the same operational view.",
          "Подключайте TorrServer, просматривайте индексированные элементы и запускайте действия для воспроизведения из единого рабочего экрана.",
        )}
      />
      <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed md:text-base">
        {langText(
          lang,
          "Connect a TorrServer instance, manage saved endpoints, and review the current library from one focused workspace.",
          "Подключите экземпляр TorrServer, управляйте сохраненными адресами и просматривайте текущую библиотеку в одном рабочем пространстве.",
        )}
      </p>

      <section class="card border-base-200 bg-base-100/90 mt-6 border shadow-sm backdrop-blur">
        <div class="card-body gap-6">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
            <div class="space-y-5">
              <div class="space-y-1">
                <h2 class="card-title text-xl">
                  {langText(lang, "Connection workspace", "Рабочая область подключения")}
                </h2>
                <p class="text-base-content/70 text-sm">
                  {langText(
                    lang,
                    "Add a new endpoint, switch between saved servers, and keep the active library in view below.",
                    "Добавьте новый адрес, переключайтесь между сохраненными серверами и держите активную библиотеку внизу на виду.",
                  )}
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
                            {langText(lang, "URL", "Адрес")}
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
                <label class="label pt-0" for="active-torrserver">
                  <span class="label-text font-medium">
                    {langText(lang, "Active server", "Активный сервер")}
                  </span>
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
                      <option value="">
                        {langText(lang, "No TorrServer added", "TorrServer не добавлен")}
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
                          message: langText(
                            lang,
                            `TorrServer ${currentServer} has been deleted.`,
                            `TorrServer ${currentServer} удален.`,
                          ),
                          type: "success",
                          autocloseTime: 5000,
                        });
                      }
                    }}
                  >
                    <HiMinusSolid class="text-lg" />
                    {langText(lang, "Remove", "Удалить")}
                  </button>
                </div>
                <p class="text-base-content/60 text-xs">
                  {langText(
                    lang,
                    "Saved locally in this browser for quick switching.",
                    "Сохранено локально в этом браузере для быстрого переключения.",
                  )}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="stats stats-vertical bg-base-200/45 sm:stats-horizontal xl:stats-vertical shadow-none">
                <div class="stat py-4">
                  <div class="stat-title">
                    {langText(lang, "Saved servers", "Сохраненные серверы")}
                  </div>
                  <div class="stat-value text-2xl">
                    {torrServerList.value.length}
                  </div>
                  <div class="stat-desc">
                    {langText(lang, "Available in this browser", "Доступно в этом браузере")}
                  </div>
                </div>
                <div class="stat py-4">
                  <div class="stat-title">
                    {langText(lang, "Library items", "Элементы библиотеки")}
                  </div>
                  <div class="stat-value text-2xl">
                    {isCheckingTorrServer.value
                      ? "..."
                      : torrentsSig.value.length}
                  </div>
                  <div class="stat-desc">
                    {langText(lang, "Loaded from the active server", "Загружено с активного сервера")}
                  </div>
                </div>
                <div class="stat py-4">
                  <div class="stat-title">
                    {langText(lang, "Server version", "Версия сервера")}
                  </div>
                  <div class="stat-value truncate text-base font-semibold">
                    {serverVersion.value || langText(lang, "Not connected", "Не подключено")}
                  </div>
                  <div class="stat-desc truncate">
                    {selectedTorServer.value ||
                      langText(
                        lang,
                        "No active server selected",
                        "Не выбран активный сервер",
                      )}
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
                      ? langText(lang, "Connection healthy", "Соединение установлено")
                      : connectionState.value === "connecting"
                        ? langText(lang, "Checking server", "Проверка сервера")
                        : connectionState.value === "error"
                          ? langText(lang, "Connection failed", "Ошибка подключения")
                          : langText(lang, "Waiting for a server", "Ожидание сервера")}
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
            title={langText(
              lang,
              "Syncing TorrServer library",
              "Синхронизация библиотеки TorrServer",
            )}
            description={langText(
              lang,
              "Fetching the current queue and matching media details.",
              "Получаем текущую очередь и сопоставляем данные медиа.",
            )}
            compact={true}
          />
        ) : torrServerList.value.length === 0 ? (
          <EmptyState
            title={langText(
              lang,
              "No TorrServer configured yet",
              "TorrServer еще не настроен",
            )}
            description={langText(
              lang,
              "Add your TorrServer URL above to connect and view the library.",
              "Добавьте URL TorrServer выше, чтобы подключиться и посмотреть библиотеку.",
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
            title={langText(
              lang,
              "Select a saved server",
              "Выберите сохраненный сервер",
            )}
            description={langText(
              lang,
              "Choose one of your saved endpoints to load its active library.",
              "Выберите один из сохраненных адресов, чтобы загрузить его активную библиотеку.",
            )}
            compact={true}
          />
        ) : torrentsSig.value.length === 0 ? (
          <EmptyState
            title={langNoResults(lang)}
            description={langText(
              lang,
              "Connected successfully, but this TorrServer instance does not have any torrents yet.",
              "Подключение выполнено, но в этом экземпляре TorrServer пока нет торрентов.",
            )}
            compact={true}
          />
        ) : (
          <MediaGrid
            eyebrow={langText(lang, "Library", "Библиотека")}
            headerBadge={langCountLabel(
              lang,
              torrentsSig.value.length,
              "item",
              "items",
              "элемент",
              "элемента",
              "элементов",
            )}
            title={langText(
              lang,
              `Library (${torrentsSig.value.length})`,
              `Библиотека (${torrentsSig.value.length})`,
            )}
          >
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
                ? langText(lang, "Series", "Сериал")
                : media
                  ? langText(lang, "Movie", "Фильм")
                  : langText(lang, "Torrent", "Торрент");
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
                        {formatTorrentSize(torrent.torrent_size, lang)}
                      </span>
                      {typeof torrent.connected_seeders === "number" && (
                        <span class="badge badge-success badge-sm px-3 py-2 leading-tight">
                          {langText(
                            lang,
                            `${torrent.connected_seeders} seeders`,
                            `${torrent.connected_seeders} сидеров`,
                          )}
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
                        <span>{langText(lang, "Magnet", "Магнет")}</span>
                      </a>
                      <button
                        type="button"
                        onClick$={async () => {
                          const torrserv = selectedTorServer.value;
                          if (torrserv === "") {
                            toastManager.addToast({
                              message: langText(
                                lang,
                                "TorrServer has not been added!",
                                "TorrServer не добавлен!",
                              ),
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
                              message: langText(
                                lang,
                                "Torrent has been deleted!",
                                "Торрент удален!",
                              ),
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
                              message:
                                e.message ||
                                langText(
                                  lang,
                                  "Unable to delete torrent!",
                                  "Не удалось удалить торрент!",
                                ),
                              type: "error",
                              autocloseTime: 5000,
                            });
                          }
                        }}
                        class="btn btn-error btn-outline btn-sm join-item min-w-0 flex-1 justify-center"
                      >
                        <HiMinusSolid class="text-base" />
                        <span>{langText(lang, "Remove", "Удалить")}</span>
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
                          {langText(
                            lang,
                            `${torrent.total_peers} peers total`,
                            `всего ${torrent.total_peers} пиров`,
                          )}
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
