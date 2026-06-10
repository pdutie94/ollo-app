import {
  LayoutDashboard,
  Globe,
  FolderOpen,
  Shield,
  Puzzle,
  Settings,
  Zap,
} from "lucide-react";

type Page =
  | "dashboard"
  | "profiles"
  | "groups"
  | "proxies"
  | "extensions"
  | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "profiles", icon: Globe, label: "Browser Profiles" },
  { id: "groups", icon: FolderOpen, label: "Profile Groups" },
  { id: "proxies", icon: Shield, label: "Proxies" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 240,
        minWidth: 240,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ height: 56, borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 28,
            height: 28,
            background: "var(--primary)",
          }}
        >
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        <span
          style={{
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          StealthBrowser
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        <p
          className="px-2 mb-2"
          style={{
            color: "var(--muted-foreground)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-all"
              style={{
                background: isActive ? "rgba(79,124,255,0.15)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--sidebar-foreground)",
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--sidebar-foreground)";
                }
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 rounded-r-full"
                  style={{
                    width: 3,
                    height: 20,
                    background: "var(--primary)",
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              )}
              <Icon
                size={16}
                color={isActive ? "var(--primary)" : "var(--sidebar-foreground)"}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 px-2">
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(135deg, #4F7CFF 0%, #8B5CF6 100%)",
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              fontFamily: "Inter, sans-serif",
            }}
          >
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.2,
              }}
            >
              Alex Kim
            </p>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.2,
              }}
            >
              Pro Plan
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
