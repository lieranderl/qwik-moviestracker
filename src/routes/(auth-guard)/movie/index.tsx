import { Resource, component$, useResource$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { HiXCircleSolid } from "@qwikest/icons/heroicons";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import type { MediaShort, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withBackdrop } from "~/services/tmdb";
import { useQueryParamsLoader } from "~/shared/loaders";
import {
	langLatestDolbyVisionMovies,
	langLatestHDR10Movies,
	langLatestMovies,
	langTrendingMovies,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export default component$(() => {
	// const resource = useContentLoader();
	const lang = useQueryParamsLoader().value.lang;
	const useMovies = useResource$(async () => {
		try {
			const [m, torMovies, hdrMovies, dolbyMovies] = await Promise.all([
				getTrendingMedia({
					page: 1,
					language: lang,
					type: MediaType.Movie,
					needbackdrop: true,
				}),
				withBackdrop(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: 20,
						language: lang,
						dbName: DbType.LastMovies,
					})) as MediaShort[],
				),
				withBackdrop(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: 20,
						language: lang,
						dbName: DbType.HDR10,
					})) as MediaShort[],
				),
				withBackdrop(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: 20,
						language: lang,
						dbName: DbType.DV,
					})) as MediaShort[],
				),
			]);
			const movies = m as MovieShort[];
			return {
				movies,
				torMovies,
				hdrMovies,
				dolbyMovies,
				lang,
			};
		} catch {
			throw new Error("error");
		}
	});

	return (
		<>
			<div class="container mx-auto px-4 pt-[64px]">
				<Resource
					value={useMovies}
					onPending={() => <span class="loading loading-spinner" />}
					onRejected={(error) => (
						<div role="alert" class="alert alert-error">
							<HiXCircleSolid class="h-6 w-6" />
							<span>{error.message}</span>
						</div>
					)}
					onResolved={(value) => (
						<div>
							<MediaCarousel
								title={langLatestMovies(lang)}
								type={MediaType.Movie}
								category="updated"
								lang={lang}
							>
								{value.torMovies.map((m) => (
									<div class="carousel-item" key={m.id}>
										<a href={paths.media(MediaType.Movie, m.id, lang)}>
											<MediaCard
												title={m.title ? m.title : ""}
												width={500}
												rating={m.vote_average ? m.vote_average : 0}
												year={Number.parseInt(
													m.release_date ? m.release_date.substring(0, 4) : "0",
													10,
												)}
												picfile={m.backdrop_path}
												isPerson={false}
												isHorizontal={true}
											/>
										</a>
									</div>
								))}
							</MediaCarousel>

							<MediaCarousel
								title={langLatestHDR10Movies(lang)}
								type={MediaType.Movie}
								category="hdr10"
								lang={lang}
							>
								{value.hdrMovies.map((m) => (
									<div class="carousel-item" key={m.id}>
										<a href={paths.media(MediaType.Movie, m.id, lang)}>
											<MediaCard
												title={m.title ? m.title : ""}
												width={500}
												rating={m.vote_average ? m.vote_average : 0}
												year={Number.parseInt(
													m.release_date ? m.release_date.substring(0, 4) : "0",
													10,
												)}
												picfile={m.backdrop_path}
												isPerson={false}
												isHorizontal={true}
											/>
										</a>
									</div>
								))}
							</MediaCarousel>

							<MediaCarousel
								title={langLatestDolbyVisionMovies(lang)}
								type={MediaType.Movie}
								category="dolbyvision"
								lang={lang}
							>
								{value.dolbyMovies.map((m) => (
									<div class="carousel-item" key={m.id}>
										<a href={paths.media(MediaType.Movie, m.id, lang)}>
											<MediaCard
												title={m.title ? m.title : ""}
												width={500}
												rating={m.vote_average ? m.vote_average : 0}
												year={Number.parseInt(
													m.release_date ? m.release_date.substring(0, 4) : "0",
													10,
												)}
												picfile={m.backdrop_path}
												isPerson={false}
												isHorizontal={true}
											/>
										</a>
									</div>
								))}
							</MediaCarousel>

							<MediaCarousel
								title={langTrendingMovies(lang)}
								type={MediaType.Movie}
								category="trending"
								lang={lang}
							>
								{value.movies.map((m) => (
									<div class="carousel-item" key={m.id}>
										<a href={paths.media(MediaType.Movie, m.id, lang)}>
											<MediaCard
												title={m.title ? m.title : ""}
												width={500}
												rating={m.vote_average ? m.vote_average : 0}
												year={Number.parseInt(
													m.release_date ? m.release_date.substring(0, 4) : "0",
													10,
												)}
												picfile={m.backdrop_path}
												isPerson={false}
												isHorizontal={true}
											/>
										</a>
									</div>
								))}
							</MediaCarousel>
						</div>
					)}
				/>
			</div>
		</>
	);
});

export const head: DocumentHead = {
	title: "Moviestracker",
	meta: [
		{
			name: "description",
			content: "Movie",
		},
	],
};
