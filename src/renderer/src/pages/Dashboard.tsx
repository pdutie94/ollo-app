import { useEffect, useState } from "react";
import { Globe, Activity, Shield, Puzzle, Plus, Play, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useProfileStore } from "@/store/useProfileStore";
import { useProxyStore } from "@/store/useProxyStore";
import { useGroupStore } from "@/store/useGroupStore";
import { staggerContainer, staggerItem, hoverScale } from "@/lib/animations";
import type { Profile, Proxy, Group } from "@shared/types";

const typeColors: Record<string, string> = {
  launch: "#22C55E", proxy: "#4F7CFF", clone: "#8B5CF6", ext: "#F59E0B",
  stop: "#6B7280", error: "#EF4444", create: "#4F7CFF", import: "#22C55E",
};

interface DashboardProps { onNavigate: (page: "profiles") => void }

export function Dashboard({ onNavigate }: DashboardProps) {
  const profiles = useProfileStore((s) => s.profiles);
  const runningProfileIds = useProfileStore((s) => s.runningProfileIds);
  const setProfiles = useProfileStore((s) => s.setProfiles);
  const proxies = useProxyStore((s) => s.proxies);
  const setProxies = useProxyStore((s) => s.setProxies);
  const groups = useGroupStore((s) => s.groups);
  const setGroups = useGroupStore((s) => s.setGroups);
  const [chartData, setChartData] = useState<{ time: string; running: number; error: number }[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [eventFeed, setEventFeed] = useState<{ action: string; target: string; time: string; type: string }[]>([]);

  useEffect(() => {
    window.api.profileList().then((res) => { if (res.success && res.data) setProfiles(res.data as Profile[]); }).catch((err) => console.error("Failed to load profiles:", err));
    window.api.proxyList().then((res) => { if (res.success && res.data) setProxies(res.data as Proxy[]); }).catch((err) => console.error("Failed to load proxies:", err));
    window.api.groupList().then((res) => { if (res.success && res.data) setGroups(res.data as Group[]); }).catch((err) => console.error("Failed to load groups:", err));
    window.api.eventChart().then((res) => { if (res.success && res.data) setChartData(res.data as { time: string; running: number; error: number }[]); }).catch(() => {});
    window.api.errorCount().then((res) => { if (res.success && res.data) setErrorCount((res.data as { count: number }).count); }).catch(() => {});
    window.api.eventHistory(10).then((res) => {
      if (res.success && res.data) {
        const events = res.data as { type: string; profileName?: string; timestamp: string }[];
        setEventFeed(events.map((e) => {
          const typeLabel: Record<string, string> = { 'profile:started': 'launch', 'profile:stopped': 'stop', 'profile:created': 'create', 'profile:deleted': 'delete', 'profile:error': 'error' };
          const actionLabel: Record<string, string> = { 'profile:started': 'Đã chạy', 'profile:stopped': 'Đã dừng', 'profile:created': 'Đã tạo', 'profile:deleted': 'Đã xoá', 'profile:error': 'Lỗi' };
          const t = new Date(e.timestamp);
          const timeStr = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
          return {
            action: actionLabel[e.type] || e.type,
            target: e.profileName || '',
            time: timeStr,
            type: typeLabel[e.type] || 'stop'
          };
        }));
      }
    }).catch(() => {});
  }, []);

  const totalProfiles = profiles.length;
  const activeProfiles = runningProfileIds.length;
  const stoppedProfiles = totalProfiles - activeProfiles;
  const totalProxies = proxies.length;
  const totalGroups = groups.length;

  const kpiCards = [
    { label: "Tổng Profile", value: totalProfiles.toLocaleString(), change: `${activeProfiles} đang chạy`, icon: Globe, accent: "#4F7CFF", bg: "rgba(79,124,255,0.1)" },
    { label: "Đang hoạt động", value: activeProfiles.toLocaleString(), change: `${totalProfiles > 0 ? Math.round((activeProfiles / totalProfiles) * 100) : 0}% tổng số`, icon: Activity, accent: "#22C55E", bg: "rgba(34,197,94,0.1)" },
    { label: "Proxy", value: totalProxies.toLocaleString(), change: `${totalGroups} nhóm`, icon: Shield, accent: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    { label: "Nhóm", value: totalGroups.toLocaleString(), change: `${groups.filter((g) => profiles.some((p) => p.groupId === g.id)).length} đang dùng`, icon: Puzzle, accent: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  ];

  const activityFeed = eventFeed.length > 0
    ? eventFeed
    : [{ action: "Chưa có hoạt động", target: "Tạo profile đầu tiên để bắt đầu", time: "—", type: "stop" }];

  const runningPct = totalProfiles > 0 ? Math.round((activeProfiles / totalProfiles) * 100) : 0;
  const stoppedPct = totalProfiles > 0 ? Math.round((stoppedProfiles / totalProfiles) * 100) : 100;
  const errorPct = activeProfiles > 0 ? Math.round((errorCount / activeProfiles) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 font-inter">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--foreground)] leading-tight">Dashboard</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <motion.button {...hoverScale} onClick={() => onNavigate("profiles")} className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-none text-[13px] font-medium cursor-pointer">
          <Plus size={15} /> Tạo Profile
        </motion.button>
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => { const Icon = card.icon; return (
          <motion.div key={card.label} variants={staggerItem} {...hoverScale} className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)] cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-lg p-2" style={{ background: card.bg }}><Icon size={16} color={card.accent} /></div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] leading-none tabular-nums">{card.value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{card.label}</p>
            <p className="text-xs font-medium mt-1.5" style={{ color: card.accent }}>{card.change}</p>
          </motion.div>
        );})}
      </motion.div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 gap-4">
        <motion.div variants={staggerItem} className="col-span-2 rounded-xl p-5 bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Hoạt động Profile</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Tổng quan hiện tại</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: "Đang chạy", color: "#4F7CFF" }, { label: "Không hoạt động", color: "#242B38" }, { label: "Lỗi", color: "#EF4444" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="rounded-full w-2 h-2" style={{ background: l.color }} />
                  <span className="text-xs text-[var(--muted-foreground)]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradRunning" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3} /><stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} /></linearGradient>
                <linearGradient id="gradError" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: "#A1A8B5", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A1A8B5", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "#1C2130", border: "1px solid #242B38", borderRadius: 8, fontSize: 12, fontFamily: "Inter", color: "#fff" }} />
              <Area type="monotone" dataKey="running" stroke="#4F7CFF" strokeWidth={2} fill="url(#gradRunning)" />
              <Area type="monotone" dataKey="error" stroke="#EF4444" strokeWidth={1.5} fill="url(#gradError)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            {[
              { label: "Đang chạy", value: activeProfiles, color: "#22C55E", pct: runningPct },
              { label: "Không hoạt động", value: stoppedProfiles, color: "#A1A8B5", pct: stoppedPct },
              { label: "Lỗi", value: errorCount, color: "#EF4444", pct: errorPct },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--muted-foreground)]">{s.label}</span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="rounded-full overflow-hidden h-[3px] bg-[var(--accent)]">
                  <div className="rounded-full h-[3px]" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Hoạt động gần đây</h2>
            <Activity size={14} color="var(--muted-foreground)" />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < activityFeed.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span className="mt-0.5 rounded-full shrink-0 w-[6px] h-[6px]" style={{ background: typeColors[item.type] || "#6B7280" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">{item.action}</p>
                  {item.target && <p className="text-xs font-medium text-[var(--foreground)] mt-0.5 truncate">{item.target}</p>}
                </div>
                <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="mt-4">
        <p className="text-[13px] font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-widest">Truy cập nhanh</p>
        <div className="flex items-center gap-3">
          {[{ icon: Plus, label: "Tạo Profile", primary: true }, { icon: Play, label: "Chạy Profile", primary: false }, { icon: Upload, label: "Import Profile", primary: false }].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} {...hoverScale} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium cursor-pointer"
                style={{ background: action.primary ? "var(--primary)" : "var(--card)", color: action.primary ? "#fff" : "var(--muted-foreground)", border: action.primary ? "none" : "1px solid var(--border)" }}>
                <Icon size={15} /> {action.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
