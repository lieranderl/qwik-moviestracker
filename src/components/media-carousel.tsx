import {
  $,
  component$,
  Slot,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  HiChevronLeftSolid,
  HiChevronRightSolid,
} from "@qwikest/icons/heroicons";
import { MediaType } from "~/services/models";
import { langExploreAll } from "~/utils/languages";
import { paths } from "~/utils/paths";

interface MediaCarouselProps {
  title: string;
  category?: string;
  type: MediaType;
  lang: string;
  hintLabel?: string;
  sectionId?: string;
}

export const MediaCarousel = component$(
  ({
    title,
    type,
    category,
    hintLabel,
    lang,
    sectionId,
  }: MediaCarouselProps) => {
    const trackRef = useSignal<HTMLDivElement>();
    const scrollRatio = useSignal(0);
    const hasOverflow = useSignal(false);
    const canScrollBackward = useSignal(false);
    const canScrollForward = useSignal(false);

    const updateRailState = $(() => {
      const rail = trackRef.value;
      if (!rail) {
        return;
      }

      const maxScroll = rail.scrollWidth - rail.clientWidth;
      hasOverflow.value = maxScroll > 12;
      canScrollBackward.value = rail.scrollLeft > 12;
      canScrollForward.value = rail.scrollLeft < maxScroll - 12;
      scrollRatio.value = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
    });

    const scrollRail = $((direction: "backward" | "forward") => {
      const rail = trackRef.value;
      if (!rail) {
        return;
      }

      rail.scrollBy({
        left: rail.clientWidth * (direction === "forward" ? 0.82 : -0.82),
        behavior: "smooth",
      });
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      const rail = trackRef.value;
      if (!rail) {
        return;
      }

      const sync = () => {
        void updateRailState();
      };

      sync();
      rail.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);

      cleanup(() => {
        rail.removeEventListener("scroll", sync);
        window.removeEventListener("resize", sync);
      });
    });

    return (
      <section id={sectionId} class="section-reveal my-6 scroll-mt-28">
        <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div class="space-y-1">
            <div class="text-base-content text-xl font-semibold">{title}</div>
            {hintLabel && hasOverflow.value && (
              <p class="text-base-content/52 text-xs font-medium tracking-[0.08em] uppercase">
                {hintLabel}
              </p>
            )}
          </div>
          <div class="flex items-center gap-2">
            {hasOverflow.value && (
              <>
                <button
                  type="button"
                  aria-label={`Scroll ${title} backward`}
                  class="btn btn-ghost btn-sm btn-circle hidden md:inline-flex"
                  disabled={!canScrollBackward.value}
                  onClick$={() => scrollRail("backward")}
                >
                  <HiChevronLeftSolid class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Scroll ${title} forward`}
                  class="btn btn-ghost btn-sm btn-circle hidden md:inline-flex"
                  disabled={!canScrollForward.value}
                  onClick$={() => scrollRail("forward")}
                >
                  <HiChevronRightSolid class="h-4 w-4" />
                </button>
              </>
            )}
            {type !== MediaType.Person &&
              type !== MediaType.Seasons &&
              category && (
                <a
                  href={paths.category(type, category, lang)}
                  class="btn btn-ghost btn-sm text-base-content/70 rounded-full"
                >
                  {langExploreAll(lang)}
                </a>
              )}
          </div>
        </div>
        <div class="relative">
          <div
            class={[
              "from-base-100 via-base-100/85 pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r to-transparent transition-opacity duration-200 md:block",
              canScrollBackward.value ? "opacity-100" : "opacity-0",
            ]}
          />
          <div
            class={[
              "from-base-100 via-base-100/85 pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l to-transparent transition-opacity duration-200 md:block",
              canScrollForward.value ? "opacity-100" : "opacity-0",
            ]}
          />
          <div
            ref={trackRef}
            class="carousel carousel-start motion-stagger no-scrollbar w-full items-start overflow-y-visible scroll-smooth py-2 ps-0 pe-0"
          >
            <Slot />
          </div>
        </div>
        {hasOverflow.value && (
          <progress
            class="progress progress-secondary mt-3 h-1 w-full"
            max={100}
            value={scrollRatio.value * 100}
          />
        )}
      </section>
    );
  },
);
