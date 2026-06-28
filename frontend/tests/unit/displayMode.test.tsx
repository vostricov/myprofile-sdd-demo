import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  DisplayModeProvider,
  useDisplayMode,
} from "../../src/context/DisplayModeContext";
import { messages } from "../../src/i18n/messages";

describe("display mode provider", () => {
  afterEach(() => {
    cleanup();
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
});

function renderDisplayModeHarness() {
  return render(
    <DisplayModeProvider>
      <DisplayModeHarness />
    </DisplayModeProvider>,
  );
}

function DisplayModeHarness() {
  const { isNightMode, mode, toggleMode } = useDisplayMode();

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
    </div>
  );
}
