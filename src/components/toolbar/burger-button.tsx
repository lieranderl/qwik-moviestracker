import { Slot, component$ } from "@builder.io/qwik";
import {HiBars3Solid} from "@qwikest/icons/heroicons";

export const BurgerButton = component$(() => {
  return (
    <div class="dropdown dropdown-end dropdown-bottom md:hidden">
      <div tabIndex={0} role="button">
        <HiBars3Solid class="text-3xl"/>
      </div>
      <ul
        tabIndex={0}
        class="menu dropdown-content z-[1] w-44 rounded-box bg-base-100 p-2 shadow"
      >
        <Slot />
      </ul>
    </div>
  );
});
