## #814 — Give load-sensitive tests a budget that holds under the full gate (open)

### Failing test or CI run

none yet. Each test fails only under the full parallel gate and passes when run alone.

### What happened

Eight open `docs/failures.jsonl` rows each record one test that times out when the whole suite runs on a busy machine:

<!-- prettier-ignore -->
| Key | Test file |
| --- | --- |
| `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite` | `runs.test.ts` |
| `gateguard-opencode-patch-tests-flaky-under-full-audits-run` | gateguard opencode patch tests |
| `runs-wait-cli-found-flaky-under-full-gate` | `runs.test.ts` |
| `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` | `ci-scripts.test.ts` |
| `instructions-retired-clause-timeout-under-full-gate` | `instructions.test.ts` |
| `instructions-corpus-store-timeout-under-full-gate` | `instructions.test.ts` |
| `disk-prune-wait-test-flaky-under-load` | `disk-prune.test.ts` |
| `json-parse-owner-audit-timeout-under-load` | json-parse owner audit test |

All of them start processes or scan the whole repo. New rows keep landing (2026-10-14 to 2026-11-02), and every cited test title still exists at `HEAD`.

### What should happen

The full gate passes on a loaded laptop without any test hitting its time limit, and without a test being skipped or its limit raised by hand one at a time.

### Steps to reproduce

1. On a laptop, start other CPU work, or run two worktrees' gates at once.
2. Run the full unit gate.
3. One or more of the tests above fail with a timeout. Each passes when run alone.

### How often

Intermittent, under load only. Not seen on CI, where `loadFactor` is pinned to 1.

### Affected area

`vitest.timeout-budget.ts`. `loadFactor` (`:28-40`) is `loadAverage / cores`, floored at 1 and capped at `MAX_LOAD_FACTOR = 6`. On a 10-core machine, a load average under 10 leaves the idle budget unchanged, even though a spawn-heavy test can be several times slower. The closed sibling row `resolve-push-base-uses-last-green-run-timeout-under-full-gate` states the same cause. Some cases are load-scaled and still time out (`instructions.test.ts:55` `CORPUS_CASE`); others keep fixed budgets (`ci-scripts.test.ts:260` `timeout: 30_000`).

### Evidence

- Workaround on record: knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` (ACTIVE).
- The budget shortfall per test has not been measured.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-7)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #801 — Build friction: undo per-file test locking and hard stops on missing proof (https://github.com/cbartens/bkit/issues/801), touches the same test harness
- The audit names this class as the top gate candidate for `bkit-audit-gates`.
