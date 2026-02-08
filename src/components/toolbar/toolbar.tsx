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
    <nav class="bg-base-100/20 dark:bg-base-100/10 border-base-200/40 text-base-content fixed z-50 block border-b backdrop-blur-md">
      <div class="flex w-screen flex-wrap items-center justify-between p-4">
        <a href={paths.index(lang)} class="flex items-center">
          <div class="me-2 text-4xl">
            <HiFilmOutline />
          </div>
          <span class="self-center text-2xl font-bold whitespace-nowrap">
            Moviestracker
          </span>
        </a>

        <div class="flex items-center">
          <div class="flex items-center gap-2 md:order-2 md:mx-4">
            <ThemeToggle
              themeStorageKey="themePref"
              textSize="text-3xl"
              lightTheme="latte"
              darkTheme="mocha"
            />

            <UserMenu lang={lang} />
            <BurgerButton>
              <ToolbarLinks lang={lang} />
            </BurgerButton>
          </div>
          <ul class="me-4 hidden flex-row md:flex">
            <ToolbarLinks lang={lang} />
          </ul>
        </div>
      </div>
    </nav>
  );
});
