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
        class="btn btn-ghost flex h-auto min-h-0 w-full items-center justify-between gap-3 rounded-full px-3 py-2.5 text-sm font-medium normal-case shadow-none"
      >
        <span>Language</span>
        <span class="badge badge-outline badge-xs rounded-full px-3 py-3 font-medium">
          {currentLang}
        </span>
      </a>
    </li>
  );
});
