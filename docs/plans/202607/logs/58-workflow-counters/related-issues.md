# Related Issues — 58-workflow-counters

Search unavailable.

`mcp__github__search_issues` returned `total_count: 0` for every probe against this private repo:

| Query                                                                     | Result |
| ------------------------------------------------------------------------- | ------ |
| `counter attempt status.jsonl workflow in:title,body` (owner/repo params) | 0      |
| `counter attempt in:title,body` (owner/repo params)                       | 0      |
| `repo:cbartens/bkit counter-bus`                                          | 0      |
| **Control:** `repo:cbartens/bkit telemetry`                               | **0**  |

The control probe settles it: #234 is the master telemetry issue and its body is dense with the word `telemetry`, so a correct index cannot return 0. This is the search returning nothing, not an absence of related issues — recording `None.` here would falsify the plan record.

Known recurrence: the same failure was logged during the design workflow (`.bkit/friction.jsonl`, key `design-step-3-related-issues-search-silently-empty-on-private-repo`, scope `universal`, status OPEN). A same-key recurrence row was appended for this run (`recurrenceCount: 2`, `confidence: HIGH`) — the step is shared between bkit-design 3.1 and bkit-plan 3.1, so the defect is workflow-independent.

No `gh` substitution was made: the step specifies the MCP call, and ad-hoc CLI substitution is the anti-pattern #341 exists to remove.

## Related issues known from the issue body and comments (not from search)

These relationships are already carried verbatim in `plan-input.md`; listed here so the search gap costs no context.

- **#234** — master telemetry feature (`.bkit/stats.jsonl` + friction/deferrals/failures JSONL + harvest & analysis). #58 was closed as its duplicate on 2026-06-06, then reopened 2026-07-15: #234 absorbed the _measurement_ slice, not the _control-flow correctness_ slice. Owns the `counterSource` enum question (`"derived"` vs `"shell-bus"`), which #58 explicitly leaves to it. #58's original body is preserved verbatim as an archive comment on #234.
- **#209** — turned `status.json` (array) into append-only NDJSON `status.jsonl` with a fold. This is what makes derivation possible at all; #58's original stored-`counters` sketch predates it and is superseded because of it.
- **#232**, **#183**, **#233** — consolidated into #234 alongside #58 in the 2026-06-06 closure.
- **#341** — mapped `gh` fallback (6b/6c) and rule 6i (`trackers stay on MCP`); named in the design-run friction row as the eventual fix path for this exact search failure.
- **DE-25** — the SOAK starvation fix; cited as precedent for why attempt derivation must scope to the ACTIVE run rather than all runs.
- **KN-26** — "two complementary defences land together, cannot be split"; the shape of #58's load-bearing sequencing constraint (fail-closed cannot ship without the derivation).
- **#179 / #195** and memory `feedback_validate_shipped_config_with_real_tool` — the defect class of #58's Defect 4: a test asserting the shape that was built rather than the behaviour required, staying green while the bug ships.
- **`docs/decisions.jsonl`** → key `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (status ACTIVE) — the agreed design record this plan must implement.
