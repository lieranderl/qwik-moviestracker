import { Slot, component$ } from "@builder.io/qwik";

interface MediaGridProps {
  title: string;
}

export const MediaGrid = component$(({ title }: MediaGridProps) => {
  return (
    <>
      <section class="my-4">
        <div class="text-xl font-bold">{title}</div>
        <div class="flex flex-wrap justify-center gap-3 px-2">
          <Slot />
        </div>
      </section>
    </>
  );
});
