# Brief: group 1 — `--ref` for the dist check, the pre-push call and the docs

Plan: Pre-push dist check judges the pushed commit Implementation Plan

## Why and what

### Context & Goals

The source repo's `.husky/pre-push` runs `pnpm bkit:check:dist` on every push except a min push. That check (`scripts/gate/bkit-check-dist.mjs`) compiles the staged tree (the index) and compares it with the staged `dist/`. At push time the commits being pushed matter, not the index, so a staged-but-uncommitted fix hides a stale `dist/` in a pushed commit, and an unrelated staged edit blocks a correct push (issue #1048).

The fix: the script takes an optional `--ref=<commit>` and then compiles that commit's tree and compares it with that commit's `dist/`. With no `--ref` it reads the index exactly as today, because `.husky/pre-commit` needs that. The pre-push hook passes the commit it already resolves: `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`.

**Decision on an empty `PUSH_DEV_SHA`** (settled by the orchestrator, option B): the hook passes `--ref` with `PUSH_DEV_SHA` when it is set, else `PUSH_BRANCH_SHA` (the commit pushed to the checked-out branch) when that is set. When both are empty (a tag push, a delete mixed into a push, a push of a branch that is not checked out) it keeps today's call with no argument and reads the index. It never passes an all-zero hash: the hook's ref loop only sets either variable for a non-zero local hash, and the new code also clears an all-zero value. The existing test `.husky/pre-push: a code push still runs them` pushes the checked-out feature branch, so its expectation changes from the exact line `bkit:check:dist` to `bkit:check:dist --ref=<pushed commit>`.

**Shipped hook template:** `.bkit/templates/.husky/pre-push` has no dist check (`grep -rln "check:dist\|check-dist" .bkit/templates` lists nothing), so nothing is added there.

**Removes:** Nothing. One check gains one option.

**Related Issues:**

- #1048 — Pre-push dist check reads the index, not the commit being pushed
- #819 — Build the pre-commit dist freshness check from the staged tree (closed; introduced the index read)

---

### Narrative

A developer pushes a commit to `dev`. The dist check judges that commit's own `dist/`, not whatever is staged beside it.

### Success Criteria

- `node scripts/gate/bkit-check-dist.mjs --ref=<commit>` fails when the commit's `dist/` is stale, even if the fix is staged.
- The same call passes when the commit is correct, even if an unrelated engine edit is staged.
- With no `--ref` the script reads the index, as before.
- A `--ref` value that starts with `-`, or that git cannot resolve to a commit, is refused with exit 1 before any compile.
- `.husky/pre-push` passes `--ref=<pushed commit>`: `PUSH_DEV_SHA` for a push to `dev`, else `PUSH_BRANCH_SHA` for a push of the checked-out branch. A push with both empty keeps the no-argument call, and no all-zero hash is ever passed.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Changing CI's `Assert Dist Freshness` step or `release.yml` | A clean checkout already makes index equal commit | Not needed |
| Adding a dist check to `.bkit/templates/.husky/pre-push` | Consumers have no `dist/` gate (`docs/deployments.md` § check order, row 8) | Not needed |

## Where it fits

- Group 1: `--ref` for the dist check, the pre-push call and the docs — this group
  - TASK 1: Give `bkit-check-dist.mjs` an optional `--ref=<commit>` that judges that commit's tree, and test it — open
  - TASK 2: Make the pre-push hook pass the pushed commit to the dist check, and test it — open
  - TASK 3: Update the docs that state the index-only rule — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Give `bkit-check-dist.mjs` an optional `--ref=<commit>` that judges that commit's tree, and test it
  - **UPDATE:** `scripts/gate/bkit-check-dist.mjs`: parse `--ref=<value>` (any other argument exits 1); refuse an empty value or one starting with `-`; resolve with `git rev-parse --verify --end-of-options <value>^{commit}` and use the full hash; with a ref, fill a temporary index (`GIT_INDEX_FILE`, `git read-tree`) that the existing export and `ls-files -s` calls read, and remove it in `finally`; with no ref, read the real index as today
  - **UPDATE:** `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`: `check` takes extra script arguments; add the four tests below, built with the file's `scratchRepo`, `build`, `write` and `git` helpers
  - **READ:** `docs/testing.md`: § Test first and the check-dist row, for the tier and naming
  - **DONE WHEN:** `pnpm exec vitest run .bkit/core/engine/audits/repo/check-dist.integration.test.ts` passes, including the four new tests and the six existing ones; `node scripts/gate/bkit-check-dist.mjs --ref=-x` exits 1 with `[bkit] --ref value is not a commit`; the test `without --ref the check still reads the index and not the commit` (a correct commit, an unrelated engine edit staged, no `--ref` → exit 1 as stale) exists and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a commit with a stale dist fails as stale while the fix is only staged` fails on today's check ignoring `--ref`, reading the staged fix and exiting 0
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a correct commit passes while an unrelated engine edit is staged` fails on today's check ignoring `--ref`, reading the staged edit and exiting 1 as stale
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref values starting with a dash, empty or not a commit are refused with no scratch folder left` fails on today's check ignoring `--ref` and exiting 0 on a clean index

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Make the pre-push hook pass the pushed commit to the dist check, and test it
  - **UPDATE:** `.husky/pre-push`: in the "bkit repo only" block near line 391, set `DIST_REF` to `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`, cleared when all zeros; run `pnpm bkit:check:dist --ref="$DIST_REF" < /dev/null` when it is non-empty and `pnpm bkit:check:dist < /dev/null` when it is empty; reword the comment above it
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: in the `.husky/pre-push min push` block, change the expectation of `.husky/pre-push: a code push still runs them` and add the two tests below; nothing else in the file changes
  - **READ:** `.husky/pre-push`: lines 140-180, where `PUSH_DEV_SHA` and `PUSH_BRANCH_SHA` are set
  - **READ:** `.bkit/templates/.husky/pre-push`: confirm it has no dist check (nothing is added there)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n 'bkit:check:dist' .husky/pre-push` shows the `--ref="$DIST_REF"` call and the no-argument call; `grep -rln "check:dist" .bkit/templates` lists nothing; `pnpm exec vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` passes; the test `.husky/pre-push: a push with no dev or branch commit runs the dist check with no argument` (push to `refs/heads/other` from the checked-out `feat/1-x`: the logged line is exactly `bkit:check:dist`) exists and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a code push still runs them` fails on the hook still logging the exact line `bkit:check:dist` with no `--ref` of the pushed commit
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit` fails on the hook still logging the exact line `bkit:check:dist` with no `--ref` of the commit pushed to `dev`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Update the docs that state the index-only rule
  - **UPDATE:** `docs/deployments.md`: lines 617 and 619 say the check reads the index, or the commit `--ref` names, and that pre-push passes the commit pushed to `dev`
  - **UPDATE:** `docs/testing.md`: line 924, the check-dist test row, lists the `--ref` probes and the no-`--ref` index probe
  - **READ:** `.bkit/authoring.md`: § Docs
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `grep -n -- "--ref" docs/deployments.md docs/testing.md` finds the new text in both files; `pnpm bkit:text:ceiling check` passes
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read a commit's tree instead of the index in the dist check | `scripts/gate/bkit-check-dist.mjs` | `grep -rln "bkit:check:dist\|check-dist" scripts .husky .bkit package.json`, read the whole script, `git rev-parse` docs for `--end-of-options` | `scripts/gate/bkit-check-dist.mjs` — compiles the index; export, compile and compare code fits a commit's tree through a temporary index | EXTEND | Add argument parsing, ref validation and a temporary index (`GIT_INDEX_FILE` with `git read-tree`) that feeds the existing `checkout-index` and `ls-files -s` calls. |
| Tests for the `--ref` option | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | read the whole file, `grep -rn "check-dist" .bkit/core/engine --include=*.test.ts -l` | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` — has `scratchRepo`, `check`, `build`, `write`, `git` helpers and per-test timeouts | EXTEND | Add tests in the same file with the same helpers; `check` gains optional arguments. |
| Pre-push call with the pushed commit | `.husky/pre-push` | `grep -n "PUSH_DEV_SHA\|PUSH_BRANCH_SHA\|check:dist" .husky/pre-push`, `grep -rln "check:dist\|check-dist" .bkit/templates` | `.husky/pre-push` — resolves `PUSH_DEV_SHA` and `PUSH_BRANCH_SHA` already; `.bkit/templates/.husky/pre-push` — has no dist check | EXTEND | Change the existing "bkit repo only" call to pass `--ref` with `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`. |
| Hook tests for the `--ref` call | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | `grep -n "bkit:check:dist" .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, read the `push` helper near line 1114 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` — the `.husky/pre-push min push` block has `push(hook, sha, remoteRef, remoteSha, extraRefs)`, a stub `pnpm` that logs each call and `commitFiles` | EXTEND | Change one expectation, add two tests in the same block with the same helpers. |
| Doc lines describing the check | `docs/deployments.md` | `grep -n "check:dist\|check-dist" docs/testing.md docs/deployments.md docs/setup.md docs/technology.md` | `docs/deployments.md` lines 617, 619; `docs/testing.md` line 924 — state the index-only rule | EXTEND | Reword those lines to state the `--ref` rule. |

### Architecture entries

#### [MODIFY] `.husky/pre-push`

- **Existence Check:** the file exists.
- In the "bkit repo only" block (near line 391), set `DIST_REF` to `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`, and clear it when it is all zeros. When `DIST_REF` is non-empty run `pnpm bkit:check:dist --ref="$DIST_REF" < /dev/null`; when it is empty run `pnpm bkit:check:dist < /dev/null`. `bkit:lint:workflows` stays. Update the comment above the block to say the dist check judges the commit pushed to `dev`, else to the checked-out branch.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists.
- Line 924: the check-dist test row lists the `--ref` probes.

**Ledger rows:** None

Reuse Inventory rows left out: 0; Architecture entries left out: 4 — read them in docs/plans/202611/1048-pre-push-dist-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

Issue-specific lines:

- Cut the worktree from local `dev` at the commit the orchestrator's message names. Local `dev` is ahead of `origin/dev`. Do not fetch or push.
- Files you may change: `scripts/gate/bkit-check-dist.mjs`, `.husky/pre-push` (only the "bkit repo only" block that runs `pnpm bkit:check:dist`, near line 391, and its comment), `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`, `package.json` only if the script entry must pass an argument through, and a doc line only where a doc states the rule you change (`docs/testing.md`, `docs/deployments.md`).
- Files you must not change: anything under `.bkit/core/engine/commands/`, `.bkit/core/engine/ledgers/`, `.bkit/instructions.md`, every workflow and prompt file, `.bkit/templates/**` (the shipped hook template has no dist check: confirm that, do not add one), `.github/workflows/*`. The build of issue 958 runs beside you and changes the engine command files. If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- The change, as the issue says under "Possible fix": `scripts/gate/bkit-check-dist.mjs` takes an optional commit to read (`--ref=<commit>`); with it, the check compiles that commit's tree and compares it with that commit's `dist/`. With no `--ref` it reads the index, exactly as today, because the pre-commit hook needs that. The pre-push hook passes the commit being pushed to `dev` that it already resolves (`PUSH_DEV_SHA`). Decide from the hook's own code what it does when `PUSH_DEV_SHA` is empty (a push to another branch): keep today's behaviour for that case unless the hook already holds the pushed commit under another name, and say in your report which you did.
- Validate the `--ref` value before it reaches git: accept only what `git rev-parse --verify --end-of-options <value>^{commit}` resolves, and pass the resolved full hash on. A value that starts with `-` must be refused, not read as an option.
- Test first, in a scratch repository the test makes itself, both cases from the issue: (1) the commit has a stale `dist/` and the fix is staged but not committed: with `--ref` of that commit the check fails; (2) the commit is correct and an unrelated engine edit is staged: with `--ref` of that commit the check passes. Reproduce both wrong answers of today's check before you change the code. Add one test that the no-`--ref` call still reads the index.
- Read how `check-dist.integration.test.ts` runs the script today and follow it. A full `tsc` run per test is slow: reuse the file's existing way of keeping that cheap.
- No word-count change is expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
- Removes: say in your final message what this change removes. "Nothing" is an acceptable answer here.
- Test slots: you hold one of three. The build of 958 runs beside you, and one more build may start. A gate that is red only on timeouts, on the `pnpm pack` test in `release-workflow.integration.test.ts` or on "corepack could not fetch pnpm" in `test-file-script.integration.test.ts` is machine load, not your change: change no file, do not let a fix agent re-run the whole gate, answer the pause with Stop (held handover), release the lock, resume so only the gate runs again, and tell the orchestrator. If the run's summary then says FAIL only for that fix round, stop before the Failure Path and message the orchestrator ("A gate re-run after a no-change fix round leaves the summary FAIL", https://github.com/cbartens/bkit/issues/1065).
- After the code group's verify passes, send the orchestrator one line: `Build 1048: group <n> done, <commit>`.


Orchestrator answer on an empty PUSH_DEV_SHA (option B):

- Hook: pass `--ref` with `PUSH_DEV_SHA` when it is set, else `PUSH_BRANCH_SHA` when it is set. When both are empty (a tag push, a delete, a push of a branch that is not checked out) keep today's call with no `--ref`, which reads the index. Never pass an all-zero hash (a deleted ref).
- You may edit `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: change the line-1264 expectation ("a code push still runs them") to the call with `--ref` of the pushed commit, add one dev-push expectation, and add one for the both-empty case if the file has a cheap way to make such a push. Change nothing else in that file. Name these tests in the plan's TEST FIRST so they are planned tests, not side edits.
- Everything else in the brief stands, including the `--ref` validation in the script (`git rev-parse --verify --end-of-options <value>^{commit}`).
