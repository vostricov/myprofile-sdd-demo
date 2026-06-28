import { MoonIcon, SunIcon } from "../../components/icons";
import { saveDisplayModePreference } from "../../api/localDisplayModePreference";
import { useDisplayMode } from "../../context/DisplayModeContext";
import { messages } from "../../i18n/messages";
import styles from "../../styles/globals.module.css";

export function NightModeToggle() {
  const { isNightMode, source, toggleMode } = useDisplayMode();
  const label = isNightMode
    ? messages.displayMode.nightMode
    : messages.displayMode.dayMode;
  const actionLabel = isNightMode
    ? messages.displayMode.switchToDayMode
    : messages.displayMode.switchToNightMode;
  const Icon = isNightMode ? MoonIcon : SunIcon;
  const handleToggle = () => {
    const nextMode = isNightMode ? "day" : "night";
    const saveResult = saveDisplayModePreference(nextMode);

    toggleMode({
      canPersist: saveResult.canPersist,
      source: saveResult.canPersist ? "saved" : source,
    });
  };

  return (
    <button
      aria-label={actionLabel}
      aria-pressed={isNightMode}
      className={[styles.secondaryButton, styles.modeToggle]
        .filter(Boolean)
        .join(" ")}
      onClick={handleToggle}
      type="button"
    >
      <Icon className={styles.iconSmall} />
      <span>{label}</span>
    </button>
  );
}
