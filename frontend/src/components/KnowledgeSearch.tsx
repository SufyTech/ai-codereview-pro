import { useState } from "react";
import { askKnowledgeBase } from "../api/client";
import { RagAnswer } from "../types";
import Notice from "./Notice";

const samples = [
  "What's our required password hashing standard?",
  "What does our style guide say about naming conventions?",
  "What's our policy on raw SQL queries in PRs?",
  "What counts as a critical-risk change that needs human review?",
];

export default function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RagAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q?: string) => {
    const question = (q ?? query).trim();
    if (!question) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await askKnowledgeBase(question));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="kb-heading">
      <h2 id="kb-heading" className="text-lg font-semibold">
        Ask the knowledge base
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Reviews use a small demo knowledge base (a style guide and a security
        checklist). Answers are retrieved from it and cite their sources.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          className="field flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about the style guide or security policy"
          aria-label="Question"
        />
        <button className="btn" disabled={loading || !query.trim()}>
          {loading ? "Searching" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s}
            type="button"
            className="btn-secondary btn-sm !font-medium"
            disabled={loading}
            onClick={() => {
              setQuery(s);
              ask(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {error && (
          <div className="mt-4">
            <Notice title="No answer">{error}</Notice>
          </div>
        )}
        {result && (
          <div className="card mt-4 p-5">
            <p className="whitespace-pre-wrap leading-relaxed">
              {result.answer}
            </p>
            <p className="mt-4 border-t border-line pt-3 text-[13px] text-muted">
              Built from {result.chunks_used} retrieved chunk
              {result.chunks_used === 1 ? "" : "s"}
              {result.sources?.length
                ? `. Sources: ${result.sources.join(", ")}`
                : "."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
