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

type FeedbackPanelProps = FeedbackCardProps & {
  alertClass: string;
  icon: "empty" | "error" | "loading";
  live?: "polite" | "assertive";
  minHeightClass: string;
  role?: "alert" | "status";
};

const FEEDBACK_SECTION_BASE_CLASS = "overlay-enter container mx-auto px-4";

const getFeedbackSectionClass = (
  compact: boolean,
  minHeightClass: string,
) => [
  FEEDBACK_SECTION_BASE_CLASS,
  compact ? "py-6" : `flex ${minHeightClass} items-center justify-center py-8`,
];

const FeedbackPanel = ({
  title,
  description,
  compact = false,
  alertClass,
  icon,
  live = "polite",
  minHeightClass,
  role,
}: FeedbackPanelProps) => (
  <section
    aria-live={live}
    class={getFeedbackSectionClass(compact, minHeightClass)}
  >
    <div
      role={role}
      class={`alert alert-vertical sm:alert-horizontal rounded-box w-full max-w-xl shadow-sm ${alertClass}`}
    >
      {icon === "loading" ? (
        <span
          aria-hidden="true"
          class="loading loading-spinner loading-lg shrink-0"
        />
      ) : icon === "error" ? (
        <HiXCircleSolid aria-hidden="true" class="h-10 w-10 shrink-0" />
      ) : (
        <HiInformationCircleSolid
          aria-hidden="true"
          class="text-info h-10 w-10 shrink-0"
        />
      )}
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

export const LoadingState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <FeedbackPanel
        title={title}
        description={description}
        compact={compact}
        alertClass="alert-info border-info/20 border bg-base-100/95"
        icon="loading"
        minHeightClass="min-h-[40vh]"
        role="status"
      />
    );
  },
);

export const ErrorState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <FeedbackPanel
        title={title}
        description={description}
        compact={compact}
        alertClass="alert-error bg-base-100/95"
        icon="error"
        live="assertive"
        minHeightClass="min-h-[40vh]"
        role="alert"
      />
    );
  },
);

export const EmptyState = component$<FeedbackCardProps>(
  ({ title, description, compact = false }) => {
    return (
      <FeedbackPanel
        title={title}
        description={description}
        compact={compact}
        alertClass="border-base-200 border bg-base-100/95"
        icon="empty"
        minHeightClass="min-h-[32vh]"
        role="status"
      />
    );
  },
);

export const SectionHeading = component$<{
  badges?: string[];
  description?: string;
  eyebrow?: string;
  title: string;
}>(({ badges, description, eyebrow, title }) => {
  return (
    <header class="section-reveal mb-5 space-y-3 text-left">
      {eyebrow && (
        <p class="text-base-content/60 text-xs font-semibold tracking-[0.12em] uppercase">
          {eyebrow}
        </p>
      )}
      <h1 class="text-3xl font-bold tracking-tight text-balance md:text-4xl">
        {title}
      </h1>
      {description && (
        <p class="text-base-content/70 max-w-3xl text-sm leading-relaxed md:text-base">
          {description}
        </p>
      )}
      {badges && badges.length > 0 && (
        <div class="flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              class="badge border-base-300/80 bg-base-200/65 text-base-content/75 rounded-full px-3 py-3 font-medium shadow-none"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </header>
  );
});

export const InlineFilterGroup = component$(() => {
  return (
    <div class="flex flex-wrap items-center gap-2">
      <Slot />
    </div>
  );
});

export const FilterChip = component$<{ label: string }>(({ label }) => {
  return (
    <span class="badge border-base-300/80 bg-base-200/60 text-base-content/70 pointer-events-none h-8 rounded-full px-3 py-3 font-medium shadow-none">
      {label}
    </span>
  );
});
