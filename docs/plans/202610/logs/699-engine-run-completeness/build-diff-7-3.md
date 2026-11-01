diff --git a/.github/workflows/bkit-ci.yml b/.github/workflows/bkit-ci.yml
index 4ad042e44..2a8355197 100644
--- a/.github/workflows/bkit-ci.yml
+++ b/.github/workflows/bkit-ci.yml
@@ -506,9 +506,14 @@ jobs:
       - name: Assert Dist Freshness
         run: pnpm bkit:check:dist
 
-      # bkit repo only: status-hole detector, advisory (exits 0 when it finds holes).
+      # bkit repo only: run-completeness sweep over every workflow's status.jsonl, advisory
+      # (exits 0 when it finds holes). Fails only when the sweep printed no summary line: a
+      # hole never reds the lane, a silent no-op does.
       - name: Check Status Holes
-        run: pnpm bkit:audit:status || true
+        run: |
+          pnpm bkit:audit:status > "$RUNNER_TEMP/status-holes.txt" 2>&1 || true
+          cat "$RUNNER_TEMP/status-holes.txt"
+          grep -qF '[bkit-status-holes] sweep:' "$RUNNER_TEMP/status-holes.txt" || { echo '[bkit] status-holes sweep printed no summary line'; exit 1; }
 
       # Capability-register freshness gate: rebuild the graph with graphify and fail when
       # docs/capabilities.md is not what this tree produces, so the register cannot drift
diff --git a/docs/observability.md b/docs/observability.md
index 5038e5252..1ad004ed7 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -59,6 +59,21 @@ Compliance grader stderr. Canonical grep patterns:
 - `[bkit-telemetry] stats.jsonl not found — no telemetry rows yet` — in the close `report` when the ledger is absent.
 - `[bkit-telemetry] outcome not restated: {reason}` / `no {workflow} workflow-done row with parentSha — outcome not restated` / `no {workflow} outcome row for {sha} — outcome not restated` — dispatch re-append skipped.
 - `[bkit-telemetry] {kind} row {key} not written: {reason}` — harvest scan row failing its totals check, on stderr; not appended.
+- `[bkit-telemetry] {kind} row not written: {reason}` — a `completeness` row the close could not append (`{kind}` is `completeness`); the close continues.
+- `[bkit-telemetry] journal write failed: {message}` — the engine-call / friction journal at command dispatch could not write a row; logged once per command run, the command's exit code is unchanged.
+
+The journal seam writes `engine-call` and `friction` rows to the active run's `status.jsonl` / `.bkit/friction.jsonl`. `BKIT_ENGINE_JOURNAL=off` is its kill switch: any other value (or unset) leaves it on. Rows are evidence for `bkit completeness check`; the seam never changes an exit code.
+
+### `[bkit-status-holes]` prefix
+
+Run-completeness check (`checks/status-holes.ts`, `bkit completeness check`). Advisory and fail-open: always exits 0. Canonical grep patterns:
+
+- `[bkit-status-holes] ADVISORY` — the report line: `ADVISORY — fail-open (exit 0 regardless)` from the corpus sweep, `ADVISORY — {workflow}: {verdict} (N step(s), M call(s) observed)` from `bkit completeness check`. Following lines list `step holes:`, `evidence hole:`, `pre-journal run:` and `unexercised arms:`; a verdict's `journalSuspect` field (a post-journal run with no journaled call) is set at close only and is read from the stored `completeness` row.
+- `[bkit-status-holes] sweep: {N} file(s), {M} holey` — corpus-sweep summary, printed once per `pnpm bkit:audit:status`. The CI `Check Status Holes` step greps `[bkit-status-holes] sweep:` and fails the lane when it is absent (a silent no-op); holes never fail it.
+- `[bkit-status-holes] {path} not found — skipping (advisory)` / `{path}: no workflow rows — skipping (advisory)` / `bkit-{workflow}.md not found — skipping {workflow} run (advisory)` / `no status.jsonl path given — skipping (advisory)` — sweep inputs skipped.
+- `[bkit-status-holes] {file} not readable: {message}` / `bkit-{workflow}.md not readable — skipping {workflow} (advisory)` / `{workflow}: {message} — no verdict (advisory)` / `no status.jsonl to check` / `no verdict` — `bkit completeness check` inputs missing; exit 0.
+
+`bkit workflows start` and `resume` print `[bkit-workflows] previous run ({workflow} run {n}, closed {at}) was incomplete: …` when the previous run for the FID was holey; it warns and never blocks.
 
 ### `[bkit-harvest]` prefix
 
diff --git a/docs/testing.md b/docs/testing.md
index af944032e..e97c571d6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -253,7 +253,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) is the per-featur
 
 `/bkit-build` writes each task's tests before its code and proves them: each test fails against stubs (red), then passes once the code exists (green). Unit and integration tiers only; E2E and `@live` rows run in CI and stay planned in the `Derived Test Matrix`. Each plan task names its tests on a `**Test first:**` line (`;`-separated), or `n/a — {reason}`.
 
-- **Declare `bkit:test:file`:** runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`; pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`; jest needs the `jest-junit` reporter. Undeclared → build reports test-first as not enforced.
+- **Declare `bkit:test:file`:** runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"` (this repo's `scripts/ci/test-file.sh` also routes a `*.bats` file to `bats --report-formatter junit`); pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`; jest needs the `jest-junit` reporter. Undeclared → build reports test-first as not enforced.
 - **Declare `bkit:lint:file`:** lints the ONE test file bkit appends (repo-relative path) with the static gate's linter config, exit 0 when clean. ESLint: `eslint --max-warnings=0`; Ruff: `ruff check`. Build lints each new test before its red; undeclared → the red is recorded unlinted, and a lint rewrite after it reads as an edited test.
 - **Call the runner directly:** a task runner that caches results or runs dependent packages' suites first breaks the one-file contract. A monorepo routes the path to the package and config owning it; an integration file gets the same environment setup the integration suite gets.
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero like a real failure. A red counts only when the named test ran and failed; green only when it ran and passed.
@@ -562,14 +562,16 @@ The merge gate shells out to `gh api` against the GitHub Actions REST surface. T
 
 ### Tier-3 fail-open advisory channel
 
-The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advisory, fail-open**: its CLI MUST exit 0 with a delta report on stdout (never non-zero), even on a known-holey fixture. A day-one blocking gate on a corpus that is 25-65% holey is noise that gets disabled, and once disabled it stays disabled (decision `384-tier3-promotion`). Promotion to a blocking gate is gated on one release of fail-open signal without muting — recorded in `docs/decisions.jsonl`, cross-linked from deferral `384-promote-status-hole-detector-from-advisory-to-gate`. The detector derives its expected step set from `.bkit/core/workflows/bkit-ship.md` (headings + `step:"ship-*"` literals), NEVER a hand-maintained table.
+The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advisory, fail-open**: its CLI MUST exit 0 with a delta report on stdout (never non-zero), even on a known-holey fixture. A day-one blocking gate on a corpus that is 25-65% holey is noise that gets disabled, and once disabled it stays disabled (decision `384-tier3-promotion`). Promotion to a blocking gate is gated on one release of fail-open signal without muting — recorded in `docs/decisions.jsonl`, cross-linked from deferral `384-promote-status-hole-detector-from-advisory-to-gate`. The check covers all five workflows (design, plan, build, debug, ship): it derives each workflow's expected steps and `"{BKIT}"` commands from `.bkit/core/workflows/bkit-{workflow}.md` at runtime, NEVER a hand-maintained table. Fixtures: a per-workflow corpus in `checks/status-holes.test.ts`, plus `tests/fixtures/status-holes/status.jsonl` (a closed design run with step holes) for the sweep-liveness bats case.
+
+Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256 of the workflow markdown text that produced it) and `parentSha` (the commit the run closed on). `bkit completeness check` takes no markdown path; it always reads the current `.bkit/core/workflows/bkit-{workflow}.md`. To replay against the markdown the verdict was made from, check out the row's `parentSha` in a scratch worktree (`git worktree add {tmp} {parentSha}`), build there, and run `pnpm bkit completeness check --workflow={workflow} --file={status.jsonl}`; a changed `sourceSha` on the current markdown means the current check no longer reads the same contract, so diff the verdicts with that in mind.
 
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub + `PATH` shim) | `bkit runs gate`: every exit code (0/2/10/11/12/13/14/15/16/17/20/80); `--validated` carry-forward; `--capstone-only` (red run with green capstone passes, capstone still running polls); full mode refuses a green run whose capstone concluded `cancelled` / `skipped` / `timed_out` / `neutral` / `action_required` / `stale` / `startup_failure` (12); override honoured-vs-ignored; config resolution; code 16 opt-in via `shipGateRequiredLanes`; `--event` filter. Also `runs mirror`, `runs wait`, `runs dispatch`, `runs declared` |
 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | Unit (markdown-invariant) | No `git add -A`; staging only through `bkit ledgers`; every status write targets `{STATUS}`; the merge pinned to the gate's head (`runs gate --pr` before `prs merge --match-head`); canonical 14 step keys; Step 2 runs `status path` after the `cd` into the worktree; pre-merge pushes confined to Step 2, B2 and Commit + Push Bookkeeping; no fence checks out or pushes `dev` by hand, `branches sync-dev` brings it level; Failure Path = one `workflows fail` + one `workflows handover --flush`; issue-less runs and the main guard — a ship of `dev` / `main` prints the engine refusal, releases the lock and stops, the naming warning fires when the branch lacks `{FID}` and `ISSUE_ID` is empty, the Step 10 label re-read and Step 14 label calls skip when `ISSUE_ID` is empty, and the MCP merge asserts base `dev` |
-| `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected set derived from source md (no parallel table); path-conditional sets; advisory exit 0 on holey fixture; invented names surface as delta |
+| `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected steps and commands derived from each of the five workflow mds (no parallel table); step / evidence / unexercised / unexpected classification; verdict metadata; advisory exit 0 on holey fixture; sweep summary line |
 
 ## Key test files
 
@@ -759,7 +761,7 @@ Any read-only filesystem invariant: step 6 = `fileUnchanged` (not mtime). `after
 `.github/workflows/bkit-ci.yml` is the template `.bkit/templates/.github/workflows/bkit-ci.yml` with the adaptations `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` lists. It runs a 5-job scaffold on every push to `dev` / `main` and PRs into them — a **flat DAG**: `bkit-tests-scope` fans out to every lane, the capstone joins them, so wall-clock == the slowest single lane. One run per branch or PR: a newer run cancels the older one on every event (template `concurrency`). bkit has no browser / DB / deploy, so there is no `bkit-tests-build` / `-e2e` / `-migration` / `-live`:
 
 1. **`bkit-tests-scope`** (always-on planner; no `if:`, never skips) — reads markers, computes `run_level` (`[skip ci]` → none, a hard veto over any force marker; `[force build]` / `[force full]` / PR / `workflow_dispatch` / push-to-`main` / direct `dev` push → full; merged-PR `dev` push → light; `commits/{sha}/pulls` API error → full, run-to-be-safe), emits the `bkit-test-plan` JSON via `steps.scope.outputs.plan` and a `$GITHUB_STEP_SUMMARY` table. Markers are read from the commit message (push) or the PR title (`pull_request`) only, so **none** of them apply on a `workflow_dispatch` — steer that path with workflow inputs (`deployments.md` § Commit-message force tags). It is the PLANNER, not a test lane, but it lives in the `bkit-tests-*` namespace, so any guard treating every `bkit-tests-*` job as a lane must exempt it BY NAME.
-2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a CLEAN tree (no test artifacts): `pnpm typecheck` → `pnpm lint` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm bkit check` (drift gate) → `pnpm bkit:check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit:audit:status` (Tier-3 status-hole detector over `docs/plans/*/logs/*/status.jsonl`). The status-hole step is the ONLY non-blocking step in this lane — the detector exits 0 even when it finds holes and the step appends `|| true`, so it can never fail `bkit-tests-static`. Keep it wired: promotion to a blocking gate is gated on accruing fail-open signal, which requires a live caller (contract: § Tier-3 fail-open advisory channel). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm lint:prose` guard-skips and the prose gate is silently dead. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning).
+2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a CLEAN tree (no test artifacts): `pnpm typecheck` → `pnpm lint` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm bkit check` (drift gate) → `pnpm bkit:check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit:audit:status` (Tier-3 run-completeness sweep over `docs/plans/*/logs/*/status.jsonl`). The sweep step is the lane's only non-blocking-on-holes step — the sweep exits 0 even when it finds holes (`|| true`), so a hole never fails `bkit-tests-static`; the step fails only when the sweep printed no `[bkit-status-holes] sweep:` summary line (a silent no-op), pinned by `tests/status-holes-sweep-liveness.bats`. Keep it wired: promotion to a blocking gate is gated on accruing fail-open signal, which requires a live caller (contract: § Tier-3 fail-open advisory channel). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm lint:prose` guard-skips and the prose gate is silently dead. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning).
 3. **`bkit-tests-unit`** (`if: run_level != 'none'`) — unit-test lane: installs `zsh` and `actionlint` (same SHA-pinned download as the static lane, put on `PATH`) so the tests that skip without them run, then runs `pnpm test:coverage:unit`, then the bats shell tier (`pnpm exec bats tests/*.bats` — the bkit-cloud-bootstrap gh preflight, the `gh` stub harness and the release-PR mirror script, logic vitest cannot reach because it lives in shell). The gate command itself lives in the `test:coverage:unit` **package.json script** — unit suite (`--exclude '**/*.integration.test.ts'`), `--coverage.include` scoped to the logic surface (the files its flags list plus every `.bkit/core/engine/commands/**/*.ts`; `install/modules/` is measured on the integration lane only), and `-c vitest.unit.config.ts`, which carries the branch-coverage floor `coverage.thresholds.branches` (currently `78`, set just below current and ratcheted up; it lives on the unit run only — vitest coverage is per-run, so a `vitest.config` block would gate both lanes). **SINGLE SOURCE:** `/bkit-build`'s pre-PR gate runs the SAME script, so a coverage drop fails in the worktree before this lane sees it — bump the floor in `vitest.unit.config.ts` and both callers move together. The CI step only appends the JSON reporter emitting `tests_ran`. `Report Unit Coverage` (`davelosert/vitest-coverage-report-action`, `vite-config-path: vitest.unit.config.ts`) runs on every event, including a red unit run, and writes the coverage table with the floor as its target to the job summary; it posts a `name: unit` PR comment on same-repo PRs only (fork PRs get `comment-on: none`, because the token is read-only). The action reads that file as raw text and regex-matches `<metric>: <number>`, so the floor stays on one unquoted line and no other metric name followed by a colon and a number appears in the file — a broken match drops the target silently while the gate keeps passing. Needs the job-level `permissions:` block (`contents: read` and `pull-requests: write`) — job-level permissions REPLACE the workflow-level block, so `contents: read` must be re-declared for the checkout. **`.bkit/core/engine/cli.ts` reads low on this gate on purpose** — `.bkit/core/engine/commands/install/install.integration.test.ts` spawns `tsx` dozens of times against its un-exported `main()` dispatch (real CLI process per scenario), which in-process v8 coverage cannot see; only the handful of pure decision functions pulled out of `main()` for direct unit testing (e.g. `validateModuleFlagsForVerb` in `cli.ts`, `validateCloudTrackerMatch` in `commands/install/install.ts`) register here. A low `cli.ts` % on this lane is a spawn-tested blind spot, not evidence of missing coverage: the integration lane's executed-count + the Consumer-runtime parity rule (below) are the CLI dispatch's real gate.
 4. **`bkit-tests-integration`** (`if: run_level != 'none'`) — integration-test lane (parallel sibling): installs `zsh` (the snippet tests skip without it), then `vitest run --coverage` over `*.integration.test.ts`, scoped via `--coverage.include` to the engine surface (`modules` / `install` / `upgrade` / `uninstall`), emitting its own `tests_ran`. **Report-only** (no threshold, because a whole-repo integration % is denominator-noise and punishes the pyramid shape); posts a `name: integration` coverage comment. A separate lane per tier — mirrors how consumer repos run it and dogfoods the shipped scaffold. Own job-level `permissions:`.
 5. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-tests-scope` succeeded and, when `run_level != none`, `bkit-tests-static` and `bkit-tests-unit` and `bkit-tests-integration` all succeeded **and unit and integration each executed > 0 tests** (per-lane `assert_ran` over each lane's `tests_ran`; `run_level=none` asserts nothing). This is the SOLE branch-protection required check (`bkit setup protect-main`, which requires `bkit.testing.ciCapstone` = `bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".
diff --git a/package.json b/package.json
index 58803965a..1cdbbb5b4 100644
--- a/package.json
+++ b/package.json
@@ -61,7 +61,7 @@
     "bkit:gate:install-static-unit-build": "pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build",
     "bkit:deps:outdated": "pnpm outdated",
     "bkit:deps:audit": "pnpm audit",
-    "bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\"",
+    "bkit:test:file": "bash scripts/ci/test-file.sh",
     "bkit:lint:file": "oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings",
     "bkit": "node dist/cli.js",
     "typecheck": "tsc --noEmit && pnpm bkit:typecheck:tests",
diff --git a/scripts/ci/test-file.sh b/scripts/ci/test-file.sh
new file mode 100755
index 000000000..3bfe89800
--- /dev/null
+++ b/scripts/ci/test-file.sh
@@ -0,0 +1,18 @@
+#!/usr/bin/env bash
+# bkit:test:file — run ONE test file and write a JUnit report to $BKIT_TEST_REPORT.
+# `*.bats` files run under bats; everything else runs under vitest.
+set -u
+file="${1:-}"
+case "$file" in
+*.bats)
+  dir="$(mktemp -d)"
+  pnpm exec bats --report-formatter junit --output "$dir" "$file"
+  code=$?
+  [ -f "$dir/report.xml" ] && cp "$dir/report.xml" "$BKIT_TEST_REPORT"
+  rm -rf "$dir"
+  exit "$code"
+  ;;
+*)
+  exec pnpm exec vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" "$@"
+  ;;
+esac
diff --git a/tests/fixtures/status-holes/status.jsonl b/tests/fixtures/status-holes/status.jsonl
new file mode 100644
index 000000000..6015d7d13
--- /dev/null
+++ b/tests/fixtures/status-holes/status.jsonl
@@ -0,0 +1,5 @@
+{"type":"workflow-started","workflow":"design","at":"2026-10-26T03:33:25Z","parentSha":"471abbc369f348a12cbc6c1a6a0907e698cca328"}
+{"type":"runtime-resolved","workflow":"design","at":"2026-10-26T03:33:27Z","runtime":"LOCAL","runtimeWorktrees":true,"runtimeDevPushes":true,"runtimeGithubCli":true,"runtimeGithubCliExit":0,"runtimeGithubCliErr":"","baseSha":"471abbc369f348a12cbc6c1a6a0907e698cca328"}
+{"type":"step-done","workflow":"design","step":"design-start-workflow","status":"DONE","at":"2026-10-26T03:33:30Z","parentSha":"471abbc369f348a12cbc6c1a6a0907e698cca328","artifacts":[]}
+{"type":"engine-action","action":"comment","key":"design/1/design-worktree-setup/-/-/comment","hash":"fa869881a101902e07b24dbd132d2c5c126e95f731cb6f394d934443c698b8ac","ref":"https://github.com/cbartens/bkit/issues/699#issuecomment-6407618124","at":"2026-10-26T03:33:31Z"}
+{"type":"step-done","workflow":"design","step":"design-close-workflow","status":"DONE","at":"2026-10-26T03:40:00Z","parentSha":"471abbc369f348a12cbc6c1a6a0907e698cca328","artifacts":[]}
diff --git a/tests/status-holes-sweep-liveness.bats b/tests/status-holes-sweep-liveness.bats
new file mode 100644
index 000000000..4b01e4c45
--- /dev/null
+++ b/tests/status-holes-sweep-liveness.bats
@@ -0,0 +1,30 @@
+#!/usr/bin/env bats
+# tests/status-holes-sweep-liveness.bats — the CI "Check Status Holes" step greps the sweep's
+# summary line so a silent no-op reds the lane while a hole does not (#699).
+# Corpus: tests/fixtures/status-holes/status.jsonl (a closed design run with step holes).
+
+REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
+
+# The literal the lane's `grep -qF` names, read from the workflow file itself.
+lane_pattern() {
+  grep -o "grep -qF '[^']*'" "$REPO_ROOT/.github/workflows/bkit-ci.yml" | head -1 | sed "s/^grep -qF '//; s/'\$//"
+}
+
+@test "the sweep prints the summary line the lane greps for" {
+  pattern="$(lane_pattern)"
+  [ "$pattern" = "[bkit-status-holes] sweep:" ]
+  run bash -c "cd '$REPO_ROOT' && pnpm exec tsx .bkit/core/engine/checks/status-holes.ts tests/fixtures/status-holes/status.jsonl"
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"$pattern"* ]]
+  echo "$output" | grep -qE '^\[bkit-status-holes\] sweep: [0-9]+ file\(s\), [0-9]+ holey$'
+  echo "$output" | grep -qF 'sweep: 1 file(s), 1 holey'
+}
+
+@test "the lane's grep pattern rejects output without the summary line" {
+  pattern="$(lane_pattern)"
+  [ -n "$pattern" ]
+  out="$BATS_TEST_TMPDIR/no-summary.txt"
+  printf '[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)\n  missing: x\n' > "$out"
+  run grep -qF "$pattern" "$out"
+  [ "$status" -ne 0 ]
+}
