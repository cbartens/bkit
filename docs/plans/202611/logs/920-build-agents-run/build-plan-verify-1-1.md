Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 6b4472459598779dc0e59491fb84de8a03a933d110f097cd0bc4b61dd459c72f
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Group 1 work lands in commits `8c717a716` (plan-tests: two new tests in `.bkit/core/engine/tools/instructions.test.ts`) and `e66a5312e` (rule text, store entry, five prompts, `.agents/rules.md` and host mirrors). The rest of `build-diff-1-1.md` (ship, ci, land, prs, managed-block, vitest deadline and others) comes from dev merges for #911, #915 and #929 and is outside this group.
- TASK 1: `.bkit/core/.agents/rules.md:123` and the `### local-pre-commit` store entry in `.bkit/instructions.md` hold the same new bullet ("Before a commit and while working ... naming each test file, never a folder, a pattern, the full suite or a `bkit:gate:*` script ... A `/bkit-*` step's named command is the only wider run."). No test runner or stack is named. The previous text sits first under `retired`. The `- carry:` line lists all five prompts, and the `prompt:` relation now lists them as `verbatim`.
- TASK 2: the bullet appears in all five `.bkit/core/prompts/*.md` sources, `.agents/rules.md`, and the `.claude`, `.codex`, `.cursor`, `.opencode` and `.agents/plugins/bkit` agent mirrors (32 files hold the new text). `pnpm bkit:test:file .bkit/core/engine/tools/instructions.test.ts` passed 105 of 105, including `has no findings`, `sync has nothing left to rewrite` and both TEST FIRST tests. `node dist/cli.js check` reported `0 write(s) would occur` and no drift finding (15 advisories, none about this change).
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; both tests went red and then green. No `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- Derived Test Matrix: both rows map to TASK 1's TEST FIRST tests, which exist and pass. TASK 1's `DONE WHEN` does not name them; that is a plan-shape point, and the tests are present, so it is not an implementation gap.
- Docs: `.agents/docs.md` loaded. `docs/testing.md` § Tests lock is consistent with the new rule. `docs/observability.md` does not apply because the group adds no error path. No `Documentation Updates` section in the plan.
- No decision records, earlier verify reports or gaps-remediate logs exist for this group.
- Out-of-scope find (proposal, not a gap): three `kept:` drift reasons in `.bkit/instructions.md` (lines 335, 1666, 1821) still paraphrase the retired wording "`local-pre-commit`: `/bkit-*` steps run their own gates". The meaning still holds, but the quote no longer matches the current bullet.

## Identified Gaps Log

None
