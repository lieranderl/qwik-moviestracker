import { component$, Slot } from "@builder.io/qwik";
import {
  HiInformationCircleSolid,
  HiXCircleSolid,
} from "@qwikest/icons/heroicons";

type FeedbackCardProps = {
  title: string;
  description?: string;
  compact?: boolean;
};

export const LoadingState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <section
        aria-live="polite"
        class={[
          "overlay-enter container mx-auto px-4",
          compact
            ? "py-6"
            : "flex min-h-[40vh] items-center justify-center py-8",
        ]}
      >
        <div class="alert alert-info alert-vertical sm:alert-horizontal border-info/20 bg-base-100/95 w-full max-w-xl border shadow-sm">
          <span class="loading loading-spinner loading-lg shrink-0" />
          <div class="space-y-1 text-center sm:text-left">
            <h2 class="text-lg font-semibold">{title}</h2>
            {description && (
              <p class="text-base-content/70 max-w-md text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  },
);

export const ErrorState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <section
        aria-live="polite"
        class={[
          "overlay-enter container mx-auto px-4",
          compact
            ? "py-6"
            : "flex min-h-[40vh] items-center justify-center py-8",
        ]}
      >
        <div
          role="alert"
          class="alert alert-error alert-vertical sm:alert-horizontal bg-base-100/95 w-full max-w-xl shadow-sm"
        >
          <HiXCircleSolid class="h-10 w-10 shrink-0" />
          <div class="space-y-1 text-center sm:text-left">
            <h2 class="text-lg font-semibold">{title}</h2>
            {description && (
              <p class="text-base-content/70 max-w-md text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  },
);

export const EmptyState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <section
        aria-live="polite"
        class={[
          "overlay-enter container mx-auto px-4",
          compact
            ? "py-6"
            : "flex min-h-[32vh] items-center justify-center py-8",
        ]}
      >
        <div class="alert alert-vertical sm:alert-horizontal border-base-200 bg-base-100/95 w-full max-w-xl border shadow-sm">
          <HiInformationCircleSolid class="text-info h-10 w-10 shrink-0" />
          <div class="space-y-1 text-center sm:text-left">
            <h2 class="text-lg font-semibold">{title}</h2>
            {description && (
              <p class="text-base-content/70 max-w-md text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  },
);

export const SectionHeading = component$<{ eyebrow?: string; title: string }>(
  ({ eyebrow, title }) => {
    return (
      <header class="section-reveal mb-5 space-y-2 text-left">
        {eyebrow && (
          <p class="text-base-content/60 text-xs font-semibold tracking-[0.12em] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 class="text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {title}
        </h1>
      </header>
    );
  },
);

export const InlineFilterGroup = component$(() => {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <Slot />
    </div>
  );
});

export const FilterChip = component$<{ label: string }>(({ label }) => {
  return (
    <span class="badge border-base-300/80 bg-base-200/60 text-base-content/70 pointer-events-none h-8 rounded-full px-3 font-medium shadow-none">
      {label}
    </span>
  );
});
