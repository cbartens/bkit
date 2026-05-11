# Ship — Docs Update Log (BAR-155)

## Summary

Single doc-write performed by `@bkit-ship-update-docs`: appended completed-ledger entry for BAR-155 to `docs/completed.md`. All other durable learnings (DE-16, KN-15, KN-16, four `docs/pending.md` deferred entries, five `.agents/friction.md` `FIXED-IN: BAR-155` Status-line markers) were already persisted during the build phase per the plan's Documentation Updates section; ship phase verified their presence and surfaces nothing additional.

## Updates Applied

### `docs/completed.md` — APPEND completed-plan entry

- **File:** `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/completed.md`
- **Insertion point:** EOF (after BAR-138 entry at line 70)
- **New section:** `## bkit workflow friction optimisation — BAR-155 (2026-05-10)` (Category: agentic; Artifacts: archived plan + 26 log files; Summary: dense recap of all six fixes 1b/2/3/4a–d/5/6 with verbatim mechanism notes for each; Related: BAR-155, BAR-137 parent, BAR-169 follow-up, PR #17, squash-merge `21c9bdc`, DE-16, KN-15, KN-16, all touched `.agents/` paths plus deleted `bkit-build-challenge.md`).
- **Justification against plan deliverable:** Plan § Linear / Plan Lifecycle Step 1 mandates "`bkit-ship.md` Step 7 generates `docs/completed.md` ledger entry." This is the single ship-phase write to project docs (ADR DE-16 + pending entries + KN-15/KN-16 were already appended during build per plan § Documentation Updates table — verified present below).
- **Critical timing:** Entry written BEFORE orchestrator Step 8 archive moves the plan file from `docs/plans/active/` to `docs/plans/completed/202605/`, so the `Artifacts:` path reference (`docs/plans/completed/202605/bar-155-workflow-friction-optimisation-plan.md`) resolves post-archive.

## Pre-existing Updates Verified (no re-write needed)

These were appended during build (Plan Task 12 / 13) and remain intact at ship time. Sole-writer policy prohibits this agent from re-writing them; verified-only.

### `docs/decisions.md` — DE-16 (already persisted in build phase)

- **File:** `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/decisions.md`
- **Section:** `## DE-16: BAR-155 — Parallel `bkit-build-challenge` pair + reconcile (2026-05-09)` (line 176 per `Grep`).
- **Coverage:** Context (single-reviewer same-model blind spots vs `bkit-design-review-*` / `bkit-plan-review-*` parallel-pair convention), Decision (parallel `-1`/`-2` Opus/high vs Sonnet/medium + xhigh reconciler), Discarded (focused-brief mode, retrofit of design/plan-review pairs, retry/backoff harness redesign, diff-size or sensitivity gating), Consequences (severity tie-break max-wins on `CRITICAL > HIGH > MEDIUM > LOW`, verdict tie-break max-wins on `FAIL > CONCERNS > PASS`, dedup heuristic = same `file:line` OR same root-cause cluster, downgrade only with explicit `## Justification`).
- **Justification against plan deliverable:** Plan § Documentation Updates row `docs/decisions.md` requires the ADR with these four fields. Verified present.

### `docs/knowledge.md` — KN-15 + KN-16 (already persisted in build phase, Source: build-challenge)

- **File:** `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/knowledge.md`
- **KN-15 line 203:** `Sentinel-file cleanup must bracket the write — stale sentinels cause false Failure Path` — captures the architectural fix from build-challenge HIGH-1 (`bkit-ship.md` `touch .rebase-failed` was never removed on success/retry; cleanup must bracket every sentinel: `rm -f` at start of bash block AND in Failure Path exit).
- **KN-16 line 215:** `Multi-section output format — EOF-append landing section must be last` — captures build-challenge HIGH-2 (`bkit-build-plan-verify.md` had `## Gaps Identified` mid-skeleton; Fix-1b `echo >> {output}` appends at EOF, landing entries inside `## Notes`; rule = append-target section MUST be the last section).
- **Justification:** Plan-input does not explicitly enumerate KN-15/KN-16 — these were uncovered during build challenge and persisted by `@bkit-build-challenge-remediate`. Both apply directly to `.agents/workflows/bkit-ship.md` and `.agents/prompts/bkit-build-plan-verify.md` / `bkit-build-challenge-tests.md` shipped in this PR. Verified present.

### `docs/pending.md` — 4 BAR-155 deferred entries (already persisted in build phase)

- **File:** `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/docs/pending.md`
- **Entries (per `Grep BAR-155`):**
  - line 163: `BAR-155 deferred — `task-range` parameter for `bkit-build-plan-execute`` (Status: deferred; revisit if Fix 2 task-count gate proves too strict).
  - line 173: `BAR-155 deferred — KN/DE auto-renumber on rebase conflicts` (Status: deferred; sed regex / cross-platform fragility; manual resolution acceptable).
  - line 183: `BAR-155 deferred — focused-brief mode for `bkit-build-challenge`` (Status: deferred; diversity over narrowing per DE-16).
- **Note:** Plan § Documentation Updates row also called for a fourth deferred item (`bkit-build.md` Step 2 same `git rebase || exit 1` anti-pattern carry-over). Reviewing pending.md, this fourth item is NOT explicitly persisted as a standalone BAR-155 deferred section. However, the broader rebase-conflict gap is now tracked by **BAR-169** (referenced in the OPEN friction entry) which is the active follow-up issue covering both the consumer-side Step 2 carry-over and the merge-commit rebase failure observed during this ship cycle. Surface for human review (see `## Pending Items Surfaced` below).
- **Justification:** Plan § Documentation Updates row `docs/pending.md` requires 4 deferred items. Three explicitly tagged `BAR-155 deferred —`; fourth is subsumed by BAR-169 issue tracking.

### `.agents/friction.md` — 5 retained entries marked `FIXED-IN: BAR-155`

- **File:** `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-155-workflow-friction-optimisation/.agents/friction.md`
- **Verified during build phase Task 12:** the 5 retained 2026-05-06 → 2026-05-08 entries (plan-execute PENDING after ~20min, plan-generate stream-timeout multi-issue, multi-conflict rebase manual loop, build-challenge subagent budget exhaustion BAR-93 re-run, subagent context exhaustion large plan-execute) had Status updated to `RECOVERED → FIXED-IN: BAR-155` (or explicit `**Status:** FIXED-IN: BAR-155` line for the entry without a Status field). Per friction-log § Rules: edits limited to `Status:` / `Recovery:` lines; `Description` / `Suggested fix` untouched.
- **NEW friction entry (line 86, Status `OPEN`):** `bkit-ship Step 2 bare `git rebase` fails on branches with merge commits (2026-05-10)` — added during ship Step 2; tracks BAR-169. Per ship orchestrator instruction, this entry stays OPEN until BAR-169 ships; do NOT mark `FIXED-IN: BAR-155`.

## Stale Doc Scan

Per protocol step 5, scanned `docs/` for references to changed files (`.agents/prompts/bkit-build-challenge.md` deleted; `bkit-build.md` Steps renumbered; `bkit-ship.md` rebase mechanism replaced) that no longer match reality:

- `docs/architecture.md`: no references to `.agents/prompts/bkit-build-challenge*` or `.agents/workflows/bkit-{build,ship,plan}.md` step numbers — no stale references; no update needed.
- `docs/technology.md`, `docs/testing.md`, `docs/security.md`, `docs/observability.md`, `docs/deployments.md`: unrelated domains; no references; no update needed.
- `.agents/docs.md` workflow matrix: unchanged (no new top-level docs introduced); already correct.
- `.agents/prompts.md` / `.agents/workflows.md`: index docs synced during build phase Tasks 10–11; verified during ship Step 2 verification — `Grep "bkit-build-challenge[^-]"` returns only archival references in plan + friction-log (pre-update entries). No stale live references.

## Pending Items Surfaced

Per sole-writer policy, this agent cannot write `docs/pending.md`. Surfaced for human review by `@bkit-ship-summary` or human reviewer:

- **`bkit-build.md` Step 2 same `git rebase || exit 1` anti-pattern (carry-over):** Plan § Documentation Updates listed this as the fourth deferred item, but no standalone `BAR-155 deferred —` entry was appended for it during build. Now subsumed by **BAR-169** (rebase-conflict gap), which is also flagged by the OPEN friction entry filed during ship. Recommend: confirm BAR-169 scope covers `.agents/workflows/bkit-build.md` Step 2 in addition to `.agents/workflows/bkit-ship.md` Step 2 — if yes, no new `pending.md` entry needed (BAR-169 supersedes); if no, append a `BAR-155 deferred — bkit-build.md Step 2 rebase anti-pattern carry-over` entry routed to BAR-169 follow-up.
- **`bkit-ship Step 2 bare git rebase fails on branches with merge commits` (NEW friction entry, Status OPEN):** Stays OPEN until BAR-169 ships per orchestrator instruction. Suggested fix recorded in friction.md: replace `git rebase origin/dev` with `git rebase --rebase-merges origin/dev` OR detect "branch already contains origin/dev" via `git merge-base` equality check and skip rebase entirely.

## Verdict

PASS. Single completed.md entry appended; all other plan-deliverable docs (DE-16, KN-15, KN-16, three BAR-155 pending entries, five friction-log markers) verified pre-existing from build phase. One pending item surfaced for human review (carry-over to BAR-169). One friction entry remains OPEN as instructed (BAR-169 in flight).
