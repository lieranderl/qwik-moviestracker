import { component$, $ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

export const LangButton = component$(() => {
  const loc = useLocation();
  const nav = useNavigate();

  const toggleLang = $(async () => {
    if (loc.url.searchParams.get("lang") === "en-US") {
      loc.url.searchParams.set("lang", "ru-RU");
    } else if (loc.url.searchParams.get("lang") === "ru-RU") {
      loc.url.searchParams.set("lang", "en-US");
    } else {
      loc.url.searchParams.set("lang", "ru-RU");
    }
    await nav(loc.url.href, { forceReload: true });
  });

  return (
    <a onClick$={toggleLang}>
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
