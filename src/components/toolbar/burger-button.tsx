import { Slot, component$ } from "@builder.io/qwik";
import { BurgerIcon } from "~/utils/icons/burgerIcon";

export const BurgerButton = component$(() => {
  return (
    <div class="dropdown dropdown-end dropdown-bottom md:hidden">
      <div tabIndex={0} role="button">
        <BurgerIcon />
      </div>
      <ul
        tabIndex={0}
        class="menu dropdown-content rounded-box bg-base-100 z-[1] w-44 p-2 shadow"
      >
        <Slot />
      </ul>
    </div>
  );
});
