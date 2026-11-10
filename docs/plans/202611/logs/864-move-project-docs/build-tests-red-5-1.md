Enforced: true
Red: 2
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an ambiguous legacy wrapper left in a project document" | red | failure: expected 'No project document covers: docs/arch…' to contain 'docs/security.md' |
| 16 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a plan built from the unfilled bkit-plan.md template yields no documentation warning" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain '**security** (starter-only)' |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports an index row through a regular file as ambiguous instead of throwing" | passed-accepted | passes; accepted by the tests step: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture |
| 17 | `.bkit/core/engine/checks/after/tools.test.ts` "reports a NUL-byte index path as ambiguous instead of throwing" | passed-accepted | passes; accepted by the tests step: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/tools.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/tools.test.ts

[test-timeout-budget] load average 12.5 on 10 cores: unit limits 10750ms per test, 21500ms per hook (x2.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ❯ .bkit/core/engine/checks/after/tools.test.ts (44 tests | 1 failed) 277ms
   ✓ detectValeMissing (3)
     ✓ returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH 4ms
     ✓ returns null when vale is on PATH 2ms
     ✓ returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent 1ms
   ✓ detectValePackageNotSynced (4)
     ✓ returns null when vale is not on PATH (spawn exits non-zero) 1ms
     ✓ returns null when vale is on PATH and write-good styles exist 2ms
     ✓ returns finding when vale is on PATH but write-good styles are absent 1ms
     ✓ points at the .vale.ini template before vale sync when the repo has no .vale.ini 1ms
   ✓ detectBkitStubs (10)
     ✓ returns empty when neither bkit-ci.yml nor pre-commit exist 2ms
     ✓ returns empty when bkit-ci.yml has no bkit-stub sentinels 4ms
     ✓ returns one finding per sentinel present in bkit-ci.yml 4ms
     ✓ does not fire when the sentinel line has been removed (block left uncommented in place) 3ms
     ✓ does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory) 2ms
     ✓ does not fire on prose back-references that merely cite a stub id 2ms
     ✓ still fires on the header form regardless of indentation 3ms
     ✓ flags vercel-enabled-without-e2e pair conflict 3ms
     ✓ flags e2e-enabled-without-vercel pair conflict 3ms
     ✓ reads the workflow named by bkit.testing.ciWorkflow and names its path 3ms
   ✓ buildDepUpdaterSetupAdvisory (13)
     ✓ both configs → dep-updater-both 7ms
     ✓ an updater config that does not mention bkit-cloud.yml is quiet (the workflow is the consumer's) 24ms
     ✓ nudges (dep-updater-absent) when workflows exist but neither config is present 4ms
     ✓ returns null when no workflows dir exists 1ms
     ✓ stays quiet when bkit.dependencies.updater is 'none' and no config is present 2ms
     ✓ stays quiet when bkit.dependencies.updater names the config that is present 1ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "" 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is undefined 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 1ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 2ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 2ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 1ms
     ✓ returns null when both actionlint and shellcheck are on PATH 2ms
     ✓ fires (advisory) when a tool is missing, naming it 2ms
   ❯ detectProjectDocs (11)
     ✓ distinguishes missing and empty project documentation from populated candidates 10ms
     ✓ recognizes current and migrated untouched starters 43ms
     ✓ resolves an indexed equivalent without a missing default warning 10ms
     ✓ keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace 9ms
     ✓ recognizes the v6.1.1 untouched security starter as unpopulated 29ms
     ✓ recognizes a legacy deployments starter rendered with default branch dev 46ms
     ✓ returns an advisory instead of throwing when docs is a regular file 2ms
     ✓ does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent 5ms
     × reports an ambiguous legacy wrapper left in a project document 16ms
     ✓ reports an index row through a regular file as ambiguous instead of throwing 3ms
     ✓ reports a NUL-byte index path as ambiguous instead of throwing 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > reports an ambiguous legacy wrapper left in a project document
AssertionError: expected 'No project document covers: docs/arch…' to contain 'docs/security.md'

- Expected
+ Received

- docs/security.md
+ No project document covers: docs/architecture.md, docs/technology.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md.
+ Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply.

 ❯ .bkit/core/engine/checks/after/tools.test.ts:697:18
    695|     const findings = detectProjectDocs(tmpDir);
    696|     const text = allText(findings);
    697|     expect(text).toContain("docs/security.md");
       |                  ^
    698|     expect(text).toContain("bkit:start");
    699|     const cleanup = findings.find((f) => f.detect.includes("bkit:start…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 43 passed (44)
   Start at  12:09:28
   Duration  640ms (tests 63%, setup 14%, transform 14%, import 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UUvfRQ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts

[test-timeout-budget] load average 12.5 on 10 cores: unit limits 10750ms per test, 21500ms per hook (x2.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (46 tests | 1 failed) 56ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 4ms
     ✓ gives the uppercase key for a prefixed issue segment 1ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (43)
     ✓ writes the header every reader expects, and the next step with the ref 5ms
     ✓ writes Publish: held when publish is false 1ms
     ✓ writes Publish: pr by default 0ms
     ✓ writes Docs: not synced on a held summary 1ms
     ✓ keeps the verdict and next step unchanged by publish 1ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 1ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 1ms
     ✓ design clears only the review covered by a passing update 1ms
     ✓ plan clears only the review covered by a passing update 0ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 0ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 2ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 1ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 7ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 1ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 1ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 1ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 1ms
     ✓ a build with no plan file fails, even when every step passed 1ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 2ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 0ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 1ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 1ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 0ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 0ms
     ✓ ignores warning records inside an UNTRUSTED fence 0ms
     × a plan built from the unfilled bkit-plan.md template yields no documentation warning 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > a plan built from the unfilled bkit-plan.md template yields no documentation warning
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain '**security** (starter-only)'

- Expected
+ Received

- **security** (starter-only)
+ Verdict: PASS
+ Failures: 0
+ <!-- verdict:end -->
+
+ # Build Summary
+
+ ## Verdict
+
+ PASS
+
+ - No unresolved finding, failing check, open task, accepted limitation or open deferral.
+
+ Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.
+
+ Publish: pr
+
+ ## Steps
+
+ | Step | Verdict | Failures | Attempts | Artifact |
+ | --- | --- | --- | --- | --- |
+ | plan-write | PASS | - | 1 | `log/plan.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | plan-write | PASS | - | `log/plan.md` |
+
+ ## Challenge
+
+ None
+
+ ## Tests
+
+ None recorded.
+
+ ## Documentation Warnings
+
+ - **security** (starter-only) — `docs/security.md`
+   - Evidence: The CI configuration defines token permissions.
+   - Action: Populate the security document with the project's credential and permission boundaries.
+
+ ## Risks and Action Items
+
+ None
+
+ ## Recommended Next Step
+
+ ```text
+ /bkit-ship #682
+ ```
+

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1101:28
    1099|       }),
    1100|     );
    1101|     expect(s.markdown).not.toContain("**security** (starter-only)");
       |                            ^
    1102|     expect(s.markdown).not.toContain("## Documentation Warnings");
    1103|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 45 passed (46)
   Start at  12:09:31
   Duration  918ms (transform 48%, import 33%, setup 10%, tests 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6toIWm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````
