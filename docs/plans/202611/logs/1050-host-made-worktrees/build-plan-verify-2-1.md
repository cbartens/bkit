Verdict: PASS
Failures: 0
Fixable: false
Tasks: 2, 3, 4, 5
Loosened: none
Fingerprint: eeea2d3aef5cc25777a77830cd1df36926f8fea8dcfa660ce04a49b98a3dcdfb
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

- TASK 2: the refusal guard in `run` (`.bkit/core/engine/commands/workflow/worktrees.ts`) calls `!inLinkedWorktree(ctx.cwd)`. Inside a submodule, the own git dir and the common git dir are the same, so the guard fires. The test `refuses design, plan and build in place in a submodule's main checkout on feat/{fid}` passes. So do the existing main-checkout refusal test and the linked-worktree and own-branch adopt tests.
- TASK 3: `openSharedRecord(root, checkout, fid, workflow, logDir)` uses `checkout` for every record and git read, and uses `root` only for `withSetupGuard` and the lock checks. `adoptRoot` comes from `sessionCheckout(ctx.cwd)`. The test `debug in place on dev from a linked worktree records its own checkout` checks the `--git-path` record and its dirty path, and it passes. The main-checkout in-place-on-dev describe also passes.
- TASK 4: the docs-only refusal now runs in adopted mode too. It checks the checked-out branch and skips when `refs/remotes/origin/dev` is missing. The integration test `refuses plan from a host-made worktree whose branch carries unpushed dev work` passes and covers both the plan exit 7 and the build adopt.
- TASK 5: `missingHooksDir(checkout)` was added, along with optional `hooksMissing` in the emit and in the verb's `output` map, and one `ctx.log` line in adopted mode. The test `says so when the adopted worktree has no hooks directory` passes. The adopted full-shape `toEqual` test is unchanged and passes.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. It has no Taken over, Changed by a code step, Updated tests or Already landed sections. All four planned tests went red, then green.
- Verified by running `worktrees.test.ts` (101 passed) and `worktrees.integration.test.ts` (63 passed) at load around 16. The language server reports no diagnostics in `worktrees.ts`. The `dist/commands/workflow/worktrees.js` diff matches the source.
- No decision records or earlier verify or remediate reports exist for group 2.
- Observation, not a gap (outside the `DONE WHEN`): the TASK 5 stderr line hardcodes "for example pnpm install". `.bkit/core/engine/shared/package-manager.ts` calls itself the one place that names the package manager (`PACKAGE_RUNNER` / `installCommand`). Building the hint from `installCommand` would keep that fact in one home.

## Identified Gaps Log

None
