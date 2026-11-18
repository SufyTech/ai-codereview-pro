import { useCallback, useEffect, useState } from "react";
import { getReviews, getReviewStats } from "../api/client";
import { Review, ReviewStats } from "../types";
import { RiskBadge } from "./Badges";
import Notice from "./Notice";

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
    <div className="card p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="capitalize">{clean(k)}</span>
                <span className="font-mono text-[13px]">{v}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-band">
                <div
                  className="h-1.5 rounded-full bg-ink"
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
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [rows, setRows] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([getReviewStats(), getReviews()]);
      setStats(s);
      setRows(Array.isArray(r) ? r : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) return <p className="text-sm text-muted">Loading analytics</p>;

  const total = stats?.totalReviews ?? 0;
  const esc = stats?.escalated ?? 0;
  const rate = total ? Math.round((esc / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {error && (
        <Notice
          title="Analytics could not be loaded"
          actionLabel="Retry"
          onAction={load}
        >
          {error}
        </Notice>
      )}

      {stats && (
        <>
          <dl className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line">
            {(
              [
                ["Reviews", total],
                ["Escalated", esc],
                ["Escalation rate", `${rate}%`],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="px-4 py-4">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="mt-0.5 text-2xl font-semibold sm:text-3xl">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-4 md:grid-cols-3">
            <Bars title="Agent runs" data={stats.agents_frequency} />
            <Bars title="Change types" data={stats.change_types} />
            <Bars title="Risk levels" data={stats.risk_levels} />
          </div>

          <section aria-labelledby="flow-heading">
            <div className="flex items-baseline justify-between gap-4">
              <h3 id="flow-heading" className="text-lg font-semibold">
                Agent flow per review
              </h3>
              <span className="text-sm text-muted">Updates every 10 seconds</span>
            </div>
            <div className="card mt-3">
              {rows.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  No reviews yet. Run one from the New review tab.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {rows.map((r) => (
                    <li key={r.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{r.pr_title}</p>
                        <RiskBadge level={r.risk_level} />
                      </div>
                      <ol className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                        {(r.agents_run ?? []).map((a, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-1.5 after:text-muted after:content-['›'] last:after:content-['']"
                          >
                            <span
                              className={`rounded border px-1.5 py-0.5 ${
                                /escalation|human/.test(a)
                                  ? "border-accent/40 bg-accent-soft text-accent"
                                  : "border-line"
                              }`}
                            >
                              {clean(a)}
                            </span>
                          </li>
                        ))}
                        {r.assigned_reviewer && (
                          <li className="ml-1 text-muted">
                            Assigned to {r.assigned_reviewer}
                          </li>
                        )}
                      </ol>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
