import { component$, $, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { HiMoonOutline, HiSunOutline } from "@qwikest/icons/heroicons";
import { ButtonPrimary, ButtonSize, ButtonType } from "../button-primary";

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
    <ButtonPrimary
      size={ButtonSize.icon}
      type={ButtonType.button}
      onClick={updateTheme}
    >
      {themeSig.value === "dark" ? (
        <div class="text-xl fill-primary-dark dark:fill-primary">
          <HiMoonOutline />
        </div>
      ) : (
        <div class="text-xl fill-primary-dark dark:fill-primary">
          <HiSunOutline />
        </div>
      )}
    </ButtonPrimary>
  );
});
