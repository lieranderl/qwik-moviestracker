import { expect, test } from "@playwright/test";
import {
  authHeadingPattern,
  privateMovieHubPattern,
  signInWithGooglePattern,
  whyPeopleUseItPattern,
} from "./helpers/i18n";

test.describe("auth page smoke", () => {
  test("renders the landing content and sign-in CTA", async ({ page }) => {
    await page.goto("/auth?lang=en-US");

    await expect(
      page.getByRole("heading", {
        name: authHeadingPattern,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: signInWithGooglePattern,
      }),
    ).toBeVisible();

    await expect(page.getByText(privateMovieHubPattern)).toBeVisible();
    await expect(page.getByText(whyPeopleUseItPattern)).toBeVisible();
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
        name: signInWithGooglePattern,
      }),
    ).toBeVisible();
  });
});
