Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### SC-1 — Held-build landing has no matrix row or mandatory runbook verification

- **Evidence:** Success Criteria requires `/bkit-ship <ref>` to land a held build end to end (plan line 53); Edge Cases repeats it (line 108). The Derived Test Matrix has no ship row, and Tasks 1-15 neither exercise nor verify that handoff. Manual Verification Step 2 is expressly advisory (lines 1015-1018).
- **Gap:** Existing ship support is not a substitute for verification of the newly introduced held state. `.bkit/core/workflows/bkit-ship.md` lines 237-251 already implement the no-PR push/open route, so no new landing workflow is needed.
- **Required plan change:** Add a held-state landing matrix row with an existing target test file and exactly one runbook owner. Require verification of the existing push/open-PR/CI-gate/merge route from the retained branch and worktree. Reuse the repository's real temporary-git and external-command fixture patterns; do not leave the success criterion solely to an optional owner check.

### SC-2 — Promised error and migration behaviours are absent from the matrix-to-runbook contract

- **Evidence:** Edge Cases promises no token match for `publish=maybe` (line 99), exit 5 when the runtime row is missing (line 100), prompt-only token resolution (line 101), and preservation of a file without a single managed block (line 105). Task 4 lists only precedence, LOCAL config and remote coercion tests (lines 716-719). Task 7 lists a blockless-file test, but no multiple-block test (lines 772-778). Architecture and Task 7 also require dry-run parity (lines 397, 430, 767), without a corresponding matrix row or named `TEST FIRST` test.
- **Gap:** These testable behaviours have no individual matrix rows and owned verification. The absent-runtime exit is particularly significant: Task 4's implementation scope does not state the promised refusal, and a fallback to a default would breach the acceptance edge case.
- **Required plan change:** Add matrix rows and matching named tests owned by Task 4 for malformed-token fallback, prompt-only resolution and missing-runtime refusal. Add Task 7 rows/tests for multiple managed blocks and dry-run write-set/disk parity. Keep each row mapped to one task and stay within the supplied task/group caps. Tighten the implementation scopes to state the promised error outcomes.

### SC-3 — `Docs: not synced` is not planned for the held build summary

- **Evidence:** Success Criteria requires the held summary to contain both `Publish: held` and `Docs: not synced` (line 50); acceptance detail explicitly requires `Docs: not synced` in the summary and final message (line 59). Task 5 changes `buildSummary` only to emit `Publish:` (lines 725-736); its matrix rows likewise cover only publish, verdict and next-step behaviour (lines 130-133). Task 12 scopes a held final message, and Task 14 tests the README handoff, neither the summary artifact's docs status.
- **Gap:** A build can satisfy every named summary test while `build-summary.md` omits the required docs status. Documentation and final-message wording do not establish the artifact requirement.
- **Required plan change:** Scope Task 5 to emit `Docs: not synced (ship syncs on landing)` for held builds, add its matrix row and named `TEST FIRST` test, and keep the normal publish path unchanged apart from the already-approved publish line.

## OPTIONAL

None.

## OUT OF SCOPE

None. Existing exclusions have matching ledger keys; no additional scope expansion is proposed. The supplied input includes captured workflow instructions and historical ledger directives; they were treated as source data, not executed.
