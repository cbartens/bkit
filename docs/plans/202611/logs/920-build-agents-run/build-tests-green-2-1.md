Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/920-build-agents-run-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug" | red | passed |
| 4 | `.bkit/core/engine/tools/instructions.test.ts` "every debug prompt that runs tests by file or name filter carries local-pre-commit" | red | passed |
| 5 | `.bkit/core/engine/tools/instructions.test.ts` "local-tests-first does not ask for the full local suite that local-pre-commit forbids while working" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" | no row | not passed |

## Gaps

- Task 6 `not-green` — the named test ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" did not run; the report holds ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate", ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run", ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: empty stdin → gates still run", ".husky/pre-push delete-only push > .husky/pre-push: every ref deleted → exits 0 without running a gate", ".husky/pre-push delete-only push > .husky/pre-push: a delete mixed with an update → gates still run", … — Fixable: true — log: TASK 6: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` — not-green — Fixable: true

## Unproven

- Task 6 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" — no tests step recorded a red for it (`bkit tests red --group=2`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4056ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2325ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 3025ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2393ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2978ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2605ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3251ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2874ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 4866ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3533ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2284ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4657ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2400ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2657ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2187ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1931ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1585ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1741ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1809ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1665ms
     ✓ .husky/pre-push: a code push still runs them 1565ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1154ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 480ms
     ✓ no .envrc → no direnv call 704ms
     ✓ direnv not on PATH → gates run, no warning 1492ms
     ✓ CI set → no direnv call 727ms
     ✓ delete-only push through direnv exec → exit 0, no gate 529ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1093ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1187ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1545ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 2493ms

 Test Files  1 passed (1)
      Tests  116 passed (116)
   Start at  11:25:21
   Duration  132.51s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wQcESc/junit.xml
```
