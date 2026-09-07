import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

import { RatingStar } from "~/components/rating-star";
import {
  getImdbRatingResult,
  type ImdbLookupResult,
} from "~/services/cloud-func-api";
import { formatRating } from "~/utils/format";
import { message } from "~/utils/i18n";
import { Imdb } from "../imdb";

export type MediaRatingProps = {
  vote_average?: number;
  vote_count?: number;
  imdbId?: string | null;
  lang: string;
};

type ImdbDisplayState = ImdbLookupResult | { status: "loading" };

const fetchImdbRating = server$(async (imdbId: string) => {
  return getImdbRatingResult(imdbId);
});

export const MediaRating = component$<MediaRatingProps>(
  ({ vote_average, vote_count, imdbId, lang }) => {
    const imdb = useSignal<ImdbDisplayState>(
      imdbId ? { status: "loading" } : { status: "not-found" },
    );

    // IMDb is optional enrichment. Start it only after the primary SSR page is
    // visible so a service cold start can never delay detail-page HTML.
    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      if (!imdbId) return;

      let cancelled = false;
      void fetchImdbRating(imdbId)
        .then((result) => {
          if (!cancelled) imdb.value = result;
        })
        .catch(() => {
          if (!cancelled) imdb.value = { status: "unavailable" };
        });
      cleanup(() => {
        cancelled = true;
      });
    });

    return (
      <div class="flex items-center gap-2">
        {vote_average !== undefined && vote_average > 0 && (
          <div class="me-2 flex items-center gap-1">
            <span class="text-xs font-bold">TMDB</span>
            <RatingStar containerClass="text-warning" />
            <span class="inline-flex items-center font-bold">
              {formatRating(vote_average)}
            </span>

            {vote_count && vote_count > 0 && (
              <span class="text-xs opacity-60">({vote_count})</span>
            )}
          </div>
        )}
        {imdb.value.status === "loading" ? (
          <span
            aria-label="IMDb loading"
            class="loading loading-ring loading-sm"
          />
        ) : imdb.value.status === "found" ? (
          <Imdb imdb={imdb.value.rating} />
        ) : (
          <span class="text-xs opacity-60">
            {imdb.value.status === "not-found"
              ? message(lang, "imdb.notFound")
              : message(lang, "imdb.unavailable")}
          </span>
        )}
      </div>
    );
  },
);
