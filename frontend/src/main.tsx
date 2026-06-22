import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/animations.css";
import { ToastProvider } from "./components/Toast";
import { ProfileProvider } from "./context/ProfileContext";
import { Profile } from "./features/view-business-profile/Profile";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <ProfileProvider>
        <Profile />
      </ProfileProvider>
    </ToastProvider>
  </StrictMode>,
);
