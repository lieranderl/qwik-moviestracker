import type { Adapter } from "@auth/core/adapters";
import type { Provider } from "@auth/core/providers";
import type { GoogleProfile } from "@auth/core/providers/google";
import Google from "@auth/core/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { QwikAuth$ } from "@auth/qwik";
import {
  resolveDatabaseAuthSecret,
  resolveFallbackJwtSecret,
} from "./auth-config";
import { mongoclient } from "../utils/mongodbinit";

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  ({ env }) => {
    const authSecret = env.get("AUTH_SECRET")?.trim();
    const lifecycleEvent = process.env.npm_lifecycle_event;
    const nodeEnv = env.get("NODE_ENV")?.trim() || process.env.NODE_ENV;
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

    const mongo = mongoclient(env.get("MONGO_URI") ?? "");
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
        trustHost: true,
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
      trustHost: true,
      providers,
      callbacks: {
        async session({ session, user }) {
          session.id = user.id;
          if (user.language) {
            session.language = user.language;
          }

          return session;
        },
        async signIn({ account, profile }) {
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
  },
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
