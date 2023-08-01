import type { QRL } from "@builder.io/qwik";
import {
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useStore,
  $,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { ToastType } from "./toast";
import { Toast } from "./toast";
import { v4 as uuidv4 } from "uuid";

export const toastsFuncContext = createContextId<{
  addToast: QRL<(message: string, type: ToastType) => string>;
  removeToast: QRL<(id: string) => void>;
}>("toastsFuncContext");

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export const ToastStack = component$(() => {
  const toastsStore = useStore({ toasts: [] as Toast[] });
  const toastsFunc = useStore({
    addToast: $((message: string, type: ToastType) => {
      const ui = uuidv4();
      toastsStore.toasts.push({ id: ui, message, type });
      return ui;
    }),
    removeToast: $((id: string) => {
      toastsStore.toasts = toastsStore.toasts.filter(
        (toast) => toast.id !== id
      );
    }),
  });

  useContextProvider(toastsFuncContext, toastsFunc);

  useVisibleTask$(async () => { 
    toastsFunc.addToast("TorrServer already exists", "error");
    toastsFunc.addToast("TorrServer already exists sdsfsdf", "success");
    toastsFunc.addToast("TorrServer already exists", "warning");
    toastsFunc.addToast("TorrServer ", "info");
    });

  return (
    <>
      <div class="z-50 absolute top-10 right-10 md:w-80 w-72">
        {toastsStore.toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      <Slot />
    </>
  );
});
