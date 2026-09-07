import type { Account, Profile } from "@auth/core/types";
import type { GoogleProfile } from "@auth/core/providers/google";

export const allowVerifiedGoogleAccount = (
  account: Account | null,
  profile?: Profile,
): boolean => {
  if (account?.provider !== "google" || !profile) return false;
  const googleProfile = profile as GoogleProfile;
  return googleProfile.email_verified === true && !!googleProfile.email;
};
