import { describe, expect, it } from "bun:test";
import {
  createDevSession,
  DEV_SESSION_BYPASS_VALUE,
  isDevSessionBypassEnabled,
} from "./dev-session";

describe("dev session bypass", () => {
  it("stays disabled unless the bypass flag is explicitly enabled", () => {
    expect(
      isDevSessionBypassEnabled({
        bypassFlag: undefined,
        nodeEnv: "development",
      }),
    ).toBe(false);

    expect(
      isDevSessionBypassEnabled({
        bypassFlag: "1",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("creates a fake session only for the expected cookie in non-production contexts", () => {
    const session = createDevSession({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      lang: "en-US",
      nodeEnv: "development",
      now: new Date("2026-03-31T12:00:00.000Z"),
    });

    expect(session?.user?.email).toBe("playwright@local.test");
    expect(session?.language).toBe("en-US");
    expect(session?.expires).toBe("2026-04-07T12:00:00.000Z");
  });

  it("does not create a fake session for unexpected cookies", () => {
    const session = createDevSession({
      bypassCookie: "nope",
      bypassFlag: "1",
      lang: "en-US",
      nodeEnv: "development",
    });

    expect(session).toBeNull();
  });
});
