import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { RatingStar } from "~/components/rating-star";
import { TMDB_IMAGE_BASE_URL } from "~/utils/constants";

export type MediaCardVariant = "landscape" | "poster" | "person";

interface MediaCardProps {
  title: string;
  picfile: string | null | undefined;
  width: number;
  metaLabel?: string;
  rating: number | string | null | undefined;
  year: number;
  variant?: MediaCardVariant;
  layout?: "carousel" | "grid";
}

const META_ROW_CLASS =
  "mb-1 flex h-5 items-center truncate text-xs font-medium tracking-wider uppercase";

const getCardWidthClass = ({
  layout,
  variant,
}: Pick<MediaCardProps, "layout" | "variant">) => {
  if (layout === "grid") {
    return "w-full";
  }

  if (variant === "landscape") {
    return "ms-2 w-[16rem] sm:w-[18rem] lg:w-[20rem] xl:w-[22rem]";
  }

  return variant === "person"
    ? "ms-2 w-[7.25rem] sm:w-[7.75rem] lg:w-[8.25rem]"
    : "ms-2 w-[8.5rem] sm:w-[9rem] lg:w-[9.5rem]";
};

const getPlaceholderLabel = (title: string) => {
  const compactTitle = title.trim();
  if (!compactTitle) {
    return "NA";
  }

  const words = compactTitle.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
};

const getSafeRating = (rating: MediaCardProps["rating"]) => {
  const parsed =
    typeof rating === "number"
      ? rating
      : Number.parseFloat(String(rating ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const MediaCard = component$(
  ({
    title,
    picfile,
    width,
    metaLabel,
    rating,
    year,
    variant = "poster",
    layout = "carousel",
  }: MediaCardProps) => {
    const hasPoster = Boolean(picfile);
    const isLandscape = variant === "landscape";
    const height = isLandscape ? (width * 9) / 16 : (width * 3) / 2;
    const cardWidthClass = getCardWidthClass({
      variant,
      layout,
    });
    const aspectClass = isLandscape ? "aspect-video" : "aspect-[2/3]";
    const bodyHeightClass = isLandscape ? "h-[3.5rem]" : "h-[3.75rem]";
    const containerClass =
      layout === "grid" ? `${cardWidthClass} h-full` : cardWidthClass;
    const cardClass = `focus-ringable media-card-surface card bg-base-100 border-base-300/60 rounded-box relative overflow-hidden border shadow-sm transform-gpu ${
      layout === "grid" ? "h-full" : ""
    }`;
    const placeholderLabel = getPlaceholderLabel(title);
    const safeRating = getSafeRating(rating);

    return (
      <div class={containerClass}>
        {metaLabel && (
          <span
            class={`text-base-content/70 before:text-base-content/40 ${META_ROW_CLASS} before:mr-2 before:content-['•']`}
          >
            {metaLabel}
          </span>
        )}
        {!metaLabel && (
          <span class={`text-base-content/0 ${META_ROW_CLASS}`}>&nbsp;</span>
        )}
        <div class={cardClass}>
          <figure class={`relative w-full overflow-hidden ${aspectClass}`}>
            {hasPoster ? (
              <Image
                class="media-card-poster absolute inset-0 h-full w-full transform-gpu object-cover"
                src={`${TMDB_IMAGE_BASE_URL}w${width}${picfile}`}
                width={width}
                height={height}
                alt={title}
              />
            ) : (
              <div class="from-base-200 via-base-300/80 to-base-200 absolute inset-0 overflow-hidden bg-linear-to-br">
                <div class="bg-base-content/10 absolute -top-10 -right-8 h-28 w-28 rounded-full blur-xl" />
                <div class="bg-base-content/10 absolute -bottom-12 -left-8 h-32 w-32 rounded-full blur-xl" />
                <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <div class="border-base-content/20 bg-base-100/75 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-widest">
                    {placeholderLabel}
                  </div>
                  <span class="text-base-content/65 max-w-[90%] truncate text-xs font-medium">
                    {title}
                  </span>
                </div>
              </div>
            )}
            <div class="media-card-overlay pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-20 bg-linear-to-t from-black/45 to-transparent opacity-75" />
            {safeRating > 0 && (
              <div class="badge badge-warning badge-sm absolute bottom-3 left-3 z-20 inline-flex items-center justify-center gap-1 rounded-full px-3 py-3 font-bold shadow-sm">
                <RatingStar />
                <span class="inline-flex items-center leading-none">
                  {safeRating.toFixed(1)}
                </span>
              </div>
            )}
            {year > 0 && (
              <div class="badge badge-neutral badge-sm absolute right-3 bottom-3 z-20 rounded-full px-3 py-3 font-semibold shadow-sm">
                {year}
              </div>
            )}
          </figure>
          <div
            class={`media-card-body card-body bg-base-200/70 border-base-300/60 relative min-w-0 border-t px-3 py-2.5 ${bodyHeightClass}`}
          >
            <span class="card-title text-base-content line-clamp-2 block text-sm leading-tight">
              {title}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
