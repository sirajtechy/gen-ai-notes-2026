# GenAI Engineering Notes

Curated, diagram-driven notes built from live class transcripts of the **DS25 & GenAI** cohort (Inceptez Technologies), 18 Jul – 30 Aug 2026 — covering RAG, retrieval, evaluation, production memory, guardrails, LangGraph, multi-agent architectures, MCP, and Deep Agents.

**Live site:** <https://sirajtechy.github.io/gen-ai-notes-2026/>

Each of the 16 note pages is a standalone, rewritten synthesis of a topic — not a raw transcript dump — with a Mermaid diagram for most core concepts. Read 1 → 16 the first time through.

## The site

A small custom Jekyll theme (no `remote_theme`), built for reading:

- **Medium-style layout** — one serif column, sans-serif headings, generous line-height.
- **Light / dark toggle** in the top bar, honouring `prefers-color-scheme` and remembered per browser.
- **Mermaid diagrams** rendered client-side (from `cdn.jsdelivr.net`) and re-themed on toggle.
- Reading-time estimate, auto "On this page" contents, and prev/next navigation, all generated from `_data/notes.yml`.

```
.
├── _config.yml            # Jekyll config
├── _data/notes.yml        # ordered reading list → nav, prev/next, home cards
├── _layouts/              # default, home, note
├── assets/css/main.css    # the theme
├── assets/js/site.js      # theme toggle, progress bar, Mermaid bootstrap
├── index.md               # landing page
└── notes/                 # 01–16, the actual notes
```

## Running it locally

```bash
bundle install
bundle exec jekyll serve
# http://127.0.0.1:4000/gen-ai-notes-2026/
```

## Publishing

GitHub Pages builds this automatically on push to `main` (Settings → Pages → *Deploy from a branch* → `main` / root). `baseurl` in `_config.yml` is `/gen-ai-notes-2026` to match the repo name; if the repo is renamed, update `baseurl` to match or internal links and CSS will 404.

## Contributing a correction

These are personal study notes — corrections and additions are welcome. Each page links to its own source file ("Suggest an edit"); open a PR against `main`.

## License

Personal study notes — use, adapt, and share freely.
