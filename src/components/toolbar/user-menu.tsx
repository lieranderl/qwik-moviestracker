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
            class="z-50 hidden my-4 text-base list-none bg-primary divide-y divide-primary-100 rounded-lg shadow dark:bg-primary-700 dark:divide-primary-600"
            id="user-dropdown"
          >
            {session.value.user && (
              <div class="px-4 py-3">
                <span class="block text-sm text-primary-900 dark:text-primary">
                  {session.value.user.name}
                </span>
                <span class="block text-sm  text-primary-600 truncate dark:text-primary-300">
                  {session.value.user.email}
                </span>
              </div>
            )}

            <ul class="py-2" aria-labelledby="user-menu-button">
              <LangButton />
            </ul>

            <ul class="py-2" aria-labelledby="user-menu-button">
              <li
                onClick$={() => signOut.submit({ callbackUrl: "/auth" })}
                class="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-600 dark:text-primary-200 dark:hover:text-primary cursor-pointer"
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
