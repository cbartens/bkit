Verdict: PASS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Task 14 clause workflow-error-file now names the ship path (ship-error.md); trimmed "it is" to stay under the text ceiling, removed ship's redundant "Ship: use the command's paths." (.bkit/instructions.md, .bkit/core/workflows/*.md, snapshots, scripts/gate/bkit-text-ceiling.json)
DONE — Gap 2: decisions check refusals and the tasks.ts comment name the decision-counts row, not the -engine.md file (.bkit/core/engine/commands/workflow/decisions.ts, tasks.ts)
DONE — Holistic gate: bkit tests changed exit 0 (bkit:gate:changed PASS)
