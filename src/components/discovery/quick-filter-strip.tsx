import { component$ } from "@builder.io/qwik";

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
    return (
      <section class="section-reveal -mt-2 mb-6 md:sticky md:top-[4.1rem] md:z-30 md:-mt-4">
        <div class="rounded-box border-base-200/80 bg-base-100/90 border px-2 py-2 shadow-sm backdrop-blur">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div class="text-base-content/55 px-2 text-xs font-semibold tracking-[0.12em] uppercase">
              {label}
            </div>
            <div class="no-scrollbar overflow-x-auto">
              <div class="flex min-w-max items-center gap-2">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    class={[
                      "btn btn-sm rounded-full border text-sm font-medium normal-case shadow-none",
                      item.active
                        ? "btn-primary border-transparent"
                        : "btn-ghost border-base-200/80 bg-base-200/55 hover:bg-base-200/85",
                    ]}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
