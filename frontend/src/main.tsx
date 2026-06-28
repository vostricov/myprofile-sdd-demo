import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/animations.css";
import "./styles/direction.css";
import { ToastProvider } from "./components/Toast";
import { DisplayModeProvider } from "./context/DisplayModeContext";
import { ProfileProvider } from "./context/ProfileContext";
import { Profile } from "./features/view-business-profile/Profile";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

const requestedDirection = new URLSearchParams(window.location.search).get("dir");

if (requestedDirection === "rtl" || requestedDirection === "ltr") {
  document.documentElement.dir = requestedDirection;
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <ProfileProvider>
        <DisplayModeProvider>
          <Profile />
        </DisplayModeProvider>
      </ProfileProvider>
    </ToastProvider>
  </StrictMode>,
);
