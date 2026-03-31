import { describe, expect, it } from "bun:test";
import {
  BUILD_ONLY_AUTH_SECRET,
  resolveDatabaseAuthSecret,
  resolveFallbackJwtSecret,
} from "./auth-config";

describe("auth config secret resolution", () => {
  it("uses the build-safe placeholder only during build contexts", () => {
    expect(
      resolveFallbackJwtSecret({
        authSecret: "",
        lifecycleEvent: "build",
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
});
