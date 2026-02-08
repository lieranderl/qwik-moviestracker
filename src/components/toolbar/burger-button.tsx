import { component$, Slot } from "@builder.io/qwik";
import { HiBars3Solid } from "@qwikest/icons/heroicons";

export const BurgerButton = component$(() => {
	return (
		<div class="dropdown dropdown-end dropdown-bottom ms-2 md:hidden">
			<button type="button" class="btn btn-ghost btn-circle">
				<HiBars3Solid class="text-3xl" />
			</button>
			<ul class="menu dropdown-content rounded-box bg-base-100 z-[1] w-44 p-2 shadow">
				<Slot />
			</ul>
		</div>
	);
});
