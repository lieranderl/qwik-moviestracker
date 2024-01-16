import { component$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { ParamsLauncher } from "./utils/param-launcher";
import { ThemeScript } from "qwik-theme-toggle";
import { ToastStack } from "qwik-toasts";

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
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.js"
          nonce=""
        ></script>
        <RouterHead />
        <ParamsLauncher />
        <ThemeScript themeStorageKey="themePref" />
      </head>
      <body class="font-inter tracking-tight antialiased" lang="en">
        <ToastStack>
          <RouterOutlet />
          <ServiceWorkerRegister />
        </ToastStack>
      </body>
    </QwikCityProvider>
  );
});
