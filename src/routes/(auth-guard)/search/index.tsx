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
import { MediaType } from "~/services/models";
import { search } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import { formatYear } from "~/utils/format";
import { pushRecentSearch, readRecentSearches } from "~/utils/recent-activity";
import {
  langBrowseHome,
  langBrowseMovies,
  langBrowseTv,
  langNoResults,
  langRecentSearches,
  langSearch,
  langSearchAssist,
  langSearchResults,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import {
  getSearchPhrase,
  runSearchQuery,
  type SearchRequest,
} from "./search.logic";

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
  const initialQuery = loc.url.searchParams.get("q")?.trim() ?? "";
  const searchPhrase = getSearchPhrase(initialQuery);
  const recentSearches = useSignal<ReturnType<typeof readRecentSearches>>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!searchPhrase) {
      recentSearches.value = readRecentSearches();
      return;
    }

    recentSearches.value = pushRecentSearch({
      href: `${paths.search(resource.value.lang)}&q=${encodeURIComponent(searchPhrase)}`,
      query: searchPhrase,
    });
  });

  const searchResource = useResource$(async () => {
    if (!searchPhrase) {
      return null;
    }

    try {
      return runSearchQuery({
        execute: runSearch,
        language: resource.value.lang,
        query: searchPhrase,
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
                placeholder="Search titles, cast, and crew..."
                class="input input-bordered focus-ringable w-full"
                value={initialQuery}
              />
            </label>

            <button type="submit" class="btn btn-primary gap-2 md:min-w-40">
              <HiMagnifyingGlassOutline aria-hidden="true" class="h-5 w-5" />
              Search
            </button>
          </form>

          <div class="space-y-2">
            <p class="text-base-content/60 text-xs font-semibold tracking-[0.08em] uppercase">
              Search tips
            </p>
            <InlineFilterGroup>
              <FilterChip label="Use at least 3 characters" />
              <FilterChip label="Searches movies, TV, and people" />
              <FilterChip label="Results update when you submit" />
            </InlineFilterGroup>
          </div>
        </div>
      </section>

      <SearchAssist
        categoryLinks={[
          {
            href: paths.index(resource.value.lang),
            label: langBrowseHome(resource.value.lang),
          },
          {
            href: paths.movie(resource.value.lang),
            label: langBrowseMovies(resource.value.lang),
          },
          {
            href: paths.tv(resource.value.lang),
            label: langBrowseTv(resource.value.lang),
          },
        ]}
        emptyState="Search for a title once and it will show up here."
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

          if (movies.total_results > 0) {
            return (
              <MediaGrid
                description="Results combine movies, TV series, and people in one grid so you can jump straight into the right detail page."
                eyebrow="Results"
                headerBadge={`${movies.total_results} matches`}
                title={`${langSearchResults(resource.value.lang)} (${movies.total_results})`}
              >
                {movies.results.map((m) => (
                  <a
                    key={m.id}
                    class="media-card-link block h-full text-left"
                    href={paths.media(
                      m.media_type ?? ("movie" as MediaType),
                      m.id,
                      resource.value.lang,
                    )}
                  >
                    <MediaCard
                      title={
                        m.media_type === MediaType.Movie
                          ? (m.title ?? "")
                          : (m.name ?? "")
                      }
                      width={300}
                      rating={m.vote_average ? m.vote_average : 0}
                      year={
                        m.media_type === MediaType.Movie
                          ? formatYear(m.release_date)
                          : "first_air_date" in m
                            ? formatYear(m.first_air_date)
                            : 0
                      }
                      picfile={
                        m.media_type !== MediaType.Movie &&
                        m.media_type !== MediaType.Tv
                          ? m.profile_path
                          : m.poster_path
                      }
                      variant={
                        m.media_type !== MediaType.Movie &&
                        m.media_type !== MediaType.Tv
                          ? "person"
                          : "poster"
                      }
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
