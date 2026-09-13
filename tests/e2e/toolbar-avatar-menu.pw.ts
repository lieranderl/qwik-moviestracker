import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import {
  accountMenuPattern,
  authHeadingPattern,
  languagePattern,
  openAccountMenuPattern,
  signOutPattern,
} from "./helpers/i18n";

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
      name: openAccountMenuPattern,
    });
    const menu = page.getByRole("menu", { name: accountMenuPattern });
    const toolbarAvatar = trigger.getByRole("img");

    await expect(toolbarAvatar).toHaveAttribute("width", "40");
    await expect(toolbarAvatar).toHaveAttribute("height", "40");
    await trigger.focus();
    await page.keyboard.press("Enter");

    await expect(menu).toBeVisible();
    const menuAvatar = menu.getByRole("img");
    await expect(menuAvatar).toHaveAttribute("width", "44");
    await expect(menuAvatar).toHaveAttribute("height", "44");
    await expect(menu.getByText("Playwright User")).toBeVisible();
    await expect(menu.getByText("playwright@local.test")).toBeVisible();
    await expect(
      menu.getByRole("link", { name: languagePattern }),
    ).toBeVisible();
    await expect(
      menu.getByRole("button", { name: signOutPattern }),
    ).toBeVisible();
  });

  test("centers initials when the profile image cannot load", async ({
    page,
  }) => {
    await page.route("**/*", (route) =>
      route.request().resourceType() === "image"
        ? route.abort("failed")
        : route.continue(),
    );
    await page.goto("/search/?lang=en-US");

    const trigger = page.getByRole("button", {
      name: openAccountMenuPattern,
    });

    const toolbarInitials = trigger.getByText("PU", { exact: true });
    await expect(toolbarInitials).toBeVisible();
    await trigger.click();

    const menu = page.getByRole("menu", { name: accountMenuPattern });
    const menuInitials = menu.getByText("PU", { exact: true });
    await expect(menuInitials).toBeVisible();
    await expect(trigger.getByRole("img")).toHaveCount(0);
    await expect(menu.getByRole("img")).toHaveCount(0);

    for (const initials of [toolbarInitials, menuInitials]) {
      const centerOffset = await initials.evaluate((element) => {
        const text = element.getBoundingClientRect();
        const circle = element.parentElement!.getBoundingClientRect();

        return {
          x: Math.abs(text.x + text.width / 2 - (circle.x + circle.width / 2)),
          y: Math.abs(
            text.y + text.height / 2 - (circle.y + circle.height / 2),
          ),
        };
      });

      expect(centerOffset.x).toBeLessThanOrEqual(1);
      expect(centerOffset.y).toBeLessThanOrEqual(1);
    }
  });

  test("switches language from the account menu and persists the choice", async ({
    page,
  }) => {
    await page.goto("/search/?lang=en-US");

    const trigger = page.getByRole("button", {
      name: openAccountMenuPattern,
    });
    const menu = page.getByRole("menu", { name: accountMenuPattern });

    await trigger.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: languagePattern }).click();

    await expect(page).toHaveURL(/\/search\/?\?lang=ru-RU$/);
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem("lang")))
      .toBe("ru-RU");
  });

  test("signs out to auth while preserving lang", async ({ page }) => {
    await page.goto("/search/?lang=ru-RU");

    const trigger = page.getByRole("button", {
      name: openAccountMenuPattern,
    });
    const menu = page.getByRole("menu", { name: accountMenuPattern });

    await trigger.click();
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: signOutPattern }).click();

    await expect(page).toHaveURL(/\/auth\/?\?lang=ru-RU$/);
    await expect(
      page.getByRole("heading", {
        name: authHeadingPattern,
      }),
    ).toBeVisible();
  });
});
