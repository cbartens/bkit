# Design Input — #234 bkit telemetry (unified `.bkit/*.jsonl`)

**Issue:** [#234](https://github.com/cbartens/bkit/issues/234) — "bkit telemetry: unified .bkit/\*.jsonl (stats/friction/deferrals/failures) + harvest & analysis"
**State:** open · **Labels:** enhancement, bkit:design · **Milestone:** Workflow Agent Optimisation
**Consolidates:** #232, #183, #233, #58 (all closed as duplicates into #234). Related: #230 (parent review — items A/D/E shipped in `7732d69`; item B = this issue, was deferred).

---

## Session prompt (the ask + decisions reached in discussion)

Combine #232/#183/#233/#58 into one master feature, designed → planned → built as a single telemetry machine. Core idea: **collect stats** via a family of append-only JSONL logs under `.bkit/` (`stats.jsonl`, `friction.jsonl`, `deferrals.jsonl`, `failures.jsonl`), migrating the existing markdown ledgers. JSONL because it merges conflict-free (`merge=union`) and aggregates trivially vs `.md`. Add rules (never silently drop → `deferrals.jsonl`; any found bug → `failures.jsonl`), reinforce in workflows (also write `friction.jsonl` + `stats.jsonl` = the compliance part from #232), aggregate + report stats in every workflow's summary step and a full design→plan→build→debug→ship rollup at ship. Replace the friction utility prompt with a collector script that harvests these JSONL from consumer repos on the same machine, plus a standalone analysis utility.

### Locked design decisions (from 2026-06-07 discussion — see refinement comment below)

1. **One JSONL line carries both metric + prose.** Shared metadata envelope + `kind` discriminator + per-`kind` payload (typed fields _and_ free-text fields like `description`/`root_cause`). Storage does not force a hard-data/free-text split — combine, don't separate (stats surface the signal; co-located prose tracks down root cause). One file per purpose; `kind` lets record types coexist (e.g. `stats` = `compliance` | `run-outcome` | `counter`).
2. **`ts` = primary id, millisecond precision** (unix ms). Doubles as timestamp → elapsed-time/intervals for free; ms avoids same-second collisions when a step writes several rows at close.
3. **Event-sourced append; fold for current state.** Entries immutable + append-only (preserves `merge=union`). The #230-item-C instinct loop (Confidence rises on recurrence, Last-confirmed bumps) becomes a **new appended row with the same logical key**; "current" state derived by folding (same pattern `status.jsonl` uses). Bonus: recurrence-count + interval-between-recurrences come free.
4. **Agent-read, no human renderer.** These ledgers are "agent readers only" (rules.md) — reviewed/summarised by agents. JSONL parses better for agents than prose. Consumption = per-workflow summary step + analysis CLI.
5. **`references: []` + `aliases: []`.** `references` = JSONL form of the existing `Related:` field (outbound: issues, PRs, commit SHAs, FIDs, paths, sibling `ts`). `aliases` = this entry's own former id(s) (`KN-14`, `DE-7`) so ~1,460 existing `KN-`/`DE-` references resolve unambiguously **without mass retrofit**. Clean break: new entries get `ts` ids + empty `aliases`. Own-id kept in `aliases` (not mixed into `references`) to avoid "I _am_ KN-14" vs "I _link to_ KN-14" collision.
6. **Re-import #232's grader constraints (load-bearing):** grader = **deterministic script, NOT a subagent**; diff base = `git diff parentSha..HEAD`; **advisory, never gates**; offline `pass^k` fixture tier **out of scope**; store is `merge=union`, **exempt from install/mirror engine + slop-scan + Vale**, git-tracked, committed `[skip ci]`; single-clone serialisation already enforced.

### #58 (counters) — IN scope, own phase

Counting attempts/retries/failures is prime telemetry. The attempt count is **today written by the LLM in prose** (`step-done … attempt:N`) → logging it raw = logging the model's own unreliable count. #58's deterministic **prose→shell** counter refactor is therefore _what makes the attempt/failure stats trustworthy_. Kept, sequenced as a bounded high-risk workstream (rewrites loop/escalation control-flow across all 5 workflows; staged build→debug→plan/design + `status.jsonl` invariant check).

### Phasing (design should produce dependency-ordered workstreams along these lines)

| Phase  | Scope                                                                                                                                                                                                                                       | Blast radius                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **P1** | JSONL substrate (envelope / `kind` / `references` / `aliases`) + `.gitattributes merge=union` + install-mirror/slop/Vale exemptions + friction + pending→deferrals + failures + basic stats (attempt/failure counts at existing boundaries) | bkit-local, additive          |
| **P2** | Compliance grader (#232 core, deterministic, advisory)                                                                                                                                                                                      | bkit-local                    |
| **P3** | **#58 counter refactor** (prose→shell) — trustworthy attempt stats + can't-silently-exceed-`MAX`; staged + invariant check                                                                                                                  | all 5 workflows, control-flow |
| **P4** | Harvest script (replaces friction utility prompt) + analysis CLI + #183 size↔outcome regression + ship-chain rollup                                                                                                                         | bkit-local + consumer read    |
| **P5** | knowledge/decisions migration + consumer-upgrade path                                                                                                                                                                                       | install engine + consumers    |

### Sequencing note

#230 GateGuard (A) / config-protection (D) shipped in `7732d69` (+ provenance stamping `pinnedCommit` was reverted in `611b438` as a repo-bricking footgun). The compliance grader shares rule-spec / path-table concepts with A/D — design with those existing.

### Grounded facts about the ledgers being migrated

- `.bkit/friction.md` — bkit:start/end block, append-EOF, prose; fields Category/Scope/Workflow/Step/Source/Description/Suggested fix/Related/Recovery/Status/Confidence/Last-confirmed. No own id (refs BAR-/FID). Shipped as template `.bkit/templates/.bkit/friction.md`.
- `docs/pending.md` — "Pending" ledger (deferred issues + feature ideas), prose, append-EOF; fields Type/Category/Severity/Status/Description/Workaround/Source/Related. No own id (refs DE-/KN-). Template `.bkit/templates/docs/pending.md`.
- `docs/knowledge.md` — **KN-N** ids (`next = max+1`), prose incident/gotcha narrative; Confidence/Last-confirmed/Severity/Scope. Template exists.
- `docs/decisions.md` — **DE-N** ids, prose. Template exists.
- ~1,460 `KN-`/`DE-` references repo-wide incl. engine source (`bkit-preflight.ts`, `bkit-tiers.ts`), archived plan docs, CHANGELOG, closed issues, consumer repos.
- Existing precedent: `docs/plans/**/status.jsonl merge=union` (append-only NDJSON folded to derive run state). Existing harvest model: `utility-harvest-friction` agent (reads `docs/bkit-consumers.md` → consumer worktrees → moves content into bkit repo; caller commits).

---

## Issue #234 — description (verbatim)

## Summary

One master feature consolidating **#232, #183, #233, #58** into a single telemetry machine. This is all about **collecting stats**. We will write a `.bkit/stats.jsonl` in every workflow, migrate the existing markdown logs to JSONL, introduce a new failures log, and build the harvest + analysis tooling on top.

Consolidates and supersedes:

- **#232** — bkit-comply empirical ongoing rule/prompt compliance eval (the _compliance_ slice of `stats.jsonl`)
- **#183** — Measure lines of code vs PR error rate (the size↔outcome analysis over the same substrate)
- **#233** — Enhance friction collection utility prompt (friction → JSONL + harvest script)
- **#58** — Workflow counters status.json shell (deterministic counters feeding stats)

### The JSONL substrate

Replace/introduce append-only JSONL logs under `.bkit/`: `stats.jsonl` (new; per-run/per-workflow stats incl. compliance from #232 + counters from #58), `friction.jsonl` (replaces `.bkit/friction.md`), `deferrals.jsonl` (replaces `docs/pending.md`), `failures.jsonl` (new; any bug/failure discovered). JSONL merges conflict-free (`merge=union`) and aggregates with scripts.

Entry id = unix timestamp (replaces `DE-N`/`KN-N`), doubling as timestamp for elapsed-time. Per-entry metadata: timestamp(=id), repo, bkit version, workflow, subagent, severity, etc.

### Rules (rules.md)

Never silently drop work → add to `deferrals.jsonl`. Any found bug → `failures.jsonl`. Reinforced in workflows, which additionally write `friction.jsonl` + `stats.jsonl` (compliance from #232) + other stats.

### Workflow integration

Every workflow writes `stats.jsonl` (+ friction/deferrals/failures per rules). End of every workflow: summary step aggregates + reports stats. Final ship workflow: reports on the ship workflow AND the entire design→plan→build→debug→ship chain.

### Harvest + analysis tooling

Replace the friction utility prompt with a script that collects stats/friction/deferrals/failures JSONL from consumer repos on the same machine (model on `utility-harvest-friction`, JSONL + script-driven). Create a standalone utility script to collect + analyse the raw data at any time (counts, rates, elapsed-time, #183 size↔outcome / release-attributed regression).

---

## Comments (verbatim — load-bearing prior thinking)

> The full archived bodies of #232, #183, #233, #58 and the 2026-06-07 refinement comment are preserved on the issue. Key extracts below; treat as design input.

### Archived from #232 — compliance eval (the deterministic grader)

- Build the online/monitoring tier of the empirical eval layer (#230 item B). Deterministic grader at each workflow's close step scores the real run against rule specs, accumulates to a central append-only JSONL, plus a consumer-harvest utility that analyses + cross-references compliance against releases/CHANGELOG.
- **Grader = deterministic script, NOT a subagent** (a subagent reintroduces the nondeterminism being measured). Most high-value rules gradeable from `git diff parentSha..HEAD` + files alone (e.g. `no-mirror-edit` = `.claude/*` untouched; `skip-ci-not-head` = `git log -1`; `Done when:` present = grep plan). Implementation `.bkit/src/bkit-comply.ts`, pure functions `(parentSha, phase, planPath) -> Violation[]`, unit-tested. Workflow close gate runs `pnpm bkit comply --phase`.
- **Store DECISION:** central append-only JSONL at `.bkit/` (persists across runs, unlike per-plan `status.jsonl` which is archived). Requirements: append-only, exempt from install/mirror engine + slop/Vale, `merge=union`, git-tracked + committed at close with `[skip ci]`.
- **Advisory, never gates.** Surface violations in `ship-summary.md`. Record schema fields: `ts`, `runId` (dedup), `repo`, `bkitVersion`, `phase`, `workflow`, `rule`, `result` (pass|fail|n/a), `evidence`, `graderVersion`.
- **Harvest:** new `utility-harvest-compliance` agent modelled on `utility-harvest-friction`; collect (dedup by `runId`, stamp `repo`) + analyse (per-rule rate over time + per `bkitVersion`; join `bkitVersion` → CHANGELOG/releases to attribute regressions to releases). Recommend/inform only.
- **Smallest first version:** `bkit-comply.ts` with 2 git-only rules; JSONL plumbing (gitattributes + exemptions); one line in each close gate; surface in ship-summary; (later) harvest collect; (later) analysis + changelog cross-ref.
- Offline `pass^k` fixture tier = separate vitest suite, **out of scope** here. Close-step grader cannot do `pass^k` and cannot gate a prompt-edit PR.
- Open questions: harvest dedup-by-runId vs truncate-source (leaning dedup); analysis report location; split harvest collect vs analyse; prune/rollup unbounded growth; per-phase grader in all 5 close steps vs ship-only first.
- #232 comment: `.bkit/compliance.jsonl` carries TWO record types — rule-compliance (per run×rule) AND run/PR outcome signals for #183 (`ci_first_try`, `corrective_commits`, `reverted`, + `blocking_deferrals`/`exempt_deferrals` counts from `bkit-ship` Step 5's machine-parseable `ship-deferred-sweep.md` header, + `sweep_verdict` from status.jsonl).

### Archived from #183 — size↔outcome regression

- Per PR/run row: size signals (additions/deletions/net/files_changed + diff-complexity proxy), outcome signals (CI-pass-first-try, corrective-commit count, revert/hotfix within N days, review iterations), provenance (agentic via claude-code-action / `claude/` branch vs hand-written baseline). Plus `blocking_deferrals`/`exempt_deferrals`/`sweep_verdict` (from ship Step 5).
- Pull via GitHub API (pulls / commits / check-runs / reviews). Analysis: change-size vs error-rate bucketed by size; logistic regression `error ~ log(lines) + files_changed` (files_changed likely dominates). Actionable output: a **dispatch-size threshold** above which to split the plan (feeds `plan-complexity-check`/`split`).
- Open Q (answered by #234): storage/export = `.md`/Sheet/optional install. #183 owns the GitHub-API historical backfill (incl. hand-written baseline the grader can't see) + the regression; #232/#234 owns the substrate.
- Also measure: number of deferred items, number of discovered bugs. ("deferred.md not pending.md", "discovered.md??" → resolved as `deferrals.jsonl` + `failures.jsonl`.)

### Archived from #233 — friction collection utility

- Collect friction from consumers; remove + commit in consumer repos; group/analyse/recommend fixes + priority; auto-create gh issue with results per run; park non-decisive ones until next run; better storage? keep longer? tie to release agent (look at last friction history → improved / showed up again?).

### Archived from #58 — workflow counters status.json shell (BAR-147)

- Move all `*_ATTEMPT` counters + `MAX_*` threshold comparisons out of orchestrator prose into deterministic shell + status.json. Keep narrative branches (PASS/FAIL/CONCERNS, STANDARD/PIVOT/FINAL — judgment). Counter contract: `counters` object in status.json `{ verifyAttempt, testAttempt, challengeAttempt, debugAttempt, mergeAttempt, subPlan, subCount }`. Helper script (`counter_init/inc/get/reset/check_max` + `decide_next` printing next step ID, exit code = branch). All `MAX_*` in one config file. Migration order: bkit-build (worst offender) → bkit-debug → plan/design. Validation: status.json invariant (`counters.verifyAttempt` == count of `plan-verify` entries) via jq. Acceptance: no `*_ATTEMPT` in prose except in fenced shell; all `MAX_*` in one config; exceeding `MAX_*` cannot silently continue.

### 2026-06-07 refinement comment

See "Locked design decisions" + "Phasing" above — that section is the verbatim distillation of this comment.
