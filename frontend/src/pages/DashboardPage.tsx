import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReviewList from "../components/ReviewList.tsx";
import AIDispatcher from "../components/AIDispatcher.tsx";
import KnowledgeSearch from "../components/KnowledgeSearch.tsx";
import ObservabilityDashboard from "../components/ObservabilityDashboard.tsx";
import Notice from "../components/Notice.tsx";
import { useReviews } from "../hooks/useReviews.ts";
import { REPO_URL } from "../config.ts";
import { supabase } from "../lib/supabase";

type View = "overview" | "new-review" | "analytics";
const tabs: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "new-review", label: "New review" },
  { id: "analytics", label: "Analytics" },
];

const titles: Record<View, { title: string; blurb: string }> = {
  overview: {
    title: "Overview",
    blurb: "Every review the backend has stored, newest first.",
  },
  "new-review": {
    title: "New review",
    blurb: "Paste a diff and see how the agents handle it.",
  },
  analytics: {
    title: "Analytics",
    blurb: "How reviews were classified and which agents ran.",
  },
};

export default function DashboardPage() {
  const [view, setView] = useState<View>("overview");
  const [confirmOut, setConfirmOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { reviews, loading, error, refresh, addReview } = useReviews();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setEmail(data.session?.user?.email ?? null));
  }, []);

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut(); // App.tsx redirects when the session clears
    setSigningOut(false);
    setConfirmOut(false);
  };

  const total = reviews.length;
  const escalated = reviews.filter((r) => r.needs_human_review).length;
  const high = reviews.filter((r) =>
    ["high", "critical"].includes(String(r.risk_level).toLowerCase()),
  ).length;

  const head = titles[view];

  return (
    <div className="min-h-screen bg-band">
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            CodeReview Pro
          </Link>
          <div className="flex min-w-0 items-center gap-4 text-sm">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden font-medium text-muted underline-offset-4 hover:text-ink hover:underline sm:inline"
            >
              Source
            </a>
            {email && (
              <>
                <span className="hidden max-w-[14rem] truncate text-muted md:block">
                  {email}
                </span>
                <button
                  onClick={() => setConfirmOut(true)}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
        <nav
          className="container-x -mb-px flex gap-6 overflow-x-auto"
          aria-label="Dashboard sections"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              aria-current={view === t.id ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 py-2.5 text-sm font-semibold transition-colors ${
                view === t.id
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="container-x py-8 sm:py-10">
        <h1 className="text-2xl font-semibold sm:text-3xl">{head.title}</h1>
        <p className="mt-1 text-muted">{head.blurb}</p>

        <div className="mt-7">
          {view === "overview" && (
            <div className="space-y-8">
              {error && (
                <Notice
                  title="Reviews could not be loaded"
                  actionLabel="Retry"
                  onAction={refresh}
                >
                  {error}
                </Notice>
              )}

              <dl className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-paper">
                {(
                  [
                    ["Reviews", total],
                    ["Escalated", escalated],
                    ["High risk", high],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="px-4 py-4">
                    <dt className="text-sm text-muted">{k}</dt>
                    <dd className="mt-0.5 text-2xl font-semibold sm:text-3xl">
                      {loading ? "–" : v}
                    </dd>
                  </div>
                ))}
              </dl>

              <KnowledgeSearch />
              <ReviewList reviews={reviews} loading={loading} />
            </div>
          )}
          {view === "new-review" && <AIDispatcher onReviewCreated={addReview} />}
          {view === "analytics" && <ObservabilityDashboard />}
        </div>
      </div>

      {confirmOut && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => !signingOut && setConfirmOut(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-title"
            className="card w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="signout-title" className="text-lg font-semibold">
              Sign out?
            </h2>
            <p className="mt-1 text-sm text-muted">
              You can keep using the app without an account.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                className="btn-secondary flex-1"
                disabled={signingOut}
                onClick={() => setConfirmOut(false)}
              >
                Cancel
              </button>
              <button className="btn flex-1" disabled={signingOut} onClick={signOut}>
                {signingOut ? "Signing out" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
