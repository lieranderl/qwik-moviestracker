import { component$ } from "@builder.io/qwik";
import { SiThemoviedatabase } from "@qwikest/icons/simpleicons";
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
			<section class="mb-4 text-lg">
				<div class="flex flex-wrap items-center">
					{vote_average !== undefined && vote_average > 0 && (
						<div class="me-4 flex items-center">
							<div class="me-2 text-[2.5rem]">
								<SiThemoviedatabase />
							</div>
							<div class="font-bold">
								{formatRating(vote_average)}{" "}
								{vote_count && vote_count > 0 && (
									<span class="text-sm italic">({vote_count})</span>
								)}
							</div>
						</div>
					)}
					{imdb_id && <Imdb id={imdb_id} />}
				</div>
			</section>
		);
	},
);
