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
          <span class="text-base-content/70 before:text-base-content/40 mb-1 block truncate text-xs font-medium tracking-widest uppercase before:mr-2 before:content-['•']">
            {charName}
          </span>
        )}
        {!charName && <span class="block text-sm">&nbsp;</span>}
        <div class="card group bg-base-100 border-base-300/60 relative overflow-hidden border shadow-sm transition-all duration-200 ease-out active:scale-[0.995] md:hover:-translate-y-1 md:hover:shadow-xl">
          <figure class="relative overflow-hidden">
            <Image
              class="h-full w-full object-cover transition-transform duration-500 [transition-timing-function:cubic-bezier(.22,.61,.36,1)] md:group-hover:scale-[1.015] md:group-hover:brightness-105"
              src={
                picfile
                  ? `${TMDB_IMAGE_BASE_URL}w${width}${picfile}`
                  : `https://placehold.co/${width}x${height.value.toFixed(0)}/grey/black?text=${title}&font=inter`
              }
              width={width}
              height={height.value}
              alt={title}
            />
            <div class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-20 bg-linear-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-250 ease-out md:group-hover:opacity-100" />
            {rating > 0 && (
              <div class="badge badge-warning badge-sm border-base-100/55 bg-black/45 text-white absolute bottom-3 left-3 z-20 gap-1 border font-bold backdrop-blur-md transition-transform duration-200 md:group-hover:-translate-y-1">
                <span>★</span>
                <span>
                  {typeof rating === "string" ? rating : rating.toFixed(1)}
                </span>
              </div>
            )}
            {year > 0 && (
              <div class="badge badge-ghost badge-sm border-base-100/55 bg-black/40 text-white absolute right-3 bottom-3 z-20 border font-semibold backdrop-blur-md transition-transform duration-200 md:group-hover:-translate-y-1">
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
