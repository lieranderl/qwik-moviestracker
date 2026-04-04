import { component$, Slot, useId } from "@builder.io/qwik";

interface MediaGridProps {
  description?: string;
  eyebrow?: string;
  headerBadge?: string;
  title: string;
}

export const MediaGrid = component$(
  ({ description, eyebrow, headerBadge, title }: MediaGridProps) => {
    const titleId = useId();

    return (
      <section
        aria-labelledby={title ? titleId : undefined}
        class="my-6 space-y-4"
      >
        {title && (
          <header class="rounded-box border-base-200 bg-base-100/88 flex flex-col gap-3 border p-4 shadow-sm backdrop-blur sm:flex-row sm:items-end sm:justify-between">
            <div class="space-y-2">
              {eyebrow && (
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.12em] uppercase">
                  {eyebrow}
                </p>
              )}
              <h2
                id={titleId}
                class="text-left text-xl font-semibold text-balance md:text-2xl"
              >
                {title}
              </h2>
              {description && (
                <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {headerBadge && (
              <span class="badge border-base-300/80 bg-base-200/65 text-base-content/75 rounded-full px-3 py-3 font-medium shadow-none">
                {headerBadge}
              </span>
            )}
          </header>
        )}
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          <Slot />
        </div>
      </section>
    );
  },
);
