Enforced: true
Red: 3
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1032-verbose-ci-head-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit" | red | failure: bkit-tests-static: expected [ 'VERBOSE_CI=1', …(2) ] to include 'TURBO_LOG_LEVEL=full' |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push" | red | failure: bkit-tests-static: expected [ 'VERBOSE_CI=1', …(3) ] to include 'TURBO_LOG_LEVEL=full' |
| 4 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts` "verbose marker step fixture commits under a global git config that signs commits" | passed-accepted | passes; accepted by the tests step: the fixture fix (-c commit.gpgsign=false plus failing on non-zero git exit) lives in the test file itself, so it passes now |
| 4 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "no template doc says markers are inert on a dispatch" | red | failure: expected [ Array(1) ] to deeply equal [] |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/ci-scripts.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/ci-scripts.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/ci-scripts.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/ci-scripts.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head

(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(node:18805) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts (28 tests | 2 failed) 38074ms
   ✓ bkit-check-dependency-audit (5)
     ✓ blocks high and critical by default, not moderate 4ms
     ✓ reports an unaccepted advisory as missing and an accepted one as clean 3ms
     ✓ flags an expired, over-long or stale acceptance 1ms
     ✓ exits 1 on a missing acceptance, 0 when clean, and 1 on a report with no advisories 194ms
     ✓ rejects an --unreachable value that is neither fail nor warn 76ms
   ✓ shipped copy-and-own test files (6)
     ✓ finds the shipped .test.mjs files 0ms
     ✓ ci/bkit-check-accepted-divergences.test.mjs passes when run on its own 64ms
     ✓ ci/bkit-check-capstone.test.mjs passes when run on its own 436ms
     ✓ ci/bkit-check-dependency-audit.test.mjs passes when run on its own 80ms
     ✓ ci/bkit-test-awake.test.mjs passes when run on its own 17250ms
     ✓ ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 13933ms
   ✓ capstone env wiring checks (3)
     ✓ flag a lane whose result is not wired to its job 17ms
     ✓ flag a wrongly wired optional lane variable but accept an absent one 1ms
     ✓ require PLAN and SCOPE_RESULT only when the capstone needs the scope job 1ms
   ✓ bkit-check-capstone (10)
     ✓ passes its own copy-and-own test file (bkit's own copy) 1737ms
     ✓ the template capstone calls the script, with every lane it needs wired in 140ms
     ✓ the repo capstone calls the script, with every lane it needs wired in 31ms
     ✓ the template capstone fetches the script with an ungated checkout before it runs 14ms
     ✓ the repo capstone fetches the script with an ungated checkout before it runs 16ms
     ✓ the template's step (5)
       ✓ sets exactly the variables this test supplies 58ms
       ✓ reds with a copy-the-script message when scripts/ci/bkit-check-capstone.mjs is missing 308ms
       ✓ never skips itself: a missing script reds even when every lane is green 63ms
       ✓ passes with the script present and the lanes green 953ms
       ✓ reds with the script present when the unit lane ran 0 tests 570ms
   ❯ template verbose marker step (manual run) (4)
     × verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit 363ms
     ✓ verbose marker step writes nothing to GITHUB_ENV for a head commit without the marker 769ms
     × verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push 262ms
     ✓ verbose marker step fixture commits under a global git config that signs commits 719ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > template verbose marker step (manual run) > verbose marker step writes VERBOSE_CI, TURBO_LOG_LEVEL and DEBUG to GITHUB_ENV for a [verbose ci] head commit
AssertionError: bkit-tests-static: expected [ 'VERBOSE_CI=1', …(2) ] to include 'TURBO_LOG_LEVEL=full'
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:407:26
    405|       const lines = r.env.split("\n").filter(Boolean);
    406|       expect(lines, job).toContain("VERBOSE_CI=1");
    407|       expect(lines, job).toContain("TURBO_LOG_LEVEL=full");
       |                          ^
    408|       expect(lines, job).toContain("DEBUG=vercel:*,supabase:*");
    409|       expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/ci-scripts.test.ts > template verbose marker step (manual run) > verbose marker step writes the TURBO_LOG_LEVEL value the job-level env sets on a marked push
AssertionError: bkit-tests-static: expected [ 'VERBOSE_CI=1', …(3) ] to include 'TURBO_LOG_LEVEL=full'
 ❯ .bkit/core/engine/audits/templates/ci-scripts.test.ts:430:38
    428|       const r = runStep(markerScript(job), "fix: something [verbose ci…
    429|       expect(r.status, job).toBe(0);
    430|       expect(r.env.split("\n"), job).toContain(`TURBO_LOG_LEVEL=${onVa…
       |                                      ^
    431|     }
    432|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 26 passed (28)
   Start at  12:01:08
   Duration  38.63s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gdDB6A/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/templates-content.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/templates-content.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/templates-content.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/templates-content.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1032-verbose-ci-head

(node:45358) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
 ❯ .bkit/core/engine/audits/templates/templates-content.test.ts (107 tests | 1 failed) 424ms
   ❯ consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml) (23)
     ✓ template file exists 5ms
     ✓ does NOT contain Configure private-repo auth step 1ms
     ✓ does NOT contain insteadOf git auth-shim 1ms
     ✓ install step no longer carries a BKIT_GH_TOKEN_INSTALL env block (public npm) 0ms
     ✓ install step runs a plain pnpm install --frozen-lockfile (no registry auth) 1ms
     ✓ still contains token placeholders {{DEFAULT_BRANCH}} and {{NODE_VERSION}} 1ms
     ❯ [verbose ci] NODE_OPTIONS knob (5)
       ✓ never writes NODE_OPTIONS to $GITHUB_ENV 92ms
       ✓ no template comment says a marker is inert on workflow_dispatch 1ms
       × no template doc says markers are inert on a dispatch 18ms
       ✓ every job declaring VERBOSE_CI also declares a marker-gated job-level NODE_OPTIONS 2ms
       ✓ gates NODE_OPTIONS on the spelled-out contains() test, not env.VERBOSE_CI 2ms
     ✓ Check Default Branch Lags Dev step (promotion-lag warning) (5)
       ✓ ships the Check Default Branch Lags Dev step 0ms
       ✓ fires only on dev pushes (not PRs, not other branches) 1ms
       ✓ keys ONLY on consumed-from-default-branch surfaces (renovate config + workflows) 0ms
       ✓ is token-free (default branch read at runtime, so the step is identical per repo) 0ms
       ✓ is non-blocking — warns via ::warning:: and never exits non-zero 0ms
     ✓ ships the bkit-stub:coverage block commented, per-tier (unit + integration reports) 0ms
     ✓ ships the unit coverage report reading the floor file and running on every event 0ms
     ✓ ships the bkit-stub:e2e-coverage block commented (Playwright E2E coverage report) 1ms
     ✓ ships the reference lane-name stubs (web, device, reset, deploy, health) 2ms
     ✓ never inlines a PR title into a run: body (GitHub Actions script injection) 0ms
     ✓ parts of the workflow that guard something (2)
       ✓ the capstone runs on !cancelled(), never always() 0ms
       ✓ a pull request keys its run on its number and the default branch queues 0ms
   ✓ consumer renovate template (.bkit/templates/.github/renovate.json5) (26)
     ✓ template file exists 0ms
     ✓ targets the dev branch (required for bkit branch-protection convention) 0ms
     ✓ merges base-branch config so dev-side renovate.json5 edits take effect 0ms
     ✓ ships chore(deps): commit-message prefix to match conventional-commit history 0ms
     ✓ extends Renovate's config:best-practices baseline (digest pinning, abandonment flags, config migration) 0ms
     ✓ restores the 7-day npm release-age gate that config:best-practices lowers to 3 days 0ms
     ✓ never rebases a Renovate PR by itself (no CI re-run when another PR merges) 0ms
     ✓ does not extend a renovate-local preset (the copy is the whole config) 0ms
     ✓ enables osvVulnerabilityAlerts (CVE-driven PRs bypass schedule) 0ms
     ✓ enables lockFileMaintenance 0ms
     ✓ ships the pnpm-11 OOM mitigation: worker-cap env + Renovate minimumReleaseAge (#308) 0ms
     ✓ does not fence bkit-renovate.yml (the consumer owns that runner) 0ms
     ✓ does not fence bkit-cloud.yml (a template the consumer owns, so its pins refresh) 0ms
     ✓ ignores the bkit-owned mirror trees so Renovate doesn't scan them (#132) 1ms
     ✓ keeps archived plans, test directories and fixtures out of the scan, and repeats the preset's defaults 0ms
     ✓ holds major bumps on the dependency dashboard until approved 0ms
     ✓ tracks off-manifest pins through one regex custom manager (Dockerfile, bkit-cloud.md, workflows) 0ms
     ✓ disables Renovate for the @cbartens/bkit package itself (#132) 0ms
     ✓ uses pinDigests for the github-actions manager (KN-3 SHA-pinning) 0ms
     ✓ collapses auto-mergeable non-major bumps into one shared group with automerge 0ms
     ✓ scopes multi-package ecosystem groups to majors only (non-majors fold into the unified group) 0ms
     ✓ renovate schedule covers the whole Monday 0ms
     ✓ renovate lockfile maintenance covers the whole first day of the month 0ms
     ✓ renovate groups custom.regex updates into one pinned-tools PR, pnpm into the non-major group 0ms
     ✓ references the JSON schema for editor validation 0ms
     ✓ no longer carries a GitHub Packages read-auth hostRules anchor 0ms
   ✓ self-hosted renovate workflow template (.bkit/templates/.github/workflows/bkit-renovate.yml) (#325) (12)
     ✓ template file exists 0ms
     ✓ runs renovatebot/github-action SHA-pinned (KN-CORE-5) on the configurable runner (#362) 0ms
     ✓ pins an exact Renovate release with a dated-lookup annotation the custom manager reads 0ms
     ✓ wires RENOVATE_GIT_AUTHOR from a repo variable (portable commit author for org repos) 1ms
     ✓ wakes on a schedule cron + workflow_dispatch (logLevel / dryRun inputs) 0ms
     ✓ serialises runs (concurrency group, no cancel-in-progress) 0ms
     ✓ authenticates with BKIT_GH_TOKEN, never the default GITHUB_TOKEN 1ms
     ✓ no longer injects private-registry auth (bkit is on the public npm registry) 0ms
     ✓ scopes to this repo only (no org-wide autodiscover) 0ms
     ✓ allow-lists the PNPM_* env so renovate.json5's env block is not rejected (allowedEnv) 0ms
     ✓ never INJECTS model/tracker secrets into the runner (security.md § token isolation) 0ms
     ✓ uses least-privilege job permissions (contents: read) 0ms
   ✓ trivy scan workflow template (.bkit/templates/.github/workflows/bkit-trivy.yml) (#547) (9)
     ✓ runs the trivy image pinned by tag and digest, never the hijackable actions 0ms
     ✓ never pins a release published by the March 2026 compromise (0.69.4 - 0.69.6) 0ms
     ✓ scans dev dependencies, or a dev-tooling lockfile reads as zero packages 0ms
     ✓ fails on HIGH and CRITICAL across lockfiles, config and secrets 0ms
     ✓ skips the bkit-owned templates tree 0ms
     ✓ leaves pnpm-lock.yaml to the dependency-audit gate once that gate is adopted 0ms
     ✓ reads .trivyignore.yaml only when the repo has one 0ms
     ✓ runs daily as well as on change, since advisories land without a code change 0ms
     ✓ uses a read-only token and reads no secret 1ms
   ✓ health check workflow template (.bkit/templates/.github/workflows/bkit-health.yml) (6)
     ✓ runs after every finished bkit-ci run on the default branch, whatever its conclusion 2ms
     ✓ probes only when production serves the CI run's commit 0ms
     ✓ fails, rather than skips, when it cannot read what production serves 0ms
     ✓ passes the CI run's commit through env:, never inlined into a run: body 0ms
     ✓ names every job with the bkit- prefix 0ms
     ✓ is the one health workflow the CI template points at 2ms
   ✓ example dependabot template (.bkit/templates/.github/dependabot.yml) (3)
     ✓ does not exclude bkit-cloud.yml (a template the consumer owns, so its pins refresh) 0ms
     ✓ holds new releases behind a 7-day cooldown 0ms
     ✓ never rebases a Dependabot PR by itself (no CI re-run when another PR merges) 1ms
   ✓ .bkit/.env.example keys are BKIT_-prefixed (direnv isolation) (3)
     ✓ assigns BKIT_GH_TOKEN (and no retired install token), not GH_BKIT_* 1ms
     ✓ every assigned key starts with BKIT_ 0ms
     ✓ vendor API keys are BKIT_-prefixed 1ms
   ✓ consumer .prettierignore template (.bkit/templates/prettierignore.example) (7)
     ✓ template file exists 0ms
     ✓ carries no bkit:start / bkit:end block (bkit never writes a template) 0ms
     ✓ prettier ignores the committed run log run-tests-1.md: true 11ms
     ✓ prettier ignores the committed run log build-group-gate-1-1.md: true 2ms
     ✓ prettier ignores the committed run log build-subplan-gate-1-1.md: true 3ms
     ✓ prettier ignores the committed run log context-tests-local-1.md: true 6ms
     ✓ prettier ignores the committed run log build-plan-verify-1-1.md: true 2ms
   ✓ templates (4)
     ✓ every template that can carry a comment says it is an example bkit install does not write 81ms
     ✓ no template carries a bkit:start / bkit:end block (bkit never writes a template) 150ms
     ✓ keeps capability rules as a starter, not a product register 0ms
     ✓ generates capabilities.md and Mermaid from the wrapper 2ms
   ✓ launchd GUI-env templates (.bkit/templates/scripts/launchd/) (9)
     ✓ ships the loader, the LaunchAgent plist and the env example 1ms
     ✓ bkit-launchd-env.sh (5)
       ✓ is POSIX shell that fails on unset variables but not on one failing key 3ms
       ✓ reads the env file from the positional arg or BKIT_LAUNCHD_ENV 0ms
       ✓ checks key identifiers against [A-Za-z0-9_] 0ms
       ✓ skips without launchctl on PATH (Linux CI) 0ms
       ✓ hands the value to launchctl, but logs key names only 1ms
     ✓ bkit-launchd.plist (2)
       ✓ is a LaunchAgent that loads at login and re-runs on env-file writes 0ms
       ✓ keeps {{SCRIPT_PATH}} / {{ENV_FILE}} raw for the consumer to fill 0ms
     ✓ bkit-launchd.env.example (1)
       ✓ ships example BKIT_ token keys with empty values 0ms
   ✓ .bkit/templates.md gate tool scripts (consumers copy and run them) (5)
     ✓ lists bkit:slop:delta as the bkit ci slop verb 0ms
     ✓ lists the graphify scripts under bkit:graph names 0ms
     ✓ lists a lint value that runs Oxlint type-aware with the shipped config and fails on any hit 0ms
     ✓ ships the .oxlintrc.json the lint value names, with its five test rules at error 1ms
     ✓ lists every script the default gates chain, except test and build 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/templates-content.test.ts > consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml) > [verbose ci] NODE_OPTIONS knob > no template doc says markers are inert on a dispatch
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "deployments.md: A push diffs against the head of the last successful CI run on that branch, not ",
+ ]

 ❯ .bkit/core/engine/audits/templates/templates-content.test.ts:142:25
    140|             .map((l) => `${path.relative(docsDir, f)}: ${l.slice(0, 80…
    141|         );
    142|       expect(offenders).toEqual([]);
       |                         ^
    143|     });
    144|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 106 passed (107)
   Start at  12:01:56
   Duration  1.65s (tests 34%, transform 29%, import 24%, setup 11%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-wwekvR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
