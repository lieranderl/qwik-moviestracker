import {
  component$,
  $,
  useVisibleTask$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

import { server$ } from "@builder.io/qwik-city";
import { ObjectId } from "bson";
import { useAuthSession } from "~/routes/plugin@auth";
import { usersCol } from "~/utils/mongodbinit";
import { useThemeLoader } from "~/routes/layout";
import { ThemeIconTooltip } from "./toggle-theme-icons";
import { setCookie } from "typescript-cookie";

interface ThemeToggleBtnProps {
  size?: "xs" | "sm" | "md" | "lg";
}

export const ThemeButton = component$(({ size }: ThemeToggleBtnProps) => {
  const themeLoader = useThemeLoader();
  const THEME_MODES = { LIGHT: "light", DARK: "dark", AUTO: "auto" };
  const selectedIcon = useSignal(THEME_MODES.AUTO);
  const selectedTheme = useSignal(themeLoader.value.theme);
  const session = useAuthSession();

  const updateThemeDb = server$(async () => {
    await usersCol.updateOne(
      { _id: new ObjectId(session.value?.id) },
      { $set: { theme: selectedIcon.value } }
    );
  });

  // get theme from themeLoader
  useTask$(async () => {
    if (themeLoader.value.theme === THEME_MODES.DARK) {
      selectedTheme.value = THEME_MODES.DARK;
      selectedIcon.value = THEME_MODES.DARK;
    } else if (themeLoader.value.theme === THEME_MODES.LIGHT) {
      selectedTheme.value = THEME_MODES.LIGHT;
      selectedIcon.value = THEME_MODES.LIGHT;
    } else if (themeLoader.value.theme === THEME_MODES.AUTO) {
      selectedIcon.value = THEME_MODES.AUTO;
    }
  });

  useVisibleTask$(async () => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (selectedIcon.value === THEME_MODES.AUTO) {
          if (e.matches) {
            selectedTheme.value = THEME_MODES.DARK;
          } else {
            selectedTheme.value = THEME_MODES.LIGHT;
          }
        }
      });
  });

  // track selectedTheme changes
  useVisibleTask$(async ({ track }) => {
    track(() => {
      selectedTheme.value;
    });
    if (selectedTheme.value === THEME_MODES.DARK) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.classList.remove("auto");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
  });

  // track selectedIcon changes
  useVisibleTask$(async ({ track }) => {
    track(() => {
      selectedIcon.value;
    });
    setCookie("theme", selectedIcon.value);
    updateThemeDb();
  });

  const toggleTheme = $(async () => {
    if (selectedIcon.value === THEME_MODES.AUTO) {
      selectedTheme.value = THEME_MODES.DARK;
      selectedIcon.value = THEME_MODES.DARK;
    } else if (selectedIcon.value === THEME_MODES.DARK) {
      selectedTheme.value = THEME_MODES.LIGHT;
      selectedIcon.value = THEME_MODES.LIGHT;
    } else if (selectedIcon.value === THEME_MODES.LIGHT) {
      selectedIcon.value = THEME_MODES.AUTO;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        selectedTheme.value = THEME_MODES.DARK;
      } else {
        selectedTheme.value = THEME_MODES.LIGHT;
      }
    }
  });

  return (
    <div onClick$={() => toggleTheme()}>
      <ThemeIconTooltip
        selector={selectedIcon.value}
        size={size}
      ></ThemeIconTooltip>
    </div>
  );
});
