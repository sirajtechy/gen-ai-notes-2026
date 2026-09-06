---
title: Course Overview
layout: default
nav_order: 2
has_children: false
permalink: /notes/01-course-overview
---

# Course Overview
{: .no_toc }

1. TOC
{:toc}

---

## The cohort

"DS25 & GenAI" is a live, hands-on cohort run by **Inceptez Technologies**, mixing a data-science track (DS25) with a dedicated GenAI engineering track. Sessions ran on a rolling weekday/weekend schedule between **18 July 2026 and 30 August 2026**, each 1.5–3 hours, taught live over Zoom with heavy notebook-driven, "build it in front of you" teaching rather than slide lectures.

The instructor's teaching style is worth naming because it shapes how these notes read: almost every concept is introduced through a **worked example first**, then generalized ("let's say I have a question about refund and shipping... now let's call this a *state*"). Students constantly interrupt with production questions, and a good chunk of the value in these sessions is in those tangents — so these notes preserve the Q&A texture where it mattered rather than only the clean takeaway.

## Timeline (sessions covered in these notes)

| Date | Focus |
|---|---|
| 18 Jul | RAG pipeline recap: ingestion, chunking strategies, embeddings, vector DBs |
| 19 Jul | Retrieval deep-dive: dense vs. sparse, BM25, SPLADE, RRF teaser, evaluation metrics (Recall@k, MRR, NDCG) |
| 1 Aug | Hybrid retrieval decision-making, agent/tool fundamentals, production memory architecture (checkpointers, summarization vs. trimming, cross-session memory, streaming), guardrails |
| 2 Aug | RAGAS evaluation framework, golden datasets; project group formation (9 groups, 9 industry domains) |
| 8 Aug | Career/mindset session ("learn the city, not just the arrow") + deployment-strategy framing |
| 9 Aug | Student demo debrief (Amazon Seller Support Assistant) with full pipeline decisions and metrics; guest Q&A on industry trends |
| 16 Aug | LangGraph introduction: why it exists, N8N vs. LangGraph, first hands-on graph |
| 22 Aug | LangGraph deep-dive: state/node/edge from scratch, conditional edges, cost-based routing, writer–critic–reviser loop |
| 23 Aug | LangGraph recap + a live "Medium article writer" multi-agent demo |
| 29 Aug | Production RAG maintenance (incremental re-embedding), Deep Agents / agent harness, skills vs. tools, a resume-tailoring capstone demo |
| 30 Aug | Student capstone build session: LangGraph orchestrator combining RAG + SQL agent + MCP + Deep Agent, with human-in-the-loop |

{: .note }
Two additional early sessions exist as audio-only transcripts without speaker separation (their content is folded into the relevant topic pages rather than given their own page).

## How to use these notes

- Read pages **1 → 16** in order the first time through — later pages assume the vocabulary from earlier ones (state/node/edge, thread ID, golden dataset, etc.).
- Every page that reflects a specific classroom exchange keeps the shape of the original reasoning (the wrong-turn-then-correction), because that's usually more instructive than the clean final answer.
- Where the instructor gave a number (a threshold, a token limit, a percentage improvement), it's kept as a concrete anchor — even though your own numbers will differ, having *a* real number to reason from beats an abstract "it depends."
- The [Capstone Case Studies](14-capstone-case-studies) page is the fastest way to see how every earlier topic fits together into one real system.

## The single biggest recurring theme

Across nearly every session, the instructor pushes back on the idea that AI coding tools replace understanding fundamentals. The clearest version of this shows up in the [Career & Industry Notes](15-career-and-industry-notes) page, but it's worth stating up front because it explains *why* these sessions spend so much time on "why," not just "how":

> Building something has become very cheap. Understanding why it works, why it fails, and how to make it better has become the valuable, scarce skill.

Every deep-dive in this course — the RRF ranking-magnitude problem, the BM25 saturation curve, the memory-summarization sweet spot — is really practice at *that* skill, not just a tour of APIs.
