import { message } from "~/utils/i18n";
import type { QwikIntrinsicElements } from "@builder.io/qwik";
import { $, component$, Slot, useId, useSignal } from "@builder.io/qwik";
import { useSignIn } from "~/routes/plugin@auth";
import TmdbLogo from "~/media/tmdb-logo.svg?jsx";
import { langSignInWithProvider } from "~/utils/languages";
import { paths } from "~/utils/paths";

export type LoginButtonProps = QwikIntrinsicElements["button"] & {
  lang?: string;
  providerName: string;
};

export const LoginButton = component$<LoginButtonProps>((props) => {
  const {
    lang = "en-US",
    providerName = "google",
    class: className,
    ...buttonProps
  } = props;
  const signIn = useSignIn();
  const isloading = useSignal(false);
  const dialogRef = useSignal<HTMLDialogElement>();
  const consentRef = useSignal<HTMLInputElement>();
  const continueButtonRef = useSignal<HTMLButtonElement>();
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const providerLabel =
    providerName.charAt(0).toUpperCase() + providerName.slice(1);

  const closeDialog = $(() => {
    if (consentRef.value) consentRef.value.checked = false;
    if (continueButtonRef.value) continueButtonRef.value.disabled = true;
  });

  const continueSignIn = $(() => {
    if (!consentRef.value?.checked || isloading.value) return;

    isloading.value = true;
    signIn.submit({
      redirectTo: paths.index(lang),
      providerId: providerName,
    });
  });

  return (
    <>
      <button
        {...buttonProps}
        aria-busy={isloading.value}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        class={[
          "btn btn-outline border-base-300 bg-base-100 text-base-content hover:border-base-300 hover:bg-base-200/75 shadow-sm",
          className,
        ]}
        type="button"
        disabled={isloading.value || !!buttonProps.disabled}
        onClick$={$(() => {
          const consent = consentRef.value;
          const continueButton = continueButtonRef.value;

          if (consent) {
            consent.checked = false;
            consent.onchange = () => {
              if (continueButton) {
                continueButton.disabled = !consent.checked;
              }
            };
          }
          if (continueButton) {
            continueButton.disabled = true;
          }
          const dialog = dialogRef.value;
          if (dialog && !dialog.open) dialog.showModal();
        })}
      >
        {isloading.value && (
          <span aria-live="polite" class="inline-flex items-center gap-2">
            <span class="loading loading-spinner loading-sm" />
            <span>{message(lang, "langSigningIn")}</span>
          </span>
        )}
        {!isloading.value && (
          <span class="inline-flex items-center gap-2">
            <span class="text-xl">
              <Slot />
            </span>
            <span>{langSignInWithProvider(lang, providerLabel)}</span>
          </span>
        )}
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        aria-labelledby={titleId}
        class="modal"
        onCancel$={closeDialog}
        onClose$={closeDialog}
      >
        <div class="modal-box overlay-enter border-base-200 bg-base-100 max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto border p-0 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:w-11/12">
          <header class="border-base-200 bg-base-100/95 sticky top-0 z-20 flex items-start justify-between gap-3 border-b px-4 py-4 text-left backdrop-blur sm:px-6">
            <div class="min-w-0 space-y-1">
              <h2
                id={titleId}
                class="text-xl leading-tight font-bold sm:text-2xl"
              >
                {message(lang, "auth.disclaimer.title")}
              </h2>
              <p class="text-base-content/65 text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.subtitle")}
              </p>
            </div>
            <form method="dialog">
              <button
                type="submit"
                aria-label={message(lang, "auth.disclaimer.close")}
                class="btn btn-ghost btn-circle min-h-11 min-w-11"
              >
                ✕
              </button>
            </form>
          </header>

          <div class="space-y-5 px-4 py-5 text-left sm:px-6">
            <section class="space-y-1.5">
              <h3 class="font-semibold">
                {message(lang, "auth.disclaimer.aboutHeading")}
              </h3>
              <p class="text-base-content/75 text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.aboutText")}
              </p>
            </section>

            <section class="border-base-200 rounded-box bg-base-200/55 space-y-2 border p-4">
              <div class="w-fit rounded-md bg-white px-2 py-1.5">
                <TmdbLogo
                  role="img"
                  aria-label={message(lang, "auth.disclaimer.tmdbLogo")}
                  width="273"
                  height="36"
                  class="h-6 w-auto sm:h-7"
                />
              </div>
              <h3 class="font-semibold">
                {message(lang, "auth.disclaimer.tmdbHeading")}
              </h3>
              <p class="text-base-content/75 text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.tmdbText")}
              </p>
              <p class="text-sm leading-relaxed font-medium">
                {message(lang, "auth.disclaimer.tmdbAttribution")}
              </p>
              <a
                class="link link-hover text-sm font-semibold"
                href="https://www.themoviedb.org/"
                rel="noopener noreferrer"
                target="_blank"
              >
                {message(lang, "auth.disclaimer.tmdbLink")}
              </a>
            </section>

            <section class="border-base-200 rounded-box bg-base-200/55 space-y-2 border p-4">
              <h3 class="font-semibold">
                {message(lang, "auth.disclaimer.jacredHeading")}
              </h3>
              <p class="text-base-content/75 text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.jacredText")}
              </p>
              <a
                class="link link-hover text-sm font-semibold"
                href="https://jacred.su/"
                rel="noopener noreferrer"
                target="_blank"
              >
                {message(lang, "auth.disclaimer.jacredLink")}
              </a>
            </section>

            <section class="space-y-1.5">
              <h3 class="font-semibold">
                {message(lang, "auth.disclaimer.noHostingHeading")}
              </h3>
              <p class="text-base-content/75 text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.noHostingText")}
              </p>
            </section>

            <div role="alert" class="alert alert-warning alert-soft text-left">
              <span class="text-sm leading-relaxed">
                {message(lang, "auth.disclaimer.responsibility")}
              </span>
            </div>

            <label class="border-base-300 bg-base-100 rounded-box flex cursor-pointer items-start gap-3 border p-4">
              <input
                ref={consentRef}
                type="checkbox"
                class="checkbox checkbox-primary mt-0.5 shrink-0"
              />
              <span class="text-sm leading-relaxed font-medium">
                {message(lang, "auth.disclaimer.agree")}
              </span>
            </label>
          </div>

          <footer class="border-base-200 bg-base-100/95 sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:flex-row sm:justify-end sm:px-6">
            <form method="dialog">
              <button type="submit" class="btn min-h-11 w-full sm:w-auto">
                {message(lang, "auth.disclaimer.cancel")}
              </button>
            </form>
            <button
              ref={continueButtonRef}
              type="button"
              class="btn btn-primary min-h-11 w-full sm:w-auto"
              disabled
              onClick$={continueSignIn}
            >
              {message(lang, "auth.disclaimer.continueWithProvider", {
                provider: providerLabel,
              })}
            </button>
          </footer>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="submit">
            {message(lang, "auth.disclaimer.cancel")}
          </button>
        </form>
      </dialog>
    </>
  );
});
