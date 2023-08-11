import { component$, $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export const LangButton = component$(() => {
  const loc = useLocation();

  const toggleLang = $(async () => {
    switch (loc.url.searchParams.get("lang")) {
      case "en-US":
        loc.url.searchParams.set("lang", "ru-RU");
        break;
      case "ru-RU":
        loc.url.searchParams.set("lang", "en-US");
        break;
      default:
        loc.url.searchParams.set("lang", "ru-RU");
        break;
    }
    // const url = loc.url.href.replace("https://moviestracker-app-asjvzhlb3q-ew.a.run.app/", "https://moviestracker.web.app/");
    document.location.assign(loc.url.href);
  });

  return (
    <li
      onClick$={toggleLang}
      class="block px-4 py-2 text-sm text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-600 dark:text-teal-200 dark:hover:text-teal-50 cursor-pointer"
    >
      {loc.url.searchParams.get("lang") || "en-US"}
    </li>
  );
});
