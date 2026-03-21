import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  HiArrowTrendingUpSolid,
  HiClockSolid,
  HiMagnifyingGlassSolid,
  HiPlaySolid,
} from "@qwikest/icons/heroicons";
import {
  readLastViewed,
  readRecentSearches,
  type LastViewedItem,
} from "~/utils/recent-activity";

type ContinueBrowsingWidgetProps = {
  emptyDescription: string;
  label: string;
  lastViewedLabel: string;
  recentSearchesLabel: string;
  resumeLabel: string;
};

export const ContinueBrowsingWidget = component$<ContinueBrowsingWidgetProps>(
  ({
    emptyDescription,
    label,
    lastViewedLabel,
    recentSearchesLabel,
    resumeLabel,
  }) => {
    const lastViewed = useSignal<LastViewedItem | null>(null);
    const recentSearches = useSignal(readRecentSearches());

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      lastViewed.value = readLastViewed();
      recentSearches.value = readRecentSearches();
    });

    return (
      <section id="continue-browsing" class="section-reveal">
        <div class="card border-base-200 bg-base-100/92 shadow-base-content/7 border shadow-sm backdrop-blur">
          <div class="card-body gap-5">
            <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div class="space-y-2">
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.14em] uppercase">
                  {label}
                </p>
                <h2 class="text-2xl font-bold tracking-tight">
                  {lastViewedLabel}
                </h2>
              </div>
              {recentSearches.value.length > 0 && (
                <div class="badge badge-ghost gap-2 rounded-full px-3 py-3 text-xs">
                  <HiClockSolid class="h-3.5 w-3.5" />
                  {recentSearches.value.length} {recentSearchesLabel}
                </div>
              )}
            </div>

            <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              {lastViewed.value ? (
                <a
                  href={lastViewed.value.href}
                  class="media-card-link rounded-box border-base-200 bg-base-200/45 flex items-center gap-4 border p-4"
                >
                  <div class="bg-primary/12 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                    <HiPlaySolid class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-base-content/50 text-xs font-semibold tracking-[0.12em] uppercase">
                      {lastViewed.value.kind}
                    </p>
                    <p class="truncate text-base font-semibold">
                      {lastViewed.value.title}
                    </p>
                    {lastViewed.value.meta && (
                      <p class="text-base-content/65 truncate text-sm">
                        {lastViewed.value.meta}
                      </p>
                    )}
                  </div>
                  <span class="btn btn-primary btn-sm rounded-full">
                    {resumeLabel}
                  </span>
                </a>
              ) : (
                <div class="rounded-box border-base-200 bg-base-200/35 text-base-content/65 flex items-center gap-3 border p-4 text-sm">
                  <HiArrowTrendingUpSolid class="text-primary h-5 w-5" />
                  <span>{emptyDescription}</span>
                </div>
              )}

              <div class="rounded-box border-base-200 bg-base-200/30 border p-4">
                <div class="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <HiMagnifyingGlassSolid class="text-primary h-4 w-4" />
                  <span>{recentSearchesLabel}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  {recentSearches.value.length > 0 ? (
                    recentSearches.value.map((search) => (
                      <a
                        key={search.href}
                        href={search.href}
                        class="btn btn-ghost btn-sm border-base-200 bg-base-100/70 rounded-full border"
                      >
                        {search.query}
                      </a>
                    ))
                  ) : (
                    <span class="text-base-content/60 text-sm">
                      {emptyDescription}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
