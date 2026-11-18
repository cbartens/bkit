Verdict: CONCERNS
Failures: 1
Fingerprint: da4fe4ad96676e543002a1094f9bb75a013cb0feb2b6e5954a93c3cd7753ab8c
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-1053-upgrade-leaves-stale.md`, read in full (989 lines, full coverage, not partial).
- Plan: `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`.
- Code read beyond the diff: the `.bkit/version` `postDispatch` in `.bkit/core/engine/install/modules/core.ts` (L2088-2165), `runBkitDocs` and `BKIT_CANONICAL_DOCS`, `dispatchModules` / `RENDERED_MIRRORS` / `renderManagedOutputs` in `.bkit/core/engine/install/modules/index.ts`, `updateCanonicalHashesAfterUpgrade`, `diffFile` and the render / hash-record flow of `runUpgradeCommand` in `.bkit/core/engine/commands/install/upgrade.ts`, `mergeCanonicalHashes` / `hashFile` / `isConsumerModified` in `.bkit/core/engine/install/version-file.ts`, the byte-equal-text decision and the targeted-uninstall version rewrite in `.bkit/core/engine/commands/install/uninstall.ts`, `reportCheckDrift` in `check.ts`, the install flow after `dispatchModules` in `install.ts`, `recordResolve` in `branches.ts`, the ship Path B sync step, and the `bkit:generate` script.
- Docs loaded: `.agents/docs.md` (Build column), `docs/architecture.md` (L91), `docs/security.md` (L186, machine-local files never hashed), `docs/deployments.md` (L309, L696-699), `docs/observability.md`, `docs/testing.md` (version-file row), `docs/knowledge.jsonl` (KN-9, KN-10, KN-13, KN-17 on `canonicalHashes`). `docs/data-schema.md` not applicable (no database).

## Notes

- Checked on the tree and found correct: only the core module pushes a `postDispatch`, so `ctx.renderedOutputs` is computed after every module write and before the one `.bkit/version` writer; nothing in `install.ts` after `dispatchModules` writes a rendered output (`syncProjectDocs` writes only `.agents/docs.md`); upgrade calls `listRenderedOutputs` after every render, MCP, cloud-doc, artifact and project-doc write; no payload file (whole-file, conflict-protected) sits in a rendered mirror dir or under `.bkit/*.md`, so the #459 drift record is not overwritten; no template-set path or ledger is a rendered output, so there is no prune-and-re-add loop that would fail `check` on every run; no manifest entry under `.agents/` is `byte-equal-text`, so pruning `.agents/` entries changes no uninstall or `diffFile` decision; `index.ts` and `core.ts` have no runtime import cycle.
- This repo's `.bkit/version` after the diff: all 260 entries hashed against disk; only `.cursor/mcp.json`, `.mcp.json` and `package.json` differ, and no rendered mirror lacks an entry. This matches TASK 6's DONE WHEN.
- The Path B merge in `/bkit-ship` (`branches sync --merge`, `recordResolve` picking dev's hash when both sides changed an entry) can still leave a stale mirror entry, which `bkit check` in `bkit-ci.yml` now fails on. In this repo the same step runs `bkit:generate`, which ends in `pnpm bkit upgrade`, so the entry is repaired before the push. The `recordResolve` docstring ("makes `bkit upgrade` treat that file as edited by hand") no longer describes the full effect for rendered outputs; that is doc drift outside this lens.
- Pre-existing, not introduced by the diff, outside the task: canonicalHashes keys use `path.join` / `path.relative` separators, so on Windows a lookup with `.bkit\\templates.md` misses a committed `.bkit/templates.md` entry, and `bkitDocWriteMode` (moved code) compares `path.join(".bkit", name)` against the POSIX manifest path, so `.bkit/prompts.md` would be force-overwritten on Windows. Worth a separate issue if Windows is supported.
- Test observations, no fix needed: `names no other host's mirror for a claude-only install` cannot fail on its cross-host clauses because no other host's dir exists in that fixture (`listRenderedOutputs` has no host filter; it lists the dirs on disk, and host detection uses the same dirs, so the behaviour matches the plan). The plan's edge case "`check` does not fail on a missing entry" has no test pinning the `!dryRun && missingRendered > 0` clause in a dry run.
- Not run: no build, install or test run, as this agent's mandate requires. The finding's tests were traced by reading the code: a real core run rewrites `.bkit/templates.md` through `writeTier1` and the loop then sees the new disk hash differ from the older recorded one; a dry-run check over an edited mirror pushes the mirror's would-write and the loop sees the edited disk hash differ from the install-recorded one. Both print the line today.
- `Failures` and `Fingerprint` are left for the engine to derive from this file, as the step's result-file clause says.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A re-run of `bkit install` after a version bump (or a `bkit check` over a hand-edited mirror) prints "stale .bkit/version entries re-recorded" for every rendered file the run writes or would write, so the owner is told the install record was wrong when it was right
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/core.ts:2123` · **Round:** 1
  - **DONE WHEN:** The rendered-output loop in the `.bkit/version` `postDispatch` counts a path as stale only when this run neither wrote nor would write it (its path is not in `ws.writes`); a real run that rewrites a rendered file and a dry run that would rewrite one print no "stale .bkit/version entries" line for that file, while an untouched file with a wrong entry still prints it and still fails `bkit check`.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `does not report a rendered output the run rewrites as a stale entry` fails on the console.log spy capturing "stale .bkit/version entries re-recorded: .bkit/templates.md" after `.bkit/templates.md` is set to older content with a matching entry and a second core dispatch rewrites it
    - `.bkit/core/engine/commands/install/check.integration.test.ts` `a hand-edited mirror fails check without blaming its .bkit/version entry` fails on the check output containing "stale .bkit/version entries" for `.claude/commands/bkit-build.md` after the mirror's text is edited and its entry left as install recorded it
<!-- bkit:task 1 end -->
