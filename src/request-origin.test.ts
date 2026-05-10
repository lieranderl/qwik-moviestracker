import { describe, expect, it } from "bun:test";
import {
	resolveRequestOrigin,
	resolveTrustedOrigins,
	updateRequestOrigin,
} from "./request-origin";

describe("request origin resolution", () => {
	it("pins request origin to AUTH_URL when the host is trusted", () => {
		const request = new Request("http://127.0.0.1/callback?code=abc", {
			headers: {
				host: "movies.example.com",
				"x-forwarded-proto": "http",
			},
		});

		const updatedRequest = updateRequestOrigin(request, {
			AUTH_URL: "https://movies.example.com/auth",
		});

		expect(updatedRequest.url).toBe(
			"https://movies.example.com/callback?code=abc",
		);
	});

	it("rejects untrusted hosts instead of reconstructing origin from headers", () => {
		const request = new Request("http://127.0.0.1/auth/callback/google", {
			headers: {
				host: "evil.example",
				"x-forwarded-proto": "https",
			},
		});

		expect(() =>
			resolveRequestOrigin(request, {
				AUTH_URL: "https://movies.example.com",
			}),
		).toThrow("Request host evil.example is not in AUTH_URL or TRUSTED_ORIGINS.");
	});

	it("allows explicit additional trusted origins", () => {
		const request = new Request("http://127.0.0.1/", {
			headers: { host: "preview.example.com" },
		});

		expect(
			resolveRequestOrigin(request, {
				AUTH_URL: "https://movies.example.com",
				TRUSTED_ORIGINS: "https://preview.example.com",
			}),
		).toBe("https://preview.example.com");
	});

	it("keeps localhost ergonomic without deployed origin env", () => {
		const request = new Request("http://127.0.0.1:3000/search", {
			headers: {
				host: "localhost:3000",
				"x-forwarded-proto": "https",
			},
		});

		expect(resolveRequestOrigin(request, {})).toBe("http://localhost:3000");
	});

	it("normalizes trusted origin env values", () => {
		expect(
			resolveTrustedOrigins({
				AUTH_URL: "https://movies.example.com/auth",
				TRUSTED_ORIGINS: " https://preview.example.com/path ",
			}),
		).toEqual([
			"https://movies.example.com",
			"https://preview.example.com",
		]);
	});
});
