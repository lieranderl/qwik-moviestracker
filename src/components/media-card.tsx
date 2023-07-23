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
    isHorizontal
  }: MovieCardProps) => {
    const height = useComputed$(() => {
      if (isHorizontal) {return width *3 / 2;}
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
          return "min-w-[100px] max-w-[150px]";
        }
        return "min-w-[150px] max-w-[200px]";
      } else {
        return "min-w-[300px] max-w-[500px]";
      }
      
    });

    return (
      <div class={cardWidthClass} style={cardWidthStyle}>
        {charName && (
          <span class="block truncate text-sm text-gray-700 dark:text-white ">
            {charName}
          </span>
        )}
        {!charName && <span class="block text-sm">&nbsp;</span>}
        <div class={["group"]}>
          <div class="drop-shadow transition-scale scale-95 duration-300 ease-in-out group-hover:scale-100 group-hover:drop-shadow-md">
            <picture>
              <img
                class="rounded-md border-2 border-base-300"
                src={"https://image.tmdb.org/t/p/w" + width + "/" + picfile}
                width={width}
                height={height.value}
                alt=""
              />
              {rating && (
                <span class="absolute bg-amber-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 bottom-2 left-2 rounded-full dark:bg-violet-900 dark:text-amber-300">
                  {rating.toFixed(1)}
                </span>
              )}
              {year && (
                <span class="absolute bg-amber-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 bottom-2 right-2 rounded-full dark:bg-violet-900 dark:text-amber-300">
                  {year}
                </span>
              )}
            </picture>
          </div>
          <span class="block truncate text-sm text-ellipsis overflow-hidden text-gray-900 dark:text-white transition-scale font-medium duration-300 ease-in-out group-hover:font-bold">
            {title}
          </span>
        </div>
      </div>
    );
  }
);
