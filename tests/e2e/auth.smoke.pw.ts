import { expect, test } from "@playwright/test";

test.describe("auth page smoke", () => {
  test("renders the landing content and sign-in CTA", async ({ page }) => {
    await page.goto("/auth?lang=en-US");

    await expect(
      page.getByRole("heading", {
        name: /track movies and tv shows/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /sign in with google/i,
      }),
    ).toBeVisible();

    await expect(page.getByText(/private movie hub/i)).toBeVisible();
    await expect(page.getByText(/why people use it/i)).toBeVisible();
  });

  test("restores the lang query from localStorage when missing", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lang", "fr-FR");
    });

    await page.goto("/auth");

    await expect(page).toHaveURL(/\/auth\/?\?lang=fr-FR$/);
    await expect(
      page.getByRole("button", {
        name: /sign in with google/i,
      }),
    ).toBeVisible();
  });
});
