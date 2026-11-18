Verdict: CONCERNS
Failures: 1
Fingerprint: c3fd56a3ef1701ec26fdd4cda4621dbcc8ef5e8a8e4462780232cabd6dc25847
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Full diff coverage: the diff's first line is a plain `diff --git` header, so `partial diff coverage` does not apply. Files challenged: `.bkit/core/engine/commands/workflow/worktrees.ts` (the mint / adopt decision, the new main-checkout refusal for design / plan / build and the new `adoptRoot`), `dist/commands/workflow/worktrees.js` (its build output, which mirrors the source), `.bkit/core/engine/commands/workflow/worktrees.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`, `.bkit/core/.bkit/workflows.md` and its installed copy `.bkit/workflows.md`, `.bkit/version` (one canonical hash) and `docs/testing.md`.

Vectors checked on the modified surface:

- Authentication and authorisation: no credential, token or permission code changes. `linkBkitEnv`, `allowDirenv` and `install` still run only for `created` / `resumed`, so an adopted host-made worktree gets no `.bkit/.env` link, no `direnv allow` and no package lifecycle scripts.
- Data-access control and tenancy: not applicable, because bkit has no database. Checkout isolation is the nearest boundary; see TASK 1.
- Input validation: `--fid` passes `fidOf`, `--branch` passes `git check-ref-format`, and both the refusal and `adoptRoot` read `git rev-parse --show-toplevel` of the process's own cwd. Every git call is `spawnSync("git", argv)` with no shell. The refusal message interpolates only the validated workflow name and `feat/{fid}`.
- Secrets: none added, none printed.
- Data exposure: `worktreePath` and `logDir` reach stdout only. Invocation events stay checkout-relative with a worktree fingerprint (`worktreeFingerprint` in `.bkit/core/engine/commands/lib.ts`), so a host worktree path does not land in a committed row. The main-checkout reach is TASK 1.
- Destructive operations: `removeWorktree` touches only `.worktrees/{FID}` and keeps a branch another worktree holds (`held-elsewhere`), so ship's close never removes a host-made worktree or its branch.
- Rest of OWASP: no crypto, configuration or logging change. The `.bkit/version` hash for `.bkit/workflows.md` equals the file's SHA-256, and the installed copy's lines 1360-1375 match the source.
- Supply chain: no dependency change.

## Notes

- Round 1's finding (plan TASK 4) is fixed for an ordinary main checkout: a scratch main checkout on `feat/123-x` with an untracked `notes.txt` got exit 7 and the refusal message from `worktrees setup --workflow=plan --worktrees`, and no log directory was written.
- TASK 1 evidence (this branch's `dist/cli.js`; a scratch super repo with the app as a submodule, the submodule on `feat/123-x` with an untracked `notes.txt`): `worktrees setup --workflow={plan|design|build} --fid=123-x --month=202611 --worktrees` from the submodule exited 0 with `mode: adopted`, `worktreePath` the submodule checkout, `repoRoot` `{super}/.git/modules`, and `docs/plans/202611/logs/123-x` created there. The same plan call with the main checkout's pre-change `dist/cli.js` exits 4 (`could not ask origin whether feat/123-x exists`) and writes nothing.
- TASK 1 cause: the guard at `.bkit/core/engine/commands/workflow/worktrees.ts:1258` compares the session's top level with `repoRoot`, which is `path.dirname` of `--git-common-dir` (`mainCheckoutRoot` in `.bkit/core/engine/commands/lib.ts`). In a submodule the common dir is `{super}/.git/modules/{name}`, so the two never match. `git rev-parse --absolute-git-dir` equals `--git-common-dir` in the submodule's main checkout and differs in a linked worktree of it (`{common}/worktrees/{name}`), so that comparison separates main from linked in both layouts. A `--separate-git-dir` clone stops earlier with exit 2 (`not inside a git repository`) and never reaches the guard.
- TASK 1 chain (read in code, not executed in the submodule): the abort or pause `bkit workflows handover --push` resolves its tree with `git rev-parse --show-toplevel` (`whereInTree` in `.bkit/core/engine/commands/workflow/workflows.ts`), runs `addAllButCopied(tree)` (`git add -A` minus the copy list) and pushes the feature branch, as round 1 traced. Severity is LOW, not round 1's MEDIUM, because the layout is rare and bkit's mint path already fails there.
- Cross-reference: the `adopted` row and the `Refused (exit 7)` line of `.bkit/core/.bkit/workflows.md` now state that design / plan / build in the main checkout on `feat/{FID}` are refused, which the submodule case contradicts. No doc in `docs/` or `.bkit/` states whether submodule checkouts are supported. `docs/security.md` has no section on checkout isolation; its § Public repo content says everything committed is public.
- Out of lens, not logged: debug `--branch=dev` from a linked worktree on `dev` is now adopted there (the pre-change CLI exits 7), but `openSharedRecord(root, …)` still builds the shared-checkout record from the main checkout. In a scratch repo the record landed in the main checkout's git dir with the main checkout's HEAD and dirty file, while commands in the linked worktree read `.git/worktrees/{name}/bkit/shared-checkout/`. Commit and push refuse without a record (exit 14 / 20), so this fails closed: a functional break, not an exposure. Propose it separately.
- Out of lens, not logged: `statusLocation` in `.bkit/core/engine/commands/lib.ts` resolves design / plan / build / debug status to `.worktrees/{fid}` or the main checkout, never to a host-made worktree, so a caller without `--file` (for example `failState` in `.bkit/core/engine/commands/workflow/workflows.ts`) reads the main checkout's copy. Read, not executed.
- Checked, not a finding: an adopted host-made worktree gets no install, so it may lack `.husky/_`, and then the pre-push hook (the full local gate and the open-PR `[skip ci]` guard) does not run on the run's pushes. The header of `.husky/pre-push` already says a linked worktree without husky runs no hook, the hook runs no secret scan, and ship's merge gate (`bkit runs gate --validated=`) stays the authority on what merges.
- Tests run: `pnpm exec vitest run .bkit/core/engine/commands/workflow/worktrees.test.ts -t "adopt the checkout the session is already on"` gave 5 passed, 91 skipped; `pnpm exec vitest run .bkit/core/engine/commands/workflow/worktrees.integration.test.ts -t "host-made worktree"` gave 1 passed, 61 skipped. The rest of both files was not run. A first integration attempt with `--config vitest.integration.config.ts` failed because that config file does not exist; the rerun used the default config.
- `Failures` and `Fingerprint` are left to the engine, because this step has a result file.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** In a git submodule's main checkout on feat/{FID}, design, plan and build still run in place, because the main-checkout guard compares the session's top level with the parent of the common git dir (`.git/modules` there), so the abort or pause handover again commits and pushes every uncommitted file in that checkout
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:1258` · **Round:** 1
  - **DONE WHEN:** under `--worktrees` (or `--detect` resolving to worktrees), `bkit worktrees setup` for design, plan or build exits 7 and writes no log directory whenever the session's checkout is its repository's main worktree (`git rev-parse --absolute-git-dir` equals `--git-common-dir`), a submodule's main checkout included; a linked worktree on `feat/{FID}` (git dir under `{common}/worktrees/`) is still adopted for every workflow, and ship and debug keep their in-place adoption of the main checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses design, plan and build in place in a submodule's main checkout on feat/{fid} under --worktrees` fails on exit 0 with `mode` adopted, `worktreePath` the submodule checkout, and `docs/plans/{month}/logs/{fid}` created there
<!-- bkit:task 1 end -->
