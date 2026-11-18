import { Review } from "../types";
import { OutcomeBadge, RiskBadge } from "./Badges";
import DiffView from "./DiffView";

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
  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="reviews-heading" className="text-lg font-semibold">
          Reviews
        </h2>
        <span className="text-sm text-muted">
          {loading ? "Loading" : `${reviews.length} total`}
        </span>
      </div>

      <div className="card mt-3 overflow-hidden">
        {!loading && reviews.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No reviews yet. Open <b className="font-semibold">New review</b>,
            pick an example and run it.
          </p>
        )}

        <ul className="divide-y divide-line">
          {reviews.map((r) => {
            const comment = r.reviewComment ?? r.review_comment ?? r.comment;
            return (
              <li key={r.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3 hover:bg-band sm:flex-row sm:items-center sm:justify-between sm:gap-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.pr_title}</p>
                      <p className="text-[13px] text-muted">
                        {r.change_type || "Unclassified"}
                        {fmt(r.createdAt) ? `, ${fmt(r.createdAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <RiskBadge level={r.risk_level} />
                      <OutcomeBadge status={r.status} escalated={r.needs_human_review} />
                    </div>
                  </summary>

                  <div className="space-y-4 border-t border-line bg-band px-4 py-4">
                    {r.code_diff && (
                      <DiffView diff={r.code_diff} className="max-h-72" />
                    )}
                    {comment && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {comment}
                      </p>
                    )}
                    {r.history && r.history.length > 0 && (
                      <ol className="space-y-2 border-l-2 border-line pl-4">
                        {r.history.map((h, i) => (
                          <li key={i} className="text-sm">
                            <span className="text-[13px] text-muted">
                              {h.actor}, {fmt(h.timestamp)}
                            </span>
                            <br />
                            {h.message}
                          </li>
                        ))}
                      </ol>
                    )}
                    {!r.code_diff && !comment && !(r.history?.length) && (
                      <p className="text-sm text-muted">
                        No further detail was stored for this review.
                      </p>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
