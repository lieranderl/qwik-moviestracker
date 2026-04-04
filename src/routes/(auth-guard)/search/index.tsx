import {
  component$,
  Resource,
  useResource$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { server$, useLocation } from "@builder.io/qwik-city";
import { HiMagnifyingGlassOutline } from "@qwikest/icons/heroicons";
import { SearchAssist } from "~/components/discovery/search-assist";
import {
  EmptyState,
  ErrorState,
  FilterChip,
  InlineFilterGroup,
  LoadingState,
  SectionHeading,
} from "~/components/page-feedback";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { search } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import {
  pushRecentSearchQuery,
  readRecentSearches,
  type RecentSearch,
} from "~/utils/recent-activity";
import {
  langDiscovery,
  langFetchingMatchingTitlesAndPeople,
  langJumpBackIntoDiscoveryWhenYouWantBroaderBrowsing,
  langLoadingSearchResults,
  langMovies,
  langNoResults,
  langPeople,
  langRecentSearches,
  langResults,
  langResultsCombineMoviesTvSeriesAndPeopleInOneGrid,
  langResultsUpdateWhenYouSubmit,
  langSearch,
  langSearchAssist,
  langSearchBecomesAvailableAfterCharacters,
  langSearchMatchesCount,
  langSearchResults,
  langSearchForATitleOnceAndItWillShowUpHere,
  langSearchStartsAfterCharacters,
  langSearchTitlesCastCrew,
  langSearchesMoviesTvAndPeople,
  langSearchMoviesSeriesPeople,
  langSearchUnavailableRightNow,
  langStartWithATitleActorOrDirector,
  langSubmitAtLeastCharactersToLoadResults,
  langTryABroaderTitleAPersonNameOrDifferentSpelling,
  langSeries,
} from "~/utils/languages";
import {
  MIN_SEARCH_QUERY_LENGTH,
  runSearchQuery,
  type SearchRequest,
} from "./search.logic";
import {
  createSearchAssistLinks,
  createSearchFormViewModel,
  normalizeSearchResults,
} from "./search.view-model";

const runSearch = server$(async (request: SearchRequest) => {
  return search({
    language: request.language,
    page: request.page,
    query: request.query,
  });
});

export default component$(() => {
  const resource = useQueryParamsLoader();
  const loc = useLocation();
  const formModel = createSearchFormViewModel(
    loc.url.searchParams.get("q") ?? "",
    resource.value.lang,
  );
  const recentSearches = useSignal<RecentSearch[]>([]);
  const assistLinks = createSearchAssistLinks(resource.value.lang);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!formModel.searchPhrase) {
      recentSearches.value = readRecentSearches();
      return;
    }

    recentSearches.value = pushRecentSearchQuery({
      lang: resource.value.lang,
      query: formModel.searchPhrase,
    });
  });

  const searchResource = useResource$(async () => {
    if (!formModel.searchPhrase) {
      return null;
    }

    try {
      return runSearchQuery({
        execute: runSearch,
        language: resource.value.lang,
        query: formModel.searchPhrase,
      });
    } catch (error) {
      console.error(error);
      throw new Error(langSearchUnavailableRightNow(resource.value.lang));
    }
  });

  return (
    <div class="mx-auto w-full max-w-7xl pb-8">
      <SectionHeading
        eyebrow={langDiscovery(resource.value.lang)}
        title={langSearch(resource.value.lang)}
        description={langSearchMoviesSeriesPeople(resource.value.lang)}
        badges={[
          langMovies(resource.value.lang),
          langSeries(resource.value.lang),
          langPeople(resource.value.lang),
        ]}
      />

      <section class="card border-base-200 bg-base-100/90 mb-6 border shadow-sm backdrop-blur">
        <div class="card-body gap-4">
          <form
            class="flex flex-col gap-3 md:flex-row md:items-end"
            method="get"
          >
            <input type="hidden" name="lang" value={resource.value.lang} />
            <label class="form-control flex-1 gap-2" for="search-query">
              <span class="label-text text-sm font-medium">
                {langSearchMoviesSeriesPeople(resource.value.lang)}
              </span>
              <input
                id="search-query"
                name="q"
                type="search"
                inputMode="search"
                autoComplete="off"
                spellcheck={false}
                aria-describedby="search-query-help"
                aria-invalid={Boolean(formModel.shortQueryMessage)}
                placeholder={langSearchTitlesCastCrew(resource.value.lang)}
                class="input input-bordered focus-ringable w-full"
                value={formModel.query}
              />
            </label>

            <button type="submit" class="btn btn-primary gap-2 md:min-w-40">
              <HiMagnifyingGlassOutline aria-hidden="true" class="h-5 w-5" />
              {langSearch(resource.value.lang)}
            </button>
          </form>

          <p id="search-query-help" class="text-base-content/65 text-sm">
            {langSearchStartsAfterCharacters(
              resource.value.lang,
              MIN_SEARCH_QUERY_LENGTH,
            )}
          </p>

          {formModel.shortQueryMessage && (
            <div
              class="alert alert-warning alert-soft text-sm"
              role="status"
              aria-live="polite"
            >
              <span>{formModel.shortQueryMessage}</span>
            </div>
          )}

          <div class="space-y-2">
            <p class="text-base-content/60 text-xs font-semibold tracking-[0.08em] uppercase">
              {langSearchAssist(resource.value.lang)}
            </p>
            <InlineFilterGroup>
              <FilterChip
                label={langSubmitAtLeastCharactersToLoadResults(
                  resource.value.lang,
                  MIN_SEARCH_QUERY_LENGTH,
                )}
              />
              <FilterChip
                label={langSearchesMoviesTvAndPeople(resource.value.lang)}
              />
              <FilterChip
                label={langResultsUpdateWhenYouSubmit(resource.value.lang)}
              />
            </InlineFilterGroup>
          </div>
        </div>
      </section>

      <SearchAssist
        categoryLinks={assistLinks}
        discoveryDescription={langJumpBackIntoDiscoveryWhenYouWantBroaderBrowsing(
          resource.value.lang,
        )}
        emptyRecentSearchesMessage={langSearchForATitleOnceAndItWillShowUpHere(
          resource.value.lang,
        )}
        lang={resource.value.lang}
        recentSearches={recentSearches.value}
        recentSearchesLabel={langRecentSearches(resource.value.lang)}
        searchTipsLabel={langSearchAssist(resource.value.lang)}
      />

      <Resource
        value={searchResource}
        onPending={() => (
          <LoadingState
            title={langLoadingSearchResults(resource.value.lang)}
            description={langFetchingMatchingTitlesAndPeople(resource.value.lang)}
            compact={true}
          />
        )}
        onRejected={(error) => (
          <ErrorState
            title={langSearchUnavailableRightNow(resource.value.lang)}
            description={error.message}
            compact={true}
          />
        )}
        onResolved={(movies) => {
          if (!movies) {
            return (
              <EmptyState
                title={langStartWithATitleActorOrDirector(resource.value.lang)}
                description={langSearchBecomesAvailableAfterCharacters(
                  resource.value.lang,
                  MIN_SEARCH_QUERY_LENGTH,
                )}
                compact={true}
              />
            );
          }

          const normalizedResults = normalizeSearchResults({
            language: resource.value.lang,
            results: movies.results,
          });

          if (normalizedResults.length > 0) {
            return (
              <MediaGrid
                description={langResultsCombineMoviesTvSeriesAndPeopleInOneGrid(
                  resource.value.lang,
                )}
                eyebrow={langResults(resource.value.lang)}
                headerBadge={langSearchMatchesCount(
                  resource.value.lang,
                  movies.total_results,
                )}
                title={`${langSearchResults(resource.value.lang)} (${movies.total_results})`}
              >
                {normalizedResults.map((result) => (
                  <a
                    key={result.id}
                    class="media-card-link block h-full text-left"
                    href={result.href}
                  >
                    <MediaCard
                      title={result.title}
                      width={300}
                      rating={result.rating}
                      year={result.year}
                      picfile={result.picfile}
                      variant={result.variant}
                      layout="grid"
                    />
                  </a>
                ))}
              </MediaGrid>
            );
          }

          return (
            <EmptyState
              title={langNoResults(resource.value.lang)}
              description={langTryABroaderTitleAPersonNameOrDifferentSpelling(
                resource.value.lang,
              )}
              compact={true}
            />
          );
        }}
      />
    </div>
  );
});
