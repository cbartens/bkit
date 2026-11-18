Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 126c97a614d216c1307fa2a471aecb60695c96f569fe9e61a5b9da43e0fde361
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md` (CONCERNS, 2 LOW doc-wording gaps on `docs/testing.md:808` and `.bkit/core/.bkit/workflows.md:147`), remediated by `build-plan-gaps-remediate-3-1-log.md` (Fixed: 2). Both are closed in this attempt.

## Notes

Group 3 holds one task (TASK 6, docs and ledgers), checked against `build-diff-3-2.md` (all changes since the group started at `8e31d245f`). Both attempt-1 gaps are closed: `docs/testing.md:808` now keeps the `{UPPER}` placeholder parenthetical on "Flag parsing and usage errors" and names the `invocation-context/` `0700` folder mode as its own list item; `.bkit/core/.bkit/workflows.md:147` now has the claude-only unmatched-glob point back on the glob explanation (as its own sentence), with the lock-deletion sentence after it, and `.bkit/workflows.md:147` is byte-identical to the source line (the only other difference is the managed marker), with the matching one-line hash change in `.bkit/version`. The rest of TASK 6 holds: `docs/security.md` § Workflow comment ownership says the `invocation-context/` folder is owner-only (`0700`); `docs/observability.md` § Bookkeeping effects and receipts says the folder is `0700` and `<id>.corrections.jsonl` is `0600` whether created or found; the `docs/testing.md` rows for `commands/workflow/ledgers.test.ts` (`--month` / `--fid` refusal, lock deletion), `commands/lib.test.ts` (folder mode) and `commands/workflow/decisions.test.ts` (`pending` `--fid` refusal) carry the additions; `docs/deferrals.jsonl` has one engine-written `CLOSED` row (`updates: 2`) for `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`. TASK 6 stays off `Tasks` because the attempt-1 fix put the lock sentence directly before "Without them the prune commit holds only ...", so that sentence's "them" now reads as the lock deletions; it is a one-sentence move (see the gaps log). Test-first audit (`build-tests-green-3-2.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven; TASK 6 is `TEST FIRST: n/a`, so no taken-over, changed or updated tests. No `build-plan-tests-3-log.md`, `build-plan-current.md` or `build-decision-*.md` was present. `docs/observability.md` is present; TASK 6 adds no error path to log.

## Identified Gaps Log

1 gap.

- TASK 6: `.bkit/core/.bkit/workflows.md:147` (rendered `.bkit/workflows.md:147`) — the lock-deletion sentence now sits directly before "Without them the prune commit holds only `.agents/skills` + `skills-lock.json` …", so "them" reads as the lock deletions instead of the host-mirror pathspec entries the bullet argues for; move the lock sentence to the end of the bullet (after "… sweeps them into a foreign commit."), then re-run `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: lock sentence sits before the mirror-deletion conclusion
  **Severity:** LOW · **Class:** doc-wording · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:147` · **Round:** 1
  - **DONE WHEN:** In the host-skill-mirrors bullet, the lock-deletion sentence comes after "… sweeps them into a foreign commit.", so "Without them" again follows the mirror explanation, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/workflows.md:147` to match.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
