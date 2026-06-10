Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

15 new regression tests added across 2 files covering the 3 P1 fixes:

**Provider name validation (9 tests in `bkit-cli.test.ts`):**

- Valid: `gemini-pro` (hyphenated), `my-provider` (user slug), 31-char boundary string — all pass without error
- Invalid: empty value after `=`, uppercase (`MY_PROVIDER`), spaces, special char (`x$y`), 32-char string (exceeds max), starts with digit — all call `process.exit(1)` with "provider name must match" message

**Orphan cleanup gate (3 tests in `bkit-install.integration.test.ts`):**

- Case A: Source-level verification that the gate condition `fs.existsSync(newCloudWorkflow) || cloudWillBeInstalled` appears before the `rmSync` call
- Case B: Subprocess upgrade with `bkit-cloud.yml` already on disk — `bkit-auto.yml` IS deleted (verified via file existence)
- Case C: Subprocess upgrade with `bkit-cloud.yml` absent — `bkit-auto.yml` is NOT deleted and removal log message does NOT appear

**Ollama cloud warning (2 tests in `bkit-install.integration.test.ts`):**

- Positive: subprocess `bkit install --tracker=github --cloud=opencode` with `.opencode/opencode.json` having `provider.id="ollama"` emits output matching `/ollama/i` and `/local server/i`; exit 0 (non-fatal)
- Negative: same invocation with `provider.id="nvidia"` does NOT emit "local server" warning

All 37 test files pass (1383/1386; 2 skipped, 1 todo — pre-existing).

## Blockers

None

## Bugs Discovered

None

LOG: pnpm test — 37 files, 1383 passed, 2 skipped, 1 todo. All 15 new tests PASS. No failures in newly-added test files.
