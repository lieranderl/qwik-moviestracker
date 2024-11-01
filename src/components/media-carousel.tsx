import { Slot, component$ } from "@builder.io/qwik";
import { MediaType } from "~/services/models";
import { langExploreAll } from "~/utils/languages";
import { paths } from "~/utils/paths";

interface MediaCarouselProps {
	title: string;
	category?: string;
	type: MediaType;
	lang: string;
}

export const MediaCarousel = component$(
	({ title, type, category, lang }: MediaCarouselProps) => {
		return (
			<section class="my-4">
				<div class="flex flex-row items-end justify-between">
					<div class="text-xl font-semibold">{title}</div>
					{type !== MediaType.Person &&
						type !== MediaType.Seasons &&
						category && (
							<a
								href={paths.category(type, category, lang)}
								class="link link-hover text-sm hover:text-accent"
							>
								{langExploreAll(lang)}
							</a>
						)}
				</div>
				<div class="carousel carousel-start w-full rounded-box p-4">
					<Slot />
				</div>
			</section>
		);
	},
);
