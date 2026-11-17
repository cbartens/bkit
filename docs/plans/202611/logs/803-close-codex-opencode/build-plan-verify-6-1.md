Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 12, 13, 14
Loosened: none
Fingerprint: ce647325714d32006af91fae9cd6836e10bec9bd808a316600ac1c9dbc6b61c6
<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Docs index read: `.agents/docs.md` lists `docs/testing.md` and `docs/observability.md`; no group 6 task changes error logging, so `docs/observability.md` adds no check. No `Documentation Updates` row belongs to group 6.
- No supplied decision record (`build-decision-1-1.md` to `build-decision-1-8.md`) covers group 6; they concern Groups 1 and 4.
- Test-first audit (`build-tests-green-6-1.md`): `Enforced: true`, `Unproven: 0`, no `Updated tests` and no `Already landed` section. Its one gap (Task 15 `not-green`) carries `Fixable: true`, which stands.
- TASK 12 and TASK 13: `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs:70-78` denies any non-`deny` tier when `shellSecretRead(c)` returns a `key`-kind path, with the same file-naming reason the `secret` case uses. `guardrails-tiers.js` is untouched, so Cursor and Antigravity keep `ask` (asserted in the new tests). The `decideShell` body in the `.codex/hooks/bkit-guardrails.cjs` mirror is identical, and `.bkit/version` carries its new hash. The three new tests in `.bkit/core/engine/install/modules/index.integration.test.ts` pass (re-run here: 3 passed).
- TASK 14: `redactUrlParts` in `.bkit/core/engine/checks/before/files.ts:118` now drops `[^/@\s*]+@` with or without a scheme; `dist/checks/before/files.js` matches; `uninstall.ts:758` uses it unchanged. `.bkit/core/engine/checks/before/files.test.ts` passes (re-run here: 27 passed), including both new tests.
- TASK 15: the code half is done. Item 4 of the `codex-setup` advisory in `.bkit/core/engine/install/modules/codex.ts:226` (and `dist/install/modules/codex.js`) now carries the real-host check inline and no longer names `docs/testing.md`. The task's TEST FIRST test still fails, so the task is not satisfied. Root cause is the planned test, not the code: it sets `pointsAtOwnDoc = out.includes("docs/testing.md")` over the whole install output, and the install output names `docs/testing.md` in unrelated lines (a template-added line and the `No project document covers` advisory from `.bkit/core/engine/checks/after/tools.ts`), so the assertion at `install.integration.test.ts:1394` can never pass while a fresh consumer has no `docs/testing.md`. Fix direction for the tests step: scope `pointsAtOwnDoc` to the `codex-setup` advisory block, not the whole output. The removal of the old `expect(out).toContain("docs/testing.md")` line from `a --codex install tells the reader how to act on the private-key status` is the change Task 15's DONE WHEN directs.

## Identified Gaps Log

1 gap.

TASK 15: `.bkit/core/engine/commands/install/install.integration.test.ts` `the codex-setup private-key action is self-contained in a fresh consumer` — not-green — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 15: planned test `the codex-setup private-key action is self-contained in a fresh consumer` is not green
  **Severity:** MEDIUM · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/commands/install/install.integration.test.ts:1394` · **Round:** 1
  - **DONE WHEN:** The TEST FIRST test `the codex-setup private-key action is self-contained in a fresh consumer` passes: its `pointsAtOwnDoc` check looks only at the `codex-setup` advisory block, not the whole install output, which names `docs/testing.md` in unrelated lines (template-added line, `No project document covers` advisory).
  - **TEST FIRST:**
    - .bkit/core/engine/commands/install/install.integration.test.ts the codex-setup private-key action is self-contained in a fresh consumer
<!-- bkit:task 1 end -->
