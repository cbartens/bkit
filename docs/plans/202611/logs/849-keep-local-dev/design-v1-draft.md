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

1. After any close or push to `dev` (design, plan, ship including its final `ship DONE` commit, build / debug roadmap mirror and close, debug `branches push --mode=dev`, failure-record handovers), a behind-only local `dev` that git can move without touching an edited file ends equal to `origin/dev`.
2. Every such path reports exactly one local-sync result in its final message: `equal`, `fast-forwarded`, `ahead`, `divergent`, `blocked` (with reason), `unavailable` (with reason), `pending` (close PR not merged) or `not-applicable` (runtime with no local `dev`); no local-sync result ever changes the close's exit code.
3. Automatic sync never alters local commits, staged changes, working-tree edits, the active branch or another worktree, and never moves local `dev` backwards or onto a non-descendant.
4. The recovery tool classifies every local-only commit as already on GitHub (patch-id match, identical content of every touched file, or empty when replayed) or unpublished, flags unpublished commits whose files GitHub changed since the fork point as `contested`, pushes only a replay of the unpublished ones, only after the owner approves that exact commit, and keeps a `dev-backup/{YYYYMMDD-HHMMSS}` branch of the old tip.
5. Tests cover equal / behind / ahead / divergent, edited and occupied worktrees, copied and squashed commits, fetch failure, `origin/dev` moving during sync and during approval, two parallel closes, install failure after a fast-forward, and a ship close PR that stays unmerged.

### Key Edge Cases

- `origin/dev` moves between landing and sync: one fetch after the landing; the target is that fetched tip, not the landed SHA; the result reports the state actually observed.
- Two parallel closes in one clone: each only fast-forwards with a non-forced update; git refuses the move that would go backwards, the refused close re-reads local `dev` once and reports what it finds; the later tip wins.
- Ship close falls back to an unmerged PR: `pending`, no fetch, nothing moved.
- `dev` checked out in a linked worktree: git refuses the ref update; `blocked: occupied`.
- Main checkout on `dev` with an edit to a file the update changes (always the case after a failure-record handover from `dev`): `merge --ff-only` refuses; `blocked: edited-files`; the close still exits 0.
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
| Safe fast-forward of local `dev` after a landing | `fastForwardDev` (`.bkit/core/engine/commands/workflow/branches.ts:2863`), called by `landVerb` (`:2961`) and `syncDevVerb` (`:2454`) | EXTEND | Already has the right git refusals: `merge --ff-only` on the main checkout, non-forced `fetch . sha:refs/heads/dev` elsewhere, which refuses a non-fast-forward and a `dev` checked out in another worktree. It becomes `syncLocalDev`: typed result, fetched-tip target, no generic `git pull --rebase` advice. |
| Frozen install after `dev` moved under the main checkout | `install` (`branches.ts:2469`) | EXTEND | Reused as is (Q11); its `false` result becomes `installed: false` in the result instead of exit 16 on close paths. |
| Fetch `origin/dev` with lock-race detection | `fetchDev`, `devRefRace`, `TIMEOUTS.LAND_ATTEMPTS` / landing backoff (`.bkit/core/engine/commands/land.ts`) | EXTEND | The end-of-close fetch retries a ref-lock race with the same backoff, bounded by a named `TIMEOUTS` constant. |
| One final message line per run | `shipClose` `finalReturn` (`.bkit/core/engine/commands/workflow/workflows.ts:1488`); `workflows close --final-return`; appended-line precedent at `.bkit/core/workflows/bkit-debug.md:874` | EXTEND | Ship and build / debug closes fold the line into `finalReturn`; design / plan / debug-on-dev / Failure Paths append the line their landing verb emitted, as debug already appends CI lines. |
| "Already on GitHub" proof | git built-in `git cherry` (patch-id); per-file and `.jsonl` added-line comparison in `notOnDev` (`branches.ts:2903`) and `localDevCopies` (`:2927`). Searched `.bkit/core/engine` for `cherry`, `patch-id`: no non-test use. | EXTEND | `notOnDev`'s rule (blob equality, `.jsonl` by added lines because ledgers are union-merged) is generalised from "branch vs `origin/dev`" to "one commit's touched paths vs `origin/dev`". `git cherry` supplies the patch-id tier without custom hashing. |
| Replay chosen commits onto a fresh `origin/dev` in a throwaway checkout | `replayBuild` (`branches.ts:1150`) + `pushToDev` (`land.ts:222`) | EXTEND | `replayBuild` gains a drop-empty mode (today `--allow-empty --keep-redundant-commits` would push empty commits); `pushToDev` gains a no-push option that stops after the gate and returns `{ base, sha, tree }`. |
| Deepest declared gate in the throwaway | `checkLanding` (`land.ts:188`), `requiredPushGate` (`.bkit/core/engine/commands/ci/push-gate.ts:37`) | EXTEND | `requiredPushGate` already returns the deepest gate, the same one `bkit tests run` picks (Q9). `checkLanding` gains a "force full gate" input, because it otherwise runs `bkit:gate:min` for doc-only diffs. |
| Read-only divergence classifier (`bkit branches dev-status`) | `inheritedDevCommits` (`.bkit/core/engine/commands/workflow/worktrees.ts:231`) is branch-scoped; `sync-dev` mutates. Searched `branches.ts`, `worktrees.ts`, `.bkit/cli.md`. | NEW | No verb reports per-commit publish state of local `dev`. A separate read-only verb keeps the settled Q4 contract and is safe to run any time; it shares the classifier with `syncLocalDev`. |
| Approved replay push and local adoption (`bkit branches dev-reconcile`) | `pushOwnCommits` (`branches.ts:1175`) replays a run's own commits but pushes immediately and never moves local `dev`. Searched for `update-ref`, `dev-backup`: no non-test use. | NEW | Nothing splits prepare / approve / push, binds the push to an approved SHA, or moves local `dev` onto a non-descendant with a backup. Built on the EXTEND rows above. |
| Thin recovery prompt | Utility prompt pattern `.bkit/core/prompts/bkit-utility-*.md`, catalogued in `.bkit/prompts.md` § Utility (Ad-hoc), invoked as `@bkit-utility-*` (`DETAILS.md:442`) | NEW | No utility covers git history; follows the existing utility shape, host copies via `bkit upgrade`. |
| Guard that every `dev`-pushing verb reports local sync | None: searched engine tests for a list of `pushToDev(` callers. Precedent for count-budget tests: `docs/capabilities.md` budgets. | NEW | The 6-month premortem: a new `dev`-pushing verb silently skips sync. A contract test pinning the call-site list catches it. |
| Retiring ship step key `ship-switch-to-dev` | `SHIP_STEP_ORDER` (`.bkit/core/engine/checks/status-holes.ts:45`); decision `ship-close-removes-worktree-after-landing` as the retirement precedent; decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) | EXTEND | Old status logs keep validating; new runs stop needing the key. |

## Architecture

Three layers, all in the engine; workflows and the prompt only display what the engine wrote.

1. **Classifier (shared, read-only)** — `classifyDev(root, opts)` in `branches.ts` (or a sibling module under `.bkit/core/engine/commands/workflow/`). Given a fetched `origin/dev`, it returns ahead / behind counts and, on request, per-commit proof for each local-only commit. Two tiers:
   - **Cheap tier** (used by every close): `rev-list --left-right --count` plus the `git cherry origin/dev dev` count of `-` lines (`copies`).
   - **Full tier** (used by `dev-status` / `dev-reconcile`): patch-id, then per-path content equality using `notOnDev`'s `.jsonl` added-line rule, then the `contested` check (paths `origin/dev` changed after the fork point). Batched with `git diff-tree -r --stdin` and `git cat-file --batch-check`. Past a named commit limit it marks `partial: true` and counts the rest as unpublished, never as published.
2. **Automatic sync** — `syncLocalDev(root, { pending?, runtimeDevPushes }, log): LocalDevSync`, the extended `fastForwardDev`. It never throws: a catch-all maps any exception to `unavailable: internal` and logs it. It moves `dev` only on `behind > 0 && ahead == 0`, with today's two non-forced mechanisms. It is called **after** the caller's landing has completed and **outside** the landing's `try`, so the caller's exit code is computed first and never changed.
   - Callers, each emitting `localDev` in its JSON: `branches land` (design / plan, including the `landPr` fallback once merged), `workflows close` for ship (after the head push or merged close PR; open close PR → `pending`) and for build / debug (re-observes the state the earlier mirror left), `roadmap mirror` (Q1; output discarded by build / debug, the following close re-observes), `branches push --mode=dev` (both the plain push and the replay route), `workflows handover --push` / `--flush` (failure records), and `branches sync-dev` (by-hand wrapper).
   - `pushToDev` itself is unchanged in behaviour: its header invariant "the main checkout's branch, index and edits are never touched" (`land.ts:1-9`) stays true.
3. **Recovery** — two verbs plus a prompt.
   - `bkit branches dev-status`: fetch, full-tier classify, print a table; never writes.
   - `bkit branches dev-reconcile --stage=prepare|push|adopt`: stateless stages that each re-derive everything from git refs and their arguments.
   - `@bkit-utility-sync-dev`: thin subagent prompt that runs `dev-status` and `--stage=prepare`, and returns the classification, gate result, prepared SHA and the exact `--stage=push` command. The calling session asks the owner (the standalone push rule) and runs the push.

**Boundaries.**

- The throwaway-checkout isolation of #639 is kept: recovery builds and gates its replay in `.worktrees/_land-*` through `pushToDev`'s no-push option, never in the main checkout.
- The only writes to the main checkout's refs are the fast-forward (automatic), the backup branch and the adoption move (recovery, after approval).
- No path runs `git reset`, a forced push, `stash`, or rewrites `origin/dev`.

**Workflow integration.**

- `bkit-ship.md`: Step 13 (`branches sync-dev`, key `ship-switch-to-dev`) is removed; the close's `finalReturn` carries the line. Resume routes and `ship-merged-on-entry` that point at Step 13 go to the close step.
- `bkit-design.md` / `bkit-plan.md`: the close step holds `branches land`'s `localDev.line` as `LOCAL_DEV_LINE` and the final-return step displays `{FINAL_RETURN}` followed by it.
- `bkit-build.md`: no prose change beyond docs; its `workflows close` folds the line into `finalReturn`.
- `bkit-debug.md`: the close folds the line; the in-place `branches push --mode=dev` route holds its own `localDev.line` and the final-return step appends it after the close's (latest observation shown last).
- Failure Paths that run `workflows handover --push` append its line to the failure message.

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
  | "occupied"            // blocked: dev checked out in another worktree
  | "edited-files"        // blocked: merge --ff-only would overwrite an edit
  | "git-refused"         // blocked: any other refusal
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
  copies: number | null;     // of `ahead`, how many `git cherry` marks as already on origin/dev
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
  - `Local dev: not moved — 2 behind; an uncommitted edit touches a file the update changes. Commit or move it, then run bkit branches sync-dev.`
  - `Local dev: not checked — landing waits on close PR #123; run bkit branches sync-dev after it merges.`
  - `Local dev: synced to origin/dev (abc1234), but the dependency install failed — run the frozen install by hand.`

```ts
interface DevCommitProof {
  sha: string;
  subject: string;           // untrusted text; the prompt fences it
  class: "patch-match" | "content-match" | "empty-on-replay" | "unpublished";
  contested: boolean;        // unpublished, and origin/dev changed one of its paths after the fork point
  paths: string[];
}

interface DevStatus {
  base: string;              // fetched origin/dev
  local: string;             // local dev
  ahead: number; behind: number;
  commits: DevCommitProof[]; // oldest first
  partial: boolean;          // classification stopped at the named limit
  backups: string[];         // existing dev-backup/* branches
  publishRisk: string | null;// remote.*.push / mirror config that would publish dev-backup/*
}

interface ReconcilePrepared {
  base: string; local: string;
  sha: string; tree: string; // the prepared commit the owner approves
  replayed: string[]; excluded: string[]; droppedEmpty: string[];
  gate: string; gateExit: number;
  pushCommand: string;       // exact --stage=push invocation
}
```

- `empty-on-replay` is only known after prepare runs; `dev-status` reports it as `unpublished` until then.
- Refs: `refs/heads/dev-backup/{YYYYMMDD-HHMMSS}` (UTC), created with `git update-ref <ref> <old-tip> ""` (create-only: a same-second collision fails instead of overwriting). Kept until the owner deletes it (Q8). Never pushed by bkit.

## Components / Flows

**`syncLocalDev` (every close / dev push).**

1. Runtime cannot push `dev` → `not-applicable: no-dev-push-runtime`. No `refs/heads/dev` → `not-applicable: no-local-dev`. Caller passes `pending` → `pending: close-pr-open`, no fetch.
2. `fetchDev`; on a ref-lock race retry with landing backoff up to a named `TIMEOUTS` bound; still failing → `unavailable: fetch-failed`.
3. Cheap-tier classify against the fetched tip: `equal`; `ahead` (behind 0); `divergent` (both > 0); behind only → step 4.
4. Main checkout on `dev` → `merge --ff-only -q <target>`; else `fetch -q . <target>:refs/heads/dev`. Refused → re-read local `dev` once: it now contains the target → report `equal` or `fast-forwarded` as observed; else classify stderr into `occupied` / `edited-files` / `git-refused` → `blocked`.
5. Moved and main checkout on `dev` → `install`; `false` → `installed: false`, line says so, state stays `fast-forwarded`.
6. Render `line`; log the refusal stderr; return.

**`bkit branches sync-dev` (by hand).** Thin wrapper over `syncLocalDev`. Keeps its own exit codes for a person at a terminal: fetch failure → the existing fetch exit, install failure → exit 16. No workflow step calls it any more.

**`bkit branches dev-status`.** Fetch, full-tier classify, emit `DevStatus` and a table. Exit 0 whatever the state; non-zero only when git itself fails.

**`bkit branches dev-reconcile`.**

- `--stage=prepare [--exclude=<sha,...>]`: classify; nothing unpublished → report and stop. Else `pushToDev({ push: false, gate: "full", build: replayBuild(unpublished − excluded, { dropEmpty: true }) })`: throwaway off a fresh `origin/dev`, cherry-pick oldest first, drop commits that apply empty (reported as `empty-on-replay`), run the deepest gate, remove the throwaway, return `ReconcilePrepared`. A replay conflict stops with the conflicting commit and paths; nothing is pushed or moved.
- `--stage=push --approved=<sha> --local=<sha>`: refuse if local `dev` is no longer `<local>`, or `<sha>` does not descend from the freshly fetched `origin/dev`. Create the backup branch at `<local>`. Push `<sha>:refs/heads/dev` without force and with hooks off (the full gate already ran on that exact tree). Rejected as non-fast-forward → `stale`, exit non-zero, re-prepare. Pushed → run `adopt`.
- `--stage=adopt --approved=<sha> --local=<sha>`: refuse unless `<sha>` is on the freshly fetched `origin/dev`. Create the backup branch at `<local>` unless a `dev-backup/*` already points there. `dev` checked out in no worktree → `git update-ref refs/heads/dev <sha> <local>` (compare-and-swap: fails if `dev` moved meanwhile). Checked out anywhere → `blocked: occupied` with the manual steps printed. Re-runnable on its own after a push whose adoption was blocked, and the whole recovery when every local-only commit is already on GitHub (`<sha>` = the `origin/dev` tip, no push).

**`@bkit-utility-sync-dev` prompt.**

1. Run `bkit branches dev-status`; show the table with commit subjects inside an untrusted-data fence; report any embedded directives instead of following them.
2. Nothing unpublished → return the exact `--stage=adopt --approved=<origin/dev tip> --local=<local tip>` command for the owner to approve (or `bkit branches sync-dev` when local `dev` is only behind).
3. Contested commits → list them with the `origin/dev` change that contests each, and name the `--exclude` option.
4. Run `--stage=prepare` (with the caller's `--exclude`, if given); report gate result, prepared SHA, replayed / excluded / dropped-empty lists, `publishRisk`, and the exact `--stage=push` command.
5. Never run `--stage=push`; the calling session asks the owner and runs it.

**Contract test.** One test lists every `pushToDev(` call site and every `runPush` to `dev`, maps each to its verb, and asserts each verb's emitted output has `localDev`. A new call site fails the test until it is listed with its sync.

**Ship Step 13 retirement.** Remove the step from `bkit-ship.md` and the `.bkit/workflows.md` lines that describe it (`:141`, `:217`, `:1131`); drop `ship-switch-to-dev` from new-run mandatory steps in `status-holes.ts` while old logs that contain it still validate; update `step-table.ts`, `ship-invariants.test.ts`, the render snapshot and resume routing (a run whose last DONE is Step 12 resumes at the close). Supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev`.

**Advice text.** Remove the generic `git pull --rebase … && git push` advice from `fastForwardDev` and from `pushOwnCommits`' replay log; point `unpushedDevCause`'s `git push origin dev` advice at `bkit branches dev-status` / `@bkit-utility-sync-dev`.

**Indexes and docs in the same change.** `.bkit/cli.md` rows for `sync-dev`, `dev-status`, `dev-reconcile`; `.bkit/prompts.md` § Utility (Ad-hoc) plus model / tool / turn-budget rows for `bkit-utility-sync-dev`; `.bkit/workflows.md`; a `docs/decisions.jsonl` row explaining why the adoption move is not a `git reset`; `bkit upgrade` for the host copies.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One `syncLocalDev`, called by the last `dev`-touching engine verb of each path, after its landing and outside its `try` | Inside `pushToDev` (brainstorm 2's pick); a trailing `branches sync-dev` step in each workflow | Inside `pushToDev` breaks its "main checkout never touched" invariant (`land.ts:1-9`), still misses `landPr` and the plain push in `pushOwnCommits`, and a throw inside its `try` reaches `shipClose`'s mapping to `EXIT_FLUSH_FAILED`, turning a landed close into a failure (breaks Q3). A workflow step repeats the exact prose-ordering slip that caused this issue and departs from Q2. Brainstorm 2's goal ("covered by construction") is kept through the contract test. |
| Contract test pins every `pushToDev(` / `runPush`-to-`dev` call site to a verb that emits `localDev` | Rely on review | The 6-month premortem: a new `dev`-pushing verb silently brings the lag back. |
| Target the freshly fetched `origin/dev` tip, not the landed SHA | Today's `landVerb` fast-forwards to the landed SHA and ignores its fetch result | Draft edge case "one fetch, compare against that"; catches up fully in one move. |
| Keep the non-forced `fetch . <target>:refs/heads/dev` and `merge --ff-only` as the move | `git update-ref refs/heads/dev <new> <old>` compare-and-swap (brainstorm 3) | Truth over agreement: `update-ref` does not refuse when `dev` is checked out in another worktree, so it would move that worktree's branch under its files. The non-forced fetch refuses both a checked-out `dev` and any non-fast-forward, which already stops a parallel close from moving `dev` backwards. `update-ref` with compare-and-swap is used only in recovery adoption, after an explicit "checked out nowhere" check. |
| One state enum plus counts and reason (`LocalDevSync`) | Two axes, `relation` × `outcome` (brainstorm 3); today's bare `skipped` | Only "behind" has more than one outcome; ahead and divergent are never moved by policy, so one enum loses nothing given the counts, and matches the user-facing vocabulary of SC2. It still splits today's `skipped` into ahead / divergent / blocked. |
| Draft change (SC2): add `pending` and `not-applicable` to the state list | Draft SC2's six states | `pending` is Q10 (already in the draft's edge cases); `not-applicable` stops runtimes that cannot push `dev` (claude.ai cloud sessions) from reporting a false `blocked`. |
| Draft change (SC1): name build / debug roadmap mirror and close explicitly; "git can move without touching an edited file" replaces "clean" | Draft SC1 wording "clean, behind-only" | Q7 allows a fast-forward with edits that git accepts; "clean" was narrower than the settled answer. |
| Line adds the `git cherry` count of local-only commits already on GitHub (`copies`) | Counts only | Debug-on-dev replays leave `dev` divergent by construction; "17 of 19 already on GitHub" tells the owner it is bookkeeping, not lost work. Cheap: one `git cherry`. |
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
| Recovery gate = `checkLanding` with the full gate forced (`requiredPushGate`) | `checkLanding`'s default, which runs `bkit:gate:min` for doc-only diffs; a separate `bkit tests run` call | Q9 asks for the deepest declared gate; `requiredPushGate` is the same choice `bkit tests run` makes, and reusing `checkLanding` keeps one validation path (`prepareLandInputs`, clean-tree checks). |
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
- **Cheap tier in every close.** Gain: the line tells the owner whether divergence is mostly copies. Sacrifice: one `git cherry` per close.

## Risks & Open Questions

- Departure from settled Q6 (third proof "applies empty on replay"). Options: A) Accept the third proof and drop empty replays — no empty commits reach `dev`; a commit counts as published on a third kind of evidence · B) Keep Q6's two proofs and keep empty replays as commits — exactly the settled rule; empty commits can land on `dev` · C) Keep Q6's two proofs but refuse to prepare when any replay applies empty, and list them for the owner — no empty commits and no new proof; more manual decisions. Recommended: A — an empty replay proves `origin/dev` already holds every change the commit makes, which is at least as strong as the file-content proof. Default if unanswered: C.
- Adoption when the main checkout is on `dev`. Options: A) Refuse and print manual steps — safest; the owner's common setup always needs manual steps · B) When the main checkout's tracked tree is clean and nothing is staged: `git switch --detach`, compare-and-swap `update-ref`, `git switch dev` — automatic for the common case; a crash mid-sequence leaves a detached HEAD, and switching disturbs any agent working in that checkout · C) `git reset --keep` — one command; banned by `.agents/rules.md` § Destructive git and the issue's no-reset constraint. Recommended: B — the clean-tree precondition makes the switch lossless and the backup branch covers the rest. Default if unanswered: A.
- Close exit on install failure after a fast-forward (changes ship's current exit 16 → Failure Path). Options: A) Exit 0 with `installed: false` in the line — matches Q3 / Q11; a broken install is only visible in the message · B) Keep exit 16 on ship only — current behaviour; a landed ship reported as failed · C) Exit 0 and also write a `friction` row — visible later in stats; one more write in the close. Recommended: A — Q3 says a landed close is a success. Default if unanswered: A.
- Whether the utility subagent may run `--stage=prepare`, which makes cherry-pick commits in a detached throwaway checkout (never on a branch). Options: A) Utility runs prepare — one hand-off; the engine, not the agent, creates local objects · B) Utility runs `dev-status` only; the calling session runs prepare and push — strict reading of "subagents do not commit"; more steps in the main session. Recommended: A — the commits never reach a branch until the approved push, and `pushOwnCommits` already makes the same kind of throwaway commits from verbs. Default if unanswered: A.
- Assumption: a prepared commit object survives until the push stage. Objects in a removed throwaway are unreachable and `git gc` prunes them after `gc.pruneExpire` (two weeks by default). If missing, `--stage=push` reports it and the utility re-prepares; the plan should verify this and decide whether a `refs/bkit/` holding ref is worth adding.
- Risk: renaming `devLocal` → `localDev` is a contract change; the plan must read every hit under `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` (including `close-squash.integration.test.ts`, `step-table.ts`) and trace resume, no-plan convert, per-group loop and remediation paths.
- Risk: retiring `ship-switch-to-dev` trips `status-holes.ts` (`SHIP_STEP_ORDER`), `status-holes.test.ts`, `ship-invariants.test.ts`, the `bkit-ship.none.txt` render snapshot and resume routes that name Step 13; old status logs must still validate.
- Risk: debug-on-dev replays and failure-record handovers from `dev` will report `divergent` / `blocked: edited-files` routinely. The line wording must make that read as expected bookkeeping, with tests pinning both.
- Risk: provider parity. The new prompt needs host copies, `.bkit/prompts.md` rows (catalog, model, tools, turn budget) and `.bkit/cli.md` rows, all in the same change; verify on every provider per Project Rules § Provider parity.
- Risk: file-content proof edge cases (mode-only changes, deletions, submodules, LFS pointers, renames) each need a named test, because a wrong "published" verdict drops work from the replay (the backup branch still holds it).
- Dependency: #842 gap E (feature branch cut from an unpushed local `dev`) produces exactly the squashed copies this recovery classifies; the two must not both change `unpushedDevCause`'s advice differently.
