# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

Grounding (read, not assumed):

- Every dev write except two goes through `pushToDev` (`.bkit/core/engine/commands/land.ts:222`): design / plan direct close (`landDirect`, `branches.ts:2650`), ship close (`shipClose`, `workflows.ts:1504`), failure records (`landFailedRecord`, `workflows.ts:776`), roadmap mirror (`roadmap.ts:494`) and the debug-on-dev replay (`pushOwnCommits`, `branches.ts:1257`). The two exceptions are the PR paths (`landPr`, ship `close-pr`) and the plain own-commit push in `pushOwnCommits` (`branches.ts:1222-1246`).
- Local sync exists twice: `fastForwardDev` (`branches.ts:2863`), called by `landVerb` (`branches.ts:2996`) and `syncDevVerb` (`branches.ts:2454`). `syncDevVerb` alone does the frozen install (`install`, `branches.ts:2469`). It returns a bare string; `skipped` mixes "local dev ahead or divergent" with "git refused". It also prints the generic `git pull --rebase && git push` advice that the issue rejects.
- `fastForwardDev` already has the right safety for Q7 and for parallel closes. It runs `merge --ff-only` when the main checkout is on dev; otherwise it runs a non-forced `fetch . sha:refs/heads/dev`, which git refuses when the move is not a fast-forward or `dev` is checked out in another worktree.
- Ordering problem outside ship: design / plan build `FINAL_RETURN` in `workflows close --final-return` before `branches land` runs (`bkit-design.md:578` then `:583`). Build / debug run `roadmap mirror ... >/dev/null` before the close (`bkit-debug.md:725-726`), and debug-on-dev runs `branches push --mode=dev` after it (`:750`). Only ship's `workflows close` lands and builds the final return in one verb.
- Reusable recovery parts: `replayBuild` (`branches.ts:1150`, which cherry-picks onto a fresh `origin/dev` and raises `ReplayConflict`), `checkLanding` (`land.ts:188`, the declared gate in the throwaway checkout), and the per-file and `.jsonl` union-line comparison in `notOnDev` (`branches.ts:2903`) and `localDevCopies` (`branches.ts:2927`). No `git cherry` / patch-id use exists yet.
- Decision `ship-sync-dev-fast-forward-only-never-push-local-dev` (`docs/decisions.jsonl:263`) freezes step key `ship-switch-to-dev`. Q2 retires that step.

## Approach A — One shared `syncLocalDev` in `branches.ts`, called after each landing verb ⭐ Recommended

Summary: turn `fastForwardDev` into `syncLocalDev(root, { landedSha | pending }, log) → LocalSync` and call it at the end of every dev-pushing verb. It does one fetch, a left-right count, a safe fast-forward with the existing git refusals, and the frozen install when the main checkout is on `dev` and moved. It returns `{ state: equal | fast-forwarded | ahead | divergent | blocked | unavailable | pending | none, ahead, behind, reason, line }`. Callers are `landVerb`, `shipClose` (after the head-push or merged close PR; `close-pr-open` → `pending`, no fetch, no move), `roadmap mirror`, `landFailedRecord` / `handover`, and `pushOwnCommits` (both the plain and the replay branch). `syncDevVerb` becomes its thin CLI wrapper, and ship Step 13 is removed.

Each verb emits `localSync` in its JSON. Ship's `workflows close` appends `localSync.line` into its own `finalReturn`. Design / plan display `FINAL_RETURN` followed by `branches land`'s `localSync.line`. Build / debug pass the mirror's line into `workflows close` with `--line` (and the debug-on-dev route displays the `push --mode=dev` line).

Recovery adds `branches dev-status`, a read-only classifier. It runs `git cherry origin/dev dev` first. For a `+` commit, it compares every touched path's content at the commit with `origin/dev`, reusing `notOnDev`'s rule that a `.jsonl` file counts by its added lines. It reports already-on-GitHub vs unpublished. `branches dev-reconcile` adds `--prepare`, which uses `pushToDev` with a new no-push option: replay only the unpublished commits via `replayBuild`, then run `checkLanding`'s gate and stop at `{ base, sha, tree }`. `--push --approved-tree=` rebuilds the replay, refuses if the tree differs or `origin/dev` moved, pushes, creates `dev-backup/{YYYYMMDD-HHMMSS}`, and moves local `dev` (the ref move only, or a move that keeps local edits, per the Decisions row; occupied elsewhere → blocked). A thin `bkit-utility-sync-dev` prompt runs these commands and asks for approval between `--prepare` and `--push`.

- `Complexity`: MEDIUM. There are 5 call sites, one result type and 2 new verbs. Most logic already exists.
- Extensibility: a new dev-pushing verb adds one call and one emitted field. The state set is closed and documented in the `sync-dev` output spec.
- Risk: a call site gets missed or reports from the wrong place, for example the build / debug `--line` prose or the debug-on-dev path. A missed site leaves the gap the issue describes. Retiring step key `ship-switch-to-dev` also trips the status-hole corpus and `ship-invariants.test.ts` until they are updated.
- Maintenance: low. There is one function and one result shape. The workflow prose only displays a line the engine wrote.
- Reuse vs new: reuses `fastForwardDev`'s ff and refusal logic, `install`, `fetchDev`, `pushToDev`, `replayBuild`, `checkLanding` and the `notOnDev` / `localDevCopies` comparisons. Net-new: the `LocalSync` type and line text, the `git cherry` pass, the no-push option on `pushToDev`, the 2 verbs, the backup-and-move step and the prompt.

## Approach B — Put local sync inside `pushToDev` itself

Summary: `pushToDev` calls `syncLocalDev` after a `landed` push and returns `localSync` on the `landed` variant of `DevPush`. Every caller that already goes through it gets the sync without its own call. The two non-`pushToDev` paths (`landPr` / ship `close-pr`, and the plain push in `pushOwnCommits`) still need an explicit call. Final-return wiring and recovery are the same as in A.

- `Complexity`: MEDIUM. Fewer call sites, but it changes the shared landing routine's contract.
- Extensibility: a new `pushToDev` caller gets the sync automatically. A new non-`pushToDev` transport has to remember to call it.
- Risk: it breaks the routine's stated invariant in `land.ts:1-9` ("The main checkout's branch, index and edits are never touched"). An ff-merge plus frozen install in the main checkout would then run inside every landing, including the retry loop's success path and cloud runtimes where `runtimeDevPushes` is false. `pushToDev` has no runtime flag, so one would have to be passed in. Two transports still sit outside it, so "one place" is only partly true.
- Maintenance: medium. The landing routine owns two concerns, and the PR exceptions must be kept in sync by hand.
- Reuse vs new: same reuse as A. Net-new is the same, plus a runtime parameter on `pushToDev`.

## Approach C — Workflow-level: run the extended `branches sync-dev` as its own step after every dev push

Summary: keep each landing verb unchanged and extend only `syncDevVerb`: structured `LocalSync`, fetch failure → `unavailable` with exit 0, `--pending`, and `--line` output. Each workflow then calls `branches sync-dev` after its last dev push: design / plan after `land`, build / debug after `roadmap mirror` / `push --mode=dev`, ship after `workflows close`, and the Failure Paths after `handover --push`. The recovery verbs and prompt are the same as in A.

- `Complexity`: MEDIUM. Engine changes are smaller, but 5 workflow sources and their Failure Paths change, along with their rendered mirrors and snapshots.
- Extensibility: weak. Every new dev-pushing step needs a matching prose step, and nothing in the engine enforces it.
- Risk: an agent skips or misroutes the extra step, or a Failure Path forgets it. It departs from the settled Q2 (sync inside `workflows close`) for ship, and that needs owner confirmation. Ship would also keep a separate step after the close's final return, which the close's HARD STOP ordering does not allow without restructuring Step 14.
- Maintenance: high. The prose is duplicated across workflows and providers, and the step-key and gate rows multiply.
- Reuse vs new: maximum reuse of the `sync-dev` verb. Net-new is mostly workflow prose, plus the same recovery verbs and prompt.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| A: one `syncLocalDev` result, called at the end of each dev-pushing verb | B (inside `pushToDev`); C (separate workflow step) | A keeps `land.ts`'s "main checkout never touched" invariant and meets Q1 and Q2 in the engine. C depends on agents remembering a step and departs from Q2. B still needs two manual call sites. |
| Extend `fastForwardDev` / `syncDevVerb`; `sync-dev` stays the CLI entry | A second sync implementation for closes | Issue outcome: "extend the existing `branches sync-dev` behavior". The existing non-forced refspec and `merge --ff-only` already give the Q7 and parallel-close safety. |
| States: `equal`, `fast-forwarded`, `ahead`, `divergent`, `blocked` (reason: `occupied`, `edited-files`, `install-failed`, `git-refused`), `unavailable`, `pending`, `none` | Keep the bare `skipped` | SC2 needs ahead vs divergent vs blocked told apart. `pending` covers Q10, and `none` covers a runtime with no local `dev`. |
| Compare against the one post-landing fetch; the ff target is that fetched `origin/dev` when it contains the landed SHA | ff to the landed SHA (today's `landVerb`) | Edge case "origin/dev moves between landing and sync": report what was observed and catch up fully in one move. |
| Close exit stays 0 when local sync is blocked or install fails; standalone `sync-dev` keeps exit 16 for install failure | Fail the close on install failure (today's Step 13 → Failure Path) | Q3: a landed close is a success. **Flag for confirmation:** this changes ship's current install-failure route. |
| Remove ship Step 13 and retire step key `ship-switch-to-dev`; supersede decision `ship-sync-dev-fast-forward-only-never-push-local-dev` | Keep Step 13 as a no-op | Settled Q2. The frozen key's corpus and audit tests must move in the same change. |
| Final-return line placement: ship inside `workflows close`; design / plan display `land`'s `localSync.line` after `FINAL_RETURN`; build / debug pass the mirror line through `--line` | Re-order design / plan so `land` runs before `close --final-return` | Re-ordering touches lock and worktree teardown ordering. Displaying one extra engine-written line is the smallest change. |
| Recovery = `branches dev-status` (classify) + `branches dev-reconcile --prepare` / `--push --approved-tree=` + thin `bkit-utility-sync-dev` | Utility prompt doing git by hand; one verb that pushes straight away | Q4 and Q5. The approval sits between two engine calls. The tree check makes the pushed result exactly the one the owner approved, and `origin/dev` moving triggers a re-prepare, not a silent push. |
| "Already on GitHub" = `git cherry` `-` lines, then per-path content equality with `notOnDev`'s `.jsonl` added-line rule; anything else is unpublished | Content check on whole files only | Q6. Ledgers are union-merged, so whole-file equality would mark published ledger commits as unpublished. |
| `pushToDev` gains a no-push option for `--prepare` | Copy the throwaway and gate logic into a new routine | Rule: improve over duplicate. `checkLanding` already runs the declared gate (Q9). |
| Local `dev` move after an approved push: create the backup branch first; then `git branch -f` when `dev` is not checked out; when the main checkout is on `dev`, use a move that refuses to overwrite edited files (`reset --keep`); occupied elsewhere → blocked | Refuse whenever `dev` is checked out | Q5 and Q8. **Flag for confirmation:** the move is not a fast-forward, and the issue's constraints forbid "reset". This one is explicit, approved and backed up, but the owner should confirm the mechanism. |
| The recovery entry point named in the line follows how `.bkit/prompts.md` says utility prompts are invoked | The draft's `/bkit-utility-sync-dev` slash form | Existing utilities are subagent prompts, not slash commands. Which form users actually type is not checked here. |
