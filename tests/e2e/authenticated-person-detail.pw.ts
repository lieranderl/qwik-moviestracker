import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { DEV_PERSON_DETAIL_ID } from "../../src/routes/dev-session";

test.describe("authenticated person detail", () => {
  test("renders the dev fixture and writes last viewed state", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto(`/person/${DEV_PERSON_DETAIL_ID}/?lang=en-US`);

    await expect(page).toHaveURL(
      new RegExp(`/person/${DEV_PERSON_DETAIL_ID}/\\?lang=en-US$`),
    );
    await expect(page.getByText("Lin Carter", { exact: true })).toBeVisible();
    await expect(page.getByText("Acting")).toBeVisible();
    await expect(
      page.getByText(/deterministic fixture performer/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /playwright in paris/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /selectors/i })).toBeVisible();

    await expect
      .poll(() =>
        page.evaluate(() =>
          window.localStorage.getItem("moviestracker:last-viewed"),
        ),
      )
      .toContain(`"/person/${DEV_PERSON_DETAIL_ID}/?lang=en-US"`);
  });
});
