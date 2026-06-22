import { describe, expect, it } from "vitest";

import { canEditSection } from "../../src/domain/permissions";
import {
  initialProfile,
  type ProfileSection,
} from "../../src/domain/profileSchema";

describe("permissions", () => {
  it("prevents visitors from editing any section", () => {
    for (const section of initialProfile.sections) {
      expect(canEditSection(section, "visitor")).toBe(false);
    }
  });

  it("allows owners to edit owner-editable sections", () => {
    expect(canEditSection(sectionById("summary"), "owner")).toBe(true);
    expect(canEditSection(sectionById("certifications"), "owner")).toBe(true);
  });

  it("prevents owners from editing editor-only sections", () => {
    expect(canEditSection(sectionWithEditableBy(["editor"]), "owner")).toBe(false);
  });

  it("allows editors only when the section includes editor permissions", () => {
    expect(canEditSection(sectionById("summary"), "editor")).toBe(true);
    expect(canEditSection(sectionById("certifications"), "editor")).toBe(false);
  });
});

function sectionById(sectionId: string) {
  const section = initialProfile.sections.find(({ id }) => id === sectionId);

  if (!section) {
    throw new Error(`Missing fixture section: ${sectionId}`);
  }

  return section;
}

function sectionWithEditableBy(
  editableBy: ProfileSection["editableBy"],
): Pick<ProfileSection, "editableBy"> {
  return { editableBy };
}
