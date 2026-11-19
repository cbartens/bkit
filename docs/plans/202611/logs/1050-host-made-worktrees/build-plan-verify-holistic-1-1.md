Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8
Loosened: none
Fingerprint: ae9589a4d56dfa6d7e0e4a701e50eb3359a952b298a57ec61a4e16e45862cce0
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. The groups' pieces fit together:

- Group 1 `sessionCheckout` / `inLinkedWorktree` (`.bkit/core/engine/commands/lib.ts`) are the helpers group 2 calls in `worktrees.ts` (refusal guard, `adoptRoot`). Setup writes the log directory in `adoptRoot` (the host worktree), and `statusLocation` returns that same worktree once its log directory exists, so every `--file`-less caller (`lib.ts:577`, `status.ts:389`, `status.ts:448`, `workflows.ts:297`, `workflows.ts:2042`) reads the copy setup created.
- Row 2: `openSharedRecord(root, adoptRoot, ...)` writes the record under the linked worktree's `--git-path`; the commit and push readers (`activeRecord(tree, ...)` in `workflows.ts:894` / `:1303`, `activeRecord(root, ...)` in `ledgers.ts:1204` / `:1275` where `root` is the committing tree) resolve the same per-worktree path. Locks stay under the main checkout, matching `workflowLockPath(root, ...)` in `locks.ts`.
- Row 4: for created / resumed runs `adoptRoot === root` and `adoptedBranch === target`, so the mint / resume refusal is unchanged; adopted design / plan on `dev` is still refused earlier by the `here === DEV` guard, so the new check never runs on `dev`.
- Group 3 docs (`.bkit/core/.bkit/cli.md`, `.bkit/core/.bkit/workflows.md`) state the behaviour groups 1 and 2 implement; `dist/` matches both sources.

## Previously Attempted

None (first holistic attempt). Group reports: `build-plan-verify-1-1.md`, `build-plan-verify-2-1.md`, `build-plan-verify-3-1.md`, all PASS.

## Notes

- TASK 1: `inLinkedWorktree` and `sessionCheckout` are exported in `lib.ts`; `statusLocation` has no inline `show-toplevel` lookup; `a host-made linked worktree holds the run` passes (log-directory-only and status-file cases).
- TASK 2: the guard calls `!inLinkedWorktree(ctx.cwd)`; `refuses design, plan and build in place in a submodule's main checkout on feat/{fid}` passes.
- TASK 3: `openSharedRecord(root, checkout, fid, workflow, logDir)` uses `checkout` for every record and git read and `root` only for `withSetupGuard` and lock checks; `debug in place on dev from a linked worktree records its own checkout` passes.
- TASK 4: the docs-only refusal runs in adopted mode on the checked-out branch and skips without `refs/remotes/origin/dev`; `refuses plan from a host-made worktree whose branch carries unpushed dev work` passes (plan exit 7, build adopts).
- TASK 5: `missingHooksDir`, optional `hooksMissing` in the emit and the verb's `output` map, one `ctx.log` line; `says so when the adopted worktree has no hooks directory` passes.
- TASK 6-8: doc sources state both rules and the rendered copies match the `.bkit/version` hashes; the deferral key queries as `CLOSED` with one appended line; `grep -l inLinkedWorktree` lists both `dist/` files and the tree has no uncommitted engine or `dist/` change.
- Test run: `pnpm exec vitest run` on `lib.test.ts`, `worktrees.test.ts` and `worktrees.integration.test.ts`: 3 files, 243 tests passed (load ~9). The full suite is left to the holistic gate.
- Derived Test Matrix: all 5 rows are the TEST FIRST tests of tasks 1-5 and are named by those tasks' `DONE WHEN`; all exist and pass.
- Test-first audits `build-tests-green-1-1.md`, `-2-1.md`, `-3-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- Documentation Updates: both doc-source rows done; `docs/testing.md` and `docs/decisions.jsonl` rows need no change. `docs/observability.md` is present; the one new stderr line goes through `ctx.log`.
- No `build-decision-*.md` or `build-plan-gaps-remediate-*-log.md` exists for this run.
- Observation, not a gap: the TASK 5 stderr line writes "for example pnpm install" by hand, while `.bkit/core/engine/shared/package-manager.ts` (`installCommand`, already imported in `worktrees.ts`) is the home of that fact. The text matches what the engine's own install runs, so `DONE WHEN` holds.
- Observation, outside scope: `resolveMonth` / `monthBuckets` (`.bkit/core/engine/commands/workflow/locks.ts:63`) look for a feature's month bucket only in the main checkout, so a `--month`-less call from a host-made worktree falls back to the current UTC month. The same is true for `.worktrees/{fid}` today; a follow-up could look in the session's checkout too.

## Identified Gaps Log

None
