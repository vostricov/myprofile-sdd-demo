import styles from "../../../styles/globals.module.css";

type SectionHeaderProps = {
  headingId: string;
  title: string;
};

export function SectionHeader({ headingId, title }: SectionHeaderProps) {
  return (
    <header className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle} id={headingId}>
        {title}
      </h2>
      <button
        aria-label={`Edit ${title}`}
        className={styles.editPlaceholder}
        disabled
        type="button"
      >
        Edit
      </button>
    </header>
  );
}
