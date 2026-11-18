import { useEffect, useState } from "react";
import ReviewList from "../components/ReviewList.tsx";
import AIDispatcher from "../components/AIDispatcher.tsx";
import KnowledgeSearch from "../components/KnowledgeSearch.tsx";
import ObservabilityDashboard from "../components/ObservabilityDashboard.tsx";
import { useReviews } from "../hooks/useReviews.ts";
import { Review } from "../types.ts";
import { supabase } from "../lib/supabase";

type View = "overview" | "new-review" | "analytics";
const tabs: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "new-review", label: "New review" },
  { id: "analytics", label: "Analytics" },
];

export default function DashboardPage() {
  const [view, setView] = useState<View>("overview");
  const [confirmOut, setConfirmOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { reviews, loading, setReviews } = useReviews();

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const onCreated = (r: Review) => setReviews((prev) => [r, ...prev]);

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut(); // App.tsx redirects when the session clears
    setSigningOut(false);
    setConfirmOut(false);
  };

  const total = reviews.length;
  const escalated = reviews.filter((r) => r.status === "escalated").length;
  const high = reviews.filter((r) =>
    ["high", "critical"].includes(String(r.risk_level).toLowerCase()),
  ).length;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <span className="font-mono text-sm">
            codereview<span className="text-brand">/</span>pro
          </span>
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden truncate font-mono text-xs text-mute sm:block max-w-[16rem]">
              {email ?? "signed in"}
            </span>
            <button
              onClick={() => setConfirmOut(true)}
              className="font-mono text-xs underline-offset-4 hover:underline"
            >
              sign out
            </button>
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
              className={`whitespace-nowrap border-b-2 py-3 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                view === t.id
                  ? "border-brand text-ink"
                  : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="container-x py-8 sm:py-12 lg:py-14">
        {view === "overview" && (
          <div className="space-y-12 sm:space-y-16">
            <div>
              <p className="label">Workspace</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
                Overview
              </h1>
              <dl className="mt-8 grid grid-cols-3 border-y border-rule">
                {[
                  ["Reviews", total],
                  ["Escalated", escalated],
                  ["High risk", high],
                ].map(([k, v], i) => (
                  <div
                    key={String(k)}
                    className={`py-5 sm:py-6 ${i > 0 ? "border-l border-rule pl-4 sm:pl-8" : ""}`}
                  >
                    <dt className="label">{k}</dt>
                    <dd className="mt-1 font-serif text-4xl sm:text-5xl">
                      {loading ? "–" : v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <KnowledgeSearch />
            <ReviewList reviews={reviews} loading={loading} />
          </div>
        )}
        {view === "new-review" && (
          <div>
            <p className="label">Dispatcher</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
              New review
            </h1>
            <div className="mt-8 sm:mt-10">
              <AIDispatcher onReviewCreated={onCreated} />
            </div>
          </div>
        )}
        {view === "analytics" && (
          <div>
            <p className="label">Observability</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
              Analytics
            </h1>
            <div className="mt-8 sm:mt-10">
              <ObservabilityDashboard />
            </div>
          </div>
        )}
      </div>

      {confirmOut && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => !signingOut && setConfirmOut(false)}
        >
          <div
            className="panel w-full max-w-sm p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-3xl">Sign out?</h2>
            <p className="mt-2 text-sm text-ink2">
              You will need to sign in again to reach the dashboard.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="btn-ghost flex-1"
                disabled={signingOut}
                onClick={() => setConfirmOut(false)}
              >
                Cancel
              </button>
              <button
                className="btn flex-1"
                disabled={signingOut}
                onClick={signOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
