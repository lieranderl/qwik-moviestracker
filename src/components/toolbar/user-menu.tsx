import { component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { useSession, useSignOut } from "~/routes/plugin@auth";
import { langSingOut } from "~/utils/languages";
import { LangButton } from "./lang-button";
import type { ToolbarProps } from "./toolbar";

export const UserMenu = component$(({ lang }: ToolbarProps) => {
  const session = useSession();
  const signOut = useSignOut();
  const user = session.value?.user;
  const userLabel = user?.name || user?.email || "User";
  const userInitial = userLabel.charAt(0).toUpperCase();

  return (
    <div class="ml-1">
      {session.value && user && (
        <div class="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            aria-label="Open account menu"
            class="btn btn-ghost btn-circle avatar border-none bg-transparent p-0 shadow-none"
          >
            {user.image ? (
              <div class="border-base-200 bg-base-100 h-10 w-10 overflow-hidden rounded-full border shadow-sm">
                <Image
                  src={user.image}
                  alt={`${userLabel} avatar`}
                  class="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div class="avatar placeholder">
                <div class="border-base-200 bg-base-200 text-base-content h-10 w-10 rounded-full border text-sm font-semibold shadow-sm">
                  <span>{userInitial}</span>
                </div>
              </div>
            )}
          </div>
          <ul
            tabIndex={-1}
            role="menu"
            class="menu menu-sm dropdown-content rounded-box border-base-200 bg-base-100 z-60 mt-3 w-72 border p-2 shadow-xl"
          >
            <li class="pointer-events-none mb-1 px-3 py-3">
              <div class="rounded-box border-base-200 bg-base-200/55 flex items-center gap-3 border px-3 py-3 shadow-sm backdrop-blur">
                {user.image ? (
                  <div class="avatar">
                    <div class="h-11 w-11 overflow-hidden rounded-full">
                      <Image
                        src={user.image}
                        alt={`${userLabel} avatar`}
                        class="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div class="avatar placeholder">
                    <div class="border-base-200 bg-base-300 text-base-content h-11 w-11 rounded-full border text-sm font-semibold shadow-sm">
                      <span>{userInitial}</span>
                    </div>
                  </div>
                )}
                <div class="min-w-0">
                  <span class="text-base-content block truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span class="text-base-content/65 block truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </li>
            <li class="menu-title px-3 pt-1 pb-1 text-[10px] tracking-[0.2em] uppercase opacity-60">
              <span>Preferences</span>
            </li>
            <LangButton />
            <li class="px-2 py-1">
              <div class="divider my-0" />
            </li>
            <li>
              <button
                type="button"
                class="btn btn-ghost text-error hover:bg-error/10 active:bg-error/15 h-auto min-h-0 justify-start rounded-full px-3 py-2.5 text-sm font-medium normal-case shadow-none"
                onClick$={() => signOut.submit({ redirectTo: "/auth" })}
              >
                {langSingOut(lang)}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
});
