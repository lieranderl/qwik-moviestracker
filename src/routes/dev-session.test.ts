import { describe, expect, it } from "bun:test";
import {
  createDevHomeFeed,
  createDevMovieDetail,
  createDevSession,
  DEV_MOVIE_DETAIL_ID,
  DEV_SESSION_BYPASS_VALUE,
  hasDevSessionBypassCookie,
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

  it("reuses the same explicit cookie gate for dev-only route fixtures", () => {
    expect(
      hasDevSessionBypassCookie({
        bypassCookie: DEV_SESSION_BYPASS_VALUE,
        bypassFlag: "1",
        nodeEnv: "development",
      }),
    ).toBe(true);

    expect(
      hasDevSessionBypassCookie({
        bypassCookie: DEV_SESSION_BYPASS_VALUE,
        bypassFlag: "1",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("creates a deterministic movie detail fixture only for the expected route id", () => {
    const fixture = createDevMovieDetail({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      id: DEV_MOVIE_DETAIL_ID,
      lang: "en-US",
      nodeEnv: "development",
    });

    expect(fixture?.movie.title).toBe("Playwright in Paris");
    expect(fixture?.lang).toBe("en-US");
    expect(fixture?.recMovies).toHaveLength(1);
    expect(fixture?.imdb?.Id).toBe("tt9900010");
  });

  it("does not create a movie detail fixture for other route ids", () => {
    const fixture = createDevMovieDetail({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      id: 42,
      lang: "en-US",
      nodeEnv: "development",
    });

    expect(fixture).toBeNull();
  });

  it("creates a deterministic home feed fixture behind the same bypass gate", () => {
    const fixture = createDevHomeFeed({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      lang: "en-US",
      nodeEnv: "development",
    });

    expect(fixture?.movies[0]?.title).toBe("Playwright in Paris");
    expect(fixture?.tv[0]?.name).toBe("Selectors");
    expect(fixture?.torMovies[0]?.title).toBe("Hydration Station");
  });
});
