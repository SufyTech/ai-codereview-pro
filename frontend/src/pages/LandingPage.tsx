import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PROFILE_URL, REPO_URL } from "../config.ts";

interface LandingPageProps {
  onSignIn: () => void;
}

/* ---------- content (every claim here is backed by the repo) ---------- */

const runs = [
  { name: "First run, before fixes", caught: 17, esc: "n/a", file: "" },
  { name: "After fixes, run 1", caught: 19, esc: "13 of 19", file: "results_v3.csv" },
  { name: "After fixes, run 2", caught: 19, esc: "13 of 19", file: "results_run4.csv" },
  { name: "After fixes, run 3", caught: 19, esc: "13 of 19", file: "results_run5.csv" },
];

const broke = [
  {
    title: "The model was shut down and nothing complained",
    body: "Groq retired llama-3.1-8b-instant. Every review silently fell back to a fake “medium risk” answer, and the dashboard still looked healthy. I found it by checking whether the AI had really run. The API now returns HTTP 503 when the AI call fails.",
  },
  {
    title: "Risky pull requests got the laziest review",
    body: "High-risk changes skipped the detailed review and got a one-line comment. Tuning the prompt did not fix it, so I changed the graph: every change is reviewed first, then risky ones are escalated.",
  },
  {
    title: "A library version broke retrieval in production",
    body: "Render installed qdrant-client 1.7.3, which has no query_points. Local tests passed and the live site failed. I caught it by testing the deployed app, then switched to the search call that version supports.",
  },
];

const limits = [
  "I wrote the 20 test bugs myself and tuned on the same set. 19 of 19 is a regression check, not a benchmark. Next step: real open-source pull requests.",
  "Three runs only. The clean pull request still gets “Request changes” on nitpicks every time.",
  "On the payment pull request the risk line names the bug, but the long notes discuss a different issue.",
  "One of the 13 escalations (the migration change) is triggered by a keyword rule, not by the model.",
  "Reviews live in SQLite on Render’s free disk and disappear on redeploy. Next step: PostgreSQL.",
  "There is no GitHub integration yet. You paste a diff, and nothing is posted on a pull request.",
  "The demo needs no account, and submitted diffs are stored on the server. Don’t paste private code.",
];

const stack: [string, string][] = [
  ["Agents", "LangGraph on Groq: gpt-oss-120b for triage and review, gpt-oss-20b for retrieval answers"],
  ["Retrieval", "Qdrant Cloud with fastembed (all-MiniLM-L6-v2) over a small demo knowledge base"],
  ["Backend", "FastAPI on Render, review history in SQLite"],
  ["Frontend", "React, TypeScript, Vite and Tailwind on Vercel, optional Supabase sign-in"],
  ["Tests", "15 pytest tests for escalation rules and the API, plus a GitHub Actions workflow"],
];

const diffLines: { n: number; kind: "ctx" | "add" | "del"; text: string }[] = [
  { n: 41, kind: "ctx", text: "def store_password(user, pw):" },
  { n: 42, kind: "del", text: "    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt())" },
  { n: 42, kind: "add", text: "    hashed = hashlib.md5(pw.encode()).hexdigest()" },
  { n: 43, kind: "ctx", text: "    db.save(user, hashed)" },
];

/* ---------- small pieces ---------- */

const Section = ({
  id,
  title,
  lead,
  tone = "paper",
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  tone?: "paper" | "band";
  children: ReactNode;
}) => (
  <section
    id={id}
    className={`scroll-mt-4 border-t border-line py-14 sm:py-20 ${tone === "band" ? "bg-band" : "bg-paper"}`}
  >
    <div className="container-x grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {lead && <p className="mt-3 max-w-sm text-muted">{lead}</p>}
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  </section>
);

function ReviewExample() {
  return (
    <figure>
      <div className="card overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line bg-band px-4 py-2.5">
          <span className="text-sm font-semibold">Speed up password hashing</span>
          <span className="font-mono text-xs text-muted">auth/passwords.py</span>
        </div>

        <div className="overflow-x-auto py-2 font-mono text-[12.5px] leading-6">
          <div className="min-w-max">
            {diffLines.map((l, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2.75rem_1.25rem_1fr] border-l-2 pr-4 ${
                  l.kind === "add"
                    ? "border-ok bg-ok-soft"
                    : l.kind === "del"
                      ? "border-high bg-high-soft"
                      : "border-transparent"
                }`}
              >
                <span className="select-none pr-2 text-right text-muted">{l.n}</span>
                <span className="select-none text-muted">
                  {l.kind === "add" ? "+" : l.kind === "del" ? "-" : ""}
                </span>
                <span className="whitespace-pre">{l.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-md border border-line bg-paper">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <span className="text-sm font-semibold">AI review</span>
            <span className="badge bg-high-soft text-high">High risk</span>
            <span className="badge bg-band text-muted">Request changes</span>
          </div>
          <p className="px-3 py-2.5 text-sm leading-relaxed">
            Replaces bcrypt with unsalted MD5 for stored passwords. MD5 is fast
            to brute-force and has known collisions. Keep bcrypt, or move to
            argon2.
          </p>
          <p className="rounded-b-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent">
            Flagged for a human reviewer: auth change.
          </p>
        </div>
      </div>
      <figcaption className="mt-2.5 text-sm text-muted">
        Example output, written by hand to show the format. The app produces
        real reviews like this from any diff you paste.
      </figcaption>
    </figure>
  );
}

function Pipeline() {
  const box = { fill: "#ffffff", stroke: "#14202b", strokeWidth: 1.2, rx: 6 };
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 900 260"
        className="min-w-[700px] w-full"
        role="img"
        aria-label="Pipeline: a pasted diff goes to a triage agent, then a full review. The result is either escalated to a human or marked AI reviewed. If the AI call fails, the API returns HTTP 503."
      >
        <g {...box}>
          <rect x="6" y="104" width="150" height="58" />
          <rect x="196" y="104" width="160" height="58" />
          <rect x="396" y="104" width="160" height="58" />
        </g>
        <rect x="620" y="30" width="274" height="68" rx="6" fill="#e8eefb" stroke="#2b59c3" strokeWidth="1.2" />
        <rect x="620" y="168" width="274" height="68" rx="6" fill="#ffffff" stroke="#14202b" strokeWidth="1.2" />
        <path
          d="M156 133H196M356 133H396M556 133H588V64H620M556 133H588V202H620"
          fill="none"
          stroke="#14202b"
          strokeWidth="1.2"
        />
        <path
          d="M476 162V250H276"
          fill="none"
          stroke="#b3261e"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <g fontFamily="Hanken Grotesk, system-ui, sans-serif" fontSize="15" fontWeight="600" fill="#14202b">
          <text x="81" y="129" textAnchor="middle">Diff in</text>
          <text x="276" y="129" textAnchor="middle">Triage agent</text>
          <text x="476" y="129" textAnchor="middle">Full AI review</text>
          <text x="757" y="62" textAnchor="middle" fill="#2b59c3">Escalated to a human</text>
          <text x="757" y="200" textAnchor="middle">AI reviewed, not escalated</text>
        </g>
        <g fontFamily="Hanken Grotesk, system-ui, sans-serif" fontSize="12.5" fill="#52606f">
          <text x="81" y="148" textAnchor="middle">pasted pull request</text>
          <text x="276" y="148" textAnchor="middle">rates risk and change type</text>
          <text x="476" y="148" textAnchor="middle">every change, always</text>
          <text x="757" y="81" textAnchor="middle">auth, payments, secrets, migrations</text>
          <text x="757" y="219" textAnchor="middle">the verdict is advice, never approval</text>
          <text x="268" y="246" textAnchor="end" fill="#b3261e">
            If the AI call fails the API returns HTTP 503, never a fake answer
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ---------- page ---------- */

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2 whitespace-nowrap font-semibold">
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            CodeReview Pro
          </a>
          <nav
            className="flex items-center gap-4 text-sm font-medium sm:gap-6"
            aria-label="Page sections"
          >
            <a href="#results" className="hidden text-muted hover:text-ink md:inline">
              Results
            </a>
            <a href="#pipeline" className="hidden text-muted hover:text-ink md:inline">
              How it works
            </a>
            <a href="#limits" className="hidden text-muted hover:text-ink md:inline">
              Limitations
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hidden text-muted hover:text-ink sm:inline">
              Source
            </a>
            <button onClick={onSignIn} className="hidden text-muted hover:text-ink sm:inline">
              Sign in
            </button>
            <Link to="/dashboard" className="btn btn-sm whitespace-nowrap">
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <div id="top" />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h1 className="text-[clamp(2rem,4.6vw,3.35rem)] font-bold leading-[1.08] tracking-[-0.025em]">
              AI code review that hands risky changes to a person
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Paste a diff. A triage agent rates the risk, every change gets a
              full review, and anything touching auth, payments, secrets or
              migrations is flagged for a human. The AI never approves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn">
                Open the app
              </Link>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                Read the source
              </a>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted">
              No account needed. The backend runs on free hosting, so the first
              request after a quiet spell can take up to 60 seconds.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <ReviewExample />
          </div>
        </div>
      </section>

      <Section
        id="results"
        title="Test results"
        lead="Measured on a set of 20 pull requests I built to check the pipeline."
      >
        <p className="max-w-2xl text-lg leading-relaxed">
          19 of the diffs each have one planted bug, and 1 is clean. The first
          run caught 17 of 19. After the fixes described below, three more runs
          caught 19 of 19.
        </p>

        <div className="mt-8 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-line bg-band text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Run</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Bugs caught</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Escalated</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Raw results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {runs.map((r) => (
                <tr key={r.name}>
                  <th scope="row" className="px-4 py-3 font-medium">{r.name}</th>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex gap-[3px]" aria-hidden>
                        {Array.from({ length: 19 }).map((_, i) => (
                          <i
                            key={i}
                            className={`block h-4 w-[6px] rounded-[1px] ${
                              i < r.caught ? "bg-ink" : "border border-ink"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="font-semibold">{r.caught} of 19</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.esc}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{r.file || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-muted">
          Each bar is one planted bug. The clean pull request was never
          escalated. The backend has 15 pytest tests. Read the scores as a
          regression check, not a benchmark; the limitations below say why.
        </p>
      </Section>

      <Section
        id="pipeline"
        tone="band"
        title="How a diff moves through it"
        lead="Every change takes the same path. Triage decides whether a person also has to look."
      >
        <Pipeline />

        <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
          {stack.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-semibold">{k}</dt>
              <dd className="text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="broke"
        title="Problems I hit and fixed"
        lead="Three failures from building and deploying this, and how I found each one."
      >
        <div className="divide-y divide-line border-y border-line">
          {broke.map((b) => (
            <article key={b.title} className="py-6">
              <h3 className="text-lg font-semibold leading-snug">{b.title}</h3>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted">{b.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="limits"
        tone="band"
        title="Known limitations"
        lead="What this project does not do, and what I would change next."
      >
        <ul className="max-w-2xl space-y-3">
          {limits.map((l) => (
            <li key={l} className="flex gap-3 leading-relaxed">
              <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </Section>

      <footer className="border-t border-line bg-paper py-10">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-muted">
            Built by{" "}
            <a href={PROFILE_URL} target="_blank" rel="noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
              Sufiyan Khan
            </a>
            . Open source.
          </p>
          <div className="flex gap-5 font-medium">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:underline underline-offset-4">
              Repository
            </a>
            <Link to="/dashboard" className="hover:underline underline-offset-4">
              Open the app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
