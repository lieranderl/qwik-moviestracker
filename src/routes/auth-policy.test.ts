import { describe, expect, it } from "bun:test";
import { allowVerifiedGoogleAccount } from "./auth-policy";

describe("Google sign-in policy", () => {
  it("allows verified Google Workspace and Gmail accounts", () => {
    for (const email of ["viewer@gmail.com", "viewer@example.org"]) {
      expect(
        allowVerifiedGoogleAccount(
          { provider: "google" } as never,
          { email, email_verified: true } as never,
        ),
      ).toBe(true);
    }
  });

  it("rejects unverified, missing, and non-Google identities", () => {
    expect(
      allowVerifiedGoogleAccount(
        { provider: "google" } as never,
        { email: "viewer@example.org", email_verified: false } as never,
      ),
    ).toBe(false);
    expect(
      allowVerifiedGoogleAccount(
        { provider: "github" } as never,
        { email: "viewer@example.org", email_verified: true } as never,
      ),
    ).toBe(false);
    expect(allowVerifiedGoogleAccount(null)).toBe(false);
  });
});
