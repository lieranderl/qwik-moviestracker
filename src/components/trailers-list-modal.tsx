import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { useQueryParamsLoader } from "~/routes/(auth-guard)/layout";
import type { VideoResult } from "~/services/models";
import { langTrailers } from "~/utils/languages";

export interface TorModalPros {
  videos?: VideoResult[];
}

export const TrailersModal = component$(({ videos }: TorModalPros) => {
  // const torrentsSignal = useSignal<Torrent[] | null>(null);

  const resource = useQueryParamsLoader();

  return (
    <>
      <button
        class="btn btn-accent btn-sm"
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
        <div class="modal-box">
          {/* <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form> */}
          <h3 class="text-lg font-bold">{langTrailers(resource.value.lang)}</h3>
          {videos && (
            <div class="p-6 ">
              {videos.length ? (
                <section class="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-6 py-4">
                  {videos.map((video) => (
                    <a
                      class="aspect-video"
                      href={`https://www.youtube.com/watch?v=${video.key}`}
                      key={video.id}
                      target="_none"
                    >
                      <Image
                        alt={video.name}
                        class="border-base-300 h-full max-h-full w-[300px] rounded-md border-2 object-cover md:w-full "
                        height={300}
                        src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`}
                        width={200}
                      />
                      <div class="mt-2 flex flex-col gap-2">
                        <span>{video.name}</span>
                        <span class="op-60 text-sm">{video.type}</span>
                      </div>
                    </a>
                  ))}
                </section>
              ) : (
                <div>No trailers found.</div>
              )}
            </div>
          )}
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
});
