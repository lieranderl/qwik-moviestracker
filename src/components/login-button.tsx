import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { $, Slot, component$, useSignal } from "@builder.io/qwik";
import { useAuthSignin } from "~/routes/plugin@auth";
import { ButtonPrimary, ButtonSize } from "./button-primary";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
  providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
  const providerName = props.providerName || "google";
  const signIn = useAuthSignin();
  const isloading = useSignal(false);
  return (
    <>
      <ButtonPrimary
        isLoading={isloading.value}
        disabled={isloading.value}
        size={ButtonSize.md}
        onClick={$(() => {
          isloading.value = true;
          signIn.submit({
            providerId: providerName,
            options: { callbackUrl: "/" },
          });
        })}
      >
        <div class="flex items-start items-center gap-2 text-base">
          <div class="text-2xl">
            <Slot></Slot>
          </div>
          <span>
            Login with <span class="capitalize">{providerName}</span>
          </span>
        </div>
      </ButtonPrimary>
    </>
  );
});
