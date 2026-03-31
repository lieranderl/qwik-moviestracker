import { expect, test } from "@playwright/test";
import {
  DEV_SESSION_BYPASS_COOKIE,
  DEV_SESSION_BYPASS_VALUE,
} from "../../src/routes/dev-session";

const addBypassCookie = async (page: Parameters<typeof test>[0]["page"]) => {
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

test.describe("authenticated shell", () => {
  test("renders the protected search shell with the dev session bypass", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto("/search/?lang=en-US");

    await expect(page).toHaveURL(/\/search\/?\?lang=en-US$/);
    await expect(
      page.getByRole("heading", {
        name: /search/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /open account menu/i,
      }),
    ).toBeVisible();
  });
});
