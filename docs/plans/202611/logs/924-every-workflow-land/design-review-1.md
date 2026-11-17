Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

Docs read: `.agents/docs.md`, `docs/architecture.md` (has no landing-topology section, as the design's Documentation Warnings say), `docs/technology.md`, `docs/capabilities.md` (no row for landing, local `dev` or locks: inconclusive, so absence was confirmed with text search), `.bkit/workflows.md` § Concurrency lock and § Local gate scripts, `docs/decisions.jsonl` rows `design-plan-close-throwaway-origin-dev-worktree` and `849-*`, and `docs/plans/202611/849-keep-local-dev-{design,plan}.md`. Every file and line range in the design's Reuse table was opened; all of them exist where it says, with small offsets (`shipClose` body starts at `workflows.ts:1497`, and the preflight advisory beside build's is in `checks/before/repo.ts:103`, not `index.ts`).

<!-- prettier-ignore -->
| Capability | What exists (path, maturity) | Fit | Recommendation |
| --- | --- | --- | --- |
| Publish resolution | `publishRoute` + `PUBLISH_TOKEN` (`commands/workflow/status.ts:313-339`), `BuildPublish` / `invalidBuildPublish` (`shared/settings.ts:68-73, 263-281`), advisory `bkit-build-publish-remote` (`checks/before/repo.ts:103`). Shipped, in use by build. | Covers more than 80%: token beats setting, non-LOCAL `false` coerces to `true`. Gap: hard-wired to `workflow === "build"` and reads `package.json` live on every call (`status.ts:537`). | EXTEND-EXISTING, as the design says. |
| Frozen mode | `runtime-resolved` row, written by `bkit runtime row` in all five workflow sources; read at `branches.ts:2758`, `prs.ts:975`. | Already the per-run carrier for runtime facts. Gap: no `publish` field. | EXTEND-EXISTING. |
| Start base | `devBase` / `worktreeBase` (`worktrees.ts:179-224`), `DOCS_ONLY_WORKFLOWS`. | Same decision point; local mode is a third rule beside the two today. | EXTEND-EXISTING. |
| Unpushed-`dev` refusals | `inheritedDevCommits` / `assertShipEligible` (`worktrees.ts:231-266`), `inheritedDevRefusal`, `unpushedDevCause` (`branches.ts`). | Skip on local, keep on published: a flag, no new code. | EXTEND-EXISTING. |
| Landing loop | `pushToDev` (`land.ts:222-276`) with five callers confirmed by the language server: `landDirect` (`branches.ts:2912`), `pushOwnCommits` (`branches.ts:1266`), `landFailedRecord` (`workflows.ts:785`), `shipClose` (`workflows.ts:1513`), roadmap `mirror` (`roadmap.ts:493`). | Covers the scratch checkout, hooks off, inputs, attempt loop, clean-tree assertions. Gap: fetch, base, gate choice and push are inline; the `DevPush` union has no "blocked by the owner's checkout" kind, and every caller's `switch` maps `refused` to a PR fallback that must be unreachable on the local target. Its header invariant (`land.ts:1-9`) says the main checkout is never touched. | EXTEND-EXISTING, with the invariant conflict in CRITICAL 2. |
| Pre-land checks | `checkLanding` (`land.ts:188-210`); `bkit tests changed` (`commands/workflow/tests-changed.ts`, exported `changedFiles(top, base)`); `runPushGate` / `requiredPushGate` (`commands/ci/push-gate.ts`). | `changedFiles` already computes `DEV_AT...HEAD` plus uncommitted files, which is what the scratch landing needs. Gap: gate selection and the tests-lock exit classification live inside `testsChangedVerb.run`, not in a callable function. | EXTEND-EXISTING: pull the run body into an exported function and call it from `checkLanding`, instead of spawning the CLI (OPTIONAL 1). |
| Advance local `dev` | Today: `fastForwardDev` (`branches.ts:3117-3148`). Planned and sequenced before this design: #849's `syncLocalDev` in a new `commands/workflow/local-dev.ts`, which moves `fastForwardDev`'s two git calls there and deletes `fastForwardDev`, moves `branchTree` to `worktrees.ts` as an export, adds `occupied` and `edited-files` blocked reasons from git state, an ahead / behind count by `rev-list --left-right --count`, and a frozen install after a move under the main checkout (`849-keep-local-dev-plan.md:225-230, 379-381`; decisions `849-local-dev-module-avoids-cycle`, `849-blocked-reasons-from-git-state`). | #849's module covers the move, the "another worktree holds `dev`" check, the "uncommitted edit blocks the move" reason, the ahead / behind count and the install. Gap: a compare-and-swap from `DEV_AT` and fail-closed callers. The design marks this NEW and names `fastForwardDev` as what it reuses, which will not exist when this builds. | ADAPT: a strict sibling in #849's `local-dev.ts` (CRITICAL 1). |
| Landing lock | `acquirePublicationLock` / `releasePublicationLock` (`commands/workflow/locks.ts:170-227`), one caller (`tracker.ts:1745`). Retired before it: `.bkit/.dev.lock` (`migrateRetiredDevLock`, `install/modules/core.ts:504`; `docs/migrations.md:24`). | File in the git common dir, exclusive create, same-host PID + start-time liveness. Gap: hard 30 s cap (`Math.min(30_000, …)`), one `null` for six different outcomes, no reclaim when the PID was reused, every exception swallowed into `null`. | EXTEND-EXISTING, with a result type instead of `null` (CRITICAL 3). |
| Ship one-commit close | `buildClose` (`branches.ts:2836`, squash + `-X ours` + doc-only check), `carryBook` (`workflows.ts:557`), `commitBookkeeping` `squashOf` (`ledgers.ts:968-1160`). | `commitBookkeeping` commits by pathspec and adds every path `HEAD...squashOf` brought in; `git commit -m` replaces the squash message, so the empty-body requirement holds by construction; `checkLanding`'s clean-tree check catches a path left out. | USE-AS-IS for the commit; ADAPT `shipClose`'s `build` callback. |
| Guarded cleanup | `removeWorktree(..., { landed: true })` (`shipClose`). | Comparison ref is the only change. | EXTEND-EXISTING. |
| Batch `[skip ci]` refusal | `.bkit/templates/.husky/pre-push:156-167` (`bkit ci skip-token` + `bkit ci min-push --ref`), `minPush` (`commands/ci/ci.ts:626-684`) diffs the pushed sha against its push base. | Verified: a push that carries code and ends on a skip token is refused today, with the trigger-commit line. | USE-AS-IS plus a batch-shape test, as the design says. |
| Stale-hook advisory | Preflight advisories in `checks/before/repo.ts` (build's publish advisory lives there). | Same mechanism. | EXTEND-EXISTING; put it beside `bkit-build-publish-remote` (OPTIONAL 3). |
| Batch FID mapping | `bkit fids parse` (`--prompt-file`, `--marker`, `--branch`; `fids.ts:727-736`); the `dev` arm of `bkit-cloud.yml` (`.github/workflows/bkit-cloud.yml:552-586`); its stale-run guard already takes `.[0].headSha` of `gh run list --status completed` as the current run. | A `--range` flag fits the verb. Gap: the shipped source is the copy-and-own `.bkit/templates/.github/workflows/bkit-cloud.yml`, which differs from bkit's adopted copy and is never rewritten in consumers (OPTIONAL 6). | EXTEND-EXISTING. |
| No-push guarantee | `ship-invariants.test.ts`, `skip-ci-subject-audit.test.ts` (header premise at lines 5-7 confirmed), `runtime-prose-audit.test.ts`; #849's planned reachability contract test over every `pushToDev` caller. | Adding local-mode cases fits; the #849 test asserts every reached verb emits `localDev`, which local landings must satisfy (CRITICAL 2). | EXTEND-EXISTING. |

Ecosystem checks: `git update-ref <ref> <new> <old>` is git's built-in compare-and-swap ("updates the master branch head to <new-oid> only if its current value is <old-oid>", git-scm.com/docs/git-update-ref) and the page says nothing about checked-out branches, so the design's explicit `worktree list` check is needed. Node has no built-in cross-process lock beyond exclusive create (`fs.openSync(file, "wx")`), which `tryCreate` already uses; `proper-lockfile` (npm, mtime-refresh staleness) would add a runtime dependency and a second lock contract beside the in-repo one, so it is not recommended. GitHub's skip page says the tokens are checked "in a push, or the HEAD commit of a pull request" without saying head-only for pushes; bkit's pre-push comment and `docs/knowledge.jsonl` KN-11 record head-commit behaviour from practice, and this design relies on it the same way the shipped hook already does. GitHub's `workflow_run` payload lists only `workflow` and `workflow_run` as event properties, which supports the design's "no `before`" premise for the range read.

## Stack Feasibility

Buildable in the approved stack (Node `>=24`, TypeScript 7, the git CLI at the engine's 2.31 floor, POSIX shell, GitHub Actions), with no new dependency. Every git operation the design names exists at the floor: `update-ref` with an old value, `merge --ff-only`, `merge --squash`, `worktree add --detach`, `worktree list --porcelain`, `rev-list --count`. The design stays inside the repo's rules: git decisions in `bkit` verbs, workflow sources carry flags only, parsing in a verb instead of YAML bash.

Constraints:

- Sequencing: #911 then #849 first. #849 changes the very functions this design extends (`fastForwardDev` deleted, `branchTree` moved, `syncLocalDev` added after every `dev` landing), so P2 and P3 must be re-checked against the code #849 actually lands.
- The landing invariant in `land.ts:1-9` ("The main checkout's branch, index and edits are never touched") and #849's decision to keep it must be reconciled with an advance that moves the owner's `dev` (CRITICAL 2).
- The lock's fail-closed behaviour needs the reclaim cases defined (CRITICAL 3).
- `bkit-cloud.yml` edits need the owner's CI sign-off; the edit lands in the template source and in bkit's adopted copy.
- Engine edits need `pnpm build && git add dist/`; workflow and prompt edits need `pnpm instructions:show` first and `bkit upgrade` at session end.

## Library / API Evaluation

No third-party library is added. The APIs the design depends on:

<!-- prettier-ignore -->
| API | Maturity | Footprint | Types | License | Note |
| --- | --- | --- | --- | --- | --- |
| git CLI (`update-ref`, `merge --ff-only`, `merge --squash`, `worktree`) | Stable plumbing and porcelain, all present at git 2.31 | None added (already required) | Wrapped by `runGit` / `git` in `commands/lib.ts` | GPL-2.0 tool, invoked, not linked | `update-ref` does not refuse a branch checked out elsewhere, so the worktree check is required. |
| Node `fs.openSync(…, "wx")`, `process.kill(pid, 0)` | Node built-ins | None | `@types/node` | MIT | Already used by `tryCreate` and `acquirePublicationLock`. |
| `ps -p <pid> -o lstart=` | POSIX `ps` on macOS and Linux | None | n/a | n/a | `processStart` returns `null` where `ps` or `lstart` is unavailable, which today makes the lock give up; with fail-closed it would stop every landing (CRITICAL 3). |
| `gh run list --json headSha` | Stable `gh` CLI | Already used in `bkit-cloud.yml` | n/a | MIT | The current run is `.[0]` (the existing stale-run guard relies on it), so the range base is the first entry whose `headSha` differs. |
| `proper-lockfile` (considered) | Mature npm package | One runtime dependency | Community types | MIT | Not recommended: a second lock contract beside `locks.ts`, mtime heartbeat semantics that differ from the repo's PID liveness. |

## Integration Risk

Systems touched: the engine (`land.ts`, `branches.ts`, `workflows.ts`, `worktrees.ts`, `status.ts`, `locks.ts`, `settings.ts`, `timeouts.ts`, `fids.ts`, `tests-changed.ts`, `checks/before/repo.ts`, and #849's `local-dev.ts`), six workflow sources and every host mirror, the copy-and-own `pre-push` and `bkit-cloud.yml` templates and bkit's adopted copies, `status.jsonl` row shapes, `.bkit/stats.jsonl` `outcome`, and the tracker texts.

Blast radius:

- Highest: the owner's local `dev` ref and main checkout. A wrong advance loses or hides work on the machine that holds the only copy of unpushed features. The CAS from `DEV_AT`, the worktree check and git's own dirty-file refusal bound it; the `landing` log line's `DEV_AT` gives a manual undo point.
- High: published mode. The design keeps `target: "remote"` byte for byte, but the `origin/dev` literal count is large (85 lines in `branches.ts`, 31 in `worktrees.ts`, 12 in `land.ts`, 7 each in `runs.ts` and `workflows.ts`, more elsewhere), so the `landingRef` swap touches many published-mode lines. The audit test and the no-push spy are the right guards; a published-mode regression suite run before and after P1 is the check that matters.
- Medium: callers' `DevPush` switches. Each of the five callers maps `refused` to a PR fallback; a local target that can ever return `refused` would open a PR in local mode. A distinct result union for the local target closes this off at compile time.
- Medium: `close-transport` `shape: unpushed` and the widened `outcome.publish`. Every reader of `shape` (`prs.ts`, stats) must accept the new value; `grep -l` across workflows, prompts and templates per `.agents/rules.md` § Contract changes.
- Low: `bkit-cloud.yml` range read. A bad base no-ops with a summary row; the concurrency group cancels older runs, so fan-out stays inside one run, as the design notes.

Not a monorepo in the workspace-packages sense: `pnpm-workspace.yaml` holds settings only, and the engine is one package. The consumer-facing surface stays stack-agnostic (`bkit:gate:changed` contract plus fallback gate).

## PoC Approach

Not built here. Use a scratch repo with a bare `origin` and a main checkout on `dev`, and drive the engine's local target directly:

1. Land feature A; assert `dev` gained one commit, `origin/dev` is unchanged, and a `runGit` spy saw no `push`.
2. Start feature B from local `dev`; assert A's files are present, with `dev` only ahead and again after a second clone pushed to `origin/dev` (split).
3. Run two landings in parallel; assert the second waits, rebuilds on the first, and checks the combined tree.
4. Commit by hand on `dev` mid-landing; assert `moved`, then a retry on top.
5. Leave an uncommitted edit on a landed path; assert `blocked` with `dev` and the edit untouched. Repeat with `dev` checked out in another worktree.
6. SIGKILL a lock holder, then fake a holder with a mismatched start time; assert both are reclaimed, not stopped on.
7. Push both batch shapes through the real `pre-push`: ending on a design close is refused, ending on the ship commit passes.
8. Time steps 1-3 on bkit's own repo to size `LAND_LOCK_WAIT`.

## Unknowns & Blockers

1. **Lock behaviour on the edge paths** (needs running code): what a fail-closed `acquirePublicationLock` does when the holder's PID was reused, when `ps -o lstart` is unavailable, and when the holder file is unreadable. Settled by PoC step 6 plus the result-type change in CRITICAL 3.
2. **`LAND_LOCK_WAIT` value** (needs running code): 15 minutes is unmeasured; the lock is held across the frozen install in the scratch checkout (`prepareLandInputs` with `worktreeInstall`) as well as the checks. Settled by PoC step 8.
3. **Advance in the owner's main checkout** (needs running code for the hook and install side): whether `merge --ff-only` in the main checkout runs consumer `post-merge` / `post-checkout` hooks (the advance must run inside `withoutHooks` or say why not), and whether a lockfile change needs #849's frozen install afterwards. Settled by PoC step 5 and the #849 reuse in CRITICAL 1.
4. **#849's final shape** (reading source, after it builds): the actual `syncLocalDev` result type, its `localDev` line text and its reachability contract test decide how the local landing reports. Resolved by reading #849's landed code before P2 starts.
5. **Tests-lock contention inside the landing lock** (reading source): `bkit tests changed` returns 81 when the tests lock is held and 4 when the gate could not run; the design treats any non-zero as red and routes to `/bkit-debug`. Resolved in the plan by mapping these exits (OPTIONAL 1).

## Verdict Reasoning

CONCERNS. The design is buildable in the current stack with no new dependency, and it reuses almost everything it can: the publish resolver, the `runtime-resolved` row, the start-base functions, the landing loop, `checkLanding`, `commitBookkeeping`'s squash support, the pre-push skip guard and `bkit fids parse`. Every cited symbol and range checks out. Three addressable caveats stop it from passing. First, it records `advanceLocalDev` as NEW on top of `fastForwardDev`, but #849, which it sequences before itself, deletes `fastForwardDev` and adds a module that already covers most of the advance: a reuse caveat. Second, it puts a write to the owner's checkout inside `pushToDev`, which contradicts the `land.ts` header invariant and #849's recorded reason for keeping sync out of `pushToDev`. Third, it makes the publication lock fail closed without defining the half-dozen cases where that function returns `null` today, one of which (PID reuse) would stop every later landing. None of these is a FAIL: each is a design edit, not a change of approach. The PoC fits the 200-word limit.

## CRITICAL

1. **Reuse caveat: `advanceLocalDev` is NEW where #849's `local-dev.ts` covers the capability.** The design's Reuse row says `advanceLocalDev` "reuses `fastForwardDev`'s two git calls" and stays separate because `fastForwardDev`'s skip-never-fail contract must hold for #849. But #849's plan (`docs/plans/202611/849-keep-local-dev-plan.md:225-230, 379-381`), which this design requires to be built first, moves those calls into `commands/workflow/local-dev.ts` as `syncLocalDev`, deletes `fastForwardDev`, exports `branchTree` from `worktrees.ts`, and adds the `occupied` and `edited-files` blocked reasons, the ahead / behind count and the frozen install after a move. That is the advance minus the compare-and-swap. Fix: build the strict advance as a sibling export in `local-dev.ts` that shares #849's move, `occupied` detection and install, adds the CAS from `DEV_AT` and a fail-closed result; take Step 1's ahead / behind line from the same count; drop every reference to `fastForwardDev`. Done when the design's Reuse row for the advance reads ADAPT or EXTEND against #849's `local-dev.ts` and names what it adds.
2. **The advance inside `pushToDev` contradicts the landing invariant and a recorded #849 decision.** `land.ts:1-9` says the main checkout's branch, index and edits are never touched, and #849 rejected sync inside `pushToDev` for that reason and because a throw there turns a landed close into `EXIT_FLUSH_FAILED` (`849-keep-local-dev-design.md:193, 220`; decision `849-sync-local-dev-after-every-dev-push`). #849 also adds a contract test that every verb reachable from `pushToDev` emits `localDev`, whose line opens "Your work landed on origin/dev", which is false for a local landing. Fix: state where the advance sits (for example, `pushToDev` local target returns `{ built: NEW, base: DEV_AT, lock }` and the caller advances under the still-held lock, or the invariant is restated for the local target with a decisions row), what a failed advance returns to each of the five callers, and the `localDev` line and outcome a local landing emits. Done when the design names the advance's call site, the updated invariant text and the `localDev` wording for `unpushed`.
3. **Fail-closed lock behaviour is undefined for the cases `acquirePublicationLock` folds into `null`.** Today (`locks.ts:170-216`) it returns `null` when the git common dir is unreadable, when its own `ps -p … -o lstart=` start time is unreadable, when the holder file is unparsable, when the holder is on another host, when the holder's PID is alive but its start time differs (PID reuse after a crash: it gives up instead of reclaiming), on timeout, and on any thrown error. "Fail closed on timeout" turns all of them into a stop, and the PID-reuse case stops every later landing until someone deletes the file by hand. Fix: return a result union (`acquired`, `held` with holder, `timeout`, `unavailable` with reason), reclaim on a start-time mismatch the same way as on `ESRCH`, lift the hard 30 s `Math.min` cap behind a caller option, and say what the run tells the owner for `unavailable` (file path to delete, or fall back to CAS-only). Done when the design lists each outcome and the run's response to it.

## OPTIONAL

1. **Call the changed-files check in process and map its exits.** Pull gate selection and lock-exit classification out of `testsChangedVerb.run` (`tests-changed.ts:139-201`) into an exported function and call it from `checkLanding`. Map exit 81 (tests lock held) to a wait or retry and exit 4 / 126 / 127 (could not run) to a stop with that reason, so only a real test failure routes to `/bkit-debug`.
2. **Make the main-checkout advance race-tight.** Between asserting `HEAD` = `DEV_AT` and `git merge --ff-only NEW`, a hand commit makes git refuse the fast-forward; classify that refusal as `moved` (re-read `HEAD`) rather than `blocked`. Run the advance inside `withoutHooks` so consumer `post-merge` hooks do not run on an engine-driven move, or state why they should.
3. **Put the stale-hook advisory in `checks/before/repo.ts`**, beside `bkit-build-publish-remote`, not `checks/before/index.ts`.
4. **Record the lock against the earlier "no dev lock" decision.** `docs/decisions.jsonl` `design-plan-close-throwaway-origin-dev-worktree` says "The close takes no dev lock", and `.bkit/.dev.lock` was retired by migration (`docs/migrations.md:24`). Add a decisions row saying the local landing lock applies only to the local target, lives in the git common dir (so the retired path is untouched), and does not serialise published closes.
5. **Give the local target its own result union.** A `DevPush` kind like `refused` must be unreachable on the local target, because every caller maps it to a PR fallback; separate unions make that a compile-time fact rather than a test.
6. **Cover the copy-and-own `bkit-cloud.yml`.** The edit goes to `.bkit/templates/.github/workflows/bkit-cloud.yml` and bkit's adopted copy (they differ today). Consumers keep old copies, which fall back to the head-commit parse and no-op on a trigger commit; consider the same `bkit check` advisory as for `pre-push` while any `publish.local` is `false`.
7. **Range base from `gh run list`.** The existing stale-run guard shows the triggering run is `.[0]`, so the base is the first completed `dev` run whose `headSha` differs from `HEAD_SHA`, not `.[0]`.
8. **Cite the skip-token premise.** GitHub's docs do not say head-only for pushes; cite `docs/knowledge.jsonl` KN-11 and the pre-push comment as the evidence in the `924-local-runs-land-on-local-dev` decision row.

## OUT OF SCOPE

- `processStart`'s dependence on `ps -o lstart` also affects the tracker publication lock; a platform-independent process identity belongs to its own issue.
- Reconciling an existing split between local `dev` and `origin/dev` (#849 deferral `849-local-dev-recovery-tool`).
- A bkit batch-push command (#715's closed non-goal).
