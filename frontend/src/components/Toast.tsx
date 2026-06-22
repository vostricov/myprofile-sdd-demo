import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { CloseIcon } from "./icons";
import { messages } from "../i18n/messages";
import styles from "../styles/globals.module.css";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  actionLabel?: string;
  durationMs?: number;
  message: string;
  onAction?: () => void;
  tone?: ToastTone;
};

type ToastItem = Required<Pick<ToastInput, "message" | "tone">> &
  Pick<ToastInput, "actionLabel" | "durationMs" | "onAction"> & {
    id: string;
  };

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (toast: ToastInput) => string;
};

type ToastProviderProps = {
  children: ReactNode;
};

const DEFAULT_TOAST_DURATION_MS = 5000;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        message: toast.message,
        tone: toast.tone ?? "info",
        actionLabel: toast.actionLabel,
        durationMs: toast.durationMs ?? DEFAULT_TOAST_DURATION_MS,
        onAction: toast.onAction,
      },
    ]);

    return id;
  }, []);

  const value = useMemo(
    () => ({ dismissToast, showToast }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport dismissToast={dismissToast} toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

type ToastViewportProps = {
  dismissToast: (id: string) => void;
  toasts: ToastItem[];
};

function ToastViewport({ dismissToast, toasts }: ToastViewportProps) {
  return (
    <div
      aria-label={messages.toast.notifications}
      aria-live="polite"
      className={styles.toastViewport}
      role="status"
    >
      {toasts.map((toast) => (
        <ToastCard
          dismissToast={dismissToast}
          key={toast.id}
          toast={toast}
        />
      ))}
    </div>
  );
}

type ToastCardProps = {
  dismissToast: (id: string) => void;
  toast: ToastItem;
};

function ToastCard({ dismissToast, toast }: ToastCardProps) {
  useEffect(() => {
    if (toast.durationMs === 0) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => dismissToast(toast.id),
      toast.durationMs,
    );

    return () => window.clearTimeout(timeoutId);
  }, [dismissToast, toast.durationMs, toast.id]);

  const handleAction = () => {
    toast.onAction?.();
    dismissToast(toast.id);
  };

  return (
    <div className={`${styles.toast} ${styles[`toast${capitalize(toast.tone)}`]}`}>
      <p className={styles.toastMessage}>{toast.message}</p>
      {toast.actionLabel && toast.onAction ? (
        <button className={styles.toastAction} onClick={handleAction} type="button">
          {toast.actionLabel}
        </button>
      ) : null}
      <button
        aria-label={messages.toast.dismiss}
        className={styles.toastDismiss}
        onClick={() => dismissToast(toast.id)}
        type="button"
      >
        <CloseIcon className={styles.iconSmall} />
      </button>
    </div>
  );
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
