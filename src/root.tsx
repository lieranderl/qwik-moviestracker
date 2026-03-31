import { component$ } from "@builder.io/qwik";
import { isDev } from "@builder.io/qwik/build";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { ThemeScript } from "qwik-theme-toggle";
import { ToastStack } from "qwik-toasts";
import { ParamsLauncher } from "./utils/param-launcher";

export default component$(() => {
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
        <ParamsLauncher />
        <ThemeScript
          themeStorageKey="themePref"
          lightTheme="latte"
          darkTheme="mocha"
        />
        {!isDev && <ServiceWorkerRegister />}
      </head>
      <body class="font-montserrat antialiased" lang="en-US">
        <a
          href="#main-content"
          class="bg-base-100 text-base-content sr-only fixed top-3 left-3 z-[100] rounded-full px-4 py-2 text-sm font-semibold shadow-md focus:not-sr-only focus:outline-none"
        >
          Skip to content
        </a>
        <ToastStack>
          <RouterOutlet />
          <ServiceWorkerRegister />
        </ToastStack>
      </body>
    </QwikCityProvider>
  );
});
