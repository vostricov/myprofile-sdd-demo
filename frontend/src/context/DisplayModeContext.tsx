import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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
  const toggleMode = useCallback(() => {
    // State changes are implemented with the user-story tasks.
  }, []);

  const value = useMemo<DisplayModeContextValue>(
    () => ({
      canPersist,
      isNightMode: initialMode === "night",
      mode: initialMode,
      source: initialSource,
      toggleMode,
    }),
    [canPersist, initialMode, initialSource, toggleMode],
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
