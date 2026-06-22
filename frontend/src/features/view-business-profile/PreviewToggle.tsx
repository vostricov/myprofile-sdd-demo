import { useEffect, useState } from "react";

import { profileApi } from "../../api/profileApi";
import {
  CloseIcon,
  EyeIcon,
  SaveIcon,
  UndoIcon,
} from "../../components/icons";
import { useToast } from "../../components/Toast";
import {
  applyDraftsToProfile,
  useProfile,
} from "../../context/ProfileContext";
import type { Profile } from "../../domain/profileSchema";
import styles from "../../styles/globals.module.css";

const UNDO_WINDOW_MS = 30_000;

export function PreviewToggle() {
  const { actions, hasDrafts, state } = useProfile();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const draftCount = Object.keys(state.drafts).length;
  const latestUndo = state.undoStack[0];

  useEffect(() => {
    if (!latestUndo) {
      return;
    }

    const elapsedMs = Date.now() - Date.parse(latestUndo.savedAt);
    const remainingMs = UNDO_WINDOW_MS - elapsedMs;

    if (remainingMs <= 0) {
      actions.clearUndoStack();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      actions.clearUndoStack();
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [actions, latestUndo]);

  const undoLastSave = async (profileToRestore?: Profile) => {
    if (!profileToRestore) {
      return;
    }

    try {
      await profileApi.save(profileToRestore);
      actions.undoLastSave();
      showToast({
        message: "Last save undone.",
        tone: "success",
      });
    } catch {
      showToast({
        message: "Last save could not be undone.",
        tone: "error",
      });
    }
  };

  const handlePreviewToggle = () => {
    actions.setPreview(!state.isPreviewing);
  };

  const handleDiscard = () => {
    actions.cancelDraft();
    showToast({
      message: "Draft changes discarded.",
      tone: "info",
    });
  };

  const handleSave = async () => {
    if (!hasDrafts || isSaving) {
      return;
    }

    const savedAt = new Date().toISOString();
    const metadata = {
      lastEditedByUserId: state.currentViewerRole,
      lastUpdated: savedAt,
    };
    const profileToSave = applyDraftsToProfile(
      state.profile,
      state.drafts,
      metadata,
    );

    setIsSaving(true);

    try {
      actions.saveAllDrafts({ ...metadata, now: savedAt });
      await profileApi.save(profileToSave);
      showToast({
        actionLabel: "Undo",
        durationMs: UNDO_WINDOW_MS,
        message: "Profile changes saved.",
        onAction: () => {
          void undoLastSave(state.profile);
        },
        tone: "success",
      });
    } catch {
      actions.undoLastSave();
      showToast({
        message: "Profile changes could not be saved.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.previewToolbar} aria-label="Profile draft controls">
      <div className={styles.previewStatus}>
        <span className={styles.previewStatusLabel}>
          {hasDrafts ? `${draftCount} draft change${draftCount === 1 ? "" : "s"}` : "No draft changes"}
        </span>
        <span className={styles.previewMode}>
          {state.isPreviewing ? "Previewing" : "Saved profile"}
        </span>
      </div>
      <div className={styles.previewActions}>
        <button
          className={styles.secondaryButton}
          disabled={!hasDrafts}
          onClick={handlePreviewToggle}
          type="button"
        >
          <EyeIcon className={styles.iconSmall} />
          <span>{state.isPreviewing ? "Exit preview" : "Preview"}</span>
        </button>
        <button
          className={styles.primaryButton}
          disabled={!hasDrafts || isSaving}
          onClick={handleSave}
          type="button"
        >
          <SaveIcon className={styles.iconSmall} />
          <span>{isSaving ? "Saving" : "Save"}</span>
        </button>
        <button
          className={styles.secondaryButton}
          disabled={!hasDrafts}
          onClick={handleDiscard}
          type="button"
        >
          <CloseIcon className={styles.iconSmall} />
          <span>Discard</span>
        </button>
        <button
          className={styles.secondaryButton}
          disabled={!latestUndo}
          onClick={() => {
            void undoLastSave(latestUndo?.profile);
          }}
          type="button"
        >
          <UndoIcon className={styles.iconSmall} />
          <span>Undo</span>
        </button>
      </div>
    </section>
  );
}
