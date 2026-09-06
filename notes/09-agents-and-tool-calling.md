---
title: Agents & Tool Calling
layout: default
nav_order: 10
permalink: /notes/09-agents-and-tool-calling
---

# Agents & Tool Calling
{: .no_toc }

1. TOC
{:toc}

---

## What a tool actually is

Stripped of the mystique: **"tools is nothing but a method, with a parameter engine."** A tool is a function the LLM can choose to call, described to it via metadata (name, description, parameter schema) — that metadata is precisely what lets the LLM decide *which* tool fits a given request, without you hardcoding the dispatch logic yourself. The RAG pipeline itself can be exposed as a tool the same way any database lookup or API call can be: "the RAG guarding also, it's a tool" — chunking through generation is just one tool call from the agent's perspective.

## Tools are stateless — and that's a deliberate design point

A student asked a genuinely good question: if I call a tool, then call it again, does it remember the previous call? The answer: **no — there's no memory of previous API call status, no proper state management inherent to a tool itself.** Any statefulness in an agentic system comes from *outside* the tool — from the memory/checkpointer layer covered in [Production Memory Architecture](07-production-memory-architecture), not from the tool implementation.

## Chains vs. agents: the dividing line

This distinction gets formalized more fully once LangGraph is introduced (see [LangGraph Fundamentals](10-langgraph-fundamentals)), but the seed of it appears here: a simple LLM-plus-tools setup (what the class built first, using LangChain) runs in a fixed forward direction — prompt to LLM is a pipeline, one step feeds the next, and there's no going back. A student asked directly: *"it's only forward, right? There's no [way back]?"* — and the honest answer at this stage was no, not with a simple chained agent. Adding branching, retries, and cycles (going back to an earlier step based on a later result) is exactly the capability gap that motivates LangGraph.

## `create_react_agent`: automating the whole RAG-as-a-tool pattern

A specific LangChain/LangGraph convenience function came up: `create_react_agent` effectively automates the "wrap your entire RAG pipeline as a callable tool for an agent" pattern — chunking through retrieval through generation, packaged as one tool call the agent can invoke as part of a larger task. Inside a single agent built this way, you can register multiple tools for multiple distinct tasks, and **tool selection is dynamic** — the agent (not your code) decides which registered tool best matches the current user request, based on each tool's metadata/description.

## Session scoping: one session, one intent

A subtle production point: it's worth deliberately scoping a single conversational session to a single task/category, rather than letting one long-running thread wander across unrelated tasks. The stated reasoning is mostly about **cost control** — otherwise, LLM cost balloons as irrelevant context piles up in a thread that should have been closed and restarted. This connects directly to the thread-ID design discussed in [Production Memory Architecture](07-production-memory-architecture): starting a fresh thread for a new task isn't just a UX choice, it's a cost-control mechanism.

## Tool-call failure handling

Production tool-calling needs explicit failure handling, not an assumption that every call succeeds:

| Failure type | Handling strategy |
|---|---|
| Rate limit | Exponential backoff and retry |
| Auth error | Credential refresh — never a blind retry, since retrying with expired credentials just fails again |
| Invalid parameters | Return a structured error back to the model so it can self-correct, ideally caught by schema validation *before* the call is even attempted |
| Tool unavailable | Fall back to an alternate tool or degrade gracefully rather than failing the whole request |

## Where risk-gating starts (and where it's fully developed)

The idea of a "safe tool" — one where a risky action (update, delete) pauses for explicit human confirmation before executing — is introduced conceptually here but deliberately deferred to full treatment once LangGraph provides the actual mechanism (interrupts / human-in-the-loop nodes) to implement it properly. See [LangGraph Fundamentals](10-langgraph-fundamentals) and the split read/write SQL-agent pattern in [Capstone Case Studies](14-capstone-case-studies) for how this plays out in a real build.
