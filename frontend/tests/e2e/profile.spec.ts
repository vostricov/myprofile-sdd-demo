import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("renders profile sections, synchronizes collapse state, and passes axe checks", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Mock Solution Architect Profile" }),
  ).toBeVisible();

  const summaryToggle = page.getByRole("button", { name: "Summary" });

  await expect(summaryToggle).toHaveAttribute("aria-expanded", "true");
  await summaryToggle.click();
  await expect(summaryToggle).toHaveAttribute("aria-expanded", "false");
  await summaryToggle.click();
  await expect(summaryToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(/#summary$/);

  const industryToggle = page.getByRole("button", { name: "Industry Expertise" });

  await industryToggle.click();
  await expect(industryToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(/#industry-expertise$/);

  const results = await new AxeBuilder({ page }).include("main").analyze();

  expect(results.violations).toEqual([]);
});

test("switches display mode from the upper bar by pointer and keyboard", async ({
  page,
}) => {
  const upperBar = page.getByRole("region", { name: "Profile draft controls" });
  const toggle = upperBar.getByRole("button", {
    name: "Switch to night mode",
  });

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");

  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");

  const dayToggle = upperBar.getByRole("button", {
    name: "Switch to day mode",
  });

  await expect(dayToggle).toHaveAttribute("aria-pressed", "true");
  await dayToggle.focus();
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "day");
  await expect(
    upperBar.getByRole("button", { name: "Switch to night mode" }),
  ).toHaveAttribute("aria-pressed", "false");

  const results = await new AxeBuilder({ page }).include("main").analyze();

  expect(results.violations).toEqual([]);
});

test("previews, saves, and undoes an inline edit", async ({ page }) => {
  const updatedSummary = "Playwright edited summary for preview and undo.";
  const originalSummary = await page
    .getByRole("article", { name: "Summary" })
    .locator("p")
    .first()
    .textContent();

  await page.getByLabel("Viewer role").selectOption("editor");
  await page.getByRole("button", { name: "Edit Summary" }).click();
  await page.getByLabel("Content").fill(updatedSummary);
  await page
    .getByRole("article", { name: "Summary" })
    .getByRole("button", { name: "Save" })
    .click();

  await expect(page.getByText("Summary draft updated.")).toBeVisible();
  await expect(page.getByText(updatedSummary)).toBeVisible();
  await expect(page.getByText("Previewing")).toBeVisible();

  await page
    .getByRole("region", { name: "Profile draft controls" })
    .getByRole("button", { name: "Save" })
    .click();

  await expect(page.getByText("Profile changes saved.")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Summary" }).getByText("Edited by editor"),
  ).toBeVisible();

  await page
    .getByRole("region", { name: "Profile draft controls" })
    .getByRole("button", { name: "Undo" })
    .click();

  await expect(page.getByText("Last save undone.")).toBeVisible();
  await expect(page.getByText(updatedSummary)).not.toBeVisible();
  await expect(
    page.getByRole("article", { name: "Summary" }).getByText(originalSummary ?? ""),
  ).toBeVisible();
});

test("uses single-column mobile and two-column desktop layouts", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");

  const mobileSummary = await requiredBox(
    page.getByRole("article", { name: "Summary" }),
  );
  const mobileDetails = await requiredBox(page.getByLabel("Profile details"));

  expect(mobileDetails.y).toBeGreaterThan(mobileSummary.y + mobileSummary.height);

  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/");

  const desktopSummary = await requiredBox(
    page.getByRole("article", { name: "Summary" }),
  );
  const desktopDetails = await requiredBox(page.getByLabel("Profile details"));

  expect(desktopDetails.x).toBeGreaterThan(desktopSummary.x + desktopSummary.width);
});

test("renders an RTL smoke scenario without accessibility violations", async ({ page }) => {
  await page.goto("/?dir=rtl");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("body")).toHaveCSS("direction", "rtl");

  await page.getByLabel("Viewer role").selectOption("owner");
  await expect(page.getByRole("button", { name: "Edit Certifications" })).toBeVisible();

  const results = await new AxeBuilder({ page }).include("main").analyze();

  expect(results.violations).toEqual([]);
});

async function requiredBox(locator: Locator) {
  const box = await locator.boundingBox();

  if (!box) {
    throw new Error("Expected locator to have a bounding box.");
  }

  return box;
}
