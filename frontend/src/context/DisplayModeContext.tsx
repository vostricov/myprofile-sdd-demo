import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loadDisplayModePreference } from "../api/localDisplayModePreference";

export type DisplayMode = "day" | "night";
export type DisplayModeSource = "saved" | "device" | "default";

export type DisplayModeContextValue = {
  canPersist: boolean;
  isNightMode: boolean;
  mode: DisplayMode;
  source: DisplayModeSource;
  toggleMode: (options?: ToggleModeOptions) => void;
};

export type ToggleModeOptions = {
  canPersist?: boolean;
  source?: DisplayModeSource;
};

type DisplayModeProviderProps = {
  canPersist?: boolean;
  children: ReactNode;
  initialMode?: DisplayMode;
  initialSource?: DisplayModeSource;
};

type ResolvedDisplayMode = {
  canPersist: boolean;
  mode: DisplayMode;
  source: DisplayModeSource;
};

const DisplayModeContext = createContext<DisplayModeContextValue | undefined>(
  undefined,
);

export function DisplayModeProvider({
  canPersist = false,
  children,
  initialMode,
  initialSource = "default",
}: DisplayModeProviderProps) {
  const [preference, setPreference] = useState<ResolvedDisplayMode>(() =>
    resolveInitialDisplayMode({
      canPersist,
      initialMode,
      initialSource,
    }),
  );
  const toggleMode = useCallback((options?: ToggleModeOptions) => {
    setPreference((currentPreference) => ({
      canPersist: options?.canPersist ?? currentPreference.canPersist,
      mode: currentPreference.mode === "night" ? "day" : "night",
      source: options?.source ?? currentPreference.source,
    }));
  }, []);

  useLayoutEffect(() => {
    const rootElement = document.documentElement;

    rootElement.dataset.displayMode = preference.mode;
    rootElement.style.colorScheme = preference.mode === "night" ? "dark" : "light";

    return () => {
      delete rootElement.dataset.displayMode;
      rootElement.style.colorScheme = "";
    };
  }, [preference.mode]);

  const value = useMemo<DisplayModeContextValue>(
    () => ({
      canPersist: preference.canPersist,
      isNightMode: preference.mode === "night",
      mode: preference.mode,
      source: preference.source,
      toggleMode,
    }),
    [preference, toggleMode],
  );

  return (
    <DisplayModeContext.Provider value={value}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode(): DisplayModeContextValue {
  const context = useContext(DisplayModeContext);

  if (!context) {
    throw new Error("useDisplayMode must be used within a DisplayModeProvider.");
  }

  return context;
}

function resolveInitialDisplayMode({
  canPersist,
  initialMode,
  initialSource,
}: Pick<
  DisplayModeProviderProps,
  "canPersist" | "initialMode" | "initialSource"
>): ResolvedDisplayMode {
  if (initialMode) {
    return {
      canPersist: canPersist ?? false,
      mode: initialMode,
      source: initialSource ?? "default",
    };
  }

  const savedPreference = loadDisplayModePreference();

  if (savedPreference.mode) {
    return {
      canPersist: savedPreference.canPersist,
      mode: savedPreference.mode,
      source: "saved",
    };
  }

  const deviceMode = resolveDeviceDisplayMode();

  if (deviceMode) {
    return {
      canPersist: savedPreference.canPersist,
      mode: deviceMode,
      source: "device",
    };
  }

  return {
    canPersist: savedPreference.canPersist,
    mode: "day",
    source: "default",
  };
}

function resolveDeviceDisplayMode(): DisplayMode | null {
  if (typeof window === "undefined" || !window.matchMedia) {
    return null;
  }

  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "night";
    }

    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "day";
    }
  } catch {
    return null;
  }

  return null;
}
