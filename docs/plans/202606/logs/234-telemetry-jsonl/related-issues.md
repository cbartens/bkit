# Related issues

Search (`telemetry jsonl stats friction compliance counters in:title,body`) surfaced only #234 itself.

The four consolidated source issues are **closed as duplicates** and their full content is embedded in `design-input.md`:

- **#232** — bkit-comply empirical compliance eval (deterministic grader, central JSONL store, harvest+analysis)
- **#183** — LOC vs PR error rate (size↔outcome regression over the same substrate)
- **#233** — friction collection utility (friction → JSONL + harvest script)
- **#58** — workflow counters status.json shell (deterministic prose→shell counter refactor)

Parent review: **#230** (affaan/ECC adoption) — items A (GateGuard PreToolUse hook) + D (config-protection) shipped in `7732d69`; item E provenance stamping reverted in `611b438` (repo-bricking footgun); item B (eval layer) **is** this issue. The compliance grader (#232) shares rule-spec / path-table concepts with the now-shipped GateGuard (A) and config-protection (D).

None currently open beyond #234.
