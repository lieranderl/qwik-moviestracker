/* eslint-disable qwik/no-use-visible-task */
import { component$, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { setValue, useForm, valiForm$ } from "@modular-forms/qwik";
import { server$ } from "@builder.io/qwik-city";
import { TorrentBlock } from "./torrent";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MovieDetails, Torrent } from "~/services/models";
import type { Input } from "valibot";
import { maxValue, minLength, minValue, number, object, string } from "valibot";
import { HiMagnifyingGlassCircleSolid } from "@qwikest/icons/heroicons";

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
            (torrents) => torrents.K4 == true,
          );
        }
        if (sortFilterStore.hdr) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR == true,
          );
        }
        if (sortFilterStore.hdr10) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR10 == true,
          );
        }

        if (sortFilterStore.hdr10plus) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.HDR10plus == true,
          );
        }

        if (sortFilterStore.dv) {
          sortedTorrents.value = initTorrents.value.filter(
            (torrents) => torrents.DV == true,
          );
        }

        sortedTorrents.value = sortedTorrents.value.sort((a, b) =>
          a[sortFilterStore.selectedSort as keyof typeof a] >
          b[sortFilterStore.selectedSort as keyof typeof b]
            ? -1
            : 1,
        );
      }
    });

    const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
      loader: { value: { name: title, year: year } },
      // action: useTorrSearchAction(),
      validate: valiForm$(searchTorrSchema),
    });

    const handleSubmit = $(async (values: SearchTorrForm) => {
      sortedTorrents.value = null;
      try {
        const torrents = await server$(
          ({ name, year, isMovie }: getTorrentsType) => {
            return getTorrents({ name: name, year: year, isMovie: isMovie });
          },
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

    useVisibleTask$((ctx) => {
      ctx.track(() => year);
      sortedTorrents.value = null;
      setValue(searchTorrForm, "year", year);
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
        {sortedTorrents.value !== null && (
          <div class="flex flex-wrap">
            <div class="me-4 flex  flex-wrap items-center justify-start">
              <div class="mr-2">Сортировать по:</div>
              <select
                onChange$={(_, e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  sortFilterStore.selectedSort = e.value;
                }}
                id="attrib"
                class="select select-bordered select-sm mr-2"
              >
                {sortAttrib.map((attrib) => (
                  <option value={attrib.value} key={attrib.value}>
                    {attrib.text}
                  </option>
                ))}
              </select>
            </div>

            <Form onSubmit$={handleSubmit} class="my-4 flex items-center">
              <div class="join">
                <Field name="name">
                  {(field, props) => (
                    <div>
                      <input
                        {...props}
                        type="text"
                        value={field.value}
                        placeholder="название"
                        class="input join-item input-bordered  input-sm   w-48 py-2  pl-2"
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
                        class="input join-item input-bordered input-sm mr-2 w-20 py-2 pl-2"
                        placeholder="год"
                      />
                      {field.error && (
                        <div class="text-xs text-error">{field.error}</div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <button
                type="submit"
                disabled={searchTorrForm.invalid}
                class="btn btn-circle btn-ghost text-4xl"
              >
                <HiMagnifyingGlassCircleSolid />
              </button>
            </Form>
          </div>
        )}

        {sortedTorrents.value !== null && (
          <div class="flex items-center">
            <div class="mr-2">
              <label
                class="label cursor-pointer"
                onChange$={(e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  if (e.target) {
                    sortFilterStore.k4 = (e.target as HTMLInputElement).checked;
                  }
                }}
              >
                <input type="checkbox" class="checkbox" />
                <span class="label-text ms-2">4K</span>
              </label>
            </div>
            <div class="mr-2">
              <label
                class="label cursor-pointer"
                onChange$={(e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  if (e.target) {
                    sortFilterStore.hdr = (
                      e.target as HTMLInputElement
                    ).checked;
                  }
                }}
              >
                <input type="checkbox" class="checkbox" />
                <span class="label-text ms-2">HDR</span>
              </label>
            </div>
            <div class="mr-2">
              <label
                class="label cursor-pointer"
                onChange$={(e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  if (e.target) {
                    sortFilterStore.hdr10 = (
                      e.target as HTMLInputElement
                    ).checked;
                  }
                }}
              >
                <input type="checkbox" class="checkbox" />
                <span class="label-text ms-2">HDR10</span>
              </label>
            </div>
            <div class="mr-2">
              <label
                class="label cursor-pointer"
                onChange$={(e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  if (e.target) {
                    sortFilterStore.hdr10plus = (
                      e.target as HTMLInputElement
                    ).checked;
                  }
                }}
              >
                <input type="checkbox" class="checkbox" />
                <span class="label-text ms-2">hdr10plus</span>
              </label>
            </div>
            <div class="mr-2">
              <label
                class="label cursor-pointer"
                onChange$={(e) => {
                  sortFilterStore.filterChecked =
                    !sortFilterStore.filterChecked;
                  if (e.target) {
                    sortFilterStore.dv = (e.target as HTMLInputElement).checked;
                  }
                }}
              >
                <input type="checkbox" class="checkbox" />
                <span class="label-text ms-2">DV</span>
              </label>
            </div>
          </div>
        )}

        <section class="my-4">
          {sortedTorrents.value === null && (
            <span class="loading loading-spinner loading-md"></span>
          )}
          {sortedTorrents.value !== null &&
            sortedTorrents.value.length === 0 && <div>Ничего не найдено</div>}
          {sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
            <div>Найдено {sortedTorrents.value.length} торрентов</div>
          )}
        </section>

        <section class="my-4">
          {sortedTorrents.value !== null &&
            sortedTorrents.value.map((torrent) => (
              <TorrentBlock
                torrent={torrent}
                movie={movie}
                key={torrent.Magnet}
              />
            ))}
        </section>
      </>
    );
  },
);
