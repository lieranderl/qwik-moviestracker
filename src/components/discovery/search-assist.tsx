import { component$ } from "@builder.io/qwik";
import { HiClockSolid, HiSparklesSolid } from "@qwikest/icons/heroicons";

type SearchAssistProps = {
  categoryLinks: { href: string; label: string }[];
  emptyState: string;
  recentSearches: { href: string; query: string }[];
  recentSearchesLabel: string;
  searchTipsLabel: string;
};

export const SearchAssist = component$<SearchAssistProps>(
  ({
    categoryLinks,
    emptyState,
    recentSearches,
    recentSearchesLabel,
    searchTipsLabel,
  }) => {
    return (
      <section class="section-reveal grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="card rounded-box border-base-200 bg-base-100/88 border shadow-sm backdrop-blur">
          <div class="card-body gap-3">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <HiClockSolid class="text-primary h-4 w-4" />
              <span>{recentSearchesLabel}</span>
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
                <span class="text-base-content/62 text-sm">{emptyState}</span>
              )}
            </div>
          </div>
        </div>

        <div class="card rounded-box border-base-200 bg-base-100/88 border shadow-sm backdrop-blur">
          <div class="card-body gap-3">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <HiSparklesSolid class="text-primary h-4 w-4" />
              <span>{searchTipsLabel}</span>
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
