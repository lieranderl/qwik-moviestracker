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
      class={["btn border-[#e5e5e5] bg-white text-black", className]}
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
        <div class="flex items-center gap-2">
          <span class="loading" />
          <div>Logging in...</div>
        </div>
      )}
      {!isloading.value && (
        <div class="flex items-center gap-2">
          <div class="text-xl">
            <Slot />
          </div>
          <div>
            Login with <span class="capitalize">{providerName}</span>
          </div>
        </div>
      )}
    </button>
  );
});
