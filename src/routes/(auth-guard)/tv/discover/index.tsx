import { message } from "~/utils/i18n";
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
import { langTvDiscoverSortLabel } from "~/utils/languages";
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
        title={message(value.lang, "ui.tvDiscoverIsUnavailable")}
        description={message(
          value.lang,
          "ui.pleaseRefreshThePageOrTryAgainLater",
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
    `${message(value.lang, "langRegion")} ${value.filters.region}`,
    selectedProvider?.label ?? null,
    value.filters.year
      ? `${message(value.lang, "langFirstAirYear")} ${value.filters.year}`
      : null,
    `${message(value.lang, "langMinimumVotes")} ${value.filters.minVotes}+`,
    `${message(value.lang, "langSortBy")} ${sortLabel}`,
  ].filter(Boolean) as string[];

  return (
    <div class="space-y-8">
      <SectionHeading title={message(value.lang, "langDiscoverTv")} />

      <section class="card border-base-200 bg-base-100 border shadow-sm">
        <div class="card-body gap-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h2 class="text-base font-semibold">
                {message(value.lang, "ui.filters")}
              </h2>
            </div>
            <div class="badge badge-outline shrink-0">
              {message(value.lang, "search.matches", {
                count: value.results.total_results,
              })}
            </div>
          </div>

          <form class="space-y-5" method="get">
            <input type="hidden" name="lang" value={value.lang} />

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {message(value.lang, "langRegion")}
                </span>
                <select
                  class="select select-bordered w-full text-base"
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

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {message(value.lang, "langStreamingProvider")}
                </span>
                <select
                  class="select select-bordered w-full text-base"
                  name="provider"
                  value={
                    value.filters.providerId
                      ? String(value.filters.providerId)
                      : ""
                  }
                >
                  <option value="">
                    {message(value.lang, "langAllProviders")}
                  </option>
                  {value.providerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {message(value.lang, "langFirstAirYear")}
                </span>
                <input
                  class="input input-bordered w-full text-base"
                  max="2100"
                  min="1888"
                  name="year"
                  type="number"
                  value={value.filters.year ? String(value.filters.year) : ""}
                />
              </label>

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {message(value.lang, "langMinimumVotes")}
                </span>
                <input
                  class="input input-bordered w-full text-base"
                  min="0"
                  name="minVotes"
                  type="number"
                  value={String(value.filters.minVotes)}
                />
              </label>

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {message(value.lang, "langSortBy")}
                </span>
                <select
                  class="select select-bordered w-full text-base"
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
            </div>

            <div class="border-base-200 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap items-center gap-2">
                {activeFilters.map((filterLabel) => (
                  <FilterChip key={filterLabel} label={filterLabel} />
                ))}
              </div>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                <button
                  type="submit"
                  class="btn btn-primary btn-sm w-full sm:w-auto"
                >
                  {message(value.lang, "langApplyFilters")}
                </button>
                <a
                  href={paths.tvDiscover(value.lang)}
                  class="btn btn-ghost btn-sm w-full sm:w-auto"
                >
                  {message(value.lang, "langResetFilters")}
                </a>
                <a
                  href={paths.tv(value.lang)}
                  class="btn btn-outline btn-sm w-full sm:w-auto"
                >
                  {message(value.lang, "ui.series2")}
                </a>
              </div>
            </div>
          </form>
        </div>
      </section>

      {value.results.total_results > 0 ? (
        <>
          <MediaGrid
            headerBadge={message(value.lang, "pagination.pageOf", {
              page: value.results.page,
              total: value.results.total_pages,
            })}
            title={message(value.lang, "media.seriesCount", {
              count: value.results.total_results,
            })}
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
                <span aria-disabled="true" class="btn btn-outline btn-disabled">
                  {message(value.lang, "ui.previousPage")}
                </span>
              ) : (
                <a
                  href={buildTvDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page - 1,
                  })}
                  class="btn btn-outline"
                >
                  {message(value.lang, "ui.previousPage")}
                </a>
              )}
              <span class="text-base-content/60 text-sm">
                {message(value.lang, "pagination.pageOf", {
                  page: value.results.page,
                  total: value.results.total_pages,
                })}
              </span>
              {value.filters.page >= value.results.total_pages ? (
                <span aria-disabled="true" class="btn btn-outline btn-disabled">
                  {message(value.lang, "ui.nextPage")}
                </span>
              ) : (
                <a
                  href={buildTvDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page + 1,
                  })}
                  class="btn btn-outline"
                >
                  {message(value.lang, "ui.nextPage")}
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={message(value.lang, "ui.noSeriesMatchForTheseFilters")}
          description={message(
            value.lang,
            "ui.tryABroaderProviderResetTheYearOrLowerTheVoteThreshold",
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
    title: `Moviestracker | ${message(lang, "ui.tvDiscovery")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "ui.tvDiscoveryWithTmdbFilters"),
      },
    ],
  };
};
