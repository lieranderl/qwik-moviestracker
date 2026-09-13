import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  HiChevronLeftSolid,
  HiChevronRightSolid,
  HiFireSolid,
  HiPlaySolid,
} from "@qwikest/icons/heroicons";
import { RatingStar } from "~/components/rating-star";
import { TMDB_IMAGE_BASE_URL } from "~/utils/constants";

export type FeaturedSpotlightItem = {
  description?: string | null;
  href: string;
  imagePath?: string | null;
  logoPath?: string | null;
  meta: string[];
  overline: string;
  rating?: number | null;
  title: string;
};

type FeaturedSpotlightProps = FeaturedSpotlightItem & {
  ctaLabel: string;
  isActive?: boolean;
};

type FeaturedCarouselProps = {
  ctaLabel: string;
  items: FeaturedSpotlightItem[];
  label: string;
  nextLabel: string;
  previousLabel: string;
};

const FEATURED_INTERVAL_MS = 8_000;

export const getVisibleFeaturedMeta = (items: string[]) =>
  items.map((item) => item.trim()).filter((item) => item && item !== "0");

export const getAdjacentFeaturedIndex = (
  current: number,
  total: number,
  direction: -1 | 1,
) => (total > 0 ? (current + direction + total) % total : 0);

export const FeaturedSpotlight = component$<FeaturedSpotlightProps>(
  ({
    ctaLabel,
    description,
    href,
    imagePath,
    isActive = true,
    logoPath,
    meta,
    overline,
    rating,
    title,
  }) => {
    const visibleMeta = getVisibleFeaturedMeta(meta);
    const visibleDescription = description?.trim();

    return (
      <article class="w-full">
        <div class="card relative min-h-[30rem] overflow-hidden border border-white/15 bg-black text-white shadow-2xl md:min-h-[32rem]">
          {imagePath && (
            <figure class="absolute inset-0">
              <img
                src={`${TMDB_IMAGE_BASE_URL}w1280${imagePath}`}
                alt=""
                width="1280"
                height="720"
                class="h-full w-full object-cover object-center"
              />
            </figure>
          )}
          <div class="absolute inset-0 bg-linear-to-r from-black/95 via-black/55 to-transparent" />
          <div class="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
          <div class="card-body relative z-10 justify-end p-5 sm:p-7 md:p-10">
            <div class="max-w-3xl">
              <div class="grid gap-3 md:gap-4">
                <div class="flex h-5 items-center gap-2 overflow-hidden text-xs font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                  <HiFireSolid class="text-primary h-4 w-4" />
                  {overline}
                </div>
                <div class="flex h-[4.5rem] items-start overflow-hidden md:h-[7.5rem]">
                  <h2
                    class={
                      logoPath
                        ? "sr-only"
                        : "card-title line-clamp-2 max-w-2xl text-3xl leading-tight md:text-5xl"
                    }
                  >
                    {title}
                  </h2>
                  {logoPath && (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}w500${logoPath}`}
                      alt=""
                      width="500"
                      height="200"
                      class="max-h-full w-auto max-w-[min(24rem,90%)] object-contain object-left"
                    />
                  )}
                </div>
                <div class="h-10 overflow-hidden">
                  {(visibleMeta.length > 0 || (rating && rating > 0)) && (
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                      {visibleMeta.map((item, index) => (
                        <span key={item} class="flex items-center gap-2">
                          {index > 0 && <span aria-hidden="true">•</span>}
                          {item}
                        </span>
                      ))}
                      {rating && rating > 0 && (
                        <span class="flex items-center gap-1.5">
                          {visibleMeta.length > 0 && (
                            <span aria-hidden="true">•</span>
                          )}
                          <RatingStar />
                          {rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div class="h-[4.5rem] overflow-hidden md:h-[4.75rem]">
                  {visibleDescription && (
                    <p class="line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                      {visibleDescription}
                    </p>
                  )}
                </div>
                <div class="card-actions h-11 items-start">
                  <a
                    href={href}
                    tabIndex={isActive ? undefined : -1}
                    class="btn min-h-11 rounded-full border-0 bg-white px-6 text-black hover:bg-white/90"
                  >
                    <HiPlaySolid class="h-5 w-5" />
                    {ctaLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  },
);

export const FeaturedCarousel = component$<FeaturedCarouselProps>(
  ({ ctaLabel, items, label, nextLabel, previousLabel }) => {
    const activeIndex = useSignal(0);
    const pointerPaused = useSignal(false);
    const focusPaused = useSignal(false);

    const showPrevious = $(() => {
      activeIndex.value = getAdjacentFeaturedIndex(
        activeIndex.value,
        items.length,
        -1,
      );
    });
    const showNext = $(() => {
      activeIndex.value = getAdjacentFeaturedIndex(
        activeIndex.value,
        items.length,
        1,
      );
    });
    const pausePointer = $(() => {
      pointerPaused.value = true;
    });
    const resumePointer = $(() => {
      pointerPaused.value = false;
    });
    const pauseFocus = $(() => {
      focusPaused.value = true;
    });
    const resumeFocus = $(() => {
      focusPaused.value = false;
    });

    // This timer and its visibility/reduced-motion checks are browser-only.
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup, track }) => {
      track(() => activeIndex.value);
      if (
        items.length < 2 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const timer = window.setInterval(() => {
        if (!document.hidden && !pointerPaused.value && !focusPaused.value) {
          activeIndex.value = getAdjacentFeaturedIndex(
            activeIndex.value,
            items.length,
            1,
          );
        }
      }, FEATURED_INTERVAL_MS);

      cleanup(() => window.clearInterval(timer));
    });

    return (
      <section
        id="featured-spotlight"
        aria-label={label}
        aria-roledescription="carousel"
        class="section-reveal scroll-mt-28"
        onMouseEnter$={pausePointer}
        onMouseLeave$={resumePointer}
        onFocusIn$={pauseFocus}
        onFocusOut$={resumeFocus}
      >
        <div class="rounded-box relative overflow-hidden">
          <div
            class="carousel w-full overflow-visible transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{
              transform: `translate3d(-${activeIndex.value * 100}%, 0, 0)`,
            }}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex.value;

              return (
                <div
                  key={item.href}
                  aria-hidden={!isActive}
                  class="carousel-item w-full shrink-0"
                >
                  <FeaturedSpotlight
                    {...item}
                    ctaLabel={ctaLabel}
                    isActive={isActive}
                  />
                </div>
              );
            })}
          </div>

          {items.length > 1 && (
            <>
              <div class="absolute top-5 right-5 z-20 flex gap-2">
                <button
                  type="button"
                  aria-label={previousLabel}
                  class="btn btn-circle min-h-11 min-w-11 border-white/20 bg-black/45 text-white backdrop-blur-md hover:bg-black/65"
                  onClick$={showPrevious}
                >
                  <HiChevronLeftSolid aria-hidden="true" class="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label={nextLabel}
                  class="btn btn-circle min-h-11 min-w-11 border-white/20 bg-black/45 text-white backdrop-blur-md hover:bg-black/65"
                  onClick$={showNext}
                >
                  <HiChevronRightSolid aria-hidden="true" class="h-5 w-5" />
                </button>
              </div>
              <div class="absolute right-3 bottom-2 z-20 hidden sm:flex">
                {items.map((item, index) => (
                  <button
                    key={item.href}
                    type="button"
                    aria-current={
                      index === activeIndex.value ? "true" : "false"
                    }
                    aria-label={`${index + 1} / ${items.length}: ${item.title}`}
                    class="btn btn-circle btn-ghost min-h-11 min-w-11 text-white"
                    onClick$={$(() => {
                      activeIndex.value = index;
                    })}
                  >
                    <span
                      class={[
                        "h-1.5 rounded-full transition-[width,opacity] duration-300 motion-reduce:transition-none",
                        index === activeIndex.value
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/45",
                      ]}
                    />
                  </button>
                ))}
              </div>
              <div
                role="status"
                aria-live="polite"
                class="badge absolute right-4 bottom-4 z-20 border-white/20 bg-black/45 text-white backdrop-blur-md sm:hidden"
              >
                {activeIndex.value + 1} / {items.length}
              </div>
            </>
          )}
        </div>
      </section>
    );
  },
);
