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
      index: "01",
      title: langFastSearch(lang),
      toneClass:
        "bg-[color:var(--auth-feature-one-bg)] text-[color:var(--auth-feature-one-fg)]",
    },
    {
      copy: langClearDetailsDescription(lang),
      index: "02",
      title: langClearDetails(lang),
      toneClass:
        "bg-[color:var(--auth-feature-two-bg)] text-[color:var(--auth-feature-two-fg)]",
    },
    {
      copy: langOneWatchlistDescription(lang),
      index: "03",
      title: langOneWatchlist(lang),
      toneClass:
        "bg-[color:var(--auth-feature-three-bg)] text-[color:var(--auth-feature-three-fg)]",
    },
  ] as const;

  return (
    <div class="bg-base-100 page-enter relative min-h-screen overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(58% 0.02 250 / 0.22) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -top-40 -left-32 h-112 w-md rounded-full bg-(--auth-blob-one) blur-[120px]" />
        <div class="absolute top-[24%] -right-32 h-96 w-96 rounded-full bg-(--auth-blob-two) blur-[120px]" />
        <div class="absolute -bottom-48 left-[30%] h-96 w-96 rounded-full bg-(--auth-blob-three) blur-[130px]" />
      </div>

      <div class="relative z-10 flex min-h-screen flex-col">
        <header class="section-reveal mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
          <div class="flex items-center gap-3">
            <div class="border-base-300/70 bg-base-100/85 rounded-2xl border p-2 shadow-sm backdrop-blur-sm">
              <HiFilmOutline class="text-primary text-xl" />
            </div>
            <span class="text-base-content text-lg font-bold tracking-tight">
              Moviestracker
            </span>
          </div>
          <span class="badge border-base-300/80 bg-base-100/85 h-9 rounded-xl px-4 text-[0.8rem] font-medium backdrop-blur-sm">
            {langPersonalWatchlist(lang)}
          </span>
        </header>

        <main
          id="main-content"
          class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-10 px-6 pb-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-16"
        >
          <section class="space-y-7">
            <div class="section-reveal badge bg-base-200/80 h-9 rounded-xl border-0 px-4 text-xs font-semibold tracking-[0.08em] uppercase">
              {langPrivateMovieHub(lang)}
            </div>
            <h1
              class="section-reveal text-base-content text-4xl leading-[1.04] font-black tracking-tight md:text-6xl xl:text-7xl"
              style={{ "--motion-delay": "80ms" }}
            >
              {langTrackMoviesAndTvShowsPrefix(lang)}
              <br class="hidden lg:block" />{" "}
              <span class="from-(--auth-accent-from)via-[color:var(--auth-accent-via)] bg-linear-to-r to-(--auth-accent-to) bg-clip-text text-transparent">
                {langTrackMoviesAndTvShowsAccent(lang)}
              </span>
            </h1>
            <p
              class="section-reveal text-base-content/70 max-w-2xl text-lg leading-relaxed md:text-xl"
              style={{ "--motion-delay": "140ms" }}
            >
              {langSimplePlaceToDiscoverTitles(lang)}
            </p>
            <div
              class="section-reveal flex flex-wrap items-center gap-3 pt-2"
              style={{ "--motion-delay": "180ms" }}
            >
              <LoginButton
                lang={lang}
                providerName="google"
                class="h-14 rounded-2xl border-0 bg-linear-to-r from-(--auth-primary-from) to-(--auth-primary-to) px-7 text-base font-semibold text-white shadow-[0_18px_42px_var(--auth-primary-shadow)] hover:from-(--auth-primary-from-hover) hover:to-(--auth-primary-to-hover)"
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
          </section>

          <section
            class="section-reveal border-base-200/80 bg-base-100/86 shadow-base-content/7 mx-auto w-full max-w-md rounded-3xl border p-6 shadow-2xl backdrop-blur-md sm:p-7"
            style={{ "--motion-delay": "120ms" }}
          >
            <div class="mb-6 flex items-center justify-between">
              <div class="text-base-content text-lg font-bold tracking-tight">
                {langWhyPeopleUseIt(lang)}
              </div>
              <span class="badge border-0 bg-(--auth-badge-bg) text-[0.7rem] font-semibold text-white uppercase">
                {langNew(lang)}
              </span>
            </div>

            <div class="grid gap-4 text-sm">
              {authFeatureCards.map((feature) => (
                <article
                  key={feature.index}
                  class="border-base-200 bg-base-200/45 rounded-2xl border p-4"
                >
                  <div class="mb-2 flex items-center gap-3">
                    <span
                      class={[
                        "grid h-9 w-9 place-items-center rounded-xl text-sm font-bold",
                        feature.toneClass,
                      ]}
                    >
                      {feature.index}
                    </span>
                    <p class="text-base-content text-base font-bold">
                      {feature.title}
                    </p>
                  </div>
                  <p class="text-base-content/70 leading-relaxed">
                    {feature.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer class="border-base-200/70 bg-base-100/70 border-t backdrop-blur-sm">
          <div class="text-base-content/65 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
            <p>© 2026 Moviestracker</p>
            <p>{langPrivateCatalogAccessForSignedInUsers(lang)}</p>
          </div>
        </footer>
      </div>
    </div>
  );
});
