import { component$, Slot, useId } from "@builder.io/qwik";
import {
  getToneBadgeClass,
  getToneStatValueClass,
  getStatusTone,
  type TorrServerTone,
} from "./torrserver-utils";

export type TorrServerSummaryMetric = {
  description?: string;
  label: string;
  tone?: TorrServerTone;
  value: string | number;
};

export type TorrServerSummaryBadge = {
  label: string;
  tone?: TorrServerTone;
};

export interface TorrServerSummaryCardProps {
  badges?: TorrServerSummaryBadge[];
  connectionLabel?: string;
  connectionTone?: TorrServerTone;
  description?: string;
  endpoint: string;
  eyebrow?: string;
  metrics?: TorrServerSummaryMetric[];
  title: string;
  version?: string;
}

export const TorrServerSummaryCard = component$(
  ({
    badges = [],
    connectionLabel,
    connectionTone,
    description,
    endpoint,
    eyebrow,
    metrics = [],
    title,
    version,
  }: TorrServerSummaryCardProps) => {
    const headingId = useId();
    const statusTone = connectionTone ?? getStatusTone(connectionLabel);

    return (
      <section
        aria-labelledby={headingId}
        class="rounded-box border-base-200 bg-base-100/90 border shadow-sm backdrop-blur"
      >
        <div class="card-body gap-5 p-5 md:p-6">
          <header class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span
                title={endpoint}
                class="badge badge-outline max-w-full truncate rounded-full px-3 py-3 font-medium"
              >
                {endpoint}
              </span>
              {version && (
                <span class="badge badge-neutral rounded-full px-3 py-3 font-medium">
                  {version}
                </span>
              )}
              {connectionLabel && (
                <span class={`badge rounded-full px-3 py-3 font-medium ${getToneBadgeClass(statusTone)}`}>
                  {connectionLabel}
                </span>
              )}
            </div>

            <div class="space-y-2">
              {eyebrow && (
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.12em] uppercase">
                  {eyebrow}
                </p>
              )}
              <h2 id={headingId} class="text-2xl font-semibold text-balance">
                {title}
              </h2>
              {description && (
                <p class="text-base-content/70 text-sm leading-relaxed md:text-base">
                  {description}
                </p>
              )}
            </div>
          </header>

          {metrics.length > 0 && (
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric) => {
                const tone = metric.tone ?? "neutral";

                return (
                  <div
                    class="rounded-box border-base-200 bg-base-200/40 min-w-0 border px-4 py-3"
                    key={metric.label}
                  >
                    <p class="text-base-content/55 truncate text-xs font-medium">
                      {metric.label}
                    </p>
                    <p
                      class={`mt-1 truncate text-xl font-bold ${getToneStatValueClass(tone)}`}
                    >
                      {metric.value}
                    </p>
                    {metric.description && (
                      <p class="text-base-content/60 mt-1 truncate text-xs">
                        {metric.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {badges.length > 0 && (
            <div class="flex flex-wrap items-center gap-2">
              {badges.map((badge) => {
                const tone = badge.tone ?? "neutral";

                return (
                  <span
                    key={badge.label}
                    class={`badge rounded-full px-3 py-3 font-medium ${getToneBadgeClass(tone)}`}
                  >
                    {badge.label}
                  </span>
                );
              })}
            </div>
          )}

          <Slot />
        </div>
      </section>
    );
  },
);
