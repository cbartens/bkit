Verdict: PASS

<!-- verdict:end -->

# Debug Failure Diagnosis

## CI Run

N/A (DEBUG_MODE=local). Build workflow `attempt 1` failed at Step 9 (Build Challenge); see `docs/plans/logs/bar-148-option-1/build-challenge.md` (commit `8e1c805957b3b7e607b2eb59e13e205e86a5ad0f`, 2026-05-09T01:12:03Z).

## Prior Attempts Reviewed

This is debug attempt 0; no prior debug diagnoses or remediations exist.

Prior build-challenge history (from `status.json` and `build-handover.md`):

| # | Strategy | Tried | Result |
|---|---|---|---|
| 0 | STANDARD | Build Challenge attempt 0 — flagged C9f false-fail (`.not.toContain("MAX_DEBUG_ATTEMPT")` matches prose) AND F1 (commentId ordering) as CRITICAL. | FAIL — 1 critical (C9f), 1 critical (F1). |
| 1 | PIVOT (remediate C9f) | Build Challenge Remediate — replaced C9f assertion with two regex assertions (`/\$\{?MAX_DEBUG_ATTEMPT\}?/` and `/MAX_DEBUG_ATTEMPT\s*[<>=!-]/`). Tests passed. F1 deliberately deferred to debug workflow. | C9f PASS (commit `8a3e0febbfeea0f3961b594501b057f53d08a7c3`); re-run challenge attempt 1 confirmed F1 as sole remaining blocker. |

Verified resolutions to PRESERVE (do not roll back): C9f regex fix at `.agents/scripts/release-workflow.test.ts:417-418`; all Phase A–E build artefacts (templates, installer, tests C1a–C9g, docs D1–D7, mirror regen).

## Failures

**F1 — `commentId` ordering bug — CRITICAL — five orchestrators, identical pattern**

In each of the five existing workflow orchestrators, the `jq` block that initialises `status.json` (Step 9 / 11 / 9 / 8 / 8 depending on workflow) writes the field `commentId:$cid` using `--arg cid "{COMMENT_ID}"` BEFORE the `save_comment` step that resolves `{COMMENT_ID}`. At write-time `{COMMENT_ID}` is an unresolved placeholder (effectively empty string). The persisted `status.json` therefore records `commentId: ""`. The downstream `bkit-ci-router` reads this empty value at Step 1 (`COMMENT_ID=$(jq -r '.[-1].commentId // ""' "$STATUS")`) and immediately enters the Failure Path with `missing commentId in status.json`. No ship or debug dispatch ever fires for any `feat/**` PR carrying the `Auto` label.

Verified line numbers (read directly from each file):

| File | Status-init `jq` block (writes empty `commentId`) | `save_comment` (resolves `{COMMENT_ID}`) |
|---|---|---|
| `.agents/workflows/bkit-build.md` | lines 99–113 (specifically `--arg cid "{COMMENT_ID}"` at line 103) | line 115 |
| `.agents/workflows/bkit-debug.md` | lines 108–124 (specifically `--arg cid "{COMMENT_ID}"` at line 113) | line 126 |
| `.agents/workflows/bkit-plan.md` | lines 78–92 (specifically `--arg cid "{COMMENT_ID}"` at line 83) | line 95 |
| `.agents/workflows/bkit-design.md` | lines 77–91 (specifically `--arg cid "{COMMENT_ID}"` at line 82) | line 94 |
| `.agents/workflows/bkit-ship.md` | lines 97–111 (specifically `--arg cid "{COMMENT_ID}"` at line 102) | line 114 |

These line numbers match the build-handover.md table exactly (the handover cites the `--arg cid` line specifically).

C8 tests at `.agents/scripts/release-workflow.test.ts:285-313` did NOT catch this because they only assert that the field NAMES `issueId` and `commentId` appear in the status-init block. They do not assert source-order constraint between `save_comment` and the `commentId` write.

## Root Cause

**Proximate cause (mechanical):** Each orchestrator interpolates `{COMMENT_ID}` into the status-init `jq` invocation before the in-session `save_comment` call has produced a value. Because `status.json` is written via `mv` (atomic), and never re-patched after `save_comment`, the empty placeholder is the value that lives on disk and is consumed by the router.

**Design fragility:** The Path A schema enhancement (`status.json` carries `issueId` + `commentId`) was retro-fitted into the existing pre-`save_comment` status-init block. `issueId` happens to work because `{ISSUE_ID}` is resolved much earlier (Step 4 in every orchestrator: `get_issue` or `save_issue` returns `id`). `commentId` does not work because `save_comment` is intentionally placed AFTER the status-init commit (the comment is the user-facing artefact for the start-workflow step, posted only once the workflow entry is committed). Two non-trivial constraints collide:
1. The status-init must commit before `save_comment` so the comment can link to the committed `status.json`.
2. The router consumer requires `commentId` populated in the same `status.json` it reads.

The remediation must satisfy both constraints simultaneously; the cleanest mechanism is a second `jq` patch immediately after `save_comment` (in the same workflow step or as a small follow-up step) that updates `.[-1].commentId` and re-commits.

**Contributing factor (test-gap):** C8 (matrix row 11) verifies the schema field NAMES are present but not their RUNTIME VALIDITY (i.e., source-order constraint with `save_comment`). The bug is therefore invisible to the test suite, allowing it to ship past Build Verify into Build Challenge.

## Recommended Fix

Apply Option 3 from `build-handover.md`: split-write fix in all 5 orchestrators + extend C8 with an ordering assertion.

### Step 1 — Split status-init in all 5 orchestrators (mechanical edit)

For each of the 5 files, two changes are required.

**Change A — Remove `commentId` from the initial status-init `jq` invocation.** Replace `--arg cid "{COMMENT_ID}"` with nothing (drop the arg) and remove `, commentId:$cid` from the JSON object literal. The initial entry is committed without a `commentId` field. This is safe because: (a) the field is optional in router consumers (router uses `// ""` default), (b) the next change will add it back before any router could read it.

**Change B — Insert a second `jq` patch immediately after `save_comment` captures `{COMMENT_ID}`, BEFORE the next `git commit`.** The patch updates `.[-1].commentId = $cid` and re-commits.

Exact target locations (line numbers post-edit will shift):

1. `.agents/workflows/bkit-build.md`
   - At lines 102–106: change the `jq --arg iid "{ISSUE_ID}" --arg cid "{COMMENT_ID}" '. + [{workflow:"build", ..., issueId:$iid, commentId:$cid, steps:[]}]'` to drop `--arg cid "{COMMENT_ID}"` and `commentId:$cid`.
   - After Step 11 (`save_comment` at line 115) and before any subsequent commit boundary, insert:
     ```bash
     t=$(mktemp); jq --arg cid "{COMMENT_ID}" '.[-1].commentId = $cid' "$STATUS" > "$t" && mv "$t" "$STATUS"
     git add "$STATUS" && git commit -m "chore({FID}): start-workflow comment-id"
     ```

2. `.agents/workflows/bkit-debug.md`
   - At lines 112–116: same removal of `--arg cid "{COMMENT_ID}"` and `commentId:$cid`.
   - After Step 13 (`save_comment` at line 126), insert the same two-line patch + commit.

3. `.agents/workflows/bkit-plan.md`
   - At lines 82–86: same removal.
   - After Step 11 (`save_comment` at line 95), insert the same patch.

4. `.agents/workflows/bkit-design.md`
   - At lines 81–85: same removal.
   - After Step 10 (`save_comment` at line 94), insert the same patch.

5. `.agents/workflows/bkit-ship.md`
   - At lines 101–105: same removal.
   - After Step 10 (`save_comment` at line 114), insert the same patch.

Implementation note for the remediator: the second `jq` pass and its commit can be appended as a sub-step of the existing "save_comment" step (or as a new step immediately after) — either is acceptable as long as the patch lands BEFORE any subsequent step's `git commit`. Make sure the new commit is a separate commit from the comment creation (the existing convention uses one commit per status mutation; preserve it).

### Step 2 — Extend C8 with ordering-constraint test in `release-workflow.test.ts`

In `.agents/scripts/release-workflow.test.ts`, after the existing C8 block at line 313, add a new `describe` (still C8 or a new C8b) that, for each of the 5 orchestrators, asserts:

- The character index of the LAST `--arg cid` (or `commentId =` / `commentId:$cid`) usage in the file is GREATER THAN the character index of the first `save_comment(` literal — i.e., the resolved `commentId` is written AFTER `save_comment` resolves it.

Skeleton pseudocode:
```ts
it(`${name} writes commentId AFTER save_comment captures it`, () => {
  const filePath = path.resolve(`.agents/workflows/${name}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const saveCommentIdx = content.indexOf("save_comment(");
  const lastCidWriteIdx = content.lastIndexOf('--arg cid "{COMMENT_ID}"');
  expect(saveCommentIdx).toBeGreaterThan(-1);
  expect(lastCidWriteIdx).toBeGreaterThan(-1);
  expect(lastCidWriteIdx).toBeGreaterThan(saveCommentIdx);
});
```

The `lastIndexOf` is critical: with the split-write fix, `--arg cid` will appear once AFTER `save_comment`. If a future author re-introduces the bug by collapsing the writes, `lastIndexOf` will catch the regression.

### Step 3 — Mirror regen and template sync

After editing the 5 orchestrator markdown files, the remediator must re-run the bkit installer mirror generation (per project convention) so any installed-target mirrors of these orchestrators stay in sync. Check `.agents/templates/` for any mirrored copies of `bkit-{plan,build,ship,debug,design}.md` and update accordingly. (Quick check: `grep -l "{COMMENT_ID}" .agents/templates/` — if matches exist, the same edits apply there.)

### Knowledge note (for remediator to APPEND to `docs/knowledge.md`)

Suggested entry — verify no duplicate entry first via `grep -n "commentId" docs/knowledge.md`:

> **KN-XX — `status.json` field-write must follow value resolution.** When persisting a JSON status file with fields that depend on tool-call return values (e.g. `commentId` from `save_comment`), do NOT interpolate the placeholder into the initial `jq` write. Either move the resolving call before the write (when prerequisites allow) or split the write into init + post-resolve patch. Tests for schema fields must assert SOURCE-ORDER between the resolving call and the write, not just field-name presence. Recurrence on BAR-148 build-challenge attempt 1 (commit `8e1c805…`); fixed via split-write across `.agents/workflows/bkit-{plan,build,ship,debug,design}.md` after debug attempt 0 (PR pending).

## Suggested Tests

1. **C8 ordering assertion (mandatory)** — described above. Five new `it` cases (one per orchestrator) asserting `lastIndexOf("--arg cid") > indexOf("save_comment(")`.

2. **Optional: cross-orchestrator structural test** — assert that every orchestrator that creates a workflow entry in `status.json` has both an init-write that omits `commentId` (or sets it to `""`) AND a follow-up patch that sets `.[-1].commentId = $cid` after `save_comment`. This is a stronger invariant than the source-order test alone.

3. **Optional: integration smoke** — run the orchestrator end-to-end in a sandbox issue (e.g. `BAR-test`) and assert the resulting `status.json` has `commentId` matching the actual Linear comment ID. Defer if cost > value; the unit-level ordering test already covers the failure mode.

No regression risk to existing tests: C8 currently asserts field-name presence; the split-write keeps `commentId` in the JSON (just written via two passes instead of one), so the existing assertions continue to pass.

## Verification Commands

Run from the worktree root after applying the fix:

```bash
cd "$(git rev-parse --show-toplevel)/.worktrees/bar-148-option-1"
pwd

# 1. Sanity-check ordering by hand on one file
grep -nE 'save_comment|--arg cid|commentId' .agents/workflows/bkit-build.md

# 2. Verify the same shape across all 5 orchestrators
for f in bkit-build.md bkit-debug.md bkit-plan.md bkit-design.md bkit-ship.md; do
  echo "=== $f ==="
  grep -nE 'save_comment|--arg cid|\.\[\-1\]\.commentId' ".agents/workflows/$f"
done

# 3. Run the affected tests
pnpm vitest run .agents/scripts/release-workflow.test.ts

# 4. Full local gate (source of truth for build-verify)
pnpm turbo lint typecheck test --filter='...[origin/dev]'
```

Expected outcomes:
- Step 1 / 2: in each orchestrator, the `save_comment` line number must be LESS than the line containing `--arg cid "{COMMENT_ID}"` or `.[-1].commentId = $cid`.
- Step 3: all C8 cases (including the new ordering assertion) PASS; the existing C9f assertions remain green.
- Step 4: all lint/typecheck/test green.

After verification, restart the build workflow with `/bkit-build bar-148`. The orchestrator will see the most-recent `build` entry as `FAILED` and pick up at Step 9 (Build Challenge). Build Challenge should now report 0 findings and verdict PASS.
