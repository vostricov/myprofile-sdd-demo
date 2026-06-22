import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ToastProvider } from "../../src/components/Toast";
import {
  createInitialProfileState,
  getVisibleProfile,
  profileReducer,
  ProfileProvider,
} from "../../src/context/ProfileContext";
import { initialProfile, type Profile } from "../../src/domain/profileSchema";
import { Profile as ProfileView } from "../../src/features/view-business-profile/Profile";
import { messages } from "../../src/i18n/messages";

describe("profile reducer", () => {
  it("stages, previews, saves, and undoes draft changes", () => {
    const savedAt = "2026-06-22T12:00:00Z";
    const initialState = createInitialProfileState(initialProfile);
    const withDraft = profileReducer(initialState, {
      type: "startDraft",
      sectionId: "summary",
    });
    const updatedDraft = profileReducer(withDraft, {
      type: "updateDraft",
      sectionId: "summary",
      content: "Draft summary",
    });
    const previewing = profileReducer(updatedDraft, {
      type: "setPreview",
      isPreviewing: true,
    });

    expect(sectionContent(getVisibleProfile(previewing), "summary")).toBe(
      "Draft summary",
    );

    const saved = profileReducer(previewing, {
      type: "saveAllDrafts",
      savedAt,
      metadata: {
        lastEditedByUserId: "editor",
        lastUpdated: savedAt,
      },
    });

    expect(saved.drafts).toEqual({});
    expect(saved.isPreviewing).toBe(false);
    expect(saved.undoStack).toHaveLength(1);
    expect(sectionContent(saved.profile, "summary")).toBe("Draft summary");
    expect(sectionById(saved.profile, "summary").lastEditedByUserId).toBe(
      "editor",
    );
    expect(sectionById(saved.profile, "summary").lastUpdated).toBe(savedAt);

    const undone = profileReducer(saved, { type: "undoLastSave" });

    expect(undone.undoStack).toHaveLength(0);
    expect(sectionContent(undone.profile, "summary")).toBe(
      sectionContent(initialProfile, "summary"),
    );
  });
});

describe("Profile component", () => {
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

  it("renders edit controls for permitted roles only", () => {
    renderProfile(initialProfile);

    expect(
      screen.queryByRole("button", { name: "Edit Summary" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(messages.profile.viewerRole), {
      target: { value: "editor" },
    });

    expect(screen.getByRole("button", { name: "Edit Summary" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Edit Certifications" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(messages.profile.viewerRole), {
      target: { value: "owner" },
    });

    expect(
      screen.getByRole("button", { name: "Edit Certifications" }),
    ).toBeEnabled();
  });

  it("renders a section with empty structured content", () => {
    renderProfile(
      profileWithSections([
        {
          ...initialProfile.sections[0],
          id: "empty-details",
          title: "Empty Details",
          content: {},
        },
      ]),
    );

    const article = screen.getByRole("article", { name: "Empty Details" });

    expect(
      within(article).getByRole("heading", { name: "Empty Details" }),
    ).toBeInTheDocument();
  });

  it("renders very long section content", () => {
    const longContent = "Long profile content. ".repeat(500);

    renderProfile(
      profileWithSections([
        {
          ...initialProfile.sections[0],
          content: longContent,
        },
      ]),
    );

    expect(
      screen.getByText((content) => {
        return (
          content.startsWith("Long profile content.") &&
          content.length >= longContent.trimEnd().length
        );
      }),
    ).toBeInTheDocument();
  });
});

function renderProfile(profile: Profile) {
  return render(
    <ToastProvider>
      <ProfileProvider initialState={createInitialProfileState(profile)}>
        <ProfileView />
      </ProfileProvider>
    </ToastProvider>,
  );
}

function profileWithSections(sections: Profile["sections"]): Profile {
  return {
    ...initialProfile,
    sections,
  };
}

function sectionById(profile: Profile, sectionId: string) {
  const section = profile.sections.find(({ id }) => id === sectionId);

  if (!section) {
    throw new Error(`Missing section: ${sectionId}`);
  }

  return section;
}

function sectionContent(profile: Profile, sectionId: string) {
  return sectionById(profile, sectionId).content;
}
