Verdict: FAIL
Failures: 12

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan 1, BAR-167 Phase 1)

## Sub-Plans Verified

N/A (Single scope)

## Integration Gaps

N/A (Single scope)

## Previously Attempted

None — first verification pass on sub-plan 1 (no prior `build-plan-verify-1-*.md` and no `build-plan-gaps-remediate-1-*-log.md` files).

## Notes

The execute-1 log claims work through Task 10 with PENDING verdict. Verification confirms all code-and-test tasks (0c, 0d, 0e, 1, 1b, 2, 3, 4, 4b, 5, 6, 8, 8b, 9, 10a, 14a) are implemented in the worktree. However, the execute log stopped before:

- finishing Task 7 cleanly (left a stale `bkit-modules.test.ts` block referencing deleted helpers — the suite will FAIL),
- finishing Task 10 sub-rows (`bkit uninstall --claude/--cursor` consumer-key survival; `slop-scan.config.json` drift row),
- the entire Documentation block (Tasks 11, 12, 13, 14, 15, 16),
- the final mandatory test/typecheck run (Task 7 verification + Gate 2/3/4 sign-off).

Tasks 10a, 14a, 0c–10 codebase artifacts are present and look correct in isolation; the doctor integration test for `tier2-json-drift` + `legacy-bkit-envelope-detected` is in place (`bkit-doctor.integration.test.ts:156`). Task 14a (version 2.0.0) confirmed in `package.json:3`. Templates (Task 5) verified clean of `__bkit__`.

Verdict: FAIL — Task 7 stale-test gap means `pnpm test` cannot pass; Tasks 11–16 doc deliverables are entirely missing and are required by Gate 3 and Sub-plan-A success criteria.

## Identified Gaps Log

GAP 1 — Task 7 (Delete obsolete code) — INCOMPLETE. `bkit-modules.test.ts:200-249` still contains the `P3.T4` and `P3.T5` describe blocks with assertions that reference deleted symbols `writeTier2Json`, `migrateTier1JsonToTier2`, and the deleted `__bkit__` envelope (e.g. `expect(template.__bkit__).toBeDefined()`). These tests will FAIL the moment `pnpm test` runs because the symbols/templates no longer exist. Action: delete `describe("P3.T4 — .claude/settings.json reclassified to Tier-2 JSON deep-merge (v0.8.0)")` and `describe("P3.T5 — .cursor/hooks.json reclassified to Tier-2 JSON deep-merge (v0.8.0)")` blocks (~50 LOC) — they were superseded by the BAR-167 Phase 1 deepContains/migrateLegacyBkitEnvelope tests in `bkit-tiers.test.ts` and the integration coverage in `bkit-modules.integration.test.ts`.

GAP 2 — Task 7 stale doc-comment in `bkit-upgrade.ts:21` references deleted `migrateTier1JsonToTier2` (`P3.T6 \`migrateTier1JsonToTier2\` from bkit-tiers.ts`). Action: remove stale comment lest it lie about current behaviour.

GAP 3 — Task 7 net-deletion verification command never run. Plan requires path-scoped `git diff --stat dev..HEAD -- '.agents/scripts/bkit-tier1-defaults.ts' '.agents/scripts/bkit-tier1-defaults.test.ts' '.agents/scripts/bkit-tiers.ts' '.agents/templates/.cursor/hooks.json' '.agents/templates/.claude/settings.json'` confirming >=200 LOC net deletion. Not captured in the execute log; must be run and recorded.

GAP 4 — Task 10 INCOMPLETE — missing sub-rows in `bkit-modules.integration.test.ts`. Present: `legacy-bkit-envelope-detected` (line 905), `tier2-json-drift` for `.cursor/hooks.json`/`.claude/settings.json` (line 940), `pre-envelope-bkit-version-detected` (line 968), Dockerfile safe-delete (line 1010). Missing: (a) `bkit uninstall --claude` consumer-key survival test (`hooks.Stop`, `failClosed` byte-identical retention) marked `// PREREQ: Task 19 reclassification`; (b) `bkit uninstall --cursor` consumer-key survival test (mirror) marked `// PREREQ: Task 19 reclassification`; (c) `tier2-json-drift` row for `slop-scan.config.json` (drop one of ten required `rules` keys → drift) marked `// PREREQ: Task 19 reclassification`. Plan permits these to be gated behind Sub-gate 2A in sub-plan B but they MUST land as commented stubs/skip blocks in Phase 1 so sub-plan B Task 19 only needs to flip the gate.

GAP 5 — Task 11 NOT DONE. `docs/decisions.md` does not contain DE-16 (grep "DE-16" — zero matches in actual decisions doc) and DE-7/DE-8 headers are NOT marked `(superseded by DE-16, 2026-05-09)`. Action: append DE-16 entry per plan's Documentation Updates section; edit DE-7 and DE-8 headers.

GAP 6 — Task 12 NOT DONE. `docs/knowledge.md` does not contain KN-15 (grep "KN-15" — zero matches in actual knowledge doc) and KN-8 header is NOT marked superseded. Action: append KN-15; edit KN-8 header to append `(superseded by KN-15, BAR-167, 2026-05-09)`.

GAP 7 — Task 13 NOT DONE. `docs/architecture.md:66,95,96` still refers to the dropped envelope contract: `Tier 2 JSON → __bkit__ envelope deep-merge (writeTier2Json; v0.8.0+)` and tree comments `Tier 2 JSON — { ...consumer, __bkit__: { ...bkitOwned } }`. Action: rewrite the Tier-2 JSON section per plan + update the ASCII tree annotations to deep-containment + format-aware language. (Residual `Tier [123]` strings outside this section may stay — swept in sub-plan C Task 27.)

GAP 8 — Task 14 NOT DONE. `CHANGELOG.md` head entry is `[1.1.1] — 2026-05-09` (line 9). No `[2.0.0]` (or `[2.0.0-alpha]`) entry exists. Action: append v2.0.0 entry per Breaking Changes §126-135 (envelope removal, public API deletions, `writeTier2Json` rename, Cursor v1 keyed-object schema flip, migration mechanic).

GAP 9 — Task 15 NOT DONE. `README.md` still contains six `__bkit__` user-facing mentions (lines 66, 68, 73, 87, 88, 89, 93 — section titled `__bkit__ envelope — consumer-visible behaviour (v0.8.0+)`). Action: replace with deep-containment / format-aware language per plan; keep historical context only via a back-reference to the CHANGELOG entry.

GAP 10 — Task 16 NOT DONE. `docs/pending.md` still does not contain a `bkit upgrade --prune` deferred entry, nor a "Drop decorative `.cursor/hooks.json` echoes" deferred entry. (The Cursor-v1 spike entry to delete is also absent in this worktree's `pending.md` — confirm whether it was ever there; if not, just add the two new entries.) Action: append the two new deferred entries per plan §407.

GAP 11 — Mandatory Tasks (Testing & Documentation) and Gate 2/3/4 sub-plan-A sign-offs are not ticked. The full `pnpm turbo lint typecheck format:check test` run was not captured; given GAP 1, that run will fail. Action: address GAPs 1-10 then run the full suite and tick the gates.

GAP 12 — Acceptance Scenario human-confirmation checkboxes (lines 118-119) and 🔒 Gate 1 checkboxes (lines 200-204) are unticked. These are human-gated and remain open; not blocking for build agent but must be flagged before Ship.
