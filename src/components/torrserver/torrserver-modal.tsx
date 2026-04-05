import { $, component$, type PropFunction, Slot, useId } from "@builder.io/qwik";

export interface TorrServerModalProps {
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
    maxWidth = "max-w-5xl",
    onClose$,
    open,
    subtitle,
    title,
  }: TorrServerModalProps) => {
    const internalId = useId();
    const dialogId = id ?? internalId;

    const close = $(() => {
      onClose$?.();
    });

    return (
      <dialog
        id={dialogId}
        open={open}
        class="modal"
        onClose$={close}
        onCancel$={close}
      >
        <div
          class={`modal-box border-base-200 bg-base-100 max-h-[90vh] w-11/12 overflow-y-auto border p-0 shadow-xl ${maxWidth}`}
        >
          <div class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur">
            <div class="min-w-0 space-y-1">
              <h3 class="truncate text-xl font-semibold">{title}</h3>
              {subtitle && (
                <p class="text-base-content/65 line-clamp-2 text-sm leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <form method="dialog">
              <button type="submit" class="btn btn-ghost btn-circle btn-sm">
                ✕
              </button>
            </form>
          </div>

          <div class="space-y-4 p-5">
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
