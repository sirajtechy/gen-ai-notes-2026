---
title: Capstone Case Studies
layout: default
nav_order: 15
permalink: /notes/14-capstone-case-studies
---

# Capstone Case Studies
{: .no_toc }

1. TOC
{:toc}

---

The cohort split into nine groups, each building a RAG/agent product for a different industry domain (banking, airlines, e-commerce, healthcare, legal, tax/government, finance complaints, telecom, and more — assigned live in an oddly chaotic but genuinely functional group-formation session). This page collects the case studies with enough real detail — actual numbers, actual dead ends — to be useful as reference architectures, not just inspiration.

## Case study 1: Amazon Seller Support Assistant

Presented as a full demo debrief with every pipeline decision justified by an actual metric — this is the single best example in the whole course of "justify every strategy with a number," and worth using as a template for how to structure your own project write-up.

**Scope:** answer seller-related questions only (order status, seller agreements) — explicitly *not* buyer or product questions, enforced by a guardrail (see below).

### Decisions made, and why

| Pipeline stage | Options compared | Winner | Why |
|---|---|---|---|
| Parsing | `pypdf`, `pdfplumber`, PyMuPDF | **PyMuPDF** | Best accuracy *and* fastest of the three |
| Chunking | Fixed, recursive, semantic | **Semantic** | Best metric result, though the margin over recursive was small |
| Embedding | Hugging Face MiniLM, BGE | **MiniLM** | Best result on their evaluation set |
| Vector store | Chroma, FAISS | **Chroma** | Comparable results to FAISS, plus native metadata persistence |
| Retrieval mode | Dense, hybrid | **Hybrid** | Best across Recall@1, Recall@3, keyword, and semantic metrics |
| Fusion method | RRF vs. weighted fusion | **RRF** | Avoided needing to tune an extra hyperparameter (fusion weight) |
| Re-ranking | Cross-encoder vs. none | **None** | Cross-encoder gave a Recall@1/@3 edge, but latency was "extremely high" — not worth it for their use case |
| LLM | GPT-4o-mini vs. GPT-4o | **GPT-4o-mini** | Near-identical RAGAS faithfulness/relevancy scores, far lower cost |

### Guardrails implemented

1. **Scope classification guardrail:** an LLM classification prompt determines whether a query is in-scope (seller info) or out-of-scope (buyer/product/competitor marketplace info) — out-of-scope queries get an immediate rejection with a default response, never reaching the retrieval pipeline.
2. **Confidence-threshold guardrail:** the top retrieved chunk's confidence score is checked against **0.35**. Below that, the bot returns a default "I don't know" answer rather than presenting a low-confidence guess as fact.

### Evaluation setup

- **Golden dataset:** 26 questions total — 10 generated via keyword matching, 16 via semantic generation.
- **Noise/error threshold:** 0.20, applied consistently across all evaluation runs so every strategy comparison above used the same yardstick.
- **Acceptance testing:** a separate, smaller hand-written 6-question set used as a final sanity check against the live chatbot output before calling the build done.

{: .interview }
This table is exactly the shape of answer to give when asked "walk me through a RAG system you built" — every decision paired with the metric that drove it, not just a list of technologies used.

## Case study 2: Restaurant-manager daily briefing agent

Built as a live, in-progress capstone during the final session — genuinely useful specifically *because* it wasn't finished, so the reasoning about architecture happened out loud, including a real bug that got diagnosed live.

### The requirement

A LangGraph orchestrator for a restaurant manager, able to answer four categories of intent:

1. **RAG** — questions answerable from static documents (the requirement doc specified a deliberately mixed set: 3 PDFs, 3 PPTX, 5 XLS, specifically to force the RAG pipeline to handle multiple ingestion formats).
2. **SQL agent** — structured data questions ("show today's revenue by category," "top-selling items") answered by querying a database directly.
3. **MCP** — external real-time data, specifically weather (for planning purposes — inventory/staffing decisions might depend on next week's forecast).
4. **Deep Agent (planning)** — a heavier task: "give me next week's plan," which requires *combining* the SQL agent (current inventory) and the MCP weather data, then producing a written plan — explicitly requiring a full planning step, not a single lookup.

### The final reference architecture

This is worth reproducing as a template, since it cleanly demonstrates several patterns from earlier pages combined into one real system:

```
                        ┌─────────────────────┐
   User query  ──────▶  │   Orchestrator graph │
                        └──────────┬───────────┘
                                   │  (intent classification)
        ┌──────────────┬──────────┼──────────────┬─────────────────┐
        ▼              ▼          ▼              ▼                 ▼
   ┌─────────┐   ┌───────────┐┌───────────┐ ┌───────────┐   ┌─────────────┐
   │   RAG   │   │SQL (read) │ │SQL (write)│ │    MCP    │   │ Deep Agent  │
   │  tool   │   │  agent    │ │  agent    │ │  (weather,│   │ (planning:  │
   │ (docs)  │   │no HITL    │ │HITL gate  │ │  events)  │   │checks SQL + │
   └─────────┘   └───────────┘ └─────┬─────┘ └───────────┘   │MCP, writes  │
                                     │                        │a plan)     │
                              [human approval]                └─────────────┘
                              before insert/
                              update/delete
```

**Two things worth noting about this diagram specifically:**

1. **The SQL agent is deliberately split in two** by risk profile — a read-only reporting agent with no human gate (nothing can go wrong from a `SELECT`), and a separate data-mutation agent that always pauses for explicit manager approval before an insert/update/delete executes (adding a menu item, applying a discount, marking a table as unavailable). This is the concrete version of the "split by risk, not by function" principle from [Multi-Agent Architectures](12-multi-agent-architectures).
2. **The MCP box is genuinely an MCP server/client pair**, not a plain API wrapper — see the correction in [MCP & Deep Agents](13-mcp-and-deep-agents) for why that distinction was enforced explicitly during this same build.

### The real bug, diagnosed live

The student's "Deep Agent" planning node wasn't actually using the Deep Agents framework's distinguishing capabilities (skills, genuine multi-step planning) — it was, in the instructor's words, "behaving like a normal node... like a deep line graph" instead. The diagnosis: the coding assistant used to scaffold it had no training knowledge of the (very recently released) Deep Agents library, and had silently written something that merely resembled the pattern. **The fix:** explicitly redirect the coding assistant to pull current documentation from the internet rather than relying on pretrained knowledge — a good, concrete instance of the "you need to be able to catch what the AI got wrong" theme running through the whole course (see [Career & Industry Notes](15-career-and-industry-notes)).

## Case study 3: Resume-tailoring & interview-prep agent (Deep Agent demo)

Presented as a polished demo of what Deep Agents' sub-agent and skill capabilities look like assembled into a full product, built on top of a job description + a candidate's résumé as input.

**Five sub-agents, each with its own narrow responsibility:**

1. **Career agent** — top-level orchestration.
2. **Resume-tailor agent** — reads the JD and résumé (via the harness's built-in `read_file`, which handles PDF natively), and rewrites the résumé to better match the JD's language and requirements, then generates a formatted PDF output on the fly (via a PDF-writing skill).
3. **Company-search agent** — runs live web searches (via a search API) to research the target company — pulling from sources including LinkedIn, the company's own site, Wikipedia, and Crunchbase — and writes a structured company-research markdown report.
4. **Career-coach / interview-coach agent** — generates an interview-preparation document: likely topics, likely questions, and a "battle card" for the specific role, informed by the tailored résumé and the JD.
5. Sub-agents ran in parallel where their outputs didn't depend on each other, then were combined into the final deliverable set.

**Human-in-the-loop appeared here too** — before the agent proceeded from "resume researched and matched against the JD" to actually generating the tailored PDF, it explicitly paused for the user's approval, the same gating pattern used for risky database writes elsewhere in the course.

## A recurring production question: incremental updates to a live RAG index

Asked directly in one session: once a RAG pipeline is live, how do you handle a source document being updated, without re-embedding the entire corpus from scratch every time?

**The answer, and why it depends entirely on decisions made back at ingestion time** (see [Ingestion & Chunking](03-rag-ingestion-and-chunking)):

- If your chunking pipeline tagged every chunk with a **document ID** in metadata, you can find every chunk belonging to the changed document, delete them, and re-insert freshly chunked-and-embedded replacements — without touching the rest of the corpus.
- If you tagged more granularly — a **chapter ID**, or even a **page ID** — you can replace just that chapter or page's chunks, an even smaller, cheaper update.
- **Without that metadata in place from the start, this becomes genuinely difficult**: "finding the specific chunk [to update] is really difficult" after the fact, with no reliable way to trace a changed sentence in a source document back to the exact chunk(s) derived from it.

{: .important }
This is the single clearest argument in the whole course for *why* metadata discipline at ingestion time isn't optional bookkeeping — it's the only thing that makes a production RAG system maintainable once real documents start changing, which they always eventually do.
