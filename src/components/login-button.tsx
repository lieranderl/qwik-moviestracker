import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { Slot, component$, useSignal } from "@builder.io/qwik";
import { useAuthSignin } from "~/routes/plugin@auth";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
  providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
  const providerName = props.providerName || "google";
  const signIn = useAuthSignin();
  const isloading = useSignal(false);
  return (
    <button
      class="btn btn-outline"
      disabled={isloading.value}
      onClick$={() => {
        isloading.value = true;
        signIn.submit({
          providerId: providerName,
          options: { callbackUrl: "/" },
        });
      }}
    >
      {isloading.value && (
        <div class="flex items-center gap-2 ">
          <span class="loading "></span>
          <div>Logging in...</div>
        </div>
      )}
      {!isloading.value && (
        <div class="flex items-center gap-2 ">
          <div class="text-xl">
            <Slot></Slot>
          </div>
          <div>
            Login with <span class="capitalize">{providerName}</span>
          </div>
        </div>
      )}
    </button>
  );
});
