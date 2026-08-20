# Ship Input — 384-ship-bookkeeping

Generated: 2026-07-29T01:04:21Z

---

## Session Prompt

Ship Feature workflow invoked for issue #384 (bare issue ID).

---

## Issue Description (#384)

Ship bookkeeping mutates validated PR head

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

---

## Issue Comments (newest first)

### Comment by cbartens at 2026-07-29T01:02:00Z

## Ship Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

---

### Comment by cbartens at 2026-07-29T00:41:12Z

```comment
### Step 17 — Close Workflow & Create PR
[cbartens/bkit/tree/feat/384-ship-bookkeeping](https://github.com/cbartens/bkit/tree/feat/384-ship-bookkeeping)
#### Artifacts
- [384-ship-bookkeeping-design.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/384-ship-bookkeeping-design.md)
- [384-ship-bookkeeping-plan-1.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/384-ship-bookkeeping-plan-1.md)
- [384-ship-bookkeeping-plan-2.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/384-ship-bookkeeping-plan-2.md)
- [384-ship-bookkeeping-plan-3.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/384-ship-bookkeeping-plan-3.md)
- [384-ship-bookkeeping-plan.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/384-ship-bookkeeping-plan.md)
- [build-challenge-1.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-challenge-1.md)
- [build-challenge-2.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-challenge-2.md)
- [build-challenge-remediate-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-challenge-remediate-log.md)
- [build-challenge-tests.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-challenge-tests.md)
- [build-challenge.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-challenge.md)
- [build-input.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-input.md)
- [build-install-skills.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-install-skills.md)
- [build-plan-execute-1-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-execute-1-log.md)
- [build-plan-execute-2-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-execute-2-log.md)
- [build-plan-execute-3-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-execute-3-log.md)
- [build-plan-gaps-remediate-2-1-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-gaps-remediate-2-1-log.md)
- [build-plan-gaps-remediate-3-1-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-gaps-remediate-3-1-log.md)
- [build-plan-gaps-remediate-3-2-log.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-gaps-remediate-3-2-log.md)
- [build-plan-verify-1-1.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-1-1.md)
- [build-plan-verify-2-1.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-2-1.md)
- [build-plan-verify-2-2.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-2-2.md)
- [build-plan-verify-3-1.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-3-1.md)
- [build-plan-verify-3-2.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-3-2.md)
- [build-plan-verify-3-3.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-3-3.md)
- [build-plan-verify-holistic.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-plan-verify-holistic.md)
- [build-summary.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-summary.md)
#### Telemetry

**build close** · cbartens/bkit

| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 37100 (10h18m) | — |
| linesChanged | 238 (+238/-0) | — |
| filesChanged | 4 | — |
| taskCount | 119 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 2 | — |
| failuresAdded | 2 | — |
| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |
| attempts | BUILD_ATTEMPT 2 | — |
```

---

### Comment by cbartens at 2026-07-29T00:40:50Z

```comment
### Step 17 — Create PR
[cbartens/bkit/pull/395](https://github.com/cbartens/bkit/pull/395)
```

---

### Comment by cbartens at 2026-07-29T00:38:50Z

```comment
### Step 16 — Summary - Verdict: PASS
[build-summary.md](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/build-summary.md)
Verdict: PASS
<!-- verdict:end -->

# Build Summary

## Overview

Successfully delivered the 384-ship-bookkeeping feature through a 3-sub-plan execution sequence (12 tasks total). The build restructured `.bkit/workflows/bkit-ship.md` from its original incompatibility between push contract and CI validation into a clean, tested Path A/B architecture with tiered quality carriers:

- **Sub-plan 1 (Foundations & Tier-1 Gate):** Config keys (`bkit.capstoneJob`, `bkit.ciWorkflow`), gh stub harness with fixture corpus, Tier-2 invariant test RED (11/14 assertions fail against current prose), and `bkit-ship-gate.sh` Tier-1 carrier GREEN (16/16 bats cases pass)
- **Sub-plan 2 (Hardening, Rewrite & Mirrors):** Hardened Failure Path, structural 1278-line rewrite of `bkit-ship.md` (Path A/B shape), Tier-2 invariant GREEN, byte-identical rendered mirrors across 4 locations
- **Sub-plan 3 (Docs, Detector & E2E):** 6 documentation files, Tier-3 advisory status-hole detector, consumer-repo E2E validation report

**Build challenge phase** conducted 2 rounds:

- **Round 1:** Found 8 issues (1 CRITICAL, 2 HIGH, 4 MEDIUM, 1 LOW) — all remediated
- **Round 2:** Found 5 new concerns (2 MEDIUM, 3 LOW) — non-blocking, max remediate exhausted

All tests PASS: **2657 vitest**, **144 bats** (ship-gate 20/20), all gates green.

## Implementation Quality

### Code matches plan tasks

Per `build-plan-execute-1-log.md`, all 5 tasks of Sub-plan 1 completed with SP1 Gate PASS (all 7 boxes checked). Sub-plan 2 structural rewrite delivered the Path A/B architecture with `--match-head-commit` on every merge, `BOOK_ROOT`/`BOOK_PATHS` contract, and all Finding fixes incorporated. Sub-plan 3 delivered documentation, Tier-3 detector, and E2E validation.

### Architecture respected

The design's tiered quality carriers are in place:

- **Tier 1:** `bkit-ship-gate.sh` with 9 exit codes (0/10/11/12/13/14/15/16/20), cache-skip vs vacuous-skipped distinction, `BKIT_SHIP_GATE_OVERRIDE` with audit row
- **Tier 2:** `bkit-ship-invariants.test.ts` with 14 canonical ship-* step keys + frozen 8-path `BOOK_PATHS` allow-list — now GREEN (11/14 RED turned GREEN by SP2 rewrite)
- **Tier 3:** Advisory status-hole detector validates each `status.jsonl` for step-set completeness

## Verification Status

All 3 sub-plan gates verified:

- **SP1 Gate** (build-plan-verify-1-1.md): PASS — 0 failures
- **SP2 Gate** (build-plan-verify-2-2.md): PASS — 0 failures (after 1 gap remediation)
- **SP3 Gate** (build-plan-verify-3-3.md): PASS — 0 failures (after 2 gap remediations)
- **Holistic verification** (build-plan-verify-holistic.md): PASS — 0 failures

## Test Status

- **pnpm test:** 2657 passed, 2 skipped, 1 todo — exit 0
- **pnpm test:bats:** 144 passed (full suite) — exit 0
- **pnpm typecheck:** exit 0
- **pnpm format:check:** clean
- **pnpm lint:slop:** 0 net-new/worsened findings
- **pnpm lint:prose:** 0 errors, 1 pre-existing warning
- **pnpm bkit check:** exit 0
- **pnpm check:dist:** GREEN

## Challenge

### Round 1: 8 findings (1 CRITICAL) — all remediated
### Round 2: 5 concerns (max MEDIUM) — non-blocking, max remediate exhausted

## Risks

- **Finding 1 (MEDIUM, Round 2):** Code 11 routing incomplete — Path A unbounded subagent loop
- **Finding 2 (MEDIUM, Round 2):** `STATUS_PATH=/dev/null` sinkhole defeats override audit
- **Mode-3 deferral:** E2E for cloud runtimes deferred to #341 live run

## Recommended Next Step

```

/bkit-ship 384

```

```

---

### Comment by cbartens at 2026-07-29T00:28:41Z

```comment
### Step 13 — Run Tests - Verdict: PASS - Failures: 0 - Scope: pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit - Attempt: 1
```

---

### Comment by cbartens at 2026-07-29T00:27:49Z

```comment
### Step 10 — Reconcile Build Challenge - Verdict: CONCERNS - Failures: 0 - Attempt: 1
```

---

### Comment by cbartens at 2026-07-29T00:25:37Z

```comment
### Step 9 — Build Challenge - Verdict: CONCERNS - Failures: 0 - Attempt: 1
```

---

### Comment by cbartens at 2026-07-29T00:17:53Z

```comment
### Step 12 — Build Challenge Tests - Verdict: PASS
```

---

### Comment by cbartens at 2026-07-29T00:07:18Z

```comment
### Step 11 — Build Challenge Remediate - Verdict: PASS - Attempt: 1
```

---

### Comment by cbartens at 2026-07-28T23:53:09Z

```comment
### Step 10 — Reconcile Build Challenge - Verdict: FAIL - Failures: 1 - Attempt: 0
```

---

### Comment by cbartens at 2026-07-28T23:51:28Z

```comment
### Step 9 — Build Challenge - Verdict: FAIL - Failures: 1 - Attempt: 0
```

---

### Comment by cbartens at 2026-07-28T23:46:12Z

```comment
### Step 8 — Plan Verify Holistic - Verdict: PASS - Failures: 0
```

---

### Comment by cbartens at 2026-07-28T23:40:33Z

```comment
### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 3/3 - Attempt: 3
```

---

### Comment by cbartens at 2026-07-28T23:36:29Z

```comment
### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 3/3 - Attempt: 2 - Strategy: PIVOT
```

---

### Comment by cbartens at 2026-07-28T23:25:30Z

```comment
### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 3/3 - Attempt: 2
```

---

### Comment by cbartens at 2026-07-28T23:20:31Z

```comment
### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 3/3 - Attempt: 1 - Strategy: STANDARD
```

---

### Comment by cbartens at 2026-07-28T23:08:33Z

```comment
### Step 6 — Plan Verify - Verdict: FAIL - Failures: 1 - Sub-plan: 3/3 - Attempt: 1
```

---

### Comment by cbartens at 2026-07-28T23:00:17Z

```comment
### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 3/3
```

---

### Comment by cbartens at 2026-07-28T22:29:18Z

```comment
### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 2/3 - Attempt: 2
```

---

### Comment by cbartens at 2026-07-28T22:25:26Z

```comment
### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 2/3 - Attempt: 1 - Strategy: STANDARD
```

---

### Comment by cbartens at 2026-07-28T22:19:48Z

```comment
### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 2/3 - Attempt: 1
```

---

### Comment by cbartens at 2026-07-28T22:10:16Z

```comment
### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 2/3
```

---

### Comment by cbartens at 2026-07-28T13:26:37Z

```comment
### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 1/3 - Attempt: 1
```

---

### Comment by cbartens at 2026-07-28T13:19:44Z

```comment
### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 1/3
```

---

### Comment by cbartens at 2026-07-28T12:57:31Z

```comment
### Step 4 — Install Skills
```

---

### Comment by cbartens at 2026-07-28T12:54:52Z

```comment
### Step 3 — Branch Sync
[cbartens/bkit/tree/feat/384-ship-bookkeeping](https://github.com/cbartens/bkit/tree/feat/384-ship-bookkeeping)
```

---

### Comment by cbartens at 2026-07-28T12:54:37Z

```comment
### Step 2 — Worktree Setup
[cbartens/bkit/tree/feat/384-ship-bookkeeping](https://github.com/cbartens/bkit/tree/feat/384-ship-bookkeeping)
[docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl](https://github.com/cbartens/bkit/blob/feat/384-ship-bookkeeping/docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl)
```

---

### Comment by cbartens at 2026-07-28T12:52:24Z

```comment
## Build Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
```

---

### Comment by cbartens at 2026-07-28T11:00:01Z

### Step 12 — Close Workflow

#### Artifacts

- [384-ship-bookkeeping-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-design.md)
- [384-ship-bookkeeping-plan-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-plan-1.md)
- [384-ship-bookkeeping-plan-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-plan-2.md)
- [384-ship-bookkeeping-plan-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-plan-3.md)
- [384-ship-bookkeeping-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-plan.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-complexity-check.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-input.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-scope-check-2.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-summary.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v1-draft.md)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v2-reviewed.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v3-checked.md)
- [plan-v4-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-1.md)
- [plan-v4-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-2.md)
- [plan-v4-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-3.md)
- [plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-split.md)

#### Telemetry

**plan close** · cbartens/bkit

<!-- prettier-ignore -->
| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 51033 (14h11m) | — |
| linesChanged | 2441 (+932/-1509) | — |
| filesChanged | 53 | — |
| taskCount | 55 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 0 | — |
| failuresAdded | 0 | — |
| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |
| attempts | PLAN_ATTEMPT 1 | — |

`med·5` = median of the previous 5 plan runs (— if < 3) · ledger 27 rows, 0 malformed

---

### Comment by cbartens at 2026-07-28T10:52:57Z

### Step 11 — Summary - Verdict: PASS

[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-summary.md)

Verdict: PASS
<!-- verdict:end -->

# Plan Summary

## Overview

This plan delivers a gate-first restructure of `bkit-ship.md` that resolves seven findings about an unwritten push contract and CI-head validation mismatch. The new workflow shape is verify → base-check → integrate → re-validate → merge → close, with bookkeeping moved off the branch to the dev tree (or adopt tree in mode 3) via tiered carriers: a tested `bkit-ship-gate.sh` merge gate (Tier 1), prose invariants enforced by vitest (Tier 2), and an advisory status-hole detector (Tier 3). The plan is split into three lossless sub-plans: Sub-plan 1 lands the serialisation carve-out, configuration surface, gh stub harness, and tested gate before any prose is touched; Sub-plan 2 hardens the Failure Path, performs the structural rewrite (turning the Tier-2 invariant GREEN), and regenerates rendered mirrors; Sub-plan 3 publishes contracts, ships the Tier-3 detector, and performs consumer-repo E2E validation. Key conventions include `BOOK_ROOT`/`BOOK_PATHS`, outbox durability, push-timing invariant decoupled from #341's `CAN_PUSH_DEV`, and `--match-head-commit` on every merge.

## Plan Quality

The plan is exceptionally tight and well-scoped. All 12 original design workstreams are covered across the three sub-plans with clear dependency seams. The gate-first landing order (tested gate before prose rewrite) is the direct antidote to the `01f8b8d9` anti-pattern where worktree model and head-match gate landed together without review. The dependency graph is sound: Sub-plan 1's outputs (tested gate + BOOK_ROOT contract + stub harness) are verified at the start of Sub-plan 2; Sub-plan 2's outputs (rewritten workflow + byte-identical mirrors) are verified at the start of Sub-plan 3. Every task is independently verifiable with concrete Done-when clauses using `pnpm test`, `pnpm test:bats`, `grep -c`, `diff`, `bkit install`, and `bkit check`. The RED→GREEN Tier-2 invariant is the plan's central quality mechanism and is split across sessions deliberately to prevent a half-applied rewrite.

## Review Outcome

The review cycle went through three passes with all CRITICAL/MAJOR findings resolved. Step 5 review (Lens 1/2/3) initially returned FAIL with 6 failures: (C1) Task 0 GO/NO-GO cited a marker absent from ship (bkit_close_guard_checkout); (M1) "first-of-its-kind gh stub" premise was false — the PATH-shim idiom already exists in bkit-runtime.bats, only the fixture-file dispatch is new; (M2) Suggested Scope Expansion ignored five pre-existing #384 deferrals in docs/deferrals.jsonl; plus three MINORs on dependency labels, supersession inventory, and implicit BOOK_ROOT conditional. Step 6 (plan-apply-review) incorporated all fixes: corrected markers, reframed Task 2 as "extend existing PATH-shim idiom", surfaced the five deferrals, and added explicit BOOK_ROOT conditional bullets. Step 7 scope-check returned CONCERNS with 1 MAJOR (forward-referenced Task 1/Task 4 Done-when clauses to Task 6's bkit-dogfood-noop extension, resolved by clarifying ownership). Step 8 (plan-apply-scope) applied the fix, achieving PASS. Step 9 complexity-check returned SPLIT with a 140K token estimate (1.6× the 85K single-session threshold), proposing a 3-way lossless partition. Step 10 (plan-complexity-split) executed the split with parent index (plan-v4-split.md) and three child sub-plans (plan-v4-1.md, plan-v4-2.md, plan-v4-3.md), achieving PASS.

## Breaking Changes

**New artifacts:** `.bkit/scripts/bkit-ship-gate.sh` + template byte-identical pair (Tier-1 merge gate); `.bkit/scripts/bkit-ship-timeouts.sh` + template byte-identical pair (managed config script); `tests/fixtures/gh/` fixture corpus with PATH-shimmed gh stub; `tests/ship-gate.bats` (10 cases); `tests/ship-failure-path.bats`; `tests/ship-worktree-ownership.bats`; `.bkit/src/bkit-ship-invariants.test.ts`; `.bkit/src/bkit-config-keys.test.ts`; `.bkit/src/bkit-status-hole-detector.ts` + test; `ship-e2e-validation.md`.

**New config keys:** `package.json` keys `bkit.capstoneJob` (default `bkit-tests-check`) and `bkit.ciWorkflow` (default `ci.yml`), consumer-tunable and survive stripManagedKeys.

**New named conventions:** `BOOK_ROOT` (single tree every status/artifact write targets); `BOOK_PATHS` (8-path frozen allow-list for staging); Outbox at `$GIT_COMMON_DIR/bkit-outbox/{FID}/` (crash-window buffer outside every worktree); canonical 14 `ship-*` step keys (stable schema); `BKIT_SHIP_GATE_OVERRIDE=<sha>` (escape honours only refused head).

**Prose changes:** `bkit-ship.md` structural rewrite (~1278 lines) to verify → base-check → integrate → re-validate → merge gate → merge → close shape; three deletions: ship's unconditional rebase-on-resume, Step 3's prior-run diffing, Step 8's `Update: Source files.` retry loop; Failure Path hardened (`.deferred-blocked` writer, BOOK_ROOT reads, append ordered after abort, six silencings removed); Step 12 worktree ownership scoped; `bkit-protect-main.sh` reads bkit.capstoneJob not literal.

**Rendered mirrors:** `.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md` regenerated via `bkit install`; `.bkit/workflows.md` step table re-sectioned; templates-content snapshot enforced.

**Observability:** `[bkit-ship-gate]` stderr prefix registered in `docs/observability.md`.

**Consumer contracts:** `docs/deployments.md` consumer CI contract (pull_request ⇒ run_level=full; narrowing = opt-out); rollback path (pin previous @cbartens/bkit; hold bkit upgrade for ship surfaces; audit BKIT_SHIP_GATE_OVERRIDE rows).

**CI wiring:** bats wired into `.husky/pre-push`.

**Mode-3 deferral:** live E2E validation for mode-3 (cloud runtime, RUNTIME_DEVPUSHES=false) deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`.

## Feasibility

The plan is buildable on the existing stack with no new dependencies. Shell scripts use bash + jq + gh; tests use bats + vitest; documentation uses markdown. The gh stub harness reuses the existing PATH-shim idiom from `tests/bkit-runtime.bats:44-58` and adds only the fixture-file dispatch layer, making the cost hinge cheaper than originally claimed. #341 has landed (merged d64ef5be), so 384 re-derives against the post-#341 bkit-ship.md state (verified in Task 0). The only verification gap is consumer-repo E2E (Risk 11: bkit's own repo cannot dogfood; 0 sweeps across 21 log dirs; 2 ship rows are fixtures), which is addressed by the manual Task 11 validation workstream.

## Synthesis Coverage

Three review lenses (tightness, completeness, complexity) and two scope lenses (precision, creep/gaps) converged on the same structure. Lens 1 identified 6 failures (markers, stub premise, deferrals surfacing, dependency labels, inventory, implicit conditional) — all applied in Step 6. Lens 2 (gate structure) and Lens 3 (derived test matrix bidirectionality) passed. Scope check confirmed 12/12 tasks have explicit scope + criteria + verification with no scope creep or gaps. Complexity check proposed the 3-way split along clean dependency seams: tested gate (SP1) → RED→GREEN invariant + final workflow shape (SP2) → docs/detector/E2E (SP3). Deferrals: kernel extraction, detector promotion, ship-without-branch-checkout (outside B2), per-workflow rollback, ship-redesign-sequence-after-341 — all recorded in docs/deferrals.jsonl as follow-ups, not absorbed into scope.

## Scope Alignment

The plan's Acceptance Scenario and Success Criteria match the issue brief + comment clarifications verbatim. Scope covers the issue's stated "In" items: `.bkit/workflows/bkit-ship.md`, `.deferred-blocked` writer, Failure Path status target, `.bkit/workflows.md` step table, rendered mirrors, and verification-gap detector. It absorbs related issues #74 (cancel-in-progress recurring), #68 (main repo vs worktree cwd mismatch), #209 (workflow state model), and #71 (commit/push reduction) — each finding maps to a plan decision or deletion. Comment clarifications folded in: non-firing pull_request is general (CONFLICTING/buried skip-ci), cancel-in-progress is a second independent justification for frozen head, Path B2 is the common case, path-scoped staging constraint added, and #341 RUNTIME_DEVPUSHES-conditional BOOK_ROOT rule made explicit.

## Risks

**#341 overlap:** Serialisation resolved via Task 0 gate (verify #341 landed, no concurrent bkit-ship.md rewrite). Plan re-derives against post-#341 state.

**gh API rate limits:** Path B poll loop samples `gh api rate_limit` before loop; code 20 strictly distinguished from code 10 (no run). First real sample deferred to Task 11 E2E.

**gh stub harness cost hinge:** Task 2 is the plan's single cost hinge. Re-calibrated as "extend existing PATH-shim idiom + new dispatch layer" (cheaper than first-of-its-kind). NO-GO still halts whole plan — SC 1 would rest on Tier-2 alone, which design says is insufficient (Risk 9).

**Consumer-repo E2E outside CI:** Task 11 manual validation is the only way to prove a run honoured the contract (Risk 11). bkit's own telemetry cannot dogfood.

**Mode-3 live verification deferred:** Both validated paths are local-mode (RUNTIME_DEVPUSHES=true); mode-3 BOOK_ROOT prose contract is mechanically asserted by Task 3's Tier-2 presence check, but live E2E deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`).

## Action Items

None — plan ready for build.

## Outstanding Questions

**WS-2 harness go/no-go timing:** Task 2 carries a GO/NO-GO escalation: if the gh stub harness cannot be settled in roughly half a day (8 agent turns), STOP and surface to orchestrator for explicit tiering revisit. The PATH-shim reuse recalibration makes this less likely, but the gate remains.

**Mode-3 live E2E sequencing with #341's deferral:** Task 11 records the gap and cross-references `341-live-run-verification-mode-1-and-mode-3`. The sequencing decision (run after that issue's live-run workstream lands) is in the deferral ledger, not resolved here.

## Sub-Plans (SPLIT)

**Sub-plan 1 — Foundations & Tier-1 Gate (`plan-v4-1.md`):** Tasks 0, 1, 2, 3, 4 (est. ~33K tokens). Dependencies: none (fresh start). Output: #341 serialisation decision recorded; `bkit.capstoneJob`/`bkit.ciWorkflow` config keys + `bkit-ship-timeouts.sh`; gh stub harness with fixture corpus; Tier-2 invariant test RED; tested `bkit-ship-gate.sh` (10 bats cases GREEN). SP1 Gate: tested gate GREEN + invariant RED + byte-identity manual diffs verified + pre-push wired.

**Sub-plan 2 — Hardening, Rewrite & Mirrors (`plan-v4-2.md`):** Tasks 5, 6, 7, 8 (est. ~44K tokens). Dependencies: SP1 outputs re-verified at start (Task 5 prelude). Output: hardened Failure Path + `.deferred-blocked` writer + Step 12 ownership (2 bats files GREEN); dogfood mirroring verified (bkit-dogfood-noop GREEN); structural rewrite of `bkit-ship.md` (Tier-2 invariant GREEN); byte-identical mirrors + re-sectioned `workflows.md`. SP2 Gate: invariant GREEN + mirrors byte-identical + no regression in Tier-1 carrier.

**Sub-plan 3 — Docs, Detector & E2E (`plan-v4-3.md`):** Tasks 9, 10, 11 (est. ~26K tokens). Dependencies: SP2 outputs re-verified at start (Task 9 prelude). Output: 6 docs (observability, deployments, decisions×2, knowledge, deferrals) with contracts published; Tier-3 status-hole detector (advisory, fail-open) shipped; consumer-repo E2E validation report. SP3 Gate: docs published + detector advisory + E2E evidence recorded.

**Seam contracts:**

- Seam 1 (SP1 → SP2): SP2 Task 5 re-verifies `bkit-ship-gate.sh` + `tests/ship-gate.bats` exist and pass; `.bkit/src/bkit-ship-invariants.test.ts` exists and RED; config present; stub harness present.
- Seam 2 (SP2 → SP3): SP3 Task 9 re-verifies Tier-2 invariant GREEN; `bkit check` reports no drift; mirrors byte-identical; hardening live; Tier-1 intact.

## Suggested Next Step

```text
/bkit-build 384
Brief: Build Sub-plan 1 first — foundations, config, gh stub harness, tested gate, Tier-2 invariant RED. Target: docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-1.md (33K tokens). SP1 Gate verified before handoff to Sub-plan 2.
```

---

### Comment by cbartens at 2026-07-28T10:46:35Z

### Step 10 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-split.md)

---

### Comment by cbartens at 2026-07-28T10:40:41Z

### Step 9 — Complexity Check - Verdict: SPLIT

---

### Comment by cbartens at 2026-07-28T10:37:57Z

### Step 8 — Apply Scope - Verdict: PASS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v3-checked.md)

---

### Comment by cbartens at 2026-07-28T10:33:57Z

### Step 7 — Scope Check - Verdict: CONCERNS - Failures: 1

---

### Comment by cbartens at 2026-07-28T10:28:34Z

### Step 6 — Apply Review - Verdict: PASS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v2-reviewed.md)

---

### Comment by cbartens at 2026-07-28T10:19:08Z

### Step 5 — Review Plan - Verdict: FAIL - Failures: 6

---

### Comment by cbartens at 2026-07-28T06:58:28Z

### Step 4 — Fetch Context

[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/related-failures.md)

---

### Comment by cbartens at 2026-07-28T06:57:44Z

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/plan-v1-draft.md)

---

### Comment by cbartens at 2026-07-28T06:47:24Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl)

---

### Comment by cbartens at 2026-07-28T06:43:17Z

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: [384-ship-bookkeeping-design.md](https://github.com/cbartens/bkit/blob/main/docs/plans/202607/384-ship-bookkeeping-design.md)

---

### Comment by cbartens at 2026-07-27T02:44:34Z

### Step 10 — Close Workflow

#### Artifacts

- [384-ship-bookkeeping-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/384-ship-bookkeeping-design.md)
- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-brainstorm-ideate-1.md)
- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-brainstorm-ideate-2.md)
- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-brainstorm-ideate-3.md)
- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-input.md)
- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-review-1.md)
- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-review-2.md)
- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-summary.md)
- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v1-draft.md)
- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v2-reviewed.md)
- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v3-organised.md)

#### Telemetry

> @cbartens/bkit@4.8.0 bkit /Users/christian/Documents/GitHub/bkit
> node dist/bkit-install.js telemetry summary --phase=design

**design close** · cbartens/bkit

<!-- prettier-ignore -->
| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 38527 (10h42m) | — |
| linesChanged | 8428 (+7770/-658) | — |
| filesChanged | 154 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 6 | — |
| failuresAdded | 0 | — |
| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |
| attempts | DESIGN_ATTEMPT 1 | — |

`med·5` = median of the previous 5 design runs (— if < 3) · ledger 17 rows, 0 malformed

---

### Comment by cbartens at 2026-07-27T02:42:09Z

### Step 8 — Summary - Verdict: PASS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-summary.md)

Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

Ship bookkeeping currently mutates or mis-records state on `feat/{FID}` while gating merge on a CI-validated PR head — an unwritten push contract each agent resolves differently. The design restructures `bkit-ship.md` into verify → base-check → integrate → re-validate → merge → close, with bookkeeping never pushed to the feature branch before merge. Three tiered carriers: a tested `bkit-ship-gate.sh` merge gate (Tier 1), prose invariants enforced by vitest (Tier 2), and an advisory status-hole detector (Tier 3). Key conventions: `BOOK_ROOT`/`BOOK_PATHS`, outbox durability, push-timing invariant decoupled from #341's `CAN_PUSH_DEV`, and `--match-head-commit` on every merge.

## Design Quality

Exceptionally thorough — seven findings traced to one root cause, evidence from three repos, explicit rejection/deferral of alternatives (merge queue, surgical patch, kernel extraction). Trade-offs named honestly (tiered carriers, advisory detector, skipped-lane vs full `run_level` assertion). Reviews incorporated: gh stub harness as deliverable, config-home rule, dev-lock windowing, run-selection contract, paginated jobs query. Minor gap: Success Criteria 1–2 lean implementation-specific though still testable.

## Acceptance Scenario

Narrative and five success criteria are user-outcome focused and measurable. Process sketch is eight `WHEN → THEN` lines (spec prefers 3–7). Key edge cases are comprehensive (stale green, CONFLICTING PR, concurrent staging, cloud runtime, capstone pagination). **Verdict:** adheres to `docs/plans/template.md` § Acceptance Scenario spec with minor process-sketch length deviation; no blocking violation.

## Breaking Changes

- New `.bkit/scripts/bkit-ship-gate.sh` (+ template mirror) and managed timeout config script
- `package.json` keys: `bkit.capstoneJob`, `bkit.ciWorkflow`
- Canonical fourteen `ship-*` step keys frozen (numbers may move)
- `bkit-ship.md` structural rewrite (~1244 lines) propagating to four rendered command surfaces
- `[bkit-ship-gate]` observability prefix; consumer CI contract in `docs/deployments.md`
- bats wired into pre-push (`pnpm test:bats`); new `tests/ship-gate.bats`, gh stub fixtures
- Ship drops unconditional rebase-on-resume, Step 3 prior-run diffing, Step 8 source-file retry loop

## Feasibility

Buildable on existing stack (bash, jq, gh, bats, vitest). Design corrects draft over-claims about test harness — gh PATH-shim + fixture corpus is first-of-its-kind here (~half day, WS-2 go/no-go). Capstone assertion strength verified against cited `ci.yml` lines. #341 overlap is sequencing risk, not a technical blocker. End-to-end proof requires consumer-repo manual runs (outside CI).

## Synthesis Coverage

Three brainstorm lenses converged on structural A/B rewrite spine; pragmatic lens contributed `BOOK_ROOT`/`BOOK_PATHS`; risk lens contributed outbox and tiered carriers; optimal lens contributed head-move observation trigger. Dropped: surgical patch, full kernel extraction (deferred end state), remove-branch-write-access premise, merge queue (unavailable). Reasonable pruning — kept best ideas without losing viable alternatives.

## Scope Alignment

Matches issue brief (Path A/B, bookkeeping off branch, `.deferred-blocked`, Failure Path, verification detector) plus comment clarifications (#341 runtime, unconditional dispatch, path-scoped staging). Absorbs related issues #74, #68, #209, #71. Slight expansion: config consolidation, documentation/rollback path, pre-push bats — all justified by gate durability. #341 serialisation explicitly scoped to WS-1, not deferred silently.

## Risks

- **#341/384 both rewrite `bkit-ship.md`** — must serialise or carve overlap (WS-1)
- Step 12 force-remove on shared worktree (scoped in WS-8)
- Capstone assertion assumes `pull_request ⇒ run_level=full`; skipped-lane refusal (code 16) closes common case; present-but-degraded runs remain residual
- gh API rate limits unmeasured under Path B poll loop
- gh stub harness unproven — Tier 1 cost hinge (WS-2 checkpoint)
- Verification depends on consumer-repo E2E, not green pipeline alone

## Action Items

_None — design ready for planning. Resolve #341 landing sequence as WS-1 before implementation workstreams._

## Outstanding Questions

- **Q:** Which lands first — #341 or #384 ship-touching work, and who re-derives? — **Recommended:** Serialise 384 after #341 WS-8/9/10/12 land; 384 re-derives its diff against #341's ship shape. Honour repo doctrine: one clone, one workflow at a time.
- **Q:** Can the gh stub harness be settled in ~one day? — **Recommended:** Treat WS-2 as go/no-go; if stub slips beyond a day, revisit Tier-1 carrier scope explicitly rather than absorbing silently.
- **Q:** How to handle present-but-degraded CI (non-skipped, narrowed coverage)? — **Recommended:** Accept as documented residual in `docs/deployments.md`; revisit only if a consumer materially diverges from scaffold.

## Suggested Workstreams

- **WS-1:** #341 overlap carve-out — Requires: []
- **WS-2:** gh stub harness + fixtures — Requires: [WS-1]
- **WS-3:** Config surface (`bkit.capstoneJob`, `bkit.ciWorkflow`) — Requires: [WS-1]
- **WS-4:** `bkit-ship-gate.sh` + bats — Requires: [WS-2, WS-3]
- **WS-5:** Gate distribution / dogfood mirroring — Requires: [WS-3, WS-4]
- **WS-6:** Bookkeeping contract + Tier-2 invariant test — Requires: [WS-1]
- **WS-7:** `bkit-ship.md` structural rewrite — Requires: [WS-4, WS-6, WS-8]
- **WS-8:** Failure Path + worktree hardening — Requires: [WS-4, WS-6]
- **WS-9:** Rendered mirrors — Requires: [WS-7, WS-8]
- **WS-10:** Documentation + contract publication — Requires: [WS-4, WS-7]
- **WS-11:** Tier-3 status-hole detector (advisory) — Requires: [WS-6, WS-7]
- **WS-12:** E2E validation + rollout — Requires: [WS-4, WS-5, WS-7, WS-9, WS-10, WS-11]

## Recommended Next Step

```text
/bkit-plan 384
Brief: Plan gate-first landing (WS-2→4 before prose rewrite WS-7). WS-1 must resolve #341 serialisation before implementation. Design: docs/plans/202607/logs/384-ship-bookkeeping/design-v3-organised.md
```

---

### Comment by cbartens at 2026-07-27T02:40:10Z

### Step 7 — Design Organise - Verdict: CONCERNS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v3-organised.md)

---

### Comment by cbartens at 2026-07-27T02:35:11Z

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v2-reviewed.md)

---

### Comment by cbartens at 2026-07-27T02:26:38Z

### Step 5 — Design Review - Verdict: CONCERNS

---

### Comment by cbartens at 2026-07-27T02:18:04Z

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/design-v1-draft.md)

---

### Comment by cbartens at 2026-07-27T02:09:15Z

### Step 3 — Brainstorm & Ideate

---

### Comment by cbartens at 2026-07-27T02:02:30Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/384-ship-bookkeeping/status.jsonl)

---

### Comment by cbartens at 2026-07-27T02:02:06Z

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

---

### Comment by cbartens at 2026-07-27T01:51:23Z

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

---

### Comment by cbartens at 2026-07-27T00:16:18Z

From #341

One real interaction to hand to 384: it says "bookkeeping never rides the branch — status.jsonl and ship artifacts go to the dev tree from Step 1", but a cloud runtime cannot write the dev tree at all. So 384's rule needs to be "…to the dev tree when RUNTIME_DEVPUSHES = true, else to the current branch" — which is easier to express after 341 lands, because the flag already exists. Folding 384 in now would also re-open the "is the local path still byte-identical?" question you just spent this session closing.

Also worth noting: 384's finding 4 (Failure Path appends workflow-failed to the dev copy while Steps 1–8 write the worktree copy) is in territory 341 touches, but it's independently fixable and not a blocker either way.

---

### Comment by cbartens at 2026-07-26T23:11:17Z

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

---

---

## Plan (canonical)

### 384-ship-bookkeeping-plan.md

Verdict: PASS
<!-- verdict:end -->

# Ship Bookkeeping — Plan Complexity Split (v4 Parent Index)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. This is the **parent index**. The full feature context (Acceptance Scenario, Success Criteria, Breaking Changes, Open Questions, Architecture, Supersession Inventory, Rollback) lives in `plan-v3-checked.md` — read it ONCE.
> 2. Each child sub-plan (`384-ship-bookkeeping-plan-1.md`, `384-ship-bookkeeping-plan-2.md`, `384-ship-bookkeeping-plan-3.md`) is **self-contained**: it re-states the design slice it owns, carries its own task list, and ends with its own gate.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in each sub-plan. `[ ]` = NOT DONE.

**Parent Plan (checked):** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v3-checked.md`
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`)
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384

---

## Partition Rationale

The checked plan (`plan-v3-checked.md`, `Verdict: PASS`) holds 12 tasks (Task 0–11) and 4 gates across shell scripts, bats, vitest, a 1278-line structural rewrite, rendered mirrors, 6 docs, a new detector module, and consumer-repo E2E. The complexity check (`plan-complexity-check.md`, `Verdict: SPLIT`) estimates ~140K tokens end-to-end — ~1.6× the 85K single-session threshold. The RED→GREEN Tier-2 invariant is the plan's central quality mechanism and would be jeopardised by attempting the rewrite (Task 7) in the same session as 11 other tasks.

The split is **lossless** along clean, tested dependency seams. Each seam is a verifiable artifact the next sub-plan treats as a stable input:

- **Seam 1 (Sub-plan 1 → 2):** tested `bkit-ship-gate.sh` (10 bats cases pass) + the `BOOK_ROOT`/`BOOK_PATHS` contract published as a RED Tier-2 invariant test + config keys + stub harness. These are proven before any prose is touched.
- **Seam 2 (Sub-plan 2 → 3):** the rewritten `bkit-ship.md` (Tier-2 invariant test GREEN) + byte-identical rendered mirrors + re-sectioned `.bkit/workflows.md`. These are the final workflow shape the docs and detector parse.

The critical path holds across the seam: **tested gate (SP1) → RED→GREEN invariant + final workflow shape (SP2) → docs/detector/E2E against that shape (SP3).** No deviation from the complexity check's proposed 3-way partition — it is the cleanest lossless seam available (each sub-plan is comfortably under 85K; a 4-way split would only add context-reload overhead).

---

## Sub-Plan Dependency Graph

```
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 1 — Foundations & Tier-1 Gate      │
                       │  Tasks 0, 1, 2, 3, 4   (~33K est.)           │
                       │  In:  none                                  │
                       │  Out: config keys · gh stub harness ·        │
                       │       Tier-2 invariant RED · tested gate     │
                       │       (10 bats cases GREEN)                  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 1
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 2 — Hardening, Rewrite & Mirrors   │
                       │  Tasks 5, 6, 7, 8       (~44K est.)          │
                       │  In:  tested gate (SP1 T4) · BOOK_ROOT       │
                       │       contract (SP1 T3) · config (SP1 T1)    │
                       │  Out: hardened Failure Path + Step 12 ·      │
                       │       structural rewrite (Tier-2 GREEN) ·    │
                       │       byte-identical mirrors + workflows.md  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 2
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 3 — Docs, Detector & E2E           │
                       │  Tasks 9, 10, 11        (~26K est.)          │
                       │  In:  final workflow shape (SP2 T7) ·        │
                       │       mirrors (SP2 T8)                      │
                       │  Out: 6 docs + decisions ledger · Tier-3     │
                       │       advisory detector · consumer-repo E2E  │
                       └─────────────────────────────────────────────┘
```

**Seam contracts (hard):**

- Sub-plan 2's first task (Task 5) re-verifies Sub-plan 1's outputs landed: `bkit-ship-gate.sh` + `tests/ship-gate.bats` exist and `pnpm test:bats tests/ship-gate.bats` passes; `.bkit/src/bkit-ship-invariants.test.ts` exists and is RED against current `bkit-ship.md`.
- Sub-plan 3's first task (Task 9) re-verifies Sub-plan 2's outputs landed: `.bkit/src/bkit-ship-invariants.test.ts` is GREEN; `bkit check` reports no `bkit-rendered-prompts-stale` drift; `.bkit/workflows.md` ship section reflects new shape.

---

## Per-Sub-Plan Summary

<!-- prettier-ignore -->
| Sub-plan | File | Tasks | Est. tokens | Predecessor verification | Own gate |
| --- | --- | --- | --- | --- | --- |
| **1 — Foundations & Tier-1 Gate** | `384-ship-bookkeeping-plan-1.md` | 0, 1, 2, 3, 4 | ~33K | none (fresh start) | SP1 Gate (tested gate GREEN + invariant RED) |
| **2 — Hardening, Rewrite & Mirrors** | `384-ship-bookkeeping-plan-2.md` | 5, 6, 7, 8 | ~44K | SP1 gate + bats + RED invariant re-verified (Task 5 prelude) | SP2 Gate (invariant GREEN + mirrors byte-identical) |
| **3 — Docs, Detector & E2E** | `384-ship-bookkeeping-plan-3.md` | 9, 10, 11 | ~26K | SP2 mirrors + GREEN invariant re-verified (Task 9 prelude) | SP3 Gate (docs published + detector advisory + E2E report) |

### Lossless Coverage

- **Original tasks (plan-v3-checked):** Task 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 → **12 tasks**.
- **Across sub-plans:** SP1 = {0,1,2,3,4} · SP2 = {5,6,7,8} · SP3 = {9,10,11} → **12 tasks**. Each task appears in **exactly one** sub-plan; `Done when` entries copied verbatim.
- **Original gates (Gate 1–4):** Gate 1 (human-review prerequisites) is confirmed once at the feature level (`plan-v3-checked.md`) and inherited by every sub-plan. Gates 2–4 (code / testing / automated verification) are sliced per sub-plan: each sub-plan carries the gate scope its tasks own, plus the predecessor-seam verification. The full Gate 4 suite (`pnpm test && pnpm test:bats && pnpm bkit check`) is re-run at every sub-plan boundary.
- **Total est. tokens:** ~103K across 3 sessions (vs ~140K single-session) — every sub-plan < 85K.

---

## Preserved Corrections (plan-v3-checked)

Every correction from `plan-v3-checked.md` is carried into the relevant sub-plan verbatim. This section is the cross-check index:

- **Real post-#341 ship marker** (`bkit_runtime_row ship` / `RUNTIME_DEVPUSHES`) — **SP1, Task 0** Done-when.
- **gh PATH-shim reuse** (not "first-of-its-kind") — **SP1, Task 2** (extends `bkit-runtime.bats:44-58`) + **SP1 Gate** no-bolt-on box.
- **8-path frozen `BOOK_PATHS` allow-list** — **SP1, Task 3** positive-presence assertion.
- **Mode-3 deferral cross-reference** (`384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`) — **SP3, Task 11** Mode-3 gap.
- **`bkit-dogfood-noop.integration.test.ts` ownership** (Task 6 sole owner; Tasks 1+4 use manual `diff`) — **SP1, Tasks 1 & 4** Done-when; **SP2, Task 6** sole ownership.
- **Path-scoped staging** (never `git add -A` / blanket `docs/`) — **SP1, Task 3**; enforced GREEN by **SP2, Task 7**.
- **`[skip ci]` hygiene** (single path-scoped close commit) — **SP2, Task 7** Steps 7+.
- **`CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional `BOOK_ROOT`** (explicit Step-1 bullet) — **SP2, Task 7** (review-1 m4).
- **Timeout literals sourced from `bkit-ship-timeouts.sh`** (no third source of truth) — **SP2, Task 7** Step 5 (review-3 m2).
- **Preserve Task 5's Failure Path block in the rewrite** (review-2 MINOR 4) — **SP2, Task 7**.
- **Task 8 must not drop Task 5's `.deferred-blocked` writer wire-in** (scope-check-1 MINOR-2) — **SP2, Task 8**.

---

## Execution Order

1. **Execute `384-ship-bookkeeping-plan-1.md`** end-to-end (Tasks 0 → 4). Land SP1 Gate: tested gate GREEN, Tier-2 invariant RED.
2. **Execute `384-ship-bookkeeping-plan-2.md`** (Tasks 5 → 8), starting with the SP1-seam verification prelude. Land SP2 Gate: invariant GREEN, mirrors byte-identical.
3. **Execute `384-ship-bookkeeping-plan-3.md`** (Tasks 9 → 11), starting with the SP2-seam verification prelude. Land SP3 Gate: docs published, detector advisory, E2E report written.

Each sub-plan is independently buildable + verifiable against its own gate. Merge is one squash-merged PR to `dev` per the workflow's hard rule (see `plan-v3-checked.md` § Merge Method).

### 384-ship-bookkeeping-plan-1.md

Verdict: PASS
<!-- verdict:end -->

# Sub-Plan 1 — Foundations & Tier-1 Gate (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/384-ship-bookkeeping-plan.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 1 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below so it does not depend on sibling sub-plans for context. The full Acceptance Scenario, Success Criteria, Breaking Changes, Open Questions, Out-of-Scope and Rollback live in `plan-v3-checked.md` and are inherited as confirmed (Gate 1 human-review sections are feature-level, already confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan lands the **serialisation carve-out, the configuration surface, the `gh` stub harness, the Tier-2 invariant test (RED), and the tested Tier-1 merge gate**. It is the direct antidote to `01f8b8d9` (worktree model and head-match gate landed in one commit, neither reviewed against the other): the gate and its bats suite land first, proven against captured fixtures, before any prose is rewritten (the rewrite is Sub-plan 2). It ends with: **tested gate GREEN + Tier-2 invariant RED** (ready for Sub-plan 2 to turn the invariant GREEN).

Success Criterion 1 (the merge call refuses a head other than the validated one) rests primarily on the Tier-1 carrier this sub-plan builds. Task 2's `gh` stub harness is the plan's **single cost hinge** — a NO-GO halts the whole plan.

**Tasks in this sub-plan:** 0, 1, 2, 3, 4 (original IDs preserved; cross-task references below keep their original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

These are the load-bearing design decisions the tasks below implement, re-stated here so the sub-plan is independently buildable. Verbatim from the design (`docs/plans/202607/384-ship-bookkeeping-design.md`).

### Tiered carriers (the organising choice)

All seven findings reduce to one defect class — a load-bearing rule that lives only in prose, that no gate can check. This sub-plan builds **Tier 1** (the merge gate → tested executable) and **Tier 2's defender** (the vitest invariant test, RED before the rewrite). Tier 3 (advisory detector) is Sub-plan 3.

- **Tier 1 — merge gate:** capstone present + `success` at the current PR head. Failure is **unrecoverable** (`ci.yml:130-131` gives merged-PR dev pushes only `run_level=light`). Carrier: `.bkit/scripts/bkit-ship-gate.sh` + `tests/ship-gate.bats` against captured `gh` JSON.
- **Tier 2 — push contract / staging / step keys:** recoverable but silently drifting. Carrier: prose in `bkit-ship.md`, mechanically constrained by a vitest markdown-invariant test (`stripFencedBlocks` reused).

### Configuration, not literals

`bkit-tests-check` is hard-coded in `docs/deployments.md`, in `bkit-protect-main.sh`, and would be a third copy in the gate. The CI workflow filename is the same class of literal. Both resolve from `package.json` (read by `jq`, survive `stripManagedKeys` because it touches only `scripts` + `devDependencies`):

<!-- prettier-ignore -->
| Key | Default | Read by |
| --- | --- | --- |
| `bkit.capstoneJob` | `bkit-tests-check` | gate; `bkit-protect-main.sh` |
| `bkit.ciWorkflow` | `ci.yml` | gate's run-selection query |

**Config-home rule:** `.bkit/scripts/*` is Tier 1 (bkit-owned, force-overwritten on `bkit upgrade`) — anything a consumer may tune lives in `package.json`; only bkit-owned defaults live in a managed config script. Timeouts/limits are bkit-owned → one managed config script (`bkit-ship-timeouts.sh`) with units in identifiers, matching the `bkit-counter-bus-config.sh` precedent.

### Run selection (decided before exit codes can mean anything)

A head SHA legitimately carries several runs. Query `GET /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped, NOT repo-wide), then select the **most recent `completed` run of that workflow**. If runs exist but none completed → "in progress" (code 11), not "absent".

### Gate exit codes — one per condition, never collapsed

<!-- prettier-ignore -->
| Code | Condition | Merge |
| --- | --- | --- |
| 0 | Capstone present in selected run, concluded `success` | proceed |
| 10 | No run of the CI workflow exists at head | refuse |
| 11 | Runs exist at head but none completed | refuse (caller may poll) |
| 12 | Selected run concluded failure | refuse |
| 13 | Selected run exists but capstone job **absent** | refuse — never vacuous pass |
| 14 | Green run exists, but at a **superseded** SHA | refuse, print both SHAs + run URL |
| 15 | Selected run concluded `cancelled` | refuse — "dispatch, do not push" |
| 16 | Capstone green but a lane concluded `skipped` (not full) | refuse — vacuous green |
| 20 | API error / rate limit / auth | refuse, **distinct from "no run"** |

Codes 10–16 mean "not validated". Code 20 means "unknown". Conflating them lets a degraded API read as an unvalidated head, and lets an unvalidated head read as an API blip. Distinguish a `skipped` lane (code 16) from a `cache_skip` sentinel green (code 0 + `--explain` note) — the SHA-cache short-circuit is keyed to the exact commit SHA and is sound.

### `BOOK_ROOT` / `BOOK_PATHS` — the two named conventions

```
BOOK_ROOT   = the single tree every status/artifact write in this run targets.
              Resolved once in Step 1. A single variable cannot resolve to two trees
              (Finding 4 dissolves). Value selected by #341's CAN_PUSH_DEV
              (worktree present ⇒ true, modes 1–2 ⇒ dev tree; mode 3 ⇒ adopt tree).
              Prose resolution is enforced by Task 3's presence check; the live
              mode-3 E2E is deferred (Sub-plan 3, Task 11).

BOOK_PATHS  = the staging allow-list, expanded literally into every git add:
              docs/plans/{YYYYMM}/logs/{FID}/
              docs/completed.md docs/deferrals.jsonl docs/failures.jsonl
              docs/knowledge.jsonl docs/decisions.jsonl .bkit/friction.jsonl
              .agents/skills skills-lock.json
              Never `-A`. Never a bare `docs/`.
```

**Push-timing invariant (the design's sharpest departure, decouples 384 from #341):** no ship bookkeeping commit reaches `origin/feat/{FID}` before the merge. True in every runtime; `BOOK_ROOT`'s value is a runtime detail.

### Canonical `ship-*` step keys — stable schema

Step **numbers** may move; **keys** may not. Renaming resets attempt counters across three repos and orphans the Tier-3 detector corpus. Publishing the set makes Finding 7 (invented names) detectable:

```
ship-start-workflow      ship-worktree-setup      ship-regression-guard
ship-conflict-resolve    ship-deferred-sweep      ship-merge-pr
ship-failure-diagnose    ship-failure-remediate   ship-switch-to-dev
ship-update-docs         ship-summary             ship-prune-skills
ship-worktree-cleanup    ship-close-workflow
```

### #341 serialisation

#341 (CLOSED, merged `d64ef5be`) ship-touching workstreams have landed. 384 re-derives against the post-#341 `bkit-ship.md`. Ship is the documented exception that does NOT call `bkit_close_guard_checkout` (its EXIT trap would undo staying on `dev` for Steps 10–13); the kernel exists for the other phases.

### Cost hinge (Risk 12, recalibrated)

The `gh` stub harness **reuses the existing PATH-shim idiom** (`tests/bkit-runtime.bats:44-58` writes a fake `gh` to `FAKE_BIN`, `chmod +x`, prepends to `PATH`). The genuinely-new piece is **fixture-file dispatch** (argv → JSON file under `tests/fixtures/gh/`). Cheaper than "first-of-its-kind" — but a NO-GO still removes SC 1's primary carrier and halts the whole plan.

---

## Architecture & Component Changes (this slice)

Per `docs/architecture.md` topology (`.bkit/scripts/` = Tier-1 force-overwritten; `.bkit/src/` = install engine + tests; `tests/` = bats + fixtures). **CRITICAL:** no `as any` / `@ts-ignore` / `.skip` / empty `catch` to make a gate pass. **CRITICAL:** `bkit-ship-gate.sh` + `bkit-ship-timeouts.sh` are byte-identical pairs (root + template); Tasks 1 & 4 satisfy byte-identity via manual `diff` (Task 6 / Sub-plan 2 automates it into the integration test — sole owner).

### Shell scripts

#### [NEW] `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical pair) — Task 4

- **Existence Check:** Does not exist. Closest `gh`-calling script is `bkit-protect-main.sh` (uncovered by bats, one-shot branch-protection setup). Different responsibility; cannot be evolved without rewriting its contract.
- **Why new:** Ship's merge gate is the last load-bearing rule of its class (failure unrecoverable) living only in prose. Same shape as routing (`bkit-status-route.sh`) and counting (`bkit-counter-bus.sh`); the last piece uncovered.
- **Contract:** `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`. Workflow-scoped SHA-keyed query; select most recent `completed` run; read `/actions/runs/{id}/jobs --paginate`; one exit code per condition (0/10/11/12/13/14/15/16/20). Diagnostics on stderr behind `[bkit-ship-gate]`. `BKIT_SHIP_GATE_OVERRIDE=<sha>` honoured only when equals refused head; gate appends its own override `status.jsonl` row. Samples `gh api rate_limit` for code-20 message.

#### [NEW] `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical pair) — Task 1

- **Existence Check:** Does not exist. `bkit-counter-bus-config.sh` is the precedent for bkit-owned-defaults config.
- **Contract:** `SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `SHIP_DEV_LOCK_STALE_S`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S`, `MAX_MERGE_ATTEMPT` — units in identifiers.

#### [MODIFY] `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` — Task 1

- **Existence Check:** Exists; `REQUIRED_JOB="bkit-tests-check"` hard-coded at line 38.
- **Change:** Read `bkit.capstoneJob` from `package.json` via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'`. Retires the third copy.

### Tests

#### [NEW] `tests/fixtures/gh/` corpus + fixture-file dispatch layer on the existing PATH-shim `gh` — Task 2

- **Existence Check:** The PATH-shimmed-`gh` idiom is NOT new (`bkit-runtime.bats:44-58`). The genuinely-new piece is fixture-file dispatch (argv → JSON file under `tests/fixtures/gh/`).
- **Corpus (7 + 1):** green capstone at head; capstone absent; failed run; in-progress run; superseded green; PR #720 `total_count 0` (CONFLICTING); cache-skipped green with `cache_skip` sentinel; plus an API-error fixture for code-20 distinction.

#### [NEW] `tests/ship-gate.bats` — Task 4

- Cases: `accepts-green-capstone-at-head` (0), `rejects-failed-run` (12), `rejects-no-run-at-head` (10), `rejects-none-completed` (11), `rejects-stale-green-at-superseded-head` (14), `rejects-run-missing-capstone` (13), `rejects-cancelled-run-at-head` (15), `rejects-run-with-skipped-lanes` (16), `accepts-cache-skipped-green` (0), `distinguishes-api-error-from-no-run` (20 vs 10). Override honoured only on refused head.

#### [NEW] `.bkit/src/bkit-ship-invariants.test.ts` — Task 3

- **Existence Check:** Does not exist. `bkit-counter-prose-audit.test.ts` is the pattern; `stripFencedBlocks` directly reusable.
- Cases (Tier 2, RED against current `bkit-ship.md`): no `git add -A`; no blanket `git add -- docs/`; every `status.jsonl` write via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present; no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows; `.deferred-blocked` writer referenced under `BOOK_ROOT`. **Positive presence:** `BOOK_PATHS` = frozen 8-path allow-list; `BOOK_ROOT` carries `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional resolution (mode-3).

#### [NEW] `.bkit/src/bkit-config-keys.test.ts` — Task 1

- Cases: `bkit.capstoneJob` default `bkit-tests-check`; `bkit.ciWorkflow` default `ci.yml`; `stripManagedKeys` leaves both intact; `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP1 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully (verification + checkbox) before the next in its dependency chain. Tasks 1, 2, 3 all depend only on Task 0 and MAY run in parallel after Task 0. Task 4 depends on Tasks 1 + 2.

Task numbers are the original feature-level IDs (preserved verbatim). Cross-task references keep their original numbers; tasks in sibling sub-plans are noted `(SP2 …)` / `(SP3 …)`.

- [x] **Task 0 — WS-1: #341 Serialisation Carve-Out (GO/NO-GO gate).** Verify #341's ship-touching workstreams have landed and the post-#341 `bkit-ship.md` is the diff base for this plan's rewrite. Confirm no other open PR/branch is rewriting `bkit-ship.md` (repo doctrine: no concurrent bkit workflows on one clone). Fold the three comment corrections into issue body context if not already done by design: (a) non-firing `pull_request` on a CONFLICTING PR is general GitHub behaviour, not a bkit token quirk; (b) `cancel-in-progress` is a second independent justification for the frozen head; (c) Path B2 is the common case, not the escape hatch. Record the serialisation decision in `docs/decisions.jsonl` (key `384-341-serialisation`): which side landed first (#341), and that 384 re-derives against post-#341 state. **Dependencies:** none. **Done when:** `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md` is empty or carries only this FID's commits; `docs/decisions.jsonl` row `384-341-serialisation` exists with `outcome: "341-first-landed"`; current `bkit-ship.md` carries the post-#341 runtime markers — `grep -c 'bkit_runtime_row ship' .bkit/workflows/bkit-ship.md` ≥ 1 (the runtime-resolved-row landed at `:320`) AND `grep -c 'RUNTIME_DEVPUSHES' .bkit/workflows/bkit-ship.md` ≥ 1 — confirms diff base. (Note: ship is the _documented exception_ that does NOT call `bkit_close_guard_checkout` — per `.bkit/workflows.md:114` that helper's EXIT trap would undo staying on `dev` for Steps 10–13; ship asserts the double-guard inline. The kernel _is_ landed for the other phases: `grep -c 'bkit_close_guard_checkout' .bkit/scripts/bkit-runtime.sh` ≥ 1 proves the function exists at `:430`. Asserting the close-guard call in ship's Step 9 is wrong — this Done-when uses the markers that are genuinely present.)

- [x] **Task 1 — WS-3: Configuration Surface (`bkit.capstoneJob`, `bkit.ciWorkflow`, managed config script).** Add `bkit.capstoneJob` (default `bkit-tests-check`) and `bkit.ciWorkflow` (default `ci.yml`) to bkit's own `package.json` as worked example (consumer-tunable; `stripManagedKeys` leaves them intact — verify by reading `bkit-package-json.ts` `stripManagedKeys` source). Create `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical) with `SHIP_CI_WAIT_TIMEOUT_S` (e.g. 1800), `SHIP_POLL_INTERVAL_S` (e.g. 30), `SHIP_DEV_LOCK_STALE_S` (900), `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S` (600), `MAX_MERGE_ATTEMPT` (3) — units in identifiers per `bkit-counter-bus-config.sh` precedent. Modify `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` to read `bkit.capstoneJob` from `package.json` (via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'`) instead of the literal at line 38. Add unit test `.bkit/src/bkit-config-keys.test.ts`. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-config-keys.test.ts` passes (`pnpm test bkit-config-keys`); `bkit-protect-main.sh` grep shows no `REQUIRED_JOB="bkit-tests-check"` literal and instead a `jq` read of `bkit.capstoneJob`; `pnpm test bkit-package-json` still passes (stripManagedKeys leaves new keys intact); `diff .bkit/scripts/bkit-ship-timeouts.sh .bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` is empty AND `diff .bkit/scripts/bkit-protect-main.sh .bkit/templates/.bkit/scripts/bkit-protect-main.sh` is empty (manual byte-identity check — Task 6 is the sole owner of the `bkit-dogfood-noop.integration.test.ts` extension that automates this property; Tasks 1 and 4 satisfy byte-identity independently via `diff` so their checkboxes are runnable before Task 6 lands).

- [x] **Task 2 — WS-2: gh Stub Harness + Fixture Corpus (GO/NO-GO cost hinge, recalibrated).** **Extend the existing PATH-shim `gh` idiom** from `tests/bkit-runtime.bats:44-58` (which writes a fake `gh` to a `FAKE_BIN` temp dir and `chmod +x`s it) **with the genuinely-new piece: fixture-file dispatch.** Build a PATH-shimmed `gh` script under `tests/fixtures/gh/bin/gh` that dispatches on argv (subcommand + flags, e.g. `api /repos/.../runs?head_sha=`) to a fixture JSON file under `tests/fixtures/gh/`. Capture the seven design-mandated fixtures from real `gh` output across bkit + (where available) the two consumer repos: (1) green capstone at head; (2) capstone absent from run; (3) failed run; (4) in-progress run; (5) superseded green; (6) PR #720 `total_count 0` (CONFLICTING — no `refs/pull/<n>/merge`); (7) cache-skipped green with `cache_skip` sentinel. Add an API-error fixture for code-20 distinction. **Fixture fallback (review-3 m3):** if PR #720 is unavailable (closed/deleted) by implementation time, capture the equivalent `total_count 0` shape from any CONFLICTING PR with zero runs, or commit a synthetic JSON matching PR #720's observed fields. Wire `pnpm test:bats` into `.husky/pre-push` after the existing `pnpm bkit check` line. **GO/NO-GO (plan-halting, not a Task-2-only skip — review-3 m5):** if this task cannot be settled in roughly half a day (8 agent turns), the Tier-1 carrier is more expensive than assumed — STOP, append `docs/deferrals.jsonl` row (`key: 384-gh-stub-cost-hinge`), and surface to orchestrator for explicit tiering revisit. Because the PATH-shim wrapper reuses an existing idiom (`bkit-runtime.bats`) and only the dispatch layer is new, this hinge is **cheaper than originally claimed** (Risk-12 recalibrated per review-1 M1) — but a NO-GO still removes SC 1's primary carrier (Tier-1 merge gate), leaving SC 1 resting on Tier-2 prose invariants alone, which the design says is insufficient (Risk 9). NO-GO therefore halts the whole plan, not Tasks 3–11. **Dependencies:** Task 0. **Done when:** `tests/fixtures/gh/bin/gh` exists and is executable (reusing the `bkit-runtime.bats` `FAKE_BIN`/`chmod +x` pattern); seven fixture JSON files exist under `tests/fixtures/gh/`; a smoke bats case at `tests/fixtures/gh/smoke.bats` (scope-check-1 MINOR-4: file ownership fixed — the smoke case belongs in `tests/fixtures/gh/smoke.bats` here in Task 2; `tests/ship-gate.bats` is created solely by Task 4) verifies the stub dispatches each fixture; `.husky/pre-push` contains `pnpm test:bats` line; `pnpm test:bats` exits 0 on `tests/fixtures/gh/smoke.bats`.

- [x] **Task 3 — WS-6: Bookkeeping Contract + Tier-2 Invariant Test (RED test, lands BEFORE prose rewrite).** Write `.bkit/src/bkit-ship-invariants.test.ts` asserting against the _current_ `bkit-ship.md` (which still has the head-mutating model). Reuse `stripFencedBlocks` from `bkit-counter-prose-audit.test.ts`. Cases must FAIL on current prose and PASS on rewritten prose: no `git add -A`; no blanket `git add -- docs/`; every `status.jsonl` write resolves via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present and unchanged (publish the set in the test as the source of truth the rewrite must match); no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows (release row + re-acquire row present); `.deferred-blocked` writer referenced under `BOOK_ROOT`. **Positive presence assertions (review-3 M1 + M2):** (a) assert `BOOK_PATHS` is defined exactly as the frozen 8-path allow-list — `docs/plans/{YYYYMM}/logs/{FID}/`, `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json` (cite the design block verbatim; publish the list in the test) — and that every `git add` in `bkit-ship.md` resolves via `BOOK_PATHS`; (b) assert `bkit-ship.md` carries the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional `BOOK_ROOT` resolution text (presence check: dev tree when true, adopt/current-working-branch tree when false — mode 3) so the mode-3 path is mechanically asserted, not prose-only. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS on current `bkit-ship.md` (verifying the test is genuinely RED — proves it would catch a half-applied rewrite); the canonical 14 step-key set is published in the test file as a frozen list; the frozen 8-path `BOOK_PATHS` allow-list is published in the test file as a frozen list.

- [x] **Task 4 — WS-4: `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier, MUST land before prose rewrite).** Create `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical). Contract: `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`. Run selection per design: query `gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped), select most recent `completed` run; if runs exist but none completed → exit 11 (in progress, not absent). Read capstone presence + conclusion from `/actions/runs/{id}/jobs --paginate`. Implement one exit code per condition (0/10/11/12/13/14/15/16/20). Distinguish `skipped` lane (code 16) from `cache_skip` sentinel green (code 0 + `--explain` note). Every diagnostic on stderr behind `[bkit-ship-gate]`; every refusal prints required head + head actually tested + run URL. Sample `gh api rate_limit` for code-20 message. Honour `BKIT_SHIP_GATE_OVERRIDE=<sha>` only when equals refused head; gate itself appends override `status.jsonl` row. Create `tests/ship-gate.bats` with the 10 named cases. **Dependencies:** Task 1 (config keys), Task 2 (stub harness). **Done when:** `pnpm test:bats tests/ship-gate.bats` passes all 10 cases against the captured fixtures (proves fixtures map to exit codes BEFORE any prose is touched); `bkit-ship-gate.sh --explain` is invocable and exits 0/10/11/12/13/14/15/16/20 deterministically per fixture; `diff .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` is empty (manual byte-identity check — Task 6 is the sole owner of the `bkit-dogfood-noop.integration.test.ts` extension that automates this property; Tasks 1 and 4 satisfy byte-identity independently via `diff` so their checkboxes are runnable before Task 6 lands).

### 🔒 SP1 Gate: Foundations + Tested Tier-1 Gate

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, hand off to Sub-plan 2 (`384-ship-bookkeeping-plan-2.md`).

- [x] **No bolt-on / no gate-weakening:** `bkit-ship-gate.sh` is a new artifact justified against the existing 9 helper scripts (8 `.sh` + 1 `.mjs`; same class — load-bearing rule extracted from prose — last uncovered). `bkit-ship-timeouts.sh` is justified against the `bkit-counter-bus-config.sh` precedent. The `tests/fixtures/gh/` harness **extends the existing PATH-shim `gh` idiom in `tests/bkit-runtime.bats:44-58`** (the `FAKE_BIN`/`chmod +x` pattern) and adds the genuinely-new fixture-file dispatch layer on top — not "first-of-its-kind" (review-1 M1 correction). No `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make any gate pass.
- [x] **Tier-1 carrier proven before any prose touched:** `pnpm test:bats tests/ship-gate.bats` passes all 10 cases; `bkit-ship-gate.sh --explain` deterministic per fixture.
- [x] **Tier-2 invariant RED:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS against current `bkit-ship.md` (proves it would catch a half-applied rewrite — Sub-plan 2 turns it GREEN).
- [x] **Byte-identity (manual `diff`, pre-Task-6):** root ↔ template pairs empty for `bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`, `bkit-protect-main.sh`.
- [x] **Config home correct:** `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json` (survive `stripManagedKeys`); `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.
- [x] **Pre-push wired:** `.husky/pre-push` contains `pnpm test:bats`.
- [x] **SP1 - Verified:** Every checkbox above independently verified. Tasks 0–4 all `[x]`.

## Verification Plan (SP1)

### Automated Tests

- [x] **bats suite (this slice):** `pnpm test:bats tests/fixtures/gh/smoke.bats` and `pnpm test:bats tests/ship-gate.bats` pass. Uses PATH-shimmed `gh` stub against real JSON fixtures (no mocking of the boundary under test). Fixtures committed read-only; no real PAT in fixtures.
- [x] **Unit suite (this slice):** `pnpm test bkit-config-keys` passes; `.bkit/src/bkit-ship-invariants.test.ts` exists and is RED against current `bkit-ship.md` (expected — GREEN comes in SP2 Task 7). `pnpm test bkit-package-json` still passes.
- [x] **Gate suite (no regression):** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm bkit check` green (invariant test being RED is the exception — it ships RED deliberately; `pnpm test` overall may be RED solely on `bkit-ship-invariants.test.ts`; if so, that is expected and does not block SP1 hand-off).
- [x] **Build Configuration:** No `tsconfig.json` exclusion needed — new files are `.test.ts` (vitest) or `.bats`/`.sh` (not type-checked).

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Hand-off to Sub-plan 2

This sub-plan's outputs are **Seam 1** for Sub-plan 2 (`384-ship-bookkeeping-plan-2.md`):

- Tested `bkit-ship-gate.sh` + `tests/ship-gate.bats` (10 cases GREEN) — Sub-plan 2 Task 5/6/7 depend on it.
- `BOOK_ROOT`/`BOOK_PATHS` contract published in `.bkit/src/bkit-ship-invariants.test.ts` (RED) — Sub-plan 2 Task 5 reads it; Task 7 turns it GREEN.
- `bkit.capstoneJob` / `bkit.ciWorkflow` config keys + `bkit-ship-timeouts.sh` — Sub-plan 2 Task 7 sources the timeouts.

Sub-plan 2's first action re-verifies these landed before proceeding.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).

### 384-ship-bookkeeping-plan-2.md

Verdict: PASS
<!-- verdict:end -->

# Sub-Plan 2 — Hardening, Prose Rewrite & Mirrors (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/384-ship-bookkeeping-plan.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 2 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below. Full Acceptance Scenario / Success Criteria / Breaking Changes / Open Questions / Out-of-Scope / Rollback live in `plan-v3-checked.md` (inherited as confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan hardens the Failure Path and Step 12 underneath the rewrite, mirrors the gate into both homes (dogfood), rewrites `bkit-ship.md` to the verify → base-check → integrate → re-validate → merge gate → merge → close shape (turning the Tier-2 invariant test GREEN), and regenerates the rendered mirrors + `workflows.md` step table. It ends with: **new ship workflow live across all mirrors + Tier-2 invariant GREEN.**

The rewrite is the spine of the change — findings dissolve structurally rather than each needing a conditional. The RED→GREEN Tier-2 invariant (from Sub-plan 1, Task 3) is the central quality mechanism: a half-applied rewrite carrying both the head-mutating and frozen-head model is worse than either, and the red test is the only thing that makes it visible. This sub-plan is the **sole session** that turns the invariant GREEN, which is exactly why it is split out from the other 11 tasks.

**Tasks in this sub-plan:** 5, 6, 7, 8 (original IDs preserved; cross-task references keep original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

### Ship's shape (the rewrite target)

```
1  start          -> resolve BOOK_ROOT + BOOK_PATHS once; create outbox; record them
                     (dev lock taken only around the dev-tree write, then released)
2  verify PR      -> read PR head SHA (ENTRY_HEAD), mergeable state; NO local rebase
3  base check     -> git merge-base --is-ancestor origin/dev origin/feat/{FID}
                       ancestor      -> Path A  -> step 6
                       not ancestor  -> Path B  -> step 4
4  integrate      -> B1 mergeable:    gh pr update-branch
                     B2 conflicting:  worktree + @bkit-ship-conflict-resolve + push --force-with-lease
                     non-mechanical:  handover
5  re-validate    -> IF current head != ENTRY_HEAD: unconditional gh workflow run, then bounded poll
                     (no dev lock held across the wait — writes go to the outbox)
6  merge gate     -> bkit-ship-gate.sh assert <current head>   (the ONLY merge precondition)
6b merge          -> gh pr merge --squash --match-head-commit <gate head>. No update-branch here.
7+ close          -> docs, summary, re-acquire dev lock, flush outbox,
                     one path-scoped [skip ci] commit + push, release lock
```

**Three deletions ride along** (each exists only to compensate for the incompatibility being removed): ship's unconditional rebase-on-resume (four other phases keep theirs — none gate on head match); Step 3's prior-run diffing; Step 8's `Update: Source files.` retry loop (code-level failures route back to build).

### `BOOK_ROOT` resolution (load-bearing rule that unblocks 384 from #341)

`BOOK_ROOT` resolution MUST spell out the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES` conditional explicitly in Step 1 (review-1 m4):

- `RUNTIME_DEVPUSHES=true` (worktree present, modes 1–2) → `BOOK_ROOT=$REPO_ROOT` (dev tree).
- `RUNTIME_DEVPUSHES=false` (mode 3, cloud) → `BOOK_ROOT` = current working branch / adopt tree, bookkeeping lands with the phase-close PR per #341 shape A.

Must be an explicit bullet in Step 1's prose, not only in the Edge Cases appendix (Sub-plan 1 Task 3's Tier-2 presence check asserts it mechanically). The live mode-3 E2E is deferred (Sub-plan 3, Task 11).

### Re-validation keyed on observed head movement

Trigger: current PR head differs from `ENTRY_HEAD` — an observed fact, not a path label (also covers head moves ship did not cause). Dispatch is **unconditional** `gh workflow run` after any head move (CONFLICTING PRs fire nothing by construction — PR #720 `total_count 0`; buried `[skip ci]` poisons push-triggered dispatch identically). Poll bounded by **attempt cap AND elapsed cap**, `timeout`-wrapped, jittered backoff; **timeouts sourced from `bkit-ship-timeouts.sh` (`SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `MAX_MERGE_ATTEMPT`) — NOT re-hardcoded as bare numeric literals** (review-3 m2: prevents a third source of truth drifting). Sample `gh api rate_limit` before loop; write status row before exiting on either cap.

### Merge gate + `--match-head-commit`

Step 6 writes pre-merge snapshot (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) to outbox BEFORE merge fires; calls `bkit-ship-gate.sh assert --head <current>`; branches on exit code with a `status.jsonl` row per refusal. Step 6b `gh pr merge --squash --match-head-commit <gate head>` and nothing else — no `update-branch` here; a rejected `--match-head-commit` routes back to re-validation. The assertion and the merge are one decision; `--match-head-commit` makes SC 1 mechanically true (server refuses the merge when the head moved, atomically, inside the merge call).

### Outbox + dev-lock windowing

Outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/` (outside every worktree; survives Step 12 `worktree remove`). The dev lock covers dev-tree write windows only (Step 1 start row + Step 13 flush); released across the CI wait. Steps 7+ re-acquire dev lock, flush outbox, one **path-scoped `[skip ci]` commit + push** to dev, release lock. Release + re-acquire emit status rows; handover on failed re-acquire (never silent unlocked flush).

### Failure Path + `.deferred-blocked` + Step 12 ownership (Task 5)

1. **Write the sentinel** — `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` (reader `:114` + `rm -f` `:67` already exist; only the writer is missing). Without it Failure Path step 4's condition can never be true — a sweep FAIL falls through to a bare STOP.
2. **One tree** — Failure Path reads `BOOK_ROOT` like every other step (not `--git-common-dir`).
3. **Order the append after the abort** — today `:61` appends, `:62` aborts (mid-rebase abort discards the append).
4. **Drop silent-failure idiom** — `git rebase --abort 2>/dev/null || true` + six `2>/dev/null || true` git calls at `:79-82`; sweep every close/failure route that depended on a silenced call being non-fatal.
5. **Step 12 ownership** — scope `worktree remove --force` to worktrees this run created; ownership bit written at creation time to outbox AND `status.jsonl` row; absent-default = "not mine". Leave design/plan/build/debug worktree conventions untouched.

### Distribution: the gate script is two files (Task 6)

`.bkit/scripts` is excluded from the npm `files` list — consumers receive scripts from `.bkit/templates/.bkit/scripts/`; the root copy is the dogfood mirror. `bkit-ship-gate.sh` + `bkit-ship-timeouts.sh` are byte-identical pairs, enforced by the templates-content snapshot + `bkit-dogfood-noop.integration.test.ts`. `bkit check` reports a partially-applied upgrade. **Task 6 is the SOLE owner of the `bkit-dogfood-noop.integration.test.ts` extension** (Tasks 1+4 from Sub-plan 1 satisfy byte-identity via manual `diff`; Task 6 automates the property for both new scripts).

---

## Predecessor Verification (Seam 1 — before Task 5 starts)

> [!CAUTION]
> **Re-verify Sub-plan 1's outputs landed.** Do NOT assume. If any check fails, Sub-plan 1 is incomplete — halt and surface to orchestrator (do not proceed into the rewrite on an unproven gate).

- [x] **Tested gate present:** `.bkit/scripts/bkit-ship-gate.sh` AND `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` exist; `pnpm test:bats tests/ship-gate.bats` passes all 10 cases (Sub-plan 1 Task 4).
- [x] **Tier-2 invariant RED:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS against current `bkit-ship.md` (Sub-plan 1 Task 3) — canonical 14 step-key set + frozen 8-path `BOOK_PATHS` published in the test.
- [x] **Config present:** `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json`; `.bkit/scripts/bkit-ship-timeouts.sh` exists (Sub-plan 1 Task 1).
- [x] **Stub harness present:** `tests/fixtures/gh/bin/gh` executable; fixture corpus present (Sub-plan 1 Task 2).

---

## Architecture & Component Changes (this slice)

### Workflow prose

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (structural rewrite) — Task 7

- **Existence Check:** Exists; 1278 lines, post-#341 (review-3 m4).
- **Change:** Rewrite to verify → base-check → integrate → re-validate → merge gate → merge → close shape (full detail in the Design Slice above). **Tier-2 invariant test is RED before this task starts and GREEN after it.**

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Failure Path block — Task 5

- **Existence Check:** lines 56–139.
- **Change:** Add `.deferred-blocked` writer on `@bkit-ship-deferred-sweep` FAIL. Read `BOOK_ROOT` (not `--git-common-dir`). Order `git rebase --abort` before status append. Remove six `2>/dev/null || true` silencings; sweep close/failure routes that depended on a non-fatal silenced call.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Step 12 block — Task 5

- Scope `worktree remove --force` to worktrees this run created; ownership bit in outbox + status row; absent-default = "not mine".

#### [MODIFY] `.bkit/workflows.md` — Task 8

- **Existence Check:** 1288 lines.
- **Change:** Step table for ship re-sectioned. `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. Add Tier-1/Tier-2/Tier-3 carrier explanation + `BOOK_ROOT`/`BOOK_PATHS`/outbox to the ship subsection.

### Rendered mirrors (Task 8 — regeneration only, via `bkit install`)

> [!NOTE]
> **"Rendered" ≠ "byte-identical to source".** The source `.bkit/workflows/bkit-ship.md` carries `<!-- bkit:tracker {github,linear,true} start/end -->` template markers for **all** trackers; `bkit install` resolves these to the configured tracker (github in the dogfood repo) and strips the markers during render. The literal source↔mirror `diff` is therefore **non-empty by construction** (1288-line source → ~1100-line rendered mirror). The authoritative drift check is `bkit check` (no `bkit-rendered-prompts-stale` advisory) + `bkit install` reporting 0 writes (idempotent render). "Byte-identical" applies only to (a) the script root↔template pairs (Task 6) and (b) the templates-content snapshot enforcing rendered↔rendered idempotency.

- `.claude/commands/bkit-ship.md` (tracker-resolved only — no T1/T2/T3 transform)
- `.cursor/commands/bkit-ship.md` (tracker-resolved + T1/T2/T3 transformed)
- `.opencode/commands/bkit-ship.md` (tracker-resolved)
- Templates-content snapshot (enforces byte-identical dogfood mirror — rendered↔rendered idempotency)

### Tests (this slice)

- `bkit-dogfood-noop.integration.test.ts` extended for both new scripts (`bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`) — **Task 6 sole owner** (scope-check-1 MAJOR-1).
- `tests/ship-failure-path.bats` (Task 5, sub-concern I) + `tests/ship-worktree-ownership.bats` (Task 5, sub-concern II).

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP2 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully before the next in its dependency chain. Task 5 + Task 6 both depend on Sub-plan 1 outputs and MAY run in parallel; Task 7 depends on Tasks 4 (SP1), 5, 3 (SP1); Task 8 depends on Tasks 7 + 5.

- [x] **Task 5 — WS-8: Failure Path + Worktree Hardening (lands before prose rewrite).** _(Scope-check-1 MINOR-1: this task bundles two distinct hardening areas of `bkit-ship.md` — (I) Failure Path and (II) Step 12 worktree ownership — both grouped under design WS-8 as "ship hardening underneath the rewrite"; each produces its own bats file so neither sub-concern is lost. Delineation below is explicit.)_ **(I) Failure Path** — three fixes in the current `bkit-ship.md` Failure Path block: (a) add `.deferred-blocked` writer — `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` (reader at `:114` and `rm -f` at `:67` already exist); (b) make Failure Path read `BOOK_ROOT` like every other step rather than resolving `--git-common-dir`; (c) order the status append AFTER `git rebase --abort`, not before. Remove the silencing idiom — the silenced `rebase --abort` plus six `2>/dev/null || true` git calls at `:79-82`. Sweep every close and failure route that may have depended on one of those calls being non-fatal. **(II) Step 12 worktree ownership** — scope Step 12's `worktree remove --force` to worktrees this run created — ownership bit written at creation time to outbox AND `status.jsonl` row, absent-default = "not mine". Explicitly leave design/plan/build/debug worktree conventions untouched. Add `tests/ship-failure-path.bats` (sub-concern I) + `tests/ship-worktree-ownership.bats` (sub-concern II). **Dependencies:** Task 4 (gate, per design ordering), Task 3 (BOOK_ROOT contract — the name published by the WS-6 invariant test, available before the prose rewrite in Task 7). Per design `WS-8 → [WS-4, WS-6]` = Task 4 + Task 3 (review-2 M1: the prior "Task 6 contract" label pointed at WS-5 Gate Distribution, which is unrelated to `BOOK_ROOT`). **Done when:** `pnpm test:bats tests/ship-failure-path.bats` passes (append ordered after abort; BOOK_ROOT honoured; no silencing); `pnpm test:bats tests/ship-worktree-ownership.bats` passes (ownership bit absent → no removal; present → removal fires; bit survives simulated crash); `grep -c '2>/dev/null || true' .bkit/workflows/bkit-ship.md` is reduced from baseline by at least 6 (the six identified silencings removed); `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep` prompt description in `.bkit/workflows.md`.

- [x] **Task 6 — WS-5: Gate Distribution / Dogfood Mirroring.** Confirm `bkit install` / `bkit upgrade` place `bkit-ship-gate.sh` and `bkit-ship-timeouts.sh` in both homes (`.bkit/scripts/` root copy + `.bkit/templates/.bkit/scripts/` template copy), that the executable bit survives templating, and that `bkit check` reports a partially-applied upgrade (delete one of the pair, run `bkit check`, expect drift). Enforce byte-identity via the templates-content snapshot and `bkit-dogfood-noop.integration.test.ts` — **Task 6 is the SOLE owner of the `bkit-dogfood-noop.integration.test.ts` extension** (scope-check-1 MAJOR-1: Tasks 1 and 4 now satisfy their byte-identity Done-when via manual `diff` so their checkboxes are runnable before Task 6 lands; Task 6 is what automates the property into the integration test for both new scripts). **Dependencies:** Task 1, Task 4. **Done when:** `pnpm test bkit-dogfood-noop` passes for both new scripts; manual `bkit check` after deleting `.bkit/scripts/bkit-ship-gate.sh` reports drift; `ls -l .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` shows both executable; `diff` between the pair is empty.

- [x] **Task 7 — WS-7: `bkit-ship.md` Structural Rewrite (Tier-2 invariant test turns GREEN).** Rewrite `.bkit/workflows/bkit-ship.md` to the design's shape: Step 1 resolves `BOOK_ROOT` + `BOOK_PATHS`, creates outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/`, writes `ship-start-workflow` row to `BOOK_ROOT`, preflights `actions: write` once. **`BOOK_ROOT` resolution MUST spell out the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES` conditional explicitly in Step 1 (review-1 m4):** `RUNTIME_DEVPUSHES=true` (worktree present, modes 1–2) → `BOOK_ROOT=$REPO_ROOT` (dev tree); `RUNTIME_DEVPUSHES=false` (mode 3, cloud) → `BOOK_ROOT` = current working branch / adopt tree, bookkeeping lands with the phase-close PR per #341 shape A. This is the load-bearing rule that unblocks 384 from #341; it must be an explicit bullet in Step 1's prose, not only in the Edge Cases appendix (Task 3's Tier-2 presence check asserts it mechanically). Steps 2–3 read `ENTRY_HEAD` + `mergeable`, classify via `git merge-base --is-ancestor origin/dev origin/feat/{FID}` — Path A → Step 6; Path B → Step 4. Step 4 Path B only: B1 `gh pr update-branch`; B2 worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`; non-mechanical → handover. Step 5 re-validates on observed head movement (current head != `ENTRY_HEAD`, not path label): unconditional `gh workflow run ci.yml --ref feat/{FID}`, bounded poll under attempt cap AND elapsed cap **sourced from `bkit-ship-timeouts.sh` (`SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `MAX_MERGE_ATTEMPT`) — NOT re-hardcoded as bare numeric literals** (review-3 m2: prevents a third source of truth drifting), `timeout`-wrapped, jittered backoff, sample `gh api rate_limit` before loop, write status row before exiting on either cap. Step 6 writes pre-merge snapshot (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) to outbox BEFORE merge fires, calls `bkit-ship-gate.sh assert --head <current>`, branches on exit code with a `status.jsonl` row per refusal carrying that code. Step 6b `gh pr merge --squash --match-head-commit <gate head>` and nothing else — no `update-branch` here; a rejected `--match-head-commit` routes back to re-validation. Steps 7+ re-acquire dev lock, flush outbox, one path-scoped `[skip ci]` commit + push to dev, release lock. Implement dev-lock windowing with status rows on release + re-acquire; handover on failed re-acquire (never silent unlocked flush). Carry the three deletions (rebase-on-resume, Step 3 prior-run diffing, Step 8 `Update: Source files.` with code-level failures routing back to build). **Preserve Task 5's Failure Path block intact (review-2 MINOR 4):** the rewrite consumes the `.deferred-blocked` writer under `BOOK_ROOT`, abort-before-append ordering, removed silencings, and Step 12 ownership scoping from Task 5 — keep that block; Task 3's Tier-2 invariant test asserts these properties and will go RED if dropped, but state it explicitly so a from-scratch rewrite does not waste a cycle rediscovering Task 5's fixes. **Dependencies:** Task 4 (gate proven), Task 5 (Failure Path hardened underneath), Task 3 (Tier-2 invariant test RED, turns GREEN). **Done when:** `.bkit/src/bkit-ship-invariants.test.ts` turns GREEN against the rewritten `bkit-ship.md` (Tier-2 invariants hold, including the positive `BOOK_PATHS` 8-path presence + `CAN_PUSH_DEV`-conditional `BOOK_ROOT` presence); `grep -c 'git add -A' .bkit/workflows/bkit-ship.md` = 0; every `gh pr merge` line carries `--match-head-commit`; dev-lock release + re-acquire status rows present; the rewritten shape matches verify → base-check → integrate → re-validate → merge gate → merge → close; no bare numeric timeout literal outside the `SHIP_*` sourcing line; `BOOK_ROOT` referenced at every status write site; canonical 14 `ship-*` step keys present (set published in Task 3's test); `pnpm slop:delta` stays green (no net-new prose findings); `pnpm lint:prose` stays green.

- [x] **Task 8 — WS-9: Rendered Mirrors + Workflow Index Regeneration.** Regenerate all derived surfaces in one pass via `bkit install`: `.claude/commands/bkit-ship.md` (tracker-resolved only), `.cursor/commands/bkit-ship.md` (tracker-resolved + T1/T2/T3 transformed), `.opencode/commands/bkit-ship.md` (tracker-resolved), templates-content snapshot. Re-section `.bkit/workflows.md`'s ship step table; ensure the `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. **Preserve Task 5's `.deferred-blocked` writer wire-in** (scope-check-1 MINOR-2: Task 5 wires the writer into the `@bkit-ship-deferred-sweep` prompt; Task 8 re-sections the step table — sequential additive edits to non-overlapping sections of the same file; Task 8's re-section MUST NOT drop Task 5's prompt edit, mirroring the pattern Task 7 uses for Task 5's Failure Path block at review-2 MINOR 4). Confirm `<!-- bkit:managed vX.Y.Z -->` markers are restamped. **Dependencies:** Task 7, Task 5. **Done when:** `bkit install` exits 0 with 0 writes (idempotent render); `bkit check` reports no `bkit-rendered-prompts-stale` drift — this is the authoritative mirror-drift check (the literal source↔mirror `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` is **non-empty by construction** because the source carries all-tracker `<!-- bkit:tracker ... -->` template markers resolved to the configured tracker during render, so a raw `diff` is not a valid Done-when); `.bkit/workflows.md` ship section reflects new step numbers and references `.deferred-blocked` writer.

### 🔒 SP2 Gate: Hardened Rewrite + Drift-Free Rendered Mirrors

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, hand off to Sub-plan 3 (`384-ship-bookkeeping-plan-3.md`).

- [x] **No bolt-on / no gate-weakening:** rewrite preserves Task 5's hardening (review-2 MINOR 4); no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass. No regression in the Tier-1 carrier (`tests/ship-gate.bats` still GREEN).
- [x] **Tier-2 invariant GREEN:** `.bkit/src/bkit-ship-invariants.test.ts` PASSES against rewritten `bkit-ship.md` — the RED→GREEN transition proves the rewrite is complete, not half-applied (central quality mechanism).
- [x] **Hardening landed:** `tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats` GREEN; `.deferred-blocked` writer wired; six silencings removed; Step 12 ownership-scoped.
- [x] **Dogfood mirroring:** `pnpm test bkit-dogfood-noop` GREEN for both new scripts (Task 6 sole owner); `bkit check` reports drift on partial deletion.
- [x] **Mirrors correctly rendered (no drift):** the literal source↔mirror `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` is **non-empty by construction** (the source carries all-tracker `<!-- bkit:tracker ... -->` template markers that are resolved to the configured tracker during `bkit install`), so the authoritative drift check is `bkit check` reporting no `bkit-rendered-prompts-stale` advisory AND `bkit install` reporting 0 writes (idempotent render). "Byte-identical" applies to the script root↔template pairs (Task 6) and the templates-content snapshot, NOT to source↔mirror.
- [x] **SP2 - Verified:** Every checkbox above independently verified. Tasks 5–8 all `[x]`.

## Verification Plan (SP2)

### Automated Tests

- [x] **bats suite (this slice):** `pnpm test:bats tests/ship-failure-path.bats tests/ship-worktree-ownership.bats` pass; `tests/ship-gate.bats` still GREEN (no Tier-1 regression). _(verify-2-1: bats 140/140 GREEN — ship-failure-path 6/6, ship-worktree-ownership 6/6, ship-gate 16/16.)_
- [x] **Unit suite (this slice):** `.bkit/src/bkit-ship-invariants.test.ts` GREEN against rewritten `bkit-ship.md` (the RED→GREEN proof). _(verify-2-1: 14/14 GREEN.)_
- [x] **Integration:** `pnpm test bkit-dogfood-noop` GREEN for both new scripts. _(verify-2-1: 7/7 GREEN — gate + timeouts byte-identity + executable bit.)_
- [x] **Full gate suite:** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test:bats && pnpm bkit check` all green. Do NOT weaken any gate to pass. _(verify-2-1: typecheck clean; vitest 2616 passed / 2 skipped / 1 todo; format:check all pass; lint:prose 0 errors / 1 warning; slop:delta 0 net-new; bats 140/140; bkit check exit 0.)_
- [x] **Test Synchronization:** `bkit-counter-prose-audit.test.ts` updated for any new ship step-key references (verify cross-check still passes); `bkit-ci-dispatch-gate-alignment.test.ts` unaffected (CI-Dispatch gate is build/debug; ship uses the new gate). _(verify-2-1: counter-prose-audit + ci-dispatch-gate-alignment + skip-ci-subject-audit 178/178 GREEN.)_

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Hand-off to Sub-plan 3

This sub-plan's outputs are **Seam 2** for Sub-plan 3 (`384-ship-bookkeeping-plan-3.md`):

- Rewritten `bkit-ship.md` (Tier-2 invariant GREEN) — Sub-plan 3 Task 10 parses it for the detector's expected set.
- Byte-identical mirrors + re-sectioned `workflows.md` — Sub-plan 3 Task 9 references the final workflow shape in docs.
- Hardened Failure Path + `.deferred-blocked` writer — Sub-plan 3 Task 11 E2E validates the deferred-sweep FAIL → handover route.

Sub-plan 3's first action re-verifies these landed before proceeding.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).

### 384-ship-bookkeeping-plan-3.md

Verdict: PASS
<!-- verdict:end -->

# Sub-Plan 3 — Docs, Tier-3 Detector & E2E (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/384-ship-bookkeeping-plan.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 3 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below. Full Acceptance Scenario / Success Criteria / Breaking Changes / Open Questions / Out-of-Scope / Rollback live in `plan-v3-checked.md` (inherited as confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan publishes the contracts and documentation the gate depends on, ships the Tier-3 advisory status-hole detector, and performs the consumer-repo E2E validation + rollout. It ends with: **published docs + decisions ledger, advisory detector shipped, and a consumer-repo E2E run.** Nothing in Tiers 1–3 proves a run honoured the contract — only an end-to-end ship does (Risk 13), which makes Task 11's manual validation the feature's terminal evidence.

**Tasks in this sub-plan:** 9, 10, 11 (original IDs preserved; cross-task references keep original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

### The `run_level` contract — what the gate can prove, and what it publishes

The single capstone assertion is only load-bearing while `pull_request ⇒ run_level=full` holds. Answered two ways:

1. **The gate asserts what the payload carries** — a lane job that concluded `skipped` means the plan was not full → refuse (code 16). The SHA-cache short-circuit (`cache_skip` sentinel) is keyed to the exact commit SHA → must pass.
2. **The rest is a published consumer contract** — `docs/deployments.md` states: `pull_request` resolves to `run_level=full`; a consumer that narrows via `paths-ignore` / docs short-circuit has opted out of the merge-gate guarantee. A skipped-lane refusal is the detector for the common form of the violation; a degraded-but-not-skipped run is named as a residual risk rather than claimed as covered.

### Status-hole detector (Tier 3, advisory, fail-open)

Fold each `status.jsonl`, diff the observed step set against the expected set, flag holes. Two properties:

- **Derive the expected set from `bkit-ship.md`** by parsing `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — NEVER a hand-maintained table (a parallel table is a second source of truth; Finding 7 is that drift signature; the cheapest resolution under a table — edit the table to match observed reality — is also the wrong one).
- **Report a delta against a pinned watermark** as `bkit slop:delta` already does; emit through the fail-open advisory channel for one release before promoting to a gate. Corpus is 25–65% holey; a day-one aggregate gate emits hundreds of findings and is muted within a week.

Expectations are path-conditional (Path A skips integration + re-validation; MERGED-on-entry resume skips the middle; aborted run stops at the Failure Path). Promotion criteria (advisory → gate): "one release of fail-open signal without muting" — recorded in `docs/decisions.jsonl`.

### Observability contract

- **One stderr prefix** — `[bkit-ship-gate]` (brackets load-bearing for consumer log-drain grep; new script = new module = doc's bar met), registered in `docs/observability.md`.
- **Every terminal route writes a row** — gate refusals, poll-cap exhaustion, lock re-acquire failure, Failure Path (asserted in prose, enforced by Sub-plan 2 Task 7).
- **Consumer rollback path** — pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows written in the interim.

### CI-config reasoning chain (must be recorded, not re-derived)

The chain from `ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion is strictly stronger than all of Step 3" exists only in the issue/design thread. Lose it and the next maintainer either hardens the gate back into Step 3 or softens it to `statusCheckRollup` — both regressions, both reached by good-faith reasoning. Record in `docs/decisions.jsonl` with discarded alternatives named.

### E2E validation (Risk 13, Risk 11)

- bkit's own repo cannot dogfood (0 sweeps across 21 log dirs; 2 ship rows are fixtures). Verification depends on consumer-repo runs.
- **Mode-3 gap:** both validated paths are local-mode (`RUNTIME_DEVPUSHES=true`); mode-3 `BOOK_ROOT` live-verification is NOT exercised here — its prose contract is mechanically asserted by Sub-plan 1 Task 3's Tier-2 presence check; its live E2E is deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`).

### Five pre-existing #384 deferral keys (review-1 M2 — check before append)

`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`, `384-promote-status-hole-detector-from-advisory-to-gate`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`, `384-ship-redesign-sequence-after-341` — five OPEN rows already exist; `grep` each before appending the Out-of-Scope mirror and skip duplicates (`.bkit/jsonl.md` dedup tuples).

---

## Predecessor Verification (Seam 2 — before Task 9 starts)

> [!CAUTION]
> **Re-verify Sub-plan 2's outputs landed.** Do NOT assume. If any check fails, Sub-plan 2 is incomplete — halt and surface to orchestrator (do not publish docs against a moving workflow shape).

- [x] **Rewrite live + invariant GREEN:** `.bkit/src/bkit-ship-invariants.test.ts` PASSES against rewritten `bkit-ship.md` (14/14 GREEN); rewritten shape is verify → base-check → integrate → re-validate → merge gate → merge → close.
- [x] **Mirrors byte-identical:** `bkit check` exits 0 (no `bkit-rendered-prompts-stale` drift; source↔mirror diff is non-empty by construction per KN `rendered-mirror-diff-nonempty-by-construction-tracker-resolution`); `.bkit/workflows.md` ship section reflects new shape (`BOOK_ROOT`/`BOOK_PATHS`, Path A/B base check, merge gate `bkit-ship-gate.sh assert`, bookkeeping off branch).
- [x] **Hardening live:** `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep`; `tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats` GREEN.
- [x] **Tier-1 carrier intact:** `tests/ship-gate.bats` GREEN (16 cases).

---

## Architecture & Component Changes (this slice)

### Docs (Task 9)

- `docs/observability.md` — register `[bkit-ship-gate]` in prefix list (brackets load-bearing; new script = new module).
- `docs/deployments.md` — consumer CI contract: `pull_request ⇒ run_level=full`; narrowing via `paths-ignore` / docs short-circuit = opt-out of merge-gate guarantee; name present-but-degraded run as residual. Plus consumer rollback path.
- `docs/decisions.jsonl` — CI-config reasoning chain (key `384-ci-capstone-chain`); Tier-3 advisory→gate promotion criteria (key `384-tier3-promotion`).
- `docs/deferrals.jsonl` — mirror Out-of-Scope table (check the five pre-existing #384 keys first; skip duplicates); plus `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (Task 11 records it).
- `docs/knowledge.jsonl` — gotchas surfaced during implementation.
- `docs/testing.md` — new bats external-command stub harness (`tests/fixtures/gh/` + PATH shim) as a reusable pattern; Tier-3 fail-open advisory channel.

### Detector (Task 10)

- `.bkit/src/bkit-status-hole-detector.ts` (new) + `.bkit/src/bkit-status-hole-detector.test.ts` (new) + a `bkit` CLI subcommand (`bkit ship:audit` or wired into existing `bkit slop:delta` channel). Derives expected `ship-*` step set from `bkit-ship.md` (parses `## … Step N — Name` headings + `step:"ship-…"` literals); path-conditional sets; delta against pinned watermark; fail-open advisory.

### E2E (Task 11 — manual)

- `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md` (validation report, written by Task 11).

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP3 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully before the next. Task 9 depends on Sub-plan 2 Tasks 4/7/8 (final prefix, exit codes, workflow shape, workflows.md); Task 10 depends on Sub-plan 1 Task 3 + Sub-plan 2 Task 7; Task 11 depends on all prior.

- [x] **Task 9 — WS-10: Documentation + Contract Publication.** Register `[bkit-ship-gate]` in `docs/observability.md`'s prefix list (brackets load-bearing; new script = new module = doc's bar met). Add consumer CI contract to `docs/deployments.md` alongside existing `[skip ci]`, dispatch-gate and `run_level` contracts: `pull_request` resolves to `run_level=full`; a consumer that narrows via `paths-ignore` or docs short-circuit has opted out of the merge-gate guarantee; name present-but-degraded run as residual. Add consumer rollback path (pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows). Record CI-config reasoning chain in `docs/decisions.jsonl` (key `384-ci-capstone-chain`): chain from `ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion strictly stronger than all of Step 3", with discarded alternatives named (merge queue unavailability mechanism; required status checks deferral; Step-1 probe rejection mechanism). Mirror Out-of-Scope table into `docs/deferrals.jsonl` — **but check the existing ledger first** (review-1 M2): five #384 deferral keys already exist as OPEN rows (`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`, `384-promote-status-hole-detector-from-advisory-to-gate`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`, `384-ship-redesign-sequence-after-341`); `grep` each key before appending and skip duplicates (`.bkit/jsonl.md` dedup tuples). Record Tier-3 advisory→gate promotion criteria (key `384-tier3-promotion`): "one release of fail-open signal without muting". **Dependencies:** Task 4 (final prefix + exit codes), Task 7 (final workflow shape), Task 8 (final workflows.md). **Done when:** `docs/observability.md` contains literal `[bkit-ship-gate]`; `docs/deployments.md` contains literal `run_level=full` consumer contract + `BKIT_SHIP_GATE_OVERRIDE` rollback audit; `docs/decisions.jsonl` rows `384-ci-capstone-chain` and `384-tier3-promotion` exist; `docs/deferrals.jsonl` contains the seven out-of-scope rows AND no duplicate of any of the five pre-existing #384 deferral keys (verified by `grep -c '<key>'` ≤ 1 for each); `pnpm test` (which includes prose audit) passes.

- [x] **Task 10 — WS-11: Tier-3 Status-Hole Detector (Advisory, fail-open).** Create `.bkit/src/bkit-status-hole-detector.test.ts` and the detector itself (likely `.bkit/src/bkit-status-hole-detector.ts` + a `bkit` CLI subcommand `bkit ship:audit` or wired into existing `bkit slop:delta` channel). Derive expected `ship-*` step set from `bkit-ship.md` by parsing `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — NEVER a hand-maintained table. Make expectations path-conditional: Path A skips integration + re-validation; B1 and B2 differ; MERGED-on-entry resume skips the middle; aborted run stops at Failure Path. Report delta against a pinned watermark (as `bkit slop:delta` already does). Emit through the fail-open advisory channel for one release before any promotion to gate. Validate against the existing corpus (acknowledging 25–65% holey; one consumer repo produces no signal; bkit's own two ship rows are fixtures). Add unit test. **Dependencies:** Task 3 (canonical step-key set), Task 7 (final workflow to parse). **Done when:** `pnpm test bkit-status-hole-detector` passes; detector CLI exits 0 with advisory output (not non-zero) on a known-holey fixture; path-conditional sets asserted; invented names (`ship-resume-human-override`) surface as delta; promotion criteria referenced from `docs/decisions.jsonl` row `384-tier3-promotion`.

- [x] **Task 11 — WS-12: E2E Validation + Rollout.** Manual terminal workstream — produce the evidence no green pipeline can. Run `bkit-ship-gate.sh --explain` read-only against one live PR in each of bkit + (where available) the two consumer repos; diff each verdict against `gh pr checks`; record any disagreement as a fixture gap (append `docs/failures.jsonl`). Watch one Path A ship and one Path B2 ship in a consumer repo end to end, confirming Success Criteria 1–5 against artifacts left behind: `--match-head-commit` on merge call; no non-integration push to `feat/{FID}`; exactly one `status.jsonl` per run in one tree with terminal row; deferred-sweep FAIL reaching handover when triggered; staging confined to `BOOK_PATHS`. Take first real `gh` rate-limit sample under the poll loop; record against Risk 4's unmeasured assumption. Calibrate Tier-3 watermark from those runs. Release gate script + managed config + rewritten prose together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have; confirm `bkit check` catches a partially-applied upgrade. **Mode-3 gap (review-3 M1):** both validated paths are local-mode (`RUNTIME_DEVPUSHES=true`); mode-3 (cloud, `RUNTIME_DEVPUSHES=false`) `BOOK_ROOT` live-verification is NOT exercised here — its prose contract is mechanically asserted by Task 3's Tier-2 presence check, and its live E2E is deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`); record this gap in the validation report. Write validation report to `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md`. **Dependencies:** Task 4 (gate), Task 6 (distribution), Task 7 (prose), Task 8 (mirrors), Task 9 (docs), Task 10 (detector) — design `WS-12 → [WS-4, WS-5, WS-7, WS-9, WS-10, WS-11]`; Task 5 (WS-8) reaches here transitively via Task 7/Task 8 so is dropped from the direct list (review-2 MINOR 2; the prior "Task 5 (gate)" label was doubly wrong — Task 4 is the gate). **Done when:** `ship-e2e-validation.md` exists and is non-empty; it records at least one Path A + one Path B2 ship attempt with explicit PASS/FAIL against each of the 5 Success Criteria; `gh api rate_limit` sample recorded; Tier-3 watermark calibration note present; mode-3 deferral recorded (cross-ref `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`); any disagreement between `--explain` and `gh pr checks` recorded as `docs/failures.jsonl` row.

### 🔒 SP3 Gate: Docs Published + Advisory Detector + E2E

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, the feature is ready for the squash-merge to `dev`.

- [x] **No bolt-on / no gate-weakening:** detector derives its expected set from `bkit-ship.md` (never a parallel table); fail-open advisory (not a day-one gate). No `as any` / `@ts-ignore` / `.skip` / empty `catch` introduced.
- [x] **Contracts published:** `docs/observability.md` contains `[bkit-ship-gate]`; `docs/deployments.md` contains `run_level=full` consumer contract + `BKIT_SHIP_GATE_OVERRIDE` rollback audit; `docs/decisions.jsonl` rows `384-ci-capstone-chain` + `384-tier3-promotion` exist.
- [x] **Deferrals non-duplicated:** `docs/deferrals.jsonl` seven out-of-scope rows present AND each of the five pre-existing #384 keys `grep -c` ≤ 1.
- [x] **Detector advisory:** `pnpm test bkit-status-hole-detector` GREEN; CLI exits 0 with advisory output on a known-holey fixture; path-conditional sets asserted; invented names surface as delta.
- [x] **E2E evidence:** `ship-e2e-validation.md` non-empty; Path A + Path B2 attempts recorded with explicit PASS/FAIL against all 5 Success Criteria; rate-limit sample present; Tier-3 watermark calibration note present; mode-3 deferral cross-ref recorded.
- [x] **SP3 - Verified:** Every checkbox above independently verified. Tasks 9–11 all `[x]`.

## Verification Plan (SP3)

### Automated Tests

- [x] **Unit suite (this slice):** `pnpm test bkit-status-hole-detector` GREEN.
- [x] **Full gate suite (feature-level):** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test:bats && pnpm bkit check` all green (Tier-2 invariant now GREEN from Sub-plan 2; nothing is RED). Do NOT weaken any gate to pass.
- [x] **Docs updated:** Every row in `plan-v3-checked.md` § Documentation Updates completed. `.agents/docs.md` still accurate (no change needed).

### Manual Verification (Task 11 — the feature's terminal evidence)

> [!WARNING]
> **Dashboard Ban:** Use `gh` CLI to verify CI pipelines. The Task 11 E2E validation IS the manual verification — not optional (Risk 11: bkit's own CI cannot dogfood; Risk 13: no green pipeline proves a run honoured the contract).

- [ ] **Step 1 (Task 11):** In a consumer repo (app-gether-life preferred — has friction corpus; visitfrasercoast-com produces no signal), run one Path A `/bkit-ship` end-to-end on a PR whose `dev` is an ancestor of the head. Confirm via `gh pr view --json statusCheckRollup` and the resulting `status.jsonl`: gate asserted capstone at current head; `gh pr merge --squash --match-head-commit <sha>` issued; no push to `feat/{FID}`; one `status.jsonl` in `BOOK_ROOT` with terminal row.
- [ ] **Step 2 (Task 11):** In a consumer repo, run one Path B2 `/bkit-ship` end-to-end on a CONFLICTING PR (or one whose `dev` moved). Confirm: `gh pr update-branch` failed → `@bkit-ship-conflict-resolve` ran → `git push --force-with-lease` fired → `gh workflow run` dispatched unconditionally → poll loop bounded by both caps → `bkit-ship-gate.sh` asserted at new head → `gh pr merge --squash --match-head-commit` issued.
- [ ] **Step 3 (Task 11):** Trigger a deferred-sweep FAIL (e.g. introduce an unplanned `TODO` mid-build, run ship) and confirm `.deferred-blocked` sentinel written under `BOOK_ROOT`, route to `@bkit-debug-abort-handover`, handover artifact non-empty.
- [ ] **Step 4 (Task 11):** `bkit-ship-gate.sh --explain --head <sha> --repo <o/r>` against one live PR in each of bkit + consumer repos; diff verdict against `gh pr checks --required`; record disagreements as `docs/failures.jsonl`.

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Feature Complete

Once SP3 Gate is `[x]`, all 12 tasks (Task 0–11) across the three sub-plans are done. The feature is ready for the squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method). Rollout is one `bkit upgrade` release carrying gate script + managed config + rewritten prose together (Task 11), so no consumer sees prose calling a gate it does not have.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).
