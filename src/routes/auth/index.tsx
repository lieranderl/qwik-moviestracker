import { component$ } from "@builder.io/qwik";
import { SiGoogle, SiGithub } from "@qwikest/icons/simpleicons";
import { LoginButton } from "~/components/login-button";
import { HiFilmOutline } from "@qwikest/icons/heroicons";

export default component$(() => {

  return (
    <div
      class="hero min-h-screen"
      // style="background-image: url('/background.jpg');"
    >
      {/* <div class="hero-overlay bg-opacity-85 bg-base-100"></div> */}
      <div class="hero-content text-center">
        <div class="flex max-w-lg flex-col items-center gap-2">
          <HiFilmOutline class="text-6xl "></HiFilmOutline>
          <article class="prose mb-20">
            <h1>Moviestracker</h1>
          </article>

          <div class="flex w-fit flex-col gap-y-1">
            <LoginButton providerName="google">
              <SiGoogle></SiGoogle>
            </LoginButton>
            <LoginButton providerName="github">
              <SiGithub></SiGithub>
            </LoginButton>
          </div>
        </div>
      </div>
    </div>
  );
});
