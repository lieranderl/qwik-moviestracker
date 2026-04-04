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
  langCountLabel,
  langDiscoverMovies,
  langMinimumVotes,
  langRegion,
  langResetFilters,
  langResults,
  langSortBy,
  langStreamingProvider,
  langText,
  langReleaseYear,
  langSearchMatchesCount,
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
      <SectionHeading
        eyebrow={langText(value.lang, "Discovery", "Подбор")}
        title={langDiscoverMovies(value.lang)}
        description={langText(
          value.lang,
          `Filter TMDB movie results by region, certification, provider, release year, vote floor, and sort order. Release-driven results use ${value.filters.region} as the active regional context.`,
          `Фильтруйте результаты фильмов TMDB по региону, сертификату, провайдеру, году релиза, минимальному числу голосов и сортировке. Релизные результаты используют регион ${value.filters.region} как активный контекст.`,
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
            "TMDB trending highlights short daily or weekly movement. Discover sorting uses the longer-lived popularity and vote signals, which makes this page better for stable browsing and precise filtering.",
            "Trending TMDB показывает краткосрочное дневное и недельное движение. Сортировка Discover использует более устойчивые сигналы популярности и голосов, поэтому эта страница лучше подходит для стабильного просмотра и точной фильтрации.",
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
                {langCertification(value.lang)}
              </span>
              <select
                class="select select-bordered"
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
                {langReleaseYear(value.lang)}
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
                {MOVIE_DISCOVER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {langMovieDiscoverSortLabel(value.lang, option.value)}
                  </option>
                ))}
              </select>
            </label>

            <div class="flex flex-wrap items-center gap-2 lg:col-span-3">
              <button type="submit" class="btn btn-primary">
                {langApplyFilters(value.lang)}
              </button>
              <a href={paths.movieDiscover(value.lang)} class="btn btn-ghost">
                {langResetFilters(value.lang)}
              </a>
              <a href={paths.movie(value.lang)} class="btn btn-outline">
                {langText(
                  value.lang,
                  "Browse movie shelves",
                  "Открыть полки фильмов",
                )}
              </a>
            </div>
          </form>

          {value.certificationOptions.length > 0 && (
            <div class="space-y-2">
              <p class="text-base-content/60 text-xs font-semibold tracking-[0.08em] uppercase">
                {langText(
                  value.lang,
                  "TMDB certification chips",
                  "Метки сертификатов TMDB",
                )}
              </p>
              <div class="flex flex-wrap gap-2">
                <a
                  href={buildMovieDiscoverHref(value.lang, value.filters, {
                    certification: undefined,
                    page: 1,
                  })}
                  class={[
                    "btn btn-sm rounded-full normal-case shadow-none",
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
                      "btn btn-sm rounded-full normal-case shadow-none",
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
              "Certification and region validation come from TMDB reference lists, so only supported values for the current region are submitted.",
              "Проверка сертификатов и регионов опирается на справочники TMDB, поэтому отправляются только поддерживаемые значения для текущего региона.",
            )}
          </p>
        </div>
      </section>

      {value.results.total_results > 0 ? (
        <>
          <MediaGrid
            description={langText(
              value.lang,
              "Use the form above to refine the TMDB catalog without leaving the current route.",
              "Используйте форму выше, чтобы уточнить каталог TMDB, не покидая текущий маршрут.",
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
              <a
                href={buildMovieDiscoverHref(value.lang, value.filters, {
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
                href={buildMovieDiscoverHref(value.lang, value.filters, {
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
