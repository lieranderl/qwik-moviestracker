import { component$ } from "@builder.io/qwik";

import { MediaType, type MovieFull, type MovieShort } from "~/services/models";
import { formatCrew, formatCurrency, formatYear } from "~/utils/fomat";
import {
	langActors,
	langBudget,
	langCollectionMovies,
	langCrew,
	langRecommendedMovies,
	langRevenue,
} from "~/utils/languages";
import { paths } from "~/utils/paths";
import { ExternalIds } from "../external_ids";
import { MediaCard } from "../media-card";
import { MediaCarousel } from "../media-carousel";
import { TorrentsModal } from "../torrents-list-modal";
import { TrailersModal } from "../trailers-list-modal";
import { MediaInfo } from "./media-info";

import { MediaRating } from "./media-rating";
import { MediaTitle } from "./media-title";

interface MovieDetailsProps {
	movie: MovieFull;
	recMovies: MovieShort[];
	colMovies: MovieShort[];
	lang: string;
}

export const MovieDetails = component$(
	({ movie, recMovies, colMovies, lang }: MovieDetailsProps) => {
		return (
			<div class="min-h-screen pt-[20vh] lg:mx-20 xl:mx-40">
				<div class="mb-4 flex flex-col gap-6">
					{/* Header Section */}
					<div class="space-y-2">
						<MediaTitle
							name={movie.title ?? ""}
							original_name={movie.original_title}
						/>
						{movie.tagline && (
							<p class="text-xl italic opacity-80">"{movie.tagline}"</p>
						)}
					</div>

					{/* Meta Row */}
					<div class="flex flex-wrap items-center gap-4 text-sm font-medium">
						<MediaRating
							vote_average={movie.vote_average}
							vote_count={movie.vote_count}
							imdb_id={movie.imdb_id}
						/>
						<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
						{movie.release_date && (
							<span>{formatYear(movie.release_date)}</span>
						)}
						<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
						{movie.runtime && movie.runtime > 0 && (
							<span>{movie.runtime} min</span>
						)}
						<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
						{movie.genres && movie.genres.length > 0 && (
							<div class="flex gap-2">
								{movie.genres.map((g) => (
									<span key={g.id} class="badge badge-ghost badge-sm">
										{g.name}
									</span>
								))}
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div class="flex flex-wrap gap-4">
						{movie.videos && movie.videos.results.length > 0 && (
							<TrailersModal videos={movie.videos.results} />
						)}
						<TorrentsModal
							title={movie.title ?? ""}
							year={formatYear(movie.release_date ?? "0")}
							isMovie={true}
							seasons={[]}
							media={movie}
							lang={lang}
						/>
					</div>

					{/* Social Icons */}
					<ExternalIds external_ids={movie.external_ids} type={"movie"} />

					{/* Overview */}
					<div class="max-w-3xl">
						<h3 class="mb-2 text-lg font-bold">Overview</h3>
						<p class="leading-relaxed opacity-90">{movie.overview}</p>
					</div>
				</div>

				<div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
					<div class="space-y-8">
						<MediaInfo
							release_date={movie.release_date}
							production_countries={movie.production_countries}
							production_companies={movie.production_companies}
							original_language={movie.original_language}
							lang={lang}
						/>

						<section class="flex flex-wrap gap-8 mt-4 text-sm">
							{movie.budget !== undefined && movie.budget > 0 && (
								<div>
									<span class="block text-xs font-bold uppercase opacity-60">{langBudget(lang)}</span>
									<span class=" font-medium">{formatCurrency(movie.budget, lang)}</span>
								</div>
							)}
							{movie.revenue !== undefined && movie.revenue > 0 && (
								<div>
									<span class="block text-xs font-bold uppercase opacity-60">{langRevenue(lang)}</span>
									<span class="font-medium">{formatCurrency(movie.revenue, lang)}</span>
								</div>
							)}
						</section>
					</div>


				</div>

				<div class="mt-12 space-y-12">
					<MediaCarousel
						title={langActors(lang)}
						type={MediaType.Person}
						lang={lang}
					>
						{movie.credits?.cast.slice(0, 10).map((c) => (
							<div class="carousel-item" key={c.id}>
								<a href={paths.media(MediaType.Person, c.id, lang)}>
									<MediaCard
										title={c.name ? c.name : ""}
										width={300}
										year={0}
										rating={0}
										picfile={c.profile_path}
										isPerson={true}
										isHorizontal={false}
										charName={c.character}
									/>
								</a>
							</div>
						))}
					</MediaCarousel>

					{movie.credits !== undefined && movie.credits.crew.length > 0 && (
						<MediaCarousel
							title={langCrew(lang)}
							type={MediaType.Person}
							lang={lang}
						>
							{formatCrew(movie.credits.crew)
								.slice(0, 10)
								.map((c) => (
									<div class="carousel-item" key={c.id}>
										<a href={paths.media(MediaType.Person, c.id, lang)}>
											<MediaCard
												title={c.name ?? ""}
												width={300}
												year={0}
												rating={0}
												picfile={c.profile_path}
												isPerson={true}
												isHorizontal={false}
												charName={c.job}
											/>
										</a>
									</div>
								))}
						</MediaCarousel>
					)}

					{colMovies.length > 0 && (
						<MediaCarousel
							title={langCollectionMovies(lang)}
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{colMovies.map((m) => (
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
					)}

					{recMovies.length > 0 && (
						<MediaCarousel
							title={langRecommendedMovies(lang)}
							type={MediaType.Person}
							category="updated"
							lang={lang}
						>
							{recMovies.map((m) => (
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
					)}
				</div>
			</div>
		);
	},
);
