import { component$, $, useContext } from "@builder.io/qwik";
import { ThemeButton } from "./theme-button";
import { LangButton } from "./lang-button";
import { ButtonPrimary, ButtonType, ButtonSize } from "./button-primary";
import { auth } from "~/services/firestore";
import { useNavigate } from "@builder.io/qwik-city";
import { toastManagerContext } from "./toast/toastStack";
// import { useTokenCookiesDelete } from "~/routes/layout";
interface ToolbarProps {
  lang: string;
}


export const Toolbar = component$(({ lang }: ToolbarProps) => {
  const nav = useNavigate();
  const  toastManager = useContext(toastManagerContext)
  // const action = useTokenCookiesDelete();
  const logout = $(() => {
    auth.signOut().then(() => {
      console.log("signed out LOUT BUTTION");
      nav("/auth");
    }).catch((error) => {
      toastManager.addToast({message: error.message, type: "error", autocloseTime: 5000})
    });
  });

  

  // useVisibleTask$(async () => {
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/auth.user
  //       user.getIdToken().then((idToken) => {
  //         action.submit({ uid: idToken });
  //       });
  //       console.log("signed in");
  //       console.log(user.uid);
  //        nav("/");

  //       // ...
  //     } else {
  //       // User is signed out
  //       // ...
  //       console.log("signed out!!!!!!!!");
  //       action.submit({ uid: null });
  //     }
  //   });
  // });

  return (
    <nav class="block bg-teal-50 bg-opacity-50 dark:bg-teal-950 dark:bg-opacity-50 backdrop-blur-sm fixed z-10">
      <div class="w-screen flex flex-wrap items-center justify-between mx-auto p-4 bg-opacity-100 ">
        <a href={lang ? `/?lang=${lang}` : `/`} class="flex items-center">
          <div class="text-[2.5rem] fill-teal-950 dark:fill-teal-50 me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              width="1em"
              height="1em"
              data-qwikest-icon=""
              q:key="lC_0"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
              ></path>
            </svg>
          </div>
          <span class="self-center text-2xl font-semibold whitespace-nowrap">
            Moviestracker
          </span>
        </a>

        <div class="flex items-center">
          <div class="flex items-center md:order-2">
            <LangButton />
            <ThemeButton />
            <ButtonPrimary
              text="Logout"
              type={ButtonType.button}
              size={ButtonSize.sm}
              onClick={logout}
            />
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              class="md:hidden hover:bg-teal-100 dark:hover:bg-teal-900 focus:outline-none focus:ring-0 focus:ring-teal-100 dark:focus:ring-teal-900 rounded-lg text-sm p-2.5"
              type="button"
            >
              <svg
                class="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
            <div
              id="dropdown"
              class="z-10 hidden bg-teal-50 divide-y divide-teal-100 rounded-lg shadow w-44 dark:bg-teal-950 border border-teal-100 dark:border-teal-900"
            >
              <ul
                class="py-2 text-md space-y-2"
                aria-labelledby="dropdownDefaultButton"
              >
                <li class="mx-4">
                  <a
                    href={lang ? `/movie?lang=${lang}` : `/movie`}
                    class="group transition duration-300"
                  >
                    Movies
                    <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
                  </a>
                </li>
                <li class="mx-4">
                  <a
                    href={lang ? `/tv?lang=${lang}` : `/tv`}
                    class="group transition duration-300"
                  >
                    Series
                    <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
                  </a>
                </li>
                <li class="mx-4">
                  <a
                    href={lang ? `/search?lang=${lang}` : `/search`}
                    class="group transition duration-300"
                  >
                    Search
                    <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
                  </a>
                </li>
                <li class="mx-4">
                  <a
                    href={lang ? `/torrserver?lang=${lang}` : `/torrserver`}
                    class="group transition duration-300"
                  >
                    TorrServer
                    <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <ul class="hidden md:flex flex-row me-4">
            <li class="mx-4">
              <a
                href={lang ? `/movie?lang=${lang}` : `/movie`}
                class="group transition duration-300"
              >
                Movies
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/tv?lang=${lang}` : `/tv`}
                class="group transition duration-300"
              >
                Series
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/search?lang=${lang}` : `/search`}
                class="group transition duration-300"
              >
                Search
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
            <li class="mx-4">
              <a
                href={lang ? `/torrserver?lang=${lang}` : `/torrserver`}
                class="group transition duration-300"
              >
                TorrServer
                <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-teal-950 dark:bg-teal-50"></span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
});
