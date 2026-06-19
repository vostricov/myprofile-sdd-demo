import type { EditableRole, ProfileSection } from "./profileSchema";

export type ViewerRole = EditableRole | "visitor";

export function canEditSection(
  section: Pick<ProfileSection, "editableBy">,
  viewerRole: ViewerRole,
): boolean {
  return isEditableRole(viewerRole) && section.editableBy.includes(viewerRole);
}

export function isEditableRole(viewerRole: ViewerRole): viewerRole is EditableRole {
  return viewerRole !== "visitor";
}
