<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Architecture Review

> [!CAUTION]
> **Purpose:** A judgment on the codebase's shape: the package graph, the intended layers, the server and client boundary, and the coupling the import graph cannot see.
>
> **Rules:**
>
> - A code graph confirms presence. A missing edge proves nothing.
> - Corroborate every load-bearing claim with a language server or text search before it becomes a finding.
> - Build the graph locally, from code only.
> - NEVER send the corpus or credentials to a model backend.

## Universal Instructions

### Context & Goals

Reading files cannot show whether the package graph is acyclic, which modules are hubs, or where types were copied. A code graph and a language server fail in different ways: graph edges can be false, and edges the graph omits prove nothing. The failure this audit targets is a shape enforced in a diagram or a clean graph, but not in source. Examples: a type-only cycle treated as a runtime cycle, a manifest edge treated as a package dependency, or a privileged module reachable from the client bundle.

**Applies when:** the repo has more than one package, or a written layer model. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when a cycle adds a package, moves a module, or changes path aliases or project references. The walk through the production checklists is part of the quarterly pass.

**Anchor Standards:**

- C4 model (System Context, Container, Component).
- Architecture decision records (e.g., adr.github.io) and architectural fitness functions (e.g., _Building Evolutionary Architectures_).
- Product quality model, nine characteristics (e.g., ISO/IEC 25010:2023).
- Quality-attribute scenarios (e.g., ATAM utility tree).
- Package metrics: afferent coupling (Ca), efferent coupling (Ce), instability, abstractness, Stable Dependencies Principle (e.g., Robert C. Martin).
- Compiler-resolving dependency linter (e.g., dependency-cruiser, import-linter); record version.
- Workspace boundary checker (e.g., `turbo boundaries`, Nx module boundaries); record version.
- Layer-boundary linter (e.g., eslint-plugin-boundaries, ArchUnit).
- Well-architected pillars as a lens (e.g., AWS Well-Architected, Azure Well-Architected).
- Server and client component boundary, including a build-failing server-only guard (e.g., Next.js Server and Client Components, `server-only`).
- Host production checklists (e.g., Vercel, Supabase, Fly).

### Scope

- Check the package dependency graph: cycles, back-edges, coupling metrics, fan-in, fan-out and duplicate symbols.
- Check conformance to a written layer matrix, public entry points and deep imports.
- Check the server and client boundary, and the privileged modules.
- Find the coupling that has no import edge: events, data ownership and change coupling.
- Compare the shape with the recorded decisions, the context and container views, and the quality-attribute scenarios.
- Find production-checklist gaps, and route each one to the audit that owns it.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether a symbol is reachable | It is about reachability, not shape | `bkit-audit-dead-code` |
| Confirmed same-name copies, once named | The duplication audit owns them | `bkit-audit-duplication` |
| Auth holes and secret exposure in depth | The security audit owns them | `bkit-audit-security` |
| A table written from several places, in depth | The database audit owns it | `bkit-audit-database` |
| Cold-start time and request latency | The performance audit owns hot paths | `bkit-audit-app-performance` |
| Job retries and idempotency in depth | The reliability audit owns them | `bkit-audit-reliability` |
| Changing packages, layers, or the graph | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Code Graph:** Steps 2-4 — a local, code-only extractor (e.g., graphify through a wrapper that strips API keys). Fallback: use the dependency linter and text search, and mark the graph counts `Not Checked`.
- [ ] **Dependency Linter:** Steps 5-6 — a linter that resolves through the compiler (e.g., dependency-cruiser, import-linter). Fallback: read the import statements, and say so for each claim.
- [ ] **Git History:** Steps 1, 9, 13 — change coupling and the diff since the previous report. Fallback: mark change coupling `Not Checked`.
- [ ] **Web:** Step 12 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** the language is typed → Steps 7, 11 — references (e.g., Serena, `tsserver`, gopls). Fallback: text search, and name the tool for each claim. Repeat any surprisingly low count.
- [ ] **Workspace Boundaries:** **If** a monorepo task runner has a boundaries command → Step 5 — its boundary check (e.g., `turbo boundaries`, Nx). Fallback: check the layer matrix by hand.
- [ ] **Host Checklists:** **If** the app runs on a managed host → Step 10 — the production checklist (e.g., vendor docs, dashboard). Fallback: use the docs only, and mark live settings `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Graph:** Build the graph locally, from code only, with credentials stripped, through the project wrapper (never a bare extract). Record the tool version, `built_at_commit`, the node count, the edge count and the cross-package edge count. **If** the graph commit != the reviewed `HEAD` → the findings are invalid, so rebuild. Keep the derived output untracked. A clean rebuild deletes only that output. **If** path aliases changed → do a clean rebuild, because a force flag that does not clear the module-resolution cache keeps stale unresolved edges. A syntax-only graph (e.g., tree-sitter) does not consult the language server. Path aliases and manifest names are separate inputs, and losing either one drops edges with no error. Keep the manifests in the corpus so workspace imports resolve, then drop manifest-to-manifest edges before building the matrix. Skip the whole-repo render, and use package and module rollups. **If** the tool keeps dated extractor backups → they accumulate, and a clean rebuild clears them. **Done when:** `Graph` holds the commit, the counts and the tool list, or `Not Checked` names the absent tool.
- [ ] **Step 3 — Report:** Read the extractor's report. Check every finding-like section against source before it counts. Import cycles: a type-only edge is erased at compile time, so it is not a runtime cycle. Check every edge. Cross-package edges: once aliases resolve, do not dismiss them as impossible, but do dismiss manifest-to-manifest edges. God nodes: a high degree is a reason to look, not a defect. **If** a community dump has numbered labels and near-zero cohesion → the clustering found no structure, so skip it. **Done when:** `Graph` gives each section a disposition.
- [ ] **Step 4 — Structure:** Query the built graph first, then the graph file.
  - Apply the filters first: code only (source extensions; drop manifests and config), with tests separated by the repo's one test-path rule. Do not type a shorter list.
  - Test files cross boundaries, so counting them as product hides the shape. Views with and without test code can both be correct, so record which one you use.
  - Keep dependency-shaped edges only (import, re-export, dynamic import). Nesting is not dependency.
  - Exclude name-matching edges (e.g., `indirect_call`), because they can invent links between unrelated files that share a function name.
  - Blast radius under-reports: it misses callers in anonymous callbacks and calls in module-level initialisers. A blast-radius set is a starting set, never a complete one.
  - Run these checks, each as a series:
    - (1) Package dependencies:
      - Build the package dependency matrix, code only, and find the back-edges (library→app, leaf→consumer). It should be a DAG.
      - For each workspace, compute Ca, Ce, instability I = Ce/(Ca+Ce) and abstractness (the share of exported types and interfaces).
      - Flag a package that depends on a less stable one.
    - (2) Find file-level cycles (SCC over import edges). A component of more than 1 file is a candidate for the type-only check.
    - (3) Fan-in: rank the files everything imports.
    - (4) Fan-out: rank the files with the most imports, which are barrels and god modules.
    - (5) Duplicate symbol names:
      - Group callables by label across distinct non-test source files. A name with >=3 definitions is a prompt to look. Per-directory handlers and platform splits (e.g., `.native` / `.web`) are false positives. The signal is a type or component duplicated where a canonical one exists.
      - Run the same grouping over test code alone.
      - Find copies without a shared name with text search.
      - Confirmed hits go to `bkit-audit-duplication`.

  **Done when:** `Structure` holds the matrix, the cycles, the rankings and the duplicates.

- [ ] **Step 5 — Layers:** A back-edge hunt with no written model lets a legal but wrong dependency pass.
  - Carry the allowed package-layer matrix forward from the previous report.
  - **If** there is no matrix → draft one from the recorded architecture decisions, and mark it proposed.
  - Diff the code-only matrix against it. Every disallowed edge is a candidate.
  - Encode the matrix as forbidden rules for the compiler-resolving linter, with its config under the repo-root `tmp/` only and type-only edges excluded.
  - Check the extractor's import cycles. A rule that runs clean is a fitness function to propose under `Process Improvements`.
  - Run the workspace boundary checker, and record its version. A clean result is a candidate for a package-DAG gate, not proof.
  - **If** there is a native or restricted app →
    - Check that no package it imports transitively has a server-only or host-only module (e.g., `fs`, a server-only import, a service-role client).
    - Write a forbidden rule for it, so a bundle break or a client secret is caught by structure.
  - Public entry points:
    - Check that every workspace package declares them where the ecosystem supports it (e.g., the Node `exports` map, Go `internal/`). Deep imports past them are candidates.
    - Name the enforcing rule each one would need.

  **Done when:** `Layers` holds every disallowed edge, with the rule that would forbid it.

- [ ] **Step 6 — Boundary:** List the modules that import a privileged data client, a service-role secret or a non-public secret. Confirm that each one imports a guard that turns a client import into a build error (e.g., `server-only`), where the stack has one. **If** the stack has none → the reach check stands alone, so say so. Confirm that no client-entry module reaches one transitively, because a client entry pulls its imports into the client bundle. Use text search for the list, the linter or blast radius for reach, and `Cross-Check` to confirm. **Done when:** `Boundary` holds every privileged module, with its guard, reach and verdict.
- [ ] **Step 7 — Cross-Check:** The language server answers from disk, so it shows no mid-edit staleness, and it resolves what the tree-sitter graph cannot. The graph misses callers in anonymous callbacks. The language server misses what the project graph cannot reach. Confirm fan-in and blast radius with references before the write-up. Pace the reference queries, because back-to-back calls can return a partial count that looks the same as a real one. **If** a count is surprisingly low → repeat it after a pause. An empty result is inconclusive. Neither tool sees these blind spots: middleware guards, config-referenced files, runtime-registered handlers, mock-factory keys, and packages outside the language server's project graph. Use text search for non-source files, string literals and unknown names. **Done when:** every load-bearing claim in `Cross-Check` names both tools, or the blind spot.
- [ ] **Step 8 — References:** Pick 2-3 well-regarded OSS repos on the same stack, and compare their shape: package boundaries, where shared code lives, the config and env split, and how client code is shared. Record the repo name, the commit or tag, and the comparison. A difference is a soft signal, not a finding on its own. Report it only with the problem it would solve here, mark it low-confidence, and never rank it above a graph finding. **Done when:** `References` holds the repos, revisions and comparisons, or `none`.
- [ ] **Step 9 — Coupling:** Three kinds of coupling carry no import edge. Events and runtime wiring: compare every event sent with the handlers registered, plus schedules, DB triggers, outbound DB HTTP, edge functions and inbound webhooks. Flag a producer without a consumer, a consumer without a producer, and two packages coupled only through an event. Data ownership: list the table and routine call sites per package and app. Flag a table written from more than 1 module or app, and a table written through a privileged client from more than 1 place. Change coupling: find the file pairs, in commits since the previous report, that sit in different packages or clients and change together in more than half of the commits, with no import edge. Confirmed pairs go to `bkit-audit-duplication`. **Done when:** `Coupling` holds the events, tables and pairs.
- [ ] **Step 10 — Judgment:** Judge the shape on four criteria. Decisions against code: check that every architecture-scoped decision is still honoured, and name what enforces it (a lint, a dependency rule, a test). A decision nothing enforces is a finding. Shape with no decision behind it is undocumented architecture. Context and containers: draw the C4 System Context and Container views in Mermaid, from the previous report's views, corrected. Every external service in the code and the env schema appears, and nothing retired stays on the diagram. The capability register is a package-level view only. Quality attributes: pick the product-quality characteristics that matter, and write one scenario for each (stimulus, environment, response, response measure). Carry them forward, and judge whether the shape meets each one. Production checklists (quarterly): walk the host checklists, and route each gap to the audit that owns it. **Done when:** `Judgment` holds the decisions, the views, the scenarios and the routed gaps.
- [ ] **Step 11 — Verify:** Give no finding without opening the file. Confirm that a cycle is runtime, not type-only; that a cross-package edge is a real source import, not a shared manifest name; that a privileged call site is unguarded, not guarded by middleware the tools cannot see; and that a duplicated name is real duplication, not a platform split or a local handler. Cite `file:line`. Destinations (name; do not file): confirmed copies and change-coupled pairs go to `bkit-audit-duplication`; reachability, or an event without a producer or consumer, goes to `bkit-audit-dead-code`; a server-only module reached from the client, or a secret in the native bundle, goes to `bkit-audit-security`; a table with several writers goes to `bkit-audit-database`; a production-checklist gap goes to the audit that owns it (`bkit-audit-security`, `bkit-audit-app-performance`, `bkit-audit-database`, `bkit-audit-reliability`); anything else goes to the slug this report names. **Done when:** every surviving candidate has its `file:line`, tool and destination.
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor standard and one per product-quality characteristic, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches shape: workspaces added or removed, manifest dependencies between workspaces, export maps, path aliases and project references, moved modules, new jobs and events, migrations that add tables, and new external services in the env schema. (b) Spend a bounded pass of about 30 minutes on what a senior architect would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl` rows, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Presence only:** no finding rests on a missing edge alone.
- [ ] **Graph commit:** the graph was built from the reviewed commit, or the mismatch is itself a finding.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A privileged or secret-bearing module is reachable from a client bundle or a native app |
| `HIGH` | A runtime cycle or a back-edge across the intended layers. A privileged call site that nothing either tool can see guards |
| `MEDIUM` | An architecture decision that nothing enforces. A confirmed duplicate where a canonical symbol exists. An event with no producer or no consumer |
| `LOW` | A low-confidence shape difference from a reference repo. Diagram drift that changes no boundary |

Within a severity, list boundary and secrets findings first.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Tools:** `Summary` names the tools available.
- [ ] **Graph commit named:** `Summary` names the graph commit.
- [ ] **Series:** the report shows node, edge, and cross-package counts, and the coupling table, beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
