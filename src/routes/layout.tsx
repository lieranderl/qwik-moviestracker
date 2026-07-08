import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  CSP_NONCE_HEADER,
  createScriptNonce,
  getContentSecurityPolicy,
  QWIK_CSP_NONCE_KEY,
} from "../utils/security-headers";

export const onRequest: RequestHandler = ({ headers, sharedMap }) => {
  const scriptNonce = createScriptNonce();
  sharedMap.set(QWIK_CSP_NONCE_KEY, scriptNonce);
  headers.set(CSP_NONCE_HEADER, scriptNonce);
  headers.set(
    "Content-Security-Policy",
    getContentSecurityPolicy({ scriptNonce }),
  );
};

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Serve stale cache for up to 1 hour before requiring a fresh fetch
    staleWhileRevalidate: 3600,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return <Slot />;
});
