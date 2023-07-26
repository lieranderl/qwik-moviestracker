import { component$ } from "@builder.io/qwik";
import type { TvMediaDetails } from "~/services/types";

interface MovieDetailsProps {
  tv: TvMediaDetails;
}

export const TvDetails = component$(({ tv }: MovieDetailsProps) => {
  return (
    <div>
      <div>{tv.name}</div>
      <div>{tv.original_name}</div>
      {tv.first_air_date && <div>{tv.first_air_date.substring(0,4)}</div>}
      {tv.vote_average && <div>{tv.vote_average.toFixed(1)}</div>}
      {tv.vote_count && <div>{tv.vote_count}</div>}
      {tv.runtime && <div>{tv.runtime} minutes</div>}
      {tv.budget && <div>{tv.budget}</div>}
      {tv.revenue && <div>{tv.revenue}</div>}
      {tv.genres && <div>{tv.genres.map((g) => g.name).join(", ")}</div>}
      {tv.production_companies && <div>{tv.production_companies.map((c) => c.name).join(", ")}</div>}
      {tv.production_countries && <div>{tv.production_countries.map((c) => c.name).join(", ")}</div>}
      {tv.tagline && <div>{tv.tagline}</div>}
      <div>{tv.overview}</div>
      
    </div>
  );
});
