import { LayoutDashboard, Globe, FolderOpen, Shield, Puzzle, Settings, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore, type ActiveView } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { staggerContainer, staggerItem } from "@/lib/animations";

const navItems: { id: ActiveView; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "profiles", icon: Globe, label: "Profile" },
  { id: "groups", icon: FolderOpen, label: "Nhóm" },
  { id: "proxies", icon: Shield, label: "Proxy" },
  { id: "extensions", icon: Puzzle, label: "Tiện ích" },
  { id: "settings", icon: Settings, label: "Cài đặt" },
];

export function Sidebar() {
  const activeView = useUIStore((s) => s.activeView);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const settings = useSettingsStore((s) => s.settings);
  const userName = settings.userName || "Người dùng";
  const userPlan = settings.userPlan || "Gói Miễn phí";
  const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || "U";

  return (
    <motion.aside
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col h-full w-[240px] min-w-[240px] bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]"
    >
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-[var(--primary)]">
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        <span className="text-[var(--foreground)] font-inter text-[15px] font-semibold tracking-tight">
          Ollo
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        <p className="px-2 mb-2 text-[var(--muted-foreground)] text-[10px] font-semibold tracking-widest uppercase font-inter">
          Điều hướng
        </p>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                variants={staggerItem}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors
                  text-[13px] border-none cursor-pointer relative font-inter
                  ${isActive
                    ? "bg-[rgba(79,124,255,0.15)] text-[var(--primary)] font-medium"
                    : "bg-transparent text-[var(--sidebar-foreground)] font-normal hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute left-0 w-[3px] h-5 bg-[var(--primary)] rounded-r-full"
                  />
                )}
                <Icon size={16} color={isActive ? "var(--primary)" : "var(--sidebar-foreground)"} />
                {item.label}
              </motion.button>
            );
          })}
        </motion.div>
      </nav>

      <div className="px-3 py-4 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 px-2">
          <div className="rounded-full flex items-center justify-center shrink-0 w-[30px] h-[30px] text-xs font-semibold text-[var(--foreground)] font-inter"
            style={{ background: "linear-gradient(135deg, #4F7CFF 0%, #8B5CF6 100%)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--foreground)] text-[13px] font-medium font-inter leading-tight">
              {userName}
            </p>
            <p className="text-[var(--muted-foreground)] text-xs font-inter leading-tight">
              {userPlan}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
