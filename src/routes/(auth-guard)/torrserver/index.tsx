import {
	$,
	component$,
	type Signal,
	useContext,
	useSignal,
	useTask$,
	useVisibleTask$,
} from "@builder.io/qwik";
import { setValue, useForm } from "@modular-forms/qwik";
import { HiMinusSolid, HiPlusSolid } from "@qwikest/icons/heroicons";
import { LuMagnet } from "@qwikest/icons/lucide";
import { ToastManagerContext } from "qwik-toasts";
import type { InferInput } from "valibot";
import { object, pipe, string, url } from "valibot";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TSResult } from "~/services/models";
import {
	listTorrent,
	removeTorrent,
	torrServerEcho,
} from "~/services/torrserver";
import { useQueryParamsLoader } from "~/shared/loaders";
import { formatYear } from "~/utils/format";
import { langAddNewTorrServerURL, langNoResults } from "~/utils/languages";

const TORR_SERVER_LIST_KEY = "torrServerList";
const SELECTED_TORR_SERVER_KEY = "selectedTorServer";

export const torrServerSchema = object({
	ipaddress: pipe(string(), url("Please provide a valid URL!")),
});

export type torrServerForm = InferInput<typeof torrServerSchema>;

function normalizeServer(value: string): string {
	return value.trim();
}

function normalizeServerList(list: string[]): string[] {
	return [...new Set(list.map(normalizeServer).filter(Boolean))];
}

function resolveSelectedServer(
	list: string[],
	preferredServer: string,
): string {
	const normalizedPreferredServer = normalizeServer(preferredServer);
	if (normalizedPreferredServer && list.includes(normalizedPreferredServer)) {
		return normalizedPreferredServer;
	}
	return list[0] || "";
}

function parseStoredServerList(rawList: string | null): string[] {
	if (!rawList) {
		return [];
	}
	try {
		const parsedList = JSON.parse(rawList) as unknown;
		if (!Array.isArray(parsedList)) {
			return [];
		}
		return parsedList.filter(
			(item): item is string =>
				typeof item === "string" && normalizeServer(item).length > 0,
		);
	} catch (error) {
		console.error("Failed to parse torrServerList", error);
		const fallbackServer = normalizeServer(rawList);
		return fallbackServer ? [fallbackServer] : [];
	}
}

function getNormalizedServersState(
	servers: string[],
	preferredServer: string,
): { list: string[]; selected: string } {
	const normalizedList = normalizeServerList(servers);
	const nextSelected = resolveSelectedServer(normalizedList, preferredServer);

	return { list: normalizedList, selected: nextSelected };
}

function persistServersStorage(list: string[], selected: string): void {
	localStorage.setItem(TORR_SERVER_LIST_KEY, JSON.stringify([...list]));
	localStorage.setItem(SELECTED_TORR_SERVER_KEY, normalizeServer(selected));
}

function applyServersState(
	servers: string[],
	preferredServer: string,
	listSig: Signal<string[]>,
	selectedSig: Signal<string>,
): { list: string[]; selected: string } {
	const nextState = getNormalizedServersState(servers, preferredServer);
	listSig.value = nextState.list;
	selectedSig.value = nextState.selected;
	return nextState;
}

export default component$(() => {
	const resource = useQueryParamsLoader();
	const toastManager = useContext(ToastManagerContext);
	const selectedTorServer = useSignal("");
	const torrServerList = useSignal<string[]>([]);
	const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
		loader: { value: { ipaddress: "" } },
	});

	const isCheckingTorrServer = useSignal(false);
	const torrentsSig = useSignal([] as TSResult[]);

	const addTorrserver = $(async (values: torrServerForm): Promise<void> => {
		const newServer = normalizeServer(values.ipaddress);
		if (torrServerList.value.includes(newServer)) {
			setValue(newTorrServerForm, "ipaddress", "");
			toastManager.addToast({
				message: `TorrServer ${newServer} is already in the list!`,
				type: "error",
				autocloseTime: 5000,
			});
			return;
		}
		const nextState = applyServersState(
			[...torrServerList.value, newServer],
			newServer,
			torrServerList,
			selectedTorServer,
		);
		persistServersStorage(nextState.list, nextState.selected);
		toastManager.addToast({
			message: `Torrserver ${newServer} has been added.`,
			type: "success",
			autocloseTime: 5000,
		});
		setValue(newTorrServerForm, "ipaddress", "");
	});

	// eslint-disable-next-line qwik/no-use-visible-task
	useVisibleTask$(() => {
		const parsedList = parseStoredServerList(
			localStorage.getItem(TORR_SERVER_LIST_KEY),
		);
		const storedSelected =
			normalizeServer(localStorage.getItem(SELECTED_TORR_SERVER_KEY) || "") ||
			"";
		const nextList = [...parsedList];
		if (nextList.length === 0 && storedSelected) {
			nextList.push(storedSelected);
		}
		const nextState = applyServersState(
			nextList,
			storedSelected,
			torrServerList,
			selectedTorServer,
		);
		persistServersStorage(nextState.list, nextState.selected);
	});

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
		<div class="container mx-auto px-4 pt-16">
			<div class="my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
				<div class="col-span-2 col-start-1 md:col-start-3">
					<Form onSubmit$={addTorrserver} class="flex items-start justify-end">
						<Field name="ipaddress">
							{(field, props) => (
								<div>
									<input
										{...props}
										type="text"
										placeholder={langAddNewTorrServerURL(resource.value.lang)}
										class="input input-bordered input-sm w-72"
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
							value={selectedTorServer.value}
							class="select select-bordered select-sm w-72"
							onChange$={(_, e) => {
								selectedTorServer.value = normalizeServer(e.value);
								persistServersStorage(
									torrServerList.value,
									selectedTorServer.value,
								);
							}}
						>
							{torrServerList.value.length === 0 && (
								<option value="">No TorrServer added</option>
							)}
							{torrServerList.value.map((item) => (
								<option value={item} key={item}>
									{item}
								</option>
							))}
						</select>
						<div class="ms-2">
							<button
								type="button"
								disabled={!selectedTorServer.value}
								class="btn btn-error btn-sm"
								onClick$={() => {
									const currentServer = selectedTorServer.value;
									if (!currentServer) {
										return;
									}
									const nextList = torrServerList.value.filter(
										(server) => server !== currentServer,
									);
									if (nextList.length !== torrServerList.value.length) {
										const nextState = applyServersState(
											nextList,
											nextList[0] || "",
											torrServerList,
											selectedTorServer,
										);
										persistServersStorage(nextState.list, nextState.selected);
										toastManager.addToast({
											message: `Torrserver ${currentServer} has been deleted.`,
											type: "success",
											autocloseTime: 5000,
										});
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
								return null;
							}
							const m = JSON.parse(t.data);
							return (
								<div key={t.hash} class="indicator relative">
									<a
										href={`magnet:?xt=urn:btih:${t.hash}`}
										target="_blank"
										class="btn btn-circle btn-info btn-sm absolute top-[0.85rem] left-1 z-10 scale-[85%] transition-transform duration-300 ease-in-out hover:scale-[105%]"
										rel="noreferrer"
									>
										<LuMagnet class="text-2xl" />
									</a>
									<button
										type="button"
										onClick$={async () => {
											const torrserv = selectedTorServer.value;
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
														? formatYear(
																m.movie.release_date ?? m.movie.first_air_date,
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
