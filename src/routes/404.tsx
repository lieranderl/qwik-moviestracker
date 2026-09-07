import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { NotFoundPage } from "~/components/not-found-page";

export default component$(() => {
  const location = useLocation();
  const lang = location.url.searchParams.get("lang") || "en-US";
  return <NotFoundPage lang={lang} />;
});

export const head: DocumentHead = ({ url }) => {
  const lang = url.searchParams.get("lang") || "en-US";

  return {
    title: `404 | ${message(lang, "langPageNotFound")}`,
    meta: [
      {
        name: "description",
        content: message(lang, "langPageNotFoundDescription"),
      },
    ],
  };
};
