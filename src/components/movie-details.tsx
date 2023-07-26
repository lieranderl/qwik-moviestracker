import { component$ } from "@builder.io/qwik";
import type { MovieMediaDetails } from "~/services/types";

interface MovieDetailsProps {
  movie: MovieMediaDetails;
}

export const MovieDetails = component$(({ movie }: MovieDetailsProps) => {
  return (
    <div>
      <div>{movie.title}</div>
      {movie.release_date && <div>{movie.release_date.substring(0,4)}</div>}
      {movie.vote_average && <div>{movie.vote_average.toFixed(1)}</div>}
      {movie.vote_count && <div>{movie.vote_count}</div>}
      {movie.runtime && <div>{movie.runtime} minutes</div>}
      {movie.budget && <div>{movie.budget}</div>}
      {movie.revenue && <div>{movie.revenue}</div>}
      {movie.genres && <div>{movie.genres.map((g) => g.name).join(", ")}</div>}
      {movie.production_companies && <div>{movie.production_companies.map((c) => c.name).join(", ")}</div>}
      {movie.production_countries && <div>{movie.production_countries.map((c) => c.name).join(", ")}</div>}
      {movie.tagline && <div>{movie.tagline}</div>}
      <div>{movie.overview}</div>
      
    </div>
  );
});
