import {
	$,
	component$,
	useSignal,
	useStore,
	useVisibleTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, server$ } from "@builder.io/qwik-city";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TvShort } from "~/services/models";
import { MediaType } from "~/services/models";
import { getMedias, getTrendingMedia } from "~/services/tmdb";
import { categoryToTitle, paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
	const lang = event.query.get("lang") || "en-US";

	if (event.params.name === "trending") {
		try {
			const res = await getTrendingMedia({
				page: 1,
				language: lang,
				type: MediaType.Tv,
				needbackdrop: false,
			});
			return {
				tv: res as TvShort[],
				category: event.params.name,
				lang: lang,
			};
		} catch (_error) {
			throw event.redirect(302, paths.notFound(lang));
		}
	}

	if (event.params.name === "toprated") {
		try {
			const res = await getMedias({
				page: 1,
				language: lang,
				query: "top_rated",
				type: MediaType.Tv,
				needbackdrop: false,
			});
			return {
				tv: res as TvShort[],
				category: event.params.name,
				lang: lang,
			};
		} catch (_error) {
			throw event.redirect(302, paths.notFound(lang));
		}
	}
	return {
		tv: [] as TvShort[],
		category: event.params.name,
		lang: lang,
	};
});

export default component$(() => {
	const resource = useContentLoader();
	const moviesSig = useStore(resource.value.tv as TvShort[]);
	const isloadingMovies = useSignal(false);
	const pageSig = useSignal(1);

	// eslint-disable-next-line qwik/no-use-visible-task
	useVisibleTask$((ctx) => {
		ctx.track(() => {
			moviesSig.length;
		});
		pageSig.value = pageSig.value + 1;
	});

	const getNewMovies = $(async () => {
		isloadingMovies.value = true;

		const moviesFunc = server$(() => {
			if (resource.value.category === "toprated") {
				return getMedias({
					page: pageSig.value,
					language: resource.value.lang,
					query: "top_rated",
					type: MediaType.Tv,
					needbackdrop: false,
				});
			}
			return getTrendingMedia({
				page: pageSig.value,
				language: resource.value.lang,
				type: MediaType.Tv,
				needbackdrop: false,
			});
		});

		const movies = (await moviesFunc()) as TvShort[];
		moviesSig.push(...movies);
		isloadingMovies.value = false;
	});

	return (
		<div class="container mx-auto px-4 pt-[64px]">
			<MediaGrid
				title={categoryToTitle(
					resource.value.category,
					MediaType.Tv,
					resource.value.lang,
				)}
			>
				{moviesSig.length > 0 &&
					moviesSig.map((m) => (
						<>
							<a
								key={m.id}
								href={paths.media(MediaType.Tv, m.id, resource.value.lang)}
							>
								<MediaCard
									title={m.name ? m.name : ""}
									width={300}
									rating={m.vote_average ? m.vote_average : 0}
									year={Number.parseInt(
										m.first_air_date ? m.first_air_date.substring(0, 4) : "0",
										10,
									)}
									picfile={m.poster_path}
									isPerson={false}
									isHorizontal={false}
								/>
							</a>
						</>
					))}
			</MediaGrid>
			<div class="my-4 flex justify-center">
				<button type="button" class="btn btn-primary" onClick$={getNewMovies}>
					{isloadingMovies.value ? (
						<span class="loading loading-ring loading-lg" />
					) : (
						<span>Load more</span>
					)}
				</button>
			</div>
		</div>
	);
});

export const head: DocumentHead = {
	title: "Moviestracker",
	meta: [
		{
			name: "description",
			content: "Catalog of Tv Shows",
		},
	],
};
