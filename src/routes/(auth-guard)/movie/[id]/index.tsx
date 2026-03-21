import { component$, Resource, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { DetailPageShell } from "~/components/detail-page-layout";
import { ErrorState, LoadingState } from "~/components/page-feedback";
import { MovieDetails } from "~/components/media-details/movie-details";
import type { MovieFull, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import {
	getCollectionMovies,
	getMediaDetails,
	getMediaRecom,
} from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";

export const useContentLoader = routeLoader$(async (event) => {
	const id = Number.parseInt(event.params.id, 10);
	return { id };
});

export default component$(() => {
	const lang = useQueryParamsLoader().value.lang;
	const id = useContentLoader().value.id;

	const useMoviedetails = useResource$(async () => {
		try {
			const [movie, recMovies] = await Promise.all([
				getMediaDetails({
					id,
					language: lang,
					type: MediaType.Movie,
				}) as Promise<MovieFull>,
				getMediaRecom({
					id: id,
					language: lang,
					type: MediaType.Movie,
					query: "recommendations",
				}) as Promise<MovieShort[]>,
			]);
			if (movie.belongs_to_collection) {
				const colMovies = await getCollectionMovies({
					id: movie.belongs_to_collection.id,
					language: lang,
				});
				return {
					movie,
					recMovies,
					colMovies,
					lang,
				};
			}
			const colMovies = [] as MovieShort[];
			return { movie, recMovies, colMovies, lang };
		} catch {
			throw new Error("error");
		}
	});
	return (
		<Resource
			value={useMoviedetails}
			onPending={() => (
				<LoadingState
					title="Loading movie details"
					description="We are pulling ratings, metadata, and related titles."
				/>
			)}
			onRejected={() => (
				<ErrorState
					title="Movie details are unavailable"
					description="Please refresh the page or return to the previous screen."
				/>
			)}
			onResolved={(value) => (
				<DetailPageShell backdropPath={value.movie.backdrop_path}>
					<MovieDetails
						movie={value.movie}
						recMovies={value.recMovies}
						colMovies={value.colMovies}
						lang={value.lang}
					/>
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
			content: "Movie Details",
		},
	],
};
