import { component$, Resource, useResource$ } from "@builder.io/qwik";
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
		} catch {
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
				<div class="relative min-h-screen w-full">
					<div
						class="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-35 blur-xs"
						style={`background-image: url(https://image.tmdb.org/t/p/original${value.movie.backdrop_path});`}
					/>
					<div class="fixed inset-0 -z-10 bg-gradient-to-t from-base-100 via-base-100/80 to-transparent" />

					<div class="animate-slideInFromLeft relative z-10 px-4 md:px-8">
						<MovieDetails
							movie={value.movie}
							recMovies={value.recMovies}
							colMovies={value.colMovies}
							lang={value.lang}
						/>
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
			content: "Movie Details",
		},
	],
};
