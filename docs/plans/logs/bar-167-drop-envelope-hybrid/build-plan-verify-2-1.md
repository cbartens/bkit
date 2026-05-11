Verdict: CONCERNS
Failures: 7

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan B / Phase 2)

## Sub-Plans Verified

N/A

## Integration Gaps

N/A

## Previously Attempted

None — attempt 1.

## Notes

Verified Tasks 17-23b implemented with codebase evidence:

- Group A (12 files): all have exactly one `bkit:start` / `bkit:end` pair. Confirmed for AGENTS.md (3/67), CLAUDE.md (3/7), .cursor/rules/00-shared-rules.mdc (6/10), .vale/styles/House/{Filler.yml (1/11), Hedging.yml (1/12), LLMSlop.yml (1/13), Verbose.yml (1/12)}, .agents/{rules.md (1/94), docs.md (1/129), friction.md (1/32), skills.md (1/37)}, docs/plans/template.md (3/359).
- Group B: `.github/workflows/ci.yml` indented `# bkit:start` at line 23 + `# bkit:end` at line 51 (6-space indent); `.vale.ini` `# bkit:start`/`bkit:end` at 1/8; `.husky/pre-push` markers at 2/6.
- `slop-scan.config.json`: all 10 required rule keys present with `enabled: true`; `comments.placeholder-comments` weight 1.5 confirmed.
- `bkit-manifest.ts`: schema simplified to `{ path, format, module, packageJsonKeys? }`; `tier` integer field fully removed; format field uses `"json" | "markered-text" | "byte-equal-text"`; all 6 module manifests updated.
- `bkit-uninstall.ts`: `switch (entry.format)` single-dispatch at line 219; legacy `case 1/2/3` removed.
- `bkit-preflight.ts`: `detectTier2TextDrift` added at line 421; advisory `tier2-text-drift` at line 467 follows `[Context] Message` regex.
- `bkit-templates.test.ts`: 54 marker-presence tests for Group A html/hash markers, Group B ci.yml/.vale.ini partial-ownership, slop-scan.config.json 10 required rules, `.husky/pre-push` pre-existing markers.
- `bkit-modules.integration.test.ts`: Task 23 (tier2-text-drift) + Task 23b (`.husky/pre-push` survival) tests added.
- `bkit-modules.upgrade.integration.test.ts`: Task 23a heavy-customised ci.yml outside-marker survival + inside-marker drift detection sub-tests added.

Gaps (see log below): Task 24 zero-drift verification not run (execute log ends at Task 23b); Gates 2/3/4 not verified; Acceptance Scenario human checkboxes unchecked; Task 20 dispatch refactor incomplete in bkit-modules.ts (still hardcoded `writeTier1`/`writeTier2`/`writeTier3` per path) — softer concern: manifest no longer carries `tier`, install per-file functions are correctly invoked per format-equivalent path mapping; Task 23 + Task 23a (ii) inside-marker drift tests document indented-marker limitation and accept `result === null` as passing, which means drift detection for `ci.yml` is not actually working end-to-end (only the boundary is asserted, not the success path).

## Identified Gaps Log

GAP 1 — Task 24 (Phase 2 zero-drift verification) not executed. Plan line 361: "Run `pnpm bkit install` against worktree; run `pnpm bkit check`; assert `Done. 0 write(s).` and zero advisories." Execute log ends at Task 23b — Task 24 never run. Required for Sub-plan B success criterion 1.

GAP 2 — Gate 2 (sub-plan B) not verified. Requires `pnpm turbo lint typecheck format:check test` clean + Phase 1 net LOC delta re-verification. No log entry / no test results captured.

GAP 3 — Gate 3 (sub-plan B) not verified. Requires confirming docs (DE-16/KN-15) accurately describe Phase 2 markers; Mandatory Tasks unchecked (Verify test coverage / Write new tests / Verify observability `[Context] Message` regex).

GAP 4 — Gate 4 (sub-plan B) automated verification unchecked. CLI smoke test (`pnpm bkit install --core --claude --cursor --ci --lint --git-hooks` + `pnpm bkit check`) not executed; full test suite green status not recorded.

GAP 5 — Task 20 dispatch refactor incomplete in `bkit-modules.ts`. Plan asks for replacing `entry.tier` switches with `entry.format` switches in install/check/uninstall across `bkit-install.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`. Only `bkit-uninstall.ts` has a clean `switch (entry.format)`. `bkit-modules.ts` still uses path-hardcoded `writeTier1`/`writeTier2`/`writeTier3` calls (lines 167, 204, 504, 606, 633, 851, 934, 959, 971, 991, 1095) and still imports/uses `tier1Files`/`tier3Files` arrays (498, 596, 613) plus `tier3Hashes` (361, 396). Manifest no longer carries `tier`, but dispatch logic is not unified — soft regression risk if tier1/2/3 helper boundaries diverge from format taxonomy.

GAP 6 — Inside-marker drift detection has documented limitation. `bkit-modules.integration.test.ts` line 1216-1223: "ci.yml uses indented markers not supported by extractManagedBlock. Drift detection for ci.yml will be handled by a dedicated partial-block detector in a future sub-plan iteration. For now: null is the expected result." Task 23a (ii) assertion at upgrade.integration.test.ts:341 accepts `result === null || result?.id === "tier2-text-drift"` — effectively non-binding. The Phase 2 acceptance promise that "a teammate edits ci.yml and inadvertently deletes the `pnpm bkit check` line inside the marker block — `bkit check` flags `tier2-text-drift`" is therefore NOT enforced for the indented ci.yml marker case in the current implementation; only documented as future work.

GAP 7 — Acceptance Scenario human checkboxes (lines 99-100), Gate 1 prerequisites (164), Mandatory testing/docs checkboxes (369-371), Verification Plan automated test boxes (382-387), and Manual Verification steps (395-399) all remain `[ ]`. None of these are blockers per se, but Gate 1 prerequisites including "Sub-plan A predecessor Tasks 1, 4b, 6 merged" is not formally re-confirmed in the execute log.
