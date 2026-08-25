Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Build Challenge — F4 Remediation Verify

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy.

## Findings Log

None. F4 is genuinely resolved and no regression was introduced.

### F4 resolution — CONFIRMED

Slug allowlist is asserted at ALL FOUR FID exit points in `.bkit/workflows/bkit-auto.md`:

- Step 9 github block (`bkit-auto.md:97`): `[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]`
- Step 9 linear block (`bkit-auto.md:105`): lowercase then `[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]`
- Step 9 no-tracker (false) block (`bkit-auto.md:113`): `[[ "{FID}" =~ ^[a-z0-9][a-z0-9-]*$ ]]`
- Step 10 branch-derive fallback (`bkit-auto.md:117`): `[[ "{FID}" =~ ^[a-z0-9][a-z0-9-]*$ ]]`

Pattern efficacy verified: all three regexes are fully anchored (`^…$`) over character classes limited to `[0-9]`, `[a-z]`, `-`. They reject `/`, `.` (hence `..`), spaces, newlines, and shell metacharacters (`;`, `$`, backtick, `(`, `)`). The suggested-fix payload `bkit:fid=../../elsewhere` is rejected (`/` and `.` not in any class). The companion vitest `.bkit/src/bkit-auto-fid-guard.test.ts` proves both halves — assertion presence at every exit point (i) and rejection of an 11-vector traversal/injection corpus + acceptance of well-formed FIDs (ii). Ran green: 39/39 passed.

Doctrine recorded: `docs/security.md` § CI Auto-Route Trust gains a "FID slug allowlist" paragraph naming all three patterns and the collaborator-trust rationale — satisfies F4's "record the constraint alongside the marker-trust text."

### No new security issue introduced

- Fall-through semantics are safe, not a regression: a marker FID failing the slug assertion no longer hard-fails; it falls through to step 10 branch-derive, which requires a `feat/` prefix AND re-asserts the same safe slug (`bkit-auto.md:117`). A branch like `feat/foo/bar` derives `foo/bar`, which the `/`-rejecting slug pattern catches → Failure Path. No bypass path exists where an unvalidated FID reaches a filesystem path or downstream dispatch.
- Assertion is emitted in the SAME block that extracts FID, before any step 11+ consumer — validate-before-use ordering holds.
- No over-permissive pattern: the loosest variant (`^[a-z0-9][a-z0-9-]*$`) still admits only path-safe slug chars; a trailing hyphen is cosmetically loose but not exploitable.
- Mirror sync intact: rendered `.claude` / `.cursor` / `.opencode` bkit-auto.md all carry the github-variant assertion + branch-derive assertion verbatim (mirrors render only the wired tracker, so the 2-assertion count there is correct, not a drift).
- Sibling phase workflows (bkit-design/plan/build/debug/ship) already carry the same FID slug assertions on their marker/issue-derived FID — the full FID-consuming surface is guarded, consistent with the test's cross-reference comment.

### Prior mechanical fixes F1–F3 — still intact

- F1 (`.bkit/scripts/bkit-runtime.sh:455`): scan now `grep -qiE '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'` — all 5 GitHub tokens + case-insensitive. Fixed.
- F2 (`.bkit/scripts/bkit-runtime.sh:294-297,335`): resolves `timeout` then `gtimeout`; when neither on PATH, falls back to plain `sleep` rather than misdiagnosing a blocked-sleep abort. Fixed.
- F3 (`.bkit/scripts/bkit-runtime.sh:411`): trap body single-quoted — `trap 'git checkout "$BKIT_CLOSE_GUARD_ORIG_BRANCH" >/dev/null 2>&1 || true' EXIT` — variable resolves at fire time, no re-parse of branch text. Fixed.
- Template mirror `.bkit/templates/.bkit/scripts/bkit-runtime.sh` is byte-identical to the source (`diff -q` = IDENTICAL), so F1–F3 ship to consumers.
