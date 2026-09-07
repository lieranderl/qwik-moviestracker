import { message } from "~/utils/i18n";
import { component$, useSignal } from "@builder.io/qwik";


export type PersonBioProps = {
  biography?: string;
  lang: string;
};
export const PersonBio = component$<PersonBioProps>(({ biography, lang }) => {
  const isShowBio = useSignal(false);
  const previewSize = 420;

  if (!biography) {
    return (
      <p class="text-base-content/70 text-sm">
        {message(lang, "ui.noBiographyAvailable")}
      </p>
    );
  }

  if (biography.length < 300) {
    return <p class="leading-relaxed">{biography}</p>;
  }

  return (
    <div class="space-y-3">
      <p class="leading-relaxed">
        {isShowBio.value
          ? biography
          : `${biography.substring(0, previewSize)}...`}
      </p>
      <button
        type="button"
        class="btn btn-ghost btn-sm px-0 normal-case"
        onClick$={() => {
          isShowBio.value = !isShowBio.value;
        }}
      >
        {isShowBio.value
          ? message(lang, "ui.readLess")
          : message(lang, "ui.readMore")}
      </button>
    </div>
  );
});
