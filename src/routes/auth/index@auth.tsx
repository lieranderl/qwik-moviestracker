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
import { SiGoogle } from "@qwikest/icons/simpleicons";

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
            <SiGoogle />
          </div>
        </ButtonPrimary>
      </div>
    </div>
  );
});
