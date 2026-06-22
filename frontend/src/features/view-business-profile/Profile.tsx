import { useProfile, type ViewerRole } from "../../context/ProfileContext";
import { messages } from "../../i18n/messages";
import styles from "../../styles/globals.module.css";
import { PreviewToggle } from "./PreviewToggle";
import { Section } from "./Section/Section";

export function Profile() {
  const { actions, visibleProfile, currentViewerRole, hasDrafts } = useProfile();

  return (
    <main className={styles.appShell}>
      <div className={styles.page}>
        <header className={styles.profileHeader}>
          <p className={styles.eyebrow}>{messages.profile.businessProfile}</p>
          <h1 className={styles.title}>{visibleProfile.title}</h1>
        </header>

        <PreviewToggle />

        <section className={styles.profileLayout} aria-label={visibleProfile.title}>
          <div className={styles.primaryColumn}>
            <div className={styles.sectionStack}>
              {visibleProfile.sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}
            </div>
          </div>

          <aside className={styles.secondaryColumn} aria-label={messages.profile.detailsLabel}>
            <dl className={styles.mutedPanel}>
              <div className={styles.metaRow}>
                <dt>{messages.profile.profileId}</dt>
                <dd>{visibleProfile.profileId}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>{messages.profile.viewerRole}</dt>
                <dd>
                  <select
                    aria-label={messages.profile.viewerRole}
                    className={styles.roleSelect}
                    onChange={(event) =>
                      actions.setViewerRole(event.target.value as ViewerRole)
                    }
                    value={currentViewerRole}
                  >
                    <option value="visitor">{messages.roles.visitor}</option>
                    <option value="owner">{messages.roles.owner}</option>
                    <option value="editor">{messages.roles.editor}</option>
                  </select>
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt>{messages.profile.sections}</dt>
                <dd>{visibleProfile.sections.length}</dd>
              </div>
              {hasDrafts ? (
                <div className={styles.metaRow}>
                  <dt>{messages.profile.status}</dt>
                  <dd>{messages.profile.draftChanges}</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
