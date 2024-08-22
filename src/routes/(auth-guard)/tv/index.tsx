import { component$ } from "@builder.io/qwik";

import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaCarousel } from "~/components/media-carousel";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMedias, getTrendingMedia } from "~/services/tmdb";
import { langTopRatedTvShows, langTrengingTVShows } from "~/utils/languages";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
	const lang = event.query.get("lang") || "en-US";
	try {
		const [tt, tttop] = await Promise.all([
			getTrendingMedia({
				page: 1,
				language: lang,
				type: MediaType.Tv,
				needbackdrop: true,
			}),
			getMedias({
				page: 1,
				query: "top_rated",
				language: lang,
				type: MediaType.Tv,
				needbackdrop: true,
			}),
		]);
		const tvtrend = tt as TvShort[];
		const tvtoprated = tttop as TvShort[];
		return {
			tvtrend,
			tvtoprated,
			lang,
		};
	} catch {
		throw event.redirect(302, paths.notFound(lang));
	}
});

export default component$(() => {
	const resource = useContentLoader();
	return (
		<div class="mx-auto px-4 pt-[64px]">
			<MediaCarousel
				title={langTrengingTVShows(resource.value.lang)}
				type={MediaType.Tv}
				category="trending"
				lang={resource.value.lang}
			>
				{resource.value.tvtrend.map((m) => (
					<div class="carousel-item" key={m.id}>
						<a href={paths.media(MediaType.Tv, m.id, resource.value.lang)}>
							<MediaCard
								title={m.name ? m.name : ""}
								width={500}
								rating={m.vote_average ? m.vote_average : 0}
								year={Number.parseInt(
									m.first_air_date ? m.first_air_date.substring(0, 4) : "0",
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
				title={langTopRatedTvShows(resource.value.lang)}
				type={MediaType.Tv}
				category="toprated"
				lang={resource.value.lang}
			>
				{resource.value.tvtoprated.map((m) => (
					<div class="carousel-item" key={m.id}>
						<a href={paths.media(MediaType.Tv, m.id, resource.value.lang)}>
							<MediaCard
								title={m.name ? m.name : ""}
								width={500}
								rating={m.vote_average ? m.vote_average : 0}
								year={Number.parseInt(
									m.first_air_date ? m.first_air_date.substring(0, 4) : "0",
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
	);
});

export const head: DocumentHead = {
	title: "Moviestracker",
	meta: [
		{
			name: "description",
			content: "Tv Shows",
		},
	],
};
