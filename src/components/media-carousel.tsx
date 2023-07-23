import { Slot, component$ } from "@builder.io/qwik";

interface MediaCarouselProps {
    title: string;
}

export const MediaCarousel = component$(({title}: MediaCarouselProps) => {
  return (
    <section>
    <div class="text-xl text-teal-950 font-bold dark:text-teal-50">{title}</div>
      <div class="relative">
        <div class="overflow-y-auto px-8 py-4">
          <div class="carousel flex w-max flex-row gap-4">
                <Slot />
          </div>
        </div>
      </div>
    </section>
  );
});
