# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

Facts this brainstorm rests on (read, not assumed):

- `pushToDev` (`.bkit/core/engine/commands/land.ts:221-276`) always fetches and bases on `UPSTREAM` (`origin/dev`), runs `checkLanding` (`bkit:gate:min` for bookkeeping, else `requiredPushGate` = the deepest full push gate), then `git push origin HEAD:dev`, retrying on "dev moved" up to `TIMEOUTS.LAND_ATTEMPTS`. It has four callers: `roadmap.ts` (`mirror`), `branches.ts` (`pushOwnCommits`, `landDirect`), `workflows.ts` (`landFailedRecord`, `shipClose`).
- `fastForwardDev` (`branches.ts:3117-3148`) already moves local `dev` fast-forward only: `merge --ff-only` when the main checkout is on `dev`, else `git fetch . {sha}:refs/heads/dev` (refuses a non-fast-forward and a `dev` checked out in another worktree).
- `bkit:gate:changed` + `bkit tests changed --base=` already exist as "checks on changed files" (`.bkit/workflows.md` § Local gate scripts); not seeded, undeclared → a `--fallback` whole gate.
- `.bkit/templates/.husky/pre-push:156-167` already blocks a `dev` / `main` push whose commit carries a CI-suppressing token and changes files outside the min-push paths, and prints the empty trigger-commit command. The hook is copy-and-own.
- `bkit-cloud.yml:522-567` derives the FID from the first line of `workflow_run.head_commit.message` only, else the merged PR's `bkit:fid` marker. It runs on `workflow_run`, so no push range (`before`) is in its event.
- `publishRoute` (`status.ts:320-338`) resolves build's `publish` from the prompt token and live `package.json` config on each call; it is not frozen in the run's rows.
- `locks.ts` has only `--kind=workflow` (per-FID). No repo-wide landing lock exists today.
- `origin/dev` / `UPSTREAM` appears 150 times across 16 engine command files (`branches.ts` 85) and 28 times across the 6 workflow sources.
- Decision `541-shortcuts-inspiration-style-prompts` (#715): "a second implementation of each workflow drifts with no test able to catch it" — only delivery varies.

## Approach A — Frozen landing target, one engine seam, lock-then-CAS advance ⭐ Recommended

**Summary:** resolve each run's landing target (`local` | `origin`) once at Step 1, freeze it in the run's `workflow-started` row, and thread one engine value (`landTarget` → base ref, compare ref, gate selection, advance method) through `pushToDev` and every caller, so local mode is a different delivery for the same workflow, not a second workflow; local `dev` advances only by compare-and-swap from the sha the run captured, under a repo-wide landing lock.

Shape:

- `bkit status route` gains `publish` / `publishSource` for design, plan, debug and ship (build's existing `publishRoute` generalised to `bkit.workflows.{workflow}.publish.{local|remote}`). The resolved value is written once into `workflow-started` (like `Limits`); every later read folds the row, never re-reads `package.json`.
- `pushToDev({ target })`: `target=origin` is today's code path, byte for byte. `target=local`: no fetch; acquire `{git-common-dir}/bkit-land.lock`; capture `DEV_AT=rev-parse refs/heads/dev`; `worktree add --detach _land-{FID} DEV_AT`; `build`; checks = `bkit tests changed --base=DEV_AT` (`bkit:gate:changed`, fallback `bkit:gate:static-unit`) instead of `requiredPushGate`; advance = `merge --ff-only` when the main checkout is on `dev`, else `git update-ref refs/heads/dev NEW DEV_AT` (atomic compare-and-swap); release lock. No `push` arm is reachable when `target=local`.
- One `landingRef(target)` helper returns `dev` or `origin/dev`; the start base (`worktrees setup`), the cleanup "landed" proof, Gate 12's `steps gate --ref=` and the Step 2 "unpushed dev work" refusal all call it instead of naming `origin/dev`.

### Premortems

**10x scale (a batch of 10-30 local landings, several sessions in parallel):**

- What breaks: the landing lock becomes the hotspot. Each landing holds it for the whole affected-checks run (seconds to minutes), so N parallel sessions serialise into an N-deep queue; a session that dies holding it blocks every later landing. If `bkit tests changed --base=` were ever given `origin/dev` instead of `DEV_AT`, each landing would re-check the whole unpushed batch, so check cost grows with batch size squared.
- Blast radius: local only — nothing reaches GitHub, so a bad landing affects one machine's `dev`. The owner's one push then carries all N features into one CI run; a red run there covers N FIDs.
- Observability: lock file holds `{at} {pid} {workflow} {fid}`; waiters narrate "waiting on landing lock held by {fid} since {at}" every 30s. The `landed` output prints `DEV_AT..NEW` and the gate's changed-file count, so a wrong base shows as a file count far above the run's diff.
- Recovery: stale-lock reclaim keyed on the holder pid being gone (same machine, so a pid check is meaningful) or the holder's `status.jsonl` no longer `IN_PROGRESS`; bounded wait (`TIMEOUTS.LAND_LOCK_WAIT`) then Failure Path with the holder named, worktree kept.

**6 months later:**

- What breaks: a new engine call site writes `origin/dev` directly and silently breaks local mode (the 150-reference surface invites it). Someone edits `package.json` publish mid-run and expects it to apply; it does not, because it is frozen (correct, but surprising). The CAS sha and lock path are invisible invariants.
- Observability: a Tier-2 audit test that fails when a file under `.bkit/core/engine/commands/workflow/` names `origin/dev` / `UPSTREAM` outside `land.ts` and `landingRef` (allow-list for the published-only paths such as ship's PR gate). The frozen `publish` appears in the start comment and the summary header.
- Recovery: the audit's failure names the file and line; fix is "call `landingRef`".

**On-call at 3am (owner finds `dev` wrong or a run stuck):**

- Page shape: "run stopped before landing: local dev moved/locked/dirty", "affected checks failed in `_land-{FID}`", or "dev not advanced: git refused (uncommitted edit in {paths})".
- Diagnosability: each refusal maps to one exit code and one `Route:` line; the land checkout's check log is kept in `{OUTBOX}`; the `landing` log line records `DEV_AT`, `NEW`, the gate script and its exit.
- Recovery: nothing on `dev` changed on any failure path (advance is the last act and is CAS), so recovery is "fix, re-run the same workflow"; the worktree and `feat/{FID}` are kept. Undoing a bad landing that did advance is the owner's own `git revert` (bkit never resets `dev`); the printed `DEV_AT` is the pre-landing sha.

**Author leaves:**

- Load-bearing knowledge: why the advance is CAS and not `fetch .` alone; why checks base on `DEV_AT`; why the target is frozen; why local mode never calls `push`. All four sit in one function and one helper, so a reader finds them in one place.
- Bus factor mitigation: a decisions row per invariant (below), and an integration test per refusal path (dirty overlap, `dev` checked out elsewhere, CAS lost, lock stale, checks red) on a real temp repo.

### Risk-mitigation guidance (layer onto A)

- Freeze `publish` in `workflow-started` for every workflow, and make `status route` read the row, not `package.json`, after Step 1; build gets the same fix (today's `publishRoute` reads config live).
- CAS advance: `git update-ref refs/heads/dev NEW DEV_AT` when `dev` is not checked out anywhere; `merge --ff-only NEW` when the main checkout is on `dev` after asserting `HEAD` = `DEV_AT`; `dev` checked out in another linked worktree → stop and name that worktree (never move a checked-out ref with `update-ref`, which would make that tree's files look reverted).
- Lock file lives in `git rev-parse --git-common-dir`, so every worktree resolves the same inode and it never rides a commit; reclaim on dead pid or non-`IN_PROGRESS` holder; bounded wait.
- Checks: `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit` run in `_land-{FID}` after `prepareLandInputs`; keep `checkLanding`'s "checkout unchanged after the gate" assertions. When `bkit:gate:changed` is undeclared, narrate that the whole fallback gate ran and why (the `gate-changed-script-missing` advisory already exists).
- Cleanup proof in local mode: `NEW` is an ancestor of `refs/heads/dev` **and** the branch's files match at `NEW` (same content check as today, compare ref swapped), so a later landing on top does not falsify the proof.
- Narrow the "no `git push`" success criterion into a test: a spy on `runGit` asserting no `push` argv when `target=local`, plus a Tier-2 workflow audit that local-mode branches of the workflow sources contain no `git push` / `prs` / `runs dispatch` call.
- Split warning: compute `ahead`/`behind` of `dev` vs `origin/dev` once at Step 1 (after `repo info --fetch`) and print it once; never refuse on it in local mode.

## Approach B — Remote swap: point `pushToDev` at the local repository

**Summary:** keep `pushToDev` and its retry loop as they are and make `REMOTE` / `UPSTREAM` parameters, so local mode "pushes" with `git push . HEAD:refs/heads/dev` from the land checkout and treats "dev moved" as git's own non-fast-forward refusal; each workflow source branches on `PUBLISH` at its close and start steps.

Shape:

- Concurrency comes from git's ref lock plus the existing rebuild-and-retry ("second lands on top of the first" by retrying, not by waiting). This departs from the settled Q7 wording ("waits on a lock") in mechanism, not outcome; the design would flag it.
- `git push .` to a checked-out branch is refused by default (`receive.denyCurrentBranch`), so the common case (main checkout on `dev`) needs the `merge --ff-only` arm anyway: in practice B is "push to `.` when `dev` is not checked out, else `fastForwardDev`".
- Base, compare and gate refs change by passing `--base=dev` flags from the workflow markdown at each site that names `origin/dev`.

### Premortems

**10x scale:**

- What breaks: no lock means every concurrent landing runs its affected checks, loses the race, rebuilds and re-runs its checks; with K parallel sessions the last one runs checks up to K times and can exhaust `LAND_ATTEMPTS` (exit 8, nothing landed) under a busy batch. Wasted minutes rather than a deadlock.
- Blast radius: same as A (local only).
- Observability: the existing "dev moved before push {n} of {max}" log lines; no queue visibility.
- Recovery: re-run; but a run that exhausts attempts after a long check reads to the owner as flaky.

**6 months later:**

- What breaks: local mode lives as `PUBLISH` conditionals spread through five workflow sources (28 `origin/dev` mentions) and the engine flags — the exact drift #715's decision warns about. A new step added to one workflow forgets the local branch; nothing fails until a local run pushes or reads the wrong base. `git push .` also runs `pre-push`/`reference-transaction` hooks unless `withoutHooks` wraps it, an easy thing to lose in a refactor.
- Observability: only per-workflow tests catch it, and only for the paths they cover.
- Recovery: find and patch each site.

**On-call at 3am:**

- Page shape: "push to . refused: non-fast-forward" or "refusing to update checked out branch" — git's wording, which reads like a remote problem and sends the owner looking at GitHub.
- Diagnosability: weaker than A; the refusal text does not say which local state blocked it.
- Recovery: as A — nothing advanced on failure.

**Author leaves:**

- Load-bearing knowledge: that `.` as a remote has different refusal rules from `origin`; that the checked-out case silently takes a different arm; which markdown sites carry the local branch. Spread over many files, so the bus factor is low.

### Risk-mitigation guidance (layer onto B)

- Wrap the local push in `withoutHooks` and assert it in a unit test; map git's `.`-remote refusals to bkit's own messages.
- Add a cheap advisory lock anyway (it removes the K-times re-check cost without changing B's shape).
- Put the base-ref choice behind one `bkit` verb flag (`--target`) rather than literal refs in markdown, which moves B toward A.
- Base checks on the captured pre-landing sha, not on whatever `dev` is at retry time, so a retry does not widen the checked range.

## Approach C — Two-phase landing with a durable landing journal

**Summary:** split each local landing into "prepare" (build the squash commit in `_land-{FID}`, run checks, pin it as `refs/bkit/land/{FID}`, append a row to a git-metadata journal `{git-common-dir}/bkit/landings.jsonl`) and "commit" (CAS-advance `dev` to the pinned ref, mark the row `advanced`), so a crash between the two leaves a resumable, inspectable landing, and the journal is also the batch's FID list for CI and the pre-push hook.

Shape:

- Same frozen target and `landingRef` seam as A for the start base.
- `bkit branches land --resume` (or the next run's Step 1) finds journal rows in `prepared` state whose `DEV_AT` still equals `dev` and finishes them; otherwise it rebuilds.
- The pre-push hook (or a `bkit ci trigger` helper it suggests) writes the journal's unpushed FIDs as a `Bkit-Fids:` trailer on the empty trigger commit, so `bkit-cloud.yml` can read the batch from the head commit without a range query.

### Premortems

**10x scale:**

- What breaks: the journal and `refs/bkit/land/*` grow without bound unless pruned on push; pinned refs keep objects alive against gc. Lock contention is the same as A.
- Blast radius: local, plus the trailer path: a stale journal row (feature reverted locally) would name a FID that is not in the push.
- Observability: `bkit landings list` shows every landing and its state.
- Recovery: prune rows whose `NEW` is reachable from `origin/dev` after a push.

**6 months later:**

- What breaks: a second state store beside `status.jsonl`, `.bkit/issues.jsonl` and git itself; their disagreement is a new failure class (journal says advanced, `dev` was reset by the owner). The trailer contract couples the hook (copy-and-own, so consumers drift) to `bkit-cloud.yml`. This is close to a second landing routine, which the issue's constraints forbid.
- Observability: needs its own consistency check in `bkit check`.
- Recovery: rebuild the journal from `origin/dev..dev` commit subjects, which shows the journal was redundant.

**On-call at 3am:**

- Page shape: best of the three for a crash mid-landing — the prepared commit exists, so nothing is rebuilt and the checks are not re-run.
- Diagnosability: high (journal rows), but the owner must learn a new artefact under `.git/`.
- Recovery: `--resume`, or delete the row and re-run.

**Author leaves:**

- Load-bearing knowledge: the journal states, their transitions, the prune rule and the trailer contract. Highest knowledge concentration of the three.

### Risk-mitigation guidance (layer onto C)

- Derive the batch FID list from `origin/dev..dev` commit subjects at use time and keep the journal advisory only, so git stays the one source of truth.
- Drop the trailer and keep the settled CI design (range read in `bkit-cloud.yml`), which keeps the copy-and-own hook out of the CI contract.
- Prune journal rows and `refs/bkit/land/*` in the same step that proves `NEW` reachable from `origin/dev`.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend A: a frozen per-run landing target threaded through one engine seam (`pushToDev({target})` + `landingRef`) | B (remote swap with markdown conditionals); C (two-phase journal) | #715's recorded reason for retiring lite workflows is drift between two implementations; A keeps one workflow and varies delivery in one function. B spreads the switch across 5 workflow sources and 16 engine files; C adds a second state store and edges toward the forbidden second landing routine. |
| Freeze `publish` in the `workflow-started` row for every workflow, build included | Keep `publishRoute` reading `package.json` live | A config edit mid-run would flip start base and landing target between Step 2 and close: the worktree starts from local `dev` and the close pushes `origin/dev`, or the reverse. Freezing matches how ask-point limits already work (`Limits` header bullet). |
| Advance local `dev` by CAS from the sha captured at landing start (`update-ref NEW DEV_AT`, or `merge --ff-only` after asserting `HEAD` = `DEV_AT` when checked out) | `git fetch . sha:refs/heads/dev` alone (today's `fastForwardDev`); `git push .` | `fetch .` checks fast-forward against the current ref, not against the commit the checks ran on, so a landing made between checks and advance would be swallowed into an untested combination. CAS makes "checked tree = landed tree" hold. |
| Repo-wide landing lock in the git common dir, held across checks and advance; CAS kept as the backstop | Lock only; CAS-and-retry only (B) | Matches settled Q7 (second waits, then lands on top). The lock avoids re-running checks on every lost race; CAS still protects against a writer that ignores the lock (the owner's own `git commit` on `dev`). |
| Affected checks = `bkit tests changed --base=DEV_AT` with fallback `bkit:gate:static-unit` | `bkit:gate:min`; `requiredPushGate` (today's code path); no checks | Settled Q2 answer (affected tests + static on changed files, on the combined result). Basing on `DEV_AT` checks only this landing's delta on top of earlier local landings, so cost per landing stays flat as the batch grows. The fallback is the existing contract when `bkit:gate:changed` is undeclared. |
| `dev` checked out in a linked worktree other than the main checkout → stop and name it | Move the ref anyway | Moving a checked-out ref without updating its working tree makes that tree show the landed changes reverted as uncommitted edits — the "uncommitted edits are never changed" constraint, broken from the other side. |
| Local ship's landing commit subject carries no `[skip ci]` (it carries code), while design / plan landings keep `docs({FID}): {phase} DONE bkit [skip ci]` | Keep `docs({FID}): ship DONE bkit [skip ci]` on the code commit | Owner answer 6 says local commits keep their markers; today the code reaches `dev` through a PR squash whose subject has no skip token, so the marker a code commit "keeps" is none. Flagged for owner confirmation as a reading of answer 6. The pre-push block still covers any batch that ends on a skip-token commit. |

## Cross-Approach Risks

- **Debug in place on local `dev` vs settled Q1.** Settled Q1 says one squashed commit per run, but settled Q3 has debug commit its fix, summary and close directly on local `dev` when it runs in place there. That is several commits, not one squash. The design must either exempt debug-on-`dev` from Q1 or route it through a scratch branch and the landing seam. Needs the owner.
- **Copy-and-own pre-push hook.** The block on a skip-token last commit already exists in `.bkit/templates/.husky/pre-push:156-167`. Consumers whose copy predates it, or who edited it, lack it, and bkit never rewrites their copy. Success criterion 4 then holds only for current hooks. An install / `bkit check` advisory should detect a hook without the `dev` / `main` skip-token guard when any workflow's `publish.local` is false.
- **The trigger commit carries no FID.** The hook's suggested `chore: trigger CI` commit becomes the head of the batch push. Today `bkit-cloud.yml` reads only the head subject, so it no-ops ("Cannot derive FID"). The range read is therefore required, not optional, for the post-push follow-up to work at all.
- **`bkit-cloud.yml` has no push range.** It runs on `workflow_run`, so `before` is not in the event. The range has to come from somewhere else, either the last completed green `dev` CI head (the existing `LATEST_CI_SHA` query pattern) or the compare API. A first push, a force-push or a superseded run makes that base wrong or missing, so fail safe to a no-op with a summary row. Commit subjects are untrusted input: keep the `^[a-z0-9][a-z0-9-]*$` FID allowlist on every parsed scope, dedupe, cap the number of FIDs acted on per run, and keep the per-FID dispatch cap. This edits a CI workflow file, so the owner signs off (`.agents/rules.md` § CI edits).
- **Fan-out on a red batch.** One red `dev` run maps to N FIDs. Dispatching N `/bkit-debug` runs spends N cloud sessions on one failure, and most of those FIDs did not cause it. Decide whether the follow-up dispatches once per run (naming every FID) or once per FID under a cap.
- **Tracker says merged before GitHub has it.** `bkit:merged` + `In review` on a local-only landing means a human may close the issue while the code sits unpushed, or the machine is lost. Mitigation: a `bkit check` / Step 1 advisory listing FIDs on `origin/dev..dev` ("landed locally, not pushed: N features, oldest {age}").
- **Squash erases per-step shas.** The run's `status.jsonl` `parentSha` values and debug's CI-evidence ancestry point at worktree commits. Once `feat/{FID}` is deleted after a local ship, those commits become unreachable and git eventually garbage-collects them. Resume and audit tooling that dereferences them must treat a missing commit as expected in local mode.
- **Mixed modes on one feature.** A feature built locally and then shipped with `publish=true` (or the reverse) crosses the two base rules. Published ship's refusal of a branch carrying unpushed `dev` commits is the correct guard. Its message must name both ways out: push `dev`, or re-run with `publish=false`.
- **Owner's push after a split.** When `origin/dev` moved (a cloud run, another machine), the owner's `git push origin dev` is rejected and they `git pull --rebase`. That rewrites every local landing sha, so any sha recorded in logs, comments or `status.jsonl` goes stale. Ledgers survive through `merge=union`, but `docs/roadmap.md` and the design / plan canonicals can conflict. Document the expected owner procedure. bkit itself never rebases `dev`.
- **Cloud coercion must key on the runtime, not the token.** A `publish=false` read from untrusted text (issue body, PR body) must never select local mode. Keep `PUBLISH_TOKEN` matching on the session prompt file only, and keep a non-LOCAL runtime coerced to publish for all five workflows, as build does today.
- **Hooks are skipped in `_land-{FID}`** (`withoutHooks`). The squash commit never runs `bkit:gate:format`, so formatting rests on the worktree commits having run it. A worktree without `.husky/_` (install skipped) lands unformatted code that the owner's pre-push then rejects at batch time, far from its cause. Include the format check in the local landing's checks.
