import type { JWT } from "@auth/core/jwt";
import type { Provider } from "@auth/core/providers";
import Google from "@auth/core/providers/google";
import type { GoogleProfile } from "@auth/core/providers/google";
import type { Account, Profile, Session } from "@auth/core/types";
import { QwikAuth$ } from "@auth/qwik";
import type { RequestEventCommon } from "@builder.io/qwik-city";
import { resolveAuthTrustHost, resolveFallbackJwtSecret } from "./auth-config";
import { allowVerifiedGoogleAccount } from "./auth-policy";

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (async ({ env }: RequestEventCommon) => {
    const lifecycleEvent = process.env.npm_lifecycle_event;
    const nodeEnv = env.get("NODE_ENV")?.trim() || process.env.NODE_ENV;
    const secret = resolveFallbackJwtSecret({
      authSecret: env.get("AUTH_SECRET"),
      lifecycleEvent,
      nodeEnv,
    });
    const trustHost = resolveAuthTrustHost({
      authUrl: env.get("AUTH_URL"),
      lifecycleEvent,
      nodeEnv,
    });
    const googleId = env.get("GOOGLE_ID") ?? "";
    const googleSecret = env.get("GOOGLE_SECRET") ?? "";
    const providers: Provider[] =
      googleId && googleSecret
        ? [
            Google({
              clientId: googleId,
              clientSecret: googleSecret,
              profile(profile: GoogleProfile) {
                return {
                  ...profile,
                  id: profile.sub,
                  language: "en-US",
                  image: profile.picture,
                  emailVerified: profile.email_verified,
                };
              },
            }),
          ]
        : [];

    return {
      secret,
      trustHost,
      providers,
      session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
      },
      callbacks: {
        async jwt({ token, profile }: { token: JWT; profile?: Profile }) {
          if (profile) {
            token.language = "en-US";
          }
          return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
          session.id = token.sub;
          session.language =
            typeof token.language === "string" ? token.language : "en-US";
          return session;
        },
        async signIn({
          account,
          profile,
        }: {
          account: Account | null;
          profile?: Profile;
        }) {
          return allowVerifiedGoogleAccount(account, profile);
        },
      },
    };
  }) as unknown as Parameters<typeof QwikAuth$>[0],
);

declare module "@auth/core/types" {
  interface Session {
    error?: "RefreshAccessTokenError";
    id?: string;
    language?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    language?: string;
  }
}
