import { component$ } from "@builder.io/qwik";

import { formatRating } from "~/utils/fomat";
import { Imdb } from "../imdb";

export type MediaRatingProps = {
	vote_average?: number;
	vote_count?: number;
	imdb_id?: string;
};

export const MediaRating = component$<MediaRatingProps>(
	({ vote_average, vote_count, imdb_id }) => {
		return (
			<div class="flex items-center gap-2">
				{vote_average !== undefined && vote_average > 0 && (
					<div class="flex items-center gap-1 me-2">
						<span class="text-xs font-bold">TMDB</span>
						<span class="text-yellow-500">★</span>
						<span class="font-bold">{formatRating(vote_average)}</span>

						{vote_count && vote_count > 0 && (
							<span class="text-xs opacity-60">({vote_count})</span>
						)}
					</div>
				)}
				{imdb_id && <Imdb id={imdb_id} />}
			</div>
		);
	},
);
