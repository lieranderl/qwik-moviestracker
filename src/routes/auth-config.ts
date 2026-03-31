export const BUILD_ONLY_AUTH_SECRET = "build-only-auth-secret";

type AuthSecretContext = {
  authSecret?: string | null;
  lifecycleEvent?: string | null;
  nodeEnv?: string | null;
};

const normalizeValue = (value?: string | null) => value?.trim() || "";

const isBuildSafeAuthContext = ({
  lifecycleEvent,
  nodeEnv,
}: Omit<AuthSecretContext, "authSecret">) => {
  const normalizedEvent = normalizeValue(lifecycleEvent).toLowerCase();
  const normalizedNodeEnv = normalizeValue(nodeEnv).toLowerCase();

  return (
    normalizedEvent === "build" ||
    normalizedEvent === "test" ||
    normalizedNodeEnv === "test"
  );
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
