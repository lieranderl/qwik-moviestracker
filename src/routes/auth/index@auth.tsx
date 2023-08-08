import {
  component$,
  $,
  useVisibleTask$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { onAuthStateChanged, signInWithRedirect } from "firebase/auth";
import {
  ButtonPrimary,
  ButtonSize,
  ButtonType,
} from "~/components/button-primary";
import { auth, googleProvider } from "~/services/firestore";
import { useTokenCookies } from "~/routes/layout-auth";
import { toastManagerContext } from "~/components/toast/toastStack";

export default component$(() => {
  const action = useTokenCookies();
  const toastManager = useContext(toastManagerContext);
  const isLoading = useSignal(true);
  const authGoogle = $(async () => {
    console.log("authGoogle");
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      const e = error as Error;
      toastManager.addToast({
        message: e.message,
        type: "error",
        autocloseTime: 5000,
      });
    }
  });

  useVisibleTask$(async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = await user.getIdToken();
        const res = await action.submit({ uid });
        if (res.value.success) {
          console.log("signed in");
          document.location.assign("/");
        }
      } else {
        console.log("signed out");
        action.submit({ uid: "" });
        isLoading.value = false;
      }
    });
  });

  return (
    <div class="flex items-center justify-center mx-auto h-[calc(100vh-400px)]">
      <div class="text-center md:space-y-20 space-y-10">
        <p class="md:text-4xl font-bold text-2xl">Welcome to Moviestracker</p>
        <ButtonPrimary
          text="Sign in with Google"
          type={ButtonType.button}
          size={ButtonSize.lg}
          onClick={authGoogle}
          isLoading={isLoading.value}
        >
          <div class="mr-4">
            <svg
              class="w-5 h-5 fill-teal-50"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Google</title>
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          </div>
        </ButtonPrimary>
      </div>
    </div>
  );
});
