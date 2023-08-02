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
import { ButtonPrimary } from "~/components/button-primary";
import { DotPulseLoader } from "~/components/dot-pulse-loader/dot-pulse-loader";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import { toastManagerContext } from "~/components/toast/toastStack";
import { listTorrent, torrServerEcho } from "~/services/torrserver";
import { TSResult } from "~/services/types";
import { paths } from "~/utils/paths";

export const useContentLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  return { lang };
});

export const torrServerSchema = z.object({
  ipaddress: z.string().nonempty(" ").url(),
});

export type torrServerForm = z.infer<typeof torrServerSchema>;

export default component$(() => {
  const resource = useContentLoader();
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
          <Form
            onSubmit$={handleSubmit}
            class="flex items-start justify-end"
          >
            <Field name="ipaddress" >
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
            <div class="my-1">
              <ButtonPrimary
                type="submit"
                disabled={newTorrServerForm.invalid}
                isLoading={isLoading.value}
                text="+"
                size="sm"
              />
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
              <ButtonPrimary
                type="button"
                // disabled={newTorrServerForm.invalid}
                isLoading={isLoading.value}
                text="-"
                size="sm"
                onClick={$(() => {
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
              />
            </div>
          </section>
        </div>
      </div>

      {/* <section class="flex my-4 items-center justify-center">
        <div class="text-2xl font-bold mr-2">
          TorrServer: {selectedTorServer.value}
        </div>
        <div class="my-1">
          <ButtonPrimary
            type="button"
            // disabled={newTorrServerForm.invalid}
            isLoading={isLoading.value}
            text="Delete"
            size="sm"
            onClick={$(() => {
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
          />
        </div>
      </section> */}

      <section>
        {isCheckingTorrServer.value && <DotPulseLoader />}

        <MediaGrid title={""}>
          {torrentsSig.value.length > 0 &&
            torrentsSig.value.map((data) => {
              const m = JSON.parse(data.data);
              if (m.lampa || m.moviestracker) {
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
                        title={m.movie.title ? m.movie.title! : m.movie.name!}
                        width={300}
                        rating={m.movie.vote_average}
                        year={
                          m.movie.release_date
                            ? parseInt(
                                m.movie.release_date!.substring(0, 4),
                                10
                              )
                            : parseInt(
                                m.movie.first_air_date!.substring(0, 4),
                                10
                              )
                        }
                        picfile={m.movie.poster_path}
                        isPerson={false}
                        isHorizontal={false}
                      />
                    </a>
                  </>
                );
              }
            })}
        </MediaGrid>

        {torrentsSig.value.length === 0 && !isCheckingTorrServer.value && (
          <div>No Torrents</div>
        )}
      </section>
    </div>
  );
});
