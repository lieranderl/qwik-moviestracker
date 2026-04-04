import { afterEach, describe, expect, it, mock } from "bun:test";
import { getImdbRating, getOptionalImdbRating } from "./cloud-func-api";

const originalConsoleError = console.error;
const originalFetch = globalThis.fetch;
const originalCloudApiKey = process.env.GC_API_KEY;

const createJsonResponse = (body: unknown, status = 200) =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	}) as Response;

afterEach(() => {
	console.error = originalConsoleError;
	globalThis.fetch = originalFetch;

	if (originalCloudApiKey === undefined) {
		delete process.env.GC_API_KEY;
	} else {
		process.env.GC_API_KEY = originalCloudApiKey;
	}
});

describe("cloud function API service", () => {
	it("builds gateway requests with auth and origin headers", async () => {
		process.env.GC_API_KEY = "cloud-test-key";

		const fetchMock = mock(async () =>
			createJsonResponse({
				imdb_id: "tt0133093",
				imdb_rating: "8.7",
			}),
		);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await getImdbRating("tt0133093");

		const firstCall = fetchMock.mock.calls[0] as unknown[] | undefined;
		if (!firstCall) {
			throw new Error("Expected fetch to be called");
		}

		const requestUrl = firstCall[0];
		const requestInit = firstCall[1] as RequestInit | undefined;
		const url = new URL(String(requestUrl));

		expect(`${url.origin}${url.pathname}`).toBe(
			"https://moviestracker-gw-eu-w1-8vmmbwbl.ew.gateway.dev/getimdb",
		);
		expect(url.searchParams.get("imdb_id")).toBe("tt0133093");
		expect(url.searchParams.get("key")).toBe("cloud-test-key");
		expect(requestInit?.headers).toEqual({
			Origin: "https://moviestracker.net",
			Referer: "https://moviestracker.net",
		});
	});

	it("returns null without fetching when IMDb id is absent", async () => {
		const fetchMock = mock(async () => createJsonResponse({}));

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getOptionalImdbRating(null);

		expect(result).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns null and logs when the optional IMDb lookup fails", async () => {
		process.env.GC_API_KEY = "cloud-test-key";

		const fetchMock = mock(async () => createJsonResponse({}, 502));
		const consoleErrorMock = mock(() => undefined);

		globalThis.fetch = fetchMock as unknown as typeof fetch;
		console.error = consoleErrorMock;

		const result = await getOptionalImdbRating("tt0133093");

		expect(result).toBeNull();
		expect(consoleErrorMock).toHaveBeenCalledTimes(1);
		const firstConsoleCall = consoleErrorMock.mock.calls[0] as
			| unknown[]
			| undefined;
		if (!firstConsoleCall) {
			throw new Error("Expected console.error to be called");
		}

		expect(firstConsoleCall[0]).toBe(
			"Unable to fetch IMDb rating for tt0133093",
		);
	});
});
