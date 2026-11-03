diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
index dd40180c3..9df5e93bf 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
@@ -75,7 +75,7 @@ tools:
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.bkit/core/.bkit/install.md b/.bkit/core/.bkit/install.md
index 74383f1c4..60e15b8b2 100644
--- a/.bkit/core/.bkit/install.md
+++ b/.bkit/core/.bkit/install.md
@@ -259,10 +259,10 @@ After the writes, bkit re-runs the credential and environment checks, because so
 | `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloud.agent`). `none` (undecided) nudges `bkit install --auto=<variant>`, except under the jira tracker (local runs only); `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
 | `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
 | `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `BKIT_OPENROUTER_API_KEY`; `BKIT_OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all four providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
-| `vale-not-installed` | `lint:prose` runs `bkit ci prose` but vale is not on PATH, so the prose gate fails |
+| `vale-not-installed` | `bkit:lint:prose` runs `bkit ci prose` but vale is not on PATH, so the prose gate fails |
 | `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
 | `gate-missing-called-scripts` | A `bkit:gate:*` script still at bkit's default chains a script `package.json` does not declare (e.g. `typecheck`, `format:check`, `test`). Add it (`.bkit/templates.md` lists the tool scripts and devDeps) or rewrite the gate. |
-| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
+| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `bkit:lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
 | `gate-noop` | A `bkit:gate:*` script is empty or cannot fail (`true`, `:`, `exit 0`, `echo …`), so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on every branch. Point it at real checks, or delete it and run `bkit upgrade` to restore bkit's default. |
 | `gate-tier-not-wired` | `package.json` declares a deeper test tier (`test:integration`, `test:e2e`, `test:live`) that no `bkit:gate:*` script runs; the advisory prints the gate line to add. |
 | `test-file-script-missing` | `package.json` does not declare `bkit:test:file`, so `/bkit-build` reports test-first as not enforced. The advisory prints the script contract and a Vitest line. |
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 562ceaec8..cc3b7145d 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -84,8 +84,8 @@ Placeholders: the copies keep them raw, so replace each one in your copy:
 | `{{PRODUCTION_URL}}` | `bkit-health.yml` (`env.PRODUCTION_URL`) | the origin production serves | `https://example.com` |
 | `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
 | `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
-| `{{SCRIPT_PATH}}` | `ai.bkit.launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
-| `{{ENV_FILE}}` | `ai.bkit.launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
+| `{{SCRIPT_PATH}}` | `bkit-launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
+| `{{ENV_FILE}}` | `bkit-launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |
 
 - `bkit install` / `bkit upgrade` refresh `.bkit/templates/` to the package's templates, unsubstituted. `bkit check` fails on a stale copy. `bkit uninstall` removes the folder, never an adopted copy.
 - **What changed on upgrade.** `bkit upgrade` lists the changed, added and removed template paths. For each one you adopted, run `diff .bkit/templates/<path> <path>`, and merge what you want. The placeholder lines differ by design. `git diff .bkit/templates` in the upgrade commit shows the package change.
@@ -161,8 +161,8 @@ bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names, and adds each one only

<!-- prettier-ignore -->
 | Gate (default) | Chains | Needs |
 | --- | --- | --- |
 | `bkit:gate:format` | `pnpm lint-staged` | lint-staged devDep + `.lintstagedrc.json` + prettier |
-| `bkit:gate:min` | `format:check`, `lint:prose`, `slop:delta` | the scripts below + any test reading a min-push file |
-| `bkit:gate:static` | `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` | the scripts below |
+| `bkit:gate:min` | `format:check`, `bkit:lint:prose`, `bkit:slop:delta` | the scripts below + any test reading a min-push file |
+| `bkit:gate:static` | `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` | the scripts below |
 | `bkit:gate:static-unit` | `bkit:gate:static` + `test` | a `test` script |
 | `bkit:gate:install-static-unit-build` | `pnpm install --frozen-lockfile` + `bkit:gate:static-unit` + `build` | a `build` script |
 
@@ -171,9 +171,9 @@ bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names, and adds each one only
   "typecheck": "tsc --noEmit",
   "lint": "oxlint -c .oxlintrc.json --type-aware --deny-warnings",
   "format:check": "prettier --check .",
-  "lint:prose": "bkit ci prose",
+  "bkit:lint:prose": "bkit ci prose",
   "lint:slop": "slop-scan scan .",
-  "slop:delta": "bkit ci slop",
+  "bkit:slop:delta": "bkit ci slop",
   "prepare": "husky"
 }
 ```
@@ -186,8 +186,8 @@ pnpm add -D prettier@^3.5.3 slop-scan@^0.3.0 lint-staged@^17.0.0 husky@^9.1.7
 - The value above runs the Oxlint test rules (§ Oxlint) and fails on any hit. It needs `oxlint` and `oxlint-tsgolint`, and fails loudly without them.
 - **If** you have your own linter → chain both: `<your linter> && oxlint -c .oxlintrc.json --type-aware --deny-warnings`.
 - **If** there is no `tsconfig.json` → use `"typecheck": "echo \"[bkit] typecheck: no tsconfig.json — skipping\" >&2"`.
-- `slop:delta` runs `bkit ci slop` (the bkit devDep is on `PATH` through the package script). CI passes the base sha as its one bare argument.
-- `lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with the repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), for example `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
+- `bkit:slop:delta` runs `bkit ci slop` (the bkit devDep is on `PATH` through the package script). CI passes the base sha as its one bare argument.
+- `bkit:lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with the repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), for example `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
 - **If** the stack is not Node → point each gate at your own commands, and keep the gate names.
 - `bkit:test:file` runs one test file and writes a JUnit report to `$BKIT_TEST_REPORT`. bkit appends the file's repo-relative path. `/bkit-build` reads the report for test-first. It is not seeded, and `test-file-script-missing` fires until it is declared.
   - Vitest: `"bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""`.
@@ -223,7 +223,7 @@ Setup:
   - **If** you rename the job → set `bkit.testing.ciCapstone`.
 - Adopt a scaffold lane only when its tier exists (`docs/testing.md`). Each `# bkit-stub:<id> —` header raises an install advisory until you enable or delete that stub.
 - Keep the `name: bkit-ci` line, or rename `workflows: [bkit-ci]` in `bkit-cloud.yml` and `bkit-health.yml` and set `bkit.testing.ciWorkflow` to the new file name.
-- Keep `fetch-depth: 0` on the static lane, because `slop:delta` checks the PR base out as a worktree.
+- Keep `fetch-depth: 0` on the static lane, because `bkit:slop:delta` checks the PR base out as a worktree.
 - **If** CI script copies are named without the `bkit-` prefix (`check-capstone.mjs`, `accepted-advisories.json`, …) → the `bkit check` advisory `ci-scripts-old-names` lists each rename.
   - Rename a file and its paths in `.github/workflows/*.yml`, `.husky/pre-push` and `scripts/ci/` in one commit, because the `Check Dependency Audit` step is guarded by `hashFiles` and skips silently when only the file moved.
 
@@ -330,7 +330,7 @@ pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
 
 ## Vale — prose lint, with House styles
 
-`lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
+`bkit:lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.
 
 ```bash
 brew install vale
@@ -343,13 +343,13 @@ vale sync
 - Cursor: the `Dockerfile` template installs it.
 - Adapt: add `[glob]` scope blocks for your own docs. Turn rules off per path, not globally.
 - Traps:
-  - **If** Vale is not on `PATH` → `lint:prose` fails, so a push from a machine without Vale stops at pre-push. Install Vale there.
-  - A missing `write-good` is copied from the main worktree, else `vale sync` runs. When both fail, `lint:prose` fails.
+  - **If** Vale is not on `PATH` → `bkit:lint:prose` fails, so a push from a machine without Vale stops at pre-push. Install Vale there.
+  - A missing `write-good` is copied from the main worktree, else `vale sync` runs. When both fail, `bkit:lint:prose` fails.
   - Keep the `.bkit/templates/**` block, which turns rules off for the copies.
 
 ## slop-scan — `slop-scan.config.json`
 
-`lint:slop` reports. `slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. The base is `--base` / the bare argument, else `$SLOP_BASE_REF`, else the merge-base with `origin/dev` (else `origin/main`). CI passes its planner base, and pre-push on a `dev` push exports the same base as `SLOP_BASE_REF` (§ Git hooks), so both compare against the last green CI push run. On failure it logs each net-new / worsened finding (`path:line`, rule, message; line shifts dropped) and emits them as `findings`. Reference: https://github.com/benvinegar/slop-scan.
+`lint:slop` reports. `bkit:slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. The base is `--base` / the bare argument, else `$SLOP_BASE_REF`, else the merge-base with `origin/dev` (else `origin/main`). CI passes its planner base, and pre-push on a `dev` push exports the same base as `SLOP_BASE_REF` (§ Git hooks), so both compare against the last green CI push run. On failure it logs each net-new / worsened finding (`path:line`, rule, message; line shifts dropped) and emits them as `findings`. Reference: https://github.com/benvinegar/slop-scan.
 
 ```bash
 pnpm add -D slop-scan@^0.3.0
@@ -420,17 +420,17 @@ Dock / Spotlight launches start under `launchd`, which never runs the login shel
 | File | Copy from | To | Commit |
 | --- | --- | --- | --- |
 | Loader | `.bkit/templates/scripts/launchd/bkit-launchd-env.sh` | `scripts/launchd/bkit-launchd-env.sh` | that file |
-| LaunchAgent | `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` | `~/Library/LaunchAgents/ai.bkit.launchd.plist` | never (machine-local) |
-| Tokens | `.bkit/templates/scripts/launchd/launchd.env.example` | `~/.config/bkit/launchd.env` | never (machine-local) |
+| LaunchAgent | `.bkit/templates/scripts/launchd/bkit-launchd.plist` | `~/Library/LaunchAgents/ai.bkit.launchd.plist` | never (machine-local) |
+| Tokens | `.bkit/templates/scripts/launchd/bkit-launchd.env.example` | `~/.config/bkit/launchd.env` | never (machine-local) |
 
 ```bash
 cp .bkit/templates/scripts/launchd/bkit-launchd-env.sh scripts/launchd/
 chmod +x scripts/launchd/bkit-launchd-env.sh
 mkdir -p ~/.config/bkit
-cp .bkit/templates/scripts/launchd/launchd.env.example ~/.config/bkit/launchd.env
+cp .bkit/templates/scripts/launchd/bkit-launchd.env.example ~/.config/bkit/launchd.env
 chmod 600 ~/.config/bkit/launchd.env     # tokens stay owner-only
 # fill in the tokens, then place the agent:
-cp .bkit/templates/scripts/launchd/ai.bkit.launchd.plist ~/Library/LaunchAgents/
+cp .bkit/templates/scripts/launchd/bkit-launchd.plist ~/Library/LaunchAgents/ai.bkit.launchd.plist
 # replace {{SCRIPT_PATH}} and {{ENV_FILE}} with absolute paths in the copied plist
 launchctl bootout gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist 2>/dev/null || true
 launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist
@@ -634,15 +634,15 @@ The PyPI name is `graphifyy`, and the CLI is `graphify`. `[sql]` adds `.sql` fil
 
 ```json
 {
-  "graph": "bash scripts/graphify/bkit-graphify.sh build",
-  "graph:check": "bash scripts/graphify/bkit-graphify.sh check",
-  "graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
-  "graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
-  "graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
-  "graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
-  "graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
-  "graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
-  "graph:update": "bash scripts/graphify/bkit-graphify.sh update"
+  "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
+  "bkit:graph:check": "bash scripts/graphify/bkit-graphify.sh check",
+  "bkit:graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
+  "bkit:graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
+  "bkit:graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
+  "bkit:graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
+  "bkit:graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
+  "bkit:graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
+  "bkit:graph:update": "bash scripts/graphify/bkit-graphify.sh update"
 }
 ```
 
@@ -676,25 +676,25 @@ graphify-out/
 <!-- prettier-ignore -->
 | Command | Does |
 | --- | --- |
-| `pnpm graph` | Extract + cluster. Local. No API key. |
-| `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
-| `pnpm graph:update` | Re-extract changed files, then recluster. |
-| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
-| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
+| `pnpm bkit:graph` | Extract + cluster. Local. No API key. |
+| `pnpm bkit:graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
+| `pnpm bkit:graph:update` | Re-extract changed files, then recluster. |
+| `pnpm bkit:graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
+| `pnpm bkit:graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
 | `bash scripts/graphify/bkit-graphify.sh check-at <rev>` | `check` in a throwaway checkout of `<rev>` (default HEAD); pre-push gate runs it on the commit pushed to dev. |
-| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md`. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
-| `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
-| `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |
+| `pnpm bkit:graph:refresh` | Rebuild register in a throwaway checkout of the staged files (the index) → copy over `docs/capabilities.md`. Stage the change first, so a run before its commit builds the new state. Fixes a red gate; commit result. |
+| `pnpm bkit:graph:scoped [path]` | One subtree. Default `apps/web/src`. |
+| `pnpm bkit:graph:graphml` | Opt-in GraphML for Gephi / yEd. |
 
 - `docs/graphify-out/` holds the raw `graph.json`, and `docs/graphify-out/reports/` holds the derived views.
-- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before the first rollup, because the Overrides block must exist. `pnpm graph:rollup` rewrites it after that.
+- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before the first rollup, because the Overrides block must exist. `pnpm bkit:graph:rollup` rewrites it after that.
 - To add a capability, add a rule in `bkit-graph-drift-rules.json`: lane, owner module, one literal marker. The shipped rules JSON has one example row. Replace it.
 - The marker is a literal that only the owner should contain (a host, a header, a marker string). Never use the owner's exported function name, because every legitimate caller then reads as `bypassed`.
 
 `MMD_MIN_WEIGHT` (default 12, set in `bkit-graphify.sh`) drops light edges from the Mermaid views (`.mmd` files and the diagrams in `docs/capabilities.md`).
 
 - **If** the repo has one module per file → edges are thinner, so lower the default in your copy.
-- An env override changes `docs/capabilities.md` per shell, and fails `pnpm graph:check`.
+- An env override changes `docs/capabilities.md` per shell, and fails `pnpm bkit:graph:check`.
 
 Iterate in mermaid.live, and render the internal-architecture diagram locally:
 
@@ -703,7 +703,7 @@ npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -
 ```
 
 - `bkit-graph-repair.py` runs between extract and cluster. It restores `.js` specifiers that point at `.tsx` files, and workspace subpaths through an `exports` map.
-  - A bare `graphify update` drops that injection, and `pnpm graph:update` restores it.
+  - A bare `graphify update` drops that injection, and `pnpm bkit:graph:update` restores it.
   - `bkit-graph-eager.py` and `bkit-graphify-rollup.py` re-derive those imports from source, and warn with the count that graph.json lacks.
   - Two files that import each other keep one link after clustering, so that pair never reads as missing.
 - `bkit-graph-surface.py` is the route layer. It assumes `apps/web` / `apps/mobile` page routes, `packages/api/src/v1.ts` and the workspace scope `@scope/services/`.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 146ebb329..742d6280b 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1470,8 +1470,8 @@ Each gate is the previous gate plus its own tier, so the name and the value desc
 | Gate | Seeded default | Called by |
 | --- | --- | --- |
 | `bkit:gate:format` | `pnpm lint-staged` | `.husky/pre-commit` |
-| `bkit:gate:min` | `pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `.husky/pre-push` on a min push |
-| `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
+| `bkit:gate:min` | `pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `.husky/pre-push` on a min push |
+| `bkit:gate:static` | `pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta` | `@bkit-build-plan-tasks` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared), `.husky/pre-push` revert path |
 | `bkit:gate:static-unit` | `pnpm bkit:gate:static && pnpm test` | build Step 8 (group gate), build Step 12 and `.husky/pre-push` (no integration gate declared); `@bkit-build-plan-gaps-remediate`, `@bkit-build-plan-verify` and `@bkit-debug-failure-remediate` (through `bkit tests changed`, when `bkit:gate:changed` is undeclared) |
 | `bkit:gate:static-unit-integration` | not seeded — `pnpm bkit:gate:static-unit && pnpm test:integration` | build Step 12, debug Step 3, `.husky/pre-push` |
 | `bkit:gate:static-unit-integration-e2e` | not seeded — chains the gate above | debug Step 3 |
@@ -1506,7 +1506,7 @@ Not seeded, because finding the tests a file affects is the stack's job; the `ga
 
 Agents and humans run the same scripts, so a green agent gate and a green `git push` mean the same thing. `bkit-ci.yml` deliberately stays off them: it needs per-step reporting, affected-package conditionals, and the heavier tiers the local gate excludes, so it calls `pnpm typecheck` / `pnpm test` / … directly.
 
-`lint:slop` is in no gate, because `slop-scan scan` is report-only and never fails; `slop:delta` (`bkit ci slop`) is the enforcing gate. `bkit check` (mirror drift) sits in `.husky/pre-push` outside the gates: it validates the bkit install, not consumer source. `lint:prose` (`bkit ci prose`) scans a whole-repo file set, so it gates at pre-push, not pre-commit.
+`lint:slop` is in no gate, because `slop-scan scan` is report-only and never fails; `bkit:slop:delta` (`bkit ci slop`) is the enforcing gate. `bkit check` (mirror drift) sits in `.husky/pre-push` outside the gates: it validates the bkit install, not consumer source. `bkit:lint:prose` (`bkit ci prose`) scans a whole-repo file set, so it gates at pre-push, not pre-commit.
 
 The three deep gates are not seeded: a seeded `pnpm test:integration` hard-fails every repo without that tier, and a gate named `…-integration-e2e` that skipped them silently is the false-green this design exists to kill. Declaring one — a single line chaining its parent — is how a consumer opts a workflow into a deeper tier.
 
@@ -1550,8 +1550,8 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that a file that fails to load with no case of its own in the report is `red-not-loaded`: the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A test whose name no line carries (`block` null), and rows written before per-test locking, fall back to the whole-file blob.
-- **Literal names:** the lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Literal names:** the lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 5) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 25) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). A group is one tests agent's work and then one code agent's work, so the code agent spends no turns on tests and a group carries more tasks than one agent writing both could; a bigger group still overflows a context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-tests, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
diff --git a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
index 781ad8039..baff5a969 100644
--- a/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
+++ b/.bkit/core/engine/audits/repo/dogfood-templates.test.ts
@@ -177,7 +177,7 @@ const ADOPTED: Record<string, Entry> = {
           "        if: github.event_name == 'pull_request'\n" +
           "        env:\n" +
           "          BASE_SHA: ${{ github.event.pull_request.base.sha }}\n" +
-          '        run: pnpm slop:delta "$BASE_SHA"\n',
+          '        run: pnpm bkit:slop:delta "$BASE_SHA"\n',
         with:
           "      # The ENFORCING slop gate (lint:slop above is an advisory full-scan that never fails).\n" +
           "      # Runs on every event against the planner's base — a PR's base branch, or a push's last\n" +
@@ -191,7 +191,7 @@ const ADOPTED: Record<string, Entry> = {
           '            echo "::notice::no diff base resolved — skipping slop delta"\n' +
           "            exit 0\n" +
           "          fi\n" +
-          '          pnpm slop:delta "$BASE_SHA"\n',
+          '          pnpm bkit:slop:delta "$BASE_SHA"\n',
       },
       {
         kind: "bkit-only",
@@ -460,7 +460,7 @@ const ADOPTED: Record<string, Entry> = {
       },
     ],
   },
-  "docs/capabilities.md": { status: "generated", what: "pnpm graph:rollup writes it" },
+  "docs/capabilities.md": { status: "generated", what: "pnpm bkit:graph:rollup writes it" },
   "scripts/graphify/bkit-graph-drift-rules.json": {
     status: "adopted",
     edits: [
@@ -638,11 +638,11 @@ const ADOPTED: Record<string, Entry> = {
   "scripts/serena/bkit-serena-mcp.sh": identical,
   "scripts/serena/bkit-serena.mcp.json": identical,
   "scripts/launchd/bkit-launchd-env.sh": identical,
-  "scripts/launchd/ai.bkit.launchd.plist": {
+  "scripts/launchd/bkit-launchd.plist": {
     status: "not-adopted",
     what: "machine-local LaunchAgent plist lives in ~/Library/LaunchAgents/",
   },
-  "scripts/launchd/launchd.env.example": {
+  "scripts/launchd/bkit-launchd.env.example": {
     status: "not-adopted",
     what: "machine-local secrets env file lives in ~/.config/bkit/launchd.env",
   },
@@ -745,7 +745,14 @@ describe("this repo adopts its own templates", () => {
     expect(fs.existsSync(copyPathOf(rel)), rel).toBe(true);
   });
 
-  it.each(entriesWith("adopted"))("%s", (rel, entry) => {
+  /** Adopted files whose copy is also pinned to carry no unprefixed `pnpm graph` hint (#748). */
+  const GRAPHIFY_BRANDED = [
+    "scripts/graphify/bkit-graphify.sh",
+    "scripts/graphify/bkit-graphify-rollup.py",
+  ];
+  const UNPREFIXED_GRAPH = /pnpm graph(?!ify)/;
+
+  function expectCopyMatchesTemplate(rel: string, entry: Extract<Entry, { status: "adopted" }>) {
     const copyPath = copyPathOf(rel);
     expect(fs.existsSync(copyPath), rel).toBe(true);
     const template = fs.readFileSync(path.join(templatesRoot, rel), "utf-8");
@@ -753,5 +760,42 @@ describe("this repo adopts its own templates", () => {
     const applied = apply(template, copy, entry.edits, rel);
     expect(applied.problems).toEqual([]);
     expect(copy).toBe(applied.text);
+    return { template, copy };
+  }
+
+  it.each(entriesWith("adopted").filter(([rel]) => !GRAPHIFY_BRANDED.includes(rel)))(
+    "%s",
+    (rel, entry) => {
+      const { copy } = expectCopyMatchesTemplate(rel, entry);
+      expect(copy.length).toBeGreaterThan(0);
+    },
+  );
+
+  it("scripts/graphify/bkit-graphify.sh", () => {
+    const entry = ADOPTED["scripts/graphify/bkit-graphify.sh"] as Extract<
+      Entry,
+      { status: "adopted" }
+    >;
+    const { template, copy } = expectCopyMatchesTemplate(
+      "scripts/graphify/bkit-graphify.sh",
+      entry,
+    );
+    expect(template).not.toMatch(UNPREFIXED_GRAPH);
+    expect(copy).not.toMatch(UNPREFIXED_GRAPH);
+    expect(copy).toContain("pnpm bkit:graph");
+  });
+
+  it("scripts/graphify/bkit-graphify-rollup.py", () => {
+    const entry = ADOPTED["scripts/graphify/bkit-graphify-rollup.py"] as Extract<
+      Entry,
+      { status: "adopted" }
+    >;
+    const { template, copy } = expectCopyMatchesTemplate(
+      "scripts/graphify/bkit-graphify-rollup.py",
+      entry,
+    );
+    expect(template).not.toMatch(UNPREFIXED_GRAPH);
+    expect(copy).not.toMatch(UNPREFIXED_GRAPH);
+    expect(copy).toContain("pnpm bkit:graph:refresh");
   });
 });
diff --git a/.bkit/core/engine/audits/repo/release-workflow.test.ts b/.bkit/core/engine/audits/repo/release-workflow.test.ts
index ea2eeffbf..8ec138973 100644
--- a/.bkit/core/engine/audits/repo/release-workflow.test.ts
+++ b/.bkit/core/engine/audits/repo/release-workflow.test.ts
@@ -154,7 +154,7 @@ describe("release.yml structural assertions (BAR-138)", () => {
       "pnpm typecheck",
       "pnpm test",
       "pnpm format:check",
-      "pnpm lint:prose",
+      "pnpm bkit:lint:prose",
       "pnpm lint:slop",
     ]) {
       expect(content, step).not.toContain(step);
diff --git a/.bkit/core/engine/audits/templates/branding.test.ts b/.bkit/core/engine/audits/templates/branding.test.ts
new file mode 100644
index 000000000..dbbd7a858
--- /dev/null
+++ b/.bkit/core/engine/audits/templates/branding.test.ts
@@ -0,0 +1,79 @@
+// audits/templates/branding.test.ts — every name a consumer types or sees carries the bkit
+// brand (#748). The checks are pure functions over text and paths, so each rule also runs on a
+// seeded negative.
+
+import * as fs from "node:fs";
+import * as path from "node:path";
+import { describe, expect, it } from "vitest";
+import { listFilesRecursive } from "../../install/template-copies";
+import { getBkitDocsRoot } from "../../shared/package-roots";
+
+const PREFIX = "bkit-";
+const SCRIPT_PREFIX = "bkit:";
+
+/** Every `package.json` scripts block in the json fences of `templates.md`, merged. */
+function scriptsInJsonBlocks(doc: string): Record<string, string> {
+  const merged: Record<string, string> = {};
+  for (const m of doc.matchAll(/```json\n([\s\S]*?)\n```/g)) {
+    let parsed: unknown;
+    try {
+      parsed = JSON.parse(m[1] ?? "");
+    } catch {
+      continue;
+    }
+    if (parsed === null || typeof parsed !== "object") continue;
+    for (const [name, value] of Object.entries(parsed as Record<string, unknown>)) {
+      if (typeof value === "string") merged[name] = value;
+    }
+  }
+  return merged;
+}
+
+/** Whether a script value runs bkit code: the `bkit` CLI or a shipped `scripts/<dir>/bkit-*` file. */
+function runsBkitCode(value: string): boolean {
+  return /^bkit\s/.test(value) || /scripts\/[\w-]+\/bkit-/.test(value);
+}
+
+/** Script names whose value runs bkit code and which lack the `bkit:` prefix. */
+function unprefixedScriptNames(scripts: Record<string, string>): string[] {
+  return Object.entries(scripts)
+    .filter(([name, value]) => runsBkitCode(value) && !name.startsWith(SCRIPT_PREFIX))
+    .map(([name]) => name);
+}
+
+/** Template files (relative to a root dir) whose base name lacks `bkit-`. */
+function unprefixedFileNames(relPaths: string[]): string[] {
+  return relPaths.filter((rel) => !path.basename(rel).startsWith(PREFIX));
+}
+
+describe("consumer-facing names carry the bkit prefix", () => {
+  const doc = fs.readFileSync(path.join(getBkitDocsRoot(), "templates.md"), "utf-8");
+  const templatesRoot = path.resolve(".bkit/templates");
+
+  it("template script names that run bkit code", () => {
+    const scripts = scriptsInJsonBlocks(doc);
+    expect(Object.keys(scripts).length).toBeGreaterThan(0);
+    expect(unprefixedScriptNames(scripts)).toEqual([]);
+  });
+
+  it("flags a seeded unprefixed script name that runs bkit code", () => {
+    const seeded = {
+      graph: "bash scripts/graphify/bkit-graphify.sh build",
+      "lint:prose": "bkit ci prose",
+      "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
+      typecheck: "tsc --noEmit",
+    };
+    expect(unprefixedScriptNames(seeded)).toEqual(["graph", "lint:prose"]);
+  });
+
+  it("template file names", () => {
+    const rels = ["scripts", "context"].flatMap((dir) =>
+      listFilesRecursive(path.join(templatesRoot, dir)).map((abs) =>
+        path.relative(templatesRoot, abs),
+      ),
+    );
+    expect(rels.length).toBeGreaterThan(0);
+    expect(unprefixedFileNames(rels)).toEqual([]);
+    expect(unprefixedFileNames([...rels, "scripts/foo.sh"])).toEqual(["scripts/foo.sh"]);
+  });
+});
diff --git a/.bkit/core/engine/audits/templates/template-ci-yml.test.ts b/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
index 941afcbd7..dd5e16898 100644
--- a/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
+++ b/.bkit/core/engine/audits/templates/template-ci-yml.test.ts
@@ -114,7 +114,13 @@ describe("template bkit-tests-static job matches the bkit:gate:static local gate
     !(part in GATE_PARTS_ABSENT_FROM_CI) && !runsScript(runs, part);
 
   it("reads the gate as a chain of pnpm scripts", () => {
-    expect(gateParts).toEqual(["typecheck", "lint", "format:check", "lint:prose", "slop:delta"]);
+    expect(gateParts).toEqual([
+      "typecheck",
+      "lint",
+      "format:check",
+      "bkit:lint:prose",
+      "bkit:slop:delta",
+    ]);
   });
 
   it("runs every part of the local static gate as a step, bar the named exceptions", () => {
diff --git a/.bkit/core/engine/audits/templates/templates-content.test.ts b/.bkit/core/engine/audits/templates/templates-content.test.ts
index 7d301b672..8edd117aa 100644
--- a/.bkit/core/engine/audits/templates/templates-content.test.ts
+++ b/.bkit/core/engine/audits/templates/templates-content.test.ts
@@ -746,8 +746,8 @@ describe("templates", () => {
 
 describe("launchd GUI-env templates (.bkit/templates/scripts/launchd/)", () => {
   const SCRIPT = path.resolve(".bkit/templates/scripts/launchd/bkit-launchd-env.sh");
-  const PLIST = path.resolve(".bkit/templates/scripts/launchd/ai.bkit.launchd.plist");
-  const ENV_EXAMPLE = path.resolve(".bkit/templates/scripts/launchd/launchd.env.example");
+  const PLIST = path.resolve(".bkit/templates/scripts/launchd/bkit-launchd.plist");
+  const ENV_EXAMPLE = path.resolve(".bkit/templates/scripts/launchd/bkit-launchd.env.example");
 
   it("ships the loader, the LaunchAgent plist and the env example", () => {
     expect(fs.existsSync(SCRIPT)).toBe(true);
@@ -785,7 +785,7 @@ describe("launchd GUI-env templates (.bkit/templates/scripts/launchd/)", () => {
     });
   });
 
-  describe("ai.bkit.launchd.plist", () => {
+  describe("bkit-launchd.plist", () => {
     const content = fs.readFileSync(PLIST, "utf-8");
 
     it("is a LaunchAgent that loads at login and re-runs on env-file writes", () => {
@@ -802,7 +802,7 @@ describe("launchd GUI-env templates (.bkit/templates/scripts/launchd/)", () => {
     });
   });
 
-  describe("launchd.env.example", () => {
+  describe("bkit-launchd.env.example", () => {
     const content = fs.readFileSync(ENV_EXAMPLE, "utf-8");
 
     it("ships example BKIT_ token keys with empty values", () => {
@@ -819,8 +819,19 @@ describe(".bkit/templates.md gate tool scripts (consumers copy and run them)", (
   const block = /```json\n([\s\S]*?)\n```/.exec(section);
   const scripts = JSON.parse(block?.[1] ?? "{}") as Record<string, string>;
 
-  it("lists slop:delta as the bkit ci slop verb", () => {
-    expect(scripts["slop:delta"]).toBe("bkit ci slop");
+  it("lists bkit:slop:delta as the bkit ci slop verb", () => {
+    expect(scripts["bkit:slop:delta"]).toBe("bkit ci slop");
+  });
+
+  const graphSection = doc.slice(doc.indexOf("## graphify"));
+  const graphBlock = /```json\n([\s\S]*?)\n```/.exec(graphSection);
+  const graphScripts = JSON.parse(graphBlock?.[1] ?? "{}") as Record<string, string>;
+
+  it("lists the graphify scripts under bkit:graph names", () => {
+    const names = Object.keys(graphScripts).filter((k) => /^(bkit:)?graph(:|$)/.test(k));
+    expect(names).toContain("bkit:graph");
+    expect(names).toContain("bkit:graph:check");
+    expect(names.filter((k) => !k.startsWith("bkit:"))).toEqual([]);
   });
 
   it("lists a lint value that runs Oxlint type-aware with the shipped config and fails on any hit", () => {
diff --git a/.bkit/core/engine/checks/after/index.test.ts b/.bkit/core/engine/checks/after/index.test.ts
index d74829196..a8051cc69 100644
--- a/.bkit/core/engine/checks/after/index.test.ts
+++ b/.bkit/core/engine/checks/after/index.test.ts
@@ -178,9 +178,9 @@ describe("renderAdvisoriesMarkdown", () => {
     expect(md).not.toContain("INSTRUCTIONS FOR AN AI AGENT");
   });
 
-  it("starts with a Vale whole-file skip marker — generated artifact must not fail consumer lint:prose", () => {
+  it("starts with a Vale whole-file skip marker — generated artifact must not fail consumer bkit:lint:prose", () => {
     // Empty and populated render paths must both lead with the marker, since the
-    // gitignored artifact is linted on-disk by the shipped lint:prose glob.
+    // gitignored artifact is linted on-disk by the shipped bkit:lint:prose glob.
     const empty = renderAdvisoriesMarkdown([], {
       mode: "check",
       version: "2.8.2",
diff --git a/.bkit/core/engine/checks/after/index.ts b/.bkit/core/engine/checks/after/index.ts
index 95d122bdf..7e4c8dcf5 100644
--- a/.bkit/core/engine/checks/after/index.ts
+++ b/.bkit/core/engine/checks/after/index.ts
@@ -174,7 +174,7 @@ export function renderAdvisoriesMarkdown(
   // This is a generated, gitignored artifact — not authored prose. Advisory
   // strings (and reproduced config snippets like `.vale.ini`'s `write-good.So =
   // NO`) legitimately contain sentence-initial "So" and slop tokens. The shipped
-  // `lint:prose` globs on-disk `.agents/*.md`, so without this whole-file Vale
+  // `bkit:lint:prose` globs on-disk `.agents/*.md`, so without this whole-file Vale
   // skip the husky hooks fail on a file the consumer cannot edit.
   lines.push("<!-- vale off -->");
   lines.push("");
@@ -480,7 +480,7 @@ export function runPostInstallCheck(
   const runLevels = detectRunLevelsNotComposed(cwd);
   if (runLevels) phase3.push(runLevels);
 
-  // vale missing while lint:prose runs the prose gate
+  // vale missing while bkit:lint:prose runs the prose gate
   const valeMissing = detectValeMissing(cwd);
   if (valeMissing) phase3.push(valeMissing);
 
diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index dfbd00045..513c3bab9 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -64,24 +64,25 @@ describe("detectValeMissing", () => {
   const writeScripts = (scripts: Record<string, string>) =>
     fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ scripts }));
 
-  it("returns a finding when lint:prose runs bkit ci prose and vale is not on PATH", () => {
-    writeScripts({ "lint:prose": "bkit ci prose --glob='docs/*.md'" });
+  it("returns a finding when bkit:lint:prose runs bkit ci prose and vale is not on PATH", () => {
+    writeScripts({ "bkit:lint:prose": "bkit ci prose --glob='docs/*.md'" });
     spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
     const result = detectValeMissing(tmpDir);
     expect(result!.id).toBe("vale-not-installed");
+    expect(result!.detect).toContain("bkit:lint:prose");
     expect(result!.action).toContain("vale sync");
   });
 
   it("returns null when vale is on PATH", () => {
-    writeScripts({ "lint:prose": "bkit ci prose" });
+    writeScripts({ "bkit:lint:prose": "bkit ci prose" });
     spawnSync.mockReturnValue({ status: 0, stdout: "" } as ReturnType<typeof spawnSync>);
     expect(detectValeMissing(tmpDir)).toBeNull();
   });
 
-  it("returns null when lint:prose does not run bkit ci prose, or package.json is absent", () => {
+  it("returns null when bkit:lint:prose does not run bkit ci prose, or package.json is absent", () => {
     spawnSync.mockReturnValue({ status: 1, stdout: "" } as ReturnType<typeof spawnSync>);
     expect(detectValeMissing(tmpDir)).toBeNull();
-    writeScripts({ "lint:prose": "echo none" });
+    writeScripts({ "bkit:lint:prose": "echo none" });
     expect(detectValeMissing(tmpDir)).toBeNull();
   });
 });
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index f9f4610ca..004726822 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -23,7 +23,7 @@ function toolVersionRuns(cmd: string): boolean {
 }
 
 /**
- * Detect a prose gate that cannot run here: package.json `lint:prose` calls `bkit ci prose`,
+ * Detect a prose gate that cannot run here: package.json `bkit:lint:prose` calls `bkit ci prose`,
  * which fails without vale, and vale is not on PATH. Null when the gate is not adopted.
  */
 export function detectValeMissing(cwd: string): PreflightFinding | null {
@@ -32,7 +32,7 @@ export function detectValeMissing(cwd: string): PreflightFinding | null {
   const scripts = read.pkg["scripts"];
   const lintProse =
     typeof scripts === "object" && scripts !== null
-      ? (scripts as Record<string, unknown>)["lint:prose"]
+      ? (scripts as Record<string, unknown>)["bkit:lint:prose"]
       : undefined;
   if (typeof lintProse !== "string" || !lintProse.includes("bkit ci prose")) return null;
   if (toolVersionRuns("vale")) return null;
@@ -41,7 +41,7 @@ export function detectValeMissing(cwd: string): PreflightFinding | null {
     id: "vale-not-installed",
     severity: "advisory",
     detect:
-      "package.json `lint:prose` runs `bkit ci prose`, but vale is not on PATH — the prose gate fails, so every pre-push gate that runs `lint:prose` fails on this machine.",
+      "package.json `bkit:lint:prose` runs `bkit ci prose`, but vale is not on PATH — the prose gate fails, so every pre-push gate that runs `bkit:lint:prose` fails on this machine.",
     action:
       "Install vale, then download its styles:\n\n    brew install vale    # macOS; other platforms: https://vale.sh/docs/install\n    vale sync\n\nCI and the cloud templates install vale already; this is for local machines.",
   };
@@ -73,7 +73,7 @@ export function detectValePackageNotSynced(cwd: string): PreflightFinding | null
     severity: "advisory",
     detect: "vale is on PATH but .vale/styles/write-good/ is absent — vale packages not synced.",
     action:
-      "Run `vale sync` (one-time per repo) to download the write-good package. lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and fails if it cannot.",
+      "Run `vale sync` (one-time per repo) to download the write-good package. bkit:lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and fails if it cannot.",
   };
 }
 
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 6e38f34b9..42d3ef031 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -167,7 +167,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Automatic checks on every change",
     line: "Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.",
     why: 'This runs your tests and checks on GitHub every time something changes, and bkit\'s ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".',
-    ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
+    ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
     steps: "`.bkit/templates.md` § CI workflow and § Gate tool scripts.",
     fires: (cwd) => !exists(cwd, `.github/workflows/${readBkitConfig(cwd).ciWorkflow}`),
   },
@@ -197,7 +197,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Catch junk code",
     line: "Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.",
     why: "Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.",
-    ask: 'Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"slop:delta": "bkit ci slop"` to the package.json scripts.',
+    ask: 'Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts.',
     steps: "`.bkit/templates.md` § slop-scan.",
     fires: (cwd) => !exists(cwd, "slop-scan.config.json"),
   },
@@ -447,7 +447,7 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Tokens for apps opened from the Dock",
     line: "On a Mac, apps opened from the Dock don't see your sign-in tokens, so they start signed out even though the same thing works in the terminal. Add bkit's loader.",
     why: "The terminal loads your tokens, but apps started from the Dock or Finder skip that step. This one-time setup gives those apps the tokens too.",
-    ask: "Copy .bkit/templates/scripts/launchd/bkit-launchd-env.sh to scripts/launchd/, .bkit/templates/scripts/launchd/launchd.env.example to ~/.config/bkit/launchd.env and .bkit/templates/scripts/launchd/ai.bkit.launchd.plist to ~/Library/LaunchAgents/ (fill in its paths), then run `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.",
+    ask: "Copy .bkit/templates/scripts/launchd/bkit-launchd-env.sh to scripts/launchd/, .bkit/templates/scripts/launchd/bkit-launchd.env.example to ~/.config/bkit/launchd.env and .bkit/templates/scripts/launchd/bkit-launchd.plist to ~/Library/LaunchAgents/ai.bkit.launchd.plist (fill in its paths), then run `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.",
     steps: "`.bkit/templates.md` § Launchd GUI environment.",
     fires: (cwd) => {
       if (process.platform !== "darwin" || isCloudOrCi()) return false;
diff --git a/.bkit/core/engine/cli.ts b/.bkit/core/engine/cli.ts
index c24954b10..d322173d1 100644
--- a/.bkit/core/engine/cli.ts
+++ b/.bkit/core/engine/cli.ts
@@ -811,7 +811,7 @@ Core (implicit — no flag; installed/upgraded on every install):
   .gitattributes managed blocks, docs/, .bkit/*.md, .bkit/version, the template copies in
   .bkit/templates/, and the bkit:gate:* / bkit:deps:* package.json scripts every workflow
   runs (added when missing, never overwritten, left by uninstall). The tool scripts those
-  gates chain (typecheck, lint, format:check, lint:prose, slop:delta) and their devDeps are
+  gates chain (typecheck, lint, format:check, bkit:lint:prose, bkit:slop:delta) and their devDeps are
   yours to add: see .bkit/templates.md.
 
 Module flags (composable; symmetric install ↔ uninstall):
diff --git a/.bkit/core/engine/commands/ci/ci.ts b/.bkit/core/engine/commands/ci/ci.ts
index 383e641f8..755f8fb3b 100644
--- a/.bkit/core/engine/commands/ci/ci.ts
+++ b/.bkit/core/engine/commands/ci/ci.ts
@@ -1,6 +1,6 @@
 // bkit ci — the gates CI and the git hooks run.
 //
-// `slop` — the enforcing slop gate (`slop:delta`). `lint:slop` (`slop-scan scan`) only
+// `slop` — the enforcing slop gate (`bkit:slop:delta`). `lint:slop` (`slop-scan scan`) only
 // reports. This gate checks the base ref out as a detached worktree, runs
 // `slop-scan delta` against the working tree, and fails when the change makes the repo
 // worse on NET: more findings, or a higher score. It gates on the net figures, not on
@@ -9,7 +9,7 @@
 // zero. The pre-existing baseline is never the change's to fix. On failure it names each
 // net-new or worsened finding (`path:line`, rule, message), with line shifts dropped.
 //
-// `prose` — the prose gate (`lint:prose`): Vale over the markdown files the globs
+// `prose` — the prose gate (`bkit:lint:prose`): Vale over the markdown files the globs
 // select. Restores the gitignored write-good package from the main worktree (else
 // `vale sync`) when it is missing, and fails when vale or write-good is unavailable.
 //
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 8a56bd743..ad7b62ab8 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -1562,6 +1562,21 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     return { cwd, body };
   }
 
+  it("derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused", async () => {
+    const { cwd, body } = twoTests();
+    const status = path.join(cwd, STATUS);
+    fs.writeFileSync(
+      status,
+      fs.readFileSync(status, "utf-8").replace(/"block":"[0-9a-f]+"/, '"block":null'),
+    );
+    write(cwd, TEST.file, body("1", "2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    write(cwd, TEST.file, body("2", "2"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
   it("locks the planned test case, not its file: an edit to another test of the file passes", async () => {
     const { cwd, body } = twoTests();
     write(cwd, TEST.file, body("1", "2"));
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 9bf3d0b99..2ac23c39d 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -1572,6 +1572,12 @@ describe("testBlock — a planned test's own lines, by name and indentation", ()
     expect(blockHash(VITEST.replace("toBe(1)", "toBe(2)"), "adds a row")).not.toBe(before);
   });
 
+  it("finds a test planned by its suite path (`suite > test`) through its last segment", () => {
+    expect(testBlock(VITEST, "rows > adds a row")).toBe(testBlock(VITEST, "adds a row"));
+    expect(testBlock(VITEST, "outer > rows > counts rows")).toBe(testBlock(VITEST, "counts rows"));
+    expect(testBlock(VITEST, "rows > no such test")).toBeNull();
+  });
+
   it("starts at the call when the name sits on its own line under an open paren", () => {
     const text = [
       "it(",
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 00e78f129..da2f86ad3 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -315,8 +315,9 @@ export interface TouchedTest {
 
 /**
  * The planned tests of `group` a code step changed since their red: a test whose own lines
- * (`testBlock`) no longer hash to the recorded block. A test whose lines could not be found,
- * and rows written before per-test locking, compare the whole file's blob. Other edits to a
+ * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
+ * per-test locking, or when no line carried the name) derives the block from the recorded
+ * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
  * test file are free.
  */
 export function touchedTests(
@@ -335,17 +336,26 @@ export function touchedTests(
     return texts.get(test)!;
   };
   for (const t of redEntries(file, workflow, group).values()) {
-    if (t.block === undefined || t.block === null) {
+    let block = t.block ?? null;
+    if (block === null) block = blockHash(blobText(top, t.blob), t.testName);
+    if (block === null) {
       if (git(top, ["hash-object", "--", t.test]) !== t.blob)
         touched.push({ test: t.test, name: t.testName });
       continue;
     }
-    if (blockHash(textOf(t.test), t.testName) !== t.block)
+    if (blockHash(textOf(t.test), t.testName) !== block)
       touched.push({ test: t.test, name: t.testName });
   }
   return touched;
 }
 
+/** The text a recorded blob holds, untrimmed; null when the object store lacks it. */
+function blobText(top: string, blob: string | null): string | null {
+  if (blob === null) return null;
+  const res = spawnSync("git", ["cat-file", "-p", blob], { cwd: top, encoding: "utf-8" });
+  return res.status === 0 ? res.stdout : null;
+}
+
 /** Leading whitespace width, a tab counting as one column. */
 const indentOf = (line: string) => line.length - line.trimStart().length;
 
@@ -392,7 +402,11 @@ export function testBlock(text: string | null, name: string): string | null {
     const word = new RegExp(`(^|[^\\w])${escapeRegExp(name)}([^\\w]|$)`);
     at = testStart(lines, (l) => word.test(l));
   }
-  if (at < 0) return null;
+  if (at < 0) {
+    // A suite path (`suite > test`, as a JUnit report names it): the last segment is the test.
+    const last = name.split(" > ").pop()!;
+    return last === name ? null : testBlock(text, last);
+  }
   let start = at;
   while (
     start > 0 &&
diff --git a/.bkit/core/engine/install/manifest.test.ts b/.bkit/core/engine/install/manifest.test.ts
index 5721061a5..89a6057ca 100644
--- a/.bkit/core/engine/install/manifest.test.ts
+++ b/.bkit/core/engine/install/manifest.test.ts
@@ -5,6 +5,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { afterEach, beforeEach, describe, expect, it } from "vitest";
 import {
+  BKIT_GATE_SCRIPTS,
   getInstallManifest,
   getModuleManifest,
   CLOUD_MANIFEST_CLAUDE,
@@ -408,16 +409,27 @@ const GATE_TOOL_SCRIPTS = ((): Record<string, string> => {
 })();
 
 describe("gate tool script template values", () => {
-  it("lint:prose and slop:delta call their bkit ci gates", () => {
-    expect(GATE_TOOL_SCRIPTS["lint:prose"]).toBe("bkit ci prose");
-    expect(GATE_TOOL_SCRIPTS["slop:delta"]).toBe("bkit ci slop");
+  it("bkit:lint:prose and bkit:slop:delta call their bkit ci gates", () => {
+    expect(GATE_TOOL_SCRIPTS["bkit:lint:prose"]).toBe("bkit ci prose");
+    expect(GATE_TOOL_SCRIPTS["bkit:slop:delta"]).toBe("bkit ci slop");
   });
 
-  it("this repo's lint:prose calls the same gate", () => {
+  it("this repo's bkit:lint:prose calls the same gate", () => {
     const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
       scripts: Record<string, string>;
     };
-    expect(pkg.scripts["lint:prose"]).toMatch(/^bkit ci prose(?: --glob='[^']+')+$/);
+    expect(pkg.scripts["bkit:lint:prose"]).toMatch(/^bkit ci prose(?: --glob='[^']+')+$/);
+  });
+});
+
+describe("gate chains", () => {
+  it("gate chains call bkit:lint:prose and bkit:slop:delta", () => {
+    const chains = [BKIT_GATE_SCRIPTS["bkit:gate:min"], BKIT_GATE_SCRIPTS["bkit:gate:static"]];
+    for (const chain of chains) {
+      expect(chain).toContain("pnpm bkit:lint:prose");
+      expect(chain).toContain("pnpm bkit:slop:delta");
+      expect(chain).not.toMatch(/pnpm (lint:prose|slop:delta)/);
+    }
   });
 });
 
diff --git a/.bkit/core/engine/install/manifest.ts b/.bkit/core/engine/install/manifest.ts
index a4b69afb3..fce484f44 100644
--- a/.bkit/core/engine/install/manifest.ts
+++ b/.bkit/core/engine/install/manifest.ts
@@ -219,7 +219,7 @@ const CLAUDE_MANIFEST: ManifestEntry[] = [
 // Seeded by core on every install and upgrade (seedCorePackageJsonScripts,
 // install/modules/index.ts): add-if-missing, so a name already present is never touched,
 // and uninstall leaves every name in place. The tool scripts the defaults chain
-// (typecheck, lint, format:check, lint:prose, slop:delta, lint-staged) are the
+// (typecheck, lint, format:check, bkit:lint:prose, bkit:slop:delta, lint-staged) are the
 // consumer's to add — `.bkit/templates.md` lists them; the
 // `gate-missing-called-scripts` advisory names any that are missing.
 //
@@ -228,7 +228,7 @@ const CLAUDE_MANIFEST: ManifestEntry[] = [
 // directly, one step each.
 //
 // `lint:slop` is in no gate: `slop-scan scan` is report-only and never fails. The gate
-// that fails on new findings is `slop:delta`.
+// that fails on new findings is `bkit:slop:delta`.
 //
 // NOT SEEDED: the three deeper gates (…-integration, …-integration-e2e,
 // …-integration-e2e-live) are absent unless the consumer writes them. Each is one line
@@ -242,13 +242,13 @@ export const BKIT_GATE_SCRIPTS: Readonly<Record<string, string>> = {
   "bkit:gate:format": "pnpm lint-staged",
   // `.husky/pre-push` on a min push (every file is one bkit writes or `bkit.testing.minPushPaths` adds): no code, so
   // no typecheck, lint or tests. Off the chain. Add any test that reads a min-push file.
-  "bkit:gate:min": "pnpm format:check && pnpm lint:prose && pnpm slop:delta",
+  "bkit:gate:min": "pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta",
   // Everything that needs no test runner. Every part has a matching step in the
   // bkit-tests-static CI job; audits/templates/template-ci-yml.test.ts fails when one is missing.
   // Callers: build's plan-execute loop between tasks, and the `.husky/pre-push` revert
   // path.
   "bkit:gate:static":
-    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta",
+    "pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta",
   // The default local gate: `.husky/pre-push` (when no `…-integration` gate is declared),
   // build Steps 8 and 12, the remediates. `pnpm test` is the unit tier only: a test file the
   // integration gate also runs must not match it.
diff --git a/.bkit/core/engine/install/modules/core.integration.test.ts b/.bkit/core/engine/install/modules/core.integration.test.ts
index 7d3b5a342..3d02b3e98 100644
--- a/.bkit/core/engine/install/modules/core.integration.test.ts
+++ b/.bkit/core/engine/install/modules/core.integration.test.ts
@@ -274,7 +274,14 @@ describe("detectGateAdvisories — gate advisories point at .bkit/templates.md",
       (f) => f.id === "gate-missing-called-scripts",
     );
     expect(finding).toBeDefined();
-    for (const name of ["lint", "format:check", "lint:prose", "slop:delta", "test", "build"]) {
+    for (const name of [
+      "lint",
+      "format:check",
+      "bkit:lint:prose",
+      "bkit:slop:delta",
+      "test",
+      "build",
+    ]) {
       expect(finding!.detect).toContain(`\`${name}\``);
     }
     expect(finding!.detect).not.toContain("`typecheck`");
@@ -303,11 +310,11 @@ describe("detectGateAdvisories — gate advisories point at .bkit/templates.md",
   it("names a script the commit gate runs that the push gate runs again", () => {
     writeScripts({
       ...BKIT_GATE_SCRIPTS,
-      "bkit:gate:format": "pnpm lint-staged && pnpm run test:placeholders && pnpm lint:prose",
+      "bkit:gate:format": "pnpm lint-staged && pnpm run test:placeholders && pnpm bkit:lint:prose",
       "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration",
     });
     const finding = detectGateAdvisories(tmpDir).find((f) => f.id === "gate-commit-repeats-push");
-    expect(finding?.detect).toContain("`lint:prose`");
+    expect(finding?.detect).toContain("`bkit:lint:prose`");
     expect(finding?.detect).toContain("`bkit:gate:static-unit-integration`");
     expect(finding?.detect).not.toContain("`test:placeholders`");
     expect(finding?.detect).not.toContain("`lint-staged`");
@@ -360,7 +367,7 @@ describe("detectGateAdvisories — gate advisories point at .bkit/templates.md",
   it("every gate advisory restates what a gate may run, which bkit cannot check", () => {
     writeScripts({
       ...BKIT_GATE_SCRIPTS,
-      "bkit:gate:format": "pnpm lint-staged && pnpm lint:prose",
+      "bkit:gate:format": "pnpm lint-staged && pnpm bkit:lint:prose",
       "bkit:gate:min": "true",
       "test:integration": "vitest run -c int",
     });
diff --git a/.bkit/core/engine/install/modules/core.ts b/.bkit/core/engine/install/modules/core.ts
index 2b58d9870..0ebb2f43f 100644
--- a/.bkit/core/engine/install/modules/core.ts
+++ b/.bkit/core/engine/install/modules/core.ts
@@ -1291,7 +1291,7 @@ export function runCoreModule(ctx: ModuleContext): void {
         "2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.\n\n" +
         "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
         "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
-        "lint, format:check, lint:prose, slop:delta) and the devDeps those need are yours to\n" +
+        "lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to\n" +
         "add: see .bkit/templates.md.",
     });
   }
diff --git a/.bkit/core/prompts/bkit-build-plan-tests.md b/.bkit/core/prompts/bkit-build-plan-tests.md
index 87dc041c5..9aa0ab2d2 100644
--- a/.bkit/core/prompts/bkit-build-plan-tests.md
+++ b/.bkit/core/prompts/bkit-build-plan-tests.md
@@ -77,7 +77,7 @@ autoCompactWindow: 300000
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index f194b9661..cb5e56295 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -21,3 +21,5 @@
 {"schema":3,"ts":1793517758819,"kind":"friction","key":"ship-update-docs-changelog-outside-pr-scope","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["699-engine-run-completeness","https://github.com/cbartens/bkit/pull/786"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship-update-docs edits CHANGELOG.md but ledgers commit --scope=pr does not stage it, so the docs sync's changelog entry is left uncommitted","description":"Step 6's docs agent added an [Unreleased] bullet to the root CHANGELOG.md. Step 8's ledgers commit --scope=pr allow-list covers docs/*.md, ledgers and skills but not CHANGELOG.md, so the bullet stayed dirty in the worktree and does not ride the PR.","remediation":"Either add CHANGELOG.md to the --scope=pr pathspecs (and the runs gate bookkeeping allow-list), or tell bkit-ship-update-docs not to edit files outside docs/.","source":".bkit/core/engine/commands/workflow/ledgers.ts:99"}
 {"schema":3,"ts":1793538646877,"kind":"friction","key":"ship-worktree-setup-adopts-when-run-inside-feature-worktree","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-start-workflow"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship worktrees setup run from inside the feature's own worktree picks adopt mode and exits 7","description":"Step 1 sub-step 7 ran from .worktrees/715-retire-lite-workflows, whose current branch is the ship target, so worktrees setup chose adopt mode (session branch = target), tried to switch the main checkout onto feat/715-retire-lite-workflows, and git refused because the worktree already holds that branch. It exits 7, which the workflow routes as a ship of dev or main and stops. Re-running the same block from the repo root resumed the worktree.","remediation":"In worktrees setup, treat a session already inside the target's registered worktree as resumed, or give this refusal its own exit code."}
 {"schema":3,"ts":1793539461063,"kind":"friction","key":"ship-docs-sync-leaves-padded-table-row","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"ship","step":"ship-bookkeeping-push"},"references":["715-retire-lite-workflows"],"category":"workflow","scope":"universal","severity":"MEDIUM","status":"OPEN","summary":"ship docs sync edits a docs table row with padding, so the Step 8 bookkeeping push is refused by format:tables:check","description":"The ship update-docs agent rewrote a row of a prettier-ignore table in docs/testing.md with fixed-width padding. ledgers commit committed it, and the pre-push gate's format:tables:check refused the push (branches push exit 8). Step 8 has no route for a refused push, so the only written path is the Failure Path, which would end the run over a whitespace fix. The orchestrator ran bkit-insert-ignore.mjs on the file, committed it, and re-ran the push.","remediation":"Run the table formatter on docs the ship docs agent touched before ledgers commit, or give Step 8 a route for a hook-refused push: fix what the hook names, commit, re-run the push."}
+{"schema":3,"ts":1793584064221,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/install/modules/core.integration.test.ts` \"detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > every template has an entry, and every entry is a template\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify.sh\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"0e42f36c3e5e5786591a24bc5d88dadac27cd393"},"recurrenceCount":1}
+{"schema":3,"ts":1793584127371,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/install/modules/core.integration.test.ts` \"detectGateAdvisories — gate advisories point at .bkit/templates.md > names the tool scripts a default gate chains that package.json lacks\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > every template has an entry, and every entry is a template\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify.sh\", `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` \"this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"0e42f36c3e5e5786591a24bc5d88dadac27cd393"},"recurrenceCount":2,"lastConfirmed":1793584127371}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index ec0886a2e..dd16526d7 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10459,7 +10459,7 @@ Write the tests one task at a time. For each `TEST FIRST` entry that the task's
 Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
 For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
 Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
 **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
 **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
 **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.bkit/templates/.cursor/Dockerfile b/.bkit/templates/.cursor/Dockerfile
index 8dc45dd1c..03698f475 100644
--- a/.bkit/templates/.cursor/Dockerfile
+++ b/.bkit/templates/.cursor/Dockerfile
@@ -55,7 +55,7 @@ RUN cd /tmp \
     && tar -xzf "gh_${GH_VERSION}_linux_amd64.tar.gz" -C /usr/local/bin --strip-components=2 "gh_${GH_VERSION}_linux_amd64/bin/gh" \
     && rm -f "gh_${GH_VERSION}_linux_amd64.tar.gz"
 
-# vale — `pnpm lint:prose`. Version pinned for snapshot reproducibility; tarball checked before extract.
+# vale — `pnpm bkit:lint:prose`. Version pinned for snapshot reproducibility; tarball checked before extract.
 # renovate: datasource=github-releases depName=errata-ai/vale
 ARG VALE_VERSION=3.24.0
 ARG VALE_SHA256=867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214
diff --git a/.bkit/templates/.github/workflows/bkit-ci.yml b/.bkit/templates/.github/workflows/bkit-ci.yml
index f69662fb2..fa43d64f1 100644
--- a/.bkit/templates/.github/workflows/bkit-ci.yml
+++ b/.bkit/templates/.github/workflows/bkit-ci.yml
@@ -58,7 +58,7 @@ jobs:
     steps:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         with:
-          # Full history so slop:delta can materialise the PR base ref as a worktree.
+          # Full history so bkit:slop:delta can materialise the PR base ref as a worktree.
           fetch-depth: 0
 
       # Node/TS toolchain region. On a non-Node repo, replace these steps with your
@@ -191,7 +191,7 @@ jobs:
         run: pnpm format:check
 
       # vale is not on the runner and .vale/styles/ is gitignored, so without this step
-      # `pnpm lint:prose` guard-skips (write-good missing) and the prose gate is silently
+      # `pnpm bkit:lint:prose` guard-skips (write-good missing) and the prose gate is silently
       # dead. Pinned tarball + `vale sync` (else E100: write-good missing).
       - name: Install Vale
         env:
@@ -213,7 +213,7 @@ jobs:
           done
 
       - name: Run Vale Prose Lint
-        run: pnpm lint:prose
+        run: pnpm bkit:lint:prose
 
       - name: Run Slop Scan
         run: pnpm lint:slop
@@ -225,7 +225,7 @@ jobs:
         if: github.event_name == 'pull_request'
         env:
           BASE_SHA: ${{ github.event.pull_request.base.sha }}
-        run: pnpm slop:delta "$BASE_SHA"
+        run: pnpm bkit:slop:delta "$BASE_SHA"
 
       # actionlint validates .github/workflows/* with GitHub-Actions-aware rules
       # (${{ }} expression syntax, shellcheck on run: blocks). A YAML linter accepts
@@ -272,7 +272,7 @@ jobs:
       # GitHub's test merge of the PR into its base: the tree a squash merge puts on the base,
       # so its verdict is the post-merge push run's verdict. A PR behind its base can red here
       # with a clean head, when two branches' registers merge line by line into a file no
-      # rebuild produces; merging the base into the branch, `pnpm graph:refresh` and a commit
+      # rebuild produces; merging the base into the branch, `pnpm bkit:graph:refresh` and a commit
       # clear it. `check-at HEAD` rebuilds in a throwaway worktree of the checked-out commit —
       # the same primitive the pre-push gate runs — so the release installed, the script run
       # and the register judged all come from that one tree.
@@ -292,7 +292,7 @@ jobs:
           export PATH="$HOME/.local/bin:$PATH"
           if ! bash scripts/graphify/bkit-graphify.sh check-at HEAD; then
             if [ "$GITHUB_EVENT_NAME" = pull_request ]; then
-              echo "::error title=Capability register::Checked this PR merged into $GITHUB_BASE_REF. If the branch is behind $GITHUB_BASE_REF, merge $GITHUB_BASE_REF into it first, then pnpm graph:refresh, commit and push."
+              echo "::error title=Capability register::Checked this PR merged into $GITHUB_BASE_REF. If the branch is behind $GITHUB_BASE_REF, merge $GITHUB_BASE_REF into it first, then pnpm bkit:graph:refresh, commit and push."
             fi
             exit 1
           fi
@@ -795,7 +795,7 @@ jobs:
 #       - name: Run Lint                      # [U] static checks FAIL-FAST before env pull; PRs scope --filter=...[origin/<base>]
 #       - name: Run Typecheck                 # [U]
 #       - name: Run Prettier     # [U] CI-side format gate (hook-bypass net)
-#       - name: Run Vale Prose Lint           # [U] same root lint:prose pre-push runs (local==CI)
+#       - name: Run Vale Prose Lint           # [U] same root bkit:lint:prose pre-push runs (local==CI)
 #       - name: Run Slop Scan (full)          # [U] advisory baseline
 #       - name: Run Slop Scan (delta)         # every event, against the planner base. deployments.md § One run.
 #       - name: Tear Down Base Worktree       # if: always()
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index 89581239a..d859fc9d2 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -495,7 +495,7 @@ jobs:
           token: ${{ github.token }}
 
       # Installs the vale binary for bkit-cloud-bootstrap.sh's `vale sync` and the dispatched
-      # phase's lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
+      # phase's bkit:lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
       # SHA mirror bkit-ci.yml.
       - name: Install vale
         env:
diff --git a/.bkit/templates/.husky/pre-commit b/.bkit/templates/.husky/pre-commit
index aded3f427..0f808b167 100755
--- a/.bkit/templates/.husky/pre-commit
+++ b/.bkit/templates/.husky/pre-commit
@@ -3,11 +3,11 @@
 # bkit install does not write this file and does not overwrite a copy.
 #
 # FAST local gate only: format staged files (seconds). Heavier gates
-# (typecheck/unit/format:check/prose), the enforcing slop gate (slop:delta) and the
+# (typecheck/unit/format:check/prose), the enforcing slop gate (bkit:slop:delta) and the
 # integration tier are in pre-push; E2E/@live run ONLY in CI (bkit-tests / bkit-tests-live,
 # enforced by bkit-tests-check) — see bkit-ci.yml § FULL CI SCAFFOLD REFERENCE. Rule: nothing
 # here that pre-push runs again, and nothing that takes more than a few seconds. (lint:slop is `slop-scan scan` — report-only, never
-# fails; the gate that fails on NEW findings is `slop:delta`, which runs in pre-push.)
+# fails; the gate that fails on NEW findings is `bkit:slop:delta`, which runs in pre-push.)
 #
 # WHAT it runs lives in package.json `bkit:gate:format`, not here — the same script
 # the bkit agent workflows dispatch through; change the gate there. Add repo-specific
diff --git a/.bkit/templates/.husky/pre-push b/.bkit/templates/.husky/pre-push
index cb65efaf3..03d442a34 100755
--- a/.bkit/templates/.husky/pre-push
+++ b/.bkit/templates/.husky/pre-push
@@ -237,7 +237,7 @@ fi
 # the bkit agent workflows and prompts dispatch through. Edit the scripts, not this
 # hook. Fast repo extras go ABOVE, with `bkit check`; slow ones BELOW.
 # Min push: `bkit:gate:min` only. Revert path drops the suite only: prose
-# and slop:delta still run. Otherwise the deepest push gate package.json declares.
+# and bkit:slop:delta still run. Otherwise the deepest push gate package.json declares.
 if [ "$MIN_PUSH" = "1" ]; then
   echo "[pre-push] min push — bkit:gate:min instead of the full gate" >&2
   pnpm bkit:gate:min < /dev/null
diff --git a/.bkit/templates/docs/capabilities.md b/.bkit/templates/docs/capabilities.md
index f9061a880..c4adfe896 100644
--- a/.bkit/templates/docs/capabilities.md
+++ b/.bkit/templates/docs/capabilities.md
@@ -1,6 +1,6 @@
 > Example output. Copy it to `docs/capabilities.md` and own it. `bkit install` does not write this file and does not overwrite a copy.
 >
-> `pnpm graph:rollup` rewrites everything outside the Overrides block, so do not edit the generated body. To add a capability, add it in `scripts/graphify/bkit-graph-drift-rules.json`. How to run the tools is in `.bkit/templates.md`.
+> `pnpm bkit:graph:rollup` rewrites everything outside the Overrides block, so do not edit the generated body. To add a capability, add it in `scripts/graphify/bkit-graph-drift-rules.json`. How to run the tools is in `.bkit/templates.md`.
 
 # Capabilities
 
@@ -9,7 +9,7 @@
 >
 > **Rules:**
 >
-> - This file is generated. `pnpm graph:refresh` rewrites it.
+> - This file is generated. `pnpm bkit:graph:refresh` rewrites it.
 > - The source of truth is `scripts/graphify/bkit-graph-drift-rules.json`. Each status is derived from the tree, never typed in.
 > - Markers are literal, never regex. A regex metacharacter in a marker matches nothing, and the row then reads as a clean result.
 > - Optional `scope`: path prefixes.
@@ -31,7 +31,7 @@
 
 ## Register
 
-Not built. Run `pnpm graph:rollup`.
+Not built. Run `pnpm bkit:graph:rollup`.
 
 ## Unreachable API calls
 
@@ -62,12 +62,12 @@ This is the only hand-maintained region. Use it to rename a node, hide a node or
 
 ## User-facing routes → backend capabilities
 
-No route layer yet. Run `pnpm graph:rollup`.
+No route layer yet. Run `pnpm bkit:graph:rollup`.
 
 ## Architecture — packages
 
-Filled by `pnpm graph:rollup`.
+Filled by `pnpm bkit:graph:rollup`.
 
 ## Architecture — modules
 
-Filled by `pnpm graph:rollup`.
+Filled by `pnpm bkit:graph:rollup`.
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-drift.py b/.bkit/templates/scripts/graphify/bkit-graph-drift.py
index 38904da47..b06b4d40b 100644
--- a/.bkit/templates/scripts/graphify/bkit-graph-drift.py
+++ b/.bkit/templates/scripts/graphify/bkit-graph-drift.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Compute per-capability drift status by literal-pattern scan, for the generated diagram.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Reads
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Reads
 bkit-graph-drift-rules.json, walks the source tree once, and writes an overlay JSON
 that bkit-graphify-rollup.py paints onto the Mermaid nodes.
 
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-eager.py b/.bkit/templates/scripts/graphify/bkit-graph-eager.py
index e6ad5d4db..94400a26c 100644
--- a/.bkit/templates/scripts/graphify/bkit-graph-eager.py
+++ b/.bkit/templates/scripts/graphify/bkit-graph-eager.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Find modules that do work when they are imported, and count who pays for it.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON that
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON that
 bkit-graphify-rollup.py renders as the import-time side-effect table in
 docs/capabilities.md.
 
@@ -135,7 +135,7 @@ def inside_callable(path, line):
 # --- who imports this, transitively -------------------------------------------
 # graph.json already carries the imports graphify cannot resolve — a `.js`
 # specifier never reaching a `.tsx` file, and workspace subpaths through an
-# `exports` map. bkit-graph-repair.py injects them during `pnpm graph`, so they are
+# `exports` map. bkit-graph-repair.py injects them during `pnpm bkit:graph`, so they are
 # read here like any other edge; warns if graph.json lacks any of them.
 INBOUND = collections.defaultdict(set)
 for link in raw["links"]:
@@ -232,5 +232,5 @@ print(f"[eager] {REPAIRED} of those edges came from bkit-graph-repair.py — imp
       f"graphify cannot resolve (.js -> .tsx, workspace exports subpaths)")
 if ungraphed:
     print(f"[eager] {ungraphed} scanned files absent from graph.json (column-0 filter only) "
-          f"— run 'pnpm graph:update' to close the gap", file=sys.stderr)
+          f"— run 'pnpm bkit:graph:update' to close the gap", file=sys.stderr)
 print(f"[eager] wrote {args.eager_out}", file=sys.stderr)
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-imports.py b/.bkit/templates/scripts/graphify/bkit-graph-imports.py
index a46b012bb..f106dcd63 100644
--- a/.bkit/templates/scripts/graphify/bkit-graph-imports.py
+++ b/.bkit/templates/scripts/graphify/bkit-graph-imports.py
@@ -9,7 +9,7 @@ the sibling `graph-*.py` scripts, which are standalone and cannot be imported
 themselves.
 
 ONE WRITER. `bkit-graph-repair.py` is the only script that writes
-`resolved_import_edges()` into graph.json, during `pnpm graph`, so `graphify affected` /
+`resolved_import_edges()` into graph.json, during `pnpm bkit:graph`, so `graphify affected` /
 `explain` / `path` / `query` see the same edges these scripts do. bkit-graph-eager.py
 and bkit-graphify-rollup.py call `warn_if_unrepaired()`, which compares the same set
 against graph.json, and otherwise just read the graph.
@@ -147,7 +147,7 @@ def warn_if_unrepaired(graph, who, stream=None):
     if missing:
         print(f"[{who}] WARNING: graph.json lacks {len(missing)} imports that "
               f"bkit-graph-repair.py adds, so reachability and blast-radius numbers "
-              f"below are UNDERSTATED. Run 'pnpm graph:update'.",
+              f"below are UNDERSTATED. Run 'pnpm bkit:graph:update'.",
               file=stream or _sys.stderr)
     return repair_state(graph)
 
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh b/.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
index ce7a555ac..f1a013d6d 100755
--- a/.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
+++ b/.bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
@@ -60,7 +60,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
           if [ -n "$CAP_UNKNOWN" ]; then
             echo "[pre-push] WARNING: $CAP_DOC was NOT checked — $CAP_UNKNOWN, so whether '$CAP_BRANCH' has an open PR is unknown." >&2
             echo "[pre-push]    If a PR is open, CI's Check Capability Register fails it on a stale register; run" >&2
-            echo "[pre-push]    pnpm graph:refresh, commit, and push again." >&2
+            echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again." >&2
           fi
         fi
         ;;
@@ -70,11 +70,11 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
     if ! command -v graphify >/dev/null 2>&1; then
       echo "[pre-push] WARNING: $CAP_DOC was NOT checked — graphify is not installed." >&2
       echo "[pre-push]    CI's Check Capability Register checks it for $CAP_GATE_WHAT; if it reds there, run" >&2
-      echo "[pre-push]    pnpm graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
+      echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
       echo "[pre-push]    brew install uv && uv tool install '$(bash scripts/graphify/bkit-graphify.sh spec)'" >&2
     elif ! bash scripts/graphify/bkit-graphify.sh check-at "$CAP_GATE_SHA" < /dev/null; then
       echo "[pre-push] BLOCKED: $CAP_DOC is not what the pushed commit builds (diff above); CI fails $CAP_GATE_WHAT on it." >&2
-      echo "[pre-push] Fix: pnpm graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
+      echo "[pre-push] Fix: pnpm bkit:graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
       exit 1
     fi
   else
@@ -85,7 +85,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
       CAP_CHANGED=$(git diff --name-only "$CAP_SHA..HEAD" -- '*.ts' '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
       if [ "${CAP_CHANGED:-0}" -gt 0 ]; then
         echo "[pre-push] NOTE: $CAP_DOC diagrams were built at $CAP_SHA; $CAP_CHANGED source files changed since." >&2
-        echo "[pre-push]       Refresh when convenient:  pnpm graph:refresh" >&2
+        echo "[pre-push]       Refresh when convenient:  pnpm bkit:graph:refresh" >&2
         echo "[pre-push]       Not a gate on this branch until it has an open PR into dev; a push to dev is blocked until it is current." >&2
       fi
     fi
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-repair.py b/.bkit/templates/scripts/graphify/bkit-graph-repair.py
index 65a8ea47b..9e809362b 100644
--- a/.bkit/templates/scripts/graphify/bkit-graph-repair.py
+++ b/.bkit/templates/scripts/graphify/bkit-graph-repair.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Inject the import edges graphify could not resolve back into graph.json.
 
-Called by `pnpm graph`, `:clean` and `:update` (scripts/graphify/bkit-graphify.sh),
+Called by `pnpm bkit:graph`, `:clean` and `:update` (scripts/graphify/bkit-graphify.sh),
 between `extract` and `cluster-only`.
 
     bkit-graph-repair.py <graph.json> [--rules R] [--quiet]
@@ -16,9 +16,9 @@ checks, the generated doc, and `graphify affected`, `god-nodes`, `explain`,
 this step says so.
 
 `graphify update` rewrites graph.json without the injected edges, so every
-wrapper command that writes the file (`pnpm graph`, `:clean`, `:update`) runs
+wrapper command that writes the file (`pnpm bkit:graph`, `:clean`, `:update`) runs
 this step at the end. The step is idempotent: after a raw `graphify update .`,
-run `pnpm graph:update`.
+run `pnpm bkit:graph:update`.
 
 ORDER MATTERS: this runs BEFORE clustering, so communities, the god-node
 ranking and the cycle list in graph-report.md are computed from the repaired graph.
diff --git a/.bkit/templates/scripts/graphify/bkit-graph-surface.py b/.bkit/templates/scripts/graphify/bkit-graph-surface.py
index 9c76a5f93..d7e283ef1 100644
--- a/.bkit/templates/scripts/graphify/bkit-graph-surface.py
+++ b/.bkit/templates/scripts/graphify/bkit-graph-surface.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Link user-facing routes to the backend capabilities they reach.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON the
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON the
 capabilities doc renders as its route layer.
 
     bkit-graph-surface.py <graph.json> <surface-out.json> [--quiet]
diff --git a/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py b/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
index c4aee4fc0..e1de5ac7b 100644
--- a/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
+++ b/.bkit/templates/scripts/graphify/bkit-graphify-graphml.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Export the full symbol graph to GraphML for Gephi / yEd.
 
-Called by `pnpm graph:graphml` (scripts/graphify/bkit-graphify.sh) through GRAPHIFY'S
+Called by `pnpm bkit:graph:graphml` (scripts/graphify/bkit-graphify.sh) through GRAPHIFY'S
 OWN interpreter — it imports graphify itself.
 
     bkit-graphify-graphml.py <graph.json> <out.graphml>
diff --git a/.bkit/templates/scripts/graphify/bkit-graphify-rollup.py b/.bkit/templates/scripts/graphify/bkit-graphify-rollup.py
index b2fe13141..44f6d4c86 100644
--- a/.bkit/templates/scripts/graphify/bkit-graphify-rollup.py
+++ b/.bkit/templates/scripts/graphify/bkit-graphify-rollup.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Collapse the whole-symbol code graph into two readable views.
 
-Called by `pnpm graph:rollup` and `pnpm graph:graphml` (scripts/graphify/
+Called by `pnpm bkit:graph:rollup` and `pnpm bkit:graph:graphml` (scripts/graphify/
 bkit-graphify.sh) through GRAPHIFY'S OWN interpreter, not the system python — it
 imports networkx, which is a graphify dependency and is not installed repo-wide.
 
@@ -16,9 +16,9 @@ Both outputs are opt-in, and the two commands ask for different ones:
 
   --build-dir       a graphify-format graph.json per level, which the caller
                     renders to interactive HTML via `graphify cluster-only`,
-                    then moves and deletes. This is `pnpm graph:rollup`.
+                    then moves and deletes. This is `pnpm bkit:graph:rollup`.
   --*-graphml       the same two views as GraphML for Gephi. Only `pnpm
-                    graph:graphml` asks for these — GraphML is not produced by
+                    bkit:graph:graphml` asks for these — GraphML is not produced by
                     default.
 
 Node attrs: symbols, files, internal_edges. Edge attrs: weight (number of
@@ -59,7 +59,7 @@ SRC = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql")
 # graphify misses two whole classes of import: a `.js` specifier is never
 # resolved to a `.tsx` file, and workspace subpaths through an `exports` map are
 # not resolved at all. bkit-graph-repair.py writes them into graph.json during
-# `pnpm graph`, so this reads them like any other edge and does NOT add them on
+# `pnpm bkit:graph`, so this reads them like any other edge and does NOT add them on
 # read. A graph lacking any of them gets a warning, and the numbers below are
 # understated.
 # bkit-graph-imports.py is hyphenated, which `import` cannot spell, so it is loaded
@@ -657,7 +657,7 @@ def eager_block(eager):
     if eager.get("not_in_graph"):
         L += ["", f"> [!WARNING]", f"> {eager['not_in_graph']} scanned files are absent from "
               "`graph.json`, so only the column-0 filter applied to them and their downstream "
-              "counts are 0. Run `pnpm graph:update` and re-run the rollup."]
+              "counts are 0. Run `pnpm bkit:graph:update` and re-run the rollup."]
     return L
 
 
@@ -674,7 +674,7 @@ def reachability_block(reach):
     L = [
         "A request URL is a string inside a template literal, so nothing that reads types can",
         "see that it has no server-side counterpart, because `lint`, `check:type`, `knip` and",
-        "`slop:delta` all pass on a path that 404s. This is the one drift class no graph query",
+        "`bkit:slop:delta` all pass on a path that 404s. This is the one drift class no graph query",
         "finds either: a string is not an edge. Scanned every run by",
         "`scripts/ci/guards/assert-routes-reachable.mjs`; run it alone for the full served-route inventory.",
         "",
@@ -724,7 +724,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
     Source of truth is bkit-graph-drift-rules.json (which capability, which owner,
     which literal marker); every status in the table is derived from live source
     by bkit-graph-drift.py, never typed in. Editing this file by hand loses the edit
-    on the next `pnpm graph:rollup`.
+    on the next `pnpm bkit:graph:rollup`.
     """
     GRAPH_COMMIT = str(raw.get("built_at_commit") or "unknown")
     ROUTES_MMD, n_routes = chain_block(surface, overlay, reach)
@@ -766,7 +766,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         ">",
         "> **Rules:**",
         ">",
-        "> - Generated — do not edit. `pnpm graph:refresh` rewrites this file.",
+        "> - Generated — do not edit. `pnpm bkit:graph:refresh` rewrites this file.",
         f"> - Source of truth: `{rules_path}`. Every status derived from live source, never typed.",
         "> - Add a capability = add a rule there: capability · lane · owner module · one literal marker.",
         "> - Markers literal, never regex, because `new Client(` as a regex is an unclosed group matching nothing.",
@@ -787,8 +787,8 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         "> - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.",
         "> - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.",
         "> - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.",
-        f"> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `{GRAPH_COMMIT[:9]}`; when that differs from HEAD ⇒ run `pnpm graph:update` first.",
-        "> - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.",
+        f"> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `{GRAPH_COMMIT[:9]}`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.",
+        "> - Detail-level module graph → `pnpm bkit:graph`. This doc is the altitude above that: capabilities, not files.",
         "",
         "## Status Vocabulary",
         "",
@@ -799,7 +799,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         "the exact number of non-owner sites allowed per scope prefix, and its `note` says why that",
         "number is not zero. The moment the count moves in either direction — too many (a copy",
         "appeared) or too few (the budget is stale) — the row leaves `budgeted`, its Budget cell",
-        "reads `over` or `stale`, and `pnpm graph:check` fails until the register is refreshed.",
+        "reads `over` or `stale`, and `pnpm bkit:graph:check` fails until the register is refreshed.",
         "That is why the status can be quieter without being a place to hide work.",
         "",
         "It still gets a box in the diagrams, drawn solid and blue rather than dashed and amber. A",
diff --git a/.bkit/templates/scripts/graphify/bkit-graphify.sh b/.bkit/templates/scripts/graphify/bkit-graphify.sh
index bdc498a88..e2d5816d7 100755
--- a/.bkit/templates/scripts/graphify/bkit-graphify.sh
+++ b/.bkit/templates/scripts/graphify/bkit-graphify.sh
@@ -35,7 +35,7 @@ REPORTS="$OUT/reports"
 # Report filenames — RENAME HERE AND NOWHERE ELSE. Each is referenced once
 # below, so a new name takes effect on the next run with no other edit. These
 # are all derived artifacts: renaming one never invalidates the graph, and the
-# old file is not cleaned up automatically — delete it or run `pnpm graph:clean`.
+# old file is not cleaned up automatically — delete it or run `pnpm bkit:graph:clean`.
 R_REPORT="graph-report.md"                # cluster-only's own report, moved here
 R_TREE="graph-tree.html"                  # collapsible folder tree
 R_FULL_GRAPHML="graph.graphml"            # whole graph for Gephi
@@ -85,37 +85,37 @@ R_REACH="graph-reachability.json"
 
 usage() {
   cat <<'EOF'
-Usage: pnpm graph[:clean|:update|:rollup|:refresh|:check|:graphml|:tree|:scoped]
+Usage: pnpm bkit:graph[:clean|:update|:rollup|:refresh|:check|:graphml|:tree|:scoped]
 
-  graph           Full repo: extract + cluster. ~2 min, 0 tokens.
-  graph:clean     Same, but deletes the output dir first. REQUIRED after any
+  bkit:graph      Full repo: extract + cluster. ~2 min, 0 tokens.
+  bkit:graph:clean Same, but deletes the output dir first. REQUIRED after any
                   tsconfig `paths` change — `--force` re-reads source files but
                   NOT the module-resolution cache, so a graph built after an
                   alias edit will silently keep the old, unresolved edges.
-  graph:update    Re-extract changed files only, then recluster.
-  graph:check     Rebuild from THIS tree; fail if the tracked register
+  bkit:graph:update Re-extract changed files only, then recluster.
+  bkit:graph:check Rebuild from THIS tree; fail if the tracked register
                   docs/capabilities.md differs from the rebuild. Writes nothing
                   tracked. Reads uncommitted edits — `check-at` does not.
-  graph:refresh   Rebuild the register in a clean checkout of the STAGED
+  bkit:graph:refresh Rebuild the register in a clean checkout of the STAGED
                   files (the index), copy it over docs/capabilities.md.
                   Stage your change first. Fixes a red gate; commit it.
   check-at <rev>  `check` in a throwaway checkout of <rev>. Pre-push runs it
                   for every push to dev; CI runs it for every push and pull request.
   spec            Print the pinned graphify release (pip spec).
-  graph:rollup    Collapse the symbol graph into a package view (~24 nodes, the
+  bkit:graph:rollup Collapse the symbol graph into a package view (~24 nodes, the
                   architecture) and a module view (~133 nodes, the subsystems),
                   as interactive HTML. Edge weight is the number of underlying
                   symbol edges. Open these INSTEAD of the full graph; 9.8K nodes
                   is a database, not a picture.
-  graph:graphml   OPT-IN, for Gephi / yEd only — nothing else produces GraphML.
+  bkit:graph:graphml OPT-IN, for Gephi / yEd only — nothing else produces GraphML.
                   Writes all three views: the whole graph plus the two rollups.
                   The CLI has no --graphml flag (it exists only on the /graphify
                   skill, which this repo does not install), so the whole-graph
                   export calls graphify's own to_graphml() through its bundled
                   interpreter.
-  graph:tree      Collapsible folder tree with search and an outbound-edge
+  bkit:graph:tree Collapsible folder tree with search and an outbound-edge
                   inspector.
-  graph:scoped    One subtree with a browsable graph.html.
+  bkit:graph:scoped One subtree with a browsable graph.html.
                   Path defaults to apps/web/src; pass another as $2.
 
 Two directories, both gitignored and both rebuilt from source:
@@ -123,7 +123,7 @@ Two directories, both gitignored and both rebuilt from source:
   <out>/          RAW graph data — graph.json, manifest.json, cache/. graphify
                   owns this layout; the read commands (affected, god-nodes,
                   explain, path, query) all resolve <out>/graph.json.
-  <out>/reports/  Every DERIVED view. Safe to delete wholesale; `pnpm graph`
+  <out>/reports/  Every DERIVED view. Safe to delete wholesale; `pnpm bkit:graph`
                   plus the view command that made it rebuilds any of it.
 
 A whole-repo graph.html is never kept — 8.3 MB rendering ~9.8k nodes as a
@@ -165,7 +165,7 @@ graphify_python() {
 }
 
 require_graph() {
-  [ -f "$OUT/graph.json" ] || { echo "[graph] no $OUT/graph.json — run 'pnpm graph' first" >&2; exit 1; }
+  [ -f "$OUT/graph.json" ] || { echo "[graph] no $OUT/graph.json — run 'pnpm bkit:graph' first" >&2; exit 1; }
 }
 
 # The ONE graphify release that builds and judges the register — here, in the pre-push gate
@@ -200,7 +200,7 @@ esac
 # The whole-repo graph.html is DELETED, never kept. --no-viz below stops
 # cluster-only writing one, but `graphify update` regenerates it on its own
 # ("regenerated missing or stale graph.html") before this function reclusters, so
-# the rm removes it. Use graph:rollup for something clickable, or Gephi on the
+# the rm removes it. Use bkit:graph:rollup for something clickable, or Gephi on the
 # GraphML for metrics.
 cluster() {
   run_local cluster-only . --no-label --no-viz
@@ -323,7 +323,7 @@ case "${1:-build}" in
     echo "[graph] mermaid (paste into mermaid.live, or render per docs/setup.md):"
     echo "         $REPORTS/$R_PACKAGES_MMD"
     echo "         $REPORTS/$R_MODULES_MMD"
-    echo "[graph] GraphML for Gephi is opt-in: pnpm graph:graphml"
+    echo "[graph] GraphML for Gephi is opt-in: pnpm bkit:graph:graphml"
     ;;
   tree)
     require_graph
@@ -350,11 +350,11 @@ case "${1:-build}" in
     # into its base (pull_request), the tree a squash merge lands.
     # Rebuild graph from this tree → regenerate register into a throwaway copy
     # → fail if it differs from the tracked file. Writes nothing tracked; fix a
-    # red with `pnpm graph:refresh` plus a commit.
+    # red with `pnpm bkit:graph:refresh` plus a commit.
     #
     # By hand it reads the working tree, not the commit: uncommitted edits show
     # as drift nobody else can reproduce. After a tsconfig `paths` change run
-    # `pnpm graph:clean` first: `update` keeps the stale module-resolution
+    # `pnpm bkit:graph:clean` first: `update` keeps the stale module-resolution
     # cache, and the drift reported would be the cache, not the register.
     if [ -n "$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null)" ]; then
       echo "[graph] WARNING: uncommitted .ts/.tsx edits — graphify reads the WORKING TREE," >&2
@@ -374,7 +374,7 @@ case "${1:-build}" in
       echo "[graph] $CAPABILITIES_DOC matches a rebuild at $(git rev-parse --short HEAD)."
     else
       echo "[graph] DRIFT: $CAPABILITIES_DOC is not what this tree produces (diff above)." >&2
-      echo "[graph] Fix:   pnpm graph:refresh && git add $CAPABILITIES_DOC && git commit" >&2
+      echo "[graph] Fix:   pnpm bkit:graph:refresh && git add $CAPABILITIES_DOC && git commit" >&2
       exit 1
     fi
     ;;
@@ -391,7 +391,7 @@ case "${1:-build}" in
   refresh)
     # Rebuild the register in a clean checkout of the staged files → copy over the tracked
     # file here. Staged = the commit about to be made, so running it before that commit
-    # rebuilds the new state; unstaged edits stay out, as `graph:update && graph:rollup`
+    # rebuilds the new state; unstaged edits stay out, as `bkit:graph:update && bkit:graph:rollup`
     # would not. The checkout's HEAD stays HEAD, so the stamp names the parent of the commit
     # carrying the register. Fixes a `check` / `check-at` red. Commit the result.
     staged=$(git write-tree) || { echo "[graph] the index has unmerged paths — resolve them first" >&2; exit 1; }
diff --git a/.bkit/templates/scripts/launchd/launchd.env.example b/.bkit/templates/scripts/launchd/bkit-launchd.env.example
similarity index 100%
rename from .bkit/templates/scripts/launchd/launchd.env.example
rename to .bkit/templates/scripts/launchd/bkit-launchd.env.example
diff --git a/.bkit/templates/scripts/launchd/ai.bkit.launchd.plist b/.bkit/templates/scripts/launchd/bkit-launchd.plist
similarity index 100%
rename from .bkit/templates/scripts/launchd/ai.bkit.launchd.plist
rename to .bkit/templates/scripts/launchd/bkit-launchd.plist
diff --git a/.bkit/version b/.bkit/version
index dcaf03e2d..0760231de 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "3ec96b5c34bdcf6204c0103f508c1d0b2d968b1935e646c17913f7c7f4475557",
+    "docs/testing.md": "04d591fb6ab9f66ad269a58d457d03a38a15b6c5c6d7e3a8af51d31feb697320",
     ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -264,7 +264,11 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "fbcf361fb9f1496b5844c91ac7afa9cff78c67ad2dff7d06f1ccecce0affb77c"
+    ".bkit/cli.md": "fbcf361fb9f1496b5844c91ac7afa9cff78c67ad2dff7d06f1ccecce0affb77c",
+    ".claude/agents/bkit-build-plan-tests.md": "1a32ba7f8c778d67f4c7788336427ab6196cbc4c41aeea0148f94817e66a5c69",
+    ".cursor/agents/bkit-build-plan-tests.md": "32145923d722758ffa0a153893d14a8414f189488d99cf8e3aac2c1ec7b42ac9",
+    ".opencode/agents/bkit-build-plan-tests.md": "7c135f8aa139a2e0dfc6dd19c2217680739a94d4ba8b194c1dcfc38d7dabc825",
+    ".codex/agents/bkit-build-plan-tests.toml": "eee202c3fb73723e6095d922505e6135cdacfa08872d9a9cb2ab015d791732a6"
   },
   "claudeAllowDerived": [
     "WebFetch(domain:12factor.net)",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 00976172c..e4dd567ea 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1550,8 +1550,8 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that a file that fails to load with no case of its own in the report is `red-not-loaded`: the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A test whose name no line carries (`block` null), and rows written before per-test locking, fall back to the whole-file blob.
-- **Literal names:** the lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`) re-hashes each planned test of the group and refuses the step when one differs from the block its red recorded: exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; the orchestrator re-asks once (put that test back, keep the other edits, or log the task `BLOCKED`), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Literal names:** the lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
 - **Plan caps, `package.json` `bkit.workflows.tasks`:** up to `bkit.workflows.tasks.maxPerGroup` tasks (default 5) and `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 25) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). A group is one tests agent's work and then one code agent's work, so the code agent spends no turns on tests and a group carries more tasks than one agent writing both could; a bigger group still overflows a context. A key that is not a whole number >= 1 takes its default, and `bkit check` reports advisory `bkit-tasks-invalid`. `.github/ISSUE_TEMPLATE/bkit-change.yml` showing a key as `(default N)` with N other than the value `readBkitConfig` gives → advisory `bkit-tasks-form-stale`, naming the number to change in the form. Install and upgrade write the defaults when `tasks` or a key in it is missing; a value already set is never touched. `readBkitConfig` reads them (`CONFIG_DEFAULTS.tasks` in `settings.ts`); `tests plan-check` and `challenge merge` read the checkout's caps and refuse a plan over any cap, naming the task or group, its count and the cap; `repo info` prints them as `tasks`, which `/bkit-plan` and `/bkit-build` Step 1 hold as `{MAX_TASKS_PER_GROUP}`, `{MAX_TESTS_PER_GROUP}`, `{MAX_TESTS_PER_TASK}`, `{MAX_TEST_FILES_PER_TASK}` and pass in Context to every agent that writes, reviews, executes or verifies the plan: plan-generate, plan-review-1, plan-review-2, plan-scope-check, plan-update, convert, plan-tests, plan-execute, plan-verify and the challenge reviewers. Prompts name no cap value of their own; each uses the caps its Context names.
diff --git a/.claude/agents/bkit-build-plan-tests.md b/.claude/agents/bkit-build-plan-tests.md
index 26c3a6aa1..3ccb46525 100644
--- a/.claude/agents/bkit-build-plan-tests.md
+++ b/.claude/agents/bkit-build-plan-tests.md
@@ -78,7 +78,7 @@ autoCompactWindow: 300000
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.codex/agents/bkit-build-plan-tests.toml b/.codex/agents/bkit-build-plan-tests.toml
index 94a59bc42..3372194f4 100644
--- a/.codex/agents/bkit-build-plan-tests.toml
+++ b/.codex/agents/bkit-build-plan-tests.toml
@@ -65,7 +65,7 @@ developer_instructions = """
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.cursor/Dockerfile b/.cursor/Dockerfile
index 8dc45dd1c..03698f475 100644
--- a/.cursor/Dockerfile
+++ b/.cursor/Dockerfile
@@ -55,7 +55,7 @@ RUN cd /tmp \
     && tar -xzf "gh_${GH_VERSION}_linux_amd64.tar.gz" -C /usr/local/bin --strip-components=2 "gh_${GH_VERSION}_linux_amd64/bin/gh" \
     && rm -f "gh_${GH_VERSION}_linux_amd64.tar.gz"
 
-# vale — `pnpm lint:prose`. Version pinned for snapshot reproducibility; tarball checked before extract.
+# vale — `pnpm bkit:lint:prose`. Version pinned for snapshot reproducibility; tarball checked before extract.
 # renovate: datasource=github-releases depName=errata-ai/vale
 ARG VALE_VERSION=3.24.0
 ARG VALE_SHA256=867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214
diff --git a/.cursor/agents/bkit-build-plan-tests.md b/.cursor/agents/bkit-build-plan-tests.md
index ed9769c80..01bea6229 100644
--- a/.cursor/agents/bkit-build-plan-tests.md
+++ b/.cursor/agents/bkit-build-plan-tests.md
@@ -75,7 +75,7 @@ tools:
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/.github/workflows/bkit-ci.yml b/.github/workflows/bkit-ci.yml
index 3a7626f0b..b4e85076a 100644
--- a/.github/workflows/bkit-ci.yml
+++ b/.github/workflows/bkit-ci.yml
@@ -348,7 +348,7 @@ jobs:
     steps:
       - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
         with:
-          # Full history so slop:delta can materialise the PR base ref as a worktree.
+          # Full history so bkit:slop:delta can materialise the PR base ref as a worktree.
           fetch-depth: 0
 
       # Node/TS toolchain region. On a non-Node repo, replace these steps with your
@@ -433,7 +433,7 @@ jobs:
         run: pnpm format:check
 
       # vale is not on the runner and .vale/styles/ is gitignored, so without this step
-      # `pnpm lint:prose` guard-skips (write-good missing) and the prose gate is silently
+      # `pnpm bkit:lint:prose` guard-skips (write-good missing) and the prose gate is silently
       # dead. Pinned tarball + `vale sync` (else E100: write-good missing).
       - name: Install Vale
         env:
@@ -455,7 +455,7 @@ jobs:
           done
 
       - name: Run Vale Prose Lint
-        run: pnpm lint:prose
+        run: pnpm bkit:lint:prose
 
       - name: Run Slop Scan
         run: pnpm lint:slop
@@ -472,7 +472,7 @@ jobs:
             echo "::notice::no diff base resolved — skipping slop delta"
             exit 0
           fi
-          pnpm slop:delta "$BASE_SHA"
+          pnpm bkit:slop:delta "$BASE_SHA"
 
       # actionlint validates .github/workflows/* with GitHub-Actions-aware rules
       # (${{ }} expression syntax, shellcheck on run: blocks). A YAML linter accepts
@@ -533,7 +533,7 @@ jobs:
       # GitHub's test merge of the PR into its base: the tree a squash merge puts on the base,
       # so its verdict is the post-merge push run's verdict. A PR behind its base can red here
       # with a clean head, when two branches' registers merge line by line into a file no
-      # rebuild produces; merging the base into the branch, `pnpm graph:refresh` and a commit
+      # rebuild produces; merging the base into the branch, `pnpm bkit:graph:refresh` and a commit
       # clear it. `check-at HEAD` rebuilds in a throwaway worktree of the checked-out commit —
       # the same primitive the pre-push gate runs — so the release installed, the script run
       # and the register judged all come from that one tree.
@@ -553,7 +553,7 @@ jobs:
           export PATH="$HOME/.local/bin:$PATH"
           if ! bash scripts/graphify/bkit-graphify.sh check-at HEAD; then
             if [ "$GITHUB_EVENT_NAME" = pull_request ]; then
-              echo "::error title=Capability register::Checked this PR merged into $GITHUB_BASE_REF. If the branch is behind $GITHUB_BASE_REF, merge $GITHUB_BASE_REF into it first, then pnpm graph:refresh, commit and push."
+              echo "::error title=Capability register::Checked this PR merged into $GITHUB_BASE_REF. If the branch is behind $GITHUB_BASE_REF, merge $GITHUB_BASE_REF into it first, then pnpm bkit:graph:refresh, commit and push."
             fi
             exit 1
           fi
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index 44716df5b..b5e417904 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -495,7 +495,7 @@ jobs:
           token: ${{ github.token }}
 
       # Installs the vale binary for bkit-cloud-bootstrap.sh's `vale sync` and the dispatched
-      # phase's lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
+      # phase's bkit:lint:prose (as the cloud.md web env's setup script does). Pinned tarball +
       # SHA mirror bkit-ci.yml.
       - name: Install vale
         env:
diff --git a/.husky/pre-commit b/.husky/pre-commit
index b5a6ceb9d..251820557 100755
--- a/.husky/pre-commit
+++ b/.husky/pre-commit
@@ -3,11 +3,11 @@
 # bkit install does not write this file and does not overwrite a copy.
 #
 # FAST local gate only: format staged files (seconds). Heavier gates
-# (typecheck/unit/format:check/prose), the enforcing slop gate (slop:delta) and the
+# (typecheck/unit/format:check/prose), the enforcing slop gate (bkit:slop:delta) and the
 # integration tier are in pre-push; E2E/@live run ONLY in CI (bkit-tests / bkit-tests-live,
 # enforced by bkit-tests-check) — see bkit-ci.yml § FULL CI SCAFFOLD REFERENCE. Rule: nothing
 # here that pre-push runs again, and nothing that takes more than a few seconds. (lint:slop is `slop-scan scan` — report-only, never
-# fails; the gate that fails on NEW findings is `slop:delta`, which runs in pre-push.)
+# fails; the gate that fails on NEW findings is `bkit:slop:delta`, which runs in pre-push.)
 #
 # WHAT it runs lives in package.json `bkit:gate:format`, not here — the same script
 # the bkit agent workflows dispatch through; change the gate there. Add repo-specific
diff --git a/.husky/pre-push b/.husky/pre-push
index e57b38f97..fae265848 100755
--- a/.husky/pre-push
+++ b/.husky/pre-push
@@ -340,7 +340,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
           if [ -n "$CAP_UNKNOWN" ]; then
             echo "[pre-push] WARNING: $CAP_DOC was NOT checked — $CAP_UNKNOWN, so whether '$CAP_BRANCH' has an open PR is unknown." >&2
             echo "[pre-push]    If a PR is open, CI's Check Capability Register fails it on a stale register; run" >&2
-            echo "[pre-push]    pnpm graph:refresh, commit, and push again." >&2
+            echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again." >&2
           fi
         fi
         ;;
@@ -350,11 +350,11 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
     if ! command -v graphify >/dev/null 2>&1; then
       echo "[pre-push] WARNING: $CAP_DOC was NOT checked — graphify is not installed." >&2
       echo "[pre-push]    CI's Check Capability Register checks it for $CAP_GATE_WHAT; if it reds there, run" >&2
-      echo "[pre-push]    pnpm graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
+      echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
       echo "[pre-push]    brew install uv && uv tool install '$(bash scripts/graphify/bkit-graphify.sh spec)'" >&2
     elif ! bash scripts/graphify/bkit-graphify.sh check-at "$CAP_GATE_SHA" < /dev/null; then
       echo "[pre-push] BLOCKED: $CAP_DOC is not what the pushed commit builds (diff above); CI fails $CAP_GATE_WHAT on it." >&2
-      echo "[pre-push] Fix: pnpm graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
+      echo "[pre-push] Fix: pnpm bkit:graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
       exit 1
     fi
   else
@@ -365,7 +365,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
       CAP_CHANGED=$(git diff --name-only "$CAP_SHA..HEAD" -- '*.ts' '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
       if [ "${CAP_CHANGED:-0}" -gt 0 ]; then
         echo "[pre-push] NOTE: $CAP_DOC diagrams were built at $CAP_SHA; $CAP_CHANGED source files changed since." >&2
-        echo "[pre-push]       Refresh when convenient:  pnpm graph:refresh" >&2
+        echo "[pre-push]       Refresh when convenient:  pnpm bkit:graph:refresh" >&2
         echo "[pre-push]       Not a gate on this branch until it has an open PR into dev; a push to dev is blocked until it is current." >&2
       fi
     fi
@@ -383,7 +383,7 @@ fi
 # the bkit agent workflows and prompts dispatch through. Edit the scripts, not this
 # hook. Fast repo extras go ABOVE, with `bkit check`; slow ones BELOW.
 # Min push: `bkit:gate:min` only. Revert path drops the suite only: prose
-# and slop:delta still run. Otherwise the deepest push gate package.json declares.
+# and bkit:slop:delta still run. Otherwise the deepest push gate package.json declares.
 if [ "$MIN_PUSH" = "1" ]; then
   echo "[pre-push] min push — bkit:gate:min instead of the full gate" >&2
   pnpm bkit:gate:min < /dev/null
diff --git a/.opencode/agents/bkit-build-plan-tests.md b/.opencode/agents/bkit-build-plan-tests.md
index b5c0f90d8..6aba058df 100644
--- a/.opencode/agents/bkit-build-plan-tests.md
+++ b/.opencode/agents/bkit-build-plan-tests.md
@@ -76,7 +76,7 @@ tools:
    - Take the import path, symbol names and signatures from the task's `CREATE`, `UPDATE` and `DONE WHEN` lines exactly; the code step builds to those names.
    - For each value the test checks or fakes, read the code that produces it where that code exists, and append `SOURCE — TASK {N}: {value} from {file}:{line}` with Bash `echo >>`. A fake that differs from what that code returns lets the test pass against code that fails for real.
    - Write the test at the file and under the test name the entry gives, asserting the behaviour its `Derived Test Matrix` row names.
-     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file.
+     - Give it that name as one literal string, not a name built when the tests run (a parameterised table name such as `it.each`, `@pytest.mark.parametrize` or a template string), because the engine finds and locks each planned test by its name in the file. A name given as a suite path (`suite > test`) is found by its last segment, so that segment is the test's literal name.
      - **If** the file already holds a test under that name → update that test. Add expectations, and never remove or loosen one: the engine records the test as `updated`, and verify fails an update that removes or loosens an expectation.
    - **If** `package.json` declares `bkit:lint:file` → run `pnpm bkit:lint:file {file}`, and fix the file until it exits 0.
    - **If** `package.json` declares `bkit:test:file` → run `pnpm bkit:test:file {file}` once. A failure, or a load error on an import the code step will create, is the expected result.
diff --git a/dist/checks/after/index.js b/dist/checks/after/index.js
index 843515761..863e42955 100644
--- a/dist/checks/after/index.js
+++ b/dist/checks/after/index.js
@@ -109,7 +109,7 @@ export function renderAdvisoriesMarkdown(findings, opts, suppressed = [], tips =
     // This is a generated, gitignored artifact — not authored prose. Advisory
     // strings (and reproduced config snippets like `.vale.ini`'s `write-good.So =
     // NO`) legitimately contain sentence-initial "So" and slop tokens. The shipped
-    // `lint:prose` globs on-disk `.agents/*.md`, so without this whole-file Vale
+    // `bkit:lint:prose` globs on-disk `.agents/*.md`, so without this whole-file Vale
     // skip the husky hooks fail on a file the consumer cannot edit.
     lines.push("<!-- vale off -->");
     lines.push("");
@@ -379,7 +379,7 @@ export function runPostInstallCheck(preflightAdvisories, cwd = process.cwd(), su
     const runLevels = detectRunLevelsNotComposed(cwd);
     if (runLevels)
         phase3.push(runLevels);
-    // vale missing while lint:prose runs the prose gate
+    // vale missing while bkit:lint:prose runs the prose gate
     const valeMissing = detectValeMissing(cwd);
     if (valeMissing)
         phase3.push(valeMissing);
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index b6292f112..425e4729a 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -15,7 +15,7 @@ function toolVersionRuns(cmd) {
     return res.status === 0;
 }
 /**
- * Detect a prose gate that cannot run here: package.json `lint:prose` calls `bkit ci prose`,
+ * Detect a prose gate that cannot run here: package.json `bkit:lint:prose` calls `bkit ci prose`,
  * which fails without vale, and vale is not on PATH. Null when the gate is not adopted.
  */
 export function detectValeMissing(cwd) {
@@ -24,7 +24,7 @@ export function detectValeMissing(cwd) {
         return null;
     const scripts = read.pkg["scripts"];
     const lintProse = typeof scripts === "object" && scripts !== null
-        ? scripts["lint:prose"]
+        ? scripts["bkit:lint:prose"]
         : undefined;
     if (typeof lintProse !== "string" || !lintProse.includes("bkit ci prose"))
         return null;
@@ -33,7 +33,7 @@ export function detectValeMissing(cwd) {
     return {
         id: "vale-not-installed",
         severity: "advisory",
-        detect: "package.json `lint:prose` runs `bkit ci prose`, but vale is not on PATH — the prose gate fails, so every pre-push gate that runs `lint:prose` fails on this machine.",
+        detect: "package.json `bkit:lint:prose` runs `bkit ci prose`, but vale is not on PATH — the prose gate fails, so every pre-push gate that runs `bkit:lint:prose` fails on this machine.",
         action: "Install vale, then download its styles:\n\n    brew install vale    # macOS; other platforms: https://vale.sh/docs/install\n    vale sync\n\nCI and the cloud templates install vale already; this is for local machines.",
     };
 }
@@ -59,7 +59,7 @@ export function detectValePackageNotSynced(cwd) {
         id: "vale-package-not-synced",
         severity: "advisory",
         detect: "vale is on PATH but .vale/styles/write-good/ is absent — vale packages not synced.",
-        action: "Run `vale sync` (one-time per repo) to download the write-good package. lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and fails if it cannot.",
+        action: "Run `vale sync` (one-time per repo) to download the write-good package. bkit:lint:prose tries to self-heal this (copy from the main worktree, then `vale sync`) and fails if it cannot.",
     };
 }
 /**
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 2c618e706..80ec75da0 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -114,7 +114,7 @@ export const SETUP_TIPS = [
         title: "Automatic checks on every change",
         line: "Nothing checks your changes automatically before they're merged, so broken code can land unnoticed. Add bkit's check workflow.",
         why: 'This runs your tests and checks on GitHub every time something changes, and bkit\'s ship step waits for it to pass before merging. Without it, "shipped" only means "merged", not "checked".',
-        ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
+        ask: "Copy .bkit/templates/.github/workflows/bkit-ci.yml to .github/workflows/<the file package.json `bkit.testing.ciWorkflow` names; default bkit-ci.yml>, replace `main` and `{{NODE_VERSION}}` in it with my default branch and Node major version, and add the `typecheck`, `lint`, `format:check`, `bkit:lint:prose`, `bkit:slop:delta` and `test` scripts to package.json as listed in .bkit/templates.md § Gate tool scripts.",
         steps: "`.bkit/templates.md` § CI workflow and § Gate tool scripts.",
         fires: (cwd) => !exists(cwd, `.github/workflows/${readBkitConfig(cwd).ciWorkflow}`),
     },
@@ -144,7 +144,7 @@ export const SETUP_TIPS = [
         title: "Catch junk code",
         line: "Nothing catches the junk code AI tends to write. Add slop-scan so new junk gets flagged before it's merged.",
         why: "Filler and dead code look fine when you skim a change, so they pile up unnoticed until the codebase is hard to trust. slop-scan flags only new problems, so it won't bury you in old ones.",
-        ask: 'Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"slop:delta": "bkit ci slop"` to the package.json scripts.',
+        ask: 'Run `pnpm add -D slop-scan`, copy .bkit/templates/slop-scan.config.json to slop-scan.config.json and .bkit/templates/scripts/slop/ to scripts/slop/, and add `"lint:slop": "slop-scan scan ."` and `"bkit:slop:delta": "bkit ci slop"` to the package.json scripts.',
         steps: "`.bkit/templates.md` § slop-scan.",
         fires: (cwd) => !exists(cwd, "slop-scan.config.json"),
     },
@@ -376,7 +376,7 @@ export const SETUP_TIPS = [
         title: "Tokens for apps opened from the Dock",
         line: "On a Mac, apps opened from the Dock don't see your sign-in tokens, so they start signed out even though the same thing works in the terminal. Add bkit's loader.",
         why: "The terminal loads your tokens, but apps started from the Dock or Finder skip that step. This one-time setup gives those apps the tokens too.",
-        ask: "Copy .bkit/templates/scripts/launchd/bkit-launchd-env.sh to scripts/launchd/, .bkit/templates/scripts/launchd/launchd.env.example to ~/.config/bkit/launchd.env and .bkit/templates/scripts/launchd/ai.bkit.launchd.plist to ~/Library/LaunchAgents/ (fill in its paths), then run `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.",
+        ask: "Copy .bkit/templates/scripts/launchd/bkit-launchd-env.sh to scripts/launchd/, .bkit/templates/scripts/launchd/bkit-launchd.env.example to ~/.config/bkit/launchd.env and .bkit/templates/scripts/launchd/bkit-launchd.plist to ~/Library/LaunchAgents/ai.bkit.launchd.plist (fill in its paths), then run `launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.",
         steps: "`.bkit/templates.md` § Launchd GUI environment.",
         fires: (cwd) => {
             if (process.platform !== "darwin" || isCloudOrCi())
diff --git a/dist/cli.js b/dist/cli.js
index ba34286a5..f9fcb11e4 100755
--- a/dist/cli.js
+++ b/dist/cli.js
@@ -642,7 +642,7 @@ Core (implicit — no flag; installed/upgraded on every install):
   .gitattributes managed blocks, docs/, .bkit/*.md, .bkit/version, the template copies in
   .bkit/templates/, and the bkit:gate:* / bkit:deps:* package.json scripts every workflow
   runs (added when missing, never overwritten, left by uninstall). The tool scripts those
-  gates chain (typecheck, lint, format:check, lint:prose, slop:delta) and their devDeps are
+  gates chain (typecheck, lint, format:check, bkit:lint:prose, bkit:slop:delta) and their devDeps are
   yours to add: see .bkit/templates.md.
 
 Module flags (composable; symmetric install ↔ uninstall):
diff --git a/dist/commands/ci/ci.js b/dist/commands/ci/ci.js
index d190ffb6c..40e042a1b 100644
--- a/dist/commands/ci/ci.js
+++ b/dist/commands/ci/ci.js
@@ -1,6 +1,6 @@
 // bkit ci — the gates CI and the git hooks run.
 //
-// `slop` — the enforcing slop gate (`slop:delta`). `lint:slop` (`slop-scan scan`) only
+// `slop` — the enforcing slop gate (`bkit:slop:delta`). `lint:slop` (`slop-scan scan`) only
 // reports. This gate checks the base ref out as a detached worktree, runs
 // `slop-scan delta` against the working tree, and fails when the change makes the repo
 // worse on NET: more findings, or a higher score. It gates on the net figures, not on
@@ -9,7 +9,7 @@
 // zero. The pre-existing baseline is never the change's to fix. On failure it names each
 // net-new or worsened finding (`path:line`, rule, message), with line shifts dropped.
 //
-// `prose` — the prose gate (`lint:prose`): Vale over the markdown files the globs
+// `prose` — the prose gate (`bkit:lint:prose`): Vale over the markdown files the globs
 // select. Restores the gitignored write-good package from the main worktree (else
 // `vale sync`) when it is missing, and fails when vale or write-good is unavailable.
 //
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 41a9d0513..2a4bc64b2 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -209,8 +209,9 @@ export function redEntries(file, workflow, group) {
 }
 /**
  * The planned tests of `group` a code step changed since their red: a test whose own lines
- * (`testBlock`) no longer hash to the recorded block. A test whose lines could not be found,
- * and rows written before per-test locking, compare the whole file's blob. Other edits to a
+ * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
+ * per-test locking, or when no line carried the name) derives the block from the recorded
+ * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
  * test file are free.
  */
 export function touchedTests(top, file, workflow, group) {
@@ -224,16 +225,26 @@ export function touchedTests(top, file, workflow, group) {
         return texts.get(test);
     };
     for (const t of redEntries(file, workflow, group).values()) {
-        if (t.block === undefined || t.block === null) {
+        let block = t.block ?? null;
+        if (block === null)
+            block = blockHash(blobText(top, t.blob), t.testName);
+        if (block === null) {
             if (git(top, ["hash-object", "--", t.test]) !== t.blob)
                 touched.push({ test: t.test, name: t.testName });
             continue;
         }
-        if (blockHash(textOf(t.test), t.testName) !== t.block)
+        if (blockHash(textOf(t.test), t.testName) !== block)
             touched.push({ test: t.test, name: t.testName });
     }
     return touched;
 }
+/** The text a recorded blob holds, untrimmed; null when the object store lacks it. */
+function blobText(top, blob) {
+    if (blob === null)
+        return null;
+    const res = spawnSync("git", ["cat-file", "-p", blob], { cwd: top, encoding: "utf-8" });
+    return res.status === 0 ? res.stdout : null;
+}
 /** Leading whitespace width, a tab counting as one column. */
 const indentOf = (line) => line.length - line.trimStart().length;
 /** A line that only closes the block opened at its own indent. */
@@ -278,8 +289,11 @@ export function testBlock(text, name) {
         const word = new RegExp(`(^|[^\\w])${escapeRegExp(name)}([^\\w]|$)`);
         at = testStart(lines, (l) => word.test(l));
     }
-    if (at < 0)
-        return null;
+    if (at < 0) {
+        // A suite path (`suite > test`, as a JUnit report names it): the last segment is the test.
+        const last = name.split(" > ").pop();
+        return last === name ? null : testBlock(text, last);
+    }
     let start = at;
     while (start > 0 &&
         /^["'`]/.test(lines[start].trimStart()) &&
diff --git a/dist/install/manifest.js b/dist/install/manifest.js
index ab0e390e3..f4aa1ad88 100644
--- a/dist/install/manifest.js
+++ b/dist/install/manifest.js
@@ -169,7 +169,7 @@ const CLAUDE_MANIFEST = [
 // Seeded by core on every install and upgrade (seedCorePackageJsonScripts,
 // install/modules/index.ts): add-if-missing, so a name already present is never touched,
 // and uninstall leaves every name in place. The tool scripts the defaults chain
-// (typecheck, lint, format:check, lint:prose, slop:delta, lint-staged) are the
+// (typecheck, lint, format:check, bkit:lint:prose, bkit:slop:delta, lint-staged) are the
 // consumer's to add — `.bkit/templates.md` lists them; the
 // `gate-missing-called-scripts` advisory names any that are missing.
 //
@@ -178,7 +178,7 @@ const CLAUDE_MANIFEST = [
 // directly, one step each.
 //
 // `lint:slop` is in no gate: `slop-scan scan` is report-only and never fails. The gate
-// that fails on new findings is `slop:delta`.
+// that fails on new findings is `bkit:slop:delta`.
 //
 // NOT SEEDED: the three deeper gates (…-integration, …-integration-e2e,
 // …-integration-e2e-live) are absent unless the consumer writes them. Each is one line
@@ -192,12 +192,12 @@ export const BKIT_GATE_SCRIPTS = {
     "bkit:gate:format": "pnpm lint-staged",
     // `.husky/pre-push` on a min push (every file is one bkit writes or `bkit.testing.minPushPaths` adds): no code, so
     // no typecheck, lint or tests. Off the chain. Add any test that reads a min-push file.
-    "bkit:gate:min": "pnpm format:check && pnpm lint:prose && pnpm slop:delta",
+    "bkit:gate:min": "pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta",
     // Everything that needs no test runner. Every part has a matching step in the
     // bkit-tests-static CI job; audits/templates/template-ci-yml.test.ts fails when one is missing.
     // Callers: build's plan-execute loop between tasks, and the `.husky/pre-push` revert
     // path.
-    "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta",
+    "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta",
     // The default local gate: `.husky/pre-push` (when no `…-integration` gate is declared),
     // build Steps 8 and 12, the remediates. `pnpm test` is the unit tier only: a test file the
     // integration gate also runs must not match it.
diff --git a/dist/install/modules/core.js b/dist/install/modules/core.js
index 2472cce72..092f92007 100644
--- a/dist/install/modules/core.js
+++ b/dist/install/modules/core.js
@@ -1173,7 +1173,7 @@ export function runCoreModule(ctx) {
                 "2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.\n\n" +
                 "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
                 "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
-                "lint, format:check, lint:prose, slop:delta) and the devDeps those need are yours to\n" +
+                "lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to\n" +
                 "add: see .bkit/templates.md.",
         });
     }
diff --git a/docs/capabilities.md b/docs/capabilities.md
index b79cb18f8..8d9db1be1 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -6,7 +6,7 @@
 >
 > **Rules:**
 >
-> - Generated — do not edit. `pnpm graph:refresh` rewrites this file.
+> - Generated — do not edit. `pnpm bkit:graph:refresh` rewrites this file.
 > - Source of truth: `scripts/graphify/bkit-graph-drift-rules.json`. Every status derived from live source, never typed.
 > - Add a capability = add a rule there: capability · lane · owner module · one literal marker.
 > - Markers literal, never regex, because `new Client(` as a regex is an unclosed group matching nothing.
@@ -27,8 +27,8 @@
 > - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `00e258265`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
-> - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `0fb462b53`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.
+> - Detail-level module graph → `pnpm bkit:graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
 
@@ -39,7 +39,7 @@ of them can turn out to be deliberate, because the scans prove a shape, never an
 the exact number of non-owner sites allowed per scope prefix, and its `note` says why that
 number is not zero. The moment the count moves in either direction — too many (a copy
 appeared) or too few (the budget is stale) — the row leaves `budgeted`, its Budget cell
-reads `over` or `stale`, and `pnpm graph:check` fails until the register is refreshed.
+reads `over` or `stale`, and `pnpm bkit:graph:check` fails until the register is refreshed.
 That is why the status can be quieter without being a place to hide work.
 
 It still gets a box in the diagrams, drawn solid and blue rather than dashed and amber. A
@@ -155,8 +155,8 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 00e2582656e3ae13f033200f4c006c17e75bc607 — do not edit
-  n_bkit_core[".bkit/core<br/>2890 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
+  %% Generated by bkit-graphify-rollup.py from 0fb462b53807bf12005a1ad027a3ac9045527540 — do not edit
+  n_bkit_core[".bkit/core<br/>2891 symbols · 127 files<br/>Cursor API access · 1 of 2 sites skip the owner"]
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   nscripts_harvest -->|21| n_bkit_core
   style n_bkit_core stroke:#65a30d,stroke-width:4px,stroke-dasharray:8 4,fill:#ffcc80,color:#1f2328
@@ -180,7 +180,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from 00e2582656e3ae13f033200f4c006c17e75bc607 — do not edit
+  %% Generated by bkit-graphify-rollup.py from 0fb462b53807bf12005a1ad027a3ac9045527540 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -260,7 +260,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_steps["steps<br/>62 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>21 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>104 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>105 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>72 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_workflows["workflows<br/>86 symbols · 1 files"]
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index e3cda35ce..b62f99754 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -168,3 +168,26 @@
 {"schema":3,"ts":1793580999469,"firstTs":1785400000004,"updates":5,"kind":"deferral","key":"397-dual-agent-same-run-double-ship-when-both-secrets-set","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/templates/.github/workflows/bkit-cloud.yml",".github/workflows/bkit-cloud.yml","119","245","397","719","719-cloud-router-dispatches-recorded-agent-only","804","docs/plans/202610/719-cloud-variants-add-plan.md Task 8","docs/plans/202610/719-cloud-variants-add-plan.md § Agent Execution Runbook (TASK 8)","docs/plans/202610/logs/719-cloud-variants-add/design-v1-draft.md § Architecture (Out of scope)","git show c9a58f73^:docs/plans/202607/logs/397-cloud-concurrency-arbitration/design-v1-draft.md"],"type":"issue","category":"agentic","severity":"HIGH","reason":"scope-declared","summary":"With two or three runner credentials set, one bkit-cloud run launched up to three agents that all dispatched /bkit-auto against the same PR","description":"The claude and opencode jobs were additive: both fired on the same event when both secrets were present, and #719's codex job would have made it three. One run, so workflow-level concurrency could not separate them, and the per-feature workflow lock does not arbitrate (logs/{FID}/.lock is a file in each runner's own checkout). Disposition: owner decision 719-cloud-router-dispatches-recorded-agent-only — the context job's Select agent job step starts only the job named by bkit.cloud.agent, and only when that agent's BKIT_ secret is set; other agents' secrets never start a job. Plan 719 TASK 8 builds it and its ctx-step tests prove one job per run.","remediation":"Close once plan 719 TASK 8 is merged: the Select agent job step in .bkit/templates/.github/workflows/bkit-cloud.yml sets exactly one of the claude / opencode / codex outputs.","source":"phase","status":"TRIAGED"}
 {"schema":3,"ts":1793580999470,"firstTs":0,"updates":8,"kind":"deferral","key":"384-mode-3-bookkeeping-e2e-deferred-to-341-live-run","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine/audits/workflows/ship-invariants.test.ts","341","341-live-run-verification-mode-1-and-mode-3","384","452","809","810","git show c9a58f73^:docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md"],"type":"issue","category":"testing","severity":"MEDIUM","reason":"hard-blocked","summary":"Mode-3 (cloud, RUNTIME_DEVPUSHES=false) BOOK_ROOT live-verification is not exercised in the ship bookkeeping E2E validation — both validated paths are local-mode (RUNTIME_DEVPUSHES=true)","description":"Prose contract is mechanically asserted by the Tier-2 invariant (.bkit/core/engine/audits/workflows/ship-invariants.test.ts BOOK_ROOT conditional presence check) and the Failure Path checks in .bkit/core/engine/audits/workflows/ship-invariants.test.ts, but the live path is unexercised. Blocker: mode-3 requires a cloud agent (Claude Code cloud / Cursor cloud) executing a ship workflow, which is not available in a local build session; the three-runtimes RUNTIME_DEVPUSHES live verification it depends on is itself still OPEN. Supersedes the same-key row that carried this prose in a free-text reason field, no description, lowercase severity, a friction-only scope field, a non-schema dependsOn field and ts 0.","remediation":"verify on the first mode-3 ship run: assert BOOK_ROOT resolves to the main checkout and the bookkeeping commit lands there, then close this row","source":"plan-3 Task 11 review-3 M1","status":"TRIAGED"}
 {"schema":3,"ts":1793580999471,"firstTs":1785400000001,"updates":4,"kind":"deferral","key":"397-ship-lane-reconciler-for-depth-1-queue-eviction","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["260","324","363","397","821","ISSUE-260 § Reliability R1 reconciliation","git show c9a58f73^:docs/plans/202607/logs/397-cloud-concurrency-arbitration/design-v1-draft.md"],"type":"feature","category":"infra","severity":"MEDIUM","reason":"scope-declared","summary":"Reconciler/sweeper to recover a ship displaced out of the depth-1 GHA concurrency queue","description":"GHA holds exactly one pending run per concurrency group; a third concurrent ship displaces the pending second. That PR stays green, open and merge-ready but never ships, and the displaced run executes no step so no bkit-authored notice, comment, label or ledger row can exist for it. #397 restates requirement 1 as met for N=2 only and accepts the N>=3 hole this cycle, because the allowlist ship discriminator removes the dominant eviction source (green dev CI entering the ship lane). The automated fix is an idempotent reconciler: sweep for green bkit:auto PRs with no in-flight ship and re-dispatch, riding the post-merge dev CI trigger #363 adds (which fires exactly when the ship lane frees).","remediation":"future issue after #397 lands: bump cloud job permissions to actions: write; cap the sweeper hard (max one dispatch per sweep, reuse #363's MAX_DEV_DISPATCH_ATTEMPTS bounding); make the admission probe and the sweep predicate call ONE shared implementation, not two similar gh run list invocations; keep the predicate stack-agnostic (workflow filename, never a consumer-editable CI display name). Belongs with #260's single-flight/idempotent-dispatch substrate.","source":"phase","status":"TRIAGED"}
+{"schema":3,"ts":1793583280378,"firstTs":1793150957700,"updates":2,"kind":"deferral","key":"715-no-batch-publish-verb","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"agentic","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"No `bkit ship --batch` verb; batching local builds stays a user script","description":"Issue #715's Out of scope excludes a batch command. Landing N held builds is either `/bkit-ship <ref>` per feature (full guarantees) or the user's own `git push`; bkit documents the recipe and ships no verb.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280379,"firstTs":1793150957701,"updates":2,"kind":"deferral","key":"715-build-docs-sync-stays-in-ship","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"Docs sync stays in `/bkit-ship`; build does not gain or duplicate it","description":"Issue #715's Out of scope keeps docs sync in ship. A held build prints `Docs: not synced (ship syncs on landing)`; ship's existing sync remains the only writer.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280380,"firstTs":1793150957702,"updates":2,"kind":"deferral","key":"715-build-verification-unchanged","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"agentic","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"Build verification, challenge, guard, worktree and dev-push behaviour stay as they are","description":"Issue #715's Out of scope leaves the build verification chain, challenge round, local gate, worktree isolation and dev push untouched. Only the ending varies.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280381,"firstTs":1793150957703,"updates":2,"kind":"deferral","key":"715-debug-publish-mode-unchanged","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"agentic","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"Debug's PUSH_MODE and CI-wait behaviour are unchanged","description":"Issue #715's Out of scope leaves debug's `PUSH_MODE` handling and CI-wait path alone; only build gains the publish ending.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280382,"firstTs":1793150957704,"updates":2,"kind":"deferral","key":"715-tracker-label-definitions-unchanged","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"agentic","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"Existing GitHub label definitions are not deleted; only the rules that name them change","description":"Issue #715's Out of scope leaves already-created tracker label definitions in place. Removing `next:*:lite` from the rules and prompts stops new writes; a consumer may delete its own label definitions.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280383,"firstTs":1793151664137,"updates":2,"kind":"deferral","key":"715-consumer-lite-content-migration","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Out of scope","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"A consumer's lite content is preserved, not migrated into a lite workflow","description":"Issue #715's Out of scope limits the work to preserving a consumer's section. The migration writes a consumer-owned stub; it never converts a lite prompt into a full workflow, and it does not load or rewrite consumer instructions.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280384,"firstTs":1793151664138,"updates":2,"kind":"deferral","key":"715-historical-audit-report-mentions","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715","https://github.com/cbartens/bkit/issues/715","docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md § Success criteria","closed: owner sign-off 2026-11-02 (#824): a deliberate #715 non-goal, not deferred work"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","status":"CLOSED","summary":"Dated audit reports keep their lite mentions as historical records","description":"Issue #715's Success criteria exempts historical records (ledgers, CHANGELOG, closed issues). The dated `docs/audits/202610/*.md` reports are records of what was audited at that commit; rewriting them would falsify the record. Only current docs, prompts, workflows and label rules change.","source":"docs/plans/202610/logs/715-retire-lite-workflows/plan-input-1.md"}
+{"schema":3,"ts":1793583280385,"firstTs":1783235824553,"updates":3,"kind":"deferral","key":"pending-factory-reset-uninstall-mode","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["closed: owner sign-off 2026-11-02 (#824): not wanted"],"type":"feature","category":"agentic","description":"Factory-reset uninstall mode [reason added by deferrals audit docs/audits/202611/deferrals.md § Defects, #807]","source":"phase","status":"CLOSED","severity":"LOW","reason":"own-cycle"}
+{"schema":3,"ts":1793583280386,"firstTs":1783235824564,"updates":3,"kind":"deferral","key":"pending-bkit-upgrade-prune-flag-deferred-post-v2-0-0","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["closed: owner sign-off 2026-11-02 (#824): not wanted"],"type":"feature","category":"agentic","description":"bkit upgrade --prune flag — deferred post-v2.0.0 [reason added by deferrals audit docs/audits/202611/deferrals.md § Defects, #807]","source":"phase","status":"CLOSED","severity":"LOW","reason":"own-cycle"}
+{"schema":3,"ts":1793583280387,"firstTs":1783235824571,"updates":3,"kind":"deferral","key":"pending-143-script-naming-rename-typecheck-check-type-format-c","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["closed: owner sign-off 2026-11-02 (#824): not wanted"],"type":"feature","category":"infra","description":"#143 script-naming rename (typecheck -> check:type, format:check -> check:format, lint/check/test umbrellas) [reason added by deferrals audit docs/audits/202611/deferrals.md § Defects, #807]","source":"human","status":"CLOSED","severity":"LOW","reason":"needs-decision"}
+{"schema":3,"ts":1793583280388,"firstTs":1793089178643,"updates":3,"kind":"deferral","key":"705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-status-ts-468","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["705-build-plan-convert","#824","fixed in 00e258265 (#824 Task 2): status.ts help names Steps 11 and 12"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit status resume` output help still describes the challenge as Step 10","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/status.ts:468: `bkit status resume` output help still describes the challenge as Step 10. Done when: the `challengeRound` description reads \"the round Step 11's challenge runs as\" and the `challengeDone` description reads \"so Step 11 goes on to Step 12\" — matching `WORKFLOW_STEPS.build` (challenge 11, Run Tests 12). Rebuild `dist/` in the same commit (engine TS edited).","source":".bkit/core/engine/commands/workflow/status.ts:536","status":"CLOSED"}
+{"schema":3,"ts":1793583280389,"firstTs":1793089178644,"updates":3,"kind":"deferral","key":"705-build-plan-convert-challenge-low-bkit-core-engine-install-manifest-ts-252","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["705-build-plan-convert","#824","fixed in 00e258265 (#824 Task 2): manifest.ts:253 names build Steps 8 and 12"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Engine source comments still cite the pre-renumbering build steps","description":"LOW build challenge finding at .bkit/core/engine/install/manifest.ts:252: Engine source comments still cite the pre-renumbering build steps. Done when: `manifest.ts:252` reads \"build Step 12, the remediates\" (Run Tests moved 11→12), `manifest.ts:286` reads \"What `/bkit-build` Step 12 will run\" (the gate ladder runs at Run Tests), `checks/after/index.ts:365` reads \"build Step 15\" (Summary moved 14→15), `checks/before/repo.ts:186` reads \"`/bkit-build` Step 4 converts it\" (convert moved 3→4), and `challenge.ts:53` reads \"The reviewers Step 11 runs\" (challenge moved 10→11). Rebuild `dist/` in the same commit (engine TS edited).","source":".bkit/core/engine/install/manifest.ts:253","status":"CLOSED"}
+{"schema":3,"ts":1793583280390,"firstTs":1793046829712,"updates":3,"kind":"deferral","key":"703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-decisions-ts-52","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["703-standardise-question-option","#824","fixed in 00e258265 (#824 Task 3): compose refuses more than 26 options"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`letterAt` walks past `Z` into punctuation, so an item with 27+ options composes `Options: … / [) {option}` and the file no longer round-trips through `parseDecisionItems`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/decisions.ts:52: `letterAt` walks past `Z` into punctuation, so an item with 27+ options composes `Options: … / [) {option}` and the file no longer round-trips through `parseDecisionItems`. Done when: `bkit decisions compose` either refuses an item whose option count exceeds the letters it renders (`EXIT.USAGE`, alongside the existing `recommended must be one of its options` check) or letters it unambiguously, so no composed file carries an entry `bareName` (`^[A-Z]\\)`) fails to strip — the composed file's `options` and `recommended` compare equal to the caller's names after a `parseDecisionItems` round trip at every option count.","source":".bkit/core/engine/commands/workflow/decisions.ts:53","status":"CLOSED"}
+{"schema":3,"ts":1793583280391,"firstTs":1793501859358,"updates":3,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-232","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715-retire-lite-workflows","#824","fixed in 00e258265 (#824 Task 4): takeLock renames a stale lock aside and restores one created after the stale check"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/disk.ts:232: Two `--wait` sweeps polling every 5s that both find a dead or hour-old holder can each `rmSync` the other's fresh lock in `takeLock` (stat → read → rm → create is not atomic), so two sweeps run the same irreversible delete steps at once. Done when: `takeLock` replaces a stale lock atomically (e.g. `renameSync` the stale file to a unique name and verify it still holds the stale holder line before `tryCreate`, or re-read the holder immediately before removal and abort when it changed), so a lock another process created after this one's `statSync` is never removed; the existing \"replaces a lock whose process is gone, or that is an hour old\" case still passes.","source":".bkit/core/engine/commands/workflow/disk.ts:229","status":"CLOSED"}
+{"schema":3,"ts":1793583280392,"firstTs":1793501859359,"updates":3,"kind":"deferral","key":"715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["715-retire-lite-workflows","#824","closed: owner decision 2026-11-02 (#824 Task 5): kept as is; the session-prompt publish token overriding publish.local is the documented behaviour (.bkit/workflows.md § Publish resolution)"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/status.ts:269: A `publish=true` substring anywhere in the verbatim session prompt (pasted issue text, a log excerpt, or a negation such as \"do not use publish=true\") overrides a durable `bkit.workflows.build.publish.local: false`, so untrusted pasted text flips a held local build into a push and an open PR. Done when: The owner decides whether prompt text may raise a configured hold to a publish. No agent can settle it, because the confirmed plan (Breaking Changes, \"Session token (new)\" row, and Edge Cases \"Token and config disagree\") makes the substring token win over config, and docs/security.md § Untrusted Content & Prompt Injection treats pasted content as untrusted. The decision to make: either a token may only lower `publish` (a `publish=true` token cannot override `publish.local: false`), or the token must stand alone (its own line or the bracket form) so text embedded in pasted content does not match; `publishRoute` then follows that rule.","source":".bkit/core/engine/commands/workflow/status.ts:304","status":"CLOSED"}
+{"schema":3,"ts":1793583280393,"firstTs":1783235824565,"updates":3,"kind":"deferral","key":"pending-drop-decorative-cursor-hooks-json-echo-commands-deferre","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#824","closed: owner decision 2026-11-02 (#824 Task 1): no migration; the echo hook stays"],"type":"feature","category":"agentic","description":"Drop decorative `.cursor/hooks.json` echo commands — deferred per Plan-Phase Decision 3","source":"phase","status":"CLOSED","severity":"LOW","reason":"scope-declared"}
+{"schema":3,"ts":1793583280394,"firstTs":1784944454274,"updates":4,"kind":"deferral","key":"341-live-run-verification-mode-1-and-mode-3","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["341","git show c9a58f73^:docs/plans/202607/341-three-runtimes-plan-6.md","git show c9a58f73^:docs/plans/202607/341-three-runtimes-design.md","#810"],"type":"issue","category":"agentic","summary":"A real /bkit-design or /bkit-plan close has not been run on a laptop (mode 1) or in a claude.ai cloud session (mode 3) since the close path was restructured","description":"The restructure makes CAN_PUSH_DEV=true replay the pre-change local block verbatim (local squash-merge, docs({FID}): {phase} DONE bkit [skip ci], direct dev push, worktree teardown), so mode 1 and mode 2 execute the code path that already worked. That is asserted structurally (commit subjects diffed byte-for-byte against dev; full suite green) but not yet exercised end-to-end. The PR-merge branch (mode 3) has no non-live coverage at all — it needs an actual claude.ai session to confirm the PR create/merge, the auto-delete-head-branches cleanup, and the adopt-mode worktree skip. [type was \"verification\", outside the deferral enum; set to \"issue\" per deferrals audit 202611 deferrals-21]","remediation":"Before merge: run one real /bkit-design or /bkit-plan cycle on the laptop and confirm the close lands docs({FID}): ... DONE bkit [skip ci] on dev with no CI run dispatched, and that ship completes with a dirty dev tree (the AHEAD_NON_SKIP path). After merge: run one phase from a claude.ai cloud session and confirm the PR-path close.","source":"phase","status":"TRIAGED","severity":"MEDIUM","reason":"hard-blocked"}
+{"schema":3,"ts":1793583280395,"firstTs":1792630606821,"updates":3,"kind":"deferral","key":"650-debug-dev-ci-live-round-trip","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["650","docs/plans/202610/logs/650-workflows-prompt-alone/plan-v2-reviewed.md (Out of Scope, Manual Verification Step 6)","341-live-run-verification-mode-1-and-mode-3",".bkit/core/workflows/bkit-debug.md","#810"],"type":"issue","category":"agentic","severity":"MEDIUM","reason":"hard-blocked","summary":"No real round-trip proves debug on dev waits for and gates the dev CI run on the SHA its own-commit push landed","description":"Blocker: a real round-trip needs a GitHub repo with Actions and a dev branch the build agent may push to; the agent cannot create one or push a real dev without explicit human confirmation. #650 (Q1.3) makes debug on dev push only its own commits (plain push or pushToDev replay), then dispatch, wait for and gate the dev CI run on the pushed SHA. With a replay the landed SHA is a new commit, not local HEAD. Unit rows pin the hand-off (branches push reports the pushToDev SHA; debug Step 11 dispatches, waits and gates on it) against a stub gh; nothing yet runs it against real GitHub Actions. [type was \"verification\", outside the deferral enum; set to \"issue\" per deferrals audit 202611 deferrals-21]","remediation":"Run /bkit-debug ci failures on dev once in a tracker-wired scratch consumer with a red dev CI run and one unpushed foreign local commit; confirm gh run list --branch dev --commit {SHA} shows the waited-on run for the landed SHA and the foreign commit stays local (plan 650 Manual Verification Step 6).","source":"phase","status":"TRIAGED"}
+{"schema":3,"ts":1793583541551,"firstTs":1783235824558,"updates":3,"kind":"deferral","key":"pending-per-pr-opt-in-alternative-to-bkit-auto-route-linear-label","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["docs/plans/202605/bar-148-option-1-plan.md § Alternative Approaches & Recommendations (line 201; file removed in c9a58f733, read at 0fd9ef37f)"],"reason":"scope-declared","type":"feature","category":"agentic","description":"Per-PR opt-in alternative to `bkit:auto` tracker label","source":"phase","status":"OPEN","severity":"LOW"}
+{"schema":3,"ts":1793583541552,"firstTs":1783235824568,"updates":3,"kind":"deferral","key":"pending-ci-lint-guarding-against-agents-scripts-agents-template","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":[".bkit/core/engine","docs/plans/202605/logs/160-centralise-install-code/plan-scope-check-2.md § O-5 (the plan draft's Out of Scope named the lint; file removed in c9a58f733, read at 0fd9ef37f)"],"type":"feature","category":"testing","description":"CI lint guarding against `.agents/scripts`/`.agents/templates` source-literal re-introduction in `.bkit/core/engine`","source":"phase","status":"OPEN","severity":"LOW","reason":"scope-declared"}
+{"schema":3,"ts":1793583541553,"firstTs":1792985807437,"updates":2,"kind":"deferral","key":"700-first-action-deny-gate","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"First-action deny gate: deny Edit / Write / Bash until a read of `.agents/rules.md` is observed","description":"Idea 2 from #700. A hard guarantee across hosts, built on the GateGuard before-hook plus ReadGuard's per-session read log (`.bkit/core/hooks/gateguard-engine.js`, `.bkit/core/hooks/readguard-engine.js`). Blocked by Claude Code `SessionStart` being unable to block and by the absence of a shared gate across every host.","remediation":"Needs a cross-host gate primitive and a per-session read log of `.agents/rules.md`; design as its own feature."}
+{"schema":3,"ts":1793583541554,"firstTs":1792985807438,"updates":2,"kind":"deferral","key":"700-rules-content-hash-acknowledgement","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Content-hash acknowledgement: stamp the `.agents/rules.md` hash at read time and force a re-read when it changes","description":"Idea 3 from #700. Records the read's hash so a changed rules file invalidates the acknowledgement. Pairs with the first-action deny gate (`700-first-action-deny-gate`) and needs the same per-session read log.","remediation":"Depends on the deny-gate's per-session read log; design together with that feature."}
+{"schema":3,"ts":1793583541555,"firstTs":1792985807439,"updates":2,"kind":"deferral","key":"700-provider-auto-load-rules","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"utility","step":"manual"},"references":["#700","docs/plans/202610/700-session-start-nudge-plan.md § Out of Scope","docs/plans/202610/logs/700-session-start-nudge/build-input-1.md § Out of Scope"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","status":"OPEN","summary":"Provider auto-load: include `.agents/rules.md` as context via host config (opencode `instructions`, `CLAUDE.md` `@` import)","description":"Idea 4 from #700. The most reliable 'read' but spends context budget on every session, on top of the advisory this plan adds.","remediation":"Measure the per-session context cost on each host before adopting; design as its own feature."}
diff --git a/docs/templates/bkit-audit-duplication.md b/docs/templates/bkit-audit-duplication.md
index 8320f4ebb..7f0c41e32 100644
--- a/docs/templates/bkit-audit-duplication.md
+++ b/docs/templates/bkit-audit-duplication.md
@@ -292,14 +292,14 @@ PENDING
 
 ## Project Instructions
 
-- **Permissions:** Read-only probes this audit uses, none blocked here: `git`, `rg`, `npx --yes -p @ast-grep/cli ast-grep`, `npx --yes jscpd`, `pnpm graph:check`, `pnpm dedupe --check`, `pnpm why`, `python3 -I`, `jq`, Serena MCP (TypeScript language server), WebFetch / WebSearch for anchor standards. No credentialed CLI or tracker read needed.
+- **Permissions:** Read-only probes this audit uses, none blocked here: `git`, `rg`, `npx --yes -p @ast-grep/cli ast-grep`, `npx --yes jscpd`, `pnpm bkit:graph:check`, `pnpm dedupe --check`, `pnpm why`, `python3 -I`, `jq`, Serena MCP (TypeScript language server), WebFetch / WebSearch for anchor standards. No credentialed CLI or tracker read needed.
 - **Pre-Flight / Dependencies:**
   - Text Search: source roots `.bkit/core/engine` / `.bkit/core/hooks`.
   - Structural Search: `npx --yes -p @ast-grep/cli ast-grep scan --no-ignore hidden --rule <rule.yml> .bkit/core/engine --json=stream`. The bare `npx --yes @ast-grep/cli` form fails ("could not determine executable to run"); `--no-ignore hidden` is required for `.bkit/`.
-  - Module Graph / Capability Register: `pnpm graph:check` only (rebuilds into a throwaway copy and compares with `docs/capabilities.md`); never `pnpm graph:update` / `pnpm graph:rollup`. Drift rules: `scripts/graphify/bkit-graph-drift-rules.json`. Duplicate-name check: read `docs/graphify-out/graph.json` with `python3 -I` (node keys `_callable`, `label`, `source_file`, `source_location`).
+  - Module Graph / Capability Register: `pnpm bkit:graph:check` only (rebuilds into a throwaway copy and compares with `docs/capabilities.md`); never `pnpm bkit:graph:update` / `pnpm bkit:graph:rollup`. Drift rules: `scripts/graphify/bkit-graph-drift-rules.json`. Duplicate-name check: read `docs/graphify-out/graph.json` with `python3 -I` (node keys `_callable`, `label`, `source_file`, `source_location`).
   - Change coupling: code-maat is not installed; use `git log --since=<window start> --no-merges --name-only`. History before 2026-10-10 lives under pre-`.bkit/core/engine` paths; reach it with `git log --follow` per file.
   - zsh `PIPESTATUS` is empty: take `$?` from a run redirected to a file.
-- **Step 2 — Detect:** Engine layout per `docs/architecture.md`, but `ls .bkit/core/engine/shared` rather than trusting its file list. Host hooks: shared engines `.bkit/core/hooks/*.js`, per-host templates `.bkit/core/{.claude,.cursor,.codex,.agents/plugins/bkit}/hooks/` and `.bkit/core/.opencode/plugin/`, combined by `.bkit/core/engine/render/parts.ts`. Template ↔ root copies (`.bkit/templates/scripts/**` ↔ `scripts/**`, root configs) are deliberate and guarded by `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`. Existing duplication gates: slop-scan `structure.duplicate-function-signatures` (`slop-scan.config.json`), `pnpm graph:check` (`.github/workflows/bkit-ci.yml`), cross-host verdict tables in `.bkit/core/engine/install/modules/index.integration.test.ts`.
+- **Step 2 — Detect:** Engine layout per `docs/architecture.md`, but `ls .bkit/core/engine/shared` rather than trusting its file list. Host hooks: shared engines `.bkit/core/hooks/*.js`, per-host templates `.bkit/core/{.claude,.cursor,.codex,.agents/plugins/bkit}/hooks/` and `.bkit/core/.opencode/plugin/`, combined by `.bkit/core/engine/render/parts.ts`. Template ↔ root copies (`.bkit/templates/scripts/**` ↔ `scripts/**`, root configs) are deliberate and guarded by `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`. Existing duplication gates: slop-scan `structure.duplicate-function-signatures` (`slop-scan.config.json`), `pnpm bkit:graph:check` (`.github/workflows/bkit-ci.yml`), cross-host verdict tables in `.bkit/core/engine/install/modules/index.integration.test.ts`.
 - **Step 3 — Rule Altitude:** Keep rules under `tmp/audit-duplication/rules/`. Shared homes to subtract from: `.bkit/core/engine/shared/*.ts`, `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/ledgers/telemetry.ts`. For `package.json` `bkit` reads, exclude the writer sites (install / uninstall / `install/modules/cloud.ts`) from the inline set.
 - **Step 4 — Clones:** `npx --yes jscpd <pass flags> -a --min-tokens 50 --format typescript,javascript,python,bash --ignore '**/*.test.ts,**/*.test.mjs,**/dist/**,**/node_modules/**' --reporters json --output tmp/audit-duplication/<pass> --report-name <pass> --no-tips --silent .bkit/core/engine .bkit/core/hooks .bkit/core/.claude .bkit/core/.cursor .bkit/core/.codex .bkit/core/.agents .bkit/core/.opencode .bkit/templates/scripts scripts`. Pass flags: Type-1 `--mode strict`; Type-2 `--mode weak --ignore-identifiers --ignore-literals --kind renamed`; Type-3 `--mode weak --similarity 0.85 --kind ast`. `-a` (absolute paths) is needed to map clones to areas. Drop `.bkit/templates/scripts/**` ↔ `scripts/**` pairs before per-area %. Keep the root-level rendered hooks (`.claude/hooks`, `.agents/plugins/bkit/hooks`, …) out of the roots — they are install output.
 - **Step 5 — Capability Altitude:** Serena `find_referencing_symbols` covers `.ts` owners; hook engines (`.js`) and generated `.cjs` need text search.
diff --git a/package.json b/package.json
index 9b8decd95..2a48910ad 100644
--- a/package.json
+++ b/package.json
@@ -54,8 +54,8 @@
   "license": "MIT",
   "scripts": {
     "bkit:gate:format": "pnpm lint-staged",
-    "bkit:gate:min": "pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta && vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts",
-    "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta",
+    "bkit:gate:min": "pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta && vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts",
+    "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta",
     "bkit:gate:static-unit": "pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats",
     "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration",
     "bkit:gate:install-static-unit-build": "pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build",
@@ -63,7 +63,7 @@
     "bkit:deps:audit": "pnpm audit",
     "bkit:test:file": "node scripts/ci/bkit-test-file.mjs",
     "bkit:gate:changed": "node scripts/gate/bkit-gate-changed.mjs",
-    "bkit:generate": "pnpm build && pnpm cli:sync && pnpm instructions:sync && pnpm bkit upgrade && vitest run .bkit/core/engine/render -u && bash -c 'if command -v graphify >/dev/null 2>&1; then pnpm graph:refresh; else echo \"[bkit] graphify missing — skipping the capability register (install graphify to rebuild docs/capabilities.md)\"; fi'",
+    "bkit:generate": "pnpm build && pnpm cli:sync && pnpm instructions:sync && pnpm bkit upgrade && vitest run .bkit/core/engine/render -u && bash -c 'if command -v graphify >/dev/null 2>&1; then pnpm bkit:graph:refresh; else echo \"[bkit] graphify missing — skipping the capability register (install graphify to rebuild docs/capabilities.md)\"; fi'",
     "bkit:lint:file": "oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern",
     "bkit": "node dist/cli.js",
     "typecheck": "tsc --noEmit && pnpm bkit:typecheck:tests",
@@ -73,9 +73,9 @@
     "format:check": "prettier --check .",
     "format:tables": "node scripts/prettier/bkit-insert-ignore.mjs .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit",
     "format:tables:check": "node scripts/prettier/bkit-insert-ignore.mjs --check .agents docs README.md .bkit/instructions.md .bkit/shared .bkit/core/.agents .bkit/core/docs .bkit/core/.bkit",
-    "lint:prose": "bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'",
+    "bkit:lint:prose": "bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/shared/docs/**/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'",
     "lint:slop": "slop-scan scan .",
-    "slop:delta": "bkit ci slop",
+    "bkit:slop:delta": "bkit ci slop",
     "bkit:lint:workflows": "bash -c 'if command -v actionlint >/dev/null 2>&1; then actionlint; else echo \"[bkit] actionlint missing — skipping workflow lint (install actionlint to enable)\"; fi'",
     "test": "vitest run",
     "harvest": "tsx scripts/harvest/bkit-harvest.mjs",
@@ -85,15 +85,15 @@
     "bkit:test:bats": "pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output \"$BKIT_TEST_REPORT_DIR\"} tests/*.bats",
     "build": "tsc && chmod +x dist/cli.js",
     "bkit:check:dist": "rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/ || (echo '[bkit] dist/ is stale — run pnpm build and commit the result' && exit 1)",
-    "graph": "bash scripts/graphify/bkit-graphify.sh build",
-    "graph:check": "bash scripts/graphify/bkit-graphify.sh check",
-    "graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
-    "graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
-    "graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
-    "graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
-    "graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
-    "graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
-    "graph:update": "bash scripts/graphify/bkit-graphify.sh update",
+    "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
+    "bkit:graph:check": "bash scripts/graphify/bkit-graphify.sh check",
+    "bkit:graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
+    "bkit:graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
+    "bkit:graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
+    "bkit:graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
+    "bkit:graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
+    "bkit:graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
+    "bkit:graph:update": "bash scripts/graphify/bkit-graphify.sh update",
     "bkit:audit:status": "tsx .bkit/core/engine/checks/status-holes.ts docs/plans/*/logs/*/status.jsonl",
     "grammar:density": "tsx .bkit/core/engine/tools/grammar-density.ts",
     "instructions:show": "tsx .bkit/core/engine/tools/instructions.ts --show",
diff --git a/scripts/graphify/bkit-graph-drift.py b/scripts/graphify/bkit-graph-drift.py
index 0d16b665c..e66583c16 100644
--- a/scripts/graphify/bkit-graph-drift.py
+++ b/scripts/graphify/bkit-graph-drift.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Compute per-capability drift status by literal-pattern scan, for the generated diagram.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Reads
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Reads
 bkit-graph-drift-rules.json, walks the source tree once, and writes an overlay JSON
 that bkit-graphify-rollup.py paints onto the Mermaid nodes.
 
diff --git a/scripts/graphify/bkit-graph-eager.py b/scripts/graphify/bkit-graph-eager.py
index c7947d3a3..b3929dbe3 100644
--- a/scripts/graphify/bkit-graph-eager.py
+++ b/scripts/graphify/bkit-graph-eager.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Find modules that do work when they are imported, and count who pays for it.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON that
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON that
 bkit-graphify-rollup.py renders as the import-time side-effect table in
 docs/capabilities.md.
 
@@ -135,7 +135,7 @@ def inside_callable(path, line):
 # --- who imports this, transitively -------------------------------------------
 # graph.json already carries the imports graphify cannot resolve — a `.js`
 # specifier never reaching a `.tsx` file, and workspace subpaths through an
-# `exports` map. bkit-graph-repair.py injects them during `pnpm graph`, so they are
+# `exports` map. bkit-graph-repair.py injects them during `pnpm bkit:graph`, so they are
 # read here like any other edge; warns if graph.json lacks any of them.
 INBOUND = collections.defaultdict(set)
 for link in raw["links"]:
@@ -232,5 +232,5 @@ print(f"[eager] {REPAIRED} of those edges came from bkit-graph-repair.py — imp
       f"graphify cannot resolve (.js -> .tsx, workspace exports subpaths)")
 if ungraphed:
     print(f"[eager] {ungraphed} scanned files absent from graph.json (column-0 filter only) "
-          f"— run 'pnpm graph:update' to close the gap", file=sys.stderr)
+          f"— run 'pnpm bkit:graph:update' to close the gap", file=sys.stderr)
 print(f"[eager] wrote {args.eager_out}", file=sys.stderr)
diff --git a/scripts/graphify/bkit-graph-imports.py b/scripts/graphify/bkit-graph-imports.py
index 2d83a4b47..889c3ff00 100644
--- a/scripts/graphify/bkit-graph-imports.py
+++ b/scripts/graphify/bkit-graph-imports.py
@@ -9,7 +9,7 @@ the sibling `graph-*.py` scripts, which are standalone and cannot be imported
 themselves.
 
 ONE WRITER. `bkit-graph-repair.py` is the only script that writes
-`resolved_import_edges()` into graph.json, during `pnpm graph`, so `graphify affected` /
+`resolved_import_edges()` into graph.json, during `pnpm bkit:graph`, so `graphify affected` /
 `explain` / `path` / `query` see the same edges these scripts do. bkit-graph-eager.py
 and bkit-graphify-rollup.py call `warn_if_unrepaired()`, which compares the same set
 against graph.json, and otherwise just read the graph.
@@ -147,7 +147,7 @@ def warn_if_unrepaired(graph, who, stream=None):
     if missing:
         print(f"[{who}] WARNING: graph.json lacks {len(missing)} imports that "
               f"bkit-graph-repair.py adds, so reachability and blast-radius numbers "
-              f"below are UNDERSTATED. Run 'pnpm graph:update'.",
+              f"below are UNDERSTATED. Run 'pnpm bkit:graph:update'.",
               file=stream or _sys.stderr)
     return repair_state(graph)
 
diff --git a/scripts/graphify/bkit-graph-pre-push.sh b/scripts/graphify/bkit-graph-pre-push.sh
index ce7a555ac..f1a013d6d 100755
--- a/scripts/graphify/bkit-graph-pre-push.sh
+++ b/scripts/graphify/bkit-graph-pre-push.sh
@@ -60,7 +60,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
           if [ -n "$CAP_UNKNOWN" ]; then
             echo "[pre-push] WARNING: $CAP_DOC was NOT checked — $CAP_UNKNOWN, so whether '$CAP_BRANCH' has an open PR is unknown." >&2
             echo "[pre-push]    If a PR is open, CI's Check Capability Register fails it on a stale register; run" >&2
-            echo "[pre-push]    pnpm graph:refresh, commit, and push again." >&2
+            echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again." >&2
           fi
         fi
         ;;
@@ -70,11 +70,11 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
     if ! command -v graphify >/dev/null 2>&1; then
       echo "[pre-push] WARNING: $CAP_DOC was NOT checked — graphify is not installed." >&2
       echo "[pre-push]    CI's Check Capability Register checks it for $CAP_GATE_WHAT; if it reds there, run" >&2
-      echo "[pre-push]    pnpm graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
+      echo "[pre-push]    pnpm bkit:graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
       echo "[pre-push]    brew install uv && uv tool install '$(bash scripts/graphify/bkit-graphify.sh spec)'" >&2
     elif ! bash scripts/graphify/bkit-graphify.sh check-at "$CAP_GATE_SHA" < /dev/null; then
       echo "[pre-push] BLOCKED: $CAP_DOC is not what the pushed commit builds (diff above); CI fails $CAP_GATE_WHAT on it." >&2
-      echo "[pre-push] Fix: pnpm graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
+      echo "[pre-push] Fix: pnpm bkit:graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
       exit 1
     fi
   else
@@ -85,7 +85,7 @@ if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
       CAP_CHANGED=$(git diff --name-only "$CAP_SHA..HEAD" -- '*.ts' '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
       if [ "${CAP_CHANGED:-0}" -gt 0 ]; then
         echo "[pre-push] NOTE: $CAP_DOC diagrams were built at $CAP_SHA; $CAP_CHANGED source files changed since." >&2
-        echo "[pre-push]       Refresh when convenient:  pnpm graph:refresh" >&2
+        echo "[pre-push]       Refresh when convenient:  pnpm bkit:graph:refresh" >&2
         echo "[pre-push]       Not a gate on this branch until it has an open PR into dev; a push to dev is blocked until it is current." >&2
       fi
     fi
diff --git a/scripts/graphify/bkit-graph-repair.py b/scripts/graphify/bkit-graph-repair.py
index 65a8ea47b..9e809362b 100644
--- a/scripts/graphify/bkit-graph-repair.py
+++ b/scripts/graphify/bkit-graph-repair.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Inject the import edges graphify could not resolve back into graph.json.
 
-Called by `pnpm graph`, `:clean` and `:update` (scripts/graphify/bkit-graphify.sh),
+Called by `pnpm bkit:graph`, `:clean` and `:update` (scripts/graphify/bkit-graphify.sh),
 between `extract` and `cluster-only`.
 
     bkit-graph-repair.py <graph.json> [--rules R] [--quiet]
@@ -16,9 +16,9 @@ checks, the generated doc, and `graphify affected`, `god-nodes`, `explain`,
 this step says so.
 
 `graphify update` rewrites graph.json without the injected edges, so every
-wrapper command that writes the file (`pnpm graph`, `:clean`, `:update`) runs
+wrapper command that writes the file (`pnpm bkit:graph`, `:clean`, `:update`) runs
 this step at the end. The step is idempotent: after a raw `graphify update .`,
-run `pnpm graph:update`.
+run `pnpm bkit:graph:update`.
 
 ORDER MATTERS: this runs BEFORE clustering, so communities, the god-node
 ranking and the cycle list in graph-report.md are computed from the repaired graph.
diff --git a/scripts/graphify/bkit-graph-surface.py b/scripts/graphify/bkit-graph-surface.py
index 214002af3..ba259a836 100644
--- a/scripts/graphify/bkit-graph-surface.py
+++ b/scripts/graphify/bkit-graph-surface.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Link user-facing routes to the backend capabilities they reach.
 
-Called by `pnpm graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON the
+Called by `pnpm bkit:graph:rollup` (scripts/graphify/bkit-graphify.sh). Writes a JSON the
 capabilities doc renders as its route layer.
 
     bkit-graph-surface.py <graph.json> <surface-out.json> [--quiet]
diff --git a/scripts/graphify/bkit-graphify-graphml.py b/scripts/graphify/bkit-graphify-graphml.py
index c4aee4fc0..e1de5ac7b 100644
--- a/scripts/graphify/bkit-graphify-graphml.py
+++ b/scripts/graphify/bkit-graphify-graphml.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Export the full symbol graph to GraphML for Gephi / yEd.
 
-Called by `pnpm graph:graphml` (scripts/graphify/bkit-graphify.sh) through GRAPHIFY'S
+Called by `pnpm bkit:graph:graphml` (scripts/graphify/bkit-graphify.sh) through GRAPHIFY'S
 OWN interpreter — it imports graphify itself.
 
     bkit-graphify-graphml.py <graph.json> <out.graphml>
diff --git a/scripts/graphify/bkit-graphify-rollup.py b/scripts/graphify/bkit-graphify-rollup.py
index 17ea5ada1..cf8c2dfeb 100644
--- a/scripts/graphify/bkit-graphify-rollup.py
+++ b/scripts/graphify/bkit-graphify-rollup.py
@@ -5,7 +5,7 @@
 #!/usr/bin/env python3
 """Collapse the whole-symbol code graph into two readable views.
 
-Called by `pnpm graph:rollup` and `pnpm graph:graphml` (scripts/graphify/
+Called by `pnpm bkit:graph:rollup` and `pnpm bkit:graph:graphml` (scripts/graphify/
 bkit-graphify.sh) through GRAPHIFY'S OWN interpreter, not the system python — it
 imports networkx, which is a graphify dependency and is not installed repo-wide.
 
@@ -16,9 +16,9 @@ Both outputs are opt-in, and the two commands ask for different ones:
 
   --build-dir       a graphify-format graph.json per level, which the caller
                     renders to interactive HTML via `graphify cluster-only`,
-                    then moves and deletes. This is `pnpm graph:rollup`.
+                    then moves and deletes. This is `pnpm bkit:graph:rollup`.
   --*-graphml       the same two views as GraphML for Gephi. Only `pnpm
-                    graph:graphml` asks for these — GraphML is not produced by
+                    bkit:graph:graphml` asks for these — GraphML is not produced by
                     default.
 
 Node attrs: symbols, files, internal_edges. Edge attrs: weight (number of
@@ -59,7 +59,7 @@ SRC = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql")
 # graphify misses two whole classes of import: a `.js` specifier is never
 # resolved to a `.tsx` file, and workspace subpaths through an `exports` map are
 # not resolved at all. bkit-graph-repair.py writes them into graph.json during
-# `pnpm graph`, so this reads them like any other edge and does NOT add them on
+# `pnpm bkit:graph`, so this reads them like any other edge and does NOT add them on
 # read. A graph lacking any of them gets a warning, and the numbers below are
 # understated.
 # bkit-graph-imports.py is hyphenated, which `import` cannot spell, so it is loaded
@@ -660,7 +660,7 @@ def eager_block(eager):
     if eager.get("not_in_graph"):
         L += ["", f"> [!WARNING]", f"> {eager['not_in_graph']} scanned files are absent from "
               "`graph.json`, so only the column-0 filter applied to them and their downstream "
-              "counts are 0. Run `pnpm graph:update` and re-run the rollup."]
+              "counts are 0. Run `pnpm bkit:graph:update` and re-run the rollup."]
     return L
 
 
@@ -677,7 +677,7 @@ def reachability_block(reach):
     L = [
         "A request URL is a string inside a template literal, so nothing that reads types can",
         "see that it has no server-side counterpart, because `lint`, `check:type`, `knip` and",
-        "`slop:delta` all pass on a path that 404s. This is the one drift class no graph query",
+        "`bkit:slop:delta` all pass on a path that 404s. This is the one drift class no graph query",
         "finds either: a string is not an edge. Scanned every run by",
         "`scripts/ci/guards/assert-routes-reachable.mjs`; run it alone for the full served-route inventory.",
         "",
@@ -727,7 +727,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
     Source of truth is bkit-graph-drift-rules.json (which capability, which owner,
     which literal marker); every status in the table is derived from live source
     by bkit-graph-drift.py, never typed in. Editing this file by hand loses the edit
-    on the next `pnpm graph:rollup`.
+    on the next `pnpm bkit:graph:rollup`.
     """
     GRAPH_COMMIT = str(raw.get("built_at_commit") or "unknown")
     ROUTES_MMD, n_routes = chain_block(surface, overlay, reach)
@@ -769,7 +769,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         ">",
         "> **Rules:**",
         ">",
-        "> - Generated — do not edit. `pnpm graph:refresh` rewrites this file.",
+        "> - Generated — do not edit. `pnpm bkit:graph:refresh` rewrites this file.",
         f"> - Source of truth: `{rules_path}`. Every status derived from live source, never typed.",
         "> - Add a capability = add a rule there: capability · lane · owner module · one literal marker.",
         "> - Markers literal, never regex, because `new Client(` as a regex is an unclosed group matching nothing.",
@@ -790,8 +790,8 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         "> - `budgeted` = solid border + blue box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.",
         "> - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.",
         "> - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.",
-        f"> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `{GRAPH_COMMIT[:9]}`; when that differs from HEAD ⇒ run `pnpm graph:update` first.",
-        "> - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.",
+        f"> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `{GRAPH_COMMIT[:9]}`; when that differs from HEAD ⇒ run `pnpm bkit:graph:update` first.",
+        "> - Detail-level module graph → `pnpm bkit:graph`. This doc is the altitude above that: capabilities, not files.",
         "",
         "## Status Vocabulary",
         "",
@@ -802,7 +802,7 @@ def as_capabilities_doc(out, min_weight, overlay, rows, rules_path, surface, ov_
         "the exact number of non-owner sites allowed per scope prefix, and its `note` says why that",
         "number is not zero. The moment the count moves in either direction — too many (a copy",
         "appeared) or too few (the budget is stale) — the row leaves `budgeted`, its Budget cell",
-        "reads `over` or `stale`, and `pnpm graph:check` fails until the register is refreshed.",
+        "reads `over` or `stale`, and `pnpm bkit:graph:check` fails until the register is refreshed.",
         "That is why the status can be quieter without being a place to hide work.",
         "",
         "It still gets a box in the diagrams, drawn solid and blue rather than dashed and amber. A",
diff --git a/scripts/graphify/bkit-graphify.sh b/scripts/graphify/bkit-graphify.sh
index 81bfc8efb..4fefa2093 100755
--- a/scripts/graphify/bkit-graphify.sh
+++ b/scripts/graphify/bkit-graphify.sh
@@ -35,7 +35,7 @@ REPORTS="$OUT/reports"
 # Report filenames — RENAME HERE AND NOWHERE ELSE. Each is referenced once
 # below, so a new name takes effect on the next run with no other edit. These
 # are all derived artifacts: renaming one never invalidates the graph, and the
-# old file is not cleaned up automatically — delete it or run `pnpm graph:clean`.
+# old file is not cleaned up automatically — delete it or run `pnpm bkit:graph:clean`.
 R_REPORT="graph-report.md"                # cluster-only's own report, moved here
 R_TREE="graph-tree.html"                  # collapsible folder tree
 R_FULL_GRAPHML="graph.graphml"            # whole graph for Gephi
@@ -86,37 +86,37 @@ R_REACH="graph-reachability.json"
 
 usage() {
   cat <<'EOF'
-Usage: pnpm graph[:clean|:update|:rollup|:refresh|:check|:graphml|:tree|:scoped]
+Usage: pnpm bkit:graph[:clean|:update|:rollup|:refresh|:check|:graphml|:tree|:scoped]
 
-  graph           Full repo: extract + cluster. ~2 min, 0 tokens.
-  graph:clean     Same, but deletes the output dir first. REQUIRED after any
+  bkit:graph      Full repo: extract + cluster. ~2 min, 0 tokens.
+  bkit:graph:clean Same, but deletes the output dir first. REQUIRED after any
                   tsconfig `paths` change — `--force` re-reads source files but
                   NOT the module-resolution cache, so a graph built after an
                   alias edit will silently keep the old, unresolved edges.
-  graph:update    Re-extract changed files only, then recluster.
-  graph:check     Rebuild from THIS tree; fail if the tracked register
+  bkit:graph:update Re-extract changed files only, then recluster.
+  bkit:graph:check Rebuild from THIS tree; fail if the tracked register
                   docs/capabilities.md differs from the rebuild. Writes nothing
                   tracked. Reads uncommitted edits — `check-at` does not.
-  graph:refresh   Rebuild the register in a clean checkout of the STAGED
+  bkit:graph:refresh Rebuild the register in a clean checkout of the STAGED
                   files (the index), copy it over docs/capabilities.md.
                   Stage your change first. Fixes a red gate; commit it.
   check-at <rev>  `check` in a throwaway checkout of <rev>. Pre-push runs it
                   for every push to dev; CI runs it for every push and pull request.
   spec            Print the pinned graphify release (pip spec).
-  graph:rollup    Collapse the symbol graph into a package view (~24 nodes, the
+  bkit:graph:rollup Collapse the symbol graph into a package view (~24 nodes, the
                   architecture) and a module view (~133 nodes, the subsystems),
                   as interactive HTML. Edge weight is the number of underlying
                   symbol edges. Open these INSTEAD of the full graph; 9.8K nodes
                   is a database, not a picture.
-  graph:graphml   OPT-IN, for Gephi / yEd only — nothing else produces GraphML.
+  bkit:graph:graphml OPT-IN, for Gephi / yEd only — nothing else produces GraphML.
                   Writes all three views: the whole graph plus the two rollups.
                   The CLI has no --graphml flag (it exists only on the /graphify
                   skill, which this repo does not install), so the whole-graph
                   export calls graphify's own to_graphml() through its bundled
                   interpreter.
-  graph:tree      Collapsible folder tree with search and an outbound-edge
+  bkit:graph:tree Collapsible folder tree with search and an outbound-edge
                   inspector.
-  graph:scoped    One subtree with a browsable graph.html.
+  bkit:graph:scoped One subtree with a browsable graph.html.
                   Path defaults to apps/web/src; pass another as $2.
 
 Two directories, both gitignored and both rebuilt from source:
@@ -124,7 +124,7 @@ Two directories, both gitignored and both rebuilt from source:
   <out>/          RAW graph data — graph.json, manifest.json, cache/. graphify
                   owns this layout; the read commands (affected, god-nodes,
                   explain, path, query) all resolve <out>/graph.json.
-  <out>/reports/  Every DERIVED view. Safe to delete wholesale; `pnpm graph`
+  <out>/reports/  Every DERIVED view. Safe to delete wholesale; `pnpm bkit:graph`
                   plus the view command that made it rebuilds any of it.
 
 A whole-repo graph.html is never kept — 8.3 MB rendering ~9.8k nodes as a
@@ -166,7 +166,7 @@ graphify_python() {
 }
 
 require_graph() {
-  [ -f "$OUT/graph.json" ] || { echo "[graph] no $OUT/graph.json — run 'pnpm graph' first" >&2; exit 1; }
+  [ -f "$OUT/graph.json" ] || { echo "[graph] no $OUT/graph.json — run 'pnpm bkit:graph' first" >&2; exit 1; }
 }
 
 # The ONE graphify release that builds and judges the register — here, in the pre-push gate
@@ -201,7 +201,7 @@ esac
 # The whole-repo graph.html is DELETED, never kept. --no-viz below stops
 # cluster-only writing one, but `graphify update` regenerates it on its own
 # ("regenerated missing or stale graph.html") before this function reclusters, so
-# the rm removes it. Use graph:rollup for something clickable, or Gephi on the
+# the rm removes it. Use bkit:graph:rollup for something clickable, or Gephi on the
 # GraphML for metrics.
 cluster() {
   run_local cluster-only . --no-label --no-viz
@@ -324,7 +324,7 @@ case "${1:-build}" in
     echo "[graph] mermaid (paste into mermaid.live, or render per docs/setup.md):"
     echo "         $REPORTS/$R_PACKAGES_MMD"
     echo "         $REPORTS/$R_MODULES_MMD"
-    echo "[graph] GraphML for Gephi is opt-in: pnpm graph:graphml"
+    echo "[graph] GraphML for Gephi is opt-in: pnpm bkit:graph:graphml"
     ;;
   tree)
     require_graph
@@ -351,11 +351,11 @@ case "${1:-build}" in
     # into its base (pull_request), the tree a squash merge lands.
     # Rebuild graph from this tree → regenerate register into a throwaway copy
     # → fail if it differs from the tracked file. Writes nothing tracked; fix a
-    # red with `pnpm graph:refresh` plus a commit.
+    # red with `pnpm bkit:graph:refresh` plus a commit.
     #
     # By hand it reads the working tree, not the commit: uncommitted edits show
     # as drift nobody else can reproduce. After a tsconfig `paths` change run
-    # `pnpm graph:clean` first: `update` keeps the stale module-resolution
+    # `pnpm bkit:graph:clean` first: `update` keeps the stale module-resolution
     # cache, and the drift reported would be the cache, not the register.
     if [ -n "$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null)" ]; then
       echo "[graph] WARNING: uncommitted .ts/.tsx edits — graphify reads the WORKING TREE," >&2
@@ -375,7 +375,7 @@ case "${1:-build}" in
       echo "[graph] $CAPABILITIES_DOC matches a rebuild at $(git rev-parse --short HEAD)."
     else
       echo "[graph] DRIFT: $CAPABILITIES_DOC is not what this tree produces (diff above)." >&2
-      echo "[graph] Fix:   pnpm graph:refresh && git add $CAPABILITIES_DOC && git commit" >&2
+      echo "[graph] Fix:   pnpm bkit:graph:refresh && git add $CAPABILITIES_DOC && git commit" >&2
       exit 1
     fi
     ;;
@@ -392,7 +392,7 @@ case "${1:-build}" in
   refresh)
     # Rebuild the register in a clean checkout of the staged files → copy over the tracked
     # file here. Staged = the commit about to be made, so running it before that commit
-    # rebuilds the new state; unstaged edits stay out, as `graph:update && graph:rollup`
+    # rebuilds the new state; unstaged edits stay out, as `bkit:graph:update && bkit:graph:rollup`
     # would not. The checkout's HEAD stays HEAD, so the stamp names the parent of the commit
     # carrying the register. Fixes a `check` / `check-at` red. Commit the result.
     staged=$(git write-tree) || { echo "[graph] the index has unmerged paths — resolve them first" >&2; exit 1; }
