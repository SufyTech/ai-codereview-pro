import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
interface RAGResult {
  question: string;
  answer: string;
  sources: string[];
  chunks_used: number;
}

const samples = [
  "What's our required password hashing standard?",
  "What does our style guide say about naming conventions?",
  "What's our policy on raw SQL queries in PRs?",
  "What counts as a critical-risk change that needs human review?",
];

export default function KnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q?: string) => {
    const question = (q ?? query).trim();
    if (!question) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/rag/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("The knowledge base did not answer.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="knowledge-search">
      <div className="border-b border-ink pb-3">
        <p className="label">Retrieval</p>
        <h2 className="mt-1 font-serif text-3xl sm:text-4xl">
          Ask the knowledge base
        </h2>
      </div>
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
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
        <button className="btn sm:w-auto" disabled={loading || !query.trim()}>
          {loading ? "Searching…" : "Ask →"}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s}
            className="border border-rule px-3 py-1.5 text-left text-xs text-ink2 transition-colors hover:border-ink hover:text-ink"
            onClick={() => {
              setQuery(s);
              ask(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 border border-brand bg-brand/5 px-3 py-2 text-sm text-brand"
        >
          {error}
        </p>
      )}
      {result && (
        <div className="panel mt-6 p-5 sm:p-6">
          <p className="whitespace-pre-wrap leading-relaxed">{result.answer}</p>
          <p className="mt-5 border-t border-rule pt-3 font-mono text-[11px] text-mute">
            {result.chunks_used} chunk{result.chunks_used === 1 ? "" : "s"} used
            {result.sources?.length
              ? ` · sources: ${result.sources.join(", ")}`
              : ""}
          </p>
        </div>
      )}
    </section>
  );
}
