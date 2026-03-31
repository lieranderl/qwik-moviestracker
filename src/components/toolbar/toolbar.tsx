import { component$ } from "@builder.io/qwik";

import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { ThemeToggle } from "qwik-theme-toggle";
import { paths } from "~/utils/paths";
import { BurgerButton } from "./burger-button";
import { ToolbarLinks } from "./links";
import { UserMenu } from "./user-menu";

export type ToolbarProps = {
  lang: string;
};
export const Toolbar = component$<ToolbarProps>(({ lang }) => {
  return (
    <nav
      aria-label="Primary navigation"
      class="navbar toolbar-shell bg-base-100/85 border-base-200/70 text-base-content fixed top-0 left-0 z-50 min-h-16 w-full border-b px-4 backdrop-blur-md md:px-6"
    >
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-0">
        <a href={paths.index(lang)} class="group flex items-center gap-2">
          <div class="border-base-200 bg-base-200 group-hover:bg-base-200/90 grid h-10 w-10 place-items-center rounded-full border text-2xl shadow-sm transition-colors duration-200">
            <HiFilmOutline />
          </div>
          <span class="self-center text-xl font-bold whitespace-nowrap">
            Moviestracker
          </span>
        </a>

        <div class="navbar-end flex items-center gap-2">
          <ul class="menu menu-horizontal hidden items-center gap-1 rounded-full bg-transparent p-0 md:flex">
            <ToolbarLinks lang={lang} />
          </ul>

          <div class="flex items-center gap-2">
            <div class="btn btn-ghost btn-circle btn-sm btn-square justify-center shadow-none">
              <ThemeToggle
                themeStorageKey="themePref"
                textSize="text-xl"
                lightTheme="latte"
                darkTheme="mocha"
              />
            </div>
            <UserMenu lang={lang} />
          </div>

          <BurgerButton>
            <ToolbarLinks lang={lang} mobile={true} />
          </BurgerButton>
        </div>
      </div>
    </nav>
  );
});
