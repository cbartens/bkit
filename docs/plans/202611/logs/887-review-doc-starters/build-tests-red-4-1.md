Enforced: true
Red: 22
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/887-review-doc-starters-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is missing" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent when every project doc is populated and indexed" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip names the two project-docs advisory ids" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent for a Not applicable data-schema and a header-only noise" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is an unchanged starter copy" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip stays silent when project-docs-missing is ignored" | red | failure: project-docs tip is in the catalogue: expected undefined to be defined |
| 10 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing" | red | failure: expected [ 'project-docs-index-missing', …(1) ] to deeply equal ArrayContaining{…} |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "missing and unpopulated advisories name the adoption-order section" | red | failure: project-docs-missing: expected 'Copy the starter for each topic you w…' to contain 'Project docs — adoption order' |
| 11 | `.bkit/core/engine/checks/after/tools.test.ts` "an empty project doc is reported as project-docs-unpopulated" | red | failure: expected undefined to be defined |
| 11 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-docs tip fires when a project doc is empty" | red | failure: expected [ 'project-docs-empty' ] to include 'project-docs-unpopulated' |
| 12 | `.bkit/core/engine/checks/after/tools.test.ts` "a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing" | red | failure: expected 'No project document covers: docs/arch…' to contain 'docs/security.md' |
| 12 | `.bkit/core/engine/install/project-docs.test.ts` "syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row" | red | failure: expected [] to deeply equal [ 'docs/security.md' ] |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter with a project copy is marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain '— adopted at docs/architecture.md, re…' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter indexed under another path is marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/testi…' to contain 'adopted at handbook/ops-testing.md, r…' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter with no copy and changed non-doc template are not marked" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain 'review your copy' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose recommended path is a symlink is not marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain 'review your copy' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose recommended path is a directory is not marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain 'review your copy' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/testi…' to contain 'review your copy' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain 'review your copy' |
| 13 | `.bkit/core/engine/install/template-copies.integration.test.ts` "missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report" | red | failure: expected ' changed: .bkit/templates/docs/archi…' to contain 'adopted at docs/' |
| 13 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "bkit upgrade prints the adopted marker for a changed starter with a project copy" | red | failure: expected '[bkit-upgrade] Running upgrade (non-i…' to contain 'changed: .bkit/templates/docs/archite…' |
| 13 | `.bkit/core/engine/install/project-docs.test.ts` "adoptedProjectDocPath returns the recommended path, an indexed equivalent or null" | red | failure: adoptedProjectDocPath is not a function |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/catalogue.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/catalogue.test.ts

[test-timeout-budget] load average 15.1 on 10 cores: unit limits 12050ms per test, 24100ms per hook (x2.41)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (72 tests | 8 failed) 967ms
   ✓ SETUP_TIPS — catalogue (16)
     ✓ every tip carries every text field 7ms
     ✓ ALL_WORKFLOWS names every phase workflow; EVERY_CONTEXT every tips context 1ms
     ✓ the upgrade tip leads the catalogue and matters in every context 0ms
     ✓ comms tips matter in every context, and every context has its own tips 1ms
     ✓ design leads with serena once the comms tips are done 0ms
     ✓ plan leads with serena once the comms tips are done 0ms
     ✓ build leads with serena once the comms tips are done 0ms
     ✓ debug leads with context-fetch once the comms tips are done 0ms
     ✓ ship leads with ci-workflow once the comms tips are done 0ms
     ✓ audit leads with serena once the comms tips are done 0ms
     ✓ utility leads with serena once the comms tips are done 0ms
     ✓ audit tips are the code-reading, CI and dependency-safety ones 0ms
     ✓ every template path an ask names exists 2ms
     ✓ ids are unique and never collide with an advisory id 6ms
     ✓ every reused advisory id is one a detector emits 5ms
     ✓ every docs pointer in steps resolves to a heading 30ms
   ❯ SETUP_TIPS — detection (56)
     ✓ tracker fires exactly when tracker-setup-none does 4ms
     ✓ tracker stays quiet once github is chosen 1ms
     ✓ tracker stays quiet once linear is chosen 6ms
     ✓ tracker stays quiet once jira is chosen 2ms
     ✓ gh-mcp fires only for the GitHub tracker 5ms
     ✓ gh-mcp stays quiet about the token inside the pre-push hook's inner run 4ms
     ✓ bkit-env fires until every token the github tracker needs is set 5ms
     ✓ bkit-env fires until every token the linear tracker needs is set 6ms
     ✓ bkit-env fires until every token the jira tracker needs is set 6ms
     ✓ issue-forms fires only for the GitHub tracker with no issue template folder 5ms
     ✓ direnv stays quiet until .bkit/.env exists 2ms
     ✓ context-fetch fires exactly when context-fetch-missing does 15ms
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 144ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 2ms
     ✓ dependabot-renovate fires exactly when dep-updater-absent does 3ms
     ✓ trivy fires once workflows exist and none runs the scan 3ms
     ✓ test-lint stays quiet until the repo lists a JS test runner 1ms
     ✓ test-lint fires for vitest in devDependencies with no test linter 2ms
     ✓ test-lint fires for jest in dependencies with no test linter 2ms
     ✓ test-lint goes quiet once .oxlintrc.json lints tests 2ms
     ✓ test-lint goes quiet once oxlint.config.ts lints tests 2ms
     ✓ test-lint goes quiet once eslint.config.js lints tests 3ms
     ✓ test-lint goes quiet once .eslintrc.json lints tests 2ms
     ✓ test-lint goes quiet when oxlint is a dependency 1ms
     ✓ test-lint still fires when the ESLint config names no test plugin 2ms
     ✓ cloud fires only once cloud agents are chosen 3ms
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 322ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 55ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 2ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 1ms
     ✓ serena needs both the project file and an MCP entry 2ms
     ✓ compaction-window and claude-connectors fire per Claude Code setting 2ms
     ✓ host-specific tips stay quiet without their host 2ms
     ✓ tmp-prune fires only once a pre-push hook exists without the prune script 2ms
     ✓ dependency-audit fires only once a pre-push hook exists without the gate script 2ms
     ✓ dependency-audit stays quiet for a copy under the unprefixed name 2ms
     ✓ min-push fires when a hook lacks update pairs or checked gate execution 2ms
     ✓ pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc 2ms
     ✓ disk-prune fires only once a pre-push hook exists without either step file 2ms
     ✓ disk-prune stays quiet once the machine step file exists 2ms
     ✓ mcp-scope fires on an unlocked URL 1ms
     ✓ bkit-output-json fires while a copied script reads bkit output without --json 2ms
     ❯ project-docs (8)
       × project-docs tip fires when a project doc is missing 25ms
       × project-docs tip stays silent when every project doc is populated and indexed 16ms
       × project-docs tip names the two project-docs advisory ids 1ms
       × project-docs tip stays silent for a Not applicable data-schema and a header-only noise 12ms
       × project-docs tip fires when a project doc is an unchanged starter copy 12ms
       × project-docs tip fires when a project doc is empty 11ms
       × project-docs tip stays silent when project-docs-missing is ignored 4ms
       × ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing 7ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 95ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 54ms
       ✓ the lookup opt-out does not hide a release already seen 35ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 2ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 1ms
       ✓ stays quiet in bkit's own repo 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip fires when a project doc is missing
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:555:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip stays silent when every project doc is populated and indexed
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:561:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip names the two project-docs advisory ids
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:565:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip stays silent for a Not applicable data-schema and a header-only noise
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:578:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip fires when a project doc is an unchanged starter copy
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:584:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip fires when a project doc is empty
AssertionError: expected [ 'project-docs-empty' ] to include 'project-docs-unpopulated'
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:589:55
    587|     it("project-docs tip fires when a project doc is empty", () => {
    588|       writeProjectDocs({ testing: "" });
    589|       expect(detectProjectDocs(cwd).map((f) => f.id)).toContain("proje…
       |                                                       ^
    590|       expect(projectDocsTip().fires(cwd)).toBe(true);
    591|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > project-docs tip stays silent when project-docs-missing is ignored
AssertionError: project-docs tip is in the catalogue: expected undefined to be defined
 ❯ projectDocsTip .bkit/core/engine/checks/tips/catalogue.test.ts:533:61
    531|     const projectDocsTip = (): SetupTip => {
    532|       const found = SETUP_TIPS.find((t) => t.id === "project-docs");
    533|       expect(found, "project-docs tip is in the catalogue").toBeDefine…
       |                                                             ^
    534|       return found!;
    535|     };
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:597:14

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-docs > ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing
AssertionError: expected [ 'project-docs-index-missing', …(1) ] to deeply equal ArrayContaining{…}

- Expected
+ Received

- ArrayContaining [
-   "project-docs-missing",
-   "project-docs-unpopulated",
+ [
    "project-docs-index-missing",
+   "project-docs-unpopulated",
  ]

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:608:19
    606|       const findings = detectProjectDocs(cwd);
    607|       const ids = findings.map((f) => f.id);
    608|       expect(ids).toEqual(
       |                   ^
    609|         expect.arrayContaining([
    610|           "project-docs-missing",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 64 passed (72)
   Start at  18:52:07
   Duration  1.79s (tests 60%, transform 20%, import 17%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ZpWBlx/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/tools.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/tools.test.ts

[test-timeout-budget] load average 15.1 on 10 cores: unit limits 12050ms per test, 24100ms per hook (x2.41)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ❯ .bkit/core/engine/checks/after/tools.test.ts (55 tests | 4 failed) 189ms
   ✓ detectValeMissing (3)
     ✓ returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH 4ms
     ✓ returns null when vale is on PATH 1ms
     ✓ returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent 1ms
   ✓ detectValePackageNotSynced (4)
     ✓ returns null when vale is not on PATH (spawn exits non-zero) 1ms
     ✓ returns null when vale is on PATH and write-good styles exist 1ms
     ✓ returns finding when vale is on PATH but write-good styles are absent 1ms
     ✓ points at the .vale.ini template before vale sync when the repo has no .vale.ini 1ms
   ✓ detectBkitStubs (10)
     ✓ returns empty when neither bkit-ci.yml nor pre-commit exist 2ms
     ✓ returns empty when bkit-ci.yml has no bkit-stub sentinels 2ms
     ✓ returns one finding per sentinel present in bkit-ci.yml 3ms
     ✓ does not fire when the sentinel line has been removed (block left uncommented in place) 3ms
     ✓ does not match partial-prefix ids (e.g. e2e-paths step id does not trigger e2e advisory) 2ms
     ✓ does not fire on prose back-references that merely cite a stub id 2ms
     ✓ still fires on the header form regardless of indentation 2ms
     ✓ flags vercel-enabled-without-e2e pair conflict 3ms
     ✓ flags e2e-enabled-without-vercel pair conflict 2ms
     ✓ reads the workflow named by bkit.testing.ciWorkflow and names its path 3ms
   ✓ buildDepUpdaterSetupAdvisory (13)
     ✓ both configs → dep-updater-both 2ms
     ✓ an updater config that does not mention bkit-cloud.yml is quiet (the workflow is the consumer's) 2ms
     ✓ nudges (dep-updater-absent) when workflows exist but neither config is present 1ms
     ✓ returns null when no workflows dir exists 1ms
     ✓ stays quiet when bkit.dependencies.updater is 'none' and no config is present 1ms
     ✓ stays quiet when bkit.dependencies.updater names the config that is present 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "" 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is undefined 2ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 2ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 2ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 1ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 2ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 1ms
     ✓ returns null when both actionlint and shellcheck are on PATH 1ms
     ✓ fires (advisory) when a tool is missing, naming it 1ms
   ❯ detectProjectDocs (22)
     × distinguishes missing and empty project documentation from populated candidates 15ms
     × missing and unpopulated advisories name the adoption-order section 9ms
     × an empty project doc is reported as project-docs-unpopulated 5ms
     × a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing 7ms
     ✓ recognizes current and migrated untouched starters 11ms
     ✓ resolves an indexed equivalent without a missing default warning 11ms
     ✓ keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace 8ms
     ✓ recognizes the v6.1.1 untouched security starter as unpopulated 3ms
     ✓ recognizes a legacy deployments starter rendered with default branch dev 11ms
     ✓ names every unusable indexed row when none of them can be read 2ms
     ✓ returns an advisory instead of throwing when docs is a regular file 4ms
     ✓ does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent 7ms
     ✓ reports an ambiguous legacy wrapper left in a project document 3ms
     ✓ does not promise bkit upgrade for an unindexed doc whose wrapper is ambiguous 3ms
     ✓ does not promise bkit upgrade for an unindexed doc while the index holds an unreadable row 4ms
     ✓ reports an index row through a regular file as ambiguous instead of throwing 2ms
     ✓ reports a NUL-byte index path as ambiguous instead of throwing 2ms
     ✓ consults a later valid same-topic row when the first indexed row is stale 4ms
     ✓ consults a later valid equivalent row when the first is out of tree 3ms
     ✓ classifies a starter copy that differs only in whitespace as unpopulated 5ms
     ✓ classifies an indented legacy starter copy as unpopulated 3ms
     ✓ reads the Scope of a row without a trailing pipe 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > distinguishes missing and empty project documentation from populated candidates
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:508:19
    506|
    507|     const empty = findings.find((f) => f.id === "project-docs-unpopula…
    508|     expect(empty).toBeDefined();
       |                   ^
    509|     expect(empty!.detect).toContain("docs/testing.md");
    510|     expect(empty!.detect).toContain("docs/setup.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > missing and unpopulated advisories name the adoption-order section
AssertionError: project-docs-missing: expected 'Copy the starter for each topic you w…' to contain 'Project docs — adoption order'

Expected: "Project docs — adoption order"
Received: "Copy the starter for each topic you want from `.bkit/templates/docs/` into `docs/`, fill it in from the repository, and add its row to `## Project Documents` in .agents/docs.md. A document you already keep elsewhere counts: index it with `Equivalent to <recommended path>` in its Scope cell. Skip topics that do not apply."

 ❯ .bkit/core/engine/checks/after/tools.test.ts:530:35
    528|       const finding = findings.find((f) => f.id === id);
    529|       expect(finding, id).toBeDefined();
    530|       expect(finding!.action, id).toContain("Project docs \u2014 adopt…
       |                                   ^
    531|     }
    532|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > an empty project doc is reported as project-docs-unpopulated
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/tools.test.ts:540:25
    538|     const findings = detectProjectDocs(tmpDir);
    539|     const unpopulated = findings.find((f) => f.id === "project-docs-un…
    540|     expect(unpopulated).toBeDefined();
       |                         ^
    541|     expect(unpopulated!.detect).toContain("docs/testing.md");
    542|     expect(unpopulated!.detect).not.toContain("docs/security.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > a Not equivalent to docs/{topic}.md or docs/{topic}.mdx row does not silence project-docs-missing
AssertionError: expected 'No project document covers: docs/arch…' to contain 'docs/security.md'

Expected: "docs/security.md"
Received: "No project document covers: docs/architecture.md, docs/technology.md, docs/data-schema.md, docs/testing.md, docs/deployments.md, docs/observability.md, docs/design.md, docs/noise.md, docs/setup.md."

 ❯ .bkit/core/engine/checks/after/tools.test.ts:556:29
    554|     const missing = findings.find((f) => f.id === "project-docs-missin…
    555|     expect(missing).toBeDefined();
    556|     expect(missing!.detect).toContain("docs/security.md");
       |                             ^
    557|   });
    558|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 51 passed (55)
   Start at  18:52:10
   Duration  388ms (tests 69%, setup 12%, import 10%, transform 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-6HYrmi/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/project-docs.test.ts

```

## Runner output — `.bkit/core/engine/install/project-docs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/project-docs.test.ts

[test-timeout-budget] load average 14.2 on 10 cores: unit limits 11600ms per test, 23200ms per hook (x2.32)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

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

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security-notes.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ❯ .bkit/core/engine/install/project-docs.test.ts (34 tests | 2 failed) 53ms
   ✓ stripManagedWrapper (4)
     ✓ removes the wrapper and keeps every other byte 2ms
     ✓ keeps CRLF line endings 0ms
     ✓ returns unmarked content as it is 0ms
     ✓ reports one lone marker, reversed markers and fenced markers as ambiguous 0ms
   ✓ legacy starter digests (2)
     ✓ has a digest for every topic 0ms
     ✓ recognises the real legacy text of a topic at the recorded revision 2ms
   ❯ syncProjectDocs (9)
     ✓ migrates the wrapper and registers a row, then repeats as a no-op 5ms
     ✓ writes nothing on a dry run 3ms
     ✓ keeps an ambiguous wrapper and reports it 2ms
     ✓ adds no row when an indexed equivalent covers the topic 3ms
     ✓ reports instead of throwing when docs is a regular file 4ms
     ✓ registers a present default doc when its only equivalent row points at a missing file 2ms
     ✓ does not add a second row for a default doc indexed through a markdown link 2ms
     × syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row 8ms
     ✓ adds no row and reports a problem when the index has a row it cannot read 2ms
   ❯ adoptedProjectDocPath (1)
     × adoptedProjectDocPath returns the recommended path, an indexed equivalent or null 1ms
   ✓ starter docs (18)
     ✓ starter shape: components 2ms
     ✓ components register row Scope equals its Purpose line 0ms
     ✓ components Fill these first matches the adoption order 1ms
     ✓ starter shape: technology 1ms
     ✓ starter shape: design 1ms
     ✓ starter shape: architecture 1ms
     ✓ starter shape: setup 1ms
     ✓ setup index row marks Build and Debug as read when relevant 0ms
     ✓ starter shape: security 1ms
     ✓ starter shape: observability 1ms
     ✓ starter shape: testing 1ms
     ✓ testing marks every section slot or practice and has no box-drawing diagram 2ms
     ✓ starter shape: data-schema 1ms
     ✓ starter shape: deployments 1ms
     ✓ deployments marks every section slot or practice 1ms
     ✓ starter shape: noise 1ms
     ✓ capabilities names rollup and refresh and when to run each 1ms
     ✓ capabilities starter has the Generated document opener, Fill these first, register row and completion checks 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
AssertionError: expected [] to deeply equal [ 'docs/security.md' ]

- Expected
+ Received

- [
-   "docs/security.md",
- ]
+ []

 ❯ .bkit/core/engine/install/project-docs.test.ts:196:26
    194|     );
    195|     const r = syncProjectDocs(root, { dryRun: false });
    196|     expect(r.registered).toEqual(["docs/security.md"]);
       |                          ^
    197|     expect(r.equivalent).toEqual([]);
    198|     expect(fs.readFileSync(path.join(root, ".agents/docs.md"), "utf8")…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/install/project-docs.test.ts > adoptedProjectDocPath > adoptedProjectDocPath returns the recommended path, an indexed equivalent or null
TypeError: adoptedProjectDocPath is not a function
 ❯ .bkit/core/engine/install/project-docs.test.ts:233:12
    231|     // No index at all: only the recommended path counts.
    232|     fs.writeFileSync(path.join(root, "docs/security.md"), "# Security\…
    233|     expect(adoptedProjectDocPath(root, "security")).toBe("docs/securit…
       |            ^
    234|     expect(adoptedProjectDocPath(root, "testing")).toBeNull();
    235|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 32 passed (34)
   Start at  18:52:12
   Duration  269ms (tests 48%, setup 31%, import 9%, transform 9%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Gs3GRM/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/template-copies.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/template-copies.integration.test.ts

```

## Runner output — `.bkit/core/engine/install/template-copies.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/template-copies.integration.test.ts

[test-timeout-budget] load average 14.2 on 10 cores: unit limits 11600ms per test, 23200ms per hook (x2.32)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > install copies the template set into .bkit/templates/ > copies exactly the set, raw, keeping each file's mode, with no hash record
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > install copies the template set into .bkit/templates/ > a second run writes no copy; a stale or stray copy is a write in dry-run and live alike
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] Running core payload pass
[bkit-test] Running bkit docs pass
[bkit-test] Running template copies pass

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > uninstall > removes the consumer's .bkit/templates/ copies
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)
[bkit-test] delete (empty after strip): AGENTS.md
[bkit-test] delete (empty after strip): .gitignore
[bkit-test] delete (empty after strip): .gitattributes
[bkit-test] delete: .bkit/version
[bkit-test] delete: .bkit/allowlist.json
[bkit-test] delete: .bkit/authoring.md
[bkit-test] delete: .bkit/cloud.md
[bkit-test] delete: .bkit/cli.md
[bkit-test] delete: .bkit/comparison.md
[bkit-test] delete: .bkit/install.md
[bkit-test] delete: .bkit/jsonl.md
[bkit-test] delete: .bkit/LICENSE.md
[bkit-test] delete: .bkit/pipeline.md
[bkit-test] delete: .bkit/providers.md
[bkit-test] delete (empty after strip): .bkit/prompts.md
[bkit-test] delete: .bkit/router.md
[bkit-test] delete: .bkit/templates.md
[bkit-test] delete: .bkit/trackers.md
[bkit-test] delete: .bkit/workflows.md
[bkit-test] delete: .bkit/README.md
[bkit-test] delete (empty after strip): .agents/context.md
[bkit-test] delete (empty after strip): .agents/docs.md
[bkit-test] delete (empty after strip): .agents/rules.md
[bkit-test] delete (empty after strip): .agents/skills.md
[bkit-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-test] delete: docs/templates/bkit-audit-accessibility.md
[bkit-test] delete: docs/templates/bkit-audit-adoption.md
[bkit-test] delete: docs/templates/bkit-audit-agents.md
[bkit-test] delete: docs/templates/bkit-audit-aio-seo.md
[bkit-test] delete: docs/templates/bkit-audit-analytics.md
[bkit-test] delete: docs/templates/bkit-audit-annotations.md
[bkit-test] delete: docs/templates/bkit-audit-app-performance.md
[bkit-test] delete: docs/templates/bkit-audit-app-store.md
[bkit-test] delete: docs/templates/bkit-audit-architecture.md
[bkit-test] delete: docs/templates/bkit-audit-ci-performance.md
[bkit-test] delete: docs/templates/bkit-audit-config.md
[bkit-test] delete: docs/templates/bkit-audit-cost.md
[bkit-test] delete: docs/templates/bkit-audit-coverage.md
[bkit-test] delete: docs/templates/bkit-audit-database.md
[bkit-test] delete: docs/templates/bkit-audit-dead-code.md
[bkit-test] delete: docs/templates/bkit-audit-deferrals.md
[bkit-test] delete: docs/templates/bkit-audit-dependencies.md
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
[bkit-test] delete: docs/templates/bkit-audit-issues.md
[bkit-test] delete: docs/templates/bkit-audit-llm.md
[bkit-test] delete: docs/templates/bkit-audit-logs.md
[bkit-test] delete: docs/templates/bkit-audit-models.md
[bkit-test] delete: docs/templates/bkit-audit-privacy.md
[bkit-test] delete: docs/templates/bkit-audit-prompts.md
[bkit-test] delete: docs/templates/bkit-audit-red-team.md
[bkit-test] delete: docs/templates/bkit-audit-reliability.md
[bkit-test] delete: docs/templates/bkit-audit-repo.md
[bkit-test] delete: docs/templates/bkit-audit-security.md
[bkit-test] delete: docs/templates/bkit-audit-slop.md
[bkit-test] delete: docs/templates/bkit-audit-testing.md
[bkit-test] delete: docs/templates/bkit-audit-usability.md
[bkit-test] delete: docs/templates/bkit-plan.md
[bkit-test] package.json: removed bkit install-state block
[bkit-test] delete: .bkit/templates/
[bkit-test] delete: .bkit/core (payload view link)
[bkit-test] delete: .bkit/shared (payload view link)
[bkit-test] prune empty dir: docs/templates
[bkit-test] prune empty dir: .bkit
[bkit-test] prune empty dir: .agents
[bkit-test] prune empty dir: docs

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > the sample configs do not act as live configs in a consumer > ships the sample configs under non-discoverable names
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)

stdout | .bkit/core/engine/install/template-copies.integration.test.ts > the sample configs do not act as live configs in a consumer > leaves a staged template copy unchanged under plain lint-staged
[bkit-test] Running core payload pass
[bkit-test] core: .agents/context.md
[bkit-test] core: .agents/docs.md
[bkit-test] core: .agents/rules.md
[bkit-test] core: .agents/skills.md
[bkit-test] core: AGENTS.md
[bkit-test] core: docs/templates/bkit-audit-accessibility.md
[bkit-test] core: docs/templates/bkit-audit-adoption.md
[bkit-test] core: docs/templates/bkit-audit-agents.md
[bkit-test] core: docs/templates/bkit-audit-aio-seo.md
[bkit-test] core: docs/templates/bkit-audit-analytics.md
[bkit-test] core: docs/templates/bkit-audit-annotations.md
[bkit-test] core: docs/templates/bkit-audit-app-performance.md
[bkit-test] core: docs/templates/bkit-audit-app-store.md
[bkit-test] core: docs/templates/bkit-audit-architecture.md
[bkit-test] core: docs/templates/bkit-audit-ci-performance.md
[bkit-test] core: docs/templates/bkit-audit-config.md
[bkit-test] core: docs/templates/bkit-audit-cost.md
[bkit-test] core: docs/templates/bkit-audit-coverage.md
[bkit-test] core: docs/templates/bkit-audit-database.md
[bkit-test] core: docs/templates/bkit-audit-dead-code.md
[bkit-test] core: docs/templates/bkit-audit-deferrals.md
[bkit-test] core: docs/templates/bkit-audit-dependencies.md
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
[bkit-test] core: docs/templates/bkit-audit-issues.md
[bkit-test] core: docs/templates/bkit-audit-llm.md
[bkit-test] core: docs/templates/bkit-audit-logs.md
[bkit-test] core: docs/templates/bkit-audit-models.md
[bkit-test] core: docs/templates/bkit-audit-privacy.md
[bkit-test] core: docs/templates/bkit-audit-prompts.md
[bkit-test] core: docs/templates/bkit-audit-red-team.md
[bkit-test] core: docs/templates/bkit-audit-reliability.md
[bkit-test] core: docs/templates/bkit-audit-repo.md
[bkit-test] core: docs/templates/bkit-audit-security.md
[bkit-test] core: docs/templates/bkit-audit-slop.md
[bkit-test] core: docs/templates/bkit-audit-testing.md
[bkit-test] core: docs/templates/bkit-audit-usability.md
[bkit-test] core: docs/templates/bkit-plan.md
[bkit-test] core: .gitignore
[bkit-test] core: .gitattributes
[bkit-test] Running bkit docs pass
[bkit-test] core: .bkit/authoring.md
[bkit-test] core: .bkit/cloud.md
[bkit-test] core: .bkit/cli.md
[bkit-test] core: .bkit/comparison.md
[bkit-test] core: .bkit/install.md
[bkit-test] core: .bkit/jsonl.md
[bkit-test] core: .bkit/LICENSE.md
[bkit-test] core: .bkit/pipeline.md
[bkit-test] core: .bkit/providers.md
[bkit-test] core: .bkit/prompts.md
[bkit-test] core: .bkit/router.md
[bkit-test] core: .bkit/templates.md
[bkit-test] core: .bkit/trackers.md
[bkit-test] core: .bkit/workflows.md
[bkit-test] core: .bkit/README.md
[bkit-test] Running template copies pass
[bkit-test] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-test] template added: .bkit/templates/.cursor/Dockerfile
[bkit-test] template added: .bkit/templates/.cursor/environment.json
[bkit-test] template added: .bkit/templates/.cursor/settings.json
[bkit-test] template added: .bkit/templates/.envrc
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-test] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-test] template added: .bkit/templates/.github/dependabot.yml
[bkit-test] template added: .bkit/templates/.github/renovate.json5
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-test] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-test] template added: .bkit/templates/.graphifyignore
[bkit-test] template added: .bkit/templates/.husky/pre-commit
[bkit-test] template added: .bkit/templates/.husky/pre-push
[bkit-test] template added: .bkit/templates/.oxlintrc.json
[bkit-test] template added: .bkit/templates/.serena/project.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-test] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-test] template added: .bkit/templates/.vale.ini
[bkit-test] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-test] template added: .bkit/templates/context/bkit-expo.md
[bkit-test] template added: .bkit/templates/context/bkit-github.md
[bkit-test] template added: .bkit/templates/context/bkit-inngest.md
[bkit-test] template added: .bkit/templates/context/bkit-maestro.md
[bkit-test] template added: .bkit/templates/context/bkit-playwright.md
[bkit-test] template added: .bkit/templates/context/bkit-resend.md
[bkit-test] template added: .bkit/templates/context/bkit-sentry.md
[bkit-test] template added: .bkit/templates/context/bkit-serena.md
[bkit-test] template added: .bkit/templates/context/bkit-stripe.md
[bkit-test] template added: .bkit/templates/context/bkit-supabase.md
[bkit-test] template added: .bkit/templates/context/bkit-tavily.md
[bkit-test] template added: .bkit/templates/context/bkit-vercel.md
[bkit-test] template added: .bkit/templates/docs/architecture.md
[bkit-test] template added: .bkit/templates/docs/capabilities.md
[bkit-test] template added: .bkit/templates/docs/components.md
[bkit-test] template added: .bkit/templates/docs/data-schema.md
[bkit-test] template added: .bkit/templates/docs/deployments.md
[bkit-test] template added: .bkit/templates/docs/design.md
[bkit-test] template added: .bkit/templates/docs/noise.md
[bkit-test] template added: .bkit/templates/docs/observability.md
[bkit-test] template added: .bkit/templates/docs/security.md
[bkit-test] template added: .bkit/templates/docs/setup.md
[bkit-test] template added: .bkit/templates/docs/technology.md
[bkit-test] template added: .bkit/templates/docs/testing.md
[bkit-test] template added: .bkit/templates/lintstagedrc.example.json
[bkit-test] template added: .bkit/templates/prettierignore.example
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-test] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-test] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-test] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-test] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-test] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-test] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-test] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-test] template added: .bkit/templates/slop-scan.config.json
[bkit-test] payload link: .bkit/core
[bkit-test] payload link: .bkit/shared
[bkit-test] core: .bkit/allowlist.json
[bkit-test] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-test] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-test] write version pin: .bkit/version (6.1.1)

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts (19 tests | 8 failed) 6073ms
   ✓ the templates root is the copy-and-own set (1)
     ✓ holds the renamed workflows, hooks, context blocks and the slop plugin 3ms
   ✓ install copies the template set into .bkit/templates/ (3)
     ✓ copies exactly the set, raw, keeping each file's mode, with no hash record 152ms
     ✓ a second run writes no copy; a stale or stray copy is a write in dry-run and live alike 202ms
     ✓ does nothing in dogfood, where .bkit/templates/ is the package source 1ms
   ✓ formatTemplateChanges (4)
     ✓ names every changed, added and removed path, then points at templates.md 3ms
     ✓ names the consequence when a changed template's adopted copy backs a gate 5ms
     ✓ leaves a changed template with no gate consequence unannotated 1ms
     ✓ is empty when nothing changed 1ms
   ❯ formatTemplateChanges marks adopted doc starters (8)
     × changed doc starter with a project copy is marked adopted 8ms
     × changed doc starter indexed under another path is marked adopted 3ms
     × changed doc starter with no copy and changed non-doc template are not marked 2ms
     × changed doc starter whose recommended path is a symlink is not marked adopted 2ms
     × changed doc starter whose recommended path is a directory is not marked adopted 2ms
     × changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted 3ms
     × changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted 2ms
     × missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report 1ms
   ✓ uninstall (1)
     ✓ removes the consumer's .bkit/templates/ copies 103ms
   ✓ the sample configs do not act as live configs in a consumer (2)
     ✓ ships the sample configs under non-discoverable names 119ms
     ✓ leaves a staged template copy unchanged under plain lint-staged 5457ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter with a project copy is marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain '— adopted at docs/architecture.md, re…'

Expected: "— adopted at docs/architecture.md, review your copy"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:244:47
    242|     writeFile("docs/components.md");
    243|     const lines = changedLines(["docs/architecture.md", "docs/componen…
    244|     expect(lines.get("docs/architecture.md")).toContain(
       |                                               ^
    245|       "\u2014 adopted at docs/architecture.md, review your copy",
    246|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter indexed under another path is marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/testi…' to contain 'adopted at handbook/ops-testing.md, r…'

Expected: "adopted at handbook/ops-testing.md, review your copy"
Received: "  changed: .bkit/templates/docs/testing.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:256:42
    254|     writeIndexRows(["| `handbook/ops-testing.md` | Equivalent to `docs…
    255|     const lines = changedLines(["docs/testing.md"]);
    256|     expect(lines.get("docs/testing.md")).toContain(
       |                                          ^
    257|       "adopted at handbook/ops-testing.md, review your copy",
    258|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter with no copy and changed non-doc template are not marked
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain 'review your copy'

Expected: "review your copy"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:264:47
    262|     writeFile("docs/architecture.md");
    263|     const lines = changedLines(["docs/architecture.md", "docs/technolo…
    264|     expect(lines.get("docs/architecture.md")).toContain(REVIEW);
       |                                               ^
    265|     expect(lines.get("docs/technology.md")).toContain(path.join(COPIES…
    266|     expect(lines.get("docs/technology.md")).not.toContain(REVIEW);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter whose recommended path is a symlink is not marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain 'review your copy'

Expected: "review your copy"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:278:47
    276|     );
    277|     const lines = changedLines(["docs/architecture.md", "docs/technolo…
    278|     expect(lines.get("docs/architecture.md")).toContain(REVIEW);
       |                                               ^
    279|     expect(lines.get("docs/technology.md")).toContain(path.join(COPIES…
    280|     expect(lines.get("docs/technology.md")).not.toContain(REVIEW);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter whose recommended path is a directory is not marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain 'review your copy'

Expected: "review your copy"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:287:47
    285|     fs.mkdirSync(path.join(tmpDir, "docs", "security.md"));
    286|     const lines = changedLines(["docs/architecture.md", "docs/security…
    287|     expect(lines.get("docs/architecture.md")).toContain(REVIEW);
       |                                               ^
    288|     expect(lines.get("docs/security.md")).toContain(path.join(COPIES, …
    289|     expect(lines.get("docs/security.md")).not.toContain(REVIEW);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter whose indexed equivalent is a symlink or outside the repo is not marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/testi…' to contain 'review your copy'

Expected: "review your copy"
Received: "  changed: .bkit/templates/docs/testing.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:308:44
    306|       ]);
    307|       const lines = changedLines(["docs/testing.md", "docs/design.md",…
    308|       expect(lines.get("docs/testing.md")).toContain(REVIEW);
       |                                            ^
    309|       expect(lines.get("docs/design.md")).toContain(path.join(COPIES, …
    310|       expect(lines.get("docs/design.md")).not.toContain(REVIEW);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > changed doc starter indexed as Not equivalent to docs/{topic}.md is not marked adopted
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain 'review your copy'

Expected: "review your copy"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:328:47
    326|     ]);
    327|     const lines = changedLines(["docs/architecture.md", "docs/security…
    328|     expect(lines.get("docs/architecture.md")).toContain(REVIEW);
       |                                               ^
    329|     expect(lines.get("docs/security.md")).toContain(path.join(COPIES, …
    330|     expect(lines.get("docs/security.md")).not.toContain(REVIEW);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/8]⎯

 FAIL  .bkit/core/engine/install/template-copies.integration.test.ts > formatTemplateChanges marks adopted doc starters > missing or unreadable .agents/docs.md falls back to the recommended-path check without failing the report
AssertionError: expected '  changed: .bkit/templates/docs/archi…' to contain 'adopted at docs/'

Expected: "adopted at docs/"
Received: "  changed: .bkit/templates/docs/architecture.md"

 ❯ .bkit/core/engine/install/template-copies.integration.test.ts:337:80
    335|   it("missing or unreadable .agents/docs.md falls back to the recommen…
    336|     writeFile("docs/architecture.md");
    337|     expect(changedLines(["docs/architecture.md"]).get("docs/architectu…
       |                                                                                ^
    338|       "adopted at docs/",
    339|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/8]⎯


 Test Files  1 failed (1)
      Tests  8 failed | 11 passed (19)
   Start at  18:52:14
   Duration  6.32s (tests 98%, import 1%, transform 1%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-togQi1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts

[test-timeout-budget] load average 12.8 on 10 cores: unit limits 10900ms per test, 21800ms per hook (x2.18)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/887-review-doc-starters

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (78 tests | 1 failed) 285936ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 6ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 2ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 2ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 3ms
   ❯ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 594ms
     ✓ install --claude does not write Serena or graphify examples 789ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 519ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 519ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 493ms
     × bkit upgrade prints the adopted marker for a changed starter with a project copy 449ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 1386ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 1451ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 1398ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 2359ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 2404ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2650ms
     ✓ malformed .mcp.json fails install instead of being overwritten 406ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2223ms
     ✓ an adopted copy of every template survives upgrade and check 2539ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 2309ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 2251ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 820ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 3187ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 1874ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 1937ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 4314ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 6787ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 5341ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 9629ms
     ✓ branded script migration is idempotent and dry-run writes nothing 7613ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 6980ms
     ✓ a dry-run hook and CI token migration writes nothing 3102ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 8590ms
     ✓ a second check-name migration writes nothing 10894ms
     ✓ a dry-run check-name migration writes and moves nothing 3510ms
     ✓ a second Vale migration and a dry run write nothing 6215ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 5886ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 6655ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 9810ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 24ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 5ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 7ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 20ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 7ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 21ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 10ms
       ✓ honors contentOverride — writes rendered content, never the raw template 4ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 5ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 6209ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 5555ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 4951ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 4914ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 6350ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 6305ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 5919ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 5675ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 6649ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 7056ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 5140ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 1607ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 1341ms
     ✓ passes -w when the consumer is a pnpm workspace root 1364ms
     ✓ starts the package runner for the install and the re-exec 2093ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 795ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 8536ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 9999ms
     ✓ migrates legacy ownership without changing project text or core ownership 13409ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 7081ms
     ✓ previews project document migration without mutating the checkout 3725ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 6660ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 5166ms
     ✓ upgrade names the missing root lint-staged config with the copy command 5035ms
     ✓ install names the missing root lint-staged config under its own log prefix 4160ms
     ✓ check names the missing root lint-staged config under its own log prefix 4886ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 3216ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 5338ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 4359ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 4429ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > issue #129 §5 — upgrade does not force-create opt-in module files > bkit upgrade prints the adopted marker for a changed starter with a project copy
AssertionError: expected '[bkit-upgrade] Running upgrade (non-i…' to contain 'changed: .bkit/templates/docs/archite…'

- Expected
+ Received

- changed: .bkit/templates/docs/architecture.md — adopted at docs/architecture.md, review your copy
+ [bkit-upgrade] Running upgrade (non-interactive)
+ [bkit-upgrade] upgrade (merge): .gitattributes
+ [bkit-upgrade] upgrade (merge): .gitignore
+ [bkit-upgrade] upgrade (merge): .agents/context.md
+ [bkit-upgrade] upgrade (merge): .agents/docs.md
+ [bkit-upgrade] upgrade (merge): .agents/rules.md
+ [bkit-upgrade] upgrade (merge): .agents/skills.md
+ [bkit-upgrade] upgrade (merge): AGENTS.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-accessibility.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-adoption.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-agents.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-aio-seo.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-analytics.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-annotations.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-app-performance.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-app-store.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-architecture.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-ci-performance.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-config.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-cost.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-coverage.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-database.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-dead-code.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-deferrals.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-dependencies.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-documentation.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-duplication.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-failures.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-flakes.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-gates.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-issues.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-llm.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-logs.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-models.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-privacy.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-prompts.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-red-team.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-reliability.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-repo.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-security.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-slop.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-testing.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-audit-usability.md
+ [bkit-upgrade] upgrade (merge): docs/templates/bkit-plan.md
+ [bkit-upgrade] Templates updated (91). bkit never applies these; diff them against your own copies and adopt what you want:
+   changed: .bkit/templates/docs/architecture.md
+   added:   .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
+   added:   .bkit/templates/.cursor/Dockerfile
+   added:   .bkit/templates/.cursor/environment.json
+   added:   .bkit/templates/.cursor/settings.json
+   added:   .bkit/templates/.envrc
+   added:   .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
+   added:   .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
+   added:   .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
+   added:   .bkit/templates/.github/dependabot.yml
+   added:   .bkit/templates/.github/renovate.json5
+   added:   .bkit/templates/.github/workflows/bkit-ci.yml
+   added:   .bkit/templates/.github/workflows/bkit-cloud.yml
+   added:   .bkit/templates/.github/workflows/bkit-health.yml
+   added:   .bkit/templates/.github/workflows/bkit-renovate.yml
+   added:   .bkit/templates/.github/workflows/bkit-trivy.yml
+   added:   .bkit/templates/.graphifyignore
+   added:   .bkit/templates/.husky/pre-commit
+   added:   .bkit/templates/.husky/pre-push
+   added:   .bkit/templates/.oxlintrc.json
+   added:   .bkit/templates/.serena/project.yml
+   added:   .bkit/templates/.vale/styles/Bkit/Filler.yml
+   added:   .bkit/templates/.vale/styles/Bkit/Hedging.yml
+   added:   .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
+   added:   .bkit/templates/.vale/styles/Bkit/Verbose.yml
+   added:   .bkit/templates/.vale.ini
+   added:   .bkit/templates/context/bkit-cloudrun.md
+   added:   .bkit/templates/context/bkit-expo.md
+   added:   .bkit/templates/context/bkit-github.md
+   added:   .bkit/templates/context/bkit-inngest.md
+   added:   .bkit/templates/context/bkit-maestro.md
+   added:   .bkit/templates/context/bkit-playwright.md
+   added:   .bkit/templates/context/bkit-resend.md
+   added:   .bkit/templates/context/bkit-sentry.md
+   added:   .bkit/templates/context/bkit-serena.md
+   added:   .bkit/templates/context/bkit-stripe.md
+   added:   .bkit/templates/context/bkit-supabase.md
+   added:   .bkit/templates/context/bkit-tavily.md
+   added:   .bkit/templates/context/bkit-vercel.md
+   added:   .bkit/templates/docs/capabilities.md
+   added:   .bkit/templates/docs/components.md
+   added:   .bkit/templates/docs/data-schema.md
+   added:   .bkit/templates/docs/deployments.md
+   added:   .bkit/templates/docs/design.md
+   added:   .bkit/templates/docs/noise.md
+   added:   .bkit/templates/docs/observability.md
+   added:   .bkit/templates/docs/security.md
+   added:   .bkit/templates/docs/setup.md
+   added:   .bkit/templates/docs/technology.md
+   added:   .bkit/templates/docs/testing.md
+   added:   .bkit/templates/lintstagedrc.example.json
+   added:   .bkit/templates/prettierignore.example
+   added:   .bkit/templates/scripts/ci/bkit-accepted-advisories.json
+   added:   .bkit/templates/scripts/ci/bkit-accepted-divergences.json
+   added:   .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
+   added:   .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
+   added:   .bkit/templates/scripts/ci/bkit-check-capstone.mjs
+   added:   .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
+   added:   .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
+   added:   .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
+   added:   .bkit/templates/scripts/ci/bkit-machine-lock.sh
+   added:   .bkit/templates/scripts/ci/bkit-test-awake.mjs
+   added:   .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
+   added:   .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
+   added:   .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
+   added:   .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
+   added:   .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
+   added:   .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
+   added:   .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
+   added:   .bkit/templates/scripts/graphify/bkit-graph-drift.py
+   added:   .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
+   added:   .bkit/templates/scripts/graphify/bkit-graph-eager.py
+   added:   .bkit/templates/scripts/graphify/bkit-graph-embed.py
+   added:   .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
+   added:   .bkit/templates/scripts/graphify/bkit-graph-imports.py
+   added:   .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
+   added:   .bkit/templates/scripts/graphify/bkit-graph-repair.py
+   added:   .bkit/templates/scripts/graphify/bkit-graph-surface.py
+   added:   .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
+   added:   .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
+   added:   .bkit/templates/scripts/graphify/bkit-graphify.sh
+   added:   .bkit/templates/scripts/launchd/bkit-launchd-env.sh
+   added:   .bkit/templates/scripts/launchd/bkit-launchd.env.example
+   added:   .bkit/templates/scripts/launchd/bkit-launchd.plist
+   added:   .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
+   added:   .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
+   added:   .bkit/templates/scripts/secrets/bkit-secrets.mjs
+   added:   .bkit/templates/scripts/serena/bkit-serena-mcp.sh
+   added:   .bkit/templates/scripts/serena/bkit-serena.mcp.json
+   added:   .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
+   added:   .bkit/templates/slop-scan.config.json
+ Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)
+ [bkit-upgrade] Payload view links — `.bkit/core` + `.bkit/shared` point into the installed package (gitignored, browse-only):
+   linked:   .bkit/core
+   linked:   .bkit/shared
+ [bkit-upgrade] core: .bkit/authoring.md
+ [bkit-upgrade] core: .bkit/cloud.md
+ [bkit-upgrade] core: .bkit/cli.md
+ [bkit-upgrade] core: .bkit/comparison.md
+ [bkit-upgrade] core: .bkit/install.md
+ [bkit-upgrade] core: .bkit/jsonl.md
+ [bkit-upgrade] core: .bkit/LICENSE.md
+ [bkit-upgrade] core: .bkit/pipeline.md
+ [bkit-upgrade] core: .bkit/providers.md
+ [bkit-upgrade] core: .bkit/prompts.md
+ [bkit-upgrade] core: .bkit/router.md
+ [bkit-upgrade] core: .bkit/templates.md
+ [bkit-upgrade] core: .bkit/trackers.md
+ [bkit-upgrade] core: .bkit/workflows.md
+ [bkit-upgrade] core: .bkit/README.md
+ [bkit-upgrade] core: .bkit/allowlist.json
+ [bkit-upgrade] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
+ [bkit-upgrade] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
+ [bkit-upgrade] register: docs/architecture.md in .agents/docs.md (Project Documents)
+ [bkit-upgrade] Done. updated: 43, skipped: 0, conflicts: 0, re-rendered: 17
+ [bkit-upgrade] Checking advisories (read-only)
+ [bkit-upgrade] Preflight blockers detected — aborting.
+
+ ==========================================================
+ bkit advisories
+ ==========================================================
+
+ 1 finding(s) — 1 blocker, 0 advisory.
+
+ INSTRUCTIONS FOR AN AI AGENT — copy this file (or specific items) into a coding assistant to apply each item. Each ACTION is self-contained.
+
+ --- 1/1 [blocker] not-git-repo ---
+ Detect: core install requested but .git/ directory not found — this is not a git repository.
+ Action: Run `git init` to initialise a git repo, then re-run. bkit installs into a git repository — its managed .gitignore/.gitattributes blocks require one (core is implicit; there is no --core flag to omit).
+
+ ==========================================================
+
+ [bkit-upgrade] Wrote .bkit/advisories.md (1 item).
+
+

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:423:36
    421|
    422|     expect(result.status).toBe(0);
    423|     expect(combinedOutput(result)).toContain(
       |                                    ^
    424|       "changed: .bkit/templates/docs/architecture.md — adopted at docs…
    425|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 77 passed (78)
   Start at  18:52:22
   Duration  286.27s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-2Gv5yr/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
