## Session Prompt — this run's, newer than everything below

[$bkit-plan](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-plan/SKILL.md) #546

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

* **How it works:** LanceDB is an open-source, serverless embedded vector database written in Rust with Python, TypeScript, and Rust bindings. It operates directly on the disk using the Lance columnar data format (built on Apache Arrow).
* **Git compatibility:** It persists as a directory of structured files on disk. While binary, it is self-contained. For small reference datasets, it can live directly in the repo, but for large production stores, it is best tracked with **Git LFS**.
* **Why it shines:** Unlike SQLite or client-server databases, Lance supports zero-copy disk queries, automated indexing (IVF-PQ, HNSW), and scales to millions of vectors with almost zero memory overhead.

#### **sqlite-vec (Top Pick for Git Diffing & Portability)**

* **How it works:** A lightweight, pure C SQLite extension for fast vector search from the creator of `sqlite-vss`. It runs anywhere SQLite runs (Python, Node.js, Go, Rust, mobile).
* **Git compatibility:** SQLite stores everything in a single `.db` file. Crucially, you can serialize and export SQLite databases to plain text using `.dump` (SQL statements), making the context store **100% text-diffable and mergeable** inside Git if desired.
* **Why it shines:** Zero runtime dependencies, ACID compliance, and standard relational metadata queries combined with semantic vector search.

#### **DuckDB + `vss` Extension**

* **How it works:** In-process columnar OLAP database featuring an HNSW-based vector similarity search extension.
* **Git compatibility:** Single `.duckdb` binary file. Best tracked via Git LFS.
* **Why it shines:** Exceptional for hybrid analytics—combining full-text search, complex SQL joins, and vector similarity in one local engine.

---

### 2. Git-Native Context Systems (Best for Teams, Agents, and PRs)

If your goal is to give AI coding agents (Claude Code, Cursor, Copilot, Aider) or local LLMs structured long-term memory that lives natively in version control, binary databases are often the wrong abstraction. Team branches will constantly generate unresolvable binary merge conflicts.

Instead, the modern standard is a **text-first knowledge graph / context engine**:

#### **The "LLM Wiki" Pattern / Markdown Context Layers**

* **Implementations:** Projects like `llm-wiki-okf` (Open Knowledge Format) or the `.context` framework.
* **How it works:** Knowledge is stored as structured Markdown files with YAML frontmatter, strict cross-links (creating a document graph), and path-scoped rules (e.g., `.context/`, `AGENTS.md`, or `.cursor/rules/`).
* **Git compatibility:** Native. Every addition or change by an LLM is a standard `git commit` with clear line diffs and full blame history.
* **Retrieval:** Agents navigate the files via deterministic graph links, BM25/ripgrep, or lightweight local AST tools rather than opaque vector embeddings.

#### **Aider’s Repo-Map Engine**

* **How it works:** Uses Tree-sitter parsers to build an Abstract Syntax Tree (AST) of the repository, then applies a PageRank graph algorithm over symbol definitions and references.
* **Git compatibility:** Zero committed database overhead. It maps the code dynamically directly from your working tree.

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

* **If you want true semantic / embedding vector search:** **LanceDB** is the best engine. It is embeddable, fast, and requires no background daemon. Track the data folder with Git LFS if the dataset exceeds a few tens of megabytes.
* **If you want relational data with vector capabilities in a single portable file:** **sqlite-vec** is the easiest to embed, and its ability to dump to plain SQL makes it the most Git-friendly binary store.
* **If you want repository context and memory for coding agents:** Avoid committing raw vector stores. Adopt the **Markdown / LLM Wiki** approach (plain text files committed directly to the repo), and let a local tool generate an ephemeral vector index or use ripgrep/AST parsing on checkout.

## Issue comment — posted 2026-10-14T01:54:58.000Z

**bkit** is an orchestration and context-engineering harness—it provides the **PDCA (Plan-Do-Check-Act) workflow**, quality gates, sprint token budgeting, and spec-verification rules for coding agents like Claude Code, Cursor, and Codex.

Because `bkit` focuses on **process governance and verification** ("Docs = Code", gap detection, and agent guardrails), what complements it best is an engine that handles **deep codebase indexing, dependency graph retrieval, and multi-session local memory**.

The top tools and architectures that pair best with `bkit` fall into three distinct layers:

---

### 1. The Ideal Partner: Graphify (Code Knowledge Graph)

**Graphify** is an open-source, local knowledge-graph engine purpose-built for coding agents.

* **Why it fits `bkit`:** During `bkit`’s planning and investigation phases (e.g., `sprint-master-planner`), feeding raw files directly into the context window burns your sprint token budget rapidly. Graphify uses Tree-sitter AST parsers locally to map your functions, classes, imports, and cross-file calls into a persistent graph (`graphify-out/graph.json` and `GRAPH_REPORT.md`).
* **How they interact:** When `bkit` runs a gap analysis or prepares a design spec, the agent queries the Graphify graph (`graphify query "..."` or `graphify path A B`) via MCP. The agent receives exact symbol relationships with zero hallucination and minimal token usage.
* **Git compatibility:** The AST cache and graph reports live directly in your project root, letting agents inspect dependency trees without cloud dependencies.

---

### 2. The Memory Layer: Structured Markdown Wiki (`.context/`)

`bkit` relies heavily on deterministic markdown deliverables (`PRD.md`, `plan.md`, `design.md`, and completion reports). To give `bkit` persistent memory across sprints and branches, combine it with a **hierarchical markdown context store**.

* **Why it fits `bkit`:** Binary databases cause git merge conflicts when multiple branches run agent sprints. A plain-text markdown directory (e.g., `.context/` or an `AGENTS.md` hierarchy) provides a clear audit trail.
* **How they interact:**
* `bkit` enforces the *execution loop* (Check/Act).
* The Markdown layer stores *system invariants*, architectural decision records (ADRs), and database schemas that `bkit` agents read before drafting a sprint plan.


* **Git compatibility:** 100% native git diffs, PR reviews, and line-level blames.

---

### 3. The Unstructured Retrieval Layer: `sqlite-vec`

While code structure is best handled by ASTs (like Graphify), unstructured background information (historical PR discussions, customer bug reports, external API specs) needs semantic retrieval.

* **Why it fits `bkit`:** `sqlite-vec` runs as an in-process C extension inside standard SQLite with no background daemon or Docker container required.
* **How they interact:** When `bkit` is tasked with fixing complex regressions or referencing third-party documentation, `sqlite-vec` performs fast cosine-similarity search across chunked text.
* **Git compatibility:** Because SQLite can be serialized with `.dump` into plain SQL text files, you can commit text snapshots to Git and reconstruct the binary database locally on checkout.

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

*The formal AI mechanism for cascading invalidations.*

In classical symbolic AI, Jon Doyle and Johan de Kleer created **Truth Maintenance Systems (TMS)** and **Assumption-Based TMS (ATMS)** specifically to solve this problem.

* **How it works:** Instead of storing just isolated facts, a TMS stores facts alongside their **justifications** (the premises or rules that led to the conclusion) and **assumptions** (hypotheses taken to be true for now).
* **Cascading Invalidation:** Every node is evaluated as either `IN` (believed) or `OUT` (not believed). When an assumption flips from `IN` to `OUT` (because new evidence renders it false), the TMS runs **dependency-directed backtracking**. It walks the directed acyclic graph (DAG) of justifications and automatically flips every downstream decision or deduction that relied on that assumption to `OUT`.
* **Where to look:** Modern implementations exist as logic programming libraries (Datalog engines, Drools with truth maintenance enabled, and custom DAG reasoners).

---

### 2. Temporal Knowledge Graphs (TKGs) & Agent Engines

*The modern LLM framework implementation.*

Standard knowledge graphs store static triples: `(Subject, Predicate, Object)`—for example, `(Service_A, depends_on, Database_X)`. Temporal knowledge graphs turn triples into **quadruples or sextuples**:

{(Subject, Predicate, Object, [valid\_start, valid\_end], [system\_start, system\_end])}

* **Graphiti (by Zep):** An open-source, local-first engine specifically built to create dynamically evolving temporal knowledge graphs for LLM agents. When an agent learns new information that contradicts an older fact, Graphiti does not overwrite the old data; it marks the edge's validity interval as expired, introduces the new fact, and preserves the historical state.
* **ICEWS / GDELT / YAGO:** Large-scale academic and geopolitical knowledge graphs that model temporal facts and event-driven state transitions.

---

### 3. Bitemporal Databases & Immutable Event Stores

*The database architecture for "Time Travel" queries.*

In data architecture, this problem is solved by **Bitemporal Data Modeling** (formalized in the SQL:2011 standard) and **Immutable Event Sourcing**:

* **Two Axes of Time:**
1. **Valid Time:** The period during which a fact was true in the real world (e.g., *"We assumed our API rate limit was 1,000 req/min from Jan 1 to March 15"*).
2. **Transaction Time:** The exact timestamp when your system recorded that fact.


* **XTDB (formerly Crux) & Datomic:**
* In Datomic or XTDB, databases are append-only fact stores. You never `UPDATE` or `DELETE` an existing fact; you assert a new "retraction" fact.
* Because history is immutable, you can query: *"What was the state of our knowledge at timestamp $T_1$, and which downstream transactions cited entity $E$ as an input?"*


* **TerminusDB & Dolt:**
* "Git for data." In TerminusDB (a revision-controlled knowledge graph), you can branch, commit changes to knowledge, inspect diffs, and audit which queries or decisions were generated against a specific commit hash before an upstream assumption was altered.



---

### 4. Architectural Decision Records (ADRs) with Dependency DAGs

*The pragmatic, repo-committed software engineering practice.*

If you want this committed directly to your repository in a human- and agent-readable format, the standard pattern is **Assumption-Driven ADRs**:

* **Structure:** In an ADR, the "Context" section is broken down into explicit **Hypotheses / Invariant Assumptions**:
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


* **Decision Invalidation:** When `ASSUMP-01` breaks (e.g., users reach 5,000), an automated script or agent checks the assumption registry, flags ADR-0014 as `STALE / SUPERSEDED`, and alerts the engineering team that the original justification collapsed.

---

### How to Apply This to Agent Tooling (like `bkit`)

If you want to bake this directly into an agent pipeline:

1. **Explicit Assumption Registries:** When an agent generates a design spec or plan, enforce that it explicitly outputs an `assumptions.json` or YAML block declaring what it assumes to be true and the conditions that would invalidate it.
2. **Provenance Pointers:** Store each decision with a list of assumption IDs that act as its justifications (a lightweight TMS in plain text).
3. **Pre-flight Invalidation Scans:** During planning or sprint review, have the agent run an audit pass: *"Given the current codebase and live constraints, are any referenced assumptions in our past ADRs/specs now false?"* If yes, trigger a task to re-evaluate the dependent decisions.

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

## Issue comment — posted 2026-11-01T07:42:13.000Z

Sub-issues brought in line with the design (`docs/plans/202611/546-knowledge-store-ledger-design.md`, owner answers in commit de5b5eaad; not on `origin/dev` until dev is pushed, so the linked design still shows the version before the answers).

- #795 — Merge the four docs/ ledgers into docs/brain.jsonl with a migration (https://github.com/cbartens/bkit/issues/795): now plan P-1 (WS-1 to WS-6), `next:design` → `next:plan`, size L → XL.
- #792 — Typed supersedes and dependsOn links plus a dead-premise check (https://github.com/cbartens/bkit/issues/792): delivered by #795's plan; stays open to track, closes when #795 ships.
- #791 — bkit brain context: load only the rows that touch the task's files (https://github.com/cbartens/bkit/issues/791): P-2 (WS-7, WS-8), renamed, blocked by #795.
- #793 — bkit brain search: keyword search over the current brain rows (https://github.com/cbartens/bkit/issues/793): P-3 (WS-9), renamed, FTS5 dropped for `ledgerScan`, blocked by #795 and #791.
- #794 — qmd template: opt-in search by meaning over the brain rows (https://github.com/cbartens/bkit/issues/794): P-5 (WS-14), renamed, `next:design` → `next:plan`.
- #797 — Brain Update (https://github.com/cbartens/bkit/issues/797): new, P-4 (WS-10 to WS-13), blocked by #795 and #791, Medium / L.

Each body now carries the `**Parent design:**` and `**Workstreams:**` lines, so `/bkit-plan #N` scopes to that plan's workstreams.

## Design — docs/plans/202611/546-knowledge-store-ledger-design.md — last committed 2026-11-01T07:33:36.000Z

<!-- bkit:anchor
baseSha: deb8b25b5a2b79bc47d28fadec46f8f80ab964ce
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Design: Brain — one knowledge ledger with typed links, file-scoped loading, keyword search and brain update

## Related Issues

- #795 — Merge the four docs/ ledgers into docs/brain.jsonl with a migration (open)
- #792 — Typed links and dead-premise check (open, sub-issue of #546)
- #791 — Load ledger rows by path overlap (open, sub-issue of #546)
- #793 — FTS5 keyword search over the ledgers (open, sub-issue of #546)
- #794 — qmd template for search by meaning (open, sub-issue of #546)
- #710 — Ledger compaction: drop superseded rows, preserve age (closed)

## Acceptance Scenario

Built from the input's `Draft Acceptance Scenario` (accepted in Q29). Changes against the draft are recorded as `Decisions` rows D-AS1 to D-AS5.

### Narrative

Before I change some files, my agent runs one command and gets back the brain rows that name those files or a folder above them, plus a short capped summary, instead of reading a whole ledger. When I replace, close or falsify a row, the append prints every current row that rested on it, and `bkit brain check` lists all of them whenever I ask. On demand or on an opt-in schedule, brain update tidies the brain, re-tests rows against the code, proposes links, summaries, contradiction fixes, pattern rows and fades, and, depending on `bkit.brain.update.ask`, either offers them to me for approval or applies them and lists what it applied.

### Success Criteria

1. The pre-code ledger read costs measurably fewer tokens: characters / 4 of what the agent is told to read, before (every current `docs/knowledge.jsonl` row) and after (`bkit brain context` output), on the same three recorded tasks. No shipped prompt, rule or doc index tells an agent to read a whole ledger file.
2. `bkit upgrade` turns the four ledgers into `docs/brain.jsonl` envelope rows with no line lost. Running it twice, or on two branches from the same base, gives byte-identical output. Fold winners (under the new identity), the whole `.bkit/stats.md` render (each reader filtered to the kinds it read before) and the `docs/roadmap.md` render are unchanged.
3. Every link is followed by a tool: a `SUPERSEDED` row's successor is found through the reverse of `links.supersedes`. Superseding, closing or falsifying a row prints every current row whose `links.dependsOn` names it, at write time and in `bkit brain check`. A `SUPERSEDED` row with no successor link is listed as a check finding.
4. Keyword search runs on Node alone (`ledgerScan` over the current fold winners, no index, no dependency), and filters by kind. Every reader that folded one per-kind file has a kind-filtered read path that returns the same rows after the merge. Search by meaning is the opt-in qmd template, off by default.
5. With `ask: true`, brain update changes nothing beyond mechanical cleanup without owner approval, and a rejected suggestion is not offered again until one of its target rows changes. With `ask: false`, it applies the same changes directly and lists each one in its run report. Two concurrent runs never apply one change twice, and a brain-update row never outranks content it did not see.

### Key Edge Cases

- **Pre-upgrade branch:** a branch opened before the upgrade appends old-shape rows to `docs/knowledge.jsonl` after `dev` merged. The zero-byte stub union-merges the branch's lines in, together with the base's old lines: the spike's real-`git` fixture (C1) showed the emptied side does not win under `git merge`, `git merge --squash -X ours` or the reverse merge, with no conflict. Readers fold `[docs/brain.jsonl, the four stubs]` and drop any stub line whose identity and `ts` the brain already holds. The next brain update moves the new lines into the brain and empties the stub again. When the migration found no unmerged branch or worktree touching the old files, it deleted them instead; a branch that appears later and still appends to one hits a modify/delete conflict, which bkit's ledger conflict resolution settles by keeping the branch's file. Readers fold it, `bkit brain check` reports it, and the next brain update moves its lines into the brain and deletes it again. A pre-upgrade worktree whose prompts still call `bkit ledgers append --ledger=knowledge` is refused with exit 8 and a message naming `bkit brain append`; nothing is written.
- **Migration run twice or on two branches:** the migration is a pure line-by-line function of its input, so both sides produce identical lines and union keeps one copy.
- **Same key in two old files** (none in this repo today): the row with the earlier first `ts` keeps the key, and the other becomes `{key}-{oldkind}` with a `relatedTo` link to it. The same rule maps later stragglers of that old kind.
- **Kind change off the allowed list** (e.g. `decision` → `deferral`): refused with exit 8, nothing written.
- **Bad links:** a link names a key that does not exist, or `dependsOn` links form a loop. `bkit brain check` reports both and never crashes or recurses without bound.
- **Concurrent brain updates (no lock):** two runs propose the same change under the same deterministic suggestion id, so the second append is skipped as already applied. A brain-update row based on an older version of an entry yields in the fold to a newer row it did not see, for example a content change landed later from a feature branch.
- **Recall across branches and people:** two branches write different `lastRecalled` dates for one entry. The fold takes the newest date across all of the entry's rows, so a merge never loses a recent recall.
- **Subagent with no shell:** the orchestrator runs `bkit brain context` and passes the rows in, the way subagents hand rows back for `append` today.
- **Large selection under the clamp:** a task touching many files selects more rows than the `ledger` clamp keeps (97 rows on one recorded task). The always-loaded part is written first, inside its own reserved budget, so the clamp cuts only path-selected rows.
- **Older bkit after the migration:** an older bkit, or a pre-upgrade worktree's engine, reads the emptied stubs, or finds the old files gone, and sees zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit; `docs/migrations.md` records the step as one-way.

### Process Sketch

- WHEN an agent starts a task touching files F → THEN it gets the capped always-loaded summary first, then the current rows whose `references` name F or a folder above F, with a token estimate.
- WHEN a reader needs every current row of one kind (open deferrals, open failures) → THEN `bkit brain list --kind=` returns exactly the winners of that kind.
- WHEN a row is appended as `SUPERSEDED`, `CLOSED` or `FALSIFIED` → THEN the append prints the current rows whose `dependsOn` names it, and `bkit brain check` lists them too.
- WHEN `bkit upgrade` runs on an old install → THEN the four ledgers become `docs/brain.jsonl` envelope rows, exact-key references become `relatedTo` links, the old files become zero-byte stubs when an unmerged branch or worktree touches them and are deleted otherwise, and the fold result is unchanged.
- WHEN a pre-upgrade branch lands rows in a stub, or brings a deleted old file back → THEN readers still see them, `bkit brain check` reports the file, and the next brain update moves them into the brain.
- WHEN a pre-upgrade worktree runs `bkit ledgers append --ledger=<knowledge|decisions|deferrals|failures>` → THEN it is refused with exit 8 and a message naming `bkit brain append`.
- WHEN brain update runs with `ask: true` → THEN cleanup is applied and a `Suggested Changes` report is written; only approved rows are appended, and rejections are recorded until a target row changes.
- WHEN brain update runs with `ask: false` → THEN the same changes are applied directly and listed in the report.
- WHEN the scheduled run executes → THEN it applies only mechanical cleanup, never an inferred change whatever `ask` says, commits the cleanup and the report to `dev` and pushes, and fails loudly with a `[bkit-brain]` line carrying the CI run id when a step fails.
- WHEN a row is old, has no inbound link and was not recalled by anyone for the fade window → THEN brain update proposes it to fade.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| One file for every brain kind | `APPEND_LEDGERS` and `foldFrom(paths)` in `.bkit/core/engine/ledgers/telemetry.ts:386` / `:2012` | `EXTEND` | `foldFrom` already merges several files. The four entries become one `brain` entry taking six kinds, and readers fold `[brain, stubs]`. |
| Identity `(repo, key)` | `identity()` in `telemetry.ts:844` | `EXTEND` | A per-kind-class case: the six brain kinds return `brain {repo} {key}`. `feature`, `friction`, `chat` and `run` keep `(kind, repo, key)`, because FIDs and brain keys often share an issue-number prefix. |
| Allowed kind changes | `KIND_WRITERS` and the writer check in `append` (`telemetry.ts:412`) | `EXTEND` | `KIND_TRANSITIONS` sits beside it and runs in the same pass, with a doc-table parity test like the one `telemetry.test.ts` holds `KIND_WRITERS` to. |
| Envelope (`status`, `summary`, `links`) | `.bkit/jsonl.md` § Generic Fields; `normalize()` and `validate()` in `telemetry.ts` | `EXTEND` | `summary` already exists (required on `knowledge` / `decision`, optional elsewhere). `links` is an optional addition that § Versioning tolerates, so `schema` stays `3`. |
| `assumption` kind with a required `falsifiedBy` | `validate()` refusing a `deferral` without `reason` | `EXTEND` | The same refusal shape. Plan templates already capture assumptions (`docs/templates/bkit-plan.md:104`), so the writers gain a place to put them, not a new way to write them. |
| `summary` kind | The same codec | `EXTEND` | A sixth brain kind with `relatedTo` links to the rows it summarises; no separate store. |
| Merge migration | `migrateLedgers` / `migrateLedgerText` in `.bkit/core/engine/ledgers/migrate.ts` (the `schema: 2` rewrite and its drop of a union-resurrected copy); called from `.bkit/core/engine/install/modules/core.ts:408` | `EXTEND` | Same install / upgrade path, same idempotence rule, same temp-file-and-rename write. A row in `docs/migrations.md`. |
| `merge=union` on the brain and the stubs | `.bkit/shared/.gitattributes` managed block (`.gitattributes:17-21`) | `EXTEND` | One added line; the four old lines stay for the stubs, and for an old file a late branch brings back. |
| Stub-or-delete check at migration | `git for-each-ref` over local and remote branches, `git worktree list`, and `git merge-base` / `git diff --name-only` as the branch tooling in `.bkit/core/engine/commands/workflow/branches.ts` uses them | `EXTEND` | Lists every branch and worktree not merged into `dev` whose changes touch an old ledger path; any hit keeps the stubs. `.bkit/issues.jsonl` is not the signal: it misses non-bkit and unpushed branches and counts every designed-but-unbuilt feature as in flight. |
| Link graph, dead-premise list, cycle and dangling-key detection | None. Searched `telemetry.ts`, `ledgers.ts` (its `check` verb checks plan-named rows only), `context.ts`; the input's survey rejected TMS, Graphiti and ADR tools as dependencies | `NEW` | No link resolver exists. A reverse index over fold winners plus an iterative walk is a few dozen lines in `.bkit/core/engine/ledgers/brain.ts`, on top of the existing fold. |
| `bkit brain check` | `bkit ledgers check --plan` in `.bkit/core/engine/commands/workflow/ledgers.ts` | `EXTEND` | Moves under `brain`; `--plan` keeps its exit code `EXIT_ROWS_MISSING`; plain `check` adds the link findings and always exits 0. |
| `bkit brain context --files` | `ledgerScan` and `clampFile(..., "ledger", ...)` in `.bkit/core/engine/commands/workflow/context.ts:438` / `:667`; beads `bd prime` as the shape | `EXTEND` | Reuses the clamp, its "dropped content was NOT read" notice and the artifact plumbing; adds path-overlap selection and a `tokensEst` figure. |
| Keyword search | `ledgerScan` in `.bkit/core/engine/commands/workflow/context.ts:667` (case-insensitive term overlap, strongest first, top 40, truncation notice); `node:sqlite` FTS5 considered | `EXTEND` | `bkit brain search` calls `ledgerScan` unchanged, fed the serialised current `readBrain` winners, with a `--kind` filter applied before the scan. On the seven recorded plan Step 4 lookups, `ledgerScan` over the winners kept all of FTS5 `bm25`'s top 10 on four lookups and missed 1, 2 and 1 on the other three; 4.0% of its kept hits matched only through JSON keys (spike C6). FTS5 has no measured need at ~650 entries (Out of scope). |
| Single-kind reads | `foldFrom([file])` callers that fold one per-kind file: `stats.ts` (deferrals), `bkit context ledger-scan --source=docs/{deferrals,failures}.jsonl` in `bkit-plan.md:293-294` and `bkit-ship.md:481`, `bkit-audit-deferrals.md:37`, `bkit-utility-update-roadmap` | `EXTEND` | `readBrain(root, {kinds, current})` and a `bkit brain list --kind=` verb return exactly the winners those readers folded before. Without the filter, `bkit stats` on the brain adds `decision`, `failure` and `knowledge` rows to its Kind table and moves the `utility` Workflow count from 81 to 563; with it, the report is byte-identical (spike C4b). |
| Brain update, deterministic half | `compactLedgerText` in `.bkit/core/engine/ledgers/compact.ts` | `EXTEND` | Compaction becomes its cleanup step; adds straggler moves, recall roll-up, fade candidates and the check. |
| Brain update, inferred half | `.bkit/core/prompts/bkit-utility-update-{knowledge,decisions,deferrals,failures}.md` | `EXTEND` | Their per-kind steps merge into one `bkit-utility-update-brain` prompt; the `Cross-Ledger Impact` sections disappear because there is one file. |
| `bkit.brain.update.ask` | `readBkitConfig` in `.bkit/core/engine/shared/settings.ts`; `ASK_POINTS` / `AskSetting` (`:80` / `:92`) as the shape it borrows | `EXTEND` | A new `BkitConfig` field read by `readBkitConfig`, not an `ASK_POINTS` entry: `AskSetting` also carries `max`, and points are `<workflow>.<point>`, while brain update has no `max` and is no workflow. |
| Suggested-changes report and approval | Audit reports under `docs/audits/{YYYYMM}/` from `@bkit-audit-generate` | `EXTEND` | Q17 asks for "the way audit findings are"; the report sits beside audit reports. |
| Rejection memory | `APPEND_LEDGERS` codec; `actionHash` / `alreadyDone` in `.bkit/core/engine/ledgers/status.ts` (content-hash dedupe of engine actions) | `EXTEND` | No store of rejected suggestions exists, but the store is one more `APPEND_LEDGERS` entry on the existing codec: a small committed `.bkit/brain-rejections.jsonl` that reuses the content-hash idea. |
| Recall log | Clamp-log append helpers in `ledgers.ts`; the run-scoped gitignored clamp log (`.bkit/workflows.md:368`); gitignored `tmp/**` (`.bkit/shared/gitignore:32`) | `ADAPT` | The same append-a-JSON-line shape under `tmp/`; the file is new. |
| Brain update orchestration | The four `bkit-utility-update-*` prompts, each a single dispatch from a direct chat; `.bkit/core/.bkit/*.md` procedure docs | `EXTEND` | No file owns a multi-step loop (engine step, per-cluster fan-out, report, apply). A procedure doc `.bkit/core/.bkit/brain.md` § Brain Update holds the steps, and `bkit brain update` prints the dispatch plan the procedure follows. |
| Newest `lastRecalled` across an entry | `firstTs` stamping in the fold and in compaction (`.bkit/jsonl.md` § Compaction) | `EXTEND` | Same "computed across the entry's rows" rule, with max instead of min. |
| Scheduled run | `.bkit/templates/.github/workflows/bkit-cloud.yml` (claude-code-action and opencode jobs, credential auto-detect); cron shape of `bkit-trivy.yml` | `ADAPT` | Credential detection and the agent jobs are reused. The `/bkit-auto <phase> <arg>` route is not: its phases resolve against the five workflows (`WORKFLOWS` in `.bkit/core/engine/commands/workflow/worktrees.ts:51`) and its dispatch input requires an issue. A separate opt-in `bkit-brain-update` job prompts the agent to follow `.bkit/brain.md` § Brain Update headless, with no issue; no engine scheduler. |
| Search by meaning | qmd (MIT, Node, FTS5 + sqlite-vec, MCP server); copy-and-own shape of `.bkit/templates/scripts/graphify/` and `serena/` | `EXTEND` | Template only, with a per-row markdown export because qmd treats one file as one document. |
| Ledger path registries | `APPEND_LEDGERS` (`telemetry.ts:386`), `SCHEMA_LEDGERS` (`migrate.ts:15`), `LEDGERS` (`branches.ts:160`), `UNION_PATHSPECS` (`ledgers.ts:104`, globs), `CLOSE_DOCS` regex (`branches.ts:1743`), `.bkit/shared/.gitattributes:17-20`, root `.gitattributes` | `EXTEND` | The literal lists import one set of path constants exported from `brain.ts`, so the old-path audit holds with no exception list. The globs and the regex already match the new files. |
| Old-path regression guard | `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` | `EXTEND` | Added assertions: no non-test engine file other than `brain.ts` names an old ledger path, and no fenced bash block in `.bkit/core/workflows/*.md` and no file under `.bkit/core/docs/templates/` names one. A missed reader otherwise returns zero rows with exit 0: the unchanged engine on the post-upgrade layout drops the whole Deferral discipline section of `.bkit/stats.md` with no error (spike C4b). |
| Old `--ledger=<old>` writes | `ledgersCommand` in `ledgers.ts:671` | `EXTEND` | After the migration, the four brain-kind ledger names are refused with exit 8 and a message naming `bkit brain append`; no alias. |

## Architecture

**Shape:** the brain is one more ledger inside the existing engine (brainstorm 1, Approach A), read and written through one choke-point module (brainstorm 3, Approach A), whose logic is pure functions over the folded row set with thin CLI verbs on top (brainstorm 2, Approach A). JSONL in git stays the only store; every index is a disposable, gitignored cache.

**Components** (each `NEW` traces to a `NEW` row in `Reuse & Prior Art`):

1. **Codec** (`EXTEND` `.bkit/core/engine/ledgers/telemetry.ts`):
   - `APPEND_LEDGERS`: the four entries become `brain: { file: "docs/brain.jsonl", kinds: ["knowledge", "decision", "deferral", "failure", "assumption", "summary"] }`, plus `rejections: { file: ".bkit/brain-rejections.jsonl", kinds: ["rejection"] }`.
   - `identity()`: the six brain kinds return `brain {repo} {key}`; every other kind keeps its tuple.
   - `validate()`: envelope rules, `assumption` requires `falsifiedBy`, `links` values are arrays of key strings.
   - `KIND_TRANSITIONS` beside `KIND_WRITERS`, checked in the same `append` pass.
   - `fold()`: two narrow additions, both inert on every row that exists today (spike C2: 0 of 885 lines carry `proposal`, `lastRecalled` or `links`): a row carrying `proposal.basedOn` ranks at its `basedOn`, not its `ts`; `lastRecalled` on the winner is the newest value across the entry's rows (the `firstTs` pattern, with max). A property test pins the `basedOn` rank across compaction and chained proposals, because the rank changes the sort every kind shares.
   - `KIND_WRITERS` is an exhaustive typed record, so `assumption`, `summary` and `rejection` each gain a writer set (Data Model).
2. **Brain module** (`NEW` `.bkit/core/engine/ledgers/brain.ts`): the only engine file that names an old ledger path.
   - Path constants: `BRAIN_FILE` (`docs/brain.jsonl`), `REJECTIONS_FILE` (`.bkit/brain-rejections.jsonl`) and `STUB_FILES` (the four old paths). Every registry imports them (Boundaries).
   - `readBrain(root, {kinds?, current?})`: folds `[BRAIN_FILE, ...STUB_FILES]` (an absent old file is skipped), normalising old-shape rows into the envelope at read time and dropping a stub line whose identity and `ts` the brain already holds. `kinds` keeps only winners of those kinds; `current` drops terminal winners.
   - `linkIndex(rows)`: forward and reverse maps for `supersedes`, `dependsOn` and `relatedTo`.
   - `dependentsOf(keys)`, `checkFindings(rows, now)`: dead premises, dangling keys, `dependsOn` cycles (iterative walk with a visited set), passed `validUntil`, `SUPERSEDED` rows without a successor link, stale proposals, same-identity rows with equal `ts` but different content, malformed and old-shape counts per source file.
   - `selectForFiles(rows, files)` and `alwaysLoaded(rows)`: path-overlap selection and the capped summary.
   - `suggestionId(action, targets, payload)`: the deterministic id brain update and `append` share.
3. **Search** (`EXTEND` `ledgerScan` in `.bkit/core/engine/commands/workflow/context.ts`): `bkit brain search` serialises the `readBrain` winners one per line and passes them to `ledgerScan` unchanged; no index, no new module.
4. **Merge migration** (`EXTEND` `.bkit/core/engine/ledgers/migrate.ts`): `mergeIntoBrain(root, dryRun)`, called from `.bkit/core/engine/install/modules/core.ts` right after `migrateLedgers`; it imports the path constants from `brain.ts`.
5. **CLI** (`EXTEND` `.bkit/core/engine/commands/workflow/ledgers.ts`; the plan may split the `brain` noun into a sibling file): `bkit brain append|check|compact|context|list|search|update`, logging on stderr under the `[bkit-brain]` prefix (§ Logging and counters). `bkit ledgers` keeps `commit`, `union`, `only-bookkeeping`, `triage` and `append --ledger=friction|stats`. Once `docs/brain.jsonl` exists, `append --ledger=<knowledge|decisions|deferrals|failures>` is refused with exit 8 and the `[bkit-brain]` line naming `bkit brain append`; nothing is written. There is no alias.
6. **Brain update prompt** (`EXTEND`, from the four updaters): `.bkit/core/prompts/bkit-utility-update-brain.md`, replacing `bkit-utility-update-knowledge`, `-decisions`, `-deferrals`, `-failures`. `-roadmap`, `-tracker`, `-documentation` stay.
7. **Brain update procedure** (`EXTEND`, a new `.bkit/core/.bkit/brain.md`, mirrored to `.bkit/brain.md`, with a row in `.bkit/core/.agents/docs.md`): § Brain Update holds the orchestration steps a direct chat or the scheduled job follows (Components / Flows, Brain update). `bkit brain update` prints the dispatch plan as its stdout object: one entry per path cluster with its packet path, so the procedure never reconstructs the batches.
8. **Local files** (`ADAPT`, gitignored under the main checkout's `tmp/bkit-brain/`, resolved through `git rev-parse --git-common-dir` so a deleted worktree loses nothing): `recall.jsonl` and the `update-{run}/` packets. Every file there is safe to delete; the next `context` / `search` call or brain update recreates what it needs.
9. **Committed file** (`EXTEND`): `.bkit/brain-rejections.jsonl`, `merge=union`.
10. **Templates** (`EXTEND`): an opt-in `bkit-brain-update` job with a `schedule` trigger in `.bkit/templates/.github/workflows/bkit-cloud.yml`; a qmd template at `.bkit/templates/scripts/qmd/` (export script, `.qmd/index.yml`, README section in `.bkit/templates.md`).

**Boundaries and integration points:**

- **One door for reads:** prompts, rules and docs read the brain only through `bkit brain context` (by files), `search` (by text), `list` (by kind) and `check`. Each single-kind reader moves to a kind filter, not to a bare rename to `docs/brain.jsonl`, which would mix every kind into its result:
  - `bkit-plan.md:293-294` and `bkit-ship.md:481` (`bkit context ledger-scan --source=docs/{deferrals,failures}.jsonl --terms=…`) → `bkit brain search "<terms>" --kind=deferral` / `--kind=failure`.
  - `bkit-audit-deferrals.md:37` ("Fold `docs/deferrals.jsonl`") and `bkit-utility-update-roadmap` (open deferrals and failures) → `bkit brain list --kind=deferral,failure --current`.
  - The six prompts that carry "Check gotchas first" (`bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, and the updaters that become `bkit-utility-update-brain`) and `.bkit/core/.agents/rules.md:116` switch to `bkit brain context --files=…`. The four ledger rows in `.bkit/core/.agents/docs.md` become one `docs/brain.jsonl` row that says to read it through those commands.
- **One door for engine code:** a repo audit test fails when a non-test engine file other than `brain.ts` contains an old ledger path, or when a fenced bash block in `.bkit/core/workflows/*.md` or a file under `.bkit/core/docs/templates/` does. Today 10 engine source files name them (`cli.ts`, `migrate.ts`, `telemetry.ts`, `stats.ts`, `challenge.ts`, `workflows.ts`, `context.ts`, `ledgers.ts`, `decisions.ts`, `branches.ts`). Each reader moves to `readBrain` with a `kinds` filter equal to the kinds it read before; a writer moves to the `brain` ledger entry. `stats.ts` passes only `deferral` winners to `runAnalysis`, and plan 1 pins the whole `.bkit/stats.md` render before and after the merge (spike C4b).
- **Ledger path registries:** each literal list imports the `brain.ts` path constants instead of naming paths.

<!-- prettier-ignore -->
| Registry | Gains `BRAIN_FILE` | Gains `REJECTIONS_FILE` | Keeps `STUB_FILES` | Why |
| --- | --- | --- | --- | --- |
| `APPEND_LEDGERS` (`telemetry.ts:386`) | yes (`brain` entry) | yes (`rejections` entry) | no | Writers append only to the brain; the engine writes no row to an old path, and `--ledger=<old>` is refused. |
| `SCHEMA_LEDGERS` (`migrate.ts:15`) | yes | yes | yes | `isSchemaLedger` must stay true for every data file, or `mergeCanonicalHashes` (`.bkit/core/engine/install/version-file.ts:189-197`) records a canonical hash for the migration's write. |
| `LEDGERS` (`branches.ts:160`) | yes | yes | yes | Conflict resolution by union; dropping the stubs turns a pre-upgrade branch's stub lines into a blocking conflict. A modify/delete conflict on an old path (deleted on `dev`, appended on the branch) resolves by keeping the branch's file, so its rows reach the brain at the next brain update. |
| `.bkit/shared/.gitattributes` managed block and root `.gitattributes` | yes | yes | yes | `merge=union` on every ledger file; the spike's control merge without it conflicts (C1, scenario D). |
| `UNION_PATHSPECS` (`ledgers.ts:104`), `CLOSE_DOCS` (`branches.ts:1743`) | already matched | already matched | already matched | Globs `docs/*.jsonl` / `.bkit/*.jsonl` and the regex cover the new files with no edit. |

- **Install / upgrade:** `mergeIntoBrain` runs in the normal write path, dry run computes the same writeset, and a row goes in `docs/migrations.md`. Write order:
  1. Write `docs/brain.jsonl` to a temp file and rename it into place.
  2. Add the `.gitattributes` lines.
  3. Run the stub-or-delete check: list every local branch, remote branch and worktree not merged into `dev` whose diff against its merge base with `dev` changes one of the four old paths. Any hit → truncate the four files to zero bytes and keep them. No hit → delete them. Log `[bkit-upgrade] old ledgers {kept as stubs: {n} unmerged branches touch them | deleted: no unmerged branch touches them}`.
  - **Crash between steps:** a crash before step 3 leaves full old files beside a complete brain; the next run drops every line the brain already holds and finishes step 3 (spike C3: a second run over stubs refilled with every old line is byte-identical). Truncating before the brain lands is never done, because that order loses rows. A re-run that finds this partial state logs `[bkit-upgrade] brain merge incomplete: {n} old lines already in docs/brain.jsonl; finishing` under the owning module's prefix.
  - **Older bkit after the migration:** it reads empty stubs or absent files and reports zero rows with no error. Recovery is `bkit upgrade` forward or `git revert` of the migration commit. `docs/migrations.md` records the merge as a one-way step, because an older engine cannot see the brain and no version-side check is feasible in an engine that predates it.
  - The same function is the straggler mover that brain update calls. `bkit check` counts an old ledger with content and no `docs/brain.jsonl` beside it as a pending write (drift, exit 1 until `bkit upgrade`), the way § Versioning treats an unmigrated line. An old-path file with content beside the brain (a filled stub, or a deleted file a late branch brought back) is an advisory only (exit 0), with the fix inline: `bkit upgrade` or `bkit brain update`. Readers already see its rows, so nothing is lost while it waits.
- **Close squash** (`.bkit/workflows.md:250`): stays as is. Old paths keep `merge=union`, so a pre-upgrade branch's stub lines union in and its "line the branch added that `origin/dev` lacks" test (exit 18) still holds at landing. Straggler moves happen later, on `dev`, inside brain update.
- **Host parity:** where a subagent has no shell (for example `bkit-plan-review-1`: Read, Grep, Glob, Serena, Write, Edit), its orchestrator runs `bkit brain context` before dispatch and passes the rows in the prompt input, as subagents hand rows back for `append` today. That means dispatch edits in `bkit-plan.md`, `bkit-build.md` and `bkit-debug.md`. The "Check gotchas first" rule is a shared clause, so it changes through `pnpm instructions:sync`.
- **Mirrors and indexes:** the path sweep (494 mentions of `docs/{knowledge,decisions,deferrals,failures}.jsonl` across 109 files under `.bkit/core/`; 576 mentions across 110 files without the `docs/` prefix) is a bulk mechanical rewrite, then a hand review of every reading instruction. The sweep also covers files outside `.bkit/core/`: `.bkit/shared/docs/{technology,data-schema,deployments}.md`, `.bkit/shared/.gitattributes`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-{bug,idea}.yml`, `scripts/harvest/ledgers.ts`, `scripts/readme/readme-art.mjs` and `.github/assets/*.svg`. `scripts/harvest/ledgers.ts` reads both the four-file and the brain layout, because dogfood checkouts upgrade at different times. `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/templates.md`, `.bkit/cli.md`, `.bkit/jsonl.md` and `docs/observability.md` (§ `[bkit-brain]` prefix) change in the same plan as the files they index; `docs/` templates change only the ledger names and read instructions (Q9).

**Out of scope** (declared here; deferral rows reference this list):

- `.bkit/issues.jsonl` `feature` rows joining the brain (Q14: the format allows it later).
- `.bkit/friction.jsonl` and `.bkit/stats.jsonl` (stay separate, Q14).
- Retiring the four stubs where the migration kept them, once no supported install predates the merge.
- Transcript or chat-history recall.
- An FTS5 index for `bkit brain search`, until a recorded lookup shows a ranking gap `ledgerScan` cannot close. The spike settled what that step needs: FTS5 with `bm25` works on official Node 24.0.0, 24.14.0, 24.15.0 and 24.16.0 and on Alpine, Fedora and Debian builds that link the system SQLite (C7, C8). Node 24.0 to 24.14 print an `ExperimentalWarning` on import, so the step either raises `engines.node` to `>=24.15` or installs a `process.emitWarning` filter before a dynamic `import("node:sqlite")` (a static ESM import is hoisted above the filter). Its probe is `CREATE VIRTUAL TABLE t USING fts5(x)` on `:memory:`, and its fallback keys on the message `no such module: fts5`, not on `errcode` (a missing module raises the generic `1`). Its fallback logs `[bkit-brain] search fallback: {reason}; {fix}` once per process and adds a fallback counter.

## Data Model

**`docs/brain.jsonl` envelope** (`schema: 3`; § Generic Fields stays the top section, the fields below follow it):

<!-- prettier-ignore -->
| Field | Type | Rule |
| --- | --- | --- |
| `kind` | `knowledge` \| `decision` \| `deferral` \| `failure` \| `assumption` \| `summary` | May change only along `KIND_TRANSITIONS`. |
| `key` | `string` | Unique across the whole brain; identity is `(repo, key)`. |
| `status` | per-kind vocabulary (below) | `bkit brain append` fills the kind's default when absent; the migration fills it the same way. |
| `summary` | `string` | One line. Required on every brain row; `append` and the migration fill an absent one from the first sentence of `description`, capped at 200 characters. |
| `links` | `{supersedes?: string[], dependsOn?: string[], relatedTo?: string[]}?` | Keys only. `supersedes` sits on the new row and names the row it replaces; `dependsOn` names premises; `relatedTo` is undirected "see also" and the premise check ignores it. |
| `references` | `string[]?` | Paths, commits, issues, PRs, as today. Exact-key entries stay in place after the backfill. |
| `lastRecalled` | `number?` | Unix ms at UTC-day grain. Written only by brain update; the fold returns the newest value across the entry's rows. |
| `proposal` | `{id: string, basedOn: number}?` | Only on rows brain update writes. `id` = suggestion id; `basedOn` = `ts` of the winner it was computed from. The fold ranks the row at `basedOn`. |
| per-kind fields | flat, as today | `rationale`, `alternatives`, `severity`, `reason`, `type`, `category`, `rootCause`, `remediation`, `source`, `description` keep their current names and places. |

**Status vocabularies.** "Current" means not in the terminal set `SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`. `TRIAGED` is current.

<!-- prettier-ignore -->
| Kind | Statuses (default first) | Terminal |
| --- | --- | --- |
| `knowledge`, `decision`, `summary` | `ACTIVE`, `SUPERSEDED`, `FADED` | `SUPERSEDED`, `FADED` |
| `deferral`, `failure` | `OPEN`, `TRIAGED`, `CLOSED`, `FADED` | `CLOSED`, `FADED` |
| `assumption` | `ACTIVE`, `FALSIFIED`, `SUPERSEDED`, `FADED` | `FALSIFIED`, `SUPERSEDED`, `FADED` |

`failure` keeps accepting a free-string `status` as today; an unknown value counts as current.

**New per-kind fields:**

- `assumption`: `falsifiedBy` (required, the concrete observation that would break it), `validUntil?` (unix ms), `description?`. A row without `falsifiedBy` is refused with exit 8.
- `summary`: `description` (the summary text, at most 2,000 characters), `links.relatedTo` (required, the rows it summarises), `references?` (paths of the cluster; a summary with no path is always-loaded).

**Writer sets for the new kinds** (`KIND_WRITERS` rows; decision `ledger-writer-agents-carry-bash` applies, and each listed subagent carries Bash):

<!-- prettier-ignore -->
| Kind | Writers |
| --- | --- |
| `assumption` | `bkit-plan-generate`, `bkit-design-spike`, `utility` |
| `summary` | `bkit-utility-update-brain` |
| `rejection` | `utility` |

**Kind transitions** (`KIND_TRANSITIONS`; any other kind change exits 8):

<!-- prettier-ignore -->
| From | To | Status on the new row | Fields dropped |
| --- | --- | --- | --- |
| `failure` (any status) | `knowledge` | `ACTIVE` | `severity`, `category` |
| `deferral` with `reason: "needs-decision"` | `decision` | `ACTIVE` | `reason`, `type`, `severity`, `category` |
| `assumption` `ACTIVE` | `knowledge` | `ACTIVE` | `falsifiedBy`, `validUntil` |

Readers that count a kind (`bkit stats` deferral and failure counts, `bkit ledgers triage`) count entries whose winner has that kind. The deferral-reason rate reads the entry's last row of kind `deferral`, so a transition never erases a verdict.

**Example row:**

```json
{
  "schema": 3,
  "ts": 1793520000123,
  "firstTs": 1793506639496,
  "updates": 2,
  "kind": "decision",
  "key": "546-brain-identity-repo-key",
  "repo": "cbartens/bkit",
  "bkit": { "version": "6.1.0" },
  "by": {
    "workflow": "plan",
    "step": "plan-generate",
    "subagent": "bkit-plan-generate",
    "model": "claude-opus-5-5"
  },
  "references": ["546", ".bkit/core/engine/ledgers/telemetry.ts"],
  "status": "ACTIVE",
  "summary": "brain rows are identified by repo and key; kind is a field that changes only along KIND_TRANSITIONS",
  "links": {
    "supersedes": [],
    "dependsOn": ["546-jsonl-ledgers-stay-the-store-memory-tools-index-only"],
    "relatedTo": []
  },
  "rationale": "…"
}
```

**Migration mapping** (`mergeIntoBrain`, a pure function of the four files' bytes):

- Input order is fixed: `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`. Output order equals input order.
- Each well-formed line maps to one line: fill `status` and `summary` as above; set `links.relatedTo` to the line's `references` entries that exactly equal a key present in the input; keep every other byte of meaning; never mint a `ts`.
- Malformed, blank and non-object lines are copied byte-for-byte.
- A line whose identity and `ts` the brain already holds is dropped (the `migrateLedgerText` rule), which makes a second run a no-op.
- Collision rule: the same key in two old files → the entry with the earlier first `ts` keeps the key; the other becomes `{key}-{oldkind}` and gains `relatedTo` to the kept key. Later stragglers of that old kind with that key map to the renamed key.
- Afterwards, in the write order under Boundaries (brain first, stubs last), `.gitattributes` gains `docs/brain.jsonl merge=union` and `.bkit/brain-rejections.jsonl merge=union` and keeps the four old lines; then the stub-or-delete check truncates the four old files to zero bytes and keeps them, or deletes them when no unmerged branch or worktree touches them.
- Measured on this repo (spike C2, C3): 885 lines in, 885 out, zero cross-file key collisions, 842 entries with identical winners under both identities, 136 lines gaining `relatedTo` (162 edges), byte-identical output from two separate runs.

**`.bkit/brain-rejections.jsonl`** (kind `rejection`, identity `(kind, repo, key)`): `key` = suggestion id, `summary` = the rejected suggestion in one line, `references` = target keys, `by` = the owner's chat. Because the id hashes each target's winner `ts`, a changed target produces a new id and the suggestion returns; brain update prunes rows whose id no longer matches any open suggestion's inputs.

**Suggestion id:** first 12 hex of sha256 over canonical JSON `{action, targets: [[key, winnerTs], …] sorted by key, payload}`.

**`tmp/bkit-brain/recall.jsonl`** (main checkout, gitignored): one line per returned key, `{"key": "…", "at": <unix ms>}`, appended by `context` and `search`. Brain update renames it to `recall-{run}.jsonl` before reading it, rolls the renamed file up and deletes it, so an append from another worktree lands in a fresh `recall.jsonl` instead of being truncated away. A recall appended to the old name in the instant between another process opening it and the rename can still be lost; losing a few recalls only delays a fade by one run, so that is accepted.

**Settings** (`package.json`): `bkit.brain.update.ask` (boolean, default `true`), a new `BkitConfig` field read by `readBkitConfig`. The fade window (180 days), the always-loaded cap (2,000 tokens), the `dependents:` print cap (20 rows) and the brain-update staleness window (30 days) are engine constants in `brain.ts`, each with the decision row that records where its number came from.

## Components / Flows

**Build order** (Q27; one plan each, each plan shippable on its own):

1. **Merge, envelope, links** (#795 with #792): codec changes, `brain.ts` read and link functions and path constants, the registry imports, `mergeIntoBrain`, the stub-or-delete check, the refusal of old `--ledger` names, `bkit brain append`, `bkit brain check` and `bkit brain list`, the kind-filtered readers (`stats.ts` first), `assumption` and `summary` kinds, `KIND_TRANSITIONS`, the writer-table rows, the path sweep, the widened old-path audit test, the `[bkit-brain]` prefix section in `docs/observability.md`, and the one-way-step note in `docs/migrations.md`. Its first task turns the spike's real-`git merge` fixture of the stub case (base = old content, ours = empty, theirs = old + appended lines; `git merge`, `git merge --squash -X ours` and the reverse merge) into a regression test pinning the measured result: the old lines return with the appended ones, with no conflict. A second early task pins the whole `.bkit/stats.md` and `docs/roadmap.md` renders before and after the merge.
2. **Loading rows by file** (#791): `bkit brain context`, the always-loaded summary, the prompt and rule switch, the no-shell dispatch edits, the recall-log write, and the before / after token measurement on three recorded tasks.
3. **Keyword search** (#793): `bkit brain search` as `ledgerScan` over the current fold winners with `--kind`, the single-kind workflow and template readers moved onto it, the recall-log write.
4. **Brain update**: `bkit brain update` and its dispatch plan, `.bkit/brain.md` § Brain Update, `bkit-utility-update-brain`, `bkit.brain.update.ask`, rejections, recall roll-up, fading, the `proposal` fold rank and its property test, the brain-update counters, the staleness finding, the opt-in `bkit-brain-update` job in `bkit-cloud.yml`, and retirement of the four updater prompts.
5. **qmd template** (#794).

**`bkit brain append --rows=<file|->`:** same contract as `bkit ledgers append` today (fills `schema`, `ts`, `repo`, `bkit.version`, `firstTs`, `updates`; refuses on any bad row, exit 8, nothing written), plus:

- Fills `status` and `summary` when absent; refuses a kind change off `KIND_TRANSITIONS` and an `assumption` without `falsifiedBy`.
- A row carrying `proposal`: skipped with `stale` when the entry's winner `ts` is not `proposal.basedOn`; skipped with `applied` when any row of the entry already carries that `proposal.id`. Neither is an error.
- After writing, prints `dependents:` with the current rows whose `links.dependsOn` names a key this append turned terminal, at most 20, then `and {M} more, see bkit brain check` when there are more, so a hub row does not flood an agent's context. Always exit 0 for this reason.

**`bkit brain check [--plan=<file>] [--json]`:** with `--plan`, today's `bkit ledgers check --plan` contract and exit code. Without it, prints the findings from `checkFindings` grouped by type, plus per source file: rows read, malformed lines, old-shape rows normalised, stub lines waiting to move. Exit 0; it is a list for someone to act on, never a gate (Q5). Each finding type prints its fix line:

<!-- prettier-ignore -->
| Finding | Fix line printed | Day-one count on this repo |
| --- | --- | --- |
| Dead premise (current row `dependsOn` a terminal row) | Re-test the row: supersede it, or drop the link with a same-`key` append | 0 (no `dependsOn` links before brain update proposes them) |
| Dangling key | Correct the key, or drop the link | 0 (the backfill links only keys present in the input) |
| `dependsOn` cycle | Drop the link that is a citation, not a premise | 0 |
| Passed `validUntil` | Re-test the assumption: falsify, supersede or extend `validUntil` | 0 (no `assumption` rows yet) |
| `SUPERSEDED` without successor | Append `links.supersedes` on the successor row, or let brain update propose it | 45 (spike C2) |
| Same identity, equal `ts`, different content | Append a same-`key` row with the intended content | 0 (spike C2) |
| Stale proposal | Re-run brain update; the suggestion is re-offered against the new winner | 0 |
| Brain update stale (newest committed `docs/audits/*/brain-update-*.md` older than 30 days, or none while the brain has rows) | Run brain update from a chat: follow `.bkit/brain.md` § Brain Update | 1 |

**`bkit brain list --kind=<k>[,<k>…] [--current] [--json]`:** prints the `readBrain` winners of those kinds, newest `ts` first, one JSON line per row; `--current` drops terminal winners. The kind-filtered read for every reader that folded one per-kind file. Exit 0, also when nothing matches.

**`bkit brain context --files=<list|-> [--json]`:**

1. `readBrain`, keep current rows.
2. Normalise each `references` entry: strip a leading `./`, a trailing `/`, a `:line` suffix and a trailing ` §…` qualifier.
3. Select rows where a normalised reference equals a file or is a folder above it at any depth (Q8).
4. Rank: exact file before folder, nearer folder before farther; then kind order `failure` (current), `knowledge`, `assumption`, `decision`, `deferral`, `summary`; then newest `ts`.
5. Build the always-loaded part: current `summary`, `knowledge` and `assumption` rows with no path in `references`, newest first, hard-capped at 2,000 tokens (characters / 4).
6. Write the always-loaded part first, then the ranked path rows, through `clampFile(..., "ledger", ...)`, with the path rows clamped into the clamp budget minus the always-loaded part's size. The `ledger` clamp keeps the head of the file (`selectLedger` keeps `rows.slice(0, keep)`), so this order is what keeps the always-loaded part: appended last, all three always-loaded rows were cut on a recorded 18-file task that selected 97 rows (spike C5b). List dropped path rows by key under the clamp's "not read" notice, with `bkit brain search` as the way in.
7. Print `tokensEst`; append each returned key to the recall log. A recall-log write failure is best-effort: log `[bkit-brain] recall log not written: {path}: {reason}` and exit 0.

**`bkit brain search "<text>" [--kind=<k>[,<k>…]] [--all] [--json]`:** `readBrain`; keep current winners unless `--all`; keep the `--kind` kinds; serialise each winner as one JSON line; pass the lines and the text's terms to `ledgerScan` unchanged, which ranks by term overlap, keeps the strongest 40 and prints its truncation notice. Append returned keys to the recall log (best-effort, as in `context`).

**`bkit brain compact [--dry-run]`:** today's compaction over `docs/brain.jsonl`, using the same fold rank (so a `proposal` row ranks at `basedOn`), stamping `lastRecalled` like `firstTs`.

**Brain update** (on demand from a direct chat, or the opt-in schedule; never inside a design / plan / build / debug / ship run, Q16). The steps below live in `.bkit/brain.md` § Brain Update, which the direct chat and the scheduled job both follow:

1. **`bkit brain update`** (engine, deterministic, always applied as mechanical cleanup):
   - Move stragglers from any old-path file into the brain (normalise, apply the collision map), then run the stub-or-delete check again: truncate the file when an unmerged branch or worktree still touches the old paths, delete it otherwise. Log `[bkit-brain] moved {n} stub lines from {file}` per file with stragglers.
   - Compact the brain.
   - Roll the recall log up: rename it to `recall-{run}.jsonl`, append a `lastRecalled` row for an entry only when the renamed log's newest date is later than the stored value by more than half the fade window (90 days), then delete the renamed log.
   - Prune void rejection rows.
   - Write a candidate packet to `tmp/bkit-brain/update-{run}/`: the `check` findings, fade candidates (current, `max(ts, lastRecalled)` older than 180 days, no inbound link from a current row), rows batched by path cluster, and the `Open Questions & Assumptions` sections of archived plans not yet seen.
   - Print the dispatch plan as the stdout object: `{run, batches: [{cluster, packet}], report}`.
   - Concurrency: each mechanical write re-reads its file just before the temp-file rename. When the file changed since the run read it, the step re-runs once on the new content; when it changed again, the step is skipped with `[bkit-brain] {file} changed during update; skipped {step}, re-run brain update` and exit 0. Straggler moves and compaction are idempotent functions of the file content (spike C3: a second run is byte-identical), so two concurrent runs converge.
2. **`@bkit-utility-update-brain`** (inferred), one dispatch per `batches` entry so no context holds the whole brain. When `outcome.context.byAgent` for one dispatch passes 120,000 tokens (75% of the 160,000-token line), the next run halves that cluster's batch:
   - The per-kind steps of the four retired updaters: re-test each row against docs and code; close, triage, correct, supersede.
   - Propose `dependsOn` / `supersedes` upgrades of backfilled `relatedTo` links, and successor links for `SUPERSEDED` rows that lack one.
   - Find pairs of current rows that say opposite things and propose a `supersedes` link or a correction (Q22).
   - Find repeats across rows and plan assumption sections and propose one `knowledge` or `assumption` row, `relatedTo` its sources (Q23); `.bkit/friction.jsonl` excluded.
   - Rebuild `summary` rows per cluster (Q18).
   - Propose fades for the candidates.
   - Output: every suggestion as a row with its `suggestionId` and `proposal.basedOn`, dropping any whose id is in the rejection log.
3. **Mode** (`bkit.brain.update.ask`, read through the settings reader):
   - `true` (default): write `docs/audits/{YYYYMM}/brain-update-{YYYYMMDD-HHMMSS}-{4 hex}.md` with a `Suggested Changes` table (`#`, Action, Targets, Change, Why, Suggestion id) and the machine rows in a fenced JSON block. The owner approves rows in chat; the orchestrator runs `bkit brain update --apply=<report> --approve=<#,…> --reject=<#,…>`, which appends approved rows through `bkit brain append` and records rejections.
   - `false`: the same `--apply` with every row approved; the report lists what was applied.
   - Headless (the scheduled run) never asks and never applies an inferred change, whatever `ask` says: it applies step 1 and writes the report, and approval waits for a chat. This is the pause that keeps a bad prompt run from landing unseen.
   - Report header: `Status: OPEN`, then `APPLIED {date}` once `--apply` ran, or `STALE` once a later `bkit brain update` finds that any target's winner `ts` moved (its suggestion ids no longer match). Reports are never deleted; they are the audit trail. A scheduled run records the CI run URL in the header.
   - Undo: for every applied row the report prints the target's previous winner as one JSON line and the command that restores it, `bkit brain append --rows=-` with that line on stdin (a same-`key` append, so the restored content wins).
4. **Commit:** mechanical cleanup and approved rows commit straight to the current branch, no PR (Q17), naming only the brain update's own paths. The scheduled run commits the cleanup and the report to `dev` and pushes (Scheduled run).
5. **Counters:** at the end of `--apply`, or of a headless run, `bkit brain update` appends `counter` rows through `bkit ledgers append --ledger=stats` (`by.workflow` `utility`, `run.parentSha` = HEAD after the commit, `counter.source` `shell-bus`), one per name: `brain-update.stragglersMoved`, `.suggestionsMade`, `.approved`, `.rejected`, `.applied`, `.staleSkipped`, `.appliedSkipped`. A failed append logs `[bkit-brain] counters not written: {reason}` and exits 0.

**Logging and counters** (`[bkit-brain]` on stderr for every `bkit brain` verb; stdout stays one output object; a section in `docs/observability.md` lists the grep patterns):

- `[bkit-brain] {file}: {n} malformed lines skipped, {m} old-shape rows normalised` — from `readBrain`, once per process, only when `n` or `m` is above 0.
- `[bkit-brain] {n} stub lines waiting in {file}; run bkit brain update` — from `readBrain`, once per process, when an old-path file holds lines the brain does not.
- `[bkit-brain] recall log not written: {path}: {reason}` — best-effort, exit 0.
- `[bkit-brain] moved {n} stub lines from {file}` — brain update straggler move.
- `[bkit-brain] {file} changed during update; skipped {step}, re-run brain update` — concurrent mechanical write, exit 0.
- `[bkit-brain] counters not written: {reason}` — best-effort, exit 0.
- `[bkit-brain] --ledger={name} is part of docs/brain.jsonl; use bkit brain append` — the refusal of an old ledger name, exit 8.
- `[bkit-brain] scheduled run failed: {step}: {reason} (run {CI run id})` — scheduled job, exit 1.
- The migration's partial-state line is `[bkit-upgrade] brain merge incomplete: …` (Boundaries), under the owning module's prefix.

**Scheduled run** (opt-in `bkit-brain-update` job in `bkit-cloud.yml`):

- Trigger: `schedule` weekly (Monday 03:00 UTC) and `workflow_dispatch` with no issue input; off until the consumer uncomments the trigger.
- Prompt: follow `.bkit/brain.md` § Brain Update headless. It does not route through `/bkit-auto`.
- Failure: any failed step exits non-zero and prints `[bkit-brain] scheduled run failed: …` with the CI run id, so the run is red with a grep-able cause.
- Push: commit the cleanup and the report to `dev` with the push access `bkit-cloud.yml` jobs already hold. On a rejected push, fetch, merge `origin/dev` (the union driver resolves the ledgers) and push once more; on a second rejection exit 1. It never force-pushes.
- Staleness: the `check` finding "brain update stale" fires when the newest committed brain-update report is older than 30 days, so a schedule that silently stops is visible at the next `check`.

**Concurrency without a lock** (Q28): report names carry a random suffix, so runs never overwrite each other. Identical suggestions share an id, so `append` skips the second as `applied`. A suggestion computed from an outdated winner is skipped as `stale` on the same checkout, and across branches the fold ranks it at its `basedOn`, so newer content from another branch wins and the next run re-proposes against it. Rejections recorded by either run carry the same id, so both recognise them.

**qmd template:** `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs` writes one gitignored markdown file per current brain row (front matter: key, kind, status, links) under `tmp/bkit-brain/qmd/`; `.qmd/index.yml` points qmd at that folder; a README section covers the ~2 GB model download and Homebrew SQLite on macOS. The install steps pin `@tobilu/qmd` to an exact version (`2.8.3` when the spike installed it) and always add a `.qmd/` gitignore line, wherever qmd turns out to write its index (spike C9 left that unverified). Off by default; nothing binary committed.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| The brain is one more `APPEND_LEDGERS` entry on the existing codec, read through one choke-point module (`brain.ts`) of pure functions with thin verbs | A separate brain codec; a frozen-old-files "virtual brain"; a SQLite index as the only read path | One fold, one writer check, one migration path; `bkit stats` parity is safest when the fold is not duplicated. The choke point makes "no engine file reads an old path" testable, which catches the reader that silently reports zero deferrals. |
| Old files become zero-byte stubs, kept with `merge=union`, only while an unmerged branch or worktree touches them; otherwise the migration deletes them. Kept stubs retire later through a `docs/migrations.md` release range. A modify/delete conflict on an old path resolves by keeping the branch's file, and `bkit brain check` reports an old file that comes back (owner decision `546-brain-old-ledger-stubs-only-while-branches-touch-them`) | Always stubs; always delete (the #795 body's wording); decide from `.bkit/issues.jsonl`; keep them full for a release | Deleting while a branch still appends turns its merge into a modify/delete conflict that neither `merge=union` nor the close squash's `-X ours` resolves, and "keep the deletion" drops the branch's rows. With no such branch, the stubs are clutter. Git's own branch list is the exact signal for anything pushed or local; `.bkit/issues.jsonl` misses non-bkit and unpushed branches and counts every designed-but-unbuilt feature as in flight. The spike proved the union result on a real-`git` fixture: the branch's appended lines and the old lines both come back, with no conflict, under `git merge`, `git merge --squash -X ours` and the reverse merge, and the same merge without `merge=union` conflicts (C1). Plan 1 keeps the fixture as a regression test. |
| Backfilled links are written inside the one-time envelope rewrite, not as appended same-`key` rows (owner decision `546-brain-backfilled-links-ride-the-envelope-rewrite`) | Q6 as stated: append one link row per entry | Appended rows mint a `ts`, so two branches that each run `bkit upgrade` produce different rows that union keeps both of, doubling about 650 lines and inflating `updates`. Q13 already rewrites every line once, so links ride that rewrite and the migration stays a pure function. |
| Backfilled exact-key references become `links.relatedTo` (owner decision `546-brain-backfilled-links-are-relatedto`) | Backfill as `dependsOn`; infer `supersedes`; no backfill | A reference only says "this row cites that one", not "rests on it". As `dependsOn`, citations of superseded rows would flood the dead-premise list on day one. Brain update proposes `dependsOn` / `supersedes` upgrades under owner review. |
| Q13's "per-kind body" is the flat per-kind field set beside the envelope; no nested `body` object (owner decision `546-brain-per-kind-fields-stay-flat-beside-envelope`) | A nested `body` per kind | Every current reader of `rationale`, `severity`, `reason` (`bkit stats`, `bkit ledgers triage`, `bkit decisions pending`, the roadmap render, the audit templates) keeps working. A generic reader needs only the envelope fields. A nested body adds no capability. |
| `schema` stays `3` | `schema: 4` | `links`, `proposal`, `lastRecalled` are optional additions; § Versioning already makes readers tolerate absent fields. |
| Identity `(repo, key)` for the six brain kinds only | Change `identity()` for every keyed kind | FIDs and brain keys often share an issue-number prefix (`546-…`); a global change can fold a `feature` and a `decision` into one entry wherever both files are folded. A test pins this. |
| `KIND_TRANSITIONS` = three pairs (failure → knowledge, needs-decision deferral → decision, active assumption → knowledge), each with its status mapping and dropped fields | Free kind changes; a longer list | Q12 asks for a closed list enforced beside `KIND_WRITERS`. The three pairs are the lifecycles the input names. Counts use the winner's kind; the deferral-reason rate reads the entry's last `deferral` row, so a transition never erases a verdict. |
| Q26's "all ledger commands" are the brain-row commands; `bkit ledgers` keeps `commit` / `union` / `only-bookkeeping` / `triage` and friction / stats `append`; the old brain-kind `--ledger` names are refused with exit 8 once the brain exists, with no alias (owner decision `546-brain-row-verbs-under-bkit-brain-no-legacy-alias`) | Every `ledgers` verb under `brain`; an alias mapping old names to the brain | `commit` / `union` are git bookkeeping and friction / stats are not brain files (Q14). Without the alias, a pre-upgrade worktree's mirrored prompts fail their appends loudly, naming the replacement, instead of being rerouted. |
| `append` and the migration fill an absent `status` with the kind's default and an absent `summary` from the first sentence of `description` (200 characters) | Refuse rows without them | No writer prompt breaks, and every brain row gets the envelope fields a generic reader needs. |
| New terminal status `FADED` on every brain kind; revivable by a same-`key` append | Reuse `SUPERSEDED` / `CLOSED`; exclude without a status | `SUPERSEDED` implies a successor and would trip the missing-successor finding; a fade with no status keeps counting as current everywhere else. |
| Always-loaded part (Q7, owner decision `546-brain-always-loaded-summary-pathless-rows-2000-tokens`): current `summary`, `knowledge`, `assumption` rows with no path in `references`, hard-capped at 2,000 tokens by the tool; the number is re-set from plan 2's three-task measurement and recorded with its source figures | Every knowledge row's key + summary (~5k tokens); knowledge + assumptions capped at ~6k; nothing always-loaded | Path overlap reaches 92.0% of current knowledge and 95.6% of current decision rows (spike C5a), so the always-loaded part only has to carry what paths cannot reach. Decisions alone are ~18k tokens. On the spike's three recorded tasks the `context` output cost 2.5%, 20.1% and 20.4% of the current-knowledge read. Design and plan runs read the gotchas for a feature, but debug runs and direct chats skip those stages, so the bundle is their net for pathless rows. |
| The always-loaded part is written first, in its own reserved 2,000-token budget, and only path rows are clamped into the rest | Append it after the path rows and clamp everything together (the draft's order) | The `ledger` clamp keeps the head of the file, so appended last the always-loaded rows were all cut on one of three recorded tasks (spike C5b). Writing them first is the order under which every output carries them, as the Narrative promises. |
| `context` ranks exact file > nearer folder > farther, then gotcha kinds first, then newest; clamps through `clampFile` `ledger` profile and prints `tokensEst` | Unranked output; a new truncation path | One recorded 18-file task selects 97 rows and the clamp keeps 26 lines of them (spike C5b), so ranking decides what survives the clamp; a single hot file matches fewer (`telemetry.ts`: 9 current rows). One number per task makes Success Criterion 1 measurable without transcript counts, which read subagent output about 12x low. |
| Keyword search = `ledgerScan` unchanged, fed the serialised current `readBrain` winners, with a `--kind` filter; no index; FTS5 deferred until a recorded lookup shows a ranking gap | `node:sqlite` FTS5 with `bm25` and a content-hash index (the draft); Orama / MiniSearch | On the seven recorded plan Step 4 lookups, `ledgerScan` over the winners missed 3 or more of FTS5's top 10 on 0 of 7 lookups, and 4.0% of its kept hits matched only through JSON keys (spike C6). It needs no index, cache, warning filter or probe, and keeps search on the one fold. |
| Single-kind readers read through a kind filter (`readBrain(root, {kinds})`, `bkit brain list --kind=`, `bkit brain search --kind=`), each with the kinds it read before | Rename their paths to `docs/brain.jsonl`; leave them on the old paths | A rename mixes every kind into their results: `bkit stats` on the brain gains `decision`, `failure` and `knowledge` rows in its Kind table and its `utility` Workflow count moves from 81 to 563. Left on the old paths they read empty stubs and go silent: the unchanged engine drops the whole Deferral discipline section with no error. With the filter the report is byte-identical (spike C4b). |
| Every literal ledger-path registry imports `BRAIN_FILE`, `REJECTIONS_FILE` and `STUB_FILES` from `brain.ts`; `SCHEMA_LEDGERS`, `LEDGERS` and both `.gitattributes` blocks keep the stubs | Let `migrate.ts` and `branches.ts` name the old paths as audit exceptions; drop the stubs from the registries | One source of paths lets the old-path audit hold with no exception list. Dropping the stubs from `LEDGERS` makes a pre-upgrade branch's stub a blocking conflict, and leaving the brain out of `SCHEMA_LEDGERS` makes `mergeCanonicalHashes` record a canonical hash for a data file. |
| Brain update's orchestration lives in a procedure doc, `.bkit/brain.md` § Brain Update, and `bkit brain update` prints the dispatch plan (owner decision `546-brain-update-procedure-doc-not-a-workflow`) | A sixth workflow `bkit-brain.md`; the engine prints the plan with no doc | Brain update has no FID, no phase and no close, so a workflow would bend the five-workflow machinery (`WORKFLOWS`, the router, `/bkit-auto` phase resolution) for one loop. A procedure doc is what the direct chat and the scheduled job can both follow, and the printed plan keeps batching in the engine. |
| The scheduled run is a separate opt-in `bkit-brain-update` job with its own prompt, not a `/bkit-auto` phase | A `brain-update` phase routed through `/bkit-auto` | `/bkit-auto` phases resolve against the five workflows and its dispatch input requires an issue; brain update has neither. |
| Headless runs never apply an inferred change, whatever `ask` says | Apply under `ask: false` headless too; a per-run cap on fades and supersedes | An unattended run has no one watching, so a bad prompt run would land unseen; holding inferred changes for a chat is a pause that needs no tuned number. Attended `ask: false` runs keep Q19's behaviour. |
| `[bkit-brain]` stderr prefix with a fixed list of grep-able lines for degraded states, and `counter` rows at the end of each brain update | No logging contract; counters only in the report | `docs/observability.md` § Log Format requires one prefix per new command noun, with the brackets, because consumer CI grep depends on them. Without the lines, "the brain read fewer rows than it should" has no detection other than an agent noticing. |
| Migration write order: brain written and renamed first, `.gitattributes` next, stubs truncated last; an older bkit after the merge is a recorded one-way step | Truncate first; a downgrade check | A crash after the brain lands leaves work the identity-and-`ts` drop finishes (spike C3); truncating first can lose rows. An older engine cannot detect a brain it predates. |
| Recall roll-up renames the log before reading it | Read, then truncate | Appends from other worktrees during a read-then-truncate are lost; after a rename they land in a fresh file. The remaining sub-second window loses at most a few recalls, which delays a fade by one run. |
| Constants: `dependents:` prints at most 20 rows; brain update is stale after 30 days; a dispatch over 120,000 tokens of context halves its cluster's next batch | No caps; "watch" the context figure | A hub row otherwise floods an agent's context. 30 days is four missed weekly runs. 120,000 is 75% of the 160,000-token line, leaving room for one bad batch before the line. |
| Brain update = deterministic `bkit brain update` + one prompt `bkit-utility-update-brain`, fed one path cluster per batch | Four prompts with a shared step; all inference in the engine | Q15 settles one pass. The engine cannot judge contradictions; the prompt should not be trusted with compaction. Batching keeps one agent context from holding the whole brain, the hotspot the premortem found at 10x. |
| A row carrying `proposal.basedOn` ranks at `basedOn` in the fold; `append` also skips `stale` and `applied` proposals | No fold change, a fork finding plus re-heal on the next run (brainstorm 1); deterministic ids only (brainstorm 2) | Without it, a brain-update copy minted on `dev` outranks a content change landed later from a feature branch whose rows were minted earlier, and the content is silently hidden until a human notices. The rank rule touches only rows with `proposal`, none of which exist at migration, so Success Criterion 2 is unaffected. The proposal itself is re-offered against the new content. |
| Suggestion id = hash of action, sorted target keys with their winner `ts`, and payload | Random ids; ids without target `ts` | Two concurrent runs produce the same id for the same change (Q28), and any change to a target produces a new id, which is exactly Q20's "until the rows it was about change". |
| Rejections in a committed `merge=union` file `.bkit/brain-rejections.jsonl`, kind `rejection` | Rows inside the brain (brainstorm 2); a gitignored local list | A local list re-offers a teammate what the owner rejected. Rows in the brain would pollute `context` and `search` with process bookkeeping, against Q14's line between what the project knows and machine records. Void rows are pruned; a union-resurrected one never matches again. |
| Recall log in the main checkout's `tmp/bkit-brain/` via `git rev-parse --git-common-dir`; `lastRecalled` at day grain, written only when later than stored by over half the fade window | Worktree-local `tmp/`; write every run; week grain | Most reads run in `.worktrees/{FID}`, deleted at close. The half-window rule bounds line churn by entries, not reads, and keeps `foldFrom` well under the `MAX_ROWS_BEFORE_ROLLUP = 5000` line warning. Recall writes are mechanical cleanup, applied even with `ask: true`. |
| Fade window 180 days, an engine constant; fade = current, `max(ts, lastRecalled)` older than the window, no inbound link from a current row (owner decision `546-brain-rows-fade-after-180-days-unrecalled`) | A setting; 90 days | Q24 / Q25 ask for a set time, not a knob. A constant with its decision row is re-derivable from the first real brain update's fade list; a setting can follow if owners ask. |
| `ask: false` applies every suggestion type, `supersedes` and kind changes included, and lists each in the report | Hold `supersedes` and kind changes to approval even under `ask: false` (premortem suggestion) | Q19 settles that `false` applies the same changes directly, and the default is `true`. Every applied change is an ordinary same-`key` append, so it is reversible, and the report names it. |
| Scheduled run = opt-in `bkit-brain-update` job with a weekly `schedule` trigger in `bkit-cloud.yml` that commits the cleanup and the report to `dev` and pushes: merge `origin/dev` on a rejected push, one retry, never force (owner decision `546-scheduled-brain-update-pushes-to-dev`) | A new workflow template; an engine scheduler; the report as a run artifact with no push; a local launchd / cron recipe | `bkit-cloud.yml` already runs claude-code-action and opencode with credential auto-detect and already pushes for `/bkit-auto` runs. Headless never asks, so the scheduled run applies cleanup and writes the report; approval waits for a chat. Pushing matches Q17's "cleanup lands directly". |
| Brain-update reports go under `docs/audits/{YYYYMM}/` with a random-suffixed name | Under `docs/plans/`; a tracker comment | Q17 says suggestions are reviewed "the way audit findings are"; brain update has no FID. Random suffixes keep concurrent runs apart. |
| Key-collision rule: earlier first `ts` keeps the key, the other becomes `{key}-{oldkind}` with a `relatedTo` link; stragglers follow the same map | Fixed file order with a `~kind` suffix (brainstorm 2); fail the migration | Content-derived, repeatable on every run, slug-shaped like every other key, loses no row. No collision exists in this repo today. |
| `bkit check`: old ledgers with content and no brain = drift (exit 1); an old-path file with content beside the brain = advisory (exit 0) | Fail on any non-empty old-path file (fail-closed approach) | Failing on it turns every pre-upgrade branch landing red in CI, a cost that grows with team size, while readers already see its rows. An unmerged repo is genuine drift. |
| `qmd` template adds a `.qmd/` gitignore line unconditionally (owner decision `546-qmd-template-gitignores-dot-qmd-unconditionally`) | Verify qmd's index location in a scratch project first; point the index at `tmp/bkit-brain/qmd/` | Spike C9 could not run the qmd binary. "Nothing binary committed" must hold for a consumer who runs `git add -A`, and the line costs nothing. |
| Path sweep as a bulk mechanical rewrite, then a hand review of each reading instruction; a repo audit test bars old paths from engine code outside `brain.ts`, from fenced bash blocks in `.bkit/core/workflows/*.md` and from `.bkit/core/docs/templates/` | Hand-edit 109 files; rely on review; audit engine code only | `.agents/rules.md` § Edit tools allows bulk mechanical rewrites; only reading instructions change meaning. The test catches a missed reader that would otherwise report zero rows without failing anything; the workflow and template readers are where single-kind reads live today. |
| D-AS1: Success Criterion 1 names the counting method (characters / 4 of what the agent is told to read) and adds the doc index to "no whole-ledger read" | The draft's unspecified measurement | The draft left the method open; transcript counts are unreliable, and `.agents/docs.md` also tells agents to read the ledgers. |
| D-AS2: Success Criterion 2 adds byte-identical output on a second run and on two branches | The draft's "no row lost" alone | The premortem showed a non-deterministic migration doubles rows when two branches upgrade independently. |
| D-AS3: Success Criteria 3 and 5 add `FALSIFIED`, the missing-successor finding, the `ask: false` report and the concurrency outcome | The draft's criteria | The `assumption` kind adds a third terminal status; Q28 asked for a conflict mechanism, which needs an outcome to test. |
| D-AS4: Edge cases and the Process Sketch name the stub-or-delete mechanism, the refusal of old `--ledger` names, the fixed collision rule, the `proposal` rank, the `relatedTo` backfill and the no-shell host case | The draft's "the reader accepts them", "needs one fixed rule", "must not overwrite" | The draft stated the problems; the brainstorms supplied the mechanisms. |
| D-AS5: Success Criterion 2 pins the whole `.bkit/stats.md` render with each reader kind-filtered; Success Criterion 4 names `ledgerScan` and the kind-filtered read path; the Process Sketch puts the always-loaded part first and adds `bkit brain list` and the scheduled run; the edge cases add the large selection and the older bkit | The design-v1 wording (`node:sqlite` FTS5, "stats figures unchanged" under a path move, always-loaded part appended last) | The spike disproved all three as written (C4b, C5b, C6); the operability review asked for the scheduled-run and downgrade outcomes. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Pragmatic A: brain as one more ledger inside the existing engine, brain logic in `brain.ts` | `MERGED` | The base shape: extends `telemetry.ts`, `migrate.ts`, `compact.ts`, `ledgers.ts`, `context.ts` in place; supplies stubs, flat per-kind fields, `KIND_TRANSITIONS`, `basedOn`, the rejection file, the recall-log location and the cron reuse. |
| Optimal A: one envelope, pure-function core library, thin verbs | `MERGED` | Supplies the pure-function boundary, the deterministic suggestion id shared by concurrent runs, and the rule that the tool, not convention, enforces the digest cap. Its rejection-rows-in-the-brain and file-order collision rule were not taken. |
| Premortem A: single choke-point codec, read-tolerant, deterministic migration | `MERGED` | Supplies `readBrain` as the only door, the byte-deterministic migration, content-hash caches, the old-path audit test, the real-`git merge` stub test, per-cluster batching and the per-kind-class identity rule. |
| Pragmatic B: virtual brain (old files frozen, new rows to the brain only) | `REJECTED` | Departs from Q2 and Q13, and leaves two layouts and a permanent old-shape mapping for every grep-based prompt and audit template. |
| Pragmatic C: dedicated brain module with its own codec | `REJECTED` | Duplicates fold, validation, lineage and the writer check; puts `bkit stats` parity (Success Criterion 2) at the most risk. |
| Optimal B: keep four files, add a derived unified view and links | `REJECTED` | Contradicts Q2, Q12, Q13, Q15; keys can collide across files, so links can resolve to the wrong row. |
| Optimal C: merge without the envelope, ship checks first, brain update later | `REJECTED` | Two migrations instead of one and departs from Q13 / Q15; its one useful idea, keeping per-kind fields flat, is taken in the chosen shape. |
| Premortem B: fail-closed strict cut-over, old files deleted, old shapes refused | `REJECTED` | Departs from Q13's "reader still accepts the old shape" and detects merge loss after the fact instead of preventing it. Its inline-fix advisory is kept for the non-empty-stub case. |
| Premortem C: derived SQLite index as the only read path | `REJECTED` | A second schema on the critical read paths for speed not needed at ~650 entries. Not kept for `search` either: `ledgerScan` over the fold winners matched FTS5's retrieval on the seven recorded lookups (spike C6). |
| Recall dates in a separate committed file instead of on the entries | `REJECTED` | Would avoid row copies, but departs from Q25 ("a `lastRecalled` date per entry"); the `proposal` rank removes the copy risk that motivated it. |

## Trade-offs Accepted

- **One ledger on the existing codec:** gain one fold, one writer check and one updater instead of four, with links that are plain keys. Sacrifice: a one-time sweep of 109 shipped files, and `telemetry.ts` (over 2,000 lines) keeps growing instead of a clean brain module boundary.
- **Stubs only while branches touch the old files:** gain no lost rows from pre-upgrade branches git can see, and no empty files where none is needed. Sacrifice: a branch git cannot see at migration (someone's unpushed clone) meets a modify/delete conflict, and its rows survive only if the conflict keeps its file; readers fold up to five files instead of one.
- **No alias for old `--ledger` names:** gain one write path into the brain and no silent rerouting. Sacrifice: a pre-upgrade worktree's ledger appends fail with exit 8 until it upgrades.
- **Links in the rewrite, as `relatedTo`:** gain a deterministic migration with no added lines and no false dead-premise alarms. Sacrifice: the dead-premise check is quiet for old rows until brain update upgrades their links, and the 45 old `SUPERSEDED` rows have no successor link until then.
- **Flat per-kind fields:** gain zero reader rewrites. Sacrifice: the envelope is a convention on top-level fields, not a structural boundary, so a future kind must avoid field-name clashes.
- **Path overlap plus a small always-loaded part:** gain a read that scales with the files touched, not the ledger size. Sacrifice: a row with no path and no summary coverage reaches an agent only through search.
- **`ledgerScan` for search, no index:** gain zero dependencies, no cache to invalidate, and one semantic definition of "current row". Sacrifice: term-overlap ranking with no field weighting, and `context` / `search` re-parse the brain per call (about 1.55 MB across the four ledgers today), fine at this size and the first thing to revisit at 10x.
- **Headless runs hold inferred changes:** gain no unattended change lands unseen. Sacrifice: a scheduled run alone never advances links, summaries or fades; they wait for a chat.
- **Scheduled run pushes to `dev`:** gain cleanup that lands without anyone running it. Sacrifice: CI holds push access to `dev` for this job, and a bad mechanical step lands unattended (it is reversible by `git revert`).
- **The `proposal` fold rank:** gain no silently hidden content across branches. Sacrifice: a narrow exception in `fold()` that every future fold-adjacent change must respect, and an inferred change can be discarded and re-offered.
- **Committed rejection file:** gain shared rejections across people and branches. Sacrifice: one more ledger file and writer-table row.
- **Approval in chat, no PR:** gain a fast loop for the owner. Sacrifice: the review trail is the report file and the commit, not a PR conversation.

## Risks & Open Questions

- Open questions: none. The owner settled each one at design close, recorded in `docs/decisions.jsonl`:
  - Always-loaded summary (Q7): pathless current `summary`, `knowledge` and `assumption` rows, capped at 2,000 tokens (`546-brain-always-loaded-summary-pathless-rows-2000-tokens`).
  - Backfilled links ride the one-time envelope rewrite (`546-brain-backfilled-links-ride-the-envelope-rewrite`).
  - Backfilled links are `relatedTo` (`546-brain-backfilled-links-are-relatedto`).
  - Per-kind fields stay flat beside the envelope (`546-brain-per-kind-fields-stay-flat-beside-envelope`).
  - Brain-row verbs under `bkit brain`, no alias for the old `--ledger` names (`546-brain-row-verbs-under-bkit-brain-no-legacy-alias`).
  - Stubs only while an unmerged branch or worktree touches the old files, deleted otherwise (`546-brain-old-ledger-stubs-only-while-branches-touch-them`).
  - The scheduled run commits to `dev` and pushes (`546-scheduled-brain-update-pushes-to-dev`).
  - Brain update's steps live in `.bkit/brain.md` § Brain Update (`546-brain-update-procedure-doc-not-a-workflow`).
  - The qmd template always gitignores `.qmd/` (`546-qmd-template-gitignores-dot-qmd-unconditionally`).
  - `FADED` after 180 days unrecalled, recall rewritten past 90 days (`546-brain-rows-fade-after-180-days-unrecalled`).
- Invisible branches at migration: the stub-or-delete check sees local branches, remote branches and worktrees, not another person's unpushed clone. When such a clone later merges an append to a deleted old file, bkit's conflict resolution keeps the file; a plain `git merge` resolved by hand with "keep the deletion" drops those rows.
- The stub union result ("ours emptied, theirs appended") is settled by the spike (C1): the old lines come back with the appended ones under all three merge shapes. Readers drop the old lines by identity and `ts`, and a second migration run over refilled stubs is byte-identical (C3); plan 1's first task keeps the fixture as a regression test.
- Recall-log races: appends from other worktrees can still race the roll-up's rename in a sub-second window, losing a few recalls. The cost is a fade proposed one run early, which the owner sees in the report under `ask: true`.
- Mixed-version use: a pre-upgrade worktree's engine, or an older bkit, reads empty stubs or absent files and reports zero rows with no error. Its `--ledger=<old>` appends through a post-upgrade engine are refused with exit 8. `docs/migrations.md` records the merge as one-way.
- Scheduled-run failure: a red run carries a `[bkit-brain] scheduled run failed` line, and a schedule that stops silently surfaces as the 30-day staleness finding in `bkit brain check`, which nobody runs automatically.
- The migration is deterministic per line except one rare case: a line citing a key that exists only on one branch gets a `relatedTo` link there and not on the other. Union then keeps both versions with equal `ts`, and the later line wins; the only effect is one missing or extra `relatedTo`, which `check` reports as a duplicate-`ts` finding.
- Plan 1 is large (codec, migration, stub-or-delete check, sweep, check). It is the owner's settled order (Q27); the plan should split it into task groups that each leave `dev` green.
- Consumer scripts using the `jq` write idiom keep writing old-shape rows to old paths; a stub absorbs them, a deleted file is recreated by the append, readers fold either and `bkit brain check` reports it, and `.bkit/jsonl.md` § Write Idiom must change in the same release.
- Kind transitions change lineage: `firstTs` / `updates` cover both lives of an entry. Readers that count a kind must use the winner's kind, which plan 1 tests against `bkit stats`.
- Brain update's peak context is the new hotspot; `outcome.context.byAgent` for `bkit-utility-update-brain` is the figure to watch against the 160,000-token line, and a dispatch over 120,000 tokens halves its cluster's next batch.
- Success Criterion 1 depends on three recorded tasks chosen before plan 2 changes any prompt, so the "before" figure is not taken after the fact.

## Suggested Workstreams

### WS-1: Codec and Envelope

#### Scope

`.bkit/core/engine/ledgers/telemetry.ts` changes that define the brain row:

- `APPEND_LEDGERS`: the four per-kind entries become one `brain` entry (`docs/brain.jsonl`, six kinds) and a `rejections` entry (`.bkit/brain-rejections.jsonl`, kind `rejection`), with paths taken from WS-2's constants.
- `identity()`: `brain {repo} {key}` for the six brain kinds only; `feature`, `friction`, `chat`, `run` keep `(kind, repo, key)`; a test pins that a `feature` and a `decision` sharing a `546-…` prefix stay separate entries.
- `validate()` / `normalize()`: envelope fields (`status`, `summary`, `links`), `links` values as arrays of key strings, `assumption` refused without `falsifiedBy` (exit 8), `summary` kind requiring `links.relatedTo` and a `description` of at most 2,000 characters; `schema` stays `3`.
- Status vocabularies and the terminal set (`SUPERSEDED`, `CLOSED`, `FALSIFIED`, `FADED`; `TRIAGED` current; free-string `failure` status counts as current); per-kind defaults for an absent `status`; `summary` filled from the first sentence of `description` (200 characters).
- `KIND_TRANSITIONS` (three pairs with their status mapping and dropped fields) checked in the same `append` pass as `KIND_WRITERS`, with a doc-table parity test like the `KIND_WRITERS` one.
- `KIND_WRITERS` rows for `assumption`, `summary` and `rejection` (decision `ledger-writer-agents-carry-bash`).

Excluded: the `proposal.basedOn` fold rank and the `lastRecalled` max in `fold()` (WS-10).

#### Requires

[]

#### Rationale

Every other workstream reads or writes rows through this codec, so the row contract has to settle first. The changes are one file plus its tests, and share the single `append` validation pass.

### WS-2: Brain Module Core and Path Registries

#### Scope

- New `.bkit/core/engine/ledgers/brain.ts`: `BRAIN_FILE`, `REJECTIONS_FILE`, `STUB_FILES`; `readBrain(root, {kinds?, current?})` folding `[BRAIN_FILE, ...STUB_FILES]` (absent old files skipped), normalising old-shape rows at read time and dropping stub lines whose identity and `ts` the brain already holds.
- `linkIndex(rows)` (forward and reverse maps for `supersedes`, `dependsOn`, `relatedTo`), `dependentsOf(keys)`.
- `checkFindings(rows, now)` for the finding types that exist at merge time: dead premise, dangling key, `dependsOn` cycle (iterative walk with a visited set, no unbounded recursion), passed `validUntil`, `SUPERSEDED` without successor link, same identity with equal `ts` and different content (also the rare branch-only `relatedTo` case in Risks), malformed and old-shape counts per source file.
- The `readBrain` stderr lines: `[bkit-brain] {file}: {n} malformed lines skipped, {m} old-shape rows normalised` and `[bkit-brain] {n} stub lines waiting in {file}; run bkit brain update`, once per process.
- Registry imports per the Boundaries table: `APPEND_LEDGERS`, `SCHEMA_LEDGERS` (`migrate.ts:15`, keeps stubs, so `mergeCanonicalHashes` records no canonical hash for data files), `LEDGERS` (`branches.ts:160`, keeps stubs, and resolves a modify/delete conflict on an old path by keeping the branch's file); confirmation that `UNION_PATHSPECS` and `CLOSE_DOCS` already match the new files.

Excluded: `selectForFiles` / `alwaysLoaded` (WS-7), `suggestionId` (WS-10), the stale-proposal and brain-update-stale findings (WS-11).

#### Requires

[WS-1]

#### Rationale

`brain.ts` is the single read door and the single source of paths the old-path audit relies on; the link functions are pure functions over the same fold, so they belong with it.

### WS-3: Merge Migration and Install / Upgrade Integration

#### Scope

- `mergeIntoBrain(root, dryRun)` in `.bkit/core/engine/ledgers/migrate.ts`, called from `.bkit/core/engine/install/modules/core.ts` right after `migrateLedgers`: fixed input order, one line out per line in, `status` / `summary` fill, exact-key `references` backfilled as `links.relatedTo`, malformed lines copied byte-for-byte, identity-and-`ts` drop, the `{key}-{oldkind}` collision rule and its straggler map, no minted `ts`.
- Write order: brain via temp file and rename, then `.gitattributes` (`.bkit/shared/.gitattributes` managed block and root `.gitattributes` gain `docs/brain.jsonl` and `.bkit/brain-rejections.jsonl` `merge=union`, keeping the four old lines), then the stub-or-delete check last: zero-byte stubs when any local branch, remote branch or worktree not merged into `dev` changes an old path since its merge base, deletion otherwise, with its `[bkit-upgrade] old ledgers …` line; the `[bkit-upgrade] brain merge incomplete: …` partial-state line; dry run computing the same writeset.
- `bkit check`: old ledgers with content and no brain = drift (exit 1); an old-path file with content beside the brain (filled stub or recreated file) = advisory with the fix inline (`bkit upgrade` or `bkit brain update`), per `.agents/rules.md` § Advisories self-contained.
- Tests: old-shape seed, second run byte-identical, two-branch determinism, crash between steps, and the real-`git merge` stub fixture (base old, ours empty, theirs old + appended; `git merge`, `git merge --squash -X ours`, reverse merge, and the no-`merge=union` control) as plan 1's first task; the stub-or-delete check with and without a touching branch, and a modify/delete merge of a deleted old file resolved to the branch's file.
- Close squash (`.bkit/workflows.md:250`) left unchanged; a test that its exit-18 check still holds with stubs.
- `docs/migrations.md` row with release range and the one-way-step note (older bkit reads empty stubs or absent files; recovery is `bkit upgrade` forward or `git revert`).

#### Requires

[WS-1, WS-2]

#### Rationale

The migration is one install-path function with its own idempotence, ordering and crash rules; it is the step that changes consumer files, so it carries the migration register row and the merge-safety tests together.

### WS-4: `bkit brain` CLI Noun and Logging Contract

#### Scope

- The `brain` noun in `.bkit/core/engine/commands/workflow/ledgers.ts` (or a sibling file): `append` (same contract as `bkit ledgers append`, plus `status` / `summary` fill, transition and `falsifiedBy` refusals, the `dependents:` print capped at 20 with the `and {M} more` line, exit 0 for that reason), `check` (`--plan` keeps `EXIT_ROWS_MISSING`; plain `check` prints `checkFindings` grouped with each fix line and per-file counts, exit 0), `list --kind= [--current] [--json]`, and `compact [--dry-run]` over `docs/brain.jsonl` on the existing compaction.
- `bkit ledgers` keeps `commit`, `union`, `only-bookkeeping`, `triage`, `append --ledger=friction|stats`; once `docs/brain.jsonl` exists, `--ledger=<knowledge|decisions|deferrals|failures>` exits 8 with `[bkit-brain] --ledger={name} is part of docs/brain.jsonl; use bkit brain append` and writes nothing.
- `[bkit-brain]` stderr prefix for every verb, stdout one output object; the `docs/observability.md` § `[bkit-brain]` section with the plan-1 grep lines (later plans add theirs); `.bkit/cli.md` rows for the verbs.
- The `dependents:` cap constant in `brain.ts` with its decision row.

Excluded: the `proposal` `stale` / `applied` skips in `append` (WS-10); `context`, `search`, `update` verbs (WS-7, WS-9, WS-11).

#### Requires

[WS-1, WS-2]

#### Rationale

The verbs are thin wrappers over WS-1 and WS-2 and share one command file, one logging prefix and one CLI doc; `append`, `check` and `list` are the read and write doors every later reader and writer uses.

### WS-5: Engine and Script Readers Moved to Kind-Filtered Reads

#### Scope

- Every non-test engine file that names an old ledger path today (`cli.ts`, `migrate.ts`, `telemetry.ts`, `stats.ts`, `challenge.ts`, `workflows.ts`, `context.ts`, `ledgers.ts`, `decisions.ts`, `branches.ts`) moves to `readBrain` with a `kinds` filter equal to the kinds it read before, or to the `brain` ledger entry for writers; literal paths come from WS-2's constants.
- `stats.ts` passes only `deferral` winners to `runAnalysis`; kind counts (`bkit stats`, `bkit ledgers triage`) use the winner's kind; the deferral-reason rate reads the entry's last `deferral` row; `bkit decisions pending` and the roadmap render keep their output.
- Parity pins as plan 1's second early task: the whole `.bkit/stats.md` render and the `docs/roadmap.md` render byte-identical before and after the merge (spike C4b), plus fold-winner parity under the new identity.
- `scripts/harvest/ledgers.ts` reads both the four-file and the brain layout.

#### Requires

[WS-2, WS-3]

#### Rationale

These are the engine readers that would silently report zero rows on the post-upgrade layout; they move together because the parity pins compare one before / after render across all of them.

### WS-6: Shipped-Text Path Sweep, Doc Indexes and Old-Path Audit

#### Scope

- Bulk mechanical rewrite of the 494 / 576 old-path mentions across `.bkit/core/` (109 / 110 files), then a hand review of every reading instruction; files outside `.bkit/core/`: `.bkit/shared/docs/{technology,data-schema,deployments}.md`, `.bkit/templates/.github/ISSUE_TEMPLATE/bkit-{bug,idea}.yml`, `scripts/readme/readme-art.mjs`, `.github/assets/*.svg`.
- Single-kind readers in workflows and templates moved off the emptied stubs in the same change: `bkit-audit-deferrals.md:37` and `bkit-utility-update-roadmap` → `bkit brain list --kind=deferral,failure --current`; `bkit-plan.md:293-294` and `bkit-ship.md:481` → a kind-filtered read that does not open a stub file raw (WS-9 later switches them to `bkit brain search --kind`).
- The four `bkit-utility-update-{knowledge,decisions,deferrals,failures}` prompts repointed at the brain until WS-12 retires them; "Check gotchas first" and `.bkit/core/.agents/rules.md:116` repointed to a kind-filtered read until WS-8 switches them to `context`.
- `.bkit/core/.agents/docs.md`: the four ledger rows become one `docs/brain.jsonl` row naming the read commands.
- Docs that describe the ledgers: `.bkit/jsonl.md` (envelope fields, status vocabularies, links, new kinds, `KIND_TRANSITIONS` table, § Write Idiom for the brain), `docs/architecture.md` § Knowledge / Decisions JSONL Ledgers, and the indexes `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/templates.md`; `docs/` templates change only ledger names and read instructions (Q9).
- Widened `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`: no non-test engine file other than `brain.ts`, no fenced bash block in `.bkit/core/workflows/*.md` and no file under `.bkit/core/docs/templates/` names an old ledger path.
- Deferral rows for each Out-of-scope item (feature rows joining, friction / stats separate, kept-stub retirement, transcript recall, the FTS5 index with its C7 / C8 notes).

#### Requires

[WS-4, WS-5]

#### Rationale

The sweep is one bulk rewrite plus review across agent-read text; the audit test can pass only once both engine readers (WS-5) and shipped text are clean, so it closes this workstream.

### WS-7: `bkit brain context` and the Recall Log

#### Scope

- `selectForFiles(rows, files)` and `alwaysLoaded(rows)` in `brain.ts`: reference normalisation (leading `./`, trailing `/`, `:line`, trailing ` §…`), path overlap at any folder depth, ranking (exact file, nearer folder, kind order, newest `ts`), always-loaded part (current `summary`, `knowledge`, `assumption` rows with no path, hard cap 2,000 tokens as an engine constant with its decision row).
- `bkit brain context --files=<list|-> [--json]`: always-loaded part written first, path rows clamped through `clampFile(..., "ledger", ...)` into the remaining budget, dropped keys listed under the "not read" notice with `bkit brain search` as the way in, `tokensEst` printed.
- Recall log: `tmp/bkit-brain/recall.jsonl` in the main checkout resolved through `git rev-parse --git-common-dir`, one `{key, at}` line per returned key, best-effort with `[bkit-brain] recall log not written: {path}: {reason}`, exit 0; shared helper for WS-9.
- Tests for the large-selection case (97 rows, the always-loaded part survives the clamp).

#### Requires

[WS-2, WS-4]

#### Rationale

Selection, clamp order and the recall write are one engine path with one output contract; the recall helper is built here because `context` is its first caller.

### WS-8: Prompt and Rule Switch to File-Scoped Loading

#### Scope

- Choose the three recorded tasks and record the "before" figure (characters / 4 of every current `docs/knowledge.jsonl` row) before any prompt changes.
- The six "Check gotchas first" prompts (`bkit-build-plan-execute`, `bkit-debug-failure-diagnose`, `bkit-plan-review-1`, `bkit-plan-review-2`, and the updater prompts) and `.bkit/core/.agents/rules.md:116` switch to `bkit brain context --files=…`; the shared clause changes through `pnpm instructions:sync`; the `docs/brain.jsonl` row in `.bkit/core/.agents/docs.md` names `context`.
- No-shell host parity: orchestrator-run `bkit brain context` before dispatch, rows passed in the prompt input, in `bkit-plan.md`, `bkit-build.md` and `bkit-debug.md`, verified on every provider.
- The "after" measurement on the same three tasks (Success Criterion 1), and the always-loaded cap re-set from the measurement and recorded in a same-`key` append to `546-brain-always-loaded-summary-pathless-rows-2000-tokens` with its source figures.

#### Requires

[WS-6, WS-7]

#### Rationale

These are the agent-facing edits that make the context verb the read door; the before / after measurement brackets exactly these edits, so they cannot be split from it.

### WS-9: `bkit brain search` and Search-Based Readers

#### Scope

- `bkit brain search "<text>" [--kind=…] [--all] [--json]`: `readBrain` current winners (or all with `--all`), `--kind` filter, serialised one JSON line each, passed to `ledgerScan` in `context.ts` unchanged (strongest 40, truncation notice); recall-log append through WS-7's helper.
- `bkit-plan.md:293-294` and `bkit-ship.md:481` switched to `bkit brain search "<terms>" --kind=deferral` / `--kind=failure`, with `.bkit/workflows.md` updated in the same change.
- `.bkit/cli.md` row; parity check that each search-based reader returns the rows it returned before the merge (Success Criterion 4).

#### Requires

[WS-2, WS-4, WS-6, WS-7]

#### Rationale

The verb is a thin feed into an unchanged `ledgerScan`, and its only shipped callers are the two workflow lookups, so verb and caller switch ship as one unit.

### WS-10: Fold Rank, Recall Date and Suggestion Identity

#### Scope

- `fold()` additions in `telemetry.ts`: a row carrying `proposal.basedOn` ranks at `basedOn`; the winner's `lastRecalled` is the newest value across the entry's rows; both inert on today's rows (spike C2), with a property test across compaction and chained proposals.
- `bkit brain compact` uses the same fold rank and stamps `lastRecalled` like `firstTs`.
- `suggestionId(action, targets, payload)` in `brain.ts` (first 12 hex of sha256 over canonical JSON with sorted `[key, winnerTs]` targets).
- `bkit brain append` skips a `proposal` row as `stale` (winner `ts` != `basedOn`) or `applied` (id already present), neither an error.

#### Requires

[WS-1, WS-2, WS-4]

#### Rationale

These are the concurrency guarantees for brain update (Success Criterion 5), and the fold rank touches the sort every kind shares, so they land as one tested change ahead of the verb that produces proposals.

### WS-11: `bkit brain update` Engine Verb, Reports and Rejections

#### Scope

- Deterministic step: straggler moves from any old-path file through `mergeIntoBrain` with the collision map, then the stub-or-delete check (`[bkit-brain] moved {n} stub lines from {file}`), compaction, recall roll-up (rename to `recall-{run}.jsonl`, write `lastRecalled` only when later than stored by more than 90 days, delete), pruning void rejection rows, candidate packet under `tmp/bkit-brain/update-{run}/` (findings, fade candidates, path-cluster batches, unseen plan `Open Questions & Assumptions` sections), the stdout dispatch plan `{run, batches: [{cluster, packet}], report}`.
- Concurrency: re-read before each temp-file rename, one re-run, then skip with `[bkit-brain] {file} changed during update; skipped {step}, re-run brain update`, exit 0.
- `--apply=<report> --approve=<#,…> --reject=<#,…>`: approved rows through `bkit brain append`, rejections into `.bkit/brain-rejections.jsonl`; report file `docs/audits/{YYYYMM}/brain-update-{YYYYMMDD-HHMMSS}-{4 hex}.md` with the `Suggested Changes` table, fenced machine rows, `Status: OPEN` / `APPLIED {date}` / `STALE` header, CI run URL for scheduled runs, and the per-row undo line.
- `bkit.brain.update.ask` as a new `BkitConfig` field in `readBkitConfig` (default `true`); headless runs never apply inferred changes.
- Counters at the end of `--apply` or a headless run via `bkit ledgers append --ledger=stats` (seven `brain-update.*` names), best-effort with `[bkit-brain] counters not written: {reason}`.
- `checkFindings` additions: stale proposal, brain update stale (no committed report newer than 30 days).
- `FADED` fade candidates (180-day window, no inbound link from a current row); engine constants (fade window, staleness window) with their decision rows.
- Commit of cleanup and approved rows to the current branch naming only brain-update paths; `.bkit/cli.md` and `docs/observability.md` lines.

#### Requires

[WS-3, WS-7, WS-10]

#### Rationale

All deterministic, file-writing parts of brain update share one verb, one run id and one concurrency rule, and the report format is the contract the prompt (WS-12) writes into and `--apply` reads back.

### WS-12: Brain Update Prompt and Procedure Doc

#### Scope

- `.bkit/core/prompts/bkit-utility-update-brain.md`: the per-kind steps of the four retired updaters, link upgrades and successor links, contradiction pairs (Q22), repeat-to-row proposals excluding `.bkit/friction.jsonl` (Q23), per-cluster `summary` rebuilds (Q18), fade proposals, output rows with `suggestionId` and `proposal.basedOn`, rejected ids dropped; one dispatch per `batches` entry; Bash in its tool set.
- Retire `bkit-utility-update-{knowledge,decisions,deferrals,failures}.md`; update `.bkit/prompts.md` and any caller.
- New `.bkit/core/.bkit/brain.md` § Brain Update (mirrored to `.bkit/brain.md`), with a row in `.bkit/core/.agents/docs.md`: the steps a chat and the scheduled job follow, mode handling for `ask`, approval in chat, commit rule; the 120,000-token batch-halving rule on `outcome.context.byAgent`, with its decision row.

#### Requires

[WS-6, WS-11]

#### Rationale

The prompt and the procedure that dispatches it are the inferred half of brain update and are reviewed together under the agent-read authoring rules; both depend on the engine's dispatch plan and report format.

### WS-13: Scheduled Brain Update Job Template

#### Scope

- Opt-in `bkit-brain-update` job in `.bkit/templates/.github/workflows/bkit-cloud.yml`: `schedule` weekly (Monday 03:00 UTC) and `workflow_dispatch` with no issue input, off until uncommented; prompt follows `.bkit/brain.md` § Brain Update headless; not routed through `/bkit-auto`.
- Commit of the cleanup and the report to `dev`, then push with the job's existing push access: on a rejected push, merge `origin/dev` and push once more; on a second rejection exit 1; never force.
- Failure contract: non-zero exit with `[bkit-brain] scheduled run failed: {step}: {reason} (run {CI run id})`; `docs/observability.md` line; `.bkit/templates.md` install steps; root adopted copy kept byte-identical where the repo adopts the template.

#### Requires

[WS-12]

#### Rationale

A copy-and-own CI template with its own credentials, trigger and push rules; it only follows the procedure doc, so it is a separate unit.

### WS-14: qmd Search-by-Meaning Template

#### Scope

- `.bkit/templates/scripts/qmd/bkit-qmd-export.mjs`: one gitignored markdown file per current brain row (front matter key, kind, status, links) under `tmp/bkit-brain/qmd/`.
- `.qmd/index.yml` pointing qmd at that folder; README section in `.bkit/templates.md` (model download ~2 GB, Homebrew SQLite on macOS); install steps pinning `@tobilu/qmd` to an exact version.
- Install steps always add a `.qmd/` gitignore line (spike C9 left qmd's index location unverified); nothing binary committed; off by default.

#### Requires

[WS-4]

#### Rationale

An opt-in copy-and-own template outside the engine, reading the brain only through the shipped read commands; nothing else depends on it.

## Suggested Plans

### P-1: Brain Merge, Envelope and Links (#795 with #792)

#### Deliverable

`bkit upgrade` merges the four ledgers into `docs/brain.jsonl` with no line lost, leaving zero-byte `merge=union` stubs only while an unmerged branch or worktree touches the old files and deleting them otherwise; the envelope, `assumption` / `summary` / `rejection` kinds, `KIND_TRANSITIONS`, links and `bkit brain append|check|list|compact` ship, and old brain-kind `--ledger` names are refused; every engine reader, workflow, prompt, template and doc reads the brain through a kind filter, with `.bkit/stats.md` and `docs/roadmap.md` renders byte-identical and the old-path audit green.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5, WS-6]

#### Requires

[]

### P-2: Loading Rows by File (#791)

#### Deliverable

`bkit brain context --files=…` with the always-loaded part, ranked path rows, `tokensEst` and the recall log; shipped prompts, the shared "Check gotchas first" clause, `.agents/rules.md` and the doc index use it, no-shell subagents receive rows from their orchestrator, and the before / after token measurement on three recorded tasks is recorded with the Q7 cap.

#### Covers

[WS-7, WS-8]

#### Requires

[P-1]

### P-3: Keyword Search (#793)

#### Deliverable

`bkit brain search` as `ledgerScan` over current fold winners with `--kind` and `--all`, writing to the recall log, with the plan and ship Step 4 lookups switched onto it.

#### Covers

[WS-9]

#### Requires

[P-1, P-2]

### P-4: Brain Update

#### Deliverable

`bkit brain update` (cleanup, dispatch plan, reports, `--apply` with approve / reject, rejections, recall roll-up, fades, counters, `bkit.brain.update.ask`) with the `proposal` fold rank and suggestion ids; `bkit-utility-update-brain` and `.bkit/brain.md` § Brain Update replace the four updater prompts; the opt-in scheduled `bkit-brain-update` job template ships, committing its cleanup and report to `dev`.

#### Covers

[WS-10, WS-11, WS-12, WS-13]

#### Requires

[P-1, P-2]

### P-5: qmd Search-by-Meaning Template (#794)

#### Deliverable

An opt-in copy-and-own qmd template (export script, `.qmd/index.yml`, pinned install steps, README section) that indexes current brain rows from a gitignored export, off by default with nothing binary committed.

#### Covers

[WS-14]

#### Requires

[P-1]
