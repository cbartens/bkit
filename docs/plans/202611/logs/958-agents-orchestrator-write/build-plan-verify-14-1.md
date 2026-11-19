Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 48, 49, 50
Loosened: none
Fingerprint: 02ddada698050e9e9f433700cf3e84b402020cb6d77a411054dc8e7dbc6a0e9a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 14

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-14-1.md` (the group 14 diff). The brief has no `Deviations` section.
- All 325 tests in `.bkit/core/engine/commands/workflow/open-decision.test.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts` and `.bkit/core/engine/commands/workflow/workflows.test.ts` pass, including the seven planned tests of Tasks 47-50. `dist/commands/workflow/open-decision.js` and `dist/commands/workflow/workflows.js` carry the same changes as the sources.
- TASK 47: code done. `foldDecision` (`.bkit/core/engine/commands/workflow/open-decision.ts:172`) keeps an old file's in-file answers as the base when rows name it, keeps its `Status`, `Source changed` and `Gate` header lines, and keeps its `## Progress` loop (`hasLoop`). A `decision-answer` row overrides only the question it names. `pauseStatus` reads the same fold once rows exist. Not ticked: the DONE WHEN also asks for the plan's old-file wording to drop "and that no row names", and the plan still says it at lines 266, 567 and 1303. Lines 119 and 667 say the same thing.
- TASK 48: `TOKEN_SHAPES` (`.bkit/core/engine/commands/workflow/workflows.ts:360`) redacts `Authorization: Bearer|Basic` values, `token=` / `access_token=` values, PEM private-key blocks and the `gh[pos]_`, `github_pat_`, `glpat-`, `xox[abpr]-`, `sk-` and `AKIA` prefixes. It runs after the env-value pass. Satisfied.
- TASK 49: `CREDENTIAL_NAME` adds `WEBHOOK`, `SESSION`, names ending `KEY|PASS|AUTH|PAT`, and `PWD$`. `PWD` and `OLDPWD` are left out in `scrubSecrets`. Satisfied. Outside the DONE WHEN, for information only: the `SESSION` match also covers harmless env vars such as `TERM_SESSION_ID` and `XDG_SESSION_TYPE`. Their values get replaced by their names, which hides text but leaks nothing. The plan asks for this behaviour, so it is not a gap.
- TASK 50: `URL_PASSWORD` and the URL rewrite accept an empty user part (`[^\s/:@]*`). Satisfied.
- Test-first audit (`build-tests-green-14-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. It has no Taken over, Unproven, Changed by a code step, Updated tests or Already landed sections.
- Decision records `build-decision-1-1` to `build-decision-2-4`: none covers group 14.
- `docs/observability.md`: Tasks 48-50 change a scrubber and add no error path. Task 47 adds no error path. Nothing to log.
- `docs/testing.md:963` already says the failure files have tokens, home paths and database passwords scrubbed.

## Identified Gaps Log

1 gap.

TASK 47: `docs/plans/202611/958-agents-orchestrator-write-plan.md` — DONE WHEN clause unmet: the plan's old-file wording still says "and that no row names" at lines 266, 567 and 1303 (the DONE WHEN's lines 259, 560 and 1296, shifted by 7); the group diff does not touch the plan. Lines 119 and 667 carry the same stale wording. The code (`foldDecision`, `pauseStatus` in `.bkit/core/engine/commands/workflow/open-decision.ts`) and the four tests are done and pass — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 47: the plan's old-file wording still says "and that no row names"
  **Severity:** LOW · **Class:** missing-implementation · **Fixable:** true · **Location:** `docs/plans/202611/958-agents-orchestrator-write-plan.md:266` · **Round:** 1
  - **DONE WHEN:** the plan's old-file wording (now plan lines 266, 567 and 1303; the DONE WHEN's 259, 560 and 1296 shifted by 7) drops "and that no row names", so the plan says an old file is any file whose header carries a Status line, whatever rows name it
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
