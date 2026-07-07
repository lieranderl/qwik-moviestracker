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
    <section class="card border-base-200 bg-base-100 border shadow-sm">
      <div class="card-body gap-5 p-4 md:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 class="card-title">{langText(lang, "Filters", "Фильтры")}</h2>

          <div class="grid w-full min-w-0 gap-3 md:grid-cols-[minmax(0,18rem)_minmax(0,12rem)] lg:w-auto">
            <label class="input input-bordered flex min-w-0 items-center gap-2">
              <span class="text-base-content/60 shrink-0 text-xs font-medium tracking-[0.12em] uppercase">
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
                class="min-w-0 grow"
                onInput$={(_, element) => {
                  querySig.value = element.value;
                }}
              />
            </label>

            <select
              value={sortKeySig.value}
              aria-label={langText(
                lang,
                "Sort TorrServer torrents",
                "Сортировать торренты TorrServer",
              )}
              class="select select-bordered"
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

        <div class="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter}
              class={`btn btn-sm flex-1 sm:flex-none ${
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
      </div>
    </section>
  ),
);
