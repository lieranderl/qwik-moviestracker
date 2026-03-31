import { expect, test } from "@playwright/test";

test.describe("auth guard redirects", () => {
  test("redirects the home route to auth while preserving lang", async ({
    page,
  }) => {
    await page.goto("/?lang=uk-UA");

    await expect(page).toHaveURL(/\/auth\/?\?lang=uk-UA$/);
    await expect(
      page.getByRole("button", {
        name: /sign in with google/i,
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
        name: /track movies and tv shows/i,
      }),
    ).toBeVisible();
  });
});
