import { describe, expect, it } from "bun:test";
import {
	CSP_NONCE_HEADER,
	HSTS_HEADER_VALUE,
	PARAM_LAUNCHER_SCRIPT_HASH,
	applySecurityHeaders,
	getScriptHashSource,
	getContentSecurityPolicy,
	getSecurityHeaders,
} from "./security-headers";
import { PARAM_LAUNCHER_SCRIPT } from "./param-launcher";

const getCspDirective = (csp: string, name: string): string | undefined =>
	csp.split("; ").find((directive) => directive.startsWith(`${name} `));

describe("security headers", () => {
	it("sets the app-level CSP and browser hardening headers", () => {
		const headers = getSecurityHeaders();
		const csp = headers["Content-Security-Policy"];
		const scriptSrc = getCspDirective(csp, "script-src");

		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("frame-ancestors 'none'");
		expect(scriptSrc).toContain("'self'");
		expect(scriptSrc).toContain(PARAM_LAUNCHER_SCRIPT_HASH);
		expect(scriptSrc).not.toContain("'unsafe-inline'");
		expect(csp).toContain("script-src-attr 'none'");
		expect(csp).toContain(
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		);
		expect(csp).toContain("font-src 'self' data: https://fonts.gstatic.com");
		expect(headers["X-Frame-Options"]).toBe("DENY");
		expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
		expect(headers["Permissions-Policy"]).toContain("camera=()");
	});

	it("can add the Qwik runtime nonce to script-src", () => {
		const csp = getContentSecurityPolicy({ scriptNonce: "test-nonce" });
		const scriptSrc = getCspDirective(csp, "script-src");

		expect(scriptSrc).toContain("'nonce-test-nonce'");
		expect(scriptSrc).toContain(PARAM_LAUNCHER_SCRIPT_HASH);
		expect(scriptSrc).not.toContain("'unsafe-inline'");
	});

	it("derives the PARAM launcher CSP hash from the exact inline script", () => {
		expect(PARAM_LAUNCHER_SCRIPT_HASH).toBe(
			getScriptHashSource(PARAM_LAUNCHER_SCRIPT),
		);
	});

	it("moves the internal nonce header into the CSP response header", () => {
		const response = new Response("ok", {
			headers: { [CSP_NONCE_HEADER]: "request-nonce" },
		});
		const request = new Request("http://localhost:3000/");
		const headers = applySecurityHeaders(response, request).headers;
		const csp = headers.get("Content-Security-Policy") ?? "";

		expect(headers.has(CSP_NONCE_HEADER)).toBe(false);
		expect(getCspDirective(csp, "script-src")).toContain(
			"'nonce-request-nonce'",
		);
	});

	it("adds HSTS only for secure requests", async () => {
		const response = new Response("ok");
		const secureRequest = new Request("http://moviestracker.net/", {
			headers: { "x-forwarded-proto": "https" },
		});
		const insecureRequest = new Request("http://localhost:3000/");

		expect(
			applySecurityHeaders(response.clone(), secureRequest).headers.get(
				"Strict-Transport-Security",
			),
		).toBe(HSTS_HEADER_VALUE);
		expect(
			applySecurityHeaders(response, insecureRequest).headers.has(
				"Strict-Transport-Security",
			),
		).toBe(false);
	});
});
