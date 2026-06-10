import { Globe, Activity, Shield, Puzzle, Plus, Play, Upload, ArrowUpRight, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const kpiCards = [
  {
    label: "Total Profiles",
    value: "1,284",
    change: "+12 this week",
    icon: Globe,
    accent: "#4F7CFF",
    bg: "rgba(79,124,255,0.1)",
  },
  {
    label: "Active Profiles",
    value: "347",
    change: "27% of total",
    icon: Activity,
    accent: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    label: "Active Proxies",
    value: "89",
    change: "12 rotating",
    icon: Shield,
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    label: "Extensions",
    value: "23",
    change: "3 pending update",
    icon: Puzzle,
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
  },
];

const chartData = [
  { time: "00:00", running: 120, idle: 220, error: 8 },
  { time: "04:00", running: 98, idle: 260, error: 5 },
  { time: "08:00", running: 210, idle: 180, error: 12 },
  { time: "12:00", running: 347, idle: 140, error: 6 },
  { time: "16:00", running: 280, idle: 170, error: 9 },
  { time: "20:00", running: 195, idle: 200, error: 7 },
  { time: "Now", running: 347, idle: 150, error: 4 },
];

const activityFeed = [
  { action: "Profile launched", target: "US-Chrome-001", time: "2m ago", type: "launch" },
  { action: "Proxy assigned", target: "Residential-US-47", time: "5m ago", type: "proxy" },
  { action: "Profile cloned", target: "EU-Firefox-023", time: "11m ago", type: "clone" },
  { action: "Extension installed", target: "Cookie Manager v2.1", time: "18m ago", type: "ext" },
  { action: "Profile stopped", target: "APAC-Chrome-118", time: "24m ago", type: "stop" },
  { action: "Proxy error", target: "Datacenter-SG-09", time: "31m ago", type: "error" },
  { action: "Profile created", target: "UK-Edge-007", time: "45m ago", type: "create" },
  { action: "Bulk import", target: "50 profiles imported", time: "1h ago", type: "import" },
];

const typeColors: Record<string, string> = {
  launch: "#22C55E",
  proxy: "#4F7CFF",
  clone: "#8B5CF6",
  ext: "#F59E0B",
  stop: "#6B7280",
  error: "#EF4444",
  create: "#4F7CFF",
  import: "#22C55E",
};

interface DashboardProps {
  onNavigate: (page: "profiles") => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
            Monday, June 8, 2026 · 14:32 UTC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("profiles")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all"
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            Create Profile
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="rounded-lg p-2"
                  style={{ background: card.bg }}
                >
                  <Icon size={16} color={card.accent} />
                </div>
                <ArrowUpRight size={14} color="var(--muted-foreground)" />
              </div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {card.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                {card.label}
              </p>
              <p style={{ fontSize: 11, color: card.accent, marginTop: 6, fontWeight: 500 }}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Status Chart */}
        <div
          className="col-span-2 rounded-xl p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                Profile Activity
              </h2>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                24-hour overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Running", color: "#4F7CFF" },
                { label: "Idle", color: "#242B38" },
                { label: "Error", color: "#EF4444" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="rounded-full"
                    style={{ width: 8, height: 8, background: l.color }}
                  />
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradRunning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradError" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: "#A1A8B5", fontSize: 10, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#A1A8B5", fontSize: 10, fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "#1C2130",
                  border: "1px solid #242B38",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "Inter",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="running"
                stroke="#4F7CFF"
                strokeWidth={2}
                fill="url(#gradRunning)"
              />
              <Area
                type="monotone"
                dataKey="error"
                stroke="#EF4444"
                strokeWidth={1.5}
                fill="url(#gradError)"
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* Status breakdown */}
          <div
            className="grid grid-cols-3 gap-3 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {[
              { label: "Running", value: 347, color: "#22C55E", pct: 27 },
              { label: "Idle", value: 933, color: "#A1A8B5", pct: 73 },
              { label: "Error", value: 4, color: "#EF4444", pct: 0.3 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: s.color,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: 3, background: "var(--accent)" }}
                >
                  <div
                    className="rounded-full"
                    style={{ width: `${s.pct}%`, height: 3, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="rounded-xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Recent Activity
            </h2>
            <Clock size={14} color="var(--muted-foreground)" />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {activityFeed.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 transition-all"
                style={{
                  borderBottom:
                    i < activityFeed.length - 1 ? "1px solid var(--border)" : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <span
                  className="mt-0.5 rounded-full shrink-0"
                  style={{
                    width: 6,
                    height: 6,
                    background: typeColors[item.type],
                    marginTop: 5,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    {item.action}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#fff",
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.target}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4">
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Quick Actions
        </h2>
        <div className="flex items-center gap-3">
          {[
            { icon: Plus, label: "Create Profile", primary: true },
            { icon: Play, label: "Launch Profile", primary: false },
            { icon: Upload, label: "Import Profiles", primary: false },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all"
                style={{
                  background: action.primary ? "var(--primary)" : "var(--card)",
                  color: action.primary ? "#fff" : "var(--muted-foreground)",
                  border: action.primary ? "none" : "1px solid var(--border)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Icon size={15} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
