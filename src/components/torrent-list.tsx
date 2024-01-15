/* eslint-disable qwik/no-use-visible-task */
import type { Signal } from "@builder.io/qwik";
import { component$, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { setValue, useForm, valiForm$ } from "@modular-forms/qwik";
import { server$ } from "@builder.io/qwik-city";
import { DotPulseLoader } from "./dot-pulse-loader/dot-pulse-loader";
import { TorrentBlock } from "./torrent";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MovieDetails, Torrent } from "~/services/models";
import type { Input } from "valibot";
import { maxValue, minLength, minValue, number, object, string } from "valibot";

const searchTorrSchema = object({
  name: string([minLength(3, "Please enter movie name.")]),
  year: number([
    minValue(1930, "Please enter a valid year."),
    maxValue(new Date().getFullYear(), "Please enter a valid year."),
  ]),
});

type SearchTorrForm = Input<typeof searchTorrSchema>;

export type TorrentListProps = {
  torrents: Torrent[] | null;
  title: string;
  year: number;
  isMovie: boolean;
  movie: MovieDetails;
};



export const TorrentList = component$(
  ({ torrents, isMovie, title, year, movie }: TorrentListProps) => {


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
          a[sortFilterStore.selectedSort as keyof typeof a] >
          b[sortFilterStore.selectedSort as keyof typeof b]
            ? -1
            : 1
        );
      }
    });

    const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
      loader: { value: { name: title, year: 0 } },
      // action: useTorrSearchAction(),
      validate: valiForm$(searchTorrSchema),
    });

    const handleSubmit = $(async (values: SearchTorrForm) => {
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
    });

    // useVisibleTask$((ctx) => {
    //   ctx.track(() => year.value);
    //   sortedTorrents.value = null;
    //   setValue(searchTorrForm, "year", year.value);
    // });

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
        {/* <div class="flex flex-wrap">
          <div class="flex flex-wrap  items-center justify-start me-4">
            <div class="mr-2">Сортировать по:</div>
            <select
              onChange$={(_, e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.selectedSort = e.value;
              }}
              id="attrib"
              class="mr-2 bg-primary border "
            >
              {sortAttrib.map((attrib) => (
                <option value={attrib.value} key={attrib.value}>
                  {attrib.text}
                </option>
              ))}
            </select>
          </div>

          <Form onSubmit$={handleSubmit} class="flex items-center my-4">
            <Field name="name">
              {(field, props) => (
                <div>
                  <input
                    {...props}
                    type="text"
                    value={field.value}
                    placeholder="название"
                    class="py-2 pl-2 w-48 text-sm border rounded-l-lg bg-primary"
                  />
                  {field.error && (
                    <div class="text-xs text-error">{field.error}</div>
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
                    class="mr-2 py-2 pl-2 w-20 text-sm"
                    placeholder="год"
                  />
                  {field.error && (
                    <div class="text-xs text-error">{field.error}</div>
                  )}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={searchTorrForm.invalid || sortedTorrents.value == null}
              class="fill-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
                width="1em"
                height="1em"
                data-qwikest-icon=""
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                ></path>
              </svg>
            </button>
          </Form>
        </div>

        <div class="flex items-center">
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                if (e.target) {
                  sortFilterStore.k4 = (e.target as HTMLInputElement).checked;
                }
              }}
            />
            <label>4K</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                if (e.target) {
                  sortFilterStore.hdr = (e.target as HTMLInputElement).checked;
                }
              }}
            />
            <label>HDR</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.hdr10 = (e.target as HTMLInputElement).checked;
              }}
            />
            <label>HDR10</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.hdr10plus = (
                  e.target as HTMLInputElement
                ).checked;
              }}
            />
            <label>HDR10+</label>
          </div>
          <div class="mr-2">
            <input
              type="checkbox"
              class="mr-2 w-4 h-4"
              onChange$={(e) => {
                sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
                sortFilterStore.dv = (e.target as HTMLInputElement).checked;
              }}
            />
            <label>DV</label>
          </div>
        </div> */}

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
            sortedTorrents.value.map((torrent) => (
             
                <TorrentBlock torrent={torrent} movie={movie} key={torrent.Magnet} />
          
            ))}
        </section>
      </>
    );
  }
);
