import { component$, type PropFunction } from "@builder.io/qwik";
import { TorrServerModal } from "./torrserver-modal";
import {
  getToneBadgeClass,
  getToneBtnClass,
  getToneSurfaceClass,
  type TorrServerTone,
} from "./torrserver-utils";

export type TorrServerPlayerAction = {
  href?: string;
  label: string;
  onClick$?: PropFunction<() => void>;
  tone?: TorrServerTone;
};

export interface TorrServerPlayerModalProps {
  actions?: TorrServerPlayerAction[];
  description?: string;
  onClose$?: PropFunction<() => void>;
  open: boolean;
  poster?: string;
  sourceLabel?: string;
  streamUrl: string;
  title: string;
}

export const TorrServerPlayerModal = component$(
  ({
    actions = [],
    onClose$,
    open,
    poster,
    sourceLabel,
    streamUrl,
    title,
  }: TorrServerPlayerModalProps) => {
    return (
      <TorrServerModal
        open={open}
        title={title}
        subtitle={sourceLabel}
        maxWidth="max-w-6xl"
        onClose$={onClose$}
      >
        <div class="rounded-box border-base-200 bg-base-100 overflow-hidden border shadow-sm">
          <div class="bg-base-300/25 relative">
            <video
              class="bg-base-300/10 aspect-video h-auto w-full"
              controls
              playsInline
              poster={poster}
              preload="metadata"
            >
              <source src={streamUrl} />
              {title}
            </video>
          </div>
          <div class="border-base-200 bg-base-200/40 flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
              <p class="text-sm font-semibold">Browser playback</p>
              <p class="text-base-content/65 max-w-3xl text-xs leading-relaxed md:text-sm">
                TorrServer streams directly to the browser. If playback fails,
                use the direct stream or playlist links below.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class={`badge rounded-full px-3 py-3 font-medium ${getToneBadgeClass("info")}`}
              >
                Direct stream
              </span>
              <span
                class={`badge rounded-full px-3 py-3 font-medium ${getToneBadgeClass("neutral")}`}
              >
                HTML video
              </span>
            </div>
          </div>
        </div>

        {actions.length > 0 && (
          <div
            class={`rounded-box border p-4 ${getToneSurfaceClass("neutral")}`}
          >
            <div class="flex flex-wrap gap-2">
              {actions.map((action) =>
                action.href ? (
                  <a
                    class={`btn btn-sm ${getToneBtnClass(action.tone ?? "info")}`}
                    href={action.href}
                    key={action.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    class={`btn btn-sm ${getToneBtnClass(action.tone ?? "info")}`}
                    onClick$={async () => action.onClick$?.()}
                  >
                    {action.label}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </TorrServerModal>
    );
  },
);
