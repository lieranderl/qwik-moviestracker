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
import {
  langAllCertifications,
  langAllProviders,
  langApplyFilters,
  langCertification,
  langDiscoverMovies,
  langMinimumVotes,
  langRegion,
  langResetFilters,
  langSortBy,
  langStreamingProvider,
  langText,
  langReleaseYear,
  langMovieDiscoverSortLabel,
} from "~/utils/languages";
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
        title={langText(
          value.lang,
          "Movie discover is unavailable",
          "Поиск фильмов недоступен",
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

  const sortLabel = langMovieDiscoverSortLabel(value.lang, value.filters.sortBy);
  const selectedProvider = value.providerOptions.find(
    (option) => option.value === value.filters.providerId,
  );
  const activeFilters = [
    `${langRegion(value.lang)} ${value.filters.region}`,
    value.filters.certification
      ? `${langCertification(value.lang)} ${value.filters.certification}`
      : null,
    selectedProvider?.label ?? null,
    value.filters.year
      ? `${langReleaseYear(value.lang)} ${value.filters.year}`
      : null,
    `${langMinimumVotes(value.lang)} ${value.filters.minVotes}+`,
    `${langSortBy(value.lang)} ${sortLabel}`,
  ].filter(Boolean) as string[];

  return (
    <div class="space-y-6">
      <SectionHeading title={langDiscoverMovies(value.lang)} />

      <section class="card border-base-200 bg-base-100 border shadow-sm">
        <div class="card-body gap-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <h2 class="text-base font-semibold">
                {langText(value.lang, "Filters", "Фильтры")}
              </h2>
            </div>
            <div class="badge badge-outline min-h-8 shrink-0 px-3">
              {langText(
                value.lang,
                `${value.results.total_results} matches`,
                `${value.results.total_results} совпадений`,
              )}
            </div>
          </div>

          <form class="space-y-5" method="get">
            <input type="hidden" name="lang" value={value.lang} />

            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {langRegion(value.lang)}
                </span>
                <select
                  class="select select-bordered h-11 min-h-11 w-full text-base"
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
                  {langCertification(value.lang)}
                </span>
                <select
                  class="select select-bordered h-11 min-h-11 w-full text-base"
                  name="certification"
                  value={value.filters.certification ?? ""}
                >
                  <option value="">{langAllCertifications(value.lang)}</option>
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
                  {langStreamingProvider(value.lang)}
                </span>
                <select
                  class="select select-bordered h-11 min-h-11 w-full text-base"
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

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {langReleaseYear(value.lang)}
                </span>
                <input
                  class="input input-bordered h-11 min-h-11 w-full text-base"
                  max="2100"
                  min="1888"
                  name="year"
                  type="number"
                  value={value.filters.year ? String(value.filters.year) : ""}
                />
              </label>

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {langMinimumVotes(value.lang)}
                </span>
                <input
                  class="input input-bordered h-11 min-h-11 w-full text-base"
                  min="0"
                  name="minVotes"
                  type="number"
                  value={String(value.filters.minVotes)}
                />
              </label>

              <label class="form-control w-full gap-2">
                <span class="label-text text-sm font-medium">
                  {langSortBy(value.lang)}
                </span>
                <select
                  class="select select-bordered h-11 min-h-11 w-full text-base"
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
              <div class="bg-base-200/45 rounded-box space-y-3 p-3">
                <p class="text-base-content/60 text-xs font-semibold tracking-[0.08em] uppercase">
                  {langText(value.lang, "Ratings", "Рейтинги")}
                </p>
                <div class="flex flex-wrap gap-2">
                  <a
                    href={buildMovieDiscoverHref(value.lang, value.filters, {
                      certification: undefined,
                      page: 1,
                    })}
                    class={[
                      "btn min-h-11 min-w-11 rounded-full md:btn-sm",
                      value.filters.certification
                        ? "btn-ghost"
                        : "btn-primary btn-soft",
                    ]}
                  >
                    {langAllCertifications(value.lang)}
                  </a>
                  {value.certificationOptions.map((option) => (
                    <a
                      key={option.value}
                      href={buildMovieDiscoverHref(value.lang, value.filters, {
                        certification: option.value,
                        page: 1,
                      })}
                      class={[
                        "btn min-h-11 min-w-11 rounded-full md:btn-sm",
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
                  class="btn btn-primary h-11 min-h-11 w-full sm:w-auto"
                >
                  {langApplyFilters(value.lang)}
                </button>
                <a
                  href={paths.movieDiscover(value.lang)}
                  class="btn btn-ghost h-11 min-h-11 w-full sm:w-auto"
                >
                  {langResetFilters(value.lang)}
                </a>
                <a
                  href={paths.movie(value.lang)}
                  class="btn btn-outline h-11 min-h-11 w-full sm:w-auto"
                >
                  {langText(value.lang, "Movies", "Фильмы")}
                </a>
              </div>
            </div>
          </form>
        </div>
      </section>

      {value.results.total_results > 0 ? (
        <>
          <MediaGrid
            headerBadge={langText(
              value.lang,
              `Page ${value.results.page} of ${value.results.total_pages}`,
              `Страница ${value.results.page} из ${value.results.total_pages}`,
            )}
            title={langText(
              value.lang,
              `Movies (${value.results.total_results})`,
              `Фильмы (${value.results.total_results})`,
            )}
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
                <span
                  aria-disabled="true"
                  class="btn btn-outline btn-disabled"
                >
                  {langText(value.lang, "Previous page", "Предыдущая страница")}
                </span>
              ) : (
                <a
                  href={buildMovieDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page - 1,
                  })}
                  class="btn btn-outline h-11 min-h-11"
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
                  class="btn btn-outline btn-disabled"
                >
                  {langText(value.lang, "Next page", "Следующая страница")}
                </span>
              ) : (
                <a
                  href={buildMovieDiscoverHref(value.lang, value.filters, {
                    page: value.filters.page + 1,
                  })}
                  class="btn btn-outline h-11 min-h-11"
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
            "No movie matches for these filters",
            "По этим фильтрам фильмы не найдены",
          )}
          description={langText(
            value.lang,
            "Try a broader provider, remove the certification, or lower the vote threshold.",
            "Попробуйте более широкий выбор провайдера, уберите сертификат или снизьте порог голосов.",
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
      "Movie discovery",
      "Поиск фильмов",
    )}`,
    meta: [
      {
        name: "description",
        content: langText(
          lang,
          "Movie discovery with TMDB filters",
          "Поиск фильмов с фильтрами TMDB",
        ),
      },
    ],
  };
};
