import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";

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
