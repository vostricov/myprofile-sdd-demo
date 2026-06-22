import { describe, expect, it } from "vitest";

import fixture from "../../src/fixtures/initial-input/profile.json";
import {
  initialProfile,
  profileSchema,
  validateProfile,
  type Profile,
} from "../../src/domain/profileSchema";

const validProfile: Profile = initialProfile;

describe("profileSchema", () => {
  it("validates the canonical fixture on import", () => {
    expect(initialProfile).toEqual(fixture);
    expect(validateProfile(fixture)).toEqual(fixture);
  });

  it("rejects missing required profile and section fields", () => {
    const { profileId: _profileId, ...missingProfileId } = validProfile;
    const { title: _sectionTitle, ...missingSectionTitle } = validProfile.sections[0];
    const { content: _sectionContent, ...missingSectionContent } = validProfile.sections[0];

    expect(profileSchema.safeParse(missingProfileId).success).toBe(false);
    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [missingSectionTitle, ...validProfile.sections.slice(1)],
      }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [missingSectionContent, ...validProfile.sections.slice(1)],
      }).success,
    ).toBe(false);
  });

  it("rejects profiles with no sections", () => {
    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [],
      }).success,
    ).toBe(false);
  });

  it("accepts very long section content", () => {
    const profile = withFirstSectionOverrides({
      content: "A".repeat(10_000),
    });

    const result = profileSchema.safeParse(profile);

    expect(result.success).toBe(true);
  });

  it("rejects invalid editableBy roles", () => {
    const profile = withFirstSectionOverrides({
      editableBy: ["owner", "visitor"],
    });

    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it("rejects invalid contact email values", () => {
    const profile = withFirstSectionOverrides({
      content: {
        phone: "+1-555-0100",
        email: "not-an-email",
      },
    });

    const result = profileSchema.safeParse(profile);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.join(".").endsWith("content.email"))).toBe(true);
  });

  it("rejects invalid contact phone values", () => {
    const profile = withFirstSectionOverrides({
      content: {
        phone: "abc",
        email: "info@acme.example",
      },
    });

    const result = profileSchema.safeParse(profile);

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.join(".").endsWith("content.phone"))).toBe(true);
  });

  it("rejects non-UTC or invalid lastUpdated timestamps", () => {
    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [{ ...validProfile.sections[0], lastUpdated: "2026-06-01T12:00:00+02:00" }],
      }).success,
    ).toBe(false);

    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [{ ...validProfile.sections[0], lastUpdated: "2026-13-01T12:00:00Z" }],
      }).success,
    ).toBe(false);
  });

  it("allows lastEditedByUserId to be omitted", () => {
    const { lastEditedByUserId: _lastEditedByUserId, ...section } = validProfile.sections[0];

    expect(
      profileSchema.safeParse({
        ...validProfile,
        sections: [section, ...validProfile.sections.slice(1)],
      }).success,
    ).toBe(true);
  });
});

function withFirstSectionOverrides(overrides: Partial<Profile["sections"][number]>): Profile {
  return {
    ...validProfile,
    sections: [{ ...validProfile.sections[0], ...overrides }, ...validProfile.sections.slice(1)],
  };
}
