import { component$ } from "@builder.io/qwik";
import type { Season } from "~/services/models";
import { MediaType } from "~/services/models";
import { formatYear } from "~/utils/format";
import { showDialogById } from "~/utils/browser";
import {
  langEpisodesCount,
  langOverview,
  langSeasons,
  langText,
} from "~/utils/languages";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";

export type TvSeasonsProps = {
  lang: string;
  seasons: Season[];
};
export const TvSeasons = component$<TvSeasonsProps>(({ lang, seasons }) => {
  return (
    <section>
      {seasons.length > 0 && (
        <MediaCarousel
          title={langSeasons(lang)}
          type={MediaType.Seasons}
          lang={lang}
        >
          {seasons
            .filter((s) => s.season_number !== 0)
            .map((s) => (
              <div class="carousel-item" key={s.id}>
                <button
                  type="button"
                  aria-haspopup={s.overview ? "dialog" : undefined}
                  aria-controls={
                    s.overview ? `season-modal-${s.id.toString()}` : undefined
                  }
                  disabled={!s.overview}
                  key={s.id}
                  class={[
                    "media-card-link block text-left",
                    !s.overview && "pointer-events-none cursor-default",
                  ]}
                  onClick$={() => {
                    if (!s.overview) return;
                    showDialogById(`season-modal-${s.id.toString()}`);
                  }}
                >
                  <MediaCard
                    metaLabel={
                      s.episode_count
                        ? `${langEpisodesCount(lang)} ${s.episode_count.toString()}`
                        : ""
                    }
                    title={s.name ?? ""}
                    width={300}
                    year={s.air_date ? formatYear(s.air_date) : 0}
                    rating={s.vote_average ? s.vote_average : 0}
                    picfile={s.poster_path}
                    variant="poster"
                  />
                </button>
                {s.overview && (
                  <dialog id={`season-modal-${s.id.toString()}`} class="modal">
                    <div class="modal-box overlay-enter border-base-200 bg-base-100 max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto border p-0 shadow-xl">
                      <div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-start justify-between gap-4 border-b px-4 py-4 backdrop-blur sm:px-6">
                        <h3 class="text-lg font-bold">{langOverview(lang)}</h3>
                        <form method="dialog">
                          <button
                            type="submit"
                            aria-label={langText(
                              lang,
                              "Close season overview",
                              "Закрыть описание сезона",
                            )}
                            class="btn btn-ghost btn-circle min-h-11 w-11 p-0"
                          >
                            ✕
                          </button>
                        </form>
                      </div>
                      <div class="px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                        <p class="text-base-content/80 leading-relaxed">
                          {s.overview}
                        </p>
                      </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                      <button type="submit">
                        {langText(lang, "close", "закрыть")}
                      </button>
                    </form>
                  </dialog>
                )}
              </div>
            ))}
        </MediaCarousel>
      )}
    </section>
  );
});
