import { component$ } from "@builder.io/qwik";

import { LuDisc3, LuLayers3 } from "@qwikest/icons/lucide";
import { MediaType, type TvFull, type TvShort } from "~/services/models";
import { formatYear } from "~/utils/fomat";
import {
	langActors,
	langCreatedby,
	langRecommendedTvShows,
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
import { TvEpisodeStatus } from "./tv-episode-status";
import { TvSeasons } from "./tv-seasons";

interface TvDetailsProps {
	tv: TvFull;
	recTv: TvShort[];
	lang: string;
}

export const TvDetails = component$(({ tv, recTv, lang }: TvDetailsProps) => {
	return (
		<div class="min-h-screen pt-[20vh] lg:mx-20 xl:mx-40">
			<div class="relative z-10 mb-4 flex flex-col gap-6">
				{/* Header Section */}
				<div class="space-y-2">
					<MediaTitle name={tv.name ?? ""} original_name={tv.original_name} />
					{tv.tagline && (
						<p class="text-xl italic opacity-80">"{tv.tagline}"</p>
					)}
				</div>

				{/* Meta Row */}
				<div class="flex flex-wrap items-center gap-4 text-sm font-medium">
					<MediaRating
						vote_average={tv.vote_average}
						vote_count={tv.vote_count}
						imdb_id={tv.external_ids.imdb_id}
					/>
					<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
					<span>{formatYear(tv.first_air_date || "")}</span>
					<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
					<div class="flex items-center gap-2">
						<div class="flex items-center gap-1">
							<LuLayers3 class="text-lg" />
							<span>{tv.number_of_seasons} S</span>
						</div>
						<div class="flex items-center gap-1">
							<LuDisc3 class="text-lg" />
							<span>{tv.number_of_episodes} E</span>
						</div>
					</div>
					<span class="hidden h-1 w-1 rounded-full bg-current opacity-50 sm:block" />
					<div class="flex flex-wrap gap-2">
						{tv.genres?.map((g) => (
							<span key={g.id} class="badge badge-ghost badge-sm">
								{g.name}
							</span>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div class="flex flex-wrap gap-4 items-center">
					{tv.videos && tv.videos.results.length > 0 && (
						<TrailersModal videos={tv.videos.results} />
					)}
					<TorrentsModal
						title={tv.name ? tv.name : ""}
						year={formatYear(tv.first_air_date ? tv.first_air_date : "")}
						isMovie={false}
						seasons={tv.seasons}
						media={tv}
						lang={lang}
					/>
				</div>

				{/* Social Icons */}
				<ExternalIds external_ids={tv.external_ids} type={"tv"} />

				{/* Overview */}
				<div class="max-w-3xl">
					<h3 class="mb-2 text-lg font-bold">Overview</h3>
					<p class="leading-relaxed opacity-90">{tv.overview}</p>
				</div>
			</div>

			<div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
				<div class="space-y-8">
					<MediaInfo
						release_date={tv.first_air_date}
						production_countries={tv.production_countries}
						production_companies={tv.production_companies}
						original_language={tv.original_language}
						lang={lang}
						networks={tv.networks}
					/>


					<TvEpisodeStatus
						lang={lang}
						last_episode_to_air={tv.last_episode_to_air}
						next_episode_to_air={tv.next_episode_to_air}
						in_production={tv.in_production}
					/>
				</div>

				<div class="space-y-6">
					{/* Right column placeholder */}
				</div>
			</div>

			<div class="mt-12 space-y-12">
				<TvSeasons lang={lang} seasons={tv.seasons} />

				{tv.created_by.length > 0 && (
					<MediaCarousel
						title={langCreatedby(lang)}
						type={MediaType.Person}
						lang={lang}
					>
						{tv.created_by.slice(0, 10).map((c) => (
							<div key={c.id} class="carousel-item">
								<a href={paths.media(MediaType.Person, c.id, lang)}>
									<MediaCard
										title={c.name ?? ""}
										width={300}
										year={0}
										rating={0}
										picfile={c.profile_path}
										isPerson={true}
										isHorizontal={false}
									/>
								</a>
							</div>
						))}
					</MediaCarousel>
				)}

				<MediaCarousel
					title={langActors(lang)}
					type={MediaType.Person}
					lang={lang}
				>
					{tv.credits?.cast.slice(0, 10).map((c) => (
						<div key={c.id} class="carousel-item">
							<a href={paths.media(MediaType.Person, c.id, lang)}>
								<MediaCard
									title={c.name ?? ""}
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

				{recTv.length > 0 && (
					<MediaCarousel
						title={langRecommendedTvShows(lang)}
						type={MediaType.Person}
						category="updated"
						lang={lang}
					>
						{recTv.map((m) => (
							<div key={m.id} class="carousel-item">
								<a href={paths.media(MediaType.Tv, m.id, lang)}>
									<MediaCard
										title={m.name ? m.name : ""}
										width={500}
										rating={m.vote_average ? m.vote_average : 0}
										year={(m.first_air_date && formatYear(m.first_air_date)) || 0}
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
});
