import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { HiExclamationCircleOutline } from "@qwikest/icons/heroicons";

export default component$(() => {
  return (
    <div class="hero min-h-screen">
      <div class="hero-content text-center">
        <div class="max-w-xl ">
          <div class="flex justify-center text-6xl font-bold">
            <HiExclamationCircleOutline />
            <h1 class="ps-2">404</h1>
          </div>
          <p class="py-8 text-4xl"> Sorry, we couldn't find this page.</p>
          <Link class="btn btn-primary btn-lg" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Error 404",
};
