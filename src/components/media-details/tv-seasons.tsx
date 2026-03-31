import { component$ } from "@builder.io/qwik";
import type { Season } from "~/services/models";
import { MediaType } from "~/services/models";
import { formatYear } from "~/utils/format";
import { showDialogById } from "~/utils/browser";
import {
  langEpisodesCount,
  langOverview,
  langSeasons,
  langSwipeToBrowse,
} from "~/utils/languages";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";

export type TvSeasonsProps = {
  lang: string;
  seasons: Season[];
};
export const TvSeasons = component$<TvSeasonsProps>(({ lang, seasons }) => {
  return (
    <section class="my-6">
      {seasons.length > 0 && (
        <MediaCarousel
          hintLabel={langSwipeToBrowse(lang)}
          title={langSeasons(lang)}
          type={MediaType.Seasons}
          lang={lang}
        >
          {seasons
            .filter((s) => s.season_number !== 0)
            .map((s) => (
              <>
                <div
                  key={s.id}
                  class={s.overview ? "cursor-pointer" : ""}
                  onClick$={() => {
                    showDialogById(`season-modal-${s.id.toString()}`);
                  }}
                >
                  <MediaCard
                    charName={
                      s.episode_count
                        ? `${langEpisodesCount(lang)} ${s.episode_count.toString()}`
                        : ""
                    }
                    title={s.name ?? ""}
                    width={300}
                    year={s.air_date ? formatYear(s.air_date) : 0}
                    rating={s.vote_average ? s.vote_average : 0}
                    picfile={s.poster_path}
                    isPerson={false}
                    isHorizontal={false}
                  />
                </div>
                {s.overview && (
                  <dialog id={`season-modal-${s.id.toString()}`} class="modal">
                    <div class="modal-box overlay-enter border-base-200 bg-base-100 max-w-2xl border shadow-xl">
                      <div class="mb-4 flex items-start justify-between gap-4">
                        <h3 class="text-lg font-bold">{langOverview(lang)}</h3>
                        <form method="dialog">
                          <button
                            type="submit"
                            class="btn btn-ghost btn-circle btn-sm"
                          >
                            ✕
                          </button>
                        </form>
                      </div>
                      <p class="text-base-content/80 leading-relaxed">
                        {s.overview}
                      </p>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                      <button type="submit">close</button>
                    </form>
                  </dialog>
                )}
              </>
            ))}
        </MediaCarousel>
      )}
    </section>
  );
});
