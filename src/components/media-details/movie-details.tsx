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
import { MediaPlot } from "./media-plot";
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
			<div class="pt-[20vh] lg:mx-20 xl:mx-40">
				<MediaTitle
					name={movie.title ?? ""}
					original_name={movie.original_title}
				/>
				<MediaRating
					vote_average={movie.vote_average}
					vote_count={movie.vote_count}
					imdb_id={movie.imdb_id}
				/>

				<section class="mb-4 flex items-center">
					{movie.videos && movie.videos.results.length > 0 && (
						<div class="mr-2">
							<TrailersModal videos={movie.videos.results} />
						</div>
					)}

					<TorrentsModal
						title={movie.title ?? ""}
						year={formatYear(movie.release_date ?? "0")}
						isMovie={true}
						seasons={[]}
						media={movie}
						lang={lang}
					/>
				</section>

				<MediaInfo
					release_date={movie.release_date}
					geners={movie.genres}
					runtime={movie.runtime}
					production_countries={movie.production_countries}
					production_companies={movie.production_companies}
					original_language={movie.original_language}
					lang={lang}
				/>

				<section class="text-md flex flex-wrap">
					{movie.budget !== undefined && movie.budget > 0 && (
						<div class="me-4">
							<span class="me-2">{langBudget(lang)}:</span>
							{formatCurrency(movie.budget, lang)}
						</div>
					)}
					{movie.revenue !== undefined && movie.revenue > 0 && (
						<div class="me-2">
							<span class="me-2">{langRevenue(lang)}:</span>
							{formatCurrency(movie.revenue, lang)}
						</div>
					)}
				</section>

				<ExternalIds external_ids={movie.external_ids} type={"tv"} />

				<MediaPlot overview={movie.overview} tagline={movie.tagline} />

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
		);
	},
);
