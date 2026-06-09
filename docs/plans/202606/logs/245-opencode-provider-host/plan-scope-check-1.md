Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Audit result: template structure intact, every runbook task carries scope + `Done when:` + verification, Supersession Inventory complete with DELETE/RETAIN-WITH-REASON and mirrored in Architecture + runbook, no task edits inside `bkit:start`/`bkit:end` blocks, and the Derived Test Matrix maps 1:1 to runbook tasks. All `[MODIFY]` paths verified present this session (`bkit-install.ts`, `bkit-modules.ts`, `bkit-manifest.ts`, `bkit-cli.ts`, `bkit-mode.sh` + template, `prompts.md`, `providers.md`, `gateguard.cjs`); the 41 router-machinery occurrences slated for DELETE are confirmed live in `bkit-mode.sh`. No CRITICAL gaps that block plan progress.

## CRITICAL

None. No missing build task, no missing verification task, no broken matrix↔runbook mapping, no missing supersession entry, no scope-creep to remove.

Matrix↔runbook bidirectional check (all 13 matrix rows map to a runbook task, every verification task traces to a row):

- `applyOpencodeAgent` row → Task 1.3; `applyOpencodeCommand` row → Task 1.1; model-lookup-parse row + parser-regression row → Task 1.3; `runOpencodeModule`/dry-run-parity row → Task 2.2; GateGuard plugin row → Task 3.1; manifest round-trip row → Task 2.1 + the "Add manifest round-trip + upgrade coverage" mandatory task; CLI `--opencode` row → Task 2.3 (mode-flag parse) with the `bkit mode --opencode=<provider>` half landing in Task 4.1; catalog/host-parity row → Task 1.2; Approach-A-removal grep-guard row → Task 6.1; upgrade-migration row → Task 6.3; advisory-rewrite row → Task 6.2; spike-verdict row → Task 0.1.
- Every scope item has BOTH a build and a verification task. Each `[NEW]`/`[MODIFY]` in Architecture has a runbook build task (Phases 0–6) and a `Done when:` assertion naming a test file or recorded artifact. Each `[DELETE]` Supersession row is mirrored as a removal task (Phase 6: Tasks 6.1/6.2/6.3) and the RETAIN-WITH-REASON row (DE-26 decision log) is correctly justified as append-only history, not live code.
- External-boundary tasks (0.1, 3.1, 4.1, 5.1) each carry a paired non-mock "Boundary test" naming the boundary (live opencode CLI + live provider) and the ground-truth signal (provider response identity, observed concurrency, opencode tool-result surface) — satisfying the runbook's external-boundary rule.

## OPTIONAL

- Matrix row 8 (`CLI parses --opencode module flag + bkit mode --opencode=<provider>`) is a single row but its two halves verify in two tasks (2.3 for the install module flag, 4.1 for the mode-grammar parse). Mapping is recoverable and both halves have verification, but consider splitting the row so the 1:1 row→task contract is literal rather than inferred.
- Task 5.1 (manual end-to-end) and Task 0.1 (spike) are recorded as artifacts (`spike-verdict.md`, the Manual Verification log) rather than Vitest. The matrix correctly labels these "Manual (empirical gate)". Consider adding an explicit pointer from the Manual Verification Step 3/Step 6 back to the matrix spike/e2e rows so a later verifier can confirm closure without re-deriving the mapping.
- The GateGuard subagent-exemption signal is UNDOCUMENTED in opencode and the plan correctly defers capture to the spike (Task 0.1 item d) and asserts the unit test binds to the recorded real payload. This is a real untested assumption gated correctly, but it couples Phase 3 hard to a Phase 0 artifact field — if the spike captures concurrency but the team skips item (d) capture, Task 3.1's "no mock" contract silently degrades. Worth an explicit Gate 1.5 sub-check that item (d) was captured, not just the concurrency verdict.
- `opencode.json` tier decision (seed-or-print vs Tier-2 deep-contained) is left to Task 2.1 as an in-task decision. The plan flags the KN-17/KN-18/KN-19 hazards well, but the upgrade-reconvergence test in the mandatory "manifest round-trip + upgrade coverage" task assumes whichever tier is picked; if Tier-2 is chosen the malformed-destination-throw (KN-19) assertion must be present — currently implied, not an explicit `Done when:` clause on Task 2.1's upgrade path.

## OUT OF SCOPE

- OpenAI-native host via Codex CLI (#247) — correctly excluded; opencode is for models without a first-party CLI.
- Per-agent capability override config (#246) — correctly deferred.
- Cloud/managed-CI lane for opencode — correctly excluded (opencode is a local CLI, no managed equivalent).
- Curating opencode provider model IDs beyond seeding spike-verified defaults — correctly left to the consumer, mirroring the Cursor model-catalog churn caveat. No expansion recommended; these boundaries are well-drawn and should stay out of this plan.
