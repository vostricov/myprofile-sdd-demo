import type {
  EditableRole,
  JsonValue,
  Profile,
  ProfileSection,
  ProfileSectionContent,
} from "./profileSchema";

const ISO_UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{6,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertProfile(profile: unknown): Profile {
  if (!isProfile(profile)) {
    throw new Error("Invalid profile data.");
  }

  return profile;
}

export function assertProfileSectionContent(
  content: unknown,
): ProfileSectionContent {
  if (!isProfileSectionContent(content)) {
    throw new Error("Invalid profile section content.");
  }

  return content;
}

function isProfile(profile: unknown): profile is Profile {
  if (!isRecord(profile)) {
    return false;
  }

  return (
    isNonEmptyString(profile.profileId) &&
    isNonEmptyString(profile.title) &&
    isOptionalNonEmptyString(profile.sourceDocument) &&
    isOptionalUtcTimestamp(profile.lastUpdated) &&
    Array.isArray(profile.sections) &&
    profile.sections.length > 0 &&
    profile.sections.every(isProfileSection)
  );
}

function isProfileSection(section: unknown): section is ProfileSection {
  if (!isRecord(section)) {
    return false;
  }

  return (
    isNonEmptyString(section.id) &&
    isNonEmptyString(section.title) &&
    isProfileSectionContent(section.content) &&
    isUtcTimestamp(section.lastUpdated) &&
    isOptionalNonEmptyString(section.lastEditedByUserId) &&
    isEditableRoleList(section.editableBy)
  );
}

function isProfileSectionContent(
  content: unknown,
): content is ProfileSectionContent {
  if (typeof content === "string") {
    return content.length > 0;
  }

  if (Array.isArray(content)) {
    return content.length > 0 && content.every(isJsonValue);
  }

  return isStructuredContent(content);
}

function isStructuredContent(content: unknown): content is Record<string, JsonValue> {
  if (!isRecord(content) || !Object.values(content).every(isJsonValue)) {
    return false;
  }

  if ("email" in content && !isValidEmail(content.email)) {
    return false;
  }

  if ("phone" in content && !isValidPhone(content.phone)) {
    return false;
  }

  return true;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isEditableRoleList(value: unknown): value is EditableRole[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  const roles = value.filter(isEditableRole);
  return roles.length === value.length && new Set(roles).size === roles.length;
}

function isEditableRole(value: unknown): value is EditableRole {
  return value === "owner" || value === "editor";
}

function isOptionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isOptionalUtcTimestamp(value: unknown): value is string | undefined {
  return value === undefined || isUtcTimestamp(value);
}

function isUtcTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ISO_UTC_TIMESTAMP_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value);
}

function isValidPhone(value: unknown): value is string {
  return (
    typeof value === "string" &&
    PHONE_PATTERN.test(value.trim()) &&
    value.replace(/\D/g, "").length >= 7
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
