import { expect, test } from "@playwright/test";

test("renders the Spark Pixel dashboard clone shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Spark Pixel Team")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome back, Salung" })).toBeVisible();
  await expect(page.getByText("Sales Trend")).toBeVisible();
  await expect(page.getByText("Revenue Breakdown")).toBeVisible();
  await expect(page.getByText("Recent Transactions")).toBeVisible();
  await expect(page.getByRole("button", { name: /Export CSV/i })).toBeVisible();
});

test("does not use the reference artwork as the page background", async ({ page }) => {
  await page.goto("/");

  const bodyBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);

  expect(bodyBackground).not.toContain("reference.webp");
});

test("lets dashboard controls change state when clicked", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Daily" }).click();
  await page.getByRole("menuitem", { name: "Weekly" }).click();
  await expect(page.getByRole("button", { name: "Interval: Weekly" })).toBeVisible();

  await page.getByRole("link", { name: /Products/i }).click();
  await expect(page.getByRole("link", { name: /Products/i })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: /Export CSV/i }).click();
  await expect(page.getByText("CSV export prepared")).toBeVisible();
});

test("renders sales and revenue charts through ECharts canvas instances", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[data-chart-engine="echarts"]')).toHaveCount(2);
  await expect(page.locator('[data-chart-engine="echarts"] canvas')).toHaveCount(2);
});

test("matches the reference card colors and uses real square chart cells", async ({ page }) => {
  await page.goto("/");

  const colors = await page.locator(".metric-card").first().evaluate((card) => {
    const top = card.querySelector(".metric-top");
    const chartShell = document.querySelector(".chart-shell");

    return {
      metricOuter: getComputedStyle(card).backgroundColor,
      metricInner: top ? getComputedStyle(top).backgroundColor : "",
      chartShell: chartShell ? getComputedStyle(chartShell).backgroundColor : "",
    };
  });

  expect(colors.metricOuter).toBe("rgb(38, 36, 34)");
  expect(colors.metricInner).toBe("rgb(48, 46, 45)");
  expect(colors.chartShell).toBe("rgb(48, 46, 45)");
  await expect(page.locator(".square-grid-cell")).toHaveCount(240);

  const firstCell = await page.locator(".square-grid-cell").first().boundingBox();

  expect(firstCell).not.toBeNull();
  expect(Math.abs(firstCell!.width - firstCell!.height)).toBeLessThanOrEqual(2.5);
  expect(firstCell!.width).toBeGreaterThanOrEqual(24);
  expect(firstCell!.width).toBeLessThanOrEqual(34);
});

test("reflows without horizontal page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Welcome back, Salung" })).toBeVisible();

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
});
