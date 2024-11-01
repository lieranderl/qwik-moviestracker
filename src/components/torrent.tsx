import { $, component$, useContext } from "@builder.io/qwik";
import { ToastManagerContext } from "qwik-toasts";
import type { MediaDetails, Torrent } from "~/services/models";
import { addTorrent } from "~/services/torrserver";
import { formatRating } from "~/utils/fomat";

interface TorrentListProps {
	torrent: Torrent;
	movie: MediaDetails;
}

export const TorrentBlock = component$(
	({ torrent, movie }: TorrentListProps) => {
		const toastManager = useContext(ToastManagerContext);

		return (
			<>
				<div class="border-1 border-primary-700 dark:border-primary-100 my-2 rounded border p-2">
					<div class="flex flex-wrap items-center justify-between">
						<div class="mb-2 text-start font-bold">
							{torrent.K4 && <span class="badge badge-info mr-2">4K</span>}
							{torrent.DV && (
								<span class="badge badge-info mr-2">Dolby Vision</span>
							)}
							{torrent.HDR && !torrent.HDR10 && !torrent.HDR10plus && (
								<span class="badge badge-info mr-2">HDR</span>
							)}
							{torrent.HDR10 && !torrent.HDR10plus && (
								<span class="badge badge-info mr-2">HDR10</span>
							)}
							{torrent.HDR10plus && (
								<span class="badge badge-info mr-2">HDR10+</span>
							)}
						</div>

						<div class="flex flex-wrap items-center">
							<span class="badge badge-primary mr-2">
								{formatRating(torrent.Size)} Gb
							</span>

							<span class="mr-2 rounded bg-success px-2.5 py-0.5 text-sm">
								{torrent.Seeds}
							</span>

							<span class="mr-2 rounded bg-error px-2.5 py-0.5 text-sm">
								{torrent.Leeches}
							</span>
							<div class="my-2 flex space-x-1">
								<a href={torrent.Magnet} target="_blank" rel="noreferrer">
									<button type="button" class="btn btn-outline btn-sm">
										Open
									</button>
								</a>
								<button
									type="button"
									class="btn btn-outline btn-sm"
									onClick$={$(async () => {
										const torrserv =
											localStorage.getItem("selectedTorServer") || "";
										if (torrserv === "") {
											toastManager.addToast({
												message: "TorrServer hasn't been added!",
												type: "error",
												autocloseTime: 5000,
											});
											return;
										}
										try {
											await addTorrent(torrserv, torrent, movie);
											toastManager.addToast({
												message: "Torrent added!",
												type: "success",
												autocloseTime: 5000,
											});
										} catch (error) {
											console.log(error);
											toastManager.addToast({
												message: "Torrent hasn't been added!",
												type: "error",
												autocloseTime: 5000,
											});
										}
									})}
								>
									Add to TorrServer
								</button>
							</div>
						</div>
					</div>

					<div class="text-start">
						<div>{torrent.Name}</div>
						<div class="text-sm font-light">{torrent.Date.slice(0, 10)}</div>
					</div>
				</div>
			</>
		);
	},
);
