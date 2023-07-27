import { component$, $ } from "@builder.io/qwik";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";

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
    <Link href={loc.url.href} onClick$={toggleLang}>
      <button
        id="theme-toggle"
        type="button"
        class="text-teal-950 dark:text-teal-50 hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
      >
        {loc.url.searchParams.get("lang") || "en-US"}
      </button>
    </Link>
  );
});
