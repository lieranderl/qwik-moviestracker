import { expect, test } from "@playwright/test";
import { addBypassCookie } from "./helpers/auth-bypass";
import { expectFeaturedSlidesAligned } from "./helpers/featured-carousel";

test.describe("authenticated movie collections", () => {
  test("shows the HDR and Dolby feature carousel with the simplified collection order", async ({
    page,
  }) => {
    await addBypassCookie(page);
    const artworkIds = new Set<string>();
    await page.route("**/api/tmdb-horizontal-poster?**", async (route) => {
      const id = new URL(route.request().url()).searchParams.get("id");
      if (id) artworkIds.add(id);
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          backdropPath:
            id === "990003"
              ? "/44immBwzhDVyjn87b3x3l9mlhAD.jpg"
              : "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
          logoPath: id === "990001" ? "/title-art.png" : null,
        }),
      });
    });
    await page.goto("/movie/?lang=en-US");

    await expect(
      page.getByRole("heading", { name: "Movies", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Discover movies" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "4K HDR / Dolby Vision" }),
    ).toBeVisible();
    await expect(
      page.locator('#featured-spotlight button[aria-label*="/ 8:"]'),
    ).toHaveCount(8);
    await expectFeaturedSlidesAligned(page, "4K HDR / Dolby Vision");
    const hdrFigures = page.locator("#hdr10-movies figure");
    await page.waitForLoadState("networkidle");
    await hdrFigures.first().scrollIntoViewIfNeeded();
    await expect(hdrFigures.first()).toBeInViewport();
    await expect.poll(() => artworkIds.has("990001")).toBe(true);
    await hdrFigures.nth(1).scrollIntoViewIfNeeded();
    await expect(hdrFigures.nth(1)).toBeInViewport();
    await expect.poll(() => artworkIds.has("990003")).toBe(true);
    await expect(hdrFigures.first().locator("img")).toHaveCount(1);
    await expect(hdrFigures.nth(1)).not.toContainText("Cache Me If You Can");

    await expect(
      page.getByRole("region", { name: "Popular", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Now Playing", exact: true }),
    ).toHaveCount(0);

    const collectionSections = page.locator("main section[id]");
    await expect(collectionSections).toHaveCount(6);
    const expectedCollectionOrder = [
      "featured-spotlight",
      "latest-movies",
      "hdr10-movies",
      "dolby-vision-movies",
      "trending-movies",
      "upcoming-movies",
    ];
    for (const [index, id] of expectedCollectionOrder.entries()) {
      await expect(collectionSections.nth(index)).toHaveAttribute("id", id);
    }
  });
});
