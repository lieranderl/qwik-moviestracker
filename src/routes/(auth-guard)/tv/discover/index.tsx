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
          `TMDB series filtered for region ${value.filters.region}.`,
          `Сериалы TMDB с фильтрами для региона ${value.filters.region}.`,
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

      <section class="card rounded-box border-base-200 bg-base-100/90 border shadow-sm backdrop-blur">
        <div class="card-body gap-4">
          <form class="grid gap-4 lg:grid-cols-3" method="get">
            <input type="hidden" name="lang" value={value.lang} />
            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">
                {langRegion(value.lang)}
              </span>
              <select
                class="select select-bordered h-11 min-h-11 text-base"
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
                class="select select-bordered h-11 min-h-11 text-base"
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
                class="input input-bordered h-11 min-h-11 text-base"
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
                class="input input-bordered h-11 min-h-11 text-base"
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
                class="select select-bordered h-11 min-h-11 text-base"
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
              <button type="submit" class="btn btn-primary h-11 min-h-11">
                {langApplyFilters(value.lang)}
              </button>
              <a href={paths.tvDiscover(value.lang)} class="btn btn-ghost h-11 min-h-11">
                {langResetFilters(value.lang)}
              </a>
              <a href={paths.tv(value.lang)} class="btn btn-outline h-11 min-h-11">
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
        </div>
      </section>

      {value.results.total_results > 0 ? (
        <>
          <MediaGrid
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
              {value.filters.page <= 1 ? (
                <span
                  aria-disabled="true"
                  class="btn btn-outline btn-disabled rounded-full"
                >
                  {langText(value.lang, "Previous page", "Предыдущая страница")}
                </span>
              ) : (
                <a
                  href={buildTvDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page - 1,
                  })}
                  class="btn btn-outline h-11 min-h-11 rounded-full"
                >
                  {langText(value.lang, "Previous page", "Предыдущая страница")}
                </a>
              )}
              <span class="text-base-content/60 text-sm">
                {langText(
                  value.lang,
                  `Page ${value.results.page} of ${value.results.total_pages}`,
                  `Страница ${value.results.page} из ${value.results.total_pages}`,
                )}
              </span>
              {value.filters.page >= value.results.total_pages ? (
                <span
                  aria-disabled="true"
                  class="btn btn-outline btn-disabled rounded-full"
                >
                  {langText(value.lang, "Next page", "Следующая страница")}
                </span>
              ) : (
                <a
                  href={buildTvDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page + 1,
                  })}
                  class="btn btn-outline h-11 min-h-11 rounded-full"
                >
                  {langText(value.lang, "Next page", "Следующая страница")}
                </a>
              )}
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
