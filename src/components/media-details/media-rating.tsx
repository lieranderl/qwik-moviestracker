import { component$ } from "@builder.io/qwik";

import { RatingStar } from "~/components/rating-star";
import { formatRating } from "~/utils/format";
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
				{imdb_id && <Imdb id={imdb_id} />}
			</div>
		);
	},
);
