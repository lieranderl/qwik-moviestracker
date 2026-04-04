import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { $, component$, Slot, useSignal } from "@builder.io/qwik";
import { useSignIn } from "~/routes/plugin@auth";
import { langSignInWithProvider, langSigningIn } from "~/utils/languages";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
  lang?: string;
  providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
  const {
    lang = "en-US",
    providerName = "google",
    class: className,
    ...buttonProps
  } = props;
  const signIn = useSignIn();
  const isloading = useSignal(false);
  const providerLabel =
    providerName.charAt(0).toUpperCase() + providerName.slice(1);

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
          <span>{langSigningIn(lang)}</span>
        </span>
      )}
      {!isloading.value && (
        <span class="inline-flex items-center gap-2">
          <span class="text-xl">
            <Slot />
          </span>
          <span>
            {langSignInWithProvider(lang, providerLabel)}
          </span>
        </span>
      )}
    </button>
  );
});
