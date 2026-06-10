import { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { BrowserProfiles } from "./components/BrowserProfiles";
import { ProfileGroups } from "./components/ProfileGroups";
import { ProxyManagement } from "./components/ProxyManagement";
import { Extensions } from "./components/Extensions";
import { Settings } from "./components/Settings";

type Page =
  | "dashboard"
  | "profiles"
  | "groups"
  | "proxies"
  | "extensions"
  | "settings";

export default function App() {
  const [activePage, setActivePage] =
    useState<Page>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard onNavigate={(p) => setActivePage(p)} />
        );
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
    }
  };

  return (
    /* MARKER-MAKE-KIT-INVOKED MARKER-MAKE-KIT-DISCOVERY-READ */
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "Inter, sans-serif",
      }}
    >
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
      {/* Fixed left sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: "var(--background)" }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  );
}