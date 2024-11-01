import { $, component$, useStore, useTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons";
import { TorrentList } from "~/components/torrent-list";
import { getTorrents } from "~/services/cloud-func-api";
import type { MediaDetails, Season, Torrent } from "~/services/models";
import { useQueryParamsLoader } from "~/shared/loaders";
import { formatYear } from "~/utils/fomat";
import { langTorrents } from "~/utils/languages";

export interface TorModalPros {
	title: string;
	year: number;
	isMovie: boolean;
	seasons: Season[];
	media: MediaDetails;
}

export const TorrentsModal = component$(
	({ title, year, isMovie, seasons, media }: TorModalPros) => {
		const resource = useQueryParamsLoader();
		const torrentsStore = useStore({
			torrents: null as Torrent[] | null,
			year: 0,
		});
		useTask$(async () => {
			torrentsStore.year = year;
		});
		const getTorrentsToggle = $(
			async (name: string, year: number, isMovie: boolean) => {
				torrentsStore.torrents = null;
				torrentsStore.year = year;
				const torrModal = document.getElementById("torrentsModal")
					? (document.getElementById("torrentsModal") as HTMLDialogElement)
					: null;
				if (torrModal) {
					torrModal.showModal();
					try {
						torrentsStore.torrents = await server$(() => {
							return getTorrents({ name: name, year: year, isMovie: isMovie });
						})();
					} catch (error) {
						torrentsStore.torrents = [];
						console.log(error);
					}
				}
			},
		);

		return (
			<>
				{seasons.length === 0 && (
					<button
						type="button"
						class="btn btn-accent btn-sm"
						onClick$={() => getTorrentsToggle(title, year, isMovie)}
					>
						{langTorrents(resource.value.lang)}
					</button>
				)}

				{seasons.length > 0 && (
					<>
						<div class="dropdown">
							<div tabIndex={0} role="button" class="btn btn-accent btn-sm m-1">
								{langTorrents(resource.value.lang)}
								<HiChevronDownSolid />
							</div>
							<ul
								// biome-ignore:
								tabIndex={0}
								class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
							>
								{seasons.map((s) => {
									if (s.season_number !== 0) {
										return (
											<>
												{s.air_date && (
													<li>
														<a
															onClick$={() => {
																const torrModal = document.getElementById(
																	"torrentsModal",
																)
																	? (document.getElementById(
																			"torrentsModal",
																		) as HTMLDialogElement)
																	: null;
																if (torrModal) {
																	torrModal.showModal();
																	const updatedYear = formatYear(
																		s.air_date ? s.air_date : "",
																	);
																	getTorrentsToggle(
																		title,
																		updatedYear,
																		isMovie,
																	);
																}
															}}
															// biome-ignore:
															href="#"
															class="block px-4 py-2"
														>
															Сезон
															<span class="ml-1">
																{" "}
																{s.season_number}(
																{formatYear(s.air_date ? s.air_date : "")})
															</span>
														</a>
													</li>
												)}
											</>
										);
									}
								})}
							</ul>
						</div>
					</>
				)}

				<dialog id="torrentsModal" class="modal">
					<div class="modal-box w-11/12 max-w-5xl">
						{/* <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form> */}
						<h3 class="text-xl font-semibold">
							{langTorrents(resource.value.lang)}
						</h3>
						<div class="p-6">
							<TorrentList
								torrents={torrentsStore.torrents}
								title={title}
								year={torrentsStore.year}
								isMovie={isMovie}
								movie={media}
							/>
						</div>
					</div>
					<form method="dialog" class="modal-backdrop">
						<button type="submit">close</button>
					</form>
				</dialog>

				{/* <div
          id="torrentsModal"
          tabIndex={0}
          aria-hidden="true"
          class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div class="relative w-full max-w-4xl max-h-full">
            <div class="relative bg-primary rounded-lg shadow dark:bg-primary-dark">
              <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-primary-800">
                <h3 class="text-xl font-semibold ">
                  {langTorrents(resource.value.lang)}
                </h3>
                <button
                  type="button"
                  class=" bg-transparent hover:bg-primary-100  rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-primary-800 "
                  data-modal-hide="torrentsModal"
                >
                  <svg
                    class="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
              </div>
              <div class="p-6">
                <TorrentList
                  torrents={torrentsStore.torrents}
                  title={title}
                  year={selectedYear}
                  isMovie={isMovie}
                  movie={media}
                />
              </div>
            </div>
          </div>
        </div> */}
			</>
		);
	},
);
