import { component$, useComputed$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { TMDB_IMAGE_BASE_URL } from "~/utils/constants";

interface MovieCardProps {
	title: string;
	picfile: string | null | undefined;
	width: number;
	charName?: string;
	rating: number;
	year: number;
	isPerson: boolean;
	isHorizontal: boolean;
}

export const MediaCard = component$(
	({
		title,
		picfile,
		width,
		charName,
		rating,
		year,
		isPerson,
		isHorizontal,
	}: MovieCardProps) => {
		const height = useComputed$(() => {
			if (isHorizontal) {
				return (width * 9) / 16;
			}
			return (width * 3) / 2;
		});

		const cardWidthClass = useComputed$(() => {
			if (!isHorizontal) {
				if (isPerson) {
					return "w-[7vw] min-w-[120px] max-w-[180px] ms-2";
				}
				return "w-[14vw] min-w-[150px] max-w-[200px] ms-2";
			}
			return "w-[20vw] min-w-[300px] max-w-[500px] ms-2";
		});

		return (
			<div class={cardWidthClass.value}>
				{charName && (
					<span class="mb-1 block truncate text-sm font-normal italic">
						{charName}
					</span>
				)}
				{!charName && <span class="block text-sm">&nbsp;</span>}
				<div class="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
					<picture>
						<Image
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							src={
								picfile
									? `${TMDB_IMAGE_BASE_URL}w${width}${picfile}`
									: `https://placehold.co/${width}x${height.value.toFixed(0)}/grey/black?text=${title}&font=inter`
							}
							width={width}
							height={height.value}
							alt={title}
						/>
						{rating > 0 && (
							<div class="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md">
								<span>★</span>
								<span>
									{typeof rating === "string" ? rating : rating.toFixed(1)}
								</span>
							</div>
						)}
						{year > 0 && (
							<div class="absolute right-2 bottom-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
								{year}
							</div>
						)}
					</picture>
					<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<span class="block truncate text-sm font-bold text-white">
							{title}
						</span>
					</div>
				</div>
			</div>
		);
	},
);
