Verdict: FAIL

<!-- verdict:end -->

# Design Spike

## Claims

Claims are ordered by blast radius: the owner's local `dev` ref and main checkout first, then the landing lock, then the pre-land checks, then batch-push support. The claim ID matches the probe file prefix in `spike/`. Each claim restates one item of the review's `PoC Approach` or `Unknowns & Blockers` (cited in brackets).

<!-- prettier-ignore -->
| ID | Claim a probe could disprove | Design element that rests on it | Result |
| --- | --- | --- | --- |
| C1 | `git update-ref refs/heads/dev NEW DEV_AT` refuses when `dev` moved off `DEV_AT`, and leaves `dev` on the hand commit. [PoC 4] | `advanceLocalDev` compare-and-swap and its `moved` outcome; Decisions row "Advance local `dev` by compare-and-swap from `DEV_AT`". | SETTLED |
| C2 | `git update-ref` moves a `dev` checked out in another linked worktree without refusing, and `git worktree list --porcelain` names that worktree. [PoC 5, second half] | `advanceLocalDev`'s explicit "`dev` checked out in another linked worktree → stop" check; Decisions row D-AS3 and the matching Trade-off. | SETTLED |
| C3 | With the main checkout on `dev` at `DEV_AT`, `git merge --ff-only NEW` refuses when an uncommitted, staged or untracked file sits on a path `NEW` changes, names the path, and leaves `dev` and the file untouched; an edit on an unrelated path does not block it and survives. [PoC 5, first half] | `advanceLocalDev` main-checkout branch and its `blocked` outcome; Key Edge Case 1 ("the run stops before `dev` moves and names the paths"). | SETTLED |
| C5 | A hand commit on `dev` between the `HEAD` = `DEV_AT` assertion and `git merge --ff-only NEW` makes git refuse the merge, so an unchecked combination cannot land. [Review OPTIONAL 2] | `advanceLocalDev` main-checkout branch; Key Edge Case "The owner commits on `dev` by hand while a landing is in flight". | SETTLED |
| C4 | An ff-only advance in the main checkout fires consumer hooks by default, and the engine's `withoutHooks` override (`core.hooksPath=/dev/null` through `GIT_CONFIG_*`) stops all of them. [Unknown 3] | Where the advance runs (inside or outside `withoutHooks`); review CRITICAL 2 and OPTIONAL 2. | SETTLED |
| C14 | A branch cut from `refs/heads/dev` holds feature A's landing both when `dev` is only ahead of `origin/dev` and when the two have split, and `git rev-list --left-right --count dev...origin/dev` gives the ahead and behind counts. [PoC 2] | Start base (component 4) and Step 1's ahead / behind line; Success criterion 2. | SETTLED |
| C8 | The existing `acquirePublicationLock` liveness check reclaims a dead holder whose PID now belongs to another live process (start time differs). [PoC 6, Unknown 1] | Component 7: "Liveness is the existing host + PID + start-time check … a dead holder is reclaimed at once". | DISPROVEN |
| C10 | When `acquirePublicationLock` does not acquire, the cause is a timeout behind a live holder the run can name. [Unknown 1] | Component 7: "fails closed (the run stops with the holder named)"; Local landing flow step 1. | DISPROVEN |
| C7 | A holder killed with SIGKILL is reclaimed at once by the existing `acquirePublicationLock`. [PoC 6] | Component 7: "the holder is the `bkit` process doing the landing, so a dead holder is reclaimed at once". | SETTLED |
| C9 | A second landing waits on a live same-host holder and takes the lock once the holder releases it. [PoC 3] | Component 7 and Settled Q7 ("the second waits on the landing lock, then builds its commit on top of the first"). | SETTLED |
| C13 | A non-zero exit from `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit` means the checks are red. [Unknown 5] | Local landing flow step 4: "Red → stop, nothing moved, route to `/bkit-debug`". | DISPROVEN |
| C11 | One local landing on bkit's own repo holds the landing lock (scratch worktree, frozen install, changed-files checks) well under the proposed `TIMEOUTS.LAND_LOCK_WAIT` of 15 minutes. [PoC 8, Unknown 2] | `TIMEOUTS.LAND_LOCK_WAIT` (Data Model) and the "Lock wait value" risk. | DISPROVEN |
| C12 | The shipped copy-and-own `pre-push`, run by a real `git push origin dev`, refuses a batch that carries code and ends on a `[skip ci]` design close, and lets a batch that ends on the ship landing commit past its CI-suppressor guard. [PoC 7] | Success criterion 4; Reuse row "`[skip ci]` tail refusal on batch push" (USE-AS-IS); Decisions row "Ship local close = ONE commit … no skip token". | SETTLED |
| C6 | `git push . HEAD:dev` into a main checkout on `dev` is refused when the checkout has any uncommitted edit, even on an unrelated path, under `receive.denyCurrentBranch=updateInstead`, and is refused as "branch is currently checked out" without it. | The rejection of "Local `dev` as the push remote" (Decisions row 1, Approaches row 4). | SETTLED |
| C15 | #849's landed `syncLocalDev` result type, `occupied` / `edited-files` detection and `localDev` line can carry the strict advance as a sibling export. [Unknown 4, review CRITICAL 1] | `advanceLocalDev` placement and reporting (review CRITICAL 1 and 2). | BLOCKED |

## Method

All probes live in `docs/plans/202611/logs/924-every-workflow-land/spike/`. Every scratch git repo was created under the session scratchpad with `mktemp -d` and deleted by the probe. Shell probes ran with `sh` (git 2.56.0); TypeScript probes ran with Node v24.16.0 as `node --import tsx <file>` from the worktree root, importing the real engine source (`.bkit/core/engine/commands/workflow/locks.ts`), no stubs. `TMPDIR` was the session scratchpad for every run.

- **C1:** `c1-cas-update-ref.sh`. A bare origin and a main clone; `dev` moved by a hand commit after `DEV_AT` was read; then `git update-ref refs/heads/dev NEW DEV_AT`, then again with the hand commit as the old value. Command: `sh c1-cas-update-ref.sh`.
- **C2:** `c2-update-ref-other-worktree.sh`. `dev` checked out in a linked worktree; `git worktree list --porcelain`; `git update-ref refs/heads/dev NEW DEV_AT`; `git status --short` in that worktree; for contrast `git fetch . NEW:refs/heads/dev`. Command: `sh c2-update-ref-other-worktree.sh`.
- **C3:** `c3-ffonly-dirty.sh`. Four fresh repos, main checkout on `dev`, a landing commit built in a detached scratch worktree; `git merge --ff-only NEW` with (A) an unstaged edit on the landed path, (B) an edit on an unrelated path, (C) an untracked file at a path the landing adds, (D) a staged edit on the landed path. Command: `sh c3-ffonly-dirty.sh`.
- **C5:** `c5-ffonly-hand-commit-race.sh`. Assert `HEAD` = `DEV_AT`, commit by hand on `dev`, then `git merge --ff-only NEW`. Command: `sh c5-ffonly-hand-commit-race.sh`.
- **C4:** `c4-ffonly-hooks.sh`. `post-merge`, `post-checkout`, `reference-transaction` and `post-rewrite` hooks that append to a log; `git merge --ff-only NEW` once plain and once with `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null`, the exact entry `withoutHooks` (`land.ts:104`) adds. Command: `sh c4-ffonly-hooks.sh`.
- **C14:** `c14-start-base-split.sh`. Land A on local `dev`; cut `feat/B1` from `refs/heads/dev`; push another clone's commit to origin; fetch; cut `feat/B2`; print `rev-list --left-right --count` both times. Command: `sh c14-start-base-split.sh`.
- **C8:** `c8-lock-pid-reuse.ts`. Writes the lock file a crashed holder leaves, with `owner.pid` set to a live `sleep 60` process and a start time that does not match it (the PID-reuse state), then calls the real `acquirePublicationLock` twice with `timeoutMs: 10_000`. Command: `node --import tsx docs/plans/202611/logs/924-every-workflow-land/spike/c8-lock-pid-reuse.ts`.
- **C10:** `c10-lock-null-outcomes.ts`. The real `acquirePublicationLock` (`timeoutMs: 10_000`) against (a) a truncated holder file, (b) a holder on another host, (c) no holder at all with `PATH` holding only a `git` symlink (a host without `ps`, such as a slim container image). Command: `node --import tsx docs/plans/202611/logs/924-every-workflow-land/spike/c10-lock-null-outcomes.ts`.
- **C7:** `c7-lock-dead-holder.ts` plus `lock-holder.ts`. A child process takes the real lock and holds it; the probe sends SIGKILL, confirms `ESRCH`, then calls `acquirePublicationLock`. Command: `node --import tsx docs/plans/202611/logs/924-every-workflow-land/spike/c7-lock-dead-holder.ts`.
- **C9:** `c9-lock-wait.ts` plus `lock-holder.ts`. A child holds the real lock for 3 s while the probe waits up to 10 s; then a child holds it for 40 s while the probe asks for 45 s. Command: `node --import tsx docs/plans/202611/logs/924-every-workflow-land/spike/c9-lock-wait.ts`.
- **C13:** `c13-tests-changed-lock-exit.sh`. Ran the real `node dist/cli.js tests changed --base=HEAD~1 --fallback=bkit:gate:static-unit --lock-wait-s=3` in this worktree while another bkit run on this machine (the `911-ship-failed-merge` worktree) held the machine-wide `tests` lock. The contention was real, not staged. Command: `sh docs/plans/202611/logs/924-every-workflow-land/spike/c13-tests-changed-lock-exit.sh`. Side effect outside the spike directory: the CLI appended one `engine-call` row (`"noun":"tests","verb":"changed"`, `at` `2026-11-13T06:04:01Z`) to the tracked `docs/plans/202611/logs/924-every-workflow-land/status.jsonl` (line 37). Removing it was refused by the session's permission check, so the row is still there.
- **C11:** `c11-landing-hold-time.sh`. Replays a real squash landing from `dev` (`2d3c9cc37`, `feat(918-ad-hoc-agent)`, 101 files) as the landing would: `git worktree add --detach spike/land-tree DEV_AT` (its parent), cherry-pick as the caller's build, `pnpm install --frozen-lockfile` (what `prepareLandInputs` runs when `bkit.workflows.worktree.install` is `true`, as it is in bkit's `package.json`), then `node dist/cli.js tests changed --base=DEV_AT --fallback=bkit:gate:static-unit --lock-wait-s=1800`, with wall-clock timings per phase; the worktree is removed at the end. Command: `sh docs/plans/202611/logs/924-every-workflow-land/spike/c11-landing-hold-time.sh`. It ran twice. Run 1 inherited `TMPDIR` = the session scratchpad, whose long path broke tsx's IPC socket inside many integration tests (`listen EINVAL`, the error the lock probes first hit), so run 1's test verdict is a probe artefact and only its timings are used. Run 2 ran with `env -u TMPDIR`. Other bkit runs on this machine held the machine-wide `tests` lock during both runs; the contention was real, not staged.
- **C12:** `c12-prepush-batch-shape.sh`. A scratch consumer with a bare origin, `.bkit/templates/.husky/pre-push` copied to `.git/hooks/pre-push`, and a `package.json` script `bkit` = `node <worktree>/dist/cli.js` so the hook's `pnpm -s bkit` calls resolve to the real CLI. Shape 1: `feat(924-a)` code, then `docs(924-b): design DONE bkit [skip ci]`; shape 2: the same plus `feat(924-b)` code last. Each pushed with a real `git push origin dev`. Command: `sh docs/plans/202611/logs/924-every-workflow-land/spike/c12-prepush-batch-shape.sh`.
- **C6:** `c6-push-dot-update-instead.sh`. An unrelated uncommitted edit in a main checkout on `dev`; `git push <main> HEAD:dev` from a detached scratch worktree, first with the default `receive.denyCurrentBranch`, then with `updateInstead`. Command: `sh c6-push-dot-update-instead.sh`.
- **C15:** no probe. `.bkit/core/engine/commands/workflow/local-dev.ts` does not exist in this worktree (`ls` → `No such file or directory`), because #849 is not built.

## Evidence

Captured output, word for word. Scratchpad path prefixes are shortened to `$T` only where the probe printed a long `mktemp` path; nothing else is edited.

**C1** (`sh c1-cas-update-ref.sh`, script exit 0):

```text
DEV_AT=9d8aa49ad3d5c735dec33919067b3e7b807d96d6 NEW=5c92f7d9969a37c66bb95f7e64f5678bd718ffc0 HAND=3a0b7ae76bc7b77b21fcc20b2c0494a7a2588bef
fatal: update_ref failed for ref 'refs/heads/dev': cannot lock ref 'refs/heads/dev': is at 3a0b7ae76bc7b77b21fcc20b2c0494a7a2588bef but expected 9d8aa49ad3d5c735dec33919067b3e7b807d96d6
update-ref (dev moved) exit=128
dev now=3a0b7ae76bc7b77b21fcc20b2c0494a7a2588bef (HAND kept: yes)
update-ref (old matches) exit=0
dev now=5c92f7d9969a37c66bb95f7e64f5678bd718ffc0 (= NEW: yes)
```

**C2** (`sh c2-update-ref-other-worktree.sh`, script exit 0):

```text
--- worktree list --porcelain
worktree $T/main
HEAD a9123048447c8ca325ed603fa2d61c023110f6fb
branch refs/heads/side

worktree $T/other
HEAD bf7570867a51e05be186ff0bc9b5a91620e2810e
branch refs/heads/dev

update-ref (dev checked out in other worktree) exit=0
dev now=a9123048447c8ca325ed603fa2d61c023110f6fb (= NEW: yes)
--- status in the other worktree after the move
D  g
--- for contrast: git fetch . NEW:refs/heads/dev from main checkout (reset dev first)
fatal: refusing to fetch into branch 'refs/heads/dev' checked out at '$T/other'
fetch . exit=128
```

**C3** (`sh c3-ffonly-dirty.sh`, script exit 0):

```text
case A: uncommitted edit on a path the landing changes
error: Your local changes to the following files would be overwritten by merge:
	landed.txt
Please commit your changes or stash them before you merge.
Aborting
Updating 77cb8da..01996b5
merge --ff-only exit=1
dev = DEV_AT: yes
landed.txt:
a
owner-edit
case B: uncommitted edit on an unrelated path
Updating c71393f..db0ac9f
Fast-forward
 added.txt  | 1 +
 landed.txt | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 added.txt
merge --ff-only exit=0
dev = NEW: yes
unrelated.txt:
u
owner-edit
status:
 M unrelated.txt
case C: untracked file in the main checkout at a path the landing adds
error: The following untracked working tree files would be overwritten by merge:
	added.txt
Please move or remove them before you merge.
Aborting
Updating c71393f..214590c
merge --ff-only exit=1
dev = DEV_AT: yes
added.txt:
owner-untracked
case D: staged (index-only) edit on a path the landing changes
error: Your local changes to the following files would be overwritten by merge:
	landed.txt
Please commit your changes or stash them before you merge.
Aborting
Updating d77774b..604d70b
merge --ff-only exit=1
dev = DEV_AT: yes
index landed.txt:
a
staged-edit
```

**C5** (`sh c5-ffonly-hand-commit-race.sh`, script exit 0):

```text
assert HEAD = DEV_AT: ok
hint: Diverging branches can't be fast-forwarded, you need to either:
hint:
hint: 	git merge --no-ff
hint:
hint: or:
hint:
hint: 	git rebase
hint:
hint: Disable this message with "git config set advice.diverging false"
fatal: Not possible to fast-forward, aborting.
merge --ff-only exit=128
dev = HAND: yes
```

**C4** (`sh c4-ffonly-hooks.sh`, script exit 0):

```text
[default] merge --ff-only exit=0
[default] hooks fired during the advance:
  HOOK FIRED: reference-transaction preparing
  HOOK FIRED: reference-transaction prepared
  HOOK FIRED: reference-transaction committed
  HOOK FIRED: reference-transaction preparing
  HOOK FIRED: reference-transaction prepared
  HOOK FIRED: reference-transaction committed
  HOOK FIRED: post-merge 0
  HOOK FIRED: reference-transaction preparing
  HOOK FIRED: reference-transaction aborted
  HOOK FIRED: reference-transaction prepared
  HOOK FIRED: reference-transaction committed
[withoutHooks] merge --ff-only exit=0
[withoutHooks] hooks fired during the advance:
  (none)
```

**C14** (`sh c14-start-base-split.sh`, script exit 0):

```text
only ahead: ahead/behind = 1	0
  B1 has a.txt: yes
split: ahead/behind = 1	1
  B2 has a.txt: yes; B2 has o.txt: no
```

**C8** (`node --import tsx …/c8-lock-pid-reuse.ts`, exit 0):

```text
lock file owner.pid=86636 recorded startTime="Mon Jan  1 00:00:00 2024" live ps lstart="Fri Nov 13 16:03:01 2026"
acquire with PID-reused holder: null in 48 ms; lock file still present: true
second attempt: null in 46 ms
```

**C10** (`node --import tsx …/c10-lock-null-outcomes.ts`, exit 0):

```text
[truncated holder file] null in 42 ms (asked 10000 ms); lock file present after: true
[holder on another host] null in 32 ms (asked 10000 ms); lock file present after: true
[no ps] PATH=$T/c10-path-Lsqu2V (contains only git)
[no holder, ps not on PATH] null in 33 ms (asked 10000 ms); lock file present after: false
```

**C7** (`node --import tsx …/c7-lock-dead-holder.ts`, exit 0):

```text
child: HELD $T/c7-K4XJvR/.git/bkit-outbox/publication-locks/63609eefccf6d2ccc2258cc5898759eaf2c0142e08570d9a071b54c74aca886b.lock pid=82921
lock file owner.pid=82921
holder alive after SIGKILL: false; lock file still present: true
acquire after SIGKILL: acquired (owner.pid=80320 = me true) in 30 ms
```

**C9** (`node --import tsx …/c9-lock-wait.ts`, exit 0):

```text
[release-then-acquire] holder holds 3000 ms, caller asks 10000 ms: acquired after 3025 ms; holder said: HELD <lock> pid=90486 | RELEASED true
[long-wait-request] holder holds 40000 ms, caller asks 45000 ms: null after 30001 ms; holder said: HELD <lock> pid=1327
```

**C13** (`sh c13-tests-changed-lock-exit.sh`; the 16-file list is cut to its first and last entry, and the stderr tail to its last 4 lines, dropping the file-list echo and the `> pnpm` script banner; every other line as printed):

```text
--- tests-lock holder before the run
bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge (pid 60558, since 15:59:39)
holder exit=0
--- node dist/cli.js tests changed --base=HEAD~1 --fallback=bkit:gate:static-unit --lock-wait-s=3
exit=81
--- stdout
files:
  - docs/plans/202611/logs/924-every-workflow-land/design-review-1.md
  - docs/plans/202611/logs/924-every-workflow-land/status.jsonl
gate: bkit:gate:changed
scope: pnpm bkit:gate:changed
exitCode: 75
verdict: null
lockHolder: bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge (pid 60558, since 15:59:39), no earlier run
--- stderr (last 8 lines)
[bkit-tests] [machine-lock] ⏳ bkit tests changed bkit:gate:changed is waiting for tests (up to 3s): in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge (pid 60558, since 15:59:39), no earlier run
[bkit-tests] [machine-lock] ❌ bkit tests changed bkit:gate:changed gave up after 3s waiting for tests, in use by bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge (pid 60558, since 15:59:39), no earlier run
[bkit-tests] [machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.
[bkit-tests]  ELIFECYCLE  Command failed with exit code 75.
```

**C11, run 1** (`sh c11-landing-hold-time.sh`, script exit 0; the long file lists in the gate-stage lines are left out, every other line as printed):

```text
NEW=2d3c9cc3771a2b3a7829d526832c89d02b94305a DEV_AT=7ae1a3e8b0ae761c2388a049666d721cefb19342 files=101
worktree add exit=0
cherry-pick (the caller's build) exit=0
pnpm install --frozen-lockfile exit=0
tests lock holder at gate start:
bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/911-ship-failed-merge (pid 60558, since 15:59:39)
bkit tests changed exit=1
--- gate stdout
files:
gate: bkit:gate:changed
scope: pnpm bkit:gate:changed
exitCode: 1
verdict: FAIL
lockHolder: null
[bkit-tests] [bkit:gate:changed] types: pnpm typecheck
[bkit-tests] [bkit:gate:changed] failed: related, named
--- timings (s): setup+build=3 install=2 checks=1408 total=1413
worktree remove exit=0
```

From run 1's gate log: the last lock-wait line reads `still, 11 min so far`, so the `tests` lock wait was 11-12 minutes. The two vitest stages report `Duration  304.60s (tests 98%, import 2%)` and `Duration  374.59s (tests 98%, import 1%, setup 1%)`, so the checks themselves took about 688-748 s (11.5-12.5 minutes) of the 1408 s.

**C11, run 2** (`env -u TMPDIR sh c11-landing-hold-time.sh`, script exit 0; lock-wait lines cut at 260 characters by the probe's reader):

```text
TMPDIR=unset
NEW=2d3c9cc3771a2b3a7829d526832c89d02b94305a DEV_AT=7ae1a3e8b0ae761c2388a049666d721cefb19342 files=101
worktree add exit=0
cherry-pick (the caller's build) exit=0
pnpm install --frozen-lockfile exit=0
tests lock holder at gate start:
vitest .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/repo/package-json.test.ts .bkit/core/engine/audits/repo/test-file-script.integration.test.ts .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts .bkit/core/e
bkit tests changed exit=81
--- gate stdout
files:
gate: bkit:gate:changed
scope: pnpm bkit:gate:changed
exitCode: 75
verdict: null
lockHolder: bkit tests changed bkit:gate:changed — /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never (pid 2358, since 16:53:42), last run took 6m48s
--- lock-wait lines from stderr
[bkit-tests] [machine-lock] ⏳ bkit tests changed bkit:gate:changed is waiting for tests (up to 1800s): in use by vitest .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/repo/package-json.test.ts .bkit/core/engine/audits/repo/t
[bkit-tests] [machine-lock] ⏳ bkit tests changed bkit:gate:changed is waiting for tests (still, 1 min so far) (up to 1800s): in use by vitest .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/repo/package-json.test.ts .bkit/cor
[bkit-tests] [machine-lock] ⏳ bkit tests changed bkit:gate:changed is waiting for tests (still, 2 min so far) (up to 1800s): in use by bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests — /Users/christian/Documents/GitHub
[bkit-tests] [machine-lock] ⏳ bkit tests changed bkit:gate:changed is waiting for tests (still, 3 min so far) (up to 1800s): in use by bkit tests run bkit:gate:static-unit-integration 915-min-push-ignores build-run-tests — /Users/christian/Documents/GitHub
--- gate stage lines
--- timings (s): setup+build=3 install=4 checks=1802 total=1809
worktree remove exit=0
```

Run 2's gate log holds 31 lock-wait lines, the last reading `still, 29 min so far`; the `tests` lock passed between three other runs (a bare `vitest`, `915-min-push-ignores`, `929-hung-test-never`), and the landing's checks never started.

**C12** (`sh c12-prepush-batch-shape.sh`, script exit 0):

```text
=== shape 1: code, then a design close with [skip ci] last
  72d2023 docs(924-b): design DONE bkit [skip ci]
  8eb5b65 feat(924-a): add feature a
git push exit=1
  [pre-push] log: tmp/pre-push.log
  [pre-push] BLOCKED: 72d202370609a816cf090e772b46282c8d208564 carries a CI-suppressing token and changes files outside the min-push paths (what bkit writes, plus bkit.testing.minPushPaths) — that code would land on dev / main with no CI run.
  [pre-push] Add a clean trigger commit and re-push:  git commit --allow-empty -m "chore: trigger CI" && git push
  [pre-push] log: tmp/pre-push.log (exit 1)
origin/dev moved: no
=== shape 2: same batch, ship landing commit (no token) last
  2219be8 feat(924-b): add feature b
  72d2023 docs(924-b): design DONE bkit [skip ci]
  8eb5b65 feat(924-a): add feature a
git push exit=1
  BLOCKED lines: 0
  first 12 lines of hook output:
  [pre-push] log: tmp/pre-push.log
  [bkit-ci] push is not covered by minimum paths or verified full-gate proof
  
  > c12@ bkit $T/main
  > node /Users/christian/Documents/GitHub/bkit/.worktrees/924-every-workflow-land/dist/cli.js check
  
  [bkit-check] Running in check (dry-run) mode
  [bkit-check] [dry-run] Running core payload pass
  [bkit-check] [dry-run] core: .agents/context.md
  [bkit-check] [dry-run] core: .agents/docs.md
  [bkit-check] [dry-run] core: .agents/rules.md
  [bkit-check] [dry-run] core: .agents/skills.md
```

Shape 2's push exit 1 comes from the hook's next stage, `pnpm bkit check`, which fails because the scratch consumer has no bkit install; the CI-suppressor guard printed no `BLOCKED` line and let the push through to that stage. The claim covers only the guard.

**C6** (`sh c6-push-dot-update-instead.sh`, script exit 0):

```text
case A: default receive.denyCurrentBranch, dirty unrelated file
remote: error: refusing to update checked out branch: refs/heads/dev
 ! [remote rejected] HEAD -> dev (branch is currently checked out)
error: failed to push some refs to '$T/main'
push exit=1
case B: receive.denyCurrentBranch=updateInstead, dirty unrelated file
 ! [remote rejected] HEAD -> dev (Working directory has unstaged changes)
error: failed to push some refs to '$T/main'
push exit=1
dev = DEV_AT: yes
```

Case A also printed git's 12-line `remote:` explanation of `receive.denyCurrentBranch` between the first `remote: error:` line and the `! [remote rejected]` line; it is left out here and adds no outcome.

**C15:** no output; no probe ran (see Method).

## Design Impact

- **C8 invalidates** component 7's "Liveness is the existing host + PID + start-time check … a dead holder is reclaimed at once". The existing check returns `null` in 46-48 ms when the holder's PID is alive but its start time differs, twice in a row, and leaves the file in place. Under the design's fail-closed rule every later local landing on that clone would stop until someone deletes the file by hand. The evidence supports: treat a start-time mismatch like `ESRCH` (dead holder: token re-check, unlink, retry the create), so a reused PID is reclaimed the same way a SIGKILLed holder is (C7: acquired in 30 ms).
- **C10 invalidates** component 7's "fails closed (the run stops with the holder named)" and Local landing flow step 1 ("timeout → stop"). Three non-timeout causes return the same `null` within 32-42 ms of a 10 000 ms request: a truncated holder file, a holder on another host, and a host with no `ps` on `PATH` (no holder at all, so there is nothing to name). Mapping `null` to "stop, holder named" would stop every landing on a host without `ps` and print a holder that does not exist. The evidence supports the review's CRITICAL 3: `acquirePublicationLock` returns a result union (`acquired`, `held` with the holder, `timeout`, `unavailable` with a reason) for the landing caller, and the design states the run's response to each (for `unavailable`, the file path to delete or a CAS-only landing, which C1 shows is still safe against a moved `dev`).
- **C13 invalidates** Local landing flow step 4's "Red → stop, nothing moved, route to `/bkit-debug`" as written for any non-zero exit. `bkit tests changed` exited `81` with `verdict: null` and `exitCode: 75` when another run on this machine held the machine-wide `tests` lock; no test ran. Routing that to `/bkit-debug` would start a fix loop for a passing change. The evidence supports the review's OPTIONAL 1, promoted to required: map exit `81` (tests lock held) to a wait or retry while the landing lock is still held, exit `4` / `3` (could not run / no gate) to a stop with that reason, and only exit `1` with `verdict: FAIL` to `/bkit-debug`. It also bears on `LAND_LOCK_WAIT`: a landing waits on the machine-wide `tests` lock, which every bkit test run on the machine shares, not only landings (see C11).
- **C11 invalidates** `TIMEOUTS.LAND_LOCK_WAIT` = 15 minutes as a bound on one landing's hold, and the design's sizing premise that the lock is held "for its affected checks". The landing lock is held across the changed-files check, and that check first waits on the machine-wide `tests` lock, which every bkit test run on the machine takes. Measured on one real 101-file landing: run 1 held for 1413 s (23.5 minutes: 11-12 minutes waiting for the `tests` lock, then about 11.5-12.5 minutes of checks); run 2 held for 1809 s and gave up at the 1800 s `tests`-lock wait with exit `81`, never starting the checks. Setup and the frozen install took 5-7 s, so they do not matter. With a 15-minute `LAND_LOCK_WAIT`, a second landing queued behind either run would have timed out and stopped. The evidence supports: (a) size the wait against "affected checks plus the `tests`-lock wait", or take the `tests` lock before the landing lock so a landing never holds the landing lock while queued for tests; (b) pass the landing's own `--lock-wait-s` to `bkit tests changed` so the two waits are set together; (c) the checks alone on bkit's repo took about 11.5-12.5 minutes for a 101-file change, close to 15 minutes even without contention.

## Unsettled

- **C15 (#849's final shape):** needs #849 built and landed on `dev`, so `.bkit/core/engine/commands/workflow/local-dev.ts`, its `syncLocalDev` result type, its `localDev` line and its reachability contract test exist to read and call. Then a probe can call the strict advance beside `syncLocalDev` against the C1-C5 scratch repos. Risk carried: the design names `fastForwardDev` as what `advanceLocalDev` reuses, and #849's plan deletes it; if #849's result type or its "every verb reachable from `pushToDev` emits `localDev`" test cannot express an `unpushed` landing, P2 has to reshape the advance and its reporting after the plan is written.

## Verdict Reasoning

FAIL, because four claims are DISPROVEN by captured output: C8 (a PID-reused holder is not reclaimed), C10 (three non-timeout causes return the same early `null`), C13 (exit `81` from a held `tests` lock is not a red check) and C11 (one landing held the landing lock for 1413 s and 1809 s, against a proposed 15-minute wait). All four are in the landing lock and pre-land check parts of the design (component 7, Local landing flow steps 1 and 4, `TIMEOUTS.LAND_LOCK_WAIT`). Each one confirms and measures a caveat the review raised as CRITICAL 3, OPTIONAL 1 or Unknown 2, and each has a design edit the evidence supports; none of them changes the approach.

The part with the highest blast radius holds. Every git step the design uses to move the owner's `dev` behaved as the design says (C1-C5): the compare-and-swap refuses a moved `dev`, a `dev` held by another worktree needs the explicit check and the porcelain list finds it, `merge --ff-only` stops on an overlapping unstaged, staged or untracked file and leaves both `dev` and the file alone, a hand-commit race is refused, and `withoutHooks` stops every hook. The start base (C14), the lock's wait-then-acquire and SIGKILL reclaim (C9, C7), the shipped pre-push guard on both batch shapes (C12) and the reason for rejecting `git push .` (C6) also hold. C15 is BLOCKED until #849 is built; it would make the verdict CONCERNS on its own, but the DISPROVEN claims decide it.
