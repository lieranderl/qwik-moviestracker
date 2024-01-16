import { component$, $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export const LangButton = component$(() => {
  const loc = useLocation();
  const lang = loc.url.searchParams.get("lang");

  const toggleLang = $(() => {
    const queryParams = new URLSearchParams(window.location.search);
    switch (lang) {
      case "en-US":
        queryParams.set("lang", "ru-RU");
        localStorage.setItem("lang", "ru-RU");
        window.location.href = `${
          window.location.pathname
        }?${queryParams.toString()}`;
        break;
      case "ru-RU":
        queryParams.set("lang", "en-US");
        localStorage.setItem("lang", "en-US");
        window.location.href = `${
          window.location.pathname
        }?${queryParams.toString()}`;
        break;
      default:
        queryParams.set("lang", "en-US");
        window.location.href = `${
          window.location.pathname
        }?${queryParams.toString()}`;
        break;
    }
  });

  return (
    <li
      onClick$={toggleLang}
      class="text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-600 dark:text-primary-200 block cursor-pointer px-4 py-2 text-sm dark:hover:text-primary"
    >
      {loc.url.searchParams.get("lang") || "en-US"}
    </li>
  );
});
