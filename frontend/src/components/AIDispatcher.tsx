import { useState } from "react";
import { createReview } from "../api/client";
import { Review } from "../types";
import { OutcomeBadge, RiskBadge } from "./Badges";
import DiffView from "./DiffView";
import Notice from "./Notice";

interface Props {
  onReviewCreated?: (review: Review) => void;
}

const examples = [
  {
    label: "Bug fix",
    prTitle: "Fix retry logic in API client",
    codeDiff:
      "+ for attempt in range(3):\n+     try:\n+         return requests.get(url)\n+     except: continue",
  },
  {
    label: "Auth change",
    prTitle: "Update password hashing logic",
    codeDiff: "- password = hash(password)\n+ password = md5(password)",
  },
  {
    label: "Dependency",
    prTitle: "Bump lodash to 4.17.21",
    codeDiff: '- "lodash": "4.17.15"\n+ "lodash": "4.17.21"',
  },
];

const cleanAgent = (s: string) => s.replace("_agent", "").replace(/_/g, " ");

export default function AIDispatcher({ onReviewCreated }: Props) {
  const [prTitle, setPrTitle] = useState("");
  const [codeDiff, setCodeDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prTitle.trim() || !codeDiff.trim()) {
      setError("Add a PR title and a code diff first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const created = await createReview({
        pr_title: prTitle.trim(),
        code_diff: codeDiff.trim(),
      });
      setResult(created);
      onReviewCreated?.(created);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The review failed. Try again in a minute.",
      );
    } finally {
      setLoading(false);
    }
  };

  const comment =
    result?.reviewComment ?? result?.review_comment ?? result?.comment;
  const escalated = !!result?.needs_human_review;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <p className="field-label">Start from an example</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {examples.map((s) => (
              <button
                type="button"
                key={s.label}
                className="btn-secondary btn-sm"
                onClick={() => {
                  setPrTitle(s.prTitle);
                  setCodeDiff(s.codeDiff);
                  setError(null);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="pr-title" className="field-label">
            PR title
          </label>
          <input
            id="pr-title"
            className="field mt-1.5"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            placeholder="Update password hashing logic"
          />
        </div>

        <div>
          <label htmlFor="code-diff" className="field-label">
            Code diff
          </label>
          <textarea
            id="code-diff"
            className="field mt-1.5 h-56 resize-y font-mono text-[13px] leading-6"
            value={codeDiff}
            onChange={(e) => setCodeDiff(e.target.value)}
            placeholder={"- old line\n+ new line"}
            spellCheck={false}
          />
          <p className="mt-1.5 text-sm text-muted">
            Submitted diffs are stored on the server. Don&rsquo;t paste private
            code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button className="btn" disabled={loading}>
            {loading ? "Reviewing" : "Run review"}
          </button>
          <span className="text-sm text-muted">
            The first request after a quiet spell can take up to 60 seconds.
          </span>
        </div>
      </form>

      <div aria-live="polite">
        <p className="field-label">Result</p>
        <div className="card mt-1.5 min-h-[18rem] p-5">
          {error && (
            <Notice title="No review produced">{error}</Notice>
          )}

          {!result && !loading && !error && (
            <div className="text-sm leading-relaxed text-muted">
              <p>Nothing yet. When you run a review, this is what happens:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>A triage agent rates the risk and the type of change.</li>
                <li>Every change gets a full review comment.</li>
                <li>
                  Changes touching auth, payments, secrets or migrations are
                  also flagged for a human reviewer.
                </li>
              </ul>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink motion-reduce:animate-none"
                aria-hidden
              />
              <span>Running triage, review and escalation check.</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-snug">
                {result.pr_title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <RiskBadge level={result.risk_level} />
                {result.change_type && (
                  <span className="badge bg-band text-muted">
                    {result.change_type}
                  </span>
                )}
                <OutcomeBadge status={result.status} escalated={result.needs_human_review} />
              </div>

              {escalated && (
                <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
                  Flagged for a human reviewer
                  {result.assigned_reviewer &&
                  !/human reviewer/i.test(result.assigned_reviewer)
                    ? `: ${result.assigned_reviewer}`
                    : "."}
                </p>
              )}

              {comment && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {comment}
                </p>
              )}

              {result.agents_run && result.agents_run.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Agents that ran</p>
                  <ol className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {result.agents_run.map((a, i) => (
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
                          {cleanAgent(a)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {result.code_diff && <DiffView diff={result.code_diff} className="max-h-48" />}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <p className="text-sm text-muted">
                  This is advice only. Nothing is approved or posted to a pull
                  request.
                </p>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setResult(null);
                    setPrTitle("");
                    setCodeDiff("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
