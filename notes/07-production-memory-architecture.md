---
title: Production Memory Architecture
layout: default
nav_order: 8
permalink: /notes/07-production-memory-architecture
---

# Production Memory Architecture
{: .no_toc }

1. TOC
{:toc}

---

This page reconstructs one of the densest single-session Q&As in the whole course — a long, genuinely excellent back-and-forth where students kept pushing on edge cases until the instructor's answers got concrete. It's presented here closer to that dialogue shape than a clean summary, because the *wrong turns* (why summarization isn't just "compress everything") are as instructive as the final answer.

## The starting problem: LLMs have no memory by default

Every call to an LLM is stateless. Ask a question, get an answer; ask a follow-up, and the model has no idea a previous question ever happened — unless *you* re-send the prior conversation as part of the prompt. Everything in this page is about how to do that re-sending efficiently.

## Thread ID vs. checkpointer: the two building blocks

- **Checkpointer** — the storage mechanism itself (in-memory / RAM, or persistent like SQLite, Postgres, MongoDB).
- **Thread ID** — the key used to look up *which* conversation's history to load. Think of it as a primary key: every message exchange under the same thread ID gets appended to the same growing history.

**In-memory checkpointing** is fast (no I/O — the data's already in RAM) but volatile: restart the process and the conversation is gone. **Persistent checkpointing** (SQLite for a single-node setup, Postgres for concurrent multi-user production scale) survives restarts and scales to millions of conversations, at the cost of I/O latency per turn.

## The cost problem: why you can't just keep appending forever

Every additional turn in a conversation means the *entire* history gets re-sent to the LLM on the next call — token cost and latency both grow with conversation length, even for questions with nothing to do with earlier turns. Two named strategies address this, and the class walked through both with a live running example (a chatbot fed a sequence of unrelated fun-fact questions: cats, dogs, weather, football, cooking, travel).

### Strategy 1: Summarization

Once the running token count crosses a threshold (500 tokens, in the class's demo), the *older* portion of the conversation gets collapsed into an LLM-generated summary, while the last N messages (4, in the demo) are kept verbatim. The message count in the demo tracked exactly this: 2 → 4 → 6 → 8 → 10 messages accumulating normally, then a hard reset back down to 6 (summary + last 4) once the token trigger fired — and this repeated every time the limit was hit again, with the summary itself growing to absorb more topics each time it regenerated.

**Trigger options**, all valid depending on what you're optimizing for:
- Fixed token count (500, 3000, whatever you choose)
- Fixed message count (every 50 messages)
- Percentage of the model's max context window (e.g., trigger at 80% of a 1M-token window)

**The real cost of summarization, made explicit when a student pushed on it:** every time the trigger fires, that's *an extra LLM call*, which costs both money and latency. This is not a free operation — it's a trade against the alternative cost of sending an ever-growing raw history.

### Strategy 2: Trimming

Simpler and cheaper: once a message-count or token limit is hit, just **drop** everything except the most recent N messages — no summarization LLM call, no compute cost beyond the drop itself.

**The trade-off, stated plainly:** if a user's current question depends on something from *before* the trim window, the agent will have no idea what they're talking about — there is no memory of what was discarded. This is a straightforward precision-vs-cost trade, not a strictly-better replacement for summarization.

{: .important }
**Even-vs-odd N matters for trimming.** If you keep an even number of recent messages, you get clean (question, answer) pairs. Keep an odd number and you'll cut off mid-pair — either an orphaned answer with no visible question, or a dangling question with no answer kept.

### Strategy 3 (the actual production answer): hybrid

**Combine both.** Summarize the older history once a threshold is hit, *and* always keep the last N raw messages verbatim on top of that summary. This is what the class settled on as "the most used kind of way of putting it" in production — you get the cost savings of summarization for old context, plus the precision of raw recent turns for anything the user is actively discussing right now.

There is **no universally correct threshold.** The instructor was explicit: the right token limit / message count is a "sweet spot" you find through experimentation against your own customer base, weighing customer-experience quality against LLM budget — and it's a genuine trade-off, not a solved problem. Making customers happier by keeping more context costs your stakeholders more budget; keeping costs low risks customer frustration from lost context. You pick the point on that curve deliberately, with justification, not by default.

## Cross-thread (long-term) memory: remembering the *user*, not just the session

A thread ID captures one conversation. But real products (ChatGPT, Claude) clearly remember things about *you* across entirely separate sessions with different thread IDs — how? A separate memory layer, keyed by **user ID** rather than thread ID:

- Facts about the user (name, role, interests, preferences, past projects) get written into a **personalized memory store**, saved as embeddings (not raw text) — the same embedding model already used for the RAG store.
- This store is checked and injected into the prompt **regardless of which thread ID** the user is currently on — a user can open a brand-new conversation, with no shared history, and the agent still knows their favorite programming language because that fact lives at the user-ID level, not the thread-ID level.
- Writing to this store can happen synchronously (an LLM call decides mid-conversation "this fact is worth remembering") or via a **batch process** that periodically reviews recent conversations and extracts durable facts.
- **This must be revocable.** If a user disables personalization, the expectation set in class was that the underlying facts get deleted (or at minimum made inaccessible) — this is treated as a compliance/consent requirement, not an optional nicety.

{: .warning }
**Consent and compliance came up directly.** A student asked: is it even legal to silently save all conversation history by default? The answer given: if there's any PII/PHI in what's being stored, you need masking or encryption before persistence, or an explicit disclaimer/consent step before the chat begins — "you cannot serve the customer well without saving *something*, but you need to be deliberate and transparent about what."

## Streaming: solving the "30-minute wait" problem

A concrete calculation drove this point home: if an LLM generates roughly one token per second and you ask for a 2,000-word response, a **non-streaming** implementation makes the user wait upward of 30 minutes before showing anything. That's obviously unacceptable.

**Streaming** means displaying each token to the user *as it's generated*, rather than waiting for the full response to complete. Total generation time is unchanged — but perceived latency drops enormously, because the user sees continuous progress instead of a blank, frozen screen.

This extends into multi-agent LangGraph systems too (see [Multi-Agent Architectures](12-multi-agent-architectures)): when a request passes through several nodes/agents before a final answer appears, stream the *intermediate steps* ("calling SQL agent...", "checking weather via MCP...") the same way Claude or ChatGPT surface progress during a long research task — otherwise users lose confidence that anything is happening.

## Attachments and multi-modal context (a brief note)

One student asked how image or document attachments fit into this memory model. The answer: attachments generally don't belong *inside* the question-answer memory store directly — they're handled by the RAG pipeline (for documents) with their own metadata (a document ID reference stored alongside the conversation turn), keeping the conversational memory itself lean and text-based.
