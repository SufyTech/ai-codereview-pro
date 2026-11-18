// Drop-in replacement for src/pages/LandingPage.tsx
// Self-contained: no motion lib, no icons, no theme tokens. Every claim here is backed by the repo.
import { ReactNode } from "react";

// Update after you rename the repo.
const REPO = "https://github.com/SufyTech/ai-codereview-pro";

interface LandingPageProps {
  reviews?: unknown[];
  reviewsLoading?: boolean;
  handleReviewCreated?: (r: any) => void;
  onGetStarted: () => void;
}

const serif = { fontFamily: "'Instrument Serif', Georgia, serif" };
const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
const rule = "border-[#cfc8b8]";

const Label = ({ children }: { children: ReactNode }) => (
  <p
    style={mono}
    className="text-[11px] uppercase tracking-[0.14em] text-[#6b655a]"
  >
    {children}
  </p>
);

const Section = ({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: string;
  title: string;
  children: ReactNode;
}) => (
  <section id={id} className={`border-t ${rule} py-14 sm:py-20 lg:py-28`}>
    <div className="container-x grid gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
      <div className="md:col-span-3">
        <Label>§ {n}</Label>
        <h2 style={serif} className="mt-3 text-4xl md:text-5xl leading-[1.05]">
          {title}
        </h2>
      </div>
      <div className="md:col-span-8 md:col-start-5">{children}</div>
    </div>
  </section>
);

const runs = [
  { name: "Run 1 (before fixes)", caught: 17, esc: "n/a" },
  { name: "Run 3 · results_v3", caught: 19, esc: "13/19" },
  { name: "Run 4 · results_run4", caught: 19, esc: "13/19" },
  { name: "Run 5 · results_run5", caught: 19, esc: "13/19" },
];

const broke = [
  [
    "The model was shut down and nothing complained.",
    "Groq retired llama-3.1-8b-instant. Every review silently fell back to a fake \u201cmedium risk\u201d answer and the dashboard still looked healthy. I found it by checking whether the AI had really run. Now the API returns HTTP 503 when the AI fails.",
  ],
  [
    "Risky PRs got the laziest review.",
    "High-risk changes skipped the detailed review and got a one-line comment. Prompt tuning alone did not fix it, so I changed the graph: every PR is reviewed first, then risky ones are escalated.",
  ],
  [
    "A library version broke RAG in production.",
    "Render installed qdrant-client 1.7.3, which has no query_points. Local tests passed; the live site failed. I caught it by testing the deployed app, then pinned the working search call.",
  ],
];

const limits = [
  "I wrote the 20 test bugs myself and tuned on the same set. 19/19 is a regression check, not a benchmark. Next step: real open-source PRs.",
  "Three runs only. The clean PR still gets \u201cRequest Changes\u201d on nitpicks every time.",
  "On the payment PR the risk line names the bug but the long notes discuss a different issue.",
  "One of the 13 escalations (the migration PR) is triggered by a keyword rule, not by the model.",
  "Reviews live in SQLite on Render\u2019s free disk and disappear on redeploy. Next step: PostgreSQL.",
  "No GitHub integration yet. You paste a diff; nothing is posted on a PR.",
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div
      className="relative z-10 min-h-screen bg-[#efebe2] text-[#16140f]"
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
    >
      <header className={`border-b ${rule}`}>
        <div className="container-x flex h-14 items-center justify-between">
          <span style={mono} className="text-sm">
            codereview<span className="text-[#c8401a]">/</span>pro
          </span>
          <nav
            style={mono}
            className="flex items-center gap-4 sm:gap-6 md:gap-8 text-xs"
          >
            <a
              href="#results"
              className="hidden md:inline hover:underline underline-offset-4"
            >
              results
            </a>
            <a
              href="#pipeline"
              className="hidden md:inline hover:underline underline-offset-4"
            >
              pipeline
            </a>
            <a
              href="#limits"
              className="hidden md:inline hover:underline underline-offset-4"
            >
              limits
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="hover:underline underline-offset-4"
            >
              source
            </a>
            <button
              onClick={onGetStarted}
              className="bg-[#16140f] text-[#efebe2] px-3 py-1.5 hover:bg-[#c8401a] transition-colors"
            >
              sign in
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 sm:pt-20 lg:pt-28 pb-14 sm:pb-20 lg:pb-28">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Label>Multi-agent pull-request review · portfolio project</Label>
            <h1
              style={serif}
              className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-[0.98] tracking-[-0.01em]"
            >
              A code reviewer that knows when to stop and{" "}
              <em className="text-[#c8401a]">ask a human.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#3a362e]">
              Paste a diff. A triage agent rates the risk, every change gets a
              full AI review, and anything touching auth, payments, secrets or
              migrations is flagged for a person. The AI never approves.
            </p>
            <div className="mt-9 flex flex-wrap gap-4" style={mono}>
              <button
                onClick={onGetStarted}
                className="bg-[#16140f] text-[#efebe2] px-5 py-3 text-sm hover:bg-[#c8401a] transition-colors"
              >
                Open the live app →
              </button>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className={`border ${rule} border-[#16140f] px-5 py-3 text-sm hover:bg-[#16140f] hover:text-[#efebe2] transition-colors`}
              >
                Read the code
              </a>
            </div>
            <p style={mono} className="mt-5 text-xs text-[#6b655a]">
              Free hosting: the first request after a quiet spell can take up to
              60 s.
            </p>
          </div>

          <div className="lg:col-span-5">
            <Label>
              Exhibit A — illustrative, written by hand to show the format
            </Label>
            <div className="mt-3 border border-[#16140f] bg-[#f7f4ee]">
              <div
                style={mono}
                className="px-4 py-2 border-b border-[#16140f] text-xs flex justify-between"
              >
                <span>PR: Speed up password hashing</span>
                <span>auth/passwords.py</span>
              </div>
              <pre
                style={mono}
                className="px-4 py-3 text-[12px] leading-6 overflow-x-auto"
              >
                <span className="text-[#6b655a]"> def store_password(pw):</span>
                {"\n"}
                <span className="bg-[#f1d3c8] block">
                  - hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt())
                </span>
                <span className="bg-[#d5e3cf] block">
                  + hashed = hashlib.md5(pw.encode()).hexdigest()
                </span>
                <span className="text-[#6b655a]"> db.save(user, hashed)</span>
              </pre>
              <div className="border-t border-[#16140f] px-4 py-3 text-sm leading-relaxed">
                <p
                  style={mono}
                  className="text-[11px] uppercase tracking-[0.14em] text-[#c8401a]"
                >
                  Risk: high · Request changes
                </p>
                <p className="mt-1">
                  Replaces bcrypt with unsalted MD5 for stored passwords. MD5 is
                  fast to brute-force and has known collisions.
                </p>
                <p style={mono} className="mt-2 text-xs text-[#6b655a]">
                  → Escalated to human reviewer (auth change)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="results" n="1" title="Does it actually work?">
        <p className="text-lg leading-relaxed text-[#3a362e] max-w-2xl">
          I built a 20-PR test set: 19 diffs with one planted bug each, and 1
          clean diff. The first run caught 17 of 19. After fixing the causes
          below, it caught 19 of 19 in three separate runs.
        </p>
        <div style={mono} className={`mt-8 border-t border-[#16140f] text-sm`}>
          <div
            className={`grid grid-cols-12 py-2 border-b ${rule} text-[11px] uppercase tracking-[0.12em] text-[#6b655a]`}
          >
            <span className="col-span-5">Run</span>
            <span className="col-span-5">Bugs caught</span>
            <span className="col-span-2 text-right">Escalated</span>
          </div>
          {runs.map((r) => (
            <div
              key={r.name}
              className={`grid grid-cols-12 items-center py-3 border-b ${rule}`}
            >
              <span className="col-span-5 text-xs">{r.name}</span>
              <span className="col-span-5 flex items-center gap-2">
                <span className="flex gap-[2px]" aria-hidden>
                  {Array.from({ length: 19 }).map((_, i) => (
                    <i
                      key={i}
                      className={`block w-[6px] h-4 ${i < r.caught ? "bg-[#16140f]" : "border border-[#16140f]"}`}
                    />
                  ))}
                </span>
                <b className="font-medium">{r.caught}/19</b>
              </span>
              <span className="col-span-2 text-right">{r.esc}</span>
            </div>
          ))}
        </div>
        <p style={mono} className="mt-3 text-xs text-[#6b655a]">
          Each bar is one planted bug; order is not PR order. The clean PR was
          never escalated. Backend: 15 pytest tests, CI on every push.
        </p>
      </Section>

      <Section id="pipeline" n="2" title="How a diff moves through it">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 900 250"
            className="min-w-[680px] w-full"
            role="img"
            aria-label="Pipeline: diff, triage, full review, then escalate to a human or mark AI-reviewed"
          >
            <g fill="#f7f4ee" stroke="#16140f" strokeWidth="1.2">
              <rect x="10" y="102" width="150" height="56" />
              <rect x="200" y="102" width="150" height="56" />
              <rect x="390" y="102" width="150" height="56" />
              <rect x="610" y="36" width="280" height="64" />
              <rect x="610" y="160" width="280" height="64" />
            </g>
            <g fill="none" stroke="#16140f" strokeWidth="1.2">
              <path d="M160 130H200M350 130H390M540 130H575V68H610M540 130H575V192H610" />
            </g>
            <path
              d="M465 158V226H300"
              fill="none"
              stroke="#c8401a"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <g
              fontFamily="IBM Plex Sans, sans-serif"
              fontSize="15"
              fill="#16140f"
            >
              <text x="85" y="126" textAnchor="middle">
                Diff in
              </text>
              <text x="275" y="126" textAnchor="middle">
                Triage agent
              </text>
              <text x="465" y="126" textAnchor="middle">
                Full AI review
              </text>
              <text x="750" y="64" textAnchor="middle">
                Escalate to a human
              </text>
              <text x="750" y="188" textAnchor="middle">
                AI-reviewed, not escalated
              </text>
            </g>
            <g
              fontFamily="IBM Plex Mono, monospace"
              fontSize="11"
              fill="#6b655a"
            >
              <text x="85" y="144" textAnchor="middle">
                pasted PR
              </text>
              <text x="275" y="144" textAnchor="middle">
                rates the risk
              </text>
              <text x="465" y="144" textAnchor="middle">
                every PR, always
              </text>
              <text x="750" y="82" textAnchor="middle">
                auth · payments · secrets · migrations
              </text>
              <text x="750" y="206" textAnchor="middle">
                verdict is advice, never approval
              </text>
              <text x="290" y="244" fill="#c8401a" textAnchor="end">
                AI call fails → HTTP 503, never a fake answer
              </text>
            </g>
          </svg>
        </div>
        <p className="mt-6 max-w-2xl text-[#3a362e] leading-relaxed">
          Agents run on Groq (gpt-oss-120b; gpt-oss-20b for retrieval). Backend
          is FastAPI on Render, retrieval uses Qdrant with fastembed
          (all-MiniLM-L6-v2), the frontend is React + TypeScript on Vercel.
        </p>
      </Section>

      <Section id="broke" n="3" title="Things that broke">
        <ol className="space-y-8">
          {broke.map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[2.2rem_1fr]">
              <span style={mono} className="text-sm text-[#c8401a] pt-1">
                0{i + 1}
              </span>
              <div>
                <h3 style={serif} className="text-2xl leading-tight">
                  {t}
                </h3>
                <p className="mt-2 text-[#3a362e] leading-relaxed">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="limits" n="4" title="Known limitations">
        <ul className="space-y-3">
          {limits.map((l) => (
            <li
              key={l}
              className={`pb-3 border-b ${rule} text-[#3a362e] leading-relaxed`}
            >
              {l}
            </li>
          ))}
        </ul>
      </Section>

      <footer className={`border-t border-[#16140f] py-10`}>
        <div
          style={mono}
          className="container-x flex flex-wrap justify-between gap-4 text-xs"
        >
          <span>Built by Sufiyan Khan · open source</span>
          <span className="flex gap-6">
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="hover:underline underline-offset-4"
            >
              GitHub
            </a>
            <button
              onClick={onGetStarted}
              className="hover:underline underline-offset-4"
            >
              Live app
            </button>
          </span>
        </div>
      </footer>
    </div>
  );
}
