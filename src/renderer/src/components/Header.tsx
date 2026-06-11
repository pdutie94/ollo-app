import { useState, useEffect, useRef } from "react";
import { Bell, Search, X, AlertCircle, Info, Check, Sun, Moon, Monitor, Settings, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore, type ThemePreference } from "@/store/useThemeStore";
import { useUIStore } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { scaleIn } from "@/lib/animations";

const notifColors: Record<string, string> = { error: "#EF4444", success: "#22C55E", info: "#4F7CFF", warning: "#F59E0B" };
const notifIcons: Record<string, React.ElementType> = { error: AlertCircle, success: Check, info: Info, warning: AlertCircle };

const themeOptions: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Sáng" },
  { value: "dark", icon: Moon, label: "Tối" },
  { value: "system", icon: Monitor, label: "Hệ thống" },
];

interface Notification {
  id: string; type: string; title: string; body: string; time: string; unread: boolean;
}

export function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { preference, setPreference } = useThemeStore();
  const setActiveView = useUIStore((s) => s.setActiveView);
  const setGlobalSearch = useUIStore((s) => s.setGlobalSearch);
  const settings = useSettingsStore((s) => s.settings);
  const userName = settings.userName || "Người dùng";
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "U";
  const unreadCount = notifs.filter((n) => n.unread).length;

  // Listen for browser events to show live notifications
  useEffect(() => {
    const cleanup = window.api.onBrowserEvent((event) => {
      if (event.type === "profile:started") {
        const id = Math.random().toString(36).slice(2);
        setNotifs((n) => [{ id, type: "success", title: "Profile đã khởi chạy", body: `Profile ${event.profileId.slice(0, 8)}... đang chạy`, time: "Vừa xong", unread: true }, ...n.slice(0, 9)]);
      } else if (event.type === "profile:stopped") {
        const id = Math.random().toString(36).slice(2);
        setNotifs((n) => [{ id, type: "info", title: "Profile đã dừng", body: `Profile ${event.profileId.slice(0, 8)}... đã dừng`, time: "Vừa xong", unread: true }, ...n.slice(0, 9)]);
      }
    });
    return cleanup;
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      setGlobalSearch(search.trim());
      setActiveView('profiles');
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, unread: false })));
  const dismissNotif = (id: string) => setNotifs((n) => n.filter((x) => x.id !== id));

  return (
    <header className="flex items-center gap-4 px-6 shrink-0 h-14 bg-[var(--sidebar)] border-b border-[var(--border)] sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 bg-[var(--card)] border border-[var(--border)]">
          <Search size={14} color="var(--muted-foreground)" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm profile, proxy..."
            className="bg-transparent border-none outline-none text-xs w-full font-inter"
            style={{ color: search ? "#fff" : "var(--muted-foreground)" }} />
          <kbd className="bg-[var(--accent)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] font-inter shrink-0">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 border-none cursor-pointer"
            style={{ background: notifOpen ? "rgba(255,255,255,0.05)" : "transparent" }}>
            <Bell size={17} color={notifOpen ? "#fff" : "var(--muted-foreground)"} />
            {unreadCount > 0 && (
              <span className="absolute flex items-center justify-center rounded-full w-4 h-4 top-1 right-1 text-[9px] font-bold text-white"
                style={{ background: "var(--destructive)" }}>{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 rounded-xl mt-1.5 w-[340px] bg-[var(--popover)] border border-[var(--border)] shadow-xl"
              style={{ top: "100%", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--foreground)]">Thông báo</span>
                  {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-[var(--foreground)]"
                    style={{ background: "var(--destructive)" }}>{unreadCount}</span>}
                </div>
                {unreadCount > 0 && <button onClick={markAllRead}
                  className="bg-none border-none text-xs text-[var(--primary)] cursor-pointer">Đã đọc hết</button>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((n) => {
                  const NIcon = notifIcons[n.type];
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)]"
                      style={{ background: n.unread ? "rgba(79,124,255,0.04)" : "transparent" }}>
                      <div className="rounded-lg flex items-center justify-center shrink-0 mt-0.5 w-7 h-7"
                        style={{ background: notifColors[n.type] + "18" }}>
                        <NIcon size={13} color={notifColors[n.type]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-[var(--foreground)]">{n.title}</p>
                          {n.unread && <span className="rounded-full w-[5px] h-[5px] bg-[var(--primary)] shrink-0" />}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{n.time}</p>
                      </div>
                      <button onClick={() => dismissNotif(n.id)}
                        className="shrink-0 rounded p-0.5 bg-transparent border-none cursor-pointer"
                        style={{ color: "var(--muted-foreground)" }}><X size={12} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={avatarRef}>
          <button onClick={() => setAvatarOpen(!avatarOpen)}
            className="rounded-full flex items-center justify-center cursor-pointer w-[30px] h-[30px] text-xs font-semibold text-[var(--foreground)] border-none"
            style={{ background: avatarOpen ? "linear-gradient(135deg, #6F9CFF 0%, #A87DFF 100%)" : "linear-gradient(135deg, #4F7CFF 0%, #8B5CF6 100%)" }}>
            {initials}
          </button>
          <AnimatePresence>
            {avatarOpen && (
              <motion.div variants={scaleIn} initial="initial" animate="animate" exit="exit"
                className="absolute right-0 z-50 rounded-xl mt-2 w-[220px] bg-[var(--popover)] border border-[var(--border)] shadow-xl py-1.5"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                <div className="px-4 py-2 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{userName}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Gói Pro</p>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                  <span className="text-xs text-[var(--muted-foreground)]">Giao diện</span>
                  <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
                    {themeOptions.map((opt, i) => {
                      const Icon = opt.icon;
                      const isActive = preference === opt.value;
                      return (
                        <button key={opt.value}
                          onClick={() => setPreference(opt.value)}
                          className="flex items-center justify-center w-7 h-6 border-none cursor-pointer transition-colors"
                          title={opt.label}
                          style={{
                            background: isActive ? "var(--primary)" : "transparent",
                            color: isActive ? "#fff" : "var(--muted-foreground)",
                            borderRight: i < themeOptions.length - 1 ? "1px solid var(--border)" : "none",
                          }}>
                          <Icon size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-0.5">
                  <button onClick={() => { setActiveView("settings"); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-1.5 text-[13px] border-none cursor-pointer text-left transition-colors hover:bg-[var(--accent)] rounded-none"
                    style={{ color: "var(--muted-foreground)" }}>
                    <Settings size={14} /> Cài đặt
                  </button>
                  <button onClick={() => { setActiveView("settings"); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-1.5 text-[13px] border-none cursor-pointer text-left transition-colors hover:bg-[var(--accent)] rounded-none"
                    style={{ color: "var(--muted-foreground)" }}>
                    <User size={14} /> Hồ sơ
                  </button>
                  <button onClick={() => { setActiveView("settings"); setAvatarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-1.5 text-[13px] border-none cursor-pointer text-left transition-colors hover:bg-[var(--accent)] rounded-none"
                    style={{ color: "var(--muted-foreground)" }}>
                    <LogOut size={14} /> Thoát
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
