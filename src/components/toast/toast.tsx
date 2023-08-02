import {
  component$,
  $,
  useContext,
  useVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import type { ToastBody } from "./toastStack";
import { toastManagerContext } from "./toastStack";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastId = {
  id: string;
};

export type ToastProps = ToastBody & ToastId;

export const Toast = component$(
  ({ id, message, type, autocloseTime }: ToastProps) => {
    const toastsFunc = useContext(toastManagerContext);

    const icon = $((type: ToastType) => {
      switch (type) {
        case "success":
          return (
            <svg
              class="fill-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
            </svg>
          );
        case "error":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class=" fill-red-500"
              viewBox="0 0 512 512"
            >
              <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
            </svg>
          );
        case "warning":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="fill-yellow-500"
              viewBox="0 0 512 512"
            >
              <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
            </svg>
          );
        case "info":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="fill-blue-500"
              viewBox="0 0 512 512"
            >
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
            </svg>
          );
        default:
          return <></>;
      }
    });
    const animClas = useSignal("animate-slide-in-right");
    const closeToast = $(() => {
      console.log("closeToast", id);
      animClas.value = "animate-slide-out-right";
      setTimeout(() => {
        toastsFunc.removeToast(id);
      }, 400);
    });

    useVisibleTask$(() => {
      if (autocloseTime) {
        if (autocloseTime > 0) {
          setTimeout(() => {
            animClas.value = "animate-slide-out-right";

            setTimeout(() => {
              toastsFunc.removeToast(id);
            }, 400);
          }, autocloseTime);
        }
      }
    });

    return (
      <>
        <div class={[animClas.value, "mb-4"]}>
          <div
            id="toast"
            class={[
              autocloseTime
                ? "flex items-center justify-between p-4 bg-teal-100 shadow  dark:bg-teal-800 rounded-t-lg"
                : "flex items-center justify-between p-4 bg-teal-100 shadow  dark:bg-teal-800 rounded-lg",
            ]}
            role="alert"
          >
            <div class="flex items-center">
              <div class="flex items-center justify-center flex-shrink-0 w-8 h-8">
                {icon(type)}
                <span class="sr-only">Check icon</span>
              </div>
              <div class="mx-3 text-sm font-normal">{message}</div>{" "}
            </div>

            <button
              type="button"
              class="hover:bg-teal-200 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
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
          {autocloseTime && <ToastProgressBar progress={autocloseTime} />}
        </div>
      </>
    );
  }
);

interface ToastProgressBarProps {
  progress: number;
}

export const ToastProgressBar = component$(
  ({ progress }: ToastProgressBarProps) => {
    return (
      <div class="w-full bg-teal-200 rounded-b-lg h-1.5 dark:bg-teal-700">
        <div
          class="bg-teal-100 h-1.5 dark:bg-teal-900 rounded-b-lg animate-progress-slide"
          style={`--bar-duration:${progress}ms`}
        ></div>
      </div>
    );
  }
);

export const ToastBodyComponent = component$(() => {
  return (
    <div
      id="toast"
      class={[
        autocloseTime
          ? "flex items-center justify-between p-4 bg-teal-100 shadow  dark:bg-teal-800 rounded-t-lg"
          : "flex items-center justify-between p-4 bg-teal-100 shadow  dark:bg-teal-800 rounded-lg",
      ]}
      role="alert"
    >
      <div class="flex items-center">
        <div class="flex items-center justify-center flex-shrink-0 w-8 h-8">
          {icon(type)}
          <span class="sr-only">Check icon</span>
        </div>
        <div class="mx-3 text-sm font-normal">{message}</div>{" "}
      </div>

      <button
        type="button"
        class="hover:bg-teal-200 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
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
});
