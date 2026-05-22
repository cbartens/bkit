Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

39 regression tests added to `.agents/scripts/bar-155-regression.test.ts` covering the 3 HIGH findings, 2 MEDIUM findings, and key invariants from the BAR-155 build challenge and remediation.

**HIGH-1 (sentinel mkdir-p order):** Two tests verify that `mkdir -p docs/plans/logs/{FID}/` precedes `touch .rebase-failed` in the rebase-failure branch of `bkit-ship.md` — line-ordering assertions catch the original bug (silent sentinel write failure when logs dir absent).

**HIGH-2 (plan-verify section ordering):** Three tests verify that `## Gaps Identified` is the last `##` section in `bkit-build-plan-verify.md` output format — guards against EOF echo-append landing in `## Notes` instead of the gaps section.

**HIGH-3 (gate checkpoint step references):** Six tests verify that Gate 14/15/16/17 "Issue comment attempted" checkboxes reference the correct step numbers (14/15/16/17, not the stale 13/14/15/16), plus monotonic step inventory 1..18 and no phantom Step 19/20 headers.

**MEDIUM-4 (long-branch advisory shell pattern):** Four tests verify the explicit `mb=$(git merge-base ...)` variable capture is present, `age=` references `"$mb"` (not an inline subshell), and the advisory echo line is present in Step 1.

**MEDIUM-7 (sentinel cleanup):** Three tests verify `rm -f .rebase-failed` appears at least twice (resume path + Failure Path), the cleanup rm precedes the touch (stale-sentinel-on-retry guard), and the Failure Path references the sentinel for handover routing.

**SC-4 guards:** Five tests covering bare `exit 1` removal, `REBASE_FAILED` env-var pattern absent, sentinel touch inside `if ! git rebase` block, and Failure Path sentinel routing prose.

**SC-5 guard:** Two tests verifying long-branch advisory echo line present and located inside Step 1.

**BLOCK/WARN terminology:** Five tests verifying `bkit-build-challenge-1.md`, `-2.md`, and `-reconcile.md` contain no `BLOCK` or `WARN` severity terms (would break downstream verdict extraction).

**Parallel-pair invariants:** Five tests verifying the `Parallel:` circular-reasoning guard in both challenge prompts, correct frontmatter (effort/model per slot), and byte-identical bodies between `-1` and `-2`.

**Deleted-file guard:** One test verifying `bkit-build-challenge.md` (no suffix) does not exist.

**Fix 1b directive:** Three tests verifying `echo {finding} >> {output}` stub-first directive is present in `bkit-build-challenge-1.md`, `-2.md`, and `bkit-build-plan-verify.md`.

## Blockers

None

## Bugs Discovered

None
