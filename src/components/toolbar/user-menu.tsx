import { component$, $ } from "@builder.io/qwik";
import { LangButton } from "./lang-button";
import { Image } from "@unpic/qwik";
import { useAuthSession, useAuthSignout } from "~/routes/plugin@auth";
import { langSingOut } from "~/utils/languages";
import type { ToolbarProps } from "./toolbar";

export const UserMenu = component$(({ lang }: ToolbarProps) => {
  const session = useAuthSession();
  const signOut = useAuthSignout();

  return (
    <>
      {session.value && (
        <div class="dropdown dropdown-end dropdown-bottom">
          <div tabIndex={0} role="button" class="avatar flex items-center">
            <div class="w-10 rounded-full">
              {session.value.user && (
                <Image src={session.value.user.image} alt="user photo" />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            class="menu dropdown-content rounded-box bg-base-100 z-[1] w-52 p-2 shadow"
          >
            {session.value.user && (
              <div class="px-4 py-3">
                <span class="block text-sm ">{session.value.user.name}</span>
                <span class="block truncate text-sm">
                  {session.value.user.email}
                </span>
              </div>
            )}

            <li>
              <LangButton />
            </li>

            <li
              onClick$={$(() => signOut.submit({ callbackUrl: "/auth" }))}
              class="hover:text-primary block cursor-pointer px-4 py-2 text-sm"
            >
              {langSingOut(lang)}
            </li>
          </ul>
        </div>
      )}
    </>
  );
});
