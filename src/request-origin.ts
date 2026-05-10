type RuntimeOriginEnv = {
	AUTH_URL?: string;
	TRUSTED_ORIGINS?: string;
	NODE_ENV?: string;
};

export class UntrustedRequestOriginError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UntrustedRequestOriginError";
	}
}

const normalizeValue = (value?: string | null) => value?.trim() || "";

const normalizeOrigin = (value?: string | null) => {
	const rawValue = normalizeValue(value);
	if (!rawValue) {
		return "";
	}

	const url = new URL(rawValue);
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("Trusted origins must use http or https.");
	}

	return url.origin;
};

const splitTrustedOrigins = (value?: string | null) =>
	normalizeValue(value)
		.split(",")
		.map((origin) => normalizeValue(origin))
		.filter(Boolean);

export const resolveTrustedOrigins = (env: RuntimeOriginEnv = {}) => {
	const origins = [
		normalizeOrigin(env.AUTH_URL),
		...splitTrustedOrigins(env.TRUSTED_ORIGINS).map((origin) =>
			normalizeOrigin(origin),
		),
	].filter(Boolean);

	return Array.from(new Set(origins));
};

const getHeaderHost = (request: Request) => {
	const hostHeader = request.headers.get("host");
	if (hostHeader) {
		return hostHeader.toLowerCase();
	}

	return new URL(request.url).host.toLowerCase();
};

const isLocalhost = (host: string) => {
	const normalizedHost = host.toLowerCase();
	const hostname = normalizedHost.startsWith("[")
		? normalizedHost.slice(0, normalizedHost.indexOf("]") + 1)
		: normalizedHost.split(":")[0];

	return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
};

const resolveLocalOrigin = (request: Request) => {
	const host = getHeaderHost(request);
	if (!isLocalhost(host)) {
		throw new UntrustedRequestOriginError(
			"AUTH_URL or TRUSTED_ORIGINS is required for non-local request origins.",
		);
	}

	const requestUrl = new URL(request.url);
	const protocol = requestUrl.protocol === "https:" ? "https:" : "http:";

	return `${protocol}//${host}`;
};

export const resolveRequestOrigin = (
	request: Request,
	env: RuntimeOriginEnv = {},
) => {
	const trustedOrigins = resolveTrustedOrigins(env);
	if (!trustedOrigins.length) {
		return resolveLocalOrigin(request);
	}

	const host = getHeaderHost(request);
	const matchingOrigin = trustedOrigins.find(
		(origin) => new URL(origin).host.toLowerCase() === host,
	);
	if (!matchingOrigin) {
		throw new UntrustedRequestOriginError(
			`Request host ${host} is not in AUTH_URL or TRUSTED_ORIGINS.`,
		);
	}

	return matchingOrigin;
};

export const updateRequestOrigin = (
	request: Request,
	env: RuntimeOriginEnv = {},
) => {
	const origin = resolveRequestOrigin(request, env);
	const url = new URL(request.url);
	const updatedUrl = new URL(`${url.pathname}${url.search}`, origin);

	return new Request(updatedUrl, {
		method: request.method,
		headers: request.headers,
		body: request.body,
	});
};
