Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 4, 5
Loosened: none
Fingerprint: eecdc342724e10b0abca2bd79154efba62bc8cd26df18dc3a97a764b59939c8d
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Task 4 is satisfied. `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js:275` returns a key path ahead of an env path, `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs:79` denies the key kind without a `Command:` echo, and the `.env` advisory is narrowed. The `.bkit/instructions.md` entries are present, and the `.codex`, `.cursor` and `.agents/plugins` mirrors are re-rendered. A verifier run of `index.integration.test.ts`, `guardrails-cursor.integration.test.ts` and `instructions-sources.test.ts` passed 257 of 257 tests, T6 mirror parity and the `rg -l "id_rsa" src` row included. When fed by hand, the repo's `.codex/hooks/bkit-guardrails.cjs` denied `cat .env ~/.ssh/id_rsa`, allowed `cat ~/.ssh/id_rsa.pub` and added a note to `cat .env`.
- Task 5 is satisfied. `tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json` records `outcome: "not-shown"`, `cliVersion: "0.166.0"` and a filled `reason`, and it holds a synthetic key only. The report `tests/experiments/hooks/reports/bkit-codex-key-deny-2026-11-14.md` names the doc status "configured to deny, not verified on a real Codex host". `docs/testing.md` § Manual recipe — Codex key-read deny sits after § Manual recipe — OpenCode E2E. The run used `codex exec --dangerously-bypass-hook-trust`, and a control command the hook denies (`bkit tests jump`) also ran, so the hook never fired in that session. `not-run` would fit the plan's definitions about as well as `not-shown`. Both outcomes set the same doc status, and the `reason` says this plainly, so it meets the DONE WHEN.
- Enforcement claims: no doc, advisory, comment or test in the group diff says the Codex key-read deny is enforced or verified on a real host. Every status mention uses "configured to deny, not verified on a real Codex host", or in the `providers.md` Enforcement column "not verified on a real host". The only "verified" text describes the `denied` alternative, which the recorded outcome does not allow.
- Task 6 is not satisfied (2 gaps below). The four-item advisory, the status phrase in `codex.ts`, `dist/install/modules/codex.js`, `providers.md:271`, `providers.md:307` and `prompts.md:435`, the TEST FIRST test (passed in the verifier run) and `pnpm bkit:check:dist` (exit 0) are all in place.
- Test-first audit `build-tests-green-3-1.md`: Enforced true, 0 gaps, 0 unproven, no Updated tests or Already landed sections.
- The `.bkit/version` hash change for `docs/templates/bkit-audit-dependencies.md` matches the committed file (`ac25cc7a…`). It is a re-render that caught up with an earlier commit, not a Group 3 change.
- Advisory, not a gap: under `Documentation Updates` the plan lets a build agent add a `docs/knowledge.jsonl` row if Task 5 finds a Codex behaviour worth keeping. The finding that `codex exec --dangerously-bypass-hook-trust` on codex-cli 0.166.0 did not fire the project PreToolUse hook may qualify. The plan leaves that choice to the build agent.
- Decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover Group 1 only and accept no Group 3 gap. A scratch dogfood install was denied by the permission system and is outside this agent's mandate. The install test spawns the real CLI (`spawnSync(requireTsx(), [cli.ts, ...])`).

## Identified Gaps Log

2 gaps.

- TASK 6: `.bkit/core/engine/install/modules/codex.ts:227` — the `codex-setup` item 4 states the private-key shell-read status ("configured to deny, not verified on a real Codex host") with no corrective action; only the `.env` line has one (direnv). The task's UPDATE line and `Derived Test Matrix` row "a real `bkit install --codex` prints the `codex-setup` advisory ... each with its corrective action" require one for both. Add the action to the private-key sentence (for example: trust the `.codex/` layer so the hook can fire, keep private keys out of the repo, and run `docs/testing.md` § Manual recipe — Codex key-read deny before relying on the deny), rebuild `dist/`, and extend the Task 6 install test to assert it. — Fixable: true
- TASK 6: `.bkit/core/.bkit/providers.md:486` (mirror `.bkit/providers.md`) — the § Permissions row "File / secrets — shell (`cat .bkit/.env`)", Codex column, still says "same detection as Cursor via `PreToolUse` (`Bash`) — advisory `additionalContext`, command runs" for every secret kind, including `*.pem` / `*.p12` / `id_rsa`. That contradicts the new Codex key deny and the Task 6 rule that `providers.md` use the status phrase. Rewrite the Codex cell: private-key reads denied (configured to deny, not verified on a real Codex host); `.env` / `.env.*` advisory `additionalContext`, command runs. Re-render the mirror with the upgrade. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: codex-setup private-key status line has no corrective action
  **Severity:** MEDIUM · **Class:** missing-requirement · **Fixable:** true · **Location:** `.bkit/core/engine/install/modules/codex.ts:227` · **Round:** 1
  - **DONE WHEN:** The codex-setup item 4 private-key sentence names a corrective action (trust the .codex/ layer so the hook can fire, keep private keys out of the repo, run docs/testing.md § Manual recipe — Codex key-read deny before relying on it); dist/ rebuilt; the Task 6 install test asserts it; pnpm bkit:check:dist exits 0
  - **TEST FIRST:**
    - .bkit/core/engine/commands/install/install.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 6: providers.md § Permissions shell-secrets row still calls Codex key reads advisory
  **Severity:** MEDIUM · **Class:** doc-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/providers.md:486` · **Round:** 1
  - **DONE WHEN:** The Codex cell of the 'File / secrets — shell' row in .bkit/core/.bkit/providers.md (and its .bkit/providers.md mirror) says private-key reads are denied (configured to deny, not verified on a real Codex host) and .env / .env.* reads get advisory additionalContext while the command runs
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
