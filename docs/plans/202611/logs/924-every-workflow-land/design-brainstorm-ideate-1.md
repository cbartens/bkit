# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

Grounding facts (read this run, not from memory):

- `pushToDev` (`.bkit/core/engine/commands/land.ts:222-276`) is the single landing loop: per attempt `fetchDev` → `worktree add --detach .worktrees/_land-{FID} origin/dev` → caller `build(dir)` → `checkLanding` (gate `bkit:gate:min` for bookkeeping-only, else `requiredPushGate`) → `git push origin HEAD:dev` → `moved` retries with `landBackoffMs`. Five callers: `landDirect` (design / plan close, `branches.ts:2898`), `shipClose` (`workflows.ts:1488`), `landFailedRecord` (`workflows.ts:756`), the roadmap mirror (`roadmap.ts:493`) and `pushOwnCommits` (debug in place on `dev`, `branches.ts:1184`).
- `fastForwardDev` (`branches.ts:3117-3148`) already moves local `dev` without a checkout: `merge --ff-only` when the main checkout is on `dev`, else `git fetch . {sha}:refs/heads/dev`. Today a refusal (an overlapping uncommitted edit) is a logged skip, not a stop.
- `devBase` / `worktreeBase` (`worktrees.ts:179-224`) pick the start ref: design / plan always `origin/dev`; build / ship local `dev` only while it is a fast-forward of `origin/dev`; `inheritedDevCommits` + `assertShipEligible` (`worktrees.ts:231-266`) refuse branches carrying unpushed `dev` work.
- `publishRoute` (`status.ts:320-339`) resolves token → `publish.local` / `publish.remote` → coerces a non-LOCAL `false` to `true`; it filters `runtime-resolved` rows to `workflow === "build"`. `BuildPublish` / `invalidBuildPublish` / `buildPublish` live in `shared/settings.ts:67-73, 263-281`.
- `bkit:gate:changed` + `bkit tests changed --base= --fallback=` (`.bkit/workflows.md` § Local gate scripts) is already the "tests the change affects plus static checks on the changed files" contract.
- `.bkit/templates/.husky/pre-push:156-167` already blocks a push to `dev` / `main` whose last commit carries a skip-CI token while `bkit ci min-push --ref` (range from `pushBase`) finds files outside the min-push paths, and tells the owner to add an empty trigger commit. Owner answer 6 is mostly already shipped.
- `acquirePublicationLock` (`locks.ts:157-202`) is an existing git-common-dir file lock with same-host PID liveness and a wait loop (capped at 30 s, fails open). `bkit locks acquire` knows only `--kind=workflow` (`locks.test.ts:360-366`); there is no dev-landing lock today.
- `bkit-cloud.yml` recovers ONE FID from `head_commit.message` via `bkit fids parse` (`.github/workflows/bkit-cloud.yml:523-570`), and already looks up the most recent completed `dev` CI run (`:576`).
- #849 is `PLANNED` in `.bkit/issues.jsonl:107`, not built; ship Step 13 (`ship-switch-to-dev`) still exists. This issue edits the same close code.

## Approach A — One landing loop with a `target` (remote | local) ⭐ Recommended

Give `pushToDev` one new input, `target: "remote" | "local"`, resolved once per run from the extended `publishRoute`, so every existing caller lands through the same loop. In local mode the loop bases the scratch `.worktrees/_land-{FID}` on `refs/heads/dev` (no fetch needed for the base), runs `bkit tests changed --base={base} --fallback=bkit:gate:static` on code landings (and `bkit:gate:min` on bookkeeping-only landings, as today), then advances local `dev` instead of pushing.

- **Mode switch:** generalise `BuildPublish` to a per-workflow `WorkflowPublish` read from `bkit.workflows.{design,plan,build,debug,ship}.publish.local` (default `true`, so an unset repo behaves as today); `publishRoute` drops its `workflow === "build"` filter and takes `--workflow`. It is resolved at Step 1 from token + setting + `bkit runtime detect`, then frozen in the Step 2 `runtime-resolved` row so resume and close read the same value. The existing coercion (non-LOCAL `false` → `true` + warning) covers the cloud / Actions constraint unchanged.
- **Start base:** `worktreeBase` gains the frozen mode: local → always `refs/heads/dev`, one warning with the ahead and behind counts when `dev` and `origin/dev` have split; `inheritedDevCommits` refusal (design / plan exit 7) and `assertShipEligible` are skipped in local mode, since the squash onto local `dev` only carries the branch's own delta; the "push `dev` before the feature PR" line is dropped in local mode.
- **Advance:** a strict variant of `fastForwardDev` (same two git calls) where a refusal is a `blocked` outcome that stops the run with git's message, local `dev` and the edits untouched. The advance is a compare-and-swap: `fetch . {sha}:refs/heads/dev` and `merge --ff-only` both refuse a non-fast-forward, so a hand commit on `dev` during the land returns `moved` and reuses the existing rebuild-and-retry branch.
- **Concurrency (Q7):** the whole attempt (scratch build, checks, advance) runs under a landing lock. The lock reuses `acquirePublicationLock`'s file-and-PID logic, with its 30 s cap and fail-open lifted for this caller only (a parameter, not a copy): wait until the first landing finishes, fail closed on timeout.
- **Ship local:** Step 2 skips the PR lookup and branch push; Steps 3-4 integrate against local `dev` (`branches sync --merge --target=dev`); Steps 5-8 unchanged except no push; Steps 9-13 skipped; Step 14 `shipClose` builds ONE commit in the scratch tree: `merge --squash feat/{FID}` (no `-X ours`: a code conflict stops, re-run ship to re-integrate) plus `carryBook` of the close rows, subject `feat({FID}): …` with no skip token. Guarded cleanup compares against local `dev` instead of `origin/dev` (the comparison ref becomes a parameter). Tracker: `bkit:merged`, `In review`, issue open, plus the "landed on local dev, not pushed" comment and the `blob/dev` links line (Q4).
- **Design / plan local:** `landDirect` passes `target: "local"`; `buildClose` is unchanged (its non-doc check stays valid, because the base already holds every earlier local landing); Gate 12 reads `--ref=dev`; the summary-step branch push is skipped.
- **Debug local:** held `feat/{FID}`: the Step 9-11 pushes and the CI wait are skipped, the fix stays on the branch. In place on `dev`: `pushOwnCommits` is not called; the run's commits are already on `dev`.
- **Batch CI:** `bkit fids parse` gains `--range=A..B` (list output), and `bkit-cloud.yml`'s `dev` arm feeds it the range from the last completed `dev` run's head (lookup at `:576`) to `HEAD_SHA`. This is a CI edit, so the owner signs it off (`.agents/rules.md` § CI edits). The pre-push `[skip ci]` guard is reused as is, plus one test for the batch shape.
- `Complexity`: MEDIUM.
- **Extensibility:** a further landing caller passes `target`; a further workflow gets the setting through the same `WorkflowPublish` reader. A future batch command (out of scope) would sit on top of the same loop.
- **Risk:** threading the mode through five callers and four workflow sources leaves one path still pushing, for example the roadmap mirror or `landFailedRecord` on a local build. Mitigation: a `ship-invariants`-style audit test asserting that no `git push` or `gh` call is reachable when the frozen mode is local, plus a dogfood run with `origin` pointed at an unreachable URL.
- **Maintenance:** one loop with two endings; each new landing rule is written once. The `pushToDev` name becomes misleading (a rename to `landOnDev` is optional and cheap).
- **Reuse vs new:** reuses `pushToDev`'s attempt loop, `dropLandTree`, `withoutHooks`, `prepareLandInputs`, `checkLanding`, `buildClose`, `carryBook`, `commitBookkeeping`, `fastForwardDev`'s git calls, `publishRoute`'s coercion, `bkit tests changed`, the pre-push guard, `bkit fids parse`, the cloud `dev`-run lookup and `acquirePublicationLock`. New: the `target` branch inside the loop, the strict advance outcome, the per-workflow setting reader, the lock parameters, the `--range` flag and the ship Step 14 squash build.

## Approach B — Local `dev` as the push remote (`git push . HEAD:dev`)

Keep `pushToDev`'s code shape and change only its remote: in local mode `REMOTE = "."` and `UPSTREAM = "dev"`, so the scratch tree runs `git -c receive.denyCurrentBranch=updateInstead push . HEAD:refs/heads/dev`. Git's own non-fast-forward refusal matches the existing `MOVED_BEFORE` regex, so the retry loop works unchanged. Mode switch, start base, ship / design / plan / debug changes and batch CI are as in A.

- `Complexity`: LOW for the landing itself, MEDIUM overall (the workflow changes are the same as A's).
- **Extensibility:** poor. Every new local-only rule (strict stop on blocked edits, ahead / behind warning) has to be read out of push stderr regexes that were written for GitHub's answers.
- **Risk:** `updateInstead` refuses whenever the main checkout's working tree or index differs from `HEAD` at all, not only when the edits overlap. The owner usually has uncommitted edits in the main checkout, so most local lands would stop. Without `updateInstead`, a `dev` checked out in the main checkout is a `[remote rejected] … branch is currently checked out` answer, which matches `REFUSED` and would send the run down the PR-close path. Both are wrong outcomes on the common case.
- **Maintenance:** high. Correctness depends on git's wording for local push refusals staying matched by regexes in `land.ts`.
- **Reuse vs new:** maximal reuse of `land.ts` (regexes, loop, outcomes); net-new is a few lines. That saving is outweighed by the dirty-checkout failure mode.

## Approach C — Approach A without the landing lock (compare-and-swap retry only)

Same as A, but concurrent landings are handled only by the advance's compare-and-swap: the second run sees `dev` moved, drops its scratch tree, rebuilds on the new `dev`, re-runs its pre-land checks and advances, within `LAND_ATTEMPTS`. This is exactly what published mode does with `origin/dev` today.

- `Complexity`: LOW-MEDIUM (A minus the lock).
- **Extensibility:** same as A.
- **Risk:** the second landing re-runs its affected tests once per collision, and with long checks both runs can use up `LAND_ATTEMPTS` while a third run or a hand commit keeps moving `dev`. It also departs from Settled Q7 ("the second run waits on a lock"), so the owner would have to confirm it.
- **Maintenance:** lowest; no lock file, no stale-lock handling.
- **Reuse vs new:** reuses everything A reuses except the lock; no new lock parameters.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Land through `pushToDev` with a `target` input (A) | B: local `dev` as push remote; C: A without lock | The constraint forbids a second landing routine; A keeps one loop and handles the main checkout with uncommitted edits correctly, where B's `updateInstead` refuses any dirty tree. |
| Advance local `dev` with `fastForwardDev`'s two git calls, made strict (refusal = stop) and treated as a compare-and-swap | `update-ref` with an old value; reset / rebase | Both calls already exist and refuse non-fast-forwards; the constraint forbids reset / rebase / force; Q6 needs the pointer moved without a checkout, which the `fetch .` arm already does. |
| Landing lock around the whole attempt, built by parameterising `acquirePublicationLock` (no 30 s cap, fail closed) | C's compare-and-swap retry only; reviving a `--kind=dev` workflow lock | Settled Q7 asks for a lock; the publication lock already has same-host PID liveness; `bkit locks` knows only the workflow kind and reviving another kind adds a second lock contract. Compare-and-swap stays as the guard against hand commits. |
| Pre-land check = `bkit tests changed --base={landing base} --fallback=bkit:gate:static` for code, `bkit:gate:min` for bookkeeping-only | `requiredPushGate` (today); no checks | Owner answer 2 names exactly `bkit:gate:changed`'s contract; running it in the scratch tree covers the combined result with earlier local landings. |
| Per-workflow `bkit.workflows.{workflow}.publish.local`, default `true`, resolved at Step 1 and frozen in the Step 2 row | Ship reads build's setting; mode inferred from "never pushed" | Owner answer 1; the default keeps Success criterion 3 (unset = today); freezing makes resume and close agree. |
| Local mode starts every worktree from `refs/heads/dev`, warns once on a split, skips the unpushed-`dev` refusals | Keep the `origin/dev` fallback on a split | The scope addition (2026-11-12) settles it; a squash onto local `dev` only carries the branch's own delta, so the refusals guard nothing in local mode. |
| Ship local = ONE scratch-tree commit (`merge --squash feat/{FID}` + carried close book), no skip token in its subject | Keep the separate `[skip ci]` close commit | Settled Q1 (one squashed commit per run); a code commit with no skip token keeps a batch ending on ship from skipping CI. |
| Debug in place on local `dev` keeps its own commits (no squash) | Squash them after the fact | They are already on `dev`; squashing would need a reset, which the constraints forbid. Settled Q3 says "commits there". Flagged so the owner can confirm this reading of Q1. |
| Reuse the existing pre-push `[skip ci]` guard (`pre-push:156-167`) and add only a batch-shape test | A new hook check | It already blocks a code-carrying push to `dev` whose last commit has a skip token, with the empty-trigger-commit message from owner answer 6. |
| Batch FID mapping via `bkit fids parse --range=A..B`, range base from `bkit-cloud.yml`'s existing last-completed-`dev`-run lookup | Bash loop over `git log` subjects in the YAML; head commit only | `.agents/rules.md` § Workflow bash blocks puts parsing in a `bkit` verb; the lookup already exists at `:576`. Risk to carry into design: the shared `bkit-auto-dev` concurrency group cancels older runs, so several FIDs dispatched for one red push may cancel each other. |
| Sequence the plans after #849 lands | Build alongside #849 | #849 is `PLANNED` and rewrites the same close / Step 13 code; building first would create merge conflicts in `branches.ts` and `workflows.ts`. |
