import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/animations.css";
import "./styles/direction.css";
import { ToastProvider } from "./components/Toast";
import { ProfileProvider } from "./context/ProfileContext";
import { Profile } from "./features/view-business-profile/Profile";
import { EngineeringDashboard } from "./features/repo-dashboard/EngineeringDashboard";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

const requestedDirection = new URLSearchParams(window.location.search).get("dir");
const requestedView = new URLSearchParams(window.location.search).get("view");
const showEngineeringDashboard =
  requestedView === "engineering-dashboard" ||
  window.location.pathname === "/engineering-dashboard";

if (requestedDirection === "rtl" || requestedDirection === "ltr") {
  document.documentElement.dir = requestedDirection;
}

createRoot(rootElement).render(
  <StrictMode>
    {showEngineeringDashboard ? (
      <EngineeringDashboard />
    ) : (
      <ToastProvider>
        <ProfileProvider>
          <Profile />
        </ProfileProvider>
      </ToastProvider>
    )}
  </StrictMode>,
);
