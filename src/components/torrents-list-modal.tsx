import { $, component$, useStore } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons";
import { TorrentList } from "~/components/torrent-list";
import { getTorrents } from "~/services/cloud-func-api";
import type { MediaDetails, Season, Torrent } from "~/services/models";
import { useQueryParamsLoader } from "~/shared/loaders";
import { formatYear } from "~/utils/format";
import { langSeason, langTorrents } from "~/utils/languages";

export interface TorModalPros {
	title: string;
	year: number;
	isMovie: boolean;
	seasons: Season[];
	media: MediaDetails;
	lang: string;
}

export const TorrentsModal = component$(
	({ title, year, isMovie, seasons, media, lang }: TorModalPros) => {
		const resource = useQueryParamsLoader();
		const torrentsStore = useStore({
			torrents: null as Torrent[] | null,
			year,
		});
		const getTorrentsToggle = $(
			async (name: string, year: number, isMovie: boolean) => {
				torrentsStore.torrents = null;
				torrentsStore.year = year;
				const torrModal = document.getElementById(
					"torrentsModal",
				) as HTMLDialogElement | null;
				if (torrModal) {
					torrModal.showModal();
					try {
						torrentsStore.torrents = await server$(() => {
							return getTorrents({ name: name, year: year, isMovie: isMovie });
						})();
					} catch (error) {
						torrentsStore.torrents = [];
						console.error(error);
					}
				}
			},
		);

		return (
			<>
				{seasons.length === 0 && (
					<button
						type="button"
						class="btn btn-outline btn-primary"
						onClick$={() => getTorrentsToggle(title, year, isMovie)}
					>
						{langTorrents(resource.value.lang)}
					</button>
				)}

				{seasons.length > 0 && (
					<div class="dropdown dropdown-end">
						<button type="button" class="btn btn-outline btn-primary">
							{langTorrents(resource.value.lang)}
							<HiChevronDownSolid />
						</button>
						<ul class="menu dropdown-content rounded-box bg-base-100 border-base-200 z-1 mt-2 w-60 border p-2 shadow-lg">
							{seasons.map((s) => {
								if (s.season_number === 0 || !s.air_date) {
									return null;
								}
								return (
									<li key={s.season_number}>
										<button
											type="button"
											class="text-left"
											onClick$={() => {
												const updatedYear = formatYear(s.air_date);
												getTorrentsToggle(title, updatedYear, isMovie);
											}}
										>
											{langSeason(lang)}
											<span class="ml-1">
												{" "}
												{s.season_number} ({formatYear(s.air_date)})
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				)}

				<dialog id="torrentsModal" class="modal">
					<div class="modal-box border-base-200 bg-base-100 max-h-[85vh] w-11/12 max-w-5xl overflow-y-auto border p-0 shadow-xl">
						<div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur">
							<h3 class="text-xl font-semibold">
								{langTorrents(resource.value.lang)}
							</h3>
							<form method="dialog">
								<button type="submit" class="btn btn-ghost btn-circle btn-sm">
									✕
								</button>
							</form>
						</div>
						<div class="p-5">
							<TorrentList
								torrents={torrentsStore.torrents}
								title={title}
								year={torrentsStore.year}
								isMovie={isMovie}
								movie={media}
								lang={lang}
							/>
						</div>
					</div>
					<form method="dialog" class="modal-backdrop">
						<button type="submit">close</button>
					</form>
				</dialog>
			</>
		);
	},
);
