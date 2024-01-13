import type {  QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import type { ToastBody } from "./toastStack";
import { getIconByType } from "./utils";

export type ToastBodyComponentProps = {
  closeToast: QRL<() => void>;
} & ToastBody;

export const ToastBodyComponent = component$(
  ({ message, type, autocloseTime, closeToast }: ToastBodyComponentProps) => {
    return (
      <div
        id="toast"
        class={[
          autocloseTime
            ? "flex items-center justify-between p-4 bg-primary-100 shadow  dark:bg-primary-800 rounded-t-lg"
            : "flex items-center justify-between p-4 bg-primary-100 shadow  dark:bg-primary-800 rounded-lg",
        ]}
        role="alert"
      >
        <div class="flex items-center">
          <div class="flex items-center justify-center flex-shrink-0 w-8 h-8">
            {getIconByType(type)}
            <span class="sr-only">Check icon</span>
          </div>
          <div class="mx-3 text-sm font-normal">{message}</div>{" "}
        </div>

        <button
          type="button"
          class="hover:bg-primary-200 dark:hover:bg-primary-900 focus:outline-none focus:ring-0 focus:ring-primary-100 dark:focus:ring-primary-900 rounded-lg text-sm p-2.5"
          aria-label="Close"
          onClick$={closeToast}
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    );
  },
);
