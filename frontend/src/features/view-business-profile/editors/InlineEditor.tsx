import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CheckIcon, CloseIcon } from "../../../components/icons";
import { useToast } from "../../../components/Toast";
import { useProfile } from "../../../context/ProfileContext";
import type { ProfileSection } from "../../../domain/profileSchema";
import { messages } from "../../../i18n/messages";
import styles from "../../../styles/globals.module.css";

type InlineEditorProps = {
  onClose: () => void;
  section: ProfileSection & { content: string };
};

const inlineEditorSchema = z.object({
  content: z.string().trim().min(1, messages.editor.contentRequired),
});

type InlineEditorValues = z.infer<typeof inlineEditorSchema>;

export function InlineEditor({ onClose, section }: InlineEditorProps) {
  const { actions } = useProfile();
  const { showToast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<InlineEditorValues>({
    defaultValues: { content: section.content },
    resolver: zodResolver(inlineEditorSchema),
  });

  useEffect(() => {
    actions.startDraft(section.id);
    setFocus("content");
  }, [actions, section.id, setFocus]);

  const handleCancel = () => {
    actions.cancelDraft(section.id);
    onClose();
  };

  const handleSave = (values: InlineEditorValues) => {
    actions.updateDraft(section.id, values.content);
    actions.setPreview(true);
    showToast({
      message: messages.preview.draftUpdated(section.title),
      tone: "success",
    });
    onClose();
  };

  return (
    <form className={styles.editorForm} onSubmit={handleSubmit(handleSave)}>
      <label className={styles.fieldLabel} htmlFor={`${section.id}-inline-content`}>
        {messages.editor.content}
      </label>
      <textarea
        aria-invalid={errors.content ? "true" : "false"}
        className={styles.textArea}
        id={`${section.id}-inline-content`}
        rows={8}
        {...register("content")}
      />
      {errors.content ? (
        <p className={styles.fieldError} role="alert">
          {errors.content.message}
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
  );
}
