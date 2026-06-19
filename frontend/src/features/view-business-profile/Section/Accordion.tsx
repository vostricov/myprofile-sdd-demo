import { useEffect, type ReactNode } from "react";

import { useProfile } from "../../../context/ProfileContext";
import styles from "../../../styles/globals.module.css";
import { SectionHeader } from "./SectionHeader";

type AccordionProps = {
  canEdit: boolean;
  children: ReactNode;
  editDisabled?: boolean;
  headingId: string;
  onEdit?: () => void;
  sectionId: string;
  title: string;
};

export function Accordion({
  canEdit,
  children,
  editDisabled = false,
  headingId,
  onEdit,
  sectionId,
  title,
}: AccordionProps) {
  const {
    actions,
    state: { expandedSectionIds },
  } = useProfile();
  const contentId = `${sectionId}-content`;
  const isExpanded = expandedSectionIds.includes(sectionId);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromFragment = () => {
      if (getCurrentFragment() === sectionId) {
        actions.setSectionExpanded(sectionId, true);
      }
    };

    syncFromFragment();
    window.addEventListener("hashchange", syncFromFragment);

    return () => window.removeEventListener("hashchange", syncFromFragment);
  }, [actions, sectionId]);

  const handleToggle = () => {
    const shouldExpand = !isExpanded;

    actions.setSectionExpanded(sectionId, shouldExpand);
    syncFragment(sectionId, shouldExpand);
  };

  const panelClassName = [
    styles.accordionPanel,
    isExpanded ? styles.accordionPanelExpanded : styles.accordionPanelCollapsed,
  ].join(" ");

  return (
    <>
      <SectionHeader
        canEdit={canEdit}
        contentId={contentId}
        editDisabled={editDisabled}
        headingId={headingId}
        isExpanded={isExpanded}
        onEdit={onEdit}
        onToggle={handleToggle}
        title={title}
      />
      <div
        aria-hidden={!isExpanded}
        aria-labelledby={headingId}
        className={panelClassName}
        id={contentId}
        inert={!isExpanded}
        role="region"
      >
        <div className={styles.accordionPanelInner}>{children}</div>
      </div>
    </>
  );
}

function syncFragment(sectionId: string, isExpanded: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  const currentFragment = getCurrentFragment();

  if (!isExpanded && currentFragment !== sectionId) {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.hash = isExpanded ? sectionId : "";

  window.history.replaceState(
    window.history.state,
    "",
    `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
  );
}

function getCurrentFragment(): string {
  const fragment = window.location.hash.slice(1);

  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}
