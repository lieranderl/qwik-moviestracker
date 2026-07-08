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
      <section id="featured-spotlight" class="section-reveal scroll-mt-28">
        <div class="card border-base-200 bg-base-100 relative overflow-hidden border shadow-sm">
          {backgroundImage && (
            <div
              class="absolute inset-0 bg-cover bg-center opacity-18"
              style={{ backgroundImage }}
            />
          )}
          <div class="from-base-100/95 via-base-100/92 to-base-100/82 absolute inset-0 bg-linear-to-br" />
          <div class="card-body relative z-10 p-4 md:p-6">
            <div class="max-w-3xl space-y-4">
              <div class="badge badge-primary badge-outline gap-2">
                <HiFireSolid class="h-3.5 w-3.5" />
                {overline}
              </div>
              <h2 class="card-title max-w-2xl text-3xl md:text-5xl">{title}</h2>
              <div class="flex flex-wrap items-center gap-2">
                {meta.map((item) => (
                  <span key={item} class="badge badge-ghost">
                    {item}
                  </span>
                ))}
                {rating && rating > 0 && (
                  <span class="badge badge-warning gap-1">
                    <RatingStar />
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p class="text-base-content/68 line-clamp-3 max-w-2xl text-sm leading-relaxed md:text-base">
                {description}
              </p>
              <a href={href} class="btn btn-primary min-h-11 w-fit">
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
