Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4` (one group) — challenge round 1 fix group, tasks 6 and 7.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification attempt for group 4.

## Notes

Both tasks verified in the worktree at HEAD (`efd9ac2a1`).

- **TASK 6 — `docs/deployments.md`:** `:533` reads `**Gate sites (2):** build Step 16`; `:535` reads `**Open-PR pre-flight (build Step 16):**`. `grep "build Step"` returns only those two lines, both 16; `grep "Step 15"` returns nothing. `WORKFLOW_STEPS.build` carries `build-close-workflow` at 16 (`step-table.ts:107`), so the CI-Dispatch Gate site and the open-PR pre-flight both name the close-workflow step's number. DONE WHEN satisfied.
- **TASK 7 — cloud doc:** `.bkit/cloud.md:399` and `.bkit/core/.bkit/cloud.md:399` both read ``After `bkit-build` Step 16 close-workflow pushes``. `diff .bkit/core/.bkit/cloud.md .bkit/cloud.md` differs only at line 3 (the source's `{{BKIT_MANAGED_MARKER}}` vs the shipped `<!-- bkit:managed … -->`), so the shipped copy is render-identical to its source apart from the managed marker, unchanged from before. DONE WHEN satisfied.
- **Tests:** the named test `live docs name no build step the table does not carry` exists in `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` and passes (`npx vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts -t "live docs name no build step the table does not carry"` → 1 passed, 234 skipped). Red evidence is genuine: `build-task-red-4-6-1.md` shows 4 problems (deployments `:533`/`:535` and both cloud files at `Step 15` against the table's 16); `build-task-red-4-7-1.md` shows the 2 cloud problems alone after TASK 6 landed — each task's own subset observed red and then green. The test-first audit (`build-tests-green-4-1.md`) reports `Enforced: true`, `Gaps: 0`.
- **One shared test, not double-counting:** both tasks name the same table-driven test, whose `LIVE_DOC_CLAIMS` list holds four claims each read against `WORKFLOW_STEPS.build`. It is one test that legitimately covers both tasks' files, declared as such in the execute log's Notes; the two-task red sequence shows each task's fix was independently observed. Honest — the plan caps (3 tasks / 15 TEST FIRST tests) are met either way.
- **`.bkit/version` stale hash — accepted, no re-pin required:** `canonicalHashes[".bkit/cloud.md"]` still records the pre-edit hash `0ca9ce49…` while the shipped file now hashes `83d62dff…`. This is invisible to `bkit check` (it compares rendered writes, not the hash map — see the comment at `.bkit/core/engine/audits/repo/version-hashes.test.ts:8`). It is also harmless to upgrade: `resolveAction` (`upgrade.ts:236`) returns `skip, in-sync` when the on-disk content already equals the template render, which is the case here, so the stale entry is never consulted. The plan's TASK 7 DONE WHEN names only the two cloud files, not `.bkit/version`, and `bkit install` is barred by the group brief. Accept the state; the next install re-pins. No gap.
- Group 4's four LOW challenge deferrals (`docs/migrations.md:37`, `status.ts:468/470`, `challenge.ts:53`, `manifest.ts:252/286`, `checks/before/repo.ts:186`, `checks/after/index.ts:365`) are out of scope for tasks 6/7 and are not raised as gaps; the new test names only the three files these two tasks own, so it does not pin them.

## Identified Gaps Log

None
