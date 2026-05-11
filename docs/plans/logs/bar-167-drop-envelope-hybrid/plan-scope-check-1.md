Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

Audit subject: `docs/plans/logs/bar-167-drop-envelope-hybrid/plan-v2-reviewed.md` (v2.0.0 bundle, Phases 1+2+3).

## Summary

- Template structure intact: all mandated sections present (Acceptance Scenario, Breaking Changes, Alternatives, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight, Data Schema Integration, Architecture & Component Changes, Documentation Updates, Rollback Strategy, Agent Execution Runbook with Gates 1–4, Verification Plan, Manual Verification).
- Eight plan-v3 critical fixes all preserved (verified below).
- Test-matrix ↔ runbook mapping is largely consistent; specific gaps noted under CRITICAL.
- Phase boundaries explicitly documented for SPLIT (lines 797–803) with hard cross-phase dependencies (Sub-plan B ⇐ Tasks 1, 4b, 6 of A; Sub-plan C ⇐ Task 19 of B). Boundaries are clean.
- No literal `PENDING` placeholders in body; only one occurrence at line 983 in reviewer notes (instructional, not a placeholder).
- Marker placement specs for `.github/workflows/ci.yml` (lines 593–616) and `.vale.ini` (line 620) are explicit; `slop-scan.config.json` is JSON deep-containment (lines 623–637) with the ten required rules enumerated inline.

### Eight plan-v3 critical fixes — preservation map

1. `deepContains` semantics (object-arrays order-insensitive, primitive subset, null-boundaries, ~60 LOC): Task 1 (line 813) + Architecture lines 362–368. PRESERVED.
2. Manifest reclassification (`tier: 1|2|3` → `format: "json"|"markered-text"|"byte-equal-text"`): Task 19 (line 878) + Architecture lines 646–665. PRESERVED.
3. `stripTier2JsonScope` JSON-aware uninstall: Task 4b (line 823) + Architecture lines 415–423. PRESERVED.
4. `bkit-uninstall.ts case 2` JSON dispatch extension: Task 4b spells out dormant-until-Task-19 sequencing. PRESERVED with explicit ordering caveat.
5. `bkit-preflight.ts` allow-list + three advisories (`legacy-bkit-envelope-detected`, `tier2-json-drift`, blocker `pre-envelope-bkit-version-detected`): Task 6 (line 834) + Architecture lines 402–409. PRESERVED. Plan correctly notes that the originally-proposed `canonicalHashes`-based version predicate is unimplementable and replaces with `__bkit__` presence.
6. Static fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/`: Task 0c (line 807) + Architecture lines 476–533 (full inline JSON content). PRESERVED.
7. Atomic-write migration in `runClaudeModule`/`runCursorModule`: Task 4 (line 821) + Architecture lines 387–399. PRESERVED.
8. Cursor v1 keyed-object schema (`hooks: { sessionStart, sessionStop }`): Task 5 (line 825) + Architecture lines 333–344. PRESERVED.

## CRITICAL

1. **Test-matrix row "Phase 2 marker presence (partial-ownership) for `.vale.ini`" lacks a runbook task that _verifies_ the marker covers exactly `StylesPath` + `Packages` + `MinAlertLevel` + House style enable.** Test matrix line 149 specifies the exact contents; Task 18 (line 872) only says "wrap `StylesPath`/`Packages`/`MinAlertLevel`/House style enable" but the verification step is `grep -c '^        # bkit:start' .agents/templates/.github/workflows/ci.yml returns 1` — that grep is for `ci.yml`, not `.vale.ini`. No verification command targets `.vale.ini` marker scope. The test-matrix row is ostensibly covered by Task 22 (`bkit-templates.test.ts`) but Task 22's Verify line (line 884) is `pnpm vitest run bkit-templates.test.ts green` without specifying that the test asserts the four `.vale.ini` keys. Add an explicit assertion in Task 22's spec OR a dedicated verification grep in Task 18 for `.vale.ini`.

2. **Test-matrix row "`.husky/pre-push` marker block survives consumer customisation" exists (line 154) but its corresponding runbook Task 23b (line 890) describes only "consumer's `bkit-repo only` lines below markers preserved" — there is no fixture defined.** Task 18a (line 874) verifies markers exist on bkit's own template but does not establish a _consumer-customised_ fixture. The integration test row in the matrix (Vitest integration) requires a fixture with consumer-added `bkit-repo only` lines. The fixture path is never named. Either name a fixture path (e.g. `tests/fixtures/husky-prepush-consumer-customised/`) and add a Task 0c-style fixture-creation sub-task, or fold the fixture into existing `tests/fixtures/heavy-customised-consumer*/` with explicit pre-push file content.

3. **Test-matrix row line 158 (`bkit uninstall .cursor/Dockerfile` safe-delete: hash-match vs consumer-modified)** maps loosely onto Task 25 (line 896) which says "integration test row in `bkit-modules.integration.test.ts`" — but no Task in the runbook _creates_ that integration test row. Task 10 (line 846) enumerates new integration tests for `bkit uninstall --claude/--cursor` but not for `--cursor/Dockerfile`. Add explicit task (e.g. Task 25b) or extend Task 10's enumeration to include the Dockerfile safe-delete row.

4. **Phase 1 net-deletion ≥ 200 LOC success criterion (line 45, line 67) is verified only at Task 7 (line 836) and Gate 2 (line 908) via `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'`.** This command compares against `dev`, but the bundled v2.0.0 PR will have Phase 2 marker additions that _increase_ template LOC, masking the Phase 1 deletion. Plan acknowledges this at line 45 ("Phase 1 deletion target is tracked separately") but does not specify how to isolate Phase 1's diff from Phase 2's additions when both ship in the same PR. Either (a) add a per-phase commit boundary marker the verification script can grep against, or (b) restrict the diff scope to the specific files Phase 1 deletes (`bkit-tier1-defaults.ts`, `bkit-tier1-defaults.test.ts`, the envelope blocks of the two JSON templates, and the four deleted symbols inside `bkit-tiers.ts`). Current verification command will show net _additions_ once Phase 2 markers are committed and the criterion will appear to fail.

## OPTIONAL

1. **Edge case "Phase 2: consumer file removed the markers entirely" (line 109)** says fallback is "append at EOF with a one-time advisory log." No runbook task implements `markers-missing` advisory or the EOF-append fallback. Either add this to Task 21 (line 882) preflight extension or to Task 6 advisories list.

2. **Task 14a (line 860) `package.json` version bump** is a hard prereq of Task 5 but is filed under "Phase 1 — Documentation" rather than "Phase 1 — Code (sequential)". Splittability listing at line 798 also misses Task 14a (lists "11–16" for Phase 1 sub-plan A — Task 14a is between 14 and 15, included implicitly, but not called out). Move into the Code section ahead of Task 5 to make ordering self-evident.

3. **Edge case "Consumer added a top-level `__bkit__` for their own purpose post-upgrade" (line 101)** is documented as out-of-scope with a "documented as collision risk in `docs/knowledge.md`" note. No runbook task adds this to KN-15 (Task 12 line 854 only adds the eight-turn-confusion narrative). Add to Task 12.

4. **Atomic-write fsync detail unspecified.** Task 4 (line 821) and Architecture line 393 say "write to `${dst}.bkit-tmp` → `fs.renameSync` over `dst`" but do not require `fs.fsyncSync` of the temp fd before rename. On crash mid-rename, the rename is durable but the temp file's contents may not be — a portability nit. If `docs/architecture.md` already documents the canonical atomic-write recipe, reference it; otherwise add a one-line spec.

5. **`tier2-text-drift` advisory key (lines 407, 685)** is reused for markered-text drift even though "tier" terminology is being removed in Phase 3. Plan calls out the rename consideration (line 685, "rename to `markered-block-drift` or similar in Phase 3 doc-block; advisory key string retained for backward-compat"). The advisory string is grep-visible to consumers — keeping `tier2-` is mildly inconsistent with KN-15 / DE-16 messaging but pragmatic. No action required if intentional; flag for reviewer awareness.

6. **`lint:no-tier-terms` script (Task 28, line 902)** uses inline `grep -v` filters or a small Node script — the plan defers the choice to the build agent. The exclusion list (`DE-5`, `DE-7`, `DE-8`, `KN-8`, `KN-13`) is plain prose; encoding it as a JSON config or top-of-script constant would make future audits easier.

## OUT OF SCOPE

1. **Splittability operationalisation:** the plan documents Phase 1 / Phase 2 / Phase 3 sub-plan boundaries (lines 797–803) but does not include a `bkit-split` script or workflow trigger. If the plan ever flips to SPLIT post-summary, the human still has to manually decompose. Track in `docs/pending.md` if recurrent.

2. **Consumer migration smoke-tests against `app-gether-life` and `visitfrasercoast-com`** are listed under Manual Verification (Steps 1–2, lines 951–957) but are explicitly OUT-OF-SCOPE per Decision 5. Listing them under "Manual Verification" is consistent with the plan-input charter but blurs the boundary — these are post-merge consumer validation, not v2.0.0 plan acceptance gates. Consider splitting Manual Verification into "Required pre-merge" (Steps 3–4) and "Recommended post-merge" (Steps 1–2).

3. **`.cursor/settings.json`, `.cursor/environment.json`** are listed in Architecture line 662 as `format: "json"` Phase-2 reclassifications but no runbook task verifies their deep-containment passes after reclassification. Out of explicit scope (no failure mode flagged in plan-input), but worth a verification grep in Task 24 (line 892).

## Verdict rationale

CONCERNS, not FAIL: template structure is intact, all eight critical fixes are preserved, phase boundaries are explicit, and matrix↔runbook mapping is mostly bidirectional. The four CRITICAL gaps are recoverable via task additions / wording tightening rather than structural rewrites. Apply via plan-update.

## Files referenced

- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-167-drop-envelope-hybrid/docs/plans/logs/bar-167-drop-envelope-hybrid/plan-v2-reviewed.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-167-drop-envelope-hybrid/docs/plans/logs/bar-167-drop-envelope-hybrid/plan-input.md`
- `/Users/christian/Documents/GitHub/bkit/.worktrees/bar-167-drop-envelope-hybrid/docs/plans/template.md`
