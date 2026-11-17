Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9; Group 4: Tasks 10, 11, 12, 13, 14; Group 5: Tasks 15, 16, 17; Group 6: Tasks 18, 19, 20, 21).

## Integration Gaps

1 integration gap, Fixable: true, logged once below.

- **Task 21's unparsed-row guard (Group 6) vs Task 14's DONE WHEN (Group 4).** Since the group 6 remediation, `syncProjectDocs` refuses to add any row while the `## Project Documents` table holds a row it cannot parse. `detectProjectDocs` still tells the user to "run `bkit upgrade` to register the default paths" for a populated, unindexed default doc in that state. Upgrade then registers nothing, so the advice repeats. A scratch probe (`/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h5/probe.ts`) against the worktree source showed the same `project-docs-unindexed` finding before and after a real sync, with `registered: []` and the index unchanged. This is the same kind of gap as the Task 15 vs Task 14 gap closed in `0aa6cf243` (`unindexedWrapped`).

Checked and consistent across groups:

- Task 19's `listIndexedEquivalents` and the `usable` predicate are shared by `findIndexedEquivalent`, so the detector and `syncProjectDocs` resolve the same row. When a default doc is present and every equivalent row is unusable, the detector says "run `bkit upgrade`" and sync does register it, which matches Task 14.
- Task 20's normalization change recomputed both `LEGACY_STARTER_DIGESTS` and `LEGACY_STARTER_DIGEST_HISTORY`. The Task 1 and Task 11 recognition tests still pass.
- Task 18's `stripUntrusted` (first `BEGIN` to last `END`) keeps the Task 10 exclusion test passing.
- `dist/` was rebuilt in the same commits as the engine sources (`project-docs`, `tools`: `1f9192ab7`; `summary`: `dfb383dbc`).
- `node dist/cli.js check` exits 0 with `0 write(s) would occur`. This repo's own `.agents/docs.md` has no unparsed row.
- `docs/observability.md` § Project documentation advisories ("unsafe, unreadable or malformed") and § Phase documentation warnings still describe the group 6 behaviour.

## Previously Attempted

- Holistic: `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap, fixed per `build-plan-gaps-remediate-holistic-1-log.md`); `build-plan-verify-holistic-2.md` (PASS, Tasks 1-9); `build-plan-verify-holistic-3.md` (CONCERNS, 7 gaps, fixed per `build-plan-gaps-remediate-holistic-3-log.md` in `0aa6cf243`); `build-plan-verify-holistic-4.md` (PASS, Tasks 1-17, 5 groups, at `681d3f0f6`). Group 6 (Tasks 18-21) came afterwards from challenge round 2 (`build-challenge-2.md`) and is judged holistically here for the first time.
- Group 6: `build-plan-verify-6-1.md` (CONCERNS, 2 gaps on Tasks 19 and 21, fixed per `build-plan-gaps-remediate-6-1-log.md` in `1f9192ab7`); `build-plan-verify-6-2.md` (PASS, Tasks 18-21).
- Groups 1-5: final group reports `build-plan-verify-1-5.md`, `-2-2.md`, `-3-1.md`, `-4-1.md`, `-5-1.md`.

## Notes

- Mode `Holistic`, all 6 groups, judged on the tree at `eafb48a59`. `tmp/bkit-diff-864-move-project-docs.md` has partial diff coverage (20 largest of 428 files). Holistic attempt 4 (`681d3f0f6`) judged Tasks 1-17. Since then only group 6 has changed engine code, so I read `git diff 681d3f0f6..HEAD` in full: `project-docs.ts`, `tools.ts`, `summary.ts`, their `dist/` copies, three test files (additions only, 0 lines removed) and `docs/deferrals.jsonl`.
- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 three times, about 20 minutes each. Each time it waited for the machine-wide tests lock, which was held by `bkit:gate:static-unit-integration-e2e` in a consumer worktree (pid 57161, running over 2 hours). No test ran in those attempts. Logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h5-tests-changed.log`, `-2.log` and `-3.log`.
- Instead, I ran the affected suites directly with `pnpm exec vitest run`, and all passed:
  - `install/project-docs.test.ts`, `checks/after/tools.test.ts`, `checks/after/index.test.ts`, `commands/workflow/summary.test.ts` and `install/managed-block.test.ts`: 201 of 201.
  - `workflows.integration.test.ts` and `uninstall.integration.test.ts`: 22 of 22.
  - `install.integration.test.ts` and `upgrade.integration.test.ts`: 134 of 134, at load average 78-171. Log: `h5-install-upgrade.log` in the same scratchpad folder.
  - `template-path-refs`, `templates`, `shipped-docs-refs`, `rules-sync`, `dogfood-templates` and `instructions-coverage`: 693 of 693.
  - The full unit and integration lanes were not run this round.
- `node dist/cli.js check` exited 0 (`0 write(s) would occur`). Its only project-docs advisory is `project-docs-unpopulated` for this repo's starter-only docs, which is the intended non-blocking result. Log: `h5-check.log`.
- All 41 planned `TEST FIRST` names exist exactly once in their named files. Every Derived Test Matrix row maps to a task whose TEST FIRST names that test.
- Task 14 is left off the `Tasks` line. Its DONE WHEN says "No advisory names an action the CLI will not perform", and since Task 21's unparsed-row guard that no longer holds (the one gap logged). Tasks 18-21 meet their DONE WHEN, as `build-plan-verify-6-2.md` records and the reruns above confirm. Tasks 1-13 and 15-17 stay satisfied, as `build-plan-verify-holistic-4.md` records. Group 6 changed none of their code paths except through the shared resolver, and their tests pass.
- No test-first audit report was supplied for this holistic round. Group 6's audits (`build-tests-green-6-1.md`, `-6-2.md`) have `Gaps: 0` and `Unproven: 0`. Carried forward for the owner to answer at the end of the build, not as gaps: Task 1 `migrates legacy ownership without changing project text or core ownership` (red `vacuous`), Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice`, Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`, and Task 17's two `Already landed` tests (`reports an index row through a regular file as ambiguous instead of throwing`, `reports a NUL-byte index path as ambiguous instead of throwing`; the tests step's reason was that `detectProjectDocs` already returned `project-docs-ambiguous` without throwing).
- Decision records:
  - `build-decision-1-1.md` (Fix now, Task 8), `-1-4.md` (Fix now, Task 9) and `-1-5.md` (Fix now, both halves, Task 14) are the owner's choices.
  - `build-decision-1-2.md` and `-1-3.md` hold no questions.
  - No record accepts the logged gap.
- Mandatory checks:
  - Sync problems print through `logReport` (`console.warn`, including the new unparsed-row `indexProblem`) and the `project-docs-*` advisories, per `docs/observability.md` § Advisory Checklist Output.
  - Every Documentation Updates row is done.
  - Gate and Verification Plan checkboxes left unticked in the plan are advisory and block nothing.
- `docs/migrations.md:41` covers the unparsed-row refusal only loosely, through "an unreadable index is left byte-for-byte with a warning". I did not log this. The row's registration rule is still accurate.
- Out-of-scope observations, not gaps:
  - A link row whose target is `./docs/security.md` is treated as an equivalent of `docs/security.md` rather than the same path. Sync adds no row, but check reports a `project-docs-unindexed` "lists another document for the same topic" finding with a hand-edit action.
  - One unrelated prose row anywhere in `## Project Documents` blocks registration of every default doc.
  - Carried from attempt 4: plan reviewers have no `Documentation Warnings` output; `docs/testing.md` does not list the pass-through `node:fs` mock in `checks/after/tools.test.ts`; `.bkit/core/.bkit/prompts.md` § Debug Phase handover wording; `stripManagedWrapper` reports `inside-fence` for a populated doc that quotes a marker in a code fence.
  - The six round-2 LOW deferrals in `docs/deferrals.jsonl` do not cover the logged gap.

## Identified Gaps Log

1 gap.


INTEGRATION: Task 21 (Group 6) unparsed-row guard vs Task 14 (Group 4) DONE WHEN "No advisory names an action the CLI will not perform" — when the `## Project Documents` table holds any row `readProjectIndex` cannot parse (e.g. `| Arch notes (docs/notes.md) | ○ | ○ | ○ | ○ | ○ | Notes. |`), `syncProjectDocs` (`.bkit/core/engine/install/project-docs.ts:572`) sets `indexProblem` and registers nothing, yet `detectProjectDocs` (`.bkit/core/engine/checks/after/tools.ts:539-548`, action at `:596`) still lists a populated, unindexed `docs/security.md` under `project-docs-unindexed` with "or run `bkit upgrade` to register the default paths". A scratch probe against the worktree source showed that finding before and after a real `syncProjectDocs` run (`registered: []`, index unchanged), so the advice repeats until the row is repaired by hand. Fix: when `index.unparsed` is non-empty, keep those paths out of the "run `bkit upgrade`" list (as `unindexedWrapped` does for ambiguous wrappers) and say upgrade registers them only once the unreadable row is repaired, with a `tools.test.ts` case — Fixable: true
