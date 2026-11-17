Enforced: true
Verdict: null
Gaps: 11
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "ships ten optional document starters on fresh install" | red | passed |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves the contents of a legacy managed document when reinstalling" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "migrates legacy ownership without changing project text or core ownership" | red | not passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "preserves ambiguous legacy markers and reports cleanup without blocking check" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "previews project document migration without mutating the checkout" | red | passed |
| 1 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "preserves project document copies on full uninstall" | red | passed |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "registers an adopted starter without duplicating project rows" | red | passed |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves indexed equivalents and warns about unsafe registration paths" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/templates.test.ts` "resolves documentation references against the correct ownership sources" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` "allows qualified project document reads and rejects mandatory template dependencies" | red | passed |

## Gaps

- Task 1 `not-green` — "migrates legacy ownership without changing project text or core ownership" failure: expected { …(265) } to deeply equal { …(265) } — Fixable: true — log: TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` — not-green — Fixable: true
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/architecture.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/technology.md` is still referenced as `technology`: `.agents/plugins/bkit/agents/bkit-build-install-skills.md:53`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:54`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:55`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:74`, `.agents/plugins/bkit/agents/bkit-build-install-skills.md:86`, and 215 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/security.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/data-schema.md` is still referenced as `data-schema`: `.bkit/README.md:294`, `.bkit/core/.bkit/README.md:294`, `.bkit/core/.bkit/install.md:335`, `.bkit/core/.bkit/templates.md:653`, `.bkit/core/engine/audits/templates/template-path-refs.test.ts:207`, and 19 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/testing.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/deployments.md` is still referenced as `deployments`: `.bkit/README.md:294`, `.bkit/core/.bkit/README.md:294`, `.bkit/core/.bkit/install.md:335`, `.bkit/core/.bkit/templates.md:653`, `.bkit/core/.bkit/workflows.md:1679`, and 241 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/observability.md` is still referenced as `observability`: `.agents/context.md:118`, `.agents/plugins/bkit/agents/bkit-debug-abort-handover.md:103`, `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md:157`, `.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md:97`, `.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md:54`, and 460 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/design.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/noise.md` is still referenced as `noise`: `.agents/plugins/bkit/agents/bkit-design-review-2.md:106`, `.agents/skills/brainstorming/visual-companion.md:100`, `.agents/skills/property-based-testing/references/interpreting-failures.md:11`, `.agents/skills/property-based-testing/references/refactoring.md:115`, `.agents/skills/property-based-testing/references/reviewing.md:34`, and 318 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 1 `delete-still-referenced` — DELETE `.bkit/shared/docs/setup.md`: references not checked — git grep exited SIGTERM:  — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

````
  _bkit: 6.1.1_  
- _Mode: check_
+ _Mode: upgrade_

  > Auto-generated by `bkit install` / `bkit check` / `bkit upgrade` / `bkit doctor`. Overwritten on each run.

  9 finding(s) — 0 blocker, 9 advisory.

@@ -29773,11 +29773,11 @@
  session; the resulting filesystem is snapshotted and reused, so later sessions
  start fast.

  ```bash
  #!/bin/bash
- # cache-bust 2026-11-09-2
+ # cache-bust 2026-11-09-3
  set -euo pipefail

  # Every download is pinned to a version and checked against its published sha256
  # before it is unpacked or made executable. The image targets linux/amd64.
  # Node — nodejs.org tarball checked against SHASUMS256.txt (linux-x64), same pin as

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2436:24
    2434|     const again = runCli(["upgrade", "--auto-apply"]);
    2435|     expect(again.status, combinedOutput(again)).toBe(0);
    2436|     expect(snapshot()).toEqual(settled);
       |                        ^
    2437|   });
    2438|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  21:51:37
   Duration  102.58s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-IyqwgC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
