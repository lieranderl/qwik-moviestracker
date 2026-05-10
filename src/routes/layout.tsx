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
		// Always serve a cached response by default, up to a week stale
		staleWhileRevalidate: 60 * 60 * 24 * 7,
		// Max once every 5 seconds, revalidate on the server to get a fresh version of this page
		maxAge: 5,
	});
};

export default component$(() => {
	return <Slot />;
});
