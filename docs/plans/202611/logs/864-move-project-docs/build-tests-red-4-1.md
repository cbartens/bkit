Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/commands/workflow/summary.test.ts` "excludes raw tracker text in related-issues.md from documentation warnings" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'TRACKER-INJECTED-ACTION' |
| 10 | `.bkit/core/engine/commands/workflow/summary.test.ts` "ignores warning records inside an UNTRUSTED fence" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'UNTRUSTED-ACTION' |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes the v6.1.1 untouched security starter as unpopulated" | red | failure: expected undefined to be defined |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes a legacy deployments starter rendered with default branch dev" | red | failure: expected undefined to be defined |
| 12 | `.bkit/core/engine/install/managed-block.test.ts` "removes a v5 PolyForm-licensed notice with the wrapper" | red | failure: expected '<!-- bkit:managed v5.0.0 — PolyForm N…' not to contain 'bkit:managed' |
| 12 | `.bkit/core/engine/install/managed-block.test.ts` "removes a pre-6.0 do NOT edit notice with the wrapper" | red | failure: expected '<!-- bkit:managed v4.12.0 — PolyForm …' not to contain 'bkit:managed' |
| 13 | `.bkit/core/engine/install/project-docs.test.ts` "reports instead of throwing when docs is a regular file" | red | failure: expected [Function] to not throw an error but 'Error: ENOTDIR: not a directory, lsta…' was thrown |
| 13 | `.bkit/core/engine/checks/after/tools.test.ts` "returns an advisory instead of throwing when docs is a regular file" | red | failure: expected [Function] to not throw an error but 'Error: ENOTDIR: not a directory, lsta…' was thrown |
| 14 | `.bkit/core/engine/checks/after/tools.test.ts` "does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent" | red | failure: expected 'Add a row for each to `## Project Doc…' not to contain 'bkit upgrade' |
| 14 | `.bkit/core/engine/install/project-docs.test.ts` "registers a present default doc when its only equivalent row points at a missing file" | red | failure: expected [] to deeply equal [ 'docs/security.md' ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/summary.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/summary.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/summary.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/summary.test.ts

[test-timeout-budget] load average 2.4 on 10 cores: unit limits 5700ms per test, 11400ms per hook (x1.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (45 tests | 2 failed) 15ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 1ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (42)
     ✓ writes the header every reader expects, and the next step with the ref 1ms
     ✓ writes Publish: held when publish is false 0ms
     ✓ writes Publish: pr by default 0ms
     ✓ writes Docs: not synced on a held summary 0ms
     ✓ keeps the verdict and next step unchanged by publish 0ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 0ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 0ms
     ✓ design clears only the review covered by a passing update 0ms
     ✓ plan clears only the review covered by a passing update 0ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 0ms
     ✓ retains unrelated concerns after resolving a review 0ms
     ✓ an update that applies critical review findings leaves only its optional concerns 0ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 0ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 0ms
     ✓ uses the latest verification and preserves earlier attempts in history 0ms
     ✓ resolves challenge findings only through their matching round's verified tasks 2ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 0ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 0ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 0ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 0ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 0ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 0ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 0ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 0ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 0ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 0ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 0ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 0ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 0ms
     × excludes raw tracker text in related-issues.md from documentation warnings 3ms
     × ignores warning records inside an UNTRUSTED fence 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > excludes raw tracker text in related-issues.md from documentation warnings
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'TRACKER-INJECTED-ACTION'

- Expected
+ Received

- TRACKER-INJECTED-ACTION
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
+ | plan-fetch-context | PASS | - | 1 | `log/related-issues.md`, `log/related-failures.md`, `log/related-deferrals.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | plan-fetch-context | PASS | - | `log/related-issues.md`, `log/related-failures.md`, `log/related-deferrals.md` |
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
+   - Evidence: TRACKER-EVIDENCE
+   - Action: TRACKER-INJECTED-ACTION
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

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1037:28
    1035|       }),
    1036|     );
    1037|     expect(s.markdown).not.toContain("TRACKER-INJECTED-ACTION");
       |                            ^
    1038|     expect(s.markdown).not.toContain("## Documentation Warnings");
    1039|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > ignores warning records inside an UNTRUSTED fence
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'UNTRUSTED-ACTION'

- Expected
+ Received

- UNTRUSTED-ACTION
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
+ | build-plan-tasks | PASS | - | 1 | `log/a.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | build-plan-tasks | PASS | - | `log/a.md` |
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
+   - Evidence: e
+   - Action: KEEP-ACTION
+   - Action: UNTRUSTED-ACTION
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

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1080:28
    1078|     );
    1079|     expect(s.markdown).toContain("KEEP-ACTION");
    1080|     expect(s.markdown).not.toContain("UNTRUSTED-ACTION");
       |                            ^
    1081|     expect(s.markdown).not.toContain("UNTRUSTED-SECTION-ACTION");
    1082|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 43 passed (45)
   Start at  11:00:48
   Duration  201ms (import 45%, transform 31%, setup 13%, tests 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-b5xG5y/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/tools.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/tools.test.ts

[test-timeout-budget] load average 2.4 on 10 cores: unit limits 5700ms per test, 11400ms per hook (x1.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/checks/after/tools.test.ts (41 tests | 4 failed) 63ms
   ✓ detectValeMissing (3)
     ✓ returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH 1ms
     ✓ returns null when vale is on PATH 0ms
     ✓ returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent 0ms
   ✓ detectValePackageNotSynced (4)
     ✓ returns null when vale is not on PATH (spawn exits non-zero) 0ms
     ✓ returns null when vale is on PATH and write-good styles exist 1ms
     ✓ returns finding when vale is on PATH but write-good styles are absent 0ms
     ✓ points at the .vale.ini template before vale sync when the repo has no .vale.ini 0ms
   ✓ detectBkitStubs (10)
     ✓ returns empty when neither bkit-ci.yml nor pre-commit exist 1ms
     ✓ returns empty when bkit-ci.yml has no bkit-stub sentinels 1ms
     ✓ returns one finding per sentinel present in bkit-ci.yml 1ms
     ✓ does not fire when the sentinel line has been removed (block left uncommented in place) 1ms
     ✓ does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory) 1ms
     ✓ does not fire on prose back-references that merely cite a stub id 1ms
     ✓ still fires on the header form regardless of indentation 1ms
     ✓ flags vercel-enabled-without-e2e pair conflict 1ms
     ✓ flags e2e-enabled-without-vercel pair conflict 1ms
     ✓ reads the workflow named by bkit.testing.ciWorkflow and names its path 1ms
   ✓ buildDepUpdaterSetupAdvisory (13)
     ✓ both configs → dep-updater-both 1ms
     ✓ an updater config that does not mention bkit-cloud.yml is quiet (the workflow is the consumer's) 1ms
     ✓ nudges (dep-updater-absent) when workflows exist but neither config is present 0ms
     ✓ returns null when no workflows dir exists 0ms
     ✓ stays quiet when bkit.dependencies.updater is 'none' and no config is present 1ms
     ✓ stays quiet when bkit.dependencies.updater names the config that is present 1ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "" 1ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is undefined 1ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 0ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 0ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 0ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 0ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 0ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 0ms
     ✓ returns null when both actionlint and shellcheck are on PATH 1ms
     ✓ fires (advisory) when a tool is missing, naming it 1ms
   ❯ detectProjectDocs (8)
     ✓ distinguishes missing and empty project documentation from populated candidates 2ms
     ✓ recognizes current and migrated untouched starters 10ms
     ✓ resolves an indexed equivalent without a missing default warning 2ms
     ✓ keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace 2ms
     × recognizes the v6.1.1 untouched security starter as unpopulated 11ms
     × recognizes a legacy deployments starter rendered with default branch dev 10ms
     × returns an advisory instead of throwing when docs is a regular file 2ms
     × does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > recognizes the v6.1.1 untouched security starter as unpopulated
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:650:25
    648|     writeIndex([{ doc: "docs/security.md" }]);
    649|     const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id ===…
    650|     expect(unpopulated).toBeDefined();
       |                         ^
    651|     expect(unpopulated!.detect).toContain("docs/security.md");
    652|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > recognizes a legacy deployments starter rendered with default branch dev
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:658:25
    656|     writeIndex([{ doc: "docs/deployments.md" }]);
    657|     const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id ===…
    658|     expect(unpopulated).toBeDefined();
       |                         ^
    659|     expect(unpopulated!.detect).toContain("docs/deployments.md");
    660|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > returns an advisory instead of throwing when docs is a regular file
AssertionError: expected [Function] to not throw an error but 'Error: ENOTDIR: not a directory, lsta…' was thrown

- Expected:
undefined

+ Received:
"Error: ENOTDIR: not a directory, lstat '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-postinstall-test-lLcZpM/docs/architecture.md'"

 ❯ .bkit/core/engine/checks/after/tools.test.ts:668:12
    666|     expect(() => {
    667|       findings = detectProjectDocs(tmpDir);
    668|     }).not.toThrow();
       |            ^
    669|     const ambiguous = findings.find((f) => f.id === "project-docs-ambi…
    670|     expect(ambiguous).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
AssertionError: expected 'Add a row for each to `## Project Doc…' not to contain 'bkit upgrade'

Expected: "bkit upgrade"
Received: "Add a row for each to `## Project Documents` in .agents/docs.md, or run `bkit upgrade` to register the default paths."

 ❯ .bkit/core/engine/checks/after/tools.test.ts:686:26
    684|       .join("\n");
    685|     // Sync either registered the doc (no advisory) or the advisory mu…
    686|     expect(promised).not.toContain("bkit upgrade");
       |                          ^
    687|   });
    688| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 37 passed (41)
   Start at  11:00:49
   Duration  187ms (tests 50%, transform 26%, setup 15%, import 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Laulr4/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/managed-block.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/managed-block.test.ts

```

## Runner output — `.bkit/core/engine/install/managed-block.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/managed-block.test.ts

[test-timeout-budget] load average 2.3 on 10 cores: unit limits 5650ms per test, 11300ms per hook (x1.13)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794272450139.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794272450140.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794272450140.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794272450142.js — skipping

 ❯ .bkit/core/engine/install/managed-block.test.ts (34 tests | 2 failed) 10ms
   ✓ updateManagedBlock (9)
     ✓ preserves outside-block content when markers present 1ms
     ✓ is a no-op (returns false) when markers absent 1ms
     ✓ returns false when content is already identical 0ms
     ✓ inverted markers (end before start) — skips with warning 0ms
     ✓ duplicate markers — skips with warning (preserves all content) 0ms
     ✓ idempotent on second run even when newContent has a trailing newline 0ms
     ✓ idempotent on second run with newContent that has no trailing newline 0ms
     ✓ shell-comment markers — preserves '# ' prefix on both marker lines 0ms
     ✓ shell-comment markers — idempotent on second run 0ms
   ✓ extractManagedBlock (6)
     ✓ extracts inner content with surrounding newlines stripped 0ms
     ✓ returns null when markers absent 0ms
     ✓ returns null when start appears after end (inverted) 0ms
     ✓ returns null when markers are duplicated 0ms
     ✓ extracts inner content from shell-comment-prefixed markers 0ms
     ✓ ignores backtick-quoted prose mentions 0ms
   ✓ slash-comment marker round-trip (markerStyle: 'slash-comment') (7)
     ✓ extractManagedBlock with slash-comment extracts inner content from JS 0ms
     ✓ extractFullManagedBlock with slash-comment includes marker lines 0ms
     ✓ updateManagedBlock with slash-comment round-trips on JS content 0ms
     ✓ updateManagedBlock with slash-comment is idempotent on second run 0ms
     ✓ updateManagedBlock with slash-comment no-op when markers absent 0ms
     ✓ findLineAnchoredMarkers finds a bare slash-comment marker (prefix '' is allowed) 0ms
     ✓ a bare `# bkit:start` line is not a slash-comment marker 0ms
   ✓ html-comment marker round-trip + default-arg backward compat (5)
     ✓ html-comment round-trip on markdown content 0ms
     ✓ html-comment round-trip on .gitignore content 0ms
     ✓ default arg (no markerStyle) behaves identically to html-comment (backward compat) 0ms
     ✓ updateManagedBlock default (no markerStyle) produces byte-identical output to v0.1.1 0ms
     ✓ a bare `# bkit:start` line is not an html-comment marker 0ms
   ✓ findUnmarkedCopy (5)
     ✓ returns the title when the text holds the title and enough of the block verbatim 0ms
     ✓ returns null for the consumer's own doc that only shares the title 0ms
     ✓ returns null when the shared lines come without the title 0ms
     ✓ ignores title-shaped lines inside fenced code 0ms
     ✓ returns null when the block has no title 0ms
   ❯ stripManagedWrapper historical notices (2)
     × removes a v5 PolyForm-licensed notice with the wrapper 3ms
     × removes a pre-6.0 do NOT edit notice with the wrapper 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > stripManagedWrapper historical notices > removes a v5 PolyForm-licensed notice with the wrapper
AssertionError: expected '<!-- bkit:managed v5.0.0 — PolyForm N…' not to contain 'bkit:managed'

- Expected
+ Received

- bkit:managed
+ <!-- bkit:managed v5.0.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->
+
+ # Doc
+
+ Body.
+

 ❯ .bkit/core/engine/install/managed-block.test.ts:342:27
    340|     const r = stripManagedWrapper(wrap(notice));
    341|     expect(r.status).toBe("removed");
    342|     expect(r.content).not.toContain("bkit:managed");
       |                           ^
    343|     expect(r.content).not.toContain("PolyForm");
    344|     expect(r.content).toBe("# Doc\n\nBody.\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > stripManagedWrapper historical notices > removes a pre-6.0 do NOT edit notice with the wrapper
AssertionError: expected '<!-- bkit:managed v4.12.0 — PolyForm …' not to contain 'bkit:managed'

- Expected
+ Received

- bkit:managed
+ <!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do NOT edit; run `bkit upgrade` to refresh -->
+
+ # Doc
+
+ Body.
+

 ❯ .bkit/core/engine/install/managed-block.test.ts:354:29
    352|       const r = stripManagedWrapper(wrap(n));
    353|       expect(r.status).toBe("removed");
    354|       expect(r.content).not.toContain("bkit:managed");
       |                             ^
    355|       expect(r.content).not.toContain("do NOT edit");
    356|       expect(r.content).toBe("# Doc\n\nBody.\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 32 passed (34)
   Start at  11:00:50
   Duration  91ms (setup 50%, tests 30%, transform 9%, import 8%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-AffwJb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/project-docs.test.ts

```

## Runner output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/project-docs.test.ts

[test-timeout-budget] load average 2.3 on 10 cores: unit limits 5650ms per test, 11300ms per hook (x1.13)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

 ❯ .bkit/core/engine/install/project-docs.test.ts (12 tests | 2 failed) 76ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 1ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 0ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 58ms
   ❯ syncProjectDocs (6)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 3ms
     ✓ writes nothing on a dry run 2ms
     ✓ keeps an ambiguous wrapper and reports it 4ms
     ✓ adds no row when an indexed equivalent covers the topic 2ms
     × reports instead of throwing when docs is a regular file 4ms
     × registers a present default doc when its only equivalent row points at a missing file 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
AssertionError: expected [Function] to not throw an error but 'Error: ENOTDIR: not a directory, lsta…' was thrown

- Expected:
undefined

+ Received:
"Error: ENOTDIR: not a directory, lstat '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/project-docs-H8UTpd/docs/architecture.md'"

 ❯ .bkit/core/engine/install/project-docs.test.ts:152:12
    150|     expect(() => {
    151|       report = syncProjectDocs(root, { dryRun: false });
    152|     }).not.toThrow();
       |            ^
    153|     expect(report!.migrated).toEqual([]);
    154|     expect(report!.registered).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
AssertionError: expected [] to deeply equal [ 'docs/security.md' ]

- Expected
+ Received

- [
-   "docs/security.md",
- ]
+ []

 ❯ .bkit/core/engine/install/project-docs.test.ts:168:26
    166|     );
    167|     const r = syncProjectDocs(root, { dryRun: false });
    168|     expect(r.registered).toEqual(["docs/security.md"]);
       |                          ^
    169|     expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")…
    170|       "`docs/security.md`",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 10 passed (12)
   Start at  11:00:50
   Duration  165ms (tests 73%, setup 18%, import 4%, transform 4%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gZhG7r/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
