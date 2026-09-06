import type { Session } from "@auth/core/types";
import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Toolbar } from "~/components/toolbar/toolbar";
import {
  createDevSession,
  DEV_SESSION_BYPASS_COOKIE,
} from "~/routes/dev-session";
import { applyAuthenticatedCachePolicy } from "~/routes/authenticated-cache";
import { buildAuthRedirectPath } from "~/routes/auth-redirect";

export const useQueryParamsLoader = routeLoader$(async (event) => {
  const lang = event.query.get("lang") || "en-US";
  return { lang };
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  applyAuthenticatedCachePolicy(cacheControl);
};

//auth guard
export const onRequest: RequestHandler = (event) => {
  applyAuthenticatedCachePolicy(event.cacheControl);

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
    const authPath = buildAuthRedirectPath(lang);
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
        class="custom-container page-enter pt-20 pb-10 md:pt-24 md:pb-12"
      >
        <Slot />
      </main>
    </>
  );
});
