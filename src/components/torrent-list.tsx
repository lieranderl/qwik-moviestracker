import { $, component$, useStore, useTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { setValue, useForm } from "@modular-forms/qwik";
import { HiMagnifyingGlassOutline } from "@qwikest/icons/heroicons";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MovieDetails, Torrent } from "~/services/models";
import { filterAndSortTorrents } from "~/utils/filter-utils";
import {
	langDate,
	langFound,
	langLeeches,
	langNotFound,
	langSeeds,
	langSize,
	langSortOn,
	langTorrentov,
} from "~/utils/languages";
import { TorrentBlock } from "./torrent";

type SearchTorrForm = {
	name: string;
	year: number;
};

export type TorrentListProps = {
	torrents: Torrent[] | null;
	title: string;
	year: number;
	isMovie: boolean;
	movie: MovieDetails;
	lang: string;
};

export const TorrentList = component$(
	({ torrents, isMovie, title, year, movie, lang }: TorrentListProps) => {
		const sortAttrib = [
			{ value: "Date", text: langDate(lang) },
			{ value: "Size", text: langSize(lang) },
			{ value: "Seeds", text: langSeeds(lang) },
			{ value: "Leeches", text: langLeeches(lang) },
		];

		const initTorrents = useStore({ value: torrents as Torrent[] | null });
		const sortedTorrents = useStore({ value: null as Torrent[] | null });
		const sortFilterStore = useStore({
			selectedSort: "Date" as string,
			filterChecked: false as boolean,
			k4: false as boolean,
			hdr: false as boolean,
			hdr10: false as boolean,
			hdr10plus: false as boolean,
			dv: false as boolean,
		});

		const filterTorrents = $(() => {
			if (initTorrents.value) {
				sortedTorrents.value = filterAndSortTorrents(
					initTorrents.value,
					sortFilterStore,
				);
			}
		});

		const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
			loader: { value: { name: title, year: year } },
		});

		const handleSubmit = $(async (values: SearchTorrForm) => {
			sortedTorrents.value = null;
			try {
				const torrents = await server$(
					({ name, year, isMovie }: getTorrentsType) => {
						return getTorrents({ name: name, year: year, isMovie: isMovie });
					},
				)({
					name: values.name,
					year: values.year,
					isMovie: isMovie,
				});
				if (torrents.length > 0) {
					initTorrents.value = torrents;
					return;
				}
			} catch (error) {
				console.error(error);
				sortedTorrents.value = [];
			}

			sortedTorrents.value = [];
		});

		useTask$((ctx) => {
			ctx.track(() => year);
			sortedTorrents.value = null;
			setValue(searchTorrForm, "year", year);
		});

		useTask$((ctx) => {
			ctx.track(() => torrents);
			initTorrents.value = torrents;
		});

		useTask$((ctx) => {
			ctx.track(() => initTorrents.value);
			ctx.track(() => sortFilterStore.filterChecked);
			filterTorrents();
		});

		return (
			<>
				{sortedTorrents.value !== null && (
					<div class="flex flex-wrap">
						<div class="me-4 flex items-center justify-start text-nowrap">
							<div class="mr-2">{langSortOn(lang)}</div>
							<select
								onChange$={(_, e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									sortFilterStore.selectedSort = e.value;
								}}
								class="select select-sm mr-2"
							>
								{sortAttrib.map((attrib) => (
									<option value={attrib.value} key={attrib.value}>
										{attrib.text}
									</option>
								))}
							</select>
						</div>

						<Form onSubmit$={handleSubmit} class="my-4 flex items-center">
							<div class="join">
								<Field name="name">
									{(field, props) => (
										<div>
											<input
												{...props}
												type="text"
												placeholder="название"
												class="input input-sm join-item w-48"
											/>
											{field.error && (
												<div class="text-error text-xs">{field.error}</div>
											)}
										</div>
									)}
								</Field>
								<Field name="year" type="number">
									{(field, props) => (
										<div>
											<input
												{...props}
												type="number"
												class="input input-sm join-item mr-2 w-20"
												placeholder="год"
											/>
											{field.error && (
												<div class="text-error text-xs">{field.error}</div>
											)}
										</div>
									)}
								</Field>
							</div>

							<button
								type="submit"
								disabled={searchTorrForm.invalid}
								class="btn btn-circle text-4xl"
							>
								<HiMagnifyingGlassOutline class="h-6 w-6" />
							</button>
						</Form>
					</div>
				)}

				{sortedTorrents.value !== null && (
					<div class="flex items-center">
						<div class="mr-2">
							<label
								class="label cursor-pointer"
								onChange$={(e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									if (e.target) {
										sortFilterStore.k4 = (e.target as HTMLInputElement).checked;
									}
								}}
							>
								<input type="checkbox" class="checkbox checkbox-sm rounded" />
								<span class="ms-2">4K</span>
							</label>
						</div>
						<div class="mr-2">
							<label
								class="label cursor-pointer"
								onChange$={(e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									if (e.target) {
										sortFilterStore.hdr = (
											e.target as HTMLInputElement
										).checked;
									}
								}}
							>
								<input type="checkbox" class="checkbox checkbox-sm rounded" />
								<span class="ms-2">HDR</span>
							</label>
						</div>
						<div class="mr-2">
							<label
								class="label cursor-pointer"
								onChange$={(e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									if (e.target) {
										sortFilterStore.hdr10 = (
											e.target as HTMLInputElement
										).checked;
									}
								}}
							>
								<input type="checkbox" class="checkbox checkbox-sm rounded" />
								<span class="ms-2">HDR10</span>
							</label>
						</div>
						<div class="mr-2">
							<label
								class="label cursor-pointer"
								onChange$={(e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									if (e.target) {
										sortFilterStore.hdr10plus = (
											e.target as HTMLInputElement
										).checked;
									}
								}}
							>
								<input type="checkbox" class="checkbox checkbox-sm rounded" />
								<span class="ms-2">HDR10+</span>
							</label>
						</div>
						<div class="mr-2">
							<label
								class="label cursor-pointer"
								onChange$={(e) => {
									sortFilterStore.filterChecked =
										!sortFilterStore.filterChecked;
									if (e.target) {
										sortFilterStore.dv = (e.target as HTMLInputElement).checked;
									}
								}}
							>
								<input type="checkbox" class="checkbox checkbox-sm rounded" />
								<span class="ms-2">DV</span>
							</label>
						</div>
					</div>
				)}

				<section class="my-4">
					{sortedTorrents.value === null && (
						<span class="loading loading-spinner loading-md" />
					)}
					{sortedTorrents.value !== null &&
						sortedTorrents.value.length === 0 && (
							<div>{langNotFound(lang)}</div>
						)}
					{sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
						<div>
							{langFound(lang)} {sortedTorrents.value.length}{" "}
							{langTorrentov(lang)}
						</div>
					)}
				</section>

				<section class="my-4">
					{sortedTorrents.value?.map((torrent) => (
						<TorrentBlock
							torrent={torrent}
							movie={movie}
							key={torrent.Magnet}
						/>
					))}
				</section>
			</>
		);
	},
);
