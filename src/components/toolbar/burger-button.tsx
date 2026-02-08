import { component$, Slot } from "@builder.io/qwik";
import { HiBars3Solid } from "@qwikest/icons/heroicons";

export const BurgerButton = component$(() => {
	return (
		<div class="dropdown dropdown-end dropdown-bottom md:hidden">
			<button
				type="button"
				class="btn btn-ghost btn-circle btn-sm text-base-content/80"
			>
				<HiBars3Solid class="text-2xl" />
			</button>
			<ul class="menu dropdown-content rounded-box bg-base-100 border-base-200 z-[1] mt-2 w-56 border p-2 shadow-lg">
				<Slot />
			</ul>
		</div>
	);
});
