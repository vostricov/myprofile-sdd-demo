import type { KeyboardEvent } from "react";

import styles from "../../../styles/globals.module.css";

type SectionHeaderProps = {
  canEdit: boolean;
  contentId: string;
  headingId: string;
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
};

export function SectionHeader({
  canEdit,
  contentId,
  headingId,
  isExpanded,
  onToggle,
  title,
}: SectionHeaderProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onToggle();
  };

  return (
    <header className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle} id={headingId}>
        <button
          aria-controls={contentId}
          aria-expanded={isExpanded}
          className={styles.sectionToggle}
          onKeyDown={handleKeyDown}
          onClick={onToggle}
          type="button"
        >
          <span className={styles.sectionToggleText}>{title}</span>
          <span aria-hidden="true" className={styles.sectionChevron}>
            v
          </span>
        </button>
      </h2>
      {canEdit ? (
        <button
          aria-label={`Edit ${title}`}
          className={styles.editPlaceholder}
          disabled
          type="button"
        >
          Edit
        </button>
      ) : null}
    </header>
  );
}
