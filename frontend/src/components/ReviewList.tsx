import { Review } from "../types";

const riskTone = (r: string) => {
  const v = String(r ?? "").toLowerCase();
  if (v === "high" || v === "critical") return "text-brand";
  if (v === "medium") return "text-warn";
  if (v === "low") return "text-ok";
  return "text-mute";
};
const statusLabel: Record<string, string> = {
  new: "New",
  processing: "Processing",
  resolved: "AI reviewed",
  escalated: "Escalated",
};
const fmt = (s: string) => {
  const d = new Date(s);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function ReviewList({
  reviews,
  loading,
}: {
  reviews: Review[];
  loading: boolean;
}) {
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return (
    <section id="review-list">
      <div className="flex items-end justify-between gap-4 border-b border-ink pb-3">
        <div>
          <p className="label">History</p>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl">Reviews</h2>
        </div>
        <span className="font-mono text-xs text-mute">
          {loading ? "loading…" : `${sorted.length} total`}
        </span>
      </div>

      {!loading && sorted.length === 0 && (
        <p className="py-10 text-sm text-mute">
          No reviews yet. Open “New review” and submit a diff.
        </p>
      )}

      <ul>
        {sorted.map((r) => (
          <li key={r.id} className="border-b border-rule">
            <details className="group">
              <summary className="grid cursor-pointer list-none grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-center sm:gap-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0 sm:col-span-6">
                  <p className="truncate font-medium group-open:text-brand">
                    {r.pr_title}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-mute">
                    {r.id} · {fmt(r.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-ink2 sm:col-span-2">
                  {r.change_type || "–"}
                </p>
                <div className="flex gap-2 sm:col-span-4 sm:justify-end">
                  <span className={`tag ${riskTone(r.risk_level)}`}>
                    {r.risk_level}
                  </span>
                  <span
                    className={`tag ${r.status === "escalated" ? "text-brand" : "text-ink2"}`}
                  >
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
              </summary>
              <div className="space-y-5 pb-6 sm:pl-0">
                {r.code_diff && (
                  <pre className="max-h-72 overflow-auto border border-rule bg-card p-4 font-mono text-[12px] leading-6">
                    {r.code_diff}
                  </pre>
                )}
                {r.history && r.history.length > 0 && (
                  <ol className="space-y-2 border-l border-rule pl-4">
                    {r.history.map((h, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-mono text-[11px] text-mute">
                          {h.actor} · {fmt(h.timestamp)}
                        </span>
                        <br />
                        {h.message}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
