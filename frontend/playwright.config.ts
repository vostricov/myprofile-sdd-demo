import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: "list",
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:5173",
  },
  workers: process.env.CI ? 1 : undefined,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { height: 900, width: 1280 },
      },
    },
  ],
});
