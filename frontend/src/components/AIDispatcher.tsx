import { useState } from "react";
import { createReview } from "../api/client";
import { Review } from "../types";

interface Props {
  onReviewCreated?: (review: Review) => void;
}

const scenarios = [
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

const riskTone = (r?: string) => {
  const v = String(r ?? "").toLowerCase();
  if (v === "high" || v === "critical") return "text-brand";
  if (v === "medium") return "text-warn";
  if (v === "low") return "text-ok";
  return "text-mute";
};

export default function AIDispatcher({ onReviewCreated }: Props) {
  const [prTitle, setPrTitle] = useState("");
  const [codeDiff, setCodeDiff] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prTitle.trim() || !codeDiff.trim()) {
      setError("Fill in both the PR title and the code diff.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await createReview({
        pr_title: prTitle.trim(),
        code_diff: codeDiff.trim(),
      });
      setResult(r);
      onReviewCreated?.(r);
    } catch (err: any) {
      setError(
        err.message ||
          "The review failed. The free backend may be waking up; try again in a minute.",
      );
    } finally {
      setLoading(false);
    }
  };

  const r: any = result;
  const comment: string | undefined =
    r?.reviewComment ?? r?.review_comment ?? r?.comment;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <p className="label mb-2">Start from an example</p>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                type="button"
                key={s.label}
                className="btn-ghost !px-3 !py-1.5 !text-xs"
                onClick={() => {
                  setPrTitle(s.prTitle);
                  setCodeDiff(s.codeDiff);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="label">PR title</span>
          <input
            className="field mt-2"
            value={prTitle}
            onChange={(e) => setPrTitle(e.target.value)}
            placeholder="Update password hashing logic"
          />
        </label>
        <label className="block">
          <span className="label">Code diff</span>
          <textarea
            className="field mt-2 h-56 resize-y font-mono text-[13px] leading-6"
            value={codeDiff}
            onChange={(e) => setCodeDiff(e.target.value)}
            placeholder={"- old line\n+ new line"}
            spellCheck={false}
          />
        </label>
        {error && (
          <p
            role="alert"
            className="border border-brand bg-brand/5 px-3 py-2 text-sm text-brand"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn" disabled={loading}>
            {loading ? "Reviewing…" : "Run review →"}
          </button>
          <span className="font-mono text-xs text-mute">
            First request after idle can take up to 60 s.
          </span>
        </div>
      </form>

      <div>
        <p className="label mb-2">Result</p>
        <div className="panel min-h-[18rem] p-5 sm:p-6">
          {!result && !loading && (
            <p className="text-sm text-mute">
              Nothing yet. Submit a diff and the triage, review and escalation
              steps show up here.
            </p>
          )}
          {loading && (
            <p className="font-mono text-sm text-mute">
              Triage → review → escalation check…
            </p>
          )}
          {result && (
            <div className="space-y-5">
              <h3 className="font-serif text-3xl leading-tight">
                {result.pr_title}
              </h3>
              <dl className="grid grid-cols-3 gap-4 border-y border-rule py-4">
                <div>
                  <dt className="label">Risk</dt>
                  <dd
                    className={`mt-1 font-mono text-sm uppercase ${riskTone(result.risk_level)}`}
                  >
                    {result.risk_level}
                  </dd>
                </div>
                <div>
                  <dt className="label">Type</dt>
                  <dd className="mt-1 text-sm">{result.change_type || "–"}</dd>
                </div>
                <div>
                  <dt className="label">Outcome</dt>
                  <dd className="mt-1 text-sm">
                    {result.status === "escalated"
                      ? "Escalated to a human"
                      : "AI reviewed"}
                  </dd>
                </div>
              </dl>
              {comment && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink2">
                  {comment}
                </p>
              )}
              <button
                className="btn-ghost !py-1.5 !text-xs"
                onClick={() => {
                  setResult(null);
                  setPrTitle("");
                  setCodeDiff("");
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
