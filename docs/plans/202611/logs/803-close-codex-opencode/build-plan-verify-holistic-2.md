Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
Loosened: none
Fingerprint: 8371142904eb2e29bca000b57baf14d49463093312398637fcdc01ac2276ea63
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 groups: Tasks 1-2, 3, 4-6, 7-9 + 11, 10, 12-16).

## Integration Gaps

0 integration gaps. Groups 1-5 were checked by `build-plan-verify-holistic-1.md`. Since then only Group 6 changed code: `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs`, `.bkit/core/engine/checks/before/files.ts`, `.bkit/core/engine/install/modules/codex.ts`, their `dist/` files, `.bkit/version` and the tests (`git diff --stat 340839c74 HEAD`). The cross-group contracts re-checked:

- Group 6 (Tasks 12, 13) → Group 3 (Task 4): `decideShell` denies a `key`-kind `shellSecretRead(c)` before the tier switch whenever `classifyShell` returns a tier other than `deny`. The `deny` tier keeps its own reason. `guardrails-tiers.js` is unchanged since Group 3, so Cursor and Antigravity keep `ask`. The `decideShell` body in `.codex/hooks/bkit-guardrails.cjs` equals the source. Its sha256 `2154b384…` equals the `.bkit/version` `canonicalHashes` entry. The deny text matches § Hook Text `guardrails-codex-key-shell-deny` in `.bkit/instructions.md`, and `instructions-sources.test.ts` passes (re-run here).
- Group 6 (Task 15) → Group 3 (Task 6): `CODEX_KEY_DENY_STATUS` is still "configured to deny, not verified on a real Codex host". `.bkit/core/.bkit/providers.md:271`, `:486` and `.bkit/core/.bkit/prompts.md:435` use the same phrase, as do their `.bkit/` mirrors. No source, mirror or `dist/` file says "manual recipe in docs/testing.md" any more.
- Group 6 (Task 14) → Groups 1-2 (Tasks 2, 3): `redactUrlParts` keeps its signature and both callers (the detector and the `uninstall.ts` review line). `dist/checks/before/files.js` carries the same regex as the source.
- Group 5 (Task 10) still holds after Group 6: `node dist/cli.js check` exits 0 on bkit and prints neither `opencode-substring-fetch-grants` nor `cloud-bootstrap-fingerprint-missing`. `pnpm bkit:graph:check` reports "docs/capabilities.md matches a rebuild at ce6e72b08".

## Previously Attempted

- `build-plan-verify-holistic-1.md` (holistic attempt 1): PASS, 5 of 5 groups, Tasks 1-11. Group 6 was added after it from the build-challenge findings (`build-challenge-1.md`, `build-challenge-2.md`).
- Group 6 verifies: `build-plan-verify-6-1.md` (CONCERNS, Task 15's planned test) → `build-plan-gaps-remediate-6-1-log.md` (BLOCKED) → owner decision `build-decision-1-9.md` (Fix now, Task 16) → `build-plan-verify-6-2.md` (PASS, Tasks 12-16).

## Notes

- All 16 tasks are satisfied. Every per-group verify closed with no open gap, and the holistic re-checks above found nothing that a later group broke.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1. The related vitest set passed (137 files, 6704 tests), the `node --test` files passed (13 + 13) and the bats file passed, its fingerprint tests included. The named vitest set had 2 failures, and neither is a #803 gap:
  - `guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` (2041ms against a 1000ms limit; a re-run took 2610ms). Load average was about 22, and an empty `node -e ''` start took 270-600ms. The test's input (`node -e 'a;a;…'`) holds no secret path, so Task 4's key-first `shellSecretRead` loop does the same work as on `origin/dev`. Interleaved timings in a scratch copy confirm it: the current hook took 2685-4137ms, and the same hook with `origin/dev`'s `shellSecretRead` took 2252-5756ms.
  - `locks.test.ts` `serializes publication for one target and invocation`. #803 does not touch `locks.ts` or this test. Holistic attempt 1 recorded the same two load-sensitive failures.
- Neither failing test file is named in a task's `DONE WHEN` or `TEST FIRST`.
- `pnpm bkit:check:dist` was not run, because it deletes and rebuilds `dist/` and this step must not build. Instead the two `dist/` files Group 6 changed (`dist/checks/before/files.js`, `dist/install/modules/codex.js`) were compared with their sources, and they match. Group 6's commits passed the pre-commit `dist/` check.
- Decision records: `build-decision-1-9.md` (Fix now) directed Task 16, and `build-decision-1-4.md` directed Task 11. Neither accepts a gap. `build-decision-1-1` to `1-3` and `1-5` to `1-8` are gate re-run and try-again choices.
- No test-first audit report was supplied to this holistic step, so Step 8 had nothing to decide.
- Derived Test Matrix rows for Tasks 12-14 sit in those tasks' `TEST FIRST` fields. Their `DONE WHEN` states the behaviour rather than naming the test. The tests exist and pass, so this is not logged as a gap.
- `docs/observability.md` is present. Group 6 adds no log line and no error path. No `Documentation Updates` row belongs to Group 6.
- Out of scope, for the caller:
  - `build-challenge-2.md` finding 3 (`KIND_WRITERS.knowledge` admits any writer, `.bkit/core/engine/ledgers/telemetry.ts:450`, Fixable false) belongs to dev work carried on this branch, not to #803. Its LOW deferral row is in `docs/deferrals.jsonl`.
  - `.bkit/prompts.md:655` says "Claude Code pins" where `.bkit/core/.bkit/prompts.md:655` says "Claude pins". `origin/dev` has the same difference, so it predates #803.
  - The branch diff against `origin/dev` still carries the other dev work that holistic attempt 1 named (379 changed files).

## Identified Gaps Log

None
