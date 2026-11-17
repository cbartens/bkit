Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7
Loosened: none
Fingerprint: 5e48ff6b47238327b50fb821b7c3bf1a88c4013f907cfc087d12a6d9f3b916d4
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

Group diff (044f3759c..a9cd5e6cd, excluding docs/plans): `package.json`, `.bkit/core/.bkit/templates.md`, `.bkit/templates.md`, `.bkit/version`.

- TASK 6 satisfied. `bkit:gate:min` in `package.json` now runs `vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/templates/template-no-userpath.test.ts`; the seeded consumer default (`BKIT_GATE_SCRIPTS`) is untouched. `pnpm bkit:gate:min` re-run here: exit 0, `Test Files 3 passed (3)`, `Tests 359 passed (359)`. The scratch-edit check was not repeated (this step edits no files); the build log records it, and `templates.test.ts` `%s dogfood managed block differs only by the managed-version stamp` asserts the text from `<!-- bkit:end -->` matches `/^<!-- bkit:end -->\n\n## Project Instructions\n/`, so deleting that heading fails the gate. `pnpm vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts -t 'min push'`: exit 0, 24 passed (82 filtered out by `-t`).
- TASK 7 satisfied. `.bkit/core/.bkit/templates.md` § Git hooks — Husky: "What bkit writes" adds `docs/audits/**`; a new sub-bullet states the audit-template project-section rule, the full-gate cases (new/deleted/renamed template, second marker, change at or above the marker), CRLF never qualifying, other templates keeping the full gate, and the `bkit ci min-push` summary wording; "Min-push paths" says the floor covers `docs/plans/**` and `docs/audits/**`. `diff .bkit/core/.bkit/templates.md .bkit/templates.md` differs only on line 3 (managed-version marker). `pnpm bkit check` exit 0. `pnpm format:check` and `pnpm bkit:lint:prose` pass (both ran inside the green `bkit:gate:min`). `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts`: 103 passed.
- Derived Test Matrix rows for Task 6 (`templates.test.ts`, `template-no-userpath.test.ts`) are existing tests now run by `bkit:gate:min`, covered by Task 6's DONE WHEN. Task 7 has no matrix row.
- Documentation Updates: the `.bkit/core/.bkit/templates.md` row is done in this group; `docs/decisions.jsonl` rows `min-push-floor-is-ship-allow-list` and `915-min-push-audit-template-project-section` are present; `docs/capabilities.md` belongs to Task 5 (group 1).
- Test-first audit (`build-tests-green-2-1.md`): Enforced true, Verdict PASS, 0 gaps, 0 unproven. Both tasks are TEST FIRST n/a (config and docs only).
- `docs/observability.md`: not applicable, the group adds no runtime code. `docs/testing.md` present.
- Decision record `build-decision-1-1.md` concerns group 1 only; it accepts no gap in this group.
- Plan currency (`build-plan-current.md`): PASS, 0 affected tasks.

## Identified Gaps Log

None
