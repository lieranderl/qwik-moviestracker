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
import { toastManagerContext } from "~/components/toast/toastStack";

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
      localStorage.setItem("selectedTorServer", values.ipaddress);
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

  return (
    <div class="container mx-auto px-4 pt-[64px]">
      <Form
        onSubmit$={handleSubmit}
        class="flex items-start justify-center !my-4"
      >
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
        <div class="my-1">
          <ButtonPrimary
            type="submit"
            disabled={newTorrServerForm.invalid}
            isLoading={isLoading.value}
            text="Add"
            size="sm"
          />
        </div>
      </Form>

      <section class="my-4 text-center">
        <select
          name=""
          id="attrib"
          value={selectedTorServer.value}
          class="mr-2 bg-teal-50 border border-teal-300 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 dark:bg-teal-950 dark:border-teal-600 dark:placeholder-teal-100 dark:focus:ring-teal-500 dark:focus:border-teal-500"
          onChange$={(_, e) => {
            selectedTorServer.value = e.value;
            localStorage.setItem("selectedTorServer", e.value);
          }}
          onClick$={(_, e) => {
            selectedTorServer.value = e.value;
            localStorage.setItem("selectedTorServer", e.value);
          }}
        >
          {torrServerStore.list.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </section>
      <section class="flex my-4 items-center justify-center">
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
      </section>
    </div>
  );
});
