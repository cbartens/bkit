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

Built from the input's accepted Draft Acceptance Scenario (Settled Q9). Each change against the draft has a `Decisions` row (D-AS1 to D-AS4).

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
- Affected tests or static checks fail on the combined result in the scratch checkout → no landing, the worktree is kept, and the run routes to `/bkit-debug`.
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
| Landing loop | `pushToDev` (`.bkit/core/engine/commands/land.ts:222-276`), its five callers `landDirect`, `shipClose`, `landFailedRecord`, the roadmap mirror and `pushOwnCommits` | EXTEND | The issue forbids a second landing routine. Add `target: "remote" \| "local"`; `remote` stays today's code path byte for byte. |
| Pre-land checks | `checkLanding` (`land.ts:187-210`), `bkit tests changed --base= --fallback=`, `bkit:gate:changed` (`.bkit/workflows.md` § Local gate scripts) | EXTEND | Owner answer 2 is exactly `bkit:gate:changed`'s contract; local target swaps the gate selection and keeps the "checkout unchanged" assertions. |
| Advance local `dev` without a checkout | `fastForwardDev` (`.bkit/core/engine/commands/workflow/branches.ts:3117-3148`) | NEW | `advanceLocalDev` reuses `fastForwardDev`'s two git calls. `fastForwardDev`'s contract is that a refusal is a logged skip that never fails the close, and #849's sync builds on that. Local landing needs the opposite (a refusal stops the run) plus a compare-and-swap from the checked base, so changing `fastForwardDev` would break its callers. |
| Landing lock | `acquirePublicationLock` (`.bkit/core/engine/commands/workflow/locks.ts:170-205`): git-common-dir file, host + PID + start-time liveness | EXTEND | Add caller options for a longer bounded wait and fail-closed on timeout; today it caps at 30 s and returns `null` (fail open), which suits tracker comments but not `dev`. |
| Lock wait bound | `TIMEOUTS` (`.bkit/core/engine/shared/timeouts.ts`, `LAND_ATTEMPTS: 10`) | EXTEND | Add `LAND_LOCK_WAIT` beside the existing landing constants. |
| Ship close commit | `shipClose` (`.bkit/core/engine/commands/workflow/workflows.ts:1488-1504`), `buildClose`, `carryBook`, `bkit ledgers union` | EXTEND | Local target builds one commit: squash of `feat/{FID}` plus the carried close book, in the same scratch checkout. |
| Guarded cleanup | Step 14 landed comparison (file content, mode, type) against `origin/dev` | EXTEND | The comparison ref becomes `landingRef(mode)`; the proof is "the landed sha is an ancestor of local `dev` and the branch's files match at that sha", so a later landing on top does not falsify it. |
| `[skip ci]` tail refusal on batch push | `.bkit/templates/.husky/pre-push:156-167` (`bkit ci skip-token` + `bkit ci min-push` over `$PUSH_SHARED_SHAS`) | EXTEND | Already ships owner answer 6; add only a batch-shape test. |
| Stale-hook warning | Preflight findings in `.bkit/core/engine/checks/before/index.ts` | EXTEND | New `PreflightFinding` when a workflow's `publish.local` is `false` and the installed `.husky/pre-push` lacks the skip-token tail guard (copy-and-own hooks are never rewritten). |
| Batch FID mapping | `bkit fids parse` (`--prompt-file`, `--marker`, `--branch`) and the last-completed-`dev`-run lookup in `.github/workflows/bkit-cloud.yml:552-586` | EXTEND | Add `--range=A..B`; `.agents/rules.md` § Workflow bash blocks puts parsing in a `bkit` verb, not YAML bash. |
| Tracker state after a local ship | `issue-update-merged` marker block; build's "built locally, not published" comment | EXTEND | Same labels and status as a normal ship (owner answer 4), plus the comment and the links line (Q4). |
| No-push guarantee in tests | `ship-invariants.test.ts`, `skip-ci-subject-audit.test.ts`, `runtime-prose-audit.test.ts` (`.bkit/core/engine/audits/workflows/`) | EXTEND | Add local-mode cases: no `git push` / `prs` / `runs dispatch` reachable in local branches, the ship landing subject and body carry no skip token, no new `origin/dev` literal outside `landingRef`. `skip-ci-subject-audit.test.ts`'s header premise ("a local commit's token never decides whether CI runs") stops holding and is rewritten. |
## Architecture

**Shape:** local mode is a different delivery for the same five workflows, not a second implementation of any of them. One value, the run's frozen publish mode, is resolved once and threaded through one engine seam. Published mode (the default) keeps today's code path byte for byte.

**Components and boundaries:**

1. **Publish resolver** (EXTEND `publishRoute`, `shared/settings.ts`). Precedence, in order: a `publish=true|false` token in the session prompt file; else `bkit.workflows.{workflow}.publish.local` on a LOCAL runtime or `.publish.remote` on any other; default `true`. A non-LOCAL `false` (token or setting) resolves `true` with a warning. Applies to `design`, `plan`, `build`, `debug` and `ship`; `/bkit-auto` passes a given token through to the workflow it delegates to, and each delegated workflow reads its own setting (Settled Q5). The token is read only from the session prompt file, never from issue, PR or comment text (`docs/security.md` § Untrusted Content).
2. **Frozen mode** (EXTEND the `runtime-resolved` row). Step 1 resolves the mode from the token, the setting and `bkit runtime detect`, because Step 2's `worktrees setup` needs it before the row exists. Step 2 writes `publish` and `publishSource` into the `runtime-resolved` row. Every later read (route, close, failure path, resume) folds the row and never re-reads `package.json`. On resume, a row value that differs from a fresh resolution wins, with one warning naming both.
3. **`landingRef(mode)`** (NEW). Returns `dev` for local and `origin/dev` for published. The start base, the guarded-cleanup proof, the close verification gate (`steps gate --ref=`) and the unpushed-`dev` refusals call it instead of naming `origin/dev`.
4. **Start base** (EXTEND `worktreeBase` / `devBase`). Local mode: every workflow that creates a branch cuts it from `refs/heads/dev`, always. Step 1 computes `ahead` / `behind` of `dev` against `origin/dev` once (after `bkit repo info --fetch`, which stays a read-only fetch) and prints one line: the unpushed count when only ahead, and both counts when split. Local mode skips design / plan's Step 2 exit 7, `assertShipEligible`, and build / ship's "publish `dev` before the feature PR" narration. Debug adopts or resumes its branch as today; a debug run that has to create its branch uses this rule.
5. **Landing seam** (EXTEND `pushToDev` with `target`). The parts that never change stay shared: `dropLandTree`, `withoutHooks`, the caller's `build(dir)` callback, `prepareLandInputs`, the "checkout unchanged" assertions and the attempt loop. Only where the scratch checkout starts and how it finishes differ:
   - `target: "remote"`: today (fetch, base `origin/dev`, `bkit:gate:min` or `requiredPushGate`, `git push origin HEAD:dev`, retry on `moved`).
   - `target: "local"`: take the landing lock; capture `DEV_AT = rev-parse refs/heads/dev`; `worktree add --detach .worktrees/_land-{FID} DEV_AT`; the caller builds its one commit; checks = `bkit:gate:min` for a bookkeeping-only landing, else `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit`; then `advanceLocalDev(NEW, DEV_AT)`; release the lock. No `push` argv is reachable on this target.
6. **`advanceLocalDev`** (NEW). The only write to the owner's `dev`, done last, as a compare-and-swap from `DEV_AT`:
   - `dev` not checked out in any worktree (from `git worktree list --porcelain`) → `git update-ref refs/heads/dev NEW DEV_AT`.
   - Main checkout on `dev` → assert `HEAD` = `DEV_AT`, then `git merge --ff-only NEW`; git refuses on its own when an uncommitted edit would be overwritten.
   - `dev` checked out in another linked worktree → stop and name it.
   - Outcomes: `advanced`, `moved` (the CAS lost: rebuild and retry within `LAND_ATTEMPTS`, as published mode does for `origin/dev`) and `blocked` (stop the run with git's paths; `dev` and the edits untouched).
7. **Landing lock** (EXTEND `acquirePublicationLock`). One repo-wide lock for local landings, under `{git-common-dir}/bkit-outbox/publication-locks/`, so every worktree resolves the same file and it never rides a commit. Held across the scratch build, the checks and the advance. Liveness is the existing host + PID + start-time check; the holder is the `bkit` process doing the landing, so a dead holder is reclaimed at once. The wait is bounded by `TIMEOUTS.LAND_LOCK_WAIT` and fails closed (the run stops with the holder named, worktree kept), unlike the 30 s fail-open default kept for tracker comments. The CAS stays as the backstop against a writer that ignores the lock, such as the owner's own `git commit` on `dev`.
8. **Callers on the local target:** `landDirect` (design / plan close), `shipClose` (ship close), `landFailedRecord` (Failure Path record), the roadmap mirror. `pushOwnCommits` (debug in place on `dev`) is not called in local mode, because the run's commits are already on local `dev`.
9. **Workflow sources** (`.bkit/core/workflows/bkit-{design,plan,build,debug,ship,auto}.md`). They branch on `PUBLISH` only where delivery differs: the start narration, the summary-step branch push, the close, and ship's PR / CI / merge steps. Every git decision stays in `bkit` verbs, so the sources carry flags, not git commands.
10. **Batch push support:** the existing pre-push `[skip ci]` tail guard; a `bkit check` advisory for hooks that lack it; `bkit fids parse --range`; the `dev` arm of `.github/workflows/bkit-cloud.yml` reads the range. The YAML edit needs the owner's sign-off before the build touches it (`.agents/rules.md` § CI edits).

**Integration points:** `package.json` `bkit.workflows.*` (settings), `status.jsonl` rows (frozen mode, outcome), the git common dir (lock), the main checkout's `dev` ref (advance), the tracker (labels, status, comments), the copy-and-own `.husky/pre-push`, and `bkit-cloud.yml`.

**Host parity:** the engine is host-independent, and the workflow sources render to every host's mirror through `bkit upgrade`, so Claude Code, Cursor, OpenCode, Codex and Antigravity get the same behaviour. No host-specific setting or hook is added.

**Non-goals:** pushing `dev` (the owner does it), a bkit batch-push command (#715's decision, `715-no-batch-publish-verb`, closed by the owner as a deliberate non-goal; this design does not reopen it), a tool that reconciles an existing split (#849's cut, `849-local-dev-recovery-tool`), and any change to published mode.

**Plan split** (owner comment 2026-11-12: the work no longer fits one issue). All plans start after #911 and #849 are built, because both rewrite ship's close and renumber its steps:

- **P1: Publish mode and start base.** Resolver, settings, frozen row, `landingRef`, start base, the skipped refusals and narration, `/bkit-auto` pass-through. Requires nothing in this design.
- **P2: Local landing target.** `pushToDev` `target`, `advanceLocalDev`, the landing lock, the pre-land checks, the five callers, design / plan local close, the Failure Path record. Requires P1.
- **P3: Ship and debug in local mode.** Ship's local step routing and one-commit close, guarded cleanup against local `dev`, debug on a held branch and in place on `dev`, tracker texts. Requires P1 and P2.
- **P4: Batch push.** Pre-push batch-shape test, stale-hook advisory, `bkit fids parse --range`, the `bkit-cloud.yml` range read (owner CI sign-off). Requires nothing in this design; the YAML part waits for the sign-off.

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

**`landing` log line** (local target): `DEV_AT`, `NEW`, the gate script, its exit and the changed-file count, so a wrong base shows as a file count far above the run's diff, and `DEV_AT` is the sha the owner reverts to by hand if a bad landing must be undone.

**`outcome` row** (`.bkit/stats.jsonl`): `publish?` widens from build-only to all five workflows. `ending` is `held` for a local build (today) and `done` for a local design, plan, ship or debug.

**Landing lock file:** `{git-common-dir}/bkit-outbox/publication-locks/{sha256("dev-landing\0local")}.lock`, JSON `{ token, path, owner: { host, pid, startTime }, label: { workflow, fid, at } }`. `label` is optional and read only for the "waiting on the landing lock held by {fid} since {at}" line printed every 30 s.

**`TIMEOUTS.LAND_LOCK_WAIT`:** proposed 15 minutes (a landing holds the lock for its affected checks, which take minutes in a large repo). Exhausted → stop, holder named.

**`bkit fids parse --range=A..B --json`:** a list `[{ fid, sha, subject, code }]`, oldest first, deduplicated by FID, each FID matching `^[a-z0-9][a-z0-9-]*$`. `code` is `false` when the commit's subject carries a CI-suppressing token. Capped at a fixed maximum per run.

**Commit subjects on local `dev`:**

<!-- prettier-ignore -->
| Run | Commits on local `dev` | Subject |
| --- | --- | --- |
| design / plan close | 1 | `docs({FID}): {phase} DONE bkit [skip ci]` (as today) |
| ship close | 1 | `{type}({FID}): {title}`, the subject a PR squash would carry; no skip token in the subject or the body |
| Failure Path record | 1 | `chore({FID}): {phase} FAILED [skip ci]` (as today) |
| debug in place on `dev` | the run's own commits | as today |
| build | 0 | held on `feat/{FID}` |

**`docs/decisions.jsonl` row** for the design close to write (the input asks for it): key `924-local-runs-land-on-local-dev`, summary "Local runs may land on local `dev` without a PR or CI; the check moves to the owner's push", partly reversing #715's rejection of a ship that skips the PR for local runs only, because a local landing changes nothing on GitHub until the owner's push runs the pre-push hook and `dev` CI.

## Components / Flows

Step names, not numbers, because #911 and #849 renumber ship before this builds.

**Local landing (shared by every local close):**

1. Acquire the landing lock (wait, narrating the holder every 30 s; timeout → stop, worktree kept).
2. `DEV_AT` = local `dev`; add `.worktrees/_land-{FID}` detached at `DEV_AT`, hooks off.
3. The caller builds one commit there.
4. Check: the checkout is clean and unchanged; bookkeeping-only → `bkit:gate:min`; else `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit`, narrating the fallback when `bkit:gate:changed` is undeclared. Red → stop, nothing moved, route to `/bkit-debug`.
5. `advanceLocalDev(NEW, DEV_AT)`: `advanced` → step 6; `moved` → drop the scratch tree, back off, go to step 2 within `LAND_ATTEMPTS`; `blocked` → stop with the paths or the worktree that holds `dev`.
6. Release the lock, drop the scratch tree, log the `landing` line, write `close-transport` `shape: unpushed`.

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

**Owner's batch push:** `git push origin dev` → `.husky/pre-push` runs the full gates once; a code-carrying push whose last commit has a skip token is refused with the empty-trigger-commit line; `dev` CI runs once; on completion, the `dev` arm of `bkit-cloud.yml` takes the range from the previous completed `bkit-ci.yml` `dev` run's head to `HEAD_SHA`, runs `bkit fids parse --range`, and acts on the code-carrying FIDs (dispatch policy: Risks & Open Questions, item 3). No previous run, an unreachable base or a range over the cap → no-op with a summary row.

**Docs in the same change:** `.bkit/workflows.md` § Common Workflow Anatomy (worktree isolation rules per mode), § `/bkit-build` publish resolution (generalised), § `/bkit-ship` (local routing), § Concurrency lock (the landing lock), § Retry / timeout / iteration constants; `.bkit/cli.md` (new flags); `.bkit/templates.md` § Git hooks (the batch shape); `docs/deployments.md` (the owner's batch push and what to do when `origin/dev` moved). Workflow sentence edits go through `pnpm instructions:show` first.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| One landing loop with a `target` (`remote` \| `local`) inside `pushToDev`; `remote` unchanged | Local `dev` as the push remote (`git push . HEAD:dev`); prompt-level git in each close; a private queue ref; a two-phase landing journal | The issue forbids a second landing routine, and #715's recorded reason for retiring lite workflows is drift between two implementations. `git push .` with `updateInstead` refuses any dirty main checkout, the owner's usual state, and without it a checked-out `dev` answers with text that matches `REFUSED` and sends the run down the PR path. |
| Freeze the mode in the `runtime-resolved` row; resolve it at Step 1 and pass it to `worktrees setup` | `workflow-started` row; keep reading `package.json` live | Today `publishRoute` reads the config on every call (`status.ts:320`), so an edit mid-run can start a worktree from local `dev` and then push the close to `origin/dev`. The `runtime-resolved` row already carries the runtime the mode depends on, and every existing reader folds it. |
| Advance local `dev` by compare-and-swap from `DEV_AT` (`update-ref NEW DEV_AT`, or `merge --ff-only` after asserting `HEAD` = `DEV_AT`), in a new `advanceLocalDev` | Reuse `fastForwardDev` as is; `fetch . sha:refs/heads/dev` alone | `fetch .` checks fast-forward against whatever `dev` is now, so a `dev` moved back to an ancestor of `NEW` would be accepted as an untested combination; the CAS makes "checked tree = landed tree" hold. `fastForwardDev` must keep its skip-never-fail contract for #849, so it is not changed. |
| `dev` checked out in another linked worktree → stop and name it | Move the ref anyway | `update-ref` would move the ref under that worktree, which then shows the landing as reverted uncommitted edits: the "uncommitted edits are never changed" constraint broken from the other side. |
| A repo-wide landing lock held across build, checks and advance, built by parameterising `acquirePublicationLock` (bounded wait, fail closed); CAS kept as backstop | CAS-and-retry only; a new lock contract or a `--kind=dev` workflow lock | Settled Q7 asks the second run to wait. Without the lock, every lost race re-runs the affected checks, and a busy batch can exhaust `LAND_ATTEMPTS`. The publication lock already has same-host PID liveness; a second lock contract would duplicate it. |
| Pre-land checks: `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit` for code, `bkit:gate:min` for bookkeeping | `requiredPushGate` (today's deepest full gate); `--fallback=bkit:gate:static`; no checks | Owner answer 2 names `bkit:gate:changed`'s contract, run on the combined result. Basing on `DEV_AT` keeps the cost per landing flat as the batch grows. `static-unit` is the existing fallback for every non-task caller and is the only fallback that runs any tests. Format is covered: the contract includes format on the changed files, and the fallback chains `format:check`, which matters because hooks are off in the scratch checkout. |
| Local mode starts every created branch from local `dev`, warns once on a split, skips the unpushed-`dev` refusals and the "publish `dev` first" narration | Keep the `origin/dev` fallback on a split; refuse on a split | Owner scope addition (2026-11-12). A squash onto local `dev` carries only the branch's own delta, so the refusals guard nothing in local mode. |
| Published-mode refusal of a branch carrying unpushed `dev` work stays, and its message names both ways out | Drop it in published mode too | A published PR from such a branch would publish the batch's other features unreviewed. |
| Ship local close = ONE commit in the scratch checkout: squash of `feat/{FID}` plus the carried close book; subject `{type}({FID}): {title}`, no skip token, empty body | Keep the separate `docs({FID}): ship DONE bkit [skip ci]` close commit; keep `[skip ci]` on the one commit | Settled Q1 (one squashed commit per run). Owner answer 6 says local commits keep their markers; the code commit's marker today is the PR squash subject, which has none. A skip token on a code commit would make the pre-push hook refuse every batch that ends on a ship. The empty body matters because `git merge --squash` seeds the message with the branch's subjects, several of which carry `[skip ci]`. |
| D-Q1: debug in place on local `dev` keeps its own commits; no squash. Departs from Settled Q1 for this one path | Squash them after the fact; route debug-on-`dev` through a scratch branch and the landing seam | Squashing commits already on `dev` needs a reset, which the constraints forbid. Settled Q3 says debug "commits there". Routing through a scratch branch would change what "in place" means in Q3. Owner confirmation asked in Risks & Open Questions, item 1. |
| D-AS1: Success criterion 1 scoped to design, plan and ship, with the debug-in-place exception | Draft wording "after a local run" | Build holds and lands nothing (Settled Q2), and debug in place keeps its commits (D-Q1), so the draft wording was false for two of five workflows. |
| D-AS2: Success criterion 4 maps only code-carrying FIDs | Every `{type}({FID}):` commit in the range | Design and plan landings in the same range carry `[skip ci]` and no code, so dispatching a debug run for them spends cloud sessions on features that cannot have broken CI. |
| D-AS3: two edge cases added: `dev` checked out in another worktree, and a hand commit on `dev` during a landing | Draft list only | Both shape the advance design (stop vs CAS retry) and were not in the draft. |
| D-AS4: two edge cases added: mixed modes and a stale copy-and-own pre-push hook; plus `bkit:gate:changed` undeclared | Draft list only | Criterion 4 holds only where the installed hook carries the guard, and bkit never rewrites a copy-and-own hook; mixed modes cross the two base rules. |
| Stale-hook advisory in `bkit check` when any `publish.local` is `false` and `.husky/pre-push` lacks the skip-token tail guard | Rely on the hook as shipped | bkit is public and its hook is copy-and-own; without the advisory a consumer's older hook silently lets a batch skip CI. The advisory text carries the fix inline (`.agents/rules.md` § Advisories self-contained). |
| Batch FID mapping by `bkit fids parse --range`, base = head of the previous completed `bkit-ci.yml` `dev` run; untrusted subjects allow-listed, deduplicated and capped; no base → no-op | A `Bkit-Fids:` trailer on the trigger commit; YAML bash over `git log` | `workflow_run` carries no `before`, so the range must come from the run history the job already queries. A trailer would couple the copy-and-own hook to the CI contract. Parsing belongs in a `bkit` verb. |
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
- **Lock plus CAS over CAS alone.** Gain: no wasted re-checks under parallel runs, matching Settled Q7. Sacrifice: a lock file with a bounded wait; a landing waits up to `LAND_LOCK_WAIT` behind a long check.
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
- **Lock wait value:** 15 minutes is a proposal sized to a large repo's affected checks; the plan should confirm it against a measured landing.

## Documentation Warnings

```jsonl
{"topic":"data-schema","gap":"docs/data-schema.md holds only the managed starter header; bkit has no database, so the design records its data model (settings, run rows, lock file) in the design itself","recommendedPath":"docs/data-schema.md","alternativeEvidence":".bkit/jsonl.md § Per-Kind Fields; .bkit/workflows.md § status.jsonl — workflow state SoT","action":"none — the doc does not apply to a repo with no database"}
{"topic":"landing-topology","gap":"docs/architecture.md does not describe how workflow closes land on dev (scratch checkout, push, local fast-forward); the contract lives only in .bkit/workflows.md and land.ts","recommendedPath":"docs/architecture.md","alternativeEvidence":".bkit/workflows.md § Common Workflow Anatomy; .bkit/core/engine/commands/land.ts pushToDev; #639","action":"add a short landing-topology pointer to docs/architecture.md in the build that adds the local target"}
```
