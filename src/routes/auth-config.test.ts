import { describe, expect, it } from "bun:test";
import {
  BUILD_ONLY_AUTH_SECRET,
  resolveAuthTrustHost,
  resolveDatabaseAuthSecret,
  resolveFallbackJwtSecret,
} from "./auth-config";

describe("auth config secret resolution", () => {
  it("uses the build-safe placeholder only during build contexts", () => {
    expect(
      resolveFallbackJwtSecret({
        authSecret: "",
        lifecycleEvent: "build.server",
        nodeEnv: "production",
      }),
    ).toBe(BUILD_ONLY_AUTH_SECRET);

    expect(
      resolveFallbackJwtSecret({
        authSecret: "",
        lifecycleEvent: "test",
        nodeEnv: "test",
      }),
    ).toBe(BUILD_ONLY_AUTH_SECRET);
  });

  it("fails closed for runtime JWT auth when AUTH_SECRET is missing", () => {
    expect(() =>
      resolveFallbackJwtSecret({
        authSecret: "",
        lifecycleEvent: "dev",
        nodeEnv: "development",
      }),
    ).toThrow(
      "AUTH_SECRET is required for runtime JWT auth when MongoDB is unavailable.",
    );
  });

  it("requires a real secret for MongoDB-backed auth", () => {
    expect(() => resolveDatabaseAuthSecret({ authSecret: "" })).toThrow(
      "AUTH_SECRET is required for MongoDB-backed auth.",
    );

    expect(
      resolveDatabaseAuthSecret({ authSecret: " real-secret " }),
    ).toBe("real-secret");
  });

  it("does not trust host headers when AUTH_URL pins production origin", () => {
    expect(
      resolveAuthTrustHost({
        authUrl: "https://movies.example.com/auth",
        lifecycleEvent: "start",
        nodeEnv: "production",
      }),
    ).toBe(false);
  });

  it("keeps local and build auth host ergonomics without AUTH_URL", () => {
    expect(
      resolveAuthTrustHost({
        authUrl: "",
        lifecycleEvent: "dev",
        nodeEnv: "development",
      }),
    ).toBe(true);

    expect(
      resolveAuthTrustHost({
        authUrl: "",
        lifecycleEvent: "build.server",
        nodeEnv: "production",
      }),
    ).toBe(true);
  });

  it("requires AUTH_URL for production auth host validation", () => {
    expect(() =>
      resolveAuthTrustHost({
        authUrl: "",
        lifecycleEvent: "start",
        nodeEnv: "production",
      }),
    ).toThrow("AUTH_URL is required for production auth host validation.");

    expect(() =>
      resolveAuthTrustHost({
        authUrl: "",
        lifecycleEvent: "",
        nodeEnv: "",
      }),
    ).toThrow("AUTH_URL is required for production auth host validation.");
  });
});
