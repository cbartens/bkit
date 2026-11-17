<!-- bkit:anchor
baseSha: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
Verdict: CONCERNS
<!-- verdict:end -->


# Design: Keep local `dev` level with `origin/dev` after every landing, plus a recovery utility

## Related Issues

- #842 — Ship fails when the local feature branch differs from GitHub's (open)
- #813 — Add a rollback path for shipped workflow changes; decide dev checks (open)
- #639 — Land parallel workflow closes on dev without colliding (closed)
- #493 — Plan and design close can delete the feature branch after a failed squash merge (closed)
- #288 — Remove Step 1 local dev sync gate from phase workflows (closed)
- #209 — Workflow state model: squash to dev, persistent feat branch (closed)
- #69 — Local dev diverges from origin/dev before worktree setup (closed)
- #661 — Ship re-runs CI after updating the branch from dev, even though code did not change (closed)
- #756 — Workflow optimisation: ship, land and close steps (done) (closed)
- #66 — Workflows abort on rebase conflict (closed)

## Acceptance Scenario

Built from the input's `Draft Acceptance Scenario` (Q12, accepted). Each change to it is a `Decisions` row marked "Draft change".

### Narrative

When I finish a design, plan, build, debug or ship run, or anything else bkit does pushes to `dev`, my local `dev` ends level with GitHub's whenever it safely can. When it can't, the final message tells me plainly that my work landed, how far my local `dev` is ahead or behind, how many of my local-only commits GitHub already holds as copies, why it wasn't moved, and which command fixes it. For divergence I already have, `@bkit-utility-sync-dev` works out which of my local commits are really unpublished, prepares and checks a clean result, and hands it back for my approval; nothing is pushed until I say so.

### Success Criteria

1. After any close or push to `dev` (design, plan, ship including its final `ship DONE` commit, build / debug roadmap mirror and close, debug `branches push --mode=dev`, the `ci dispatch-gate` re-trigger, `branches force-build`, failure-record handovers including `workflows handover --push` in abort mode), a behind-only local `dev` that git can move without touching an edited file ends equal to `origin/dev`.
2. Every such path reports exactly one local-sync result in its final message: `equal`, `fast-forwarded`, `ahead`, `divergent`, `blocked` (with reason), `unavailable` (with reason), `pending` (close PR not merged) or `not-applicable` (runtime with no local `dev`); no local-sync result ever changes the close's exit code.
3. Automatic sync never alters local commits, staged changes, working-tree edits, the active branch or another worktree, and never moves local `dev` backwards or onto a non-descendant.
4. The recovery tool classifies every local-only commit as already on GitHub (patch-id match, identical content of every touched file where a deleted file matches only when it is absent on `origin/dev`, or empty when replayed), `empty` (empty from the start), `merge`, or unpublished; never counts an `empty` or `merge` commit as already on GitHub and leaves both out of the replay; flags unpublished commits whose files GitHub changed since the fork point as `contested`, pushes only a replay of the unpublished ones, only after the owner approves that exact commit, and keeps a `dev-backup/{YYYYMMDD-HHMMSS}` branch of the old tip.
5. Tests cover equal / behind / ahead / divergent, edited and occupied worktrees, an untracked file at a path the update adds, copied and squashed commits, a `git pull` merge on local `dev`, commits empty from the start, unpublished deletions, fetch failure, refusals under a non-English git locale, `origin/dev` moving during sync and during approval, a server refusal of the approved push, two parallel closes, install failure after a fast-forward, and a ship close PR that stays unmerged.

### Key Edge Cases

- `origin/dev` moves between landing and sync: one fetch after the landing; the target is that fetched tip, not the landed SHA; the result reports the state actually observed.
- Two parallel closes in one clone: each only fast-forwards with a non-forced update; git refuses the move that would go backwards, the refused close re-reads local `dev` once and reports what it finds; the later tip wins.
- Ship close falls back to an unmerged PR: `pending`, no fetch, nothing moved.
- `dev` checked out in a linked worktree: git refuses the ref update; `blocked: occupied`, read from `git worktree list --porcelain`, whatever git's locale.
- Main checkout on `dev` with an edit to a file the update changes (always the case after a failure-record handover from `dev`), or an untracked file at a path the update adds: `merge --ff-only` refuses; `blocked: edited-files`, read from git state, whatever git's locale; the close still exits 0.
- Local `dev` holds a `git pull` merge of `origin/dev`: `git cherry` then misses copies made before the merge, so the line gives the copy count as "at least K" and points at `bkit branches dev-status`; recovery classifies the merge as `merge` and leaves it out of the replay.
- Local `dev` holds an empty commit (bkit's own CI re-trigger, `retriggerCommit`): classified `empty`, never counted as a copy or as already on GitHub, left out of the replay.
- Debug run in place on `dev` whose own commits were replayed as copies: local `dev` is divergent by construction; the line says how many local-only commits are already on GitHub as copies and points at recovery.
- A local commit published inside a larger squash: patch-id misses, the file-content check decides; a squash later edited on GitHub fails both, and is caught when its replay applies empty.
- A change reverted on GitHub: its commit is unpublished and `contested`; the owner sees it before approving and can exclude it (it stays on the backup branch).
- `origin/dev` moves while the owner decides: the approved push is not a fast-forward any more, git rejects it, and recovery re-prepares and asks again.

### Process Sketch

- WHEN a close lands on `origin/dev` and local `dev` is only behind and git accepts the fast-forward → THEN local `dev` is fast-forwarded (frozen install when the main checkout is on `dev`) and the final message says local dev synced.
- WHEN local `dev` has commits `origin/dev` lacks → THEN it is left untouched and the final message says: landed; local dev N ahead / M behind; K already on GitHub as copies; run `@bkit-utility-sync-dev`.
- WHEN the fetch fails, the move is refused or the close PR is still open → THEN the landing still counts as done and the line reports `unavailable`, `blocked` or `pending` with the reason and `bkit branches sync-dev` as the retry.
- WHEN `@bkit-utility-sync-dev` runs → THEN it lists already-on-GitHub, unpublished and contested commits, replays the unpublished ones onto `origin/dev` in a throwaway checkout, runs the deepest declared gate and returns the prepared commit with the exact push command.
- WHEN the owner approves that commit → THEN the old tip is saved as `dev-backup/{timestamp}`, the commit is pushed without force, and local `dev` is moved onto it when no worktree has `dev` checked out.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Safe fast-forward of local `dev` after a landing | `fastForwardDev` (`.bkit/core/engine/commands/workflow/branches.ts:2863`), called by `landVerb` (`:2961`) and `syncDevVerb` (`:2454`) | EXTEND | Already has the right git refusals: `merge --ff-only` on the main checkout, non-forced `fetch . sha:refs/heads/dev` elsewhere, which refuses a non-fast-forward and a `dev` checked out in another worktree. It becomes `syncLocalDev`: typed result, fetched-tip target, refusal reason read from git state rather than git's localised stderr, no generic `git pull --rebase` advice. |
| Frozen install after `dev` moved under the main checkout | `install` (`branches.ts:2469`) | EXTEND | Reused as is (Q11); its `false` result becomes `installed: false` in the result instead of exit 16 on close paths. |
| Fetch `origin/dev` with lock-race detection | `fetchDev`, `devRefRace`, `TIMEOUTS.LAND_ATTEMPTS` / landing backoff (`.bkit/core/engine/commands/land.ts`) | EXTEND | The end-of-close fetch retries a ref-lock race with the same backoff, bounded by a named `TIMEOUTS` constant. |
| One final message line per run | `shipClose` `finalReturn` (`.bkit/core/engine/commands/workflow/workflows.ts:1488`); `workflows close --final-return`; appended-line precedent at `.bkit/core/workflows/bkit-debug.md:874` | EXTEND | Ship and build / debug closes fold the line into `finalReturn`; design / plan / debug-on-dev / Failure Paths append the line their landing verb emitted, as debug already appends CI lines. |
| "Already on GitHub" proof | git built-in `git cherry` (patch-id); per-file and `.jsonl` added-line comparison in `notOnDev` (`branches.ts:2903`) and `localDevCopies` (`:2927`). Searched `.bkit/core/engine` for `cherry`, `patch-id`: no non-test use. | EXTEND | `notOnDev`'s rule (blob equality, `.jsonl` by added lines because ledgers are union-merged) is generalised from "branch vs `origin/dev`" to "one commit's touched paths vs `origin/dev`". The generalised rule compares deletions too: `notOnDev` skips them (`--diff-filter=d`), so an unpublished deletion would pass as published. A deleted path matches only when it is absent on `origin/dev`. Merge commits and commits that were empty from the start get named classes, because `diff-tree` gives both zero touched paths and the content rule would hold for them by default. `git cherry` supplies the patch-id tier without custom hashing. |
| Replay chosen commits onto a fresh `origin/dev` in a throwaway checkout | `replayBuild` (`branches.ts:1150`) + `pushToDev` (`land.ts:222`) | EXTEND | `replayBuild` gains a drop-empty mode (today `--allow-empty --keep-redundant-commits` would push empty commits). The mode is built on the stop-detect route, not on `cherry-pick --empty=drop`, because `--empty` needs git 2.45 and the engine assumes git 2.31 (`land.ts:102`). Merge commits are never handed to it: `cherry-pick` stops on a merge without `-m`. `pushToDev` gains a no-push option that stops after the gate and returns `{ base, sha, tree }`. |
| Deepest declared gate in the throwaway | `checkLanding` (`land.ts:188`), `requiredPushGate` (`.bkit/core/engine/commands/ci/push-gate.ts:37`) | EXTEND | `requiredPushGate` returns the deepest full push gate: `bkit:gate:static-unit-integration`, else `bkit:gate:static-unit`. That is how this design reads Q9's "deepest declared gate". The e2e and live gates are excluded because they need a deployed boundary and run only in debug Step 3 (`.bkit/workflows.md:1540`). `bkit tests run` has no fixed deepest gate of its own: `resolveGate` (`workflow/tests.ts:104`) runs whichever candidates its caller passes. `checkLanding` gains a "force full gate" input, because it otherwise runs `bkit:gate:min` for doc-only diffs. |
| Read-only divergence classifier (`bkit branches dev-status`) | `inheritedDevCommits` (`.bkit/core/engine/commands/workflow/worktrees.ts:231`) is branch-scoped; `sync-dev` mutates. Searched `branches.ts`, `worktrees.ts`, `.bkit/cli.md`. | NEW | No verb reports per-commit publish state of local `dev`. A separate read-only verb keeps the settled Q4 contract and is safe to run any time; it shares the classifier with `syncLocalDev`. |
| Approved replay push and local adoption (`bkit branches dev-reconcile`) | `pushOwnCommits` (`branches.ts:1175`) replays a run's own commits but pushes immediately and never moves local `dev`. Searched for `update-ref`, `dev-backup`: no non-test use. | NEW | Nothing splits prepare / approve / push, binds the push to an approved SHA, or moves local `dev` onto a non-descendant with a backup. Built on the EXTEND rows above. |
| Thin recovery prompt | Utility prompt pattern `.bkit/core/prompts/bkit-utility-*.md`, catalogued in `.bkit/prompts.md` § Utility (Ad-hoc), invoked as `@bkit-utility-*` (`DETAILS.md:442`) | NEW | No utility covers git history; follows the existing utility shape, host copies via `bkit upgrade`. |
| Guard that every `dev`-pushing verb reports local sync | None: searched engine tests for a list of `pushToDev(` callers. Precedent for count-budget tests: `docs/capabilities.md` budgets, which count markers and cannot check "every caller then calls X". | NEW | The 6-month premortem: a new `dev`-pushing verb silently skips sync. Pinning direct call sites is not enough: `pushOwnCommits` alone sits behind six `pushBranch` callers. A contract test that checks reachability from every push to `dev` to a verb that emits `localDev` catches it. |
| Retiring ship step key `ship-switch-to-dev` | `SHIP_STEP_ORDER` (`.bkit/core/engine/checks/status-holes.ts:45`); decision `ship-close-removes-worktree-after-landing` as the retirement precedent; decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) | EXTEND | Old status logs keep validating; new runs stop needing the key. |

## Architecture

Three layers, all in the engine; workflows and the prompt only display what the engine wrote.

1. **Classifier (shared, read-only)** — `classifyDev(root, opts)` in `branches.ts` (or a sibling module under `.bkit/core/engine/commands/workflow/`). Given a fetched `origin/dev`, it returns ahead / behind counts and, on request, per-commit proof for each local-only commit. Two tiers:
   - **Cheap tier** (used by every close): `rev-list --left-right --count`, then `copies`.
     - `copies` counts the `git cherry origin/dev dev` `-` lines of local-only commits that are neither merges nor empty. Empty commits are found with one `diff-tree -r --stdin --name-only` over the local-only commits; they are left out because `git cherry` pairs a local empty commit with any unrelated empty commit on `origin/dev`.
     - When the local-only commits include a merge, `copiesExact` is `false`: `git cherry` then misses copies made before the merge (in the spike fixture a real copy counted 0 after a `git pull` merge). The line says "at least K" and points at `bkit branches dev-status`.
   - **Full tier** (used by `dev-status` / `dev-reconcile`), per local-only commit in this order:
     1. A merge commit (more than one parent) → `merge`.
     2. A commit with zero touched paths in `diff-tree -r` → `empty`.
     3. A `-` line in `git cherry` → `patch-match`.
     4. Every touched path equals `origin/dev`, using `notOnDev`'s `.jsonl` added-line rule; a deleted path matches only when it is absent on `origin/dev` → `content-match`.
     5. Otherwise → `unpublished`, then the `contested` check (paths `origin/dev` changed after the fork point).
   - The full tier is batched with one `rev-list`, one `git diff-tree -r --stdin` and one `git cat-file --batch-check`. The spike measured 2.249 s for 200 commits x 50 files and 12.169 s for 1000 x 50, so the named commit limit sits at or below 200. Past the limit it marks `partial: true` and counts the rest as unpublished, never as published.
2. **Automatic sync** — `syncLocalDev(root, { pending?, runtimeDevPushes }, log): LocalDevSync`, the extended `fastForwardDev`. It never throws: a catch-all maps any exception to `unavailable: internal`, logs the stack and writes one `friction` row so a bug hidden by the catch-all still surfaces. It moves `dev` only on `behind > 0 && ahead == 0`, with today's two non-forced mechanisms. It is called **after** the caller's landing has completed and **outside** the landing's `try`, so the caller's exit code is computed first and never changed.
   - Callers, each emitting `localDev` in its JSON:
     - `branches land` (design / plan, including the `landPr` fallback once merged).
     - `workflows close` for ship (after the head push or merged close PR; open close PR → `pending`) and for build / debug (re-observes the state the earlier mirror left).
     - `roadmap mirror` (Q1; output discarded by build / debug, the following close re-observes).
     - `pushOwnCommits` (`branches.ts:1175`), once, after its switch over `DevPush` and without throwing. This one call covers every `pushBranch` route that pushes `dev`, by plain push or by replay: `branches push --mode=dev`, the `ci dispatch-gate` CI re-trigger (`runs.ts:881`), `branches force-build` (`branches.ts:1819`) and `workflows handover --push` in abort mode (`workflows.ts:896`). Each of those verbs passes the result through as `localDev`.
     - `workflows handover --push` / `--flush` on the failure-record route (`landFailedRecord`).
     - `branches sync-dev` (by-hand wrapper).
   - `pushCurrentBranch` (`runs.ts:728`) needs no call: its only caller, `ciDispatchGate` (`runs.ts:868`), reaches it only when the run has no shared-checkout record, and a shared branch without a record returns `EXIT_RETRIGGER_FAILED` before that (`runs.ts:850`). So it never pushes `dev`. The contract test still covers it, so a new caller that reaches it on `dev` fails the test.
   - `pushToDev` itself is unchanged in behaviour: its header invariant "the main checkout's branch, index and edits are never touched" (`land.ts:1-9`) stays true.
   - Logging: `syncLocalDev`, `dev-status` and `dev-reconcile` log under the owning module's prefix `[bkit-branches]` on stderr (`docs/observability.md` § Log Format). The refusal stderr and the `unavailable: internal` stack go there at warn level.
3. **Recovery** — two verbs plus a prompt.
   - `bkit branches dev-status`: fetch, full-tier classify, print a table; never writes.
   - `bkit branches dev-reconcile --stage=prepare|push|adopt`: stateless stages that each re-derive everything from git refs and their arguments.
   - `@bkit-utility-sync-dev`: thin subagent prompt that runs `dev-status` and `--stage=prepare`, and returns the classification, gate result, prepared SHA and the exact `--stage=push` command. The calling session asks the owner (the standalone push rule) and runs the push.

**Boundaries.**

- The throwaway-checkout isolation of #639 is kept: recovery builds and gates its replay in `.worktrees/_land-*` through `pushToDev`'s no-push option, never in the main checkout.
- The only writes to the main checkout's refs are the fast-forward (automatic), and in recovery the hold ref `refs/bkit/sync-dev/prepared` (prepare), the backup branch and the adoption move (both after approval).
- No path runs `git reset`, a forced push, `stash`, or rewrites `origin/dev`.

**Workflow integration.**

- `bkit-ship.md`: Step 13 (`branches sync-dev`, key `ship-switch-to-dev`) is removed; the close's `finalReturn` carries the line. Resume routes and `ship-merged-on-entry` that point at Step 13 go to the close step.
- `bkit-design.md` / `bkit-plan.md`: the close step holds `branches land`'s `localDev.line` as `LOCAL_DEV_LINE` and the final-return step displays `{FINAL_RETURN}` followed by it.
- `bkit-build.md`: no prose change beyond docs; its `workflows close` folds the line into `finalReturn`.
- `bkit-debug.md`: the close folds the line; the in-place `branches push --mode=dev` route holds its own `localDev.line` and the final-return step appends it after the close's (latest observation shown last).
  - On that route `LOCAL_DEV_LINE` holds the line of the last `dev`-pushing verb the run called. When `ci dispatch-gate` re-triggered CI after `branches push --mode=dev`, its line replaces the push's line, because the re-trigger commit moved `origin/dev` again.
- Failure Paths that run `workflows handover --push` (including abort mode) append its line to the failure message.

**Out of scope.**

- Recording how often local sync ends blocked or divergent as telemetry (deferred, `scope-declared`).
- Changing `pushOwnCommits` to prefer the plain push so that debug-on-dev runs stop creating copies (deferred, `scope-declared`).
- Feature-branch catch-up and pre-merge CI validation: #842.

## Data Model

No database. Engine result types and refs only.

```ts
type LocalDevState =
  | "equal" | "fast-forwarded" | "ahead" | "divergent"
  | "blocked" | "unavailable" | "pending" | "not-applicable";

type LocalDevReason =
  | "occupied"            // blocked: dev checked out in another worktree (git state, not stderr)
  | "edited-files"        // blocked: merge --ff-only would overwrite an edit or an untracked file (git state, not stderr)
  | "git-refused"         // blocked: any other refusal, including a non-fast-forward
  | "fetch-failed"        // unavailable
  | "internal"            // unavailable: exception caught
  | "close-pr-open"       // pending
  | "no-local-dev"        // not-applicable: refs/heads/dev missing
  | "no-dev-push-runtime";// not-applicable: runtime cannot push dev

interface LocalDevSync {
  state: LocalDevState;
  reason: LocalDevReason | null;
  ahead: number | null;      // local-only commits; null when not observed
  behind: number | null;
  copies: number | null;     // of `ahead`, the non-merge, non-empty commits `git cherry` marks as already on origin/dev
  copiesExact: boolean | null; // false when the local-only commits include a merge: `copies` is then a lower bound
  from: string | null;       // local dev before
  to: string | null;         // local dev after (= from unless moved)
  target: string | null;     // fetched origin/dev tip compared against
  installed: boolean | null; // frozen install result; null = not run
  line: string;              // one plain sentence for the final message
}
```

- Every `dev`-pushing verb emits it under one field name, `localDev`. `sync-dev` today emits `devLocal` (`branches.ts:2464`); it is renamed, which is a contract change traced through `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` per Project Rules § Contract changes.
- `line` examples:
  - `Local dev: synced to origin/dev (abc1234).`
  - `Local dev: not moved — 19 ahead / 1 behind origin/dev (divergent); 17 of the 19 are already on GitHub as copies. Run @bkit-utility-sync-dev.`
  - `Local dev: not moved — 20 ahead / 3 behind origin/dev (divergent); at least 2 are already on GitHub as copies (a merge hides the rest; run bkit branches dev-status). Run @bkit-utility-sync-dev.`
  - `Local dev: not moved — 2 behind; an uncommitted edit touches a file the update changes. Commit or move it, then run bkit branches sync-dev.`
- The two routine cases get a short wording of their own, so the owner can tell bookkeeping from a real problem. Tests pin both:
  - After debug-on-dev, when `copiesExact` is true and `copies` equals `ahead`: `Local dev: 3 ahead / 1 behind — all 3 are copies of commits already on GitHub (expected after a debug run on dev). Run @bkit-utility-sync-dev to tidy it.`
  - After a failure-record handover from `dev` with reason `edited-files`: `Local dev: not moved — the failure record's edits touch files the update changes (expected after a failure handover on dev). Run bkit branches sync-dev once they are committed or moved.`
  - `Local dev: not checked — landing waits on close PR #123; run bkit branches sync-dev after it merges.`
  - `Local dev: synced to origin/dev (abc1234), but the dependency install failed — run the frozen install by hand.`

```ts
interface DevCommitProof {
  sha: string;
  subject: string;           // untrusted text; the prompt fences it
  class: "patch-match" | "content-match" | "empty-on-replay" // already on GitHub
       | "empty"             // empty from the start; never counted as on GitHub; not replayed
       | "merge"             // merge commit; never counted as on GitHub; not replayed
       | "unpublished";
  contested: boolean;        // unpublished, and origin/dev changed one of its paths after the fork point
  paths: string[];           // a merge lists its paths from `diff-tree -m`; an empty commit lists none
}

interface DevStatus {
  base: string;              // fetched origin/dev
  local: string;             // local dev
  ahead: number; behind: number;
  commits: DevCommitProof[]; // oldest first
  partial: boolean;          // classification stopped at the named limit
  backups: { ref: string; createdAt: string }[]; // existing dev-backup/* branches, oldest first
  publishRisk: string | null;// remote.*.push / mirror config that would publish dev-backup/*
}

interface ReconcilePrepared {
  base: string; local: string;
  sha: string; tree: string; // the prepared commit the owner approves
  holdRef: string;           // refs/bkit/sync-dev/prepared, which keeps `sha` reachable until push or adopt
  replayed: string[]; excluded: string[]; droppedEmpty: string[];
  skippedEmpty: string[]; skippedMerges: string[]; // left out of the replay by class
  gate: string; gateExit: number;
  pushCommand: string;       // exact --stage=push invocation
}
```

- `empty-on-replay` is only known after prepare runs; `dev-status` reports it as `unpublished` until then.
- The `dev-status` table ends with the number of backup branches, the age of the oldest, and the exact delete command for the owner to run (`git branch -D dev-backup/{timestamp}`).
- Refs: `refs/heads/dev-backup/{YYYYMMDD-HHMMSS}` (UTC), created with `git update-ref <ref> <old-tip> ""` (create-only: a same-second collision fails instead of overwriting). Kept until the owner deletes it (Q8). Never pushed by bkit.
- Refs: `refs/bkit/sync-dev/prepared`, written by `--stage=prepare` at the prepared commit and removed by `--stage=adopt` once local `dev` is on it (or replaced by the next prepare). It keeps the prepared commit from `git gc` while the owner decides. This follows the recommended option of the hold-ref question in Risks.

## Components / Flows

**`syncLocalDev` (every close / dev push).**

1. Runtime cannot push `dev` → `not-applicable: no-dev-push-runtime`. No `refs/heads/dev` → `not-applicable: no-local-dev`. Caller passes `pending` → `pending: close-pr-open`, no fetch.
2. `fetchDev`; on a ref-lock race retry with landing backoff up to a named `TIMEOUTS` bound; still failing → `unavailable: fetch-failed`.
3. Cheap-tier classify against the fetched tip: `equal`; `ahead` (behind 0); `divergent` (both > 0); behind only → step 4.
4. Main checkout on `dev` → `merge --ff-only -q <target>`; else `fetch -q . <target>:refs/heads/dev`. Refused (non-zero exit) → re-read local `dev` once: it now contains the target → report `equal` or `fast-forwarded` as observed; else `blocked`, with the reason read from git state, never from stderr, checked in this order:
   1. `git worktree list --porcelain` shows `branch refs/heads/dev` in a worktree other than the one the move ran in → `occupied`.
   2. The main checkout is on `dev`, and either a path in `git diff --name-only HEAD` is also in `git diff --name-only HEAD <target>`, or an untracked path from `git ls-files --others --exclude-standard` is a path the update adds → `edited-files`.
   3. Anything else → `git-refused`.
   - Reason: git's stderr is localised. Under `LC_ALL=de_DE.UTF-8` both refusals carried German text and an English-pattern classifier fell through to `git-refused`. With `-q`, a non-fast-forward refusal prints no stderr at all.
5. Moved and main checkout on `dev` → `install`; `false` → `installed: false`, line says so, state stays `fast-forwarded`.
6. Render `line`; log the refusal stderr under `[bkit-branches]` at warn level; return.

**`bkit branches sync-dev` (by hand).** Thin wrapper over `syncLocalDev`. Keeps its own exit codes for a person at a terminal: fetch failure → the existing fetch exit, install failure → exit 16. No workflow step calls it any more.

**`bkit branches dev-status`.** Fetch, full-tier classify, emit `DevStatus` and a table. The table lists `empty` and `merge` commits under their own headings, apart from both "already on GitHub" and "unpublished". Exit 0 whatever the state; non-zero only when git itself fails.

**`bkit branches dev-reconcile`.**

- `--stage=prepare [--exclude=<sha,...>]`: classify; nothing unpublished → report and stop. Else build the replay set: `unpublished` minus `--exclude`; `empty` and `merge` commits are left out and reported in `skippedEmpty` / `skippedMerges`. A merge for which `git diff-tree --cc` reports any path carries a change of its own: stop and list it for the owner (the Risks question on merges).
  - Run `pushToDev({ dir: landDir(root, "sync-dev"), push: false, gate: "full", build: replayBuild(set, { dropEmpty: true }) })`. The fixed id `sync-dev` matches `SAFE_FID`, so the throwaway is `.worktrees/_land-sync-dev`.
  - `replayBuild` cherry-picks oldest first, one commit per call, with `--allow-empty` and without `--empty`. A stop with `CHERRY_PICK_HEAD` present and no unmerged index entries means the commit applied empty: run `git cherry-pick --skip` and report it as `empty-on-replay`. A stop with unmerged entries is a conflict: stop with the conflicting commit and paths; nothing is pushed or moved.
  - `HEAD` still equal to the base after the replay (everything dropped empty) → stop with "nothing to publish" before `checkLanding`, which would otherwise run `bkit:gate:min` on an empty diff.
  - Run the deepest gate. It waits on the machine-wide tests lock the way `branches push` does (`LOCAL_STACK_LOCK_WAIT_S` from `BKIT_LOCK_WAIT_S`, default 60 s) and returns exit 81 (`EXIT.AGENT_WAIT`) naming the holder when the lock stays held. The plan confirms whether `runPushGate` already passes that environment or needs it added.
  - Write `refs/bkit/sync-dev/prepared` at the prepared commit, remove the throwaway, return `ReconcilePrepared`.
  - A `prepare` killed midway leaves `.worktrees/_land-sync-dev` behind. The next `prepare` removes it, because `pushToDev` runs `dropLandTree` on its directory at the start of every attempt (`land.ts:234`), and the fixed id means it is always the same directory.
- `--stage=push --approved=<sha> --local=<sha>`: refuse if local `dev` is no longer `<local>`, or `<sha>` does not descend from the freshly fetched `origin/dev`. Create the backup branch at `<local>`. Push `<sha>:refs/heads/dev` with `git push --porcelain`, without force and with hooks off (the full gate already ran on that exact tree). Route the result by the porcelain status of the `refs/heads/dev` line, which reads the same in every locale:
  - `[rejected]` (reason `fetch first` or `non-fast-forward`) → `stale`, exit non-zero, re-prepare.
  - `[remote rejected]` (branch protection, ruleset, pre-receive hook, 403) → `refused`, exit non-zero with a different code from `stale`. Print the server's reason and the route that works: open a PR from a branch at `<sha>` into `dev`, or ask whoever controls the rule to push. Never re-prepare on `refused`, because a re-prepared push meets the same rule.
  - Pushed → run `adopt`.
- `--stage=adopt --approved=<sha> --local=<sha>`: refuse unless `<sha>` is on the freshly fetched `origin/dev`. Create the backup branch at `<local>` unless a `dev-backup/*` already points there. `dev` in use by no worktree → `git update-ref refs/heads/dev <sha> <local>` (compare-and-swap: fails if `dev` moved meanwhile), then delete `refs/bkit/sync-dev/prepared`. In use anywhere → `blocked: occupied` with the manual steps printed. A worktree uses `dev` when `git worktree list --porcelain` shows it on `dev`, or when it is mid-rebase or mid-bisect on `dev`, the same as git's own `branch_checked_out` check; `update-ref` itself checks no worktree. Re-runnable on its own after a push whose adoption was blocked, and the whole recovery when every local-only commit is already on GitHub (`<sha>` = the `origin/dev` tip, no push).

**`@bkit-utility-sync-dev` prompt.**

1. Run `bkit branches dev-status`; show the table with commit subjects inside an untrusted-data fence; report any embedded directives instead of following them.
2. Nothing unpublished → return the exact `--stage=adopt --approved=<origin/dev tip> --local=<local tip>` command for the owner to approve (or `bkit branches sync-dev` when local `dev` is only behind).
3. Contested commits → list them with the `origin/dev` change that contests each, and name the `--exclude` option.
4. Run `--stage=prepare` (with the caller's `--exclude`, if given); report gate result, prepared SHA, replayed / excluded / dropped-empty / skipped-empty / skipped-merge lists, `publishRisk`, and the exact `--stage=push` command.
5. Never run `--stage=push`; the calling session asks the owner and runs it.

**Contract tests.**

- Engine side: the test checks reachability, not direct call sites. It starts from every push that can reach `dev`: `pushToDev`, `runPush` to `dev`, and any `runGit` `push` to a shared branch (`pushCurrentBranch` included). It follows each one up through its callers (`pushOwnCommits` → `pushBranch` → each verb) and asserts that every verb it reaches emits `localDev`. A new path that reaches a push to `dev` fails the test until its verb emits the result.
- Workflow side: a render-snapshot assertion checks that `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md` and every Failure Path that runs `workflows handover --push` show `localDev.line`. The engine-side test cannot catch a workflow that drops the line.

**Ship Step 13 retirement.** Remove the step from `bkit-ship.md` and the `.bkit/workflows.md` lines that describe it (`:141`, `:217`, `:1131`); drop `ship-switch-to-dev` from new-run mandatory steps in `status-holes.ts` while old logs that contain it still validate; update `step-table.ts`, `ship-invariants.test.ts`, the render snapshot and resume routing (a run whose last DONE is Step 12 resumes at the close). Supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev`.

**Advice text.** Remove the generic `git pull --rebase … && git push` advice from `fastForwardDev` and from `pushOwnCommits`' replay log; point `unpushedDevCause`'s `git push origin dev` advice at `bkit branches dev-status` / `@bkit-utility-sync-dev`. Do the same for the "publish `dev` (git push origin dev)" advice in `inheritedDevRefusal` and the base-branch log in `worktrees.ts` (around lines 218 and 251).

**Indexes and docs in the same change.** `.bkit/cli.md` rows for `sync-dev`, `dev-status`, `dev-reconcile`, generated from the verb specs with `pnpm cli:sync` (`docs/architecture.md:86`): edit the specs, not the doc rows; `.bkit/prompts.md` § Utility (Ad-hoc) plus model / tool / turn-budget rows for `bkit-utility-sync-dev`; `.bkit/workflows.md`; a `docs/decisions.jsonl` row explaining why the adoption move is not a `git reset`; `bkit upgrade` for the host copies.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One `syncLocalDev`, called by the last `dev`-touching engine verb of each path, after its landing and outside its `try` | Inside `pushToDev` (brainstorm 2's pick); a trailing `branches sync-dev` step in each workflow | Inside `pushToDev` breaks its "main checkout never touched" invariant (`land.ts:1-9`), still misses `landPr` and the plain push in `pushOwnCommits`, and a throw inside its `try` reaches `shipClose`'s mapping to `EXIT_FLUSH_FAILED`, turning a landed close into a failure (breaks Q3). A workflow step repeats the exact prose-ordering slip that caused this issue and departs from Q2. Brainstorm 2's goal ("covered by construction") is kept through the contract test. |
| Contract test checks reachability: every verb reachable from `pushToDev`, a `runPush` to `dev` or a `runGit` `push` to a shared branch emits `localDev`; a render-snapshot assertion checks that the workflows show `localDev.line` | Pin direct `pushToDev(` / `runPush` call sites; rely on review | The 6-month premortem: a new `dev`-pushing verb silently brings the lag back. Direct call sites map `pushOwnCommits` to one function with six callers and never see `pushCurrentBranch`; the engine test cannot see a workflow that drops the line. |
| `syncLocalDev` is called once at the end of `pushOwnCommits`, after its `DevPush` switch, without throwing | One call in each of its verbs | Covers every `pushBranch` route that pushes `dev` (`branches push --mode=dev`, the `ci dispatch-gate` re-trigger, `branches force-build`, `workflows handover --push` in abort mode) in one place, and leaves `pushToDev` untouched. Settled Q1 says "every push to `dev`". |
| Draft change (SC1, SC4, SC5, edge cases): name the re-trigger, force-build and abort-mode handover paths; add the `empty` and `merge` classes and the deletion rule; add tests for merges, empty commits, deletions, untracked files, a non-English locale and a server refusal | Draft wording | The draft's path list missed the `pushBranch` → `pushOwnCommits` routes. The spike showed empty commits, merges and unpublished deletions passing as already on GitHub, and a merge stopping the replay. |
| `blocked` reasons come from git state (`worktree list --porcelain`; overlap of edited and untracked paths with the paths the update changes or adds), never from stderr | Classify git's stderr text; run the refusing calls with `LC_ALL=C` | The spike showed both refusals falling through to `git-refused` under a German git, and a quiet (`-q`) non-fast-forward printing no stderr. `LC_ALL=C` worked in the probe but still parses English text that git may reword; git state held under the German locale. |
| Merge commits and commits that were empty from the start are named classes (`merge`, `empty`): never counted as already on GitHub, never counted as copies, left out of the replay, listed for the owner | Let the content rule decide them; flatten merges with `cherry-pick -m 1` | `diff-tree` gives both zero touched paths, so "every touched file identical" held for them by default in the spike. `cherry-pick` stops on a merge without `-m`, and `--allow-empty` would push an empty commit to `dev`. Leaving a merge out is safe only when its other commits carry every change; see Risks. |
| A deleted path matches `origin/dev` only when the path is absent there | `notOnDev`'s `--diff-filter=d`, which skips deletions | In the spike an unpublished deletion came out `content-match` under `--diff-filter=d`, so it would have been left out of the replay and lost from `dev`. |
| Drop-empty replay uses `--allow-empty` plus stop-detect and `cherry-pick --skip`, not `cherry-pick --empty=drop` | `--empty=drop`; declare git >= 2.45 as bkit's minimum | git 2.43.4 rejects `--empty` (exit 129); 2.45.0 introduced it, and the engine assumes git 2.31. The stop-detect route behaved the same on git 2.43.4 and 2.56.0. A bkit-wide minimum git version is out of scope. |
| `--stage=push` reads `git push --porcelain` and routes `[rejected]` to `stale` (re-prepare) and `[remote rejected]` to `refused` (PR route or manual step, no re-prepare) | Treat every push failure as `stale` | The spike showed the two status words separating the cases in English and German. A protected `dev` read as `stale` would loop through re-prepare and re-ask forever. GitHub's own refusal shape is unverified; see Risks. |
| Target the freshly fetched `origin/dev` tip, not the landed SHA | Today's `landVerb` fast-forwards to the landed SHA and ignores its fetch result | Draft edge case "one fetch, compare against that"; catches up fully in one move. |
| Keep the non-forced `fetch . <target>:refs/heads/dev` and `merge --ff-only` as the move | `git update-ref refs/heads/dev <new> <old>` compare-and-swap (brainstorm 3) | Truth over agreement: `update-ref` does not refuse when `dev` is checked out in another worktree, so it would move that worktree's branch under its files. The non-forced fetch refuses both a checked-out `dev` and any non-fast-forward, which already stops a parallel close from moving `dev` backwards. `update-ref` with compare-and-swap is used only in recovery adoption, after an explicit "checked out nowhere" check. |
| One state enum plus counts and reason (`LocalDevSync`) | Two axes, `relation` × `outcome` (brainstorm 3); today's bare `skipped` | Only "behind" has more than one outcome; ahead and divergent are never moved by policy, so one enum loses nothing given the counts, and matches the user-facing vocabulary of SC2. It still splits today's `skipped` into ahead / divergent / blocked. |
| Draft change (SC2): add `pending` and `not-applicable` to the state list | Draft SC2's six states | `pending` is Q10 (already in the draft's edge cases); `not-applicable` stops runtimes that cannot push `dev` (claude.ai cloud sessions) from reporting a false `blocked`. |
| Draft change (SC1): name build / debug roadmap mirror and close explicitly; "git can move without touching an edited file" replaces "clean" | Draft SC1 wording "clean, behind-only" | Q7 allows a fast-forward with edits that git accepts; "clean" was narrower than the settled answer. |
| Line adds the `git cherry` count of non-merge, non-empty local-only commits already on GitHub (`copies`), shown as "at least K" when a merge is among the local-only commits | Counts only; the full-tier content check at every close | Debug-on-dev replays leave `dev` divergent by construction; "17 of 19 already on GitHub" tells the owner it is bookkeeping, not lost work. Cheap: one `git cherry` and one `diff-tree --stdin`. The spike showed `git cherry` missing a real copy after a `git pull` merge and pairing unrelated empty commits, so the count leaves those out and says when it is a lower bound. The content check found that copy, but its close-time cost was not measured. |
| Close paths exit 0 when local sync is blocked, unavailable or the install failed; standalone `sync-dev` keeps exit 16 for install failure | Keep ship's install failure → exit 16 → Failure Path | Q3 and Q11 together: a landed close is a success and must disclose the install failure. This changes ship's current route (today Step 13 exit 16 → Failure Path); see Risks. |
| Remove ship Step 13 and retire key `ship-switch-to-dev`; supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev` | Keep Step 13 as a no-op | Settled Q2. Old logs still validate; resume from Step 12 routes to the close. |
| Design / plan / debug-on-dev / Failure Paths display the landing verb's `localDev.line` after `{FINAL_RETURN}`; ship / build / debug closes fold it into `finalReturn` | Re-order design / plan so `branches land` runs before `workflows close --final-return` | The final return is built before the landing in design / plan (`bkit-design.md:578` before `:583`) and debug-on-dev (`bkit-debug.md:726` before `:750`); re-ordering touches lock and worktree teardown. Appending one engine-written line has precedent at `bkit-debug.md:874`. |
| `roadmap mirror` also calls `syncLocalDev` (result discarded by build / debug) | Mirror skips sync because the close re-observes | Settled Q1 lists mirror pushes; the cost is one extra fetch, and a standalone mirror then reports too. The sync is idempotent, so the close's second look converges. |
| Recovery = read-only `dev-status` + stateless `dev-reconcile` stages `prepare` / `push` / `adopt` + thin `@bkit-utility-sync-dev` | One verb that prepares and pushes; a session file holding prepared state | Q4 / Q5. Stateless stages re-derive from git, so a crash or a push whose adoption was blocked is safe to re-run. |
| Push stage pushes the exact approved SHA, without rebuilding and without retry; a moved `origin/dev` means re-prepare and re-ask | Rebuild the replay at push time and compare trees (brainstorm 1); push through `pushToDev`'s retry loop | Pushing the approved object is the strongest guarantee that what lands is what the owner saw, and avoids a second full gate. A retry loop would silently rebuild onto a new base the owner never approved; one approval covers one push. |
| Draft change (sketch): the utility returns for approval instead of waiting; the calling session asks and runs `--stage=push` | The prompt itself waits for approval | `@bkit-utility-*` prompts are subagents (`.bkit/prompts.md` § Utility); a subagent cannot hold an owner conversation and must not push. The standalone push rule sits with the calling session. |
| Draft change (sketch): recovery entry point is `@bkit-utility-sync-dev` | `/bkit-utility-sync-dev` | Utilities are invoked as `@bkit-utility-*` (`DETAILS.md:442`); there is no slash command for them. |
| Departs from settled Q6: a third proof, "applies empty when replayed onto `origin/dev`", counts as already on GitHub and is dropped from the replay | Q6's two proofs only | Cost the question did not surface: `replayBuild` keeps empty commits (`--allow-empty --keep-redundant-commits`), so a squash later edited on GitHub would push an empty commit to `dev`. Still conservative: an empty replay means `origin/dev` already holds every change the commit makes. Owner to confirm (Risks). |
| `contested` flag inside unpublished, plus `--exclude` on prepare | Treat all unpublished alike | Keeps Q6 (unproven stays unpublished, nothing is lost: excluded commits stay on the backup branch) but stops a change deliberately reverted on GitHub from coming back without the owner seeing it. |
| Recovery gate = `checkLanding` with the full gate forced (`requiredPushGate`) | `checkLanding`'s default, which runs `bkit:gate:min` for doc-only diffs; a separate `bkit tests run` call | Q9 asks for the deepest declared gate. This design reads that as the deepest full push gate, which `requiredPushGate` returns; the e2e and live gates need a deployed boundary (`.bkit/workflows.md:1540`). Reusing `checkLanding` keeps one validation path (`prepareLandInputs`, clean-tree checks). |
| Adoption moves `dev` only when no worktree has it checked out; otherwise `blocked: occupied` with manual steps | `reset --keep` when the main checkout is on `dev` (brainstorm 1); always refuse | `git reset` in any flavour is banned (`.agents/rules.md` § Destructive git) and the issue's constraints say "no reset". Whether to add a clean-tree switch sequence for the common "main checkout on `dev`" case is an open question (Risks). |
| Backup created create-only (`update-ref <ref> <old> ""`) before any push or move; never pushed by bkit; `dev-status` warns when push config would publish it | Create the backup after the push succeeds | Q8. The old tip is safe even when the push or the adoption fails midway; a same-second name collision fails instead of overwriting; a `push = refs/heads/*` or mirror remote would otherwise publish backups. |
| Full-tier classification batched, with a named commit limit past which it reports `partial` and counts the rest unpublished | Unbounded per-path `rev-parse` | 10x premortem: 200 commits × 50 files is about 10k processes. Never default to "published" when unsure. |
| Commit subjects and diffs shown by recovery are untrusted data, fenced in the prompt | Show raw | `docs/security.md` § Untrusted Content: commit messages are attacker-controllable. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Shared `syncLocalDev` called by each `dev`-pushing verb (brainstorm 1 A) | MERGED | Core of the design: engine-owned, one result shape, reuses `fastForwardDev` / `install` / `pushToDev` / `replayBuild` / `checkLanding`. |
| Converge at the terminal verb; sync never throws, never changes exit; stateless staged recovery (brainstorm 3 A) | MERGED | Supplies the never-throw wrapper, fetched-tip target, ref-lock retry, contract test, `contested`, empty-on-replay, batched proof and stateless stages. Its `update-ref` move for automatic sync is rejected (Decisions). |
| Sync inside the shared landing routine `pushToDev` (brainstorm 2 A, brainstorm 1 B, brainstorm 3 B) | REJECTED | Breaks `land.ts`'s "main checkout never touched" invariant, can turn a landed ship close into `EXIT_FLUSH_FAILED`, and still misses `landPr` and the plain push. Its "covered by construction" goal is kept via the contract test. |
| Explicit per-command call without a guard (brainstorm 2 B) | MERGED | Same shape as the chosen approach; the missing guard is what the contract test adds. |
| Trailing `branches sync-dev` step in each workflow (brainstorm 1 C, brainstorm 3 C) | REJECTED | Relies on prose ordering across 5 workflows and their Failure Paths, the exact class of slip that caused this issue; departs from settled Q2. |
| Local `dev` as a derived mirror force-aligned to `origin/dev` (brainstorm 2 C) | REJECTED | Violates the no-reset / no-silent-rewrite constraints; people do commit on `dev`. |
| Recovery as one verb that prepares and pushes immediately | REJECTED | No approval point between gate and push; violates Q5 and the standalone push rule. |

## Trade-offs Accepted

- **Per-verb call, not inside the landing routine.** Gain: `pushToDev` stays a pure landing with no side effect on the main checkout, a sync bug can never fail a landing, and each verb's output shows where local `dev` moved. Sacrifice: coverage depends on a call per verb; the contract test turns that into a red test rather than structure.
- **Appending a line in design / plan / debug-on-dev instead of rebuilding the final return.** Gain: no reordering of lock release and worktree teardown. Sacrifice: four workflow sources gain one held variable and one display clause, and the line sits after, not inside, the summary.
- **Close exit 0 on install failure.** Gain: Q3 holds everywhere; a landed ship is never sent down the Failure Path for a local install problem. Sacrifice: a broken local `node_modules` after a ship is only visible in the final line, not as a failed run.
- **Pushing the exact prepared SHA.** Gain: the pushed commit is the one the owner approved and the gate already tested; no second gate run. Sacrifice: any movement of `origin/dev` during approval forces a full re-prepare and re-gate.
- **Adoption refuses a checked-out `dev` (default).** Gain: no `reset` and no branch switch in a checkout other agents may be using. Sacrifice: the common laptop case (main checkout on `dev`) ends with printed manual steps.
- **Mirror also syncs.** Gain: literal Q1 coverage; a standalone mirror reports. Sacrifice: one extra fetch per build / debug run.
- **Cheap tier in every close.** Gain: the line tells the owner whether divergence is mostly copies. Sacrifice: one `git cherry` and one `diff-tree --stdin` per close, and after a `git pull` merge the count is only a lower bound.

## Risks & Open Questions

- Departure from settled Q6 (third proof "applies empty on replay"). Options: A) Accept the third proof and drop empty replays — no empty commits reach `dev`; a commit counts as published on a third kind of evidence · B) Keep Q6's two proofs and keep empty replays as commits — exactly the settled rule; empty commits can land on `dev` · C) Keep Q6's two proofs but refuse to prepare when any replay applies empty, and list them for the owner — no empty commits and no new proof; more manual decisions. Recommended: A — an empty replay proves `origin/dev` already holds every change the commit makes, which is at least as strong as the file-content proof. Default if unanswered: C.
- Adoption when the main checkout is on `dev`. Options: A) Refuse and print manual steps — safest; the owner's common setup always needs manual steps · B) When the main checkout's tracked tree is clean and nothing is staged: `git switch --detach`, compare-and-swap `update-ref`, `git switch dev` — automatic for the common case; a crash mid-sequence leaves a detached HEAD, and switching disturbs any agent working in that checkout · C) `git reset --keep` — one command; banned by `.agents/rules.md` § Destructive git and the issue's no-reset constraint. Recommended: B — the clean-tree precondition makes the switch lossless and the backup branch covers the rest. Default if unanswered: A.
- Close exit on install failure after a fast-forward (changes ship's current exit 16 → Failure Path). Options: A) Exit 0 with `installed: false` in the line — matches Q3 / Q11; a broken install is only visible in the message · B) Keep exit 16 on ship only — current behaviour; a landed ship reported as failed · C) Exit 0 and also write a `friction` row — visible later in stats; one more write in the close. Recommended: C — Q3 holds, and a broken `node_modules` is not left visible only in one line; `unavailable: internal` already writes a `friction` row the same way. Default if unanswered: C.
- Whether the utility subagent may run `--stage=prepare`, which makes cherry-pick commits in a detached throwaway checkout (never on a branch). Options: A) Utility runs prepare — one hand-off; the engine, not the agent, creates local objects · B) Utility runs `dev-status` only; the calling session runs prepare and push — strict reading of "subagents do not commit"; more steps in the main session. Recommended: A — the commits never reach a branch until the approved push, and `pushOwnCommits` already makes the same kind of throwaway commits from verbs. Default if unanswered: A.
- How the prepared commit survives until the push stage. Objects in a removed throwaway are unreachable, and `git gc` prunes them after `gc.pruneExpire` (two weeks by default). Options: A) `--stage=prepare` writes `refs/bkit/sync-dev/prepared` at the prepared commit; `--stage=adopt` deletes it, and the next prepare replaces it — the commit survives any approval delay; one more ref write, and a hold ref is left behind if the owner never pushes · B) No hold ref; `--stage=push` reports a missing object and the utility re-prepares — no extra ref; a long approval delay ends in a "missing object" failure and a second full gate run. Recommended: A — one ref write is cheaper than a confusing failure and a repeated gate. Default if unanswered: A.
- Leaving merge commits out of the replay. The spike did not test whether a `git pull` merge can carry a change of its own, such as a conflict resolution that matches neither parent. Options: A) Leave merges out; when `git diff-tree --cc <merge>` reports any path, refuse to prepare and list that merge for the owner — nothing is lost silently; needs one more git call per merge, and the `--cc` check is unprobed · B) Leave merges out without a check — simplest; a conflict resolution held only by the merge is dropped from `dev` (the backup branch still holds it) · C) Flatten each merge with `cherry-pick -m 1` — replays everything the merge holds; usually re-applies `origin/dev`'s own changes, which conflicts or applies empty. Recommended: A — it keeps the safe default and stops only in the rare case that needs a person. Default if unanswered: A.
- How GitHub reports a push that branch protection or a ruleset refuses (spike claim 11, blocked: probing it needs a protected GitHub repository and a push). The git client reports a server-side refusal as `[remote rejected]` and a stale push as `[rejected]`, in English and German; GitHub's own status was not captured. Options: A) Build the routing on the porcelain status word and verify it against a protected test repository during the plan or build — the design stays as written; one real push to a throwaway GitHub repository is needed · B) Also treat `[rejected]` as `refused` when a re-fetch shows `<sha>` already descends from `origin/dev` — protects against a misreported refusal without a GitHub probe; one more fetch on every failed push · C) Cap re-prepares after `stale` at one per approval, then stop with the manual route — bounds the loop whatever GitHub reports; the owner may see a manual step for a genuinely stale push. Recommended: A — the routing rests on git's documented status words, and one probe settles it. Default if unanswered: B.
- Risk: two rules have no spike evidence and need named tests: the untracked-path check in `edited-files` (an untracked file at a path the update adds, which `merge --ff-only` also refuses), and unmerged index entries as the way to tell a "now empty" cherry-pick stop from a conflict stop (both leave `CHERRY_PICK_HEAD`).
- Risk: after a `git pull` merge on local `dev`, the fork point becomes the merged `origin/dev` tip, so `contested` covers only `origin/dev` changes made after the pull.
- Risk: renaming `devLocal` → `localDev` is a contract change; the plan must read every hit under `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` (including `close-squash.integration.test.ts`, `step-table.ts`) and trace resume, no-plan convert, per-group loop and remediation paths.
- Risk: retiring `ship-switch-to-dev` trips `status-holes.ts` (`SHIP_STEP_ORDER`), `status-holes.test.ts`, `ship-invariants.test.ts`, the `bkit-ship.none.txt` render snapshot and resume routes that name Step 13; old status logs must still validate.
- Risk: debug-on-dev replays and failure-record handovers from `dev` will report `divergent` / `blocked: edited-files` routinely. Each gets the short routine wording from Data Model, with tests pinning both, so the owner does not learn to ignore the line.
- Risk: provider parity. The new prompt needs host copies, `.bkit/prompts.md` rows (catalog, model, tools, turn budget) and `.bkit/cli.md` rows, all in the same change; verify on every provider per Project Rules § Provider parity.
- Risk: file-content proof edge cases (mode-only changes, deletions, submodules, LFS pointers, renames) each need a named test, because a wrong "published" verdict drops work from the replay (the backup branch still holds it).
- Dependency: #842 gap E (feature branch cut from an unpushed local `dev`) produces exactly the squashed copies this recovery classifies; the two must not both change `unpushedDevCause`'s advice differently.

## Suggested Workstreams

### WS-1: Divergence Classifier (`classifyDev`)

#### Scope

- Architecture layer 1: `classifyDev(root, opts)` in `branches.ts` or a sibling module under `.bkit/core/engine/commands/workflow/`, read-only, against an already-fetched `origin/dev`.
- Cheap tier: `rev-list --left-right --count`; `copies` from `git cherry origin/dev dev` `-` lines, leaving out merges and commits found empty by one `diff-tree -r --stdin --name-only`; `copiesExact: false` when a merge is among the local-only commits.
- Full tier, in the design's order: `merge` → `empty` → `patch-match` → `content-match` → `unpublished`, then the `contested` flag (paths `origin/dev` changed after the fork point).
- `notOnDev`'s rule generalised from "branch vs `origin/dev`" to "one commit's touched paths vs `origin/dev`": blob equality, `.jsonl` by added lines, and the deletion rule (a deleted path matches only when absent on `origin/dev`), replacing `--diff-filter=d`.
- Batching with one `rev-list`, one `git diff-tree -r --stdin` and one `git cat-file --batch-check`; a named commit limit at or below 200; `partial: true` past it, the rest counted unpublished.
- `DevCommitProof` type (`empty-on-replay` is filled later by WS-3; `dev-status` reports it as `unpublished`).
- Tests: copied and squashed commits, a `git pull` merge on local `dev` (including the "at least K" lower bound), commits empty from the start (`retriggerCommit`), unpublished deletions, the file-content edge cases named in Risks (mode-only changes, deletions, submodules, LFS pointers, renames), a squash later edited on GitHub, and the `contested` fork-point limitation after a `git pull` merge.

#### Requires

[]

#### Rationale

One read-only proof engine that both automatic sync (cheap tier) and recovery (full tier) consume. It has no side effects and no callers yet, so it can be built and tested in isolation first; every later workstream depends on its verdicts being right.

### WS-2: Landing Primitive Extensions

#### Scope

- `replayBuild` (`branches.ts:1150`) gains a drop-empty mode on the stop-detect route: `--allow-empty` without `--empty`, one commit per call; a stop with `CHERRY_PICK_HEAD` and no unmerged index entries → `git cherry-pick --skip`, reported as `empty-on-replay`; unmerged entries → conflict stop with commit and paths. Works on git 2.31+ (no `--empty=drop`).
- `pushToDev` (`land.ts:222`) gains a no-push option (`push: false`) that stops after the gate and returns `{ base, sha, tree }`; its "main checkout never touched" invariant (`land.ts:1-9`) stays true; `dropLandTree` at the start of each attempt still clears a stale `.worktrees/_land-*`.
- `checkLanding` (`land.ts:188`) gains a "force full gate" input that selects `requiredPushGate` (`bkit:gate:static-unit-integration`, else `bkit:gate:static-unit`) instead of `bkit:gate:min` for doc-only diffs.
- Confirm whether `runPushGate` passes the machine-wide tests-lock environment (`LOCAL_STACK_LOCK_WAIT_S` from `BKIT_LOCK_WAIT_S`, exit 81 `EXIT.AGENT_WAIT`), and add it if not.
- Named tests: unmerged index entries as the way to tell an "applied empty" stop from a conflict stop (Risks: no spike evidence); stop-detect behaviour on old and new git.
- `pnpm build && git add dist/` in the same change.

#### Requires

[]

#### Rationale

These are changes to the shared landing machinery in `land.ts` / `replayBuild`, owned separately from the new verbs. Every existing landing caller must keep its behaviour, so the extensions are additive options with their own regression risk, and are reviewed as one unit before the recovery verbs build on them.

### WS-3: Recovery Verbs (`bkit branches dev-status`, `bkit branches dev-reconcile`)

#### Scope

- `bkit branches dev-status`: fetch, full-tier classify (WS-1), emit `DevStatus` and a table with `empty` and `merge` under their own headings, backup branch count, age of the oldest and the exact `git branch -D dev-backup/{timestamp}` command, and `publishRisk` (`remote.*.push` / mirror config that would publish `dev-backup/*`). Exit 0 whatever the state; non-zero only when git fails.
- `bkit branches dev-reconcile --stage=prepare [--exclude=<sha,...>]`: replay set = `unpublished` minus `--exclude`; `skippedEmpty` / `skippedMerges`; refuse and list any merge where `git diff-tree --cc` reports a path (open question on merges, recommended A); run `pushToDev({ dir: landDir(root, "sync-dev"), push: false, gate: "full", build: replayBuild(set, { dropEmpty: true }) })` (WS-2); "nothing to publish" stop before `checkLanding` when `HEAD` equals the base; write `refs/bkit/sync-dev/prepared` (hold-ref open question, recommended A); return `ReconcilePrepared`.
- `--stage=push --approved=<sha> --local=<sha>`: local-tip and descent checks against a fresh fetch; create-only backup `refs/heads/dev-backup/{YYYYMMDD-HHMMSS}` (UTC) via `update-ref <ref> <old> ""`; `git push --porcelain` without force and with hooks off; route `[rejected]` → `stale` and `[remote rejected]` → `refused` (distinct exit codes, PR route printed, no re-prepare); success → adopt.
- `--stage=adopt --approved=<sha> --local=<sha>`: `<sha>` must be on fetched `origin/dev`; backup unless one already points at `<local>`; occupancy check from `git worktree list --porcelain` plus mid-rebase / mid-bisect on `dev`; compare-and-swap `git update-ref refs/heads/dev <sha> <local>`; delete the hold ref; `blocked: occupied` with manual steps otherwise. Re-runnable alone, including the "everything already on GitHub" case.
- Owner decisions this workstream must carry into the plan: the Q6 departure (third proof `empty-on-replay`, recommended A, default C); adoption when the main checkout is on `dev` (recommended B, default A; `git reset` stays banned); the GitHub branch-protection probe for `[remote rejected]` (recommended A: one push to a protected throwaway repository, default B).
- Logging under `[bkit-branches]` per `docs/observability.md` § Log Format.
- Verb specs → `.bkit/cli.md` rows via `pnpm cli:sync` (edit the specs, not the doc rows); a `docs/decisions.jsonl` row explaining why the adoption move is not a `git reset`; `.bkit/workflows.md` mention of the recovery verbs where it describes local `dev`.
- Tests: `origin/dev` moving during approval (push rejected, re-prepare), a server refusal of the approved push, same-second backup collision, killed prepare leaving `.worktrees/_land-sync-dev`, adopt with `dev` occupied, contested commits with `--exclude`.
- `pnpm build && git add dist/` in the same change.

#### Requires

[WS-1, WS-2]

#### Rationale

The prepare / approve / push / adopt split is one state machine bound together by the approved SHA, the hold ref and the backup branch; splitting the stages would leave a verb that can push without an approval point. It is the only part of the design that writes `origin/dev` on the owner's behalf, so it carries its own risk and review.

### WS-4: Recovery Utility Prompt (`@bkit-utility-sync-dev`)

#### Scope

- New `.bkit/core/prompts/bkit-utility-sync-dev.md` following the utility shape: run `dev-status`; fence commit subjects as untrusted data and report embedded directives (`docs/security.md` § Untrusted Content); nothing unpublished → return the exact `--stage=adopt` (or `bkit branches sync-dev` when only behind); list contested commits with the contesting change and the `--exclude` option; run `--stage=prepare`; report gate result, prepared SHA, replayed / excluded / dropped-empty / skipped-empty / skipped-merge lists, `publishRisk` and the exact `--stage=push` command; never run `--stage=push`.
- Owner decision: whether the utility may run `--stage=prepare` (recommended A, default A).
- `.bkit/prompts.md` § Utility (Ad-hoc) row plus model, tool, effort and `maxTurns` rows; `.bkit/instructions.md` check for shared clauses before writing prompt sentences; `.bkit/authoring.md` sections for prompts.
- Host copies via `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end; provider parity checked on every provider (Project Rules § Provider parity).

#### Requires

[WS-3]

#### Rationale

A separate authoring domain (prompt source, catalog rows, four host renders) with its own parity and authoring rules. It only orchestrates the verbs, so it follows them.

### WS-5: Advice Text Repointing

#### Scope

- Remove the generic `git pull --rebase … && git push` advice from `pushOwnCommits`' replay log (`branches.ts:1175`).
- Point `unpushedDevCause`'s `git push origin dev` advice at `bkit branches dev-status` / `@bkit-utility-sync-dev`.
- Same for the "publish `dev` (git push origin dev)" advice in `inheritedDevRefusal` and the base-branch log in `worktrees.ts` (around lines 218 and 251).
- Coordinate the `unpushedDevCause` wording with #842 gap E so the two changes do not diverge.
- `pnpm build && git add dist/` in the same change.

#### Requires

[WS-3, WS-4]

#### Rationale

Existing messages that tell the owner to publish `dev` by hand become wrong once recovery exists; they can only point at recovery after both entry points ship. Grouped as one small text-only unit across `branches.ts` and `worktrees.ts`, apart from the behaviour changes.

### WS-6: Automatic Sync Core (`syncLocalDev`)

#### Scope

- Architecture layer 2: `syncLocalDev(root, { pending?, runtimeDevPushes }, log): LocalDevSync`, the extended `fastForwardDev` (`branches.ts:2863`).
- Data model: `LocalDevState`, `LocalDevReason`, `LocalDevSync`.
- Flow steps 1-6: `not-applicable` (runtime / no local `dev`), `pending` without fetch; `fetchDev` with ref-lock retry on landing backoff, bounded by a named `TIMEOUTS` constant → `unavailable: fetch-failed`; cheap-tier classify (WS-1) against the fetched tip (not the landed SHA); move only on `behind > 0 && ahead == 0` with `merge --ff-only -q` or non-forced `fetch -q . <target>:refs/heads/dev`; on refusal re-read local `dev` once, then reasons from git state in order `occupied` → `edited-files` (tracked overlap and untracked paths the update adds) → `git-refused`, never from stderr; `install` (`branches.ts:2469`) on a move under the main checkout, `false` → `installed: false`.
- Never throws: catch-all → `unavailable: internal`, stack logged, one `friction` row. Refusal stderr and stack at warn level under `[bkit-branches]`.
- `line` rendering, including the two routine wordings (debug-on-dev all-copies; failure-handover `edited-files`), the "at least K" wording, `pending` and install-failure lines; tests pin both routine wordings.
- Owner decision: close exit on install failure after a fast-forward (recommended C: exit 0 plus a `friction` row; default C). Standalone `bkit branches sync-dev` stays a thin wrapper with its own exit codes (fetch exit, install failure → 16).
- Remove the generic `git pull --rebase` advice from `fastForwardDev` as part of the rewrite.
- Contract change: rename `sync-dev`'s `devLocal` (`branches.ts:2464`) → `localDev`; `grep -l` across `.bkit/core/workflows/`, `.bkit/core/prompts/`, `.bkit/core/docs/templates/`, read every hit in full (including `close-squash.integration.test.ts`, `step-table.ts`), trace resume, no-plan convert, per-group loop and remediation paths. `sync-dev`'s verb spec → `.bkit/cli.md` via `pnpm cli:sync`.
- Tests: equal / behind / ahead / divergent; edited and occupied worktrees; an untracked file at a path the update adds (no spike evidence, named test); fetch failure; refusals under `LC_ALL=de_DE.UTF-8`; `origin/dev` moving during sync; two parallel closes in one clone; install failure after a fast-forward.
- Out of scope, recorded here so it is not picked up: telemetry on how often sync ends blocked or divergent (deferred, `scope-declared`).
- `pnpm build && git add dist/` in the same change.

#### Requires

[WS-1, WS-3, WS-4]

#### Rationale

The single function every close calls, with the safety properties of SC3 (never alters local work, never moves backwards, never changes an exit code). It is built and tested once before any caller is wired. It needs the recovery entry points to exist, because its `line` sends the owner to `bkit branches dev-status` and `@bkit-utility-sync-dev`.

### WS-7: Engine Caller Wiring and Reachability Contract Test

#### Scope

- Call `syncLocalDev` after each landing and outside its `try`, so the caller's exit code is computed first, and emit `localDev` in each verb's JSON:
  - `branches land` (`landVerb`, `branches.ts:2961`), including the `landPr` fallback once merged.
  - `workflows close` for ship (after the head push or merged close PR; open close PR → `pending`, including the final `ship DONE` commit path) and for build / debug; fold `line` into `shipClose`'s `finalReturn` (`workflows.ts:1488`) and the build / debug `finalReturn`.
  - `roadmap mirror` (result discarded by build / debug).
  - `pushOwnCommits` (`branches.ts:1175`): one call after the `DevPush` switch, without throwing; `branches push --mode=dev`, `ci dispatch-gate` (`runs.ts:881`), `branches force-build` (`branches.ts:1819`) and `workflows handover --push` in abort mode (`workflows.ts:896`) pass it through as `localDev`.
  - `workflows handover --push` / `--flush` on the failure-record route (`landFailedRecord`).
- `pushCurrentBranch` (`runs.ts:728`) gets no call; the contract test still covers it.
- `pushToDev` behaviour unchanged.
- Engine contract test: reachability from every push that can reach `dev` (`pushToDev`, `runPush` to `dev`, `runGit` `push` to a shared branch including `pushCurrentBranch`), up through callers, asserting every reached verb emits `localDev`.
- Tests: a ship close PR that stays unmerged (`pending`, no fetch); a landed close whose sync fails still exits 0 (SC2).
- Out of scope, recorded here: changing `pushOwnCommits` to prefer the plain push so debug-on-dev stops creating copies (deferred, `scope-declared`).
- `pnpm build && git add dist/` in the same change.

#### Requires

[WS-6]

#### Rationale

All engine verbs that push `dev` change together, and the reachability test only passes once every one of them emits `localDev`; splitting the callers would leave the test red or partially pinned.

### WS-8: Workflow Display Integration

#### Scope

- `bkit-design.md` / `bkit-plan.md`: close step holds `branches land`'s `localDev.line` as `LOCAL_DEV_LINE`; the final-return step shows `{FINAL_RETURN}` followed by it.
- `bkit-debug.md`: close folds the line; the in-place `branches push --mode=dev` route holds its own `LOCAL_DEV_LINE` and appends it after the close's; when `ci dispatch-gate` re-triggered CI after the push, its line replaces the push's line.
- `bkit-build.md`: no prose change beyond docs.
- Every Failure Path that runs `workflows handover --push` (including abort mode) appends its line to the failure message.
- Workflow-side contract test: a render-snapshot assertion that `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md` and every such Failure Path show `localDev.line`.
- `.bkit/workflows.md` lines describing local `dev` after a close (around `:217`) updated in the same change; `pnpm instructions:show` before editing workflow sentences; `.bkit/authoring.md` sections for workflows; fenced bash rules (Project Rules § Workflow bash blocks).
- Mirrors via `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end; provider parity on every provider.

#### Requires

[WS-7]

#### Rationale

The workflow-prose domain: the engine emits the line, and these sources only display it. They change together because the render-snapshot assertion covers all of them at once.

### WS-9: Ship Step 13 Retirement

#### Scope

- Remove Step 13 (`branches sync-dev`, key `ship-switch-to-dev`) from `bkit-ship.md`; route resume paths and `ship-merged-on-entry` that point at Step 13 to the close step (a run whose last DONE is Step 12 resumes at the close).
- `.bkit/workflows.md` lines `:141`, `:217` (ship half) and `:1131`.
- `status-holes.ts` (`SHIP_STEP_ORDER`, `:45`): drop `ship-switch-to-dev` from new-run mandatory steps while old logs that contain it still validate; update `status-holes.test.ts`, `step-table.ts`, `ship-invariants.test.ts` and the `bkit-ship.none.txt` render snapshot.
- Supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) with a new row; ship's install-failure route changes from Step 13 exit 16 → Failure Path to the close's disclosure (per WS-6's decision).
- `pnpm build && git add dist/` for engine edits; mirrors via `bkit upgrade` once at the end.

#### Requires

[WS-7]

#### Rationale

The ship step contract (status validation, step table, resume routing) is its own domain with its own tests. It can only be removed once the ship close itself syncs and reports (WS-7); removing it earlier would leave ship with no local sync at all.

## Suggested Plans

### P-1: Local `dev` Recovery Tool

#### Deliverable

A read-only `bkit branches dev-status` that classifies every local-only `dev` commit, a staged `bkit branches dev-reconcile` (prepare / push / adopt with backup branch and hold ref) that publishes only the owner-approved replay of unpublished commits, the `@bkit-utility-sync-dev` prompt with its catalog rows and host copies, and existing "publish `dev` by hand" advice repointed at these entry points. Additive: no existing close path changes behaviour, so it rolls back by removing the new verbs and prompt.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5]

#### Requires

[]

### P-2: Automatic Local `dev` Sync on Every Landing

#### Deliverable

`syncLocalDev` called by every engine verb that pushes `dev`, each emitting `localDev` with one plain final-message line; design, plan, build, debug, ship and Failure Paths display it; ship Step 13 retired with old status logs still validating; the reachability and render-snapshot contract tests that keep future `dev`-pushing paths covered. Changes every close path and ship's step contract, so it carries its own rollout and rollback.

#### Covers

[WS-6, WS-7, WS-8, WS-9]

#### Requires

[P-1]
