import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { expectFeaturedSlidesAligned } from "./helpers/featured-carousel";

test.describe("authenticated home", () => {
  test("renders the dashboard without browsing-history sections", async ({
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
        name: /^home$/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Playwright in Paris",
      }),
    ).toBeVisible();
    await expect(
      page.locator('#featured-spotlight button[aria-label*="/ 8:"]'),
    ).toHaveCount(8);
    await expectFeaturedSlidesAligned(page, "Featured");
    await page.getByRole("button", { name: /next page/i }).click();
    await expect(
      page.getByRole("heading", {
        name: "Runtime Romance",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /last viewed/i,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: /tv selectors 2025 • series resume/i,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: /arrival/i,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: /recent searches/i,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("region", {
        name: /latest movies/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: /trending movies/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: /trending series/i,
      }),
    ).toBeVisible();
    const unratedMovie = page.getByRole("link", {
      name: /hydration station/i,
    });
    await expect(unratedMovie).toBeVisible();
    await expect(unratedMovie.locator(".badge-warning")).toHaveCount(0);
  });
});
