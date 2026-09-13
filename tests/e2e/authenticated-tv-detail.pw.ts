import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { openImdbPagePattern } from "./helpers/i18n";
import { DEV_TV_DETAIL_ID } from "../../src/routes/dev-session";

test.describe("authenticated tv detail", () => {
  test("renders the dev fixture without saving last viewed state", async ({
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
      page.getByRole("link", { name: openImdbPagePattern }),
    ).toBeVisible();
    const availability = page
      .getByRole("heading", { name: "Availability" })
      .locator("..");
    await expect(availability).toContainText("TV-14");
    await expect(availability).toContainText("Region: US");
    await expect(
      availability
        .locator("span:not([aria-hidden])")
        .filter({ hasText: /^Hulu$/ }),
    ).toBeVisible();
    await expect(page.getByText("Returning Series")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /state machines/i }),
    ).toBeVisible();

    expect(
      await page.evaluate(() =>
        window.localStorage.getItem("moviestracker:last-viewed"),
      ),
    ).toBeNull();
  });
});
