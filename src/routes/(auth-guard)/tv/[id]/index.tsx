import { Resource, component$, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { HiXCircleSolid } from "@qwikest/icons/heroicons";
import { TvDetails } from "~/components/media-details/tv-details";
import type { TvFull, TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMediaDetails, getMediaRecom } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";

export const useContentLoader = routeLoader$(async (event) => {
	const id = Number.parseInt(event.params.id, 10);
	return { id };
});

export default component$(() => {
	const lang = useQueryParamsLoader().value.lang;
	const id = useContentLoader().value.id;

	const useTvdetails = useResource$(async () => {
		try {
			const [
				tv,
				// simTv,
				recTv,
			] = await Promise.all([
				getMediaDetails({
					id,
					language: lang,
					type: MediaType.Tv,
				}) as Promise<TvFull>,
				getMediaRecom({
					id: id,
					language: lang,
					type: MediaType.Tv,
					query: "recommendations",
				}) as Promise<TvShort[]>,
			]);
			return { tv, recTv, lang };
		} catch (error) {
			console.error(error);
			throw new Error("error");
		}
	});

	return (
		<Resource
			value={useTvdetails}
			onPending={() => <span class="loading loading-spinner" />}
			onRejected={(error) => (
				<div role="alert" class="alert alert-error">
					<HiXCircleSolid class="h-6 w-6" />
					<span>{error.message}</span>
				</div>
			)}
			onResolved={(value) => (
				<div
					class={`shadow-theme animate-fadeIn mx-auto bg-cover bg-fixed bg-center bg-no-repeat px-4 pb-10`}
					style={`background-image: url(https://image.tmdb.org/t/p/original${value.tv.backdrop_path});`}
				>
					<div class="animate-slideInFromLeft">
						<TvDetails tv={value.tv} recTv={value.recTv} lang={value.lang} />
					</div>
				</div>
			)}
		/>
	);
});

export const head: DocumentHead = {
	title: "Moviestracker",
	meta: [
		{
			name: "description",
			content: "Tv Show Details",
		},
	],
};
