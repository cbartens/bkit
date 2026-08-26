Verdict: PASS
Strategy: FINAL

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1 (MEDIUM, DEBUGGED/additive collapse): removed `DEBUGGED:"debug"` from the reverse-sync phase-replacement map at bkit-ship.md; a DEBUGGED FID is now skipped as unmapped (same path as ABANDONED) instead of resolving to a REPLACEMENT label that would collapse an existing {bkit:build, bkit:debug} pair down to {bkit:debug}. Added inline comment documenting the additive-doctrine rationale and updated the skip-log message. (.bkit/workflows/bkit-ship.md)
DONE — Gap 2 (MEDIUM, unbounded per-FID network discovery): replaced the per-FID `git ls-remote --exit-code --heads origin feat/$RS_FID` call (50+ round trips per ship) with a single upfront `git ls-remote --heads origin` captured into $RS_REMOTE_HEADS, matched per FID via grep against the in-memory list; local show-ref check unchanged, offline fail-open behaviour preserved (empty $RS_REMOTE_HEADS falls back to local-only, identical to the old per-FID ls-remote failure path). (.bkit/workflows/bkit-ship.md)
DONE — Gap 3 (INFO, scratch file not cleaned under tracker: none, budget-allowing cleanup): added an `rm -f` cleanup of the .roadmap-reverse-sync-{FID}.json scratch file inside the <!-- bkit:tracker false --> (tracker: none) branch, matching the existing cleanup already present in the <!-- bkit:tracker true --> branch. (.bkit/workflows/bkit-ship.md)
DONE — test extension (Gap 1 + Gap 2, mandated "extend the sync test so the collapse cannot come back"): `bkit-roadmap-sync.integration.test.ts` updated — (a) new prose-regression test asserts the phase-replacement map contains no `DEBUGGED:"..."` entry at all; (b) the existing terminal-mapping regex updated to the DEBUGGED-free map; (c) the live-branch-guard test updated to assert the bounded `RS_REMOTE_HEADS=$(git ls-remote --heads origin ...)` + per-FID `grep` match, and asserts the OLD per-FID `ls-remote --exit-code --heads origin "feat/$RS_FID"` literal is now ABSENT; (d) the real-execution behavioural fixture gained a 5th FID (`410-epsilon`, settled, status `DEBUGGED`) and a new assertion that it is EXCLUDED from the candidate JSON entirely — this is a real-execution proof (not just prose-shape) that a settled DEBUGGED FID can no longer resolve to a phase-replacement candidate. Mutation-verified: reintroducing `DEBUGGED:"debug"` into the map, or reintroducing the per-FID `ls-remote --exit-code` literal, fails the corresponding new test (confirmed by hand, then restored — file byte-identical to the fixed version afterward). (.bkit/src/bkit-roadmap-sync.integration.test.ts)

## Final Verification

- Sub-plan 2's five target files, isolated: **67/67 passed** (bkit-roadmap-refresh-prompt, bkit-roadmap-sync.integration [now 9 tests, +1 new], bkit-roadmap-reconcile.integration, bkit-roadmap-staging.integration, bkit-ship-invariants).
- `npx bats tests/roadmap-cadence.bats tests/telemetry-failopen.bats`: **19/19 ok.**
- Full suite, `npx vitest run --testTimeout=90000 --hookTimeout=90000` (default 5000ms timeout is known-flaky on a loaded machine per the task's out-of-scope note; ran at the raised timeout directly to avoid spurious failures): **82 test files passed, 2773 tests passed | 2 skipped | 1 todo, 0 failed, exit 0** (2773 = 2772 baseline + 1 new DEBUGGED-exclusion assertion; no regressions).
- `pnpm typecheck`: clean.
- `pnpm format:check`: initially flagged the edited test file (whitespace only) — ran `prettier --write` once, re-verified clean.
- `pnpm lint:slop`: exit 0, 9 pre-existing findings (same set as the prior verify log), none in touched files.
- `pnpm lint:prose`: 1 pre-existing warning (`docs/testing.md:318`), unrelated, unchanged.
- No `.bkit/src/*.ts` non-test source changed (only the test file + the `bkit-ship.md` workflow markdown) — `pnpm build` not required.
- Files touched this round: `.bkit/workflows/bkit-ship.md`, `.bkit/src/bkit-roadmap-sync.integration.test.ts`.

Out of scope, untouched, confirmed still isolated per the task's explicit exclusion list: the `slop:delta` regression in `.bkit/src/bkit-telemetry-migrate.ts` (sub-plan 3); host-mirror drift / `bkit check` (no `bkit install` run); the `counterSource: "shell-bus"` decision and stale plan prose (sub-plan 3 Task 14); the plan's `pnpm lint` script reference (Gap 4, informational, sub-plan 3); the flaky 5000ms subprocess-test timeouts (`docs/failures.jsonl`).

Verdict rationale: both MEDIUM residuals from attempt-3-verify are closed with the smallest possible change (exclude DEBUGGED from the phase-replacement map rather than a structural rework; one bounded `ls-remote` call rather than a caching layer), the Gap-3 scratch-file cleanup was closed as a bonus within budget, and the sync test was extended with both prose-regression guards and a real-execution fixture proving the DEBUGGED FID can no longer be produced as a reverse-sync candidate. All target tests, bats, typecheck, format, and lint gates are green with real, re-derived numbers. No structural risk taken; no previously-settled work (the attempt-2 blocking-gap remediation) was touched or reopened.
