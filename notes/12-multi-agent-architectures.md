---
title: Multi-Agent Architectures
layout: default
nav_order: 13
permalink: /notes/12-multi-agent-architectures
---

# Multi-Agent Architectures
{: .no_toc }

1. TOC
{:toc}

---

## One box, one agent

The class's working visual convention: **every box in a graph diagram — an "events database agent," a "weather agent," a "restaurant agent" — is one node, and each node can itself be a full agent (an LLM plus its own tools).** A single LangGraph application routinely wires together many such agent-nodes, and *how those nodes talk to each other* is what "multi-agent architecture" actually refers to.

The running illustrative example: a travel-planning assistant where a flights agent, once it completes a booking, triggers a hotels agent for a recommendation in the same city, which in turn triggers a car-rental/excursion agent — each a separate node/agent, connected by edges representing "when this finishes, call that."

## The five architecture styles named in class

LangGraph itself documents (and the course walked through) five ways multiple agents can be wired together:

| Style | Structure | When it fits |
|---|---|---|
| **Network** | Any agent can call any other agent directly | Flexible, but harder to reason about and debug |
| **Supervisor** | One central agent delegates to multiple specialist agents, each reports back to the supervisor | Predictable, auditable, easiest to debug — the course's default recommendation |
| **Hierarchical** | Agents connect in layers — one agent connects to several, each of which connects to several more, information flowing down/up level by level | Fits naturally when the task itself has a tree-like decomposition |
| **Supervisor-as-tools** | The supervisor treats each specialist agent *as if it were just another tool it can call* | A lightweight variant of supervisor — less explicit orchestration logic, more "just another function call" |
| **Custom** | Anything else you design yourself | For cases the other four don't fit cleanly |

{: .note }
**Supervisor** was described as the most commonly reached-for pattern in the course's own capstone builds — the orchestrator LangGraph in [Capstone Case Studies](14-capstone-case-studies) is a supervisor pattern: one top-level graph deciding which specialist (RAG, SQL agent, MCP tool, Deep Agent) to invoke per user intent.

## Can a graph be a node inside another graph?

A genuinely good question a student raised while designing her own capstone: if a sub-task is complex enough to deserve its own internal reasoning (a "deep agent" doing multi-step planning), should that live as *one node* in the main graph, or as an *entirely separate graph nested inside* a node of the main graph?

**The answer given: both are valid, and the right choice depends on the sub-task's complexity.** A simple sub-task (call one tool, format a response) is fine as a single node. A sub-task that itself needs multiple steps, its own retries, or its own state (like a planning agent that must check inventory via SQL *and* weather via MCP before it can produce a plan) is a legitimate candidate for being modeled as its own nested graph, invoked from a node in the parent graph.

**The one hard requirement, stated explicitly:** "the only part is, you need to maintain your state properly" — if a nested graph is going to read from or write to the parent graph's shared state, that state-passing needs to be designed deliberately, not assumed to work automatically. Getting this wrong is exactly the failure mode covered in [Capstone Case Studies](14-capstone-case-studies), where a "deep agent" node ended up behaving like a plain nested LangGraph rather than actually using the deep-agent framework's own planning capability, because the state/tooling wiring wasn't done the way the framework expected.

## Sub-agents: a lighter-weight alternative to a full nested graph

Distinct from a nested *graph*, a **sub-agent** is a smaller, purpose-built agent invoked by a parent agent for one narrow task — given its own focused system prompt and instructions, but without necessarily needing its own full state-graph structure. The example built in class: a "Price Lister" sub-agent, instructed narrowly to *"extract items plus price bullets from the chat, nothing else — ignore old, struck-through prices."* The parent agent calls this sub-agent as part of a larger task (compiling a shopping list from a messy group-chat conversation) without needing to model that extraction step as its own full graph.

This is the same distinction that shows up again in [MCP & Deep Agents](13-mcp-and-deep-agents): a **skill** is even lighter-weight than a sub-agent — a piece of on-demand reference knowledge, not a separate reasoning unit at all.

## Conflict resolution between agents

Briefly named, for cases where two agents in a network-style architecture might disagree or produce conflicting outputs:

- **Hierarchical arbitration** — a higher-level supervisor makes the final call.
- **Voting/bidding** — agents contribute toward a consensus mechanism.
- **Debate** — agents justify their reasoning to each other before a decision is reached.
- **Human-in-the-loop escalation** — for genuinely irreconcilable cases, defer to a human.

## Design principle carried through into the capstone

By the time the course reaches its final capstone architecture (see [Capstone Case Studies](14-capstone-case-studies)), the multi-agent design has converged on a clear rule that's worth generalizing: **split agents by risk profile, not just by function.** Rather than one "SQL agent" handling both reads and writes, the capstone architecture splits it into a read-only reporting agent (no human gate needed — nothing can go wrong from a `SELECT`) and a separate data-mutation agent (always requires human approval before an `INSERT`/`UPDATE`/`DELETE` executes). The same risk-based split applies to any tool or sub-agent capable of an irreversible action.
