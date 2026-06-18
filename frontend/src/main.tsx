import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import styles from "./styles/globals.module.css";

function App() {
  return (
    <main className={styles.appShell}>
      <div className={styles.page}>
        <header className={styles.profileHeader}>
          <p className={styles.eyebrow}>Business profile</p>
          <h1 className={styles.title}>Responsive profile layout baseline</h1>
          <p className={styles.lede}>
            Design tokens and CSS Module primitives are ready for profile
            sections, editors, and responsive composition.
          </p>
        </header>

        <section className={styles.profileLayout} aria-label="Profile layout">
          <div className={styles.primaryColumn}>
            <article className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Primary section column</h2>
              </div>
              <p className={styles.sectionBody}>
                Profile sections stack in one column on mobile and reserve the
                main content column on wider screens.
              </p>
            </article>
          </div>

          <aside className={styles.secondaryColumn} aria-label="Profile details">
            <div className={styles.mutedPanel}>
              Supporting details move into a second column on desktop.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
