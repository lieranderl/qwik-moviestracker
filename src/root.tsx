import { component$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { DarkThemeLauncher } from "./utils/darkThemeLauncher";
import { ToastStack } from "./components/toast/toastStack";

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
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.0/flowbite.min.js"
          nonce=""
        ></script>
        <RouterHead />
        <DarkThemeLauncher />
      </head>
      <body
        class="bg-teal-50 dark:bg-teal-950 text-teal-950 dark:text-teal-50 font-poppins tracking-tight antialiased"
        lang="en"
      >
        <ToastStack>
          <RouterOutlet />
          <ServiceWorkerRegister />
        </ToastStack>
      </body>
    </QwikCityProvider>
  );
});
