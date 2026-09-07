import { message } from "~/utils/i18n";
import {
  component$,
  Resource,
  sync$,
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
  langSearchBecomesAvailableAfterCharacters,
  langSearchMatchesCount,
  langSearchStartsAfterCharacters,
  langTryABroaderTitleAPersonNameOrDifferentSpelling,
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

type SearchFormProps = {
  lang: string;
  query: string;
  shortQueryMessage: string | null;
};

const SearchForm = component$<SearchFormProps>(
  ({ lang, query, shortQueryMessage }) => (
    <section class="card border-base-200 bg-base-100 border shadow-sm">
      <div class="card-body gap-4 p-4 md:p-6">
        <form class="flex flex-col gap-3 md:flex-row md:items-end" method="get">
          <input type="hidden" name="lang" value={lang} />
          <label class="form-control flex-1 gap-2" for="search-query">
            <span class="label-text text-sm font-medium">
              {message(lang, "langSearchMoviesSeriesPeople")}
            </span>
            <input
              id="search-query"
              name="q"
              inputMode="search"
              autoComplete="off"
              spellcheck={false}
              aria-describedby="search-query-help"
              aria-invalid={Boolean(shortQueryMessage)}
              placeholder={message(lang, "langSearchTitlesCastCrew")}
              class="input input-bordered focus-ringable h-11 min-h-11 w-full text-base"
              {...(query ? { value: query } : {})}
              onInput$={sync$((_event, target) => {
                target.setAttribute("value", target.value);
              })}
            />
          </label>

          <button
            type="submit"
            class="btn btn-primary h-11 min-h-11 gap-2 md:min-w-40"
          >
            <HiMagnifyingGlassOutline aria-hidden="true" class="h-5 w-5" />
            {message(lang, "langSearch")}
          </button>
        </form>

        <p id="search-query-help" class="text-base-content/65 text-sm">
          {langSearchStartsAfterCharacters(lang, MIN_SEARCH_QUERY_LENGTH)}
        </p>

        {shortQueryMessage && (
          <div
            class="alert alert-warning alert-soft text-sm"
            role="status"
            aria-live="polite"
          >
            <span>{shortQueryMessage}</span>
          </div>
        )}
      </div>
    </section>
  ),
);

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
      const storedSearches = readRecentSearches();
      // Avoid a no-op rerender racing with native form input before Qwik has
      // resumed. An empty list is already the serialized initial state.
      if (storedSearches.length > 0) recentSearches.value = storedSearches;
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
      throw new Error(
        message(resource.value.lang, "langSearchUnavailableRightNow"),
        {
          cause: error,
        },
      );
    }
  });

  return (
    <div class="space-y-6 pb-8">
      <SectionHeading title={message(resource.value.lang, "langSearch")} />

      <SearchForm
        lang={resource.value.lang}
        query={formModel.query}
        shortQueryMessage={formModel.shortQueryMessage}
      />

      <SearchAssist
        categoryLinks={assistLinks}
        emptyRecentSearchesMessage={message(
          resource.value.lang,
          "langSearchForATitleOnceAndItWillShowUpHere",
        )}
        lang={resource.value.lang}
        recentSearches={recentSearches.value}
        recentSearchesLabel={message(resource.value.lang, "langRecentSearches")}
        searchTipsLabel={message(resource.value.lang, "langSearchAssist")}
      />

      <Resource
        value={searchResource}
        onPending={() => (
          <LoadingState
            title={message(resource.value.lang, "langLoadingSearchResults")}
            description={message(
              resource.value.lang,
              "langFetchingMatchingTitlesAndPeople",
            )}
            compact={true}
          />
        )}
        onRejected={(error) => (
          <ErrorState
            title={message(
              resource.value.lang,
              "langSearchUnavailableRightNow",
            )}
            description={error.message}
            compact={true}
          />
        )}
        onResolved={(movies) => {
          if (!movies) {
            return (
              <EmptyState
                title={message(
                  resource.value.lang,
                  "langStartWithATitleActorOrDirector",
                )}
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
                eyebrow={message(resource.value.lang, "langResults")}
                headerBadge={langSearchMatchesCount(
                  resource.value.lang,
                  movies.total_results,
                )}
                title={message(resource.value.lang, "langSearchResults")}
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
              title={message(resource.value.lang, "langNoResults")}
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
