import type { QRL } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { langloadMore } from "~/utils/languages";

export type LoadMoreProps = {
  disabledBtn: boolean;
  refreshFunc: QRL<() => void>;
  lang: string;
};
export const LoadMoreBtn = component$<LoadMoreProps>(
  ({ disabledBtn, refreshFunc, lang }) => {
    return (
      <button
        type="button"
        class="btn btn-accent btn-wide"
        disabled={disabledBtn}
        onClick$={refreshFunc}
      >
        {disabledBtn ? (
          <span class="loading loading-ring loading-lg" />
        ) : (
          <span>{langloadMore(lang)}</span>
        )}
      </button>
    );
  },
);
