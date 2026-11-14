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
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4849ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2885ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 4636ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3788ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3961ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3707ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 4460ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 3802ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 6239ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 5354ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2401ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4736ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2776ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2689ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1942ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3153ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2657ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3267ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1556ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1898ms
     ✓ .husky/pre-push: a code push still runs them 1435ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1702ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 1039ms
     ✓ no .envrc → no direnv call 1131ms
     ✓ direnv not on PATH → gates run, no warning 2182ms
     ✓ CI set → no direnv call 1456ms
     ✓ delete-only push through direnv exec → exit 0, no gate 970ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 2043ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1769ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1788ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 1582ms

 Test Files  1 passed (1)
      Tests  116 passed (116)
   Start at  11:36:16
   Duration  233.86s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dRIwB7/junit.xml
```
