<!-- bkit:anchor
baseSha: d59bafecfe3f0d34093c043cbe644b6d0ba5b7ab
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Design: Keep local `dev` level with `origin/dev` after every landing

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

Built from the input's `Draft Acceptance Scenario` (Q12, accepted) and narrowed to the issue's scope decision of 2026-11-10. Each change to it is a `Decisions` row marked "Draft change".

### Narrative

When I finish a design, plan, build, debug or ship run, or anything else bkit does pushes to `dev`, my local `dev` ends level with GitHub's whenever a fast-forward can do it safely. When it can't, the final message tells me plainly that my work landed, how far my local `dev` is ahead or behind, why it wasn't moved, and what to do by hand.

### Success Criteria

1. After any close or push to `dev` (design, plan, ship including its final `ship DONE` commit, build / debug roadmap mirror and close, debug `branches push --mode=dev`, the `ci dispatch-gate` re-trigger, `branches force-build`, failure-record handovers including `workflows handover --push` in abort mode), a behind-only local `dev` that git can move without touching an edited file ends equal to `origin/dev`. Equal stays a no-op.
2. Every such path reports exactly one local-sync result in its final message: `equal`, `fast-forwarded`, `ahead`, `divergent`, `blocked` (with reason), `unavailable` (with reason), `pending` (close PR not merged) or `not-applicable` (runtime with no local `dev`); no local-sync result ever changes the close's exit code.
3. Automatic sync never alters local commits, staged changes, working-tree edits, the active branch or another worktree, and never moves local `dev` backwards or onto a non-descendant.
4. The `ahead` and `divergent` lines give the counts and a plain manual step, and never advise `git pull --rebase`.
5. Tests cover equal / behind / ahead / divergent, edited and occupied worktrees, fetch failure, a ship close PR that stays unmerged (`pending`), and a landed close whose sync is blocked still exiting 0.

### Key Edge Cases

- `origin/dev` moves between landing and sync: one fetch after the landing; the target is that fetched tip, not the landed SHA; the result reports the state actually observed.
- Two parallel closes in one clone: each only fast-forwards with a non-forced update; git refuses the move that would go backwards, the refused close re-reads local `dev` once and reports what it finds; the later tip wins.
- Ship close falls back to an unmerged PR: `pending`, no fetch, nothing moved.
- `dev` checked out in a linked worktree: git refuses the ref update; `blocked: occupied`, read from `git worktree list --porcelain`, whatever git's locale.
- Main checkout on `dev` with an edit to a file the update changes (always the case after a failure-record handover from `dev`), or an untracked file at a path the update adds: `merge --ff-only` refuses; `blocked: edited-files`, read from git state, whatever git's locale; the close still exits 0.
- Debug run in place on `dev` whose own commits were replayed onto a fresh `origin/dev`: local `dev` is divergent by construction; the line says how many of the local-only commits are this run's own, replayed as copies, so the owner can tell bookkeeping from lost work.
- The fast-forward succeeds but the frozen install fails: state stays `fast-forwarded`, `installed: false`, the line says the install failed and how to re-run it, and the close exits 0.

### Process Sketch

- WHEN a close lands on `origin/dev` and local `dev` is only behind and git accepts the fast-forward → THEN local `dev` is fast-forwarded (frozen install when the main checkout is on `dev`) and the final message says local dev synced.
- WHEN local `dev` has commits `origin/dev` lacks → THEN it is left untouched and the final message says: landed; local dev N ahead / M behind; list the local-only commits with `git log --oneline origin/dev..dev` and bring local `dev` level by hand.
- WHEN the fetch fails, the move is refused or the close PR is still open → THEN the landing still counts as done and the line reports `unavailable`, `blocked` or `pending` with the reason and `bkit branches sync-dev` as the retry.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Safe fast-forward of local `dev` after a landing | `fastForwardDev` (`.bkit/core/engine/commands/workflow/branches.ts:2863`), called by `landVerb` (`:2961`) and `syncDevVerb` (`:2454`) | EXTEND | Already has the right git refusals: `merge --ff-only` on the main checkout, non-forced `fetch . sha:refs/heads/dev` elsewhere, which refuses a non-fast-forward and a `dev` checked out in another worktree. It becomes `syncLocalDev`: typed result, fetched-tip target, refusal reason read from git state rather than git's localised stderr, no generic `git pull --rebase` advice. |
| Ahead / behind counts | `git rev-list --left-right --count` | REUSE | One git call gives both counts; no per-commit classification. |
| Frozen install after `dev` moved under the main checkout | `install` (`branches.ts:2469`) | EXTEND | Reused as is (Q11); its `false` result becomes `installed: false` in the result instead of exit 16 on close paths. |
| Fetch `origin/dev` with lock-race detection | `fetchDev`, `devRefRace`, `TIMEOUTS.LAND_ATTEMPTS` / landing backoff (`.bkit/core/engine/commands/land.ts`) | EXTEND | The end-of-close fetch retries a ref-lock race with the same backoff, bounded by a named `TIMEOUTS` constant. |
| One final message line per run | `shipClose` `finalReturn` (`.bkit/core/engine/commands/workflow/workflows.ts:1488`); `workflows close --final-return`; appended-line precedent at `.bkit/core/workflows/bkit-debug.md:874` | EXTEND | Ship and build / debug closes fold the line into `finalReturn`; design / plan / debug-on-dev / Failure Paths append the line their landing verb emitted, as debug already appends CI lines. |
| Guard that every `dev`-pushing verb reports local sync | None: searched engine tests for a list of `pushToDev(` callers. Precedent for count-budget tests: `docs/capabilities.md` budgets, which count markers and cannot check "every caller then calls X". | NEW | The 6-month premortem: a new `dev`-pushing verb silently skips sync. Pinning direct call sites is not enough: `pushOwnCommits` alone sits behind six `pushBranch` callers. A contract test that checks reachability from every push to `dev` to a verb that emits `localDev` catches it. |
| Retiring ship step key `ship-switch-to-dev` | `SHIP_STEP_ORDER` (`.bkit/core/engine/checks/status-holes.ts:45`); decision `ship-close-removes-worktree-after-landing` as the retirement precedent; decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) | EXTEND | Old status logs keep validating; new runs stop needing the key. |

## Architecture

One engine function and its callers; workflows only display what the engine wrote.

1. **Automatic sync** — `syncLocalDev(root, { pending?, replayedOwn?, runtimeDevPushes }, log): LocalDevSync`, the extended `fastForwardDev`. It never throws: a catch-all maps any exception to `unavailable: internal`, logs the stack and writes one `friction` row so a bug hidden by the catch-all still surfaces. It counts ahead / behind with `rev-list --left-right --count` against the fetched tip and moves `dev` only on `behind > 0 && ahead == 0`, with today's two non-forced mechanisms. It is called **after** the caller's landing has completed and **outside** the landing's `try`, so the caller's exit code is computed first and never changed.
2. **Callers**, each emitting `localDev` in its JSON:
   - `branches land` (design / plan, including the `landPr` fallback once merged).
   - `workflows close` for ship (after the head push or merged close PR; open close PR → `pending`) and for build / debug (re-observes the state the earlier mirror left).
   - `roadmap mirror` (Q1; output discarded by build / debug, the following close re-observes).
   - `pushOwnCommits` (`branches.ts:1175`), once, after its switch over `DevPush` and without throwing. On the replay route it passes the number of the run's own commits it replayed as `replayedOwn`. This one call covers every `pushBranch` route that pushes `dev`, by plain push or by replay: `branches push --mode=dev`, the `ci dispatch-gate` CI re-trigger (`runs.ts:881`), `branches force-build` (`branches.ts:1819`) and `workflows handover --push` in abort mode (`workflows.ts:896`). Each of those verbs passes the result through as `localDev`.
   - `workflows handover --push` / `--flush` on the failure-record route (`landFailedRecord`).
   - `branches sync-dev` (by-hand wrapper).
   - `pushCurrentBranch` (`runs.ts:728`) needs no call: its only caller, `ciDispatchGate` (`runs.ts:868`), reaches it only when the run has no shared-checkout record, and a shared branch without a record returns `EXIT_RETRIGGER_FAILED` before that (`runs.ts:850`). So it never pushes `dev`. The contract test still covers it, so a new caller that reaches it on `dev` fails the test.
   - `pushToDev` itself is unchanged in behaviour: its header invariant "the main checkout's branch, index and edits are never touched" (`land.ts:1-9`) stays true.
   - Logging: `syncLocalDev` logs under the owning module's prefix `[bkit-branches]` on stderr (`docs/observability.md` § Log Format). The refusal stderr and the `unavailable: internal` stack go there at warn level.

**Boundaries.**

- The throwaway-checkout isolation of #639 is kept: no landing moves into the main checkout.
- The only write to the main checkout's refs is the fast-forward.
- No path runs `git reset`, a forced push, `stash`, or rewrites `origin/dev`.

**Workflow integration.**

- `bkit-ship.md`: Step 13 (`branches sync-dev`, key `ship-switch-to-dev`) is removed; the close's `finalReturn` carries the line. Resume routes and `ship-merged-on-entry` that point at Step 13 go to the close step.
- `bkit-design.md` / `bkit-plan.md`: the close step holds `branches land`'s `localDev.line` as `LOCAL_DEV_LINE` and the final-return step displays `{FINAL_RETURN}` followed by it.
- `bkit-build.md`: no prose change beyond docs; its `workflows close` folds the line into `finalReturn`.
- `bkit-debug.md`: the close folds the line; the in-place `branches push --mode=dev` route holds its own `localDev.line` and the final-return step appends it after the close's (latest observation shown last).
  - On that route `LOCAL_DEV_LINE` holds the line of the last `dev`-pushing verb the run called. When `ci dispatch-gate` re-triggered CI after `branches push --mode=dev`, its line replaces the push's line, because the re-trigger commit moved `origin/dev` again.
- Failure Paths that run `workflows handover --push` (including abort mode) append its line to the failure message.

**Out of scope.**

- Any tool that reconciles an existing divergence: inspecting which local-only commits GitHub already holds, replaying unpublished commits, backup branches or moving local `dev` onto a non-descendant.
- Recording how often local sync ends blocked or divergent as telemetry (deferred, `scope-declared`).
- Changing `pushOwnCommits` to prefer the plain push so that debug-on-dev runs stop creating copies (deferred, `scope-declared`).
- Feature-branch catch-up and pre-merge CI validation: #842.

## Data Model

No database. Engine result types only.

```ts
type LocalDevState =
  | "equal"
  | "fast-forwarded"
  | "ahead"
  | "divergent"
  | "blocked"
  | "unavailable"
  | "pending"
  | "not-applicable";

type LocalDevReason =
  | "occupied" // blocked: dev checked out in another worktree (git state, not stderr)
  | "edited-files" // blocked: merge --ff-only would overwrite an edit or an untracked file (git state, not stderr)
  | "git-refused" // blocked: any other refusal, including a non-fast-forward
  | "fetch-failed" // unavailable
  | "internal" // unavailable: exception caught
  | "close-pr-open" // pending
  | "no-local-dev" // not-applicable: refs/heads/dev missing
  | "no-dev-push-runtime"; // not-applicable: runtime cannot push dev

interface LocalDevSync {
  state: LocalDevState;
  reason: LocalDevReason | null;
  ahead: number | null; // local-only commits; null when not observed
  behind: number | null;
  replayedOwn: number | null; // of `ahead`, the run's own commits pushOwnCommits replayed as copies; null off that route
  from: string | null; // local dev before
  to: string | null; // local dev after (= from unless moved)
  target: string | null; // fetched origin/dev tip compared against
  installed: boolean | null; // frozen install result; null = not run
  line: string; // one plain sentence for the final message
}
```

- Every `dev`-pushing verb emits it under one field name, `localDev`. `sync-dev` today emits `devLocal` (`branches.ts:2464`); it is renamed, which is a contract change traced through `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` per Project Rules § Contract changes.
- `line` examples:
  - `Local dev: synced to origin/dev (abc1234).`
  - `Local dev: not moved — 2 ahead of origin/dev; those commits are not on GitHub. Push them with git push origin dev if they belong there.`
  - `Local dev: not moved — 19 ahead / 1 behind origin/dev (divergent). List the local-only commits with git log --oneline origin/dev..dev and bring local dev level by hand.`
  - `Local dev: not moved — 2 behind; an uncommitted edit touches a file the update changes. Commit or move it, then run bkit branches sync-dev.`
  - `Local dev: not checked — landing waits on close PR #123; run bkit branches sync-dev after it merges.`
  - `Local dev: synced to origin/dev (abc1234), but the dependency install failed — run the frozen install by hand.`
- The two routine cases get a short wording of their own, so the owner can tell bookkeeping from a real problem. Tests pin both:
  - After debug-on-dev, when `replayedOwn` equals `ahead`: `Local dev: 3 ahead / 1 behind — all 3 are this run's own commits, which landed on GitHub as copies (expected after a debug run on dev). List them with git log --oneline origin/dev..dev and bring local dev level by hand.`
  - After a failure-record handover from `dev` with reason `edited-files`: `Local dev: not moved — the failure record's edits touch files the update changes (expected after a failure handover on dev). Run bkit branches sync-dev once they are committed or moved.`

## Components / Flows

**`syncLocalDev` (every close / dev push).**

1. Runtime cannot push `dev` → `not-applicable: no-dev-push-runtime`. No `refs/heads/dev` → `not-applicable: no-local-dev`. Caller passes `pending` → `pending: close-pr-open`, no fetch.
2. `fetchDev`; on a ref-lock race retry with landing backoff up to a named `TIMEOUTS` bound; still failing → `unavailable: fetch-failed`.
3. Count ahead / behind against the fetched tip with `rev-list --left-right --count`: `equal`; `ahead` (behind 0); `divergent` (both > 0); behind only → step 4.
4. Main checkout on `dev` → `merge --ff-only -q <target>`; else `fetch -q . <target>:refs/heads/dev`. Refused (non-zero exit) → re-read local `dev` once: it now contains the target → report `equal` or `fast-forwarded` as observed; else `blocked`, with the reason read from git state, never from stderr, checked in this order:
   1. `git worktree list --porcelain` shows `branch refs/heads/dev` in a worktree other than the one the move ran in → `occupied`.
   2. The main checkout is on `dev`, and either a path in `git diff --name-only HEAD` is also in `git diff --name-only HEAD <target>`, or an untracked path from `git ls-files --others --exclude-standard` is a path the update adds → `edited-files`.
   3. Anything else → `git-refused`.
   - Reason: git's stderr is localised. Under `LC_ALL=de_DE.UTF-8` both refusals carried German text and an English-pattern classifier fell through to `git-refused`. With `-q`, a non-fast-forward refusal prints no stderr at all.
5. Moved and main checkout on `dev` → `install`; `false` → `installed: false`, line says so, state stays `fast-forwarded`. Nothing else is written: no `friction` row, no exit change.
6. Render `line`; log the refusal stderr under `[bkit-branches]` at warn level; return.

**`bkit branches sync-dev` (by hand).** Thin wrapper over `syncLocalDev`. Keeps its own exit codes for a person at a terminal: fetch failure → the existing fetch exit, install failure → exit 16. No workflow step calls it any more.

**Contract tests.**

- Engine side: the test checks reachability, not direct call sites. It starts from every push that can reach `dev`: `pushToDev`, `runPush` to `dev`, and any `runGit` `push` to a shared branch (`pushCurrentBranch` included). It follows each one up through its callers (`pushOwnCommits` → `pushBranch` → each verb) and asserts that every verb it reaches emits `localDev`. A new path that reaches a push to `dev` fails the test until its verb emits the result.
- Workflow side: a render-snapshot assertion checks that `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md` and every Failure Path that runs `workflows handover --push` show `localDev.line`. The engine-side test cannot catch a workflow that drops the line.

**Ship Step 13 retirement.** Remove the step from `bkit-ship.md` and the `.bkit/workflows.md` lines that describe it (`:141`, `:217`, `:1131`); drop `ship-switch-to-dev` from new-run mandatory steps in `status-holes.ts` while old logs that contain it still validate; update `step-table.ts`, `ship-invariants.test.ts`, the render snapshot and resume routing (a run whose last DONE is Step 12 resumes at the close). Supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev`.

**Advice text.** Remove the generic `git pull --rebase … && git push` advice from `fastForwardDev` (`branches.ts:3135`) and from `pushOwnCommits`' replay log (`branches.ts:1276`); the replay log gives the divergent manual step instead. The "publish `dev` (git push origin dev)" advice in `unpushedDevCause` (`branches.ts:3173`), `inheritedDevRefusal` (`worktrees.ts:264`) and the base-branch refusal (`worktrees.ts:277`) stays as it is.

**Indexes and docs in the same change.** `.bkit/cli.md` row for `sync-dev`, generated from the verb spec with `pnpm cli:sync` (`docs/architecture.md:86`): edit the spec, not the doc row; `.bkit/workflows.md`; a `docs/decisions.jsonl` row superseding `ship-sync-dev-fast-forward-only-never-push-local-dev`.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One `syncLocalDev`, called by the last `dev`-touching engine verb of each path, after its landing and outside its `try` | Inside `pushToDev` (brainstorm 2's pick); a trailing `branches sync-dev` step in each workflow | Inside `pushToDev` breaks its "main checkout never touched" invariant (`land.ts:1-9`), still misses `landPr` and the plain push in `pushOwnCommits`, and a throw inside its `try` reaches `shipClose`'s mapping to `EXIT_FLUSH_FAILED`, turning a landed close into a failure (breaks Q3). A workflow step repeats the exact prose-ordering slip that caused this issue and departs from Q2. Brainstorm 2's goal ("covered by construction") is kept through the contract test. |
| Contract test checks reachability: every verb reachable from `pushToDev`, a `runPush` to `dev` or a `runGit` `push` to a shared branch emits `localDev`; a render-snapshot assertion checks that the workflows show `localDev.line` | Pin direct `pushToDev(` / `runPush` call sites; rely on review | The 6-month premortem: a new `dev`-pushing verb silently brings the lag back. Direct call sites map `pushOwnCommits` to one function with six callers and never see `pushCurrentBranch`; the engine test cannot see a workflow that drops the line. |
| `syncLocalDev` is called once at the end of `pushOwnCommits`, after its `DevPush` switch, without throwing | One call in each of its verbs | Covers every `pushBranch` route that pushes `dev` (`branches push --mode=dev`, the `ci dispatch-gate` re-trigger, `branches force-build`, `workflows handover --push` in abort mode) in one place, and leaves `pushToDev` untouched. Settled Q1 says "every push to `dev`". |
| Draft change (SC1): name the re-trigger, force-build and abort-mode handover paths | Draft wording | The draft's path list missed the `pushBranch` → `pushOwnCommits` routes. |
| Draft change (narrative, SC4, SC5, sketch): no recovery tool; `ahead` / `divergent` lines give a manual step; the test list is the issue's | Draft SC4 (recovery classifies, replays and adopts with a backup branch); `@bkit-utility-sync-dev` in the lines | Owner scope decision on #849 (2026-11-10), which withdraws Q4, Q5, Q6, Q8 and Q9: the recurring pain is local `dev` falling behind, which a fast-forward fixes; no case has needed a tool; the recovery part carried most of the risk (5 of 11 spike claims disproven). |
| Counts only: `rev-list --left-right --count`, no `git cherry` copy count | A copy count in every line | Settled by the scope decision. The spike showed `git cherry` missing a real copy after a `git pull` merge and pairing unrelated empty commits, so the count needed exceptions of its own. |
| `pushOwnCommits` passes `replayedOwn`, the number of the run's own commits it replayed; the debug-on-dev routine line uses it | No routine wording for debug-on-dev; a copy check | Debug-on-dev replays leave `dev` divergent by construction, and without a routine wording the owner learns to ignore the line. `pushOwnCommits` already holds that number, so the line is exact without classifying commits. |
| `ahead` / `divergent` lines name a read-only command (`git log --oneline origin/dev..dev`) and say "by hand"; they name no history-rewriting command | Print `git reset --keep origin/dev` or `git branch -f dev origin/dev` | Agents read the line, and `.agents/rules.md` § Destructive git bans them from running a reset. Which local commits to keep is the owner's call. |
| The "publish `dev` (git push origin dev)" advice in `unpushedDevCause`, `inheritedDevRefusal` and the base-branch refusal stays unchanged | Point it at the divergent manual step | It fires on unpushed local `dev` work, where a push is the right step. Its wording for commits already squashed on GitHub belongs to #842 gap E, which changes the same message. |
| `blocked` reasons come from git state (`worktree list --porcelain`; overlap of edited and untracked paths with the paths the update changes or adds), never from stderr | Classify git's stderr text; run the refusing calls with `LC_ALL=C` | The spike showed both refusals falling through to `git-refused` under a German git, and a quiet (`-q`) non-fast-forward printing no stderr. `LC_ALL=C` worked in the probe but still parses English text that git may reword; git state held under the German locale. |
| Target the freshly fetched `origin/dev` tip, not the landed SHA | Today's `landVerb` fast-forwards to the landed SHA and ignores its fetch result | Draft edge case "one fetch, compare against that"; catches up fully in one move. |
| Keep the non-forced `fetch . <target>:refs/heads/dev` and `merge --ff-only` as the move | `git update-ref refs/heads/dev <new> <old>` compare-and-swap (brainstorm 3) | `update-ref` does not refuse when `dev` is checked out in another worktree, so it would move that worktree's branch under its files. The non-forced fetch refuses both a checked-out `dev` and any non-fast-forward, which already stops a parallel close from moving `dev` backwards. |
| One state enum plus counts and reason (`LocalDevSync`) | Two axes, `relation` × `outcome` (brainstorm 3); today's bare `skipped` | Only "behind" has more than one outcome; ahead and divergent are never moved by policy, so one enum loses nothing given the counts, and matches the user-facing vocabulary of SC2. It still splits today's `skipped` into ahead / divergent / blocked. |
| Draft change (SC2): add `pending` and `not-applicable` to the state list | Draft SC2's six states | `pending` is Q10 (already in the draft's edge cases); `not-applicable` stops runtimes that cannot push `dev` (claude.ai cloud sessions) from reporting a false `blocked`. |
| Draft change (SC1): name build / debug roadmap mirror and close explicitly; "git can move without touching an edited file" replaces "clean" | Draft SC1 wording "clean, behind-only" | Q7 allows a fast-forward with edits that git accepts; "clean" was narrower than the settled answer. |
| Close paths exit 0 when local sync is blocked, unavailable or the install failed; the install failure shows only in the line, with no `friction` row; standalone `sync-dev` keeps exit 16 for install failure | Keep ship's install failure → exit 16 → Failure Path; exit 0 plus a `friction` row | Owner answer (2026-11-10), with Q3 and Q11: a landed close is a success and discloses the install failure in its line. This changes ship's current route (today Step 13 exit 16 → Failure Path). |
| Remove ship Step 13 and retire key `ship-switch-to-dev`; supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev` | Keep Step 13 as a no-op | Settled Q2. Old logs still validate; resume from Step 12 routes to the close. |
| Design / plan / debug-on-dev / Failure Paths display the landing verb's `localDev.line` after `{FINAL_RETURN}`; ship / build / debug closes fold it into `finalReturn` | Re-order design / plan so `branches land` runs before `workflows close --final-return` | The final return is built before the landing in design / plan (`bkit-design.md:578` before `:583`) and debug-on-dev (`bkit-debug.md:726` before `:750`); re-ordering touches lock and worktree teardown. Appending one engine-written line has precedent at `bkit-debug.md:874`. |
| `roadmap mirror` also calls `syncLocalDev` (result discarded by build / debug) | Mirror skips sync because the close re-observes | Settled Q1 lists mirror pushes; the cost is one extra fetch, and a standalone mirror then reports too. The sync is idempotent, so the close's second look converges. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Shared `syncLocalDev` called by each `dev`-pushing verb (brainstorm 1 A) | MERGED | Core of the design: engine-owned, one result shape, reuses `fastForwardDev` / `install` / `fetchDev`. |
| Converge at the terminal verb; sync never throws, never changes exit (brainstorm 3 A) | MERGED | Supplies the never-throw wrapper, fetched-tip target, ref-lock retry and contract test. Its `update-ref` move for automatic sync is rejected (Decisions). |
| Sync inside the shared landing routine `pushToDev` (brainstorm 2 A, brainstorm 1 B, brainstorm 3 B) | REJECTED | Breaks `land.ts`'s "main checkout never touched" invariant, can turn a landed ship close into `EXIT_FLUSH_FAILED`, and still misses `landPr` and the plain push. Its "covered by construction" goal is kept via the contract test. |
| Explicit per-command call without a guard (brainstorm 2 B) | MERGED | Same shape as the chosen approach; the missing guard is what the contract test adds. |
| Trailing `branches sync-dev` step in each workflow (brainstorm 1 C, brainstorm 3 C) | REJECTED | Relies on prose ordering across 5 workflows and their Failure Paths, the exact class of slip that caused this issue; departs from settled Q2. |
| Local `dev` as a derived mirror force-aligned to `origin/dev` (brainstorm 2 C) | REJECTED | Violates the no-reset / no-silent-rewrite constraints; people do commit on `dev`. |
| Recovery tool for an existing divergence (`dev-status`, staged `dev-reconcile`, `@bkit-utility-sync-dev`) | REJECTED | Out of scope by the owner's scope decision (Decisions). |

## Trade-offs Accepted

- **Per-verb call, not inside the landing routine.** Gain: `pushToDev` stays a pure landing with no side effect on the main checkout, a sync bug can never fail a landing, and each verb's output shows where local `dev` moved. Sacrifice: coverage depends on a call per verb; the contract test turns that into a red test rather than structure.
- **Appending a line in design / plan / debug-on-dev instead of rebuilding the final return.** Gain: no reordering of lock release and worktree teardown. Sacrifice: four workflow sources gain one held variable and one display clause, and the line sits after, not inside, the summary.
- **Close exit 0 on install failure, line only.** Gain: Q3 holds everywhere; a landed ship is never sent down the Failure Path for a local install problem, and the close does one write fewer. Sacrifice: a broken local `node_modules` after a ship is only visible in the final line, not as a failed run or in `bkit stats`.
- **Mirror also syncs.** Gain: literal Q1 coverage; a standalone mirror reports. Sacrifice: one extra fetch per build / debug run.
- **Counts without a copy check.** Gain: one git call per close and no classification rules to get wrong. Sacrifice: outside debug-on-dev, a divergent line cannot say whether the local-only commits are already on GitHub; the owner checks with `git log`.

## Risks & Open Questions

- Risk: the untracked-path rule in `edited-files` (an untracked file at a path the update adds, which `merge --ff-only` also refuses) has no spike evidence; the edited-worktree test includes that case.
- Risk: renaming `devLocal` → `localDev` is a contract change; the plan must read every hit under `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` (including `close-squash.integration.test.ts`, `step-table.ts`) and trace resume, no-plan convert, per-group loop and remediation paths.
- Risk: retiring `ship-switch-to-dev` trips `status-holes.ts` (`SHIP_STEP_ORDER`), `status-holes.test.ts`, `ship-invariants.test.ts`, the `bkit-ship.none.txt` render snapshot and resume routes that name Step 13; old status logs must still validate.
- Risk: debug-on-dev replays and failure-record handovers from `dev` will report `divergent` / `blocked: edited-files` routinely. Each gets the short routine wording from Data Model, with tests pinning both, so the owner does not learn to ignore the line.
- Risk: provider parity for the workflow edits; verify on every provider per Project Rules § Provider parity.
- Dependency: #842 gap E (feature branch cut from an unpushed local `dev`) changes `unpushedDevCause`'s advice; this design leaves that advice unchanged so the two changes cannot diverge.

## Suggested Workstreams

### WS-5: Advice Text

#### Scope

- Remove the generic `git pull --rebase … && git push` advice from `pushOwnCommits`' replay log (`branches.ts:1276`) and replace it with the divergent manual step from Data Model.
- Leave the "publish `dev` (git push origin dev)" advice in `unpushedDevCause` (`branches.ts:3173`), `inheritedDevRefusal` (`worktrees.ts:264`) and the base-branch refusal (`worktrees.ts:277`) unchanged.
- `pnpm build && git add dist/` in the same change.

#### Requires

[]

#### Rationale

A small text-only unit in `branches.ts`, apart from the behaviour changes. The `fastForwardDev` advice is removed inside WS-6's rewrite instead, because that function is replaced there.

### WS-6: Automatic Sync Core (`syncLocalDev`)

#### Scope

- Architecture layer 1: `syncLocalDev(root, { pending?, replayedOwn?, runtimeDevPushes }, log): LocalDevSync`, the extended `fastForwardDev` (`branches.ts:2863`).
- Data model: `LocalDevState`, `LocalDevReason`, `LocalDevSync`.
- Flow steps 1-6: `not-applicable` (runtime / no local `dev`), `pending` without fetch; `fetchDev` with ref-lock retry on landing backoff, bounded by a named `TIMEOUTS` constant → `unavailable: fetch-failed`; ahead / behind from `rev-list --left-right --count` against the fetched tip (not the landed SHA); move only on `behind > 0 && ahead == 0` with `merge --ff-only -q` or non-forced `fetch -q . <target>:refs/heads/dev`; on refusal re-read local `dev` once, then reasons from git state in order `occupied` → `edited-files` (tracked overlap and untracked paths the update adds) → `git-refused`, never from stderr; `install` (`branches.ts:2469`) on a move under the main checkout, `false` → `installed: false` with no `friction` row and no exit change.
- Never throws: catch-all → `unavailable: internal`, stack logged, one `friction` row. Refusal stderr and stack at warn level under `[bkit-branches]`.
- `line` rendering, including the two routine wordings (debug-on-dev `replayedOwn` = `ahead`; failure-handover `edited-files`), the `ahead` and `divergent` manual steps, `pending` and install-failure lines; tests pin both routine wordings.
- Standalone `bkit branches sync-dev` stays a thin wrapper with its own exit codes (fetch exit, install failure → 16).
- Remove the generic `git pull --rebase` advice from `fastForwardDev` as part of the rewrite.
- Contract change: rename `sync-dev`'s `devLocal` (`branches.ts:2464`) → `localDev`; `grep -l` across `.bkit/core/workflows/`, `.bkit/core/prompts/`, `.bkit/core/docs/templates/`, read every hit in full (including `close-squash.integration.test.ts`, `step-table.ts`), trace resume, no-plan convert, per-group loop and remediation paths. `sync-dev`'s verb spec → `.bkit/cli.md` via `pnpm cli:sync`.
- Tests: equal / behind / ahead / divergent; edited worktrees (tracked edit and an untracked file at a path the update adds) and an occupied worktree; fetch failure.
- Out of scope, recorded here so it is not picked up: telemetry on how often sync ends blocked or divergent (deferred, `scope-declared`).
- `pnpm build && git add dist/` in the same change.

#### Requires

[]

#### Rationale

The single function every close calls, with the safety properties of SC3 (never alters local work, never moves backwards, never changes an exit code). It is built and tested once before any caller is wired.

### WS-7: Engine Caller Wiring and Reachability Contract Test

#### Scope

- Call `syncLocalDev` after each landing and outside its `try`, so the caller's exit code is computed first, and emit `localDev` in each verb's JSON:
  - `branches land` (`landVerb`, `branches.ts:2961`), including the `landPr` fallback once merged.
  - `workflows close` for ship (after the head push or merged close PR; open close PR → `pending`, including the final `ship DONE` commit path) and for build / debug; fold `line` into `shipClose`'s `finalReturn` (`workflows.ts:1488`) and the build / debug `finalReturn`.
  - `roadmap mirror` (result discarded by build / debug).
  - `pushOwnCommits` (`branches.ts:1175`): one call after the `DevPush` switch, without throwing, passing `replayedOwn` on the replay route; `branches push --mode=dev`, `ci dispatch-gate` (`runs.ts:881`), `branches force-build` (`branches.ts:1819`) and `workflows handover --push` in abort mode (`workflows.ts:896`) pass it through as `localDev`.
  - `workflows handover --push` / `--flush` on the failure-record route (`landFailedRecord`).
- `pushCurrentBranch` (`runs.ts:728`) gets no call; the contract test still covers it.
- `pushToDev` behaviour unchanged.
- Engine contract test: reachability from every push that can reach `dev` (`pushToDev`, `runPush` to `dev`, `runGit` `push` to a shared branch including `pushCurrentBranch`), up through callers, asserting every reached verb emits `localDev`.
- Tests: a ship close PR that stays unmerged (`pending`, no fetch); a landed close whose sync is blocked still exits 0 (SC2).
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
- Supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) with a new row; ship's install-failure route changes from Step 13 exit 16 → Failure Path to the close's line (per WS-6).
- `pnpm build && git add dist/` for engine edits; mirrors via `bkit upgrade` once at the end.

#### Requires

[WS-7]

#### Rationale

The ship step contract (status validation, step table, resume routing) is its own domain with its own tests. It can only be removed once the ship close itself syncs and reports (WS-7); removing it earlier would leave ship with no local sync at all.

## Suggested Plans

### P-1: Automatic Local `dev` Sync on Every Landing

#### Deliverable

`syncLocalDev` called by every engine verb that pushes `dev`, each emitting `localDev` with one plain final-message line; design, plan, build, debug, ship and Failure Paths display it; ship Step 13 retired with old status logs still validating; the wrong `git pull --rebase` advice removed; the reachability and render-snapshot contract tests that keep future `dev`-pushing paths covered. Changes every close path and ship's step contract, so it carries its own rollout and rollback.

#### Covers

[WS-5, WS-6, WS-7, WS-8, WS-9]

#### Requires

[]
