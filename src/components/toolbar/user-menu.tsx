import { component$ } from "@builder.io/qwik";
import { LangButton } from "./lang-button";
import { Image } from "@unpic/qwik";
import { useAuthSession, useAuthSignout } from "~/routes/plugin@auth";
import { useQueryParamsLoader } from "~/routes/layout";
import { langSingOut } from "~/utils/languages";

export const UserMenu = component$(() => {
  const session = useAuthSession();
  const signOut = useAuthSignout();
  const resource = useQueryParamsLoader();

  return (
    <>
      {session.value && (
        <>
          <button
            type="button"
            class="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded="false"
            data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom"
          >
            <span class="sr-only">Open user menu</span>
            {session.value.user && (
              <Image
                class="rounded-full"
                height={32}
                width={32}
                src={session.value.user.image}
                alt="user photo"
              />
            )}
          </button>
          <div
            class="z-50 hidden my-4 text-base list-none bg-teal-50 divide-y divide-teal-100 rounded-lg shadow dark:bg-teal-700 dark:divide-teal-600"
            id="user-dropdown"
          >
            {session.value.user && (
              <div class="px-4 py-3">
                <span class="block text-sm text-teal-900 dark:text-teal-50">
                  {session.value.user.name}
                </span>
                <span class="block text-sm  text-teal-500 truncate dark:text-teal-400">
                  {session.value.user.email}
                </span>
              </div>
            )}
            <ul class="py-2" aria-labelledby="user-menu-button">
              <LangButton />
              <li
                onClick$={() => signOut.submit({ callbackUrl: "/auth" })}
                class="block px-4 py-2 text-sm text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-600 dark:text-teal-200 dark:hover:text-teal-50 cursor-pointer"
              >
                {langSingOut(resource.value.lang)}
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
});
