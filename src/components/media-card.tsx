import { component$, useComputed$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { RatingStar } from "~/components/rating-star";
import { TMDB_IMAGE_BASE_URL } from "~/utils/constants";

interface MovieCardProps {
	title: string;
	picfile: string | null | undefined;
	width: number;
	charName?: string;
	rating: number | string | null | undefined;
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
		const hasPoster = useComputed$(() => Boolean(picfile));

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

		const aspectClass = useComputed$(() =>
			isHorizontal ? "aspect-video" : "aspect-[2/3]",
		);

		const placeholderLabel = useComputed$(() => {
			const compactTitle = title.trim();
			if (!compactTitle) {
				return "NA";
			}

			const words = compactTitle.split(/\s+/).filter(Boolean);
			if (words.length === 1) {
				return words[0].slice(0, 2).toUpperCase();
			}
			return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
		});

		const safeRating = useComputed$(() => {
			const parsed =
				typeof rating === "number"
					? rating
					: Number.parseFloat(String(rating ?? ""));
			return Number.isFinite(parsed) ? parsed : 0;
		});

		return (
			<div class={cardWidthClass.value}>
				{charName && (
					<span class="text-base-content/70 before:text-base-content/40 mb-1 block truncate text-xs font-medium tracking-wider uppercase before:mr-2 before:content-['•']">
						{charName}
					</span>
				)}
				{!charName && <span class="block text-sm">&nbsp;</span>}
				<div class="card group bg-base-100 border-base-300/60 relative overflow-hidden border shadow-sm transition-all duration-200 ease-out active:scale-[0.995] md:hover:-translate-y-1 md:hover:shadow-xl">
					<figure
						class={`relative w-full overflow-hidden ${aspectClass.value}`}
					>
						{hasPoster.value ? (
							<Image
								class="[ease-[cubic-bezier(.22,.61,.36,1)] absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.015] md:group-hover:brightness-105"
								src={`${TMDB_IMAGE_BASE_URL}w${width}${picfile}`}
								width={width}
								height={height.value}
								alt={title}
							/>
						) : (
							<div class="from-base-200 via-base-300/80 to-base-200 absolute inset-0 overflow-hidden bg-linear-to-br">
								<div class="bg-base-content/10 absolute -top-10 -right-8 h-28 w-28 rounded-full blur-xl" />
								<div class="bg-base-content/10 absolute -bottom-12 -left-8 h-32 w-32 rounded-full blur-xl" />
								<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
									<div class="rounded-box border-base-content/20 bg-base-100/75 text-base-content/70 border px-3 py-1.5 text-xs font-semibold tracking-widest">
										{placeholderLabel.value}
									</div>
									<span class="text-base-content/65 max-w-[90%] truncate text-xs font-medium">
										{title}
									</span>
								</div>
							</div>
						)}
						<div class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-20 bg-linear-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-250 ease-out md:group-hover:opacity-100" />
						{safeRating.value > 0 && (
							<div class="badge badge-warning badge-sm absolute bottom-3 left-3 z-20 inline-flex items-center justify-center gap-1 font-bold shadow-sm">
								<RatingStar />
								<span class="inline-flex items-center leading-none">
									{safeRating.value.toFixed(1)}
								</span>
							</div>
						)}
						{year > 0 && (
							<div class="badge badge-neutral badge-sm absolute right-3 bottom-3 z-20 font-semibold shadow-sm">
								{year}
							</div>
						)}
					</figure>
					<div class="card-body bg-base-200/70 border-base-300/60 relative border-t p-3">
						<span class="card-title text-base-content block truncate text-sm leading-tight">
							{title}
						</span>
					</div>
				</div>
			</div>
		);
	},
);
