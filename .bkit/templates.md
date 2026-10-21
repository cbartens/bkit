# Templates — copy and own

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** Every template bkit ships and never installs — what each does, where to copy it, how to install the tool behind it.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy.
> - Adapt app roots, workspace package scope, rules JSON. Examples use `apps/web`, `apps/mobile`, `packages/api`, `@scope`.

## What each template is for

Adoption order = `bkit tips` order. Sections below: install steps and traps.

<!-- prettier-ignore -->
| Template | What it's for | Skip it and |
| --- | --- | --- |
| direnv | Loads `.bkit/.env` tokens whenever the project opens. | Saved tokens never load; every sign-in fails while the file looks right. |
| Serena | Agents look code up like an editor ("where is this defined, what uses it?"). Read-only. | Agents grep and read whole files: more accidental changes, more correction rounds, higher token cost. |
| CI workflow + CI scripts | Runs every check on GitHub on every change; one capstone check gates merge; `/bkit-ship` waits for it. | "Shipped" means merged, not checked. |
| Git hooks (Husky) | Same checks locally on commit and push, in seconds. | Failures surface minutes later in CI, after the agent moved on. |
| Prettier ignore list | One formatting baseline; stops Prettier reformatting bkit's managed files. | Reviews fill with spacing noise; every bkit upgrade shows false changes. |
| slop-scan | Flags net-new junk code AI tends to write (filler, dead code, type escapes). | Junk passes skim review and piles up. |
| Oxlint | Fails lint on a test that cannot fail: no assertion, a branch inside a test, an assertion that may never run, a malformed `expect`, an unawaited promise. JS / TS repos. | A test that asserts nothing passes; the suite stays green having proved nothing. |
| Vale | Prose lint for docs and agent instructions. | Padded, vague docs every agent re-reads on every run. |
| lint-staged | Formats only the staged files inside the commit hook. | Commit hook does nothing, or is slow enough to get skipped. |
| Cloud-agent workflow + SessionStart hook | CI result starts a cloud agent: ship on green, debug on red; hook installs the cloud toolchain. | Every next step needs a local session. |
| Context-fetch blocks | `/bkit-debug` reads real CI logs, runtime errors and web results. | Debug guesses from code; real errors stay hidden. |
| Secrets sync | One local file → every secret store; proves copies match without printing values. | Hand-copied secrets drift: "works for me, broken in production". |
| Issue forms | Three forms (idea, well-defined change, bug) asking for what design, plan / build and debug read first. | Issues arrive as a title and a line; agents guess at scope, "done" and repro steps. |
| graphify | Code map (`docs/capabilities.md`) agents check before building something again. | Agents rediscover structure each run; ripple effects missed. |
| Dependabot / Renovate | Small grouped update PRs; pinned Actions; security fixes skip the queue. | Updates pile into one large risky upgrade. |
| Trivy | Fails CI on a known-vulnerable package in any language, a risky container or cluster setting, or a committed secret; a daily run catches advisories with no fix yet. | A vulnerable package or leaked key merges unnoticed; an advisory with no fixed release never shows up anywhere. |
| Prettier tables | One edited cell = one changed row in the diff. | A one-word table edit diffs as the whole table. |
| tmp/ prune | Each push deletes scratch files agents left in `tmp/` untouched for a week. | `tmp/` keeps growing; old logs and scratch files are never cleared. |
| Disk prune | Your own cleanup steps (build caches, Docker, simulators) run on commit, on push, and before a worktree is made on a low disk. bkit deletes nothing itself. | Caches fill the disk until no worktree can be made; every workflow stops. |
| Local stack lock | One run at a time on local services every worktree shares (Docker database, emulator); a second run waits and names the run holding them. | A reset or stop from one worktree wipes the stack under another worktree's test run; the failures look like real bugs. |
| Cursor editor + cloud agent | Format-on-save, recommended extensions, Cursor cloud-agent image. | Cursor edits miss project formatting; no Cursor cloud agent. |
| Launchd GUI env | macOS apps opened from the Dock get the same tokens as the terminal. | Dock-launched editors start signed out. |

## Contract

<!-- prettier-ignore -->
| Tool | Copy from | To | Output you commit |
| --- | --- | --- | --- |
| CI workflow | `.bkit/templates/.github/workflows/bkit-ci.yml` | `.github/workflows/bkit-ci.yml` | that file |
| CI scripts | `.bkit/templates/scripts/ci/` | `scripts/ci/` | the scripts you adopt (`lanes/resolve-push-base.mjs`; `check-accepted-divergences.mjs` + `accepted-divergences.json`; `check-dependency-audit.mjs` + `accepted-advisories.json`). `check-capstone.mjs` + `check-capstone.test.mjs` are required with `bkit-ci.yml`, not optional |
| Cloud-agent workflow | `.bkit/templates/.github/workflows/bkit-cloud.yml` | `.github/workflows/bkit-cloud.yml` | that file |
| Git hooks (Husky) | `.bkit/templates/.husky/pre-commit`, `.bkit/templates/.husky/pre-push` | `.husky/pre-commit`, `.husky/pre-push` | both files |
| Prettier ignore list | `.bkit/templates/.prettierignore` | `.prettierignore` | that file |
| lint-staged | `.bkit/templates/.lintstagedrc.json` | `.lintstagedrc.json` | that file |
| Vale | `.bkit/templates/.vale.ini`, `.bkit/templates/.vale/styles/House/` | `.vale.ini`, `.vale/styles/House/` | `.vale.ini` + the four House styles |
| slop-scan | `.bkit/templates/slop-scan.config.json`, `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` | `slop-scan.config.json`, `scripts/slop/bkit-slop-type-suppression.mjs` | both files |
| Oxlint | `.bkit/templates/.oxlintrc.json` | `.oxlintrc.json` | that file |
| direnv | `.bkit/templates/.envrc` | `.envrc` | that file |
| Launchd GUI env | `.bkit/templates/scripts/launchd/` | `scripts/launchd/bkit-launchd-env.sh`, `~/Library/LaunchAgents/ai.bkit.launchd.plist`, `~/.config/bkit/launchd.env` | `scripts/launchd/bkit-launchd-env.sh` only |
| Cursor editor + cloud agent | `.bkit/templates/.cursor/settings.json`, `environment.json`, `Dockerfile` | same paths under `.cursor/` | the files you use |
| Renovate rules | `.bkit/templates/.github/renovate.json5` | `.github/renovate.json5` | that file |
| Renovate self-hosted runner | `.bkit/templates/.github/workflows/bkit-renovate.yml` | `.github/workflows/bkit-renovate.yml` | that file |
| Dependabot | `.bkit/templates/.github/dependabot.yml` | `.github/dependabot.yml` | that file |
| Trivy | `.bkit/templates/.github/workflows/bkit-trivy.yml` | `.github/workflows/bkit-trivy.yml` | that file; `.trivyignore.yaml` once you accept a finding |
| Serena | `.bkit/templates/scripts/serena/`, `.bkit/templates/.serena/project.yml` | `scripts/serena/`, `.serena/project.yml`, merge `bkit-serena.mcp.json` into `.mcp.json` | `project.yml` only |
| Issue forms | `.bkit/templates/.github/ISSUE_TEMPLATE/` | `.github/ISSUE_TEMPLATE/` | the forms you use |
| graphify | `.bkit/templates/scripts/graphify/`, `.bkit/templates/.graphifyignore`, `.bkit/templates/docs/capabilities.md` | same paths at the repo root | `docs/capabilities.md` |
| Secrets sync | `.bkit/templates/scripts/secrets/` | `scripts/secrets/` | both files; never `bkit-secrets-state.json` |
| Prettier tables | `.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs` | `scripts/prettier/` | that file |
| tmp/ prune | `.bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs` | `scripts/cleanup/` | that file |
| Disk prune | `.bkit/templates/scripts/cleanup/bkit-disk-prune.mjs`, `bkit-disk-prune.machine.mjs` | `scripts/cleanup/bkit-disk-prune.mjs`, `~/.config/bkit/disk-prune.mjs` | `scripts/cleanup/bkit-disk-prune.mjs` only |
| Local stack lock | `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` | `scripts/ci/` | that file |
| Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
| Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |

Placeholders. Copies keep them raw; replace each in your copy:

<!-- prettier-ignore -->
| Placeholder | In | Put | Typical value |
| --- | --- | --- | --- |
| `main` | `bkit-ci.yml` (`on.push` / `on.pull_request` branches; stub comments), `bkit-trivy.yml` (`on.push` / `on.pull_request` branches) | your production branch | `origin/HEAD` unless it is `dev`, else `main` |
| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
| `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
| `{{SCRIPT_PATH}}` | `ai.bkit.launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
| `{{ENV_FILE}}` | `ai.bkit.launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |

- `bkit install` / `bkit upgrade` refresh `.bkit/templates/` to the package's templates, unsubstituted. `bkit check` fails on a stale copy. `bkit uninstall` removes the folder, never an adopted copy.
- **What changed on upgrade.** `bkit upgrade` lists changed / added / removed template paths. For each one you adopted: `diff .bkit/templates/<path> <path>`, merge what you want (placeholder lines differ by design). `git diff .bkit/templates` in the upgrade commit = the package change.
- Repo gates that scan the whole repo (prettier, Vale, slop-scan, eslint, tsc) → ignore `.bkit/templates/`. The `.prettierignore`, `.vale.ini`, `slop-scan.config.json` and `.oxlintrc.json` templates already do; check your adopted copy does too.
- Templates are written in Node unless the tool they wrap already needs another runtime (graphify and Serena: Python + shell launchers; git hooks: POSIX `sh`; local stack lock: bash + perl, as shell runners source it).
- `bkit.depUpdater: "none"` → skips install-time absence advisory for updaters.
- No manifest key for any template. `docs/templates/bkit-audit-adoption.md` lists every template each run: adopted and wired, or not adopted and why.

## Context-fetch blocks — `.agents/context.md`

`/bkit-debug` runs every `context-fetch` block below `<!-- bkit:end -->` in `.agents/context.md`; cloud setup runs every `context-fetch:provision` block there. One file per provider holds its fetch blocks (one per context; copy one or more), each fetch block's provision block (stack CLI only), the `allowed-domains` it needs beyond bkit's derived egress set, and its `mcp-servers` names. Block rules (markers, contexts, self-skip, output bounds) → the managed block of `.agents/context.md`.

<!-- prettier-ignore -->
| File | Fits | `context=` | Fetches | Secret / non-secret env | Domains | CLI (provision) |
| --- | --- | --- | --- | --- | --- | --- |
| `github.md` | GitHub Actions | `ci`, `diff` | `ci`: failing run: failed jobs / steps, `::error` annotations, failed-step logs tail-bounded per failed job; `diff`: `git diff --stat` (capped) since the last green CI run on trunk | `GH_TOKEN` / `CI_LOG_TAIL`; `BASELINE_BRANCH`, `BASELINE_WORKFLOW`, `DIFF_STAT_N` (`diff`) | — | `gh` (base tool) |
| `playwright.md` | Playwright on GitHub Actions | `e2e` | failing run's report artifact, failing specs first; inlined files, lines and binary paths capped | `GH_TOKEN` / `E2E_ARTIFACT`, `E2E_JOB_RE`, `E2E_MAX_FILES`, `E2E_MAX_LINES`, `E2E_MAX_BIN` | — | `gh` (base tool) |
| `maestro.md` | Maestro iOS and Android lanes on GitHub Actions | `e2e` | every failed Maestro job's log, sliced to the result steps, each slice tail-bounded | `GH_TOKEN` / `MAESTRO_JOB_RE`, `MAESTRO_STEPS`, `MAESTRO_LOG_TAIL` | — | `gh` (base tool) |
| `tavily.md` | any | `web` | web search for upstream causes (untrusted output) | `BKIT_TAVILY_API_KEY` / `QUERY` | — | — |
| `sentry.md` | Sentry | `runtime` | unresolved issues seen in a window (organization issues endpoint), optional environment; trace / window recipes; detector-header strip | `SENTRY_AUTH_TOKEN` / `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_HOST`, `SENTRY_SINCE`, `SENTRY_ENV`, `SENTRY_N` | `sentry.io` | — |
| `vercel.md` | Vercel | `runtime` | serverless + edge error / fatal logs in a window, paged past the CLI's 50-line cap, all branches (`--no-branch`) | `VERCEL_TOKEN` / `VERCEL_SCOPE`, `VERCEL_ENV`, `SINCE`, `UNTIL`, `VERCEL_MAX_PAGES` | `vercel.com` | `vercel` (yes) |
| `supabase.md` | hosted Supabase | `runtime` | Postgres `ERROR` / `FATAL` / `PANIC` counts per hour, severity, SQLSTATE and role; one call per day of window | `SUPABASE_ACCESS_TOKEN` / `SUPABASE_PROJECT_ID`, `SINCE_ISO`, `UNTIL_ISO` | `supabase.com` | — |
| `stripe.md` | Stripe | `runtime` | failure / dispute / refund events, filtered by type and window at the source, paged; events whose webhook delivery failed | `STRIPE_SECRET_KEY` / `STRIPE_SINCE_S`, `STRIPE_MAX_PAGES` | `stripe.com` | — |
| `resend.md` | Resend | `runtime` | bounced / complained / failed / delayed sends, paged back to the window start | `RESEND_API_KEY` / `SINCE_ISO`, `RESEND_MAX_PAGES` | `resend.com` | — |
| `inngest.md` | Inngest Cloud | `runtime` | `inngest/function.failed` events in a window, paged; error class only, never error text | `INNGEST_SIGNING_KEY` / `INNGEST_ENV` (required with a branch key), `SINCE_ISO`, `UNTIL_ISO`, `INNGEST_N`, `INNGEST_MAX_PAGES` | `inngest.com` | — |
| `cloudrun.md` | Google Cloud Run | `runtime` | container errors + memory-limit kills; service account only when the gcloud login cannot mint a token | `GCP_CLIENT_EMAIL`, `GCP_PRIVATE_KEY` (headless) / `GCP_PROJECT_ID`, `GCP_SERVICE`, `GCP_FILTER` | `googleapis.com`, `google.com` | `gcloud` (yes) |
| `expo.md` | Expo EAS Build + EAS Workflows (Maestro) | `runtime`, `e2e` | `runtime`: newest 50 builds' status + errored-build log lines (capped per build); `e2e`: recent and FAILURE run lists, failed jobs' per-flow exceptions, JUnit (capped), screenshots, Maestro commands, hierarchy dumps, XCUITest + JS console | `EXPO_TOKEN` / `EXPO_APP_DIR`, `EAS_PLATFORM`, `EAS_PROFILE`, `EAS_N`, `EAS_LOG_N` (`runtime`); `EAS_WF_FILE`, `EAS_WF_N`, `EAS_WF_FAIL_N`, `EAS_JUNIT_N` (`e2e`) | `expo.dev`, `googleapis.com` (`runtime`), `eascdn.net` (`e2e`) | `eas` (yes) |
| `serena.md` | Serena MCP server | — | nothing: provision only, installs `serena` in cloud | — | — | `uv` (yes) |

MCP names listed: `sentry` / `Sentry`, `vercel` / `Vercel`, `supabase` / `Supabase`, `inngest`, `serena`. Every tool on a listed server runs without a prompt, writes included — list only servers you trust with that.

Placeholders. Each sits on a commented assignment line or an env default in the block; replace it in your copy:

<!-- prettier-ignore -->
| Placeholder | In | Put |
| --- | --- | --- |
| `your-team-slug` | `vercel.md` (`VERCEL_SCOPE`) | Vercel team slug |
| `your-project-ref` | `supabase.md` (`SUPABASE_PROJECT_ID`) | project ref of the environment whose logs you want |
| `your-org-slug`, `your-project-slug` | `sentry.md` (`SENTRY_ORG`, `SENTRY_PROJECT`) | Sentry slugs |
| `de.sentry.io` (commented) | `sentry.md` (`SENTRY_HOST`) | uncomment for an EU-region org; default `sentry.io` |
| `your-gcp-project-id`, `your-service-name` | `cloudrun.md` (`GCP_PROJECT_ID`, `GCP_SERVICE`) | GCP project id; optional service name |
| `^your-e2e-job-name$` | `playwright.md` (`E2E_JOB_RE`) | anchored job name of that lane only |
| `^your-maestro-e2e-job-name$`, `Your per-flow results step\|Your failure classification step` | `maestro.md` (`MAESTRO_JOB_RE`, `MAESTRO_STEPS`) | anchored regex matching the Maestro lanes' job names; `\|`-separated names of the steps that print results |
| `dev`, `bkit-ci.yml` | `github.md` `context=diff` (`BASELINE_BRANCH`, `BASELINE_WORKFLOW`) | trunk branch, CI workflow file |
| `apps/mobile` | `expo.md`, both blocks (`EXPO_APP_DIR`) | the EAS-linked app folder |
| `serena-agent==1.7.0` | `serena.md` | the Serena version you run locally |

Adopt:

1. Copy the file's blocks below `<!-- bkit:end -->` in `.agents/context.md`: each fetch block you want, its provision block, its `allowed-domains` and `mcp-servers` blocks (several of each merge).
2. Replace the placeholders. Commit non-secret selectors inline so cloud agents inherit them.
3. Set the secret env vars locally (app env via `.envrc`, not `.bkit/.env`) and in each cloud dashboard (`.bkit/cloud.md`).
4. `bkit install` → the provision recipes reach `.claude/bkit-cloud.md`'s setup script, the domains reach the cloud allowlist and local fetch permissions, the MCP names reach every host's allow rules.

- No credentials, or an API / auth error → block self-skips: `exit 0` plus `[context-fetch:<name>] skipped — …` on stderr. `/bkit-debug` narrates that as not checked, never as clean. `TRUNCATED` on stdout = page cap or a failed later page stopped the read; raise the block's `*_MAX_PAGES` knob.
- Runtime and EAS blocks' `# Customise:` suggests a positive control: run once over a window holding a known event; nothing back = reader broken, not clean.
- `bkit check` advisories point at these files: `context-fetch-missing`, `context-fetch-context-missing`, `context-fetch-source-not-enabled`, `context-fetch-provision-missing`.
- Another backend → author a block in the same shape (rules in the managed block of `.agents/context.md`).

## Gate tool scripts — `package.json`

bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names (add-if-missing). The tool scripts their defaults chain are yours; `gate-missing-called-scripts` names any that are missing.

<!-- prettier-ignore -->
| Gate (default) | Chains | Needs |
| --- | --- | --- |
| `bkit:gate:format` | `pnpm lint-staged` | lint-staged devDep + `.lintstagedrc.json` + prettier |
| `bkit:gate:min` | `format:check`, `lint:prose`, `slop:delta` | the scripts below + any test reading a min-push file |
| `bkit:gate:static` | `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta` | the scripts below |
| `bkit:gate:static-unit` | `bkit:gate:static` + `test` | a `test` script |
| `bkit:gate:install-static-unit-build` | `pnpm install --frozen-lockfile` + `bkit:gate:static-unit` + `build` | a `build` script |

```json
{
  "typecheck": "tsc --noEmit",
  "lint": "oxlint -c .oxlintrc.json --type-aware --deny-warnings",
  "format:check": "prettier --check .",
  "lint:prose": "bkit ci prose",
  "lint:slop": "slop-scan scan .",
  "slop:delta": "bkit ci slop",
  "prepare": "husky"
}
```

```bash
pnpm add -D prettier@^3.5.3 slop-scan@^0.3.0 lint-staged@^17.0.0 husky@^9.1.7
```

- `lint` must exist: without it `pnpm lint` falls through to any `lint` binary on `PATH` → gate green via the wrong program. Value above runs the Oxlint test rules (§ Oxlint), fails on any hit; needs `oxlint` + `oxlint-tsgolint`, fails loudly without them. Own linter → chain both: `<your linter> && oxlint -c .oxlintrc.json --type-aware --deny-warnings`.
- No `tsconfig.json` → `"typecheck": "echo \"[bkit] typecheck: no tsconfig.json — skipping\" >&2"`.
- `slop:delta` runs `bkit ci slop` (bkit devDep on `PATH` through the package script). CI passes the base sha as its one bare argument.
- `lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), e.g. `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
- Non-Node stack → point each gate at your own commands; keep the gate names.
- `bkit:test:file` (not seeded; `test-file-script-missing` until declared) runs ONE test file — bkit appends its repo-relative path — and writes a JUnit report to `$BKIT_TEST_REPORT`; `/bkit-build` reads it for test-first. Vitest: `"bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""`. Call the runner directly, not through a caching task runner.

## CI workflow — `bkit-ci.yml`

Parallel lanes `bkit-tests-static` (typecheck, lint, prettier, Vale, slop, actionlint, `bkit check`) and `bkit-tests-unit`, joined by the `bkit-tests-check` capstone, plus the commented full CI scaffold reference for the other tiers. Workflows care: `/bkit-ship` waits on its runs and merges only when the `bkit.capstoneJob` job (default `bkit-tests-check`) is present and green at the head; `bkit setup protect-main` makes that job the required check; `bkit-cloud.yml` triggers on a workflow named `bkit-ci`. `bkit install` reads your copy for advisories (`bkit-stub-*`, `ci-yml-missing-actionlint`, `ci-yml-capstone-contract-drift`). Reference: https://docs.github.com/en/actions.

- Install: nothing beyond the gate tool scripts above, a `test` script, and `packageManager` in `package.json` (`pnpm/action-setup` reads it; do not add `with: version:`).
- Adapt: `main`, `{{NODE_VERSION}}`. Non-Node repo → replace the Node / pnpm setup, install and check steps with your stack's.
- Capstone: `bkit-tests-check` `needs:` every lane and runs on `!cancelled()`, never `always()`. Each lane you adopt from the reference goes into its `needs:` and its assert, or that lane's failure cannot red the merge. Its assert is `scripts/ci/check-capstone.mjs` (copy it and `check-capstone.test.mjs` from `.bkit/templates/scripts/ci/` with the workflow; REQUIRED — the step reds with a copy-the-script message when the file is missing, and never skips). The script reds on a lane that did not succeed, a lane that ran when the plan said skip, a lane that succeeded with 0 tests or a non-numeric count, and a plan that does not parse. It reads each lane's executed-test count once the lane writes one (the `Run Unit Tests` step comment shows the vitest form); `EMPTY_COUNT: warn` makes an unreported count a warning, a count of 0 a failure. Each lane you adopt goes into `LANES` and its `<LANE>_RESULT` / `<LANE>_RAN` variables. Renaming the job → set `bkit.capstoneJob`.
- Adopt a scaffold lane only when its tier exists (`docs/testing.md`). Each `# bkit-stub:<id> —` header raises an install advisory until you enable or delete that stub.
- Keep the `name: bkit-ci` line, or rename `workflows: [bkit-ci]` in `bkit-cloud.yml` and set `bkit.ciWorkflow` to the new file name.
- Keep `fetch-depth: 0` on the static lane: `slop:delta` checks the PR base out as a worktree.

## Cloud-agent workflow — `bkit-cloud.yml`

Post-CI router: CI pass on `feat/**` → `/bkit-ship`, fail → `/bkit-debug`; failed `dev` CI → `/bkit-debug {FID}`; `workflow_dispatch` runs any phase. A `context` job resolves phase + arg once, then two runner jobs, each skipped without its secret: `claude` (`claude-code-action`, https://github.com/anthropics/claude-code-action) and `opencode` (`opencode run`, https://opencode.ai/docs/github/). Runs bkit workflows; `bkit install --auto=claude|opencode` points at it. Full recipe: `.bkit/cloud.md` § Post-CI auto-routing.

- Install: `bkit install --auto=claude` (points at the `.claude/hooks/bkit-cloud-bootstrap.sh` template) or `--auto=opencode` (needs `--opencode=<provider>` first). Both need `--tracker=github`.
- Secrets: `ANTHROPIC_API_KEY` (or keyless: `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables) + the Claude GitHub App (`/install-github-app`) for `claude`; `OPENCODE_PROVIDER_KEY` for `opencode`. Repo Actions permissions: read and write, PR creation allowed.
- Adapt: `{{CLOUD_RUNNER}}` in all three jobs.
- Traps: the file runs bkit by command name, so a changed invocation reaches you only as a changed template path on `bkit upgrade` — diff it on every upgrade. The opencode install version is a plain argument; the `# renovate:` comment above it lets the example `renovate.json5` bump it. Keep the file out of updater `ignorePaths` so action pins refresh.

## Git hooks — Husky

`pre-commit` runs `bkit:gate:format`; `pre-push` runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push), then `bkit check`, plus the CI-suppressing-token guards and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune). Workflows care: they commit and push without `--no-verify`, so a failing hook stops a workflow. One exception: the throwaway `.worktrees/_land-{FID}` checkout that lands bookkeeping on `dev` (docs, logs, ledgers, `[skip ci]`) runs no hooks and logs that it skipped them. Reference: https://typicode.github.io/husky/.

```bash
pnpm add -D husky@^9.1.7   # plus "prepare": "husky" (§ Gate tool scripts)
chmod +x .husky/pre-commit .husky/pre-push
```

- `.gitignore`: `.husky/_` (bkit's `.gitignore` block already lists it).
- Adapt: repo-only checks go below the bkit lines in each hook. What a gate runs belongs in the `bkit:gate:*` script, not the hook.
- Min push: every file changed since each pushed commit left `origin/dev` (else `origin/main`) matches `bkit.minPushPaths` (`package.json` globs: `*` one folder, `**` any depth; default `docs/plans/**`, `docs/*.jsonl`, `.bkit/*.jsonl`; `[]` = off) → `bkit:gate:min` replaces the full gate; `MIN_PUSH=1`. `bkit ci min-push` decides from files, never `[skip ci]` (a typed label; GitHub reads the last commit only). No files / unreadable range / no ref list → full gate.
- Min-push paths: files no code, build or test reads. Never `docs/**` (a doc can be test input). A test reading a ledger → into `bkit:gate:min`.
- `[skip ci]` guards: feature branch → blocked only while a PR is open (workflows push `[skip ci]` code heads mid-run). `dev` / `main` → blocked unless a min push: GitHub skips CI for the whole push.
- Slow repo extras (Docker, database, build) → wrap in `if [ "$MIN_PUSH" != "1" ]; then … fi`.
- Traps: hooks run on every workflow commit; keep them to seconds (pre-commit) and deterministic checks that reach no deployed service (pre-push). Integration runs at pre-push once `bkit:gate:static-unit-integration` is declared (a local database in Docker is fine); E2E and `@live` belong in CI.
- Run each check once: nothing in `bkit:gate:format` that the push gate runs again (`gate-commit-repeats-push` advisory), and `pnpm test` (the unit tier) matches no `*.integration.test.*` file — a unit config with no integration exclude runs those tests in the unit gate and again in the integration gate.

## Prettier — `.prettierignore` first

```bash
pnpm add -D prettier@^3.5.3
```

1. Copy `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example`, `docs/roadmap.md` in its own layout; prettier reformatting them fights the next `bkit install` (`bkit check` drift).
2. Add `format:check` (§ Gate tool scripts). Reference: https://prettier.io/docs/install.

- Keep the `.bkit/templates/` line.

## lint-staged — `.lintstagedrc.json`

Runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.

```bash
pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
```

- Staged `docs/plans/**/*.md` + `docs/audits/**/*.md` (design, plan, audit docs) run `scripts/prettier/bkit-insert-ignore.mjs` before prettier → committed tables carry `<!-- prettier-ignore -->` and `| --- |` separators. Needs § Prettier tables copied; without it, commits touching those files fail.
- Globs must not overlap: lint-staged runs entries concurrently, so two entries writing one file race. Second entry negates the first.
- Adapt: add per-glob commands (eslint `--fix`, etc.) — keep them seconds-fast.

## Vale — prose lint, with House styles

`lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.

```bash
brew install vale
vale sync
```

- Copy `.vale.ini` and all four `.vale/styles/House/*.yml`.
- `.gitignore`: `.vale/styles/write-good` (`vale sync` downloads it; the House styles stay tracked).
- CI: the `bkit-ci.yml` template installs a pinned Vale and runs `vale sync`. Cursor: the `Dockerfile` template installs it.
- Adapt: add `[glob]` scope blocks for your own docs; turn rules off per path, not globally.
- Traps: no Vale on `PATH` → `lint:prose` prints a skip line and the prose gate is not enforcing. A missing `write-good` is copied from the main worktree, else `vale sync` runs; when both fail it prints a loud skip warning. Keep the `.bkit/templates/**` block (rules off for the copies).

## slop-scan — `slop-scan.config.json`

`lint:slop` reports; `slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. Reference: https://github.com/benvinegar/slop-scan.

```bash
pnpm add -D slop-scan@^0.3.0
mkdir -p scripts/slop
cp .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs scripts/slop/
```

- The plugin is a template: copy `scripts/slop/bkit-slop-type-suppression.mjs` and point the config's `plugins` entry at it (`boundary/type-suppression`, `boundary/gate-suppression`). No plugin → drop the `plugins` entry and both `boundary/*` rules.
- Adapt: `ignores` for generated / vendored trees; per-file `overrides` with a reason, never a rule disabled repo-wide.
- Traps: keep `**/.bkit/templates/**` in `ignores`, or copied `.mjs` / `.py` count as net-new slop on the upgrade commit. Nothing imports the copied plugin — a reachability scanner (knip, ts-prune, vulture) reads it as dead: register it as an entry point, and where `scripts/` is its own scanner workspace, register there, not the root workspace.

## Oxlint — test-file lint, `.oxlintrc.json`

Fails `lint` on a test that cannot fail. Oxlint (fast linter) runs five rules on test files only; all other checks off. JS / TS repos with Vitest or Jest. Reference: https://oxc.rs/docs/guide/usage/linter.html.

```bash
pnpm add -D oxlint@^1.87.0 oxlint-tsgolint@^7.0.2004
cp .bkit/templates/.oxlintrc.json .oxlintrc.json
```

Set `lint` to the value in § Gate tool scripts.

<!-- prettier-ignore -->
| Rule | Fails on |
| --- | --- |
| `vitest/expect-expect` | A test with no assertion. |
| `vitest/no-conditional-in-test` | `if`, `?:`, `&&`, `??` or `||` inside a test: the branch under test may never run. |
| `vitest/no-conditional-expect` | An `expect` inside a branch or `catch`: it may never run. |
| `vitest/valid-expect` (`maxArgs: 2`) | `expect(x)` with no matcher; more than a value and a message. |
| `typescript/no-floating-promises` | A promise nobody awaits: the test ends before its assertion runs. |

- Scope: `**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`; source files are not linted. The `vitest/` rules read Jest-style `describe` / `it` / `expect` too.
- `ignorePatterns` skips `.bkit/templates/` and `scripts/ci/**/*.test.mjs`: CI script tests run on plain Node with their own `test()` helper, which the rules misread.
- Keep `--type-aware`: without it `typescript/no-floating-promises` never runs, gate stays green. `oxlint-tsgolint` (peer of `oxlint`) bundles its own TypeScript engine → no `typescript` dependency. Tested pair: `oxlint` 1.87.0 + `oxlint-tsgolint` 7.0.2004.
- No path argument → lints the working directory. Narrow it (`oxlint … src`); tests outside root `tsconfig.json` → add `--tsconfig <file>`.
- Adapt: `files` glob; `assertFunctionNames` on `expect-expect` (default `expect`) when your own helper asserts, e.g. `["expect", "expectHttpError"]`. Turn a rule off per file in `overrides`, never repo-wide.
- Existing suite → many hits. Fix each in its test: one `it` per case (`it.each` for tables), `await expect(…).rejects` in place of `try` / `catch`, `await` on every promise. No baseline file, no disable comment, no `.skip`.
- Why not ESLint: typescript-eslint's type-aware rules need TypeScript `<6.1`.
- Non-JS repo → keep its own linter and its test-lint rules (e.g. `flake8-pytest-style`); `lint` stays yours.
- `bkit tips` suggests it (tip `test-lint`) when `package.json` lists `vitest` or `jest` and the repo has no Oxlint config, no `oxlint` dependency and no ESLint config naming a test plugin.

## direnv — `.envrc`

Loads `.bkit/.env` on `cd`, so local sessions see `BKIT_GH_TOKEN`, tracker keys. bkit reads your `.envrc` (its `dotenv*` and `unset` lines, never executed) to fill the env blocks of `.claude/bkit-cloud.md` / `.cursor/bkit-cloud.md`; preflight's direnv advisories key on it. Reference: https://direnv.net/docs/installation.html.

```bash
brew install direnv     # then add the shell hook from the link
direnv allow
```

- Adapt: one `dotenv_if_exists <path>` line per extra env file; `unset` keys that must stay out of the shell (they are dropped from the cloud env blocks too).

## Launchd GUI environment — tokens for Dock-launched apps

Dock/Spotlight launches start under `launchd`, which never runs the login shell or direnv → GUI apps (opencode desktop, Cursor) start without `BKIT_*` and provider calls fail on authentication. The template set pairs a loader script with a machine-local env file; the LaunchAgent runs the loader at login and again on every write to that file.

<!-- prettier-ignore -->
| File | Copy from | To | Commit |
| --- | --- | --- | --- |
| Loader | `.bkit/templates/scripts/launchd/bkit-launchd-env.sh` | `scripts/launchd/bkit-launchd-env.sh` | that file |
| LaunchAgent | `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` | `~/Library/LaunchAgents/ai.bkit.launchd.plist` | never (machine-local) |
| Tokens | `.bkit/templates/scripts/launchd/launchd.env.example` | `~/.config/bkit/launchd.env` | never (machine-local) |

```bash
cp .bkit/templates/scripts/launchd/bkit-launchd-env.sh scripts/launchd/
chmod +x scripts/launchd/bkit-launchd-env.sh
mkdir -p ~/.config/bkit
cp .bkit/templates/scripts/launchd/launchd.env.example ~/.config/bkit/launchd.env
chmod 600 ~/.config/bkit/launchd.env     # tokens stay owner-only
# fill in the tokens, then place the agent:
cp .bkit/templates/scripts/launchd/ai.bkit.launchd.plist ~/Library/LaunchAgents/
# replace {{SCRIPT_PATH}} and {{ENV_FILE}} with absolute paths in the copied plist
launchctl bootout gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist 2>/dev/null || true
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist
launchctl getenv BKIT_OPENROUTER_API_KEY    # bootstrap proof
```

- `WatchPaths` re-runs the loader on every env-file write → rotate a token by editing the value, revoke it by deleting the line or emptying the value (`KEY=""`); no re-bootstrap.
- Loader loads `BKIT_*` keys only (others logged as skipped). An empty value runs `launchctl unsetenv`. Loaded key names are recorded in `.launchd-loaded-keys` next to the env file (mode 600; `BKIT_LAUNCHD_STATE` overrides the path); a recorded key missing from the env file is unset on the next run.
- One failing key is logged and skipped; the rest still load and the loader exits 1. A failed unset stays recorded and retries on the next run.
- Log `~/Library/Logs/bkit-launchd.log` records key names only, never values. `BKIT_LAUNCHD_LOG` and `BKIT_LAUNCHD_ENV` override the log and env-file defaults.
- Loader self-skips (log line + `exit 0`) when the env file is absent or `launchctl` is off `PATH` (Linux CI).
- launchd cannot exec a loader under `~/Documents`, `~/Desktop` or `~/Downloads`: macOS TCC denies it and `/tmp/bkit-launchd.log` reads `Operation not permitted`. Repo under one of those → keep the adopted copy in git but place the loader launchd runs at `~/.config/bkit/bkit-launchd-env.sh` (or another unprotected path) and point `{{SCRIPT_PATH}}` there.
- Env-file rules: blank lines and `#` comments ignored; optional `export ` prefix; key must match `[A-Za-z0-9_]`; matching surrounding quotes stripped from the value.
- `launchctl setenv` reaches apps launched after the load; a running app keeps its environment until relaunch (set and unset alike).
- **Exposure:** `launchctl setenv` makes every loaded token visible to every app started in the login session, not only the app that needs it. Load only tokens you accept that for; prefer `bkit cursor` / `bkit opencode` (per-process env) where possible.
- Remove: `launchctl bootout gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.

## Cursor — `settings.json`, `environment.json`, `Dockerfile`

Editor defaults (`settings.json`: prettier format-on-save, extension recommendations) and the Cursor Cloud Agent image (`environment.json` → `Dockerfile` + per-snapshot `install`). Cloud agents run bkit workflows; `bkit install --auto=cursor` (needs `--tracker=linear`) points at the two cloud files. Reference: https://cursor.com/docs/cloud-agent/setup.

- `Dockerfile`: the `bkit toolchain` section installs what bkit's workflows use (git, jq, python3, pinned and sha256-checked gh and Vale, corepack-pinned pnpm). Node 24 is installed outside it from a sha256-checked nodejs.org tarball. Adapt `FROM`, the Node version and repo extras outside the toolchain section.
- `environment.json` `install`: `pnpm install --frozen-lockfile`, then `vale sync` when `.vale.ini` exists.
- Secrets: Cloud Agents dashboard → Runtime Secrets (`.bkit/cloud.md`).
- Traps: the corepack pnpm pin must match `packageManager`. Keep the `bkit toolchain` section as shipped so the template diff on upgrade stays readable.

## Dependabot and Renovate

Opens dependency PRs. No bkit workflow reads either. Pick one; copy only its files. Reference: Dependabot https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference; Renovate https://docs.renovatebot.com/, self-hosted action https://github.com/renovatebot/github-action.

Dependabot — commit `.github/dependabot.yml` on the default branch, then enable alerts and security updates:

```bash
gh api -X PUT 'repos/{owner}/{repo}/vulnerability-alerts'
gh api -X PUT 'repos/{owner}/{repo}/automated-security-fixes'
```

Renovate (Mend) — commit `.github/renovate.json5` on the default branch, then install the App at https://github.com/apps/renovate (GitHub UI only; no `gh` equivalent). Renovate (self-hosted) — also copy `bkit-renovate.yml`, then set its platform token (fine-grained PAT for one owner, classic across owners; permissions → `docs/deployments.md` § Dependency updaters):

```bash
gh secret set BKIT_GH_TOKEN
```

- Examples ignore `.bkit/templates/**`, `.agents/skills/**` (bkit rewrites them), `docs/plans/**` and the `tests` / `__fixtures__` trees. Your copied workflows (`bkit-ci.yml`, `bkit-cloud.yml`) stay in scope so their pins refresh.
- Examples extend `config:best-practices`; major bumps wait for a tick on the Dependency Dashboard (`dependencyDashboardApproval`); `lockFileMaintenance` runs monthly; PRs rebase only on conflict.
- A `# renovate: datasource=<ds> depName=<name>` comment above a pinned CLI version (Dockerfile, `bkit-cloud.md`, workflows) lets the example `customManagers` entry bump it. Checksum-paired pins (Vale, gh, jq, Node, actionlint): update the sha256 by hand in the same PR.
- `bkit-renovate.yml` pins `renovate-version` to an exact release; the same kind of `# renovate:` comment keeps it current.
- `enabled: false` on a Renovate package rule does not stop digest pinning; use `ignorePaths` to keep Renovate off a file.
- Land config on default branch before bot runs. Examples set `baseBranchPatterns: ["dev"]`.
- App install, self-hosted token, private-package host rule, CVE handling → `docs/deployments.md` § Dependency updaters.

## Trivy — vulnerability, config and secret scan

Fails CI on a HIGH or CRITICAL finding: a vulnerable package in any lockfile Trivy reads (npm, pnpm, yarn, pip, poetry, uv, Go, Cargo, Maven, …), a risky setting in a Dockerfile / Terraform / Kubernetes / Helm file, or a secret in a tracked file. Runs on push, pull request and daily. Reference: https://trivy.dev/docs/latest/.

Copy `bkit-trivy.yml`, replace `main`, commit. No secret, token or App. Blocks merges only once the `trivy` check is required in branch protection.

Accept a finding in `.trivyignore.yaml` at the repo root (read only when present):

```yaml
vulnerabilities:
  - id: CVE-2026-12345
    statement: Why it stays.
    expired_at: 2026-11-18
misconfigurations:
  - id: DS-0002
    paths:
      - .cursor/Dockerfile
    statement: Why it stays.
    expired_at: 2026-11-18
```

- Past `expired_at` the finding fails again. Keep it within the fix-time policy (`docs/deployments.md` § Dependency updaters).
- `scripts/ci/check-dependency-audit.mjs` adopted → the scan skips `pnpm-lock.yaml`; accept pnpm advisories in `accepted-advisories.json` only.
- Keep `--include-dev-deps`: without it Trivy drops npm / yarn / pnpm dev dependencies, and a dev-tooling lockfile scans zero packages and passes.
- Pin = image tag + `sha256:` digest; Renovate bumps both. Never `aquasecurity/trivy-action` or `setup-trivy` by tag (tags re-pointed at a credential stealer, March 2026); never releases 0.69.4 – 0.69.6.
- The `.cursor/Dockerfile` template runs as root → `DS-0002`. Add a non-root `USER` or accept it.
- Reads Dockerfiles, not built images. OS packages in an image you build → add a step after your build running the same pinned image with `image <your-image-ref>`.
- Results print in the job log. Security-tab upload (SARIF) is free on public repos only.

## Serena — symbol lookup

Local language server, wired as MCP server; agents use it. Does not rewrite `CLAUDE.md` / `.claude/settings.json`. Reference: https://github.com/oraios/serena.

```bash
brew install uv
uv tool install -p 3.13 serena-agent
```

PyPI name `serena-agent`, CLI `serena`. PyPI `serena` is an unrelated package.

- Set `project_name`, `typescript_version` in `.serena/project.yml`. `typescript_version` must match `package.json`, not Serena's bundled compiler. TypeScript >= 7 ships no `tsserver` → language server fails to start (`Could not find a valid TypeScript installation`) → set `"5.9.3"` (Serena's bundled, last with `tsserver`).
- Trust the project: add its path to `trusted_project_path_patterns` in `~/.serena/serena_config.yml`. Untrusted → Serena ignores all of `ls_specific_settings` (`typescript_version`, indexing waits) with only a log `WARNING`; lookups still answer on bundled defaults.
- Adapt `ignored_paths` to the repo: index the code a change touches, skip committed build output and byte-copied payloads (each indexed copy answers every reference twice).
- `.mcp.json` (Claude Code) calls `scripts/serena/bkit-serena-mcp.sh` → finds binary when GUI app has no login-shell `PATH`.
- Cursor's `.cursor/mcp.json` cannot use that wrapper → point `command` at `${HOME}/.local/bin/serena`, pass `--context ide`.
- Codex: `.codex/config.toml` → `[mcp_servers.serena]`, `command` = absolute path to `serena`, `args = ["start-mcp-server", "--context", "codex", "--project-from-cwd"]`. bkit writes no `.codex/config.toml`.
- OpenCode: `.opencode/opencode.json` → `mcp.serena` = `{ "type": "local", "command": ["<absolute path to serena>", "start-mcp-server", "--context", "ide", "--project-from-cwd"] }`. `bkit upgrade` keeps custom `mcp` entries.
- List `serena` in `.agents/context.md` `mcp-servers` block → every host runs its tools without a prompt; workflow subagents cannot answer one.
- bkit code-reading subagents carry `mcp__serena__*` in `tools:`. Serena not wired → Claude Code drops the entry; agent runs on text search.

`.gitignore`:

```
.serena/*
!.serena/project.yml
```

- Keep `read_only: true`, `added_modes: ["no-memories"]`, and the full `excluded_tools` list from example → Serena stays lookup-only for agents. List excludes every tool that writes files / memories / project config, runs code or commands, or opens a browser. Serena edits bypass Edit / Write hooks. Removing an entry hands that tool to every bkit agent.
- `--context codex` still lists excluded tools but refuses each call (`not active`).
- Serena line numbers are 0-based → add 1 before citing `file:line`.
- Small / empty answer for an exported symbol = query did not resolve, not "nothing uses it" → corroborate with text search.
- pnpm monorepo: cross-package references need `composite` + `references` in TypeScript project graph before language server follows them.

## Issue forms — `.github/ISSUE_TEMPLATE/`

Issues are the first input every workflow reads. One form per way work starts; each form's intro names its next command. Section names, syntax and machine-read lines: `.bkit/trackers.md` § Issue shapes. GitHub tracker ONLY (Linear and Jira have their own templates). Reference: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms.

<!-- prettier-ignore -->
| Form | Use when | Next step | Asks for |
| --- | --- | --- | --- |
| `bkit-idea.yml` | How it should work is still open | `/bkit-design #N` | problem, outcome, success criteria, constraints and non-goals, decisions already made, open questions |
| `bkit-change.yml` | What to build and "done" are known | `/bkit-plan #N`, or `/bkit-build #N` / `build:lite` with no plan | the plan in short: narrative, success criteria, edge cases, test matrix, tasks with `Done when` + `Test first`, breaking changes and names, out of scope |
| `bkit-bug.yml` | Something does not work | a test or CI run already fails → `/bkit-debug #N`; nothing fails yet → `/bkit-debug #N [repro]` | failing test or CI run, what happened, what should, repro steps, how often, affected area, where and when, evidence |

- Every form ends with References. The change form shows the lines workflows read: `**Parent design:**` and `**Audit reports:**` (plan), the blocked-by block (build). Other references are not fetched; write exact paths, ledger `key`s and `#N — title`.
- A change issue is the plan's source when no design or audit report exists: its narrative, success criteria, edge cases, test rows and tasks carry over verbatim. `/bkit-build` with no plan builds those tasks and checks each `Test first` test failed before its code; `build:lite` checks nothing. Nothing ticks the boxes.
- Debug commits to the branch it runs on: start it on the branch the fix lands on.
- Copy the folder, commit on the default branch; GitHub reads forms from there only. Blank issues stay enabled.
- `labels:` applies `enhancement` / `bug` only when the repo has them; missing labels are skipped, never created. Never add `bkit:*` labels: workflows own them.
- Existing forms → copy only the `bkit-*` files you want; names never collide.

## graphify — map

On-demand only — not an installed skill or git hook. graphify ships an MCP server (`graphify-mcp`, stdio default); it stays unwired because its answers come from the `graph.json` snapshot and build/debug agents invalidate the graph faster than it rebuilds — Serena (no index to go stale) owns the agent surface. Two gates keep `docs/capabilities.md` current on dev: pre-push block below (blocks a stale push to dev) + self-skipping CI step (every push). Agents read `docs/capabilities.md`; audit templates that need the graph build it via `scripts/graphify/bkit-graphify.sh`. Only tracked output: `docs/capabilities.md`. Mermaid views: `docs/graphify-out/reports/graph-packages.mmd`, `graph-modules.mmd`. Reference: https://github.com/Graphify-Labs/graphify.

```bash
uv tool install "$(bash scripts/graphify/bkit-graphify.sh spec)"
```

PyPI name `graphifyy`, CLI `graphify`. `[sql]` adds `.sql` files to corpus. One pinned release builds and judges the register: `GRAPHIFY_SPEC` in `bkit-graphify.sh` (`spec` prints it; CI installs it). Another release draws different edges → `check`, `check-at`, `rollup`, `register`, `refresh` refuse it. Renovate bumps the pin (shipped `customManagers` scans `scripts/graphify/bkit-graphify.sh`); refresh the register in the same change.

`package.json` scripts:

```json
{
  "graph": "bash scripts/graphify/bkit-graphify.sh build",
  "graph:check": "bash scripts/graphify/bkit-graphify.sh check",
  "graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
  "graph:graphml": "bash scripts/graphify/bkit-graphify.sh graphml",
  "graph:refresh": "bash scripts/graphify/bkit-graphify.sh refresh",
  "graph:rollup": "bash scripts/graphify/bkit-graphify.sh rollup",
  "graph:scoped": "bash scripts/graphify/bkit-graphify.sh scoped",
  "graph:tree": "bash scripts/graphify/bkit-graphify.sh tree",
  "graph:update": "bash scripts/graphify/bkit-graphify.sh update"
}
```

`.envrc`:

```
export GRAPHIFY_OUT=docs/graphify-out
```

`.gitignore` (no leading slash):

```
graphify-out/
```

- Paste `scripts/graphify/bkit-graph-pre-push.sh` at the end of your `.husky/pre-push`, below the bkit lines. Push to dev → `check-at` on the pushed commit in a throwaway checkout → blocked on mismatch; uncommitted edits (a concurrent session's included) cannot change the answer. graphify not installed → loud "NOT checked" warning, push goes on (CI still checks). Other branches → warn-only staleness note. Reads `PUSH_DEV_SHA` from the bkit pre-push template's stdin loop; older hook copy → re-copy that loop from `.bkit/templates/.husky/pre-push`.
- `.github/workflows/bkit-ci.yml` ships `Check Capability Register` (push events): installs the `spec` release, runs `pnpm graph:check` → stale register fails CI. Self-skips without `scripts/graphify/bkit-graphify.sh`.
- graphify's MCP server is opt-in: install `graphifyy[mcp]` (`mcp` + `starlette`; HTTP transport also needs `uvicorn`) and pass the graph path explicitly — `graphify-mcp` defaults to `graphify-out/graph.json`, not the pinned `docs/graphify-out/graph.json`. Snapshot-dated answers suit audit/orientation, never build or debug.
- `.graphifyignore` merges `.gitignore`.
- Keep `package.json` in corpus — excluding it drops workspace `name` fields graphify resolves package imports with; graph still looks complete.
- Keep `tsconfig.json` out; graphify reads `paths` regardless.
- Always run `scripts/graphify/bkit-graphify.sh` — passes `--code-only`, `--no-label`, unsets API keys. No persistent LLM-off setting.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `pnpm graph` | Extract + cluster. Local. No API key. |
| `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
| `pnpm graph:update` | Re-extract changed files, then recluster. |
| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (push events); enabled in bkit's own CI. |
| `bash scripts/graphify/bkit-graphify.sh check-at <rev>` | `check` in a throwaway checkout of `<rev>` (default HEAD); pre-push gate runs it on the commit pushed to dev. |
| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of HEAD → copy over `docs/capabilities.md`. Fixes a red gate; commit result. |
| `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
| `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |

- `docs/graphify-out/` = raw `graph.json`; `docs/graphify-out/reports/` = derived views.
- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before first rollup (Overrides block must exist) → `pnpm graph:rollup` rewrites it after.
- Add capability → rule in `bkit-graph-drift-rules.json`: lane, owner module, one literal marker. Shipped rules JSON = one example row; replace it.
- Marker = a literal only the owner should contain (a host, a header, a marker string) — never the owner's exported function name: every legitimate caller then reads as `bypassed`.

`MMD_MIN_WEIGHT` (default 12, set in `bkit-graphify.sh`) drops light edges from the Mermaid views (`.mmd` files and the diagrams in `docs/capabilities.md`). One module per file → thinner edges → lower the default in your copy; an env override changes `docs/capabilities.md` per shell and fails `pnpm graph:check`. Iterate in mermaid.live; render internal-architecture diagram locally:

```bash
npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -o tmp/graph-packages.svg
```

- `bkit-graph-repair.py` runs between extract and cluster: restores `.js` specifiers pointing at `.tsx` files and workspace subpaths through an `exports` map. Bare `graphify update` drops that injection; `pnpm graph:update` restores it. `bkit-graph-eager.py` and `bkit-graphify-rollup.py` re-derive those imports from source and warn with the count graph.json lacks. Two files importing each other keep one link after clustering, so that pair never reads as missing.
- `bkit-graph-surface.py` = route layer. Assumes `apps/web` / `apps/mobile` page routes, `packages/api/src/v1.ts`, workspace scope `@scope/services/`. Replace `@scope` and route globs or section stays empty. Route reachability runs only when `scripts/ci/guards/assert-routes-reachable.mjs` exists; else skipped.
- `bkit-graph-imports.py` picks `react-native` vs `default` export conditions from importer path (`apps/mobile` vs `apps/web`). Change prefixes if app roots differ.
- Source roots are hard-coded for an `apps/` + `packages/` monorepo: `ROOTS` in `bkit-graph-drift.py` (files the drift rules scan), `ROOTS` in `bkit-graph-eager.py` and `DEFAULT_ROOTS` in `bkit-graph-imports.py` (files those passes walk), `by_package` / `by_module` in `bkit-graphify-rollup.py` (diagram boxes). Other layout → adapt all five, else capabilities read `gap` and diagrams come out empty. One flat source folder → `by_module` = one node per file. No web routes / no imports between top-level folders → route and package diagrams stay empty; that is the answer, not a fault.
- Extract warning `had syntax errors and may be partially extracted` can fire on valid code → symbols after that line are missing from the graph; treat that file as unmapped.

Do not run:

<!-- prettier-ignore -->
| Command | Effect |
| --- | --- |
| `graphify claude install` | Writes `CLAUDE.md` and `.claude/settings.json`. Next `bkit install` clobbers both. |
| `graphify install --project` | Writes a skill. `/bkit-ship` removes skills not named in `.agents/skills.md`. |
| `graphify hook install` | Rebuilds on every commit. bkit commits many times per workflow run. |

- Code-graph answer confirms what is present; does not prove what is absent. Missing edge looks like a real gap.
- Ignore rules are load-bearing: a noise-only pattern can drop edges the tool needs; output still looks plausible → re-measure after changing `.graphifyignore`.

## Secrets sync — one source, every store

Local gitignored env files = source of truth; `bkit-secrets.mjs sync` makes every store match, `drift` proves it. Needs Node >= 20 plus the CLI of each store used (`gh`, `eas`, `gcloud`); Vercel, Supabase and Cursor go through their REST APIs.

- Copy both files. Edit `bkit-secrets.config.mjs` only; `bkit-secrets.mjs` stays byte-identical across repos.
- Config = one row per secret naming every store holding a copy: `DATABASE_URL: ["vercel", "gcp"]`. Options per row: `from` (env key differs from store name), `derive` (`"${APP_URL}/path"`), `manual` (copies no API reaches), `"eas:secret"` (per-store option).
- Delete unused entries under `stores`; a store no row names is skipped.
- `.gitignore`: `scripts/secrets/bkit-secrets-state.json`.
- `.bkit/.env` overlay → agent / bkit tooling secrets only; app and stack credentials stay in app env files.
- Cursor store: option `environment` (name) or `environmentId` picks the Cloud Agents environment (ids from `GET /v1/environments`); token `CURSOR_API_KEY` (or `BKIT_CURSOR_API_KEY`). Secrets are write-only; `NAME: "cursor:environment_variable"` writes a non-secret env var instead of a Runtime Secret. `build_secret` names exist only in the dashboard — never written or deleted.
- Cursor rows: list only the names the cloud workflow needs — minimal set `BKIT_GH_TOKEN`, plus `BKIT_LINEAR_API_KEY` on Linear setups, optional `VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN` when the workflow reaches those stores. A first sync against a populated environment deletes every live name not listed (start with `--dry-run`). API errors surface with their code: `feature_unavailable` (environments API not enabled for the key), `key_not_supported` (`grok_` keys), `secret_name_ambiguous` (one name, several repo-scoped versions — pre-checked; remove the extra versions in the dashboard). Team-scope 403s (`team_admin_required`) are N/A — the adapter uses environment scope only.
- Custom store: no upstream change → `type: "custom"` + `module` loads a repo-local adapter (see below).

<!-- prettier-ignore -->
| Command (`node scripts/secrets/bkit-secrets.mjs …`) | Does |
| --- | --- |
| `sync --dry-run` | Writes and deletes it would make; no value printed. |
| `sync` | Writes values that differ or cannot be proven equal; deletes names not listed for a store, or empty in source. |
| `drift` | Read-only. Per store and environment: `missing`, `extra`, `differs`, `not-pushed`, `changed-elsewhere`. Exit 2 on drift. |
| `check [file]` | Local only: sources, env file vs example (exit 2 on a missing required key), every copy of every secret. |
| `--store <name>` | Narrow `sync` / `drift` / `list` to one store. Every run covers both environments; no per-environment option. |

`sync` deletes every live name not listed for that store → `--dry-run` before every sync. No listed key resolving to a value skips deletes for that store.

How `drift` proves a value without printing it:

<!-- prettier-ignore -->
| Store | Read back | Proof |
| --- | --- | --- |
| Vercel (encrypted / plain) | per-variable API read (the list endpoint stays encrypted) | SHA-256 of live value vs source |
| GCP Secret Manager | latest version | SHA-256 of live value vs source |
| EAS (plaintext / sensitive) | `env:list --include-sensitive` | SHA-256 of live value vs source |
| GitHub Actions, Supabase, Cursor, Vercel sensitive, EAS `secret` | write-only | state-file fingerprint vs source (`not-pushed`); store's last-updated time after recorded push (`changed-elsewhere`) |

- No recorded push → `unverified`, never `ok`. First sync records one.
- `bkit-secrets-state.json` = fingerprints + times only, per machine. Push from another machine or by hand → `changed-elsewhere` until next sync here.
- `manual` copies listed on every `check` / `drift`; update by hand on rotation.
- Vercel: branch-scoped preview vars left alone; an entry shared across environments is split before a write.

New store type → entry in `STORES` of the template's `bkit-secrets.mjs` (`open` → `list` / `write` / `remove`; contract above it), never in a copy only. A repo-local store needs no upstream change: `type: "custom"` + `module: "./stores/x.mjs"` (resolved against `scripts/secrets/`) loads a module whose default export carries `label` + `open` (optional `perEnv`, `protects`, `setOptions`); the engine validates the adapter at load and its `open()` handle at run.

## Prettier tables — keep table diffs to the changed row

Prettier aligns markdown tables with no config toggle; one edited cell re-pads every row. `bkit-insert-ignore.mjs` puts `<!-- prettier-ignore -->` directly above each table head (no blank line between), strips cell padding, normalises separators to `---`. Idempotent. Node >= 20, no dependencies.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `node scripts/prettier/bkit-insert-ignore.mjs` | Rewrite `.agents/`, `docs/`, `README.md` (or the paths given). |
| `node scripts/prettier/bkit-insert-ignore.mjs --check` | Write nothing; exit 1 if any file would change. Gate form. |

- Walks skip `skills/` trees (vendored), `docs/audits/`, `docs/plans/` (records, kept as written). A file named on the command line is always processed. New and edited records get it at commit: § lint-staged names each staged file.
- Skips tables inside ``` / ~~~ fences and tables already wrapped.
- A pipe inside an inline-code span is escaped to `\|` only when that restores the separator's column count; an existing `\|` stays literal.
- Exit 1 on damage it cannot repair, with or without `--check`: `truncated-row` (more cells than the separator; GFM drops the overflow) and `unrendered-table` (header ≠ separator count; GFM renders raw text). A bare pipe in cell prose is indistinguishable from a delimiter → escape it as `\|` by hand.

## tmp/ prune — old scratch files

Each push deletes scratch files agents left in `tmp/` untouched for a week, then the folders that leaves empty. Node >= 20, no dependencies.

```bash
mkdir -p scripts/cleanup
cp .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs scripts/cleanup/
```

- Wiring: the `tmp/ prune` block in the `.husky/pre-push` template runs it with `--days=7`, ahead of the gates; skipped while `scripts/cleanup/bkit-tmp-prune.mjs` is absent. Your `.husky/pre-push` lacks the block → paste it above the gates.
- Not a gate: a failed prune prints a warning; the push goes on.
- `--days=<n>` (n >= 1, default 7). Exit 0 = swept or no `tmp/`; 1 = an entry could not be removed (each named on stderr); 2 = bad arguments.
- Scope: `tmp/` at the top of the checkout the cwd sits in; each worktree prunes its own. `tmp/` itself stays.
- Age = file mtime. Symlinks never followed: a symlinked `tmp/` is skipped; a symlink inside is removed by its own age, target untouched. A folder goes only when empty and either the sweep emptied it or its own mtime is past the cutoff → a folder another process just made stays.
- Hand run: `node scripts/cleanup/bkit-tmp-prune.mjs`. Files to keep belong outside `tmp/`.

## Disk prune — cleanup steps you own

`bkit disk prune` runs only steps you list; bkit deletes nothing. No step file → nothing runs.

```bash
mkdir -p scripts/cleanup ~/.config/bkit
cp .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs scripts/cleanup/
cp .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs ~/.config/bkit/disk-prune.mjs
```

<!-- prettier-ignore -->
| File | Steps for | Runs from | Committed |
| --- | --- | --- | --- |
| `scripts/cleanup/bkit-disk-prune.mjs` | this checkout: build caches, leftover agent worktrees | checkout top, first | yes |
| `~/.config/bkit/disk-prune.mjs` (`$XDG_CONFIG_HOME/bkit/` when set) | shared tools: Docker, pnpm store, Xcode, Gradle, simulators | home folder | never |

- Step list, default-exported: `{ name, mode, run, skip?, paths? }`. `min` = stale, cheap; `max` = all that comes back by itself + every `min` step. `run` / `skip`: shell command or `({ cwd, log, note })` function; `skip` exit 0 or returned reason → skipped. `paths`: what `--dry-run` sizes, the most the step can free.
- Notes: `note(text)` = found, left for a person. Each sweep replaces its checkout's notes; `bkit tips` prints them first (from a worktree, the main checkout's too), so every workflow close surfaces them. No sweep for 7 days → dropped.
- Example worktree step: removes a `.worktrees/*` only when nothing is lost — clean, every commit on a remote or at a merged pull request's head (`gh`; squash merges) — via `bkit worktrees remove`, or plain `git worktree remove` when no workflow made it. Branches stay. Keeps a locked one or one committed to in 2 days; notes the rest.
- Adapt: keep a step only when what it deletes comes back by itself. Left out on purpose: named Docker volumes (local databases), runtimes and SDKs, whole pnpm store (`node_modules` hard-link into it).
- Wiring: last block of each Husky template — `pre-commit` → `--mode=min --auto`; `pre-push` → `--mode=max --auto`, after every gate (workflow pushes too). Missing → paste at the end of yours.
- `--auto`: detached, always exit 0. Each mode at most once a day per machine; `max` at most hourly while free disk < `bkit.disk.minFreeGb` (`package.json`, GB, default 40). Log: `~/.cache/bkit/disk-prune.log` (`$XDG_CACHE_HOME/bkit/` when set).
- Worktrees: `bkit worktrees setup` create / resume under `bkit.disk.minFreeGb` → runs `max` steps, waits. Still under → exit 12, nothing created; stderr lists what `max` steps still cover. No step file → no check.
- One sweep per machine at a time (`disk-prune.lock` beside the log). Failed step → logged, next runs. CI / cloud → nothing runs.
- Hand run: `pnpm bkit disk prune --mode=max --dry-run` → each step + its `paths` size; without `--dry-run` → runs now. Exit 1 = a step failed or a step file did not load.

## Local stack lock — one run at a time on a shared stack

Every worktree of a repo uses the same local services when their names and ports come from the repo's config (a Docker database, an emulator). A run that starts, resets or stops the stack, or tests against it, takes a machine-wide lock first; a second run waits and prints who holds it. bash + `/usr/bin/perl`, no dependencies.

```bash
mkdir -p scripts/ci
cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
```

<!-- prettier-ignore -->
| Wire into | How | Holds the lock |
| --- | --- | --- |
| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |

- Functions: `take_local_stack_lock` waits; `try_local_stack_lock` returns 1 at once while another run holds it; `release_local_stack_lock` frees it early; `local_stack_lock_holder` prints the holder. Safe under `set -e`.
- Name: `BKIT_LOCAL_STACK` when set, else the main checkout's folder name (`git rev-parse --git-common-dir`) → every worktree finds the same lock. A throwaway stack with its own names and ports sets its own `BKIT_LOCAL_STACK` and never waits on the shared one. Outside a git checkout with no `BKIT_LOCAL_STACK` → refuses, exit 1.
- Lock file: `~/.cache/bkit/local-stack-lock/<name>.lock` (`$XDG_CACHE_HOME/bkit/` when set), outside every checkout.
- Never stale: a small perl process holds the lock (flock) and exits within a second of its caller, however the caller ends.
- Wait: `LOCAL_STACK_LOCK_WAIT_S` seconds (default 3600), a note naming the holder once a minute, then exit 1 naming it. A runner started by the holder (`LOCAL_STACK_LOCK_OWNER`) does not wait. `CI=true` / `CI=1` → no-op.
- Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`): the raw command skips the lock. `.agents/rules.md` § Shared local stack.
