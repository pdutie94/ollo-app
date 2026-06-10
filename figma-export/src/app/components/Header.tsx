import { useState, useRef, useEffect } from "react";
import { Bell, Search, ChevronDown, Check, X, Globe, AlertCircle, Info, Plus } from "lucide-react";

const workspaces = [
  { id: "alpha", name: "Workspace Alpha", profiles: 1284 },
  { id: "beta", name: "Workspace Beta", profiles: 347 },
  { id: "personal", name: "Personal", profiles: 42 },
];

const notifications = [
  { id: "1", type: "error", title: "Proxy connection failed", body: "Datacenter-SG-09 timed out", time: "2m ago", unread: true },
  { id: "2", type: "success", title: "Bulk launch complete", body: "47 profiles launched successfully", time: "8m ago", unread: true },
  { id: "3", type: "info", title: "Extension update available", body: "User-Agent Switcher v3.1.1", time: "1h ago", unread: true },
  { id: "4", type: "warning", title: "Proxy quota at 85%", body: "Residential-US pool nearly full", time: "3h ago", unread: false },
  { id: "5", type: "success", title: "Import complete", body: "50 profiles imported from CSV", time: "5h ago", unread: false },
];

const notifColors: Record<string, string> = {
  error: "#EF4444",
  success: "#22C55E",
  info: "#4F7CFF",
  warning: "#F59E0B",
};
const notifIcons: Record<string, React.ElementType> = {
  error: AlertCircle,
  success: Check,
  info: Info,
  warning: AlertCircle,
};

interface HeaderProps {
  workspace?: string;
}

export function Header({ workspace: _workspace }: HeaderProps) {
  const [wsOpen, setWsOpen] = useState(false);
  const [activeWs, setActiveWs] = useState(workspaces[0]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const [search, setSearch] = useState("");

  const wsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, unread: false })));
  const dismissNotif = (id: string) => setNotifs((n) => n.filter((x) => x.id !== id));

  return (
    <header
      className="flex items-center gap-4 px-6 shrink-0"
      style={{
        height: 56,
        background: "var(--sidebar)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Workspace selector */}
      <div className="relative" ref={wsRef}>
        <button
          onClick={() => { setWsOpen(!wsOpen); setNotifOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
          style={{
            background: wsOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${wsOpen ? "var(--primary)" : "var(--border)"}`,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span
            className="rounded"
            style={{ width: 16, height: 16, background: "var(--primary)", display: "inline-block", flexShrink: 0 }}
          />
          {activeWs.name}
          <ChevronDown
            size={13}
            color="var(--muted-foreground)"
            style={{ transform: wsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          />
        </button>

        {wsOpen && (
          <div
            className="absolute left-0 z-50 rounded-xl py-1.5 mt-1.5"
            style={{
              top: "100%",
              background: "var(--popover)",
              border: "1px solid var(--border)",
              minWidth: 220,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            <p
              className="px-3 pb-1.5"
              style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "Inter, sans-serif" }}
            >
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                className="w-full flex items-center justify-between px-3 py-2 transition-all"
                style={{
                  background: activeWs.id === ws.id ? "rgba(79,124,255,0.1)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (activeWs.id !== ws.id)
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (activeWs.id !== ws.id)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
                onClick={() => { setActiveWs(ws); setWsOpen(false); }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded" style={{ width: 14, height: 14, background: "var(--primary)", display: "inline-block" }} />
                  <div className="text-left">
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{ws.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{ws.profiles.toLocaleString()} profiles</p>
                  </div>
                </div>
                {activeWs.id === ws.id && <Check size={13} color="var(--primary)" />}
              </button>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", margin: "6px 0" }} />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 transition-all"
              style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <Plus size={13} color="var(--muted-foreground)" />
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>New workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Global search */}
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <Search size={14} color="var(--muted-foreground)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles, proxies..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: search ? "#fff" : "var(--muted-foreground)",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              width: "100%",
            }}
          />
          <kbd
            style={{
              background: "var(--accent)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "1px 5px",
              fontSize: 10,
              color: "var(--muted-foreground)",
              fontFamily: "JetBrains Mono, monospace",
              flexShrink: 0,
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setWsOpen(false); }}
            className="relative rounded-lg p-2 transition-all"
            style={{
              background: notifOpen ? "rgba(255,255,255,0.05)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <Bell size={17} color={notifOpen ? "#fff" : "var(--muted-foreground)"} />
            {unreadCount > 0 && (
              <span
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  background: "var(--destructive)",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 z-50 rounded-xl mt-1.5"
              style={{
                top: "100%",
                width: 340,
                background: "var(--popover)",
                border: "1px solid var(--border)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "Inter, sans-serif" }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--destructive)", fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "Inter, sans-serif" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: "none", border: "none", fontSize: 11, color: "var(--primary)", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Bell size={24} color="var(--muted-foreground)" />
                    <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 8, fontFamily: "Inter, sans-serif" }}>
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifs.map((n) => {
                    const NIcon = notifIcons[n.type];
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 relative"
                        style={{
                          background: n.unread ? "rgba(79,124,255,0.04)" : "transparent",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ width: 28, height: 28, background: notifColors[n.type] + "18" }}
                        >
                          <NIcon size={13} color={notifColors[n.type]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: "Inter, sans-serif" }}>
                              {n.title}
                            </p>
                            {n.unread && (
                              <span className="rounded-full" style={{ width: 5, height: 5, background: "var(--primary)", display: "inline-block", flexShrink: 0 }} />
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1, fontFamily: "Inter, sans-serif" }}>
                            {n.body}
                          </p>
                          <p style={{ fontSize: 10, color: "rgba(161,168,181,0.5)", marginTop: 3, fontFamily: "Inter, sans-serif" }}>
                            {n.time}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissNotif(n.id)}
                          className="shrink-0 rounded p-0.5 transition-all"
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                        >
                          <X size={12} color="var(--muted-foreground)" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="rounded-full flex items-center justify-center cursor-pointer"
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
      </div>
    </header>
  );
}
