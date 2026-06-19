import type {
  JsonValue,
  ProfileSection,
  ProfileSectionContent,
} from "../../../domain/profileSchema";
import styles from "../../../styles/globals.module.css";
import { SectionHeader } from "./SectionHeader";

type SectionProps = {
  section: ProfileSection;
};

type JsonObject = { [key: string]: JsonValue };

export function Section({ section }: SectionProps) {
  const headingId = `${section.id}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className={styles.sectionCard}
      id={section.id}
    >
      <SectionHeader headingId={headingId} title={section.title} />
      <div className={styles.sectionBody}>{renderContent(section.content)}</div>
      <footer className={styles.sectionFooter}>
        <span>Last updated {formatDateTime(section.lastUpdated)}</span>
        {section.lastEditedByUserId ? (
          <span>Edited by {section.lastEditedByUserId}</span>
        ) : null}
      </footer>
    </article>
  );
}

function renderContent(content: ProfileSectionContent) {
  if (typeof content === "string") {
    return <p>{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className={styles.contentList}>
        {content.map((item, index) => (
          <li key={index}>{renderListItem(item)}</li>
        ))}
      </ul>
    );
  }

  return renderObject(content);
}

function renderValue(key: string, value: JsonValue) {
  if (Array.isArray(value)) {
    return (
      <ul className={styles.contentList}>
        {value.map((item, index) => (
          <li key={`${key}-${index}`}>{renderListItem(item)}</li>
        ))}
      </ul>
    );
  }

  if (isObject(value)) {
    return renderObject(value);
  }

  if (typeof value === "string" && isUrl(value)) {
    return (
      <a className={styles.contentLink} href={value}>
        {value}
      </a>
    );
  }

  return <span>{String(value)}</span>;
}

function renderListItem(value: JsonValue) {
  if (isObject(value)) {
    return renderObject(value);
  }

  if (Array.isArray(value)) {
    return (
      <ul className={styles.contentList}>
        {value.map((item, index) => (
          <li key={index}>{renderListItem(item)}</li>
        ))}
      </ul>
    );
  }

  return <span>{String(value)}</span>;
}

function renderObject(value: JsonObject) {
  return (
    <dl className={styles.contentGrid}>
      {Object.entries(value).map(([key, entry]) => (
        <div className={styles.contentRow} key={key}>
          <dt>{formatLabel(key)}</dt>
          <dd>{renderValue(key, entry)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUrl(value: string): boolean {
  return value.startsWith("https://") || value.startsWith("http://");
}
