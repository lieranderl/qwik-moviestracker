import { component$ } from "@builder.io/qwik";
import { Image } from '@unpic/qwik';
import type { VideoResult } from "~/services/models";

export interface TorModalPros {
  videos?: VideoResult[];
}

export const TrailersModal = component$(({ videos }: TorModalPros) => {
  // const torrentsSignal = useSignal<Torrent[] | null>(null);

  return (
    <>
      <button
        data-modal-target="trailersModal"
        data-modal-toggle="trailersModal"
        class="px-3 py-2 text-base font-medium text-center text-teal-50 bg-teal-700 rounded-lg hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-teal-300 dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800"
        type="button"
      >
        Trailers
      </button>

      <div
        id="trailersModal"
        tabIndex={0}
        aria-hidden="true"
        class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative w-full max-w-4xl max-h-full">
          <div class="relative bg-teal-50 rounded-lg shadow dark:bg-teal-950">
            <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-teal-800">
              <h3 class="text-xl font-semibold ">Trailers</h3>
              <button
                type="button"
                class=" bg-transparent hover:bg-teal-100  rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-teal-800 "
                data-modal-hide="trailersModal"
              >
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>
            {videos && (
              <div class="p-6">
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
                          class="h-full max-h-full md:w-full w-[300px]  object-cover rounded-md border-2 border-base-300 border-white dark:border-teal-800"
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
        </div>
      </div>
    </>
  );
});
