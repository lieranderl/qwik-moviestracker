import { $, component$ } from "@builder.io/qwik";
import { Image } from "@unpic/qwik";
import { useSession, useSignOut } from "~/routes/plugin@auth";
import {
  langAccount,
  langAccountMenu,
  langAvatar,
  langOpenAccountMenu,
  langPreferences,
  langSingOut,
} from "~/utils/languages";
import { LangButton } from "./lang-button";
import type { ToolbarProps } from "./toolbar";

export const UserMenu = component$(({ lang }: ToolbarProps) => {
  const session = useSession();
  const signOut = useSignOut();
  const user = session.value?.user;
  const userName = user?.name?.trim() ?? "";
  const userEmail = user?.email?.trim() ?? "";
  const userImage = user?.image?.trim() ?? "";
  const userLabel = userName || userEmail || langAccount(lang);
  const userSecondaryLabel = userName && userEmail ? userEmail : "";
  const userInitial = userLabel.charAt(0).toUpperCase();
  const authRedirectHref = lang
    ? `/auth/?lang=${encodeURIComponent(lang)}`
    : "/auth";
  const submitSignOut = $(async () => {
    await signOut.submit({ redirectTo: authRedirectHref });

    if (globalThis.location.pathname === "/auth/") {
      return;
    }

    globalThis.location.assign(authRedirectHref);
  });

  if (!session.value) {
    return null;
  }

  return (
    <div class="relative z-[70] ml-1 shrink-0">
      <details class="dropdown dropdown-end">
        <summary
          aria-controls="toolbar-account-menu"
          aria-haspopup="menu"
          aria-label={langOpenAccountMenu(lang)}
          role="button"
          class="btn btn-ghost btn-circle avatar border-none bg-transparent p-0 shadow-none list-none transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden"
        >
          {userImage ? (
            <div class="border-base-200 bg-base-100 h-10 w-10 overflow-hidden rounded-full border shadow-sm">
              <Image
                src={userImage}
                alt={`${userLabel} ${langAvatar(lang)}`}
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
        </summary>
        <ul
          id="toolbar-account-menu"
          tabIndex={0}
          role="menu"
          aria-label={langAccountMenu(lang)}
          class="menu menu-sm dropdown-content rounded-box border-base-200 bg-base-100/95 text-base-content z-[80] mt-3 w-72 border p-2 shadow-xl backdrop-blur-md"
        >
          <li class="pointer-events-none mb-1 px-3 py-3">
            <div class="rounded-box border-base-200 bg-base-200/60 flex items-center gap-3 border px-3 py-3 shadow-sm">
              {userImage ? (
                <div class="avatar">
                  <div class="h-11 w-11 overflow-hidden rounded-full">
                    <Image
                      src={userImage}
                      alt={`${userLabel} ${langAvatar(lang)}`}
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
                  {userLabel}
                </span>
                {userSecondaryLabel ? (
                  <span class="text-base-content/65 block truncate text-xs">
                    {userSecondaryLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </li>
          <li class="menu-title px-3 pt-1 pb-1 text-[10px] tracking-[0.2em] uppercase opacity-60">
            <span>{langPreferences(lang)}</span>
          </li>
          <LangButton />
          <li class="px-2 py-1">
            <div class="divider my-0" />
          </li>
          <li>
            <button
              type="button"
              class="btn btn-ghost text-error hover:bg-error/10 active:bg-error/15 h-auto min-h-0 w-full justify-start rounded-full px-3 py-2.5 text-sm font-medium normal-case shadow-none"
              onClick$={submitSignOut}
            >
              {langSingOut(lang)}
            </button>
          </li>
        </ul>
      </details>
    </div>
  );
});
