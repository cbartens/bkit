# Debug Abort Handover

## The Short Version

The BAR-148 bkit-ci-router feature is built and tested, but one ordering bug in five orchestrator files makes the router dead-on-arrival: `commentId` is written into `status.json` before the `save_comment` call that creates the comment, so it always persists as an empty string. The router reads that empty field and immediately enters its Failure Path, meaning no ship or debug dispatch ever fires. The fix is a targeted edit to five markdown files; no test changes are needed.

## What's Actually Happening

- **Symptom:** Router wakes on CI completion, reads `status.json`, finds `commentId: ""`, and halts with `missing commentId in status.json`.
- **Trigger:** Any `feat/**` CI completion on a PR carrying the `Auto` label.
- **Proximate cause:** In each of the five existing orchestrators, the `jq` block that writes the initial `status.json` entry (with `--arg cid "{COMMENT_ID}"`) executes at step 9 (build) / 11 (debug) / 9 (plan) / 8 (design) / 8 (ship), but `{COMMENT_ID}` is not resolved until the `save_comment` call that appears 2 steps later. The placeholder is empty at write time; the resolved value is never written back.
- **Root cause (design fragility):** The Path A schema bump (adding `issueId`/`commentId` to `status.json`) was implemented by inserting `--arg cid "{COMMENT_ID}"` into the existing pre-`save_comment` status init block, rather than splitting the write into two parts or moving the `save_comment` earlier. `issueId` works because `{ISSUE_ID}` is resolved before the status init; `commentId` does not because `{COMMENT_ID}` is resolved after it.
- **Contributing factor:** The C8 test asserts only that the field names `issueId` and `commentId` appear somewhere in the Step 1 body. It does not assert that `save_comment` precedes the `commentId` write in source order, so the ordering bug passes all tests.

## Attempt History

| # | Strategy | What was tried | Why it failed |
|---|---|---|---|
| 0 | STANDARD | Challenge Run 1: checked C9f test and all 5 orchestrators for correctness | Found C9f test used `.not.toContain("MAX_DEBUG_ATTEMPT")` which would false-fail because prose mentions the constant. Also flagged the `commentId` ordering bug (F1) as CRITICAL. |
| 1 | PIVOT | Remediation: fixed C9f test at `release-workflow.test.ts:412-416` — replaced the string-contains assertion with two regex assertions targeting only shell variable expansions and comparisons | C9f fix was correct and verified. F1 (commentId ordering) was not remediated — it was identified as the next required fix, but the build-challenge re-run confirmed it as the sole blocker. |

## Verified Resolutions (DO NOT ROLL BACK)

- **C9f test fix** at `.agents/scripts/release-workflow.test.ts` lines 417-418: the `.not.toContain("MAX_DEBUG_ATTEMPT")` assertion was replaced with two regex assertions:
  ```ts
  expect(routerContent).not.toMatch(/\$\{?MAX_DEBUG_ATTEMPT\}?/);
  expect(routerContent).not.toMatch(/MAX_DEBUG_ATTEMPT\s*[<>=!-]/);
  ```
  These pass correctly — the router only references `MAX_DEBUG_ATTEMPT` in documentation prose (lines 31, 294, 314 of `bkit-ci-router.md`), never in shell code. Commit: `8a3e0febbfeea0f3961b594501b057f53d08a7c3`.
- All Phase A–E build work (templates, installer module, tests C1a–C9g, documentation D1–D7, mirror regen) is complete and committed. Do not revert any of it.

## Persistent Errors

**F1 — `commentId` ordering bug** (CRITICAL)

All five orchestrators write `commentId` into `status.json` before the `save_comment` call that provides the comment ID. The field persists as `""`. The router reads this field at Step 1 and fails immediately.

Exact locations (status-init line number vs. `save_comment` line number):

| Orchestrator | Status init (commentId written) | `save_comment` (ID resolved) |
|---|---|---|
| `.agents/workflows/bkit-build.md` | line 103-104 | line 115 |
| `.agents/workflows/bkit-debug.md` | line 113-114 | line 126 |
| `.agents/workflows/bkit-plan.md` | line 83-84 | line 95 |
| `.agents/workflows/bkit-design.md` | line 82-83 | line 94 |
| `.agents/workflows/bkit-ship.md` | line 102-103 | line 114 |

In each file, the `jq` block uses `--arg cid "{COMMENT_ID}"` to write `commentId` into the initial status entry. At that point `{COMMENT_ID}` is an unresolved placeholder (value: empty string). The `save_comment` call that returns and captures the real `{COMMENT_ID}` comes 2 sub-steps later and never writes back.

Router failure sequence:

1. Upstream orchestrator writes `commentId: ""` to `status.json` at status init.
2. `save_comment` creates the Linear comment — `{COMMENT_ID}` is now resolved in-session, but `status.json` is not updated.
3. CI completes → router wakes, reads `COMMENT_ID=$(jq -r '.[-1].commentId // ""' "$STATUS")` → empty.
4. Router Step 1 line 89 → Failure Path: `missing commentId in status.json`.
5. No ship or debug is ever dispatched.

## Recommended Next Steps

1. **Split the status-init write into two parts in all 5 orchestrators** — Write the initial entry with `commentId: ""` (or omit the field), then add a second `jq` pass immediately after `save_comment` captures `{COMMENT_ID}` to patch `commentId` into the entry. This is the minimally invasive approach that preserves the existing step ordering. Cost: 5 mechanical edits across 5 markdown files, one re-run of the build challenge.
   - FIXES: F1 entirely; router reads a non-empty `commentId` on every dispatch.
   - DOES NOT FIX: the C8 test gap (tests still only assert field-name presence, not ordering).
   - COST: low — ~10 lines changed across 5 files; no new test infrastructure needed to unblock the build.

2. **Move `save_comment` before the status init in all 5 orchestrators** — Reorder so `save_comment` fires first (captures `{COMMENT_ID}`), then the single `jq` status init uses the real value. Cost: same 5 files, but requires more careful reordering to ensure `{ISSUE_ID}` and `{FID}` are resolved before `save_comment`. Slightly higher risk of introducing a second ordering error during the reorder.
   - FIXES: F1 entirely.
   - DOES NOT FIX: the C8 ordering-gap in tests.
   - COST: low-medium — requires verifying all prereqs of `save_comment` are available at the earlier position.

3. **Option 1 + add a C8 ordering-constraint test** — After the split-write fix, extend `release-workflow.test.ts` C8 to assert that the `save_comment` line index is less than the `commentId` write line index in each orchestrator. This closes the test gap that let the bug ship.
   - FIXES: F1 + the gap that made C8 miss it.
   - DOES NOT FIX: anything else.
   - COST: low-medium — adds ~20 lines to an existing test file.

4. **Manual `status.json` patch + router re-run** — Directly edit `docs/plans/logs/bar-148-option-1/status.json` to insert a valid `commentId` value, commit, and restart the router. This is a workaround for the current BAR-148 run only; it does not fix the bug for future orchestrator invocations.
   - FIXES: unblocks this specific run only.
   - DOES NOT FIX: the underlying bug — every future orchestrator invocation will produce the same empty `commentId`.
   - COST: trivial, but creates technical debt.

## Recommended Path

**Option 3 (Option 1 + C8 ordering test).**

The split-write approach (option 1) is the lowest-risk mechanical fix: it preserves the existing step ordering, requires no prerequisite-availability analysis, and is easy to verify by inspection. Coupling it immediately with the C8 ordering-constraint test (option 3) ensures the same class of bug cannot re-emerge silently in a future orchestrator. Total cost is modest — 5 markdown edits plus ~20 lines in one test file — and the combined change can be validated in a single build-challenge re-run.

After applying the fix, restart with `/bkit-build bar-148` — the orchestrator will read `status.json`, see the most recent `build` entry as `FAILED`, and pick up from Step 9 (Build Challenge).

## Reference Docs

- `docs/plans/logs/bar-148-option-1/build-challenge.md` — challenge run 1 (attempt 0, C9f finding) and challenge run 2 (attempt 1, F1 finding — full exploit scenario at lines 31-65)
- `docs/plans/logs/bar-148-option-1/build-challenge-remediate-log.md` — C9f fix details
- `docs/plans/logs/bar-148-option-1/build-challenge-tests.md` — C9f fix verification and KN-16 assessment
- `docs/plans/logs/bar-148-option-1/status.json` — build workflow entry, `FAILED`, last step `build-challenge` attempt 1
- `.agents/workflows.md` line 152 — documented contract: "`commentId` written at Start Workflow by all orchestrators after `save_comment` creates the initial comment"
- `.agents/scripts/release-workflow.test.ts` lines 285-313 — C8 test (asserts field-name presence only; does not assert ordering)
