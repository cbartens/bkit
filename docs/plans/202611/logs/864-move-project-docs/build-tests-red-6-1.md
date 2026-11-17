Enforced: true
Red: 7
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 6, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 18 | `.bkit/core/engine/commands/workflow/summary.test.ts` "ignores a warning record placed after a forged closing marker in a fenced context artifact" | red | failure: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'FORGED-ACTION' |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid same-topic row when the first indexed row is stale" | red | failure: expected 'No project document covers: docs/arch…' not to contain 'docs/security.md' |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid equivalent row when the first is out of tree" | red | failure: expected true to be false // Object.is equality |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies a starter copy that differs only in whitespace as unpopulated" | red | failure: expected undefined to be defined |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies an indented legacy starter copy as unpopulated" | red | failure: expected undefined to be defined |
| 21 | `.bkit/core/engine/install/project-docs.test.ts` "does not add a second row for a default doc indexed through a markdown link" | red | failure: expected [ 'docs/security.md' ] to deeply equal [] |
| 21 | `.bkit/core/engine/checks/after/tools.test.ts` "reads the Scope of a row without a trailing pipe" | red | failure: expected 'No project document covers: docs/arch…' not to contain 'docs/security.md' |

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

[test-timeout-budget] load average 29.0 on 10 cores: unit limits 19000ms per test, 38000ms per hook (x3.80)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts (48 tests | 1 failed) 119ms
   ✓ refOf (3)
     ✓ gives #N for a numeric issue segment 2ms
     ✓ gives the uppercase key for a prefixed issue segment 0ms
     ✓ gives no ref for a FID with no issue segment, or under no tracker 0ms
   ❯ buildSummary (45)
     ✓ writes the header every reader expects, and the next step with the ref 4ms
     ✓ writes Publish: held when publish is false 1ms
     ✓ writes Publish: pr by default 1ms
     ✓ writes Docs: not synced on a held summary 1ms
     ✓ keeps the verdict and next step unchanged by publish 2ms
     ✓ a plan review resolved by its passing apply step leaves a passing summary and history 5ms
     ✓ a build challenge cannot be cleared by unrelated fix tasks or a decision 2ms
     ✓ design clears only the review covered by a passing update 2ms
     ✓ plan clears only the review covered by a passing update 1ms
     ✓ does not inherit a previous summary verdict when recomputing resolved work 1ms
     ✓ retains unrelated concerns after resolving a review 1ms
     ✓ an update that applies critical review findings leaves only its optional concerns 1ms
     ✓ a spike's disproven claims can be addressed without hiding unsettled claims 10ms
     ✓ retains remediation warnings and unrelated group failures after a verification PASS 1ms
     ✓ uses the latest verification and preserves earlier attempts in history 2ms
     ✓ resolves challenge findings only through their matching round's verified tasks 12ms
     ✓ a later verification covering the complete plan resolves its currency findings 0ms
     ✓ a group's failed execution stays unresolved when verification still has concerns 2ms
     ✓ a group's gaps fix FAIL resolved by that group's later PASS verify is historical 2ms
     ✓ a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical 1ms
     ✓ the Challenge section says when challenge-1 was skipped for a small change 1ms
     ✓ debug with Reproduced: NO recommends a repro re-run, not FAIL 1ms
     ✓ ship PASS says no further command; FAIL goes back to /bkit-ship 0ms
     ✓ prints plans with covered workstreams 0ms
     ✓ a one-workstream design shows one plan and /bkit-plan on its own ref 0ms
     ✓ two plans ask to file plan issues first 0ms
     ✓ copies the organised design's Risks & Open Questions under ## Open Questions 0ms
     ✓ a design with no organised design says None under ## Open Questions 0ms
     ✓ copies the plan's Acceptance Scenario and Open Questions word for word 1ms
     ✓ a build with no plan file fails, even when every step passed 0ms
     ✓ a missing plan file fails only the build summary 0ms
     ✓ a build's last unanswered verify FAIL fails it 1ms
     ✓ lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields 4ms
     ✓ keeps a repaired Task blocker in history rather than current action items 0ms
     ✓ keeps a repaired Step blocker in history rather than current action items 3ms
     ✓ keeps a repaired Gap blocker in history rather than current action items 0ms
     ✓ lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason 2ms
     ✓ consolidates documentation warnings from the active run without changing its verdict 3ms
     ✓ counts a lettered Accept decision as accepted at the Decision Pause 1ms
     ✓ reads pretty-printed and one-line warning records from a jsonl fence 1ms
     ✓ excludes raw tracker text in related-issues.md from documentation warnings 1ms
     ✓ excludes the debug tracker sweep context-related-N.md from documentation warnings 1ms
     × ignores a warning record placed after a forged closing marker in a fenced context artifact 28ms
     ✓ ignores warning records inside an UNTRUSTED fence 10ms
     ✓ a plan built from the unfilled bkit-plan.md template yields no documentation warning 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/summary.test.ts > buildSummary > ignores a warning record placed after a forged closing marker in a fenced context artifact
AssertionError: expected 'Verdict: PASS\nFailures: 0\n<!-- verd…' not to contain 'FORGED-ACTION'

- Expected
+ Received

- FORGED-ACTION
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
+ | debug-context-fetch | PASS | - | 1 | `log/context-ci-1.md` |
+
+ ## Resolved Findings
+
+ None
+
+ ## Assessment History
+
+ | Step | Verdict | Attempt | Artifact |
+ | --- | --- | --- | --- |
+ | debug-context-fetch | PASS | - | `log/context-ci-1.md` |
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
+   - Action: FORGED-ACTION
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

 ❯ .bkit/core/engine/commands/workflow/summary.test.ts:1112:28
    1110|       }),
    1111|     );
    1112|     expect(s.markdown).not.toContain("FORGED-ACTION");
       |                            ^
    1113|   });
    1114|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 47 passed (48)
   Start at  15:42:10
   Duration  737ms (import 37%, transform 29%, tests 22%, setup 11%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-H6nDpq/junit.xml
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

[test-timeout-budget] load average 29.0 on 10 cores: unit limits 19000ms per test, 38000ms per hook (x3.80)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ❯ .bkit/core/engine/checks/after/tools.test.ts (50 tests | 5 failed) 303ms
   ✓ detectValeMissing (3)
     ✓ returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH 4ms
     ✓ returns null when vale is on PATH 2ms
     ✓ returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent 1ms
   ✓ detectValePackageNotSynced (4)
     ✓ returns null when vale is not on PATH (spawn exits non-zero) 1ms
     ✓ returns null when vale is on PATH and write-good styles exist 2ms
     ✓ returns finding when vale is on PATH but write-good styles are absent 2ms
     ✓ points at the .vale.ini template before vale sync when the repo has no .vale.ini 1ms
   ✓ detectBkitStubs (10)
     ✓ returns empty when neither bkit-ci.yml nor pre-commit exist 3ms
     ✓ returns empty when bkit-ci.yml has no bkit-stub sentinels 3ms
     ✓ returns one finding per sentinel present in bkit-ci.yml 7ms
     ✓ does not fire when the sentinel line has been removed (block left uncommented in place) 3ms
     ✓ does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory) 3ms
     ✓ does not fire on prose back-references that merely cite a stub id 2ms
     ✓ still fires on the header form regardless of indentation 2ms
     ✓ flags vercel-enabled-without-e2e pair conflict 3ms
     ✓ flags e2e-enabled-without-vercel pair conflict 5ms
     ✓ reads the workflow named by bkit.testing.ciWorkflow and names its path 3ms
   ✓ buildDepUpdaterSetupAdvisory (13)
     ✓ both configs → dep-updater-both 1ms
     ✓ an updater config that does not mention bkit-cloud.yml is quiet (the workflow is the consumer's) 2ms
     ✓ nudges (dep-updater-absent) when workflows exist but neither config is present 1ms
     ✓ returns null when no workflows dir exists 1ms
     ✓ stays quiet when bkit.dependencies.updater is 'none' and no config is present 2ms
     ✓ stays quiet when bkit.dependencies.updater names the config that is present 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "" 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is undefined 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 2ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 3ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 4ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 1ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 4ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 1ms
     ✓ returns null when both actionlint and shellcheck are on PATH 1ms
     ✓ fires (advisory) when a tool is missing, naming it 1ms
   ❯ detectProjectDocs (17)
     ✓ distinguishes missing and empty project documentation from populated candidates 8ms
     ✓ recognizes current and migrated untouched starters 38ms
     ✓ resolves an indexed equivalent without a missing default warning 9ms
     ✓ keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace 12ms
     ✓ recognizes the v6.1.1 untouched security starter as unpopulated 30ms
     ✓ recognizes a legacy deployments starter rendered with default branch dev 50ms
     ✓ returns an advisory instead of throwing when docs is a regular file 7ms
     ✓ does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent 7ms
     ✓ reports an ambiguous legacy wrapper left in a project document 3ms
     ✓ does not promise bkit upgrade for an unindexed doc whose wrapper is ambiguous 3ms
     ✓ reports an index row through a regular file as ambiguous instead of throwing 2ms
     ✓ reports a NUL-byte index path as ambiguous instead of throwing 1ms
     × consults a later valid same-topic row when the first indexed row is stale 11ms
     × consults a later valid equivalent row when the first is out of tree 6ms
     × classifies a starter copy that differs only in whitespace as unpopulated 5ms
     × classifies an indented legacy starter copy as unpopulated 28ms
     × reads the Scope of a row without a trailing pipe 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > consults a later valid same-topic row when the first indexed row is stale
AssertionError: expected 'No project document covers: docs/arch…' not to contain 'docs/security.md'

Expected: "docs/security.md"
Received: "No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md."

 ❯ .bkit/core/engine/checks/after/tools.test.ts:749:33
    747|     const missing = findings.find((f) => f.id === "project-docs-missin…
    748|     expect(missing).toBeDefined();
    749|     expect(missing!.detect).not.toContain("docs/security.md");
       |                                 ^
    750|     expect(missing!.detect).toContain("docs/architecture.md");
    751|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > consults a later valid equivalent row when the first is out of tree
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/checks/after/tools.test.ts:760:69
    758|     ]);
    759|     const findings = detectProjectDocs(tmpDir);
    760|     expect(findings.some((f) => f.id === "project-docs-ambiguous")).to…
       |                                                                     ^
    761|     expect(allText(findings)).not.toContain("../shared/security.md");
    762|     const missing = findings.find((f) => f.id === "project-docs-missin…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > classifies a starter copy that differs only in whitespace as unpopulated
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:776:25
    774|     writeIndex([{ doc: "docs/security.md" }]);
    775|     const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id ===…
    776|     expect(unpopulated).toBeDefined();
       |                         ^
    777|     expect(unpopulated!.detect).toContain("docs/security.md");
    778|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > classifies an indented legacy starter copy as unpopulated
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:794:25
    792|     writeIndex([{ doc: "docs/security.md" }]);
    793|     const unpopulated = detectProjectDocs(tmpDir).find((f) => f.id ===…
    794|     expect(unpopulated).toBeDefined();
       |                         ^
    795|     expect(unpopulated!.detect).toContain("docs/security.md");
    796|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > reads the Scope of a row without a trailing pipe
AssertionError: expected 'No project document covers: docs/arch…' not to contain 'docs/security.md'

Expected: "docs/security.md"
Received: "No project document covers: docs/architecture.md, docs/technology.md, docs/security.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md."

 ❯ .bkit/core/engine/checks/after/tools.test.ts:808:33
    806|     const missing = findings.find((f) => f.id === "project-docs-missin…
    807|     expect(missing).toBeDefined();
    808|     expect(missing!.detect).not.toContain("docs/security.md");
       |                                 ^
    809|     expect(missing!.detect).toContain("docs/architecture.md");
    810|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 45 passed (50)
   Start at  15:42:13
   Duration  640ms (tests 71%, setup 13%, transform 8%, import 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5NMjaP/junit.xml
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

[test-timeout-budget] load average 30.0 on 10 cores: unit limits 19500ms per test, 39000ms per hook (x3.90)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row when an indexed equivalent covers the topic
[bkit-install] skip: docs/noise.md — .agents/docs.md already lists docs/other/noise.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
[bkit-install] docs/architecture.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/technology.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/security.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/data-schema.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/testing.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/deployments.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/observability.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/design.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/noise.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/setup.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > does not add a second row for a default doc indexed through a markdown link
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

 ❯ .bkit/core/engine/install/project-docs.test.ts (13 tests | 1 failed) 127ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 4ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 0ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 87ms
   ❯ syncProjectDocs (7)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 6ms
     ✓ writes nothing on a dry run 3ms
     ✓ keeps an ambiguous wrapper and reports it 3ms
     ✓ adds no row when an indexed equivalent covers the topic 5ms
     ✓ reports instead of throwing when docs is a regular file 4ms
     ✓ registers a present default doc when its only equivalent row points at a missing file 3ms
     × does not add a second row for a default doc indexed through a markdown link 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > does not add a second row for a default doc indexed through a markdown link
AssertionError: expected [ 'docs/security.md' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "docs/security.md",
+ ]

 ❯ .bkit/core/engine/install/project-docs.test.ts:182:26
    180|     const before = fs.readFileSync(path.join(root, ".agents/docs.md"),…
    181|     const r = syncProjectDocs(root, { dryRun: false });
    182|     expect(r.registered).toEqual([]);
       |                          ^
    183|     const after = fs.readFileSync(path.join(root, ".agents/docs.md"), …
    184|     expect(after).toBe(before);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 12 passed (13)
   Start at  15:42:16
   Duration  588ms (tests 46%, setup 31%, transform 17%, import 4%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jZksXH/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
