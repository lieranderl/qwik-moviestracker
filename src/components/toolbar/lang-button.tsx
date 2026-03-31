import { $, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { writeStorageString } from "~/utils/browser";

export const LangButton = component$(() => {
  const loc = useLocation();
  const currentLang = loc.url.searchParams.get("lang") || "en-US";
  const nextLang = currentLang === "en-US" ? "ru-RU" : "en-US";
  const nextQueryParams = new URLSearchParams(loc.url.searchParams);
  nextQueryParams.set("lang", nextLang);
  const nextHref = `${loc.url.pathname}?${nextQueryParams.toString()}`;

  const persistLangPreference = $(() => {
    writeStorageString("lang", nextLang);
  });

  return (
    <li>
      <a
        href={nextHref}
        onClick$={persistLangPreference}
        class="flex items-center justify-between gap-3"
      >
        <span>Language</span>
        <span class="badge badge-outline badge-xs">{currentLang}</span>
      </a>
    </li>
  );
});
