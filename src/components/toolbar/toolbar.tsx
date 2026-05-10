import { component$ } from "@builder.io/qwik";

import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { ThemeToggle } from "qwik-theme-toggle";
import { paths } from "~/utils/paths";
import { langPrimaryNavigation } from "~/utils/languages";
import { BurgerButton } from "./burger-button";
import { ToolbarLinks } from "./links";
import { UserMenu } from "./user-menu";

export type ToolbarProps = {
  lang: string;
};
export const Toolbar = component$<ToolbarProps>(({ lang }) => {
  return (
    <nav
      aria-label={langPrimaryNavigation(lang)}
      class="navbar toolbar-shell bg-base-100/82 border-base-200/70 text-base-content fixed top-0 left-0 z-[60] min-h-16 w-full border-b px-4 backdrop-blur-xl md:px-6"
    >
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-0">
        <a href={paths.index(lang)} class="group flex items-center gap-3">
          <div class="border-base-200 bg-base-200/80 group-hover:bg-base-200 grid h-10 w-10 place-items-center rounded-full border text-2xl shadow-sm transition-colors duration-200">
            <HiFilmOutline />
          </div>
          <div class="flex flex-col">
            <span class="self-center text-lg font-semibold whitespace-nowrap md:text-xl">
              Moviestracker
            </span>
            <span class="text-base-content/50 hidden text-[11px] tracking-[0.18em] uppercase md:block">
              Watchlist and discovery
            </span>
          </div>
        </a>

        <div class="navbar-end flex items-center gap-2">
          <ul class="menu menu-horizontal hidden items-center gap-1 rounded-full border border-base-200/70 bg-base-100/60 p-1 md:flex">
            <ToolbarLinks lang={lang} />
          </ul>

          <div class="flex items-center gap-2">
            <div class="btn btn-ghost btn-circle btn-sm btn-square justify-center border border-transparent shadow-none hover:border-base-200/80 hover:bg-base-200/65">
              <ThemeToggle
                themeStorageKey="themePref"
                textSize="text-xl"
                lightTheme="latte"
                darkTheme="mocha"
              />
            </div>
            <UserMenu lang={lang} />
          </div>

          <BurgerButton lang={lang}>
            <ToolbarLinks lang={lang} mobile={true} />
          </BurgerButton>
        </div>
      </div>
    </nav>
  );
});
