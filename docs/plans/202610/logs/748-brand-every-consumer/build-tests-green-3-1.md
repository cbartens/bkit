Enforced: true
Verdict: null
Gaps: 10
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/templates/templates.test.ts` "Vale template ships the Bkit style and .vale.ini names it" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/branding.test.ts` "consumer-facing names carry the bkit prefix > the shipped Vale style" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Filler.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Hedging.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/LLMSlop.yml" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` "this repo adopts its own templates > .vale/styles/Bkit/Verbose.yml" | red | passed |
| 7 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedFileTokens (via runBkitDocs) > rewrites old script tokens in husky hooks and the CI workflow" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" | red | not passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a dry-run hook and CI token migration writes nothing" | red | passed |
| 8 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > moves shipped CI script units to bkit- names and rewrites their paths" | red | passed |
| 8 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves an edited or already-renamed unit and logs the manual move" | red | passed |
| 8 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" | red | not passed |

## Gaps

- Task 7 `not-green` — "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" failure: expected '[bkit-upgrade] Running upgrade (non-i…' not to contain '.husky/pre-push' — Fixable: true — log: TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` — not-green — Fixable: true
- Task 8 `not-green` — "a second template-file migration and a dry run write and move nothing" failure: expected { …(211) } to deeply equal { …(211) } — Fixable: true — log: TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing` — not-green — Fixable: true
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:15`, and 12 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:14`, `.bkit/templates/.vale.ini:20`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:13`, `.bkit/templates/.vale.ini:19`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/templates/.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 31 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Filler.yml` is still referenced as `Filler`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:310`, `.bkit/core/engine/checks/tips/catalogue.ts:199`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:15`, and 12 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Hedging.yml` is still referenced as `Hedging`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:311`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:14`, `.bkit/templates/.vale.ini:20`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/LLMSlop.yml` is still referenced as `LLMSlop`: `.bkit/core/.bkit/templates.md:333`, `.bkit/core/engine/audits/templates/templates.test.ts:312`, `.bkit/templates.md:333`, `.bkit/templates/.vale.ini:13`, `.bkit/templates/.vale.ini:19`, and 11 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.vale/styles/House/Verbose.yml` is still referenced as `Verbose`: `.agents/skills/writing-skills/SKILL.md:268`, `.bkit/core/.bkit/templates.md:333`, `.bkit/core/.bkit/workflows.md:832`, `.bkit/core/.bkit/workflows.md:833`, `.bkit/core/.bkit/workflows.md:834`, and 31 more — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

````
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #255 — upgrade does not force-create uninstalled host/tooling modules > a second template-file migration and a dry run write and move nothing
AssertionError: expected { …(211) } to deeply equal { …(211) }

- Expected
+ Received

@@ -26479,11 +26479,11 @@
  session; the resulting filesystem is snapshotted and reused, so later sessions
  start fast.

  ```bash
  #!/bin/bash
- # cache-bust 2026-11-02-2
+ # cache-bust 2026-11-02-3
  set -euo pipefail

  # Every download is pinned to a version and checked against its published sha256
  # before it is unpacked or made executable. The image targets linux/amd64.
  # Node — nodejs.org tarball checked against SHASUMS256.txt (linux-x64), same pin as

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:1147:28
    1145|     const second = runCli(["upgrade", "--auto-apply"]);
    1146|     expect(second.status, combinedOutput(second)).toBe(0);
    1147|     expect(snapshotTree()).toEqual(afterFirst);
       |                            ^
    1148|   });
    1149| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 58 passed (60)
   Start at  13:50:39
   Duration  34.01s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7mQZX1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
