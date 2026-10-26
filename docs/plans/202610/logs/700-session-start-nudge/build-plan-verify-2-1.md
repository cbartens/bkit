Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 2` (one group) — `GROUP 2: References and close-out`, TASK 4 and TASK 5. Judged against `build-diff-2-1.md` (the changes since group 2 started), not the whole branch.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verification attempt for group 2 (`build-plan-verify-2-*` glob matched nothing; no `build-plan-gaps-remediate-2-*-log.md`, no `build-decision-*.md` supplied).

## Notes

- **Mode:** `Group`. Plan caps respected: group 2 holds 2 tasks (cap 3); no `TEST FIRST` tests in the group (both tasks are `n/a — docs` / `n/a — install regeneration`), under the 15-test cap.
- **Test-first audit** (`build-tests-green-2-1.md`): `Enforced: true`, `Gaps: 0`, `Test order only: false` → no test-first gaps to map. No `Late-red check` section.
- **Plan currency** (`build-plan-current.md`): `PASS`, `Affected: 0` → no task invalidated by later changes.
- **No decision record supplied** (`build-decision-*` glob empty) → no gap accepted by a decision record.
- **TASK 4** — every `DONE WHEN` clause holds in the codebase:
  - `.bkit/core/.bkit/providers.md` § Hooks parts table carries one row each for `preflight-rules.sh` (line 303) and `session-rules-advisory.js` (line 304); new `### Rules-read advisory` subsection (line 308) records the advisory, its per-host delivery table, the Codex two-group matcher (`**Codex registration:**`, two single-value `PreToolUse` groups `apply_patch` / `Bash`) and the `**Dedup scope:**` (once per session, per-host session id, OS-temp state, 24h GC, no-session-id shared bucket).
  - `docs/architecture.md` § Consumer Integration Model (line 172) names the three hook files (`.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs`, `.opencode/plugin/bkit-rules.js`) and the two shared parts (`preflight-rules.sh`, `session-rules-advisory.js`), and records the advisory on both `bkit-preflight.sh` hooks.
  - `docs/testing.md` § Key test files names the new `session-rules-advisory.integration.test.ts` (line 598) and the changed IDE-skip scope of `preflight-sh.integration.test.ts` (line 597).
  - Ledger rows exist: knowledge `kn-hooks-sessionstart-stdout-is-one-json-document` (ACTIVE, appended by `build-plan-execute`); decision `700-session-start-rules-read-advisory` (ACTIVE — `description` records the shipped shape: two single-value Codex groups, no `export` on the JS part, the sentence duplicated per language); deferrals `700-first-action-deny-gate`, `700-rules-content-hash-acknowledgement`, `700-provider-auto-load-rules` (all OPEN).
- **TASK 5** — every `DONE WHEN` clause holds:
  - `bkit install` artifacts exist: `.opencode/plugin/bkit-rules.js`, `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs`; plus refreshed `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.opencode/opencode.json` (plugin array gains `./plugin/bkit-rules.js`), `.codex/hooks.json` (two `PreToolUse` groups for `bkit-rules.cjs`), `.agents/plugins/bkit/hooks.json` (one `PreToolUse` group), `.bkit/providers.md`.
  - `pnpm bkit check` exits 0 with `0 write(s) would occur` → drift-clean.
  - Every rendered (installed) and mirrored rules / preflight hook carries the advisory (`.agents/rules.md`) and none names `AGENTS.md`. The four `.claude` / `.cursor` / `.opencode` / `.codex` / `.agents` `bkit-gateguard` hits on `AGENTS.md` are pre-existing path-matching prose scope, not the rules advisory, and out of group-2 scope.
- **Independent spot-checks run:** `npx vitest run` on `session-rules-advisory.integration.test.ts` + `preflight-sh.integration.test.ts` → 22 passed; on `shipped-docs-refs.test.ts` + `parts.test.ts` → 286 passed; `.bkit/core/.bkit/providers.md` carries no tracker number / ledger key (shipped-doc rule). Execute log's full-suite claim (`pnpm test` 7861 passed / 1 skipped; `pnpm bkit:gate:static` exit 0) left as its own evidence — Group scope does not gate on `pnpm bkit:gate:static-unit`.
- **Mandatory tasks:** every `Derived Test Matrix` row maps to a group-1 task (1/2/3), none to group 2; the group-1 mapping is outside this group's diff and was settled in group 1's verification. Group 2's two tasks add no tests (`TEST FIRST: n/a`), so no `DONE WHEN` test to sweep; every `Documentation Updates` row is done (7 rows: source `providers.md`, mirror `providers.md`, `architecture.md`, `testing.md`, `decisions.jsonl`, `deferrals.jsonl`, `knowledge.jsonl`); errors remain fail-open per `docs/observability.md`, unchanged.
- **Reported, not fixed** (out-of-scope notes from the execute log — one-line doc/label corrections, not named in TASK 4/5): `parts.test.ts` it-name still reads "sixteen host hooks" against 19 entries; `docs/testing.md` § Key test files `parts.test.ts` row still says "nine host hook templates"; `preflight-sh.integration.test.ts` file-header comment still says the IDE-skip path "exits 0 silently". None gates a `DONE WHEN` here.

## Identified Gaps Log

None
