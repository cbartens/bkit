<!-- verdict:start -->

Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

## Tests Added

New file: `.agents/scripts/bkit-challenge-tests.test.ts` (21 tests, all pass)

### MEDIUM-1 — NaN guard for empty/malformed `.bkit-version`

7 tests across two `describe` blocks:

- `detectBkitVersionMajorDowngrade` with empty file → `null` (no advisory)
- `detectBkitVersionMajorDowngrade` with whitespace-only file → `null`
- `detectBkitVersionMajorDowngrade` with non-semver string (`"unknown"`) → `null`
- `detectBkitVersionMajorDowngrade` with empty file — detect text must NOT contain `"NaN"`
- Regression guard: valid `3.0.0` still fires the advisory correctly
- `detectBkitVersionPinStale` with empty on-disk version → `null`
- `detectBkitVersionPinStale` with empty installed version field → `null`

The remediate agent had already added guards (`!onDisk` early-return + `Number.isNaN()` check) before these tests ran. Tests confirm the fixed behavior and act as regression coverage.

### MEDIUM-3 — Intra-phase Phase 3 deduplication

2 tests directly exercising `dedupeById` on Phase 3 findings by injecting duplicate ids via `vi.spyOn`:

- Spy `detectValePackageNotSynced` to return id `"npmrc-missing-gh-packages"` (same id `detectNpmrcAuth` emits when `.npmrc` is malformed) → assert exactly one occurrence in output
- Confirms first-occurrence-wins: Phase 3's first emitter (detectNpmrcAuth) content survives, not the spy's synthetic text

This directly exercises the `dedupeById(phase3)` call inside `runPostInstallCheck` with a real duplicate, which existing tests did not cover.

### Format Snapshot — Plan §F5

5 tests using `toMatchInlineSnapshot`:

- 2-finding fixture (one advisory with multi-line action, one advisory with single-line action) — locked byte-for-byte
- Single blocker finding — locked byte-for-byte including `(1 item)` singular vs `(2 items)` plural
- Empty array → exact `""` empty string with length check
- Separator line is exactly 58 `=` characters
- `DETECT:` and `ACTION:` labels start at column 0 on their own lines

The inline snapshots lock the exact format: banner width, header text, divider `--- i/N [severity] id ---` format, and trailing newline.

### Integration Subprocess Edge — hardened via env-control + vi.spyOn observation

4 tests replacing the silently-skippable subprocess test pattern:

- `runPreflight` + `formatChecklist` pipeline exercised entirely via function APIs — same logical assertions as the subprocess test (exit banner non-empty, contains `[blocker]`, DETECT, ACTION), never silently skips
- Single blocker renders `1/1` and `(1 item)` correctly
- `detectShellToken` spy observation pattern confirmed functional (ESM live-binding caveat documented in code comment)
- `runPostInstallCheck` emits `gh-bkit-token-missing-shell` when `GH_BKIT_TOKEN` is explicitly deleted — proven without subprocess

### Cross-phase dedup Phase-3-wins (bonus coverage)

3 tests verifying the cross-phase dedup contract already present in existing tests, but with explicit `detect`-text assertions to prove Phase 3 content replaces Phase 1 content:

- Phase 3 entry replaces preflight entry — detect text from preflight must NOT appear
- Preflight-only advisory survives unchanged when Phase 3 does not emit the same id
- Preflight advisory relative order is preserved when no Phase-3 collision occurs

## Blockers

None
