import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DISPLAY_MODE_STORAGE_KEY } from "../../src/api/localDisplayModePreference";
import {
  DisplayModeProvider,
  useDisplayMode,
} from "../../src/context/DisplayModeContext";
import { messages } from "../../src/i18n/messages";

describe("display mode provider", () => {
  beforeEach(() => {
    mockLocalStorage();
    mockDevicePreference(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("exposes the current day-mode state to accessible controls", () => {
    renderDisplayModeHarness();

    const toggle = screen.getByRole("button", {
      name: messages.displayMode.switchToNightMode,
    });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(messages.displayMode.currentMode("day"))).toBeVisible();
  });

  it("toggles night mode for the current session", () => {
    renderDisplayModeHarness();

    fireEvent.click(
      screen.getByRole("button", {
        name: messages.displayMode.switchToNightMode,
      }),
    );

    const toggle = screen.getByRole("button", {
      name: messages.displayMode.switchToDayMode,
    });

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(messages.displayMode.currentMode("night"))).toBeVisible();
  });

  it("restores a saved night mode choice before the device preference", () => {
    window.localStorage.setItem(
      DISPLAY_MODE_STORAGE_KEY,
      JSON.stringify({ mode: "night" }),
    );
    mockDevicePreference("light");

    renderDisplayModeHarness();

    expect(screen.getByText(messages.displayMode.currentMode("night"))).toBeVisible();
    expect(screen.getByText("source:saved")).toBeVisible();
    expect(screen.getByText("canPersist:true")).toBeVisible();
  });

  it("ignores invalid saved choices and falls back to dark device preference", () => {
    window.localStorage.setItem(
      DISPLAY_MODE_STORAGE_KEY,
      JSON.stringify({ mode: "sepia" }),
    );
    mockDevicePreference("dark");

    renderDisplayModeHarness();

    expect(screen.getByText(messages.displayMode.currentMode("night"))).toBeVisible();
    expect(screen.getByText("source:device")).toBeVisible();
  });

  it("uses day mode from a light device preference when no saved choice exists", () => {
    mockDevicePreference("light");

    renderDisplayModeHarness();

    expect(screen.getByText(messages.displayMode.currentMode("day"))).toBeVisible();
    expect(screen.getByText("source:device")).toBeVisible();
  });

  it("uses day mode by default when no saved or device preference is available", () => {
    renderDisplayModeHarness();

    expect(screen.getByText(messages.displayMode.currentMode("day"))).toBeVisible();
    expect(screen.getByText("source:default")).toBeVisible();
  });

  it("keeps current-session toggling available when storage is unavailable", () => {
    mockUnavailableLocalStorage();
    mockDevicePreference("light");

    renderDisplayModeHarness();

    expect(screen.getByText("canPersist:false")).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", {
        name: messages.displayMode.switchToNightMode,
      }),
    );

    expect(screen.getByText(messages.displayMode.currentMode("night"))).toBeVisible();
    expect(screen.getByText("canPersist:false")).toBeVisible();
  });
});

function renderDisplayModeHarness() {
  return render(
    <DisplayModeProvider>
      <DisplayModeHarness />
    </DisplayModeProvider>,
  );
}

function DisplayModeHarness() {
  const { canPersist, isNightMode, mode, source, toggleMode } = useDisplayMode();

  return (
    <div>
      <button
        aria-pressed={isNightMode}
        aria-label={
          isNightMode
            ? messages.displayMode.switchToDayMode
            : messages.displayMode.switchToNightMode
        }
        onClick={toggleMode}
        type="button"
      >
        {isNightMode
          ? messages.displayMode.nightMode
          : messages.displayMode.dayMode}
      </button>
      <p>{messages.displayMode.currentMode(mode)}</p>
      <p>source:{source}</p>
      <p>canPersist:{String(canPersist)}</p>
    </div>
  );
}

function mockLocalStorage() {
  const storage = new Map<string, string>();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
}

function mockUnavailableLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => {
      throw new Error("localStorage unavailable");
    },
  });
}

function mockDevicePreference(preference: "dark" | "light" | null) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches:
        query === "(prefers-color-scheme: dark)" && preference === "dark",
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}
