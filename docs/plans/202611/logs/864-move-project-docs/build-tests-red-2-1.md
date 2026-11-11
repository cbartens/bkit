Enforced: true
Red: 8
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "distinguishes missing and empty project documentation from populated candidates" | red | failure: detectProjectDocs is not a function |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes current and migrated untouched starters" | red | failure: detectProjectDocs is not a function |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" | red | failure: detectProjectDocs is not a function |
| 5 | `.bkit/core/engine/checks/after/index.test.ts` "reports and suppresses project documentation advisories without a blocker" | red | failure: expected [] to deeply equal ArrayContaining{…} |
| 6 | `.bkit/core/engine/commands/workflow/summary.test.ts` "consolidates documentation warnings from the active run without changing its verdict" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain '## Documentation Warnings' |
| 6 | `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` "reports only attributed documentation warnings for the active run" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain '## Documentation Warnings' |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "covers the full documentation responsibility inventory" | red | failure: expected [ Array(1) ] to deeply equal [] |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "ships documentation warning contracts for plan and no-plan paths" | red | failure: expected [ …(69) ] to deeply equal [] |

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

[test-timeout-budget] load average 6.6 on 10 cores: unit limits 7800ms per test, 15600ms per hook (x1.56)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/checks/after/tools.test.ts (36 tests | 3 failed) 43ms
   ✓ detectValeMissing (3)
     ✓ returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH 2ms
     ✓ returns null when vale is on PATH 4ms
     ✓ returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent 3ms
   ✓ detectValePackageNotSynced (4)
     ✓ returns null when vale is not on PATH (spawn exits non-zero) 0ms
     ✓ returns null when vale is on PATH and write-good styles exist 1ms
     ✓ returns finding when vale is on PATH but write-good styles are absent 1ms
     ✓ points at the .vale.ini template before vale sync when the repo has no .vale.ini 0ms
   ✓ detectBkitStubs (10)
     ✓ returns empty when neither bkit-ci.yml nor pre-commit exist 1ms
     ✓ returns empty when bkit-ci.yml has no bkit-stub sentinels 1ms
     ✓ returns one finding per sentinel present in bkit-ci.yml 2ms
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
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 1ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 0ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 0ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 0ms
     ✓ returns null when both actionlint and shellcheck are on PATH 0ms
     ✓ fires (advisory) when a tool is missing, naming it 1ms
   ❯ detectProjectDocs (3)
     × distinguishes missing and empty project documentation from populated candidates 2ms
     × recognizes current and migrated untouched starters 9ms
     × resolves an indexed equivalent without a missing default warning 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > distinguishes missing and empty project documentation from populated candidates
TypeError: detectProjectDocs is not a function
 ❯ .bkit/core/engine/checks/after/tools.test.ts:470:22
    468|     writeIndex([{ doc: "docs/security.md" }, { doc: "docs/testing.md" …
    469|
    470|     const findings = detectProjectDocs(tmpDir);
       |                      ^
    471|
    472|     // Every finding is an advisory with a detect and an action, never…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > recognizes current and migrated untouched starters
TypeError: detectProjectDocs is not a function
 ❯ .bkit/core/engine/checks/after/tools.test.ts:533:22
    531|     ]);
    532|
    533|     const findings = detectProjectDocs(tmpDir);
       |                      ^
    534|     const unpopulated = findings.find((f) => f.id === "project-docs-un…
    535|     expect(unpopulated).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > resolves an indexed equivalent without a missing default warning
TypeError: detectProjectDocs is not a function
 ❯ .bkit/core/engine/checks/after/tools.test.ts:557:22
    555|     ]);
    556|
    557|     const findings = detectProjectDocs(tmpDir);
       |                      ^
    558|     const missing = findings.find((f) => f.id === "project-docs-missin…
    559|     expect(missing).toBeDefined();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 33 passed (36)
   Start at  23:53:38
   Duration  160ms (tests 42%, transform 32%, setup 15%, import 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-KB9JRY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/after/index.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/index.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/index.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/index.test.ts

[test-timeout-budget] load average 6.3 on 10 cores: unit limits 7650ms per test, 15300ms per hook (x1.53)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing
[bkit-install] Wrote .bkit/advisories.md (1 item).

stdout | .bkit/core/engine/checks/after/index.test.ts > writeAdvisoriesArtifact > overwrites an existing artifact on each call
[bkit-install] Wrote .bkit/advisories.md (0 items).

 ❯ .bkit/core/engine/checks/after/index.test.ts (54 tests | 1 failed) 93ms
   ✓ formatChecklist (8)
     ✓ returns empty string when findings array is empty 1ms
     ✓ renders correct format for a single finding 0ms
     ✓ renders correct format for multiple findings with sequential numbering 0ms
     ✓ includes the banner header and instructions 0ms
     ✓ lists firing setup tips after the findings, and renders for tips alone 0ms
     ✓ appends one suppressed line per dismissal 0ms
     ✓ renders the suppressed block even when no findings remain 0ms
     ✓ stays silent when there is nothing to report 0ms
   ✓ renderAdvisoriesMarkdown (6)
     ✓ renders a 'no advisories' stub when findings is empty 0ms
     ✓ starts with a Vale whole-file skip marker — generated artifact must not fail consumer bkit:lint:prose 0ms
     ✓ renders findings as numbered sections with severity, detect, action 0ms
     ✓ counts severities correctly with mixed list 0ms
     ✓ renders the suppressed block and drops the clean-run stub 0ms
     ✓ renders no suppressed block when nothing was dismissed 0ms
   ✓ writeAdvisoriesArtifact (3)
     ✓ writes .bkit/advisories.md to the consumer cwd, creating .bkit/ if missing 1ms
     ✓ overwrites an existing artifact on each call 1ms
     ✓ does not throw on write failure (best-effort, logs error) 1ms
   ✓ runPostInstallCheck deduplication (4)
     ✓ deduplicates findings within Phase 3 when same id appears multiple times 4ms
     ✓ B2: cross-phase dedup is position-stable — preflight order preserved, Phase 3 appended 1ms
     ✓ deduplicates duplicate ids within incoming preflightAdvisories (intra-preflight dedup) 1ms
     ✓ collects suppression notes from the detectors when the out-param is passed 4ms
   ✓ main-branch-protection-missing (2)
     ✓ names the capstone set in bkit.testing.ciCapstone as the required check 2ms
     ✓ names the default capstone when none is configured 1ms
   ✓ readChangelogVersionDelta (5)
     ✓ returns version-delta header string when CHANGELOG.md exists and version matches 2ms
     ✓ reads the package's CHANGELOG.md whatever the working directory 1ms
     ✓ resolves CHANGELOG.md from the built dist/ layout 42ms
     ✓ returns null when version is not found in CHANGELOG.md 1ms
     ✓ returns null when CHANGELOG.md does not exist 1ms
   ✓ edge cases (21)
     ✓ detectBkitVersionMajorDowngrade — NaN-guard edge cases (5)
       ✓ emits NO advisory when .bkit-version is an empty file (parseInt returns NaN) 1ms
       ✓ emits NO advisory when .bkit-version contains only whitespace 1ms
       ✓ emits NO advisory when .bkit-version has a non-semver string (e.g. 'unknown') 1ms
       ✓ does NOT produce a detect message containing the string 'NaN' 1ms
       ✓ still emits an advisory when .bkit-version is valid and major is higher 1ms
     ✓ detectBkitVersionPinStale — malformed on-disk version guard (2)
       ✓ emits NO advisory when .bkit/version is empty (NaN comparison guard) 1ms
       ✓ emits NO advisory when installed package.json has empty version field 1ms
     ✓ runPostInstallCheck — intra-phase Phase 3 deduplication (2)
       ✓ drops the second occurrence when two Phase-3 detectors would produce the same id 2ms
       ✓ first occurrence wins when ids collide in Phase 3 2ms
     ✓ formatChecklist — byte-for-byte snapshot (Plan §F5) (5)
       ✓ matches inline snapshot for a 2-finding fixture 3ms
       ✓ matches inline snapshot for a single blocker finding 1ms
       ✓ returns empty string (not a whitespace-only string) for empty findings array 0ms
       ✓ banner separator is exactly 58 '=' characters 0ms
       ✓ each finding section has Detect and Action starting at column 0 0ms
     ✓ Phase 1 blocker short-circuit — vi.spyOn hardened path (4)
       ✓ runPreflight returns a blocker and formatChecklist produces a non-empty exit banner 1ms
       ✓ formatChecklist for single blocker renders 1/1 count correctly 1ms
       ✓ detectShellGhMcpToken returns 'missing' when env var is deleted (spy observation) 0ms
       ✓ runPostInstallCheck emits gh-mcp-token-unset-shell when BKIT_GH_TOKEN is explicitly deleted 2ms
     ✓ runPostInstallCheck — cross-phase dedup Phase-3-wins contract (3)
       ✓ Phase 3 entry replaces preflight entry when ids match, and only one entry appears 2ms
       ✓ preflight-only advisory survives when Phase 3 does not emit the same id 1ms
       ✓ preflight advisories with no Phase-3 counterpart maintain their relative order 1ms
   ✓ formatChecklist format contract (4)
     ✓ renders the --- i/N [severity] id --- divider format per issue body 0ms
     ✓ renders blockers with [blocker] marker in the divider 0ms
     ✓ returns empty string for empty findings array 0ms
     ✓ single finding renders 1/1 0ms
   ❯ project documentation advisories (1)
     × reports and suppresses project documentation advisories without a blocker 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/index.test.ts > project documentation advisories > reports and suppresses project documentation advisories without a blocker
AssertionError: expected [] to deeply equal ArrayContaining{…}

- Expected
+ Received

- ArrayContaining [
-   "project-docs-index-missing",
-   "project-docs-missing",
- ]
+ []

 ❯ .bkit/core/engine/checks/after/index.test.ts:1010:42
    1008|     const reported = runPostInstallCheck([], tmpDir);
    1009|     const docFindings = reported.filter((f) => f.id.startsWith("projec…
    1010|     expect(docFindings.map((f) => f.id)).toEqual(
       |                                          ^
    1011|       expect.arrayContaining(["project-docs-index-missing", "project-d…
    1012|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 53 passed (54)
   Start at  23:53:38
   Duration  239ms (tests 51%, import 21%, transform 19%, setup 9%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-WTdFA7/junit.xml
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

[test-timeout-budget] load average 6.3 on 10 cores: unit limits 7650ms per test, 15300ms per hook (x1.53)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (42 tests | 1 failed) 14ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 1ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (39)
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
     × consolidates documentation warnings from the active run without changing its verdict 3ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > consolidates documentation warnings from the active run without changing its verdict
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain '## Documentation Warnings'

- Expected
+ Received

- ## Documentation Warnings
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
+ | build-plan-tasks | PASS | - | 1 | `log/build-plan-tasks-1-log.md`, `log/missing-optional.md` |
+ | build-plan-verify | PASS | - | 1 | `log/build-plan-verify-1-1.md`, `log/build-input-1.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | build-plan-tasks | PASS | - | `log/build-plan-tasks-1-log.md`, `log/missing-optional.md` |
+ | build-plan-verify | PASS | - | `log/build-plan-verify-1-1.md`, `log/build-input-1.md` |
+
+ ## Challenge
+
+ None
+
+ ## Tests
+
+ None recorded.
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

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:903:24
    901|     ]);
    902|
    903|     expect(s.markdown).toContain("## Documentation Warnings");
       |                        ^
    904|     // The same topic and gap from two agents appears once, with both …
    905|     expect(s.markdown.split("Populate the security document").length -…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 41 passed (42)
   Start at  23:53:39
   Duration  206ms (transform 40%, import 39%, setup 11%, tests 9%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-HOVqzj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/commands/workflow/workflows.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.integration.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.integration.test.ts

[test-timeout-budget] load average 6.3 on 10 cores: unit limits 7650ms per test, 15300ms per hook (x1.53)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test | 1 failed) 14ms
   ❯ workflows summary documentation warnings (1)
     × reports only attributed documentation warnings for the active run 13ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.integration.test.ts > workflows summary documentation warnings > reports only attributed documentation warnings for the active run
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' to contain '## Documentation Warnings'

- Expected
+ Received

- ## Documentation Warnings
+ Verdict: PASS
+ Failures: 0
+ <!-- verdict:end -->
+
+ # Plan Summary
+
+ ## Verdict
+
+ PASS
+
+ - No unresolved finding, failing check, open task, accepted limitation or open deferral.
+
+ ## Steps
+
+ | Step | Verdict | Failures | Attempts | Artifact |
+ | --- | --- | --- | --- | --- |
+ | plan-review | PASS | - | 1 | `docs/plans/202611/logs/864-doc-warnings/plan-review-2.md`, `docs/plans/202611/logs/864-doc-warnings/never-written-optional.md` |
+ | plan-verify | PASS | - | 1 | `docs/plans/202611/logs/864-doc-warnings/plan-verify-2.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | plan-review | PASS | - | `docs/plans/202611/logs/864-doc-warnings/plan-review-2.md`, `docs/plans/202611/logs/864-doc-warnings/never-written-optional.md` |
+ | plan-verify | PASS | - | `docs/plans/202611/logs/864-doc-warnings/plan-verify-2.md` |
+
+ ## Acceptance Scenario
+
+ None
+
+ ## Open Questions
+
+ None
+
+ ## Risks and Action Items
+
+ None
+
+ ## Recommended Next Step
+
+ ```text
+ /bkit-build
+ ```
+

 ❯ .bkit/core/engine/commands/workflow/workflows.integration.test.ts:163:22
    161|     expect(first.json.failures).toBe(0);
    162|
    163|     expect(markdown).toContain("## Documentation Warnings");
       |                      ^
    164|     expect(count(markdown, "Populate the security document")).toBe(1);
    165|     expect(markdown).toContain("EVIDENCE-FROM-REVIEW");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  23:53:40
   Duration  184ms (import 47%, transform 29%, setup 12%, tests 10%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-rH0WxI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts

[test-timeout-budget] load average 6.3 on 10 cores: unit limits 7650ms per test, 15300ms per hook (x1.53)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts (281 tests | 2 failed) 35ms
   ✓ shipped docs carry no internal identifiers (133)
     ✓ enumerates the shipped markdown corpus (not vacuous) 1ms
     ✓ .bkit/core/.bkit/LICENSE.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/LICENSE.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/README.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/README.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/authoring.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/authoring.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/cli.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/cli.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/cloud.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/cloud.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/comparison.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/comparison.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/install.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/install.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/jsonl.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/jsonl.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/pipeline.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/pipeline.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/prompts.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/prompts.md cites no ledger key or review-finding label 1ms
     ✓ .bkit/core/.bkit/providers.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/providers.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/router.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/router.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/templates.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/templates.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/trackers.md cites no tracker issue number 0ms
     ✓ .bkit/core/.bkit/trackers.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/.bkit/workflows.md cites no tracker issue number 1ms
     ✓ .bkit/core/.bkit/workflows.md cites no ledger key or review-finding label 1ms
     ✓ .bkit/core/docs/templates/bkit-audit-accessibility.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-accessibility.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-adoption.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-adoption.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-agents.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-agents.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-aio-seo.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-aio-seo.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-analytics.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-analytics.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-annotations.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-annotations.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-performance.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-performance.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-store.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-app-store.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-architecture.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-architecture.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-ci-performance.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-ci-performance.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-config.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-config.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-cost.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-cost.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-coverage.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-coverage.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-database.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-database.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dead-code.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dead-code.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-deferrals.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-deferrals.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dependencies.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-dependencies.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-documentation.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-documentation.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-duplication.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-duplication.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-failures.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-failures.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-flakes.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-flakes.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-gates.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-gates.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-issues.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-issues.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-llm.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-llm.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-logs.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-logs.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-models.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-models.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-privacy.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-privacy.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-prompts.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-prompts.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-red-team.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-red-team.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-reliability.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-reliability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-repo.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-repo.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-security.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-security.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-slop.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-slop.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-testing.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-testing.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-usability.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-audit-usability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/core/docs/templates/bkit-plan.md cites no tracker issue number 0ms
     ✓ .bkit/core/docs/templates/bkit-plan.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/architecture.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/architecture.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/capabilities.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/capabilities.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/components.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/components.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/data-schema.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/data-schema.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/deployments.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/deployments.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/design.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/design.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/noise.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/noise.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/observability.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/observability.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/security.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/security.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/setup.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/setup.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/technology.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/technology.md cites no ledger key or review-finding label 0ms
     ✓ .bkit/templates/docs/testing.md cites no tracker issue number 0ms
     ✓ .bkit/templates/docs/testing.md cites no ledger key or review-finding label 0ms
     ✓ AGENTS.md cites no tracker issue number 0ms
     ✓ AGENTS.md cites no ledger key or review-finding label 0ms
     ✓ CLAUDE.md cites no tracker issue number 0ms
     ✓ CLAUDE.md cites no ledger key or review-finding label 0ms
     ✓ GEMINI.md cites no tracker issue number 0ms
     ✓ GEMINI.md cites no ledger key or review-finding label 0ms
   ✓ execution surfaces carry no internal identifiers or step cross-refs (93)
     ✓ enumerates workflows and prompts (not vacuous) 0ms
     ✓ .bkit/core/workflows/bkit-auto.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-auto.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-build.md cites no tracker issue number, ledger key or finding label 1ms
     ✓ .bkit/core/workflows/bkit-build.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-debug.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-debug.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-design.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-design.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-plan.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-plan.md references no step by number 0ms
     ✓ .bkit/core/workflows/bkit-ship.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/workflows/bkit-ship.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-audit-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-audit-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-challenge-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-install-skills.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-install-skills.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-convert.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-convert.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-current.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-current.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tasks.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tasks.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tests.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-tests.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-verify.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-build-plan-verify.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-abort-handover.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-abort-handover.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-diagnose.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-diagnose.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-reproduce.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-reproduce.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-soak.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-debug-failure-soak.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-3.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-brainstorm-ideate-3.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-organise.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-organise.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-review-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-review-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-review-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-review-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-spike.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-spike.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-design-update.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-design-update.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-1.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-1.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-2.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-review-2.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-scope-check.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-scope-check.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-plan-update.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-plan-update.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-deferred-sweep.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-deferred-sweep.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-ship-update-docs.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-ship-update-docs.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-compress-markdown.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-compress-markdown.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-decisions.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-decisions.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-deferrals.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-deferrals.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-documentation.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-documentation.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-failures.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-failures.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-knowledge.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-knowledge.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-roadmap.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-roadmap.md references no step by number 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-tracker.md cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/core/prompts/bkit-utility-update-tracker.md references no step by number 0ms
   ✓ seeded config templates carry no internal identifiers or history prose (53)
     ✓ enumerates the seeded config corpus (not vacuous) 0ms
     ✓ .bkit/templates/.cursor/environment.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.cursor/environment.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.cursor/settings.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.cursor/settings.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/dependabot.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/dependabot.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/renovate.json5 cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/renovate.json5 carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-ci.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-ci.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-cloud.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-cloud.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-health.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-health.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-renovate.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-renovate.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.github/workflows/bkit-trivy.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.github/workflows/bkit-trivy.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.lintstagedrc.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.lintstagedrc.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.oxlintrc.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.oxlintrc.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.serena/project.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.serena/project.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Filler.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Filler.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Hedging.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Hedging.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/LLMSlop.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/LLMSlop.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Verbose.yml cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/.vale/styles/Bkit/Verbose.yml carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-advisories.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-advisories.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-divergences.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/ci/bkit-accepted-divergences.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-external-rules.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/graphify/bkit-graph-external-rules.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/scripts/serena/bkit-serena.mcp.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/scripts/serena/bkit-serena.mcp.json carries no narrative about what it used to be 0ms
     ✓ .bkit/templates/slop-scan.config.json cites no tracker issue number, ledger key or finding label 0ms
     ✓ .bkit/templates/slop-scan.config.json carries no narrative about what it used to be 0ms
   ❯ documentation responsibility inventory (1)
     × covers the full documentation responsibility inventory 3ms
   ❯ documentation warning contracts (1)
     × ships documentation warning contracts for plan and no-plan paths 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts > documentation responsibility inventory > covers the full documentation responsibility inventory
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/.bkit/workflows.md: no table under \"## Documentation Consultation Coverage\"",
+ ]

 ❯ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:335:81
    333|     expect(TOPICS.filter((t) => !starters.includes(`${t}.md`))).toEqua…
    334|
    335|     expect(coverageProblems(".bkit/core/.bkit/workflows.md", WORKFLOW_…
       |                                                                                 ^
    336|     expect(coverageProblems(".bkit/core/.bkit/prompts.md", PROMPT_SOUR…
    337|     expect(missingNamedRefs()).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts > documentation warning contracts > ships documentation warning contracts for plan and no-plan paths
AssertionError: expected [ …(69) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/prompts/bkit-plan-generate.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-plan-generate.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-plan-generate.md: warning record lacks field topic",
+   ".bkit/core/prompts/bkit-plan-generate.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-plan-generate.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-plan-generate.md: warning record lacks field action",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: warning record lacks field topic",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: warning record lacks field gap",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: warning record lacks field action",
+   ".bkit/core/prompts/bkit-build-plan-convert.md: no warn-and-continue behaviour",
+   ".bkit/core/prompts/bkit-plan-update.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-plan-update.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-plan-update.md: warning record lacks field topic",
+   ".bkit/core/prompts/bkit-plan-update.md: warning record lacks field gap",
+   ".bkit/core/prompts/bkit-plan-update.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-plan-update.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-plan-update.md: warning record lacks field action",
+   ".bkit/core/prompts/bkit-audit-generate.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-audit-generate.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-audit-generate.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-audit-generate.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-audit-generate.md: no warn-and-continue behaviour",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: warning record lacks field topic",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: warning record lacks field action",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: no warn-and-continue behaviour",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: no jsonl warning record",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: warning record lacks field topic",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: warning record lacks field recommendedPath",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: warning record lacks field action",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: no warn-and-continue behaviour",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: no jsonl warning record",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: warning record lacks field recommendedPath",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: warning record lacks field action",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: no warn-and-continue behaviour",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: no \"## Documentation Warnings\" section",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: no jsonl warning record",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: warning record lacks field topic",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: warning record lacks field recommendedPath",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: warning record lacks field alternativeEvidence",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: no warn-and-continue behaviour",
+   "bkit-plan.md template: no \"## Documentation Consultation\"",
+   "bkit-plan.md template: no \"## Documentation Warnings\"",
+   ".bkit/core/workflows/bkit-design.md: does not carry Documentation Warnings",
+   ".bkit/core/workflows/bkit-plan.md: does not carry Documentation Warnings",
+   ".bkit/core/workflows/bkit-build.md: does not carry Documentation Warnings",
+   ".bkit/core/workflows/bkit-debug.md: does not carry Documentation Warnings",
+   ".bkit/core/workflows/bkit-ship.md: does not carry Documentation Warnings",
+   ".bkit/core/workflows/bkit-auto.md: does not carry Documentation Warnings",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: does not check presence (absent or missing documents)",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: does not check starter-only content",
+   ".bkit/core/prompts/bkit-utility-update-documentation.md: does not check a topic that does not apply",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: does not check presence (absent or missing documents)",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: does not check starter-only content",
+   ".bkit/core/prompts/bkit-ship-update-docs.md: does not check a topic that does not apply",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: does not check index accuracy",
+   ".bkit/core/docs/templates/bkit-audit-documentation.md: does not check starter-only content",
+   ".bkit/core/docs/templates/bkit-audit-adoption.md: does not check index accuracy",
+ ]

 ❯ .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:421:32
    419| describe("documentation warning contracts", () => {
    420|   it("ships documentation warning contracts for plan and no-plan paths…
    421|     expect(contractProblems()).toEqual([]);
       |                                ^
    422|     expect(managedStarterProblems()).toEqual([]);
    423|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 279 passed (281)
   Start at  23:53:41
   Duration  125ms (tests 56%, setup 29%, import 9%, transform 4%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-fEi7SN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
