import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import {
  EmptyState,
  FilterChip,
  ErrorState,
  SectionHeading,
} from "~/components/page-feedback";
import { MediaType } from "~/services/models";
import {
  discoverTv,
  getOptionalTvCertificationList,
  getOptionalWatchProviderCatalog,
  getRegionFromLanguage,
} from "~/services/tmdb";
import {
  createTvDiscoverFilters,
  getDiscoverRegions,
  getProviderOptions,
  TV_DISCOVER_SORT_OPTIONS,
  type TvDiscoverFilters,
} from "~/utils/discover";
import { formatYear } from "~/utils/format";
import {
  langAllProviders,
  langApplyFilters,
  langCountLabel,
  langDiscoverTv,
  langFirstAirYear,
  langMinimumVotes,
  langRegion,
  langResetFilters,
  langResults,
  langSortBy,
  langStreamingProvider,
  langText,
  langSearchMatchesCount,
  langTvDiscoverSortLabel,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

type TvDiscoverPageData =
  | {
      filters: TvDiscoverFilters;
      lang: string;
      providerOptions: ReturnType<typeof getProviderOptions>;
      regionOptions: string[];
      results: Awaited<ReturnType<typeof discoverTv>>;
      status: "ready";
    }
  | {
      lang: string;
      status: "error";
    };

export const useTvDiscoverLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const defaultRegion = getRegionFromLanguage(lang);

  try {
    const [certifications, providerCatalog] = await Promise.all([
      getOptionalTvCertificationList(),
      getOptionalWatchProviderCatalog({ type: MediaType.Tv }),
    ]);

    const filters = createTvDiscoverFilters({
      certifications,
      defaultRegion,
      providerCatalog,
      searchParams: event.url.searchParams,
    });

    const results = await discoverTv({
      language: lang,
      minVotes: filters.minVotes,
      page: filters.page,
      providerId: filters.providerId,
      region: filters.region,
      sortBy: filters.sortBy,
      year: filters.year,
    });

    return {
      filters,
      lang,
      providerOptions: getProviderOptions(providerCatalog, filters.region),
      regionOptions: getDiscoverRegions(certifications, defaultRegion),
      results,
      status: "ready",
    } satisfies TvDiscoverPageData;
  } catch (error) {
    console.error(error);
    return {
      lang,
      status: "error",
    } satisfies TvDiscoverPageData;
  }
});

const buildTvDiscoverHref = (
  lang: string,
  filters: TvDiscoverFilters,
  overrides: Partial<TvDiscoverFilters> = {},
) => {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams({
    lang,
    minVotes: String(next.minVotes),
    region: next.region,
    sortBy: next.sortBy,
  });

  if (next.page > 1) {
    params.set("page", String(next.page));
  }
  if (next.providerId) {
    params.set("provider", String(next.providerId));
  }
  if (next.year) {
    params.set("year", String(next.year));
  }

  return `/tv/discover/?${params.toString()}`;
};

export default component$(() => {
  const value = useTvDiscoverLoader().value;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={langText(
          value.lang,
          "TV discover is unavailable",
          "Поиск сериалов недоступен",
        )}
        description={langText(
          value.lang,
          "Please refresh the page or try again later.",
          "Обновите страницу или попробуйте позже.",
        )}
        compact={true}
      />
    );
  }

  const sortLabel = langTvDiscoverSortLabel(value.lang, value.filters.sortBy);
  const selectedProvider = value.providerOptions.find(
    (option) => option.value === value.filters.providerId,
  );
  const activeFilters = [
    `${langRegion(value.lang)} ${value.filters.region}`,
    selectedProvider?.label ?? null,
    value.filters.year
      ? `${langFirstAirYear(value.lang)} ${value.filters.year}`
      : null,
    `${langMinimumVotes(value.lang)} ${value.filters.minVotes}+`,
    `${langSortBy(value.lang)} ${sortLabel}`,
  ].filter(Boolean) as string[];

  return (
    <div class="space-y-6">
      <SectionHeading
        eyebrow={langText(value.lang, "Discovery", "Подбор")}
        title={langDiscoverTv(value.lang)}
        description={langText(
          value.lang,
          `Filter TMDB TV results by region, provider, first-air year, vote floor, and sort order. Provider filtering and regional validation use ${value.filters.region} as the active market.`,
          `Фильтруйте результаты сериалов TMDB по региону, провайдеру, году первого выхода, минимальному числу голосов и сортировке. Фильтрация по провайдерам и региональная проверка используют регион ${value.filters.region} как активный рынок.`,
        )}
        badges={[
          langSearchMatchesCount(value.lang, value.results.total_results),
          langCountLabel(
            value.lang,
            value.results.total_pages,
            "page",
            "pages",
            "страница",
            "страницы",
            "страниц",
          ),
          `${value.filters.region} ${langText(value.lang, "region", "регион")}`,
        ]}
      />

      <section class="alert alert-info alert-soft section-reveal">
        <span class="text-sm leading-relaxed">
          {langText(
            value.lang,
            "TMDB trending surfaces what is spiking right now. Discover sorting leans on broader popularity and vote signals, which is better when you want reusable filters instead of the short-window trending feed.",
            "Trending TMDB показывает то, что растет прямо сейчас. Сортировка Discover опирается на более широкие сигналы популярности и голосов, поэтому лучше подходит для повторно используемых фильтров, чем краткосрочная лента трендов.",
          )}
        </span>
      </section>

      <section class="card rounded-box border-base-200 bg-base-100/90 border shadow-sm backdrop-blur">
        <div class="card-body gap-4">
          <form class="grid gap-4 lg:grid-cols-3" method="get">
            <input type="hidden" name="lang" value={value.lang} />
            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langRegion(value.lang)}
              </span>
              <select
                class="select select-bordered"
                name="region"
                value={value.filters.region}
              >
                {value.regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>

            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langStreamingProvider(value.lang)}
              </span>
              <select
                class="select select-bordered"
                name="provider"
                value={
                  value.filters.providerId
                    ? String(value.filters.providerId)
                    : ""
                }
              >
                <option value="">{langAllProviders(value.lang)}</option>
                {value.providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langFirstAirYear(value.lang)}
              </span>
              <input
                class="input input-bordered"
                max="2100"
                min="1888"
                name="year"
                type="number"
                value={value.filters.year ? String(value.filters.year) : ""}
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langMinimumVotes(value.lang)}
              </span>
              <input
                class="input input-bordered"
                min="0"
                name="minVotes"
                type="number"
                value={String(value.filters.minVotes)}
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langSortBy(value.lang)}
              </span>
              <select
                class="select select-bordered"
                name="sortBy"
                value={value.filters.sortBy}
              >
                {TV_DISCOVER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {langTvDiscoverSortLabel(value.lang, option.value)}
                  </option>
                ))}
              </select>
            </label>

            <div class="flex flex-wrap items-center gap-2 lg:col-span-3">
              <button type="submit" class="btn btn-primary">
                {langApplyFilters(value.lang)}
              </button>
              <a href={paths.tvDiscover(value.lang)} class="btn btn-ghost">
                {langResetFilters(value.lang)}
              </a>
              <a href={paths.tv(value.lang)} class="btn btn-outline">
                {langText(
                  value.lang,
                  "Browse TV shelves",
                  "Открыть полки сериалов",
                )}
              </a>
            </div>
          </form>
        </div>
      </section>

      <section class="card rounded-box border-base-200 bg-base-100/88 border shadow-sm backdrop-blur">
        <div class="card-body gap-3">
          <div class="flex flex-wrap items-center gap-2">
            {activeFilters.map((filterLabel) => (
              <FilterChip key={filterLabel} label={filterLabel} />
            ))}
          </div>
          <p class="text-base-content/62 text-sm leading-relaxed">
            {langText(
              value.lang,
              "Region choices come from TMDB’s certification coverage, which keeps the selected market aligned with provider and discover filters.",
              "Список регионов берется из покрытия сертификатов TMDB, что удерживает выбранный рынок согласованным с провайдерами и фильтрами поиска.",
            )}
          </p>
        </div>
      </section>

      {value.results.total_results > 0 ? (
        <>
          <MediaGrid
            description={langText(
              value.lang,
              "Use the form above to refine the TMDB series catalog without leaving the current route.",
              "Используйте форму выше, чтобы уточнить каталог сериалов TMDB, не покидая текущий маршрут.",
            )}
            eyebrow={langResults(value.lang)}
            headerBadge={langText(
              value.lang,
              `Page ${value.results.page} of ${value.results.total_pages}`,
              `Страница ${value.results.page} из ${value.results.total_pages}`,
            )}
            title={langText(
              value.lang,
              `Discover results (${value.results.total_results})`,
              `Результаты подбора (${value.results.total_results})`,
            )}
          >
            {value.results.results.map((tvShow) => (
              <a
                key={tvShow.id}
                href={paths.media(MediaType.Tv, tvShow.id, value.lang)}
                class="media-card-link block h-full"
              >
                <MediaCard
                  title={tvShow.name ?? ""}
                  width={300}
                  rating={tvShow.vote_average ?? 0}
                  year={formatYear(tvShow.first_air_date)}
                  picfile={tvShow.poster_path}
                  variant="poster"
                  layout="grid"
                />
              </a>
            ))}
          </MediaGrid>

          {value.results.total_pages > 1 && (
            <div class="flex flex-wrap items-center justify-between gap-3">
              <a
                href={buildTvDiscoverHref(value.lang, value.filters, {
                  page: Math.max(1, value.filters.page - 1),
                })}
                class={[
                  "btn btn-outline rounded-full",
                  value.filters.page <= 1 && "btn-disabled pointer-events-none",
                ]}
              >
                {langText(value.lang, "Previous page", "Предыдущая страница")}
              </a>
              <span class="text-base-content/60 text-sm">
                {langText(
                  value.lang,
                  `Page ${value.results.page} of ${value.results.total_pages}`,
                  `Страница ${value.results.page} из ${value.results.total_pages}`,
                )}
              </span>
              <a
                href={buildTvDiscoverHref(value.lang, value.filters, {
                  page: Math.min(
                    value.results.total_pages,
                    value.filters.page + 1,
                  ),
                })}
                class={[
                  "btn btn-outline rounded-full",
                  value.filters.page >= value.results.total_pages &&
                    "btn-disabled pointer-events-none",
                ]}
              >
                {langText(value.lang, "Next page", "Следующая страница")}
              </a>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={langText(
            value.lang,
            "No series match for these filters",
            "По этим фильтрам сериалы не найдены",
          )}
          description={langText(
            value.lang,
            "Try a broader provider, reset the year, or lower the vote threshold.",
            "Попробуйте более широкий выбор провайдера, сбросьте год или снизьте порог голосов.",
          )}
          compact={true}
        />
      )}
    </div>
  );
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `Moviestracker | ${langText(
      lang,
      "TV discovery",
      "Поиск сериалов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(
          lang,
          "TV discovery with TMDB filters",
          "Поиск сериалов с фильтрами TMDB",
        ),
      },
    ],
  };
};
