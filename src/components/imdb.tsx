import { component$ } from "@builder.io/qwik";

import { RatingStar } from "~/components/rating-star";
import type { ImdbRating } from "~/services/models";

export const Imdb = component$(({ imdb }: { imdb: ImdbRating }) => {
  if (!imdb.Rating) {
    return null;
  }

  return (
    <div class="flex items-center gap-1">
      <span class="text-xs font-bold">IMDb</span>
      <RatingStar containerClass="text-warning" />
      <span class="inline-flex items-center font-bold">{imdb.Rating}</span>

      {imdb.Votes && <span class="text-xs opacity-60">({imdb.Votes})</span>}
    </div>
  );
});
