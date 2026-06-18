import { z } from "zod";

import profileFixture from "../fixtures/initial-input/profile.json";

const editableRoleSchema = z.enum(["owner", "editor"]);

const isoUtcTimestampSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/,
    "Expected an ISO 8601 UTC timestamp",
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Expected a valid timestamp",
  });

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s().-]{6,24}$/, "Expected a valid phone number")
  .refine((value) => value.replace(/\D/g, "").length >= 7, {
    message: "Expected a phone number with at least 7 digits",
  });

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const structuredContentSchema = z.record(z.string(), jsonValueSchema).superRefine((content, context) => {
  if ("email" in content && content.email !== undefined) {
    const result = z.email().safeParse(content.email);

    if (!result.success) {
      context.addIssue({
        code: "custom",
        message: "Expected a valid contact email",
        path: ["email"],
      });
    }
  }

  if ("phone" in content && content.phone !== undefined) {
    const result = phoneSchema.safeParse(content.phone);

    if (!result.success) {
      context.addIssue({
        code: "custom",
        message: "Expected a valid contact phone",
        path: ["phone"],
      });
    }
  }
});

export const sectionContentSchema = z.union([z.string().min(1), structuredContentSchema]);

export const profileSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: sectionContentSchema,
  lastUpdated: isoUtcTimestampSchema,
  lastEditedByUserId: z.string().min(1).optional(),
  editableBy: z.array(editableRoleSchema).min(1).refine((roles) => new Set(roles).size === roles.length, {
    message: "editableBy roles must be unique",
  }),
});

export const profileSchema = z.object({
  profileId: z.string().min(1),
  title: z.string().min(1),
  sections: z.array(profileSectionSchema).min(1),
});

export type EditableRole = z.infer<typeof editableRoleSchema>;
export type ProfileSectionContent = z.infer<typeof sectionContentSchema>;
export type ProfileSection = z.infer<typeof profileSectionSchema>;
export type Profile = z.infer<typeof profileSchema>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function validateProfile(profile: unknown): Profile {
  return profileSchema.parse(profile);
}

export const initialProfile = validateProfile(profileFixture);
