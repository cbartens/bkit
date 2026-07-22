Verdict: PASS

<!-- verdict:end -->

# Build Summary: Workflow Attempt Counters (#58)

## Overview

**Feature:** Retry counters derived from `status.jsonl` instead of model-tracked prose (`Init counters:` / `Increment`). Same caps/routing/retry semantics — provenance only.

**Execution:** 3 sub-plans (15+14+8=37 tasks; KN-26 seam split). One squash PR.

**Delivered:**

- 24/25 sites derive from `status.jsonl` (was 18/19; +6 `DEBUG_ATTEMPT` filename sites)
- `decide_next`/`check_max` fail-closed (empty/non-integer → Failure Path); zero `2>/dev/null` on guards
- Resume re-derives from log; telemetry `counterSource: "shell-bus"`
- Mirrors regenerated; `bkit check` exit 0

## Implementation Quality

### Verification Correctness

Three real defects, all **fixed-and-tested-before-ship:**

1. **Sub-plan 2 Attempt 1 (Verify FAIL):** Completeness rule fitted to own answer — detected only exact `"$NAME"` quoting. **Plan line 247 required** escaping `${NAME}`, unquoted, braced forms. Widened detector (`\$\{?NAME\}?\b`), bound to counter-specific assignment targets → **6 new DEBUG_ATTEMPT sites** in `bkit-debug.md` (filename paths, no in-block derive). Reconciled: **24/25** (18/19 + 6). RED-proof tests (`describe("#58 T5.3...")` in `.bkit/src/bkit-counter-prose-audit.test.ts:10/10 pass`).

2. **Sub-plan 2 Attempt 2 (Verify FAIL):** 6 new DEBUG_ATTEMPT sites derived **N+1 instead of N** — 3 pre-marker sites used `+1` (fold returns prior invocation); 6 post-marker copied `+1` though `:366` `workflow-meta` marker already recorded current N. Effects: artifact-globs missed, `[live=off]` silently ignored. **Pivot:** classified 9 fold-deriving blocks by marker position → corrected 6 post-marker to no-`+1` → position rule (`describe("#58 DEBUG_ATTEMPT off-by-one regression", ...)` — 3 pre-marker keep `+1`, 7 post-marker don't). Verified: fold=1, old=2, new=1.

3. **Challenge Phase (Verdict CONCERNS, Failures:1):** **HIGH arithmetic-injection sink** — three `PRIOR_DEBUG_ATTEMPT=$(jq ...)` → `$((PRIOR_DEBUG_ATTEMPT + 1))`. jq `-r` on unconstrained string + POSIX arithmetic: `debugAttempt:"x[$(cmd)]"` in `status.jsonl` triggers exploit. **Gated:** attacker-controlled `status.jsonl` via git, not feature `--argjson` writers. Fixed: jq `(tonumber? // 0)` at all 3 sites. Tests: static guard + dynamic acid-test (`describe("#58 build-challenge HIGH: PRIOR_DEBUG_ATTEMPT derive is sanitised...")` 3/3 pass; corpus-wide (`describe("#58 build-challenge-tests: corpus-wide guard")` GREEN).

### Plan Adherence

**Acceptance Criteria (issue #58, re-worded only where literal compliance impossible per Breaking Changes item 5):**

- ✅ No `*_ATTEMPT` bare token in orchestrator prose outside fenced blocks (exemptions: `{X_ATTEMPT}` placeholders, `MAX_*` constants). Audit rule widened per gaps-remediate-2-1; `pnpm vitest .bkit/src/bkit-counter-prose-audit.test.ts -t "T5.3"` → **0 violations** (11/11 real-corpus + RED-proof pass).
- ✅ Every counter read from `status.jsonl` at call site; no counter originates in prose. 24/25 derivation-in-block; **3 routine cross-process integration tests** confirm identical re-derive (T2.2 fixture-green, T2.10 live-green).
- ✅ All `MAX_*` thresholds single-sourced in `bkit-counter-bus-config.sh`; no literal duplicated in prose. `CHALLENGE_REMEDIATE_ATTEMPT` constraint-6 violation fixed at T3.3 (fenced derive).
- ✅ Over-cap AND unusable counter both route to Failure Path. `decide_next`/`check_max` (`bkit-counter-bus.sh` lines 143, 201, 207, 238, 244) reject empty/non-integer → `return 2` + stderr diagnostic, nothing on stdout. `0` legal for prior-step routing. `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = **0**.
- ✅ Resume re-derives, no restored state. T2.2 + T2.10 confirm fresh process lands same attempt (Defect-3 structural fix).
- ✅ Honest telemetry provenance. T7.1: all 5 workflows emit `counterSource "shell-bus"`. `pnpm test` — T7.1 pass; no `--argjson counterValue 1\b` literal.

**Gate 1 sign-off (plan-input.md, captured 2026-07-16):**

- ✅ Narrowed prose criterion (Breaking Changes item 5): bare `X_ATTEMPT` banned outside fenced blocks; `{X_ATTEMPT}`, `MAX_*` exempt.
- ✅ Narrative (owner-reframed provenance-centric): "Same business rules, different source for the number. More deterministic, more reliable, not based on context memory." Tests from provenance framing (closure rule T5.3, fixture tests, edge-case coverage).
- ✅ Breaking changes conditional (owner: reliability over compatibility). Excluded: 0-refusal bricking first-attempt routes (`counter_count` at prior-step positions; `0` stays legal), re-adding debug-run-tests commit (KN-26 preserved, no commit at `:399`).

## Verification Status

**All gates passed; three adversarial FAILs resolved.**

| Sub-plan | History                                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `build-plan-verify-1-1` CONCERNS → `build-plan-verify-1-2` **PASS**                                                                                                                                                                      |
| 2        | `build-plan-verify-2-1` FAIL (fitted rule) → `build-plan-gaps-remediate-2-1` PASS → `build-plan-verify-2-2` FAIL (off-by-one) → `build-plan-gaps-remediate-2-2` PASS (PIVOT) → `build-plan-verify-2-3` **PASS**                          |
| 3        | Inline by executor; worklist reconciled, prose deletions green (3 T5.1 REDs expected/cleared by WS-4)                                                                                                                                    |
| Holistic | `build-plan-verify-holistic` **CONCERNS** — end-to-end derivation proven, KN-26 pair coherent, mirrors drift-free, completeness 24/25 at 0 violations, cross-sub-plan seams sound; cosmetic comment-vocabulary nit (behaviourally inert) |

**Attempt count:** Sub-plan 1: 2 (CONCERNS→PASS) | Sub-plan 2: 3 (FAIL→FAIL→PASS) | Sub-plan 3: 1 (inline, PASS) | Challenge: 1 (CONCERNS→PASS). All closed before advance.

## Test Status

**All gates green; coverage for three defects.**

| Suite                         | Result                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`              | **clean**                                                                                                                                                                                |
| `pnpm test` (vitest)          | **2297 passed** \| 2 skipped \| 1 todo, 0 failed (86 in counter-prose-audit: 81 pre-existing + 5 challenge; 2254 total includes 3 expected-RED T5.1 cleared by WS-4). Branch: **67.19%** |
| `pnpm slop:delta`             | **net findings 0, net score 0.00** (jq coercion adds no shell try/catch)                                                                                                                 |
| `pnpm format:check`           | **clean**                                                                                                                                                                                |
| `npx --yes bats tests/*.bats` | **47/47 passed** (45 pre-existing + 2 new: T2.4b empty `--sub-plan`; jq-injection-via-step-name)                                                                                         |
| `pnpm lint:prose`             | 1 pre-existing warning at `docs/architecture.md:156` (unrelated)                                                                                                                         |
| Mirrors                       | `pnpm bkit check` → **0 write(s) would occur** (`.bkit/scripts/*` byte-identical to templates; `.claude/.cursor/.opencode` rendered, prettier-clean)                                     |

First-run pass; no timeouts/flakes. 3 T5.1 REDs green post-WS-4 (verified in `build-plan-verify-holistic.md`).

## Challenge

**Challenge verdict:** CONCERNS (1 HIGH, 2 LOW accepted / non-blocking).

| Severity | Finding                                                                                                                                                                                                                                                                                                                                                                                                    | Disposition |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| HIGH     | Arithmetic-injection in 3 `PRIOR_DEBUG_ATTEMPT` derives: jq `-r` unconstrained string + POSIX arithmetic; exploit `debugAttempt:"x[$(cmd)]"` in `status.jsonl`. Fixed: `(tonumber? // 0)` at `.bkit/workflows/bkit-debug.md:189, :219, :364`. Reachable via bash/GitHub CI (zsh/dash fail closed). Pre-fix executes `touch`, post-fix does not; `debugAttempt:5` → 6. Static guard + dynamic acid-test x3. | Fixed       |
| LOW      | Empty `--sub-plan ""` → no-filter (counts all subPlans). Fail-safe (over-count → premature stop). T2.4b characterisation test.                                                                                                                                                                                                                                                                             | Accepted    |
| LOW      | Resume run-boundary reset (build IN_PROGRESS, debug completes, build resumes → fresh budget). DE-25 design; operationally warned. T2.10 covers. Pre-existing.                                                                                                                                                                                                                                              | Accepted    |

Max severity HIGH → Step 11 remediation (`CHALLENGE_REMEDIATE_ATTEMPT=0`), intended. Not FAIL (gated, fixed-and-tested).

## Generated Tests

**Three defect suites + edge-case coverage (permanent, land with code):**

| Suite                  | Source                                                    | Scope                                                                                                                                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fitted-rule detection  | `build-plan-gaps-remediate-2-1`                           | 9 RED-PROOF T5.3 shapes: `"$NAME"`, unquoted, `${NAME}`, jq inline, nested 4-backtick. `.bkit/src/bkit-counter-prose-audit.test.ts:describe("#58 T5.3...")`                                                                                                                                                   |
| Off-by-one prevention  | `build-plan-gaps-remediate-2-2`                           | `:366` marker offset → pre/post classify; 3 pre keep `+1`, 7 post don't. `describe("#58 DEBUG_ATTEMPT off-by-one regression")` — 10 blocks (3 pre, 7 post) pinned                                                                                                                                             |
| Injection-sink closure | `build-challenge-remediate-log` + `build-challenge-tests` | Static: `PRIOR_DEBUG_ATTEMPT=$(jq ...)` + `$((PRIOR...))` requires `(tonumber? // 0)` or `case`. `describe("#58 build-challenge HIGH")`. Dynamic: poisoned `debugAttempt:"x[$(touch /tmp/MARKER)]"` + legit `debugAttempt:5` x3. Corpus-wide siblings: 0 unguarded sinks. RED-proof: reverted 1st site caught |

**Edge-case (build-challenge-tests):** jq-injection-via-step-name negative-control; provenance integrity — REAL derive lines vs fixture (4 rows, 5 workflows); RED-proof: reverted `bkit-ship.md` `COUNTER_VALUE=1` caught.

**Result:** No new challenge bugs; three defects fixed; challenge-tests PASS (15 new green, no regressions).

## Risks

**Residual, non-blocking, documented:**

1. **Off-by-one rule shape-fitted to position.** `:366` marker move/syntax change could miss regression. Mitigation: asserts 10 blocks (3 pre, 7 post) — drift → red.
2. **Injection fix gated on attacker-controlled input.** Sinks reachable only if `status.jsonl` planted/corrupted; normal `--argjson` writers safe. HIGH but constrained (private repo). Jq coercion trivial, no runtime burden.
3. **Two ACCEPTED LOW in deferrals discipline.** Empty `--sub-plan` over-counts; resume run-boundary reset pre-existing. `build-challenge.md` "Disposition ACCEPTED". Not action items.
4. **Comment vocabulary drift at seam (cosmetic, behaviourally inert).** Sub-plan 1 `bkit-counter-bus.sh`: 3-position helper scheme; sub-plan 2 workflows: 4-position lifecycle. "Position 2/3" differ; helpers correct (holistic verify seam 1). `build-plan-verify-holistic.md` "cosmetic nit, behaviourally inert". Optional: reconcile vocabularies.

## Action Items

None required to ship. Three defects fixed-and-tested; all gates passed; deferrals documented; cosmetic non-blocking.

**Optional follow-ups (out of scope this cycle):**

- Reconcile comment vocabularies at sub-plan seam (position N scheme divergence).
- Empty `--sub-plan ""` — defend with `--argjson` fail-closed or accept documented (over-permissive, fail-safe direction).

## Recommended Next Step

```
/bkit-ship 58
Brief: Three workflow-counter sub-plans (37 tasks) all complete, gates green, tests 2297/2297 pass (bats 47/47). Found and fixed three real defects: fitted rule (6 new sites), off-by-one arithmetic (post-marker form), arithmetic-injection sink (jq coercion). Mirrors clean, telemetry honest (shell-bus), all KN-26 pair constraints held. One squash PR per plan design. https://github.com/cbartens/bkit/tree/feat/58-workflow-counters
```

## Telemetry Summary

```

> @cbartens/bkit@4.5.0 bkit /Users/christian/Documents/GitHub/bkit/.worktrees/58-workflow-counters
> node dist/bkit-install.js telemetry summary --phase=build

[bkit-telemetry] rows: 6 | malformed: 0 | versions: 4.1.4=2, 4.5.0=4
[bkit-telemetry] build: 0 | design→ship chain total: 5 (from 6 rows)
```
