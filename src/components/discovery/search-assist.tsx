import { component$ } from "@builder.io/qwik";
import { HiClockSolid, HiSparklesSolid } from "@qwikest/icons/heroicons";
import type { RecentSearch } from "~/utils/recent-activity";
import { langRecentSearchesCount } from "~/utils/languages";

type SearchAssistProps = {
  categoryLinks: ReadonlyArray<{ href: string; label: string }>;
  emptyRecentSearchesMessage: string;
  lang: string;
  recentSearches: ReadonlyArray<RecentSearch>;
  recentSearchesLabel: string;
  searchTipsLabel: string;
};

export const SearchAssist = component$<SearchAssistProps>(
  ({
    categoryLinks,
    emptyRecentSearchesMessage,
    lang,
    recentSearches,
    recentSearchesLabel,
    searchTipsLabel,
  }) => {
    return (
      <section class="section-reveal grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="card border-base-200 bg-base-100 border shadow-sm">
          <div class="card-body gap-4 p-4 md:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold">
                <HiClockSolid class="text-primary h-4 w-4" />
                <span>{recentSearchesLabel}</span>
              </div>
              {recentSearches.length > 0 && (
                <span class="badge badge-ghost">
                  {langRecentSearchesCount(lang, recentSearches.length)}
                </span>
              )}
            </div>
            <div class="flex flex-wrap gap-2">
              {recentSearches.length > 0 ? (
                recentSearches.map((search) => (
                  <a
                    key={search.href}
                    href={search.href}
                    class="btn btn-ghost btn-sm min-h-11 max-w-full"
                  >
                    <span class="truncate">{search.query}</span>
                  </a>
                ))
              ) : (
                <div class="alert w-full">
                  {emptyRecentSearchesMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="card border-base-200 bg-base-100 border shadow-sm">
          <div class="card-body gap-4 p-4 md:p-6">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <HiSparklesSolid class="text-primary h-4 w-4" />
              <span>{searchTipsLabel}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              {categoryLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  class="btn btn-outline btn-sm min-h-11 max-w-full"
                >
                  <span class="truncate">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
