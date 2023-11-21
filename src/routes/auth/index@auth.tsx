import { component$ } from "@builder.io/qwik";
import { useQueryParamsLoader } from "../layout-auth";
import { langWelcome } from "~/utils/languages";
import { SiGoogle, SiGithub } from "@qwikest/icons/simpleicons";
import { LoginButton } from "~/components/login-button";

export default component$(() => {
  const resource = useQueryParamsLoader();

  return (
    <div class="flex items-center justify-center mx-auto h-[calc(100vh-400px)]">
      <div class="text-center md:space-y-20 space-y-10 grid justify-items-center">
        <p class="md:text-4xl font-bold text-2xl">
          {langWelcome(resource.value.lang)}
        </p>

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
  );
});
