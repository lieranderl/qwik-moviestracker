import { describe, expect, it } from "bun:test";
import { buildAuthRedirectPath } from "~/routes/auth-redirect";
import {
  createDevSession,
  DEV_SESSION_BYPASS_VALUE,
} from "~/routes/dev-session";

describe("auth guard behavior", () => {
  it("preserves and safely encodes language in auth redirects", () => {
    expect(buildAuthRedirectPath("ru-RU")).toBe("/auth/?lang=ru-RU");
    expect(buildAuthRedirectPath("x&next=/admin")).toBe(
      "/auth/?lang=x%26next%3D%2Fadmin",
    );
    expect(buildAuthRedirectPath(null)).toBe("/auth");
  });

  it("allows an explicit dev-only Playwright session bypass outside production", () => {
    const session = createDevSession({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      lang: "en-US",
      nodeEnv: "development",
      now: new Date("2026-03-31T00:00:00.000Z"),
    });
    expect(session?.user?.name).toBe("Playwright User");
    expect(session?.language).toBe("en-US");
  });
});
