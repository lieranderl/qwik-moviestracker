import { component$, Resource, useResource$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { ContinueBrowsingWidget } from "~/components/discovery/continue-browsing";
import { FeaturedSpotlight } from "~/components/discovery/featured-spotlight";
import { QuickFilterStrip } from "~/components/discovery/quick-filter-strip";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import {
	ErrorState,
	LoadingState,
	SectionHeading,
} from "~/components/page-feedback";
import type {
	MediaShort,
	MovieMongo,
	MovieShort,
	TvShort,
} from "~/services/models";
import { MediaType } from "~/services/models";
import { DbType, getMoviesMongo } from "~/services/mongoatlas";
import { getTrendingMedia, withImages } from "~/services/tmdb";
import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { formatYear } from "~/utils/format";
import {
	langLatestMovies,
	langContinueBrowsing,
	langFeaturedSpotlight,
	langJumpBackIn,
	langOpenDetails,
	langQuickFilters,
	langRecentSearches,
	langResume,
	langStartExploring,
	langTrendingMovies,
	langTrengingTVShows,
	langSwipeToBrowse,
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
						entries_on_page: MEDIA_PAGE_SIZE,
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
		<Resource
			value={useMovies}
			onPending={() => (
				<LoadingState
					title="Loading your home feed"
					description="We are gathering trending movies, TV shows, and recent additions."
					compact={true}
				/>
			)}
			onRejected={() => (
				<ErrorState
					title="Home feed is unavailable"
					description="Please refresh the page or try again in a moment."
					compact={true}
				/>
			)}
			onResolved={(value) => (
				<div class="page-enter space-y-6">
					<SectionHeading
						eyebrow="Home"
						title="Your movie and series dashboard"
					/>
					<QuickFilterStrip
						label={langQuickFilters(lang)}
						items={[
							{
								active: true,
								href: "#featured-spotlight",
								label: langFeaturedSpotlight(lang),
							},
							{
								href: "#continue-browsing",
								label: langContinueBrowsing(lang),
							},
							{ href: "#latest-movies", label: langLatestMovies(lang) },
							{ href: "#trending-movies", label: langTrendingMovies(lang) },
							{ href: "#trending-tv", label: langTrengingTVShows(lang) },
						]}
					/>
					{value.movies.length > 0 && (
						<FeaturedSpotlight
							ctaLabel={langOpenDetails(lang)}
							description={
								value.movies[
									(new Date().getDate() - 1) % value.movies.length
								].overview ||
								"Open the latest featured title and jump straight into cast, ratings, and related picks."
							}
							href={paths.media(
								MediaType.Movie,
								value.movies[(new Date().getDate() - 1) % value.movies.length].id,
								lang,
							)}
							imagePath={
								value.movies[(new Date().getDate() - 1) % value.movies.length]
									.backdrop_path
							}
							meta={[
								langTrendingMovies(lang),
								String(
									formatYear(
										value.movies[
											(new Date().getDate() - 1) % value.movies.length
										].release_date,
									) || "2026",
								),
							]}
							overline={langFeaturedSpotlight(lang)}
							rating={
								value.movies[(new Date().getDate() - 1) % value.movies.length]
									.vote_average
							}
							title={
								value.movies[(new Date().getDate() - 1) % value.movies.length]
									.title || "Featured release"
							}
						/>
					)}
					<ContinueBrowsingWidget
						emptyDescription={langStartExploring(lang)}
						label={langContinueBrowsing(lang)}
						lastViewedLabel={langJumpBackIn(lang)}
						recentSearchesLabel={langRecentSearches(lang)}
						resumeLabel={langResume(lang)}
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
					<MediaCarousel
						hintLabel={langSwipeToBrowse(lang)}
						sectionId="trending-tv"
						title={langTrengingTVShows(lang)}
						type={MediaType.Tv}
						category="trending"
						lang={lang}
					>
						{value.tv.map((m) => (
							<div class="carousel-item" key={m.id}>
								<a
									href={paths.media(MediaType.Tv, m.id, lang)}
									class="media-card-link"
								>
									<MediaCard
										title={m.name ? m.name : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={formatYear(m.first_air_date)}
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
			content: "Moviestracker",
		},
	],
};
