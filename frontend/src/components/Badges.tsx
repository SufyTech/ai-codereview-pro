export function RiskBadge({ level }: { level?: string }) {
  const v = String(level ?? "").toLowerCase();
  const tone =
    v === "high" || v === "critical"
      ? "bg-high-soft text-high"
      : v === "medium"
        ? "bg-med-soft text-med"
        : v === "low"
          ? "bg-ok-soft text-ok"
          : "bg-band text-muted";
  const label = v ? `${v[0].toUpperCase()}${v.slice(1)} risk` : "Risk unknown";
  return <span className={`badge ${tone}`}>{label}</span>;
}

const statusLabel: Record<string, string> = {
  new: "New",
  processing: "Processing",
  resolved: "AI reviewed",
  escalated: "Escalated to a human",
};

export function OutcomeBadge({
  status,
  escalated,
}: {
  status?: string;
  escalated?: boolean;
}) {
  const s = escalated
    ? "escalated"
    : status === "open"
      ? "resolved"
      : String(status ?? "");
  const tone =
    s === "escalated" ? "bg-accent-soft text-accent" : "bg-band text-muted";
  return <span className={`badge ${tone}`}>{statusLabel[s] ?? s}</span>;
}
