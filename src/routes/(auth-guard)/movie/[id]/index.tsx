import { Resource, component$, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { HiXCircleSolid } from "@qwikest/icons/heroicons";
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
		} catch (_error) {
			throw new Error("error");
		}
	});
	return (
		<Resource
			value={useMoviedetails}
			onPending={() => <span class="loading loading-spinner" />}
			onRejected={(error) => (
				<div role="alert" class="alert alert-error">
					<HiXCircleSolid class="h-6 w-6" />
					<span>{error.message}</span>
				</div>
			)}
			onResolved={(value) => (
				<div
					class="mx-auto px-4 shadow-custom dark:shadow-custom-dark"
					style={`background: url(https://image.tmdb.org/t/p/original${value.movie.backdrop_path});background-size: cover;background-attachment: fixed;background-position: center; background-repeat: no-repeat;`}
				>
					<MovieDetails
						movie={value.movie}
						recMovies={value.recMovies}
						colMovies={value.colMovies}
						lang={value.lang}
					/>
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
			content: "Movie Details",
		},
	],
};
