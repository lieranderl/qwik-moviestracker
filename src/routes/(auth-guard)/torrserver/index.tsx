// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
import {
	$,
	component$,
	useContext,
	useOnWindow,
	useSignal,
	useStore,
	useTask$,
} from "@builder.io/qwik";
import { setValue, useForm } from "@modular-forms/qwik";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { LuMagnet } from "@qwikest/icons/lucide";
import { ToastManagerContext } from "qwik-toasts";
import type { InferInput } from "valibot";
import { url, object, pipe, string } from "valibot";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TSResult } from "~/services/models";
import {
	listTorrent,
	removeTorrent,
	torrServerEcho,
} from "~/services/torrserver";
import { useQueryParamsLoader } from "~/shared/loaders";
import { langAddNewTorrServerURL, langNoResults } from "~/utils/languages";

export const torrServerSchema = object({
	ipaddress: pipe(string(), url("Please provide a valid URL!")),
});

export type torrServerForm = InferInput<typeof torrServerSchema>;

export default component$(() => {
	const resource = useQueryParamsLoader();
	const toastManager = useContext(ToastManagerContext);
	const selectedTorServer = useSignal("");
	const isLoading = useSignal(false);
	const torrServerStore = useStore({ list: [] as string[] });
	const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
		loader: { value: { ipaddress: "" } },
		// action: useTorrSearchAction(),
		// validate: valiForm$(torrServerSchema),
	});

	const isCheckingTorrServer = useSignal(false);
	const torrentsSig = useSignal([] as TSResult[]);

	// biome-ignore:
	const addTorrserver = $(async (values: torrServerForm): Promise<any> => {
		isLoading.value = true;
		if (torrServerStore.list.includes(values.ipaddress)) {
			isLoading.value = false;
			setValue(newTorrServerForm, "ipaddress", "");
			toastManager.addToast({
				message: `TorrServer ${values.ipaddress} is already in the list!`,
				type: "error",
				autocloseTime: 5000,
			});
			return;
		}
		torrServerStore.list.push(values.ipaddress);
		if (torrServerStore.list.length === 1) {
			selectedTorServer.value = values.ipaddress;
		}
		localStorage.setItem(
			"torrServerList",
			JSON.stringify(torrServerStore.list),
		);
		toastManager.addToast({
			message: `Torrserver ${values.ipaddress} has been added.`,
			type: "success",
			autocloseTime: 5000,
		});
		setValue(newTorrServerForm, "ipaddress", "");
		isLoading.value = false;
	});

	useOnWindow(
		"DOMContentLoaded",
		$(() => {
			const tlist = localStorage.getItem("torrServerList");
			if (tlist) {
				torrServerStore.list = JSON.parse(tlist) || [];
			} else {
				torrServerStore.list = [];
			}
			selectedTorServer.value = localStorage.getItem("selectedTorServer") || "";
			if (selectedTorServer.value === "") {
				localStorage.setItem(
					"selectedTorServer",
					torrServerStore.list[0] || "",
				);
				localStorage.setItem("torrServerList", JSON.stringify([]));
			} else {
				if (torrServerStore.list.length === 0) {
					localStorage.setItem(
						"torrServerList",
						JSON.stringify([selectedTorServer.value]),
					);
				} else {
					localStorage.setItem(
						"torrServerList",
						JSON.stringify(torrServerStore.list),
					);
				}
			}
		}),
	);

	useTask$(async (ctx) => {
		ctx.track(() => selectedTorServer.value);
		torrentsSig.value = [];

		if (!selectedTorServer.value) {
			return;
		}
		try {
			isCheckingTorrServer.value = true;
			const version = await torrServerEcho(selectedTorServer.value);
			toastManager.addToast({
				message: `Connected to server ${selectedTorServer.value} Vesion: ${version}`,
				type: "success",
				autocloseTime: 5000,
			});
			localStorage.setItem("selectedTorServer", selectedTorServer.value);
			isCheckingTorrServer.value = false;
			torrentsSig.value = await listTorrent(selectedTorServer.value);
		} catch (error) {
			console.error(error);
			toastManager.addToast({
				message: `Failed to reach TorrServer ${selectedTorServer.value}`,
				type: "error",
				autocloseTime: 5000,
			});
			isCheckingTorrServer.value = false;
		}
	});

	return (
		<div class="container mx-auto px-4 pt-[64px]">
			<div class="my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
				<div class="col-span-2 col-start-1 md:col-start-3">
					<Form onSubmit$={addTorrserver} class="flex items-start justify-end">
						<Field name="ipaddress">
							{(field, props) => (
								<div>
									<input
										{...props}
										type="text"
										value={field.value}
										placeholder={langAddNewTorrServerURL(resource.value.lang)}
										class="input input-sm input-bordered w-72 focus:outline-none"
									/>
									{field.error && (
										<div class="text-error text-xs">{field.error}</div>
									)}
								</div>
							)}
						</Field>
						<div class="ms-2 mb-3">
							<button
								type="submit"
								disabled={newTorrServerForm.invalid}
								class="btn btn-success btn-sm"
							>
								<HiPlusSolid class="text-lg" />
							</button>
						</div>
					</Form>
				</div>

				<div class="col-span-2 col-start-1 md:col-start-3">
					<section class="my-2 flex items-center justify-end">
						<select
							name=""
							id="attrib"
							value={selectedTorServer.value}
							class="select select-bordered select-sm w-72 focus:outline-none"
							onChange$={(_, e) => {
								selectedTorServer.value = e.value;
							}}
						>
							{torrServerStore.list.map((item) => (
								<option value={item} key={item}>
									{item}
								</option>
							))}
						</select>
						<div class="ms-2">
							<button
								type="submit"
								disabled={newTorrServerForm.invalid}
								class="btn btn-error btn-sm"
								onClick$={() => {
									const index = torrServerStore.list.indexOf(
										selectedTorServer.value,
									);
									if (index > -1) {
										torrServerStore.list.splice(index, 1);
										localStorage.setItem(
											"torrServerList",
											JSON.stringify(torrServerStore.list),
										);
										toastManager.addToast({
											message: `Torrserver ${selectedTorServer.value} has been deleted.`,
											type: "success",
											autocloseTime: 5000,
										});
										selectedTorServer.value = "";
										localStorage.setItem("selectedTorServer", "");
									}
								}}
							>
								<HiMinusSolid class="text-lg" />
							</button>
						</div>
					</section>
				</div>
			</div>
			<section>
				{isCheckingTorrServer.value && (
					<span class="loading loading-spinner loading-lg" />
				)}
				<MediaGrid title={""}>
					{torrentsSig.value.length > 0 &&
						torrentsSig.value.map((t) => {
							if (!t.data) {
								return;
							}
							const m = JSON.parse(t.data);
							return (
								<div key={t.hash} class="indicator relative">
									<a
										href={`magnet:?xt=urn:btih:${t.hash}`}
										target="_blank"
										class="transition-scale bg-info absolute top-[0.85rem] left-1 z-10 scale-[85%] cursor-pointer rounded-full border-1 p-1 duration-300 ease-in-out hover:scale-[105%]"
										rel="noreferrer"
									>
										<LuMagnet class="text-2xl" />
									</a>
									<button
										type="button"
										onClick$={async () => {
											const torrserv =
												localStorage.getItem("selectedTorServer") || "";
											if (torrserv === "") {
												toastManager.addToast({
													message: "TorrServer has not been added!",
													type: "error",
													autocloseTime: 5000,
												});
												return;
											}
											try {
												try {
													await removeTorrent(torrserv, t.hash);
												} catch (error) {
													console.error(error);
												}

												toastManager.addToast({
													message: "Torrent has been deleted!",
													type: "success",
													autocloseTime: 5000,
												});

												torrentsSig.value = await listTorrent(
													selectedTorServer.value,
												);
											} catch (error) {
												console.error(error);
												const e = error as Error;
												toastManager.addToast({
													message: e.message || "Unable to delete torrent!",
													type: "error",
													autocloseTime: 5000,
												});
											}
										}}
										class="transition-scale btn btn-circle btn-error btn-sm absolute top-4 -right-1 z-10 scale-[90%] duration-300 ease-in-out hover:scale-[110%]"
									>
										<HiMinusSolid class="text-md" />
									</button>

									{m.movie && (
										<a
											href={
												m.movie.seasons
													? `/tv/${m.movie.id}`
													: `/movie/${m.movie.id}`
											}
											target="_blank"
											rel="noreferrer"
										>
											<MediaCard
												title={m.movie.title || m.movie.name || t.title}
												width={300}
												rating={m.movie ? m.movie.vote_average : null}
												year={
													m.movie
														? Number.parseInt(
																m.movie.release_date
																	? m.movie.release_date?.substring(0, 4)
																	: m.movie.first_air_date?.substring(0, 4),
																10,
															)
														: 0
												}
												picfile={t.poster}
												isPerson={false}
												isHorizontal={false}
											/>
										</a>
									)}
								</div>
							);
						})}
				</MediaGrid>
				{torrentsSig.value.length === 0 && !isCheckingTorrServer.value && (
					<div>{langNoResults(resource.value.lang)}</div>
				)}
			</section>
		</div>
	);
});
