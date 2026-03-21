import { $, component$, Slot, useId, useSignal } from "@builder.io/qwik";
import { HiBars3Solid } from "@qwikest/icons/heroicons";

export const BurgerButton = component$(() => {
	const isOpen = useSignal(false);
	const menuId = useId();

	return (
		<div
			class="dropdown dropdown-end dropdown-bottom md:hidden"
			onKeyDown$={$((event) => {
				if (event.key === "Escape") {
					isOpen.value = false;
				}
			})}
			onFocusOut$={$((event) => {
				const currentTarget = event.currentTarget as HTMLElement | null;
				const nextTarget = event.relatedTarget;
				if (
					!currentTarget ||
					!(nextTarget instanceof Node) ||
					!currentTarget.contains(nextTarget)
				) {
					isOpen.value = false;
				}
			})}
		>
			<button
				type="button"
				aria-controls={menuId}
				aria-expanded={isOpen.value}
				aria-haspopup="menu"
				aria-label="Open navigation menu"
				class="btn btn-ghost btn-circle btn-sm card-hover text-base-content/80"
				onClick$={() => {
					isOpen.value = !isOpen.value;
				}}
			>
				<HiBars3Solid aria-hidden="true" class="text-2xl" />
			</button>
			<ul
				id={menuId}
				role="menu"
				class={[
					"menu dropdown-content overlay-enter rounded-box bg-base-100 border-base-200 z-[1] mt-2 w-56 border p-2 shadow-lg",
					isOpen.value ? "block" : "hidden",
				]}
				onClick$={() => {
					isOpen.value = false;
				}}
			>
				<Slot />
			</ul>
		</div>
	);
});
