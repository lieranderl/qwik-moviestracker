import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";

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

    await page.getByLabel(/search movies, series, and people/i).fill("ab");
    await page.getByRole("button", { name: /^search$/i }).click();

    await expect(page).toHaveURL(/\/search\/?\?lang=en-US&q=ab$/);
    await expect(
      page.getByRole("status").filter({
        hasText: /search starts after 3 characters\. add 1 more character and submit again\./i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /start with a title, actor, or director/i,
      }),
    ).toBeVisible();
  });
});
