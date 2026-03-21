import { $, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export const LangButton = component$(() => {
  const loc = useLocation();
  const currentLang = loc.url.searchParams.get("lang") || "en-US";

  const toggleLang = $(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const nextLang = currentLang === "en-US" ? "ru-RU" : "en-US";

    queryParams.set("lang", nextLang);
    localStorage.setItem("lang", nextLang);
    window.location.href = `${window.location.pathname}?${queryParams.toString()}`;
  });

  return (
    <li>
      <button
        type="button"
        onClick$={toggleLang}
        class="flex items-center justify-between gap-3"
      >
        <span>Language</span>
        <span class="badge badge-outline badge-xs">{currentLang}</span>
      </button>
    </li>
  );
});
