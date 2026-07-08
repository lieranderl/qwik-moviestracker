import { component$, type Signal, useId } from "@builder.io/qwik";
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
  ({ lang, querySig, sortKeySig, statusFilterSig }: TorrServerFiltersProps) => {
    const headingId = useId();
    const statusGroupId = useId();

    return (
      <section
        aria-labelledby={headingId}
        class="card border-base-200 bg-base-100 border shadow-sm"
      >
        <div class="card-body gap-5 p-4 md:gap-6 md:p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-1">
              <h2 id={headingId} class="card-title md:text-2xl">
                {langText(lang, "Filters", "Фильтры")}
              </h2>
              <p class="text-base-content/65 text-sm leading-relaxed">
                {langText(
                  lang,
                  "Find torrents by title, hash, or status.",
                  "Ищите торренты по названию, hash или статусу.",
                )}
              </p>
            </div>

            <div class="grid w-full min-w-0 gap-3 md:grid-cols-[minmax(0,20rem)_minmax(0,14rem)] lg:w-auto">
              <label class="form-control gap-2">
                <span class="label px-0 py-0">
                  <span class="label-text font-medium">
                    {langText(lang, "Search", "Поиск")}
                  </span>
                </span>
                <span class="input input-bordered flex min-h-11 min-w-0 items-center">
                  <input
                    type="text"
                    value={querySig.value}
                    placeholder={langText(
                      lang,
                      "Title, hash, category",
                      "Название, hash, категория",
                    )}
                    aria-label={langText(
                      lang,
                      "Search TorrServer library",
                      "Поиск по библиотеке TorrServer",
                    )}
                    class="min-w-0 grow"
                    onInput$={(_, element) => {
                      querySig.value = element.value;
                    }}
                  />
                </span>
              </label>

              <label class="form-control gap-2">
                <span class="label px-0 py-0">
                  <span class="label-text font-medium">
                    {langText(lang, "Sort", "Сортировка")}
                  </span>
                </span>
                <select
                  value={sortKeySig.value}
                  aria-label={langText(
                    lang,
                    "Sort TorrServer torrents",
                    "Сортировать торренты TorrServer",
                  )}
                  class="select select-bordered min-h-11"
                  onChange$={(_, element) => {
                    sortKeySig.value = element.value as TorrServerSortKey;
                  }}
                >
                  {SORT_OPTIONS.map((sortKey) => (
                    <option value={sortKey} key={sortKey}>
                      {getSortLabel(sortKey, lang)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div
            role="group"
            aria-labelledby={statusGroupId}
            class="flex flex-col gap-2"
          >
            <p id={statusGroupId} class="text-sm font-medium">
              {langText(lang, "Status", "Статус")}
            </p>
            <div class="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  aria-pressed={statusFilterSig.value === filter}
                  class={`btn min-h-11 flex-1 rounded-full sm:flex-none ${
                    statusFilterSig.value === filter
                      ? "btn-primary"
                      : "btn-ghost"
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
        </div>
      </section>
    );
  },
);
