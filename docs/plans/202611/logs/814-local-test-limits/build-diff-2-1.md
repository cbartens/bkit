diff --git a/.bkit/core/docs/templates/bkit-audit-flakes.md b/.bkit/core/docs/templates/bkit-audit-flakes.md
index cda003921..ca30095ea 100644
--- a/.bkit/core/docs/templates/bkit-audit-flakes.md
+++ b/.bkit/core/docs/templates/bkit-audit-flakes.md
@@ -20,7 +20,7 @@
 
 ### Context & Goals
 
-A ledger row can record that a flake exists, but the useful part is the mechanism, and that never fits in one line. The standing danger is reading a flake as timing and widening the timeout. The reported error is usually a consequence, and a timeout bump made before the trace is read turns a real bug into a slow green. On shared dev machines, a load-scaled time budget sampled once at config or worker load goes stale mid-run, because a load ramp starves the later files. Re-read it per test file (vitest `vi.setConfig` in a setup file, jest `jest.setTimeout` in setup), with the same base and cap, and the factor pinned to 1 on CI. That freshness fix is a mechanism fix, not a widen. The failure this audit targets is a skip, a quarantine or a wider timeout standing in for a named mechanism.
+A ledger row can record that a flake exists, but the useful part is the mechanism, and that never fits in one line. The standing danger is reading a flake as timing and widening the timeout. The reported error is usually a consequence, and a timeout bump made before the trace is read turns a real bug into a slow green. Keep time limits strict under CI. Locally, use a fixed multiple of the CI limit whose only job is to catch a hang, with no load-based scaling: a limit that moves with machine load hides a slow test instead of naming it. Widening one test's limit to hide a flake is still a widen, not a fix. The failure this audit targets is a skip, a quarantine or a wider timeout standing in for a named mechanism.
 
 **Applies when:** the suite runs more than once, in CI or as a local repeat. **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".
 
diff --git a/.bkit/templates/docs/testing.md b/.bkit/templates/docs/testing.md
index 8af40880b..e0db55e3f 100644
--- a/.bkit/templates/docs/testing.md
+++ b/.bkit/templates/docs/testing.md
@@ -133,7 +133,7 @@ CI branches on the event in a few places. Each one is a deliberate, recorded div
 | `human-confirmation` | A laptop reset of a remote tenant needs an explicit yes. The CI run is the approval. |
 | `revert-recovery` | A revert push skips the pre-push unit and integration tiers. CI still runs every tier. |
 | `output-channel` | CI prints annotations and job summaries. A terminal prints lines. |
-| `ci-strict-time-limits` | Unit time limits grow with a laptop's load, re-read as each test file starts so a mid-run ramp cannot starve late files. Under `CI` they stay fixed. |
+| `ci-strict-time-limits` | Time limits stay strict under `CI`; locally they are a fixed multiple of the CI limit that only catches a hang, with no load reading. |
 | `playwright-outcomes` | Same retries, traces, and flake handling on every machine. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag. |
 
 ### Which resources may each lane touch?
diff --git a/.bkit/version b/.bkit/version
index 09c736a1f..54b0546ef 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -182,7 +182,7 @@
     "docs/templates/bkit-audit-security.md": "4122baa5b35784128ab27d2ad7db04161cc6410cdc20dc62474f8d4fbbf4f4d2",
     "docs/templates/bkit-audit-slop.md": "4b62345a868760e6e3447a1b86b2a4bfd1bf9d25aba125c7785f628b81d36c15",
     "docs/templates/bkit-audit-usability.md": "1683eb698874688081b46ea684914d5c91fd46bee0e2372005347d53d196d618",
-    "docs/templates/bkit-audit-testing.md": "ce01369dfd50246ba7abdafcedffe4c971255b0fbb00a86b2425f0b155e76c9c",
+    "docs/templates/bkit-audit-testing.md": "1b18ffa6623086614e6c66c526aaf248fa3ac3172e05abb2d977edd31aa51f6c",
     ".opencode/agents/bkit-utility-update-roadmap.md": "8ed1422f62edebd823bba24cf9f25c28c3038cebc321a17c28ecc019fad91e51",
     ".codex/agents/bkit-utility-update-roadmap.toml": "b44757d2b03f3862635951f3d151ed6dfc2ec92f510721da711773dc62359091",
     "docs/templates/bkit-audit-aio-seo.md": "fe2d947aea4436b1fb1772b7d6bc30260927ca28294bdbf456f107af142e118d",
@@ -193,9 +193,9 @@
     "docs/templates/bkit-audit-cost.md": "53c86ef642f5f9f9ec23a7a2febfe1a8226a1da7f13f1d394ed9c9bb76ade859",
     "docs/templates/bkit-audit-coverage.md": "4c3584fdba306b59e9cbab3e34025cc97929eba5858dd48b362f50989ee51eee",
     "docs/templates/bkit-audit-deferrals.md": "f5f7a6b900b8016b847499e388c99663fcf64f08418885e15f9bcb1bf703bbd5",
-    "docs/templates/bkit-audit-dependencies.md": "ac25cc7ab05f9062868d89d6789d78a4651642f9c993aef85ab8e3cb1dba446a",
-    "docs/templates/bkit-audit-failures.md": "143e6881a81e4693df6edf6ba074ac6905d8300e04791112c8b6a757716e90ce",
-    "docs/templates/bkit-audit-flakes.md": "9349b5851b1ace1e2c21a5e99e73322ef845ece148295762e93e486fc42cf4d4",
+    "docs/templates/bkit-audit-dependencies.md": "ba558f4990fd84b87fbe77bf5a122163020e0d994d994417bb78706c264ffe4f",
+    "docs/templates/bkit-audit-failures.md": "97b09ec4152b3e16cc582ea799b673fe5fdcc3edf63e6d527cb345fa85b67566",
+    "docs/templates/bkit-audit-flakes.md": "8d8f60fcb1ce49bafe2b72616969dd5114eaa00dee7ab788463bc852410fea0a",
     "docs/templates/bkit-audit-gates.md": "9808ac55e349f1550df59cc29920fed9f763f94ff9a6502b27481d2db318396d",
     "docs/templates/bkit-audit-issues.md": "501db9cb23328160e4f938f859ba26e49b4064906a1620006db05dfc0da3e646",
     "docs/templates/bkit-audit-logs.md": "6c19169f0368ad3e6267554de0fc769ec88a1c2991679e6067fbcda6b46d7722",
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 944a55b5d..304829c81 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -181,3 +181,4 @@
 {"schema":3,"ts":1794452055905,"firstTs":1793110852612,"updates":2,"kind":"knowledge","key":"plan-derived-test-matrix-needs-a-task-column","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/challenge.ts",".bkit/core/docs/templates/bkit-plan.md"],"summary":"`bkit tests plan-check` refuses a `Derived Test Matrix` whose header is not exactly `Test description | Type | Target file | Task`, or whose rows do not each hold 4 cells with only task numbers in the `Task` cell, so every matrix the build writes (converted, challenge-merged, Fix now) uses that one shape and names exactly one runbook task per row","description":"- **Category:** process\n- **Symptom:** `bkit tests plan-check` exits 1 with `the Derived Test Matrix header must be exactly `Test description | Type | Target file | Task`, in that order with no other columns` or `Derived Test Matrix row must have 4 cells in the template's order, with only task numbers (`N` or `TASK N`) in its `Task` cell`, then `Derived Test Matrix row maps to no task`, `maps to TASK {n}, which the plan does not define`, or `TASK {n} names TEST FIRST tests but no Derived Test Matrix row maps to it`.\n- **Root cause:** the matrix-to-runbook mapping is a plan contract with one right answer, so `plan-check` derives it from the table and pins the table to the template's shape; a plan converted from an issue body carries the issue's three-column matrix (`Test description | Type | Target file`) with no mapping, a matrix with an extra leading `#` column or with `Task` before `Target file` shifts every cell, and a task appended later (challenge merge, Decision Pause Fix now) adds its test to `TEST FIRST` without a row.\n- **Fix or rule:** write the matrix header as exactly `| Test description | Type | Target file | Task |`, with a closing pipe, give every row the same 4 cells in that order with one task number (`N` or `TASK N`) in `Task`, and append one row per test every later task adds; `bkit challenge merge` and the Fix-now task writer add both together.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The issue's change shape carries a three-column matrix while the plan's table is the runbook's coverage map; converting one to the other gets the columns right only if the writer knows plan-check pins the exact header and row shape.","remediation":"Use the exact header `Test description | Type | Target file | Task` with a closing pipe, give every row 4 cells with one defined task number in `Task`, and add a row beside every test a later task appends; run `bkit tests plan-check` after any plan write."}
 {"schema":3,"ts":1794616171090,"firstTs":1793021911996,"updates":2,"kind":"knowledge","key":"renumbering-a-workflow-leaves-instructions-md-local-entries-stale","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/instructions.md (Local Instructions, per-file `- source:` blocks)",".bkit/core/engine/tools/instructions-coverage.test.ts",".bkit/core/engine/tools/instructions.ts (syncCoverage)","705","#934"],"summary":"Renumbering a workflow's steps rewrites the step numbers inside its standing lines; `pnpm instructions:sync` refreshes each `.bkit/instructions.md` local entry reworded in place, but an entry whose line was deleted or moved past its unchanged neighbours stays a finding","description":"Every standing line (routes, gate items, step prose) is listed verbatim under that file's `- source:` block. `refreshLocal` in `.bkit/core/engine/tools/instructions.ts` rewrites an entry whose line was reworded in place (between the same unchanged entries, at least 50% alike, no tie) and prints `refreshed local entry`. A deleted line still fails `instructions-coverage.test.ts` with `local entry no longer in the file` and a new one with `no entry — add under`, so delete or add those entries by hand, then run `pnpm instructions:sync` again until it prints nothing.","remediation":"Rewrite the edited workflow's `- source:` block in `.bkit/instructions.md` in the same change (delete the retired lines, add the new wording), then re-run `pnpm instructions:sync` and `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts`.","status":"ACTIVE"}
 {"schema":3,"ts":1794616171092,"firstTs":1793004573755,"updates":2,"kind":"knowledge","key":"instructions-store-clause-text-and-local-entries-need-hand-edits","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/instructions.md",".bkit/core/engine/tools/instructions.ts",".bkit/core/engine/tools/instructions-coverage.test.ts",".bkit/core/workflows/bkit-debug.md",".bkit/core/docs/templates/bkit-plan.md","#934"],"summary":"Editing a standing workflow / prompt / template line that a clause carries reds the instruction tools until the store's clause `text` block moves with it; `pnpm instructions:sync` refreshes a reworded local entry, but never a clause's own text","description":"- **Category:** tooling\n- **Symptom:** after an edit to a standing line (a list item, or a line carrying `NEVER` / `ALWAYS` / `→`), `pnpm test` fails with `instructions-coverage.test.ts` `\"bkit-debug: local entry no longer in the file: …\"` plus `\".bkit/core/workflows/bkit-debug.md:108: no entry — add under #### bkit-debug: …\"`, and `instructions.test.ts` fails `has no findings` (near-copy), `sync has nothing left to rewrite` and `every clause reaches the cut-off of one surface it applies to`.\n- **Root cause:** `.bkit/instructions.md` holds the corpus twice over. A `## Clauses` entry carries one shared sentence, matched as a substring of a carrier line, and a `## Local Instructions` entry per file holds every standing local line verbatim. `pnpm instructions:sync` rewrites the clause *instances* inside the carrier files, the generated copies and a local entry reworded in place; it never rewrites a clause's own `text` block. A shared line whose only two carriers both moved also drops under `SHARED_MIN.workflow` of 2, which reads as an underused clause.\n- **Fix or rule:** for a clause, edit it in the store — new wording in the ```` ```text ```` block, the old wording appended to ```` ```retired ```` (never a wording that is a prefix of its new text) — then run `pnpm instructions:sync` so every carrier takes it. A local entry reworded in place is rewritten by `pnpm instructions:sync` itself (it prints `refreshed local entry`); add a genuinely new line's entry, or delete a removed line's entry, by hand. Verify with `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (exit 0) and a second `pnpm instructions:sync` that prints nothing, then run `instructions.test.ts`, `instructions-coverage.test.ts` and `instructions-sources.test.ts`.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`.bkit/instructions.md` is the one store for two kinds of record — `## Clauses` texts (substring-matched against carrier lines) and `## Local Instructions` entries (verbatim copies of each file's standing lines) — and `syncSources` / `syncClauses` / `syncCoverage` rewrite neither a clause's own text nor a local entry's line, so an edited line leaves the old store text dangling and the new line uncovered.","remediation":"Move the clause text in `.bkit/instructions.md` (old wording to `retired`, new wording to the ```` ```text ```` block), run `pnpm instructions:sync` so the carriers take it, then hand-edit every `## Local Instructions` entry whose file changed. Check with `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (exit 0) plus a second `pnpm instructions:sync` that prints nothing.","status":"ACTIVE"}
+{"schema":3,"ts":1794719003081,"firstTs":1793022027352,"updates":2,"kind":"knowledge","key":"spawn-heavy-unit-suite-needs-its-own-budget-under-load","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","modelSource":"unavailable"},"references":["vitest.timeout-budget.ts"],"summary":"Superseded: off CI the test limit is now a fixed 6 times the CI limit, a hang limit with no load reading, so a spawn-heavy suite needs no load-scaled budget of its own (#814)","description":"The load-scaled factor this row described no longer exists. vitest.timeout-budget.ts gives every test a fixed local limit (30s / 60s / 180s) off CI and the strict CI limit under CI, so contention no longer changes the limit.","rootCause":"The old factor read load average per core and under-scaled at full capacity.","remediation":"Use the shared tier limits; do not add per-suite load budgets.","status":"SUPERSEDED"}
diff --git a/docs/templates/bkit-audit-dependencies.md b/docs/templates/bkit-audit-dependencies.md
index 8031cf499..e039c0fbf 100644
--- a/docs/templates/bkit-audit-dependencies.md
+++ b/docs/templates/bkit-audit-dependencies.md
@@ -479,7 +479,7 @@ Doctrine: `docs/deployments.md` § Dependency updaters, § Renovate — fencing
 ### Verification
 
 - `git status --porcelain` → `pnpm install --frozen-lockfile` → `pnpm bkit:gate:install-static-unit-build` → `git status --porcelain` → `pnpm bkit check`.
-- Under high load average the unit tier can time out (`test-timeout-budget` line prints the load) or the gate can be killed (exit 143). Re-run the failing file alone: `node_modules/.bin/vitest run -c vitest.unit.config.ts <file>`; then `pnpm bkit:test:bats` and `pnpm build` separately; match the timeout against open `docs/failures.jsonl` rows before calling it a batch red.
+- The unit tier can time out on a hang or the gate can be killed (exit 143). Re-run the failing file alone: `node_modules/.bin/vitest run -c vitest.unit.config.ts <file>`; then `pnpm bkit:test:bats` and `pnpm build` separately; match the timeout against open `docs/failures.jsonl` rows before calling it a batch red.
 - Override check: after the batch install, every `pnpm.overrides` entry in `package.json` that shadows an exact devDependency pin → `grep -n -A3 '^  <pkg>:' pnpm-lock.yaml` under `importers` shows `specifier` and `version`; a `version` below the manifest pin = override wins.
 - The frozen install runs husky `prepare`; after removing the worktree confirm `git config core.hooksPath` in the main checkout still prints `.husky/_`.
 - No framework doctor. Single-version check for the runtime dependency `cross-spawn` (`package.json` `dependencies`): `grep '^  cross-spawn@' pnpm-lock.yaml | sort -u | wc -l` must print 1 (each version appears once under `packages:` and once under `snapshots:`).
diff --git a/docs/templates/bkit-audit-failures.md b/docs/templates/bkit-audit-failures.md
index 96b0dfbbe..41ec43a5f 100644
--- a/docs/templates/bkit-audit-failures.md
+++ b/docs/templates/bkit-audit-failures.md
@@ -292,7 +292,7 @@ PENDING
 ### Step 4 — Source
 
 - Capability-register rows: read the step result on the latest dev run with `gh run list --workflow bkit-ci.yml --branch dev --limit 5` and `gh run view {id} --json jobs`, rather than running graphify locally.
-- Flaky-test rows: confirm the cited title still exists with `git grep -c -F "{title}" HEAD -- {spec}`, and check `vitest.timeout-budget.ts` (`loadFactor`, `tierTimeouts`) before calling a timeout row fixed.
+- Flaky-test rows: confirm the cited title still exists with `git grep -c -F "{title}" HEAD -- {spec}`, and check `vitest.timeout-budget.ts` (`limitFactor`, `localLimit`, `tierTimeouts`) before calling a timeout row fixed.
 - Engine symbols (`.bkit/core/engine/**/*.ts`): Serena `find_symbol` with `include_body`; workflow and prompt text (`.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`), hooks (`.husky/*`) and templates (`.bkit/templates/**`): `git grep -n ... HEAD --`.
 
 ### Step 6 — Classes
diff --git a/docs/templates/bkit-audit-flakes.md b/docs/templates/bkit-audit-flakes.md
index 8c96a416b..b854cbc6b 100644
--- a/docs/templates/bkit-audit-flakes.md
+++ b/docs/templates/bkit-audit-flakes.md
@@ -20,7 +20,7 @@
 
 ### Context & Goals
 
-A ledger row can record that a flake exists, but the useful part is the mechanism, and that never fits in one line. The standing danger is reading a flake as timing and widening the timeout. The reported error is usually a consequence, and a timeout bump made before the trace is read turns a real bug into a slow green. On shared dev machines, a load-scaled time budget sampled once at config or worker load goes stale mid-run, because a load ramp starves the later files. Re-read it per test file (vitest `vi.setConfig` in a setup file, jest `jest.setTimeout` in setup), with the same base and cap, and the factor pinned to 1 on CI. That freshness fix is a mechanism fix, not a widen. The failure this audit targets is a skip, a quarantine or a wider timeout standing in for a named mechanism.
+A ledger row can record that a flake exists, but the useful part is the mechanism, and that never fits in one line. The standing danger is reading a flake as timing and widening the timeout. The reported error is usually a consequence, and a timeout bump made before the trace is read turns a real bug into a slow green. Keep time limits strict under CI. Locally, use a fixed multiple of the CI limit whose only job is to catch a hang, with no load-based scaling: a limit that moves with machine load hides a slow test instead of naming it. Widening one test's limit to hide a flake is still a widen, not a fix. The failure this audit targets is a skip, a quarantine or a wider timeout standing in for a named mechanism.
 
 **Applies when:** the suite runs more than once, in CI or as a local repeat. **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".
 
diff --git a/docs/templates/bkit-audit-testing.md b/docs/templates/bkit-audit-testing.md
index 6ccacfa90..6ed6d8a25 100644
--- a/docs/templates/bkit-audit-testing.md
+++ b/docs/templates/bkit-audit-testing.md
@@ -308,7 +308,7 @@ PENDING
 ## Project Instructions
 
 - **Permissions:** Bash probes this audit needs: `./node_modules/.bin/vitest run`, `bats tests/shell/*.bats`, `node <file>.test.mjs`, `git log` / `git grep` / `git ls-files` / `git worktree add|remove`, `gh run list` / `gh run view` (read-only), `cmp`, `/usr/bin/time -l`, `jq` (ledger append). WebFetch `registry.npmjs.org`, `api-security.owasp.org`, `github.com`, `kentcdodds.com`.
-- **Pre-Flight / Test Runner:** Vitest config `vitest.config.ts` (include = `.bkit/core/engine/**`), worker setup `vitest.setup.ts`, load-scaled timeouts `vitest.timeout-budget.ts`. Tier rubric and per-file tier labels → `docs/testing.md` § Tiers and § Key test files. Shell tier = `tests/shell/*.bats`. Copy-and-own CI script tests (`.bkit/templates/scripts/ci/**/*.test.mjs`, `scripts/ci/**/*.test.mjs`) sit outside the Vitest include; run each with `node <file>`.
+- **Pre-Flight / Test Runner:** Vitest config `vitest.config.ts` (include = `.bkit/core/engine/**`), worker setup `vitest.setup.ts`, fixed CI / local timeouts `vitest.timeout-budget.ts`. Tier rubric and per-file tier labels → `docs/testing.md` § Tiers and § Key test files. Shell tier = `tests/shell/*.bats`. Copy-and-own CI script tests (`.bkit/templates/scripts/ci/**/*.test.mjs`, `scripts/ci/**/*.test.mjs`) sit outside the Vitest include; run each with `node <file>`.
 - **Pre-Flight / Mutation Tool:** none installed. Hand-break in a throwaway detached worktree: `git worktree add --detach .worktrees/<name> HEAD`, symlink `node_modules` from the main checkout, `mkdir tmp`; runner script in repo-root `tmp/` that asserts the find string matches once, writes the mutant, runs `./node_modules/.bin/vitest run <files> --reporter=json --outputFile=tmp/<out>.json`, restores the original bytes in `finally` and checks sha256. Re-run every survivor with no file filter (full suite). Remove the `node_modules` symlink and `tmp/` before `git worktree remove .worktrees/<name>`.
 - **Pre-Flight / Language Server:** TypeScript 7 (Go port) exposes no JS compiler API — syntax-tree scans need a text / brace-matching script; Serena TypeScript works for symbol lookups.
 - **Step 3 — Behaviours:** promise sources = `docs/security.md`, `docs/testing.md`, `docs/architecture.md` § Consumer Integration Model (host list); fixed rows in `docs/failures.jsonl` — check each by a revert-the-fix mutant, not by test names.
diff --git a/docs/testing.md b/docs/testing.md
index c9719b8ca..4ae169e8b 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -130,7 +130,7 @@ CI branches on the event in a few places. Each one is a deliberate, recorded div
 | `human-confirmation` | A laptop reset of a remote tenant needs an explicit yes. The CI run is the approval. |
 | `revert-recovery` | A revert push skips the pre-push unit and integration tiers. CI still runs every tier. |
 | `output-channel` | CI prints annotations and job summaries. A terminal prints lines. |
-| `ci-strict-time-limits` | Unit time limits grow with a laptop's load, re-read as each test file starts so a mid-run ramp cannot starve late files. Under `CI` they stay fixed. |
+| `ci-strict-time-limits` | Time limits stay strict under `CI` (5s / 10s unit, 30s integration); locally they are a fixed 6 times that (30s / 60s / 180s) that only catches a hang, with no load reading. |
 | `playwright-outcomes` | Same retries, traces, and flake handling on every machine. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag. |
 
 ### Which resources may each lane touch?
@@ -557,7 +557,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Runner:** Vitest 5 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`). Harvest: `node:test` (`pnpm test:harvest`).
 - **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. `BKIT_TEST_WORKERS` supplies a positive worker limit when set.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
-- **Time limits:** the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
+- **Time limits:** under `CI` the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) are strict (5s / 10s unit, 30s integration); off CI each is a fixed 6 times that (30s / 60s / 180s), a hang limit with no load reading. They also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
diff --git a/vitest.setup.ts b/vitest.setup.ts
index 2dee060cb..db6304304 100644
--- a/vitest.setup.ts
+++ b/vitest.setup.ts
@@ -2,8 +2,8 @@
 //
 // Five jobs: strip inherited git environment variables (below), fail any test that
 // changes the git identity or core.bare of the repo the suite runs from, point the bkit
-// config and cache folders at an empty temp folder, and re-read the load-scaled test
-// budget as each test file starts (bottom, via vitest.timeout-budget.ts), and give every
+// config and cache folders at an empty temp folder, and set the fixed CI / local test
+// limits as each test file starts (bottom, via vitest.timeout-budget.ts), and give every
 // synchronous child call that sets no `timeout` the running test's remaining time, so a hung
 // child fails the test instead of blocking the worker (vitest.child-deadline.ts).
 //
