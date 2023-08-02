import {
  component$,
  $,
  useSignal,
  useStore,
  useVisibleTask$,
  useContext,
} from "@builder.io/qwik";
import { routeLoader$, z } from "@builder.io/qwik-city";
import { setValue, useForm, zodForm$ } from "@modular-forms/qwik";
import { DotPulseLoader } from "~/components/dot-pulse-loader/dot-pulse-loader";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { toastManagerContext } from "~/components/toast/toastStack";
import { listTorrent, torrServerEcho } from "~/services/torrserver";
import type { TSResult } from "~/services/types";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  return { lang };
});

export const torrServerSchema = z.object({
  ipaddress: z.string().nonempty(" ").url(),
});

export type torrServerForm = z.infer<typeof torrServerSchema>;

export default component$(() => {
  const toastManager = useContext(toastManagerContext);
  const selectedTorServer = useSignal("");
  const isLoading = useSignal(false);
  const torrServerStore = useStore({ list: [] as string[] });
  const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
    loader: { value: { ipaddress: "" } },
    // action: useTorrSearchAction(),
    validate: zodForm$(torrServerSchema),
  });

  const isCheckingTorrServer = useSignal(false);
  const torrentsSig = useSignal([] as TSResult[]);

  const handleSubmit = $(async (values: torrServerForm) => {
    isLoading.value = true;
    if (torrServerStore.list.includes(values.ipaddress)) {
      isLoading.value = false;
      setValue(newTorrServerForm, "ipaddress", "");
      toastManager.addToast({
        message: `TorrServer ${values.ipaddress} is already in the list!`,
        type: "error",
        autocloseTime: 5000,
      });
      return;
    }
    torrServerStore.list.push(values.ipaddress);
    if (torrServerStore.list.length === 1) {
      selectedTorServer.value = values.ipaddress;
    }
    localStorage.setItem(
      "torrServerList",
      JSON.stringify(torrServerStore.list)
    );
    toastManager.addToast({
      message: `Torrserver ${values.ipaddress} has been added.`,
      type: "success",
      autocloseTime: 5000,
    });
    setValue(newTorrServerForm, "ipaddress", "");
    isLoading.value = false;
  });

  useVisibleTask$(async () => {
    const tors = localStorage.getItem("torrServerList");
    if (tors) {
      torrServerStore.list = JSON.parse(tors) || [];
    }
    selectedTorServer.value = localStorage.getItem("selectedTorServer") || "";
  });

  useVisibleTask$(async (ctx) => {
    ctx.track(() => selectedTorServer.value);
    torrentsSig.value = [];

    if (!selectedTorServer.value) {
      return;
    }
    try {
      isCheckingTorrServer.value = true;
      const version = await torrServerEcho(selectedTorServer.value);
      toastManager.addToast({
        message: `Connected to server ${selectedTorServer.value} Vesion: ${version}`,
        type: "success",
        autocloseTime: 5000,
      });
      localStorage.setItem("selectedTorServer", selectedTorServer.value);
      isCheckingTorrServer.value = false;
      torrentsSig.value = await listTorrent(selectedTorServer.value);
    } catch (error) {
      toastManager.addToast({
        message: `Failed to reach TorrServer ${selectedTorServer.value}`,
        type: "error",
        autocloseTime: 5000,
      });
      isCheckingTorrServer.value = false;
    }
  });

  return (
    <div class="container mx-auto px-4 pt-[64px]">
      <div class="grid md:grid-cols-6 my-4 sm:grid-cols-3 grid-cols-2">
        <div class="md:col-start-3 col-span-2 col-start-1">
          <Form onSubmit$={handleSubmit} class="flex items-start justify-end">
            <Field name="ipaddress">
              {(field, props) => (
                <div>
                  <input
                    {...props}
                    type="text"
                    value={field.value}
                    placeholder="Add New TorrServer URL..."
                    class="w-64 mr-2 py-2 pl-2 text-sm border border-teal-300 rounded-lg bg-teal-50 focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500 placeholder-teal-900"
                  />
                  {field.error && (
                    <div class="text-xs text-red-400">{field.error}</div>
                  )}
                </div>
              )}
            </Field>
            <div class="mb-3">
              <button
                type="submit"
                disabled={newTorrServerForm.invalid}
                class="hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-teal-500 w-5 h-5"
                  viewBox="0 0 448 512"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                </svg>
              </button>
            </div>
          </Form>
        </div>

        <div class="md:col-start-3 col-span-2 col-start-1">
          <section class="flex my-2 justify-end items-center">
            <select
              name=""
              id="attrib"
              value={selectedTorServer.value}
              class=" mr-2 bg-teal-50 border border-teal-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
              onChange$={(_, e) => {
                selectedTorServer.value = e.value;
              }}
            >
              {torrServerStore.list.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
            <div class="my-1">
              <button
                type="button"
                class="hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
                onClick$={$(() => {
                  const index = torrServerStore.list.indexOf(
                    selectedTorServer.value
                  );
                  if (index > -1) {
                    torrServerStore.list.splice(index, 1);
                    localStorage.setItem(
                      "torrServerList",
                      JSON.stringify(torrServerStore.list)
                    );
                    toastManager.addToast({
                      message: `Torrserver ${selectedTorServer.value} has been deleted.`,
                      type: "success",
                      autocloseTime: 5000,
                    });
                    selectedTorServer.value = "";
                    localStorage.setItem("selectedTorServer", "");
                  }
                })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-teal-500 w-5 h-5"
                  viewBox="0 0 448 512"
                >
                  <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>
      <section>
        {isCheckingTorrServer.value && <DotPulseLoader />}
        <MediaGrid title={""}>
          {torrentsSig.value.length > 0 &&
            torrentsSig.value.map((data) => {
              const m = JSON.parse(data.data);
              //   if (m.lampa || m.moviestracker) {
              return (
                <>
                  <a
                    href={`magnet:?xt=urn:btih:${data.hash}`}
                    //   href={paths.media(
                    //     m.movie.seasons ? "tv" : "movie",
                    //     m.movie.id,
                    //     resource.value.lang
                    //   )}
                  >
                    <MediaCard
                      title={data.title}
                      width={300}
                      rating={m.movie ? m.movie.vote_average : null}
                      year={
                        m.movie
                          ? parseInt(
                              m.movie.release_date
                                ? m.movie.release_date!.substring(0, 4)
                                : m.movie.first_air_date!.substring(0, 4),
                              10
                            )
                          : 0
                      }
                      picfile={data.poster}
                      isPerson={false}
                      isHorizontal={false}
                    />
                  </a>
                </>
              );
              //   }
            })}
        </MediaGrid>
        {torrentsSig.value.length === 0 && !isCheckingTorrServer.value && (
          <div>No Torrents</div>
        )}
      </section>
    </div>
  );
});
