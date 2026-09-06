import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";

import { RatingStar } from "~/components/rating-star";
import {
  getImdbRatingResult,
  type ImdbLookupResult,
} from "~/services/cloud-func-api";
import { formatRating } from "~/utils/format";
import { langText } from "~/utils/languages";
import { Imdb } from "../imdb";

export type MediaRatingProps = {
  vote_average?: number;
  vote_count?: number;
  imdbId?: string | null;
  lang: string;
};

const fetchImdbRating = server$(async (imdbId: string) => {
  return getImdbRatingResult(imdbId);
});

export const MediaRating = component$<MediaRatingProps>(
  ({ vote_average, vote_count, imdbId, lang }) => {
    const imdb = useResource$<ImdbLookupResult>(async () =>
      imdbId ? fetchImdbRating(imdbId) : { status: "not-found" },
    );

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
        <Resource
          value={imdb}
          onPending={() => <span class="loading loading-ring loading-sm" />}
          onRejected={() => (
            <span class="text-xs opacity-60">
              {langText(lang, "IMDb unavailable", "IMDb недоступен")}
            </span>
          )}
          onResolved={(result) =>
            result.status === "found" ? (
              <Imdb imdb={result.rating} />
            ) : (
              <span class="text-xs opacity-60">
                {result.status === "not-found"
                  ? langText(lang, "IMDb not found", "IMDb не найден")
                  : langText(lang, "IMDb unavailable", "IMDb недоступен")}
              </span>
            )
          }
        />
      </div>
    );
  },
);
