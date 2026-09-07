import { message } from "~/utils/i18n";
import { component$ } from "@builder.io/qwik";
import { HiExclamationTriangleSolid } from "@qwikest/icons/heroicons";

import { paths } from "~/utils/paths";

type NotFoundPageProps = {
  lang: string;
};

export const NotFoundPage = component$<NotFoundPageProps>(({ lang }) => {
  return (
    <div class="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
      <section class="card border-base-200 bg-base-100 w-full max-w-xl border shadow-sm">
        <div class="card-body items-center text-center">
          <HiExclamationTriangleSolid class="text-warning h-14 w-14" />
          <h1 class="text-3xl font-bold">404</h1>
          <h2 class="text-xl font-semibold">{message(lang, "langNotFound")}</h2>
          <p class="text-base-content/70">
            {message(lang, "langPageNotFoundDescription")}
          </p>
          <div class="mt-3 flex gap-3">
            <a href={paths.index(lang)} class="btn btn-primary">
              {message(lang, "langHome")}
            </a>
            <a href={paths.search(lang)} class="btn btn-ghost">
              {message(lang, "langSearch")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});
