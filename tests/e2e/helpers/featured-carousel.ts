import { expect, type Page } from "@playwright/test";

export const expectFeaturedSlidesAligned = async (
  page: Page,
  label: string,
  total = 8,
) => {
  const carousel = page.locator("#featured-spotlight");
  const slides = carousel.locator(".carousel-item");
  const positions: Array<{ action: number; label: number; title: number }> = [];

  await expect(slides).toHaveCount(total);
  await expect(carousel.locator('img[alt$=" poster"]')).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  for (let index = 0; index < total; index += 1) {
    const slide = slides.nth(index);
    const labelPosition = await slide
      .getByText(label, { exact: true })
      .first()
      .evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const titlePosition = await slide
      .locator("h2")
      .evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const actionPosition = await slide
      .locator("a")
      .evaluate((element) => element.getBoundingClientRect().top + scrollY);

    positions.push({
      action: actionPosition,
      label: labelPosition,
      title: titlePosition,
    });
  }

  const first = positions[0];
  for (const position of positions.slice(1)) {
    expect(Math.abs(position.label - first.label)).toBeLessThanOrEqual(3);
    expect(Math.abs(position.title - first.title)).toBeLessThanOrEqual(3);
    expect(Math.abs(position.action - first.action)).toBeLessThanOrEqual(3);
  }

  const firstIndicator = carousel.locator(
    `button[aria-label^="1 / ${total}:"]`,
  );
  if ((page.viewportSize()?.width ?? 0) < 640) {
    await expect(firstIndicator).toBeHidden();
    await expect(
      carousel.getByText(`1 / ${total}`, { exact: true }),
    ).toBeVisible();
  } else {
    await expect(firstIndicator).toBeVisible();
  }
};
