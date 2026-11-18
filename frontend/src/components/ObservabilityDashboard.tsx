import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface Stats {
  totalReviews: number;
  escalated: number;
  normal: number;
  agents_frequency?: Record<string, number>;
  change_types?: Record<string, number>;
  risk_levels?: Record<string, number>;
}
interface Row {
  id: string;
  pr_title: string;
  change_type: string;
  risk_level: string;
  assigned_reviewer?: string;
  agents_run?: string[];
}

const clean = (s: string) => s.replace("_agent", "").replace(/_/g, " ");

function Bars({
  title,
  data,
}: {
  title: string;
  data?: Record<string, number>;
}) {
  const entries = Object.entries(data ?? {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div>
      <p className="label border-b border-ink pb-2">{title}</p>
      {entries.length === 0 ? (
        <p className="py-4 text-sm text-mute">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-sm">
                <span>{clean(k)}</span>
                <span className="font-mono">{v}</span>
              </div>
              <div className="mt-1 h-2 bg-rule">
                <div
                  className="h-2 bg-ink"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ObservabilityDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          axios.get(`${API}/api/reviews/stats`),
          axios.get(`${API}/api/reviews`),
        ]);
        if (!live) return;
        setStats(s.data);
        setRows(Array.isArray(r.data) ? r.data : []);
        setError(null);
      } catch {
        if (live)
          setError(
            "Cannot reach the backend. The free Render instance may be waking up.",
          );
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, []);

  if (loading) return <p className="font-mono text-sm text-mute">Loading…</p>;
  if (error)
    return (
      <p
        role="alert"
        className="border border-brand bg-brand/5 px-3 py-2 text-sm text-brand"
      >
        {error}
      </p>
    );

  const total = stats?.totalReviews ?? 0;
  const esc = stats?.escalated ?? 0;
  const rate = total ? Math.round((esc / total) * 100) : 0;

  return (
    <div className="space-y-12">
      <dl className="grid grid-cols-2 border-y border-rule sm:grid-cols-3">
        {[
          ["Reviews", total],
          ["Escalated", esc],
          ["Escalation rate", `${rate}%`],
        ].map(([k, v], i) => (
          <div
            key={String(k)}
            className={`py-5 sm:py-6 ${i % 2 ? "border-l border-rule pl-4 sm:pl-8" : ""} ${i === 2 ? "sm:border-l sm:pl-8" : ""}`}
          >
            <dt className="label">{k}</dt>
            <dd className="mt-1 font-serif text-4xl sm:text-5xl">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-10 md:grid-cols-3">
        <Bars title="Agent runs" data={stats?.agents_frequency} />
        <Bars title="Change types" data={stats?.change_types} />
        <Bars title="Risk levels" data={stats?.risk_levels} />
      </div>
      <div>
        <p className="label border-b border-ink pb-2">
          Agent flow per review · refreshes every 10 s
        </p>
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-mute">No reviews yet.</p>
        ) : (
          <ul>
            {rows.map((r) => (
              <li key={r.id} className="border-b border-rule py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{r.pr_title}</p>
                  <span className="font-mono text-[11px] text-mute">
                    {r.id} · {r.change_type} · {r.risk_level}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs leading-6 text-ink2">
                  {(r.agents_run ?? []).map((a, i, arr) => (
                    <span
                      key={i}
                      className={/escalation|human/.test(a) ? "text-brand" : ""}
                    >
                      {clean(a)}
                      {i < arr.length - 1 ? " → " : ""}
                    </span>
                  ))}
                  {r.assigned_reviewer ? (
                    <span className="text-mute"> · {r.assigned_reviewer}</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
