import { $, component$, useId, useOnWindow, useSignal } from "@builder.io/qwik";

type QuickFilterItem = {
  active?: boolean;
  href: string;
  label: string;
};

type QuickFilterStripProps = {
  items: QuickFilterItem[];
  label: string;
};

export const QuickFilterStrip = component$<QuickFilterStripProps>(
  ({ items, label }) => {
    const tabGroupId = useId();
    const activeHref = useSignal("");

    const syncHash = $(() => {
      activeHref.value = window.location.hash;
    });
    const navigateTo = $((href: string) => {
      activeHref.value = href;
      window.location.hash = href.startsWith("#") ? href.slice(1) : href;
    });

    useOnWindow("load", syncHash);
    useOnWindow("hashchange", syncHash);

    return (
      <section class="section-reveal -mt-2 mb-6 md:sticky md:top-[4.1rem] md:z-30 md:-mt-4">
        <div class="rounded-box border-base-200 bg-base-100/92 shadow-base-content/5 border px-2 py-2 shadow-sm backdrop-blur">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div class="text-base-content/55 px-2 text-xs font-semibold tracking-[0.12em] uppercase">
              {label}
            </div>
            <div class="no-scrollbar overflow-x-auto">
              <div
                role="tablist"
                class="tabs tabs-box tabs-sm bg-base-200/65 min-w-max p-1"
              >
                {items.map((item, index) => {
                  const isActive = activeHref.value
                    ? activeHref.value === item.href
                    : item.active || index === 0;

                  return (
                    <input
                      key={item.href}
                      type="radio"
                      name={`quick_filter_${tabGroupId}`}
                      class="tab whitespace-nowrap"
                      role="tab"
                      aria-label={item.label}
                      aria-current={isActive ? "location" : undefined}
                      checked={isActive}
                      onChange$={() => {
                        navigateTo(item.href);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
