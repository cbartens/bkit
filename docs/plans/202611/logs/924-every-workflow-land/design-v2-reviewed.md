Verdict: PASS
<!-- verdict:end -->

# Design: Land every workflow on local dev without pushing

## Related Issues

- #849 — Keep local dev synchronized after workflow close (open)
- #813 — Add a rollback path for shipped workflow changes; decide dev checks (open)
- #818 — Decide pre-push lint/typecheck scope: CI push base or whole repo (open)
- #101 — Agentic workflow: review routing, dry-runs, commit hygiene (open)
- #288 — Remove Step 1 local dev sync gate from phase workflows (closed)
- #71 — Workflow optimisation: fewer commits and pushes (closed)
- #209 — Workflow state model: squash to dev, persistent feat branch (closed)
- #639 — Land parallel workflow closes on dev without colliding (closed)
- #756 — Workflow optimisation: ship, land and close steps (done) (closed)
- #755 — Workflow optimisation: CI, tests and gates (done) (closed)

Sequencing notes, from `.bkit/issues.jsonl`: #849 is `PLANNED` and #911 (ship: a failed merge never reaches the diagnose and fix steps) is `PLANNED`; both rewrite the same ship close code and renumber ship steps, and #849 is blocked by #911. #715 (retire lite workflows; build `publish`) is the decision this design partly reverses for local runs.

## Acceptance Scenario

Built from the input's accepted Draft Acceptance Scenario (Settled Q9). Each change against the draft has a `Decisions` row (D-AS1 to D-AS5).

### Narrative

The owner sets a workflow to local (the `bkit.workflows.{workflow}.publish.local` setting, or `publish=false` in the prompt) and runs design, plan, build, debug and ship for a few issues in a row. Each run works in its own worktree, starts from the owner's local `dev` so it sees what landed earlier, and brings its result onto local `dev` as one commit; a build stays held on its branch until ship lands it. Nothing reaches GitHub until the owner pushes `dev` once for the batch, and that one push gets one pre-push hook run and one `dev` CI run.

### Success Criteria

1. After a local design, plan or ship run, local `dev` holds exactly one new commit with the run's code, docs and ledger rows; `origin/dev` is unchanged; the run made no `git push`, no PR call and no Actions call (a debug run in place on local `dev` keeps its own commits there, D-AS1).
2. A local run for feature B starts from local `dev` and contains feature A's code, docs and ledger rows from A's earlier local ship, both when local `dev` is only ahead of `origin/dev` and when the two have split (one warning with the ahead and behind counts in the split case).
3. Without the setting or token, every workflow behaves exactly as today; cloud and Actions runs always publish, whatever the setting or token says.
4. On a batch push, the pre-push hook refuses a push that carries code and ends on a `[skip ci]` commit and tells the owner to add an empty trigger commit; `dev` CI maps every code-carrying `{type}({FID}):` commit in the pushed range to its issue (D-AS2).
5. A local ship leaves the issue with `bkit:merged`, board `In review`, still open, plus a "landed on local dev, not pushed" comment and a line saying the `blob/dev/...` links resolve after the owner pushes `dev`.

### Key Edge Cases

- Uncommitted edits in the main checkout overlap the incoming commit → the run stops before `dev` moves and names the paths; local `dev` and the edits are untouched, the worktree is kept, and a re-run of the same workflow lands once the owner commits or moves the edits.
- Main checkout on a branch other than `dev` → the `dev` ref is advanced by fast-forward without a checkout; the owner's branch and files stay as they are.
- `dev` checked out in another linked worktree → the run stops and names that worktree; it never moves a ref another worktree has checked out (D-AS3).
- Two local runs land at the same moment → the second waits on the landing lock, then builds its commit on top of the first and re-runs its checks on that combined result.
- The owner commits on `dev` by hand while a landing is in flight → the compare-and-swap advance loses, the run rebuilds on the new `dev` and re-checks, within the existing landing attempt budget (D-AS3).
- Affected tests or static checks fail on the combined result in the scratch checkout (exit `1`, `verdict: FAIL`) → no landing, the worktree is kept, and the run routes to `/bkit-debug`.
- Another bkit run on the machine holds the machine-wide `tests` lock → the landing waits for it; if that wait runs out, the run stops with the holder named and does not route to `/bkit-debug`, because no test ran (D-AS5).
- A landing lock file left by a crashed holder whose PID now belongs to another live process → the lock is reclaimed, as for a dead holder (D-AS5).
- A crashed landing left `.worktrees/_land-{FID}` behind → the next landing for that FID removes it after taking the landing lock and says so (D-AS5).
- `bkit:gate:changed` is undeclared → the landing runs `bkit:gate:static-unit` whole and says so.
- Mixed modes: a branch built or designed locally and then run with `publish=true` → today's refusal of a branch carrying unpushed `dev` work applies, and its message names both ways out (push `dev`, or re-run with `publish=false`) (D-AS4).
- Held feature branches: build holds, debug fixes the held branch and pushes nothing, only ship lands it.
- A copy-and-own pre-push hook that lacks the `[skip ci]` tail guard → `bkit check` advises while any workflow's `publish.local` is `false`.

### Process Sketch

- WHEN a local design or plan closes → THEN one `docs({FID}): {phase} DONE bkit [skip ci]` commit lands on local `dev`; nothing is pushed.
- WHEN a local build finishes → THEN it stays held on `feat/{FID}` and the issue says built locally, not published.
- WHEN a local ship runs on a held build → THEN the deferred sweep, docs update and skill prune run in the worktree, affected tests and static checks pass on the combined result under the landing lock, one `{type}({FID}): …` commit with no skip token lands on local `dev`, and the clean worktree and branch are removed.
- WHEN a local debug fixes a held branch → THEN the fix is committed there and stays held for ship; WHEN it runs in place on local `dev` → THEN its commits stay on `dev` and the close push is skipped.
- WHEN a second local landing finds the lock held → THEN it waits, then lands on top of the first.
- WHEN the owner pushes a batch → THEN the pre-push hook and `dev` CI run once, and the automatic follow-up maps each code-carrying FID in the range to its issue.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Per-workflow publish setting | `BuildPublish` / `buildPublish` / `invalidBuildPublish` (`.bkit/core/engine/shared/settings.ts:68-73, 263-281, 413`) | EXTEND | Generalise to `WorkflowPublish` keyed by workflow; build keeps its key and defaults, so its callers see no change. |
| Publish resolution (token, setting, runtime coercion) | `publishRoute` + `PUBLISH_TOKEN` (`.bkit/core/engine/commands/workflow/status.ts:313-339`) | EXTEND | Drop the `workflow === "build"` filter and take the workflow; the non-LOCAL `false` → `true` coercion already covers the cloud / Actions constraint. |
| Freezing the mode for the run | `runtime-resolved` row (written at Step 2 by `bkit runtime row`; read by `publishRoute`, `branches.ts:2758`, `prs.ts:975`) | EXTEND | Add `publish` and `publishSource` to the row; today `publishRoute` re-reads `package.json` on every call, so a mid-run config edit can flip the mode between start and close. |
| Start base per workflow | `devBase` / `worktreeBase` (`.bkit/core/engine/commands/workflow/worktrees.ts:179-224`) | EXTEND | Take the frozen mode: local → `refs/heads/dev` always, with one ahead / behind warning; published → today's choice unchanged. |
| Mode → ref mapping | None: `origin/dev` / `UPSTREAM` named about 150 times across 16 engine command files (searched `rg -c 'origin/dev\|UPSTREAM' .bkit/core/engine/commands`) | NEW | `landingRef(mode)` replaces the literals at the start base, the cleanup proof, the close gate and the unpushed-`dev` refusals, so a later call site cannot silently read the wrong copy of `dev`. |
| Unpushed-`dev` refusals | `inheritedDevCommits` / `assertShipEligible` (`worktrees.ts:231-266`), design / plan Step 2 exit 7 | EXTEND | Skipped when the mode is local (a squash onto local `dev` carries only the branch's own delta); kept, with both ways out in the message, when published. |
| Landing loop | `pushToDev` (`.bkit/core/engine/commands/land.ts:222-276`), its five callers `landDirect`, `shipClose`, `landFailedRecord`, the roadmap mirror and `pushOwnCommits` | EXTEND | The issue forbids a second landing routine. Add `target: "remote" \| "local"`; `remote` stays today's code path byte for byte. The local target returns its own result union, `LocalLand`, with no `refused` kind, because every caller maps `DevPush`'s `refused` to a PR fallback that must be unreachable in local mode. |
| Pre-land checks | `checkLanding` (`land.ts:188-210`), `bkit tests changed --base= --fallback=` (`.bkit/core/engine/commands/workflow/tests-changed.ts`, run body at `:139-201`, exported `changedFiles(top, base)`), `bkit:gate:changed` (`.bkit/workflows.md` § Local gate scripts) | EXTEND | Owner answer 2 is exactly `bkit:gate:changed`'s contract; local target swaps the gate selection and keeps the "checkout unchanged" assertions. Pull gate selection and exit classification out of `testsChangedVerb.run` into an exported function that `checkLanding` calls in process, instead of spawning the CLI, so the landing reads the exit class directly. |
| Advance local `dev` | #849's `.bkit/core/engine/commands/workflow/local-dev.ts` (planned, built before this design): `syncLocalDev`, `LocalDevSync`, the `occupied` and `edited-files` blocked reasons classified from git state (decision `849-blocked-reasons-from-git-state`), the ahead / behind count by `rev-list --left-right --count`, the frozen install after a move under the main checkout (`849-keep-local-dev-plan.md:225-230, 379-381`) | ADAPT | `advanceLocalDev` is a strict sibling export in `local-dev.ts`. It shares #849's move, `occupied` detection, `edited-files` classification and install. It adds a compare-and-swap from `DEV_AT` and a fail-closed result: a refusal stops the run. `syncLocalDev` keeps its contract that it never changes the caller's exit code (decision `849-sync-local-dev-after-every-dev-push`), so it is not changed. |
| Landing lock | `acquirePublicationLock` / `releasePublicationLock` (`.bkit/core/engine/commands/workflow/locks.ts:170-227`, one caller `tracker.ts:1745`): git-common-dir file, exclusive create, host + PID + start-time liveness | EXTEND | Add a caller option that lifts the hard 30 s `Math.min` cap, and a result union in place of `null` for the landing caller. Reclaim a holder whose PID is alive but whose start time differs, as for `ESRCH`. Today it returns the same `null` for six causes and leaves a PID-reused holder's file in place (spike C8, C10); the tracker caller keeps its fail-open `null`. |
| Lock wait bounds | `TIMEOUTS` (`.bkit/core/engine/shared/timeouts.ts`, `LAND_ATTEMPTS: 10`) | EXTEND | Add `LAND_TESTS_LOCK_WAIT` (passed to the check as its `--lock-wait-s`) and `LAND_LOCK_WAIT`, derived from it, beside the existing landing constants, so the two waits are set together. |
| Ship close commit | `shipClose` (`.bkit/core/engine/commands/workflow/workflows.ts:1488-1504`), `buildClose`, `carryBook`, `bkit ledgers union` | EXTEND | Local target builds one commit: squash of `feat/{FID}` plus the carried close book, in the same scratch checkout. |
| Guarded cleanup | Step 14 landed comparison (file content, mode, type) against `origin/dev` | EXTEND | The comparison ref becomes `landingRef(mode)`; the proof is "the landed sha is an ancestor of local `dev` and the branch's files match at that sha", so a later landing on top does not falsify it. |
| `[skip ci]` tail refusal on batch push | `.bkit/templates/.husky/pre-push:156-167` (`bkit ci skip-token` + `bkit ci min-push` over `$PUSH_SHARED_SHAS`) | EXTEND | Already ships owner answer 6; add only a batch-shape test. |
| Stale-copy warning | Preflight advisories in `.bkit/core/engine/checks/before/repo.ts` (beside `bkit-build-publish-remote`, `:103`) | EXTEND | New `PreflightFinding`s, while a workflow's `publish.local` is `false`: one when the installed `.husky/pre-push` lacks the skip-token tail guard, one when the installed `.github/workflows/bkit-cloud.yml` lacks the range read (copy-and-own files are never rewritten). |
| Batch FID mapping | `bkit fids parse` (`--prompt-file`, `--marker`, `--branch`; `fids.ts:727-736`) and the last-completed-`dev`-run lookup in the copy-and-own `.bkit/templates/.github/workflows/bkit-cloud.yml` and bkit's adopted `.github/workflows/bkit-cloud.yml:552-586` (the two differ today) | EXTEND | Add `--range=A..B`; `.agents/rules.md` § Workflow bash blocks puts parsing in a `bkit` verb, not YAML bash. The YAML edit lands in both copies. |
| Tracker state after a local ship | `issue-update-merged` marker block; build's "built locally, not published" comment | EXTEND | Same labels and status as a normal ship (owner answer 4), plus the comment and the links line (Q4). |
| No-push guarantee in tests | `ship-invariants.test.ts`, `skip-ci-subject-audit.test.ts`, `runtime-prose-audit.test.ts` (`.bkit/core/engine/audits/workflows/`) | EXTEND | Add local-mode cases: no `git push` / `prs` / `runs dispatch` reachable in local branches, the ship landing subject and body carry no skip token, no new `origin/dev` literal outside `landingRef`. `skip-ci-subject-audit.test.ts`'s header premise ("a local commit's token never decides whether CI runs") stops holding and is rewritten. |
## Architecture

**Shape:** local mode is a different delivery for the same five workflows, not a second implementation of any of them. One value, the run's frozen publish mode, is resolved once and threaded through one engine seam. Published mode (the default) keeps today's code path byte for byte.

**Components and boundaries:**

1. **Publish resolver** (EXTEND `publishRoute`, `shared/settings.ts`). Precedence, in order: a `publish=true|false` token in the session prompt file; else `bkit.workflows.{workflow}.publish.local` on a LOCAL runtime or `.publish.remote` on any other; default `true`. A non-LOCAL `false` (token or setting) resolves `true` with a warning. Applies to `design`, `plan`, `build`, `debug` and `ship`; `/bkit-auto` passes a given token through to the workflow it delegates to, and each delegated workflow reads its own setting (Settled Q5). The token is read only from the session prompt file, never from issue, PR or comment text (`docs/security.md` § Untrusted Content).
2. **Frozen mode** (EXTEND the `runtime-resolved` row). Step 1 resolves the mode from the token, the setting and `bkit runtime detect`, because Step 2's `worktrees setup` needs it before the row exists. Step 2 writes `publish` and `publishSource` into the `runtime-resolved` row. Every later read (route, close, failure path, resume) folds the row and never re-reads `package.json`. On resume, a row value that differs from a fresh resolution wins, with one warning naming both.
3. **`landingRef(mode)`** (NEW). Returns `dev` for local and `origin/dev` for published. The start base, the guarded-cleanup proof, the close verification gate (`steps gate --ref=`) and the unpushed-`dev` refusals call it instead of naming `origin/dev`.
4. **Start base** (EXTEND `worktreeBase` / `devBase`). Local mode: every workflow that creates a branch cuts it from `refs/heads/dev`, always. Step 1 computes `ahead` / `behind` of `dev` against `origin/dev` once (after `bkit repo info --fetch`, which stays a read-only fetch), with #849's `rev-list --left-right --count` in `local-dev.ts`, and prints one line: the unpushed count when only ahead, and both counts when split. Local mode skips design / plan's Step 2 exit 7, `assertShipEligible`, and build / ship's "publish `dev` before the feature PR" narration. Debug adopts or resumes its branch as today; a debug run that has to create its branch uses this rule.
5. **Landing seam** (EXTEND `pushToDev` with `target`). The parts that never change stay shared: `dropLandTree`, `withoutHooks`, the caller's `build(dir)` callback, `prepareLandInputs`, the "checkout unchanged" assertions and the attempt loop. Only where the scratch checkout starts and how it finishes differ:
   - `target: "remote"`: today (fetch, base `origin/dev`, `bkit:gate:min` or `requiredPushGate`, `git push origin HEAD:dev`, retry on `moved`).
   - `target: "local"`: take the landing lock; remove a stale `.worktrees/_land-{FID}` left by a crashed landing; capture `DEV_AT = rev-parse refs/heads/dev`; `worktree add --detach .worktrees/_land-{FID} DEV_AT`; the caller builds its one commit; checks = `bkit:gate:min` for a bookkeeping-only landing, else the changed-files check with `--base=DEV_AT --fallback=bkit:gate:static-unit --lock-wait-s=TIMEOUTS.LAND_TESTS_LOCK_WAIT`, called in process; then `advanceLocalDev(NEW, DEV_AT)`; release the lock. No `push` argv is reachable on this target. It returns `LocalLand` (Data Model), never `DevPush`.
   - **Landing invariant, restated in `land.ts`'s header:** "On `target: 'remote'`, the main checkout's branch, index and edits are never touched. On `target: 'local'`, the only write to the main checkout is `advanceLocalDev`'s compare-and-swap fast-forward of `refs/heads/dev`, done last; git refuses it on any overlapping edit, so the branch, index and edits are never changed."
   - **Why the advance runs inside `pushToDev`, unlike #849's sync:** a lost compare-and-swap (`moved`) must rebuild the commit and re-run the checks, and that retry is the shared attempt loop inside `pushToDev`. #849's second reason for keeping its sync out, that a throw there turns a landed close into `EXIT_FLUSH_FAILED`, does not apply: on the local target the advance is the landing itself, so a failed advance means nothing landed and is a `LocalLand` stop result, never a flush failure.
6. **`advanceLocalDev`** (ADAPT #849's `local-dev.ts`, a sibling export of `syncLocalDev`). The only write to the owner's `dev`, done last, as a compare-and-swap from `DEV_AT`, run inside `withoutHooks`:
   - `dev` not checked out in any worktree (from `git worktree list --porcelain`, #849's `occupied` detection) → `git update-ref refs/heads/dev NEW DEV_AT`. The explicit check is required because `update-ref` moves a `dev` checked out elsewhere without refusing (spike C2).
   - Main checkout on `dev` → assert `HEAD` = `DEV_AT`, then `git merge --ff-only NEW`; git refuses on its own when an uncommitted, staged or untracked file sits on a path `NEW` changes (spike C3).
   - `merge --ff-only` refused → re-read `HEAD`: `HEAD` != `DEV_AT` → `moved` (a hand commit landed between the assertion and the merge, spike C5); `HEAD` = `DEV_AT` → classify with #849's `edited-files` from git state, never from git's stderr.
   - `dev` checked out in another linked worktree → `blocked` with reason `occupied`, naming that worktree.
   - Outcomes: `advanced`, `moved` (the CAS lost: rebuild and retry within `LAND_ATTEMPTS`, as published mode does for `origin/dev`) and `blocked` (reason `occupied` or `edited-files`, with the worktree or the paths; `dev` and the edits untouched).
   - `advanced` with the main checkout on `dev` → run #849's frozen install, because a lockfile change lands under the main checkout. An install failure keeps the landing and exit 0, and the `localDev` line names the install command to re-run (decision `849-close-exit-0-on-install-failure`).
   - **Why `withoutHooks`:** a plain `merge --ff-only` fires the consumer's `post-merge` and `reference-transaction` hooks, and the engine's `withoutHooks` override stops all of them (spike C4). The advance is an engine-driven move of a commit already checked in the scratch checkout, which also runs with hooks off; the frozen install covers what a `post-merge` install hook would do.
7. **Landing lock** (EXTEND `acquirePublicationLock`). One repo-wide lock for local landings, under `{git-common-dir}/bkit-outbox/publication-locks/`, so every worktree resolves the same file and it never rides a commit. Held across the scratch build, the checks and the advance. The holder is the `bkit` process doing the landing. The landing caller gets a result union in place of `null`, with one response per outcome:
   - `acquired` → land.
   - `held` (a live same-host holder, or a holder on another host, whose liveness cannot be checked) → wait, printing the holder every 30 s, up to `TIMEOUTS.LAND_LOCK_WAIT`, then `timeout`.
   - `timeout` → stop the run, worktree kept, naming the holder (workflow, FID, since, host and PID) and the lock file path; the line says to stop that run, or delete the file if that host or PID is gone.
   - Holder dead (`ESRCH`) or PID alive with a different start time (PID reuse after a crash) → reclaim: re-check the token, unlink, retry the create. Today only `ESRCH` is reclaimed; a start-time mismatch returns `null` and leaves the file (spike C8).
   - `unavailable`, reason `holder-unreadable` (the holder file does not parse) → stop the run, worktree kept, naming the file path to delete; a half-written file cannot be told apart from a live writer's.
   - `unavailable`, reason `no-process-identity` (`ps -p … -o lstart=` gives no start time for this process, for example a host without `ps`) or `common-dir-unreadable` → land without the lock, compare-and-swap only, with one warning naming the reason. CAS alone still refuses a moved `dev` (spike C1); the cost is that parallel landings may re-run their checks.
   - The 30 s `Math.min` cap is lifted only behind the landing caller's option; the tracker-comment caller keeps its 30 s fail-open `null`.
   - The CAS stays as the backstop against a writer that ignores the lock, such as the owner's own `git commit` on `dev`.
8. **Callers on the local target:** `landDirect` (design / plan close), `shipClose` (ship close), `landFailedRecord` (Failure Path record), the roadmap mirror. `pushOwnCommits` (debug in place on `dev`) is not called in local mode, because the run's commits are already on local `dev`. On a `LocalLand` stop result, no caller opens a PR:
   - `landDirect` and `shipClose` → stop the run with a non-zero exit, worktree kept, and print the stop line (Data Model, `landing` log line).
   - `landFailedRecord` and the roadmap mirror → print the stop line as a warning, leave the record in the run's worktree, and keep the caller's exit code, because they run on a path that is already failing or is ancillary to the close.
   - **`localDev` on a local landing:** every local-target verb emits #849's `localDev` field with `state: "unpushed"` and the line "Your work landed on local dev ({NEW}), not pushed. Local dev is {ahead} ahead of origin/dev; push dev to publish." It never prints #849's "Your work landed on origin/dev" opening. Whether #849's `LocalDevSync` type and its reachability test can carry `unpushed` is open (Risks & Open Questions).
9. **Workflow sources** (`.bkit/core/workflows/bkit-{design,plan,build,debug,ship,auto}.md`). They branch on `PUBLISH` only where delivery differs: the start narration, the summary-step branch push, the close, and ship's PR / CI / merge steps. Every git decision stays in `bkit` verbs, so the sources carry flags, not git commands.
10. **Batch push support:** the existing pre-push `[skip ci]` tail guard; `bkit check` advisories for a pre-push hook that lacks it and for a `bkit-cloud.yml` that lacks the range read; `bkit fids parse --range`; the `dev` arm of `bkit-cloud.yml` reads the range, in the template `.bkit/templates/.github/workflows/bkit-cloud.yml` and in bkit's adopted `.github/workflows/bkit-cloud.yml`. A consumer's older copy falls back to the head-commit parse and does nothing after a trigger commit, which is why it gets the advisory. The YAML edit needs the owner's sign-off before the build touches it (`.agents/rules.md` § CI edits).

**Integration points:** `package.json` `bkit.workflows.*` (settings), `status.jsonl` rows (frozen mode, outcome), the git common dir (lock), the main checkout's `dev` ref (advance), the tracker (labels, status, comments), the copy-and-own `.husky/pre-push`, and `bkit-cloud.yml`.

**Host parity:** the engine is host-independent, and the workflow sources render to every host's mirror through `bkit upgrade`, so Claude Code, Cursor, OpenCode, Codex and Antigravity get the same behaviour. No host-specific setting or hook is added.

**Non-goals:** pushing `dev` (the owner does it), a bkit batch-push command (#715's decision, `715-no-batch-publish-verb`, closed by the owner as a deliberate non-goal; this design does not reopen it), a tool that reconciles an existing split (#849's cut, `849-local-dev-recovery-tool`), and any change to published mode.

**Plan split** (owner comment 2026-11-12: the work no longer fits one issue). All plans start after #911 and #849 are built, because both rewrite ship's close and renumber its steps:

- **P1: Publish mode and start base.** Resolver, settings, frozen row, `landingRef`, start base, the skipped refusals and narration, `/bkit-auto` pass-through. Requires nothing in this design.
- **P2: Local landing target.** `pushToDev` `target`, `LocalLand`, `advanceLocalDev` in #849's `local-dev.ts`, the landing lock and its result union, the pre-land checks and their exit classes, the stop lines and outcome reasons, the stale scratch-tree cleanup, the four local-target callers, design / plan local close, the Failure Path record. Requires P1, and a re-read of #849's landed `local-dev.ts` before it starts.
- **P3: Ship and debug in local mode.** Ship's local step routing and one-commit close, guarded cleanup against local `dev`, debug on a held branch and in place on `dev`, tracker texts. Requires P1 and P2.
- **P4: Batch push.** Pre-push batch-shape test, stale-copy advisories, `bkit fids parse --range`, the `bkit-cloud.yml` range read in the template and the adopted copy (owner CI sign-off), and the owner runbook in `docs/deployments.md`. Requires nothing in this design; the YAML part waits for the sign-off.

## Data Model

No database. The data is configuration, run rows, one lock file and git refs.

**`package.json` settings** (`bkit.workflows.{workflow}.publish`, for `design`, `plan`, `build`, `debug`, `ship`):

<!-- prettier-ignore -->
| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `local` | boolean | `true` | `false` = this workflow lands on local `dev` (design, plan, ship, debug) or holds on its branch (build) on a LOCAL runtime. |
| `remote` | boolean | `true` | Accepts only `true`; `false` prints `bkit-{workflow}-publish-remote` and resolves `true`, as build does today. |

Build's existing key and advisory are unchanged. An unset key means today's behaviour, so no migration is needed: no old install changes meaning.

**`runtime-resolved` row** (`status.jsonl`, Step 2) gains:

<!-- prettier-ignore -->
| Field | Type | Notes |
| --- | --- | --- |
| `publish` | boolean | The frozen mode for the whole run. |
| `publishSource` | `"token"` \| `"local"` \| `"remote"` \| `"coerced"` | Same vocabulary as `publishRoute` today. |

A run started before the upgrade has no `publish` field; its readers fall back to today's live resolution, so an in-flight run keeps working.

**`close-transport` row:** `shape` gains `unpushed` (landed on local `dev`, not pushed) beside `local` (direct push to `origin/dev`) and `pr`. The new value cannot be `local`, because `local` already means "pushed directly" in every existing reader.

**`landing` log line** (local target, success): `FID`, `DEV_AT`, `NEW`, the gate script, its exit, the changed-file count and `attempts` (the number of `moved` retries), so a wrong base shows as a file count far above the run's diff, a busy batch shows before it exhausts `LAND_ATTEMPTS`, and `DEV_AT` is the sha the owner reverts to by hand if a bad landing must be undone. `NEW` is the local sha; a `git pull --rebase` before the batch push changes it, so the FID in the subject, not `NEW`, is what finds the landing afterwards.

**Stop lines** (local target, every stop): one stderr line with the owning verb's prefix (`[bkit-branches]` for `branches land`, `[bkit-workflows]` for ship's close, per `docs/observability.md`), carrying `FID`, `DEV_AT`, the reason and its detail (the holder, the paths or the worktree, the exit), plus the same reason on the `outcome` row:

<!-- prettier-ignore -->
| `LocalLand` kind | Reason | Detail | Run's response |
| --- | --- | --- | --- |
| `advanced` | none | `NEW`, `attempts` | Land; `close-transport` `shape: unpushed`. |
| `stopped` | `lock-timeout` | holder, lock file path | Stop, worktree kept. |
| `stopped` | `lock-unreadable` | lock file path to delete | Stop, worktree kept. |
| `stopped` | `blocked-occupied` | the worktree holding `dev` | Stop, worktree kept. |
| `stopped` | `blocked-edited-files` | the paths | Stop, worktree kept; re-run after the owner commits or moves the edits. |
| `stopped` | `moved-exhausted` | `attempts` | Stop, worktree kept. |
| `stopped` | `checks-red` | gate, exit `1`, `verdict: FAIL` | Stop, worktree kept, route to `/bkit-debug`. |
| `stopped` | `tests-lock-timeout` | the `tests` lock holder, exit `81` | Stop, worktree kept; no `/bkit-debug`, because no test ran. |
| `stopped` | `checks-could-not-run` | gate, exit (`3`, `4`, `126` or `127`) | Stop, worktree kept, with the reason; no `/bkit-debug`. |

A lock that is `unavailable` for `no-process-identity` or `common-dir-unreadable` is not a stop: the landing proceeds CAS-only, and the `landing` line carries `lock: "none"` and the reason.

**`outcome` row** (`.bkit/stats.jsonl`): `publish?` widens from build-only to all five workflows. `ending` is `held` for a local build (today) and `done` for a local design, plan, ship or debug. A stopped local landing adds `landing: { reason }` with the reason from the table above, so stopped landings can be counted by reason.

**Landing lock file:** `{git-common-dir}/bkit-outbox/publication-locks/{sha256("dev-landing\0local")}.lock`, JSON `{ token, path, owner: { host, pid, startTime }, label: { workflow, fid, at } }`. `label` is optional and read only for the "waiting on the landing lock held by {fid} since {at}" line printed every 30 s.

**Lock wait constants:** a landing holds the landing lock across its changed-files check, and that check first waits on the machine-wide `tests` lock, which every bkit test run on the machine takes. Measured on one real 101-file landing in bkit's repo (spike C11): setup and frozen install 5-7 s; checks about 11.5-12.5 minutes; total hold 1413 s with an 11-12 minute `tests`-lock wait, and 1809 s in a second run whose `tests`-lock wait ran out at 1800 s before any check started.

- `TIMEOUTS.LAND_TESTS_LOCK_WAIT`: proposed 30 minutes, passed to the check as `--lock-wait-s`. Exhausted → `tests-lock-timeout`.
- `TIMEOUTS.LAND_LOCK_WAIT`: `LAND_TESTS_LOCK_WAIT` plus a 20-minute check budget, so proposed 50 minutes. Exhausted → `lock-timeout`, holder named.

**`bkit fids parse --range=A..B --json`:** a list `[{ fid, sha, subject, code }]`, oldest first, deduplicated by FID, each FID matching `^[a-z0-9][a-z0-9-]*$`. `code` is `false` when the commit's subject carries a CI-suppressing token. Capped at a fixed maximum per run. The range base `A` is the `headSha` of the first completed `bkit-ci.yml` `dev` run in `gh run list` whose `headSha` differs from `HEAD_SHA`, because `.[0]` is the run that triggered this one (the existing stale-run guard relies on that).

**Commit subjects on local `dev`:**

<!-- prettier-ignore -->
| Run | Commits on local `dev` | Subject |
| --- | --- | --- |
| design / plan close | 1 | `docs({FID}): {phase} DONE bkit [skip ci]` (as today) |
| ship close | 1 | `{type}({FID}): {title}`, the subject a PR squash would carry; no skip token in the subject or the body |
| Failure Path record | 1 | `chore({FID}): {phase} FAILED [skip ci]` (as today) |
| debug in place on `dev` | the run's own commits | as today |
| build | 0 | held on `feat/{FID}` |

**`docs/decisions.jsonl` row** for the design close to write (the input asks for it): key `924-local-runs-land-on-local-dev`, summary "Local runs may land on local `dev` without a PR or CI; the check moves to the owner's push", partly reversing #715's rejection of a ship that skips the PR for local runs only, because a local landing changes nothing on GitHub until the owner's push runs the pre-push hook and `dev` CI. Its references cite `docs/knowledge.jsonl` KN-11 and the shipped `.bkit/templates/.husky/pre-push` comment as the evidence that GitHub reads a push's skip token from its head commit only, because GitHub's own skip page does not say head-only for pushes.

## Components / Flows

Step names, not numbers, because #911 and #849 renumber ship before this builds.

**Local landing (shared by every local close):**

1. Acquire the landing lock and act on its result (Architecture, component 7): `acquired` → step 2; `held` → wait, narrating the holder every 30 s, up to `LAND_LOCK_WAIT`; `timeout` or `holder-unreadable` → stop, worktree kept, stop line; `no-process-identity` or `common-dir-unreadable` → one warning, continue CAS-only.
2. If `.worktrees/_land-{FID}` exists or git still lists it → remove it (`git worktree remove --force`, then `git worktree prune`) and print one line saying a stale landing checkout from a crashed run was removed. This is safe only after step 1, because the landing lock and the per-FID workflow lock rule out a live landing for this FID.
3. `DEV_AT` = local `dev`; add `.worktrees/_land-{FID}` detached at `DEV_AT`, hooks off.
4. The caller builds one commit there.
5. Check: the checkout is clean and unchanged; bookkeeping-only → `bkit:gate:min`; else the changed-files check, in process, with `--base=DEV_AT --fallback=bkit:gate:static-unit --lock-wait-s=LAND_TESTS_LOCK_WAIT`, narrating the fallback when `bkit:gate:changed` is undeclared. Classify the exit:
   - `0` → step 6.
   - `1` with `verdict: FAIL` → `checks-red`: stop, nothing moved, route to `/bkit-debug`.
   - `81` (the `tests` lock wait ran out, `verdict: null`, no test ran) → `tests-lock-timeout`: stop, nothing moved, holder named, no `/bkit-debug`.
   - `3`, `4`, `126` or `127` (no gate, or the gate could not run) → `checks-could-not-run`: stop, nothing moved, with the reason, no `/bkit-debug`.
6. `advanceLocalDev(NEW, DEV_AT)`: `advanced` → step 7; `moved` → drop the scratch tree, back off, go to step 3 within `LAND_ATTEMPTS` (exhausted → `moved-exhausted`, stop); `blocked` → stop with the paths or the worktree that holds `dev`.
7. Release the lock, drop the scratch tree, log the `landing` line, write `close-transport` `shape: unpushed`, emit `localDev` with `state: "unpushed"`.

Every stop in steps 1, 5 and 6 releases the lock, prints its stop line and writes the reason on the `outcome` row (Data Model).

**`/bkit-design` and `/bkit-plan` (local):** Step 1 resolves `PUBLISH` and prints the ahead / behind line; Step 2 cuts from local `dev` and skips exit 7; the phase steps are unchanged; the summary step skips its branch push; the close runs `landDirect` on the local target (`buildClose` unchanged: its doc-only check stays valid because the base already holds every earlier local landing), the close gate reads `--ref=dev`, and the tracker comment adds the "landed on local dev, not pushed" line and the links line. A plan run reads a locally landed design because its worktree starts from local `dev`.

**`/bkit-build` (local):** unchanged `publish=false` behaviour (Settled Q2): held on `feat/{FID}`, no push, no PR, `ending: held`. Only the base changes (local `dev` always) and the "publish `dev` first" narration goes.

**`/bkit-debug` (local):**

- On a held `feat/{FID}`: the fix is committed on the branch; the remediation pushes, the summary push, the CI wait and the PR creation are skipped; the branch stays held for ship (Settled Q3). Verification is the run's local tests step.
- In place on local `dev`: the run's commits stay on `dev`; `pushOwnCommits` is not called; the close reports "committed on local dev, not pushed" with the replayed count.

**`/bkit-ship` (local, on a held build):**

- Start: as today, plus `PUBLISH` resolution and the ahead / behind line; setup cuts or resumes on local `dev` and skips `assertShipEligible`.
- Verify PR: reconcile the feature branch locally; skip the PR lookup, the PR creation and every branch push.
- Confirm Assumed Items: unchanged.
- Base Check and Integrate: against local `dev` (`branches sync --merge --target=dev`); a code conflict goes to `@bkit-ship-conflict-resolve` as today.
- Deferred Sweep, Update Docs & Summary, Prune Skills: unchanged, in the worktree (the outcome the issue asks for).
- Commit Bookkeeping: the same `--scope=pr` commit on the branch, no push.
- Re-validate, Merge Gate + Merge PR, Failure Diagnose, Failure Remediate and the local `dev` sync: skipped. The pre-land checks in the landing replace CI for this run; a red check stops the run and routes to `/bkit-debug` on the held branch (Settled Q8).
- Close: `shipClose` on the local target builds one commit in the scratch checkout: `git merge --squash feat/{FID}` (no `-X ours`: a code conflict stops, and a re-run of ship re-integrates) plus `carryBook` of the close rows, committed with an explicit subject and an empty body so no `[skip ci]` from the branch's commits rides into the message. Then the shared local landing. Guarded cleanup compares against local `dev`. The tracker gets `bkit:merged`, `In review`, the issue left open, the "landed on local dev, not pushed" comment and the links line (owner answer 4, Settled Q4).

**`/bkit-auto` (local):** passes a `publish=` token through to the workflow it starts; with nothing pushed, the `bkit-cloud.yml` auto-route starts nothing until the owner pushes (Settled Q5).

**Owner's batch push:** `git push origin dev` → `.husky/pre-push` runs the full gates once; a code-carrying push whose last commit has a skip token is refused with the empty-trigger-commit line; `dev` CI runs once; on completion, the `dev` arm of `bkit-cloud.yml` takes the range from the head of the first completed `bkit-ci.yml` `dev` run whose `headSha` differs from `HEAD_SHA` to `HEAD_SHA`, runs `bkit fids parse --range`, and acts on the code-carrying FIDs (dispatch policy: Risks & Open Questions, item 3). No previous run, an unreachable base or a range over the cap → no-op with a summary row and a `::notice` annotation saying no batch mapping ran and why, so the owner sees it on the run page.

**Docs in the same change:** `.bkit/workflows.md` § Common Workflow Anatomy (worktree isolation rules per mode), § `/bkit-build` publish resolution (generalised), § `/bkit-ship` (local routing), § Concurrency lock (the landing lock), § Retry / timeout / iteration constants; `.bkit/cli.md` (new flags); `.bkit/templates.md` § Git hooks (the batch shape); `docs/deployments.md` (the owner's batch push and a recovery runbook: what to do when `origin/dev` moved, that the local landing shas change after a rebase and the FID finds a landing, how to revert `dev` to a landing's `DEV_AT` by hand, and how to clear a hung live lock holder: stop that PID, then re-run, and the lock is reclaimed; the runbook links #813, the open rollback-path issue). Workflow sentence edits go through `pnpm instructions:show` first.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One landing loop with a `target` (`remote` \| `local`) inside `pushToDev`; `remote` unchanged | Local `dev` as the push remote (`git push . HEAD:dev`); prompt-level git in each close; a private queue ref; a two-phase landing journal | The issue forbids a second landing routine, and #715's recorded reason for retiring lite workflows is drift between two implementations. `git push .` with `updateInstead` refuses any dirty main checkout, the owner's usual state, and without it a checked-out `dev` answers with text that matches `REFUSED` and sends the run down the PR path. |
| Freeze the mode in the `runtime-resolved` row; resolve it at Step 1 and pass it to `worktrees setup` | `workflow-started` row; keep reading `package.json` live | Today `publishRoute` reads the config on every call (`status.ts:320`), so an edit mid-run can start a worktree from local `dev` and then push the close to `origin/dev`. The `runtime-resolved` row already carries the runtime the mode depends on, and every existing reader folds it. |
| Advance local `dev` by compare-and-swap from `DEV_AT` (`update-ref NEW DEV_AT`, or `merge --ff-only` after asserting `HEAD` = `DEV_AT`), in `advanceLocalDev`, a strict sibling export of `syncLocalDev` in #849's `local-dev.ts` that shares its move, `occupied` detection, `edited-files` classification and install | Reuse `syncLocalDev` as is; a separate module beside `local-dev.ts`; `fetch . sha:refs/heads/dev` alone | `fetch .` checks fast-forward against whatever `dev` is now, so a `dev` moved back to an ancestor of `NEW` would be accepted as an untested combination; the CAS makes "checked tree = landed tree" hold (spike C1). `syncLocalDev` must keep its contract that it never changes the caller's exit code (decision `849-sync-local-dev-after-every-dev-push`), so it is not changed; a separate module would duplicate #849's `occupied` and `edited-files` logic. |
| The advance runs inside `pushToDev`'s local target, as its last step under the still-held lock; `land.ts`'s header invariant is restated per target | The caller advances after `pushToDev` returns the built sha; keep the invariant unchanged | A lost CAS must rebuild and re-check, and that retry is the shared attempt loop inside `pushToDev`; moving the advance to the callers would copy the loop into four places. #849 kept its sync out of `pushToDev` because a throw there turns a landed close into `EXIT_FLUSH_FAILED`; on the local target the advance is the landing, so a failure is a `LocalLand` stop result, not a flush failure. |
| The local target returns its own `LocalLand` union (`advanced` \| `stopped` with a reason), never `DevPush` | Reuse `DevPush` and test that `refused` never occurs | Every caller maps `DevPush`'s `refused` to a PR fallback; a separate union makes "no PR in local mode" a compile-time fact rather than a test. |
| The advance runs inside `withoutHooks`, followed by #849's frozen install when the main checkout is on `dev` | Let the consumer's `post-merge` hooks run | A plain `merge --ff-only` fires `post-merge` and `reference-transaction` hooks, and `withoutHooks` stops all of them (spike C4). The move is engine-driven and the commit was already checked with hooks off; the frozen install covers a lockfile change. |
| A refused `merge --ff-only` re-reads `HEAD`: moved off `DEV_AT` → `moved`, else `edited-files` from git state | Treat every refusal as `blocked` | A hand commit between the `HEAD` assertion and the merge makes git refuse (spike C5); calling that `blocked` would stop a run that a retry lands. |
| `dev` checked out in another linked worktree → stop and name it | Move the ref anyway | `update-ref` would move the ref under that worktree, which then shows the landing as reverted uncommitted edits: the "uncommitted edits are never changed" constraint broken from the other side. |
| A repo-wide landing lock held across build, checks and advance, built by parameterising `acquirePublicationLock` (bounded wait, a result union, reclaim on PID reuse); CAS kept as backstop | CAS-and-retry only; a new lock contract or a `--kind=dev` workflow lock; `proper-lockfile` | Settled Q7 asks the second run to wait. Without the lock, every lost race re-runs the affected checks, and a busy batch can exhaust `LAND_ATTEMPTS`. The publication lock already has same-host PID liveness and waits then acquires on release (spike C9) and reclaims a SIGKILLed holder (spike C7); a second lock contract would duplicate it, and `proper-lockfile` adds a runtime dependency with mtime-heartbeat semantics. |
| The landing lock returns `acquired` \| `held` \| `timeout` \| `unavailable` with a reason, and each has its own response (Architecture, component 7); a start-time mismatch is reclaimed like `ESRCH` | Map today's `null` to "stop, holder named" | Today's `null` covers six causes: a truncated holder file, a holder on another host and a host without `ps` all return it in 32-42 ms of a 10 s request, and a PID-reused holder returns it twice and keeps its file (spike C8, C10). "Stop, holder named" would stop every landing on a host without `ps`, name a holder that does not exist, and block every later landing after a crash until the file is deleted by hand. |
| The landing lock applies only to the local target, lives in the git common dir, and does not serialise published closes | One lock for every `dev` landing | Decision `design-plan-close-throwaway-origin-dev-worktree` says the published close takes no `dev` lock, and the retired `.bkit/.dev.lock` path (`docs/migrations.md`) stays untouched. A decisions row records this beside the design close's `924-local-runs-land-on-local-dev`. |
| Pre-land checks: the changed-files check with `--base=DEV_AT --fallback=bkit:gate:static-unit` for code, `bkit:gate:min` for bookkeeping, called in process from `checkLanding` | `requiredPushGate` (today's deepest full gate); `--fallback=bkit:gate:static`; no checks; spawning the `bkit tests changed` CLI | Owner answer 2 names `bkit:gate:changed`'s contract, run on the combined result. Basing on `DEV_AT` keeps the cost per landing flat as the batch grows. `static-unit` is the existing fallback for every non-task caller and is the only fallback that runs any tests. Format is covered: the contract includes format on the changed files, and the fallback chains `format:check`, which matters because hooks are off in the scratch checkout. An in-process call reads the exit class directly instead of parsing CLI output. |
| Pre-land exit classes: only exit `1` with `verdict: FAIL` routes to `/bkit-debug`; `81` stops as `tests-lock-timeout`; `3`, `4`, `126`, `127` stop as `checks-could-not-run` | Any non-zero exit is red | A real run exited `81` with `verdict: null` and `exitCode: 75` while another bkit run held the machine-wide `tests` lock, and no test ran (spike C13); routing that to `/bkit-debug` starts a fix loop for a passing change. |
| `LAND_LOCK_WAIT` derived from `LAND_TESTS_LOCK_WAIT` plus a check budget (proposed 30 + 20 = 50 minutes), both in `TIMEOUTS` | A flat 15 minutes | One real 101-file landing held the lock for 1413 s and 1809 s, most of it waiting on the machine-wide `tests` lock, and its checks alone took about 12 minutes (spike C11); a 15-minute wait would have stopped a second landing queued behind either run. Setting the two waits together keeps the bound honest when either changes. The lock order is an open question (Risks & Open Questions). |
| The next landing for a FID removes a stale `.worktrees/_land-{FID}` after taking the landing lock | Leave it for the owner; fail on the existing path | The design's recovery for every stop is a re-run, and `worktree add` fails on an existing path. The landing lock plus the per-FID workflow lock mean no live landing can be using that path. |
| Local mode starts every created branch from local `dev`, warns once on a split, skips the unpushed-`dev` refusals and the "publish `dev` first" narration | Keep the `origin/dev` fallback on a split; refuse on a split | Owner scope addition (2026-11-12). A squash onto local `dev` carries only the branch's own delta, so the refusals guard nothing in local mode. |
| Published-mode refusal of a branch carrying unpushed `dev` work stays, and its message names both ways out | Drop it in published mode too | A published PR from such a branch would publish the batch's other features unreviewed. |
| Ship local close = ONE commit in the scratch checkout: squash of `feat/{FID}` plus the carried close book; subject `{type}({FID}): {title}`, no skip token, empty body | Keep the separate `docs({FID}): ship DONE bkit [skip ci]` close commit; keep `[skip ci]` on the one commit | Settled Q1 (one squashed commit per run). Owner answer 6 says local commits keep their markers; the code commit's marker today is the PR squash subject, which has none. A skip token on a code commit would make the pre-push hook refuse every batch that ends on a ship. The empty body matters because `git merge --squash` seeds the message with the branch's subjects, several of which carry `[skip ci]`. |
| D-Q1: debug in place on local `dev` keeps its own commits; no squash. Departs from Settled Q1 for this one path | Squash them after the fact; route debug-on-`dev` through a scratch branch and the landing seam | Squashing commits already on `dev` needs a reset, which the constraints forbid. Settled Q3 says debug "commits there". Routing through a scratch branch would change what "in place" means in Q3. Owner confirmation asked in Risks & Open Questions, item 1. |
| D-AS1: Success criterion 1 scoped to design, plan and ship, with the debug-in-place exception | Draft wording "after a local run" | Build holds and lands nothing (Settled Q2), and debug in place keeps its commits (D-Q1), so the draft wording was false for two of five workflows. |
| D-AS2: Success criterion 4 maps only code-carrying FIDs | Every `{type}({FID}):` commit in the range | Design and plan landings in the same range carry `[skip ci]` and no code, so dispatching a debug run for them spends cloud sessions on features that cannot have broken CI. |
| D-AS3: two edge cases added: `dev` checked out in another worktree, and a hand commit on `dev` during a landing | Draft list only | Both shape the advance design (stop vs CAS retry) and were not in the draft. |
| D-AS4: two edge cases added: mixed modes and a stale copy-and-own pre-push hook; plus `bkit:gate:changed` undeclared | Draft list only | Criterion 4 holds only where the installed hook carries the guard, and bkit never rewrites a copy-and-own hook; mixed modes cross the two base rules. |
| D-AS5: three edge cases added: a held machine-wide `tests` lock, a PID-reused stale landing lock, and a stale `.worktrees/_land-{FID}`; the red-checks case scoped to exit `1` with `verdict: FAIL` | Draft list only | The spike showed a held `tests` lock exits non-zero with no test run (C13) and a PID-reused holder blocks the lock (C8); a crashed landing's scratch checkout breaks the re-run that every stop relies on. |
| Stale-copy advisories in `bkit check` (`checks/before/repo.ts`, beside `bkit-build-publish-remote`) when any `publish.local` is `false` and `.husky/pre-push` lacks the skip-token tail guard, or `bkit-cloud.yml` lacks the range read | Rely on the files as shipped | bkit is public and both files are copy-and-own; without the advisory a consumer's older hook silently lets a batch skip CI, and an older `bkit-cloud.yml` silently maps nothing after a trigger commit. The advisory text carries the fix inline (`.agents/rules.md` § Advisories self-contained). |
| Batch FID mapping by `bkit fids parse --range`, base = head of the first completed `bkit-ci.yml` `dev` run whose `headSha` differs from `HEAD_SHA`; untrusted subjects allow-listed, deduplicated and capped; no base → no-op with a summary row and a `::notice` | A `Bkit-Fids:` trailer on the trigger commit; YAML bash over `git log`; `.[0].headSha` as the base | `workflow_run` carries no `before`, so the range must come from the run history the job already queries; `.[0]` is the triggering run itself, as the existing stale-run guard shows. A trailer would couple the copy-and-own hook to the CI contract. Parsing belongs in a `bkit` verb. |
| Tracker after local design / plan / ship: today's states, plus "landed on local dev, not pushed" and the links line | `bkit:merged` withheld until pushed | Owner answer 4 and Settled Q4. The ahead count at every Step 1 keeps "merged but not pushed" visible. |
| Sequence all plans after #911 and #849 | Build alongside them | Both are `PLANNED`, both rewrite ship's close, and both renumber ship's steps. |
| No `docs/deferrals.jsonl` row for the batch-push command | Re-append `715-no-batch-publish-verb` | That row is `CLOSED` with the owner's sign-off as a deliberate non-goal, not deferred work; re-appending it would misstate the owner's decision. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| One landing loop with a `target` and a strict advance (pragmatic lens, Approach A) | MERGED | The base of the chosen design: reuses the loop, `checkLanding`, `buildClose`, `carryBook`, the coercion and the pre-push guard. Its `fetch .` advance is replaced by the premortem lens's CAS. |
| Landing routine split into shared parts plus a swappable destination, one resolver, one start-base function (optimal lens, Approach A) | MERGED | Supplies the shape: shared loop, two finishes, one resolver for five workflows, the plan split along the seams. |
| Frozen landing target, one engine seam, lock-then-CAS advance (premortem lens, Approach A) | KEPT | The selected approach. Adds the frozen mode, `landingRef`, CAS from `DEV_AT`, the stop on a `dev` held by another worktree, and the audit tests that keep a later call site from reading `origin/dev`. |
| Local `dev` as the push remote, `git push . HEAD:dev` (pragmatic B, premortem B) | REJECTED | `updateInstead` refuses any dirty main checkout; without it a checked-out `dev` is refused with text the loop reads as a server refusal and routes to a PR. Correctness would rest on git's local refusal wording. |
| Approach A without the lock, CAS retry only (pragmatic C) | MERGED | Not the concurrency mechanism (Settled Q7 asks for a wait, and lost races re-run checks), but kept as the backstop for hand commits on `dev`. |
| Prompt-level local close in each workflow, engine untouched (optimal B) | REJECTED | A second landing routine in five copies, with the riskiest operation (moving the owner's `dev`) in the least testable place. |
| Private queue ref published on demand (optimal C) | REJECTED | A batch-push command in all but name, which #715 turned down; `git push origin dev` would push nothing until an extra step runs. |
| Two-phase landing with a durable journal and a FID trailer (premortem C) | REJECTED | A second state store beside `status.jsonl`, `.bkit/issues.jsonl` and git, and close to a second landing routine. Its mitigation "derive the batch FIDs from git at use time" is MERGED into the `--range` read. |

## Trade-offs Accepted

- **One seam with a target over a separate local path.** Gain: one loop to test, published mode untouched, no drift between two implementations. Sacrifice: the mode threads through five callers and every place that named `origin/dev`; mitigated by `landingRef`, an audit test for new `origin/dev` literals and a no-push spy test.
- **Frozen mode over live config.** Gain: start base and close always agree. Sacrifice: an owner who edits `package.json` mid-run must re-run to change the mode; the start comment and summary header show the frozen value.
- **CAS from `DEV_AT` over `fetch .`.** Gain: the landed tree is the checked tree. Sacrifice: an explicit worktree-list check is needed, because `update-ref` does not refuse a checked-out ref the way `fetch .` does.
- **Lock plus CAS over CAS alone.** Gain: no wasted re-checks under parallel runs, matching Settled Q7. Sacrifice: a lock file with a bounded wait; a landing waits up to `LAND_LOCK_WAIT` (proposed 50 minutes) behind a long check and that check's own wait for the machine-wide `tests` lock.
- **CAS-only when the lock is unavailable.** Gain: a host without `ps` or with an unreadable git common dir can still land, and a moved `dev` is still refused. Sacrifice: parallel landings on that host may re-run their checks.
- **Affected checks over the full push gate.** Gain: landings stay fast, so batching pays. Sacrifice: integration tiers wait for the owner's pre-push run; a red there surfaces at batch time, further from its cause.
- **One ship commit with no skip token.** Gain: Settled Q1, and a batch that ends on a ship never needs a trigger commit. Sacrifice: ship's per-step history and its separate close record are not on `dev`; the run log carries them inside the same commit.
- **Debug in place keeps its commits.** Gain: no reset on `dev`. Sacrifice: that path lands several commits, not one (pending owner confirmation).
- **Range read in CI over a trailer.** Gain: the copy-and-own hook stays out of the CI contract. Sacrifice: a first push, a force-push or a superseded run leaves no reliable base, and the follow-up then does nothing for that batch.

## Risks & Open Questions

- **Owner to confirm the departure from Settled Q1 (D-Q1):** debug in place on local `dev` commits its fix there (Settled Q3), which is several commits, not the one squashed commit Q1 asks for. Options: A) Exempt that path and keep its commits — no reset on `dev`, matches Q3's wording, one path lands more than one commit · B) Route debug-on-`dev` through a scratch branch and the landing seam as one squash — Q1 holds everywhere, but debug no longer runs "in place" and Q3 changes · C) Squash after the fact — needs a reset of `dev`, which the constraints forbid. Recommended: A, because it is the only option that keeps both the constraints and Q3. Default if unanswered: A.
- **Owner to confirm the reading of answer 6 for ship's landing commit:** the one ship commit carries code, so the design gives it the PR-squash style subject with no skip token, while design, plan and Failure Path landings keep `[skip ci]`. Options: A) No skip token on the ship commit — a batch ending on a ship pushes without a trigger commit · B) Keep `[skip ci]` on it — every batch that ends on a ship is refused by the pre-push hook until the owner adds an empty commit · C) Two commits (code, then a `[skip ci]` close record) — breaks Settled Q1. Recommended: A, because the code commit's marker today is the PR squash subject, which has none. Default if unanswered: A.
- **How many debug runs a red batch starts:** one red `dev` run maps to several code-carrying FIDs, and most of them did not cause it. Options: A) One `/bkit-debug` per code-carrying FID, under a cap — every candidate gets looked at, but several cloud sessions try to fix the same failure in parallel and can push conflicting fixes · B) One `/bkit-debug` for the newest code-carrying FID, with the full FID list in its prompt and a short comment on each other issue — one session, one fix, the debug run diagnoses the failure itself whichever feature caused it · C) No dispatch; comment on every mapped issue — no cloud cost, but nothing fixes the red until the owner acts. Recommended: B, because one failure needs one fixer and the list keeps the other features visible. Default if unanswered: B.
- **What the docs tell the owner when `origin/dev` moved before the batch push:** the push is rejected, and bkit itself never rebases `dev`. Options: A) Document `git pull --rebase origin dev` — linear history, as bkit's own squash landings keep it; the local landing shas change, which matters only for log lines and comments that cite them · B) Document `git pull --no-rebase origin dev` — keeps the shas, adds a merge commit with no FID at the batch head (the range read still finds the FIDs) · C) Document both and leave it to the owner — no default, more for a reader to weigh. Recommended: A, because `dev` history is linear today and the run telemetry joins on worktree shas, not on the landing shas. Default if unanswered: A.
- **CI sign-off:** the `bkit-cloud.yml` range read edits a CI workflow file, so P4's YAML part waits for the owner's explicit confirmation (`.agents/rules.md` § CI edits). The rest of P4 does not.
- **The trigger commit carries no FID:** the hook's suggested `chore: trigger CI` commit becomes the batch head, and today's head-only parse then no-ops ("Cannot derive FID"). The range read is therefore required for the follow-up to work at all after a batch.
- **Concurrency group in `bkit-cloud.yml`:** the `dev` arm shares one `bkit-auto-${{ ... head_branch }}` group, which cancels older runs; any dispatch fan-out must happen inside one run, not across several triggered runs.
- **Commit subjects are untrusted input in CI:** keep the FID allow-list on every parsed scope, deduplicate, and cap the FIDs acted on per run (`docs/security.md` § Untrusted Content).
- **"Merged" before GitHub has it:** `bkit:merged` and `In review` on a local-only landing invite a human to close an issue whose code sits unpushed on one machine. The ahead count printed at every local Step 1 is the mitigation; the risk of a lost laptop holding unpushed features is accepted by the owner's workflow choice.
- **A later call site naming `origin/dev`:** about 150 engine lines across 16 files name it. Mitigation: `landingRef`, a Tier-2 audit failing on a new literal in `.bkit/core/engine/commands/workflow/` outside an allow-list of published-only paths, and a `runGit` spy asserting no `push` argv on the local target, plus a dogfood run with `origin` pointed at an unreachable URL.
- **Integration tiers move to batch time:** the landing runs affected checks only; an integration break shows up at the owner's pre-push, after several more features landed on top. Accepted by owner answer 2.
- **Dependencies:** #911 then #849 must be built first; this design names ship steps by name because both renumber them. #849's sync outcome vocabulary (equal, fast-forwarded, ahead, divergent, blocked) should gain the local landing's line rather than a parallel one.
- **Whether #849's landed code can carry the strict advance and an `unpushed` report (spike C15, BLOCKED):** `local-dev.ts` does not exist until #849 is built, so the `syncLocalDev` result type, its `localDev` line and its "every verb reachable from a `dev` push emits `localDev`" test could not be read or probed. Options: A) Extend #849's types in place: add `state: "unpushed"` to `LocalDevSync` and teach the reachability test that local-target verbs emit it — one report shape for every landing, but P2 edits #849's freshly landed module and test · B) Give the local target its own `LocalLand` report and exempt local-target verbs from the reachability test by name — no edits to #849's types, but two report shapes for the owner to read and an exemption list to keep current · C) Hold P2's plan until #849 lands and decide then — no guess, but the plan cannot be written ahead of #849. Recommended: A, because #849's decision makes `localDev` the one place every landing reports and a second shape would drift. Default if unanswered: A, re-checked by reading #849's landed `local-dev.ts` and running the C1-C5 probes against `advanceLocalDev` before P2's tasks are fixed.
- **Lock order for the landing lock and the machine-wide `tests` lock:** a landing holds the landing lock while its check queues for the `tests` lock, so a queued second landing waits through both (spike C11: 1413 s and 1809 s holds). Options: A) Keep the order and derive `LAND_LOCK_WAIT` from `LAND_TESTS_LOCK_WAIT` plus a check budget (proposed 30 + 20 = 50 minutes) — needs nothing unverified, but a queued landing can wait close to an hour · B) Take the `tests` lock before the landing lock and hand it to the check, so the landing lock is held only while checks run (about 12 minutes measured) — shorter waits, but it needs the tests lock to pass into the in-process check, which no probe has shown, and a consistent lock order everywhere to avoid a deadlock · C) Make both waits a `package.json` setting with A's values as defaults — owner can tune per repo, at the cost of one more setting to document. Recommended: A, because it is the only option the evidence already supports; B can follow once a probe shows the hand-off works. Default if unanswered: A, with both values re-measured on a landing in the plan.

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"docs/data-schema.md holds only the managed starter header; bkit has no database, so the design records its data model (settings, run rows, lock file) in the design itself","recommendedPath":"docs/data-schema.md","alternativeEvidence":".bkit/jsonl.md § Per-Kind Fields; .bkit/workflows.md § status.jsonl — workflow state SoT","action":"none — the doc does not apply to a repo with no database"}
{"topic":"landing-topology","gap":"docs/architecture.md does not describe how workflow closes land on dev (scratch checkout, push, local fast-forward); the contract lives only in .bkit/workflows.md and land.ts","recommendedPath":"docs/architecture.md","alternativeEvidence":".bkit/workflows.md § Common Workflow Anatomy; .bkit/core/engine/commands/land.ts pushToDev; #639","action":"add a short landing-topology pointer to docs/architecture.md in the build that adds the local target"}
```
