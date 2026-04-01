import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { DEV_TV_DETAIL_ID } from "../../src/routes/dev-session";

test.describe("authenticated tv detail", () => {
  test("renders the dev fixture and writes last viewed state", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto(`/tv/${DEV_TV_DETAIL_ID}/?lang=en-US`);

    await expect(page).toHaveURL(
      new RegExp(`/tv/${DEV_TV_DETAIL_ID}/\\?lang=en-US$`),
    );
    await expect(
      page.getByRole("heading", { name: "Selectors" }),
    ).toBeVisible();
    await expect(page.getByText("Every choice is deliberate.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /open imdb profile/i }),
    ).toBeVisible();
    await expect(page.getByText("TV-14 • US")).toBeVisible();
    await expect(page.getByText("Hulu")).toBeVisible();
    await expect(page.getByText("Returning Series")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /state machines/i }),
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
      .toContain(`"/tv/${DEV_TV_DETAIL_ID}/?lang=en-US"`);
  });
});
