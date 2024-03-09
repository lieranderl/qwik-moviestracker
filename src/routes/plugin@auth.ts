import { Adapter } from "@auth/core/adapters";
import type { Provider } from "@auth/core/providers";
import GitHub from "@auth/core/providers/github";
import type { GoogleProfile } from "@auth/core/providers/google";
import Google from "@auth/core/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { serverAuth$ } from "@builder.io/qwik-auth";
import mongoClientPromise from "../utils/mongodbinit";

export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$(({ env }) => ({
    session: {
      strategy: "database",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      updateAge: 60 * 60 * 24, // 1 day
    },
    adapter: MongoDBAdapter(mongoClientPromise, {
      databaseName: "movies",
    }) as Adapter,
    secret: env.get("AUTH_SECRET"),
    trustHost: true,
    providers: [
      Google({
        clientId: env.get("GOOGLE_ID")!,
        clientSecret: env.get("GOOGLE_SECRET")!,
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
      GitHub({
        clientId: env.get("GITHUB_OAUTH_CLIENT_ID")!,
        clientSecret: env.get("GITHUB_OAUTH_CLIENT_SECRET")!,
        profile(profile) {
          return {
            gh_username: profile.login,
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
            language: "en-US",
          };
        },
      }),
    ] as Provider[],
    callbacks: {
      async session({ session, user }) {
        // console.log("session:", session, user)
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
  }));

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
