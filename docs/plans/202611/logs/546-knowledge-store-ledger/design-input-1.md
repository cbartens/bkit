## Session Prompt — this run's, newer than everything below

/bkit-design #546

## Issue description — oldest

Upgrade jsonl ledgers and docs/ templates to proper knowledge store

### Problem

Agents can't find the ledger rows that matter, and nothing flags rows that have gone stale.

- **Size.** Folded to current rows on 2026-11-01:

<!-- prettier-ignore -->
| Ledger | Current rows | Size |
  | --- | --- | --- |
  | `docs/knowledge.jsonl` | 112 | 247 KB |
  | `docs/decisions.jsonl` | 409 | 685 KB |
  | `docs/deferrals.jsonl` | 112 | 151 KB |
  | `docs/failures.jsonl` | 22 | 30 KB |

- **Reading cost.** `.agents/rules.md` § Check gotchas first tells an agent to read every current knowledge row before touching code. That is about 60k tokens, estimated at 4 characters per token. The decisions ledger is too big to read whole, so an agent finds rows only by grepping for words it guesses.
- **Replaced rows.** 45 rows are `SUPERSEDED` (12 knowledge, 33 decisions), and none names the row that replaced it.
- **Dependencies.** A row that rests on another row points at it only through an untyped `references` entry, mixed in with paths, commits and issue numbers. When the row it rests on is superseded, nothing flags the rows that depended on it.

### Outcome

The JSONL ledgers stay the only record of truth in git. Agents load only the rows relevant to the task. A check flags every current row whose premise has been superseded or closed.

### Success criteria

- A `SUPERSEDED` row's successor can be found by a tool, not only by a person reading the text.
- Superseding or closing a row lists every current row that declared `dependsOn` on it.
- An agent starting a task loads the relevant rows, not every current row. Token cost is measured before and after.
- Keyword search over the ledgers needs no runtime beyond Node.
- Search by meaning is available as an opt-in template, off by default.

### Constraints and non-goals

- No binary database in git. Any index is built locally from the JSONL and gitignored.
- No Python or embedding model in core. Those may appear only in the opt-in template.
- Ledgers keep `merge=union` and same-`key` append semantics.
- Not a transcript store. Recall over personal chat history, such as mempalace mining `~/.claude/projects`, is out of scope.

### Decisions already made

- `546-jsonl-ledgers-stay-the-store-memory-tools-index-only` in `docs/decisions.jsonl`. The JSONL ledgers stay the store. mempalace or a similar tool is at most an opt-in local index over them, never the store.
- `546-ledger-rows-carry-supersedes-and-dependson-links` in `docs/decisions.jsonl`:
  - Rows gain `supersedes: [key]` and `dependsOn: [key]`.
  - A check lists the current rows whose premise was superseded or closed.
  - Agents select rows by overlap between a row's `references` paths and the task's files, plus a short, size-capped digest. An `area` tag is added only if paths prove insufficient.

### Open questions

- Which kinds get `supersedes` / `dependsOn`: `decision` and `knowledge` only, or `deferral` and `failure` too?
- Where does the dependency check run: `bkit ledgers check`, a `bkit:gate` entry, or the ledger updaters (`@bkit-utility-update-*`)?
- Do existing key-shaped `references` entries get backfilled into the new fields? If old consumer rows are rewritten, that needs a migration registered in `docs/migrations.md`.
- Does `node:sqlite` provide FTS5 in the Node versions bkit supports, or is a pure-JS keyword index needed?
- Does mempalace's miner store one ledger row per drawer, or does it chunk across rows?
- What goes in the always-loaded digest, and what is its size cap?
- Do the `docs/` templates in the original one-line ask need any change beyond the ledger work?

### References

- mempalace review: https://github.com/cbartens/bkit/issues/546#issuecomment-6553275993
- https://github.com/MemPalace/mempalace (`website/concepts/knowledge-graph.md`, `website/concepts/memory-stack.md`, `website/concepts/contradiction-detection.md`)
- `.bkit/jsonl.md` § Per-Kind Fields, § Key & References
- `.agents/rules.md` § Check gotchas first

## Issue comment — posted 2026-10-14T01:52:55.000Z

Finding a context and knowledge engine that **runs locally** and can be **cleanly committed to Git** comes down to solving a core technical tension: **Git is designed for line-by-line text diffing, while most vector databases write opaque binary blobs that bloat repositories and cause merge conflicts.**

Depending on whether your priority is human-readable, PR-mergeable documentation or high-performance vector search, there are two primary approaches.

---

### 1. Embedded File-Based Vector Databases (Best for Semantic Search)

If you need vector search (RAG, embeddings, similarity lookups) embedded directly in your app without spinning up Docker containers or cloud services:

#### **LanceDB (Top Pick for Vector Performance)**

- **How it works:** LanceDB is an open-source, serverless embedded vector database written in Rust with Python, TypeScript, and Rust bindings. It operates directly on the disk using the Lance columnar data format (built on Apache Arrow).
- **Git compatibility:** It persists as a directory of structured files on disk. While binary, it is self-contained. For small reference datasets, it can live directly in the repo, but for large production stores, it is best tracked with **Git LFS**.
- **Why it shines:** Unlike SQLite or client-server databases, Lance supports zero-copy disk queries, automated indexing (IVF-PQ, HNSW), and scales to millions of vectors with almost zero memory overhead.

#### **sqlite-vec (Top Pick for Git Diffing & Portability)**

- **How it works:** A lightweight, pure C SQLite extension for fast vector search from the creator of `sqlite-vss`. It runs anywhere SQLite runs (Python, Node.js, Go, Rust, mobile).
- **Git compatibility:** SQLite stores everything in a single `.db` file. Crucially, you can serialize and export SQLite databases to plain text using `.dump` (SQL statements), making the context store **100% text-diffable and mergeable** inside Git if desired.
- **Why it shines:** Zero runtime dependencies, ACID compliance, and standard relational metadata queries combined with semantic vector search.

#### **DuckDB + `vss` Extension**

- **How it works:** In-process columnar OLAP database featuring an HNSW-based vector similarity search extension.
- **Git compatibility:** Single `.duckdb` binary file. Best tracked via Git LFS.
- **Why it shines:** Exceptional for hybrid analytics—combining full-text search, complex SQL joins, and vector similarity in one local engine.

---

### 2. Git-Native Context Systems (Best for Teams, Agents, and PRs)

If your goal is to give AI coding agents (Claude Code, Cursor, Copilot, Aider) or local LLMs structured long-term memory that lives natively in version control, binary databases are often the wrong abstraction. Team branches will constantly generate unresolvable binary merge conflicts.

Instead, the modern standard is a **text-first knowledge graph / context engine**:

#### **The "LLM Wiki" Pattern / Markdown Context Layers**

- **Implementations:** Projects like `llm-wiki-okf` (Open Knowledge Format) or the `.context` framework.
- **How it works:** Knowledge is stored as structured Markdown files with YAML frontmatter, strict cross-links (creating a document graph), and path-scoped rules (e.g., `.context/`, `AGENTS.md`, or `.cursor/rules/`).
- **Git compatibility:** Native. Every addition or change by an LLM is a standard `git commit` with clear line diffs and full blame history.
- **Retrieval:** Agents navigate the files via deterministic graph links, BM25/ripgrep, or lightweight local AST tools rather than opaque vector embeddings.

#### **Aider’s Repo-Map Engine**

- **How it works:** Uses Tree-sitter parsers to build an Abstract Syntax Tree (AST) of the repository, then applies a PageRank graph algorithm over symbol definitions and references.
- **Git compatibility:** Zero committed database overhead. It maps the code dynamically directly from your working tree.

---

### Comparison of the Top Options

<!-- prettier-ignore -->
| Engine | Storage Format | Git Diffable? | Best For | Typical Retrieval Method |
| --- | --- | --- | --- | --- |
| **LanceDB** | Columnar (Lance files) | No (Binary / LFS) | Local vector RAG, fast dense embeddings | HNSW / Vector similarity |
| **sqlite-vec** | SQLite (`.db` or `.sql`) | Yes (via SQL dump) | Relational + vector data, lightweight apps | Cosine / L2 vector distance |
| **DuckDB (`vss`)** | Columnar single-file | No (Binary / LFS) | Analytics + vector hybrid search | HNSW vector index |
| **Markdown / Wiki (`.context`)** | Markdown + YAML | Yes (Native text) | Agent memory, project documentation, rules | BM25, ripgrep, AST traversal |

---

### The Verdict

- **If you want true semantic / embedding vector search:** **LanceDB** is the best engine. It is embeddable, fast, and requires no background daemon. Track the data folder with Git LFS if the dataset exceeds a few tens of megabytes.
- **If you want relational data with vector capabilities in a single portable file:** **sqlite-vec** is the easiest to embed, and its ability to dump to plain SQL makes it the most Git-friendly binary store.
- **If you want repository context and memory for coding agents:** Avoid committing raw vector stores. Adopt the **Markdown / LLM Wiki** approach (plain text files committed directly to the repo), and let a local tool generate an ephemeral vector index or use ripgrep/AST parsing on checkout.

## Issue comment — posted 2026-10-14T01:54:58.000Z

**bkit** is an orchestration and context-engineering harness—it provides the **PDCA (Plan-Do-Check-Act) workflow**, quality gates, sprint token budgeting, and spec-verification rules for coding agents like Claude Code, Cursor, and Codex.

Because `bkit` focuses on **process governance and verification** ("Docs = Code", gap detection, and agent guardrails), what complements it best is an engine that handles **deep codebase indexing, dependency graph retrieval, and multi-session local memory**.

The top tools and architectures that pair best with `bkit` fall into three distinct layers:

---

### 1. The Ideal Partner: Graphify (Code Knowledge Graph)

**Graphify** is an open-source, local knowledge-graph engine purpose-built for coding agents.

- **Why it fits `bkit`:** During `bkit`’s planning and investigation phases (e.g., `sprint-master-planner`), feeding raw files directly into the context window burns your sprint token budget rapidly. Graphify uses Tree-sitter AST parsers locally to map your functions, classes, imports, and cross-file calls into a persistent graph (`graphify-out/graph.json` and `GRAPH_REPORT.md`).
- **How they interact:** When `bkit` runs a gap analysis or prepares a design spec, the agent queries the Graphify graph (`graphify query "..."` or `graphify path A B`) via MCP. The agent receives exact symbol relationships with zero hallucination and minimal token usage.
- **Git compatibility:** The AST cache and graph reports live directly in your project root, letting agents inspect dependency trees without cloud dependencies.

---

### 2. The Memory Layer: Structured Markdown Wiki (`.context/`)

`bkit` relies heavily on deterministic markdown deliverables (`PRD.md`, `plan.md`, `design.md`, and completion reports). To give `bkit` persistent memory across sprints and branches, combine it with a **hierarchical markdown context store**.

- **Why it fits `bkit`:** Binary databases cause git merge conflicts when multiple branches run agent sprints. A plain-text markdown directory (e.g., `.context/` or an `AGENTS.md` hierarchy) provides a clear audit trail.
- **How they interact:**
- `bkit` enforces the _execution loop_ (Check/Act).
- The Markdown layer stores _system invariants_, architectural decision records (ADRs), and database schemas that `bkit` agents read before drafting a sprint plan.

- **Git compatibility:** 100% native git diffs, PR reviews, and line-level blames.

---

### 3. The Unstructured Retrieval Layer: `sqlite-vec`

While code structure is best handled by ASTs (like Graphify), unstructured background information (historical PR discussions, customer bug reports, external API specs) needs semantic retrieval.

- **Why it fits `bkit`:** `sqlite-vec` runs as an in-process C extension inside standard SQLite with no background daemon or Docker container required.
- **How they interact:** When `bkit` is tasked with fixing complex regressions or referencing third-party documentation, `sqlite-vec` performs fast cosine-similarity search across chunked text.
- **Git compatibility:** Because SQLite can be serialized with `.dump` into plain SQL text files, you can commit text snapshots to Git and reconstruct the binary database locally on checkout.

---

### Recommended Unified Architecture

<!-- prettier-ignore -->
| Component | Tool / Format | Role in the Pipeline |
| --- | --- | --- |
| **Workflow & Verification** | **bkit** | Enforces PDCA, runs gap detection against specs, budgets sprint tokens, gates PR merges. |
| **Code Structure Index** | **Graphify** | Parses codebase into a local AST knowledge graph; traces calls, types, and dependencies. |
| **Long-Term Context** | **`.context/` (Markdown + YAML)** | Stores project invariants, ADRs, coding conventions, and sprint archives in Git. |
| **Semantic Store (Optional)** | **sqlite-vec** | Performs local vector search over past PR discussions, issue logs, and external API docs. |

By combining **bkit** (the control loop and quality gates) with **Graphify** (the structural codebase map) and a **git-tracked Markdown layer** (persistent context), you resolve both token bloat and code drift without introducing cloud dependencies or binary Git conflicts.

## Issue comment — posted 2026-10-14T03:56:39.000Z

What you are describing is one of the most intellectually rich problems in computer science and artificial intelligence. It spans several decades of foundational AI theory, modern agent memory architectures, and temporal database design.

The core concepts that directly implement tracking **temporally bounded truth** and **tracing decisions back to invalidated premises** exist across four major domains:

---

### 1. Truth Maintenance Systems (TMS / ATMS)

_The formal AI mechanism for cascading invalidations._

In classical symbolic AI, Jon Doyle and Johan de Kleer created **Truth Maintenance Systems (TMS)** and **Assumption-Based TMS (ATMS)** specifically to solve this problem.

- **How it works:** Instead of storing just isolated facts, a TMS stores facts alongside their **justifications** (the premises or rules that led to the conclusion) and **assumptions** (hypotheses taken to be true for now).
- **Cascading Invalidation:** Every node is evaluated as either `IN` (believed) or `OUT` (not believed). When an assumption flips from `IN` to `OUT` (because new evidence renders it false), the TMS runs **dependency-directed backtracking**. It walks the directed acyclic graph (DAG) of justifications and automatically flips every downstream decision or deduction that relied on that assumption to `OUT`.
- **Where to look:** Modern implementations exist as logic programming libraries (Datalog engines, Drools with truth maintenance enabled, and custom DAG reasoners).

---

### 2. Temporal Knowledge Graphs (TKGs) & Agent Engines

_The modern LLM framework implementation._

Standard knowledge graphs store static triples: `(Subject, Predicate, Object)`—for example, `(Service_A, depends_on, Database_X)`. Temporal knowledge graphs turn triples into **quadruples or sextuples**:

{(Subject, Predicate, Object, [valid\_start, valid\_end], [system\_start, system\_end])}

- **Graphiti (by Zep):** An open-source, local-first engine specifically built to create dynamically evolving temporal knowledge graphs for LLM agents. When an agent learns new information that contradicts an older fact, Graphiti does not overwrite the old data; it marks the edge's validity interval as expired, introduces the new fact, and preserves the historical state.
- **ICEWS / GDELT / YAGO:** Large-scale academic and geopolitical knowledge graphs that model temporal facts and event-driven state transitions.

---

### 3. Bitemporal Databases & Immutable Event Stores

_The database architecture for "Time Travel" queries._

In data architecture, this problem is solved by **Bitemporal Data Modeling** (formalized in the SQL:2011 standard) and **Immutable Event Sourcing**:

- **Two Axes of Time:**

1. **Valid Time:** The period during which a fact was true in the real world (e.g., _"We assumed our API rate limit was 1,000 req/min from Jan 1 to March 15"_).
2. **Transaction Time:** The exact timestamp when your system recorded that fact.

- **XTDB (formerly Crux) & Datomic:**
- In Datomic or XTDB, databases are append-only fact stores. You never `UPDATE` or `DELETE` an existing fact; you assert a new "retraction" fact.
- Because history is immutable, you can query: _"What was the state of our knowledge at timestamp $T_1$, and which downstream transactions cited entity $E$ as an input?"_

- **TerminusDB & Dolt:**
- "Git for data." In TerminusDB (a revision-controlled knowledge graph), you can branch, commit changes to knowledge, inspect diffs, and audit which queries or decisions were generated against a specific commit hash before an upstream assumption was altered.

---

### 4. Architectural Decision Records (ADRs) with Dependency DAGs

_The pragmatic, repo-committed software engineering practice._

If you want this committed directly to your repository in a human- and agent-readable format, the standard pattern is **Assumption-Driven ADRs**:

- **Structure:** In an ADR, the "Context" section is broken down into explicit **Hypotheses / Invariant Assumptions**:

```markdown
# ADR-0014: Use Polling Instead of WebSockets for Sync

## Assumptions:

- [ASSUMP-01] Concurrent connected users < 500 (Valid until: Q4 2026)
- [ASSUMP-02] Third-party provider does not emit webhook events

## Decision:

Implement a 10-second polling worker.

## Downstream Impact:

Relies on ASSUMP-01, ASSUMP-02.
```

- **Decision Invalidation:** When `ASSUMP-01` breaks (e.g., users reach 5,000), an automated script or agent checks the assumption registry, flags ADR-0014 as `STALE / SUPERSEDED`, and alerts the engineering team that the original justification collapsed.

---

### How to Apply This to Agent Tooling (like `bkit`)

If you want to bake this directly into an agent pipeline:

1. **Explicit Assumption Registries:** When an agent generates a design spec or plan, enforce that it explicitly outputs an `assumptions.json` or YAML block declaring what it assumes to be true and the conditions that would invalidate it.
2. **Provenance Pointers:** Store each decision with a list of assumption IDs that act as its justifications (a lightweight TMS in plain text).
3. **Pre-flight Invalidation Scans:** During planning or sprint review, have the agent run an audit pass: _"Given the current codebase and live constraints, are any referenced assumptions in our past ADRs/specs now false?"_ If yes, trigger a task to re-evaluate the dependent decisions.

## Issue comment — posted 2026-11-01T04:04:44.000Z

How about https://github.com/mempalace/mempalace?

## Issue comment — posted 2026-11-01T04:13:39.000Z

## mempalace review, and what to take from it

**Verdict:** don't use [mempalace](https://github.com/MemPalace/mempalace) as the store for this issue. Borrow its ideas into the JSONL ledgers, and offer it, or a similar tool, only as an opt-in template that indexes the ledgers on the user's machine. The JSONL files stay the record of truth at core.

### Why it can't be the store

- **Committing its database doesn't fix merging.** The database is a ChromaDB folder or, with the `sqlite_exact` backend, one SQLite file. Both can be committed. But when two branches each add rows, each branch has a different binary file, and git can only keep one. The other branch's rows vanish until someone rebuilds. The ledgers merge cleanly today through `merge=union` in `.gitattributes`.
- **Each file is tied to one embedding model.** Changing the model means re-embedding everything (its README says so).
- **It stores what was said, not what is true.** It keeps transcripts word for word and never marks one as replaced. Ledger rows work the other way: they are short, and a later row with the same `key` replaces an earlier one.
- **Its "flag what's now stale" feature doesn't exist yet.** The knowledge graph has `invalidate` and `supersede`. Contradiction detection is marked "planned … not a shipped end-to-end feature" in `website/concepts/contradiction-detection.md`.

### The gap today is finding rows, not storing them

Folded to the newest row per `key`, current rows only, measured on this repo on 2026-11-01:

<!-- prettier-ignore -->
| Ledger | Current rows | Size |
| --- | --- | --- |
| `docs/knowledge.jsonl` | 112 | 247 KB |
| `docs/decisions.jsonl` | 409 | 685 KB |
| `docs/deferrals.jsonl` | 112 | 151 KB |
| `docs/failures.jsonl` | 22 | 30 KB |

`.agents/rules.md` § Check gotchas first tells an agent to read every current knowledge row before touching code. That is about 60k tokens, estimated at 4 characters per token. The decisions ledger is far too big to read whole, so an agent can only find the right decision rows by grepping for words it guesses.

### Proposal 1: typed links between rows (from its `supersede` / `invalidate`)

- `supersedes: [key]` on the new row names the row it replaces.
- `dependsOn: [key]` names the rows a decision rests on.
- **What it fixes:** 45 rows are `SUPERSEDED` today (12 knowledge, 33 decisions), and none of them says which row replaced it. Links between rows already half-exist: about 147 `references` entries match the ledger-key pattern (counted across all lines, including repeated updates). They are mixed in with file paths, commits and issue numbers, so no tool can follow them.
- **The check it enables:** when a row turns `SUPERSEDED` or `CLOSED`, list every current row whose `dependsOn` points at it, for someone to review. That is the "a decision whose premise died" idea from the earlier comment. It needs no graph database, because the links live in the JSONL row itself.
- Probably `bkit ledgers check` grows to cover this, plus a `bkit:gate` entry. Exact place to be decided at design.

### Proposal 2: load only the rows that matter (from its wings/rooms and its L0–L3 wake-up layers)

- Select rows whose `references` paths overlap the files a task touches, instead of reading every current row. Most rows already carry paths, so this needs no new field. Add an `area` tag only where paths turn out not to be enough.
- Keep a short digest that every agent always loads, with a fixed size cap. Everything else is looked up when needed.

### Proposal 3: optional search index

- `bkit ledgers search "<text>"` builds a gitignored index from the JSONL on first use and never commits it.
- Core: keyword search. Still to check: whether `node:sqlite` has FTS5 in the Node versions bkit supports, or whether a pure-JS index is needed.
- Opt-in template: search by meaning, using embeddings, through mempalace or similar. Still to check: whether its miner stores one ledger row per chunk ("drawer").
- At 400–700 rows, path matching plus keyword search may cover most lookups. Meaning-based search helps when the wording differs (for example "401" versus "token rotation"). This hasn't been measured.

### Still open

This issue's body doesn't say which pain it targets. The figures above point at finding the right rows and at stale decisions. They don't point at storage.

## Issue comment — posted 2026-11-01T04:17:59.000Z

**Scoped for design.**

- **Issue body:** rewritten into the idea shape: problem with the measured ledger sizes, outcome, success criteria, constraints, decisions already made, open questions. The original one-line ask stays as the first line.
- **Label:** added `next:design`.
- **Decisions recorded** in `docs/decisions.jsonl` (commit 882732627 on `dev`, not pushed):
  - `546-jsonl-ledgers-stay-the-store-memory-tools-index-only`
  - `546-ledger-rows-carry-supersedes-and-dependson-links`

Next step: `/bkit-design #546`.

## Issue comment — posted 2026-11-01T04:36:28.000Z

## Survey: can an open-source tool be adopted as a template, the way Serena and graphify were?

**Short answer:** yes, but not as the store. Nothing out there stores what the ledgers store: short rows of what is currently true, replaced by a same-`key` append, merged across branches as text. Both decisions already on this issue hold up. What changes is the picture of where a tool fits and how much of the fix needs no tool at all.

### What the ledgers already are, seen from outside

bkit already has the shape of Karpathy's "LLM wiki" pattern (April 2026): an immutable raw layer (the four ledgers and the plans), a compiled layer agents read first (`docs/*.md`), a schema telling agents how to write both (`.bkit/authoring.md`), and a lint loop (`bkit check` plus the four `utility-update-*` sweeps). The one piece of that pattern bkit lacks is the entry point: an agent is told to read every current knowledge row rather than an index that points it at the five that matter. That is the 60k-token cost above. It is a retrieval gap, not a storage gap.

### Tools checked, and why each is out as the store

- **Graphiti (Zep):** a real temporal graph with invalidation, but it needs Neo4j or FalkorDB running (Kuzu, the embedded option, is now deprecated) and an LLM call to ingest each fact. Too heavy for core, and the ingest is non-deterministic.
- **mem0, cognee, Hindsight, mempalace:** all remember conversations and retrieve by similarity. They answer "what was said" and never mark a fact replaced. Wrong object.
- **Basic Memory:** closest in philosophy (markdown as truth, rebuilt SQLite index, relation lines that map onto `dependsOn`), but AGPL, Python 3.12, and it wants to own the notes. That would be a second store, which is exactly why Serena's memory feature is off in `.serena/project.yml` (`no-memories` mode).
- **beads (Steve Yegge):** the one project that had this exact design, JSONL in git with typed links including `supersedes`. It has since moved to Dolt, and its README now calls the JSONL "an export for viewers and interchange, not the source of truth". The README gives no reason. bkit's ledgers hold 657 current rows written by a handful of agents, so the scale that pushed beads to a database is not present here.

### Where a tool does fit: qmd as the search-by-meaning template

[qmd](https://github.com/tobi/qmd) is the best match for the opt-in slot: MIT, Node, SQLite with FTS5 and sqlite-vec, local models, an MCP server with `query` and `get`. It fits the graphify template shape: a copy-and-own script plus `.qmd/index.yml`, nothing binary committed. Two things to design around:

- It treats one file as one document, so the template needs an export step that writes one gitignored markdown file per current row.
- On macOS it needs Homebrew's SQLite for extension loading.

Not confirmed: whether its keyword-only mode avoids the ~2 GB model download. That is why keyword search must not depend on it.

### Keyword search needs no tool at all

Node's own SQLite build compiles FTS5 in: `deps/sqlite/sqlite.gyp` at node v24.0.0 sets `SQLITE_ENABLE_FTS5`, and Node 24.16 creates an FTS5 table through `node:sqlite`. bkit requires Node >= 24, so the open question "FTS5 or a pure-JS index" is answered: FTS5, zero dependencies, index under a gitignored path, rebuilt when the ledger changes.

### The digest needs a smaller cap than assumed

Key plus one summary line for every current row, measured 2026-11-01:

<!-- prettier-ignore -->
| Ledger | Current rows | Digest size |
| --- | --- | --- |
| `docs/knowledge.jsonl` | 112 | ~5k tokens |
| `docs/decisions.jsonl` | 411 | ~18k tokens |
| `docs/deferrals.jsonl` | 112 | ~5k tokens |
| `docs/failures.jsonl` | 22 | ~1k tokens |

Decisions alone exceed any always-loaded budget. So the digest should be knowledge-only, or path-overlap selection has to carry the weight. That selection is cheap: 93% of current knowledge rows and 96% of current decision rows already carry a file path in `references`.

### Suggested build order for the design

1. `bkit ledgers context --files <paths>`: fold, select rows by path overlap, print them. No schema change, and it removes the whole-ledger read from the seven prompts that carry "Check gotchas first". Measure tokens before and after.
2. `supersedes` and `dependsOn` fields plus `bkit ledgers check`, the "decision whose premise died" list. The truth-maintenance idea from the thread reduces to a few lines of TypeScript because the links live in the row.
3. `bkit ledgers search`: FTS5 over the folded rows, gitignored index.
4. The qmd template for search by meaning, with the per-row export.

Sources: [Karpathy's LLM wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), [qmd](https://github.com/tobi/qmd), [beads](https://github.com/steveyegge/beads), [Graphiti](https://github.com/getzep/graphiti), [Basic Memory](https://github.com/basicmachines-co/basic-memory), [Hindsight's self-hosted comparison](https://hindsight.vectorize.io/blog/2026/08/11/open-source-agent-memory-systems), [cognee's framework list](https://www.cognee.ai/open-source-memory-frameworks-llm-agents), [Node v24.0.0 sqlite.gyp](https://raw.githubusercontent.com/nodejs/node/v24.0.0/deps/sqlite/sqlite.gyp).

## Issue comment — posted 2026-11-01T04:40:04.000Z

## Assumptions: a row kind with a falsifier, not a confidence number

Two follow-up ideas were raised: a new `assumptions.jsonl`, or a confidence % on `knowledge` rows. Both point at a real gap. The second is the wrong fix for it.

### Assumptions are already captured, then lost

Every plan has an `Open Questions & Assumptions` section the owner must confirm, and its template line already has the right shape: "what the plan takes as given → what breaks if it is wrong" (`docs/templates/bkit-plan.md:104`). `@bkit-design-spike` goes further and restates each unknown as a claim a probe could disprove. Then the plan is archived, and nothing can point at the assumption again.

So the thing to build is not a new way of writing assumptions. It is giving the ones already written a `key`, so a decision can declare `dependsOn` on it and the dependency check from this issue can flip dependents when one dies. That is the truth-maintenance idea from the earlier comment with no new engine.

### Why not a confidence %

- `friction` rows already carry `confidence` and `lastConfirmed`. Eleven rows in this repo have a value. Nothing in the engine reads either field; only the validator knows they exist. A percentage on `knowledge` rows would be the same write-only number.
- The flaky-test design refused a pass-rate field and used `updates` plus `ts` instead (`.bkit/jsonl.md` § Categories). Re-observation is a same-`key` append, so recurrence and recency already fall out of the fold. The same holds for a gotcha.
- An agent writing "80%" has no basis for the number, two agents write different numbers for the same fact, and no check can act on it. What a percentage stands in for is "how do we know this", and that is a closed enum (observed in a failure, read in upstream docs, assumed), not a number. The last value is exactly what becomes an assumption row.

### Proposal for the design

- **A kind `assumption`.** Fields: `key`, `summary`, `description?`, a required `falsifiedBy` (the concrete observation that would break it, e.g. "folded ledger rows exceed 5,000" or "two workflows append the same ledger within a minute"), optional `validUntil` (unix ms), `status` of `ACTIVE` / `FALSIFIED` / `SUPERSEDED`. Dependents point at it through `dependsOn`.
- **Refuse a row without `falsifiedBy`,** the way a `deferral` without `reason` is refused. Otherwise agents mint assumptions freely and the ledger fills with restated rationale.
- **Writers:** `@bkit-plan-generate` at plan close, from the section the owner confirmed; `@bkit-design-spike` for claims it could not settle; the owner in a direct chat.
- **Reader:** `@bkit-utility-update-decisions`, which already tests every active row against docs and code. It gains one step: re-test `falsifiedBy`, and on `FALSIFIED` list the rows whose `dependsOn` names it.
- **Where it lives:** `kind: assumption` rows inside `docs/decisions.jsonl` rather than a fifth file. The fold identity already includes `kind`, the sweep that should retest them is the one that reads that file, and no new ledger, writer-table row or updater agent is needed. What would overturn this: a reader of `docs/decisions.jsonl` that assumes every row is a `decision`. The design should check for one.

The one place a number belongs is `validUntil`, because a timestamp is something a check can compare.

## Issue comment — posted 2026-11-01T04:45:20.000Z

## One ledger instead of four

Question raised: should `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl` and `docs/failures.jsonl` become one file? Judged on design merits, not migration cost: **yes, with one condition. Reads go through a tool, never the raw file.** This issue is building that tool, so the condition will hold.

### Why the split by kind is the weaker model

The four files are views baked into storage. In code they are already one ledger: `foldFrom(paths)` in `.bkit/core/engine/ledgers/telemetry.ts` merges a list of files, and identity is `(kind, repo, key)`, so a file boundary carries no meaning. What it carries is cost:

- **Agents check gotchas but not decisions before coding.** That is not doctrine. The knowledge file was small enough to read whole and the decisions file was not, so the rule grew around file sizes. With one ledger and selection by path overlap, an agent gets the relevant decision and deferral rows for the files it touches for free.
- **Each of the four updaters sweeps its file, then searches "the other three" for pointers.** The `Cross-Ledger Impact` section in those prompts exists only because of the split. One sweep over one file with per-kind steps replaces four sweeps plus their bookkeeping.
- **The same fact lives in two files under two keys as it moves through its life.** A failure becomes a gotcha after the fix. A deferral with reason `needs-decision` becomes a decision. Today those are two unrelated rows. In one file an entry can carry its history: raised as a failure, closed as knowledge.
- **Links need a namespace.** `dependsOn` and `supersedes` point at keys. Across four files a key may legally exist in two kinds (none do today; identity permits it), so every link needs a qualifier or a four-file search. One file with globally unique keys makes a link a plain string.

This is the shape append-only systems settled on: one log of typed events, views derived from it. It is also what the tools in the survey do: beads with one table and a type column, the MCP memory server with one file.

### The decision hiding inside the merge

Whether `kind` stays part of identity.

- **Stays:** the merge is cosmetic. Cleaner, same model.
- **Leaves** (identity becomes `(repo, key)`, `kind` a field that a same-`key` append can change): the lifecycle gain above, plus a new risk, a careless append flips a decision into a deferral. Guard: a closed list of allowed transitions, enforced where `KIND_WRITERS` is enforced today.

### What stays out

`.bkit/friction.jsonl` is a drained queue and cannot be union-merged. `.bkit/stats.jsonl` is machine telemetry at a different volume. The line: what the project knows (true, decided, deferred, broken, assumed, and arguably the `feature` rows of `.bkit/issues.jsonl`) in one ledger; what machines measured and what gets drained in their own files.

### Costs that remain, all small

- The PR diff stat says `+3` in one file instead of naming the kind. The reviewer reads the rows anyway, and `kind` is in the first line of each.
- Per-concern git history goes. A `--kind` filter on a log command replaces it.
- A mixed file is harder to skim by eye. Skimming by eye is the thing being retired.

### Two notes for the design

- Land the merge together with `supersedes` / `dependsOn`: the link resolver is simpler written once against one file than twice.
- Name it by what it holds, `docs/ledger.jsonl`, in line with how bkit names files.

## Issue comment — posted 2026-11-01T04:52:20.000Z

## Third-party tools reviewed, and what replaces each

Everything looked at across this thread, with the verdict against the chosen shape: one JSONL ledger in git plus small pieces in core. The sub-issues are #791 (context by path overlap), #792 (typed links and dead-premise check), #793 (FTS5 keyword search), #794 (qmd template for search by meaning) and #795 (merge into one ledger).

<!-- prettier-ignore -->
| Tool | What it is | Verdict | Why, and what was taken from it |
| --- | --- | --- | --- |
| [mempalace](https://github.com/MemPalace/mempalace) | Transcript memory, ChromaDB or SQLite, Python, embedding model | Rejected as store | Binary store cannot merge across branches; tied to one embedding model; keeps what was said, never marks a fact replaced; contradiction detection still "planned". Taken: `supersede` / `invalidate` as typed links (#792), wake-up layers as the size-capped digest (#791). |
| [Graphiti](https://github.com/getzep/graphiti) (Zep) | Temporal knowledge graph for agents | Rejected | Needs a Neo4j or FalkorDB server (Kuzu, the embedded option, deprecated) and an LLM call per ingested fact; ingest is non-deterministic. Taken: validity intervals become `status`, `supersedes` and `validUntil` fields (#792, assumption rows). |
| [mem0](https://github.com/mem0ai/mem0) / OpenMemory | Conversation memory by similarity, graph behind the paid tier | Rejected | Wrong object: remembers conversations, not what is currently true. Vector store, Python. |
| [cognee](https://github.com/topoteretes/cognee) | Graph-first memory, embedded SQLite, LanceDB and Kuzu by default | Rejected | Graph built by LLM extraction, Python runtime, derived triples rather than rows anyone wrote on purpose. |
| [Hindsight](https://hindsight.vectorize.io) (Vectorize) | Self-hosted memory, one Docker container with embedded Postgres | Rejected | A server for 650 rows; transcript memory. |
| Supermemory, [Letta](https://github.com/letta-ai/letta) | Hosted fact-graph memory; full agent runtime with memory tiers | Rejected | Hosted or a whole runtime; neither is a store a repo commits. |
| [Basic Memory](https://github.com/basicmachines-co/basic-memory) | Markdown notes as truth, rebuilt SQLite index, MCP server, FTS plus embeddings | Rejected | AGPL, Python 3.12, and it wants to own the notes, which makes a second store, the reason Serena's memory feature is off (`no-memories` in `.serena/project.yml`). Taken: files as truth with a derived, rebuildable index (#793); relation lines as `dependsOn` (#792). |
| [beads](https://github.com/steveyegge/beads) | Issue tracker for agents, formerly JSONL in git, now Dolt; Go; MIT | Rejected | It is a tracker, and bkit's tracker is GitHub, Linear or Jira; Dolt is a binary store. It moved off JSONL-in-git, and its README gives no reason. Taken: one table with a type column (#795), typed links including `supersedes` (#792), `bd remember` / `bd prime` as the shape of `bkit ledgers context` (#791). |
| [qmd](https://github.com/tobi/qmd) | Local hybrid search over text files: FTS5, sqlite-vec, local GGUF models, MCP server; Node; MIT | Adopted as opt-in template (#794) | Not core: about 2 GB of models, Homebrew SQLite on macOS, one file is one document so rows must be exported first. Right shape for the "search by meaning, off by default" slot. |
| [MCP memory server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) | Entities, relations and observations in one JSON or JSONL file | Rejected | No status, no supersession, free-form entity names, no merge story. Confirms the one-file shape (#795). |
| [Karpathy's LLM wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) | A pattern, not a tool: raw sources, agent-compiled wiki, schema file, lint loop | Already in place | bkit has the shape: ledgers as raw layer, `docs/*.md` as compiled layer, `.bkit/authoring.md` as schema, `bkit check` and the `utility-update-*` sweeps as lint. The missing piece is the entry point, which is #791. |
| LanceDB, sqlite-vec, DuckDB `vss` | Embedded vector stores (first comment in this thread) | Rejected as committed stores | Binary files: Git LFS, and one branch wins on merge. sqlite-vec reappears inside qmd, local and gitignored (#794). |
| XTDB, Datomic, Dolt, TerminusDB | Bitemporal databases and "git for data" (earlier comment) | Rejected | A database server or binary for a bitemporal query the ledgers need two fields for: `validUntil` and `supersedes` (#792). |
| Truth maintenance systems (Doyle, de Kleer) | Facts with justifications; an invalidated premise flips its dependents | Idea taken, no library | `dependsOn` plus `bkit ledgers check` is the whole mechanism, a few lines of TypeScript (#792). |
| log4brains, MADR, adr-tools | ADR formats and site generators with superseded-by links | Rejected | One markdown file per decision and a site; the ledgers already carry status. Taken: an explicit superseded-by link (#792). |
| Orama, MiniSearch, FlexSearch | Pure-JS full-text search libraries | Not needed | Node 24's bundled SQLite compiles FTS5 in (`deps/sqlite/sqlite.gyp` at v24.0.0), and bkit requires Node >= 24, so keyword search needs no dependency (#793). MiniSearch (MIT, zero dependencies) is the fallback. |
| Serena memories | The memory feature of the Serena MCP server bkit already ships a template for | Stays off | An unmanaged second store under `.serena/memories/`; same reason as Basic Memory. |

**What replaces them, in core:** `bkit ledgers context` by path overlap (#791), `supersedes` and `dependsOn` with a dead-premise check (#792), `bkit ledgers search` on `node:sqlite` FTS5 (#793), one merged ledger (#795). Search by meaning is the only piece that stays a third-party tool, as the opt-in qmd template (#794).

## Grill decisions — the owner's answers in this run, the newest text

Settled = the human's answer; the design follows it and flags any departure for the human to confirm. Assumed = unconfirmed default; override only with a stated reason. Open = unknown; the design states how it resolves each.

Facts looked up during the interview:

- Sub-issues exist: #791 (`bkit ledgers context` by path overlap, `next:plan`), #792 (typed links and dead-premise check, `next:plan`), #793 (FTS5 keyword search, `next:plan`), #794 (qmd template, `next:design`), #795 (merge into `docs/brain.jsonl`, `next:design`).
- Node 24's bundled SQLite compiles FTS5 in, and bkit requires Node >= 24: keyword search needs no dependency. The mempalace drawer question is moot because qmd was picked for the opt-in slot.
- `APPEND_LEDGERS` in `.bkit/core/engine/ledgers/telemetry.ts:386` maps one file to one kind; the merge changes that table. `.bkit/jsonl.md` § Versioning and § Compaction are the only sanctioned line rewrites.
- Six prompts plus `.bkit/core/.agents/rules.md` carry "Check gotchas first": `bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, `bkit-utility-update-decisions`, `bkit-utility-update-knowledge`.
- Existing `ask` settings live in `package.json` under `bkit.workflows.*` (e.g. `package.json:188`).

### Settled

- Q1 Design scope: one design covers all five sub-issues (#791–#795), one plan each, ordered by dependency.
- Q2 One ledger file: merge `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl` into one file, landed together with the typed links; existing installs move over through a `bkit upgrade` migration registered in `docs/migrations.md`.
- Q3 Assumption kind: add kind `assumption` with a required `falsifiedBy` (row refused without it) and optional `validUntil`; dependents point at it through `dependsOn`.
- Q4 Which kinds get links: all kinds in the brain (knowledge, decision, deferral, failure, assumption, summary). Owner note: also consider a `relatedTo` link (settled in Q10).
- Q5 Where the premise-gone check runs: `bkit ledgers append` prints the current dependents when a row is replaced or closed, and `bkit ledgers check` lists all of them on demand; never a blocking gate; brain update acts on the list.
- Q6 Backfill: once, inside the merge migration, append same-`key` rows carrying the new link fields for references that match an existing key exactly; old lines are not hand-edited outside the migration; consumer repos get it through `bkit upgrade`.
- Q8 Folder paths: a folder in `references` matches every file under it, at any depth.
- Q9 docs/ templates: no change beyond the ledger file names and read instructions they mention.
- Q10 `relatedTo`: add a third link `relatedTo: [key]`, undirected "see also", informational only; the premise-gone check ignores it.
- Q11 File name: `docs/brain.jsonl`.
- Q12 Identity: entries are identified by repo + key, keys unique across the whole brain; `kind` is a field a later row may change only along a closed list of allowed transitions (e.g. failure → knowledge, deferral → decision), enforced beside `KIND_WRITERS`.
- Q13 Generic row format: the owner asked the design to review the `docs/brain.jsonl` structure and make it generic enough to store different item types and interlink them. Adopt one envelope (`key`, `kind`, `status`, `summary`, one `links` block holding `supersedes` / `dependsOn` / `relatedTo`, `references` for paths / commits / issues, a per-kind body). The merge migration rewrites every old row into it once; the reader still accepts the old shape for rows appended on branches opened before the upgrade.
- Q14 Other files: `.bkit/issues.jsonl` `feature` rows stay out for now (the format allows them later); `.bkit/friction.jsonl` and `.bkit/stats.jsonl` stay separate.
- Q15 Brain update replaces updaters: the owner asked the design to explore a recurring process that (a) cleans up the brain like compaction and (b) updates it like the current ledger updaters, and also makes new links and new summaries. One brain update pass replaces `@bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`; compaction becomes its cleanup step; `@bkit-utility-update-roadmap`, `-tracker`, `-documentation` stay.
- Q16 When brain update runs: on demand, plus an opt-in scheduled run; never inside a design / plan / build / debug / ship run.
- Q17 Who approves: no PR. Mechanical cleanup lands directly; inferred changes (links, summaries, closures, corrections) are suggestions the owner reviews and approves, the way audit findings are, governed by Q19.
- Q18 Summaries: `summary` rows inside the brain, linked with `relatedTo` to the rows they summarise, rebuilt by each brain update; they may feed the always-loaded summary (Q7).
- Q19 Two modes: the recurring process is named **brain update** (not "dream"). A `package.json` setting `bkit.brain.update.ask` (shaped like the existing `ask` settings) picks the mode: `true` → brain update writes a report with a `Suggested Changes` table, the owner approves rows in chat, only approved rows are appended through `bkit ledgers append` (`bkit brain append` per Q26); `false` → brain update applies the same changes directly.
- Q20 Rejections: with `ask: true`, a rejected suggestion is recorded and not offered again until the rows it was about change.
- Q21 Default: `bkit.brain.update.ask` defaults to `true`.
- Q22 Contradictions: every brain update looks for pairs of current rows that say opposite things and proposes a `supersedes` link or a correction.
- Q23 Patterns into lessons: brain update looks for repeats across brain rows and archived plans' `Open Questions & Assumptions` sections and proposes one `knowledge` or `assumption` row stating the pattern, linked with `relatedTo` to its sources; `.bkit/friction.jsonl` excluded.
- Q24 Fading: rows fade by age, no inbound links, and shared recall (refined in Q25). Owner direction: recall must be shared so a row does not fade while at least one person uses it often.
- Q25 Shared recall: store a `lastRecalled` date per entry, written only by brain update from each person's local gitignored recall log (written by `context` / `search` reads); readers take the newest date across all of the entry's rows so merges never lose a recent recall; a row is flagged to fade when old, unlinked and not recalled by anyone for a set time.
- Q26 Command names: all ledger commands move under the `bkit brain` noun (`bkit brain append`, `bkit brain check`, `bkit brain compact`, `bkit brain context`, `bkit brain search`, `bkit brain update`), not `bkit ledgers`.
- Q27 Build order: (1) merge + generic format + links (#795 with #792), (2) loading rows by file (#791), (3) keyword search (#793), (4) brain update, (5) qmd template (#794).
- Q28 Concurrency: no lock. Two brain updates may run at the same time, as two workflows can; the design supplies a mechanism to deal with conflicts between concurrent runs instead of serialising them.
- Q29 Draft acceptance scenario: accepted.

### Assumed, not confirmed

None.

### Open

- Q7 Always-loaded summary: what goes in it and its size cap is left to the design to decide, from measurement (knowledge digest ~5k tokens, decisions ~18k, deferrals ~5k, failures ~1k today).

### Draft Acceptance Scenario

> **DRAFT only:** reviewed in the design interview. Starting point for the design's Acceptance Scenario, not a fixed contract: the design may change any part, and records each change as a Decisions row.

#### Narrative

An agent about to change some files runs one command and gets back the brain rows that touch those files, plus a short summary, instead of reading the whole knowledge ledger. When the owner replaces or closes a row, bkit immediately lists the rows that rested on it. On demand or on a schedule, brain update tidies the brain, checks rows against the code, links related rows, spots contradictions and repeated patterns, and, depending on `bkit.brain.update.ask`, offers those changes for approval or applies them.

#### Success Criteria

1. The pre-code ledger read costs measurably fewer tokens (measured before and after on the same three tasks), and no prompt tells an agent to read a whole ledger file.
2. `bkit upgrade` turns the four ledgers into one `docs/brain.jsonl` in the generic row format with no row lost; fold winners, `bkit stats` figures and the `docs/roadmap.md` render are unchanged.
3. Every replaced row with a known successor can be followed to it by a tool; replacing or closing a row lists every current row whose `dependsOn` points at it, at write time and in `bkit brain check`.
4. Keyword search runs on Node alone; search by meaning (qmd) is an opt-in template, off by default.
5. With `ask: true`, brain update changes nothing but mechanical cleanup without owner approval, and a rejected suggestion is not offered again until its rows change; with `ask: false`, it applies changes directly.

#### Key Edge Cases

- A branch opened before the upgrade appends old-shape rows to the old files after the merge: the reader accepts them and the next brain update moves and normalises them.
- Two branches append to the same entry at once (including `lastRecalled`): union merge keeps both rows; recall takes the newest date across the entry's rows.
- A kind change not on the allowed list is refused.
- A link names a key that does not exist, or `dependsOn` links form a loop: the check flags both and never crashes.
- The same key exists in two of the four old files during the merge (none today): the migration needs one fixed, repeatable rule.
- Two brain updates run at the same time on the same repo (no lock): their changes and suggestion approvals must not overwrite or contradict each other.

#### Process Sketch

- WHEN an agent starts a task touching files F → THEN it gets the current rows whose `references` name F or a folder above F, plus the capped summary.
- WHEN a row is appended as `SUPERSEDED` or `CLOSED` → THEN the append prints the current rows that `dependsOn` it, and `bkit brain check` lists them too.
- WHEN `bkit upgrade` runs on an old install → THEN the four ledgers become `docs/brain.jsonl` envelope rows, links are filled from exact-key references, and the fold result is unchanged.
- WHEN brain update runs with `ask: true` → THEN cleanup is applied and a `Suggested Changes` report is written; only rows the owner approves are appended, and rejections are remembered.
- WHEN brain update runs with `ask: false` → THEN the same changes are applied directly.
- WHEN a row is old, unlinked and not recalled by anyone for the set time → THEN brain update flags it to fade.
