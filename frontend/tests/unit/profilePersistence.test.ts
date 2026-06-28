import "@testing-library/jest-dom/vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearStoredProfile, loadProfile } from "../../src/api/localProfileStorage";
import { profileApi } from "../../src/api/profileApi";
import { ToastProvider } from "../../src/components/Toast";
import { DisplayModeProvider } from "../../src/context/DisplayModeContext";
import {
  createInitialProfileState,
  ProfileProvider,
} from "../../src/context/ProfileContext";
import {
  initialProfile,
  type Profile,
  type ProfileSectionContent,
} from "../../src/domain/profileSchema";
import { Profile as ProfileView } from "../../src/features/view-business-profile/Profile";
import { messages } from "../../src/i18n/messages";

const PROFILE_STORAGE_KEY = "myprofile-sdd-demo.profile.mock-v1";

describe("profile persistence", () => {
  beforeEach(() => {
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
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clearStoredProfile();
  });

  it("persists profiles through profileApi.save and reloads them from the local adapter", async () => {
    const profile = withSectionContent(initialProfile, "summary", "Persisted summary");

    await expect(profileApi.save(profile)).resolves.toEqual(profile);

    expect(loadProfile()).toEqual(profile);
    await expect(profileApi.load()).resolves.toEqual(profile);
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBe(
      JSON.stringify(profile),
    );
  });

  it("updates save metadata before persisting a confirmed profile save", async () => {
    const savedAt = "2026-06-22T10:00:00.000Z";
    const updatedSummary = "Summary saved through the profile toolbar.";

    stubCurrentDate(savedAt);

    renderProfile();
    await stageSummaryDraft(updatedSummary);
    fireEvent.click(screen.getByRole("button", { name: messages.preview.save }));

    await waitFor(() => {
      expect(screen.getByText(messages.preview.saved)).toBeInTheDocument();
    });

    const persistedProfile = loadProfile();
    const persistedSummary = sectionById(persistedProfile, "summary");

    expect(persistedSummary.content).toBe(updatedSummary);
    expect(persistedSummary.lastUpdated).toBe(savedAt);
    expect(persistedSummary.lastEditedByUserId).toBe("editor");
    expect(
      screen.getByText(messages.section.editedBy("editor")),
    ).toBeInTheDocument();
  });

  it("rolls back optimistic profile changes when persistence fails", async () => {
    const failingSummary = "This change should be rolled back.";

    vi.spyOn(profileApi, "save").mockRejectedValueOnce(new Error("offline"));

    renderProfile();
    await stageSummaryDraft(failingSummary);
    fireEvent.click(screen.getByRole("button", { name: messages.preview.save }));

    await waitFor(() => {
      expect(screen.getByText(messages.preview.saveError)).toBeInTheDocument();
    });

    expect(screen.queryByText(failingSummary)).not.toBeInTheDocument();
    expect(loadProfile()).toBeNull();
  });
});

function renderProfile(profile: Profile = initialProfile) {
  return render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ProfileProvider,
        { initialState: createInitialProfileState(profile) },
        createElement(
          DisplayModeProvider,
          null,
          createElement(ProfileView),
        ),
      ),
    ),
  );
}

async function stageSummaryDraft(content: string): Promise<void> {
  fireEvent.change(screen.getByLabelText(messages.profile.viewerRole), {
    target: { value: "editor" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: messages.section.editAriaLabel("Summary"),
    }),
  );

  const summaryArticle = screen.getByRole("article", { name: "Summary" });
  const editorContentField = await within(summaryArticle).findByLabelText(
    messages.editor.content,
  );

  fireEvent.change(editorContentField, {
    target: { value: content },
  });
  fireEvent.click(
    within(summaryArticle).getByRole("button", { name: messages.editor.save }),
  );

  await waitFor(() => {
    expect(
      screen.getByText(messages.preview.draftUpdated("Summary")),
    ).toBeInTheDocument();
  });
}

function withSectionContent(
  profile: Profile,
  sectionId: string,
  content: ProfileSectionContent,
): Profile {
  return {
    ...profile,
    sections: profile.sections.map((section) =>
      section.id === sectionId ? { ...section, content } : section,
    ),
  };
}

function sectionById(profile: Profile | null, sectionId: string) {
  const section = profile?.sections.find((candidate) => candidate.id === sectionId);

  if (!section) {
    throw new Error(`Missing section: ${sectionId}`);
  }

  return section;
}

function stubCurrentDate(isoTimestamp: string): void {
  const RealDate = Date;

  vi.stubGlobal(
    "Date",
    class extends RealDate {
      constructor(value?: string | number | Date) {
        if (arguments.length === 0) {
          super(isoTimestamp);
          return;
        }

        super(value);
      }

      static now() {
        return new RealDate(isoTimestamp).getTime();
      }

      static parse(value: string) {
        return RealDate.parse(value);
      }

      static UTC(
        year: number,
        monthIndex: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        ms?: number,
      ) {
        return RealDate.UTC(year, monthIndex, date, hours, minutes, seconds, ms);
      }
    } as DateConstructor,
  );
}
