import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import {
  EmptyState,
  ErrorState,
  FilterChip,
  SectionHeading,
} from "~/components/page-feedback";
import { MediaType } from "~/services/models";
import {
  discoverMovies,
  getOptionalMovieCertificationList,
  getOptionalWatchProviderCatalog,
  getRegionFromLanguage,
} from "~/services/tmdb";
import {
  createMovieDiscoverFilters,
  getCertificationOptions,
  getDiscoverRegions,
  getProviderOptions,
  MOVIE_DISCOVER_SORT_OPTIONS,
  type MovieDiscoverFilters,
} from "~/utils/discover";
import { formatYear } from "~/utils/format";
import { langMovieDiscoverSortLabel } from "~/utils/languages";
import { paths } from "~/utils/paths";

type MovieDiscoverPageData =
  | {
      status: "ready";
      certificationOptions: ReturnType<typeof getCertificationOptions>;
      filters: MovieDiscoverFilters;
      lang: string;
      providerOptions: ReturnType<typeof getProviderOptions>;
      regionOptions: string[];
      results: Awaited<ReturnType<typeof discoverMovies>>;
    }
  | {
      lang: string;
      status: "error";
    };

export const useMovieDiscoverLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  const defaultRegion = getRegionFromLanguage(lang);

  try {
    const [certifications, providerCatalog] = await Promise.all([
      getOptionalMovieCertificationList(),
      getOptionalWatchProviderCatalog({ type: MediaType.Movie }),
    ]);

    const filters = createMovieDiscoverFilters({
      certifications,
      defaultRegion,
      providerCatalog,
      searchParams: event.url.searchParams,
    });

    const [results] = await Promise.all([
      discoverMovies({
        certification: filters.certification,
        language: lang,
        minVotes: filters.minVotes,
        page: filters.page,
        providerId: filters.providerId,
        region: filters.region,
        sortBy: filters.sortBy,
        year: filters.year,
      }),
    ]);

    return {
      certificationOptions: getCertificationOptions(
        certifications,
        filters.region,
      ),
      filters,
      lang,
      providerOptions: getProviderOptions(providerCatalog, filters.region),
      regionOptions: getDiscoverRegions(certifications, defaultRegion),
      results,
      status: "ready",
    } satisfies MovieDiscoverPageData;
  } catch (error) {
    console.error(error);
    return {
      lang,
      status: "error",
    } satisfies MovieDiscoverPageData;
  }
});

const buildMovieDiscoverHref = (
  lang: string,
  filters: MovieDiscoverFilters,
  overrides: Partial<MovieDiscoverFilters> = {},
) => {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams({
    lang,
    minVotes: String(next.minVotes),
    region: next.region,
    sortBy: next.sortBy,
  });

  if (next.certification) {
    params.set("certification", next.certification);
  }
  if (next.page > 1) {
    params.set("page", String(next.page));
  }
  if (next.providerId) {
    params.set("provider", String(next.providerId));
  }
  if (next.year) {
    params.set("year", String(next.year));
  }

  return `/movie/discover/?${params.toString()}`;
};

export default component$(() => {
  const value = useMovieDiscoverLoader().value;

  if (value.status !== "ready") {
    return (
      <ErrorState
        title={message(value.lang, "ui.movieDiscoverIsUnavailable")}
        description={message(
          value.lang,
          "ui.pleaseRefreshThePageOrTryAgainLater",
        )}
        compact={true}
      />
    );
  }

  const sortLabel = langMovieDiscoverSortLabel(
    value.lang,
    value.filters.sortBy,
  );
  const selectedProvider = value.providerOptions.find(
    (option) => option.value === value.filters.providerId,
  );
  const activeFilters = [
    `${message(value.lang, "langRegion")} ${value.filters.region}`,
    value.filters.certification
      ? `${message(value.lang, "langCertification")} ${value.filters.certification}`
      : null,
    selectedProvider?.label ?? null,
    value.filters.year
      ? `${message(value.lang, "langReleaseYear")} ${value.filters.year}`
      : null,
    `${message(value.lang, "langMinimumVotes")} ${value.filters.minVotes}+`,
    `${message(value.lang, "langSortBy")} ${sortLabel}`,
  ].filter(Boolean) as string[];

  return (
    <div class="space-y-8">
      <SectionHeading title={message(value.lang, "langDiscoverMovies")} />

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
                  {message(value.lang, "langCertification")}
                </span>
                <select
                  class="select select-bordered w-full text-base"
                  name="certification"
                  value={value.filters.certification ?? ""}
                >
                  <option value="">
                    {message(value.lang, "langAllCertifications")}
                  </option>
                  {value.certificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.meaning
                        ? `${option.label} · ${option.meaning}`
                        : option.label}
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
                  {message(value.lang, "langReleaseYear")}
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
                  {MOVIE_DISCOVER_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {langMovieDiscoverSortLabel(value.lang, option.value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {value.certificationOptions.length > 0 && (
              <div class="bg-base-200/40 rounded-box space-y-3 p-3">
                <p class="text-base-content/60 text-xs font-semibold tracking-[0.08em] uppercase">
                  {message(value.lang, "ui.ratings")}
                </p>
                <div class="flex flex-wrap gap-2">
                  <a
                    href={buildMovieDiscoverHref(value.lang, value.filters, {
                      certification: undefined,
                      page: 1,
                    })}
                    class={[
                      "btn btn-sm rounded-full",
                      value.filters.certification
                        ? "btn-ghost"
                        : "btn-primary btn-soft",
                    ]}
                  >
                    {message(value.lang, "langAllCertifications")}
                  </a>
                  {value.certificationOptions.map((option) => (
                    <a
                      key={option.value}
                      href={buildMovieDiscoverHref(value.lang, value.filters, {
                        certification: option.value,
                        page: 1,
                      })}
                      class={[
                        "btn btn-sm rounded-full",
                        value.filters.certification === option.value
                          ? "btn-primary btn-soft"
                          : "btn-ghost",
                      ]}
                      title={option.meaning}
                    >
                      {option.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                  href={paths.movieDiscover(value.lang)}
                  class="btn btn-ghost btn-sm w-full sm:w-auto"
                >
                  {message(value.lang, "langResetFilters")}
                </a>
                <a
                  href={paths.movie(value.lang)}
                  class="btn btn-outline btn-sm w-full sm:w-auto"
                >
                  {message(value.lang, "ui.movies")}
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
            title={message(value.lang, "media.moviesCount", {
              count: value.results.total_results,
            })}
          >
            {value.results.results.map((movie) => (
              <a
                key={movie.id}
                href={paths.media(MediaType.Movie, movie.id, value.lang)}
                class="media-card-link block h-full"
              >
                <MediaCard
                  title={movie.title ?? ""}
                  width={300}
                  rating={movie.vote_average ?? 0}
                  year={formatYear(movie.release_date)}
                  picfile={movie.poster_path}
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
                  href={buildMovieDiscoverHref(value.lang, value.filters, {
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
                  href={buildMovieDiscoverHref(value.lang, value.filters, {
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
          title={message(value.lang, "ui.noMovieMatchesForTheseFilters")}
          description={message(
            value.lang,
            "ui.tryABroaderProviderRemoveTheCertificationOrLowerTheVoteThreshold",
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
    title: `Moviestracker | ${message(lang, "ui.movieDiscovery")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "ui.movieDiscoveryWithTmdbFilters"),
      },
    ],
  };
};
