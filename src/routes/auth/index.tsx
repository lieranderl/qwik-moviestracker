import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { HiFilmOutline } from "@qwikest/icons/heroicons";
import { LoginButton } from "~/components/login-button";
import {
  langClearDetails,
  langClearDetailsDescription,
  langFastSearch,
  langFastSearchDescription,
  langNew,
  langOneWatchlist,
  langOneWatchlistDescription,
  langPersonalWatchlist,
  langPrivateCatalogAccessForSignedInUsers,
  langPrivateMovieHub,
  langSimplePlaceToDiscoverTitles,
  langTrackMoviesAndTvShowsAccent,
  langTrackMoviesAndTvShowsPrefix,
  langWhyPeopleUseIt,
  langGoogleLogo,
} from "~/utils/languages";

export default component$(() => {
  const location = useLocation();
  const lang = location.url.searchParams.get("lang") || "en-US";
  const authFeatureCards = [
    {
      copy: langFastSearchDescription(lang),
      icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z",
      index: "01",
      title: langFastSearch(lang),
      toneClass:
        "bg-[color:var(--auth-feature-one-bg)] text-[color:var(--auth-feature-one-fg)]",
    },
    {
      copy: langClearDetailsDescription(lang),
      icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
      index: "02",
      title: langClearDetails(lang),
      toneClass:
        "bg-[color:var(--auth-feature-two-bg)] text-[color:var(--auth-feature-two-fg)]",
    },
    {
      copy: langOneWatchlistDescription(lang),
      icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
      index: "03",
      title: langOneWatchlist(lang),
      toneClass:
        "bg-[color:var(--auth-feature-three-bg)] text-[color:var(--auth-feature-three-fg)]",
    },
  ] as const;

  return (
    <div class="bg-base-100 page-enter relative min-h-screen overflow-hidden">
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

      <div class="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header class="section-reveal mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div class="flex items-center gap-3">
            <div class="border-base-300/70 bg-base-100/85 rounded-2xl border p-2 shadow-sm backdrop-blur-sm">
              <HiFilmOutline class="text-primary text-xl" />
            </div>
            <span class="text-base-content text-lg font-bold tracking-tight">
              Moviestracker
            </span>
          </div>
          <span class="badge badge-sm border-base-300/80 bg-base-100/85 h-8 rounded-xl px-3.5 text-[0.78rem] font-medium backdrop-blur-sm">
            {langPersonalWatchlist(lang)}
          </span>
        </header>

        {/* Hero - centered layout */}
        <main
          id="main-content"
          class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center lg:pb-20 lg:pt-4"
        >
          <div
            class="section-reveal badge badge-sm bg-base-200/80 mb-6 h-8 rounded-xl border-0 px-4 text-xs font-semibold tracking-[0.08em] uppercase"
          >
            {langPrivateMovieHub(lang)}
          </div>

          <h1
            class="section-reveal text-base-content mb-6 text-5xl leading-[1.02] font-black tracking-tight md:text-7xl lg:text-8xl"
            style={{ "--motion-delay": "80ms" }}
          >
            {langTrackMoviesAndTvShowsPrefix(lang)}{" "}
            <span class="from-(--auth-accent-from) via-[color:var(--auth-accent-via)] bg-linear-to-r to-(--auth-accent-to) bg-clip-text text-transparent">
              {langTrackMoviesAndTvShowsAccent(lang)}
            </span>
          </h1>

          <p
            class="section-reveal text-base-content/65 mb-10 max-w-xl text-lg leading-relaxed md:text-xl"
            style={{ "--motion-delay": "140ms" }}
          >
            {langSimplePlaceToDiscoverTitles(lang)}
          </p>

          <div
            class="section-reveal mb-20"
            style={{ "--motion-delay": "180ms" }}
          >
            <LoginButton
              lang={lang}
              providerName="google"
              class="h-14 rounded-2xl border-0 bg-linear-to-r from-(--auth-primary-from) to-(--auth-primary-to) px-8 text-base font-semibold text-white shadow-[0_20px_50px_var(--auth-primary-shadow)] transition-all duration-200 hover:scale-[1.02] hover:from-(--auth-primary-from-hover) hover:to-(--auth-primary-to-hover) hover:shadow-[0_24px_56px_var(--auth-primary-shadow)]"
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

          {/* Feature cards section */}
          <section
            class="section-reveal w-full max-w-4xl"
            style={{ "--motion-delay": "240ms" }}
          >
            <div class="mb-8 flex items-center justify-center gap-3">
              <span class="text-base-content text-base font-bold tracking-tight">
                {langWhyPeopleUseIt(lang)}
              </span>
              <span class="badge badge-sm border-0 bg-(--auth-badge-bg) text-[0.68rem] font-semibold text-white uppercase">
                {langNew(lang)}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {authFeatureCards.map((feature) => (
                <article
                  key={feature.index}
                  class="border-base-200/80 bg-base-100/70 group rounded-2xl border p-5 backdrop-blur-md transition-all duration-200 hover:shadow-lg"
                >
                  <div class="mb-3 flex items-center gap-3">
                    <span
                      class={[
                        "grid h-10 w-10 place-items-center rounded-xl text-sm font-bold",
                        feature.toneClass,
                      ]}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d={feature.icon} />
                      </svg>
                    </span>
                    <p class="text-base-content text-[0.95rem] font-bold">
                      {feature.title}
                    </p>
                  </div>
                  <p class="text-base-content/60 text-sm leading-relaxed">
                    {feature.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer class="border-base-200/70 bg-base-100/70 border-t backdrop-blur-sm">
          <div class="text-base-content/55 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
            <p>&copy; 2026 Moviestracker</p>
            <p>{langPrivateCatalogAccessForSignedInUsers(lang)}</p>
          </div>
        </footer>
      </div>
    </div>
  );
});
