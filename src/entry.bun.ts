/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Bun HTTP server when building for production.
 *
 * Learn more about the Bun integration here:
 * - https://qwik.dev/docs/deployments/bun/
 * - https://bun.sh/docs/api/http
 *
 */
import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";
import {
	UntrustedRequestOriginError,
	updateRequestOrigin,
} from "./request-origin";
import { applySecurityHeaders } from "./utils/security-headers";

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
	render,
	qwikCityPlan,
	manifest,
});

// Allow for dynamic port
const port = Number(Bun.env.PORT ?? 3000);

console.log(`Server started: http://localhost:${port}/`);

Bun.serve({
	async fetch(request: Request) {
		let updatedRequest: Request;
		try {
			updatedRequest = updateRequestOrigin(request, Bun.env);
		} catch (error) {
			if (error instanceof UntrustedRequestOriginError) {
				return new Response("Untrusted request origin.", { status: 400 });
			}
			throw error;
		}

		const staticResponse = await staticFile(updatedRequest);
		if (staticResponse) {
			return applySecurityHeaders(staticResponse, updatedRequest);
		}

		// Server-side render this request with Qwik City
		const qwikCityResponse = await router(updatedRequest);
		if (qwikCityResponse) {
			return applySecurityHeaders(qwikCityResponse, updatedRequest);
		}

		// Path not found
		return applySecurityHeaders(await notFound(updatedRequest), updatedRequest);
	},
	port,
});
