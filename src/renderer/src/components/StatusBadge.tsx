import { motion } from "framer-motion";

type Status = "running" | "stopped" | "error" | "pending";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; dot: string; bg: string; text: string }
> = {
  running: {
    label: "Đang chạy",
    dot: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    text: "#22C55E",
  },
  stopped: {
    label: "Đã dừng",
    dot: "#6B7280",
    bg: "rgba(107,114,128,0.12)",
    text: "#6B7280",
  },
  error: {
    label: "Lỗi",
    dot: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    text: "#EF4444",
  },
  pending: {
    label: "Đang chờ",
    dot: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    text: "#F59E0B",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium leading-relaxed"
      style={{ background: config.bg, color: config.text }}
    >
      <motion.span
        className="rounded-full shrink-0"
        style={{ width: 5, height: 5, background: config.dot }}
        animate={status === "running" ? { opacity: [1, 0.5, 1], boxShadow: [`0 0 2px ${config.dot}`, `0 0 6px ${config.dot}`, `0 0 2px ${config.dot}`] } : {}}
        transition={status === "running" ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
      />
      {config.label}
    </motion.span>
  );
}
