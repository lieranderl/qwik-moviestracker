import { component$ } from "@builder.io/qwik";

export type MediaTitleProps = {
  name: string;
  original_name?: string;
};
export const MediaTitle = component$<MediaTitleProps>(
  ({ name, original_name }) => {
    return (
      <section class="my-4">
        <h2 class="me-1 text-5xl font-extrabold">{name}</h2>
        {original_name && <div class="text-xl">{original_name}</div>}
      </section>
    );
  },
);
