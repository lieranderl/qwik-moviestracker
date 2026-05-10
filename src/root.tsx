import { component$, useServerData } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { ToastStack } from "qwik-toasts";
import { ParamsLauncher } from "./utils/param-launcher";

const THEME_LAUNCHER_SCRIPT = `
(() => {
  const key = "themePref";
  const lightTheme = "latte";
  const darkTheme = "mocha";
  const queryKey = undefined;
  const params = new URLSearchParams(location.search);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = () => {
    let theme = localStorage.getItem(key);

    if (!theme) {
      theme = "auto";
      localStorage.setItem(key, theme);
    }

    if (queryKey && queryKey !== "undefined") {
      const queryTheme = params.get(queryKey);
      if (queryTheme) {
        theme = queryTheme;
        localStorage.setItem(key, theme);
      }
    }

    const cssTheme =
      theme === "auto" ? (mediaQuery.matches ? darkTheme : lightTheme) : theme;
    const iconTheme =
      theme === "auto" ? "auto" : cssTheme === lightTheme ? "light" : "dark";

    document.documentElement.classList.remove(lightTheme, darkTheme);
    document.documentElement.classList.add(cssTheme);
    document.documentElement.setAttribute("data-theme", cssTheme);
    document.documentElement.setAttribute("icon-theme", iconTheme);

    if (queryKey && queryKey !== "undefined") {
      params.set(queryKey, theme);
      history.replaceState({}, "", location.pathname + "?" + params.toString());
    }
  };

  applyTheme();
  mediaQuery.addEventListener("change", applyTheme);
})();
`;

export default component$(() => {
  const scriptNonce = useServerData<string>("nonce");

  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}
        <RouterHead />
        <ParamsLauncher nonce={scriptNonce} />
        <script nonce={scriptNonce} dangerouslySetInnerHTML={THEME_LAUNCHER_SCRIPT} />
        {!isDev && <ServiceWorkerRegister nonce={scriptNonce} />}
      </head>
      <body class="font-montserrat antialiased" lang="en-US">
        <a
          href="#main-content"
          class="bg-base-100 text-base-content sr-only fixed top-3 left-3 z-100 rounded-full px-4 py-2 text-sm font-semibold shadow-md focus:not-sr-only focus:outline-none"
        >
          Skip to content
        </a>
        <ToastStack>
          <RouterOutlet />
          <ServiceWorkerRegister nonce={scriptNonce} />
        </ToastStack>
      </body>
    </QwikCityProvider>
  );
});
