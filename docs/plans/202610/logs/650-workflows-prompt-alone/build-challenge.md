Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

## Findings

Inputs: `build-challenge-1.md` (bugs / edge-cases lens, 11 findings) + `build-challenge-2.md` (security lens, 3 findings) → 12 findings after dedup. No `build-decision-*.md` supplied → nothing dropped. Both reviewers: partial diff coverage (`git diff origin/dev..HEAD` = 195098 lines, Large Diff Guard); `docs/plans/**` run logs, host mirrors, `dist/` and test bodies not reviewed line by line. No embedded directives found in either input.

### 1. HIGH — `pushOwnCommits` plain-pushes `dev` when local `dev` is behind `origin/dev`

- **lens:** bugs / edge cases (`build-challenge-1.md` #1)
- **severity:** HIGH
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/branches.ts:733-756` (`pushOwnCommits`, plain-push branch; condition at `branches.ts:736`)
- **exploit scenario:** local `dev` behind `origin/dev` (someone pushed since last pull — normal on a busy `dev` with red CI). Run's commits are the only ones ahead → `ahead` (`origin/dev..HEAD`) equals `pending` → plain `git push origin dev`. `origin/dev` not an ancestor of local `HEAD` → server rejects non-fast-forward → `EXIT_PUSH_FAILED` → debug Step 11 sub-step 2 routes exit 8 to **Failure Path**. `pushToDev` replay (handles a moved `origin/dev`) never tried → success criterion 1 (fix lands on `dev`) fails in this common case. Untested: `shared-checkout.integration.test.ts` and `docs/testing.md:600` cover only a level or ahead local `dev`. Reconciler spot-check: `branches.ts:736` compares only `ahead` vs `pending`; no ancestry check of `origin/dev` against `HEAD`.
- **suggested fix:** take the plain push only when `git merge-base --is-ancestor origin/dev HEAD` also holds; otherwise, or on a non-fast-forward rejection → fall through to `pushToDev` replay. Push the explicit SHA (`git push origin {lastPending}:refs/heads/dev`), not the branch name, so a commit made between check and push cannot ride along. Add integration row: local `dev` one remote commit behind `origin/dev` → run's commits land via replay.
- **agreement:** 1/2

### 2. MEDIUM — in-place `dev` run resolves the wrong or no shared-checkout record → commits / pushes work it does not own

- **lens:** security (`build-challenge-2.md` #1) + bugs / edge cases (`build-challenge-1.md` #9). Merged: same function `openSharedRecord` (`worktrees.ts:125-145` ⊇ `worktrees.ts:128-134`), same root cause — push / commit / re-trigger resolve the run's record by branch, not FID, and `openSharedRecord`'s busy check is non-atomic and blind to a lock held past `workflow-done`.
- **severity:** MEDIUM (`build-challenge-2.md` MEDIUM, `build-challenge-1.md` LOW → max-wins)
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/worktrees.ts:125-145` (`openSharedRecord`); `.bkit/core/engine/commands/workflow/ledgers.ts:300-310` (`recordOnBranch`); `.bkit/core/engine/commands/workflow/branches.ts:618`; `.bkit/core/engine/commands/workflow/runs.ts:436-441`; `.bkit/core/engine/commands/workflow/steps.ts:431`; `.bkit/core/engine/commands/workflow/workflows.ts:1017`; `.bkit/core/engine/commands/workflow/locks.ts:174`
- **exploit scenario:**
  - Fail-open on null record (`build-challenge-2.md`): every own-path / own-commit guard keys on `recordOnBranch` / `activeRecord` returning non-null; null on `dev` → silent fallback to the pre-#650 path: `git add -A` + commit (`steps.ts:431`, `workflows.ts:1017`), plain `git push origin dev` of all of local `dev` (`branches.ts` after L618), CI re-trigger `git commit --allow-empty` + `pushCurrentBranch` (`runs.ts:441`). Reachable window: debug on `dev` runs `workflows close` (appends `workflow-done` → run folds to `DONE`), then pushes, dispatches, re-triggers and waits for CI with the lock still held. In that window `workflowLockLive` → `liveReason` returns `finished` (`locks.ts:174`) → a second in-place run on `dev` with another FID (`openSharedRecord`) treats the first run's record as left over and deletes it → first run's re-trigger pushes local `dev` wholesale: maintainer's unpushed local commits (WIP, possibly secrets) reach `origin/dev` (public for bkit). Corrupt record (`readRecord` → `parseJson` fails → null) or branch switch (`activeRecord` → null) produce the same fallback.
  - Wrong record (`build-challenge-1.md`): `branches push` and the `runs dispatch` re-trigger are not told the FID → `recordOnBranch` takes the most recently written record on `dev`. `openSharedRecord` checks for a live record, then writes its own, with no lock around the two steps → two debug sessions on one clone passing `worktrees setup` at the same moment both write records. Every `appendRecordCommit` refreshes the file's mtime → run A's `branches push --mode=dev` can pick run B's record → pushes B's commits (or reports "nothing to push") and returns B's SHA as `{DEV_SHA}`.
  - Reconciler spot-check: `runs.ts:436` calls `recordOnBranch(o.cwd, branch)` although `o.fid` is in scope; `openSharedRecord` calls `removeRecord` for any other FID whose `workflowLockLive` is false.
- **suggested fix:**
  1. Bind to FID: pass `--fid` to `branches push` and `runs dispatch`; select the record with `activeRecord(cwd, fid)`, not `recordOnBranch`.
  2. Fail closed on a shared branch: `branches push --mode=dev` refuses with a new exit when the record is null; `ciDispatchGate`'s re-trigger on a shared branch (`byRun`) refuses instead of the `pushCurrentBranch` fallback when `rec === null`; `writeStepRow` / `closeWorkflow` refuse `git add -A` on `dev` / `main` when the status file's FID has no active record.
  3. `openSharedRecord`: treat another FID's record as live while its workflow lock file exists and is younger than `WORKFLOW_LOCK_IDLE_S`, not only while its run is `IN_PROGRESS`; create the record with an exclusive create (`fs.openSync(file, "wx")`, or a lock file in the same git dir) so the busy check and the write happen as one step.
  4. Add `shared-checkout.integration.test.ts` rows: record removed after close → push / re-trigger exit non-zero, foreign local commit not on `origin/dev`; two records on `dev` → each push selects its own FID's record.
- **agreement:** 2/2

### 3. MEDIUM — `runs dispatch` re-trigger head never re-held as `{DEV_SHA}`

- **lens:** bugs / edge cases (`build-challenge-1.md` #2)
- **severity:** MEDIUM
- **class:** mechanical
- **location:** `.bkit/core/workflows/bkit-debug.md:697-710` (Step 11 sub-step 7, `dev` branch); `.bkit/core/engine/commands/workflow/runs.ts:434-449` (`ciDispatchGate` re-trigger); engine hint `.bkit/core/engine/commands/workflow/runs.ts:1401-1404`
- **exploit scenario:** on `dev`, first poll finds no CI run at `{DEV_SHA}` → `runs dispatch` makes a re-trigger commit, pushes it through `pushBranch` (often as a replayed copy with a new SHA), reports the new SHA as `head`. Prose never re-holds it → `runs wait --head="{DEV_SHA}"` and `runs gate --head="{DEV_SHA}"` still target the original SHA, which by definition has no CI run → `result` != `found` → **Failure Path**, after the re-trigger already started a real run. Hand-off path has the same gap: CI wait turn-loop polls `--head="{DEV_SHA}"`, re-run block passes `--sha="{DEV_SHA}"`, while the engine hint (`runs.ts:1401-1404`) says `--head=${r.head}` / `--sha=${r.head}`. Stale `--sha` is also recorded as `ciDispatch.head`.
- **suggested fix:** after `runs dispatch` exits 0 on `dev` → hold printed `head` as `{DEV_SHA}` before `runs wait` / `runs gate`. In the turn-loop and the `{CI_REENTRY}` re-run after a `repoll` phase → use printed `head` too (re-hold `{DEV_SHA}`). Add a `ci-dispatch-gate-alignment` / `workflow-shape` row pinning the re-hold.
- **note:** shares `runs.ts:436-441` with finding 2; distinct root cause (prose holds a stale SHA vs null-record fallback) → kept separate.
- **agreement:** 1/2

### 4. MEDIUM — ledger rows appended before the own-path refusal → documented re-run duplicates `status.jsonl` / `.bkit/stats.jsonl` rows

- **lens:** bugs / edge cases (`build-challenge-1.md` #3 + #4). Merged: same root cause — reviewer names #4 "the same exit-10 ordering gap as finding 3".
- **severity:** MEDIUM
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/steps.ts:410-424` (`writeStepRow`); `.bkit/core/engine/commands/workflow/workflows.ts:898-899,961,1013-1015` (`closeWorkflow`); `.bkit/core/workflows/bkit-debug.md:27` (**Foreign path** rule); fold de-dup `.bkit/core/engine/ledgers/status.ts:52-55`
- **exploit scenario:**
  - `steps finish`: `step-done` row appended to `status.jsonl` first (`steps.ts:410`) → `ownPathCommit` throws `EXIT_FOREIGN_PATH` → exit 10, row left uncommitted. Workflow: human commits or reverts the file, "then re-run the block" → second `step-done` row for the same step. Fold de-dups on `(workflow, step, parentSha, at)`; `at` always differs → both rows count. Step 8: `--count-field=soakAttempt=debug-failure-soak:next:...` counts the orphan row → `soakAttempt` skips a number → soak cap reached one attempt early. Other steps: duplicate rows in the compliance grade and the run report.
  - `workflows close`: `closeWorkflow` appends `workflow-done` to `status.jsonl` and counter + `outcome` rows to `.bkit/stats.jsonl`, only then `ownPathCommit` throws `EXIT_FOREIGN_PATH` → documented recovery ("re-run the block") → second `workflow-done` row + second telemetry pair → debug-run counts and outcome baselines in `.bkit/stats.jsonl` double-counted for that run; fold sees two closes.
- **suggested fix:** in an in-place run, call `ownSet` (throws `EXIT_FOREIGN_PATH`) before any append → refused commit writes nothing, "re-run the block" stays exactly-once: `writeStepRow` → `ownSet(cwd, rec)` before `fs.appendFileSync`; `closeWorkflow` → when `activeRecord` is non-null, `ownSet(where.tree, rec)` before any append. Update the `EXIT_FOREIGN_PATH` exit-code text ("the row was written but…") to match. Add rows: `steps.test.ts` — refused commit leaves `status.jsonl` unchanged; `workflows.test.ts` — exit 10 leaves `status.jsonl` and `.bkit/stats.jsonl` byte-identical.
- **note:** adjacent `steps.ts:431` / `workflows.ts:1017` belong to finding 2 (null-record fallback); distinct root cause → kept separate.
- **agreement:** 1/2

### 5. MEDIUM — `fidProblem` never compares `--issue` against the FID's embedded id

- **lens:** bugs / edge cases (`build-challenge-1.md` #7)
- **severity:** MEDIUM
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/fids.ts:58-75` (`fidProblem`, non-empty `issue` branch) vs `.bkit/core/.bkit/workflows.md:152`; `prMarker` `.bkit/core/engine/commands/workflow/prs.ts:175-185`
- **exploit scenario:** doc says with `--issue` set "the FID's embedded id must match it"; Gate 1 ticks "FID shape" on that basis. Code checks only that the issue id has the tracker's id shape and the FID has the tracker's FID shape; never compares the two → `fids check --fid=123-foo --issue=456` and `steps gate --fid=123-foo --issue=456` both exit 0. Real path: prompt names `#456`, session on `feat/123-foo`, Step 1 sub-step 4.2 takes the FID from the branch → run labels and comments on #456, logs under `123-foo`. `prs open` writes `<!-- bkit:issue=#456 bkit:fid=123-foo -->`, whose halves name different issues: `fromMarker` returns 456, `fromBranch` returns 123. `prMarker` has the same gap.
- **suggested fix:** in `fidProblem`, when `issue` is non-empty and `tracker` != `any` → require `issueIdOf(fid, tracker) === issue` (strip `#` first; compare linear / jira uppercased); name both ids in the problem text. Add `fids.test.ts` / `steps.test.ts` / `prs.test.ts` rows for a mismatched pair.
- **agreement:** 1/2

### 6. MEDIUM — issue-less run on a hand-named `feat/` branch with an all-digit word → Failure Path

- **lens:** bugs / edge cases (`build-challenge-1.md` #5)
- **severity:** MEDIUM
- **class:** architectural
- **location:** `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` Step 1 sub-step 2 (e.g. `.bkit/core/workflows/bkit-debug.md:115`) and sub-step 4.2; `.bkit/core/engine/commands/workflow/fids.ts:202-215` (`fromBranch`)
- **exploit scenario:** no issue in the prompt, github tracker, session on a hand-named feature branch with an all-digit word that is not a leading issue id (`feat/upgrade-react-19`, `feat/node-22-fix`). Sub-step 2 runs `fids parse --branch=feat/upgrade-react-19` → `fromBranch` finds no issue id, `ISSUE_LESS_FID` rejects the `19` word → exit 3 (`EXIT_NO_FID`). Prose gives that exit no `Route:` → header **Commands** rule → **Failure Path**. Even if read as "no issue", sub-step 4.2 takes FID `upgrade-react-19` from the branch → `fids check --issue=""` rejects it; no re-mint here (re-mint covers only sub-step 4.4) → **Failure Path**. Success criterion 2 ("no issue → warning → run continues") fails for every branch name of this kind; uppercase or underscore names (`feat/Fix_CI`) fail the same way.
- **suggested fix:** needs a rule for issue-less runs on a `feat/` branch whose suffix is not an issue-less FID. Either mint a FID that differs from the branch and state how `worktrees setup` then adopts the branch instead of looking for `feat/{FID}`, or relax the issue-less rule for FIDs taken verbatim from an existing branch. Either way → add an explicit `Route:` for `fids parse` exit 3 → issue-less; cover it in `workflow-shape.test.ts`.
- **agreement:** 1/2

### 7. MEDIUM — issue-less mint reuses one FID across unrelated incidents → later runs start in SOAK mode

- **lens:** bugs / edge cases (`build-challenge-1.md` #6)
- **severity:** MEDIUM
- **class:** architectural
- **location:** `.bkit/core/.bkit/workflows.md:1373` / `.bkit/wording.md:1040` (issue-less mint `{branch-suffix}-{slug}`) with `.bkit/core/.bkit/workflows.md:398,920` (`DEBUG_ATTEMPT` = all-runs index)
- **exploit scenario:** headline use `/bkit-debug ci failures on dev` on `dev` mints `dev-ci-failures` every time, including for unrelated incidents on different days. Month bucket = "the feature's existing bucket" → the FID's `status.jsonl` keeps collecting runs across months → `counters run` counts every earlier debug run of that FID. Once `MAX_DEBUG_ATTEMPT` unrelated incidents used the same wording → every later run starts in SOAK mode (`counters route` exit 1) with no history of its own. Same FID also shares `debug-summary.md`, its `.bkit/issues.jsonl` roadmap rows and its log folder across unrelated incidents. § Best-effort runs documents only the opposite case (a reworded prompt restarts the counter).
- **suggested fix:** needs a mint-rule decision. When a _minted_ (not prompt-named) issue-less FID already has a log folder whose last run is not `IN_PROGRESS` → mint a distinct FID. Options: a disambiguator that is not all digits (`dev-ci-failures-b`) or a letter-prefixed date word (`d1022`); `ISSUE_LESS_FID` accepts both. Keep naming the FID in the prompt as the only way to continue an earlier run. Document in § Best-effort runs; add a mint test.
- **agreement:** 1/2

### 8. LOW — design / plan `branches land` MCP merge fallback merges without asserting base `dev`

- **lens:** security (`build-challenge-2.md` #2)
- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/workflows/bkit-design.md:556`; `.bkit/core/workflows/bkit-plan.md:515`
- **exploit scenario:** engine base guard (`prs.ts:428`, exit 8) runs only on the `gh` path. `gh` unavailable (exit 80 at `stage` = merge) → agent calls `merge_pull_request` directly with no base check. Ship Step 10 has the matching prose assert (`bkit-ship.md:535`: `pull_request_read` → assert `base.ref` = `dev`); design / plan do not. A write collaborator (or a prompt-injected agent) retargets the land PR to `main` between `open` and `merge` → merged into `main` on runtimes without `gh` (cloud agents); consumer repos without `bkit setup protect-main` have no server-side backstop. Breaks the plan's "bkit merges into `dev` only" contract on a surface the plan flagged (`Suggested Scope Expansion` row 1, "Fold in").
- **suggested fix:** mirror ship's assert at both sites: before `merge_pull_request` → `pull_request_read` (`get`), assert `base.ref` = `dev`, else **Failure Path** with nothing merged. Add a `workflow-shape.test.ts` row pinning the assert on every `stage` = merge MCP fallback.
- **agreement:** 1/2

### 9. LOW — `prs open` `main` guard compares a literal string; `prs merge` base check is check-then-act

- **lens:** security (`build-challenge-2.md` #3)
- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/prs.ts:242`; `.bkit/core/engine/commands/workflow/prs.ts:428`
- **exploit scenario:** `openPrFor` refuses only `base === "main"`; `refFlag` does not normalise → `--base=refs/heads/main` (or another spelling `gh pr create` resolves to `main`) skips `EXIT_BASE_MAIN` and reaches `gh pr create`; read-back exits 6 (`EXIT_WRONG_BASE`) only after the PR exists. Unverified whether GitHub accepts the `refs/heads/` form; merge guard backstops it → impact is a stray PR into `main`, not a merge. Separately, `mergePr` reads `baseRefName` via `pr view`, then runs `gh pr merge`; `--match-head-commit` binds the head, not the base → a retarget between the two calls is not caught (milliseconds window, collaborator-only).
- **suggested fix:** normalise `base` before the compare (strip leading `refs/heads/` and `origin/`) or refuse any `--base` containing `/` that resolves to `main`; add a `prs.test.ts` row for `--base=refs/heads/main`. For the merge → re-read `baseRefName` after `gh pr merge` succeeds; exit non-zero with a loud integrity failure if the merged base is not `dev`, so a raced retarget is at least detected.
- **agreement:** 1/2

### 10. LOW — `runs dispatch --sha` accepts a short SHA that never matches GitHub's full `headSha`

- **lens:** bugs / edge cases (`build-challenge-1.md` #8)
- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/runs.ts:1283-1284` (`runDispatch --sha`) with `.bkit/core/engine/commands/workflow/runs.ts:164`
- **exploit scenario:** `--sha` accepts 7 to 40 hex digits; run lookup compares `r.headSha === target.head` exactly against GitHub's 40-character `headSha`. Short SHA (hand re-run, or an agent abbreviating `{DEV_SHA}`) never matches → poll times out → needless re-trigger commit pushed to `dev` → gate times out again → **Failure Path**.
- **suggested fix:** resolve `--sha` to the full SHA (`git rev-parse --verify {sha}^{commit}` after `fetchLanded`), or require exactly 40 hex digits; use the full SHA as `landed`.
- **agreement:** 1/2

### 11. LOW — `ownSet` ledger prefix hash skips the path's clean / eol filters

- **lens:** bugs / edge cases (`build-challenge-1.md` #10)
- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/ledgers.ts:408-416` (`ownSet` ledger prefix hash) vs `.bkit/core/engine/commands/workflow/ledgers.ts:327-334` (`hashOf`)
- **exploit scenario:** recorded hash comes from `git hash-object -- {rel}` (applies the path's clean / eol filters); prefix hash is `git hash-object --stdin` with no path (no filters). Clone with `core.autocrlf=true`, or a `.gitattributes` clean filter on `*.jsonl` → the two hashes never match for a ledger dirty before the run → every append the run makes to that ledger refused with `EXIT_FOREIGN_PATH`, though only the run added rows.
- **suggested fix:** hash the prefix with `hash-object --stdin --path={rel}` (or `--no-filters` on both sides); add a unit row with an eol attribute.
- **agreement:** 1/2

### 12. LOW — `commitOwnSet` leaves a user-staged ledger's stale blob in the real index → next plain commit deletes the run's rows

- **lens:** bugs / edge cases (`build-challenge-1.md` #11)
- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/ledgers.ts:505-513` (`commitOwnSet`, temp-index branch, real-index resync)
- **exploit scenario:** recorded ledger the user staged before the run (e.g. `docs/failures.jsonl` with their own rows `git add`-ed) is in `stagedBefore` → post-commit `git reset` skips it → real index keeps the user's blob (old HEAD + user's rows), lacking the run's rows the new HEAD holds → user's next plain `git commit` silently deletes the run's committed ledger rows.
- **suggested fix:** for a staged recorded ledger, rebuild the real index entry as new HEAD blob + the user's staged rows (same row diff the commit uses), or refuse with `EXIT_FOREIGN_PATH` and name the staged ledger.
- **agreement:** 1/2
