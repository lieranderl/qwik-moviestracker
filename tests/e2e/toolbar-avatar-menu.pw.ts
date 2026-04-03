import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";

test.describe("toolbar avatar menu", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await addBypassCookie(page);
  });

  test("opens from the toolbar and exposes account actions", async ({
    page,
  }) => {
    await page.goto("/search/?lang=en-US");

    const trigger = page.getByRole("button", {
      name: /open account menu/i,
    });
    const menu = page.getByRole("menu", { name: /account menu/i });

    await trigger.focus();
    await page.keyboard.press("Enter");

    await expect(menu).toBeVisible();
    await expect(menu.getByText("Playwright User")).toBeVisible();
    await expect(menu.getByText("playwright@local.test")).toBeVisible();
    await expect(menu.getByRole("link", { name: /language/i })).toBeVisible();
    await expect(menu.getByRole("button", { name: /sing out/i })).toBeVisible();
  });

  test("switches language from the account menu and persists the choice", async ({
    page,
  }) => {
    await page.goto("/search/?lang=en-US");

    const trigger = page.getByRole("button", {
      name: /open account menu/i,
    });
    const menu = page.getByRole("menu", { name: /account menu/i });

    await trigger.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: /language/i }).click();

    await expect(page).toHaveURL(/\/search\/?\?lang=ru-RU$/);
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("lang")))
      .toBe("ru-RU");
  });

  test("signs out to auth while preserving lang", async ({ page }) => {
    await page.goto("/search/?lang=ru-RU");

    const trigger = page.getByRole("button", {
      name: /open account menu/i,
    });
    const menu = page.getByRole("menu", { name: /account menu/i });

    await trigger.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: /выйти/i }).click();

    await expect(page).toHaveURL(/\/auth\/?\?lang=ru-RU$/);
    await expect(
      page.getByRole("heading", {
        name: /track movies and tv shows/i,
      }),
    ).toBeVisible();
  });
});
