import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import {
  searchEmptyHeadingPattern,
  searchHintPattern,
  searchInputPattern,
} from "./helpers/i18n";

test.describe("authenticated search", () => {
  test("restores recent searches from localStorage", async ({ page }) => {
    await addBypassCookie(page);
    await page.goto("/search/?lang=en-US");
    await page.evaluate(() => {
      window.localStorage.setItem(
        "moviestracker:recent-searches",
        JSON.stringify([
          {
            href: "/search/?lang=en-US&q=arrival",
            query: "Arrival",
          },
        ]),
      );
    });
    await page.reload();

    await expect(
      page.getByRole("link", {
        name: "Arrival",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Arrival",
      }),
    ).toHaveAttribute("href", "/search/?lang=en-US&q=arrival");
  });

  test("submits search through GET and keeps the lang parameter", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto("/search/?lang=en-US");

    await page.getByLabel(searchInputPattern).fill("ab");
    await page.getByRole("button", { name: /^search$/i }).click();

    await expect(page).toHaveURL(/\/search\/?\?lang=en-US&q=ab$/);
    await expect(
      page.getByRole("status").filter({
        hasText: searchHintPattern,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: searchEmptyHeadingPattern,
      }),
    ).toBeVisible();
  });
});
