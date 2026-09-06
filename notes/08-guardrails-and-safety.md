---
title: Guardrails & Safety
layout: default
nav_order: 9
permalink: /notes/08-guardrails-and-safety
---

# Guardrails & Safety
{: .no_toc }

1. TOC
{:toc}

---

## Why guardrails exist (the list given in class)

Asked directly "why do we even need a guardrail," the class brainstormed and landed on a list worth keeping intact because each item maps to a different failure mode:

- Prevent hallucination from reaching the user unchecked
- Avoid leaking sensitive/private data (PII, PHI, company secrets) into or out of the LLM
- Enable controls (block, mask, redact — see below) rather than an all-or-nothing response
- Keep the system out of unlawful or harmful territory (racist, toxic, abusive content; instructions that could cause harm)
- Protect competitive information — e.g., a company's own support chatbot should never favorably discuss or lead a customer toward a *competitor's* product

That last one is easy to overlook but genuinely came up as a real business requirement: **"you should never respond to the competitor information, when the customer is asking for something like that."**

## Two layers of guardrail, and why you need both

### Layer 1: Pattern-based (deterministic, no LLM call)

Implemented as **regular-expression-based middleware** — fast, cheap, and *not* an LLM call, which matters because it doesn't add meaningful latency to every request. Built-in PII types typically covered out of the box: email, credit card, IP address, MAC address, URL.

For each detected pattern, you choose a strategy:

| Strategy | Use case |
|---|---|
| **Block** | Don't even send the message — hard stop |
| **Redact** | Remove for compliance/logging purposes |
| **Mask** | Replace with a placeholder, human-readable in a support UI |
| **Hash** | Preserve for analytics/debugging while still hiding the raw value |

For anything beyond the built-in types — an internal account-number format, say — you write a **custom PII middleware** with your own regex pattern. This is still purely deterministic pattern matching, not semantic understanding.

### Layer 2: Semantic/intent-based (an LLM moderation call)

Regex can't catch a harmful *intent* expressed in ordinary language ("how do I build a bomb" contains no PII pattern to match). This requires a dedicated **moderation model** — OpenAI's Omni-moderation was the example used — that scores incoming text against trained categories: sexual content involving minors, harassment, hate speech, threats, illicit behavior, violence, self-harm intent/instructions, graphic violence, and more. Each category gets a score; cross a threshold, and the request is flagged and stopped **before it ever reaches the main LLM call.**

{: .note }
A student asked whether a guardrail should be counted as one of the evaluation metrics (alongside faithfulness, recall, etc.). The instructor's distinction: **guardrails are a feature you implement, not a metric you compute** — they're an extra gate the request passes through, conceptually similar to input validation, not part of the RAG quality-evaluation framework covered in [RAG Evaluation](06-rag-evaluation-ragas).

## Two-guardrail pattern seen in a real capstone

The Amazon Seller Support project (see [Capstone Case Studies](14-capstone-case-studies)) implemented exactly this two-layer idea concretely:

1. **Query-time classification guardrail** — an LLM-based classification prompt determines whether the incoming question falls within the bot's intended scope (seller-related) or outside it (buyer/product questions). Out-of-scope queries get rejected with a default answer immediately.
2. **Confidence-score guardrail** — the top retrieved chunk's similarity/confidence score is checked against a threshold (0.35 in their build). Below threshold, the bot returns a default "I don't know" rather than presenting a low-confidence answer as if it were reliable.

## What belongs in a guardrail vs. what belongs in the system prompt

A sharp distinction came up: if a medical-support chatbot gets asked an HR-policy question, that's a **scope mismatch**, and it does *not* need a dedicated guardrail — it's handled by the system prompt itself ("you are an assistant specialized in X; for anything outside that, respond with [fallback message]"). Reserve guardrails for things you genuinely need to *prevent from ever reaching the LLM* — PII exposure, unlawful content, competitor leakage — not for routine scope management, which prompting already handles.

## Build vs. buy: don't roll your own in production

The instructor's position here is unusually blunt for a course otherwise focused on building things from scratch: **do not build your own guardrail system for production.** The reasoning:

- Guardrails need to be both **fast** (latency-sensitive, sitting in the critical path of every request) and **low-false-positive** (an overly strict homegrown guardrail that flags harmless questions will frustrate real users just as much as a missed harmful one would hurt you).
- Enterprise options — **AWS Bedrock Guardrails**, Azure's equivalent, and open-source **NVIDIA NeMo Guardrails** — ship with published, benchmarked accuracy numbers (e.g., "blocks up to X% of harmful content at Y% accuracy") that you can rely on rather than having to independently prove out.
- "Guardrail is not that much of an expensive addition. It's cheaper and faster [to buy], and it's not a good practice to experiment with your guardrail" the way you might experiment with a chunking strategy — the cost of getting safety wrong is asymmetric in a way that cost of a suboptimal chunk size isn't.

**LangChain does offer an open-source guardrail middleware** (used for the demos in class), which is fine for prototyping and understanding the mechanics, but was explicitly called out as not something to rely on as your only safety layer in a real production system.

## Human-in-the-loop: the guardrail for *actions*, not just *content*

Everything above concerns what an LLM says. A separate, equally important guardrail concerns what an **agent does**. Any action with real-world side effects and a meaningful blast radius — deleting a database row, updating a record, sending a message on someone's behalf — should never be executed autonomously. The agent proposes the action; a human explicitly confirms before it executes.

This is developed fully once tools and LangGraph enter the picture — see [Agents & Tool Calling](09-agents-and-tool-calling) and [LangGraph Fundamentals](10-langgraph-fundamentals) for the mechanics, and [Capstone Case Studies](14-capstone-case-studies) for a concrete split-agent pattern (a read-only "select" SQL agent with no human gate, versus a data-mutating SQL agent that always requires approval).
