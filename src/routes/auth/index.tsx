import { component$ } from "@builder.io/qwik";
import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { LoginButton } from "~/components/login-button";

export default component$(() => {
  return (
    <div class="bg-base-100 relative min-h-screen overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(58% 0.02 250 / 0.22) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-40 -left-32 h-112 w-md rounded-full bg-[#f4b8a5]/40 blur-[120px]" />
        <div class="absolute top-[24%] -right-32 h-96 w-96 rounded-full bg-[#7da2ff]/30 blur-[120px]" />
        <div class="absolute -bottom-48 left-[30%] h-96 w-96 rounded-full bg-[#58c1c9]/25 blur-[130px]" />
      </div>

      <div class="relative z-10 flex min-h-screen flex-col">
        <header class="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <div class="flex items-center gap-3">
            <div class="border-base-300/70 bg-base-100/85 rounded-2xl border p-2 shadow-sm backdrop-blur-sm">
              <HiFilmOutline class="text-primary text-xl" />
            </div>
            <span class="text-base-content text-lg font-bold tracking-tight">
              Moviestracker
            </span>
          </div>
          <span class="badge border-base-300/80 bg-base-100/85 h-9 rounded-xl px-4 text-[0.8rem] font-medium backdrop-blur-sm">
            Personal Watchlist
          </span>
        </header>

        <main class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-10 px-6 pb-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-16">
          <section class="space-y-7">
            <div class="badge bg-base-200/80 h-9 rounded-xl border-0 px-4 text-xs font-semibold tracking-[0.08em] uppercase">
              Private movie hub
            </div>
            <h1 class="text-base-content text-4xl leading-[1.04] font-black tracking-tight md:text-6xl xl:text-7xl">
              Track movies and TV shows
              <br class="hidden lg:block" /> with{" "}
              <span class="bg-gradient-to-r from-[#df7d63] via-[#6a8fff] to-[#2fadb6] bg-clip-text text-transparent">
                clarity.
              </span>
            </h1>
            <p class="text-base-content/70 max-w-2xl text-lg leading-relaxed md:text-xl">
              A simple place to discover titles, open details, and keep your
              watchlist organized across every screen.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <LoginButton
                providerName="google"
                class="h-14 rounded-2xl border-0 bg-gradient-to-r from-[#3f7df0] to-[#5f8ffc] px-7 text-base font-semibold text-white shadow-lg shadow-[#5f8ffc]/35 transition-transform duration-300 hover:-translate-y-0.5 hover:from-[#376fda] hover:to-[#4f81f0]"
              >
                <svg
                  aria-label="Google logo"
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <g>
                    <path d="m0 0H512V512H0" fill="#fff"></path>
                    <path
                      fill="#34a853"
                      d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                    ></path>
                    <path
                      fill="#4285f4"
                      d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                    ></path>
                    <path
                      fill="#fbbc02"
                      d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                    ></path>
                    <path
                      fill="#ea4335"
                      d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                    ></path>
                  </g>
                </svg>
              </LoginButton>
            </div>
          </section>

          <section class="border-base-200/80 bg-base-100/86 shadow-base-content/7 mx-auto w-full max-w-md rounded-3xl border p-6 shadow-2xl backdrop-blur-md sm:p-7">
            <div class="mb-6 flex items-center justify-between">
              <div class="text-base-content text-lg font-bold tracking-tight">
                Why people use it
              </div>
              <span class="badge border-0 bg-[#f6b37c] text-[0.7rem] font-semibold text-white uppercase">
                New
              </span>
            </div>

            <div class="grid gap-4 text-sm">
              <article class="border-base-200 bg-base-200/45 rounded-2xl border p-4">
                <div class="mb-2 flex items-center gap-3">
                  <span class="grid h-9 w-9 place-items-center rounded-xl bg-[#72a0ff]/20 text-sm font-bold text-[#426fd8]">
                    01
                  </span>
                  <p class="text-base-content text-base font-bold">
                    Fast search
                  </p>
                </div>
                <p class="text-base-content/70 leading-relaxed">
                  Instant discovery with clean results across movies and series.
                </p>
              </article>

              <article class="border-base-200 bg-base-200/45 rounded-2xl border p-4">
                <div class="mb-2 flex items-center gap-3">
                  <span class="grid h-9 w-9 place-items-center rounded-xl bg-[#f0aa78]/25 text-sm font-bold text-[#ce7242]">
                    02
                  </span>
                  <p class="text-base-content text-base font-bold">
                    Clear details
                  </p>
                </div>
                <p class="text-base-content/70 leading-relaxed">
                  Get key info quickly without heavy UI clutter or noise.
                </p>
              </article>

              <article class="border-base-200 bg-base-200/45 rounded-2xl border p-4">
                <div class="mb-2 flex items-center gap-3">
                  <span class="grid h-9 w-9 place-items-center rounded-xl bg-[#6fc5cd]/25 text-sm font-bold text-[#2f939a]">
                    03
                  </span>
                  <p class="text-base-content text-base font-bold">
                    One watchlist
                  </p>
                </div>
                <p class="text-base-content/70 leading-relaxed">
                  Keep everything you plan to watch in a single personal queue.
                </p>
              </article>
            </div>
          </section>
        </main>

        <footer class="border-base-200/70 bg-base-100/70 border-t backdrop-blur-sm">
          <div class="text-base-content/65 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
            <p>© 2026 Moviestracker</p>
            <div class="flex items-center gap-5">
              <a href="#" class="hover:text-base-content transition-colors">
                Terms
              </a>
              <a href="#" class="hover:text-base-content transition-colors">
                Privacy
              </a>
              <a href="#" class="hover:text-base-content transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});
