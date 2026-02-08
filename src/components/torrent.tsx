import { $, component$, useContext } from "@builder.io/qwik";
import { ToastManagerContext } from "qwik-toasts";
import type { MediaDetails, Torrent } from "~/services/models";
import { addTorrent } from "~/services/torrserver";
import { formatRating } from "~/utils/format";

interface TorrentListProps {
	torrent: Torrent;
	movie: MediaDetails;
}

export const TorrentBlock = component$(
	({ torrent, movie }: TorrentListProps) => {
		const toastManager = useContext(ToastManagerContext);

		return (
			<div class="card card-border border-base-300 bg-base-100 my-2 shadow-sm">
				<div class="card-body">
					<div class="flex flex-wrap items-center justify-between">
						<div class="mb-2 text-start font-bold text-nowrap">
							{torrent.K4 ? (
								<span class="badge badge-info badge-soft mr-2">4K</span>
							) : (
								<span class="badge badge-info badge-soft mr-2">FHD</span>
							)}
							{torrent.DV && (
								<span class="badge badge-info badge-soft mr-2">
									Dolby Vision
								</span>
							)}
							{torrent.HDR && !torrent.HDR10 && !torrent.HDR10plus && (
								<span class="badge badge-info badge-soft mr-2">HDR</span>
							)}
							{torrent.HDR10 && !torrent.HDR10plus && (
								<span class="badge badge-info badge-soft mr-2">HDR10</span>
							)}
							{torrent.HDR10plus && (
								<span class="badge badge-info badge-soft mr-2">HDR10+</span>
							)}
						</div>

						<div class="flex flex-wrap items-center text-nowrap">
							<span class="badge badge-primary badge-soft mr-2">
								{formatRating(torrent.Size)} Gb
							</span>

							<span class="badge badge-success badge-soft mr-1 rounded">
								{torrent.Seeds}
							</span>

							<span class="badge badge-error badge-soft mr-6 rounded">
								{torrent.Leeches}
							</span>
							<div class="my-2 flex space-x-1">
								<a href={torrent.Magnet} target="_blank" rel="noreferrer">
									<button type="button" class="btn btn-accent btn-sm btn-soft">
										Open
									</button>
								</a>
								<button
									type="button"
									class="btn btn-accent btn-sm btn-soft"
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
			</div>
		);
	},
);
