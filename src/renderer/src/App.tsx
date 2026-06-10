import { useEffect } from "react";
import { Toaster } from "sonner";
import { MainLayout } from "./components/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { BrowserProfiles } from "./pages/BrowserProfiles";
import { ProfileGroups } from "./pages/ProfileGroups";
import { ProxyManagement } from "./pages/ProxyManagement";
import { Extensions } from "./pages/Extensions";
import { Settings } from "./pages/Settings";
import { useUIStore } from "./store/useUIStore";
import { useProfileStore } from "./store/useProfileStore";
import { useToastStore } from "./store/useToastStore";
import type { BrowserEvent, Profile } from "@shared/types";

function App() {
  const activeView = useUIStore((s) => s.activeView);
  const addToast = useToastStore((s) => s.addToast);
  const setProfiles = useProfileStore((s) => s.setProfiles);
  const setProfileRunning = useProfileStore((s) => s.setProfileRunning);
  const setProfileStopped = useProfileStore((s) => s.setProfileStopped);

  // Load initial data
  useEffect(() => {
    window.api.profileList().then((res) => {
      if (res.success && res.data) setProfiles(res.data as Profile[]);
    });
  }, []);

  // Listen for browser events from main process
  useEffect(() => {
    const cleanup = window.api.onBrowserEvent((event: BrowserEvent) => {
      if (event.type === "profile:started") {
        setProfileRunning(event.profileId);
        addToast(`Đã chạy profile ${event.profileId.slice(0, 8)}...`, "success");
      } else if (event.type === "profile:stopped") {
        setProfileStopped(event.profileId);
        addToast(`Đã dừng profile ${event.profileId.slice(0, 8)}...`, "info");
      }
    });
    return cleanup;
  }, []);

  const renderPage = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onNavigate={() => useUIStore.getState().setActiveView("profiles")} />;
      case "profiles":
        return <BrowserProfiles />;
      case "groups":
        return <ProfileGroups />;
      case "proxies":
        return <ProxyManagement />;
      case "extensions":
        return <Extensions />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard onNavigate={() => useUIStore.getState().setActiveView("profiles")} />;
    }
  };

  return (
    <MainLayout>
      {renderPage()}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1C2130",
            border: "1px solid #242B38",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
          },
        }}
      />
    </MainLayout>
  );
}

export default App;
