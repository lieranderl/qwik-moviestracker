import type { ProductionMediaDetails, TSResult, Torrent } from "./types";

const fetchWithTimeout = async (resource: string, options: any) => {
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

const fetchTorrServer = async <T = unknown,>(
  resource: string,
  method: MethodType = "GET",
  path: string,
  body?: any
): Promise<T> => {
  const requestOptions: {
    timeout: number;
    method: MethodType;
    body?: any;
    headers: any;
  } = {
    timeout: 5000,
    method: method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    requestOptions.body = JSON.stringify(body) || "";
  }

  const url = `${resource}/${path}`;
  console.log(url);
  const response = await fetchWithTimeout(url, requestOptions);
  console.log(response.status);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error(response.headers);
    console.error(url);
    throw new Error(response.statusText);
  }
  if (response.headers.get("Content-Type")?.includes("text")) {
    return response.text() as T;
  }
  return response.json() as T;
};

export const torrServerEcho = async (url: string) =>
  fetchTorrServer<string>(url, "GET", "echo");

export const listTorrent = async (url: string) => {
  const body = {
    action: "list",
  };

  return fetchTorrServer<TSResult[]>(url, "POST", "torrents", body);
};

export const addTorrent = async (
  url: string,
  torrent: Torrent,
  media: ProductionMediaDetails
) => {
  const data = JSON.stringify({ moviestracker: true, movie: media }) || "";
  const body = {
    action: "add",
    link: torrent.Magnet,
    poster: "http://image.tmdb.org/t/p/w300"+media.poster_path,
    data: data,
    save_to_db: true,
    title: "[MOVIESTRACKER] " + torrent.Name,
  };
  return fetchTorrServer<TSResult[]>(url, "POST", "torrents", body);
};
