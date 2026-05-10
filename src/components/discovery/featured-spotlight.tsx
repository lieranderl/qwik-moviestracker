import { component$ } from "@builder.io/qwik";
import { HiFireSolid, HiPlaySolid } from "@qwikest/icons/heroicons";
import { RatingStar } from "~/components/rating-star";
import { TMDB_IMAGE_BASE_URL } from "~/utils/constants";

type FeaturedSpotlightProps = {
  ctaLabel: string;
  description: string;
  href: string;
  imagePath?: string | null;
  meta: string[];
  overline: string;
  rating?: number | null;
  title: string;
};

export const FeaturedSpotlight = component$<FeaturedSpotlightProps>(
  ({
    ctaLabel,
    description,
    href,
    imagePath,
    meta,
    overline,
    rating,
    title,
  }) => {
    const backgroundImage = imagePath
      ? `url(${TMDB_IMAGE_BASE_URL}w1280${imagePath})`
      : undefined;

    return (
      <section id="featured-spotlight" class="section-reveal">
        <div class="rounded-box border-base-200 bg-base-100/90 relative overflow-hidden border shadow-sm backdrop-blur">
          {backgroundImage && (
            <div
              class="absolute inset-0 bg-cover bg-center opacity-18"
              style={{ backgroundImage }}
            />
          )}
          <div class="from-base-100/95 via-base-100/92 to-base-100/82 absolute inset-0 bg-linear-to-br" />
          <div class="relative z-10 grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:items-end">
            <div class="max-w-3xl space-y-4">
              <div class="badge badge-primary badge-outline gap-2 rounded-full px-3 py-3 font-medium">
                <HiFireSolid class="h-3.5 w-3.5" />
                {overline}
              </div>
              <h2 class="max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl">
                {title}
              </h2>
              <div class="flex flex-wrap items-center gap-2">
                {meta.map((item) => (
                  <span
                    key={item}
                    class="badge badge-ghost rounded-full px-3 py-3 font-medium"
                  >
                    {item}
                  </span>
                ))}
                {rating && rating > 0 && (
                  <span class="badge badge-warning gap-1 rounded-full px-3 py-3 font-medium">
                    <RatingStar />
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p class="text-base-content/68 max-w-2xl text-sm leading-relaxed md:text-base">
                {description}
              </p>
            </div>

            <div class="rounded-box border-base-200/70 bg-base-100/72 flex w-full max-w-sm flex-col gap-4 border p-4 shadow-sm backdrop-blur">
              <div class="space-y-1">
                <p class="text-base-content/55 text-xs font-semibold tracking-[0.14em] uppercase">
                  Quick access
                </p>
                <p class="text-base-content/72 text-sm leading-relaxed">
                  Open details and jump straight into the current highlight.
                </p>
              </div>
              <a
                href={href}
                class="btn btn-primary btn-lg rounded-full px-5 text-sm font-medium normal-case shadow-none"
              >
                <HiPlaySolid class="h-5 w-5" />
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  },
);
