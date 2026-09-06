---
title: Embeddings & Vector Databases
layout: default
nav_order: 5
permalink: /notes/04-embeddings-and-vector-databases
---

# Embeddings & Vector Databases
{: .no_toc }

1. TOC
{:toc}

---

## FAISS: the analogy that made HNSW click

FAISS (Facebook AI Similarity Search) is a library, not a managed database, and it ships two core indexing approaches. The instructor's neighborhood-search analogy is worth keeping because it's genuinely the clearest explanation of *why* approximate nearest-neighbor search works the way it does:

**HNSW (Hierarchical Navigable Small World):** imagine looking for a specific person in a city of a thousand people, where you don't have a directory. You ask *anyone* nearby if they match your criteria; if not, you ask who *they* know who's a closer match, and hop to that person. You keep hopping through the social graph until you stop — and how far you're willing to hop (the search depth, `ef_search`) trades off directly against accuracy: more hops → more likely to find the true best match, but slower.

**IVF (Inverted File Index):** same city, but now it's organized into clusters (say, by neighborhood/country of origin). You first identify which *cluster* your query probably belongs to, then only search within that cluster's members. The depth knob here is `nprobe` — how many clusters you're willing to check. More clusters checked → better recall, slower query.

Both algorithms encode the same fundamental trade-off: **search depth vs. latency vs. accuracy**, and tuning either `ef_search` or `nprobe` is how you dial that trade-off in production.

## Vector database landscape as taught

| Database | Category | When it came up |
|---|---|---|
| **FAISS** | Open-source library, self-hosted, no managed service | The reference implementation everything else is compared against |
| **Chroma** | Open-source, local-first, has built-in metadata persistence | Chosen in a student capstone over FAISS specifically for its native metadata handling |
| **Pinecone** | Fully managed, serverless, cloud-agnostic (runs on your choice of AWS/Azure/GCP) | The go-to answer for "production-ready, don't want to manage infrastructure" |
| **Milvus** | High-performance, distributed, very low latency at scale | Called out as the top pick when latency matters more than cost, at genuine production scale |
| **Traditional DBs adding vector search** | Postgres (`pgvector`), Cassandra, ClickHouse, OpenSearch, Elasticsearch, Redis | The instructor's prediction: most traditional databases will eventually ship native vector search, reducing the need for a dedicated vector DB in many use cases |

### Decision framework given in class

- **No cost tolerance, small scale, local dev:** FAISS or Chroma.
- **Production, don't want to run infrastructure:** Pinecone (managed, serverless, cloud-agnostic).
- **Production, latency-critical, cost is secondary:** Milvus.
- **Already have a transactional database in your stack:** check whether it now supports vector search natively before adding a new system.

{: .interview }
If asked "how would you choose a vector database," the strong answer isn't naming one — it's naming the axes (managed vs. self-hosted, latency requirements, existing infrastructure, cost model) and mapping them to the FAISS/Chroma/Pinecone/Milvus spectrum above.

## A pattern worth internalizing

Across FAISS, IVF, hybrid retrieval (see [Retrieval](05-retrieval-dense-sparse-hybrid)), and even LLM cost-routing (see [LangGraph Patterns](11-langgraph-patterns)), the same shape of trade-off keeps reappearing: **how much effort/depth are you willing to spend per query, in exchange for better results?** Recognizing this as one recurring design axis — rather than a dozen unrelated tuning knobs — is the kind of "go deep on what doesn't change" thinking the course keeps pushing toward (see [Career & Industry Notes](15-career-and-industry-notes)).
