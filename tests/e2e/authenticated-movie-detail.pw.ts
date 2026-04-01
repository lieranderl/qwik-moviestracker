import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { DEV_MOVIE_DETAIL_ID } from "../../src/routes/dev-session";

test.describe("authenticated movie detail", () => {
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
        name: /open imdb profile/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("PG-13 • US")).toBeVisible();
    await expect(page.getByText("Netflix")).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /assertions at dawn/i,
      }),
    ).toBeVisible();

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
