import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DisplayMode = "day" | "night";
export type DisplayModeSource = "saved" | "device" | "default";

export type DisplayModeContextValue = {
  canPersist: boolean;
  isNightMode: boolean;
  mode: DisplayMode;
  source: DisplayModeSource;
  toggleMode: () => void;
};

type DisplayModeProviderProps = {
  canPersist?: boolean;
  children: ReactNode;
  initialMode?: DisplayMode;
  initialSource?: DisplayModeSource;
};

const DisplayModeContext = createContext<DisplayModeContextValue | undefined>(
  undefined,
);

export function DisplayModeProvider({
  canPersist = false,
  children,
  initialMode = "day",
  initialSource = "default",
}: DisplayModeProviderProps) {
  const [mode, setMode] = useState<DisplayMode>(initialMode);
  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === "night" ? "day" : "night"));
  }, []);

  useEffect(() => {
    const rootElement = document.documentElement;

    rootElement.dataset.displayMode = mode;
    rootElement.style.colorScheme = mode === "night" ? "dark" : "light";

    return () => {
      delete rootElement.dataset.displayMode;
      rootElement.style.colorScheme = "";
    };
  }, [mode]);

  const value = useMemo<DisplayModeContextValue>(
    () => ({
      canPersist,
      isNightMode: mode === "night",
      mode,
      source: initialSource,
      toggleMode,
    }),
    [canPersist, initialSource, mode, toggleMode],
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
