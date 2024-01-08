import type { QRL } from "@builder.io/qwik";
import {
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useStore,
  $,
} from "@builder.io/qwik";
import type { ToastProps, ToastType } from "./toast";
import { Toast } from "./toast";
import { v4 as uuidv4 } from "uuid";

export const toastManagerContext = createContextId<{
  addToast: QRL<(toast: ToastBody) => string>;
  removeToast: QRL<(id: string) => void>;
}>("toastManagerContext");

export type ToastBody = {
  message: string;
  type: ToastType;
  autocloseTime?: number;
};

export const ToastStack = component$(() => {
  const toastsStore = useStore({ toasts: [] as ToastProps[] });
  const toastManager = useStore({
    addToast: $((toast: ToastBody) => {
      const ui = uuidv4();
      toastsStore.toasts.push({ ...toast, id: ui });
      return ui;
    }),
    removeToast: $((id: string) => {
      toastsStore.toasts = toastsStore.toasts.filter(
        (toast) => toast.id !== id,
      );
    }),
  });

  useContextProvider(toastManagerContext, toastManager);

  return (
    <>
      <div class="z-[1000] fixed bottom-10 right-10 md:w-80 w-72">
        {toastsStore.toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      <Slot />
    </>
  );
});
