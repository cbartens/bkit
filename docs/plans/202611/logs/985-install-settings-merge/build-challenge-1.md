Verdict: PASS
Failures: 0
Fingerprint: ba7795ada35f112d7a94d6b6fd790789875c5351e7de63a39c63e073341934be
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Inputs: `docs/plans/202611/985-install-settings-merge-plan.md` and `tmp/bkit-diff-985-install-settings-merge.md`, read in full (no `partial diff coverage` line).
- Code traced: `.bkit/core/engine/install/write.ts` (`deepContains`, `mergeManagedList`, `mergeManagedJson`, the retired-list helpers, `writeTier2JsonContained`); `.bkit/core/engine/commands/install/upgrade.ts` (`runUpgrade` JSON branch, the `enrichClaudeSettingsAllows` call at 1016-1029, `runUpgradeAdvisories` at 1082); `.bkit/core/engine/install/modules/claude.ts` (`runClaudeModule`, `enrichClaudeSettingsAllows`); `.bkit/core/engine/install/cloud-env.ts` (`extractConsumerListBlock`, `extractMcpServers`, `resolveClaudeDerivedAllows`); `.bkit/core/engine/commands/install/install.ts` (dispatch, post-write refresh, checklist); `.bkit/core/engine/commands/install/check.ts` (`reportCheckDrift`); `.bkit/core/engine/shared/json.ts` (`parseJson`); the call sites in `cursor.ts`, `codex.ts` and `antigravity.ts`.
- Docs: `.agents/docs.md`; `docs/architecture.md`; `docs/security.md` (Trust boundaries through Untrusted Content); `docs/migrations.md` (rules and the new row); `docs/knowledge.jsonl` and `docs/capabilities.md` searched for the settings merge (KN-8, KN-17 and KN-19 apply, and the diff keeps all three: deep containment, template wins, malformed JSON throws); `docs/data-schema.md` header (no schema change). `.bkit/workflows.md`, `.bkit/prompts.md`, `.agents/skills.md` and `docs/observability.md` were not loaded in full: they cover workflows, subagents, skills and logging, which the diff does not touch.
- Not run: no test, build or install (mandate).

## Vectors Checked Without a Finding

- Null and shape: a `null` or array root, an array `permissions`, a non-array `allow`, non-string items and inherited keys all come back unchanged from the prune and the find; malformed JSON still throws before the prune.
- Boundaries: the file matches when the destination is relative, absolute, uses backslashes or starts with `./`; the stem strips only one trailing `*`.
- Error paths: `assertRetirableEntry` throws before any file match and before any write, so a bad list entry fails closed; no `catch` wraps the prune.
- Dry run and real run record the same single `.claude/settings.json` write in each traced case: retired grant present and not derived; present, recorded in `claudeAllowDerived` and no longer derived; `Linear` in `mcp-servers`. On install, `enrichClaudeSettingsAllows` dedupes by path; upgrade uses its own `WriteSet`.
- Convergence: `derivedKeep` is passed on both the install and the upgrade path, so a derived retired value is neither pruned nor re-added; a second run is contained and unchanged and writes nothing.
- Provenance: a real run prunes before enrichment reads the file, so `claudeAllowDerived` drops the retired grant and leaves no orphaned record.
- A rewrite triggered only by the prune goes through `mergeManagedJson` (lists reordered to template order, bkit hook groups replaced). This follows the ownership model in `.bkit/core/.bkit/install.md` § JSON ownership model that every drift merge already uses, so it opens no new data-loss path.

## Notes

- The three LOW round-1 findings deferred in `docs/deferrals.jsonl` (`985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-408`, `-513`, `-516`) are not raised again.
- Observation, no task, because no test can fail on the current code: `upgrade.integration.test.ts` `upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's` asserts `toContain("0 write(s) would occur")`. That assertion also matches `10 write(s) would occur`, and the test never checks the exit status of `check`. In `claude.integration.test.ts` `dry run over a seeded old-shape settings file reports the file as drift and names the retired entry`, the seed lacks the template's entries, so the drift assertion holds even without the prune; the advisory assertion is what carries the test. The upgrade half of task 6 (`runUpgrade` passing `derivedKeep`) has no test of its own.
- Cosmetic, not raised: a real `bkit upgrade` reports an edited copy twice (the `console.warn` in `runUpgrade`, then the checklist from `runUpgradeAdvisories`); a retired value listed twice in `allow` is named twice in the advisory.
