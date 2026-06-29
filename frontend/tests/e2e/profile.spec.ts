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

test("restores explicit display mode choices across reloads", async ({ page }) => {
  const upperBar = page.getByRole("region", { name: "Profile draft controls" });

  await upperBar.getByRole("button", { name: "Switch to night mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");
  await expect(
    upperBar.getByRole("button", { name: "Switch to day mode" }),
  ).toHaveAttribute("aria-pressed", "true");

  await upperBar.getByRole("button", { name: "Switch to day mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "day");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "day");
  await expect(
    upperBar.getByRole("button", { name: "Switch to night mode" }),
  ).toHaveAttribute("aria-pressed", "false");
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

test("preserves editing workflow state while switching display modes", async ({
  page,
}) => {
  const upperBar = page.getByRole("region", { name: "Profile draft controls" });
  const summaryArticle = page.getByRole("article", { name: "Summary" });
  const updatedSummary = "Night mode preservation draft.";

  await page.getByLabel("Viewer role").selectOption("editor");
  await page.getByRole("button", { name: "Edit Summary" }).click();
  await summaryArticle.getByLabel("Content").fill("");
  await summaryArticle.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Content is required.")).toBeVisible();

  await upperBar.getByRole("button", { name: "Switch to night mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");
  await expect(summaryArticle.getByLabel("Content")).toBeVisible();
  await expect(page.getByText("Content is required.")).toBeVisible();

  await summaryArticle.getByLabel("Content").fill(updatedSummary);
  await summaryArticle.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Summary draft updated.")).toBeVisible();
  await expect(page.getByText("Previewing")).toBeVisible();
  await expect(page.getByText(updatedSummary)).toBeVisible();
  await expect(upperBar.getByRole("button", { name: "Save" })).toBeEnabled();

  await upperBar.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Profile changes saved.")).toBeVisible();
  await expect(upperBar.getByRole("button", { name: "Undo" })).toBeEnabled();

  await upperBar.getByRole("button", { name: "Switch to day mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "day");
  await expect(upperBar.getByRole("button", { name: "Undo" })).toBeEnabled();
  await expect(page.getByText("Profile changes saved.")).toBeVisible();

  await page.getByLabel("Viewer role").selectOption("owner");
  await page
    .getByRole("button", { exact: true, name: "Industry Expertise" })
    .click();
  await page.getByRole("button", { name: "Edit Industry Expertise" }).click();

  const dialog = page.getByRole("dialog", { name: "Edit Industry Expertise" });

  await dialog.getByLabel("Content JSON").fill("{");
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(dialog.getByText("Content must be valid JSON.")).toBeVisible();

  await dialog.getByRole("button", { name: "Switch to night mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Content JSON")).toHaveValue("{");
  await expect(dialog.getByText("Content must be valid JSON.")).toBeVisible();
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

test("keeps the night-mode upper bar usable across responsive and RTL layouts", async ({
  page,
}) => {
  const scenarios = [
    {
      height: 844,
      name: "mobile",
      url: "/",
      width: 390,
    },
    {
      height: 900,
      name: "desktop",
      url: "/",
      width: 1280,
    },
    {
      height: 900,
      largeText: true,
      name: "large text",
      url: "/",
      width: 1280,
    },
    {
      height: 844,
      name: "rtl mobile",
      rtl: true,
      url: "/?dir=rtl",
      width: 390,
    },
  ];

  for (const scenario of scenarios) {
    await page.setViewportSize({ height: scenario.height, width: scenario.width });
    await page.goto(scenario.url);
    await page.evaluate(() => window.localStorage.clear());
    await page.goto(scenario.url);

    if (scenario.largeText) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
    }

    if (scenario.rtl) {
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    }

    const upperBar = page.getByRole("region", { name: "Profile draft controls" });

    await upperBar.getByRole("button", { name: "Switch to night mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-display-mode", "night");
    await expect(
      upperBar.getByRole("button", { name: "Switch to day mode" }),
    ).toBeVisible();
    await expect(upperBar.getByRole("button", { name: "Preview" })).toBeVisible();
    await assertToolbarControlsFit(upperBar, scenario.name);
  }
});

async function requiredBox(locator: Locator) {
  const box = await locator.boundingBox();

  if (!box) {
    throw new Error("Expected locator to have a bounding box.");
  }

  return box;
}

async function assertToolbarControlsFit(toolbar: Locator, scenarioName: string) {
  const toolbarBox = await requiredBox(toolbar);
  const buttons = toolbar.locator("button");
  const buttonBoxes = [];

  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    const buttonBox = await requiredBox(button);

    expect(
      buttonBox.x,
      `${scenarioName}: button ${index} starts inside toolbar`,
    ).toBeGreaterThanOrEqual(toolbarBox.x - 1);
    expect(
      buttonBox.y,
      `${scenarioName}: button ${index} starts inside toolbar`,
    ).toBeGreaterThanOrEqual(toolbarBox.y - 1);
    expect(
      buttonBox.x + buttonBox.width,
      `${scenarioName}: button ${index} ends inside toolbar`,
    ).toBeLessThanOrEqual(toolbarBox.x + toolbarBox.width + 1);
    expect(
      buttonBox.y + buttonBox.height,
      `${scenarioName}: button ${index} bottom stays inside toolbar`,
    ).toBeLessThanOrEqual(toolbarBox.y + toolbarBox.height + 1);

    buttonBoxes.push(buttonBox);
  }

  for (let firstIndex = 0; firstIndex < buttonBoxes.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < buttonBoxes.length;
      secondIndex += 1
    ) {
      const overlapWidth = Math.max(
        0,
        Math.min(
          buttonBoxes[firstIndex].x + buttonBoxes[firstIndex].width,
          buttonBoxes[secondIndex].x + buttonBoxes[secondIndex].width,
        ) - Math.max(buttonBoxes[firstIndex].x, buttonBoxes[secondIndex].x),
      );
      const overlapHeight = Math.max(
        0,
        Math.min(
          buttonBoxes[firstIndex].y + buttonBoxes[firstIndex].height,
          buttonBoxes[secondIndex].y + buttonBoxes[secondIndex].height,
        ) - Math.max(buttonBoxes[firstIndex].y, buttonBoxes[secondIndex].y),
      );

      expect(
        overlapWidth * overlapHeight,
        `${scenarioName}: buttons ${firstIndex} and ${secondIndex} do not overlap`,
      ).toBeLessThanOrEqual(1);
    }
  }
}
