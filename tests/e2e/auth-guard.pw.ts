import { expect, test } from "@playwright/test";
import { authHeadingPattern, signInWithGooglePattern } from "./helpers/i18n";

test.describe("auth guard redirects", () => {
  test("redirects the home route to auth while preserving lang", async ({
    page,
  }) => {
    await page.goto("/?lang=uk-UA");

    await expect(page).toHaveURL(/\/auth\/?\?lang=uk-UA$/);
    await expect(
      page.getByRole("button", {
        name: signInWithGooglePattern,
      }),
    ).toBeVisible();
  });

  test("redirects the search route to auth while preserving lang", async ({
    page,
  }) => {
    await page.goto("/search/?lang=de-DE&q=matrix");

    await expect(page).toHaveURL(/\/auth\/?\?lang=de-DE$/);
    await expect(
      page.getByRole("heading", {
        name: authHeadingPattern,
      }),
    ).toBeVisible();
  });
});
