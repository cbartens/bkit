# Ship Debug Abort Handover

## The Short Version

Feature #380 (keep `docs/roadmap.md` up to date automatically) is built and almost entirely working — every automated test, lint, and type check is green, and this is the SECOND time Ship's own pre-merge check has caught real, unfinished pieces before they could reach `dev`. Last time (2026-07-31) it caught 5 gaps and all 5 were genuinely fixed. This time it caught 4 more: 1 is a real behavioural bug (updating the roadmap file when a change goes through a Pull Request never actually gets pushed, so the update is silently lost), and 3 are leftover references to a file (`docs/completed.md`) that this feature deletes — those 3 crept back in when the feature branch was reintegrated with the main line of work on 2026-08-26. None of this is a crash or a flaky test; it is the gate doing exactly its job.

## What's Actually Happening

**Symptom:** `bkit-ship` Step 5 (`@bkit-ship-deferred-sweep`, the pre-merge completeness gate) returned `Verdict: FAIL / Failures: 4 / Unjustified: 1` and the ship workflow stopped (`workflow-failed` at `2026-08-26T20:11:13Z`, per `status.jsonl` line 37). Steps 1–4 (start, worktree setup, regression guard) all passed cleanly.

**Trigger:** The sweep diffed the full PR (`git diff origin/dev..HEAD`, 12,077 lines / 133 files, read in full — no partial-coverage caveat) against every "Done when" line across the master plan and 3 sub-plans, plus the design's 4 addenda. It first re-verified the 5 gaps this same gate caught on 2026-07-31 — all 5 are confirmed genuinely fixed, evidenced against the current head (`11a74fd4`, the 2026-08-26 squash of the 40-commit branch onto `ea19691f`). It then found 4 new gaps that survived that squash-merge onto `dev`.

**Proximate cause:**

- 1 gap is a real functional miss in code this feature wrote: the design/plan close hooks add and commit the roadmap-ledger update, but only push it to the remote branch when running in "direct-to-dev" mode. In the more common "Pull Request" mode, the commit is made locally and then `gh pr create` / `gh pr merge --squash` act on the remote branch, which never received that commit — so the roadmap board silently fails to record a design/plan close whenever a PR is used.
- 3 gaps are hygiene/consistency regressions, not new logic bugs: when the feature branch was reintegrated with `dev` on 2026-08-26, three places that should have dropped their references to the now-deleted `docs/completed.md` file instead kept them (or, in one case, kept them while everything else on the same seam was correctly updated).

**Root cause (design fragility, not a defect):** The plan's own success criteria required a completed, repo-wide sweep removing every `docs/completed.md` reference as part of the migration to `docs/roadmap.jsonl`. That sweep was done correctly on the feature branch itself, but a 3-way merge with `dev` during the 2026-08-26 reintegration re-introduced `dev`'s copies of a couple of those references in files `dev` had also touched. Nothing caught this because per-sub-plan verifies only look at each sub-plan's own diff, not at what a later merge does to already-verified files. The PR-mode push gap is different: it is a genuine oversight, present since the original build (not a regression), that the per-sub-plan verifies and the first deferred sweep both missed because neither exercised the PR-mode branch of the close hooks end-to-end.

**Contributing factors:** None beyond the above — the full gate suite (`pnpm vitest run`: 3708 passed; `bats`: 31 ok; `typecheck`, `format:check` clean; `lint:prose`: 0 errors; `bkit check`: 0 writes) is green, and the sweep explicitly confirms this is not environment flakiness or a race.

## Rot Signals

None. No `ship-failure-diagnose-*.md` or `ship-failure-remediate-*-log.md` artifacts exist for this ship run (confirmed via `status.jsonl`, which goes directly from the Step-5 `FAIL` entry to `workflow-failed`) — the deferred-sweep gate stops the workflow before any diagnose/remediate subagent runs, so no rot-signal extraction was possible this cycle. (The prior, 2026-07-31 handover at this same path likewise reported none, for the same structural reason — the gate always stops before diagnose/remediate is reached.)

## Out-of-Scope Recommendations

None produced this cycle (no diagnose attempt ran). For reference, `ship-deferred-sweep.md` § Exempt lists 10 previously-declared out-of-scope items (deferred to #260, #80, or explicitly rejected/decided) that are NOT part of the 4 blocking gaps below.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed / current state |
| --- | --- | --- |
| `build` (3 sub-plans), `build-plan-verify-holistic` | Execute → verify loops per sub-plan, then a cross-sub-plan integration verify | Per-sub-plan verifies all PASS; holistic verify found 5 cross-sub-plan integration gaps (2026-07-29) |
| `debug`, attempt 1 | Rebase the feature branch onto `origin/dev` before diagnosis | Aborted before any diagnosis on 3 real rebase conflicts (2026-07-30); resolved by hand afterward |
| `ship` run 1 (2026-07-31), Step 5 (`@bkit-ship-deferred-sweep`) | Pre-merge completeness sweep against design/plan intent | **FAIL, 5 failures** — the 5 holistic-verify gaps, re-confirmed still present. Ship stopped; see prior handover (now superseded, was covering this exact failure). |
| *(human, out-of-workflow)* | Fixed all 5 gaps from the 2026-07-31 sweep, then reintegrated the branch with `dev` on 2026-08-26 (40-commit squash) | All 5 prior gaps verified genuinely fixed by this run's sweep. The 2026-08-26 reintegration itself reintroduced 3 of this run's 4 new gaps. |
| `ship` run 2 (this run, 2026-08-26), Steps 1–4 | Start / worktree setup / regression guard | All PASS |
| `ship` run 2, Step 5 (`@bkit-ship-deferred-sweep`) | Pre-merge completeness sweep of the full PR (12,077-line diff, full coverage) against design/plan intent, including a re-check of the 5 previously-blocking gaps | **FAIL, 4 failures, 1 unjustified deferral resurfaced** — 1 real functional gap (PR-mode roadmap push) + 3 hygiene regressions from the 2026-08-26 merge. Ship workflow stopped here. |

## Verified Resolutions (DO NOT ROLL BACK)

Confirmed fixed and correct as of this sweep — do not revert or re-litigate:

- All 5 gaps from the 2026-07-31 sweep: ship close now folds the roadmap board (`bkit-ship.md:1210`); the placeholder `### Ship (…sub-plans 2/3)` text is gone, replaced by real `### Design / Plan / Build / Debug / Shipped (last 10)` sections; `/bkit-roadmap` now appends `ROADMAP_SCAN_COVERAGE`; the on-demand scratch path is properly gitignored (repo + template); the committed `docs/roadmap.md` matches the current fold's 5-column output byte-for-byte.
- The runtime-fencing risk the 2026-07-31 sweep flagged as an open observation: build/debug dev-lock mirror writes are now correctly fenced to skip in adopt mode.
- Two failures.jsonl-tracked issues closed and verified: `380-devlock-roadmap-mirror-missing-adopt-mode-fence` and `380-fold-tracker-vs-ledger-key-namespace-duplicates-every-enriched-fid`.
- 21 of 23 intended-deliverable rows in `ship-deferred-sweep.md` are `Delivered`; the remaining 2 are `Partial` (see Persistent Errors below) — everything else (telemetry codec, `.gitattributes`, `bkit telemetry migrate`, the fold script, doc-index rows, ship writer/verdict reader, all four STRAY allowlists, the analysis leaf, Step 10 wiring, cadence, reverse tracker sync, drift check, the `/bkit-roadmap` utility, deferral closures, mirror regen) is fully green.
- Full gate suite: `pnpm vitest run` 3708 passed / 2 pre-existing skips / 2 pre-existing todos; `bats` 31 ok; `typecheck` clean; `format:check` clean; `lint:prose` 0 errors; `bkit check` 0 writes would occur.

## Persistent Errors

**The 4 blocking gaps from this sweep (`ship-deferred-sweep.md` § Blocking Deferrals), none present in `docs/deferrals.jsonl`, any plan Out-of-Scope table, or the design's non-goals — all unplanned:**

1. **PR-mode design/plan close never pushes the roadmap commit, so it never reaches the PR or `dev`.** In the `RUNTIME_DEVPUSHES=false` branch, `bkit-plan.md:1004-1008` (and `bkit-design.md:963-967`) append the ledger row, fold the board, `git add -- docs/roadmap.jsonl docs/roadmap.md`, and commit — but the very next commands are `gh pr create` / `gh pr merge --squash`, which act on the remote branch. Nothing pushes that commit first. Effect: in PR mode, the roadmap board never records a design/plan close. This pre-dates the 2026-08-26 reintegration (present since the branch's original build) and was missed by both the holistic verify and the 2026-07-31 sweep — it breaks Success Criterion #1 and contradicts the plan's own stated mechanism for how the row was supposed to reach `dev`.
2. **`.bkit/version` still carries the `docs/completed.md` `canonicalHashes` hash — a 2026-08-26 regression.** The plan explicitly required this entry gone (`grep completed .bkit/version` empty); `dev`'s side won that line during the reintegration merge. It will not self-heal — `bkit install` merges prior `canonicalHashes` forward on every install — so bkit keeps claiming ownership of a file it no longer ships.
3. **`@bkit-ship-conflict-resolve`'s Tier-1 union-ledger list still names `docs/completed.md` and is missing both roadmap paths — a 2026-08-26 regression.** The equivalent list in `.bkit/workflows.md` and `bkit-rebase-resolve.sh` WAS correctly updated on this branch; only this one prompt (plus its 3 rendered host mirrors) was left stale, meaning the conflict-resolution agent is currently told to union a file that doesn't exist and is not told the two roadmap files exist at all.
4. **The ship staging allow-list swap is add-only, and its own test now asserts the wrong thing.** `bkit-book-commit.sh` correctly stages both roadmap paths (functionally fine — the ship-close row does commit), but `BOOK_PATHS_ALLOW_LIST` in `bkit-ship-invariants.test.ts` still opens with `"docs/completed.md"` and contains neither roadmap path; the test at that file's line 184-196 now literally requires the script to keep naming the deleted file. Two stale prose strings sit on the same seam (`bkit-ship.md:1198` referencing a removed `BOOK_PATHS` mechanism; `.bkit/workflows.md:903,918` calling it a "frozen 11-path allow-list").

**Full remediation recipes for all 4 are already written out in `ship-deferred-sweep.md` § Handover Notes items 1-4** — reproduced here in bounded, per-item form for whoever picks this up:

- **Item 1 (functional, do first):** add exactly one `git push --force-with-lease origin "{BRANCH}"` right after the roadmap commit in the `RUNTIME_DEVPUSHES=false` branch of both `bkit-plan.md` (after line 1008) and `bkit-design.md` (after line 967), before the STRAY check and `gh pr create`. Watch two things: the workflow's git rule requires exactly one push form per shell invocation, and a `[skip ci]` commit becoming the PR head trips KN-11 — folding the roadmap paths into the existing pre-PR commit instead of adding a new push is probably the cleaner fix. Extend `bkit-roadmap-staging.integration.test.ts` with a per-occurrence assertion that the PR path pushes after the roadmap commit.
- **Item 2 (regression, one line):** delete the `docs/completed.md` line from `.bkit/version` (currently line 50). Add a guard (e.g. in `bkit-telemetry-gitattributes.integration.test.ts` or `bkit-manifest.test.ts`) so a future merge can't silently reintroduce it.
- **Item 3 (regression, one edit + mirror regen):** in `.bkit/prompts/bkit-ship-conflict-resolve.md` line 35, drop `docs/completed.md`, add `docs/roadmap.jsonl` and `docs/roadmap.md`, matching what `bkit-rebase-resolve.sh` and `.bkit/workflows.md:724` already say. Then `bkit install` to re-render the three host mirrors (batch with item 4, not per-edit) — source-only edit, never touch `.claude/`/`.cursor/`/`.opencode/` directly.
- **Item 4 (test correction + cleanup):** in `bkit-ship-invariants.test.ts`, remove `"docs/completed.md"` from `BOOK_PATHS_ALLOW_LIST`, add `docs/roadmap.md` (assert the `docs/*.jsonl` glob explicitly for `docs/roadmap.jsonl` rather than a literal path). Then remove `"docs/completed.md"` from `bkit-book-commit.sh:165` and its template twin. While there, fix the two stale strings: `bkit-ship.md:1198` and `.bkit/workflows.md:903,918`.

**Not blocking, but worth a decision before re-shipping (per sweep § Handover Notes, non-numbered items):**

- `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` (OPEN, LOW) has no `reason` field, which is required on a deferral row — append a same-key row with `reason: "needs-decision"` stating the two remediation options already on record.
- `docs/plans/.../build-plan-verify-holistic.md` still shows `Verdict: FAIL / Failures: 5` — historically correct (all 5 are now fixed and closed in `docs/failures.jsonl`), but leave a note so a later reader doesn't mistake its header for current state.
- Sub-plan 2's Pre-Flight prose still says the cadence "reuses the persisted `.bkit/stats.jsonl` outcome rows" — contradicts its own Task 10 and the shipped code (which is correct). Plan-artifact text only, not shipped surface — advisory, no action required.

**Resolved, do not re-investigate:** the debug-attempt-1 rebase conflict and all 5 of the 2026-07-31 sweep's gaps are fully and independently re-verified fixed by this sweep (see Verified Resolutions above and the sweep's own re-check table). The 2026-07-31 `ship-handover.md` that previously lived at this path covered that now-resolved rebase-abort situation; it has been overwritten by this file, which covers the current, distinct failure.

## Recommended Next Steps

**Option A — Route to a `bkit-build` gaps-remediate pass (or a fresh `bkit-debug` cycle) to close all 4 gaps, then re-run `bkit-ship`. (Recommended.)**
✅ FIXES: all 4 gaps properly; the design's own success criteria fully satisfied; closes out the last of the PR-mode/`completed.md`-migration surface.
❌ DOES NOT FIX: nothing outstanding — this is the complete fix.
⚠️ COST: All 4 fixes are small and well-scoped with exact recipes already written (see Persistent Errors above) — no design ambiguity remains, only implementation. Item 1 (the push fix) is the only one that touches workflow-shell control flow and needs the KN-11 `[skip ci]`-head check; items 2-4 are near-mechanical (delete a hash line, swap a file reference, correct a test list, batch a mirror regen). Estimated well under the 1-2 hours the 2026-07-31 round took, since 3 of 4 are single-file edits.

**Option B — Defer the gaps explicitly (declared `docs/deferrals.jsonl` rows with owners + plan Out-of-Scope updates) and override the sweep to ship as-is.**
✅ FIXES: unblocks merge immediately.
❌ DOES NOT FIX: any of the 4 gaps — PR-mode design/plan closes will keep silently failing to update the board (the most consequential of the four, since most work here goes through PRs, not direct dev pushes); `.bkit/version` keeps misclaiming ownership of a deleted file; the conflict-resolution agent stays wrong about which ledgers are union-safe.
⚠️ COST: A paper-trail cost (new deferral rows, unticking any plan checkboxes that assert behaviour not actually met) rather than a code cost — but given items 2-4 are literally 2026-08-26 regressions of already-verified work, deferring them risks the same drift recurring at the next merge with `dev`.

**Option C — Fix only Item 1 (the functional gap) now; defer items 2-4 (the hygiene regressions) with an explicit follow-up.**
✅ FIXES: the one gap that actually changes runtime behaviour incorrectly (silently-lost roadmap updates in the far more common PR-merge mode).
❌ DOES NOT FIX: the 3 regressions — a stale `.bkit/version` hash and two ledger-reference lists left describing a deleted file, all of which will keep confusing the conflict-resolve agent and the uninstall safe-delete guard until fixed.
⚠️ COST: Smallest immediate fix, but leaves known regressions live in a codebase that just demonstrated a merge-with-dev can reintroduce exactly this class of drift — a second sweep later is likely to catch the same 3 items again if deferred rather than fixed now.

## Recommended Path

**Option A.** All 4 gaps have exact, already-written remediation recipes with no remaining design ambiguity (`ship-deferred-sweep.md` § Handover Notes items 1-4), 3 of the 4 are single-file mechanical edits, and this branch has already demonstrated — twice now — that the deferred-sweep gate reliably catches real, fixable gaps rather than false alarms (5-for-5 in the 2026-07-31 round, all genuinely fixed and now independently re-verified). There is no indication this pattern is diminishing returns or gate over-sensitivity; both rounds found real problems worth fixing before merge. One more focused remediation pass, followed by a third ship attempt, is the lowest-risk path to a fully-correct merge.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-deferred-sweep.md` — this run's FAIL verdict; primary source for all 4 gaps, the full 23-row intended-vs-actual table, and the re-check of the 5 previously-blocking gaps.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — where the original 5 gaps were first found (2026-07-29); historical, all now closed.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history: design DONE, plan DONE, build FAILED at holistic verify (5 failures, since fixed), debug FAILED at Step 2 (rebase, since resolved), ship run 1 FAILED at Step 5 (5 failures, since fixed), ship run 2 (this run) FAILED at Step 5 (4 failures, current).
- `docs/failures.jsonl` — carries the CLOSED rows for the 2026-07-31 gaps (`380-holistic-verify-5-cross-sub-plan-integration-gaps`, `380-devlock-roadmap-mirror-missing-adopt-mode-fence`, `380-fold-tracker-vs-ledger-key-namespace-duplicates-every-enriched-fid`); this handover's 4 new gaps should be logged there if not fixed promptly.
- `docs/deferrals.jsonl` — carries `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` (OPEN, needs a `reason` field appended) and the closed rows for previously-resolved items (`380-first-bootstrap-preserve-preexisting-consumer-roadmap-content`, `380-roadmap-md-generated-but-not-prettier-ignored`, `380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis`, and 2 others closed by this feature).
- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` (+ `-plan-1.md`/`-plan-2.md`/`-plan-3.md`) — master plan + 3 sub-plans; SP1 Tasks 5/6, SP3 Task 15 are where the `completed.md` sweep and PR-mode push requirements are specified.
