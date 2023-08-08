import { initializeApp, getApps } from "firebase-admin/app";

import dotenv from "dotenv";
import { cert } from "firebase-admin/app";
import type { RequestEventLoader } from "@builder.io/qwik-city";
import { getAuth } from "firebase-admin/auth";

dotenv.config({ path: ".env.local" });

const alreadyCreatedAps = getApps();

export const admin_app =
  alreadyCreatedAps.length === 0
    ? initializeApp(
        { credential: cert(JSON.parse(process.env.FIREBASE_ADMIN!)) },
        "default Admin App"
      )
    : alreadyCreatedAps[0];

export const checkAuth = async (
  event: RequestEventLoader<QwikCityPlatform>
) => {
  try {
    console.log("Check Auth");
    const token = event.cookie.get("uid");
    if (token) {
      return await getAuth(admin_app).verifyIdToken(token.value, true);
    } else {
      throw event.redirect(302, "/auth");
    }
  } catch (error) {
    // event.cookie.delete("uid", { path: "/" });
    throw event.redirect(302, "/auth");
  }
};
