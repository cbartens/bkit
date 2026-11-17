Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3
Loosened: none
Fingerprint: 6c99fd347d6fd537b28f1d26d9cc47b6a442105cd7a561ff9b3fdf03b65443cc
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

TASK 3 is satisfied against the group diff (`build-diff-2-1.md`, commit `a81c34888`).

- `runUninstall` in `.bkit/core/engine/commands/install/uninstall.ts` reads `claudeAllowDerived` from `.bkit/version` once, before `buildDecisionTable` and its delete loop. A full uninstall therefore strips by the record even though the loop deletes `.bkit/version`. The plan placed the read beside `canonicalHashes` inside `buildDecisionTable`. Reading it just before that call has the same effect, and test 5 proves it.
- The `resolveClaudeDerivedAllows(ctx.cwd)` recompute and its import are gone from the strip. The record's rows are folded into the template instead.
- A review line goes through `ctx.logPrefix` for each remaining `WebFetch(domain:` / `mcp__` row the record lacks. The code picks these rows with a prefix regex, not by recomputing `resolveClaudeDerivedAllows`. That matches the task's "derived-looking" wording and what test 3 expects (`gone.example` is not in today's derived set). The architecture entry's narrower wording is not followed literally, but no `DONE WHEN` depends on it.
- A redacted review line goes out for each legacy `permission.bash` substring grant left after `stripOpencodeJsonScope`. It uses Task 2's `isOpencodeSubstringFetchKey` and `redactUrlParts`.
- `.bkit/core/.bkit/providers.md` Claude row is updated. Its mirrors are refreshed by Task 10.
- The 5 `TEST FIRST` integration tests and `strips allow/deny/ask together, including install's WebFetch enrichment` all ran and passed (6 passed, 113 filtered out; both files 119/119).
- `dist/` check: `tsc --outDir` into a scratch dir gave output identical to the committed `dist/`. This is the same comparison `pnpm bkit:check:dist` makes, run without deleting the tracked `dist/`.
- Test-first audit `build-tests-green-2-1.md`: Enforced true, 0 gaps, no Unproven, Updated-tests or Already-landed entries.
- The decision records `build-decision-1-*.md` are group 1 only and do not apply here.
- Errors and review lines use the `[bkit-uninstall]` prefix through `ctx.logPrefix`, per `docs/observability.md` § Log Format.

## Identified Gaps Log

None
