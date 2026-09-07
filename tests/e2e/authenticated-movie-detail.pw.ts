import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { openImdbPagePattern } from "./helpers/i18n";
import { DEV_MOVIE_DETAIL_ID } from "../../src/routes/dev-session";

test.describe("authenticated movie detail", () => {
  test("renders primary details while IMDb enrichment is still pending", async ({
    page,
  }) => {
    let releaseImdb!: () => void;
    const imdbBarrier = new Promise<void>((resolve) => {
      releaseImdb = resolve;
    });
    await page.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      if (
        route.request().method() === "POST" &&
        requestUrl.searchParams.has("qfunc")
      ) {
        await imdbBarrier;
        const response = await route.fetch();
        await route.fulfill({ response });
        return;
      }
      await route.continue();
    });

    await addBypassCookie(page);
    await page.goto(`/movie/${DEV_MOVIE_DETAIL_ID}/?lang=en-US`);

    await expect(
      page.getByRole("heading", { name: "Playwright in Paris" }),
    ).toBeVisible();
    await expect(page.getByLabel("IMDb loading")).toBeVisible();
    releaseImdb();
    await page.unrouteAll({ behavior: "wait" });
  });

  test("renders the dev fixture and writes last viewed state", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto(`/movie/${DEV_MOVIE_DETAIL_ID}/?lang=en-US`);

    await expect(page).toHaveURL(
      new RegExp(`/movie/${DEV_MOVIE_DETAIL_ID}/\\?lang=en-US$`),
    );
    await expect(
      page.getByRole("heading", { name: "Playwright in Paris" }),
    ).toBeVisible();
    await expect(
      page.getByText("A deterministic movie for browser tests."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: openImdbPagePattern,
      }),
    ).toBeVisible();
    const availability = page
      .getByRole("heading", { name: "Availability" })
      .locator("..");
    await expect(availability).toContainText("PG-13");
    await expect(availability).toContainText("Region: US");
    await expect(
      availability
        .locator("span:not([aria-hidden])")
        .filter({ hasText: /^Netflix$/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /assertions at dawn/i,
      }),
    ).toBeVisible();
    await expect(page.getByLabel("IMDb loading")).not.toBeVisible();

    await expect
      .poll(async () => {
        try {
          return await page.evaluate(() =>
            window.localStorage.getItem("moviestracker:last-viewed"),
          );
        } catch {
          return null;
        }
      })
      .toContain(`"/movie/${DEV_MOVIE_DETAIL_ID}/?lang=en-US"`);
  });
});
