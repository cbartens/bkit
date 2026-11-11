Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Debug Failure

## Remediation Log
DONE — Step 1: Delegate initial dev target resolution to branches sync — Removed the raw Git fence; origin/dev resolves through the existing public target contract (.bkit/core/workflows/bkit-ship.md)
DONE — Step 2: Preserve pinned conflict continuation — Emitted target remains MERGE_TARGET; explicit-SHA continuation unchanged; focused syntax 15/15, invariants 61/61 and continuation 1/1 pass (.bkit/core/workflows/bkit-ship.md)
DONE — Step 3: Synchronise authoritative workflow and generated copies — Catalog and instruction registry refreshed; bkit:generate passed with 288 render tests (tmp/build-failure-remediate-1-generate.log)
DONE — Step 4: Verify generated consumer and changed-file gate — Fresh install/upgrade/check passed on all five hosts; resolver artifacts retain the pinned SHA flag; instruction check and tests changed passed with exit 0 (tmp/build-failure-remediate-1-changed.log)
DONE — Step 5: Record verified bug and gotcha — Appended closed workflow raw-Git failure and active engine target-resolution knowledge; no architecture decision required (docs/failures.jsonl, docs/knowledge.jsonl)
