import { Slot, component$ } from "@builder.io/qwik";
import { BurgerIcon } from "~/utils/icons/burgerIcon";

export const BurgerButton = component$(() => {
  return (
    <div class="dropdown dropdown-bottom dropdown-end md:hidden">
      <div tabIndex={0} role="button">
        <BurgerIcon />
      </div>
      <ul
        tabIndex={0}
        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44"
      >
        <Slot />
      </ul>
    </div>
  );
});
