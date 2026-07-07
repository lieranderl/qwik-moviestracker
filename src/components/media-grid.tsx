import { component$, Slot, useId } from "@builder.io/qwik";

type GridColumns = 3 | 4 | 5;

const GRID_CLASSES: Record<GridColumns, string> = {
  3: "grid grid-cols-2 gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3",
  4: "grid grid-cols-2 gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid grid-cols-2 gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
};

interface MediaGridProps {
  description?: string;
  eyebrow?: string;
  headerBadge?: string;
  maxColumns?: GridColumns;
  title: string;
}

export const MediaGrid = component$(
  ({
    description,
    eyebrow,
    headerBadge,
    maxColumns,
    title,
  }: MediaGridProps) => {
    const titleId = useId();

    return (
      <section
        aria-labelledby={title ? titleId : undefined}
        class="scroll-mt-28 space-y-4"
      >
        {title && (
          <header class="card border-base-200 bg-base-100 border shadow-sm">
            <div class="card-body gap-3 p-4 md:p-6 sm:flex-row sm:items-end sm:justify-between">
              <div class="space-y-2">
                {eyebrow && (
                  <p class="text-base-content/55 text-xs font-semibold tracking-[0.12em] uppercase">
                    {eyebrow}
                  </p>
                )}
                <h2 id={titleId} class="card-title md:text-2xl">
                  {title}
                </h2>
                {description && (
                  <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              {headerBadge && (
                <span class="badge badge-ghost">
                  {headerBadge}
                </span>
              )}
            </div>
          </header>
        )}
        <div class={GRID_CLASSES[maxColumns ?? 5] ?? GRID_CLASSES[5]}>
          <Slot />
        </div>
      </section>
    );
  },
);
