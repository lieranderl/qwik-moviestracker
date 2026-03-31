import type { Page } from "@playwright/test";
import {
  DEV_SESSION_BYPASS_COOKIE,
  DEV_SESSION_BYPASS_VALUE,
} from "../../../src/routes/dev-session";

export const addBypassCookie = async (page: Page) => {
  await page.context().addCookies([
    {
      name: DEV_SESSION_BYPASS_COOKIE,
      value: DEV_SESSION_BYPASS_VALUE,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
};
