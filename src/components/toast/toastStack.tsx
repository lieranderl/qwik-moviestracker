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
import type { ToastProps, ToastType } from "./toast";
import { Toast } from "./toast";
import { v4 as uuidv4 } from "uuid";

export const toastsFuncContext = createContextId<{
  addToast: QRL<(toast: ToastBody) => string>;
  removeToast: QRL<(id: string) => void>;
}>("toastsFuncContext");

export type ToastBody = {
    message: string;
    type: ToastType;
    autocloseTime?: number;
}

export const ToastStack = component$(() => {
  const toastsStore = useStore({ toasts: [] as ToastProps[] });
  const toastsFunc = useStore({
    addToast: $((toast: ToastBody) => {
      const ui = uuidv4();
      toastsStore.toasts.push({ ...toast, id: ui });
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
    toastsFunc.addToast({ message: "TorrServer already exists", type: "error", autocloseTime: 5000 });
    toastsFunc.addToast({ message: "TorrServer already exists sdsfsdf", type: "success" });
    toastsFunc.addToast({ message: "TorrServer already exists", type: "warning" });
    toastsFunc.addToast({ message: "TorrServer ", type: "info" });
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
