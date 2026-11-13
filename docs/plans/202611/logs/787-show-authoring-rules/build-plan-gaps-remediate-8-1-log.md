Verdict: PASS
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 26 Cursor fetch case dropped the fetch line when edits present — now prepends the fetch line and a blank line to the edit context (.bkit/core/.cursor/hooks/bkit-guardrails.cjs, .cursor/hooks/bkit-guardrails.cjs). The planned test "keeps edit advice beside an off-list fetch" is restored to the tests step's version, so it does not assert the fetch line; the tests step should strengthen it.
DONE — bkit:generate and bkit tests changed: exit 0 (gate:changed PASS)
