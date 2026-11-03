Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

All code paths below are relative to `.bkit/core/engine/` unless otherwise stated. The design is included in `plan-input-1.md`; its capability gates and observed/configured distinction are preserved by the draft. No implementation or tests were run for this review.

<!-- prettier-ignore -->
| Task | Touched surfaces and downstream consumers | Risk and planned coverage |
| --- | --- | --- |
| 1 | `ledgers/status.ts` event contracts and `ledgers/telemetry.ts` outcome contract; read by workflow routing, run-facts, analysis, stats and harvest. | High-risk public persistence shapes. Additive fields, legacy absence and privacy validation are specified; the legacy-only red test needs correction below. |
| 2 | `commands/workflow/run-facts.ts` evidence fold, `MARK_ROWS`, session joins and duration calculations; close and the independent harvest reader consume them. | High-risk shared projection. Union, range recovery and timing tests exist, but the two timing classifiers are changed in different groups. |
| 3 | New `host-evidence.ts`, existing `hostChat` and `chatFingerprint`; consumed by `workflows.ts` `recordChat` and later commit attribution. | High-risk identity boundary. Pure conflicts and real process/receipt tests cover precedence, bounded ancestry, nonce ownership and symlinks. |
| 4 | Native model decoders in `run-facts.ts`, using the unshipped harvest as a format reference; consumed by the collector and context reporting. | High-risk untrusted local formats. Five format cases preserve selection/call distinctions, explicit child links and exact model ids. Task 13 retains actual-host proof. |
| 5 | New `model-evidence.ts` collector, child process and private snapshot acquisition; consumes native adapters and produces validated evidence. | High-risk filesystem/process/SQLite boundary. Real fixture databases, budgets, source footprint, permissions and cleanup are named. Disabled unproven acquisition is explicit. |
| 6 | Collector acknowledgement and `ledgers/status.ts`/`commands/workflow/status.ts`; consumed by every status writer, resume reader and cursor recovery. | High-risk concurrent persistence. Crash/replay tests are specified, but several ordinary writers are absent from the implementation surface and step rollback is untested. |
| 7 | `workflows.ts` lifecycle commands and `steps.ts` completion; start/resume, fail/handover/close and dispatch consumers. | High-risk shared lifecycle. Real repository fixtures cover new sessions, configuration snapshots and bounded failures; preserve the existing refused-commit transaction below. |
| 8 | `render/hosts.ts`, `render/models.ts`, native preflight/Antigravity hooks and all six workflow sources; consumed by installed host payloads and every agent spawn. | High-risk cross-host transport. Source/render audits and Task 13 prove different boundaries; no native selector is claimed available solely from a rendered file. |
| 9 | `ledgers.ts` `commitOwnSet`, `ownPathCommit`, `commitBookkeeping` and `retriggerCommit`; downstream callers include steps, workflows, branches, runs and roadmap. | High-risk shared publication helpers. Real Git tests cover singular lowercase trailers, byte idempotence, unknown identity and unrelated message preservation. |
| 10 | `branches.ts`, `prs.ts`, `runs.ts`, `roadmap.ts`, workflows/steps and direct workflow commit instructions; local Git and remote CLI/MCP merge consumers. | High-risk publication and backwards-compatible command bodies. Full commit-surface fixtures and actual remote result verification are required; matching-head and CI semantics are retained. |
| 11 | `run-facts.ts` `restateOutcome`, workflow close, `analysis.ts`, `stats.ts` and `scripts/harvest/bkit-harvest.mjs`; outcome readers and per-run reports. | High-risk persisted reporting. Outcome-only reads, legacy absence, CI restatement and harvest consistency are covered; the timing half must move earlier. |
| 12 | Source JSONL/CLI/provider/workflow/prompt documentation, architecture/testing/observability, generated `dist/` and installed mirrors. | Source-to-distribution compatibility. Fresh-consumer footprint and final mirror refresh address the supplied stale-mirror regression. |
| 13 | Actual supported host entrypoints, native records and source acquisition, recorded in `build-host-capabilities.md`. | External host boundary. Live ground truth, both nesting directions, concurrent chats and minimum-runtime/source-footprint proof are completion conditions; unavailable evidence cannot pass. |
| 14 | Actual CLI and MCP remote squash operations, recorded in `build-remote-trailers.md`. | External publication boundary. Submitted payload and resulting commit message are checked on an authorized disposable target. |

The language server was usable for the main checkout but could not activate the worktree and rejects ignored worktree paths. References from it were corroborated against the working tree's source; line citations below are from that source. The supplied failure artifact explicitly retains only 7 of 21 matched rows; the dropped portion was not supplied and is not treated as clean evidence.

## CRITICAL

1. **(plan edit) Task 6 does not reach the ordinary writers it promises to serialize.** `ledgers/status.ts:283` implements `appendLine` as a pure JSON-string formatter, not a file writer or lock. `ledgers/journal.ts:192`, `commands/workflow/runtime.ts:271` and `commands/workflow/counters.ts:524` append directly; the language-server caller trace also identifies test-run and challenge writers. Task 6 assigns only the collector, `ledgers/status.ts` and `commands/workflow/status.ts`, while later tasks do not assign serialization to those bypasses. A collector-only lock cannot establish the design's guarantee that ordinary status events cannot interleave a checkpoint. Add the existing direct-writer inventory to the plan, route each writer through one compatible serialized append boundary, and extend the named concurrency test to race real journal/runtime/counter/test/challenge writers against evidence writes. Preserve each caller's existing failure policy and bound collector lock waits. This is a change to a shared persistence contract, not an optional collector detail.

2. **(plan edit) New checkpoints need a regression test for refused step commits.** `commands/workflow/steps.ts:557` appends the step row before attempting its commit. Its rollback at `steps.ts:571` requires that exact row to remain the file tail; an intervening append returns the human-repair result at `steps.ts:585` instead of the retryable refusal with an unchanged attempt. Tasks 6/7 introduce concurrent evidence appends and collection at completed-step boundaries, but none of their tests names the existing hook-refusal/rollback behavior. Assign the transaction boundary explicitly and add a real repository test that refuses a step commit while evidence/journal activity is attempted, then verifies that the step attempt is unchanged, existing acknowledged evidence survives and retry writes the step exactly once. Also cover the successful step/checkpoint commit order so local evidence is not described as remotely durable before its commit. An append-only lock by itself does not define the append-through-commit/rollback transaction.

3. **(plan edit) The timing classifier changes re-enter a recorded parity regression before Task 11.** Task 2 adds observation events to the engine's `MARK_ROWS` in group 1, while `scripts/harvest/bkit-harvest.mjs` is first assigned to Task 11 in group 5. The existing test at `scripts/harvest/bkit-harvest.test.mjs:3021` reads the engine list and asserts exact equality with the harvest list, and harvest calculates timing using its own list at `scripts/harvest/bkit-harvest.mjs:1629`. The active knowledge row `mark-rows-copies-must-stay-in-parity` explicitly requires both copies to change together. Move the harvest classifier change and the associated behavioral/parity coverage into the same task/group as Task 2; leave outcome/report projection in Task 11. This prevents both an intermediate red check and inconsistent durations if the intermediate implementation is exercised.

4. **(plan edit) Task 1's legacy-only test has no discriminating red condition.** The planned `keeps legacy session rows readable` case fails only if new fields become mandatory. Current `commands/workflow/status.ts:110` already parses an arbitrary JSON object unchanged, `readStatusEvents` at line 128 forwards those rows, and `run-facts.ts:348` reads existing session fingerprints without requiring new fields. Thus the named behavior passes before this feature exists. Keep legacy preservation as a regression assertion, but make the task's red case exercise the new compatibility boundary—for example, a mixed legacy/new evidence stream through the new validated contract/projection, asserting that old absence remains `not recorded` while new explicit unknown and run linkage survive. Name the new failing behavior and owning implementation, rather than manufacturing a red by rejecting a legacy value current code already accepts.

## OPTIONAL

1. **High-risk shared boundaries are already identified above.** Keep validation of status/outcome contracts, resolver provenance, private acquisition, Git messages and rendered dispatch transport explicit in review evidence. No source-design change is required for these boundaries.

2. Task 8 touches native hooks with existing behavior unrelated to attribution. Retain the Antigravity deny-once/identical-retry behavior and hashed retry records (`.bkit/core/hooks/antigravity-hook.js:63`), and the repaired control-character-safe preflight JSON output. The supplied deferral history records both as prior fixes. Naming those existing regression suites in Task 8 would make preservation easier to verify without widening scope.

3. `restateOutcome` already spreads the existing outcome draft when enriching CI (`commands/workflow/run-facts.ts:477`), so its preservation assertion is valuable as a regression. Keep Task 11's first-failure proof on the new close/execution projection and report behavior, rather than treating the unchanged spread alone as new implementation.

4. The supplied failures include load-related timeouts in `runs.test.ts`. Task 10 touches that module. Retain its existing tests and record any recurrence as a failure; do not enlarge or remove the new collector's hard deadlines to make a heavily loaded test run green.

## OUT OF SCOPE

None. The listed findings repair the plan's existing persistence, timing and verification scope. Run cost, provider expansion, broad scans and historical rewrites remain the source design's non-goals.
