import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import { useSignIn } from "~/routes/plugin@auth";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
  providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
  const { providerName = "google", class: className, ...buttonProps } = props;
  const signIn = useSignIn();
  const isloading = useSignal(false);

  return (
    <button
      {...buttonProps}
      aria-busy={isloading.value}
      class={[
        "btn btn-outline border-base-300 bg-base-100 text-base-content hover:border-base-300 hover:bg-base-200/75 shadow-sm",
        className,
      ]}
      type="button"
      disabled={isloading.value || !!buttonProps.disabled}
      onClick$={$(() => {
        isloading.value = true;
        signIn.submit({
          redirectTo: "/",
          providerId: providerName,
        });
      })}
    >
      {isloading.value && (
        <span aria-live="polite" class="inline-flex items-center gap-2">
          <span class="loading loading-spinner loading-sm" />
          <span>Signing in...</span>
        </span>
      )}
      {!isloading.value && (
        <span class="inline-flex items-center gap-2">
          <span class="text-xl">
            <Slot />
          </span>
          <span>
            Sign In with <span class="capitalize">{providerName}</span>
          </span>
        </span>
      )}
    </button>
  );
});
