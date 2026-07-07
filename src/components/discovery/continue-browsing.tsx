import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  HiClockSolid,
  HiMagnifyingGlassSolid,
  HiPlaySolid,
} from "@qwikest/icons/heroicons";
import { langText } from "~/utils/languages";
import {
  readLastViewed,
  readRecentSearches,
  type LastViewedItem,
} from "~/utils/recent-activity";

type ContinueBrowsingWidgetProps = {
  lang: string;
  lastViewedLabel: string;
  recentSearchesLabel: string;
  resumeLabel: string;
};

export const ContinueBrowsingWidget = component$<ContinueBrowsingWidgetProps>(
  ({
    lang,
    lastViewedLabel,
    recentSearchesLabel,
    resumeLabel,
  }) => {
    const lastViewed = useSignal<LastViewedItem | null>(null);
    const recentSearches = useSignal<ReturnType<typeof readRecentSearches>>([]);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
      lastViewed.value = readLastViewed();
      recentSearches.value = readRecentSearches();
    }, { strategy: "document-ready" });

    return (
      <section id="continue-browsing" class="section-reveal scroll-mt-28">
        <div class="card border-base-200 bg-base-100 border shadow-sm">
          <div class="card-body gap-4 p-4 md:p-6">
            <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 class="card-title">
                  {lastViewedLabel}
                </h2>
              </div>
              {recentSearches.value.length > 0 && (
                <div class="badge badge-ghost gap-2">
                  <HiClockSolid class="h-3.5 w-3.5" />
                  {recentSearches.value.length}
                </div>
              )}
            </div>

            <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              {lastViewed.value ? (
                <a
                  href={lastViewed.value.href}
                  class="card card-side bg-base-200 media-card-link min-w-0 shadow-sm"
                >
                  <figure class="text-primary w-16">
                    <HiPlaySolid class="h-5 w-5" />
                  </figure>
                  <div class="card-body min-w-0 flex-1 p-4">
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
                  <span class="btn btn-primary btn-sm m-4 min-h-11 self-center">
                    {resumeLabel}
                  </span>
                </a>
              ) : (
                <div class="alert">
                  <HiClockSolid class="text-primary h-5 w-5" />
                  <span>
                    {langText(
                      lang,
                      "Open a title and it will appear here.",
                      "Откройте тайтл, и он появится здесь.",
                    )}
                  </span>
                </div>
              )}

              <div class="card bg-base-200 shadow-sm">
                <div class="card-body gap-3 p-4">
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
                          class="btn btn-ghost btn-sm min-h-11 max-w-full"
                        >
                          <span class="truncate">{search.query}</span>
                        </a>
                      ))
                    ) : (
                      <span class="text-base-content/60 text-sm">
                        {langText(
                          lang,
                          "Your searches will appear here.",
                          "Ваши поиски появятся здесь.",
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
