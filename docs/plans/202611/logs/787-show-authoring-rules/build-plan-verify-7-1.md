Verdict: PASS
Failures: 0
Fixable: false
Tasks: 28, 29
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 28 satisfied. `.bkit/core/hooks/guardrails-shell.js` adds `st.madeDirs` (filled by a new `mkdir` case in `evalCommand`; a dynamic `mkdir` operand reports `unresolved-target`), `isDirDest(dest, cwd, st)` reads a directory made earlier in the line as a directory, and `markCopied` reports `unresolved-target` for a dynamic (glob) source into a directory instead of `continue`. Live probes against the installed `.cursor/hooks/bkit-guardrails.cjs`: `mkdir -p /tmp/... && cp tpl.sh /tmp/... && bash /tmp/.../tpl.sh` names `docs/x.md`; `mkdir bkp-nd && cp tpl.py bkp-nd && python3 bkp-nd/tpl.py` names `src/copied.py`; `mkdir bkp-nd && mv tpl.py bkp-nd && python3 bkp-nd/tpl.py` names `src/copied.py`; `cp t*.sh /tmp/ && bash /tmp/tpl.sh`, `cp t*.py /tmp/ && python3 /tmp/tpl.py` and `cp t*.py sub/ && python3 sub/tpl.py` report "cannot be determined"; with a non-literal working directory (`cd "$X" && mkdir nd && cp ...`) the copy reports "cannot be determined". `cat tpl.py` stays silent.
- TASK 29 satisfied. The four installed `bkit-guardrails.cjs` copies carry the task 28 change and the two-line remote-name `else` branch; `.bkit/version` hashes for the `.claude`, `.codex` and `.cursor` copies match `shasum -a 256` of the files; `node dist/cli.js check` exits 0 with no tracked-file change; the four `T6` mirror tests (cursor, claude, codex, agents) pass.
- `pnpm exec vitest run .bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts .bkit/core/engine/commands/workflow/steps.test.ts`: 2 files, 192 tests passed. The full suite is left to the group gate (`bkit:gate:static-unit`); `build-plan-tasks-7-log.md` says the code step did not run it because the tests lock was held.
- Test-first audit (`build-tests-green-7-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` sections; all five planned tests went red then green.
- The plan's task 29 `TEST FIRST` now names the four per-host tests that the tests step wrote; the brief still shows the earlier describe name `T6 — guardrails.cjs installed mirror is its rendered template`. The plan wins.
- Out-of-plan change in the group diff: commit `812ea2197` (`touchedTests` gains an optional `plan` argument and skips red records for test names the plan no longer lists; new `runPlanPath`; `dist/` rebuilt; two new tests in `steps.test.ts`, passing). No group 7 task owns it, it does not affect task 28 or 29, and it is not logged as a gap.
- `build-decision-1-9.md` Q7 and Q8 ("Fix now") are the source of tasks 28 and 29; Q2-Q6 are owner accepts for group 6 and are outside this group.
- Docs: `docs/testing.md`, `docs/observability.md` and `docs/security.md` exist. The change adds no error path, so it adds no logging duty.

## Identified Gaps Log

None

