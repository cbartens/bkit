Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 6: Stale build-step numbers in `docs/deployments.md` survive the renumbering (CI-dispatch / PR-pre-flight pointed at the wrong step) — `docs/deployments.md:533` now reads `**Gate sites (2):** build Step 16` and `:535` `**Open-PR pre-flight (build Step 16):**`; no `build Step 15` remains in the file. Red recorded as `build-task-red-4-6-1.md` against `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` (4 problems: deployments `:533`/`:535` and both cloud files still at `Step 15`); after the deployments fix the task-7 red run of the same test reported only the 2 cloud problems, so the fix is observed. Prettier check clean (docs/deployments.md)
DONE — TASK 7: The shipped cloud doc and its source still say `bkit-build` Step 15 closes the workflow — `.bkit/core/.bkit/cloud.md:399` and `.bkit/cloud.md:399` both read ``After `bkit-build` Step 16 close-workflow pushes``; the shipped copy still renders byte-identical from its source (line 3's managed marker is the only difference, as before). Red recorded as `build-task-red-4-7-1.md` (2 problems: the two cloud files), the same named test, written once in its final lint-clean shape before the first red and not edited since (`testBlob` `076025bd…` on both red rows). `npx vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` → 235/235 pass; `pnpm lint:prose` → 0 findings in 147 files; oxlint + prettier clean on the test file. Engine untouched, so no `dist/` rebuild (`.bkit/core/.bkit/cloud.md`, `.bkit/cloud.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `docs/deployments.md`)

## Notes

- One test serves both tasks: it is table-driven (each claim's expected number comes from `WORKFLOW_STEPS.build`), so it went red on `docs/deployments.md` and both cloud files, then red again on the two cloud files alone after TASK 6 landed, then green after TASK 7. No duplicate test name.
- `vitest(no-conditional-in-test)`: `LIVE_DOC_CLAIMS` and `staleStepRefs` sit at module level and the `it` body is a single `expect`, so no post-red rewrite was needed (cf. `docs/knowledge.jsonl` `red-snapshot-freezes-the-test-file-write-it-lint-clean-first`).
- Challenge findings merged as LOW deferrals were left alone: `docs/migrations.md:37`, `status.ts:468/470`, `challenge.ts:53`, `manifest.ts:252/286`, `checks/before/repo.ts:186`, `checks/after/index.ts:365`. They are not part of TASK 6/7; none needs to move here — the new test names only the three files these two tasks own, so it does not pin those deferrals.
- `.bkit/version`'s `canonicalHashes[".bkit/cloud.md"]` (`0ca9ce49…`) stays at the pre-edit hash: it is written by `bkit install`, which this brief bars; the shipped file already equals the source's render, so `bkit check` sees no drift and the next install re-pins the hash.
- `build-brief-4-1.md` (orchestrator-written, not a task file) tripped `prettier --check`; `prettier --write`, no content change.
