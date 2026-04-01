import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";

test.describe("authenticated home", () => {
  test("renders the deterministic dashboard feed and restores continue browsing state", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "moviestracker:last-viewed",
        JSON.stringify({
          href: "/tv/880001/?lang=en-US",
          title: "Selectors",
          kind: "tv",
          meta: "2025 • Series",
        }),
      );
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

    await page.goto("/?lang=en-US");

    await expect(page).toHaveURL(/\/\?lang=en-US$/);
    await expect(
      page.getByRole("heading", {
        name: /your movie and series dashboard/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Playwright in Paris",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /tv selectors 2025 • series resume/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /arrival/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /hydration station/i,
      }),
    ).toBeVisible();
  });
});
