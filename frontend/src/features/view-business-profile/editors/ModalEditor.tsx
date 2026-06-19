import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CheckIcon, CloseIcon } from "../../../components/icons";
import { useProfile } from "../../../context/ProfileContext";
import {
  sectionContentSchema,
  type ProfileSection,
  type ProfileSectionContent,
} from "../../../domain/profileSchema";
import styles from "../../../styles/globals.module.css";

type ModalEditorProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  section: ProfileSection;
};

const modalEditorSchema = z.object({
  contentJson: z.string().trim().min(1, "Content is required.").superRefine((value, context) => {
    const parsedContent = parseJson(value);

    if (!parsedContent.success) {
      context.addIssue({
        code: "custom",
        message: "Content must be valid JSON.",
      });
      return;
    }

    const result = sectionContentSchema.safeParse(parsedContent.data);

    if (!result.success) {
      context.addIssue({
        code: "custom",
        message: "Content does not match the profile section schema.",
      });
    }
  }),
});

type ModalEditorValues = z.infer<typeof modalEditorSchema>;

export function ModalEditor({ onOpenChange, open, section }: ModalEditorProps) {
  const { actions, currentViewerRole } = useProfile();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ModalEditorValues>({
    defaultValues: { contentJson: stringifyContent(section.content) },
    resolver: zodResolver(modalEditorSchema),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    actions.startDraft(section.id);
    reset({ contentJson: stringifyContent(section.content) });
  }, [actions, open, reset, section.content, section.id]);

  const handleCancel = () => {
    actions.cancelDraft(section.id);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      actions.cancelDraft(section.id);
    }

    onOpenChange(nextOpen);
  };

  const handleSave = (values: ModalEditorValues) => {
    const content = parseSectionContent(values.contentJson);

    actions.updateDraft(section.id, content);
    actions.saveDraft(section.id, {
      lastEditedByUserId: currentViewerRole,
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <Dialog.Title className={styles.dialogTitle}>
              Edit {section.title}
            </Dialog.Title>
            <button
              aria-label={`Close ${section.title} editor`}
              className={styles.dialogCloseButton}
              onClick={handleCancel}
              type="button"
            >
              <CloseIcon className={styles.iconSmall} />
            </button>
          </div>
          <form className={styles.editorForm} onSubmit={handleSubmit(handleSave)}>
            <label
              className={styles.fieldLabel}
              htmlFor={`${section.id}-modal-content`}
            >
              Content JSON
            </label>
            <textarea
              aria-invalid={errors.contentJson ? "true" : "false"}
              className={styles.jsonTextArea}
              id={`${section.id}-modal-content`}
              rows={16}
              {...register("contentJson")}
            />
            {errors.contentJson ? (
              <p className={styles.fieldError} role="alert">
                {errors.contentJson.message}
              </p>
            ) : null}
            <div className={styles.formActions}>
              <button
                className={styles.secondaryButton}
                onClick={handleCancel}
                type="button"
              >
                <CloseIcon className={styles.iconSmall} />
                <span>Cancel</span>
              </button>
              <button
                className={styles.primaryButton}
                disabled={isSubmitting}
                type="submit"
              >
                <CheckIcon className={styles.iconSmall} />
                <span>Save</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function stringifyContent(content: ProfileSectionContent): string {
  return JSON.stringify(content, null, 2);
}

function parseSectionContent(value: string): ProfileSectionContent {
  return sectionContentSchema.parse(JSON.parse(value));
}

function parseJson(value: string): { success: true; data: unknown } | { success: false } {
  try {
    return { success: true, data: JSON.parse(value) };
  } catch {
    return { success: false };
  }
}
