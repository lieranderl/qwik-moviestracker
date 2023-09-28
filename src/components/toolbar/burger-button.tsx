import { Slot, component$ } from "@builder.io/qwik";
import { ButtonPrimary, ButtonSize, ButtonType } from "../button-primary";
import { BurgerIcon } from "~/utils/icons/burgerIcon";

export const BurgerButton = component$(() => {
  return (
    <>
      <ButtonPrimary
        size={ButtonSize.icon}
        dataDropdownToggle="dropdownBurger"
        type={ButtonType.button}
        additionalClass="md:hidden"
      >
        <BurgerIcon />
      </ButtonPrimary>
      <div
        id="dropdownBurger"
        class="z-10 hidden bg-primary divide-y divide-primary-100 rounded-lg shadow w-44 dark:bg-primary-dark border border-primary-100 dark:border-primary-900"
      >
        <ul
          class="py-2 text-md space-y-2"
          aria-labelledby="dropdownDefaultButton"
        >
          <Slot />
        </ul>
      </div>
    </>
  );
});
