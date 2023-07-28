import { Slot, component$ } from "@builder.io/qwik";
import { paths } from "~/utils/paths";

interface MediaCarouselProps {
  title: string;
  category?: string;
  type: string;
  lang: string;
}

export const MediaCarousel = component$(
  ({ title, type, category, lang }: MediaCarouselProps) => {
    return (
      <section class="my-4">
        <div class="flex flex-row justify-between items-center">
          <div class="text-xl font-bold ">{title}</div>
          {type !== "person" && (
            <a
              href={paths.category(type, category!, lang)}
              class="group text-sm transition duration-300"
            >
              Explore All
              <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5"></span>
            </a>
          )}
        </div>

        <div class="relative">
          <div class="overflow-y-auto px-8 py-4">
            <div class="carousel flex w-max flex-row gap-4">
              <Slot />
            </div>
          </div>
        </div>
      </section>
    );
  }
);
