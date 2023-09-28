import { component$, $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export const LangButton = component$(() => {
  const loc = useLocation();

  const toggleLang = $(async () => {
    switch (loc.url.searchParams.get("lang")) {
      case "en-US":
        loc.url.searchParams.set("lang", "ru-RU");
        localStorage.setItem("lang", "ru-RU");
        break;
      case "ru-RU":
        loc.url.searchParams.set("lang", "en-US");
        localStorage.setItem("lang", "en-US");
        break;
      default:
        loc.url.searchParams.set("lang", "ru-RU");
        break;
    }
    document.location.assign(loc.url.href);
  });

  return (
    <li
      onClick$={toggleLang}
      class="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-600 dark:text-primary-200 dark:hover:text-primary cursor-pointer"
    >
      {loc.url.searchParams.get("lang") || "en-US"}
    </li>
  );
});
