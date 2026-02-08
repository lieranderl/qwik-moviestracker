import { component$, Slot } from "@builder.io/qwik";
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
        <div class="mb-2 flex flex-row items-end justify-between">
          <div class="text-base-content text-xl font-semibold">{title}</div>
          {type !== MediaType.Person &&
            type !== MediaType.Seasons &&
            category && (
              <a
                href={paths.category(type, category, lang)}
                class="link link-hover text-base-content/70 text-sm"
              >
                {langExploreAll(lang)}
              </a>
            )}
        </div>
        <div class="carousel carousel-start w-full p-4">
          <Slot />
        </div>
      </section>
    );
  },
);
