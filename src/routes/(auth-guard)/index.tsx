import { component$, Resource, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { HiXCircleSolid } from "@qwikest/icons/heroicons";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import type {
	MediaShort,
	MovieMongo,
	MovieShort,
	TvShort,
} from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { formatYear } from "~/utils/fomat";
import {
	langLatestMovies,
	langTrendingMovies,
	langTrengingTVShows,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import { useEnv, useQueryParamsLoader } from "./layout";

export default component$(() => {
	const envMongoUrl = useEnv().value.envMongoUrl;
	const lang = useQueryParamsLoader().value.lang;
	const useMovies = useResource$(async () => {
		const needbackdrop = true;
		try {
			const [m, t, tm] = await Promise.all([
				getTrendingMedia({
					page: 1,
					language: lang,
					type: MediaType.Movie,
					needbackdrop: needbackdrop,
				}),
				getTrendingMedia({
					page: 1,
					language: lang,
					type: MediaType.Tv,
					needbackdrop: needbackdrop,
				}),
				withImages(
					(await getMoviesMongo({
						entries_on_page: 20,
						language: lang,
						dbName: DbType.LastMovies,
						page: 1,
						env: envMongoUrl,
					})) as MediaShort[],
					lang,
				),
			]);
			const movies = m as MovieShort[];
			const tv = t as TvShort[];
			const torMovies = tm as MovieMongo[];
			return {
				movies,
				tv,
				torMovies,
				lang,
			};
		} catch {
			throw new Error("error");
		}
	});

	return (
		<div class="container mx-auto px-4">
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
					<div class="animate-fadeIn">
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
											year={(m.release_date && formatYear(m.release_date)) || 0}
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
											year={(m.release_date && formatYear(m.release_date)) || 0}
											picfile={m.backdrop_path}
											isPerson={false}
											isHorizontal={true}
										/>
									</a>
								</div>
							))}
						</MediaCarousel>
						<MediaCarousel
							title={langTrengingTVShows(lang)}
							type={MediaType.Tv}
							category="trending"
							lang={lang}
						>
							{value.tv.map((m) => (
								<div class="carousel-item" key={m.id}>
									<a href={paths.media(MediaType.Tv, m.id, lang)}>
										<MediaCard
											title={m.name ? m.name : ""}
											width={500}
											rating={m.vote_average ? m.vote_average : 0}
											year={
												(m.first_air_date && formatYear(m.first_air_date)) || 0
											}
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
	);
});

export const head: DocumentHead = {
	title: "Moviestracker",
	meta: [
		{
			name: "description",
			content: "Moviestracker",
		},
	],
};
