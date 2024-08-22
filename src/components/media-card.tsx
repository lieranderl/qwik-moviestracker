import { component$, useComputed$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";

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

		const cardWidthStyle = useComputed$(() => {
			if (!isHorizontal) {
				if (isPerson) {
					return "width: 7vw";
				}
				return "width: 14vw;";
			}
			return "width: 20vw;";
		});

		const cardWidthClass = useComputed$(() => {
			if (!isHorizontal) {
				if (isPerson) {
					return "min-w-[120px] max-w-[180px]";
				}
				return "min-w-[150px] max-w-[200px]";
			}
			return "min-w-[300px] max-w-[500px]";
		});

		return (
			<div class={cardWidthClass} style={cardWidthStyle.value.toString()}>
				{charName && (
					<span class="block truncate text-sm font-normal italic">
						{charName}
					</span>
				)}
				{!charName && <span class="block text-sm">&nbsp;</span>}
				<div class="group">
					<div class="transition-scale scale-95 drop-shadow duration-300 ease-in-out group-hover:scale-100 group-hover:drop-shadow-md">
						<picture>
							<Image
								class="rounded-md border-2 border-base-200"
								src={
									picfile
										? `https://image.tmdb.org/t/p/w${width}/${picfile}`
										: `https://via.placeholder.com/${width}x${height.value}/14b8a6/042f2e?text=No+Image&font=bebas`
								}
								width={width}
								height={height.value}
								alt=""
							/>
							{rating > 0 && (
								<span class="badge badge-lg absolute bottom-2 left-2 font-bold">
									{typeof rating === "string" ? rating : rating.toFixed(1)}
								</span>
							)}
							{year > 0 && (
								<span class="badge badge-lg absolute bottom-2 right-2 font-bold">
									{year}
								</span>
							)}
						</picture>
					</div>
					<span class="transition-scale block overflow-hidden truncate text-ellipsis text-sm font-normal duration-300 ease-in-out group-hover:font-extrabold">
						{title}
					</span>
				</div>
			</div>
		);
	},
);
