import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import type { VideoResult } from "~/services/models";
import { langTrailers } from "~/utils/languages";

export interface TorModalPros {
  videos?: VideoResult[];
}

export const TrailersModal = component$(({ videos }: TorModalPros) => {
  const resource = useQueryParamsLoader();

  return (
    <>
      <button
        type="button"
        class="btn btn-outline btn-primary"
        onClick$={() => {
          const trailersModal = document.getElementById("trailersModal")
            ? (document.getElementById("trailersModal") as HTMLDialogElement)
            : null;
          if (trailersModal) {
            trailersModal.showModal();
          }
        }}
      >
        {langTrailers(resource.value.lang)}
      </button>
      <dialog id="trailersModal" class="modal">
        <div class="modal-box border-base-200 bg-base-100 max-h-[85vh] max-w-4xl overflow-y-auto border p-0 shadow-xl">
          <div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
            <h3 class="text-lg font-bold">
              {langTrailers(resource.value.lang)}
            </h3>
            <form method="dialog">
              <button type="submit" class="btn btn-ghost btn-circle btn-sm">
                ✕
              </button>
            </form>
          </div>

          <div class="space-y-4 p-5">
            {videos && videos.length > 0 ? (
              <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
                {videos.map((video) => (
                  <a
                    class="card border-base-200 bg-base-100 border shadow-sm transition hover:shadow-md"
                    href={`https://www.youtube.com/watch?v=${video.key}`}
                    key={video.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <figure class="aspect-video overflow-hidden">
                      <Image
                        alt={video.name}
                        class="h-full w-full object-cover"
                        height={300}
                        src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`}
                        width={450}
                      />
                    </figure>
                    <div class="card-body p-3">
                      <div class="line-clamp-2 text-sm font-semibold">
                        {video.name}
                      </div>
                      <div class="badge badge-outline badge-sm w-fit">
                        {video.type}
                      </div>
                    </div>
                  </a>
                ))}
              </section>
            ) : (
              <div class="text-base-content/70 rounded-box border-base-200 bg-base-200/40 border p-4 text-sm">
                No trailers found.
              </div>
            )}
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
});
