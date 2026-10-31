<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Duplication Audit

> [!CAUTION]
> **Purpose:** A verdict on every behaviour with more than one implementation: inline rules, competing capability mechanisms, restated types, paired decisions, and merges that should not have happened.
>
> **Rules:**
>
> - Run generated registers and graphs in verify-only mode, or on a throwaway copy.
> - Never regenerate a tracked file.

## Universal Instructions

### Context & Goals

Identical-signature gates catch identical copies. The duplication that hurts is divergent: one behaviour with N implementations that have drifted apart, each locally correct, so review and tests pass. It comes in three shapes that other detectors cannot see. A rule is one expression inlined at N sites and then edited. The expression is not a symbol, so it needs text or structural search, not the language server. A capability is one operation done by N modules or mechanisms. It needs the register, reference search and literal-mechanism search. A paired decision is two files that must change together, each owning its half, with nothing tying them. It needs co-change history. A shared home that exists does not mean every site calls it, and a documented convention does not stop drift. Until a guard covers both altitudes, this sweep is the prevention. The failure this audit targets is copies of one piece of knowledge that silently disagree, e.g., a security control left `null` at a call site the remediation missed.

**Applies when:** the source code spans more than one module, package or platform. **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass when a consolidation lands (re-check its register row and call sites), when a new owner module or shared package lands, or when a production failure traces to divergent copies.

**Anchor Standards:**

- Clone taxonomy Type-1 to Type-4 and clone detector at version run (e.g. jscpd clone-types guide, PMD CPD).
- Structural search at version run (e.g. ast-grep, Semgrep).
- DRY as knowledge, not text (_The Pragmatic Programmer_, edition read).
- Rule of three and "The Wrong Abstraction" (Sandi Metz).
- Change coupling (e.g. code-maat).
- Package-manager dedupe at version run (e.g. `pnpm dedupe --check`, `npm dedupe`).
- AI-assisted code-quality research, latest year (e.g. GitClear duplicated-block prevalence).

### Scope

- Check the rule altitude: one business rule inlined at N sites, such as fallback chains, null against falsy, formatting, predicates and defaults.
- Check the capability altitude: one operation with N implementations or mechanisms, and the capability register.
- Find paired decisions: files that must change together with nothing tying them.
- Find token and syntax-tree clones (Type-1 to Type-3), including cross-platform counterparts.
- Find types and schemas restated by hand instead of derived from the generated or source schema.
- Find two libraries for one job, and one package resolved at several versions.
- Find copies outside code: SQL, shared config and i18n strings.
- Find wrong abstractions: merges that landed and serve different knowledge.
- Decide whether the next step for prevention is a guard or a sweep.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Single-call-site helpers | They are not duplication | — |
| Capability with one implementation that is wrong | It is a gap, not duplication | Plan / `docs/failures.jsonl` |
| Unreachable modules beyond reference check | The dead-code sweep covers it | `bkit-audit-dead-code` |
| One-off structural problems; module-graph shape | The architecture sweep covers it | `bkit-audit-architecture` |
| Upgrading / removing dependencies | The dependency sweep covers it | `bkit-audit-dependencies` |
| Mobile OS divergence (e.g. iOS vs Android) | It is a test-lane blind spot | `bkit-audit-testing` |
| Building the guard; CI wiring | It is a gate change | `bkit-audit-gates` |
| Consolidating copies | The audit only reports | A plan made from this report |

### Verdicts

- **DUPLICATE:** the copies are one piece of knowledge, and change for the same reason. Name the consolidation and its home.
- **COINCIDENTAL:** the copies look alike, but change for different reasons. Leave them, and record why.
- **RULE-OF-THREE-PENDING:** there are two copies of one piece of knowledge. Record them and watch; consolidate at the third.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

**Test:** the copies hold the same knowledge, with the same reason to change. A paired decision is one decision in two places, so it is `DUPLICATE`, and its home is a paired-owner check or a gate.

**Confirm before `DUPLICATE`:**

- A duplicated name is not a deliberate platform split (e.g., `.native.tsx` / `.web.tsx`) or a local UI handler.
- The bypass is gratuitous, not a surface the owner cannot serve (e.g., a framework-specific request context).
- Similar defaults are one decision. A least-privilege read default and a signup write default are not, and forcing one value breaks a flow.
- A "dead" or "unwired" copy has no config-only or deployed consumer: an explicit worker registry or a deployed function.
- Co-change history (`Coupling`) says it is one decision, or that the copies have already diverged.

Carry `COINCIDENTAL` and `RULE-OF-THREE-PENDING` forward in `Carried Forward`, so a two-site finding is neither consolidated early nor rediscovered on every run.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Clean Tree:** Steps 2-13 — a clean `git status` at the recorded commit, because findings only mean something against a known tree. Fallback: use a detached worktree off the default branch.
- [ ] **Text Search:** Steps 3, 5, 7-10 — inline expressions, literals, env names and non-code files (e.g., ripgrep, `git grep`). Fallback: `grep -rn`.
- [ ] **Structural Search:** Steps 3, 12 — syntax patterns that skip comments and strings and catch reordered copies (e.g., ast-grep, Semgrep). Run it ad hoc, and record the resolved version. Fallback: text search, and mark reformatted copies `Not Checked`.
- [ ] **Clone Detector:** Steps 4, 8 — Type-1 to Type-3 clones (e.g., jscpd, PMD CPD). Run it ad hoc, and record the resolved version. Fallback: mark `Clones` `Not Checked`.
- [ ] **Git History:** Steps 4, 10 — the full history, for the clone baseline, blame and co-change. Fallback: mark growth and coupling `Not Checked`.
- [ ] **Web:** Step 14 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** the language is typed → Steps 3, 5, 13 — references on helpers and owners (e.g., Serena, `tsserver`, pyright). Fallback: text search only. Treat caller sets as hypotheses, and `one` against `bypassed` as unproven.
- [ ] **Module Graph:** Steps 5, 10 — duplicate symbol names, god nodes and import edges (e.g., graphify, dependency-cruiser, madge). Fallback: mark the module-graph cross-check `Not Checked`.
- [ ] **Capability Register:** **If** a register exists → Step 5 — capability, owner and status, in verify-only mode. Fallback: derive the rows in `Capabilities` only. No register is a finding.
- [ ] **Cross-Platform Compare:** **If** 2 or more platforms or apps share behaviour → Step 4 — a counterpart listing (e.g., jscpd `--compare`). Fallback: text search for counterparts.
- [ ] **Package Manager:** **If** the project has a lockfile → Step 7 — the dedupe check and the resolution reason (e.g., `pnpm dedupe --check` / `pnpm why`, `npm ls --all`). Fallback: read the lockfile.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** List the apps, packages and platforms; the shared homes (utility and owner modules); the capability register; and the duplication gates enforced, with what each one catches (e.g., an identical-signature gate catches identical copies only). **Done when:** `Checked` holds surface map and existing gates, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Rule Altitude:** Hunt for one conceptual operation inlined at N sites instead of called from one function, where the copies differ on load-bearing details. Look at fallback chains (e.g., JS `a ?? b ?? c`, with a different terminal fallback or order); null against falsy (e.g., JS `??` against `||`, with or without trim, optional-chain guards); formatting (date, time and timezone, currency, name and initials, address); predicates ("is active / deleted / owner?" filters); and defaults (the same enum or config default hardcoded in several readers). Use structural rules where possible, and text search where not. Keep the rules under `tmp/`, and paste each one into the report for the next run. For each shared helper, subtract: the references on the helper are the routed set, the sites matching the inline pattern are the inline set, and inline-but-not-routed sites are unmigrated. Counts taken before a reference-graph change (e.g., project references added) are stale, so take them again; never carry them forward. **Done when:** `Inline Rules` has a row per rule: helper · routed · inline · unmigrated · verdict, with its search rule.
- [ ] **Step 4 — Clones:** Run the clone detector over the source roots, with machine-readable output, in three passes: Type-1 exact; Type-2 renamed (ignoring identifiers and literals); and Type-3 near-miss (e.g., similarity 0.85, syntax-tree mode). Record the duplication % per package as a series against the previous report. Every hit is a candidate for `Verify`, not a finding. **If** there are multiple platforms → list the counterparts: the functions with and without a counterpart on each side. Growth: baseline the exact pass at the previous report's commit, then count the clones new since then against the ones consolidated since then, with blame naming who introduced each. Clones arriving faster than they are consolidated is a finding. **Done when:** `Clones` holds the per-package %, the growth and the counterpart list.
- [ ] **Step 5 — Capability Altitude:** Work above the file graph, on capabilities rather than files. For each capability, record the owner, the callers, the status and a note. The status is `one` when there is one implementation and every caller routes through it; `bypassed` when an owner exists and some callers skip it; `split` when 2 or more implementations compete with no owner; and `gap` when it is designed but not built. Three detectors give different findings. (a) Literal-mechanism search for a second mechanism (e.g., a second SDK client constructor, rate limiter, email-send call or duplicated validation regex) is the primary detector, because the symbol graph cannot see a duplicated regex. (b) Language-server references on each owner give the caller set, and decide `one` against `bypassed`. (c) The module graph's duplicate-symbol-name check groups callable nodes by name across distinct non-test source files; 3 or more definitions make a candidate. Its god-node list flags an owner that has become load-bearing. A register status that differs from the measured status is a finding. The register is not edited. **Done when:** `Capabilities` has a row per capability: owner · callers · measured status · register status · verdict.
- [ ] **Step 6 — Restated Types:** **If** the language is typed **and** there is a schema source (generated DB types, migrations, IDL) → for each core table, find the hand-written types, validation schemas and route validators that restate its columns, enums and constraints. A restatement not derived from the source is a finding. Diff it against the source: a column added, renamed or made nullable on one side only is a live defect. **Done when:** `Types` has a row per restated type: source · derived? · drift · verdict, or the skip is recorded with evidence.
- [ ] **Step 7 — Libraries:** Literal search finds a second client, not a second library. List the dependencies across every manifest that do one job: two date libraries, two validation libraries or two majors side by side, two HTTP clients, or two markdown parsers. Run the dedupe check, and give the resolution reason for every package at more than one version. Each one is a capability row, with the library as the mechanism. **Done when:** `Libraries` lists every same-job pair, and every multi-version package with its reason.
- [ ] **Step 8 — Outside Code:** SQL: access-policy bodies and helper functions redefined across migrations instead of one function. Shared config: type-checker, linter and styling presets copied between apps instead of extending a shared package. i18n: the same string under several keys. List the formats the clone detector supports, run it over migrations and config, and text search the rest. **Done when:** every hit is a candidate for `Verify`, and an absent surface is in `Checked`.
- [ ] **Step 9 — Wrong Abstractions:** This is the opposite failure: a merge that landed and should not have. Find shared helpers with boolean or mode parameters, or per-caller branches (e.g., `if (caller === …)`, more than 2 option flags), and fewer than 3 callers. **If** the callers serve different knowledge → recommend inlining it back. `Verify` guards new merges, and this step reviews old ones. **Done when:** `Wrong Abstractions` has a row per helper: params · callers · knowledge · verdict.
- [ ] **Step 10 — Coupling:** For each candidate set, read the co-change history (e.g., `git log --name-only`, code-maat). **If** the files always changed together → it is a true duplicate; consolidate it. **If** they changed separately → they have already diverged, so decide which behaviour is right first. Run the reverse detector: file pairs in different packages, or one per platform, that co-change in more than 50% of commits with no import edge are paired-decision candidates. Also find comments that tie two files together in prose (e.g., `keep in sync`, `must match`, `mirrors`). A pair goes straight to `Prevention`. **Done when:** `Coupling` has a row per candidate and pair: co-change share · import edge · verdict.
- [ ] **Step 11 — Confidence:** Name the tool behind every count. Grade each claim type. "A second implementation exists" is high, because every site was read rather than matched. Exact call-site counts are medium. "No production consumer" is medium and needs corroboration in the code. "Does not exist" is high only when it is absent from the schema and from all source. The language server under-reports, which gives a false `one`. Pace the queries, and re-run a surprisingly low or empty count before recording it. An empty result is inconclusive, so corroborate it with text search. Mocked-module factory keys and packages outside the project graph are invisible to the language server, so use text search for them. The module graph confirms presence, never absence. It misses callers in anonymous callbacks and module-level initialisers. Manifest-driven or type-only edges can fake cross-package edges and cycles, and the resolution cache goes stale after a path-alias change. The language server and text search agreeing on a count is the strongest evidence; when they disagree, name the file to open. **If** a count is corrected mid-run → record which count, from what, and by what tool. **Done when:** `Method` grades every claim type and names the tool for each count, including the corrections.
- [ ] **Step 12 — Prevention:** Check whether a guard fails on re-implementation at both altitudes: an inline rule expression outside its helper, and a mechanism (a constructor, a send call, an env name) outside its owner. A bespoke guard per rule means one guard per consolidated field, forever. A structural rule per pattern (with owner-file ignores, the rules checked in, seeded from the Step 3 rules), plus a literal search with an owner allowlist for env names, covers both altitudes without the language server. Record whether the recorded decisions favour a guard or a sweep, and whether evidence since then contradicts them. Do not build anything. **Done when:** `Prevention` states whether the next step is a guard or a sweep, with the evidence and the rules it would start from.
- [ ] **Step 13 — Verify:** Open every candidate file, and cite `file:line` for every survivor. Apply the `Verdicts` checks. Re-check the previous `Carried Forward` rows; a third copy makes one `DUPLICATE`. Rank the survivors by blast radius x divergence x user visibility. For each survivor, name the consolidation and its home. A rule gets one function in the correct shared package, with the inline copies removed. A capability gets one owner module with a call contract, and the register row updated. A wrong abstraction is inlined back. A paired decision gets a paired-owner check or a gate. A drifted type or a live defect gets a `docs/failures.jsonl` row, fixed ahead of any refactor. A second library or version goes to `bkit-audit-dependencies`. A deliberate bypass blocked on other work gets a register row that names the blocker, because an unrecorded bypass reads as `one` on the next run, which is a false clean. A one-off structural problem, or missing module-graph evidence, goes to `bkit-audit-architecture`. **If** a consolidation changes a shared signature → `Expected` names the reference check to run first. **Done when:** every candidate has a verdict, evidence, a rank and a home.
- [ ] **Step 14 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per standard, per clone type (Type-1 to Type-4), and per shape (rule, capability, paired decision), marked checked (with the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 15 — Anything Else:** (a) List everything changed since the previous report's commit that touches duplication (new shared helpers and owner modules, shared packages, cross-platform counterparts of a screen or hook, validation schemas and route validators, migrations adding tables, enums or policies, new dependencies, config presets and i18n keys), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior engineer owning shared packages would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Sites read:** every `DUPLICATE` cites `file:line` from an opened file, not a match.
- [ ] **Tree clean:** this run changed no tracked file, and the report names the paths other writers changed.
- [ ] **Registers unchanged:** the tracked registers and graphs are unchanged.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A divergent copy disables a security or access control (e.g., a rate limiter, auth or a tenancy check), or loses data. A workflow is broken with no workaround. |
| `HIGH` | Copies of one rule diverge in a way users can see. A hand-written type has drifted from the schema. A paired decision is out of step. A `split` capability sits on a request path. |
| `MEDIUM` | Copies are consistent today, with drift risk and no live bug. An owner is `bypassed`. The register status differs from the measured one. An abstraction is wrong. Two libraries or versions do one job. SQL, config or i18n is copied. Clone growth outpaces consolidation. |
| `LOW` | Copies are cosmetic. Clones are test-only. A stale register note changes no status. |

Within a severity, list higher blast radius x divergence x user visibility first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Inline Rules

PENDING

### Clones

PENDING

### Capabilities

PENDING

### Types

PENDING

### Libraries

PENDING

### Wrong Abstractions

PENDING

### Coupling

PENDING

### Method

PENDING

### Prevention

PENDING

### Carried Forward

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
- [ ] **Summary:** `Summary` gives the count per severity, the count per verdict, and the guard-or-sweep call.
- [ ] **Series:** the report shows per-package duplication % and clone growth beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
