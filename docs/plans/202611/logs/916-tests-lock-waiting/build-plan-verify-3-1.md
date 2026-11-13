Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 7, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Judged against `build-diff-3-1.md` (commits `e5cffa253` plan-tests and `c496efbbb` plan-execute). The brief has no `Deviations` section. No decision records, earlier group 3 verify reports or remediation logs exist.

Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests` or `Already landed` sections, so nothing to decide.

DONE WHEN checks run here:

- One run under the tests lock of every file named in the TASK 7, 8 and 9 DONE WHEN fields, plus `tests-jump.test.ts` and `conventions.test.ts`: 14 files, 688 tests, all pass. `node --test` on both `bkit-test-awake.test.mjs` copies: 42 pass.
- TASK 7: `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n` on the template exits 0. The scan sorts marked lines first (newest marker first), deletes markers naming no live ticket or held place, and the helper deletes its own markers on take, but not in `try` mode.
- TASK 8: the verb lives in a sibling file `.bkit/core/engine/commands/workflow/tests-jump.ts`, registered as `jump` in `testsCommand`, the same pattern as `testsChangedVerb`; `conventions.test.ts` lists it as a helper source. It reads the queue without creating it, writes the marker through a temp file plus rename, and never touches the lock, `.holder` or slot files. `.bkit/cli.md` lists `jump`; `dist/commands/workflow/tests-jump.js` and `dist/commands/workflow/tests.js` are in `c496efbbb`; `node dist/cli.js tests jump --help` says each use needs the human's approval. The `run` argument is the full waiting-run name the waiting note prints (for example `bkit tests run <gate> <fid> <step>`), and the help says so.
- TASK 9: the Claude and OpenCode globs are `*bkit*tests jump*` rather than the plan's `*bkit tests jump*`. This is wider, so it also catches the quoted path form `"/repo/node_modules/.bin/bkit" tests jump`, and the path-prefixed test proves it. `.bkit/instructions.md` gained the matching `ask-tests-jump` and `guardrails-codex-tests-jump` entries. The Codex deny is keyed on the hook's own filename (`IS_CODEX_HOOK`) inside the managed block; the drivers are unchanged.
- TASK 10: the § Machine lock, § Permissions and § Tests lock diffs print nothing. The plan's `sed -n '/^## Codex CLI/,/^## /p'` matches nothing, because the heading is `### Codex CLI`; the same diff with `###` prints nothing either. `grep -c "tests jump" .claude/settings.json` prints 3. `node dist/cli.js check` reports `4 write(s) would occur — DRIFT DETECTED`, so TASK 10 is not satisfied (see the log).

Out of scope, for the owner: none found.

## Identified Gaps Log

1 gap.

TASK 10: `node dist/cli.js check` reports DRIFT DETECTED (4 writes: `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs`, `.agents/plugins/bkit/hooks/bkit-guardrails.cjs`, `.bkit/version` pin) — the committed mirrors split `const IS_CODEX_HOOK` over three lines while `.bkit/core/hooks/guardrails-tiers.js:180-181` renders it on two (a 100-char line), so the mirrors no longer match the render; DONE WHEN "after `pnpm build`, `node dist/cli.js check` reports no drift" fails (group 1 verify recorded 0 writes) — Fixable: true
