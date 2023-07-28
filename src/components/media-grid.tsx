import { Slot, component$ } from "@builder.io/qwik";

interface MediaGridProps {
  title: string;
}

export const MediaGrid = component$(({ title }: MediaGridProps) => {
  return (
    <>
      <section class="my-4">
        <div class="text-xl font-bold">
          {title}
        </div>
        <div class="flex flex-wrap gap-4 px-8 justify-center">
          <Slot />
        </div>
      </section>
    </>
  );
});
