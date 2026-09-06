# GenAI Engineering Notes

Curated, sectioned notes built from live class transcripts of the **DS25 & GenAI** cohort (Inceptez Technologies), 18 Jul – 30 Aug 2026 — covering RAG, retrieval, evaluation, production memory, guardrails, LangGraph, multi-agent architectures, MCP, and Deep Agents.

**Live site:** `https://sirajtechy.github.io/gen-ai-notes-2026/` (once GitHub Pages is enabled — see below)

## Structure

```
.
├── _config.yml          # Jekyll + just-the-docs theme config (GitHub Pages compatible)
├── index.md             # Site home page / course map
└── notes/
    ├── 01-course-overview.md
    ├── 02-llm-foundations.md
    ├── 03-rag-ingestion-and-chunking.md
    ├── 04-embeddings-and-vector-databases.md
    ├── 05-retrieval-dense-sparse-hybrid.md
    ├── 06-rag-evaluation-ragas.md
    ├── 07-production-memory-architecture.md
    ├── 08-guardrails-and-safety.md
    ├── 09-agents-and-tool-calling.md
    ├── 10-langgraph-fundamentals.md
    ├── 11-langgraph-patterns.md
    ├── 12-multi-agent-architectures.md
    ├── 13-mcp-and-deep-agents.md
    ├── 14-capstone-case-studies.md
    ├── 15-career-and-industry-notes.md
    └── 16-engineering-collaboration.md
```

Each page is a standalone, rewritten synthesis of a topic — not a raw transcript dump. They're numbered in the order the material builds on itself; read 1 → 16 the first time through.

## Publishing this to GitHub Pages

These files are written for the [`just-the-docs`](https://github.com/just-the-docs/just-the-docs) Jekyll theme via `remote_theme`, which GitHub Pages supports natively — no local Jekyll install or build step required.

**1. Clone your repo and copy these files in:**

```bash
git clone https://github.com/sirajtechy/gen-ai-notes-2026.git
cd gen-ai-notes-2026
# copy _config.yml, index.md, README.md, and notes/ into this folder
git add .
git commit -m "Add sectioned GenAI course notes"
git push origin main
```

**2. Enable GitHub Pages:**

- Go to the repo on GitHub → **Settings → Pages**.
- Under **Build and deployment**, set **Source** to "Deploy from a branch."
- Set **Branch** to `main` (or your default branch) and folder to `/ (root)`.
- Save. GitHub will build and publish the site within a minute or two at `https://sirajtechy.github.io/gen-ai-notes-2026/`.

**3. Double-check `_config.yml`:**

- `baseurl` is already set to `/gen-ai-notes-2026` to match this repo name. If you rename the repo, update `baseurl` to match, or the site's internal links and CSS will 404.
- If you'd rather publish at the root of a `sirajtechy.github.io` user/org site instead of a project site, rename this repo to `sirajtechy.github.io` and set `baseurl: ""`.

## Extending these notes

There's one more source file — `Transcriptions of Gen AI Teams recordings.zip` — that covers earlier sessions in the same cohort (pre-18 July) but was too large to pull through the tool used to build this first pass. If you unzip it and add the individual transcript files to a `transcripts/` folder, the same topic pages here can be extended with whatever additional sessions it contains (likely earlier LLM/ML fundamentals given the course's arc).

## License

Personal study notes — use, adapt, and share freely.
