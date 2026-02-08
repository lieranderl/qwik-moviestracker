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

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
});

// Allow for dynamic port
const port = Number(Bun.env.PORT ?? 3000);

console.log(`Server started: http://localhost:${port}/`);

function updateRequestOrigin(request: Request): Request {
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host");
  const origin = `${protocol}://${host}`;
  const url = new URL(request.url);
  const updatedUrl = new URL(url.pathname, origin);
  updatedUrl.search = url.search; // Preserve the query parameters

  return new Request(updatedUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}

Bun.serve({
  async fetch(request: Request) {
    const updatedRequest = updateRequestOrigin(request); // Use the new function
    const staticResponse = await staticFile(updatedRequest);
    if (staticResponse) {
      return staticResponse;
    }

    // Server-side render this request with Qwik City
    const qwikCityResponse = await router(updatedRequest);
    if (qwikCityResponse) {
      return qwikCityResponse;
    }

    // Path not found
    return notFound(updatedRequest);
  },
  port,
});
