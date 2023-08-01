import type { Signal } from "@builder.io/qwik";
import { component$, $, useVisibleTask$, useStore } from "@builder.io/qwik";
import { SearchSVG } from "~/utils/icons/searchSVG";
import { setValue, useForm, zodForm$ } from "@modular-forms/qwik";

import { server$, z } from "@builder.io/qwik-city";
import type { Torrent } from "~/services/types";
import { DotPulseLoader } from "./dot-pulse-loader/dot-pulse-loader";
import type { getTorrentsType } from "~/services/tmdb";
import { getTorrents } from "~/services/tmdb";
import { TorrentBlock } from "./torrent";


const searchTorrSchema = z.object({
  name: z.string().min(3, "Please enter movie name."),
  year: z
    .number()
    .int()
    .nonnegative()
    .max(new Date().getFullYear(), "Please enter a valid year."),
});

type SearchTorrForm = z.infer<typeof searchTorrSchema>;


interface TorrentListProps {
  torrents: Torrent[] | null;
  title: string;
  year: Signal<number>;
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

    const initTorrents = useStore({ value: torrents as Torrent[] | null });
    const sortedTorrents = useStore({ value: null as Torrent[] | null });
    const sortFilterStore = useStore({
      selectedSort: "Date" as string,
      filterChecked: false as boolean,
      k4: false as boolean,
      hdr: false as boolean,
      hdr10: false as boolean,
      hdr10plus: false as boolean,
      dv: false as boolean,
    });

    const filterTorrents = $(() => {
      if (initTorrents.value) {
        sortedTorrents.value = initTorrents.value;
        if (sortFilterStore.k4) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.K4 == true
          );
        }
        if (sortFilterStore.hdr) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR == true
          );
        }
        if (sortFilterStore.hdr10) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR10 == true
          );
        }

        if (sortFilterStore.hdr10plus) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR10plus == true
          );
        }

        if (sortFilterStore.dv) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.DV == true
          );
        }

        sortedTorrents.value = sortedTorrents.value.sort((a, b) =>
          a[sortFilterStore.selectedSort as keyof typeof a] > b[sortFilterStore.selectedSort as keyof typeof b]
            ? -1
            : 1
        );
      }
    });

    const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
      loader: { value: { name: title, year: 0 } },
      // action: useTorrSearchAction(),
      validate: zodForm$(searchTorrSchema),
    });

    const handleSubmit = $(
      async (values: SearchTorrForm) => {
        sortedTorrents.value = null;
        try {
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
            initTorrents.value = torrents;
            return;
          }
        } catch (error) {
          sortedTorrents.value = [];
        }

        sortedTorrents.value = [];
      }
    );

    useVisibleTask$((ctx) => {
      ctx.track(() => year.value);
      sortedTorrents.value = null;
      setValue(searchTorrForm, "year", year.value);
    });

    useVisibleTask$((ctx) => {
      ctx.track(() => torrents);
      initTorrents.value = torrents;
    });

    useVisibleTask$((ctx) => {
      ctx.track(() => initTorrents.value);
      ctx.track(() => sortFilterStore.filterChecked);
      filterTorrents();
    });

    return (
      <>
        <div class="flex flex-wrap">
          <div class="flex flex-wrap  items-center justify-start me-4">
            <div class="mr-2">Сортировать по:</div>
            <select
              onChange$={(_, e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.selectedSort = e.value;
              }}
              // bind:value={sortFilterStore.selectedSort}
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
                    class="py-2 pl-2 w-48 text-sm border border-teal-300 rounded-l-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
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
                    class="mr-2 py-2 pl-2 w-20 text-sm border border-teal-300 rounded-r-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
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
              disabled={searchTorrForm.invalid || sortedTorrents.value == null}
              class="fill-teal-950 dark:fill-teal-50 hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
            >
              <SearchSVG />
            </button>
          </Form>
        </div>

        <div class="flex items-center">
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4 text-teal-600 bg-teal-100 border-teal-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-teal-800 focus:ring-2 dark:bg-teal-700 dark:border-teal-600"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.k4 = e.target.checked;
              }}
            />
            <label>4K</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4 text-teal-600 bg-teal-100 border-teal-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-teal-800 focus:ring-2 dark:bg-teal-700 dark:border-teal-600"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.hdr = e.target.checked;
              }}
            />
            <label>HDR</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4 text-teal-600 bg-teal-100 border-teal-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-teal-800 focus:ring-2 dark:bg-teal-700 dark:border-teal-600"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.hdr10 = e.target.checked;
              }}
            />
            <label>HDR10</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4 text-teal-600 bg-teal-100 border-teal-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-teal-800 focus:ring-2 dark:bg-teal-700 dark:border-teal-600"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.hdr10plus = e.target.checked;
              }}
            />
            <label>HDR10+</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4 text-teal-600 bg-teal-100 border-teal-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-teal-800 focus:ring-2 dark:bg-teal-700 dark:border-teal-600"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.dv = e.target.checked;
              }}
            />
            <label>DV</label>
          </div>
        </div>

        <section class="my-4">
          {sortedTorrents.value === null && <DotPulseLoader />}
          {sortedTorrents.value !== null &&
            sortedTorrents.value.length === 0 && <div>Ничего не найдено</div>}
          {sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
            <div>Найдено {sortedTorrents.value.length} торрентов</div>
          )}
        </section>

        <section class="my-4">
          {sortedTorrents.value !== null &&
            sortedTorrents.value.map((torrent, key) => (
              <>
                <TorrentBlock torrent={torrent} key={key} />
              </>
            ))}
        </section>
      </>
    );
  }
);
