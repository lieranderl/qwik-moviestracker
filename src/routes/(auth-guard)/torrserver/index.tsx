/* eslint-disable qwik/no-use-visible-task */
import {
  component$,
  $,
  useSignal,
  useStore,
  useVisibleTask$,
  useContext,
} from "@builder.io/qwik";
import { setValue, useForm, valiForm$ } from "@modular-forms/qwik";
import { ToastManagerContext } from "qwik-toasts";
import type { Input } from "valibot";
import { object, string, url } from "valibot";
import { MediaCard } from "~/components/media-card";
import { MediaGrid } from "~/components/media-grid";
import type { TSResult } from "~/services/models";
import {
  listTorrent,
  removeTorrent,
  torrServerEcho,
} from "~/services/torrserver";
import { useQueryParamsLoader } from "~/shared/loaders";
import { langAddNewTorrServerURL, langNoResults } from "~/utils/languages";

export const torrServerSchema = object({
  ipaddress: string([url("Please valid url!")]),
});

export type torrServerForm = Input<typeof torrServerSchema>;

export default component$(() => {
  const resource = useQueryParamsLoader();
  const toastManager = useContext(ToastManagerContext);
  const selectedTorServer = useSignal("");
  const isLoading = useSignal(false);
  const torrServerStore = useStore({ list: [] as string[] });
  const [newTorrServerForm, { Form, Field }] = useForm<torrServerForm>({
    loader: { value: { ipaddress: "" } },
    // action: useTorrSearchAction(),
    validate: valiForm$(torrServerSchema),
  });

  const isCheckingTorrServer = useSignal(false);
  const torrentsSig = useSignal([] as TSResult[]);

  const addTorrserver = $(async (values: torrServerForm): Promise<any> => {
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
      JSON.stringify(torrServerStore.list),
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
    const tlist = localStorage.getItem("torrServerList");
    if (tlist) {
      torrServerStore.list = JSON.parse(tlist) || [];
    } else {
      torrServerStore.list = [];
    }
    selectedTorServer.value = localStorage.getItem("selectedTorServer") || "";
    if (selectedTorServer.value === "") {
      localStorage.setItem("selectedTorServer", torrServerStore.list[0] || "");
      localStorage.setItem("torrServerList", JSON.stringify([]));
    } else {
      if (torrServerStore.list.length === 0) {
        localStorage.setItem(
          "torrServerList",
          JSON.stringify([selectedTorServer.value]),
        );
      } else {
        localStorage.setItem(
          "torrServerList",
          JSON.stringify(torrServerStore.list),
        );
      }
    }
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
      <div class="my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <div class="col-span-2 col-start-1 md:col-start-3">
          <Form onSubmit$={addTorrserver} class="flex items-start justify-end">
            <Field name="ipaddress">
              {(field, props) => (
                <div>
                  <input
                    {...props}
                    type="text"
                    value={field.value}
                    placeholder={langAddNewTorrServerURL(resource.value.lang)}
                    class="border-primary-300 focus:ring-primary-600 focus:border-primary-600 dark:bg-primary-dark dark:border-primary-600 dark:placeholder-primary-100 dark:focus:ring-primary-600 dark:focus:border-primary-600 placeholder-primary-900 mr-2 w-64 rounded-lg border bg-primary py-2 pl-2 text-sm"
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
                class="hover:bg-primary-100 dark:hover:bg-primary-900 focus:ring-primary-100 dark:focus:ring-primary-900 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-primary-600 h-5 w-5"
                  viewBox="0 0 448 512"
                >
                  <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                </svg>
              </button>
            </div>
          </Form>
        </div>

        <div class="col-span-2 col-start-1 md:col-start-3">
          <section class="my-2 flex items-center justify-end">
            <select
              name=""
              id="attrib"
              value={selectedTorServer.value}
              class=" border-primary-300 focus:ring-primary-600 focus:border-primary-600 dark:bg-primary-dark dark:border-primary-600 dark:placeholder-primary-100 dark:focus:ring-primary-600 dark:focus:border-primary-600 mr-2 rounded-lg border bg-primary text-sm"
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
                class="hover:bg-primary-100 dark:hover:bg-primary-900 focus:ring-primary-100 dark:focus:ring-primary-900 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-0"
                onClick$={() => {
                  const index = torrServerStore.list.indexOf(
                    selectedTorServer.value,
                  );
                  if (index > -1) {
                    torrServerStore.list.splice(index, 1);
                    localStorage.setItem(
                      "torrServerList",
                      JSON.stringify(torrServerStore.list),
                    );
                    toastManager.addToast({
                      message: `Torrserver ${selectedTorServer.value} has been deleted.`,
                      type: "success",
                      autocloseTime: 5000,
                    });
                    selectedTorServer.value = "";
                    localStorage.setItem("selectedTorServer", "");
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="fill-primary-600 h-5 w-5"
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
        {isCheckingTorrServer.value && (
          <span class="loading loading-spinner loading-lg"></span>
        )}
        <MediaGrid title={""}>
          {torrentsSig.value.length > 0 &&
            torrentsSig.value.map((t) => {
              if (!t.data) {
                return;
              }
              const m = JSON.parse(t.data);
              return (
                <div key={t.hash} class="relative">
                  <div
                    onClick$={async () => {
                      const torrserv =
                        localStorage.getItem("selectedTorServer") || "";
                      if (torrserv === "") {
                        toastManager.addToast({
                          message: "TorrServer has not been added!",
                          type: "error",
                          autocloseTime: 5000,
                        });
                        return;
                      }
                      try {
                        try {
                          await removeTorrent(torrserv, t.hash);
                        } catch (error) {
                          console.log("");
                        }

                        toastManager.addToast({
                          message: "Torrent has been deleted!",
                          type: "success",
                          autocloseTime: 5000,
                        });

                        torrentsSig.value = await listTorrent(
                          selectedTorServer.value,
                        );
                      } catch (error) {
                        const e = error as Error;
                        toastManager.addToast({
                          message: e.message || "Unable to delete torrent!",
                          type: "error",
                          autocloseTime: 5000,
                        });
                      }
                    }}
                    class="transition-scale absolute -right-1 top-4 z-10 scale-[90%] cursor-pointer rounded-full text-primary duration-300 ease-in-out hover:scale-[110%]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="h-10 w-10 fill-red-500 "
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <a
                    href={`magnet:?xt=urn:btih:${t.hash}`}
                    target="_blank"
                    class="dark:bg-primary-dark transition-scale absolute left-0 top-[1.2rem] z-10 scale-[85%] cursor-pointer rounded-full border-2  bg-primary duration-300 ease-in-out hover:scale-[105%]"
                  >
                    <svg
                      class="fill-primary-dark w-8 dark:fill-primary"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M871.6288 549.96992a20.45952 20.45952 0 0 0 0-28.95872l-95.9488-95.96928a20.48 20.48 0 0 0-28.95872 0l-204.36992 204.36992c-16.36352 15.872-37.33504 24.61696-59.04384 24.61696-19.18976 0-36.88448-7.12704-49.80736-20.04992-28.40576-28.40576-26.23488-77.33248 4.73088-109.01504l126.976-126.99648 77.18912-77.18912a20.45952 20.45952 0 0 0 0-28.95872l-95.9488-95.96928a20.48 20.48 0 0 0-14.49984-6.00064h-0.02048a20.56192 20.56192 0 0 0-14.49984 6.0416l-77.14816 77.16864-2.31424 2.31424-134.94272 134.9632c-102.62528 104.98048-107.64288 268.86144-11.18208 365.32224 44.8512 44.8512 105.71776 69.55008 171.37664 69.55008 71.35232 0 139.93984-28.40576 193.024-79.89248 1.24928-1.18784 213.23776-213.1968 215.38816-215.3472zM531.98848 239.3088l66.99008 66.99008-48.25088 48.2304-66.99008-66.99008 48.25088-48.2304z m95.80544 496.5376c-45.48608 44.11392-103.936 68.42368-164.57728 68.42368-54.72256 0-105.30816-20.43904-142.41792-57.56928-80.65024-80.65024-75.48928-218.70592 11.4688-307.63008l122.53184-122.55232 66.99008 66.99008-112.7424 112.76288c-46.67392 47.7184-48.68096 122.49088-4.5056 166.7072 20.66432 20.66432 48.64 32.03072 78.76608 32.03072 32.39936 0 63.50848-12.84096 87.77728-36.39296l112.7424-112.7424 66.99008 66.99008-123.02336 122.9824z m151.98208-151.94112l-66.99008-66.99008 48.41472-48.41472 66.99008 66.99008-48.41472 48.41472z"
                        fill=""
                      />
                    </svg>
                  </a>

                  <a
                    href={
                      m.movie.seasons
                        ? "/tv/" + m.movie.id
                        : "/movie/" + m.movie.id
                    }
                    target="_blank"
                  >
                    <MediaCard
                      title={m.movie.title || m.movie.name || t.title}
                      width={300}
                      rating={m.movie ? m.movie.vote_average : null}
                      year={
                        m.movie
                          ? parseInt(
                              m.movie.release_date
                                ? m.movie.release_date!.substring(0, 4)
                                : m.movie.first_air_date!.substring(0, 4),
                              10,
                            )
                          : 0
                      }
                      picfile={t.poster}
                      isPerson={false}
                      isHorizontal={false}
                    />
                  </a>
                </div>
              );
            })}
        </MediaGrid>
        {torrentsSig.value.length === 0 && !isCheckingTorrServer.value && (
          <div>{langNoResults(resource.value.lang)}</div>
        )}
      </section>
    </div>
  );
});
