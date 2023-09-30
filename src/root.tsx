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
import { LangLauncher } from "./utils/langLauncher";

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
          src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.js"
          nonce=""
        ></script>
        <RouterHead />
        <DarkThemeLauncher />
        <LangLauncher />
      </head>
      <body
        class="bg-primary dark:bg-primary-dark bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern.svg')] dark:bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/hero-pattern-dark.svg')] text-primary-dark dark:text-primary font-inter tracking-tight antialiased"
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
