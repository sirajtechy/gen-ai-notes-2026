---
title: "RAG: Ingestion & Chunking"
layout: default
nav_order: 4
permalink: /notes/03-rag-ingestion-and-chunking
---

# RAG: Ingestion & Chunking
{: .no_toc }

1. TOC
{:toc}

---

## The pipeline, end to end

Every RAG conversation in this course keeps coming back to the same four-stage skeleton, and it's worth having it fixed before going deep on any one stage:

```
INGESTION → CHUNKING → EMBEDDING → STORAGE → (query time) RETRIEVAL → RE-RANKING → GENERATION
```

The instructor's repeated warning: **everything downstream is interlinked, and a mistake early cascades**. If retrieval quality is poor, the fix might not be retrieval at all — it might be the chunking strategy, or even further back, a parsing library that silently mangled a table. Debug in that order: parsing → chunking → embedding → retrieval → re-ranking, not the reverse.

## Step 1: Ingestion — getting data into a digestible form

Data arrives in every format — PDF, PNG (needs OCR), Word, CSV, Excel, DynamoDB, a traditional RDBMS, unstructured text. Two library ecosystems came up repeatedly:

### PDF parsing: not all loaders are equal

| Library | Behavior | Verdict |
|---|---|---|
| `PyPDFLoader` (naive) | Breaks tables, breaks formatting; treats each word/line independently | Fast but structurally destructive — LLM can misinterpret table data |
| `PyMuPDF` (`fitz`) | Preserves document structure | Kept structure intact → better downstream LLM comprehension |
| `pdfplumber` | Good at explicit table extraction | Compared directly in a student capstone (see [Capstone Case Studies](14-capstone-case-studies)) — lost to PyMuPDF on both accuracy *and* speed |

{: .important }
In the one real head-to-head evaluation run by students (Amazon Seller Support project), **PyMuPDF beat both `pypdf` and `pdfplumber`** on retrieval-quality metrics *and* was the fastest of the three. Treat "PyMuPDF by default" as a reasonable starting prior, but the instructor's broader point stands: run the comparison on *your* documents before committing.

### LangChain vs. LlamaIndex for ingestion

- **LlamaIndex** has by far the deepest library of format-specific parsers (`LlamaParse`, `LlamaHub`) — PDFs, OCR images, CSV, Excel, NoSQL, SQL, all in one consistent interface. It has moved from purely open-source toward a commercial API tier as it's gained traction; the open-source path still exists.
- **LangChain** covers the same ground with fewer built-in conveniences (e.g., no native sentence-window splitter — the class implemented that one by hand).
- **Rule of thumb given in class:** reach for LlamaIndex when you want ingestion done for you with minimal code; reach for LangChain when you want everything — ingestion, chains, agents — inside one consistent library, and don't mind writing a bit more glue code.

## Step 2: Chunking — six strategies, in the order they were taught

You can't send a whole document to an LLM per query — context-length limits and cost both push you to chunk. The six strategies, each with the trade-off as explained in class:

| Strategy | How it works | Trade-off |
|---|---|---|
| **Fixed-size** | Cut every *N* characters, with overlap so context isn't lost at the boundary | Simple, fast; blind to sentence/idea boundaries |
| **Recursive** | Split by structural unit first (paragraph, then sentence) before applying size limits | Respects natural document structure — the class's practical default |
| **Semantic** | Walk sentence-by-sentence, tracking cosine similarity between consecutive sentences; cut where similarity drops (topic shift) | Chunks stay topically coherent; costs an embedding pass to compute the boundaries |
| **Sentence-window** | Index individual sentences for precision, but *retrieve* the sentence plus its neighbors | Precise matching without losing surrounding context — had to be hand-built in LangChain (no native support at the time) |
| **Parent–child (small-to-big)** | Embed small child chunks for retrieval precision, but hand the larger parent chunk to the LLM for generation | Best of both: precise retrieval, rich generation context — described as "really efficient... when you are working in production" |
| **Document-structure-aware** | Chunk according to the document's own structure — code blocks by function/class, HTML by tags, Markdown by headers | Essential for code and structured docs; a Python function shouldn't be chunked the same way as prose |

{: .note }
Parent–child chunking was singled out as the production-grade sweet spot: do the similarity check on the small, precise child chunk, but pass the larger semantic parent to the LLM so it has enough surrounding context to actually answer well.

## Step 3: Embeddings — decide once, live with it forever

The historical arc taught: Word2Vec (CBOW, skip-gram) → GloVe → FastText → modern LLM-provided embeddings. Then the practical decision framework:

1. **Multilingual requirement?** Decide *before* you start — you cannot retrofit multilingual support onto a monolingual embedding space later without re-embedding everything.
2. **Modality?** Text-only, or text+image, or text+image+voice — this determines which embedding family is even viable.
3. **Open-source vs. proprietary?** Hugging Face's leaderboard was the recommended starting point for open-source options; **Qwen 3B embeddings** was called out as a strong, free, efficient choice.
4. **Cost and dimension** — decided last, once the above constraints have narrowed the field.

{: .warning }
**You cannot change your embedding model after the fact without re-embedding your entire vector store.** If your database has millions of records, that's a genuinely expensive, GPU-hour-consuming mistake to make in production. This decision gets made once, carefully, up front — and the same embedding model must be used both when inserting documents *and* when embedding user queries at retrieval time.

## Ingestion-time metadata: the thing that saves you later

A theme that only fully pays off when you get to [Production Memory Architecture](07-production-memory-architecture) and incremental updates: tag every chunk at ingestion time with metadata — **document ID**, and where useful, **chapter ID** and **page ID**. This isn't optional bookkeeping; it's the only practical way to later find and replace *just* the changed portion of a document instead of re-embedding everything from scratch. See [Capstone Case Studies](14-capstone-case-studies) for how this played out when a student asked exactly this question in a live session.
