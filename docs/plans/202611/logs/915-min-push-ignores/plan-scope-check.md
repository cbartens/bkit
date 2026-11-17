Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) `Acceptance Scenario` › `Narrative` and `Success Criteria` hold only the `⚠️ MISSING` placeholder.** The plan is right not to invent them: #915 has no design and no change-shape fields, and it is not an audit plan. Even so, the testable contract has no outcome measured from the operator's side. Gate 1 cannot close until the owner writes both sections into the plan (Open Question 2). The Concrete Example's outcome ("no `--no-verify` and no empty trigger commit") is the natural source for a criterion, but only the owner may adopt it.
2. **(plan edit) `Edge Cases` rows that have no `Derived Test Matrix` row and no `TEST FIRST` test.** The contract asks for one matrix row per testable behaviour. The following fail-closed behaviours are stated but never tested at any tier:
   - "A below-marker edit adds a second line-anchored ... `<!-- bkit:start -->`": the `managedHead` unit tests (Task 1) cover two `bkit:end` lines only, and the `ci.test.ts` cases (Task 3) cover a second `bkit:end` only. Add a `managedHead > returns null when the file has two bkit:start lines` case (Task 1) or a `ci.test.ts` refusal case (Task 3).
   - "changes ... the marker line itself": no case edits the `<!-- bkit:end -->` line while leaving the text above it unchanged.
   - "renamed (a rename counts as a delete plus an add, because the diff runs with `--no-renames`)": no rename case. The delete case covers only half of it, and the claim depends on `changedOutside` keeping `--no-renames` (`.bkit/core/engine/commands/workflow/ledgers.ts:1556`).
   - "A push mixes a project-section edit with a file outside the paths ... `outside` lists only that other file": the Task 3 "beside" cases pair two templates. None pairs an accepted template with a non-template code file.
   Add each one as a matrix row that names its Task, plus a `TEST FIRST` line in that task, keeping within the 10-tests / 3-files per-task cap. Task 3 is already at 10 tests, so the new rows go to Task 1 or into a split of Task 3.

## OPTIONAL

- **The `--update` log line is never asserted.** Concrete Example step 2 says the `--update` log names `docs/templates/bkit-audit-logs.md`. Task 3 adds that log to `minPushUpdates`, but only its `--ref` test checks for a log line ("and says why"). The hook integration tests check the exit code and the gate, not the log text. A `ci.test.ts` `--update` case, or an assertion on the integration log, would cover it.
- **The `--update` increment / whole path has no unit test of its own.** It is covered only indirectly by the hook integration test, which checks that the hook takes the light gate. A direct `bkit ci min-push --update` unit case in Task 3 would pin the call to `minPushOutside` without the hook in between.
- **The `main` side of the guard is untested.** Goals and Breaking Changes say the looser rule applies to `[skip ci]` pushes to `dev` / `main`, but every test pushes to `dev` only.
- **Edge case "A blob that cannot be read takes the same branch"** has no test. It is low-cost to cover with a `cat-file` failure, for example a path present in the diff but absent from the object store, which is hard to build. Recording it as an untested assumption would also do.
- **The `TEST FIRST` failure text quotes no unique phrase.** The four Task 1 reds all fail for the same reason ("`managedHead` not existing"), so `tests red` cannot tell them apart. The hook reds could quote the hook's `"BLOCKED"` line, and the `ci.test.ts` reds could quote the accepted-template log text.
- **Reuse note.** `.bkit/core/engine/audits/templates/templates.test.ts:220` has an `upToEnd` helper (`s.slice(0, s.indexOf("<!-- bkit:end -->"))`) that does almost the same job as `managedHead`. It is test-only and not line-anchored, so `managedHead` in `.bkit/core/engine/install/managed-block.ts` is still the right place. The `Reuse Inventory` row could name it as a candidate that was looked at and rejected.

## OUT OF SCOPE

- The open-PR `[skip ci]` guard on feature branches (`bkit ci bookkeeping-push`) still blocks an audit-run head on a branch with an open PR (Open Questions, second assumption). This is a candidate follow-up issue if the owner wants the same exception there.
- Adding `docs/audits/**` to `MIN_PUSH_FLOOR_ENTRIES` in `.bkit/core/engine/install/modules/core.ts` (Open Question 3, option B). This is a migration change, so it needs the owner's confirmation under `.agents/rules.md` § Migrations.
