Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 27
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Group 8 holds TASK 26 and TASK 27, judged against `build-diff-8-1.md`. The brief has no `Deviations` section.
- Test-first audit (`build-tests-green-8-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. Both named tests went red, then green. No `Updated tests` or `Already landed` entries, so nothing is loosened.
- `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` re-run here: 76 of 76 passed.
- TASK 26 is not satisfied. The new test passes because it checks only for `edits files through the shell` and the target name. It does not check the fetch line that DONE WHEN requires. A live run of `.cursor/hooks/bkit-guardrails.cjs` returns `permission: ask` with an `agent_message` that has the shell notice and per-file checklist but no `Command requires confirmation: …` line. The cause is that the 7th argument of `shellEditContext` (`outside`) only counts against the budget and is never joined into the output. The Codex bridge joins the fetch note itself. The `user_message` stays the generic confirm text, as before.
- TASK 27 is satisfied:
  - `tokenizeSource` stamps each token's index (`t.i`), and `analyzePython` / `analyzeJs` have no `tokens.indexOf(t)` left.
  - The tokenizer, the per-token loops and the per-statement loops check `evidenceExpired(st)`. That function records the `deadline` limit through `evidenceLimit` (the same route the lexer uses), and the analyzers then return `unknown: true`.
  - All four installed `bkit-guardrails.cjs` copies and `.bkit/version` are regenerated.
  - Measured here: a 256 KiB `python3 -c` script took 0.47 s wall (DONE WHEN measured 4.4 s before the change).
- Decision records `build-decision-1-1` … `1-9` cover groups 1 to 6 and accept nothing in this group.
- `docs/observability.md`: no new error paths, so the logging check does not apply.

## Identified Gaps Log

1 gap.

TASK 26: `.bkit/core/.cursor/hooks/bkit-guardrails.cjs:84` — when `v.edits` is present, the `fetch` case passes `fetchLine` only as `shellEditContext`'s `outside` budget argument, which `.bkit/core/hooks/gateguard-engine.js:393` counts against the budget but never joins into its result; the `agent_message` therefore carries the shell notice and checklist but drops `Command requires confirmation: {command}` (live run of `.cursor/hooks/bkit-guardrails.cjs` confirms), unlike the Codex bridge (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:86`), which prepends `fetchNote` and a blank line to the edit context; DONE WHEN requires the fetch line plus the edit context — Fixable: true
