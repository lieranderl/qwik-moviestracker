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
    const url = loc.url.href.replace("https://my-cloud-run-app-asjvzhlb3q-ew.a.run.app/", "https://moviestracker.web.app/");
    document.location.assign(url);
  });

  return (
    <a onClick$={toggleLang} >
      <button
        id="theme-toggle"
        type="button"
        class="hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
      >
        {loc.url.searchParams.get("lang") || "en-US"}
      </button>
    </a>
  );
});
