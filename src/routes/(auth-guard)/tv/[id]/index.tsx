import { component$, Resource, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState, LoadingState } from "~/components/page-feedback";
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
			onPending={() => (
				<LoadingState
					title="Loading TV details"
					description="We are fetching seasons, cast, and streaming metadata."
				/>
			)}
			onRejected={() => (
				<ErrorState
					title="TV details are unavailable"
					description="Please refresh the page or return to the previous screen."
				/>
			)}
			onResolved={(value) => (
				<DetailPageShell backdropPath={value.tv.backdrop_path}>
					<TvDetails tv={value.tv} recTv={value.recTv} lang={value.lang} />
				</DetailPageShell>
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
