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

    await expect(
      page.getByText(privateMovieHubPattern, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(whyPeopleUseItPattern)).toBeVisible();
  });

  test("requires fresh disclaimer consent before every sign-in", async ({
    page,
  }) => {
    await page.goto("/auth?lang=en-US");
    await expect(page).toHaveURL(/\/auth\/\?lang=en-US$/);

    const signInButton = page.getByRole("button", {
      name: signInWithGooglePattern,
    });
    await signInButton.click();

    const dialog = page.getByRole("dialog", {
      name: "Before you sign in",
    });
    const consent = dialog.getByRole("checkbox", {
      name: /I have read and agree/i,
    });
    const continueButton = dialog.getByRole("button", {
      name: "Agree and continue with Google",
    });

    await expect(dialog).toBeVisible();
    await page.waitForLoadState("networkidle");
    if (!(await dialog.isVisible())) {
      await signInButton.click();
      await expect(dialog).toBeVisible();
    }
    await expect(dialog.getByText("The Movie Database (TMDB)")).toBeVisible();
    await expect(dialog.getByRole("img", { name: "TMDB logo" })).toBeVisible();
    await expect(dialog.getByText("JacRed", { exact: true })).toBeVisible();
    await expect(continueButton).toBeDisabled();

    await consent.check();
    await page.waitForLoadState("networkidle");
    if (!(await continueButton.isEnabled())) {
      if (!(await dialog.isVisible())) {
        await signInButton.click();
        await expect(dialog).toBeVisible();
      }
      await consent.uncheck();
      await consent.check();
    }
    await expect(continueButton).toBeEnabled();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("dialog input[type=checkbox]")).not.toBeChecked();
    await signInButton.click();

    await expect(consent).not.toBeChecked();
    await expect(continueButton).toBeDisabled();
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
