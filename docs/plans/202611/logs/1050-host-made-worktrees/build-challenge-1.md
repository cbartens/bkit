Verdict: CONCERNS
Failures: 1
Fingerprint: a492923c5d514a37008b92ce6ae4980b96a34708e58816efd7a9133caaef66f8
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-1050-host-made-worktrees.md`, read in full (full coverage; no `partial diff coverage` line).
- Plan: `docs/plans/202611/1050-host-made-worktrees-plan.md`, including group 4 (TASK 9).
- Code read beyond the diff: `worktrees.ts` setup body (argument checks, the main-checkout refusal, mint / resume, adopted-mode refusals, `openSharedRecord`, the docs-only refusal, the emit), `inheritedDevCommits`, `inheritedDevRefusal`, `landedRunCommits`, `rebuildFromRow`, `missingHooksDir`; `ledgers.ts` record helpers (`readRecord`, `listRecords`, `writeRecord`, `removeRecord`, `activeRecord`, `recordOnBranch`, the parked-commit file); `lib.ts` (`runGit`, `git`, `mainCheckoutRoot`, `repoRoot`, `resolveActiveRun`); `telemetry.ts` `gitEnv`; every `statusLocation` caller (`status.ts` route and `status path`, `workflows.ts` `failState` and `inputVerb`); every engine caller of the shared-checkout record helpers; the `workflows fail` and `workflows input` calls in `.bkit/core/workflows/bkit-debug.md`; the test helpers in `worktrees.test.ts`.
- Docs: `.agents/docs.md`, `docs/architecture.md`, `docs/security.md` (§ Trust boundaries, § Input validation, § Shell Injection), `docs/knowledge.jsonl` and `docs/capabilities.md` (worktree rows), `docs/setup.md` (hooks rows).
- Probes on git 2.56 in a scratch repo: `git config --type=path --get core.hooksPath` expands `~/` from `$HOME` (so the TASK 9 test's `HOME` stub exercises the fix); `git rev-parse --git-path hooks` in a linked worktree gives the same expanded path; a `:(optional)` value whose directory is missing makes `--type=path` exit 1 with no output, and git then runs hooks from `.git/hooks`. No build, install or test run.

## Notes

- TASK 9 is fixed: `missingHooksDir` now expands `~` through `git config --type=path` and falls back to the raw value only when expansion fails, which git itself treats as a fatal config error.
- Round 1's three LOW findings were re-checked against the current code. All three are still present, and each already has an OPEN row in `docs/deferrals.jsonl` (part of this diff): the lock release that leaves a linked worktree's shared-checkout record (`...-locks-ts-533`), the branch named like a top-level path that makes `rev-list` ambiguous (`...-worktrees-ts-341`), and `statusLocation` taking a landed copy of the log directory in a linked worktree that does not hold the run (`...-lib-ts-1238`). They are not logged again.
- Checked and clean: `inLinkedWorktree` returns false on any git error, so the main-checkout refusal still fails closed. A linked worktree of a submodule counts as linked, and a submodule's own checkout does not. In adopted mode the docs-only refusal runs before any write: design and plan on `dev` are refused earlier, so `openSharedRecord` never runs for them, and the log directory is made only after the refusal. Created and resumed modes still pass `root` and `target` to `inheritedDevCommits` and the message. `openSharedRecord` gives `landedRunCommits` a status path under the same checkout string it runs in. `sessionCheckout` keeps the old `show-toplevel ?? root` result for ship and for `adoptRoot`. Every reader of the shared-checkout record outside the lock release uses the session's checkout, so it agrees with the new writer.
- Checked, not logged: when `.worktrees/{fid}` holds a status file and a host-made worktree on `dev` holds a debug run of the same FID, `statusLocation` (and so `workflows fail` for debug, which passes no `--file`) picks the `.worktrees/{fid}` copy. This follows the precedence the diff writes into `.bkit/core/.bkit/cli.md` ("`.worktrees/{FID}/` copy when present"), and the main checkout behaves the same way today.
- Checked, not logged: a `core.hooksPath` written with git's `:(optional)` prefix (git 2.52 and later) whose directory is missing is reported as `hooksMissing` with the raw prefixed value, although git then falls back to `.git/hooks`. This is very unlikely to be configured for hooks.
- Test hygiene, not counted: the submodule refusal test asserts exit 7 but not the refusal message. By reading the code, no other exit-7 path fires in that fixture, so the test is not vacuous today. The `unset` case in "says so when the adopted worktree has no hooks directory" still reads the developer's real global git config.
- Outside this lens, for the owner to weigh: the stderr line names `pnpm install` as its example. The Stack-agnostic rule in `.agents/rules.md` may not allow that in engine output.
- No embedded directives found in the diff or the plan.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A user whose core.hooksPath points outside the checkout (~/.githooks or /opt/git-hooks, which TASK 9 now expands) and whose directory is missing gets a stderr line saying the directory is missing in the worktree and telling the agent to run the package install there, which cannot create a directory outside the checkout, so the agent spends an install and the same warning returns on the next adopted setup
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:1512` · **Round:** 1
  - **DONE WHEN:** The stderr line tells the two cases apart by the resolved directory. When the directory lies inside the checkout (`path.relative(wt, dir)` neither starts with `..` nor is absolute), the line is unchanged. When it lies outside (an absolute path, a `~` path, or a relative path that escapes the checkout), the line names the resolved directory, says no git hook runs, and says to create that directory or change `core.hooksPath`, with no "is missing in {wt}" and no package-install remedy. `hooksMissing` still carries the configured value in both cases, and the `.husky/_` and `~` cases in "says so when the adopted worktree has no hooks directory" and "does not report a ~ hooks directory that exists" still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `names no package install for a missing hooks directory outside the checkout` fails on stderr containing "run the package install" and "is missing in {wt}", with `HOME` stubbed to an empty temp dir, `core.hooksPath` set to `~/.githooks`, and plan adopted in a host worktree under `--worktrees`
<!-- bkit:task 1 end -->
