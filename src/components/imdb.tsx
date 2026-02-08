import {
  $,
  component$,
  Resource,
  useOnDocument,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import { server$ } from "@builder.io/qwik-city";

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
      onPending={() => <span class="loading loading-ring loading-lg" />}
      onRejected={() => <div />}
      onResolved={(imdb) => (
        <>
          {imdb && (
            <div class="flex items-center gap-1">
              <span class="text-xs font-bold">IMDb</span>
              <span class="text-warning">★</span>
              <span class="font-bold">{imdb.Rating}</span>

              {imdb.Votes && (
                <span class="text-xs opacity-60">({imdb.Votes})</span>
              )}
            </div>
          )}
        </>
      )}
    />
  );
});
