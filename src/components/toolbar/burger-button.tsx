import { Slot, component$ } from "@builder.io/qwik";

export const BurgerButton = component$(() => {
  return (
    <>
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdownBurger"
        class="md:hidden hover:bg-primary-100 dark:hover:bg-primary-900 focus:outline-none focus:ring-0 focus:ring-primary-100 dark:focus:ring-primary-900 rounded-lg text-sm p-2.5"
        type="button"
      >
        <svg
          class="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 17 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>
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
