import { useProfile, type ViewerRole } from "../../context/ProfileContext";
import styles from "../../styles/globals.module.css";
import { Section } from "./Section/Section";

export function Profile() {
  const { actions, visibleProfile, currentViewerRole, hasDrafts } = useProfile();

  return (
    <main className={styles.appShell}>
      <div className={styles.page}>
        <header className={styles.profileHeader}>
          <p className={styles.eyebrow}>Business profile</p>
          <h1 className={styles.title}>{visibleProfile.title}</h1>
        </header>

        <section className={styles.profileLayout} aria-label={visibleProfile.title}>
          <div className={styles.primaryColumn}>
            <div className={styles.sectionStack}>
              {visibleProfile.sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}
            </div>
          </div>

          <aside className={styles.secondaryColumn} aria-label="Profile details">
            <dl className={styles.mutedPanel}>
              <div className={styles.metaRow}>
                <dt>Profile ID</dt>
                <dd>{visibleProfile.profileId}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Viewer role</dt>
                <dd>
                  <select
                    aria-label="Viewer role"
                    className={styles.roleSelect}
                    onChange={(event) =>
                      actions.setViewerRole(event.target.value as ViewerRole)
                    }
                    value={currentViewerRole}
                  >
                    <option value="visitor">Visitor</option>
                    <option value="owner">Owner</option>
                    <option value="editor">Editor</option>
                  </select>
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Sections</dt>
                <dd>{visibleProfile.sections.length}</dd>
              </div>
              {hasDrafts ? (
                <div className={styles.metaRow}>
                  <dt>Status</dt>
                  <dd>Draft changes</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}
