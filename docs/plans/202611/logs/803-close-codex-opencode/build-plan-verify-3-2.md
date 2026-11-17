Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6
Loosened: none
Fingerprint: a7fb9aeac5fc8062563367a6ca5b403471a62610054e9575ab4c0d0d1e8cf786
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/803-close-codex-opencode/build-plan-verify-3-1.md` (attempt 1, CONCERNS, 2 fixable Task 6 gaps), remediated by `build-plan-gaps-remediate-3-1-log.md`.

## Notes

- Task 4 is satisfied. `shellSecretRead` in `.bkit/core/hooks/guardrails-tiers.js` returns a key-kind path ahead of an env-kind path, and `decideShell` in `.bkit/core/.codex/hooks/bkit-guardrails.cjs` denies the key kind with no `Command:` echo while `.env` keeps the narrowed advisory. The `.bkit/instructions.md` entries `guardrails-codex-key-shell-deny` and the narrowed `guardrails-codex-secret-shell` are present. The `.codex`, `.cursor` and `.agents/plugins` mirrors carry the same change. A verifier run of `index.integration.test.ts`, `guardrails-cursor.integration.test.ts` and `instructions-sources.test.ts` passed 256 of 257 tests, including the three TEST FIRST tests, the `SHELL_SECRET_READS` rows, the `rg -l "id_rsa" src` row, T6 mirror parity and the instructions-sources test.
- The one failure is `guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` (1617ms against a 1000ms limit, load average about 32 on 10 cores). No task's DONE WHEN or TEST FIRST names it, so under Group mode it is not a gap; the group gate routes it. The Group 3 change keeps `shellSecretRead` a single pass over the words, and the dense script holds no secret path, so the change does not alter that test's work. The Task 4 execution log reports the same timing failure under load.
- Task 5 is satisfied, unchanged since attempt 1. `tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json` records `outcome: "not-shown"`, `cliVersion: "0.166.0"` and a filled `reason`, with a synthetic key only. The report `tests/experiments/hooks/reports/bkit-codex-key-deny-2026-11-14.md` names the doc status, and `docs/testing.md:900` holds § Manual recipe — Codex key-read deny.
- Task 6 is satisfied. Attempt 1 gap 1 is closed: item 4 of the `codex-setup` advisory (`.bkit/core/engine/install/modules/codex.ts:227`, rebuilt in `dist/install/modules/codex.js`) now gives the corrective action for the private-key status (trust the `.codex/` layer, keep private keys out of the repo, run the `docs/testing.md` manual recipe before relying on the deny) as well as the direnv action for `.env`. Attempt 1 gap 2 is closed: the Codex cell of the `File / secrets — shell` row at `.bkit/core/.bkit/providers.md:486` and its `.bkit/providers.md` mirror say private-key reads are configured to deny, not verified on a real Codex host, and that `.env` reads stay advisory. Both mirrors differ from their sources only by the managed marker and consumer-owned override rows.
- The planned TEST FIRST test `a --codex install reports the private-key and .env shell-read protection status` is byte-identical to its attempt 1 text in `build-diff-3-1.md`. The remediation added a separate test, `a --codex install tells the reader how to act on the private-key status`. Both pass in a verifier run, and `pnpm bkit:check:dist` exits 0.
- Enforcement claims re-checked: no doc, advisory, comment or test in the repo (outside `docs/plans/**` and ledgers) says the Codex key-read deny is enforced or verified on a real host. Every status mention uses "configured to deny, not verified on a real Codex host", or "not verified on a real host" in the `providers.md` Enforcement column. The only "verified" text describes the `denied` outcome that the recorded result does not reach (`codex.ts` comment, `docs/testing.md` recipe) or forbids the claim (the Task 5 report). The rendered `.bkit/advisories.md` item 4 carries the same phrase.
- Test-first audit `build-tests-green-3-2.md`: Enforced true, 0 gaps, 0 unproven, and no Updated tests or Already landed sections.
- The `.bkit/workflows.md` and `.bkit/providers.md` Network fetch / OpenCode row changes in the group diff are mirror re-renders of Group 1 source edits, and the `.bkit/version` hash moves follow them. They are not Group 3 work.
- Decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover Group 1 only and accept no Group 3 gap.

## Identified Gaps Log

None
