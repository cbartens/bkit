Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4
Loosened: none
Fingerprint: 47e3b8eb6473f39fef122d678c280d19ea44fc068d0b7ea57fc61679ec57ff65
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 3: `git grep -n "default 1"` over `docs/testing.md`, `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/core/.bkit/templates.md` and `.bkit/core/.bkit/workflows.md` matches only `MMD_MIN_WEIGHT` (`:750`) and the plan-caps lines (`:1788`, `:1804`), never a `BKIT_TEST_SLOTS` line. The new rule (2 slots on 8 or more cores, else 1; `BKIT_TEST_SLOTS` overrides; an invalid value falls back to the default; set per machine, never per repo) sits at `.bkit/core/.bkit/templates.md:966`, `.bkit/core/.bkit/workflows.md:1231` and `docs/testing.md:325`. The templates.md bullet keeps "with one note", as the task asks.
- TASK 3 mirrors: `.bkit/templates.md` and `.bkit/workflows.md` differ from their `.bkit/core/.bkit/` sources only in line 3, where `{{BKIT_MANAGED_MARKER}}` renders as the managed marker. The code step wrote them with a script, not `bkit install`; the result is identical. `node dist/cli.js check` exits 0, reports "0 write(s) would occur" (no drift) and 0 blockers (14 advisories, none about these files).
- TASK 4: `bkit ledgers query --ledger=decisions --status=ACTIVE --key=724-tests-lock-fixed-slots-not-live-load` returns the row (`updates: 3`, references `921`) with the new description: core-count default, `BKIT_TEST_SLOTS` override, live load never decides.
- No other tracked file outside plans, `dist/` and ledgers states a slot default: the remaining `BKIT_TEST_SLOTS` hits are the lock scripts, their fixture and the tests.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`. Both tasks are `TEST FIRST: n/a` (docs and ledger only).
- `build-decision-1-1.md` covers group 1 (Fix task 5), not this group.
- Brief deviation (worktree cut from local dev) affects no task in this group.

## Identified Gaps Log

None
