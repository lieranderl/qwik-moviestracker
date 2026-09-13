import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { expectFeaturedSlidesAligned } from "./helpers/featured-carousel";

test.describe("authenticated series collections", () => {
  test("shows the Trending series feature and removes Airing Today", async ({
    page,
  }) => {
    await addBypassCookie(page);
    await page.goto("/tv/?lang=en-US");

    await expect(
      page.getByRole("heading", { name: "Series", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Discover series" }),
    ).toBeVisible();
    await expect(
      page.locator('#featured-spotlight[aria-label="Trending series"]'),
    ).toBeVisible();
    await expect(
      page.locator('#featured-spotlight button[aria-label*="/ 8:"]'),
    ).toHaveCount(8);
    await expectFeaturedSlidesAligned(page, "Trending series");
    await expect(
      page.getByText(
        "A reliable series fixture for authenticated dashboard coverage.",
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: /next page/i }).click();
    await expect(
      page.getByRole("heading", { name: "Popular Paths" }),
    ).toBeVisible();
    await expect(page.getByText("A title worth opening now.")).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Airing Today", exact: true }),
    ).toHaveCount(0);

    const collectionSections = page.locator("main section[id]");
    await expect(collectionSections).toHaveCount(5);
    const expectedCollectionOrder = [
      "featured-spotlight",
      "trending-tv",
      "popular-tv",
      "top-rated-tv",
      "on-the-air-tv",
    ];
    for (const [index, id] of expectedCollectionOrder.entries()) {
      await expect(collectionSections.nth(index)).toHaveAttribute("id", id);
    }
  });
});
