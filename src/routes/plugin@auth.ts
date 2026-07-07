import type { Adapter, AdapterUser } from "@auth/core/adapters";
import type { Provider } from "@auth/core/providers";
import type { GoogleProfile } from "@auth/core/providers/google";
import type { Account, Profile, Session } from "@auth/core/types";
import Google from "@auth/core/providers/google";
import { QwikAuth$ } from "@auth/qwik";
import type { RequestEventCommon } from "@builder.io/qwik-city";
import {
  resolveAuthTrustHost,
  resolveDatabaseAuthSecret,
  resolveFallbackJwtSecret,
} from "./auth-config";

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  (async ({ env }: RequestEventCommon) => {
    const authSecret = env.get("AUTH_SECRET")?.trim();
    const lifecycleEvent = process.env.npm_lifecycle_event;
    const nodeEnv = env.get("NODE_ENV")?.trim() || process.env.NODE_ENV;
    const authUrl = env.get("AUTH_URL")?.trim();
    const trustHost = resolveAuthTrustHost({
      authUrl,
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
                  id: profile.sub,
                  language: "en-US",
                  image: profile.picture,
                  emailVerified: profile.email_verified,
                  ...profile,
                };
              },
            }),
          ]
        : [];

    const mongoUri = env.get("MONGO_URI") ?? "";
    if (!mongoUri.startsWith("mongodb")) {
      // During CI/SSG builds the runtime auth env may be intentionally absent.
      // Keep the build-safe fallback self-contained so SSR generation can
      // complete without runtime auth secrets.
      return {
        secret: resolveFallbackJwtSecret({
          authSecret,
          lifecycleEvent,
          nodeEnv,
        }),
        trustHost,
        session: {
          strategy: "jwt",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          updateAge: 60 * 60 * 24, // 1 day
        },
        providers,
      };
    }

    const [{ MongoDBAdapter }, { mongoclient }] = await Promise.all([
      import("@auth/mongodb-adapter"),
      import("../utils/mongodbinit"),
    ]);
    const mongo = await mongoclient(mongoUri);
    if (!mongo) {
      // During CI/SSG builds the runtime auth env may be intentionally absent.
      // Keep the build-safe fallback self-contained so SSR generation can
      // complete without runtime auth secrets.
      return {
        secret: resolveFallbackJwtSecret({
          authSecret,
          lifecycleEvent,
          nodeEnv,
        }),
        trustHost,
        session: {
          strategy: "jwt",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          updateAge: 60 * 60 * 24, // 1 day
        },
        providers,
      };
    }

    return {
      session: {
        strategy: "database",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        updateAge: 60 * 60 * 24, // 1 day
      },
      adapter: MongoDBAdapter(mongo, {
        databaseName: "movies",
      }) as Adapter,
      secret: resolveDatabaseAuthSecret({ authSecret }),
      trustHost,
      providers,
      callbacks: {
        async session({
          session,
          user,
        }: {
          session: Session;
          user: AdapterUser;
        }) {
          session.id = user.id;
          if (user.language) {
            session.language = user.language;
          }

          return session;
        },
        async signIn({
          account,
          profile,
        }: {
          account: Account | null;
          profile?: Profile;
        }) {
          if (account && profile) {
            if (account.provider === "google") {
              const p = profile as GoogleProfile;
              return p.email_verified && p.email.endsWith("@gmail.com");
            }
            if (account.provider === "github") {
              return true;
            }
          }
          return false;
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

declare module "@auth/core/adapters" {
  interface AdapterUser {
    language?: string;
  }
}
