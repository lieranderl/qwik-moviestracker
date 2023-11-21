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
import mongoClientPromise from "~/utils/mongodbinit";
import { useThemeLoader } from "~/routes/layout";
import { ThemeIconTooltip } from "./toggle-theme-icons";
import { setCookie } from "typescript-cookie";

interface ThemeToggleBtnProps {
  size?: "xs" | "sm" | "md" | "lg";
}

export const ThemeButton = component$(({ size }: ThemeToggleBtnProps) => {
  const themeLoader = useThemeLoader();
  const THEME_MODES = { LIGHT: "light", DARK: "dark" };
  const selectedIcon = useSignal(themeLoader.value.theme);
  const session = useAuthSession();
  
  
  const updateThemeDb = server$(async () => {
    const usersCol = (await mongoClientPromise).db("movies").collection("users");  
    await usersCol.updateOne(
      { _id: new ObjectId(session.value?.id) },
      { $set: { theme: selectedIcon.value } }
    );
  });

  // get theme from themeLoader
  useTask$(async () => {
    if (themeLoader.value.theme === THEME_MODES.DARK) {
      selectedIcon.value = THEME_MODES.DARK;
    } else if (themeLoader.value.theme === THEME_MODES.LIGHT) {
      selectedIcon.value = THEME_MODES.LIGHT;
    }
  });

  // track selectedIcon changes
  useVisibleTask$(async ({ track }) => {
    track(() => {
      selectedIcon.value;
    });
    setCookie("theme", selectedIcon.value);
    updateThemeDb();
    if (selectedIcon.value === THEME_MODES.DARK) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  });

  const toggleTheme = $(async () => {
    if (selectedIcon.value === THEME_MODES.DARK) {
      selectedIcon.value = THEME_MODES.LIGHT;
    } else if (selectedIcon.value === THEME_MODES.LIGHT) {
      selectedIcon.value = THEME_MODES.DARK;
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
