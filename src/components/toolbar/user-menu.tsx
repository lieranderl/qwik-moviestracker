import { component$ } from "@builder.io/qwik";
import { LangButton } from "./lang-button";
import { Image } from "@unpic/qwik";
import { useAuthSession, useAuthSignout } from "~/routes/plugin@auth";
import { langSingOut } from "~/utils/languages";
import type { ToolbarProps } from "./toolbar";

export const UserMenu = component$(({lang}: ToolbarProps) => {
  const session = useAuthSession();
  const signOut = useAuthSignout();

  return (
    <>
      {session.value && (
        <div class="dropdown dropdown-bottom dropdown-end">
          <div tabIndex={0} role="button" class="avatar flex items-center">
            <div class="w-10 rounded-full">
              {session.value.user && (
                <Image src={session.value.user.image} alt="user photo" />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
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

            <li>
              <LangButton />
            </li>

            <li
              onClick$={() => signOut.submit({ callbackUrl: "/auth" })}
              class="block px-4 py-2 text-sm text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-600 dark:text-primary-200 dark:hover:text-primary cursor-pointer"
            >
              {langSingOut(lang)}
            </li>
          </ul>
        </div>
      )}
    </>
  );
});
