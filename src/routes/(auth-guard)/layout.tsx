import type { Session } from "@auth/core/types";
import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Toolbar } from "~/components/toolbar/toolbar";
import {
  createDevSession,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";

export const useQueryParamsLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  return { lang };
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

//auth guard
export const onRequest: RequestHandler = (event) => {
  event.cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  }); // disable caching

  let session: Session | null = event.sharedMap.get("session");
  if (!session) {
    const lang = event.url.searchParams.get("lang") || "en-US";
    const devSession = createDevSession({
      bypassCookie: event.cookie.get(DEV_SESSION_BYPASS_COOKIE)?.value ?? null,
      bypassFlag: event.env.get("PLAYWRIGHT_AUTH_BYPASS"),
      lang,
      nodeEnv: event.env.get("NODE_ENV") ?? process.env.NODE_ENV,
    });

    if (devSession) {
      event.sharedMap.set("session", devSession);
      session = devSession;
    }
  }

  if (!session || new Date(session.expires) < new Date() || session.error) {
    const lang = event.url.searchParams.get("lang");
    const authPath = lang ? `/auth/?lang=${encodeURIComponent(lang)}` : "/auth";
    throw event.redirect(302, authPath);
  }
};

export default component$(() => {
  const useQparam = useQueryParamsLoader();
  return (
    <>
      <Toolbar lang={useQparam.value.lang} />
      <main
        id="main-content"
        class="custom-container page-enter pt-20 pb-8 md:pt-24"
      >
        <Slot />
      </main>
    </>
  );
});
