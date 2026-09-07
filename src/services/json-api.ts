import {
  requestWithRetry,
  upstreamHttpError,
  UpstreamError,
  type UpstreamSource,
} from "./upstream";

type JsonQueryValue = boolean | null | number | string | undefined;

export type JsonQueryParams = Record<string, JsonQueryValue>;

type JsonApiAuthConfig = {
  param: string;
  value: (() => string | undefined) | string | undefined;
};

type JsonApiClientConfig = {
  auth?: JsonApiAuthConfig;
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  name: string;
  source: UpstreamSource;
  retry?: {
    baseDelayMs?: number;
    maxRetries?: number;
    timeoutMs?: number;
  };
};

type JsonRequestOptions = {
  headers?: HeadersInit;
  search?: JsonQueryParams;
  signal?: AbortSignal;
};

const resolveAuthValue = (value: JsonApiAuthConfig["value"]) => {
  return typeof value === "function" ? value() : value;
};

const appendSearchParams = (
  url: URL,
  search: JsonQueryParams | undefined,
  auth: JsonApiClientConfig["auth"],
) => {
  for (const [key, value] of Object.entries(search ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  if (auth) {
    url.searchParams.set(auth.param, resolveAuthValue(auth.value) ?? "");
  }
};

const buildUrl = (
  baseUrl: string,
  path: string,
  search: JsonQueryParams | undefined,
  auth: JsonApiClientConfig["auth"],
) => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBaseUrl);
  appendSearchParams(url, search, auth);
  return url;
};

export const createJsonApiClient = ({
  auth,
  baseUrl,
  defaultHeaders,
  name,
  source,
  retry,
}: JsonApiClientConfig) => ({
  request: async <T = unknown>(
    path: string,
    { headers, search, signal }: JsonRequestOptions = {},
  ): Promise<T> => {
    const url = buildUrl(baseUrl, path, search, auth);
    return requestWithRetry(
      async (attemptSignal) => {
        const response = await fetch(url, {
          headers: { ...defaultHeaders, ...headers },
          signal: attemptSignal,
        });
        if (!response.ok) throw upstreamHttpError(source, response.status);
        try {
          return (await response.json()) as T;
        } catch (error) {
          throw new UpstreamError({
            source,
            kind: "invalid-response",
            retryable: false,
            message: `${name} returned invalid JSON`,
            cause: error,
          });
        }
      },
      {
        source,
        timeoutMs: retry?.timeoutMs ?? 8_000,
        maxRetries: retry?.maxRetries,
        baseDelayMs: retry?.baseDelayMs,
        signal,
      },
    );
  },
});

export const getOptionalResult = async <T>(
  load: () => Promise<T>,
  onError: (error: unknown) => void,
) => {
  try {
    return await load();
  } catch (error) {
    onError(error);
    return null;
  }
};
