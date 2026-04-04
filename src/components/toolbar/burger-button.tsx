import { component$, Slot } from "@builder.io/qwik";
import { HiBars3Solid } from "@qwikest/icons/heroicons";
import { langText } from "~/utils/languages";

type BurgerButtonProps = {
  lang: string;
};

export const BurgerButton = component$<BurgerButtonProps>(({ lang }) => {
  const openNavigationLabel = langText(
    lang,
    "Open navigation menu",
    "Открыть меню навигации",
  );

  return (
    <details class="dropdown dropdown-end dropdown-bottom md:hidden">
      <summary
        aria-label={openNavigationLabel}
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
