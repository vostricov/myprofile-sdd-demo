import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CheckIcon, CloseIcon } from "../../../components/icons";
import { useToast } from "../../../components/Toast";
import { useProfile } from "../../../context/ProfileContext";
import {
  sectionContentSchema,
  type ProfileSection,
  type ProfileSectionContent,
} from "../../../domain/profileSchema";
import { messages } from "../../../i18n/messages";
import styles from "../../../styles/globals.module.css";
import { NightModeToggle } from "../NightModeToggle";

type ModalEditorProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  section: ProfileSection;
};

const modalEditorSchema = z.object({
  contentJson: z.string().trim().min(1, messages.editor.contentRequired).superRefine((value, context) => {
    const parsedContent = parseJson(value);

    if (!parsedContent.success) {
      context.addIssue({
        code: "custom",
        message: messages.editor.invalidJson,
      });
      return;
    }

    const result = sectionContentSchema.safeParse(parsedContent.data);

    if (!result.success) {
      context.addIssue({
        code: "custom",
        message: messages.editor.invalidSectionContent,
      });
    }
  }),
});

type ModalEditorValues = z.infer<typeof modalEditorSchema>;

export function ModalEditor({ onOpenChange, open, section }: ModalEditorProps) {
  const { actions } = useProfile();
  const { showToast } = useToast();
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
    actions.setPreview(true);
    showToast({
      message: messages.preview.draftUpdated(section.title),
      tone: "success",
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
              {messages.editor.editTitle(section.title)}
            </Dialog.Title>
            <div className={styles.dialogHeaderActions}>
              <NightModeToggle />
              <button
                aria-label={messages.editor.closeEditor(section.title)}
                className={styles.dialogCloseButton}
                onClick={handleCancel}
                type="button"
              >
                <CloseIcon className={styles.iconSmall} />
              </button>
            </div>
          </div>
          <form className={styles.editorForm} onSubmit={handleSubmit(handleSave)}>
            <label
              className={styles.fieldLabel}
              htmlFor={`${section.id}-modal-content`}
            >
              {messages.editor.contentJson}
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
                <span>{messages.editor.cancel}</span>
              </button>
              <button
                className={styles.primaryButton}
                disabled={isSubmitting}
                type="submit"
              >
                <CheckIcon className={styles.iconSmall} />
                <span>{messages.editor.save}</span>
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
