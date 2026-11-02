Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 7
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3 — Tasks 6, 7 and 8, judged against `build-brief-3-1.md` and `build-diff-3-1.md`.

## Groups Verified

None.

## Integration Gaps

None.

## Previously Attempted

None for Group 3. No prior Group 3 remediation or decision report was supplied or present.

## Notes

- Task 6 is satisfied: the shared selection validator protects the new fetch argument; the child environment clears inherited pins and supplies all four selected fields; selected CI output requires one matching complete receipt and nonempty evidence. Failed commands, skip breadcrumbs and invalid receipts remain unchecked. The managed context contract and temporary-block/fallback workflow instructions use the same validation path. Context completion records the selected generation.
- Task 7 is satisfied: the actual shipped Bash blocks read the exact selected repository and attempt, validate run metadata, enumerate complete job pages and collect each failed job's logs before emitting the receipt. Unpinned discovery uses the existing configured workflow. Pinned diffs select an ancestral successful baseline of that workflow, no later than the failing run, and end at the selected commit. The adopted blocks match the template.
- Task 8 implements selection before resume, generation stamps, conditional local clamps, CI reproduction with a blocking NO result, auto handoff of the held run and separate original/verifying identities. Its main-branch close path still bypasses the required final proof, so Task 8 is not satisfied.
- Independent verification: the eleven planned Group 3 tests passed across the four named test files using a focused Vitest name filter. The other 223 cases were excluded by that filter. The real Bash template suite exercises child processes and temporary Git history. The supplied test-first audit is enforced and PASS, with zero gaps and zero unproven tests. It reports no updated planned tests requiring restoration.
- Already landed: Task 7 `keeps adopted GitHub context blocks equal to shipped blocks` passed at red because the existing adopted CI/diff fenced bodies already equaled their shipped counterparts; the tests step recorded that reason. No gap.
- The execution log records successful final changed-file checks (2072 related and 7397 named tests), lint, formatting, typechecking, generation/render checks, build and built-CLI scratch evidence. Its FAIL header preserves corrected initial generation/audit failures; those historical failures are not unresolved gaps. This group review did not rerun the whole branch suite or build. The group has three tasks and eleven planned tests, within the supplied caps.
- The group diff contains the matching managed context, CLI/template/workflow catalog, instruction registry, rendered-provider and distribution updates. The later documentation and complete-sequence tasks remain Group 4 work; they are not claimed complete here. Current context failures use the existing checked/unchecked/skip narration and captured artifacts.

## Identified Gaps Log

TASK 8: `.bkit/core/workflows/bkit-debug.md` Step 11, sub-steps 1, 4 and 7 — selected-CI-proof-bypassed-on-main: On `main`, sub-step 1 sets `PR_OPEN=0` and sub-step 4 sets `TRIGGER_PR=0`. Sub-step 7 runs only when either flag is 1 or `BRANCH=dev`, so its configured-workflow wait and `runs gate --ci-selection-file` are skipped on main. Sub-steps 10–11 can then emit the successful close comment/final return without a verifying run, contrary to Task 8's DONE WHEN that no CI-only resolution precedes pushed-head checks. Make selected CI verification mandatory for every supported branch, including main, with a held exact pushed SHA; otherwise stop before success. Add a separate regression covering the main branch conditions and verify the generated workflow copies. — Fixable: true
