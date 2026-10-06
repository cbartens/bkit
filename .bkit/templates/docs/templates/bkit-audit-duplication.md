<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Duplication Audit

> [!CAUTION]
> **Purpose:** Verdict on every behaviour with more than one implementation — inline rules, competing capability mechanisms, restated types, paired decisions, and merges that should not have happened.
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
> - Generated registers / graphs → verify-only mode or throwaway copy; NEVER regenerate a tracked file.

## Universal Instructions

### Context & Goals

Identical-signature gates catch identical copies; the damaging case is divergent duplication — one behaviour with N implementations that drifted apart, each locally correct, so review and tests pass. Three shapes, each invisible to the others' detectors: **rule** (one expression inlined at N sites then edited — an expression is not a symbol, so text / structural search, not a language server), **capability** (one operation with N modules or mechanisms — register, reference search, literal-mechanism search), **paired decision** (two files that must change together, each correctly owning its half, nothing tying them — co-change history). A shared home existing ≠ every site calling it, and a documented convention does not stop drift. Until a guard covers both altitudes, this sweep is the prevention. Target failure: **copies of one piece of knowledge that silently disagree** — e.g. a security control left `null` at the one call site a remediation missed.

**Applies when:** source code spanning more than one module, package, or platform. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass when a consolidation lands (re-check its register row and call sites), a new owner module or shared package lands, or a production failure traces to divergent copies.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Clone taxonomy Type-1 to Type-4 and clone detector at version run (e.g. jscpd clone-types guide, PMD CPD).
- Structural search at version run (e.g. ast-grep, Semgrep).
- DRY as knowledge, not text (_The Pragmatic Programmer_, edition read).
- Rule of three and "The Wrong Abstraction" (Sandi Metz).
- Change coupling (e.g. code-maat).
- Package-manager dedupe at version run (e.g. `pnpm dedupe --check`, `npm dedupe`).
- AI-assisted code-quality research, latest year (e.g. GitClear duplicated-block prevalence).

### Scope

- Rule altitude: one business rule inlined at N sites — fallback chains, null vs falsy, formatting, predicates, defaults.
- Capability altitude: one operation with N implementations or mechanisms; capability register.
- Paired decisions: files that must change together with nothing tying them.
- Token and syntax-tree clones (Type-1 to Type-3), incl. cross-platform counterparts.
- Types and schemas restated by hand vs generated / source schema.
- Two libraries for one job; one package resolved at several versions.
- Non-code copies: SQL, shared config, i18n strings.
- Wrong abstractions: landed merges serving different knowledge.
- Prevention: next step = guard or sweep.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Single-call-site helpers | Not duplication | — |
| Capability with one implementation that is wrong | Gap, not duplication | Plan / `docs/failures.jsonl` |
| Unreachable modules beyond reference check | Dead-code sweep | `bkit-audit-dead-code` |
| One-off structural problems; module-graph shape | Architecture sweep | `bkit-audit-architecture` |
| Upgrading / removing dependencies | Dependency sweep | `bkit-audit-dependencies` |
| Mobile OS divergence (e.g. iOS vs Android) | Test-lane blind spot | `bkit-audit-testing` |
| Building the guard; CI wiring | Gate change | `bkit-audit-gates` |
| Consolidating copies | Audit reports only | Plan from this report |

### Verdicts

- **DUPLICATE:** one piece of knowledge; copies change for the same reason. Name the consolidation and its home.
- **COINCIDENTAL:** looks alike; changes for different reasons. Leave; record why.
- **RULE-OF-THREE-PENDING:** two copies of one piece of knowledge. Record and watch; consolidate at the third.
- **OTHER:** fits none; say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**Test:** same knowledge, same reason to change. A paired decision = one decision in two places → `DUPLICATE`; home = paired-owner check or gate.

**Confirm before `DUPLICATE`:**

- Duplicated name ≠ deliberate platform split (e.g. `.native.tsx` / `.web.tsx`) or local UI handler.
- Bypass is gratuitous, not a surface the owner cannot serve (e.g. framework-specific request context).
- Similar defaults are one decision — a least-privilege read default and a signup write default are not; forcing one value breaks a flow.
- "Dead" / "unwired" copy has no config-only or deployed consumer (explicit worker registries, deployed functions).
- Co-change history (`Coupling`) says one decision, or already diverged.

Carry `COINCIDENTAL` and `RULE-OF-THREE-PENDING` forward in `Carried Forward` — a two-site finding is neither consolidated early nor rediscovered every run.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Clean Tree:** Steps 2–13 — clean `git status` at recorded commit; findings only mean something against a known tree. Fallback: detached worktree off default branch.
- [ ] **Text Search:** Steps 3, 5, 7–10 — inline expressions, literals, env names, non-code files, e.g. ripgrep, `git grep`. Fallback: `grep -rn`.
- [ ] **Structural Search:** Steps 3, 12 — syntax patterns that skip comments / strings and catch reordered copies, e.g. ast-grep, Semgrep; ad hoc run, record resolved version. Fallback: text search; reformatted copies `Not Checked`.
- [ ] **Clone Detector:** Steps 4, 8 — Type-1 to Type-3 clones, e.g. jscpd, PMD CPD; ad hoc run, record resolved version. Fallback: `Clones` `Not Checked`.
- [ ] **Git History:** Steps 4, 10 — full history for clone baseline, blame, and co-change. Fallback: growth and coupling `Not Checked`.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Steps 3, 5, 13 — references on helpers and owners, e.g. Serena, `tsserver`, pyright. Fallback: text search only; caller sets = hypotheses; `one` vs `bypassed` unproven.
- [ ] **Module Graph:** Steps 5, 10 — duplicate symbol names, god nodes, import edges, e.g. graphify, dependency-cruiser, madge. Fallback: module-graph cross-check `Not Checked`.
- [ ] **Capability Register:** Register exists → Step 5 — capability → owner → status, verify-only mode. Fallback: rows derived in `Capabilities` only; no register = finding.
- [ ] **Cross-Platform Compare:** 2+ platforms / apps sharing behaviour → Step 4 — counterpart listing, e.g. jscpd `--compare`. Fallback: text search for counterparts.
- [ ] **Package Manager:** Lockfile → Step 7 — dedupe check and resolution reason, e.g. `pnpm dedupe --check` / `pnpm why`, `npm ls --all`. Fallback: read lockfile.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** List apps, packages, and platforms; shared homes (utility / owner modules); capability register; duplication gates already enforced and what each catches (e.g. identical-signature gate → identical copies only). **Done when:** surface map and existing gates in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Rule Altitude:** Hunt one conceptual operation inlined at N sites instead of called from one function, copies differing on load-bearing details: fallback chains (`a ?? b ?? c`, divergent terminal fallback or order); null vs falsy (`??` vs `||`, with / without trim, optional-chain guards); formatting (date / time / timezone, currency, name / initials, address); predicates ("is active / deleted / owner?" filters); defaults (same enum / config default hardcoded in several readers). Structural rules where possible, text search where not; keep rules under `tmp/`, paste each into report so next run re-runs them. Then subtraction per shared helper: references on helper (routed set) minus sites still matching the inline pattern (inline set) → inline-not-routed = unmigrated site. Counts measured before a reference-graph change (e.g. project references added) = stale → re-take, never carry forward. **Done when:** `Inline Rules` row per rule: helper · routed · inline · unmigrated · verdict, with its search rule.
- [ ] **Step 4 — Clones:** Clone detector over source roots, machine-readable output, three passes: Type-1 exact; Type-2 renamed (ignore identifiers / literals); Type-3 near-miss (e.g. similarity 0.85, syntax-tree mode). Duplication % per package as series vs previous report. Every hit = candidate for `Verify`, not finding. Multiple platforms → counterpart listing (which functions on each side have a counterpart, which none). Growth: exact pass baselined at previous report's commit → clones new since vs consolidated since, with blame naming introducer; arrival faster than consolidation = finding. **Done when:** per-package %, growth, and counterpart list in `Clones`.
- [ ] **Step 5 — Capability Altitude:** Altitude above the file graph: capabilities, not files. Per capability: owner, callers, status, note. Status: `one` = one implementation, every caller routes through it; `bypassed` = owner exists, some callers skip it; `split` = 2+ competing implementations, no owner; `gap` = designed, not built. Run all three detectors — they find different things: (a) literal-mechanism search for a second mechanism (e.g. second SDK client constructor, rate limiter, email-send call, duplicated validation regex) — primary; a symbol graph cannot see a duplicated regex; (b) language-server references on each owner → authoritative caller set, separating `one` from `bypassed`; (c) module-graph duplicate-symbol-name check — group callable nodes by name across distinct non-test source files, 3+ definitions = candidate; god-node list flags an owner quietly gone load-bearing. Register status ≠ measured status = finding; register is NOT edited. **Done when:** `Capabilities` row per capability: owner · callers · measured status · register status · verdict.
- [ ] **Step 6 — Restated Types:** Typed language with schema source (generated DB types, migrations, IDL) → per core table: hand-written types, validation schemas, and route validators restating columns, enums, or constraints. Not derived from source = finding. Diff each vs source: column added, renamed, or made nullable on one side only = live defect. **Done when:** `Types` row per restated type: source · derived? · drift · verdict, or skip with evidence.
- [ ] **Step 7 — Libraries:** Literal search finds a second client, not a second library. List dependencies across every manifest doing one job: two date libraries, two validation libraries or two majors side by side, two HTTP clients, two markdown parsers. Then dedupe check and resolution reason for every package resolved at more than one version. Each = capability row with a library as mechanism. **Done when:** `Libraries` lists every same-job pair and multi-version package with reason.
- [ ] **Step 8 — Outside Code:** SQL: access-policy bodies and helper functions redefined across migrations instead of calling one function. Shared config: type-checker, linter, styling presets copied between apps instead of extending a shared package. i18n: same string under several keys. List formats clone detector supports; run it over migrations and config; text search the rest. **Done when:** every hit = candidate for `Verify`; absent surface recorded in `Checked`.
- [ ] **Step 9 — Wrong Abstractions:** Opposite failure: a merge that landed and should not have. Shared helpers with boolean / mode parameters or per-caller branches (`if (caller === …)`, >2 option flags) and <3 callers. Callers serve different knowledge → recommend inlining back. `Verify` guards new merges; this reviews old ones. **Done when:** `Wrong Abstractions` row per helper: params · callers · knowledge · verdict.
- [ ] **Step 10 — Coupling:** Per candidate set: co-change history (e.g. `git log --name-only`, code-maat). Always changed together → true duplicate, consolidate; changed separately → already diverged, decide which behaviour is right first. Reverse as detector: file pairs in different packages, or one per platform, co-changing in >50% of their commits with no import edge → paired-decision candidate. Also comments tying two files by prose (e.g. `keep in sync`, `must match`, `mirrors`). Pair → straight to `Prevention`. **Done when:** `Coupling` row per candidate and pair: co-change share · import edge · verdict.
- [ ] **Step 11 — Confidence:** Name tool behind every count. Grade claim types: second implementation exists = high (every site read, not matched); exact call-site counts = medium; "no production consumer" = medium, needs in-code corroboration; "does not exist" = high only when absent from schema and all source. Language server under-reports → manufactures false `one`: pace queries; re-run any surprising low / empty count before recording; empty = inconclusive, corroborate with text search; mocked-module factory keys and packages outside the project graph invisible. Module graph fails the other way: confirms presence, never absence; misses callers in anonymous callbacks and module-level initialisers; manifest-driven or type-only edges can fake cross-package edges and cycles; stale resolution cache after path-alias change. Language server and text search agreeing on a count = strongest evidence; disagreement names the file to open. Count corrected mid-run → record which, from what, by what tool. **Done when:** `Method` grades every claim type and names tool per count, incl. corrections.
- [ ] **Step 12 — Prevention:** Does a guard fail on re-implementation at both altitudes — inline rule expression outside its helper, and mechanism (constructor, send call, env name) outside its owner? Per-rule bespoke guard = one guard per consolidated field, forever; structural rule per pattern (owner-file ignores, rules checked in, seeded from Step 3 rules) plus literal search with owner allowlist (env names) covers both altitudes without a language server. Record whether recorded decisions favour guard or sweep, and whether evidence since contradicts them. Do NOT build. **Done when:** `Prevention` states next step = guard or sweep, with evidence and the rules it would start from.
- [ ] **Step 13 — Verify:** Open every candidate file; cite `file:line` for every survivor. Apply `Verdicts` checks; re-check previous `Carried Forward` rows (third copy → `DUPLICATE`). Rank survivors by blast radius × divergence × user-visibility. Per survivor name consolidation and home: rule → one function in correct shared package, inline copies removed; capability → one owner module with call contract, register row updated; wrong abstraction → inlined back; paired decision → paired-owner check or gate; drifted type or live defect → `docs/failures.jsonl` row, fix ahead of refactor; second library / version → `bkit-audit-dependencies`; deliberate bypass blocked on other work → register row naming blocker (unrecorded bypass reads `one` next run = false clean); one-off structural problem or missing module-graph evidence → `bkit-audit-architecture`. Consolidation changing a shared signature → `Expected` names the reference check first. **Done when:** every candidate has verdict, evidence, rank, and home.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per standard, per clone type (Type-1 to Type-4), and per shape (rule, capability, paired decision) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching duplication (new shared helpers / owner modules, new shared packages, new cross-platform counterparts of a screen or hook, validation schemas and route validators, migrations adding tables / enums / policies, new dependencies, config presets, i18n keys) → one-line verdict each. (b) Bounded ~30 min pass: what a senior engineer owning the shared packages flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Sites read:** every `DUPLICATE` cites `file:line` from an opened file, not a match.
- [ ] **Tree clean:** `git status` clean; tracked registers / graphs unchanged.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Divergent copy disables a security / access control (e.g. rate limiter, auth, or tenancy check) or loses data; broken workflow with no workaround |
| `HIGH` | User-visible divergence between copies of one rule; hand-written type drifted from schema; paired decision out of step; `split` capability on a request path |
| `MEDIUM` | Copies consistent today (drift risk, no live bug); `bypassed` owner; register status ≠ measured; wrong abstraction; two libraries / versions for one job; SQL / config / i18n copies; clone growth outpacing consolidation |
| `LOW` | Cosmetic copies; test-only clones; stale register note changing no status |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: higher blast radius × divergence × user-visibility first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, count per verdict, and the guard-or-sweep call.
- [ ] **Series:** per-package duplication % and clone growth beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
