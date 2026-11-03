Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md` (CONCERNS, 2 gaps: Task 1 missing `detect` assertion in `tools.test.ts`; Task 3 `pnpm bkit:graph:check` drift on `docs/capabilities.md`).
- `build-plan-gaps-remediate-1-1-log.md`: both gaps marked DONE in commit 3d7496844; one BLOCKED line about `bkit:generate` (see Notes).

## Notes

- Attempt-1 gap 1 is resolved: `tools.test.ts:72` now asserts `expect(result!.detect).toContain("bkit:lint:prose")`.
- Attempt-1 gap 2 is resolved: `pnpm bkit:graph:check` exits 0 and reports `docs/capabilities.md matches a rebuild at 3d7496844`.
- Task 1 is satisfied. The `lint:prose` / `slop:delta` grep over non-test files in `.bkit/core/engine`, `.bkit/templates/.github/`, `.bkit/templates/.husky/` and `.bkit/core/.bkit/templates.md` is empty. Root `package.json` has only the `bkit:lint:prose` / `bkit:slop:delta` keys. `detectValeMissing` reads `scripts["bkit:lint:prose"]` (`tools.ts:35`). The `tools.test.ts` old-name grep is empty. `pnpm bkit:gate:static` exits 0 (slop net 0).
- Task 2 is satisfied. The `find` for unprefixed files under `.bkit/templates/scripts` and `.bkit/templates/context` is empty, and the `git grep` for old launchd source paths in the named dirs is empty.
- Task 3 is satisfied. The `pnpm graph` and old-name greps over `.bkit/templates`, `.bkit/core/.bkit`, `.bkit/core/engine/checks` and `docs/templates/bkit-audit-duplication.md` are empty. Root `package.json` has no `graph*` key, and `bkit:generate` calls `pnpm bkit:graph:refresh`. `branding.test.ts:77` checks the seeded `scripts/foo.sh` is flagged.
- Test run: the 12 named test files (manifest, template-ci-yml, core.integration, tools, after/index, release-workflow, dogfood-templates, templates-content, catalogue, husky-pre-push.integration, branding, local-gate-audit) pass: 638 passed, 2 skipped. The 2 skips are pre-existing `local-gate-audit.test.ts` cases outside this group's diff.
- Test-first audit (`build-tests-green-1-2.md`): Enforced true, Unproven 0, no Updated tests section; all 12 planned tests are green.
- Test-first audit, `delete-still-referenced` (both Task 2 gaps): no gap. `ai.bkit.launchd` hits name the kept plist Label or the install destination `~/Library/LaunchAgents/ai.bkit.launchd.plist`; `launchd.env` hits name the destination `~/.config/bkit/launchd.env`. The only hits still naming the old template source paths are the rendered mirror `.bkit/templates.md:423-424, 430, 433`, which Task 12 regenerates, plus ledger rows in `docs/decisions.jsonl:448` and `docs/deferrals.jsonl:104` that describe the rename.
- Test-first audit, `Already landed`: Task 3 `branding.test.ts` "consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code". Reason the tests step gave: it runs on seeded fixture text through the test-local pure function, so it passes before the rename; the sibling test carries the planned red.
- Out of scope, not a gap: the remediation log's BLOCKED line. `pnpm instructions:sync` (run by `bkit:generate`) stops on `.bkit/core/prompts/bkit-build-plan-tests.md:80`, which has no `.bkit/instructions.md` entry. That sentence came from dev commit 4bdee4559 (801-test-lock-per-case, also on `dev`) through merge 566215af0, and no Task 1-3 DONE WHEN runs `bkit:generate` or `instructions:sync`. It needs an instructions entry on dev. The tool refused to write and the tree is unchanged.
- Out of scope, carried from attempt 1: `branding.test.ts` `scriptsInJsonBlocks` skips a json fence that fails to parse (`catch { continue; }`), so a malformed scripts block in `templates.md` would be skipped silently.
- No decision records were supplied.

## Identified Gaps Log

None

