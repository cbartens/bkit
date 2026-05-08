<!-- verdict:start -->
Verdict: PASS
<!-- verdict:end -->
# Debug Failure Remediate

## Files Changed

- `.agents/templates/.github/workflows/ci.yml` — restored `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` block under `Install Dependencies` step (additive fix; `setup-auth@v1` step above retained intact)
- `.agents/scripts/__snapshots__/templates.test.ts.snap` — regenerated via `pnpm vitest run .agents/scripts/templates.test.ts -u` to match updated template

## Verification

```
pnpm vitest run .agents/scripts/templates.test.ts .agents/scripts/bkit-install.test.ts .agents/scripts/bkit-action-yaml.test.ts
```
Result: 3 test files, 112 tests — all PASS (templates.test.ts 8/8, bkit-action-yaml.test.ts 20/20, bkit-install.test.ts 84/84)

```
pnpm typecheck
```
Result: clean, no errors

## Result

All four previously-failing assertions now pass. The `setup-auth@v1` step (P4.T8) remains intact above the `Install Dependencies` step. The inline `env: GH_BKIT_TOKEN` RETAIN-WITH-REASON block is restored. KN-11 appended to `docs/knowledge.md`.

DONE — Step 1: Restore env: GH_BKIT_TOKEN block under Install Dependencies step in ci.yml — additive fix applied (.agents/templates/.github/workflows/ci.yml)
DONE — Step 2: Regenerate templates.test.ts snapshot — 1 updated, 8/8 tests pass (.agents/scripts/__snapshots__/templates.test.ts.snap)
DONE — Step 3: Append KN-11 gotcha to docs/knowledge.md — helper-action additions are additive not replacement (docs/knowledge.md)
