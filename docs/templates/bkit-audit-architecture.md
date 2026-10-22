<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.1 — do not edit; run `bkit upgrade` to refresh -->

# Architecture Review

> [!CAUTION]
> **Purpose:** Judgment on codebase shape — package graph, intended layers, server, and client boundary, and coupling the import graph cannot see.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites this run's evidence (`file:line`, or command / query and its output) and tool behind it; a previous report's figure, list, or status is a lead, not evidence.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - A code graph confirms presence; a missing edge proves nothing. Corroborate every load-bearing claim with a language server or text search before it is a finding.
> - Build the graph locally and code-only; NEVER send the corpus or credentials to a model backend.

## Universal Instructions

### Context & Goals

File reading cannot answer acyclic package graph, hub modules, or copied types. Code graph + language server fail differently: graph edges may be false; omitted edges prove nothing. Target failure: **shape enforced in a diagram or clean graph but not in source** — type-only cycle treated as runtime, manifest edge as package dependency, privileged module reachable from client bundle.

**Applies when:** more than one package, or a written layer model. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a cycle adds a package, moves a module, or changes path aliases or project references. Production-checklist walk = part of quarterly pass.

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

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
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

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Graph:** Build locally, code-only, credentials stripped, via project wrapper (never bare extract). Record tool version, `built_at_commit`, node count, edge count, cross-package edge count. Graph commit ≠ reviewed `HEAD` → findings invalid; rebuild. Derived output untracked; clean rebuild deletes only that output. After path-alias change → clean rebuild — force flag that does not clear module-resolution cache keeps stale unresolved edges. Syntax-only graph (e.g. tree-sitter) does not consult language server: path aliases and manifest names are separate inputs; losing either drops edges with no error. Keep manifests in corpus so workspace imports resolve → drop manifest-to-manifest edges before matrix. Skip whole-repo render; use package and module rollups. Dated extractor backups (if the tool keeps them) accumulate; clean rebuild clears them. **Done when:** commit, counts, tool list in `Graph`, or absent tool in `Not Checked`.
- [ ] **Step 3 — Report:** Read extractor report. Every finding-like section checked against source before it counts. Import cycles: type-only edges erased at compile time ≠ runtime cycle — check every edge. Cross-package edges: do not dismiss as impossible once aliases resolve; do dismiss manifest-to-manifest. God nodes: high degree = look, not defect. Community dump with numbered labels and near-zero cohesion → clustering found no structure — skip. **Done when:** each section dispositioned in `Graph`.
- [ ] **Step 4 — Structure:** Query built graph, then graph file. Filters first: code only (source extensions; drop manifests and config); tests separated with repo's one test-path rule — do not type a shorter list. Test files cross boundaries; counting them as product hides shape. Views with/without test code can both be correct — record which. Dependency-shaped edges only (import, re-export, dynamic import). Nesting ≠ dependency. Name-matching edges (e.g. `indirect_call`) can invent links between unrelated files sharing a function name — exclude. Blast-radius under-reports: missed callers in anonymous callbacks, calls in module-level initialisers. Blast-radius set = starting set, never complete. Checks (each a series): (1) package dependency matrix, code-only, back-edges (library→app, leaf→consumer) — should be DAG; per workspace Ca, Ce, instability I = Ce/(Ca+Ce), abstractness (share of exported types and interfaces); flag package depending on less stable one. (2) File-level cycles (SCC over import edges); component >1 file = candidate → type-only check. (3) Fan-in: files everything imports. (4) Fan-out: most imports — barrels and god modules. (5) Duplicate symbol names: group callables by label across distinct non-test source files; ≥3 definitions = prompt. False positives: per-directory handlers, platform splits (e.g. `.native` / `.web`). Signal = type/component duplicated where canonical exists. Same grouping over test code alone. Copies without shared name → text search. Confirmed hits → `bkit-audit-duplication`. **Done when:** matrix, cycles, rankings, duplicates in `Structure`.
- [ ] **Step 5 — Layers:** Back-edge hunt with no written model lets legal wrong dependency pass. Carry allowed package-layer matrix from previous report. No matrix → draft from recorded architecture decisions, mark proposed. Diff code-only matrix; every disallowed edge = candidate. Encode matrix as forbidden rules for compiler-resolving linter, config under repo-root `tmp/` only, type-only edges excluded; check extractor import cycles. Clean rule = fitness function to propose under `Process Improvements`. Run workspace boundary checker; record version; clean result = candidate for package-DAG gate, not proof. Native/restricted app: every package it imports transitively has no server-only or host-only module (e.g. `fs`, server-only import, service-role client) — forbidden rule so bundle break or client secret caught by structure. Public entry points: every workspace package declares them where the ecosystem supports it (e.g. Node `exports` map, Go `internal/`); deep imports past them = candidates. Name enforcing rule each would need. **Done when:** every disallowed edge in `Layers`, with rule that would forbid it.
- [ ] **Step 6 — Boundary:** List modules importing privileged data client, service-role secret, or non-public secret; confirm each imports guard that turns client import into build error (e.g. `server-only`), where the stack has one; none → reach check alone, say so. Confirm no client-entry module reaches one transitively — client entry pulls imports into client bundle. Text search → list; linter or blast-radius → reach; `Cross-Check` confirms. **Done when:** every privileged module in `Boundary` with guard, reach, verdict.
- [ ] **Step 7 — Cross-Check:** Language server answers from disk — no mid-edit staleness; resolves what tree-sitter graph cannot. Graph misses anonymous-callback callers; language server misses what project graph cannot reach. Confirm fan-in and blast-radius with references before write-up. Pace reference queries — back-to-back calls can return partial count indistinguishable from real; repeat surprising low count after pause. Empty = inconclusive. Blind spots neither tool sees: middleware guards, config-referenced files, runtime-registered handlers, mock-factory keys, packages outside language-server project graph. Text search for non-source files, string literals, unknown names. **Done when:** every load-bearing claim in `Cross-Check` names both tools, or the blind spot.
- [ ] **Step 8 — References:** Pick 2–3 well-regarded OSS repos on same stack; compare shape: package boundaries, shared code location, config/env split, client code sharing. Record repo name, commit/tag, comparison. Difference = soft signal, not finding alone: report only with problem it would solve here, low-confidence, never rank above graph finding. **Done when:** repos, revisions, comparisons in `References`, or `none`.
- [ ] **Step 9 — Coupling:** Three couplings carry no import edge. Events/runtime wiring: every event sent vs handler registered, plus schedules, DB triggers, outbound DB HTTP, edge functions, inbound webhooks. Flag producer without consumer, consumer without producer, two packages coupled only via event. Data ownership: table and routine call sites per package and app. Flag table written from >1 module/app; table written via privileged client from >1 place. Change coupling: file pairs in commits since previous report, different packages or clients, co-change in >half commits with no import edge. Confirmed pairs → `bkit-audit-duplication`. **Done when:** events, tables, pairs in `Coupling`.
- [ ] **Step 10 — Judgment:** Four criteria. Decisions vs code: every architecture-scoped decision still honoured + what enforces it (lint, dependency rule, test). Unenforced decision = finding. Shape with no decision = undocumented architecture. Context/containers: C4 System Context and Container as Mermaid, from previous report corrected. Every external service in code and env schema appears; nothing retired on diagram. Capability register = package-level view only. Quality attributes: pick product-quality characteristics that matter; one scenario each (stimulus, environment, response, response measure); carry forward; judge shape meets each. Production checklists (quarterly): walk host checklists → route each gap to owning audit. **Done when:** decisions, views, scenarios, routed gaps in `Judgment`.
- [ ] **Step 11 — Verify:** No finding without opening file. Confirm: cycle is runtime not type-only; cross-package edge is real source import not shared manifest name; privileged call site unguarded not middleware-blind; duplicated name is real duplication not platform split/local handler. Cite `file:line`. Destinations (name; do not file): confirmed copies and change-coupled pairs → `bkit-audit-duplication`; reachability or event without producer/consumer → `bkit-audit-dead-code`; server-only from client or secret in native bundle → `bkit-audit-security`; table multi-writer → `bkit-audit-database`; production-checklist gap → owning audit (`bkit-audit-security`, `bkit-audit-app-performance`, `bkit-audit-database`, `bkit-audit-reliability`); else → slug this report names. **Done when:** every surviving candidate has `file:line`, tool, destination.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor standard and product-quality characteristic → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything since previous report's commit touching shape (workspaces add/remove, manifest deps between workspaces, export maps, path aliases and project references, moved modules, new jobs/events, migrations adding tables, new external services in env schema) → one-line verdict each. (b) Bounded ~30 min: what senior architect flags that no step asks; read since previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, tools available, and the graph commit.
- [ ] **Series:** node, edge, and cross-package counts, and the coupling table, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
