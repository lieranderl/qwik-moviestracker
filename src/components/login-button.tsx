import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { $, Slot, component$, useSignal } from "@builder.io/qwik";
import { useSignIn } from "~/routes/plugin@auth";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
	providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
	const providerName = props.providerName || "google";
	const signIn = useSignIn();
	const isloading = useSignal(false);
	return (
		<button
			class="btn btn-primary"
			type="button"
			disabled={isloading.value}
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
