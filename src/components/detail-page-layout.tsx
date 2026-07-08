import { component$, Slot } from "@builder.io/qwik";

type DetailPageShellProps = {
  backdropPath?: string | null;
};

export const DetailPageShell = component$<DetailPageShellProps>(
  ({ backdropPath }) => {
    const backgroundImage = backdropPath
      ? `url(https://image.tmdb.org/t/p/w1280${backdropPath})`
      : undefined;

    return (
      <div class="relative min-h-screen w-full">
        {backgroundImage && (
          <div
            class="ambient-backdrop absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-24 md:fixed md:opacity-32 md:blur-[1px]"
            style={{ backgroundImage }}
          />
        )}
        <div class="from-base-100/45 via-base-100/70 to-base-100 fixed inset-0 -z-10 bg-linear-to-b" />

        <div class="relative z-10">
          <Slot />
        </div>
      </div>
    );
  },
);

export const DetailPageContainer = component$(() => {
  return (
    <div class="min-h-screen space-y-8">
      <Slot />
    </div>
  );
});
