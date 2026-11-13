Verdict: PASS
Failures: 0
Fixable: false
Tasks: 26, 27
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

- `build-plan-verify-8-1.md`: CONCERNS, 1 gap (TASK 26: the Cursor `fetch` case passed the fetch line only as `shellEditContext`'s `outside` budget argument, so the `agent_message` dropped `Command requires confirmation: …`).
- `build-plan-gaps-remediate-8-1-log.md`: PASS, fixed that gap by prepending the fetch line and a blank line to the edit context in `.bkit/core/.cursor/hooks/bkit-guardrails.cjs` and `.cursor/hooks/bkit-guardrails.cjs`.

## Notes

- Group 8 holds TASK 26 and TASK 27, judged against `build-diff-8-2.md`. The brief has no `Deviations` section.
- Test-first audit (`build-tests-green-8-2.md`): `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`. Both named tests went red, then green. It has no `Updated tests` or `Already landed` entries, so nothing is loosened.
- `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` re-run here: 76 of 76 passed, including `keeps edit advice beside an off-list fetch` and `analyses dense script sources in linear time`.
- TASK 26 is satisfied:
  - The Cursor `fetch` case now returns `ask` with the unchanged `user_message`, and an `agent_message` of `Command requires confirmation: {command}`, a blank line, then `shellEditContext(shellEditAdvisory(v.edits), v.edits, ctx, session, undefined, ADVICE_BUDGETS.cursor, fetchLine)`. Without `v.edits` it returns the fetch line alone. This matches the Codex bridge's `fetchNote` composition.
  - The source and `.cursor/hooks/bkit-guardrails.cjs` fetch cases are identical.
  - Live run of `.cursor/hooks/bkit-guardrails.cjs` on `curl https://off-list.example/x -o /dev/null && sed -i s/a/b/ docs/testing.md`: `permission: ask`, and the `agent_message` holds the fetch line, the shell notice naming `docs/testing.md` and the per-file GateGuard checklist.
- TASK 27 is satisfied:
  - `tokenizeSource` stamps each token's index (`t.i`), and no `tokens.indexOf` remains in `.bkit/core/hooks/guardrails-shell.js` or any of the four installed `bkit-guardrails.cjs` copies.
  - The tokenizer, both per-token loops and both per-statement loops check `evidenceExpired(st)`, and the analyzers then report `unknown: true`.
  - Measured here on `.cursor/hooks/bkit-guardrails.cjs`: `node -e '<250 KiB of a;>'` returned `allow` in 248 ms wall, and `python3 -c '<256 KiB of a.b\n>'` in 228 ms wall (DONE WHEN measured 8.9 s and 4.4 s before the change). Both carry the uncertainty or analysis-limit notice.
- Out-of-scope observations (not gaps; for the owner to consider separately):
  - The planned test `keeps edit advice beside an off-list fetch` does not assert the `Command requires confirmation` line, so a regression of the TASK 26 gap would not fail it. The TEST FIRST field names only the shell-notice check, so the test matches the plan as written.
  - Inside an `ask`, the shared shell notice still says `The command is allowed.` The Codex bridge has the same wording, so this predates group 8.
- Decision records `build-decision-1-1` to `1-9` cover groups 1 to 6 and accept nothing in this group.
- `docs/observability.md`: group 8 adds no error paths, so the logging check does not apply.
- `docs/testing.md` is present. Both new tests are integration tests that spawn the real rendered hook, with no mocks.

## Identified Gaps Log

None
