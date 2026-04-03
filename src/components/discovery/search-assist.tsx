import { component$ } from "@builder.io/qwik";
import { HiClockSolid, HiSparklesSolid } from "@qwikest/icons/heroicons";
import type { RecentSearch } from "~/utils/recent-activity";

type SearchAssistProps = {
  categoryLinks: ReadonlyArray<{ href: string; label: string }>;
  discoveryDescription: string;
  emptyRecentSearchesMessage: string;
  recentSearches: ReadonlyArray<RecentSearch>;
  recentSearchesLabel: string;
  searchTipsLabel: string;
};

export const SearchAssist = component$<SearchAssistProps>(
  ({
    categoryLinks,
    discoveryDescription,
    emptyRecentSearchesMessage,
    recentSearches,
    recentSearchesLabel,
    searchTipsLabel,
  }) => {
    const recentCountLabel =
      recentSearches.length > 0
        ? `${recentSearches.length} recent`
        : "No recent searches";

    return (
      <section class="section-reveal grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="card rounded-box border-base-200 bg-base-100/88 border shadow-sm backdrop-blur">
          <div class="card-body gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold">
                <HiClockSolid class="text-primary h-4 w-4" />
                <span>{recentSearchesLabel}</span>
              </div>
              <span class="badge border-base-300/80 bg-base-200/65 text-base-content/72 rounded-full px-3 py-3 font-medium shadow-none">
                {recentCountLabel}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              {recentSearches.length > 0 ? (
                recentSearches.map((search) => (
                  <a
                    key={search.href}
                    href={search.href}
                    class="btn btn-ghost btn-sm border-base-200 bg-base-200/60 rounded-full border text-sm font-medium normal-case shadow-none"
                  >
                    {search.query}
                  </a>
                ))
              ) : (
                <div class="rounded-box border-base-200 bg-base-200/35 text-base-content/62 w-full border p-3 text-sm leading-relaxed">
                  {emptyRecentSearchesMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="card rounded-box border-base-200 bg-base-100/88 border shadow-sm backdrop-blur">
          <div class="card-body gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm font-semibold">
                <HiSparklesSolid class="text-primary h-4 w-4" />
                <span>{searchTipsLabel}</span>
              </div>
              <p class="text-base-content/65 text-sm leading-relaxed">
                {discoveryDescription}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              {categoryLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  class="btn btn-outline btn-sm rounded-full text-sm font-medium normal-case shadow-none"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
