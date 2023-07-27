import {
  component$,
  createContextId,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { DarkThemeLauncher, LangLauncher } from "./utils/DarkThemeLauncher";

export const firebaseStoreContext = createContextId<{
  moviesLastTimeFound: number;
}>("firebaseStoreContext");

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */
  const firebaseStore = useStore({ moviesLastTimeFound: 0 });
  useContextProvider(firebaseStoreContext, firebaseStore);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
        <DarkThemeLauncher />
      </head>
      <body class="bg-teal-50 dark:bg-teal-950 font-poppins" lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
