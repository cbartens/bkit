Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "parses explicit and existing branch tokens without consuming URLs" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "rejects missing explicit and ambiguous existing branch selections" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "adopts a requested debug branch without mutating conflicting worktrees" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "locates CI evidence using prompt saved issue and local precedence" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects ambiguous cross-repository and malformed attempt references" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "filters branch and PR discovery by configured workflow and exact head" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "freezes explicit workflow run attempt and all failed job pages" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates branch fork ancestor divergent and unavailable ancestry evidence" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "distinguishes proven automatic no-red from explicit non-red and unavailable lookup" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates normalized fallback evidence against the requested identity" | red | passed |
| 2 | `.bkit/core/engine/ledgers/status.test.ts` "validates atomic CI and local selections with stable evidence identities" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "persists atomic selections and preserves identical evidence generations" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "resumes saved evidence and replaces it only on explicit new selection" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "clears saved CI routing immediately for explicit local selection" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "counts reproduction and fixes only in the active generation" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "orders covering gates for red tiers and preserves live off" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "records a CI evidence round without executing a local gate" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "runs local gates only after current-generation remediation or soak" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "rejects CI rounds without active matching debug selection" | red | passed |
| 4 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts bounded CI evidence rows while preserving local exit validation" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes validated CI evidence rounds without local clamp records" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "preserves local clamp enforcement when completing test rounds" | red | passed |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "audits evidence-first debug rounds without requiring a local discovery run" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "pins selected evidence variables and clears inherited pins without selection" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "accepts only matching complete CI receipts with nonempty logs" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "validates adapted legacy and fallback context through the same receipt path" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "fetches pinned attempts without branch discovery and filters unpinned discovery" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "emits complete receipts only after all selected job logs succeed" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "ends pinned diffs at selected commits with ancestral same-workflow baselines" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "keeps adopted GitHub context blocks equal to shipped blocks" | passed-accepted | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "routes selected evidence through context diagnosis and generation-scoped fixes" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "honors CI reproduction before remediation and blocks unreproduced failures" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/runs.test.ts` "requires selected other-workflow success at the exact pushed head" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "retains original and verifying run identities through close and auto handoff" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "checks the complete selected CI fix sequence against green and red final runs" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "reloads saved fixes and recollects explicitly replaced evidence generations" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "preserves local and repro overrides across actual workflow command sequences" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "blocks missing logs and wrong-branch evidence before source edits" | passed-accepted | passed |
| 12 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes local-only rounds through the actual Debug Step 3 commands" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes replacement CI evidence with the unchanged debug run number" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes the first CI evidence round of the second debug run" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects fork verification runs that shadow a red selected workflow at the same head" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "preserves the requested event for selected-workflow verification" | red | passed |

## Gaps

None.

## Already landed

- Task 7 `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "keeps adopted GitHub context blocks equal to shipped blocks" — passed at the group's red, and the tests step accepted it: existing CI and diff fenced bodies in .agents/context.md equal .bkit/templates/context/bkit-github.md; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "checks the complete selected CI fix sequence against green and red final runs" — passed at the group's red, and the tests step accepted it: implemented groups 1-3 retain exact attempt identity, defer actual local package gate until diagnosis/fix, and reject selected red run 302 despite configured CI success after green run 301; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "reloads saved fixes and recollects explicitly replaced evidence generations" — passed at the group's red, and the tests step accepted it: real fresh CLI processes reload saved generation/fix state and replacement run 124 starts generation 2 CI evidence without rerunning a locally passing gate; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "blocks missing logs and wrong-branch evidence before source edits" — passed at the group's red, and the tests step accepted it: shipped context script rejects unavailable pinned logs and real runs locate exits 82 on fix/other versus adopted fix/ci without writing a selection; no red is due
