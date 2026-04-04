import { $, component$, useStore, useTask$ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { setValue, useForm } from "@modular-forms/qwik";
import { HiMagnifyingGlassOutline } from "@qwikest/icons/heroicons";
import type { getTorrentsType } from "~/services/cloud-func-api";
import { getTorrents } from "~/services/cloud-func-api";
import type { MovieDetails, Torrent } from "~/services/models";
import { filterAndSortTorrents } from "~/utils/filter-utils";
import {
  langDate,
  langFound,
  langLeeches,
  langNotFound,
  langSeeds,
  langSize,
  langSortOn,
  langTorrentov,
} from "~/utils/languages";
import { TorrentBlock } from "./torrent";

type SearchTorrForm = {
  name: string;
  year: number;
};

type FilterKey = "k4" | "hdr" | "hdr10" | "hdr10plus" | "dv";

export type TorrentListProps = {
  torrents: Torrent[] | null;
  title: string;
  year: number;
  isMovie: boolean;
  movie: MovieDetails;
  lang: string;
};

export const TorrentList = component$(
  ({ torrents, isMovie, title, year, movie, lang }: TorrentListProps) => {
    const titlePlaceholder = lang === "en-US" ? "title" : "название";
    const yearPlaceholder = lang === "en-US" ? "year" : "год";
    const resetFiltersLabel =
      lang === "en-US" ? "Reset filters" : "Сбросить фильтры";

    const sortAttrib = [
      { value: "Date", text: langDate(lang) },
      { value: "Size", text: langSize(lang) },
      { value: "Seeds", text: langSeeds(lang) },
      { value: "Leeches", text: langLeeches(lang) },
    ];
    const filterOptions: Array<{ key: FilterKey; label: string }> = [
      { key: "k4", label: "4K" },
      { key: "hdr", label: "HDR" },
      { key: "hdr10", label: "HDR10" },
      { key: "hdr10plus", label: "HDR10+" },
      { key: "dv", label: "DV" },
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
        sortedTorrents.value = filterAndSortTorrents(
          initTorrents.value,
          sortFilterStore,
        );
      }
    });
    const touchFilters = $(() => {
      sortFilterStore.filterChecked = !sortFilterStore.filterChecked;
    });
    const setSort = $((value: string) => {
      sortFilterStore.selectedSort = value;
      touchFilters();
    });
    const setFilter = $((key: FilterKey, checked: boolean) => {
      sortFilterStore[key] = checked;
      touchFilters();
    });
    const resetFilters = $(() => {
      for (const { key } of filterOptions) {
        sortFilterStore[key] = false;
      }
      touchFilters();
    });

    const [searchTorrForm, { Form, Field }] = useForm<SearchTorrForm>({
      loader: { value: { name: title, year: year } },
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
        console.error(error);
        sortedTorrents.value = [];
      }

      sortedTorrents.value = [];
    });

    useTask$((ctx) => {
      ctx.track(() => year);
      sortedTorrents.value = null;
      setValue(searchTorrForm, "year", year);
    });

    useTask$((ctx) => {
      ctx.track(() => torrents);
      initTorrents.value = torrents;
    });

    useTask$((ctx) => {
      ctx.track(() => initTorrents.value);
      ctx.track(() => sortFilterStore.filterChecked);
      filterTorrents();
    });

    return (
      <>
        {sortedTorrents.value !== null && (
          <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label class="form-control">
              <div class="label px-0 pt-0 pb-1">
                <span class="label-text font-medium">{langSortOn(lang)}</span>
              </div>
              <select
                value={sortFilterStore.selectedSort}
                onChange$={(_, element) => {
                  setSort(element.value);
                }}
                class="select select-bordered select-sm min-w-40"
              >
                {sortAttrib.map((attrib) => (
                  <option value={attrib.value} key={attrib.value}>
                    {attrib.text}
                  </option>
                ))}
              </select>
            </label>

            <Form
              onSubmit$={handleSubmit}
              class="flex flex-wrap items-start gap-2"
            >
              <div class="join">
                <Field name="name">
                  {(field, props) => (
                    <div>
                      <input
                        {...props}
                        type="text"
                        placeholder={titlePlaceholder}
                        class="input input-bordered input-sm join-item w-48"
                      />
                      {field.error && (
                        <div class="text-error text-xs">{field.error}</div>
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
                        class="input input-bordered input-sm join-item w-20"
                        placeholder={yearPlaceholder}
                      />
                      {field.error && (
                        <div class="text-error text-xs">{field.error}</div>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <button
                type="submit"
                disabled={searchTorrForm.invalid}
                class="btn btn-primary btn-sm btn-square"
              >
                <HiMagnifyingGlassOutline class="h-5 w-5" />
              </button>
            </Form>
          </div>
        )}

        {sortedTorrents.value !== null && (
          <form
            onReset$={resetFilters}
            class="mb-4 flex flex-wrap items-center gap-2"
          >
            {filterOptions.map(({ key, label }) => (
              <input
                key={key}
                class="btn btn-sm"
                type="checkbox"
                checked={sortFilterStore[key]}
                aria-label={label}
                onChange$={(_, element) => {
                  setFilter(key, element.checked);
                }}
              />
            ))}
            <input
              class="btn btn-square btn-sm"
              type="reset"
              value="×"
              aria-label={resetFiltersLabel}
            />
          </form>
        )}

        <section class="my-4">
          {sortedTorrents.value === null && (
            <span class="loading loading-spinner loading-md" />
          )}
          {sortedTorrents.value !== null &&
            sortedTorrents.value.length === 0 && (
              <div>{langNotFound(lang)}</div>
            )}
          {sortedTorrents.value !== null && sortedTorrents.value.length > 0 && (
            <div>
              {langFound(lang)} {sortedTorrents.value.length}{" "}
              {langTorrentov(lang)}
            </div>
          )}
        </section>

        <section class="my-4">
          {sortedTorrents.value?.map((torrent) => (
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
