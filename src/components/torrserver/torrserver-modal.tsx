import {
  $,
  component$,
  type PropFunction,
  Slot,
  useId,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

export interface TorrServerModalProps {
  closeLabel?: string;
  id?: string;
  maxWidth?: string;
  onClose$?: PropFunction<() => void>;
  open: boolean;
  subtitle?: string;
  title: string;
}

export const TorrServerModal = component$(
  ({
    id,
    closeLabel = "Close",
    maxWidth = "max-w-5xl",
    onClose$,
    open,
    subtitle,
    title,
  }: TorrServerModalProps) => {
    const internalId = useId();
    const dialogId = id ?? internalId;
    const dialogRef = useSignal<HTMLDialogElement>();

    const close = $(() => {
      onClose$?.();
    });

    useTask$(({ track }) => {
      const shouldOpen = track(() => open);
      const dialog = dialogRef.value;
      if (!dialog || typeof dialog.showModal !== "function") {
        return;
      }

      if (shouldOpen && !dialog.open) {
        dialog.showModal();
        return;
      }

      if (!shouldOpen && dialog.open) {
        dialog.close();
      }
    });

    return (
      <dialog
        id={dialogId}
        ref={dialogRef}
        class="modal"
        onClose$={close}
        onCancel$={close}
      >
        <div
          class={`modal-box border-base-200 bg-base-100 max-h-[calc(100dvh-2rem)] w-11/12 overflow-y-auto border p-0 shadow-xl ${maxWidth}`}
        >
          <div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-4 py-4 backdrop-blur sm:px-5">
            <div class="min-w-0 space-y-1">
              <h3 class="truncate text-xl font-semibold">{title}</h3>
              {subtitle && (
                <p class="text-base-content/65 line-clamp-2 text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <form method="dialog">
              <button
                type="submit"
                aria-label={closeLabel}
                class="btn btn-ghost btn-circle min-h-11 w-11 p-0"
              >
                ✕
              </button>
            </form>
          </div>

          <div class="space-y-4 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <Slot />
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit">{title}</button>
        </form>
      </dialog>
    );
  },
);
