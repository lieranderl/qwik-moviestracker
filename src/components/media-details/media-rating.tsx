import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

import { RatingStar } from "~/components/rating-star";
import { getOptionalImdbRating } from "~/services/cloud-func-api";
import type { ImdbRating } from "~/services/models";
import { formatRating } from "~/utils/format";
import { Imdb } from "../imdb";

export type MediaRatingProps = {
  vote_average?: number;
  vote_count?: number;
  imdbId?: string | null;
};

const fetchImdbRating = server$(async (imdbId: string) => {
  return getOptionalImdbRating(imdbId);
});

export const MediaRating = component$<MediaRatingProps>(
  ({ vote_average, vote_count, imdbId }) => {
    const imdb = useSignal<ImdbRating | null>(null);
    const loading = useSignal(!!imdbId);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      if (!imdbId) {
        loading.value = false;
        return;
      }
      try {
        const result = await fetchImdbRating(imdbId);
        imdb.value = result ?? null;
      } finally {
        loading.value = false;
      }
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
        {loading.value && (
          <span class="loading loading-ring loading-sm" />
        )}
        {!loading.value && imdb.value && <Imdb imdb={imdb.value} />}
      </div>
    );
  },
);
