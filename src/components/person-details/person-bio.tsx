import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useStore,
} from "@builder.io/qwik";

export function useWindowSize() {
  const w_width = useStore({ size: 300 });
  useOnWindow(
    "resize",
    $(() => {
      console.log("resize");
      const { innerWidth, innerHeight } = window;
      if (innerWidth && innerHeight) {
        if (innerWidth > 1200) {
          console.log("1200");
          w_width.size = 700;
        } else if (innerWidth > 900 && innerWidth < 1200) {
          console.log("900");
          w_width.size = 500;
        } else {
          console.log("300");
          w_width.size = 300;
        }
      }
    }),
  );
  return w_width;
}

export type PersonBioProps = {
  biography?: string;
};
export const PersonBio = component$<PersonBioProps>(({ biography }) => {
  const isShowBio = useSignal(false);
  const bioSize = useWindowSize();
  return (
    <>
      {biography && (
        <div>
          {biography.length >= 300 && (
            <div>
              {!isShowBio.value && (
                <div>{biography.substring(0, bioSize.size)}...</div>
              )}
              {isShowBio.value && <div>{biography}</div>}
              <div
                class="float-right text-sm underline hover:cursor-pointer"
                onClick$={() => {
                  isShowBio.value = !isShowBio.value;
                }}
              >
                {!isShowBio.value && <span>Read more...</span>}
                {isShowBio.value && <span>Read less...</span>}
              </div>
            </div>
          )}
          {biography.length < 300 && <div>{biography}</div>}
        </div>
      )}
    </>
  );
});
