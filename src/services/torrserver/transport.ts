type JsonPrimitive = boolean | number | string;
type JsonQueryValue = JsonPrimitive | null | undefined;

export type TorrServerQueryParams = Record<string, JsonQueryValue>;
export type TorrServerHttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
export type TorrServerResponseType = "json" | "text";

export const TORR_SERVER_TIMEOUT_MS = 8_000;

export type TorrServerFailureKind =
  "http" | "invalid-url" | "network" | "timeout" | "validation";

export class TorrServerHttpError extends Error {
  readonly kind: TorrServerFailureKind;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      cause?: unknown;
      kind: TorrServerFailureKind;
      retryable?: boolean;
      status?: number;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "TorrServerHttpError";
    this.kind = options.kind;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

export type TorrServerRequestOptions = {
  body?: unknown;
  method?: TorrServerHttpMethod;
  path: string;
  query?: TorrServerQueryParams;
  responseType?: TorrServerResponseType;
  signal?: AbortSignal;
  timeout?: number;
};

export const normalizeTorrServerBaseUrl = (value: string): string =>
  value.trim().replace(/\/+$/, "");

const ensureBaseUrl = (value: string): string => {
  const normalized = normalizeTorrServerBaseUrl(value);
  if (!normalized) {
    throw new TorrServerHttpError("TorrServer base URL is required", {
      kind: "invalid-url",
    });
  }

  try {
    new URL(normalized);
    return normalized;
  } catch (cause) {
    throw new TorrServerHttpError("Invalid TorrServer base URL", {
      cause,
      kind: "invalid-url",
    });
  }
};

const encodePathValue = (value: string): string =>
  value
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

const buildQueryString = (query?: TorrServerQueryParams): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (value === true || value === "") {
      parts.push(encodeURIComponent(key));
      continue;
    }
    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
};

export const buildTorrServerUrl = (
  baseUrl: string,
  pathSegments: string[],
  query?: TorrServerQueryParams,
): string => {
  const url = new URL(`${ensureBaseUrl(baseUrl)}/`);
  const basePath = url.pathname.replace(/\/+$/, "");
  const nextPath = pathSegments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map(encodePathValue)
    .join("/");
  url.pathname = basePath ? `${basePath}/${nextPath}` : `/${nextPath}`;
  url.search = buildQueryString(query);
  return url.toString();
};

export const fetchTorrServer = async (
  resource: string,
  options: RequestInit & { timeout?: number },
): Promise<Response> => {
  const {
    signal: callerSignal,
    timeout = TORR_SERVER_TIMEOUT_MS,
    ...request
  } = options;
  const controller = new AbortController();
  const abort = () => controller.abort(callerSignal?.reason);
  callerSignal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(resource, { ...request, signal: controller.signal });
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new TorrServerHttpError(
        "TorrServer request timed out or was cancelled",
        {
          cause,
          kind: "timeout",
          retryable: !callerSignal?.aborted,
        },
      );
    }
    throw new TorrServerHttpError("TorrServer network request failed", {
      cause,
      kind: "network",
      retryable: true,
    });
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", abort);
  }
};

export const requestTorrServer = async <T = unknown>(
  baseUrl: string,
  {
    body,
    method = "GET",
    path,
    query,
    responseType = "json",
    signal,
    timeout = TORR_SERVER_TIMEOUT_MS,
  }: TorrServerRequestOptions,
): Promise<T> => {
  const response = await fetchTorrServer(
    buildTorrServerUrl(baseUrl, [path], query),
    {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method,
      signal,
      timeout,
    },
  );

  if (!response.ok) {
    throw new TorrServerHttpError("TorrServer request failed", {
      kind: "http",
      retryable: response.status === 429 || response.status >= 500,
      status: response.status,
    });
  }
  if (response.status === 204 || method === "HEAD") return undefined as T;
  if (responseType === "text") return (await response.text()) as T;

  const raw = await response.text();
  if (!raw) return undefined as T;
  try {
    return JSON.parse(raw) as T;
  } catch (cause) {
    throw new TorrServerHttpError("TorrServer returned invalid JSON", {
      cause,
      kind: "validation",
    });
  }
};

export const isOptionalTorrServerFailure = (error: unknown): boolean =>
  error instanceof TorrServerHttpError &&
  error.kind === "http" &&
  error.status !== undefined &&
  [401, 403, 404, 500].includes(error.status);
