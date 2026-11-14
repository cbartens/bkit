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
| 1 | `.bkit/core/engine/tools/instructions.test.ts` "every build and debug prompt that runs tests carries local-pre-commit" | red | passed |
| 1 | `.bkit/core/engine/tools/instructions.test.ts` "local-pre-commit covers test runs made while working, not only before a commit" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug" | red | passed |
| 4 | `.bkit/core/engine/tools/instructions.test.ts` "every debug prompt that runs tests by file or name filter carries local-pre-commit" | red | passed |
| 5 | `.bkit/core/engine/tools/instructions.test.ts` "local-tests-first does not ask for the full local suite that local-pre-commit forbids while working" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" | no row | not passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug" | red | passed |
| 8 | `.bkit/core/engine/tools/instructions.test.ts` "bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run" | red | passed |
| 9 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm reads check-run conclusions, not the combined commit status" | red | passed |

## Gaps

- Task 6 `not-green` — the named test ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" did not run; the report holds ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate", ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run", ".husky/pre-push delete-only push > .bkit/templates/.husky/pre-push: empty stdin → gates still run", ".husky/pre-push delete-only push > .husky/pre-push: every ref deleted → exits 0 without running a gate", ".husky/pre-push delete-only push > .husky/pre-push: a delete mixed with an update → gates still run", … — Fixable: true — log: TASK 6: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` — not-green — Fixable: true

## Unproven

- Task 6 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate" — no tests step recorded a red for it (`bkit tests red --group=2`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 5964ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 3433ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 3567ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3694ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4116ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 4638ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 5304ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 3175ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 5917ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 5854ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 3072ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 5886ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 4189ms
     ✓ .husky/pre-push: a code file in the push → the full gate 3091ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3664ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 5175ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 4083ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 4666ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2843ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 4178ms
     ✓ .husky/pre-push: a code push still runs them 2564ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 3201ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 1053ms
     ✓ no .envrc → no direnv call 1209ms
     ✓ direnv not on PATH → gates run, no warning 2762ms
     ✓ CI set → no direnv call 1093ms
     ✓ delete-only push through direnv exec → exit 0, no gate 701ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 3291ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 2554ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 2800ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 5710ms

 Test Files  1 passed (1)
      Tests  116 passed (116)
   Start at  15:31:31
   Duration  250.86s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wXXPrK/junit.xml
```
