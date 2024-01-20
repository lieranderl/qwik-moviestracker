import { Slot, component$ } from "@builder.io/qwik";
import { MediaType } from "~/services/models";
import { langExploreAll } from "~/utils/languages";
import { paths } from "~/utils/paths";

interface MediaCarouselProps {
  title: string;
  category?: string;
  type: MediaType;
  lang: string;
}

export const MediaCarousel = component$(
  ({ title, type, category, lang }: MediaCarouselProps) => {
    return (
      <section class="my-4">
        <div class="flex flex-row items-center justify-between">
          <div class="text-xl font-bold ">{title}</div>
          {type !== MediaType.Person && type !== MediaType.Seasons && (
            <a
              href={paths.category(type, category!, lang)}
              class="group text-sm transition duration-300"
            >
              {langExploreAll(lang)}
              <span class="block h-0.5 max-w-0 transition-all duration-500 group-hover:max-w-full"></span>
            </a>
          )}
        </div>
        <div class="carousel carousel-start w-full rounded-box p-4">
          <Slot />
        </div>
      </section>
    );
  },
);
