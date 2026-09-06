import { GoogleAuth, type IdTokenClient } from "google-auth-library";

import type { ImdbRating } from "./models/imdb";
import { parseImdbRating } from "./provider-contracts";
import { requestWithRetry, upstreamHttpError, UpstreamError } from "./upstream";

const gatewayBaseUrl = "https://moviestracker-gw-eu-w1-8vmmbwbl.ew.gateway.dev";
const googleAuth = new GoogleAuth();
const idTokenClients = new Map<string, Promise<IdTokenClient>>();

export type ImdbLookupResult =
  | { status: "found"; rating: ImdbRating }
  | { status: "not-found" | "unavailable" };

type ImdbLookupOptions = {
  gatewayKey?: string;
  getAuthorization?: (audience: string) => Promise<string>;
  serviceUrl?: string;
};

const getAuthorization = async (audience: string): Promise<string> => {
  let pending = idTokenClients.get(audience);
  if (!pending) {
    pending = googleAuth.getIdTokenClient(audience);
    idTokenClients.set(audience, pending);
  }
  try {
    const client = await pending;
    const headers = await client.getRequestHeaders(audience);
    return headers.get("authorization") ?? "";
  } catch (error) {
    idTokenClients.delete(audience);
    throw error;
  }
};

export const createImdbLookup = ({
  gatewayKey,
  getAuthorization: resolveAuthorization = getAuthorization,
  serviceUrl,
}: ImdbLookupOptions) => {
  const audience = serviceUrl?.trim().replace(/\/$/, "");

  return async (imdbId: string): Promise<ImdbRating> => {
    const direct = !!audience;
    const url = new URL(
      direct ? "/getimdb" : "/getimdb",
      direct ? audience : gatewayBaseUrl,
    );
    url.searchParams.set("imdb_id", imdbId);
    const headers: Record<string, string> = direct
      ? { Authorization: await resolveAuthorization(audience) }
      : {
          Origin: "https://moviestracker.net",
          Referer: "https://moviestracker.net",
        };
    if (!direct) url.searchParams.set("key", gatewayKey ?? "");

    const input = await requestWithRetry(
      async (signal) => {
        const response = await fetch(url, { headers, signal });
        if (!response.ok) throw upstreamHttpError("imdb", response.status);
        try {
          return (await response.json()) as unknown;
        } catch (error) {
          throw new UpstreamError({
            source: "imdb",
            kind: "invalid-response",
            retryable: false,
            cause: error,
          });
        }
      },
      { source: "imdb", timeoutMs: 8_000, maxRetries: 1 },
    );
    return parseImdbRating(input);
  };
};

const lookupImdb = () =>
  createImdbLookup({
    gatewayKey: process.env.GC_API_KEY,
    serviceUrl: process.env.IMDB_SERVICE_URL,
  });

export const getImdbRating = (imdbId: string): Promise<ImdbRating> =>
  lookupImdb()(imdbId);

export const getImdbRatingResult = async (
  imdbId?: null | string,
): Promise<ImdbLookupResult> => {
  if (!imdbId) return { status: "not-found" };
  try {
    return { status: "found", rating: await getImdbRating(imdbId) };
  } catch (error) {
    if (error instanceof UpstreamError && error.kind === "not-found") {
      return { status: "not-found" };
    }
    console.error("IMDb lookup unavailable", {
      kind: error instanceof UpstreamError ? error.kind : "unavailable",
      source: "imdb",
      status: error instanceof UpstreamError ? error.status : undefined,
    });
    return { status: "unavailable" };
  }
};

export const getOptionalImdbRating = async (imdbId?: null | string) => {
  const result = await getImdbRatingResult(imdbId);
  return result.status === "found" ? result.rating : null;
};
