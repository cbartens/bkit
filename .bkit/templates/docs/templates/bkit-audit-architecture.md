<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Architecture Review

> [!CAUTION]
> **Purpose:** Judgment on codebase shape — package graph, intended layers, server, and client boundary, and coupling the import graph cannot see.
>
> **Rules:**
>
> - Read-only audit; NEVER edit code, config, or data.
> - `Universal Instructions` apply to ALL projects; `Project Instructions` apply ONLY to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document ONCE at session start; do NOT trust session memory; do NOT re-read on every loop iteration.
> - A code graph confirms presence; a missing edge proves nothing. Corroborate every load-bearing claim with a language server or text search before it is a finding.
> - Build the graph locally and code-only; NEVER send the corpus or credentials to a model backend.

## Universal Instructions

### Context & Goals

File reading cannot answer whether the package graph is acyclic, which modules everything hangs off, or where the same type was copied. A code graph and a language server can, and they fail in different directions: an edge the graph reports may be false, and an edge it omits proves nothing. Target failure: **a shape that looks enforced in a diagram or a clean graph and is not enforced in source** — a type-only cycle treated as runtime, a manifest edge treated as a package dependency, a privileged module the client bundle can reach.

**Applies when:** more than one package, or a written layer model. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a cycle adds a package, moves a module, or changes path aliases or project references. The production-checklist walk is part of the quarterly pass.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- C4 model (System Context, Container, Component).
- Architecture decision records (e.g. adr.github.io) and architectural fitness functions (e.g. _Building Evolutionary Architectures_).
- Product quality model, nine characteristics (e.g. ISO/IEC 25010:2023).
- Quality-attribute scenarios (e.g. ATAM utility tree).
- Package metrics: afferent coupling (Ca), efferent coupling (Ce), instability, abstractness, Stable Dependencies Principle (e.g. Robert C. Martin).
- Compiler-resolving dependency linter (e.g. dependency-cruiser, import-linter); record version.
- Workspace boundary checker (e.g. `turbo boundaries`, Nx module boundaries); record version.
- Layer-boundary linter (e.g. eslint-plugin-boundaries, ArchUnit).
- Well-architected pillars as a lens (e.g. AWS Well-Architected, Azure Well-Architected).
- Server and client component boundary, including a build-failing server-only guard (e.g. Next.js Server and Client Components, `server-only`).
- Host production checklists (e.g. Vercel, Supabase, Fly).

### Scope

- Package dependency graph: cycles, back-edges, coupling metrics, fan-in, fan-out, duplicate symbols.
- Conformance to a written layer matrix, public entry points, and deep imports.
- Server and client boundary, and privileged modules.
- Coupling with no import edge: events, data ownership, change coupling.
- Shape against recorded decisions, context, and container views, and quality-attribute scenarios.
- Production-checklist gaps, routed to the audit that owns each.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether a symbol is reachable | Reachability, not shape | `bkit-audit-dead-code` |
| Confirmed same-name copies, once named | Duplication sweep | `bkit-audit-duplication` |
| Auth holes and secret exposure in depth | Security sweep | `bkit-audit-security` |
| A table written from several places, in depth | Database sweep | `bkit-audit-database` |
| Cold-start time and request latency | Hot paths | `bkit-audit-app-performance` |
| Job retries and idempotency in depth | Reliability sweep | `bkit-audit-reliability` |
| Changing packages, layers, or the graph | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Code Graph:** Steps 2–4 — local code-only extractor, e.g. graphify via a wrapper that strips API keys. Fallback: dependency linter and text search; graph counts `Not Checked`.
- [ ] **Dependency Linter:** Steps 5–6 — resolves through the compiler, e.g. dependency-cruiser, import-linter. Fallback: read import statements; say so per claim.
- [ ] **Git History:** Steps 1, 9, 13 — change coupling and the diff since the previous report. Fallback: change coupling `Not Checked`.
- [ ] **Web:** Step 12 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Steps 7, 11 — references, e.g. Serena, `tsserver`, gopls. Fallback: text search; name it per claim. Repeat any surprising low count.
- [ ] **Workspace Boundaries:** Monorepo task runner with a boundaries command → Step 5 — e.g. `turbo boundaries`, Nx. Fallback: layer matrix by hand.
- [ ] **Host Checklists:** Managed host → Step 10 — production checklist, e.g. vendor docs, dashboard. Fallback: docs only; live settings `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Graph:** Build locally, code-only, credentials stripped, via the project wrapper (never a bare extract). Record tool version, `built_at_commit`, node count, edge count, and cross-package edge count. Graph commit ≠ reviewed `HEAD` → findings from it are invalid; rebuild. Derived output stays untracked; a clean rebuild deletes only that output. After any path-alias change, clean rebuild — a force flag that does not clear the module-resolution cache keeps stale unresolved edges. A tree-sitter graph does not consult the language server: path aliases and manifest names are separate inputs, and losing either drops edges with no error. Keep manifests in the corpus so workspace imports resolve, then drop manifest-to-manifest edges before any matrix. Skip a whole-repo render; use package and module rollups. Dated extractor backups accumulate; a clean rebuild clears them. **Done when:** commit, counts, and tool list in `Graph`, or absent tool in `Not Checked`.
- [ ] **Step 3 — Report:** Read the extractor's report. Every section that looks like a finding is checked against source before it means anything. Import cycles: a cycle of type-only edges is erased at compile time and is not a runtime cycle — check every edge. Cross-package edges: do not dismiss one as structurally impossible once aliases resolve; do dismiss manifest-to-manifest edges. God nodes: high degree is a prompt to look, not a defect. Community dump with numbered labels and near-zero cohesion: the clustering pass found no structure — skip. **Done when:** each section dispositioned in `Graph`.
- [ ] **Step 4 — Structure:** Query the built graph, then the graph file directly. Two filters first: code only (source extensions; drop manifests and config), and tests separated with the repo's one test-path rule — do not type a shorter list. Test files legitimately cross boundaries; counting them as product hides the shape. Views that include test code and views that omit it can both be correct; record which is which. Dependency-shaped edges only (import, re-export, dynamic import). Nesting is not a dependency. Name-matching edges (e.g. `indirect_call`) can invent a link between unrelated files that share a function name — exclude them. Blast-radius queries under-report: missed callers inside anonymous callbacks, and calls in module-level initialiser expressions. A blast-radius set is a starting set, never a complete one. Checks, each kept as a series: (1) package dependency matrix, code-only, back-edges (a library depending on an app, or a leaf depending on a consumer) — should be a DAG; per workspace Ca, Ce, instability I = Ce/(Ca+Ce), abstractness (share of exported types and interfaces); flag a package that depends on a less stable one. (2) File-level cycles (strongly connected components over import edges); any component larger than one file is a candidate, then type-only check. (3) Fan-in: files everything imports. (4) Fan-out: files that import the most — barrels and god modules. (5) Duplicate symbol names: group callables by label across distinct non-test source files; three or more definitions is a prompt. Expect false positives from per-directory handlers and platform splits (e.g. `.native` / `.web`). Signal = a type or component duplicated where a canonical one exists. Then the same grouping over test code alone. Copies with no shared name need a text search. Confirmed hits → `bkit-audit-duplication`. **Done when:** matrix, cycles, rankings, and duplicates in `Structure`.
- [ ] **Step 5 — Layers:** A back-edge hunt with no written model lets a legal-looking wrong dependency pass. Carry the allowed package-layer matrix forward from the previous report. No carried matrix → draft it from recorded architecture decisions and mark it proposed. Diff the code-only matrix against it; every disallowed edge is a candidate. Encode the matrix as forbidden rules for the compiler-resolving linter, config under repo-root `tmp/` only, type-only edges excluded, and use it to check the extractor's import cycles. A rule that holds clean is the fitness function to propose under `Process Improvements`. Run the workspace boundary checker; record its version; a clean result is a candidate for the package-DAG gate, not proof. Native or other restricted app: every package it imports, transitively, contains no server-only module and no host-only module (e.g. `fs`, a server-only import, a service-role client) — express as a forbidden rule so a bundle break or a secret in the client is caught by structure. Public entry points: every workspace package has an exports map; deep imports past that map are candidates. Name the enforcing rule each would need. **Done when:** every disallowed edge in `Layers`, with the rule that would forbid it.
- [ ] **Step 6 — Boundary:** List every module that imports the privileged data client, reads a service-role secret, or reads a non-public secret, and confirm each imports a guard that turns a client import into a build error. Then confirm no client-entry module reaches one transitively: a client entry pulls its imports into the client bundle. Text search finds the list; the linter or a blast-radius query shows the reach; `Cross-Check` confirms it. **Done when:** every privileged module in `Boundary` with guard, reach, and verdict.
- [ ] **Step 7 — Cross-Check:** Language server answers from files on disk, so they do not go stale mid-edit, and it resolves what a tree-sitter graph cannot. The two fail in different directions: the graph misses anonymous-callback callers; the language server misses what the project graph cannot reach. Confirm fan-in and blast-radius claims with references before writing them up. Pace reference queries: back-to-back calls can return a partial count indistinguishable from a real one — repeat any surprising low count after a pause. Empty is inconclusive. Name blind spots neither tool sees: middleware guards, config-referenced files, runtime-registered handlers, mock-factory keys, and packages outside the language-server project graph. Use text search for non-source files, string literals, and any name not yet known. **Done when:** every load-bearing claim in `Cross-Check` names both tools, or the blind spot.
- [ ] **Step 8 — References:** Pick two or three well-regarded open-source repos on the same stack and compare shape: package boundaries, where shared code lives, how config and environment are split, how clients share code. Record each repo's name, the commit or tag read, and what was compared. A difference is a soft signal, not a finding by itself: report one only with the problem it would solve here, mark it low-confidence, and never rank it above a finding from the graph. **Done when:** repos, revisions, and comparisons in `References`, or `none`.
- [ ] **Step 9 — Coupling:** Three kinds of coupling carry no import edge. Events and runtime wiring: every event sent against every handler registered, plus schedules, database triggers, outbound database HTTP, edge functions, and inbound webhooks. Flag a producer with no consumer, a consumer with no producer, and two packages coupled only through an event. Data ownership: table and routine call sites per package and app. Flag a table written from more than one module or app, and any table written through the privileged client from more than one place. Change coupling: file pairs in commits since the previous report, different packages or different clients, that change together in more than half their commits with no import edge. Confirmed pairs → `bkit-audit-duplication`. **Done when:** events, tables, and pairs in `Coupling`.
- [ ] **Step 10 — Judgment:** Four criteria. Decisions against code: every architecture-scoped decision still honoured, and what enforces it (lint rule, dependency rule, or test). A decision nothing enforces = finding. A shape no decision records = undocumented architecture. Context and containers: C4 System Context and Container views as Mermaid, copied from the previous report and corrected. Every external service in code and in the env schema appears; nothing on the diagram is retired. The capability register is the package-level view only. Quality attributes: pick the product-quality characteristics that matter here; one scenario each (stimulus, environment, response, response measure); carry scenarios forward; judge whether the current shape meets each. Production checklists, on the quarterly pass: walk host checklists and send each gap to the audit that owns it. **Done when:** decisions, views, scenarios, and routed gaps in `Judgment`.
- [ ] **Step 11 — Verify:** No finding without opening the file. Confirm: a cycle is runtime, not type-only; a cross-package edge is a real import in a source file, not a shared dependency name in two manifests; a privileged call site is unguarded, not guarded by middleware neither tool can see; a duplicated name is real duplication, not a platform split or a local handler. Cite `file:line`. Destinations (name them; do not file): confirmed copies and change-coupled pairs → `bkit-audit-duplication`; a reachability question, or an event with no producer or consumer → `bkit-audit-dead-code`; a server-only module reachable from the client, or a secret reachable from a native bundle → `bkit-audit-security`; a table written from several places → `bkit-audit-database`; a production-checklist gap → the owning audit (`bkit-audit-security`, `bkit-audit-app-performance`, `bkit-audit-database`, `bkit-audit-reliability`); anything else → the slug this report names. **Done when:** every surviving candidate has `file:line`, tool, and destination.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor standard and per product-quality characteristic → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching shape (workspaces added or removed, manifest dependencies between workspaces, export maps, path aliases and project references, moved modules, new jobs and events, migrations that add tables, new external services in the env schema) → one-line verdict each. (b) Bounded ~30 min pass: what a senior software architect flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Presence only:** no finding rests on a missing edge alone.
- [ ] **Graph commit:** graph was built from the reviewed commit, or the mismatch is itself a finding.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Privileged or secret-bearing module reachable from a client bundle or a native app |
| `HIGH` | Runtime cycle or back-edge across the intended layers; privileged call site unguarded by anything either tool can see |
| `MEDIUM` | Architecture decision nothing enforces; confirmed duplicate where a canonical symbol exists; event with no producer or no consumer |
| `LOW` | Low-confidence shape difference versus a reference repo; diagram drift that changes no boundary |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: boundary / secrets first.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Graph

PENDING

### Structure

PENDING

### Layers

PENDING

### Boundary

PENDING

### Cross-Check

PENDING

### References

PENDING

### Coupling

PENDING

### Judgment

PENDING

### Checked

PENDING

### Not Checked

PENDING

### Standards Coverage

PENDING

### Beyond the Steps

PENDING

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, tools available, and the graph commit.
- [ ] **Series:** node, edge, and cross-package counts, and the coupling table, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
