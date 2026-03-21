import { component$, Resource, useResource$ } from "@builder.io/qwik";

import type { DocumentHead } from "@builder.io/qwik-city";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
	ErrorState,
	LoadingState,
	SectionHeading,
} from "~/components/page-feedback";
import type { MediaShort, MovieShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { useEnv, useQueryParamsLoader } from "~/shared/loaders";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import {
	langLatestDolbyVisionMovies,
	langLatestHDR10Movies,
	langLatestMovies,
	langQuickFilters,
	langTrendingMovies,
	langSwipeToBrowse,
} from "~/utils/languages";
import { paths } from "~/utils/paths";

export default component$(() => {
	const lang = useQueryParamsLoader().value.lang;
	const envMongoUrl = useEnv().value.envMongoUrl;
	const useMovies = useResource$(async () => {
		try {
			const [m, torMovies, hdrMovies, dolbyMovies] = await Promise.all([
				getTrendingMedia({
					page: 1,
					language: lang,
					type: MediaType.Movie,
					needbackdrop: true,
				}),
				withImages(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: MEDIA_PAGE_SIZE,
						language: lang,
						dbName: DbType.LastMovies,
						env: envMongoUrl,
					})) as MediaShort[],
					lang,
				),
				withImages(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: MEDIA_PAGE_SIZE,
						language: lang,
						dbName: DbType.HDR10,
						env: envMongoUrl,
					})) as MediaShort[],
					lang,
				),
				withImages(
					(await getMoviesMongo({
						page: 1,
						entries_on_page: MEDIA_PAGE_SIZE,
						language: lang,
						dbName: DbType.DV,
						env: envMongoUrl,
					})) as MediaShort[],
					lang,
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
		<Resource
			value={useMovies}
			onPending={() => (
				<LoadingState
					title="Loading movie collections"
					description="We are fetching trending releases and curated catalog sections."
					compact={true}
				/>
			)}
			onRejected={() => (
				<ErrorState
					title="Movie collections are unavailable"
					description="Please refresh the page or try again later."
					compact={true}
				/>
			)}
			onResolved={(value) => (
				<div class="page-enter space-y-6">
					<SectionHeading eyebrow="Movies" title="Browse movie collections" />
					<QuickFilterStrip
						label={langQuickFilters(lang)}
						items={[
							{ active: true, href: "#latest-movies", label: langLatestMovies(lang) },
							{ href: "#hdr10-movies", label: langLatestHDR10Movies(lang) },
							{
								href: "#dolby-vision-movies",
								label: langLatestDolbyVisionMovies(lang),
							},
							{
								href: "#trending-movies",
								label: langTrendingMovies(lang),
							},
						]}
					/>
					<MediaCarousel
						hintLabel={langSwipeToBrowse(lang)}
						sectionId="latest-movies"
						title={langLatestMovies(lang)}
						type={MediaType.Movie}
						category="updated"
						lang={lang}
					>
						{value.torMovies.map((m) => (
							<div class="carousel-item" key={m.id}>
								<a
									href={paths.media(MediaType.Movie, m.id, lang)}
									class="media-card-link"
								>
									<MediaCard
										title={m.title ? m.title : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={formatYear(m.release_date)}
										picfile={m.backdrop_path}
										isPerson={false}
										isHorizontal={true}
									/>
								</a>
							</div>
						))}
					</MediaCarousel>

					<MediaCarousel
						hintLabel={langSwipeToBrowse(lang)}
						sectionId="hdr10-movies"
						title={langLatestHDR10Movies(lang)}
						type={MediaType.Movie}
						category="hdr10"
						lang={lang}
					>
						{value.hdrMovies.map((m) => (
							<div class="carousel-item" key={m.id}>
								<a
									href={paths.media(MediaType.Movie, m.id, lang)}
									class="media-card-link"
								>
									<MediaCard
										title={m.title ? m.title : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={formatYear(m.release_date)}
										picfile={m.backdrop_path}
										isPerson={false}
										isHorizontal={true}
									/>
								</a>
							</div>
						))}
					</MediaCarousel>

					<MediaCarousel
						hintLabel={langSwipeToBrowse(lang)}
						sectionId="dolby-vision-movies"
						title={langLatestDolbyVisionMovies(lang)}
						type={MediaType.Movie}
						category="dolbyvision"
						lang={lang}
					>
						{value.dolbyMovies.map((m) => (
							<div class="carousel-item" key={m.id}>
								<a
									href={paths.media(MediaType.Movie, m.id, lang)}
									class="media-card-link"
								>
									<MediaCard
										title={m.title ? m.title : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={formatYear(m.release_date)}
										picfile={m.backdrop_path}
										isPerson={false}
										isHorizontal={true}
									/>
								</a>
							</div>
						))}
					</MediaCarousel>

					<MediaCarousel
						hintLabel={langSwipeToBrowse(lang)}
						sectionId="trending-movies"
						title={langTrendingMovies(lang)}
						type={MediaType.Movie}
						category="trending"
						lang={lang}
					>
						{value.movies.map((m) => (
							<div class="carousel-item" key={m.id}>
								<a
									href={paths.media(MediaType.Movie, m.id, lang)}
									class="media-card-link"
								>
									<MediaCard
										title={m.title ? m.title : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={formatYear(m.release_date)}
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
