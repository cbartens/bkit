# Session prompt

User invoked `/bkit-design 384` after discussing whether consumer-agent ship-workflow feedback was documented in #384, confirming next step is Design (not Plan/Build), and posting a design-readiness clarifications comment covering:

- #341 / RUNTIME_DEVPUSHES bookkeeping target
- Path B unconditional dispatch for CONFLICTING PRs
- Path-scoped staging (no blanket git add docs/)
- Finding 2 (.deferred-blocked) in-scope vs follow-up
- Verification gap (status.jsonl hole detector) in-scope vs deferred
- Optional issue-body hygiene for comment corrections

Prior conversation concluded Path A/B + bookkeeping-never-on-branch is the agreed direction; carry-to-dev at Step 9 was rejected as a workaround.

# Issue

## Ship bookkeeping mutates validated PR head

## Problem

`.bkit/workflows/bkit-ship.md` never states whether `feat/{FID}` gets pushed during ship, while simultaneously gating on the PR head SHA being CI-validated. Those two facts are incompatible, and because the push contract is unwritten, each agent resolves it differently — and every resolution breaks a different gate.

- **Push** → head SHA moves → Step 3 (`:397`) and Step 6 (`:598`) find no CI run at the new head and refuse.
- **Don't push** → Step 4's conflict resolution, Step 8's source-file remediation, and all Steps 1–8 artifacts stay local while Step 6 squash-merges the _remote_ PR, and Step 12 force-removes the worktree.

Line `:32` permits `git push --force-with-lease` "as the Step 2 rebase companion", but no step ever issues a push. So the workflow's correctness depends on an unwritten convention.

Surfaced by consumer-agent feedback during a live ship: the agent deliberately withheld a Step 5 bookkeeping commit, reasoning that "a docs-only push creates a PR head with no CI run — the trap that stalled Step 3." The instinct was right; the causal model was too narrow (it is _any_ push, not docs-only), and there was no rule in the workflow to point at.

## Evidence

### Artifact capture is lossy, and the loss tracks the push-dependency

<!-- prettier-ignore -->
| repo | log dirs | `ship-deferred-sweep.md` | Steps 1–8 records | Steps 9–13 records |
| --- | --- | --- | --- | --- |
| bkit | 21 | 0 | 0 | 6 |
| app-gether-life | 70 | 17 | start 22, guard 21, sweep 18, merge 16 | 31–34 |
| visitfrasercoast-com | 57 | 7 | start 11, guard 9, sweep 6, merge 4 | 13–16 |

Dev-side steps (9–13) land ~100%. Branch-side steps (1–8) land 55–65% in app-gether-life and 25–70% in visitfrasercoast-com — `ship-merge-pr` appears only 4 times against 16 `ship-worktree-cleanup`. Every run that closes without a `ship-merge-pr` record is a run whose branch-side commits never reached dev.

bkit's own repo produces no signal: 0 sweeps across 21 log dirs, and `.bkit/stats.jsonl` holds 2 ship rows, both `parentSha: "HEAD~1"`, `prNumber: null`, `step: "close-gate"` — a step name the workflow does not write. Those are fixtures. All real telemetry lives in consumer repos and nothing reads it.

### The two conflicting mechanisms landed together

- `01f8b8d9 feat(160): centralise install engine, mirror sources & docs into .bkit/ (#204)` introduced **both** the worktree model and the `CURRENT_RUN_ID` head-match gate, in one large infrastructure commit. Neither was reviewed against the other.
- `e924448e fix(99): re-check CI against the head being merged` added the Step 6 `PRE_HEAD` check — whose stated purpose is defeated by `gh pr update-branch` two lines below it.

### Nothing tests it

`tests/` is five `.bats` files (`counter-bus`, `counter-derive`, `counter-failclosed`, `route-state`, `telemetry-failopen`) covering the helper scripts. No test references `bkit-ship` or parses workflow markdown. The step logic is prose, and prose has no CI.

### Why it stayed invisible

A missing `ship-merge-pr` row reads as "that run didn't need that step". Nobody diffs the expected step set against the actual one, so 25–65% capture never registered as a defect.

## Findings

1. **Step 3 does not verify green.** `:396-410` sets `REGRESSION_VERDICT=PASS`, fails only when no run exists at head, and otherwise re-asserts only steps that failed in a _prior_ run. With no prior failed run it never inspects the current run's conclusion — **a PR whose CI is currently red passes Step 3.** Step 6.4 is the only conclusion check.
2. **`.deferred-blocked` has no writer.** `.bkit/workflows.md:531` and `:751` specify that a sweep FAIL "touches `.deferred-blocked` and routes to `@bkit-debug-abort-handover` (merge never happens)". No step in `bkit-ship.md` creates it — only `rm -f` at `:67` and the read at `:114`; the subagent prompt doesn't either. Failure Path step 4's condition can never be true via that sentinel, so a sweep FAIL falls through to step 12 (**STOP**) with no handover artifact — for exactly the case the sweep exists to catch.
3. **Step 6 validates one SHA and merges another.** `:595-602` checks CI at `PRE_HEAD`; `:618` may push the worktree and `:620` runs `gh pr update-branch` unconditionally — both move the head — then `:621` merges.
4. **Failure Path writes status to the wrong tree.** `:59-61` resolves `REPO_ROOT` via `--git-common-dir` (main checkout) and appends `workflow-failed` to the **dev** copy, while Steps 1–8 write to the **worktree** copy via `--show-toplevel` (`:415`, `:705`, `:767`). The worktree copy keeps a dangling `IN_PROGRESS`; the dev copy gets a `workflow-failed` with no matching start. Both Resume (`:25`) and the lock-staleness cross-check (`:27`) fold that file. Step 1 already compensates for the split (`SRC="$REPO_ROOT/.worktrees/{FID}/$STATUS_REL"`); the Failure Path did not get the same treatment. Same class as closed #68.
5. **Step 8's retry loop cannot apply its own fix.** `Update: Source files.` edits the worktree, then `:790` re-runs Step 6, which merges the remote PR. Without a push that no step instructs, the loop re-merges identical remote content until `MAX_MERGE_ATTEMPT` exhausts.
6. **`git add -A` on a shared worktree.** The bookkeeping commits (`:345`, `:420`, `:473`, `:519`, `:642`) stage whatever build or debug left dirty, under a `chore({FID}): worktree-setup` message. Under a frozen head those leftovers are then destroyed by Step 12's `worktree remove --force` having never been merged.
7. **Agents are inventing step names.** Consumer status files contain `ship-resume-human-override` and `ship-post-failure-migration-fix`, which exist nowhere in the workflow. The counter-bus and fold helpers key on step names, so improvised names are invisible to routing and attempt counting.

## Discussion

### The worktree is shared, not ship's

All five workflows use the same `.worktrees/{FID}` path and the same three-way `worktree add` fallback (`bkit-design.md:216-229`, `bkit-plan.md:220-233`, `bkit-build.md:272-303`, `bkit-debug.md:289`, `bkit-ship.md:268-300`). Design or plan creates it; every later phase resumes it. Ship's `worktree add` only fires if it was pruned or the run is on another machine.

What ship uniquely does is **rebase** it:

```
design / plan   git rebase --rebase-merges origin/dev || exit 1     # rebase and die
build / debug   rebase + .rebase-failed sentinel + conflict-resolve
ship            rebase + .rebase-failed sentinel + conflict-resolve  <- same block
```

Harmless for four phases — none of them gate on the local branch matching a remote head. **Ship is the only phase with head-match gates**, and it inherits the same unconditional rebase, so its local `feat/{FID}` has already diverged from the validated remote head before Step 3 runs.

### The CI config supports a frozen head better than the workflow uses it

- `ci.yml:111-112` — `pull_request` and `workflow_dispatch` both force `run_level=full`. Any run on a PR head is a full run by construction; there is no "green but light" PR state.
- `ci.yml:602` — `bkit-tests-check` is a capstone that `needs` all three lanes with `if: !cancelled()`. **One assertion — capstone concluded `success` at the PR head — means every lane ran and passed**, and is strictly stronger than all of Step 3.
- `ci.yml:130-131` — merged-PR dev pushes get `run_level=light`. The PR's full run is the only full validation that change ever receives, which is what makes validated-SHA == merged-SHA load-bearing.

### Rejected along the way

- **Carry artifacts from worktree to dev at Step 9.** Workaround; moves data across a boundary that should not exist. Superseded by relocating bookkeeping to the dev tree.
- **Append `[force full]` to the squash subject when the base is stale**, to escalate the post-merge dev run. Unnecessary once Path A is _defined_ as "base not stale" — the risk is avoided rather than mitigated.
- **Ship fixes code on merge failure.** Under a frozen head, source edits cannot reach the merge. Code-level failures route back to build, which re-pushes and earns a fresh full run.
- **A read-only `origin/feat/{FID}` inspection checkout.** Unnecessary — the shared worktree already has the branch checked out. Ship just needs to stop mutating it.

## Agreed solution

Two explicit paths, keyed on a fact ship can measure, with one merge gate common to both.

**Detection:** `git merge-base --is-ancestor origin/dev origin/feat/{FID}`. If dev is an ancestor of the head, the green run at that head validated a tree that already contains current dev.

**Path A — dev has not moved.** CI from build or debug is green at the PR head. Resume the shared worktree **read-only**: no rebase, no bookkeeping commits, no push. Merge.

**Path B — dev has moved, integration required.**

- **B1, no textual conflict** — `gh pr update-branch` rebases server-side and moves the head. No worktree, no local rebase, no conflict subagent.
- **B2, textual conflict** — worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`. Non-mechanical conflicts exit to handover, matching that agent's existing charter.

**Re-validation is mandatory in B.** Any head move invalidates the green run: wait for a run at the new head, and if none appears within a timeout, `gh workflow run ci.yml --ref feat/{FID}`, then assert the capstone. The wait-then-dispatch shape covers both worlds without branching on repo config — consumer repos fire on `pull_request` sync, bkit's own repo does not (known actor/token quirk) and falls through to the dispatch.

**Both paths end at the same gate:** `bkit-tests-check` concluded `success` at the current PR head. A satisfies it with build's run, B with the re-validation run. One assertion, one invariant, no path-specific merge logic.

**Bookkeeping never rides the branch.** `status.jsonl` and ship artifacts go to the dev tree from Step 1; Step 13's single `[skip ci]` push carries them. The only thing ever pushed to `feat/{FID}` is a rebase or conflict resolution in Path B.

> **Rule:** every head move is deliberate, is a code-integration change, and is followed by re-validation. Bookkeeping never moves the head.

### Resulting shape

```
1  start            -> dev tree, lock
2  verify PR         -> capstone success @ PR head
3  base check        -> is origin/dev ancestor of head?
      A -> step 6
      B -> 4
4  integrate         -> B1 gh pr update-branch | B2 worktree + resolve + push --lease
5  re-validate       -> wait-or-dispatch CI @ new head, assert capstone
6  merge             -> squash, no update-branch here
7+ dev-side          -> docs, summary, single [skip ci] push
```

### What this resolves structurally

Findings 1, 3, 4, 5 and 6 dissolve rather than needing patches: the push contract becomes explicit, there is only one status tree, no head moves after validation, ship stops pretending it can fix code, and `git add -A` no longer touches the shared worktree. Finding 2 (`.deferred-blocked`) is independent and needs its own fix. Finding 7 is a symptom of the same under-specification.

Also drops: ship's unconditional rebase-on-resume, Step 3's prior-run diffing, and Step 8's `Update: Source files.`

## Scope

**In:** `.bkit/workflows/bkit-ship.md`, the `.deferred-blocked` writer, the Failure Path status target, `.bkit/workflows.md` step table, and the rendered mirrors.

**Out:** design/plan/build/debug worktree conventions — their unconditional rebase is fine because they have no head-match gates. Revisit only if head-match gating spreads.

**Verification gap to close:** a check that folds each `status.jsonl` and flags runs whose step set has holes. That is the detector that would have caught all of this, and the data to test it against already exists in the two consumer repos.

Related: #74 (ship cancels feature CI mid-flight), #68 (main-repo vs worktree cwd mismatch), #209 (state model), #71 (commit/push reduction).

# Comments

## Comment 1 — @cbartens (2026-07-26T23:11:17Z)

## Additional evidence from consumer ledgers

Swept `.bkit/friction.jsonl` and `docs/failures.jsonl` across bkit, app-gether-life and visitfrasercoast-com. The theory holds, and three mechanisms turn up that neither the original analysis nor the consumer-agent feedback had identified.

### Independently logged during the run that prompted this issue

app-gether-life `.bkit/friction.jsonl` — `ship-regression-guard-runs-before-conflict-resolve` (`OPEN`, `scope: universal`, `ts 1785066727818`):

> Ship Step 3 resolves CURRENT_RUN_ID from the PR head SHA and FAILs when empty. A docs-only tip commit that CI path-filters away leaves the PR head with zero runs, so the guard FAILs even though the prior commit is green. **Step 3 also runs BEFORE Step 4 conflict-resolve, so on a branch that must be rebased + force-pushed the guard evaluates a head that is about to be discarded.**

The ordering defect in bold was not in the original write-up. It is a second, independent reason the current step order cannot work: the guard validates a head that Step 4 is about to rewrite. The A/B shape fixes it by construction (verify → base-check → integrate → re-validate → merge), but the ordering should be called out explicitly rather than left implicit.

That row's own remediation reaches the same conclusion about Step 3's redundancy: _"Step 6 sub-step 4 already independently blocks merge on CI completed+success at the real PR head, so the safety property does not depend on Step 3."_

### Three mechanisms produce "no CI run at the PR head"

**1. A CONFLICTING PR stops CI entirely — confirmed, with the mechanism nailed down.** app-gether-life `docs/failures.jsonl` — `conflicting-pr-silently-stops-all-ci-no-run-no-error`:

> Observed on PR #720: pushes d07c4baf and fe3f148c both landed on the remote (`git ls-remote` and `gh pr view --json headRefOid` both confirmed the new head) yet produced ZERO workflow runs; `gh api /actions/runs?head_sha=<sha>` returned total_count 0. Cause: ci.yml triggers on `pull_request` (branches main/dev) and on `push` to main/dev only — a feature branch gets CI solely via the pull_request event, and **GitHub evaluates pull_request workflows against the MERGE commit `refs/pull/<n>/merge`. Once dev moved (3 commits) the PR went mergeable=CONFLICTING, so no merge commit could be computed and GitHub fired nothing at all.**

Ruled out with evidence in that row: no CI-suppressing token in either commit message, Actions enabled, GitHub status operational, not a spending cap.

**2. A skip-ci token buried in branch history poisons dispatch for every later push.** friction `build-561-push-triggered-ci-dispatch-suppressed-buried-skip-ci`:

> feat/561's history includes an early commit (**Step 2 worktree-setup**) whose message carries a skip-ci-class token. Every push/PR-synchronize event for this branch dispatched zero Actions runs across 3 pushes **with clean HEAD messages**, while `gh workflow run ci.yml` worked instantly.

That is precisely the commit class at the centre of this issue — `bkit-ship.md:261` writes `chore({FID}): pre-worktree uncommitted changes bkit [skip ci]`. The repo's pre-push hook only inspects HEAD, so it structurally cannot catch a marker buried earlier in the branch.

**3. One unattributed instance.** friction `build-843-push-triggered-ci-dispatch-silent-no-op` — two pushed HEADs, zero dispatch over ~8 min, `workflow_dispatch` instant, root cause unconfirmed. Consistent with either mechanism above.

### This upgrades two parts of the issue

**Path B cannot rely on the push firing CI.** In the CONFLICTING case nothing fires _by construction_ — there is no merge ref to evaluate. So wait-then-dispatch is not a fallback for one repo's token quirk, it is the only viable path in B2, and the dispatch must be unconditional there rather than a timeout fallback.

**The head-SHA-keyed capstone assertion is load-bearing, not a nicety.** From the same row:

> THE DANGEROUS PART: the last GREEN run (29454436704, head b0f1fcdc) remained the PR's most recent run, so **the PR presented as green while its actual HEAD had never been tested.** Merging there would have shipped two untested commits behind a green check.

Any gate that reads "the PR's latest run" or `statusCheckRollup` — as Step 2 sub-step 7 does today (`:316`) — is satisfiable by a stale green. Keying the assertion to `headSha == PR head` is what closes it.

### Correction to the issue body

The original text attributed non-firing `pull_request` to a bkit-repo actor/token quirk. That framing is too narrow: consumer repos hit the same symptom via at least two other mechanisms, both confirmed above. The remedy is unchanged, but the cause is general rather than local to this repo.

### A docs-only push can also cancel the run that proves the merge is safe

friction, `build/build-run-tests`:

> While run 29454200201 (the first real test of THREE unproven changes at once) was in flight and being actively monitored, the orchestrator committed and pushed a DOCS-ONLY change (a failures.jsonl ledger row). The PR's concurrency group cancelled 29454200201 mid-run and started 29454436704 on the new HEAD. Net effect: ~10 minutes of CI wall-clock burned for nothing.

`ci.yml:19-21` sets `cancel-in-progress` for `pull_request`. This is closed #74 recurring, and it gives "bookkeeping never moves the head" a second justification: it is not only about satisfying a gate, it is about not destroying the run that proves the merge is safe.

### Path B is the common case, not the edge case

friction `836-rebase-conflict-architecture-md-doc-line-collision`:

> Step 2 auto-resolution only special-cases `CONFLICT_FILES == pnpm-lock.yaml`. Long-lived branches accumulate `docs/architecture.md` + `docs/testing.md` + `docs/navigation.md` edits from plan-execute commits, and concurrent issues edit the same summary bullets on dev, so **same-line doc collisions are the common case, not the rare one**.

B2 therefore needs to be a first-class path with a real conflict-resolution story, not an edge case that usually short-circuits to handover.

### A second Failure Path status-loss mechanism

Same row, adjacent to finding 4:

> the Failure Path block appends the `workflow-failed` row to status.jsonl BEFORE running `git rebase --abort`, so on a mid-rebase abort the append is discarded by the abort.

`:61` appends, `:62` aborts. So the Failure Path writes to the wrong tree _and_ in the wrong order — two adjacent lines, two independent loss mechanisms. The same row also notes that `git rebase --abort 2>/dev/null || true` silenced a failed abort, leaving the worktree mid-rebase with a UU file and detached HEAD.

### A constraint the agreed solution must carry

friction `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions` (`OPEN`):

> Step 10 runs `git add -- docs/ && git commit ... -- docs/` in REPO_ROOT. Observed live: a concurrent bkit-plan 837 plan-amend had staged `docs/deferrals.jsonl` plus six 837 plan files; the prescribed command would have committed them under this FID message, misattributing another feature's work.

The agreed solution **moves ship bookkeeping into the dev tree**, which increases exposure to exactly this. So the relocation must come with path-scoped staging — only `docs/plans/{YYYYMM}/logs/{FID}/` plus explicitly named ledgers, never a blanket `docs/` or `-A`. Adding this as a constraint on the design rather than leaving it to be rediscovered.

### Coverage gap

`visitfrasercoast-com/.bkit/friction.jsonl` is empty — 0 rows across 57 log dirs and 16 ship runs, and it has no `docs/failures.jsonl` at all. app-gether-life carries 23 friction + 63 failure rows; bkit carries 23 + 2. Friction capture is not happening in that repo, which partly explains why a universal-scope ship defect went unreported for so long.

## Comment 2 — @cbartens (2026-07-27T00:16:18Z)

From #341

One real interaction to hand to 384: it says "bookkeeping never rides the branch — status.jsonl and ship artifacts go to the dev tree from Step 1", but a cloud runtime cannot write the dev tree at all. So 384's rule needs to be "…to the dev tree when RUNTIME_DEVPUSHES = true, else to the current branch" — which is easier to express after 341 lands, because the flag already exists. Folding 384 in now would also re-open the "is the local path still byte-identical?" question you just spent this session closing.

Also worth noting: 384's finding 4 (Failure Path appends workflow-failed to the dev copy while Steps 1–8 write the worktree copy) is in territory 341 touches, but it's independently fixable and not a blocker either way.

## Comment 3 — @cbartens (2026-07-27T01:51:23Z)

## Design readiness — clarifications to fold in

Agreed direction (Path A/B + bookkeeping off the branch) stands. No design/plan artifact yet; next phase is **Design**, not Plan or Build.

### Gaps to absorb into the design (mostly already in comments; must not be left implicit)

<!-- prettier-ignore -->
| Gap | Constraint |
| --- | --- |
| **#341 / `RUNTIME_DEVPUSHES`** | "Bookkeeping to the dev tree from Step 1" is wrong for cloud runtimes that cannot write the main checkout. Rule must be: write to the dev tree when `RUNTIME_DEVPUSHES = true`, else to the current branch. Easier after #341 lands (flag already exists); folding 384 in early re-opens the byte-identical local-path question #341 closed. |
| **Path B dispatch** | Wait-then-dispatch is too soft for CONFLICTING PRs — nothing fires by construction (no merge ref). B2 needs **unconditional** `gh workflow run` after the head moves, not a timeout fallback. Same for buried `[skip ci]` history poisoning auto-dispatch. |
| **Path-scoped staging** | Relocating ship bookkeeping onto the dev tree increases exposure to the Step 10 blanket `git add docs/` race with concurrent sessions. Staging must be path-scoped to `docs/plans/{YYYYMM}/logs/{FID}/` plus explicitly named ledgers — never blanket `docs/` or `-A`. |
| **Finding 2 (`.deferred-blocked`)** | Independent of the Path A/B rewrite. Design must decide: in-scope for 384, or split to a follow-up issue. Leaving it ambiguous means a sweep FAIL still falls through with no handover. |
| **Verification gap** | A check that folds each `status.jsonl` and flags runs whose step set has holes is the detector that would have caught this. Design must decide: in-scope vs deferred. |

### Issue-body hygiene (optional, Design can do it)

Absorb the comment corrections into the body so Design does not re-derive them:

- Non-firing `pull_request` is **general** (CONFLICTING merge ref, buried skip-ci, cancel-in-progress), not only a bkit actor/token quirk.
- "Bookkeeping never moves the head" has a second justification: docs-only pushes cancel in-flight PR CI (`cancel-in-progress`) — closed #74 recurring.
- Path B / B2 is the **common** case (doc-line collisions), not an edge that usually short-circuits to handover.

### Not next

- **Plan** — no design artifact yet.
- **Build** — open constraints above still unresolved.

When ready: label `bkit:design` and run Design on #384.

## Comment 4 — @cbartens (2026-07-27T02:02:06Z)

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

## Comment 5 — @cbartens (2026-07-27T02:02:30Z)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl)
