import { useEffect } from "react";

import {
  CloseIcon,
  EyeIcon,
  SaveIcon,
  UndoIcon,
} from "../../components/icons";
import { useToast } from "../../components/Toast";
import { useProfile } from "../../context/ProfileContext";
import styles from "../../styles/globals.module.css";

const UNDO_WINDOW_MS = 30_000;

export function PreviewToggle() {
  const { actions, hasDrafts, state } = useProfile();
  const { showToast } = useToast();
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

  const undoLastSave = () => {
    actions.undoLastSave();
    showToast({
      message: "Last save undone.",
      tone: "success",
    });
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

  const handleSave = () => {
    try {
      actions.saveAllDrafts({
        lastEditedByUserId: state.currentViewerRole,
      });
      showToast({
        actionLabel: "Undo",
        durationMs: UNDO_WINDOW_MS,
        message: "Profile changes saved.",
        onAction: undoLastSave,
        tone: "success",
      });
    } catch {
      showToast({
        message: "Profile changes could not be saved.",
        tone: "error",
      });
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
          disabled={!hasDrafts}
          onClick={handleSave}
          type="button"
        >
          <SaveIcon className={styles.iconSmall} />
          <span>Save</span>
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
          onClick={undoLastSave}
          type="button"
        >
          <UndoIcon className={styles.iconSmall} />
          <span>Undo</span>
        </button>
      </div>
    </section>
  );
}
