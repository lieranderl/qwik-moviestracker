import { serverAuth$ } from "@builder.io/qwik-auth";
import type { GoogleProfile } from "@auth/core/providers/google";
import Google from "@auth/core/providers/google";
import type { Provider } from "@auth/core/providers";

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(() => ({
    secret: import.meta.env.AUTH_SECRET,
    trustHost: true,
    providers: [
      Google({
        clientId: import.meta.env.GOOGLE_ID!,
        clientSecret: import.meta.env.GOOGLE_SECRET!,
      }),
    ] as Provider[],
    callbacks: {
      async signIn({ account, profile }) {
        if (account && profile) {
          if (account.provider === "google") {
            const p = profile as GoogleProfile;
            return p.email_verified && p.email.endsWith("@gmail.com")
          }
        }
        return false
      },
    }
  }));