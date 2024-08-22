import {
	Resource,
	component$,
	useResource$,
	useSignal,
} from "@builder.io/qwik";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { MediaType } from "~/services/models";
import { search } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";
import {
	langNoResults,
	langSearch,
	langSearchResults,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export default component$(() => {
	const resource = useQueryParamsLoader();
	const phrase = useSignal("");
	const searchResource = useResource$(async (ctx) => {
		ctx.track(() => phrase.value);
		try {
			const s = await search({
				query: phrase.value,
				language: resource.value.lang,
				page: 1,
			});
			return s;
		} catch (error) {
			console.error(error);
			throw new Error("Search failed");
		}

	});

	return (
		<div class="container mx-auto px-4 pt-[80px] text-center">
			<input
				type="text"
				class="input input-bordered mb-4 w-[60%]"
				placeholder={langSearch(resource.value.lang)}
				onKeyDown$={(e, elem) => {
					if (e.key === "Enter") {
						if (elem.value.length > 2) {
							phrase.value = elem.value;
						}
					}

				}}
			/>

			<Resource
				value={searchResource}
				onPending={() => (
					<div class="my-2">
						<span class="loading loading-spinner loading-lg" />
					</div>
				)}
				onRejected={(error) => (
					<div class="alert alert-error">Error: {error.message}</div>
				)}
				onResolved={(movies) => {
					if (movies.total_results > 0) {
						return (
							<div class="my-2">
								<MediaGrid title={langSearchResults(resource.value.lang)}>
									{movies.total_results > 0 &&
										movies.results.map((m) => (
											<a
												key={m.id}
												class="text-left"
												href={paths.media(
													m.media_type ?? ("movie" as MediaType),
													m.id,
													resource.value.lang,
												)}
											>
												<MediaCard
													title={
														m.media_type === MediaType.Movie
															? m.title ?? ""
															: m.name ?? ""
													}
													width={300}
													rating={m.vote_average ? m.vote_average : 0}
													year={
														m.media_type === MediaType.Movie
															? Number.parseInt(
																m.release_date
																	? m.release_date.substring(0, 4)
																	: "0",
																10,
															)
															: Number.parseInt(
																"first_air_date" in m
																	? m.first_air_date
																		? m.first_air_date.substring(0, 4)
																		: "0"
																	: "",
																10,
															)
													}
													picfile={
														m.media_type !== MediaType.Movie &&
															m.media_type !== MediaType.Tv
															? m.profile_path
															: m.poster_path
													}
													isPerson={
														!!(
															m.media_type !== MediaType.Movie &&
															m.media_type !== MediaType.Tv
														)
													}
													isHorizontal={false}
												/>
											</a>
										))}
								</MediaGrid>
							</div>
						);
					}
					return (
						<div class="my-2 text-sm">{langNoResults(resource.value.lang)}</div>
					);
				}}
			/>
		</div>
	);
});
