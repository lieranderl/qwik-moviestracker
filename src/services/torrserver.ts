import type { MediaDetails, Torrent, TSResult } from "./models";

type FetchWithTimeoutOptions = RequestInit & { timeout?: number };

const TORR_SERVER_TIMEOUT_MS = 5000;

function buildRequestUrl(resource: string, path: string): string {
	const normalizedResource = resource.replace(/\/+$/, "");
	const normalizedPath = path.replace(/^\/+/, "");
	return `${normalizedResource}/${normalizedPath}`;
}

async function fetchWithTimeout(
	resource: string,
	options: FetchWithTimeoutOptions,
): Promise<Response> {
	const { timeout = TORR_SERVER_TIMEOUT_MS, ...requestOptions } = options;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	try {
		return await fetch(resource, {
			...requestOptions,
			signal: controller.signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw new Error(
				`TorrServer request timed out after ${timeout}ms for ${resource}`,
				{
					cause: error,
				},
			);
		}
		throw error;
	} finally {
		clearTimeout(id);
	}
}

type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH" | "HEAD";

async function fetchTorrServer<T = unknown>(
	resource: string,
	method: HttpMethod,
	path: string,
	body?: unknown,
): Promise<T> {
	const requestOptions: FetchWithTimeoutOptions = {
		timeout: TORR_SERVER_TIMEOUT_MS,
		method,
		headers: { "Content-Type": "application/json" },
	};

	if (body !== undefined) {
		requestOptions.body = JSON.stringify(body);
	}

	const url = buildRequestUrl(resource, path);
	const response = await fetchWithTimeout(url, requestOptions);
	if (!response.ok) {
		const errorText = await response.text().catch(() => "");
		throw new Error(
			`TorrServer request failed (${response.status}) for ${path}${
				errorText ? `: ${errorText.slice(0, 300)}` : ""
			}`,
		);
	}

	if (response.status === 204 || method === "HEAD") {
		return undefined as T;
	}

	const contentType = response.headers.get("Content-Type")?.toLowerCase() || "";
	if (contentType.includes("application/json")) {
		return (await response.json()) as T;
	}
	if (contentType.includes("text/")) {
		return (await response.text()) as T;
	}

	const rawResponse = await response.text();
	if (!rawResponse) {
		return undefined as T;
	}
	try {
		return JSON.parse(rawResponse) as T;
	} catch {
		return rawResponse as T;
	}
}

export const torrServerEcho = async (url: string) =>
	fetchTorrServer<string>(url, "GET", "echo");

function callTorrents<T = unknown>(
	url: string,
	action: "list" | "add" | "rem",
	payload: Record<string, unknown> = {},
): Promise<T> {
	const body = { action, ...payload };
	return fetchTorrServer<T>(url, "POST", "torrents", body);
}

export const listTorrent = (url: string) =>
	callTorrents<TSResult[]>(url, "list");

export const addTorrent = (
	url: string,
	torrent: Torrent,
	media: MediaDetails,
) => {
	return callTorrents<TSResult[]>(url, "add", {
		link: torrent.Magnet,
		poster: `https://image.tmdb.org/t/p/w300${media.poster_path}`,
		data: JSON.stringify({ moviestracker: true, movie: media }),
		save_to_db: true,
		title: `[MT] ${torrent.Name}`,
	});
};

export const removeTorrent = (url: string, hash: string) =>
	callTorrents(url, "rem", { hash });
