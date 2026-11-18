# AI CodeReview Pro

A code review tool built on a LangGraph agent pipeline. You paste a diff, every change gets a full AI review, and anything touching auth, payments, secrets or migrations is also flagged for a human. The AI never approves a change.

[Live demo](https://ai-support-pro-theta.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/sufiyan-khan-a86521301) · suzkhan135@gmail.com

<!-- Add the 60-second demo video link here after recording -->

No account needed. The backend runs on Render's free plan, so the first request after a quiet spell can take up to 60 seconds.

![Python](https://img.shields.io/badge/Python-3776AB?flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-FF6B6B?flat-square)
![Qdrant](https://img.shields.io/badge/Qdrant_Cloud-DC244C?flat-square)
![React](https://img.shields.io/badge/React-20232A?flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?flat-square&logo=typescript&logoColor=white)

This started as an AI customer-support project (AI Support Pro). I reused the same LangGraph engine for pull requests, which is why some folders still carry the old name.

## How it works

```
Pull request (title + diff)
      |
Triage agent           change type, risk level, and a one-sentence
      |                reason that names the specific flaw
Escalation check       high/critical risk, or sensitive keywords
      |                (auth, payment, secret, migration...)
Knowledge agent        decides what the review should focus on
      |
Response agent         writes the review comment
      |
Needs a human?
  no  -> done, marked "AI reviewed"
  yes -> Escalation agent adds the risk reason and flags the change
         for a human reviewer
```

Every change gets a full review. Risky ones are then also flagged for a person. The routing is plain code (LangGraph conditional edges), not instructions in a prompt, so it can be tested. The `agents_run` field in each API response lists which agents actually ran.

If the AI call fails, the API returns HTTP 503. It does not return a made-up answer.

## What I measured

I built 20 small diffs: 19 with one planted bug each and 1 clean file as a control. A bug counts as caught when the review comment or the risk reason names the actual problem.

| Metric                       | First run | After fixes (3 runs) |
| ---------------------------- | --------- | -------------------- |
| Planted bugs named           | 17 / 19   | 19, 19, 19 / 19      |
| Escalated to a human         | 11 / 19   | 13 / 19 every run    |
| Clean file wrongly escalated | 0 / 1     | 0 / 1                |

Read this as a regression check, not a benchmark. Limits are listed below.

**What I changed after the first run**

- The payment and permission reviews named the area ("touches payments") but not the bug. The triage prompt now has to name the specific flaw.
- Open CORS with credentials was rated low. Security misconfigurations are now at least medium.
- High-risk changes skipped the detailed review and got a one-line comment. Tuning the prompt did not fix it, so I changed the graph: every change is reviewed first, then risky ones are escalated.

**Known weaknesses**

- I wrote the bugs myself, they are simple, I tuned on the same set, and I ran it three times. The score is optimistic. Next step: real open-source pull requests.
- The clean file is never escalated, but it gets "Request Changes" on style nitpicks every time.
- The 6 logic bugs (off-by-one, null handling, infinite loop, race condition, unclosed connection, divide by zero) are reviewed but not escalated. That is by design, but their risk ratings move between low and medium from run to run.
- On the payment change, the risk line names the real bug (price trusted from the client), but the longer notes discuss a different issue.
- One escalation (the migration change) comes from the keyword rule, not the model. The rule can also match harmless words, such as "auth" inside "author".
- The change-type label is not reliable. Triage labelled all my test reviews "Bug Fix", including a password-hashing change.

To reproduce:

```bash
python make_test_prs.py     # creates test-prs/ with 20 diffs and the answer key
# start the backend, then:
python run_tests.py         # writes test-prs/results.csv
```

Raw outputs of the runs are in `test-prs/`. The backend also has 15 pytest tests (escalation rules and the API) and a GitHub Actions workflow.

## Retrieval

The "Ask the knowledge base" box answers questions from a small demo knowledge base (a style guide and a security checklist). Documents are embedded with fastembed (all-MiniLM-L6-v2), stored in Qdrant Cloud, and `/api/rag/ask` retrieves chunks and writes an answer with citations through Groq. The knowledge base is tiny, so treat this as a demo of the pipeline, not a finished feature.

## Stack

| Part      | Tools                                                                                    |
| --------- | ---------------------------------------------------------------------------------------- |
| Agents    | LangGraph on Groq: gpt-oss-120b for triage and review, gpt-oss-20b for retrieval answers |
| Retrieval | Qdrant Cloud, fastembed                                                                  |
| Backend   | FastAPI on Render, review history in SQLite                                              |
| Frontend  | React, TypeScript, Vite, Tailwind on Vercel. Supabase sign-in is optional                |

## Try the API

```bash
# A normal-risk change
curl -X POST https://ai-support-pro-backend.onrender.com/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"pr_title":"Bump lodash to 4.17.21","code_diff":"- \"lodash\": \"4.17.15\"\n+ \"lodash\": \"4.17.21\""}'
# agents_run: triage_agent, escalation_check, knowledge_agent, response_agent

# A risky change (touches auth)
curl -X POST https://ai-support-pro-backend.onrender.com/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"pr_title":"Update password hashing logic","code_diff":"- password = hash(password)\n+ password = md5(password)"}'
# agents_run adds escalation_response_agent
# assigned_reviewer: "Human Reviewer"

# Ask the knowledge base
curl -X POST https://ai-support-pro-backend.onrender.com/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"How should I handle password hashing?"}'

# Stats
curl https://ai-support-pro-backend.onrender.com/api/reviews/stats
```

## Run it locally

```bash
git clone https://github.com/SufyTech/ai-codereview-pro.git
cd ai-codereview-pro

# Backend (Python 3.11)
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1      macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# Create backend/.env with GROQ_API_KEY, QDRANT_URL, QDRANT_API_KEY
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
# Optional frontend/.env: VITE_API_BASE_URL (defaults to http://localhost:8000)
# Supabase sign-in is optional: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev -- --port 5173
# open http://localhost:5173
```

The backend only allows requests from the deployed frontend and `http://localhost:5173`, so run the dev server on port 5173.

## Design decisions

**Why LangGraph and not a chain of LLM calls?** Each agent is a node in a graph, and routing is code. I can test the routing without calling a model.

**Why review every change before escalating?** My first design sent risky changes straight to a human and skipped the detailed review. The result was a one-line comment that named the area but not the bug. Now every change is reviewed, and escalation is added on top. The cost is two extra model calls on escalated changes.

**Why keep a keyword rule next to the model's risk rating?** The model's rating changes between runs. The rule makes sure obviously sensitive changes (password, secret, payment, migration) are always escalated, even when the model says medium.

**Why Qdrant Cloud and not local ChromaDB?** The ChromaDB setup worked locally but did not deploy well on free hosting because of the embedding model size. Qdrant Cloud made retrieval work in production.

**Why is the demo public?** A recruiter will not make an account to look at a project. The cost is that anyone can spend my free Groq quota. Submitted diffs are stored on the server, so do not paste private code.

## Problems I hit

- **A model was shut down and nothing complained.** Groq retired `llama-3.1-8b-instant`. Every review silently fell back to a default "medium risk" answer, and the dashboard looked normal. I found it by checking whether the AI had actually run. The API now returns HTTP 503 when the AI call fails.
- **Cut-off JSON.** The replacement model spends tokens on reasoning, so a small `max_tokens` cut the answer off and broke the JSON. I raised it to 1000.
- **A library version broke retrieval in production.** Render installed qdrant-client 1.7.3, which has no `query_points`. Local tests passed and the live site failed. I found it by testing the deployed app, then switched to the `search` call that version supports.
- **Shallow reviews on risky changes.** Covered above. Changing the graph fixed it, prompt tuning did not.
- **Wrong test environment.** My shell used a Python environment with a newer `langgraph`, so imports failed. A fresh Python 3.11 virtual environment fixed it.

## Not done yet

- Real open-source pull requests as a test set, instead of my own synthetic diffs
- Persistent storage. Reviews live in SQLite on Render's free disk and disappear on redeploy. Next step: PostgreSQL.
- GitHub integration. Today you paste a diff, and nothing is posted on a pull request.
- Hybrid keyword and vector search over the knowledge base
- Per-repo style guides instead of one shared knowledge base

## About

Built by Sufiyan Khan, Satara, India. Open to junior full-stack, backend and AI/LLM engineering roles, remote or hybrid.

[LinkedIn](https://www.linkedin.com/in/sufiyan-khan-a86521301) · [GitHub](https://github.com/SufyTech) · suzkhan135@gmail.com
