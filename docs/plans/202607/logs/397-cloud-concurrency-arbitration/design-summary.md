Verdict: PASS

<!-- verdict:end -->

# Design Summary: #397 Cloud Concurrency Arbitration

## Overview

Issue #397 proposed per-FID `.lock` files to serialize cloud runs. Design corrects six false premises (C1–C6): both file locks are gitignored (runner-local, no cross-run visibility); there is no cloud-side arbiter today; "second ship queues" is not a platform constant but depends on `concurrency.queue` (defaulting to `single`, holding one pending run and displacing the next).

The design delivers repo-wide ship capacity-1 via two orthogonal concurrency lanes: (1) **Phase lane** at workflow level (allowlist discriminator on branch: `feat/**` / `fix/**`, excludes green `dev`), preventing second ship boot; (2) **FID lane** at job level (resolver job outputs `bkit-fid-{FID}` group), closing cross-payload-shape same-FID collision. Both set `cancel-in-progress: false` uniformly (required for `queue: max` legal syntax). No new state surface; existing `.lock` files unchanged, re-scoped as same-filesystem-only.

## Design Quality

Well-reasoned, addresses all corrected premises, separates concerns by evaluation time. Acceptance Scenario matches template spec: narrative (setup + desire + concern), five measurable success criteria, six-cell process sketch, seven edge cases with liveness and triage detail. Risks identified (10 listed, 2 resolved with evidence), trade-offs explicit (queued-run staleness cleared; dual-agent double-ship deferred). Approaches table shows synthesis: two-tier was independently reached by two of three exploration passes; `queue: max` is new insight from corrected V-2; peer-run probe retired as contingency after V-1 verified. No content-level violations.

## Acceptance Scenario

Maintainer running parallel `bkit:auto` issues wants repo-wide capacity-1 ship, per-FID isolation, and visibility into waits/yields/evictions. Five success criteria: (1) one ship executes, N–1 queue without booting; (2) dispatched and CI-triggered same-issue never concur; (3) green post-merge branch (`dev`/`main`) never ships; (4) per-FID isolation, no mid-flight cancel; (5) every wait/yield/displacement visible in Actions UI, no `bkit:failed` on waits. Process sketch covers both lanes, edge cases (three concurrent ships, head-of-line blocking, moved `dev`, cross-payload shapes, branch prefixes). Adheres to template spec § Acceptance Scenario.

## Breaking Changes

None to shipped surface. `.github/workflows/bkit-cloud.yml` is already Tier-1, force-overwritten on install/upgrade. New `resolve` job, refactored phase-lane expression, job-level `concurrency` blocks on agent jobs, ~55 lines of duplicated derivation collapse into `resolve`. Per-consumer blast radius: silent scope narrowing for repos not using `feat/**`/`fix/**` branches; mitigated by mandatory `cloud.md` callout and postinstall advisory.

## Feasibility

Actionlint 1.7.12 (pinned in ci.yml) **does not** recognize `concurrency.queue` (V-6: FALSE, confirmed by direct probe). **Decision gate at Build start** (WS-2): (i) if newer actionlint released → bump version and ship `queue: max` at both levels (arm adopted); (ii) else ship without `queue` key (default `single`, arm deferred), record deferrals row, keep four runbook deliverables mandatory. Job-level concurrency reading `needs` is **verified** (V-1: GitHub context table + three-way actionlint probe). All five resolved risks carry evidence; two remain: V-3 (skipped jobs holding workflow-level group) requires live run; V-6 actionlint release is actionlint team's call.

## Synthesis Coverage

Three exploratory passes distilled to: phase lane (Lane 1) + FID lane (Lane 2) kept separable; `queue: max` adopted (arm-dependent); peer-run probe recorded as alternative (V-1 verified, contingency retired); corrected-lock scope; restored requirement 1 to N≥3 under arm (i). Rejected: issue's premise-driven lock backstop (false premise), its `conclusion == 'success'` discriminator (admits green `dev`), denylist form (breaks on `main` re-add), external CAS lock (leaked-lock recovery), router/executor split now (premature, deferred to #260/#324). Kept from alternatives: allowlist from "corrected expression" approach, resolver from "peer probe" machinery, matrix test from "routing drift" risk.

## Scope Alignment

Original brief: serialize concurrent ships. Design delivers that plus cross-payload-shape same-FID isolation (requirement 2) and eliminates green-`dev` mis-routing (dominant eviction source). Adds `resolve` job (~150 lines, no checkout, `gh` calls only) and test rewrites (T3.1 matrix; T2.7 semantic fixes). Defers: dual-agent double-ship (R-4, pre-existing), router/executor split (target shape for #260/#324), reconciler/sweeper (belongs to #260 when N>2 needs queue), postinstall advisory on parsed semantics (closes open question 4). Blocks: #363 landing order (both edit same four lines of Tier-1 render-compared file; #363 already at `bkit:build`).

## Risks

CRITICAL (conditional): R-1 eviction under deferred arm (N≥3, middle ship displaced, issue keeps stale label, zero automated signal) — mitigated by allowlist removing dominant eviction source, four runbook deliverables (recovery command, tracker consequence, triage threshold, branch-prefix callout), and conditional breadcrumb probe under arm (ii). Other notable: R-5 knowledge concentration (five non-obvious facts load-bearing; mitigated by comment rewrite, resolver removal test, `GH_REPO` inline comment); R-9 head-of-line blocking of ship-global by pending FID job (accepted, bounds latency under arm (i), eviction risk under arm (ii), justifies `queue: max`); R-10 silent scope-narrowing for non-standard branches (documented limitation, not invisible). All risks either resolved with evidence, accepted with rationale, or deferred with home.

## Action Items

None. Design is complete and ready for planning. Two decision gates require Build-phase action: WS-2 (V-6 actionlint gate, decision rule provided), WS-8 (V-3 live-run gate, acceptance criteria defined). Workstreams 1–8 are sequenced with explicit `Requires` dependencies and rationale.

## Outstanding Questions

**Q:** Should ship-lane runs skip the job-level FID lane to avoid double queuing? — **Recommended:** No. Skipping reopens Gap 2 for the pair requirement 2 exists to exclude (dispatched phase for N racing CI-triggered ship for N, both concurrent on same FID). Stall (ship holds `bkit-ship-global` while agent job pending on FID lane) is real, bounded by workflow timeout, and accepted. Closed in § Decisions.

**Q:** Does resolver's `::notice::` need a durable `status.jsonl` row or is Actions run record sufficient? — **Recommended:** Actions run record is sufficient (run name encodes phase+FID, `display_title` includes decision path). Durable row adds cloud-to-dev noise and carries no new facts. Deferred to Plan if experience shows otherwise.

**Q:** YAML parser for routing-matrix test: `yq` (CI step, no devDependency) or `yaml` (eemeli, devDependency, comment-preserving)? — **Recommended:** `yaml` (eemeli). Bundled TS types; comment-preservation relevant (marker tests index on `# bkit:start`); devDependency never reaches packed tarball (avoids ERR_MODULE_NOT_FOUND class). Closed in § Decisions.

**Q:** Postinstall advisory: parsed semantics or string presence? — **Recommended:** Parsed semantics. Catches hand-edited `cancel-in-progress: true` reintroduced on one lane, dropped `queue` key, branch-prefix drift. Doctrine-aligned. Closed in § Decisions.

**Q:** What is #363's final landed shape (trigger filter, cancel-in-progress expression)? — **Recommended:** Confirm at rebase time (WS-1). Plan v4 is baseline; `main` inclusion and conditional expression are explicitly still moving in #363. Record #363's form as transitional and hard blocker for queue arm.

## Suggested Workstreams

**WS-1:** #363 landing-order gate and rebase baseline (confirm filter, expression, land stall fallback). Requires: none.

**WS-2:** Queue-arm gate — re-probe actionlint for `concurrency.queue` support at Build start; arm (i) bumps version and ships `queue: max`; arm (ii) ships default `single`, records deferrals, hands #363 residual-risk pointer. Requires: none (parallel to WS-1).

**WS-3:** Lane 1 — allowlist discriminator, routing matrix (10 cells), workflow-level `concurrency:` block, ship-global key. Requires: WS-1, WS-2.

**WS-4:** Lane 2 — `resolve` job (first, no concurrency, `GH_REPO` mandatory, six outputs, `::notice::`, ordering invariant), agent-job refactor, FID-lane group. Requires: WS-2, WS-3.

**WS-5:** Test rewrites (T3.1 matrix parse, T2.7 output refs), resolver removal + ordering assertions, validator choice (yq vs yaml), mirror regeneration. Requires: WS-3, WS-4.

**WS-6:** Consumer surface — `.bkit/cloud.md` (falsified `:430`, lock re-scope, four runbook deliverables: eviction recovery command, tracker consequence, triage threshold, branch-prefix callout) and postinstall advisory (parsed semantics, branch-naming check). Arm (ii) keeps items 1–4 mandatory; arm (i) shrinks 1–2 to historical note. Requires: WS-2, WS-3, WS-4.

**WS-7:** Ledgers and cross-issue handoffs — deferrals row (arm ii), failures row (R-8: `gh workflow run` 403), #363 pointer, correct `bkit-auto.md` citation, record deferred shapes (router/executor, reconciler, dual-agent), open-question hygiene. Requires: WS-2, WS-3, WS-4, WS-6.

**WS-8:** Live verification — V-3 (skipped-job concurrency group hold), validate five success criteria on real runs, exercise edge cases (both secrets, moved `dev`, head-of-line blocking), real-tool actionlint validation. Requires: WS-3, WS-4, WS-5.

## Recommended Next Step

`/bkit-plan 397`

Brief: Two-lane concurrency model (phase lane + FID lane) for repo-wide ship capacity-1 and per-FID isolation. Actionlint gate (V-6) determines `queue: max` arm at Build start; live-run gate (V-3) required in WS-8. Land strictly after #363 (WS-1). Eight workstreams with Requires dependencies; T3.1/T2.7 rewrites budgeted alongside workflow edits. Four runbook deliverables (eviction recovery, triage threshold, branch callout) mandatory under deferred arm, historical note under adopted arm.
