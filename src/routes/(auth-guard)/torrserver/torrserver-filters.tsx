import { component$, type Signal } from "@builder.io/qwik";
import { langText } from "~/utils/languages";
import {
  SORT_OPTIONS,
  STATUS_FILTERS,
  type TorrServerSortKey,
  type TorrServerStatusFilter,
} from "./torrserver-state";

const getStatusFilterLabel = (
  filter: TorrServerStatusFilter,
  lang: string,
): string => {
  switch (filter) {
    case "active":
      return langText(lang, "Active", "Активные");
    case "database":
      return langText(lang, "In database", "В базе");
    case "other":
      return langText(lang, "Other", "Другое");
    default:
      return langText(lang, "All", "Все");
  }
};

const getSortLabel = (sortKey: TorrServerSortKey, lang: string): string => {
  switch (sortKey) {
    case "peers":
      return langText(lang, "Peers", "Пиры");
    case "preload":
      return langText(lang, "Preload", "Предзагрузка");
    case "title":
      return langText(lang, "Title", "Название");
    default:
      return langText(lang, "Recent", "Недавние");
  }
};

export interface TorrServerFiltersProps {
  lang: string;
  querySig: Signal<string>;
  sortKeySig: Signal<TorrServerSortKey>;
  statusFilterSig: Signal<TorrServerStatusFilter>;
}

export const TorrServerFilters = component$(
  ({ lang, querySig, sortKeySig, statusFilterSig }: TorrServerFiltersProps) => (
    <section class="rounded-box border-base-200 bg-base-100/88 mt-6 border p-4 shadow-sm backdrop-blur">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-2">
          <p class="text-base-content/55 text-xs font-semibold tracking-[0.12em] uppercase">
            {langText(lang, "Library controls", "Управление библиотекой")}
          </p>
          <h2 class="text-xl font-semibold">
            {langText(lang, "Filter and focus", "Фильтры и фокус")}
          </h2>
          <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed">
            {langText(
              lang,
              "Search by title, hash, or category, then switch between operational views like active torrents, stored items, and everything else.",
              "Ищите по названию, hash или категории, затем переключайтесь между рабочими представлениями: активные торренты, элементы в базе и все остальное.",
            )}
          </p>
        </div>

        <div class="grid min-w-0 gap-3 md:grid-cols-[minmax(0,18rem)_minmax(0,12rem)]">
          <label class="input input-bordered flex min-w-0 items-center gap-2 text-base">
            <span class="text-base-content/60 text-xs font-medium tracking-[0.12em] uppercase">
              {langText(lang, "Search", "Поиск")}
            </span>
            <input
              type="text"
              value={querySig.value}
              placeholder={langText(
                lang,
                "Search title, hash, category",
                "Поиск по названию, hash, категории",
              )}
              class="h-11 min-w-0 grow"
              onInput$={(_, element) => {
                querySig.value = element.value;
              }}
            />
          </label>

          <select
            value={sortKeySig.value}
            aria-label={langText(lang, "Sort TorrServer torrents", "Сортировать торренты TorrServer")}
            class="select select-bordered h-11 min-h-11 text-base"
            onChange$={(_, element) => {
              sortKeySig.value = element.value as TorrServerSortKey;
            }}
          >
            {SORT_OPTIONS.map((sortKey) => (
              <option value={sortKey} key={sortKey}>{`${langText(
                lang,
                "Sort: ",
                "Сортировка: ",
              )}${getSortLabel(sortKey, lang)}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            type="button"
            key={filter}
            class={`btn min-h-11 rounded-full normal-case md:btn-sm ${
              statusFilterSig.value === filter ? "btn-primary" : "btn-ghost"
            }`}
            onClick$={() => {
              statusFilterSig.value = filter;
            }}
          >
            {getStatusFilterLabel(filter, lang)}
          </button>
        ))}
      </div>
    </section>
  ),
);
