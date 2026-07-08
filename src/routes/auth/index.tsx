import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { LoginButton } from "~/components/login-button";
import {
  langPersonalWatchlist,
  langPrivateCatalogAccessForSignedInUsers,
  langPrivateMovieHub,
  langSimplePlaceToDiscoverTitles,
  langTrackMoviesAndTvShowsAccent,
  langTrackMoviesAndTvShowsPrefix,
  langGoogleLogo,
} from "~/utils/languages";

export default component$(() => {
  const location = useLocation();
  const lang = location.url.searchParams.get("lang") || "en-US";

  return (
    <div class="bg-base-100 page-enter relative min-h-dvh overflow-hidden">
      {/* Dot pattern */}
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(58% 0.02 250 / 0.18) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Animated gradient blobs */}
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-32 left-1/2 h-[480px] w-[600px] -translate-x-1/2 rounded-full bg-(--auth-blob-one) blur-[140px]"
          style={{ animation: "pulse 8s ease-in-out infinite" }}
        />
        <div
          class="absolute top-[40%] -right-40 h-80 w-80 rounded-full bg-(--auth-blob-two) blur-[120px]"
          style={{ animation: "pulse 10s ease-in-out 2s infinite" }}
        />
        <div
          class="absolute -bottom-32 -left-20 h-72 w-96 rounded-full bg-(--auth-blob-three) blur-[130px]"
          style={{ animation: "pulse 9s ease-in-out 4s infinite" }}
        />
      </div>

      <div class="relative z-10 flex min-h-dvh flex-col">
        {/* Header */}
        <header class="section-reveal mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
          <div class="flex items-center gap-3">
            <div class="border-base-300/70 bg-base-100/85 rounded-2xl border p-2 shadow-sm backdrop-blur-sm">
              <HiFilmOutline class="text-primary text-xl" />
            </div>
            <span class="text-base-content text-lg font-bold tracking-tight">
              Moviestracker
            </span>
          </div>
          <span class="badge badge-sm border-base-300/80 bg-base-100/85 px-3 text-xs font-medium backdrop-blur-sm">
            {langPersonalWatchlist(lang)}
          </span>
        </header>

        {/* Hero - centered layout */}
        <main
          id="main-content"
          class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pt-8 pb-16 text-center sm:px-6 lg:pt-12 lg:pb-24"
        >
          <div class="section-reveal badge badge-sm bg-base-200/80 mb-6 border-0 px-4 text-xs font-semibold tracking-wider uppercase">
            {langPrivateMovieHub(lang)}
          </div>

          <h1
            class="section-reveal text-base-content mb-5 text-4xl leading-[1.04] font-black tracking-tight sm:text-5xl md:mb-6 md:text-7xl lg:text-8xl"
            style={{ "--motion-delay": "80ms" }}
          >
            {langTrackMoviesAndTvShowsPrefix(lang)}{" "}
            <span class="bg-linear-to-r from-(--auth-accent-from) via-[color:var(--auth-accent-via)] to-(--auth-accent-to) bg-clip-text text-transparent">
              {langTrackMoviesAndTvShowsAccent(lang)}
            </span>
          </h1>

          <p
            class="section-reveal text-base-content/65 mb-8 max-w-xl text-base leading-relaxed sm:text-lg md:mb-10 md:text-xl"
            style={{ "--motion-delay": "140ms" }}
          >
            {langSimplePlaceToDiscoverTitles(lang)}
          </p>

          <div class="section-reveal" style={{ "--motion-delay": "180ms" }}>
            <LoginButton
              lang={lang}
              providerName="google"
              class="min-h-14 rounded-2xl border-0 bg-linear-to-r from-(--auth-primary-from) to-(--auth-primary-to) px-6 text-base font-semibold text-white shadow-[0_20px_50px_var(--auth-primary-shadow)] transition-all duration-200 hover:scale-[1.02] hover:from-(--auth-primary-from-hover) hover:to-(--auth-primary-to-hover) hover:shadow-[0_24px_56px_var(--auth-primary-shadow)] sm:px-8"
            >
              <svg
                aria-label={langGoogleLogo(lang)}
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
        </main>

        {/* Footer */}
        <footer class="border-base-200/70 bg-base-100/70 border-t backdrop-blur-sm">
          <div class="text-base-content/55 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-sm sm:flex-row sm:gap-3 sm:px-6 sm:text-left">
            <p>&copy; 2026 Moviestracker</p>
            <p>{langPrivateCatalogAccessForSignedInUsers(lang)}</p>
          </div>
        </footer>
      </div>
    </div>
  );
});
