import { MoonIcon, SunIcon } from "../../components/icons";
import { useDisplayMode } from "../../context/DisplayModeContext";
import { messages } from "../../i18n/messages";
import styles from "../../styles/globals.module.css";

export function NightModeToggle() {
  const { isNightMode, toggleMode } = useDisplayMode();
  const label = isNightMode
    ? messages.displayMode.nightMode
    : messages.displayMode.dayMode;
  const actionLabel = isNightMode
    ? messages.displayMode.switchToDayMode
    : messages.displayMode.switchToNightMode;
  const Icon = isNightMode ? MoonIcon : SunIcon;

  return (
    <button
      aria-label={actionLabel}
      aria-pressed={isNightMode}
      className={[styles.secondaryButton, styles.modeToggle]
        .filter(Boolean)
        .join(" ")}
      onClick={toggleMode}
      type="button"
    >
      <Icon className={styles.iconSmall} />
      <span>{label}</span>
    </button>
  );
}
