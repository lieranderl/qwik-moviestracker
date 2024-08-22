import { component$ } from "@builder.io/qwik";
import type { Season } from "~/services/models";
import { MediaType } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import {
	langEpisodesCount,
	langOverview,
	langSeasons,
} from "~/utils/languages";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";

export type TvSeasonsProps = {
	lang: string;
	seasons: Season[];
};
export const TvSeasons = component$<TvSeasonsProps>(({ lang, seasons }) => {
	return (
		<section class="my-6">
			{seasons.length > 0 && (
				<MediaCarousel
					title={langSeasons(lang)}
					type={MediaType.Seasons}
					lang={lang}
				>
					{seasons
						.filter((s) => s.season_number !== 0)
						.map((s) => (
							<>
								<div
									key={s.id}
									class={s.overview ? "cursor-pointer" : ""}
									onClick$={() => {
										const seasonsModal = document.getElementById(
											`season-modal-${s.id.toString()}`,
										)
											? (document.getElementById(
													`season-modal-${s.id.toString()}`,
												) as HTMLDialogElement)
											: null;
										if (seasonsModal) {
											seasonsModal.showModal();
										}
									}}
								>
									<MediaCard
										charName={
											s.episode_count
												? `${langEpisodesCount(lang)} ${s.episode_count.toString()}`
												: ""
										}
										title={s.name ?? ""}
										width={300}
										year={s.air_date ? formatYear(s.air_date) : 0}
										rating={s.vote_average ? s.vote_average : 0}
										picfile={s.poster_path}
										isPerson={false}
										isHorizontal={false}
									/>
								</div>
								{s.overview && (
									<dialog id={`season-modal-${s.id.toString()}`} class="modal">
										<div class="modal-box">
											<h3 class="text-lg font-bold">{langOverview(lang)}</h3>
											<p class="py-4"> {s.overview}</p>
										</div>
										<form method="dialog" class="modal-backdrop">
											<button type="button">close</button>
										</form>
									</dialog>
								)}
							</>
						))}
				</MediaCarousel>
			)}
		</section>
	);
});
