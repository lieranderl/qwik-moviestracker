import { createHash, randomBytes } from "node:crypto";
import { PARAM_LAUNCHER_SCRIPT } from "./param-launcher-script";

export const HSTS_HEADER_VALUE = "max-age=31536000; includeSubDomains";
export const CSP_NONCE_HEADER = "x-csp-nonce";
export const QWIK_CSP_NONCE_KEY = "@nonce";

type SecurityHeaderOptions = {
	includeContentSecurityPolicy?: boolean;
	scriptNonce?: string;
};

export const createScriptNonce = (): string => randomBytes(16).toString("base64");

export const getScriptHashSource = (script: string): string =>
	`'sha256-${createHash("sha256").update(script).digest("base64")}'`;

export const PARAM_LAUNCHER_SCRIPT_HASH =
	getScriptHashSource(PARAM_LAUNCHER_SCRIPT);

export const getContentSecurityPolicy = ({
	scriptNonce,
}: Pick<SecurityHeaderOptions, "scriptNonce"> = {}): string => {
	const scriptSources = [
		"'self'",
		PARAM_LAUNCHER_SCRIPT_HASH,
		...(scriptNonce ? [`'nonce-${scriptNonce}'`] : []),
	];

	return [
		"default-src 'self'",
		"base-uri 'self'",
		"object-src 'none'",
		"frame-ancestors 'none'",
		"form-action 'self'",
		`script-src ${scriptSources.join(" ")}`,
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data: https://fonts.gstatic.com",
		"connect-src 'self' http: https: ws: wss:",
		"media-src 'self' http: https: blob:",
		"worker-src 'self' blob:",
		"manifest-src 'self'",
	].join("; ");
};

export const getSecurityHeaders = ({
	includeContentSecurityPolicy = true,
	scriptNonce,
}: SecurityHeaderOptions = {}): Record<string, string> => {
	const headers: Record<string, string> = {
		"Permissions-Policy":
			"camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)",
		"Referrer-Policy": "strict-origin-when-cross-origin",
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
	};

	if (includeContentSecurityPolicy) {
		headers["Content-Security-Policy"] = getContentSecurityPolicy({
			scriptNonce,
		});
	}

	return headers;
};

export const applySecurityHeaders = (
	response: Response,
	request: Request,
): Response => {
	const headers = new Headers(response.headers);
	const scriptNonce = headers.get(CSP_NONCE_HEADER) ?? undefined;
	headers.delete(CSP_NONCE_HEADER);

	for (const [name, value] of Object.entries(getSecurityHeaders({ scriptNonce }))) {
		headers.set(name, value);
	}

	if (request.headers.get("x-forwarded-proto") === "https") {
		headers.set("Strict-Transport-Security", HSTS_HEADER_VALUE);
	}

	return new Response(response.body, {
		headers,
		status: response.status,
		statusText: response.statusText,
	});
};
