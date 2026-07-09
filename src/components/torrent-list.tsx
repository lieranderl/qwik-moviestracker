import {
  $,
  component$,
  useId,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import type { MovieDetails, Torrent } from "~/services/models";
import { filterAndSortTorrents } from "~/utils/filter-utils";
import {
  getDynamicRangeLabel,
  getTorrentDynamicRangeValue,
  type DynamicRangeFilter,
} from "~/utils/torrent-format";
import {
  langDate,
  langFound,
  langLeeches,
  langNotFound,
  langSeeds,
  langSize,
  langSortOn,
  langText,
  langTorrentov,
} from "~/utils/languages";
import { TorrentBlock } from "./torrent";

type SelectFilterKey =
  "category" | "dynamicRange" | "quality" | "season" | "tracker" | "voice";
type ClearableFilterKey =
  "category" | "dynamicRange" | "quality" | "season" | "tracker" | "voice";

type TorrentFilterOption = {
  count: number;
  label: string;
  value: string;
};

const addOption = (
  options: Map<string, TorrentFilterOption>,
  value: null | number | string | undefined,
  label?: null | string,
) => {
  if (value === null || value === undefined || value === "") {
    return;
  }

  const key = String(value);
  const current = options.get(key);
  options.set(key, {
    count: (current?.count ?? 0) + 1,
    label: current?.label || label || key,
    value: key,
  });
};

const sortOptions = (options: Map<string, TorrentFilterOption>) =>
  [...options.values()].sort((left, right) =>
    left.label.localeCompare(right.label),
  );

const getTrackerOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    addOption(options, torrent.Tracker);
  }
  return sortOptions(options);
};

const getQualityOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    if (torrent.Quality) {
      addOption(
        options,
        torrent.Quality,
        torrent.QualityLabel || `${torrent.Quality}p`,
      );
      continue;
    }

    if (torrent.K4) {
      addOption(options, 2160, "4K");
    } else if (torrent.FHD) {
      addOption(options, 1080, "1080p");
    }
  }
  return [...options.values()].sort(
    (left, right) => Number(right.value) - Number(left.value),
  );
};

const getDynamicRangeOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    const value = getTorrentDynamicRangeValue(torrent);
    addOption(options, value, getDynamicRangeLabel(value));
  }
  const order: DynamicRangeFilter[] = ["dv", "hdr10plus", "hdr10", "hdr"];
  return [...options.values()].sort(
    (left, right) =>
      order.indexOf(left.value as DynamicRangeFilter) -
      order.indexOf(right.value as DynamicRangeFilter),
  );
};

const getVoiceOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    for (const voice of torrent.Voices ?? []) {
      addOption(options, voice);
    }
  }
  return sortOptions(options);
};

const getCategoryOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    for (const [index, category] of (torrent.Categories ?? []).entries()) {
      addOption(options, category, torrent.CategoryLabels?.[index] ?? category);
    }
  }
  return sortOptions(options);
};

const getSeasonOptions = (torrents: Torrent[] | null) => {
  const options = new Map<string, TorrentFilterOption>();
  for (const torrent of torrents ?? []) {
    for (const optionSeason of torrent.Seasons ?? []) {
      addOption(options, optionSeason, `S${optionSeason}`);
    }
  }
  return [...options.values()].sort(
    (left, right) => Number(left.value) - Number(right.value),
  );
};

export type TorrentListProps = {
  torrents: Torrent[] | null;
  movie: MovieDetails;
  lang: string;
  sourceLoaded?: number;
  sourceTotal?: number;
};

export const TorrentList = component$(
  ({
    torrents,
    movie,
    lang,
    sourceLoaded = 0,
    sourceTotal = 0,
  }: TorrentListProps) => {
    const resetFiltersLabel =
      lang === "en-US" ? "Reset filters" : "Сбросить фильтры";

    const sortAttrib = [
      { value: "Date", text: langDate(lang) },
      { value: "Size", text: langSize(lang) },
      { value: "Seeds", text: langSeeds(lang) },
      { value: "Leeches", text: langLeeches(lang) },
    ];
    const initTorrents = useStore({ value: torrents as Torrent[] | null });
    const sourceStats = useStore({
      loaded: sourceLoaded,
      total: sourceTotal,
    });
    const sortedTorrents = useStore({ value: null as Torrent[] | null });
    const sortFilterStore = useStore({
      selectedSort: "Date" as string,
      filterChecked: false as boolean,
      category: "" as string,
      dynamicRange: "" as string,
      quality: "" as string,
      season: "" as string,
      tracker: "" as string,
      videoType: "" as string,
      voice: "" as string,
    });

    const filterTorrents = $(() => {
      if (initTorrents.value) {
        sortedTorrents.value = filterAndSortTorrents(
          initTorrents.value,
          sortFilterStore,
        );
      }
    });
    const touchFilters = $(() => {
      sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
    });
    const setSort = $((value: string) => {
      sortFilterStore.selectedSort = value;
      touchFilters();
    });
    const setSelectFilter = $((key: SelectFilterKey, value: string) => {
      sortFilterStore[key] = value;
      touchFilters();
    });
    const clearSelectFilter = $((key: ClearableFilterKey) => {
      sortFilterStore[key] = "";
      touchFilters();
    });
    const resetFilters = $(() => {
      sortFilterStore.category = "";
      sortFilterStore.dynamicRange = "";
      sortFilterStore.quality = "";
      sortFilterStore.season = "";
      sortFilterStore.tracker = "";
      sortFilterStore.videoType = "";
      sortFilterStore.voice = "";
      touchFilters();
    });

    const formatMegaId = useId();
    const openMenuSig = useSignal<string | null>(null);



    useTask$((ctx) => {
      ctx.track(() => torrents);
      initTorrents.value = torrents;
    });

    useTask$((ctx) => {
      ctx.track(() => sourceLoaded);
      ctx.track(() => sourceTotal);
      sourceStats.loaded = sourceLoaded;
      sourceStats.total = sourceTotal;
    });

    useTask$((ctx) => {
      ctx.track(() => initTorrents.value);
      ctx.track(() => sortFilterStore.filterChecked);
      filterTorrents();
    });

    const qualityOptions = getQualityOptions(initTorrents.value);
    const dynamicRangeOptions = getDynamicRangeOptions(initTorrents.value);
    const trackerOptions = getTrackerOptions(initTorrents.value);
    const voiceOptions = getVoiceOptions(initTorrents.value);
    const categoryOptions = getCategoryOptions(initTorrents.value);
    const seasonOptions = getSeasonOptions(initTorrents.value);
    const activeFilterCandidates: Array<{
      key: ClearableFilterKey;
      label: string;
      value: string;
    }> = [
      {
        key: "quality",
        label:
          qualityOptions.find(
            (option) => option.value === sortFilterStore.quality,
          )?.label ?? "",
        value: sortFilterStore.quality,
      },
      {
        key: "dynamicRange",
        label: getDynamicRangeLabel(
          sortFilterStore.dynamicRange as DynamicRangeFilter,
        ),
        value: sortFilterStore.dynamicRange,
      },
      {
        key: "tracker",
        label: sortFilterStore.tracker,
        value: sortFilterStore.tracker,
      },
      {
        key: "voice",
        label: sortFilterStore.voice,
        value: sortFilterStore.voice,
      },
      {
        key: "category",
        label:
          categoryOptions.find(
            (option) => option.value === sortFilterStore.category,
          )?.label ?? "",
        value: sortFilterStore.category,
      },
      {
        key: "season",
        label:
          seasonOptions.find(
            (option) => option.value === sortFilterStore.season,
          )?.label ?? "",
        value: sortFilterStore.season,
      },
    ];
    const activeFilterChips = activeFilterCandidates.filter(
      (chip) => chip.value && chip.label,
    );
    const advancedFilterGroups = [
      {
        key: "voice" as const,
        label: langText(lang, "Voice", "Озвучка"),
        options: voiceOptions,
        value: sortFilterStore.voice,
      },
      {
        key: "category" as const,
        label: langText(lang, "Category", "Категория"),
        options: categoryOptions,
        value: sortFilterStore.category,
      },
      {
        key: "season" as const,
        label: langText(lang, "Season", "Сезон"),
        options: seasonOptions,
        value: sortFilterStore.season,
      },
    ].filter((group) => group.options.length > 0);

    return (
      <>
        {sortedTorrents.value !== null && (
          <div class="mb-4 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label class="form-control">
              <div class="label px-0 pt-0 pb-1">
                <span class="label-text font-medium">{langSortOn(lang)}</span>
              </div>
              <select
                value={sortFilterStore.selectedSort}
                onChange$={(_, element) => {
                  setSort(element.value);
                }}
                class="select select-bordered md:select-sm min-h-11 min-w-40 text-base"
              >
                {sortAttrib.map((attrib) => (
                  <option value={attrib.value} key={attrib.value}>
                    {attrib.text}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {sortedTorrents.value !== null && (
          <form onReset$={resetFilters} class="relative z-20 mb-4 space-y-3">
            <div class="flex flex-wrap items-end gap-3">
              {(qualityOptions.length > 0 ||
                dynamicRangeOptions.length > 0) && (
                <div
                  class="megamenu megamenu-sm p-2 border border-base-300 rounded-box"
                  id={formatMegaId}
                >
                  <span class="megamenu-active"></span>

                  {qualityOptions.length > 0 && (
                    <div class="relative inline-flex">
                      <button
                        type="button"
                        class="after:content-none min-h-0 px-3"
                        onClick$={() =>
                          (openMenuSig.value =
                            openMenuSig.value === "quality" ? null : "quality")
                        }
                      >
                        <span class="text-xs opacity-60 mr-1">
                          {langText(lang, "Resolution:", "Разрешение:")}
                        </span>
                        <span class="font-medium text-sm">
                          {qualityOptions.find(
                            (o) => o.value === sortFilterStore.quality,
                          )?.label || langText(lang, "Any", "Любое")}
                        </span>
                      </button>
                      {openMenuSig.value === "quality" && (
                        <ul class="menu bg-base-100 rounded-box border border-base-300 absolute top-full left-0 z-30 mt-1 w-56 shadow-lg p-2">
                          <li>
                            <button
                              type="button"
                              class={!sortFilterStore.quality ? "active" : ""}
                              onClick$={() => {
                                setSelectFilter("quality", "");
                                openMenuSig.value = null;
                              }}
                            >
                              {langText(lang, "Any", "Любое")}
                            </button>
                          </li>
                          {qualityOptions.map((option) => (
                            <li key={option.value}>
                              <button
                                type="button"
                                class={
                                  sortFilterStore.quality === option.value
                                    ? "active"
                                    : ""
                                }
                                onClick$={() => {
                                  setSelectFilter("quality", option.value);
                                  openMenuSig.value = null;
                                }}
                              >
                                {option.label} ({option.count})
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {dynamicRangeOptions.length > 0 && (
                    <div class="relative inline-flex">
                      <button
                        type="button"
                        class="after:content-none min-h-0 px-3"
                        onClick$={() =>
                          (openMenuSig.value =
                            openMenuSig.value === "dr" ? null : "dr")
                        }
                      >
                        <span class="text-xs opacity-60 mr-1">
                          {langText(lang, "HDR:", "HDR:")}
                        </span>
                        <span class="font-medium text-sm">
                          {getDynamicRangeLabel(
                            sortFilterStore.dynamicRange as DynamicRangeFilter,
                          ) || langText(lang, "Any", "Любое")}
                        </span>
                      </button>
                      {openMenuSig.value === "dr" && (
                        <ul class="menu bg-base-100 rounded-box border border-base-300 absolute top-full left-0 z-30 mt-1 w-56 shadow-lg p-2">
                          <li>
                            <button
                              type="button"
                              class={
                                !sortFilterStore.dynamicRange ? "active" : ""
                              }
                              onClick$={() => {
                                setSelectFilter("dynamicRange", "");
                                openMenuSig.value = null;
                              }}
                            >
                              {langText(lang, "Any", "Любое")}
                            </button>
                          </li>
                          {dynamicRangeOptions.map((option) => (
                            <li key={option.value}>
                              <button
                                type="button"
                                class={
                                  sortFilterStore.dynamicRange === option.value
                                    ? "active"
                                    : ""
                                }
                                onClick$={() => {
                                  setSelectFilter(
                                    "dynamicRange",
                                    option.value,
                                  );
                                  openMenuSig.value = null;
                                }}
                              >
                                {option.label} ({option.count})
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {trackerOptions.length > 0 && (
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">
                    <span class="label-text text-xs font-medium">
                      {langText(lang, "Tracker", "Трекер")}
                    </span>
                  </legend>

                  <select
                    class="select select-bordered md:select-sm w-full text-base"
                    value={sortFilterStore.tracker}
                    onChange$={(_, element) => {
                      setSelectFilter("tracker", element.value);
                    }}
                  >
                    <option value="">{langText(lang, "Any", "Любой")}</option>
                    {trackerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {`${option.label} (${option.count})`}
                      </option>
                    ))}
                  </select>
                </fieldset>
              )}

              <input
                class="btn btn-ghost md:btn-sm min-h-11 rounded-full"
                type="reset"
                value={langText(lang, "Reset", "Сброс")}
                aria-label={resetFiltersLabel}
              />
            </div>

            {advancedFilterGroups.length > 0 && (
              <details class="collapse-arrow border-base-300 bg-base-100 collapse border">
                <summary class="collapse-title min-h-11 py-3 text-sm font-medium">
                  {langText(lang, "Advanced filters", "Расширенные фильтры")}
                </summary>
                <div class="collapse-content">
                  <div class="grid gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                    {advancedFilterGroups.map(
                      ({ key, label, options, value }) => (
                        <label class="form-control" key={key}>
                          <div class="label px-0 pt-0 pb-1">
                            <span class="label-text text-xs font-medium">
                              {label}
                            </span>
                          </div>
                          <select
                            class="select select-bordered md:select-sm min-h-11 w-full text-base"
                            value={value}
                            onChange$={(_, element) => {
                              setSelectFilter(key, element.value);
                            }}
                          >
                            <option value="">
                              {langText(lang, "Any", "Любой")}
                            </option>
                            {options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {`${option.label} (${option.count})`}
                              </option>
                            ))}
                          </select>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              </details>
            )}
          </form>
        )}

        <section class="my-4">
          {sortedTorrents.value === null && (
            <span class="loading loading-spinner loading-md" />
          )}
          {sortedTorrents.value !== null &&
            sortedTorrents.value.length === 0 && (
              <div>{langNotFound(lang)}</div>
            )}
          {sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
            <div class="flex flex-wrap items-center gap-2">
              <span>
                {langFound(lang)} {sortedTorrents.value.length}{" "}
                {langTorrentov(lang)}
              </span>
              {sourceStats.total > 0 && (
                <span class="badge badge-ghost">
                  {langText(lang, "JacRed", "JacRed")}: {sourceStats.total}
                  {sourceStats.loaded > 0 && ` / ${sourceStats.loaded}`}
                </span>
              )}
              {activeFilterChips.map((chip) => (
                <span
                  class="badge badge-primary badge-soft gap-1 pr-1"
                  key={`${chip.key}-${chip.value}`}
                >
                  {chip.label}
                  <button
                    type="button"
                    class="btn btn-ghost btn-circle min-h-8 w-8 p-0 text-xs"
                    aria-label={`${resetFiltersLabel}: ${chip.label}`}
                    onClick$={() => clearSelectFilter(chip.key)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        <section class="my-4">
          {sortedTorrents.value?.map((torrent) => (
            <TorrentBlock
              torrent={torrent}
              movie={movie}
              lang={lang}
              key={torrent.Magnet}
            />
          ))}
        </section>
      </>
    );
  },
);
