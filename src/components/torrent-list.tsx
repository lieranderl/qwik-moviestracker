import {
  component$,
  $,
  useSignal,
  useVisibleTask$,
  useStore,
} from "@builder.io/qwik";
import { SearchSVG } from "~/utils/icons/searchSVG";
import type { SubmitHandler } from "@modular-forms/qwik";
import { useForm, zodForm$ } from "@modular-forms/qwik";

import { server$ } from "@builder.io/qwik-city";
import type { Torrent } from "~/services/types";
import { DotPulseLoader } from "./dot-pulse-loader/dot-pulse-loader";
import type { getTorrentsType } from "~/services/tmdb";
import { getTorrents } from "~/services/tmdb";
import { TorrentBlock } from "./torrent";
import type { SearchTorrForm } from "./torrents-list-modal";
import { searchTorrSchema } from "./torrents-list-modal";

interface TorrentListProps {
  torrents: Torrent[] | null;
  title: string;
  year: number;
  isMovie: boolean;
}

export const TorrentList = component$(
  ({ torrents, isMovie, title, year }: TorrentListProps) => {
    const sortAttrib = [
      { value: "Date", text: "Дате" },
      { value: "Size", text: "Размеру" },
      { value: "Seeds", text: "Сидам" },
      { value: "Leeches", text: "Личам" },
    ];

    const sortedTorrents = useStore({ value: torrents as Torrent[] | null });
    const selectedSort = useSignal("Date");

    const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
      loader: { value: { name: title, year: year } },
      // action: useTorrSearchAction(),
      validate: zodForm$(searchTorrSchema),
    });

    const handleSubmit: SubmitHandler<SearchTorrForm> = $(
      async (values: SearchTorrForm) => {
        sortedTorrents.value = null;
        const torrents = await server$(
          ({ name, year, isMovie }: getTorrentsType) => {
            return getTorrents({ name: name, year: year, isMovie: isMovie });
          }
        )({
          name: values.name,
          year: values.year,
          isMovie: isMovie,
        });
        if (torrents.length > 0) {
          sortedTorrents.value = torrents.sort((a, b) =>
            a[selectedSort.value] < b[selectedSort.value] ? -1 : 1
          );
          return;
        }
        sortedTorrents.value = [];
      }
    );

    useVisibleTask$((ctx) => {
      ctx.track(() => torrents);
      if (torrents) {
        sortedTorrents.value = torrents.sort((a, b) =>
          a[selectedSort.value] < b[selectedSort.value] ? -1 : 1
        );
      }
      console.log(sortedTorrents.value);
    });

    return (
      <>
        <div class="flex flex-wrap">
          <div class="flex flex-wrap  items-center justify-start me-4">
            <div class="mr-2">Сортировать по:</div>
            <select
              onChange$={(e) => {
                console.log(e.target.value);
                console.log(sortedTorrents.value);
                if (sortedTorrents.value) {
                  sortedTorrents.value = sortedTorrents.value.sort((a, b) =>
                    a[selectedSort.value] < b[selectedSort.value] ? -1 : 1
                  );
                }
              }}
              bind:value={selectedSort}
              id="attrib"
              class="mr-2 bg-teal-50 border border-teal-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
            >
              {sortAttrib.map((attrib) => (
                <option value={attrib.value} key={attrib.value}>
                  {attrib.text}
                </option>
              ))}
            </select>
          </div>

          <Form onSubmit$={handleSubmit} class="flex items-center !my-4">
            <Field name="name">
              {(field, props) => (
                <div>
                  <input
                    {...props}
                    type="text"
                    value={field.value}
                    placeholder="название"
                    class="py-2 pl-2 text-sm border border-teal-300 rounded-l-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
                  />
                  {field.error && (
                    <div class="text-xs text-red-400">{field.error}</div>
                  )}
                </div>
              )}
            </Field>
            <Field name="year" type="number">
              {(field, props) => (
                <div>
                  <input
                    {...props}
                    type="number"
                    value={field.value}
                    class="mr-2 py-2 pl-2 max-w-[83px] text-sm border border-teal-300 rounded-r-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
                    placeholder="год"
                  />
                  {field.error && (
                    <div class="text-xs text-red-400">{field.error}</div>
                  )}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={searchTorrForm.invalid}
              class="fill-teal-950 dark:fill-teal-50 hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
            >
              <SearchSVG />
            </button>
          </Form>
        </div>

        {sortedTorrents.value === null && <DotPulseLoader />}
        {sortedTorrents.value !== null && sortedTorrents.value.length === 0 && (
          <div>Ничего не найдено</div>
        )}
        {sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
          <div>Найдено {sortedTorrents.value.length} торрентов</div>
        )}

        <section class="my-4">
          {sortedTorrents.value !== null &&
            sortedTorrents.value.map((torrent) => (
              <>
                <TorrentBlock torrent={torrent} />
              </>
            ))}
        </section>
      </>
    );
  }
);
