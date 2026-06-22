import { useState } from "react";

import { useProfile } from "../../../context/ProfileContext";
import type {
  JsonValue,
  ProfileSection,
  ProfileSectionContent,
} from "../../../domain/profileSchema";
import { canEditSection } from "../../../domain/permissions";
import { formatDateTime } from "../../../i18n/format";
import { messages } from "../../../i18n/messages";
import styles from "../../../styles/globals.module.css";
import { InlineEditor } from "../editors/InlineEditor";
import { ModalEditor } from "../editors/ModalEditor";
import { Accordion } from "./Accordion";

type SectionProps = {
  section: ProfileSection;
};

type JsonObject = { [key: string]: JsonValue };

export function Section({ section }: SectionProps) {
  const { currentViewerRole } = useProfile();
  const [editingMode, setEditingMode] = useState<"inline" | "modal" | null>(null);
  const headingId = `${section.id}-heading`;
  const canEdit = canEditSection(section, currentViewerRole);
  const canInlineEdit = canEdit && typeof section.content === "string";
  const canStructuredEdit = canEdit && typeof section.content !== "string";
  const canOpenEditor = canInlineEdit || canStructuredEdit;
  const handleEdit = () => {
    setEditingMode(canInlineEdit ? "inline" : "modal");
  };

  return (
    <article
      aria-labelledby={headingId}
      className={styles.sectionCard}
      id={section.id}
    >
      <Accordion
        canEdit={canEdit}
        editDisabled={!canOpenEditor}
        headingId={headingId}
        onEdit={canOpenEditor ? handleEdit : undefined}
        sectionId={section.id}
        title={section.title}
      >
        <div className={styles.sectionBody}>
          {editingMode === "inline" && typeof section.content === "string" ? (
            <InlineEditor
              onClose={() => setEditingMode(null)}
              section={{ ...section, content: section.content }}
            />
          ) : (
            renderContent(section.content)
          )}
        </div>
        <footer className={styles.sectionFooter}>
          <span>{messages.section.lastUpdated(formatDateTime(section.lastUpdated))}</span>
          {section.lastEditedByUserId ? (
            <span>{messages.section.editedBy(section.lastEditedByUserId)}</span>
          ) : null}
        </footer>
      </Accordion>
      {editingMode === "modal" ? (
        <ModalEditor
          onOpenChange={(open) => setEditingMode(open ? "modal" : null)}
          open={editingMode === "modal"}
          section={section}
        />
      ) : null}
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
