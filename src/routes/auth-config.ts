export const BUILD_ONLY_AUTH_SECRET = "build-only-auth-secret";

type AuthSecretContext = {
  authSecret?: string | null;
  lifecycleEvent?: string | null;
  nodeEnv?: string | null;
};

const normalizeValue = (value?: string | null) => value?.trim() || "";

const normalizeOrigin = (value?: string | null) => {
  const rawValue = normalizeValue(value);
  if (!rawValue) {
    return "";
  }

  const url = new URL(rawValue);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("AUTH_URL must use http or https.");
  }

  return url.origin;
};

const isBuildSafeAuthContext = ({
  lifecycleEvent,
  nodeEnv,
}: Omit<AuthSecretContext, "authSecret">) => {
  const normalizedEvent = normalizeValue(lifecycleEvent).toLowerCase();
  const normalizedNodeEnv = normalizeValue(nodeEnv).toLowerCase();

  return (
    normalizedEvent === "build" ||
    normalizedEvent.startsWith("build.") ||
    normalizedEvent === "test" ||
    normalizedNodeEnv === "test"
  );
};

const isLocalAuthContext = ({
  lifecycleEvent,
  nodeEnv,
}: Omit<AuthSecretContext, "authSecret">) => {
  const normalizedEvent = normalizeValue(lifecycleEvent).toLowerCase();
  const normalizedNodeEnv = normalizeValue(nodeEnv).toLowerCase();

  return normalizedEvent === "dev" || normalizedNodeEnv === "development";
};

export const resolveFallbackJwtSecret = (context: AuthSecretContext) => {
  const authSecret = normalizeValue(context.authSecret);
  if (authSecret) {
    return authSecret;
  }

  if (isBuildSafeAuthContext(context)) {
    return BUILD_ONLY_AUTH_SECRET;
  }

  throw new Error(
    "AUTH_SECRET is required for runtime JWT auth when MongoDB is unavailable.",
  );
};

export const resolveDatabaseAuthSecret = ({
  authSecret,
}: AuthSecretContext) => {
  const normalizedSecret = normalizeValue(authSecret);
  if (normalizedSecret) {
    return normalizedSecret;
  }

  throw new Error("AUTH_SECRET is required for MongoDB-backed auth.");
};

export const resolveAuthTrustHost = ({
  authUrl,
  lifecycleEvent,
  nodeEnv,
}: Omit<AuthSecretContext, "authSecret"> & { authUrl?: string | null }) => {
  // Explicit env override for Cloud Run candidate/preview deployments
  // where AUTH_URL points to the production domain but requests arrive
  // through *.a.run.app hostnames.
  if (process.env.AUTH_TRUST_HOST === "true") {
    return true;
  }

  if (normalizeOrigin(authUrl)) {
    return true;
  }

  if (isBuildSafeAuthContext({ lifecycleEvent, nodeEnv })) {
    return true;
  }

  if (isLocalAuthContext({ lifecycleEvent, nodeEnv })) {
    return true;
  }

  throw new Error("AUTH_URL is required for production auth host validation.");
};
