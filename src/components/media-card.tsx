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
	layout?: "carousel" | "grid";
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
		layout = "carousel",
	}: MovieCardProps) => {
		const hasPoster = useComputed$(() => Boolean(picfile));

		const height = useComputed$(() => {
			if (isHorizontal) {
				return (width * 9) / 16;
			}
			return (width * 3) / 2;
		});

		const cardWidthClass = useComputed$(() => {
			if (layout === "grid") {
				return "w-full";
			}
			if (!isHorizontal) {
				if (isPerson) {
					return "ms-2 w-[7.25rem] sm:w-[7.75rem] lg:w-[8.25rem]";
				}
				return "ms-2 w-[8.5rem] sm:w-[9rem] lg:w-[9.5rem]";
			}
			return "ms-2 w-[16rem] sm:w-[18rem] lg:w-[20rem] xl:w-[22rem]";
		});

		const aspectClass = useComputed$(() =>
			isHorizontal ? "aspect-video" : "aspect-[2/3]",
		);

		const metaRowClass = useComputed$(() =>
			isHorizontal
				? "mb-1 flex h-5 items-center truncate text-xs font-medium tracking-wider uppercase"
				: "mb-1 flex h-5 items-center truncate text-xs font-medium tracking-wider uppercase",
		);

		const bodyHeightClass = useComputed$(() =>
			isHorizontal ? "h-[4.25rem]" : "h-[5rem]",
		);

		const containerClass = useComputed$(() =>
			layout === "grid" ? `${cardWidthClass.value} h-full` : cardWidthClass.value,
		);

		const cardClass = useComputed$(
			() =>
				`focus-ringable card-hover card group bg-base-100 border-base-300/60 relative overflow-hidden border shadow-sm active:scale-[0.995] ${layout === "grid" ? "h-full" : ""}`,
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
			<div class={containerClass.value}>
				{charName && (
					<span
						class={`text-base-content/70 before:text-base-content/40 ${metaRowClass.value} before:mr-2 before:content-['•']`}
					>
						{charName}
					</span>
				)}
				{!charName && (
					<span class={`text-base-content/0 ${metaRowClass.value}`}>&nbsp;</span>
				)}
				<div class={cardClass.value}>
					<figure
						class={`relative w-full overflow-hidden ${aspectClass.value}`}
					>
						{hasPoster.value ? (
							<Image
								class="[ease-[cubic-bezier(.22,.61,.36,1)] absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.02] md:group-hover:brightness-105"
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
							<div class="badge badge-warning badge-sm absolute bottom-3 left-3 z-20 inline-flex translate-y-1 items-center justify-center gap-1 font-bold opacity-0 shadow-sm transition-all duration-200 md:group-hover:translate-y-0 md:group-hover:opacity-100">
								<RatingStar />
								<span class="inline-flex items-center leading-none">
									{safeRating.value.toFixed(1)}
								</span>
							</div>
						)}
						{year > 0 && (
							<div class="badge badge-neutral badge-sm absolute right-3 bottom-3 z-20 translate-y-1 font-semibold opacity-0 shadow-sm transition-all duration-200 md:group-hover:translate-y-0 md:group-hover:opacity-100">
								{year}
							</div>
						)}
					</figure>
					<div
						class={`card-body bg-base-200/70 border-base-300/60 relative min-w-0 border-t px-3 py-2.5 ${bodyHeightClass.value}`}
					>
						<span class="card-title text-base-content block line-clamp-2 text-sm leading-tight">
							{title}
						</span>
					</div>
				</div>
			</div>
		);
	},
	);
