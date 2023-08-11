import { component$, $, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { HiMoonOutline, HiSunOutline } from "@qwikest/icons/heroicons";

export const ThemeButton = component$(() => {
  const themeSig = useSignal(
    (typeof window !== "undefined" && window.localStorage.theme) || undefined
  );

  useVisibleTask$(() => {
    themeSig.value = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const theme = e.matches ? "dark" : "light";
        localStorage.setItem("theme", theme);
        updateTheme();
      });
  });

  const updateTheme = $(() => {
    switch (themeSig.value) {
      case "dark":
        document.documentElement.classList.remove("dark");
        themeSig.value = window.localStorage.theme = "light";
        break;
      default:
        document.documentElement.classList.add("dark");
        themeSig.value = window.localStorage.theme = "dark";
        break;
    }
  });

  return (
    <button
      type="button"
      class=" hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg p-2.5"
      aria-label="Toggle between Dark and Light mode"
      onClick$={updateTheme}
    >
      {themeSig.value === "dark" ? (
        <div class="text-xl fill-teal-950 dark:fill-teal-50">
          <HiMoonOutline />
        </div>
      ) : (
        <div class="text-xl fill-teal-950 dark:fill-teal-50">
          <HiSunOutline />
        </div>
      )}
    </button>
  );
});
