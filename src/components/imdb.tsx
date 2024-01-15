import {
  component$,
  useResource$,
  Resource,
  $,
  useSignal,
  useOnDocument,
} from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import { server$ } from "@builder.io/qwik-city";
import { SiImdb } from "@qwikest/icons/simpleicons";
import { getImdbRating } from "~/services/cloud-func-api";

export const Imdb = component$(({ id }: { id: string }) => {
  const isBrowserSig = useSignal(isBrowser);

  const imdbResource = useResource$(async ({ track }) => {
    track(() => isBrowserSig.value);
    if (isBrowserSig.value) {
      const serverImdb = server$((id) => {
        return getImdbRating(id);
      });

      return serverImdb(id);
    }
    return null;
  });

  useOnDocument(
    "DOMContentLoaded",
    $(() => {
      isBrowserSig.value = isBrowser;
    }),
  );

  return (
    <Resource
      value={imdbResource}
      onPending={() => <span class="loading loading-spinner"></span>}
      onRejected={() => <div></div>}
      onResolved={(imdb) => (
        <>
          {imdb && (
            <div class="flex items-center">
              <div class="text-[2.5rem] me-2">
                <SiImdb />
              </div>

              <div class="text-md font-bold">
                {imdb.Rating}{" "}
                {imdb.Votes && (
                  <span class="text-sm font-bold italic">({imdb.Votes})</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    />
  );
});
