---
title: Home
layout: home
nav_order: 1
---

# GenAI Engineering Notes
{: .fs-9 }

Curated, sectioned notes from live GenAI cohort sessions — turned from raw class recordings into a proper reference.
{: .fs-6 .fw-300 }

[Browse the notes](#course-map){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }

---

## What this is

Between **18 July 2026 and 30 August 2026**, I sat in on a live, hands-on GenAI engineering cohort ("DS25 & GenAI", run by Inceptez Technologies). Every session was recorded and transcribed. This site is what happened when I went back through all 12 transcripts and turned the raw, spoken-word class discussion into organized, readable, sectioned notes — the kind of reference I wish I'd had *during* the course instead of scrolling through a Zoom transcript.

Nothing here is copy-pasted from the transcripts verbatim. Each page is a rewritten, cleaned-up synthesis of what was actually taught and discussed — including the live Q&A, the worked examples, the instructor's war stories, and the mistakes/corrections that happened in real time (those are often the most useful part).

## How it's organized

The notes follow roughly the order the cohort covered things, which also happens to be a sensible order to *learn* them in: start with LLM basics, build a RAG pipeline piece by piece, learn to evaluate it properly, then move into agents, LangGraph, multi-agent orchestration, MCP, and deep agents. A capstone section walks through real student projects (including the mistakes made and fixed live in class).

## Course map
{: #course-map }

| # | Page | What's in it |
|---|------|---------------|
| 1 | [Course Overview](notes/01-course-overview) | Cohort structure, timeline, how to use these notes |
| 2 | [LLM & Tooling Foundations](notes/02-llm-foundations) | Token economics, IDE/agent tooling, why "burning tokens" isn't the goal |
| 3 | [RAG: Ingestion & Chunking](notes/03-rag-ingestion-and-chunking) | The 3 problems RAG solves, parsing libraries, 6 chunking strategies |
| 4 | [Embeddings & Vector Databases](notes/04-embeddings-and-vector-databases) | Embedding models, FAISS internals (HNSW/IVF), Chroma, Pinecone, Milvus |
| 5 | [Retrieval: Dense, Sparse & Hybrid](notes/05-retrieval-dense-sparse-hybrid) | BM25 vs TF-IDF, SPLADE, hybrid search, Reciprocal Rank Fusion |
| 6 | [RAG Evaluation with RAGAS](notes/06-rag-evaluation-ragas) | Recall@k / MRR / NDCG worked examples, golden datasets, RAGAS metrics |
| 7 | [Production Memory Architecture](notes/07-production-memory-architecture) | Checkpointers, thread IDs, summarization vs. trimming, cross-session memory |
| 8 | [Guardrails & Safety](notes/08-guardrails-and-safety) | PII middleware, moderation models, enterprise guardrails |
| 9 | [Agents & Tool Calling](notes/09-agents-and-tool-calling) | What makes something a "tool," stateless tool design, agent fundamentals |
| 10 | [LangGraph Fundamentals](notes/10-langgraph-fundamentals) | State/node/edge model, conditional edges, a from-scratch build |
| 11 | [LangGraph Patterns](notes/11-langgraph-patterns) | Retry loops, cost-based model routing, writer–critic–reviser |
| 12 | [Multi-Agent Architectures](notes/12-multi-agent-architectures) | Supervisor vs. hierarchical vs. network, nested graphs, sub-agents |
| 13 | [MCP & Deep Agents](notes/13-mcp-and-deep-agents) | What MCP actually requires, agent harnesses, skills vs. tools |
| 14 | [Capstone Case Studies](notes/14-capstone-case-studies) | Real student projects: Amazon seller-support bot, restaurant-manager agent |
| 15 | [Career & Industry Notes](notes/15-career-and-industry-notes) | Guest-speaker Q&A (Google), DORA metrics, the "fundamentals" argument |
| 16 | [Engineering Collaboration](notes/16-engineering-collaboration) | Git/GitHub workflow the cohort used for group projects |

## A note on how these were built

These notes were generated from `.vtt` transcript files pulled from a shared course-recordings folder, cleaned up, cross-referenced against session dates, and rewritten topic-by-topic. If you're curious about the process or want to extend these notes with more sessions, see the [source repo README](https://github.com/sirajtechy/gen-ai-notes-2026).
