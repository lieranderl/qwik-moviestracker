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
  langNoResults,
  langRecentSearches,
  langSearch,
  langSearchAssist,
  langSearchResults,
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
      throw new Error("Search results could not be loaded.");
    }
  });

  return (
    <div class="mx-auto w-full max-w-7xl pb-8">
      <SectionHeading
        eyebrow="Discovery"
        title={langSearch(resource.value.lang)}
        description="Search movies, TV series, and people with a plain GET flow that keeps the current language in the URL and restores recent activity from browser storage."
        badges={["Movies", "TV series", "People"]}
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
                Search movies, series, and people
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
                placeholder="Search titles, cast, and crew..."
                class="input input-bordered focus-ringable w-full"
                value={formModel.query}
              />
            </label>

            <button type="submit" class="btn btn-primary gap-2 md:min-w-40">
              <HiMagnifyingGlassOutline aria-hidden="true" class="h-5 w-5" />
              Search
            </button>
          </form>

          <p id="search-query-help" class="text-base-content/65 text-sm">
            Search starts after {MIN_SEARCH_QUERY_LENGTH} characters and keeps
            your current language in the URL.
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
              Search tips
            </p>
            <InlineFilterGroup>
              <FilterChip
                label={`Submit ${MIN_SEARCH_QUERY_LENGTH}+ characters to load results`}
              />
              <FilterChip label="Searches movies, TV, and people" />
              <FilterChip label="Results update when you submit" />
            </InlineFilterGroup>
          </div>
        </div>
      </section>

      <SearchAssist
        categoryLinks={assistLinks}
        discoveryDescription="Jump back into discovery when you want broader browsing instead of a direct query."
        emptyRecentSearchesMessage="Search for a title once and it will show up here."
        recentSearches={recentSearches.value}
        recentSearchesLabel={langRecentSearches(resource.value.lang)}
        searchTipsLabel={langSearchAssist(resource.value.lang)}
      />

      <Resource
        value={searchResource}
        onPending={() => (
          <LoadingState
            title="Loading search results"
            description="We are fetching matching titles and people."
            compact={true}
          />
        )}
        onRejected={(error) => (
          <ErrorState
            title="Search is unavailable right now"
            description={error.message}
            compact={true}
          />
        )}
        onResolved={(movies) => {
          if (!movies) {
            return (
              <EmptyState
                title="Start with a title, actor, or director"
                description="Search becomes available after 3 or more characters."
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
                description="Results combine movies, TV series, and people in one grid so you can jump straight into the right detail page."
                eyebrow="Results"
                headerBadge={`${movies.total_results} matches`}
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
              description="Try a broader title, a person name, or different spelling."
              compact={true}
            />
          );
        }}
      />
    </div>
  );
});
