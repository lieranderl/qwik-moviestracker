import { describe, expect, it } from "bun:test";
import type { QwikCityPlan } from "@builder.io/qwik-city";
import {
  requestHandler,
  type ServerRequestEvent,
} from "@builder.io/qwik-city/middleware/request-handler";
import { applyAuthenticatedCachePolicy } from "./authenticated-cache";

const render = async () => {
  throw new Error("The cache policy test must finish before rendering");
};

const getSerializedCacheControl = async () => {
  let responseHeaders: Headers | undefined;
  const plan: QwikCityPlan = {
    routes: [],
    serverPlugins: [
      {
        onGet: (event) => {
          applyAuthenticatedCachePolicy(event.cacheControl);
          event.text(200, "ok");
        },
      },
    ],
  };
  const request = new Request("https://movies.example/");
  const serverEvent: ServerRequestEvent<void> = {
    mode: "server",
    url: new URL(request.url),
    locale: undefined,
    platform: {},
    request,
    env: { get: () => undefined },
    getClientConn: () => ({ ip: "127.0.0.1" }),
    getWritableStream: (_status, headers, _cookies, resolve) => {
      responseHeaders = new Headers(headers);
      resolve();
      return new WritableStream<Uint8Array>();
    },
  };

  const run = await requestHandler(
    serverEvent,
    { render, qwikCityPlan: plan },
    {} as never,
  );
  await run?.completion;
  return responseHeaders?.get("Cache-Control") ?? null;
};

describe("authenticated cache policy", () => {
  it("serializes personalized responses as private and no-store", async () => {
    expect(await getSerializedCacheControl()).toBe("no-store, private");
  });
});
