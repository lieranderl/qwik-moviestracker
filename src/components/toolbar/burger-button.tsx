import { component$, Slot } from "@builder.io/qwik";
import { HiBars3Solid } from "@qwikest/icons/heroicons";

export const BurgerButton = component$(() => {
  return (
    <details class="dropdown dropdown-end dropdown-bottom md:hidden">
      <summary
        aria-label="Open navigation menu"
        class="btn btn-ghost btn-circle btn-sm text-base-content/80 list-none"
      >
        <HiBars3Solid aria-hidden="true" class="text-2xl" />
      </summary>
      <ul
        role="menu"
        class="menu menu-sm dropdown-content bg-base-100 border-base-200 rounded-box z-[60] mt-3 w-56 border p-2 shadow-xl"
      >
        <Slot />
      </ul>
    </details>
  );
});
