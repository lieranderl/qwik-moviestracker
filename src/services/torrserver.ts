import type { MediaDetails, Torrent, TSResult } from "./models";

type FetchWithTimeoutOptions = RequestInit & { timeout?: number };

const fetchWithTimeout = async (
  resource: string,
  options: FetchWithTimeoutOptions,
) => {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
};

type MethodType =
  | "GET"
  | "POST"
  | "DELETE"
  | "PUT"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";

const fetchTorrServer = async <T = unknown>(
  resource: string,
  method: MethodType,
  path: string,
  body?: unknown,
): Promise<T> => {
  const requestOptions: FetchWithTimeoutOptions = {
    timeout: 5000,
    method: method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body) || "";
  }

  const url = `${resource}/${path}`;
  const response = await fetchWithTimeout(url, requestOptions);
  if (!response.ok) {
    throw new Error(
      `TorrServer request failed (${response.status}) for ${path}`,
    );
  }
  if (response.headers.get("Content-Type")?.includes("text")) {
    return response.text() as T;
  }
  return response.json();
};

export const torrServerEcho = async (url: string) =>
  fetchTorrServer<string>(url, "GET", "echo");

export const listTorrent = async (url: string) => {
  const body = {
    action: "list",
  };

  return fetchTorrServer<TSResult[]>(url, "POST", "torrents", body);
};

export const addTorrent = (
  url: string,
  torrent: Torrent,
  media: MediaDetails,
) => {
  const data = JSON.stringify({ moviestracker: true, movie: media }) || "";
  const body = {
    action: "add",
    link: torrent.Magnet,
    poster: `http://image.tmdb.org/t/p/w300${media.poster_path}`,
    data: data,
    save_to_db: true,
    title: `[MT] ${torrent.Name}`,
  };
  return fetchTorrServer<TSResult[]>(url, "POST", "torrents", body);
};

export const removeTorrent = (url: string, hash: string) => {
  const body = {
    action: "rem",
    hash: hash,
  };
  return fetchTorrServer(url, "POST", "torrents", body);
};
