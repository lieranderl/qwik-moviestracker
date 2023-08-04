import {
  component$,
  useResource$,
  Resource,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { getImdbRating } from "~/services/tmdb";
import { isBrowser } from "@builder.io/qwik/build";
import { server$ } from "@builder.io/qwik-city";
import { DotPulseLoader } from "./dot-pulse-loader/dot-pulse-loader";
import { SiImdb } from "@qwikest/icons/simpleicons";

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

  useVisibleTask$(async (ctx) => {
    ctx.track(() => isBrowser);
    isBrowserSig.value = isBrowser;
  });

  return (
    <>
      <Resource
        value={imdbResource}
        onPending={() => <DotPulseLoader />}
        onRejected={() => <div></div>}
        onResolved={(imdb) => (
          <>
            {imdb && (
              <div class="flex items-center">
                <div class="text-[2.5rem] fill-teal-950 dark:fill-teal-50 me-2">
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
    </>
  );
});
