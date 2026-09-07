import type {
  TorrServerSettings,
  TorrServerSettingsRaw,
  TorrServerStorageSettings,
  TorrServerStorageSettingsUpdate,
  TorrServerTMDBSettingsRaw,
  TorrServerTmdbSettings,
} from "../torrserver";
import {
  asNumber,
  asString,
  normalizeSettings,
  normalizeTmdbSettings,
} from "./normalizers";
import {
  parseTorrServerSettings,
  parseTorrServerStorageSettings,
  parseTorrServerStringRecord,
  parseTorrServerTmdbSettings,
} from "./payloads";
import {
  buildTorrServerUrl,
  fetchTorrServer,
  isOptionalTorrServerFailure,
  requestTorrServer,
  TORR_SERVER_TIMEOUT_MS,
  TorrServerHttpError,
} from "./transport";

export const getTorrServerSettings = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<TorrServerSettings | null> => {
  try {
    const raw = await requestTorrServer<TorrServerSettingsRaw>(baseUrl, {
      body: { action: "get" },
      method: "POST",
      path: "settings",
      signal,
    });
    return normalizeSettings(parseTorrServerSettings(raw));
  } catch (error) {
    if (isOptionalTorrServerFailure(error)) return null;
    throw error;
  }
};

export const getTorrServerStorageSettings = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<TorrServerStorageSettings | null> => {
  try {
    const raw = await requestTorrServer<Partial<TorrServerStorageSettings>>(
      baseUrl,
      { method: "GET", path: "storage/settings", signal },
    );
    const settings = parseTorrServerStorageSettings(raw);
    return {
      settings: asString(settings.settings, "json"),
      viewed: asString(settings.viewed, "json"),
      viewedCount: asNumber(settings.viewedCount, 0),
    };
  } catch (error) {
    if (isOptionalTorrServerFailure(error)) return null;
    throw error;
  }
};

export const updateTorrServerStorageSettings = async (
  baseUrl: string,
  update: TorrServerStorageSettingsUpdate,
): Promise<Record<string, string>> => {
  const form = new FormData();
  form.set("settings", update.settings);
  form.set("viewed", update.viewed);
  const response = await fetchTorrServer(
    buildTorrServerUrl(baseUrl, ["storage", "settings"]),
    { body: form, method: "POST", timeout: TORR_SERVER_TIMEOUT_MS },
  );
  if (!response.ok) {
    throw new TorrServerHttpError("TorrServer storage update failed", {
      kind: "http",
      retryable: response.status === 429 || response.status >= 500,
      status: response.status,
    });
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new TorrServerHttpError(
      "TorrServer storage update returned invalid JSON",
      { cause, kind: "validation" },
    );
  }
  return parseTorrServerStringRecord(payload);
};

export const getTorrServerTMDBSettings = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<TorrServerTmdbSettings | null> => {
  try {
    const raw = await requestTorrServer<TorrServerTMDBSettingsRaw>(baseUrl, {
      method: "GET",
      path: "tmdb/settings",
      signal,
    });
    return normalizeTmdbSettings(parseTorrServerTmdbSettings(raw));
  } catch (error) {
    if (isOptionalTorrServerFailure(error)) return null;
    throw error;
  }
};

export const getTorrServerTmdbSettings = getTorrServerTMDBSettings;
