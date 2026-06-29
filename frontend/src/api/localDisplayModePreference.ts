import type { DisplayMode } from "../context/DisplayModeContext";

export const DISPLAY_MODE_STORAGE_KEY = "myprofile-sdd-demo.display-mode.v1";

export type LoadedDisplayModePreference = {
  canPersist: boolean;
  mode: DisplayMode | null;
};

export type SavedDisplayModePreference = {
  canPersist: boolean;
  mode: DisplayMode;
};

type StoredDisplayModePreference = {
  mode?: unknown;
};

export function loadDisplayModePreference(): LoadedDisplayModePreference {
  const storage = getLocalStorage();

  if (!storage) {
    return { canPersist: false, mode: null };
  }

  try {
    const rawPreference = storage.getItem(DISPLAY_MODE_STORAGE_KEY);

    if (!rawPreference) {
      return { canPersist: true, mode: null };
    }

    const parsedPreference = JSON.parse(rawPreference) as StoredDisplayModePreference;

    if (isDisplayMode(parsedPreference.mode)) {
      return { canPersist: true, mode: parsedPreference.mode };
    }

    storage.removeItem(DISPLAY_MODE_STORAGE_KEY);
    return { canPersist: true, mode: null };
  } catch {
    return { canPersist: false, mode: null };
  }
}

export function saveDisplayModePreference(
  mode: DisplayMode,
): SavedDisplayModePreference {
  const storage = getLocalStorage();

  if (!storage) {
    return { canPersist: false, mode };
  }

  try {
    storage.setItem(DISPLAY_MODE_STORAGE_KEY, JSON.stringify({ mode }));
    return { canPersist: true, mode };
  } catch {
    return { canPersist: false, mode };
  }
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isDisplayMode(mode: unknown): mode is DisplayMode {
  return mode === "day" || mode === "night";
}
