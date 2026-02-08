import { component$ } from "@builder.io/qwik";
import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { SiGoogle } from "@qwikest/icons/simpleicons";
import { LoginButton } from "~/components/login-button";

export default component$(() => {
  return (
    <div class="bg-base-100 relative min-h-screen overflow-hidden">
      <div class="pointer-events-none absolute inset-0">
        <div class="bg-primary/8 absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl" />
        <div class="bg-secondary/8 absolute top-1/3 -right-16 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div class="relative z-10">
        <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div class="flex items-center gap-2">
            <div class="bg-base-200 rounded-box p-2">
              <HiFilmOutline class="text-primary text-xl" />
            </div>
            <span class="text-base-content text-lg font-bold">
              Moviestracker
            </span>
          </div>
          <span class="badge badge-outline">Personal Watchlist</span>
        </header>

        <main class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pt-10 pb-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:pt-14">
          <section class="space-y-5">
            <h1 class="text-base-content text-4xl leading-tight font-extrabold md:text-6xl">
              Track movies and TV shows with clarity.
            </h1>
            <p class="text-base-content/65 max-w-xl text-lg">
              A simple place to discover titles, open details, and keep your
              watchlist organized.
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <LoginButton providerName="google">
                <SiGoogle />
              </LoginButton>
              <span class="text-base-content/60 text-sm">
                Sign in with Google
              </span>
            </div>
          </section>

          <section class="card border-base-200 bg-base-100/95 shadow-sm">
            <div class="card-body gap-4">
              <div class="text-base-content/70 text-sm font-medium">
                Why people use it
              </div>
              <div class="grid gap-2 text-sm">
                <div class="bg-base-200/65 rounded-box px-3 py-2">
                  Fast search and discovery
                </div>
                <div class="bg-base-200/65 rounded-box px-3 py-2">
                  Clean details for movies and TV
                </div>
                <div class="bg-base-200/65 rounded-box px-3 py-2">
                  One personal watchlist
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
});
