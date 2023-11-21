import { component$ } from "@builder.io/qwik";
import { ThemeButton } from "./theme-button";

import { useQueryParamsLoader } from "~/routes/layout";
import { UserMenu } from "./user-menu";
import { ToolbarLinks } from "./links";
import { BurgerButton } from "./burger-button";
import { paths } from "~/utils/paths";
import { MovieIcon } from "~/utils/icons/movieIcon";

export const Toolbar = component$(() => {
  const resource = useQueryParamsLoader();

  return (
    <nav class="block bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm fixed z-10">
      <div class="w-screen flex flex-wrap items-center justify-between p-4 bg-opacity-100">
        <a href={paths.index(resource.value.lang)} class="flex items-center">
          <div class="me-2">
            <MovieIcon />
          </div>

          <span class="self-center text-2xl font-semibold whitespace-nowrap">
            Moviestracker
          </span>
        </a>

        <div class="flex items-center">
          <div class="flex items-center md:order-2 md:mx-4">
            <ThemeButton size="sm"/>
            <UserMenu />
            <BurgerButton>
              <ToolbarLinks />
            </BurgerButton>
          </div>
          <ul class="hidden md:flex flex-row me-4">
            <ToolbarLinks />
          </ul>
        </div>
      </div>
    </nav>
  );
});
