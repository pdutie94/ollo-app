type Status = "running" | "stopped" | "error" | "pending";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; dot: string; bg: string; text: string }
> = {
  running: {
    label: "Running",
    dot: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    text: "#22C55E",
  },
  stopped: {
    label: "Stopped",
    dot: "#6B7280",
    bg: "rgba(107,114,128,0.12)",
    text: "#6B7280",
  },
  error: {
    label: "Error",
    dot: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    text: "#EF4444",
  },
  pending: {
    label: "Pending",
    dot: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    text: "#F59E0B",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
      style={{
        background: config.bg,
        fontSize: 11,
        fontWeight: 500,
        color: config.text,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: 5,
          height: 5,
          background: config.dot,
          ...(status === "running"
            ? { boxShadow: `0 0 4px ${config.dot}` }
            : {}),
        }}
      />
      {config.label}
    </span>
  );
}
