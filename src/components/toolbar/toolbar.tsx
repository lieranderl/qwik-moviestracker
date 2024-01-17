import { component$ } from "@builder.io/qwik";

import { UserMenu } from "./user-menu";
import { ToolbarLinks } from "./links";
import { BurgerButton } from "./burger-button";
import { paths } from "~/utils/paths";
import { ThemeToggle } from "qwik-theme-toggle";
import { HiFilmOutline } from "@qwikest/icons/heroicons";

export type ToolbarProps = {
  lang: string;
};
export const Toolbar = component$(({ lang }) => {
  return (
    <nav class="fixed z-10 block bg-opacity-50 backdrop-blur-sm dark:bg-opacity-50">
      <div class="flex w-screen flex-wrap items-center justify-between bg-opacity-100 p-4">
        <a href={paths.index(lang)} class="flex items-center">
          <div class="me-2">
            <HiFilmOutline class="text-4xl"/>
          </div>
          <span class="self-center whitespace-nowrap text-2xl font-semibold">
            Moviestracker
          </span>
        </a>

        <div class="flex items-center">
          <div class="flex items-center gap-2 md:order-2 md:mx-4">
            <ThemeToggle themeStorageKey="themePref" textSize="text-3xl" />
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
