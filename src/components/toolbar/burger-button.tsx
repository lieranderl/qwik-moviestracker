import { Slot, component$ } from "@builder.io/qwik";

export const BurgerButton = component$(() => {
  return (
    <>
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdownBurger"
        class="md:hidden hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
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
        class="z-10 hidden bg-teal-50 divide-y divide-teal-100 rounded-lg shadow w-44 dark:bg-teal-950 border border-teal-100 dark:border-teal-900"
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
