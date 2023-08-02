import { component$ } from "@builder.io/qwik";
import { ThemeButton } from "./theme-button";
import { LangButton } from "./lang-button";

interface ToolbarProps {
  lang: string;
}

export const Toolbar = component$(({ lang }: ToolbarProps) => {
  return (
    <nav class="block bg-teal-50 bg-opacity-50 dark:bg-teal-950 dark:bg-opacity-50 backdrop-blur-sm fixed z-10">
      <div class="w-screen flex flex-wrap items-center justify-between mx-auto p-4 bg-opacity-100 ">
        <a href={lang ? `/?lang=${lang}` : `/`} class="flex items-center">
          <svg
            class="w-5 h-5 mx-2 fill-teal-950 dark:fill-teal-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM48 368v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H416zM48 240v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H416zM48 112v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zM416 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H416zM160 128v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32zm32 160c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V320c0-17.7-14.3-32-32-32H192z" />
          </svg>
          <span class="self-center text-2xl font-semibold whitespace-nowrap">
            Moviestracker
          </span>
        </a>

        <div class="flex items-center">
          <div class="flex items-center md:order-2">
            <LangButton />
            <ThemeButton />
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
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
              id="dropdown"
              class="z-10 hidden bg-teal-50 divide-y divide-teal-100 rounded-lg shadow w-44 dark:bg-teal-950 border border-teal-100 dark:border-teal-900"
            >
              <ul
                class="py-2 text-md space-y-2"
                aria-labelledby="dropdownDefaultButton"
              >
                <li class="mx-4">
              <a
                href={lang ? `/movie?lang=${lang}` : `/movie`}
                class="group transition duration-300"
              >
                Movies
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/tv?lang=${lang}` : `/tv`}
                class="group transition duration-300"
              >
                Series
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/search?lang=${lang}` : `/search`}
                class="group transition duration-300"
              >
                Search
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/torrserver?lang=${lang}` : `/torrserver`}
                class="group transition duration-300"
              >
                TorrServer
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
              </ul>
            </div>
          </div>

          <ul class="hidden md:flex flex-row me-4">
            <li class="mx-4">
              <a
                href={lang ? `/movie?lang=${lang}` : `/movie`}
                class="group transition duration-300"
              >
                Movies
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/tv?lang=${lang}` : `/tv`}
                class="group transition duration-300"
              >
                Series
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/search?lang=${lang}` : `/search`}
                class="group transition duration-300"
              >
                Search
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/torrserver?lang=${lang}` : `/torrserver`}
                class="group transition duration-300"
              >
                TorrServer
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
});
