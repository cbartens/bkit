Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
Loosened: none
Fingerprint: eebf6cb839ecb09123dbb8719ae549fdf96b9765a4c177c430853f91fbd3c6b9
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups: Tasks 1-2, 3, 4-6, 7-9 + 11, 10).

## Integration Gaps

0 integration gaps. The cross-group contracts checked:

- Group 1 → Group 2: `uninstall.ts` imports `isOpencodeSubstringFetchKey` and `redactUrlParts` from `.bkit/core/engine/checks/before/files.ts`, so the uninstall review lines and the `opencode-substring-fetch-grants` advisory use the same key matcher and the same redaction. Uninstall's `stripOpencodeJsonScope` renders the template through `injectOpencodeDerivedAllows`, which no longer writes shell fetch keys (Task 1), so legacy `curl *…*` keys survive the strip and get their review line.
- Group 3 internal (Tasks 4 → 5 → 6): the Task 5 result records `not-shown`, and `CODEX_KEY_DENY_STATUS` in `.bkit/core/engine/install/modules/codex.ts`, `providers.md` and `prompts.md` all use "configured to deny, not verified on a real Codex host"; the rendered hook denies key reads as the advisory describes.
- Group 4 (Tasks 7 → 8 → 9): `renderCloudNetworkAllowlist` and `renderNetworkAllowlist` both hash `resolveNetworkAllowlist(cwd)`. On bkit itself `.bkit/allowlist.json` `fingerprint`, the `.claude/bkit-cloud.md` § 2 "Allowlist fingerprint" and a fresh `egressFingerprint(resolveNetworkAllowlist(cwd))` from `dist/` all read `5b7f786f`. The bootstrap reads `.fingerprint` from that file, and `detectCloudBootstrapFingerprintMissing` keys on the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` name the template block carries. The template and `.claude/hooks/bkit-cloud-bootstrap.sh` are byte-equal (`cmp` exit 0). The detector and hook point to `.claude/bkit-cloud.md` § Network access, which is § 2 there.
- Group 5 → all: bkit's `.opencode/opencode.json` `permission.bash` keeps only `curl *` / `wget *` among fetch keys, so the Group 1 detector stays silent on bkit, and the `webfetch` `*{base}*` allows remain (decision 551).

## Previously Attempted

None for the holistic scope (this is holistic attempt 1). Per-group verifies: `build-plan-verify-1-1.md` (PASS), `build-plan-verify-2-1.md` (PASS), `build-plan-verify-3-1.md` (CONCERNS, 2 Task 6 gaps) then `build-plan-verify-3-2.md` (PASS), `build-plan-verify-4-1.md` and `build-plan-verify-4-2.md` (FAIL, Task 8 jq-absent test) then `build-plan-verify-4-3.md` (PASS after Task 11), `build-plan-verify-5-1.md` (PASS).

## Notes

- All 11 tasks are satisfied: the per-group verifies (`build-plan-verify-1-1`, `2-1`, `3-2`, `4-3`, `5-1`) each closed with no open gap, and the holistic re-checks above found nothing that later groups broke.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`: the first run exited 75 while it waited on the tests lock held by `.worktrees/914-build-planned-test`, so I ran it again. The second run exited 1 with 5 failing tests. None is a #803 gap:
  - `guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` (2653ms against 1000ms, load average about 20), `locks.test.ts` `serializes publication for one target and invocation`, and the two `debug-ci-evidence.integration.test.ts` tests (`spawnSync bash ETIMEDOUT`, and a nested round that went red). A re-run of those three files as one `pnpm bkit:test:file` call passed 108 of 108. These are the same load-sensitive flakes the remediate logs record.
  - `husky-pre-push.integration.test.ts` `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED`: corepack could not download `pnpm-10.34.9.tgz` (`getaddrinfo ENOTFOUND registry.npmjs.org`). The test's own inner command (`BKIT_PRE_PUSH_LOGGED=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/checks/tips/catalogue.test.ts -t "inside the pre-push hook"`) passed (1 passed), so the failure was the network lookup, not the code.
  - The bats file passed 38 of 38, the six fingerprint tests included. Lint, format and typecheck on the changed files passed.
- No #803 commit touches any of the failing test files. The one in-range commit that does is `fa0400fe6` (923-pre-push-block).
- Out of scope, for the caller: the branch is rebased onto local `dev`, which is 3 commits ahead of `origin/dev` (`d8cee96cf` discovered-gotchas, `a2c12d244` 920-build-agents-run, `fa0400fe6` 923-pre-push-block). The branch diff against `origin/dev`, `tmp/bkit-diff-803-close-codex-opencode.md` and the changed-tests set therefore carry that work as well (358 changed files). That work is not part of this plan.
- Advisory, not a gap: `redactUrlParts` in `files.ts` drops URL user-info entirely and replaces the query with `?…`. The Edge Cases example and the Architecture entry show `***@` and `?***`. The redaction goal holds (no `user:tok` or `k=v` is printed, and the tests assert that), and no `DONE WHEN` pins the exact form.
- Ledger rows on the plan's `Ledger rows` line: the six `803-*` decisions and `551-opencode-unanchored-host-allows-accepted-risk` are `ACTIVE`, and `803-opencode-webfetch-exact-origin` is `SUPERSEDED`. The deferral rows `803-cursor-codex-cloud-fingerprint-compare` and `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` exist in `docs/deferrals.jsonl`.
- Documentation Updates: `git grep -n 'curl \*{domain}\*' -- .bkit/core/.bkit/` returns nothing. `providers.md:523` names `claudeAllowDerived`, and `templates.md:79` names the compare and `cloud-bootstrap-fingerprint-missing`. The other rows were confirmed by the group verifies. `docs/observability.md` is present: uninstall review lines go through `ctx.logPrefix`, and the hook keeps its `[cloud-bootstrap]` prefix.
- Decision records: `build-decision-1-4.md` directed the Task 11 fix (not an accept), and Task 11 meets it. `build-decision-1-1` to `1-3` and `1-5` to `1-8` are gate re-run and try-again choices. None accepts a gap.
- No test-first audit report was supplied to this holistic step, so Step 8 had nothing to decide.
- Carried out-of-scope note (owner kept it out of this run, `build-decision-1-4.md`): the bats test `without jq, gh still logs in from BKIT_GH_TOKEN` (`:170`) still leaves `/usr/bin/jq` on PATH.

## Identified Gaps Log

None
