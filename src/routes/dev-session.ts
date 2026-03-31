import type { Session } from "@auth/core/types";

export const DEV_SESSION_BYPASS_COOKIE = "moviestracker_dev_session";
export const DEV_SESSION_BYPASS_VALUE = "playwright";

type DevSessionOptions = {
  bypassCookie?: string | null;
  bypassFlag?: string | null;
  lang: string;
  nodeEnv?: string | null;
  now?: Date;
};

export const isDevSessionBypassEnabled = ({
  bypassFlag,
  nodeEnv,
}: Pick<DevSessionOptions, "bypassFlag" | "nodeEnv">) => {
  return bypassFlag === "1" && nodeEnv !== "production";
};

export const createDevSession = ({
  bypassCookie,
  bypassFlag,
  lang,
  nodeEnv,
  now = new Date(),
}: DevSessionOptions): Session | null => {
  if (
    !isDevSessionBypassEnabled({
      bypassFlag,
      nodeEnv,
    })
  ) {
    return null;
  }

  if (bypassCookie !== DEV_SESSION_BYPASS_VALUE) {
    return null;
  }

  const expires = new Date(now);
  expires.setDate(expires.getDate() + 7);

  return {
    expires: expires.toISOString(),
    id: "playwright-user",
    language: lang,
    user: {
      email: "playwright@local.test",
      image: null,
      name: "Playwright User",
    },
  };
};
