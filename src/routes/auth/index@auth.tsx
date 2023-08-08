import {
  component$,
  $,
  useVisibleTask$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
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
  const nav = useNavigate();
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
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        user.getIdToken().then(async (uid) => {
          const res = await action.submit({ uid });
          if (res.value.success) {
            nav("/");
          }
        });
      } else {
        console.log("signed out");
        action.submit({ uid: "" });
        isLoading.value = false;
      }
    });
  });

  return (
    <div class="flex items-center justify-center pt-[100px] mx-auto h-[calc(100vh-75px)]">
      <ButtonPrimary
        text="Sign in with Google"
        type={ButtonType.button}
        size={ButtonSize.lg}
        onClick={authGoogle}
        isLoading={isLoading.value}
      />
    </div>
  );
});
