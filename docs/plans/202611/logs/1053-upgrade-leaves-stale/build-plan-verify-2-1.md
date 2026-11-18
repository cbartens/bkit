Verdict: PASS
Failures: 0
Fixable: false
Tasks: 5, 6
Loosened: none
Fingerprint: 0b02795515bf09ef638b5ba5442d673bfd7fc192ee60956ba7b4addd17cb6c25
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

- TASK 5 satisfied. The `byte-equal-text` row in `.bkit/core/.bkit/install.md` now names the three entry classes: entries that equal the file and that `bkit check` fails on (rendered `.bkit/*.md` docs, `.bkit/allowlist.json`, host mirrors); entries that may differ (`package.json`, `.mcp.json`, `.cursor/mcp.json`, block-merged files, an owner-edited whole-file payload file); and entries that are not recorded (`.agents/*`, template copies, ledgers). The sentence saying `bkit check` does not verify `canonicalHashes` is gone. The `version-file.test.ts` row in `docs/testing.md` (L911) names the `.agents/` prune rule, a one-line hunk. The rendered `.bkit/install.md` differs from its source only by the `{{BKIT_MANAGED_MARKER}}` substitution, so it is the upgrade's render and was not edited by hand.
- TASK 6 satisfied. `.bkit/version` has 260 entries, no `.agents/` entry, and no entry for a missing file. Hashing every entry against disk leaves exactly `.cursor/mcp.json`, `.mcp.json` and `package.json` differing, so the `.bkit/templates.md` and `.bkit/allowlist.json` entries match their files. `node dist/cli.js check` exits 0. `dist/` was last committed in cadfa115f, the same commit as the last `.bkit/core/engine/` change; this group changed no engine source, so a rebuild yields no `dist/` diff. `dist/install/modules/core.js`, `dist/commands/install/upgrade.js` and `dist/install/modules/index.js` carry `listRenderedOutputs`. The `.bkit/version` hunk in this group re-records only `.bkit/install.md`, because the `.agents/` drop and the templates/allowlist re-record already landed in group 1.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven. Both tasks are `TEST FIRST: n/a` (docs only; regenerated build output and install record).
- No decision records, earlier group-2 verify reports or remediation logs exist.
- The plan's `Documentation Updates` and `Derived Test Matrix` coverage across all groups is left to the holistic verify; this group's brief names no test-matrix row.

## Identified Gaps Log

None
