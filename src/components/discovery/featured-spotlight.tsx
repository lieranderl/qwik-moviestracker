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
        <div class="hero rounded-box border-base-200 bg-base-100/92 shadow-base-content/8 relative overflow-hidden border shadow-sm backdrop-blur">
          {backgroundImage && (
            <div
              class="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage }}
            />
          )}
          <div class="from-base-100/94 via-base-100/92 to-base-100/80 absolute inset-0 bg-linear-to-r" />
          <div class="hero-content w-full max-w-none flex-col items-start gap-8 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="relative z-10 max-w-3xl space-y-4">
              <div class="badge badge-primary badge-outline gap-2 rounded-full px-3 py-3 font-medium">
                <HiFireSolid class="h-3.5 w-3.5" />
                {overline}
              </div>
              <h2 class="max-w-2xl text-3xl font-black tracking-tight text-balance md:text-5xl">
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
              <p class="text-base-content/72 max-w-2xl text-base leading-relaxed md:text-lg">
                {description}
              </p>
            </div>

            <div class="relative z-10 flex w-full max-w-sm flex-col gap-3">
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
