Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

## Scope

Post-remediation challenge of BAR-148 Option 1 implementation (`bkit-ci-router` via `claude-code-action`). Re-checked:

1. C9f test fix at `release-workflow.test.ts:412-420` — two regex assertions for `MAX_DEBUG_ATTEMPT` pre-check absence.
2. Five orchestrator `issueId` / `commentId` writes — Step 1 ordering vs `save_comment`.
3. `bkit-ci-router.md` — stale-run guard and label-gate ordering.
4. `bkit-ci-router.yml` — `permissions:` hardening and `cancel-in-progress: true`.

## Pass items

- C9f fix at `release-workflow.test.ts:412-420` is correct. Two regex assertions exclude shell reads / arithmetic comparisons of `MAX_DEBUG_ATTEMPT` while permitting prose references that explain the constraint. The companion test at `:421-423` retains the positive `bkit-debug` dispatch documentation assertion. No false positives expected against the current router prose (verified — the prose contains the constant name in a "MUST NOT pre-empt" sentence, not in a `$VAR` or `VAR -ge` form).
- `.agents/workflows/bkit-ci-router.md` step ordering is correct: Step 3 = label gate (lines 171-202), Step 4 = stale-run guard (lines 206-240). Both exit no-op (not Failure Path) when their respective preconditions fail, with explicit `rm -f .router-lock` and `exit 0`. `LATEST_SHA` / `PR_HEAD_SHA` empty cases route to Failure Path (line 219). Per-gate checklist items match the step body.
- `.github/workflows/bkit-ci-router.yml` (and `.agents/templates/.github/workflows/bkit-ci-router.yml`, byte-identical) hardening:
  - `permissions:` block (lines 7-11) restricts to least-privilege: `contents: read`, `pull-requests: write`, `issues: write`, `actions: read`. No `id-token`, no `write-all`. Acceptable for a router that reads PR metadata and writes Linear-bridged comments.
  - `concurrency.cancel-in-progress: true` at line 14 matches the v4 plan revision (newer CI completion supersedes in-flight router) and the C-tier test that asserts the value.
  - `if:` filter on `success | failure` (line 17) excludes `cancelled`. `timeout-minutes: 210` is below the upper-bound assertion (≤ 240) and above the lower-bound formula explained inline.
  - `actions/checkout@v4` pins to `head_sha` (line 23) — required for Path A `status.json` discovery.
  - `claude-code-action@v1` is invoked with `ANTHROPIC_API_KEY` injected via `env:` and `with:` and `--allowed-tools` restricted to the documented surface.

## Findings

### F1 — CRITICAL — `commentId` write happens BEFORE `save_comment` captures the ID; router fails on every dispatch

- **Severity:** CRITICAL
- **Class:** mechanical
- **Locations (all 5 existing orchestrators, identical pattern):**
  - `.agents/workflows/bkit-build.md:99-115` (status init Step 9, `save_comment` Step 11)
  - `.agents/workflows/bkit-debug.md:108-126` (status init Step 11, `save_comment` Step 13)
  - `.agents/workflows/bkit-plan.md:79-95` (status init Step ~9, `save_comment` Step 11)
  - `.agents/workflows/bkit-design.md:78-94` (status init Step ~9, `save_comment` Step 10)
  - `.agents/workflows/bkit-ship.md:98-114` (status init Step ~9, `save_comment` Step 10)
- **Contract violated:** `.agents/workflows.md:152` documents "`commentId` — Linear comment ID — written at Start Workflow by all orchestrators **after `save_comment` creates the initial comment**".

**Exploit / failure scenario:**
1. `bkit-build` runs Step 9 (status init): `jq --arg cid "{COMMENT_ID}" ... commentId:$cid ...`. At this point `{COMMENT_ID}` is unresolved / empty (the comment has not been created yet) — `status.json` records `commentId: ""`.
2. `bkit-build` runs Step 11: `save_comment({ issueId: ... })` returns the new comment ID, captured as `{COMMENT_ID}`.
3. `{COMMENT_ID}` is never written back into `status.json`. All later same-workflow `save_comment` calls in-session have the placeholder, but the persisted `status.json` retains `""`.
4. CI completes → `bkit-ci-router.yml` dispatches `bkit-ci-router.md`.
5. Router Step 1 line 86 reads `COMMENT_ID=$(jq -r '.[-1].commentId // ""' "$STATUS")` → empty.
6. Router Step 1 line 89 → **Failure Path** with `missing commentId in status.json — Path A schema not written by upstream orchestrator`.
7. Router never dispatches ship / debug. The entire BAR-148 router is dead-on-arrival on every run.

The `issueId` field has the same shape but happens to be already populated at status-init time (extracted in earlier sub-steps), so issueId works. **Only `commentId` is broken.**

**Why C8 tests miss this:** `release-workflow.test.ts:285-313` asserts the FIELD names `issueId` / `commentId` appear inside the Step 1 status-init block. They do — as placeholders. The tests do NOT assert ordering (i.e., `save_comment` index < status-init `commentId` write index in the file).

**Suggested fix (mechanical):**
- Move the `save_comment` step to BEFORE the `status.json` init in each of the 5 orchestrators, OR
- Split the status init into two writes: (a) initial entry creation with `commentId: ""` placeholder before `save_comment`, then (b) a follow-up `jq '.[-1].commentId = $cid'` AFTER `save_comment` captures `{COMMENT_ID}`. The follow-up write must happen before the `start-workflow status` commit so the field lands in the same commit.
- Add an authoring-conventions test asserting the source-order constraint per `.agents/workflows.md:152`: in each orchestrator, the line index of the `save_comment` that returns `{COMMENT_ID}` must be LESS than the line index of the jq write that references `--arg cid` / `commentId:$cid` (or, for the split-write approach, less than the second jq write).

## Notes

- The router itself (Step 1 line 86) reads `COMMENT_ID` from `status.json` BEFORE its own status-init at line 106, so the router internal ordering is internally consistent; the bug is exclusively in the 5 upstream orchestrators that produce the input the router consumes.
- Re-running router after upstream orchestrator hand-edits `status.json` is not a viable workaround — orchestrators auto-commit `status.json` and the GHA workflow_run trigger has no human-in-loop step.
- Failure mode is loud (Failure Path posts a Linear comment) but routes to no-dispatch; combined with the v4 `cancel-in-progress: true`, every `feat/**` PR with the `Auto` label will burn one router job per CI completion to no-op.

<!-- verdict:start -->
Verdict: FAIL
Failures: 1
<!-- verdict:end -->
