import { component$, useComputed$ } from "@builder.io/qwik";

interface MovieCardProps {
  title: string;
  picfile: string;
  width: number;
  charName?: string;
  rating?: number;
  year?: number;
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
        return (width * 3) / 2;
      }
      return (width * 2) / 3;
    });

    const cardWidthStyle = useComputed$(() => {
      if (!isHorizontal) {
        if (isPerson) {
          return "width: 7vw";
        }
        return "width: 14vw;";
      } else {
        return "width: 20vw;";
      }
    });

    const cardWidthClass = useComputed$(() => {
      if (!isHorizontal) {
        if (isPerson) {
          return "min-w-[120px] max-w-[180px]";
        }
        return "min-w-[150px] max-w-[200px]";
      } else {
        return "min-w-[300px] max-w-[500px]";
      }
    });

    const colorClass =
      "bg-teal-50 text-teal-950 dark:bg-teal-950 dark:text-teal-50";

    return (
      <div class={cardWidthClass} style={cardWidthStyle}>
        {charName && (
          <span class="block truncate text-sm font-normal italic text-teal-950 dark:text-teal-50">
            {charName}
          </span>
        )}
        {!charName && <span class="block text-sm">&nbsp;</span>}
        <div class={["group"]}>
          <div class="drop-shadow transition-scale scale-95 duration-300 ease-in-out group-hover:scale-100 group-hover:drop-shadow-md">
            <picture>
              <img
                class="rounded-md border-2 border-base-300 border-white dark:border-teal-800"
                src={"https://image.tmdb.org/t/p/w" + width + "/" + picfile}
                width={width}
                height={height.value}
                alt=""
              />
              {rating && (
                <span
                  class={[
                    "absolute text-xs font-bold px-2.5 py-0.5 bottom-2 left-2 rounded-full",
                    colorClass,
                  ]}
                >
                  {rating.toFixed(1)}
                </span>
              )}
              {year && (
                <span
                  class={[
                    "absolute text-xs font-bold px-2.5 py-0.5 bottom-2 right-2 rounded-full",
                    colorClass,
                  ]}
                >
                  {year}
                </span>
              )}
            </picture>
          </div>
          <span class="block truncate text-sm text-ellipsis overflow-hidden text-teal-950 dark:text-teal-50 transition-scale font-normal duration-300 ease-in-out group-hover:font-extrabold">
            {title}
          </span>
        </div>
      </div>
    );
  }
);
