import type { KeyboardEvent } from "react";

import { ChevronDownIcon, EditIcon } from "../../../components/icons";
import styles from "../../../styles/globals.module.css";

type SectionHeaderProps = {
  canEdit: boolean;
  contentId: string;
  editDisabled?: boolean;
  headingId: string;
  isExpanded: boolean;
  onEdit?: () => void;
  onToggle: () => void;
  title: string;
};

export function SectionHeader({
  canEdit,
  contentId,
  editDisabled = false,
  headingId,
  isExpanded,
  onEdit,
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
            <ChevronDownIcon className={styles.iconSmall} />
          </span>
        </button>
      </h2>
      {canEdit ? (
        <button
          aria-label={`Edit ${title}`}
          className={styles.editPlaceholder}
          disabled={editDisabled || !onEdit}
          onClick={onEdit}
          type="button"
        >
          <EditIcon className={styles.iconSmall} />
          <span>Edit</span>
        </button>
      ) : null}
    </header>
  );
}
