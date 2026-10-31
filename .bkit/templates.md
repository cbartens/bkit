# Templates — copy and own

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** Every template bkit ships but never installs: what each one does, where to copy it, and how to install the tool behind it.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - `bkit install` and `bkit upgrade` never write these files and never overwrite a copy.
> - Adapt the app roots, the workspace package scope and the rules JSON. The examples use `apps/web`, `apps/mobile`, `packages/api` and `@scope`.

## What each template is for

The adoption order is the `bkit tips` order. The local stack lock has no tip, because nothing in a repo shows a stack that every worktree shares, so adopt it once a second worktree touches that stack. The health check has no tip either: the `bkit-stub-health` advisory raises it while your CI copy keeps that stub. The sections below give each template's install steps and traps.

<!-- prettier-ignore -->
| Template | What it's for | Skip it and |
| --- | --- | --- |
| direnv | Loads `.bkit/.env` tokens whenever the project opens. | Saved tokens never load; every sign-in fails while the file looks right. |
| Serena | Agents look code up like an editor ("where is this defined, what uses it?"). Read-only. | Agents grep and read whole files: more accidental changes, more correction rounds, higher token cost. |
| CI workflow + CI scripts | Runs every check on GitHub on every change; one capstone check gates merge; `/bkit-ship` waits for it. | "Shipped" means merged, not checked. |
| Health check | After CI promotes a release, probes production's health URL. | A release that went live broken stays unnoticed until a user reports it. |
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
| CI scripts | `.bkit/templates/scripts/ci/` | `scripts/ci/` | the scripts you adopt (`lanes/bkit-resolve-push-base.mjs` + `.test.mjs`, CI's push base, also run by pre-push; `bkit-check-accepted-divergences.mjs` + `bkit-accepted-divergences.json`; `bkit-check-dependency-audit.mjs` + `bkit-accepted-advisories.json`, also run by pre-push). `bkit-check-capstone.mjs` + `bkit-check-capstone.test.mjs` are required with `bkit-ci.yml`, not optional |
| Health check | `.bkit/templates/.github/workflows/bkit-health.yml` | `.github/workflows/bkit-health.yml` | that file |
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

Placeholders: the copies keep them raw, so replace each one in your copy:

<!-- prettier-ignore -->
| Placeholder | In | Put | Typical value |
| --- | --- | --- | --- |
| `{{DEFAULT_BRANCH}}` | `bkit-ci.yml` (`on.push` / `on.pull_request` branches; stub comments), `bkit-trivy.yml` (`on.push` / `on.pull_request` branches), `bkit-health.yml` (`on.workflow_run` branches) | your production branch | `origin/HEAD` unless it is `dev`, else `main` |
| `{{PRODUCTION_URL}}` | `bkit-health.yml` (`env.PRODUCTION_URL`) | the origin production serves | `https://example.com` |
| `{{NODE_VERSION}}` | `bkit-ci.yml` (`actions/setup-node` `node-version`, both lanes) | your Node major, or swap the line for `node-version-file: .nvmrc` | `.nvmrc`, then `engines.node`, then `22` |
| `{{CLOUD_RUNNER}}` | `bkit-cloud.yml` (`runs-on`, all three jobs) | a runner label | `ubuntu-latest` |
| `{{SCRIPT_PATH}}` | `ai.bkit.launchd.plist` (`ProgramArguments`) | absolute path to the loader script, outside a TCC-protected folder (see § Launchd GUI environment) | `/Users/<you>/.config/bkit/bkit-launchd-env.sh` |
| `{{ENV_FILE}}` | `ai.bkit.launchd.plist` (`ProgramArguments`, `WatchPaths`) | absolute path to your env file | `/Users/<you>/.config/bkit/launchd.env` |

- `bkit install` / `bkit upgrade` refresh `.bkit/templates/` to the package's templates, unsubstituted. `bkit check` fails on a stale copy. `bkit uninstall` removes the folder, never an adopted copy.
- **What changed on upgrade.** `bkit upgrade` lists the changed, added and removed template paths. For each one you adopted, run `diff .bkit/templates/<path> <path>`, and merge what you want. The placeholder lines differ by design. `git diff .bkit/templates` in the upgrade commit shows the package change.
- Repo gates that scan the whole repo (prettier, Vale, slop-scan, eslint, tsc) must ignore `.bkit/templates/`. The `.prettierignore`, `.vale.ini`, `slop-scan.config.json` and `.oxlintrc.json` templates already do. Check that your adopted copy does too.
- Templates are written in Node unless the tool they wrap already needs another runtime (graphify and Serena: Python and shell launchers; git hooks: POSIX `sh`; local stack lock: bash and perl, because shell runners source it).
- `bkit.dependencies.updater` names the adopted updater (`"renovate"` / `"dependabot"`). Install fills it from the config present. `"none"` skips the install-time absence advisory. `bkit check` blocks when the setting and the configs disagree.
- No template has a manifest key. `docs/templates/bkit-audit-adoption.md` lists every template on each run, as adopted and wired, or as not adopted with the reason.

## Context-fetch blocks — `.agents/context.md`

`/bkit-debug` runs every `context-fetch` block below `<!-- bkit:end -->` in `.agents/context.md`, and cloud setup runs every `context-fetch:provision` block there. Each provider has one file, which holds:

- its fetch blocks, one per context, of which you copy one or more
- each fetch block's provision block (stack CLI only)
- the `allowed-domains` it needs beyond bkit's derived egress set
- its `mcp-servers` names

The block rules (markers, contexts, self-skip, output bounds) are in the managed block of `.agents/context.md`. Each fetch block bounds its own output at the source, with a window, a severity / level filter, a row / line cap, a page cap or a per-lane tail, because everything it prints is written into an artifact that an agent then reads. A block that bounds nothing downloads a whole-run dump, and only the post-hoc clamp catches it (`bkit check` advises, `context-fetch-unbounded`).

<!-- prettier-ignore -->
| File | Fits | `context=` | Fetches | Secret / non-secret env | Domains | CLI (provision) |
| --- | --- | --- | --- | --- | --- | --- |
| `bkit-github.md` | GitHub Actions | `ci`, `diff` | `ci`: failing run: failed jobs / steps, `::error` annotations, failed-step logs tail-bounded per failed job; `diff`: `git diff --stat` (capped) since the last green CI run on trunk | `GH_TOKEN` / `CI_LOG_TAIL`; `BASELINE_BRANCH`, `BASELINE_WORKFLOW`, `DIFF_STAT_N` (`diff`) | — | `gh` (base tool) |
| `bkit-playwright.md` | Playwright on GitHub Actions | `e2e` | failing run's report artifact, failing specs first; inlined files, lines and binary paths capped | `GH_TOKEN` / `E2E_ARTIFACT`, `E2E_JOB_RE`, `E2E_MAX_FILES`, `E2E_MAX_LINES`, `E2E_MAX_BIN` | — | `gh` (base tool) |
| `bkit-maestro.md` | Maestro iOS and Android lanes on GitHub Actions | `e2e` | every failed Maestro job's log, sliced to the result steps, each slice tail-bounded | `GH_TOKEN` / `MAESTRO_JOB_RE`, `MAESTRO_STEPS`, `MAESTRO_LOG_TAIL` | — | `gh` (base tool) |
| `bkit-tavily.md` | any | `web` | web search for upstream causes (untrusted output) | `BKIT_TAVILY_API_KEY` / `QUERY` | — | — |
| `bkit-sentry.md` | Sentry | `runtime` | unresolved issues seen in a window (organization issues endpoint), optional environment; trace / window recipes; detector-header strip | `SENTRY_AUTH_TOKEN` / `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_HOST`, `SENTRY_SINCE`, `SENTRY_ENV`, `SENTRY_N` | `sentry.io` | — |
| `bkit-vercel.md` | Vercel | `runtime` | serverless + edge error / fatal logs in a window, paged past the CLI's 50-line cap, all branches (`--no-branch`) | `VERCEL_TOKEN` / `VERCEL_SCOPE`, `VERCEL_ENV`, `SINCE`, `UNTIL`, `VERCEL_MAX_PAGES` | `vercel.com` | `vercel` (yes) |
| `bkit-supabase.md` | hosted Supabase | `runtime` | Postgres `ERROR` / `FATAL` / `PANIC` counts per hour, severity, SQLSTATE and role; one call per day of window | `SUPABASE_ACCESS_TOKEN` / `SUPABASE_PROJECT_ID`, `SINCE_ISO`, `UNTIL_ISO` | `supabase.com` | — |
| `bkit-stripe.md` | Stripe | `runtime` | failure / dispute / refund events, filtered by type and window at the source, paged; events whose webhook delivery failed | `STRIPE_SECRET_KEY` / `STRIPE_SINCE_S`, `STRIPE_MAX_PAGES` | `stripe.com` | — |
| `bkit-resend.md` | Resend | `runtime` | bounced / complained / failed / delayed sends, paged back to the window start | `RESEND_API_KEY` / `SINCE_ISO`, `RESEND_MAX_PAGES` | `resend.com` | — |
| `bkit-inngest.md` | Inngest Cloud | `runtime` | `inngest/function.failed` events in a window, paged; error class only, never error text | `INNGEST_SIGNING_KEY` / `INNGEST_ENV` (required with a branch key), `SINCE_ISO`, `UNTIL_ISO`, `INNGEST_N`, `INNGEST_MAX_PAGES` | `inngest.com` | — |
| `bkit-cloudrun.md` | Google Cloud Run | `runtime` | container errors + memory-limit kills; service account only when the gcloud login cannot mint a token | `GCP_CLIENT_EMAIL`, `GCP_PRIVATE_KEY` (headless) / `GCP_PROJECT_ID`, `GCP_SERVICE`, `GCP_FILTER` | `googleapis.com`, `google.com` | `gcloud` (yes) |
| `bkit-expo.md` | Expo EAS Build + EAS Workflows (Maestro) | `runtime`, `e2e` | `runtime`: newest 50 builds' status + errored-build log lines (capped per build); `e2e`: recent and FAILURE run lists, failed jobs' per-flow exceptions, JUnit (capped), screenshots, Maestro commands, hierarchy dumps, XCUITest + JS console | `EXPO_TOKEN` / `EXPO_APP_DIR`, `EAS_PLATFORM`, `EAS_PROFILE`, `EAS_N`, `EAS_LOG_N` (`runtime`); `EAS_WF_FILE`, `EAS_WF_N`, `EAS_WF_FAIL_N`, `EAS_JUNIT_N` (`e2e`) | `expo.dev`, `googleapis.com` (`runtime`), `eascdn.net` (`e2e`) | `eas` (yes) |
| `bkit-serena.md` | Serena MCP server | — | nothing: provision only, installs `serena` in cloud | — | — | `uv` (yes) |

The MCP names these files list are `sentry` / `Sentry`, `vercel` / `Vercel`, `supabase` / `Supabase`, `inngest` and `serena`. Every tool on a listed server runs without a prompt, writes included, so list only servers you trust with that.

Placeholders: each one sits on a commented assignment line or an env default in the block. Replace it in your copy:

<!-- prettier-ignore -->
| Placeholder | In | Put |
| --- | --- | --- |
| `your-team-slug` | `bkit-vercel.md` (`VERCEL_SCOPE`) | Vercel team slug |
| `your-project-ref` | `bkit-supabase.md` (`SUPABASE_PROJECT_ID`) | project ref of the environment whose logs you want |
| `your-org-slug`, `your-project-slug` | `bkit-sentry.md` (`SENTRY_ORG`, `SENTRY_PROJECT`) | Sentry slugs |
| `de.sentry.io` (commented) | `bkit-sentry.md` (`SENTRY_HOST`) | uncomment for an EU-region org; default `sentry.io` |
| `your-gcp-project-id`, `your-service-name` | `bkit-cloudrun.md` (`GCP_PROJECT_ID`, `GCP_SERVICE`) | GCP project id; optional service name |
| `^your-e2e-job-name$` | `bkit-playwright.md` (`E2E_JOB_RE`) | anchored job name of that lane only |
| `^your-maestro-e2e-job-name$`, `Your per-flow results step\|Your failure classification step` | `bkit-maestro.md` (`MAESTRO_JOB_RE`, `MAESTRO_STEPS`) | anchored regex matching the Maestro lanes' job names; `\|`-separated names of the steps that print results |
| `dev`, `bkit-ci.yml` | `bkit-github.md` `context=diff` (`BASELINE_BRANCH`, `BASELINE_WORKFLOW`) | trunk branch, CI workflow file |
| `apps/mobile` | `bkit-expo.md`, both blocks (`EXPO_APP_DIR`) | the EAS-linked app folder |
| `serena-agent==1.7.0` | `bkit-serena.md` | the Serena version you run locally |

Adopt:

1. Copy the file's blocks below `<!-- bkit:end -->` in `.agents/context.md`: each fetch block you want, its provision block, and its `allowed-domains` and `mcp-servers` blocks. Several blocks of each kind merge.
2. Replace the placeholders. Commit non-secret selectors inline so cloud agents inherit them.
3. Set the secret env vars locally (app env via `.envrc`, not `.bkit/.env`) and in each cloud dashboard (`.bkit/cloud.md`).
4. Run `bkit install`. The provision recipes reach `.claude/bkit-cloud.md`'s setup script and `.codex/bkit-cloud.md`'s install script (`.cursor/environment.json` `install` and the Claude session hook run them through `bkit context provision`). The domains reach the cloud allowlist and the local fetch permissions, and the MCP names reach every host's allow rules.

- **If** credentials are missing, or the block hits an API / auth error → it self-skips with `exit 0` and `[context-fetch:<name>] skipped — …` on stderr. `/bkit-debug` narrates that as not checked, never as clean.
- `TRUNCATED` on stdout means the page cap or a failed later page stopped the read. Raise the block's `*_MAX_PAGES` knob.
- The `# Customise:` note in the runtime and EAS blocks suggests a positive control: run the block once over a window that holds a known event. Nothing back means the reader is broken, not that the source is clean.
- `bkit check` advisories point at these files: `context-fetch-missing`, `context-fetch-context-missing`, `context-fetch-source-not-enabled`, `context-fetch-provision-missing`, `context-fetch-unbounded`.
- For another backend, author a block in the same shape. The rules are in the managed block of `.agents/context.md`.

## Gate tool scripts — `package.json`

bkit seeds only the `bkit:gate:*` / `bkit:deps:*` names, and adds each one only if it is missing. The tool scripts their defaults chain are yours, and `gate-missing-called-scripts` names any that are missing.

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

- `lint` must exist. Without it, `pnpm lint` falls through to any `lint` binary on `PATH`, and the gate goes green through the wrong program.
- The value above runs the Oxlint test rules (§ Oxlint) and fails on any hit. It needs `oxlint` and `oxlint-tsgolint`, and fails loudly without them.
- **If** you have your own linter → chain both: `<your linter> && oxlint -c .oxlintrc.json --type-aware --deny-warnings`.
- **If** there is no `tsconfig.json` → use `"typecheck": "echo \"[bkit] typecheck: no tsconfig.json — skipping\" >&2"`.
- `slop:delta` runs `bkit ci slop` (the bkit devDep is on `PATH` through the package script). CI passes the base sha as its one bare argument.
- `lint:prose` runs `bkit ci prose`: Vale over every `*.md` outside `node_modules/`. Narrow it with the repeatable `--glob=<pattern>` (`*`, `**`, `?`, relative to the repo root), for example `bkit ci prose --glob='docs/*.md' --glob='.agents/*.md'`.
- **If** the stack is not Node → point each gate at your own commands, and keep the gate names.
- `bkit:test:file` runs one test file and writes a JUnit report to `$BKIT_TEST_REPORT`. bkit appends the file's repo-relative path. `/bkit-build` reads the report for test-first. It is not seeded, and `test-file-script-missing` fires until it is declared.
  - Vitest: `"bkit:test:file": "vitest run --reporter=default --reporter=junit --outputFile.junit=\"$BKIT_TEST_REPORT\""`.
  - Call the runner directly, not through a caching task runner.
- `bkit:lint:file` lints one test file with the static gate's rules, and exits 0 when clean. bkit appends the path. `bkit tests red` runs it before the test, and records no red while it fails. It is not seeded, and `lint-file-script-missing` fires once `bkit:test:file` is declared without it.
  - ESLint: `"bkit:lint:file": "eslint --max-warnings=0"`.
  - Ruff: `"bkit:lint:file": "ruff check"`.

## CI workflow — `bkit-ci.yml`

The parallel lanes `bkit-tests-static` (typecheck, lint, prettier, Vale, slop, actionlint, `bkit check`, pinned checksums) and `bkit-tests-unit` are joined by the `bkit-tests-check` capstone. The file also carries the commented full CI scaffold reference for the other tiers. Reference: https://docs.github.com/en/actions.

Workflows care about it:

- `/bkit-ship` waits on its runs, and merges only when the `bkit.testing.ciCapstone` job (default `bkit-tests-check`) is present and green at the head.
- `bkit setup protect-main` makes that job the required check.
- `bkit-cloud.yml` triggers on a workflow named `bkit-ci`.
- `bkit install` reads your copy for advisories (`bkit-stub-*`, `ci-yml-missing-actionlint`, `ci-yml-capstone-contract-drift`).

Setup:

- Install: nothing beyond the gate tool scripts above, a `test` script, and `packageManager` in `package.json`. `pnpm/action-setup` reads it, so do not add `with: version:`.
- Adapt: `{{DEFAULT_BRANCH}}`, `{{NODE_VERSION}}`.
- **If** the repo is not Node → replace the Node / pnpm setup, install and check steps with your stack's.
- Capstone: `bkit-tests-check` `needs:` every lane, and runs on `!cancelled()`, never `always()`.
  - Each lane you adopt from the reference goes into its `needs:` and its assert. Otherwise that lane's failure cannot red the merge.
  - Its assert is `scripts/ci/bkit-check-capstone.mjs`. Copy it and `bkit-check-capstone.test.mjs` from `.bkit/templates/scripts/ci/` with the workflow. The script is required: when the file is missing, the step reds with a copy-the-script message, and it never skips.
  - The script reds on a lane that did not succeed, a lane that ran when the plan said skip, a lane that succeeded with 0 tests or a non-numeric count, and a plan that does not parse.
  - It reads each lane's executed-test count once the lane writes one. The `Run Unit Tests` step comment shows the vitest form. `EMPTY_COUNT: warn` makes an unreported count a warning, and a count of 0 a failure.
  - Each lane you adopt goes into `LANES` and its `<LANE>_RESULT` / `<LANE>_RAN` variables.
  - **If** you rename the job → set `bkit.testing.ciCapstone`.
- Adopt a scaffold lane only when its tier exists (`docs/testing.md`). Each `# bkit-stub:<id> —` header raises an install advisory until you enable or delete that stub.
- Keep the `name: bkit-ci` line, or rename `workflows: [bkit-ci]` in `bkit-cloud.yml` and `bkit-health.yml` and set `bkit.testing.ciWorkflow` to the new file name.
- Keep `fetch-depth: 0` on the static lane, because `slop:delta` checks the PR base out as a worktree.
- **If** CI script copies are named without the `bkit-` prefix (`check-capstone.mjs`, `accepted-advisories.json`, …) → the `bkit check` advisory `ci-scripts-old-names` lists each rename.
  - Rename a file and its paths in `.github/workflows/*.yml`, `.husky/pre-push` and `scripts/ci/` in one commit, because the `Check Dependency Audit` step is guarded by `hashFiles` and skips silently when only the file moved.

## Health check — `bkit-health.yml`

It probes production after every finished `bkit-ci` run on the default branch, green or red, because `bkit-tests-deploy` promotes before the E2E and `@live` lanes run, so a red run can still have put a release live. The `bkit-health-promoted` job asks the host which commit production serves. The `bkit-health` job probes the health URL only when that commit is the run's own, and shows as skipped otherwise. It is not a required check. It fits a deploy that `bkit-ci` promotes. When the host deploys on its own after merge, trigger on `deployment_status` instead (`docs/deployments.md` § Smoke trigger plumbing).

- Install: the secrets `VERCEL_TOKEN` and `VERCEL_TEAM_ID`, the same ones the CI scaffold's Vercel lanes read.
- **If** you use another host → replace `Did This Run Promote?` with a call to its API that prints the commit production serves.
- Adapt: `{{DEFAULT_BRANCH}}`, `{{PRODUCTION_URL}}`, and `HEALTH_PATH` (default `/api/health`).
- The promote check fails when the host's answer cannot be read, because a skipped probe would look green.
- The probe retries for up to 240 seconds, because a release the host reports as live can still be warming up.
- The probe checks only for a 200. Check the body your endpoint returns too, so an error page that answers 200 fails.
- More probes (a curl script over key routes, a small tagged browser suite) go in as further steps of the `bkit-health` job. A step that runs a repo script needs `actions/checkout` with `ref: ${{ github.event.workflow_run.head_sha }}` first.
- One health workflow per repo: keep any other post-deploy probe as a step here, not as a second workflow.

## Cloud-agent workflow — `bkit-cloud.yml`

A post-CI router that runs bkit workflows:

- CI pass on `feat/**` → `/bkit-ship`, fail → `/bkit-debug`.
- Failed `dev` CI → `/bkit-debug {FID}`.
- `workflow_dispatch` runs any phase.

A `context` job resolves the phase and argument once. Then two runner jobs follow, each skipped without its secret: `claude` (`claude-code-action`, https://github.com/anthropics/claude-code-action) and `opencode` (`opencode run`, https://opencode.ai/docs/github/). `bkit install --auto=claude|opencode` points at this file. The full recipe is in `.bkit/cloud.md` § Post-CI auto-routing.

- Install: `bkit install --auto=claude` (points at the `.claude/hooks/bkit-cloud-bootstrap.sh` template) or `--auto=opencode` (needs `--opencode=<provider>` first). Both need `--tracker=github`.
- Secrets for `claude`: `ANTHROPIC_API_KEY`, or keyless with the `ANTHROPIC_FEDERATION_RULE_ID` and `ANTHROPIC_ORGANIZATION_ID` repo variables, plus the Claude GitHub App (`/install-github-app`).
- Secrets for `opencode`: `OPENCODE_PROVIDER_KEY`.
- Repo Actions permissions: read and write, with PR creation allowed.
- Adapt: `{{CLOUD_RUNNER}}` in all three jobs.
- Traps:
  - The file runs bkit by command name, so a changed invocation reaches you only as a changed template path on `bkit upgrade`. Diff it on every upgrade.
  - The opencode install version is a plain argument. The `# renovate:` comment above it lets the example `renovate.json5` bump it.
  - Keep the file out of the updater's `ignorePaths` so action pins refresh.

## Git hooks — Husky

`pre-commit` runs `bkit:gate:format`. `pre-push` runs `bkit check` first, so a drifted install fails in seconds. Then it runs `bkit:gate:static-unit-integration` when package.json declares it, else `bkit:gate:static-unit` (`bkit:gate:static` on revert branches / commits; `bkit:gate:min` on a min push). It also runs the CI-suppressing-token guards, the dependency audit (§ Dependency audit) and the `tmp/` prune (§ tmp/ prune). Each hook ends by starting the disk prune (§ Disk prune).

Pre-push re-runs itself once with all its output copied to `tmp/pre-push.log`, which is rewritten on each push. It prints that path first and last, with the exit code. `--no-verify` and a checkout without husky (a linked worktree) write no log.

Workflows care because they commit and push without `--no-verify`, so a failing hook stops a workflow. One checkout is the exception: the throwaway `.worktrees/_land-{FID}` checkout that lands bookkeeping on `dev` (docs, logs, ledgers, `[skip ci]`) runs no hooks, and logs that it skipped them. Reference: https://typicode.github.io/husky/.

```bash
pnpm add -D husky@^9.1.7   # plus "prepare": "husky" (§ Gate tool scripts)
chmod +x .husky/pre-commit .husky/pre-push
```

- `.gitignore`: `.husky/_` (bkit's `.gitignore` block already lists it).
- Adapt: repo-only checks go below the bkit lines in each hook. What a gate runs belongs in the `bkit:gate:*` script, not the hook.
- Min push:
  - **If** every file changed since each pushed commit left `origin/dev` (else `origin/main`) matches `bkit.testing.minPushPaths` → `bkit:gate:min` replaces the full gate, and `MIN_PUSH=1`.
  - The setting takes `package.json` globs: `*` matches one folder and `**` any depth. The default is `docs/plans/**`, `docs/*.jsonl`, `.bkit/*.jsonl`, and `[]` turns it off.
  - `bkit ci min-push` decides from files, never from `[skip ci]`, because that is a typed label and GitHub reads the last commit only.
  - **If** there are no files, the range is unreadable or there is no ref list → the full gate runs.
- Min-push paths: list only files that no code, build or test reads.
  - Never list `docs/**`, because a doc can be test input.
  - **If** a test reads a ledger → put that test into `bkit:gate:min`.
- `[skip ci]` guards:
  - On a feature branch, the push is blocked only while a PR is open, because workflows push `[skip ci]` code heads mid-run.
  - On `dev` / `main`, the push is blocked unless it is a min push, because GitHub skips CI for the whole push.
- Slop base:
  - **If** the push is to `dev` **and** `scripts/ci/lanes/bkit-resolve-push-base.mjs` is copied → the hook runs it with `--local --branch=dev --head=<pushed sha>`, and exports `SLOP_BASE_REF` as CI's push base. That base is the head of the last green CI push run on `dev`, else `origin/dev`. The hook prints the base and its source.
  - Pre-push and CI slop then share a base, so a finding that an earlier red push landed fails locally too.
  - **If** the run lookup fails (`gh` missing, logged out) → the hook prints a loud `WARNING`, uses the base `origin/dev`, and the push goes on.
  - **If** the branch is another branch, or there is no copy → `bkit ci slop` uses its merge-base default.
  - A repo-owned pre-push check that diffs against CI's base (migration immutability) reads `SLOP_BASE_REF` when it is set.
- **If** the repo has slow extras (Docker, database, build) → wrap them in `if [ "$MIN_PUSH" != "1" ]; then … fi`.
- Traps:
  - Hooks run on every workflow commit. Keep pre-commit to seconds, and keep pre-push to deterministic checks that reach no deployed service.
  - Integration runs at pre-push once `bkit:gate:static-unit-integration` is declared. A local database in Docker is fine. E2E and `@live` belong in CI.
- Run each check once:
  - Put nothing in `bkit:gate:format` that the push gate runs again (`gate-commit-repeats-push` advisory).
  - `pnpm test` (the unit tier) must match no `*.integration.test.*` file. A unit config with no integration exclude runs those tests in the unit gate and again in the integration gate.

## Prettier — `.prettierignore` first

```bash
pnpm add -D prettier@^3.5.3
```

1. Copy `.prettierignore` before the first `prettier --write`. bkit writes `.claude/`, `.cursor/`, `.opencode/`, `.mcp.json`, `.bkit/.env.example` and `docs/roadmap.md` in its own layout, so prettier reformatting them fights the next `bkit install` (`bkit check` drift).
2. Add `format:check` (§ Gate tool scripts). Reference: https://prettier.io/docs/install.

- Keep the `.bkit/templates/` line.
- Keep the three `docs/plans/*/logs/*/` gate-log lines: build and debug commit raw `bkit tests run` output there, and `format:check` fails on it.

## lint-staged — `.lintstagedrc.json`

It runs prettier over staged files. `bkit:gate:format` (the pre-commit hook) calls it. Reference: https://github.com/lint-staged/lint-staged.

```bash
pnpm add -D lint-staged@^17.0.0 prettier@^3.5.3
```

- Staged `docs/plans/**/*.md` and `docs/audits/**/*.md` (design, plan, audit docs) run `scripts/prettier/bkit-insert-ignore.mjs` before prettier, so committed tables carry `<!-- prettier-ignore -->` and `| --- |` separators.
  - This needs § Prettier tables copied. Without it, commits that touch those files fail.
- Globs must not overlap, because lint-staged runs entries concurrently, so two entries that write one file race. The second entry negates the first.
- Adapt: add per-glob commands (eslint `--fix`, etc.), and keep them seconds-fast.

## Vale — prose lint, with House styles

`lint:prose` (`bkit ci prose`, in `bkit:gate:static`) runs Vale with the `write-good` package and bkit's House styles (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) on `.agents/**`. Workflows reach Vale only through the gate. Reference: https://vale.sh/docs/install.

```bash
brew install vale
vale sync
```

- Copy `.vale.ini` and all four `.vale/styles/House/*.yml`.
- `.gitignore`: `.vale/styles/write-good`. `vale sync` downloads it, and the House styles stay tracked.
- CI: the `bkit-ci.yml` template installs a pinned Vale and runs `vale sync`.
- Cursor: the `Dockerfile` template installs it.
- Adapt: add `[glob]` scope blocks for your own docs. Turn rules off per path, not globally.
- Traps:
  - **If** Vale is not on `PATH` → `lint:prose` prints a skip line, and the prose gate is not enforcing.
  - A missing `write-good` is copied from the main worktree, else `vale sync` runs. When both fail, it prints a loud skip warning.
  - Keep the `.bkit/templates/**` block, which turns rules off for the copies.

## slop-scan — `slop-scan.config.json`

`lint:slop` reports. `slop:delta` (`bkit ci slop`, in `bkit:gate:static`) fails on net-new findings against the base. The base is `--base` / the bare argument, else `$SLOP_BASE_REF`, else the merge-base with `origin/dev` (else `origin/main`). CI passes its planner base, and pre-push on a `dev` push exports the same base as `SLOP_BASE_REF` (§ Git hooks), so both compare against the last green CI push run. On failure it logs each net-new / worsened finding (`path:line`, rule, message; line shifts dropped) and emits them as `findings`. Reference: https://github.com/benvinegar/slop-scan.

```bash
pnpm add -D slop-scan@^0.3.0
mkdir -p scripts/slop
cp .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs scripts/slop/
```

- The plugin is a template. Copy `scripts/slop/bkit-slop-type-suppression.mjs`, and point the config's `plugins` entry at it (`boundary/type-suppression`, `boundary/gate-suppression`).
- **If** you use no plugin → drop the `plugins` entry and both `boundary/*` rules.
- Adapt: add `ignores` for generated / vendored trees. Use per-file `overrides` with a reason, never a rule disabled repo-wide.
- Traps:
  - Keep `**/.bkit/templates/**` in `ignores`, or the copied `.mjs` / `.py` files count as net-new slop on the upgrade commit.
  - Nothing imports the copied plugin, so a reachability scanner (knip, ts-prune, vulture) reads it as dead. Register it as an entry point. Where `scripts/` is its own scanner workspace, register it there, not in the root workspace.

## Oxlint — test-file lint, `.oxlintrc.json`

It fails `lint` on a test that cannot fail. Oxlint (a fast linter) runs five rules on test files only, with all other checks off. It fits JS / TS repos with Vitest or Jest. Reference: https://oxc.rs/docs/guide/usage/linter.html.

```bash
pnpm add -D oxlint@^1.87.0 oxlint-tsgolint@^7.0.2004
cp .bkit/templates/.oxlintrc.json .oxlintrc.json
```

Set `lint` to the value in § Gate tool scripts.

<!-- prettier-ignore -->
| Rule | Fails on |
| --- | --- |
| `vitest/expect-expect` | A test with no assertion. |
| `vitest/no-conditional-in-test` | `if`, `?:`, `&&`, `??` or `\|\|` inside a test: the branch under test may never run. |
| `vitest/no-conditional-expect` | An `expect` inside a branch or `catch`: it may never run. |
| `vitest/valid-expect` (`maxArgs: 2`) | `expect(x)` with no matcher; more than a value and a message. |
| `typescript/no-floating-promises` | A promise nobody awaits: the test ends before its assertion runs. |

- Scope: `**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`. Source files are not linted. The `vitest/` rules read Jest-style `describe` / `it` / `expect` too.
- `ignorePatterns` skips `.bkit/templates/` and `scripts/ci/**/*.test.mjs`, because CI script tests run on plain Node with their own `test()` helper, which the rules misread.
- Keep `--type-aware`. Without it, `typescript/no-floating-promises` never runs, and the gate stays green.
- `oxlint-tsgolint` (a peer of `oxlint`) bundles its own TypeScript engine, so there is no `typescript` dependency. The tested pair is `oxlint` 1.87.0 and `oxlint-tsgolint` 7.0.2004.
- With no path argument, it lints the working directory. Narrow it (`oxlint … src`).
- **If** tests sit outside the root `tsconfig.json` → add `--tsconfig <file>`.
- Adapt: the `files` glob, and `assertFunctionNames` on `expect-expect` (default `expect`) when your own helper asserts, for example `["expect", "expectHttpError"]`. Turn a rule off per file in `overrides`, never repo-wide.
- **If** you have an existing suite → expect many hits. Fix each one in its test:
  - one `it` per case (`it.each` for tables)
  - `await expect(…).rejects` in place of `try` / `catch`
  - `await` on every promise
  - no baseline file, no disable comment, no `.skip`
- ESLint is not used because typescript-eslint's type-aware rules need TypeScript `<6.1`.
- **If** the repo is not JS → keep its own linter and its test-lint rules (for example `flake8-pytest-style`). `lint` stays yours.
- `bkit tips` suggests it (tip `test-lint`) when `package.json` lists `vitest` or `jest` and the repo has no Oxlint config, no `oxlint` dependency and no ESLint config naming a test plugin.

## direnv — `.envrc`

It loads `.bkit/.env` on `cd`, so local sessions see `BKIT_GH_TOKEN` and the tracker keys. bkit reads your `.envrc` (its `dotenv*` and `unset` lines, never executed) to fill the env blocks of `.claude/bkit-cloud.md` / `.cursor/bkit-cloud.md` / `.codex/bkit-cloud.md`. Preflight's direnv advisories key on it. Reference: https://direnv.net/docs/installation.html.

```bash
brew install direnv     # then add the shell hook from the link
direnv allow
```

- Adapt: add one `dotenv_if_exists <path>` line per extra env file.
- `unset` the keys that must stay out of the shell. They are dropped from the cloud env blocks too.

## Launchd GUI environment — tokens for Dock-launched apps

Dock / Spotlight launches start under `launchd`, which never runs the login shell or direnv. So GUI apps (opencode desktop, Cursor) start without `BKIT_*`, and provider calls fail on authentication. The template set pairs a loader script with a machine-local env file. The LaunchAgent runs the loader at login, and again on every write to that file.

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

- `WatchPaths` re-runs the loader on every env-file write, so no re-bootstrap is needed.
  - To rotate a token, edit the value.
  - To revoke a token, delete the line or empty the value (`KEY=""`).
- The loader loads `BKIT_*` keys only, and logs the others as skipped. An empty value runs `launchctl unsetenv`.
- Loaded key names are recorded in `.launchd-loaded-keys` next to the env file (mode 600; `BKIT_LAUNCHD_STATE` overrides the path). A recorded key that is missing from the env file is unset on the next run.
- One failing key is logged and skipped. The rest still load, and the loader exits 1. A failed unset stays recorded and retries on the next run.
- The log `~/Library/Logs/bkit-launchd.log` records key names only, never values. `BKIT_LAUNCHD_LOG` and `BKIT_LAUNCHD_ENV` override the log and env-file defaults.
- The loader self-skips (a log line and `exit 0`) when the env file is absent or `launchctl` is off `PATH` (Linux CI).
- launchd cannot exec a loader under `~/Documents`, `~/Desktop` or `~/Downloads`, because macOS TCC denies it. `/tmp/bkit-launchd.log` then reads `Operation not permitted`.
  - **If** the repo sits under one of those → keep the adopted copy in git, but place the loader that launchd runs at `~/.config/bkit/bkit-launchd-env.sh` (or another unprotected path), and point `{{SCRIPT_PATH}}` there.
- Env-file rules:
  - Blank lines and `#` comments are ignored.
  - The `export ` prefix is optional.
  - A key must match `[A-Za-z0-9_]`.
  - Matching surrounding quotes are stripped from the value.
- `launchctl setenv` reaches apps launched after the load. A running app keeps its environment until relaunch, for set and unset alike.
- **Exposure:** `launchctl setenv` makes every loaded token visible to every app started in the login session, not only the app that needs it. Load only tokens you accept that for. Prefer `bkit cursor` / `bkit opencode` (per-process env) where possible.
- Remove: `launchctl bootout gui/$UID ~/Library/LaunchAgents/ai.bkit.launchd.plist`.

## Cursor — `settings.json`, `environment.json`, `Dockerfile`

These are the editor defaults (`settings.json`: prettier format-on-save, extension recommendations) and the Cursor Cloud Agent image (`environment.json` → `Dockerfile` + per-snapshot `install`). Cloud agents run bkit workflows. `bkit install --auto=cursor` (needs `--tracker=linear`) points at the two cloud files. Reference: https://cursor.com/docs/cloud-agent/setup.

- `Dockerfile`: the `bkit toolchain` section installs what bkit's workflows use (git, jq, python3, pinned and sha256-checked gh and Vale, corepack-pinned pnpm). Node 24 is installed outside it from a sha256-checked nodejs.org tarball. Adapt `FROM`, the Node version and the repo extras outside the toolchain section.
- `environment.json` `install`: `pnpm install --frozen-lockfile`, then `vale sync` when `.vale.ini` exists.
- Secrets: Cloud Agents dashboard → Runtime Secrets (`.bkit/cloud.md`).
- Traps:
  - The corepack pnpm pin must match `packageManager`.
  - Keep the `bkit toolchain` section as shipped, so the template diff on upgrade stays readable.

## Dependabot and Renovate

Each one opens dependency PRs. No bkit workflow reads either. Pick one, and copy only its files. Reference: Dependabot https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference; Renovate https://docs.renovatebot.com/, self-hosted action https://github.com/renovatebot/github-action.

Dependabot: commit `.github/dependabot.yml` on the default branch, then enable alerts and security updates:

```bash
gh api -X PUT 'repos/{owner}/{repo}/vulnerability-alerts'
gh api -X PUT 'repos/{owner}/{repo}/automated-security-fixes'
```

Renovate (Mend): commit `.github/renovate.json5` on the default branch, then install the App at https://github.com/apps/renovate in the GitHub UI. There is no `gh` equivalent.

Renovate (self-hosted): also copy `bkit-renovate.yml`, then set its platform token. Use a fine-grained PAT for one owner, and a classic one across owners. The permissions are in `docs/deployments.md` § Dependency updaters.

```bash
gh secret set BKIT_GH_TOKEN
```

- The examples ignore `.bkit/templates/**`, `.agents/skills/**` (bkit rewrites them), `docs/plans/**` and the `tests` / `__fixtures__` trees. Your copied workflows (`bkit-ci.yml`, `bkit-cloud.yml`) stay in scope so their pins refresh.
- The examples extend `config:best-practices`:
  - Major bumps wait for a tick on the Dependency Dashboard (`dependencyDashboardApproval`).
  - `lockFileMaintenance` runs monthly.
  - PRs rebase only on conflict.
- A `# renovate: datasource=<ds> depName=<name>` comment above a pinned CLI version (Dockerfile, `bkit-cloud.md`, workflows) lets the example `customManagers` entry bump it.
- For checksum-paired pins (Vale, gh, jq, Node, actionlint), update the sha256 by hand in the same PR. `Check Pinned Checksums` in `bkit-ci.yml` (`bkit ci pins`) fails the PR until the Dockerfile's hashes match.
- `bkit-renovate.yml` pins `renovate-version` to an exact release. The same kind of `# renovate:` comment keeps it current.
- `enabled: false` on a Renovate package rule does not stop digest pinning. Use `ignorePaths` to keep Renovate off a file.
- Land the config on the default branch before the bot runs. The examples set `baseBranchPatterns: ["dev"]`.
- The App install, the self-hosted token, the private-package host rule and CVE handling are in `docs/deployments.md` § Dependency updaters.

## Dependency audit — known-vulnerable dependencies fail the push

A library with a published security advisory can sit in the lockfile for months, because the updater only offers a fix, and nothing fails the check when one is missing. This gate stops a known high or critical advisory on the machine, at the push, before it reaches a remote run. It is optional, and the files are yours once copied. Reference: https://docs.npmjs.com/cli/v10/commands/npm-audit.

```bash
mkdir -p scripts/ci
cp .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs \
   .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs \
   .bkit/templates/scripts/ci/bkit-accepted-advisories.json scripts/ci/
```

- Wiring:
  - The `Dependency audit` block in the `.husky/pre-push` template runs it above the gates. The block is skipped while `scripts/ci/bkit-check-dependency-audit.mjs` is absent.
  - **If** your hook lacks the block → paste it above the gates.
  - The `Check Dependency Audit` step (`bkit-tests-static`) self-skips until the script is copied.
- Recommendation: adopt it, and an advisory is seen at the first push, not at the first remote run. It reads the advisory registry that the push already needs, so the network is no extra requirement.
- Acceptances:
  - A row in `scripts/ci/bkit-accepted-advisories.json` needs `advisory`, `reason` and a `YYYY-MM-DD` `expires`.
  - The expiry may not run past the severity's `blocking` days (default critical 7, high 30).
  - A row that the audit no longer reports fails.
  - Upgrade before accepting: `pnpm update -r <pkg>`.
- It fails closed: a blocking advisory, an unusable answer or an unreachable registry stops the push. It never passes on no answer.
  - `--unreachable=warn` relaxes only the unreachable case, to one warning, and the push goes on. It is for a caller that leaves the check to CI. The shipped hook and the CI step both use the default `fail`.
  - A registry that answered badly (401, 500, a missing endpoint) is a failure, not "unreachable".
- The audit runs with pnpm's fetch retries off, so a refused or unresolved registry fails in under a second instead of hanging the push. A slow, working registry is never cut off.
- Once it is adopted, the Trivy scan skips `pnpm-lock.yaml`, so accept pnpm advisories here only (§ Trivy).

## Trivy — vulnerability, config and secret scan

It fails CI on a HIGH or CRITICAL finding: a vulnerable package in any lockfile Trivy reads (npm, pnpm, yarn, pip, poetry, uv, Go, Cargo, Maven, …), a risky setting in a Dockerfile / Terraform / Kubernetes / Helm file, or a secret in a tracked file. It runs on push, on pull request and daily. Reference: https://trivy.dev/docs/latest/.

Copy `bkit-trivy.yml`, replace `{{DEFAULT_BRANCH}}`, and commit. It needs no secret, token or App. It blocks merges only once the `trivy` check is required in branch protection.

Accept a finding in `.trivyignore.yaml` at the repo root, which is read only when present:

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

- Past `expired_at`, the finding fails again. Keep it within the fix-time policy (`docs/deployments.md` § Dependency updaters).
- **If** `scripts/ci/bkit-check-dependency-audit.mjs` is adopted → the scan skips `pnpm-lock.yaml`. Accept pnpm advisories in `bkit-accepted-advisories.json` only.
- Keep `--include-dev-deps`. Without it, Trivy drops npm / yarn / pnpm dev dependencies, and a dev-tooling lockfile scans zero packages and passes.
- The pin is the image tag plus its `sha256:` digest, and Renovate bumps both.
- Never use `aquasecurity/trivy-action` or `setup-trivy` by tag, because those tags are known to have pointed at a credential stealer. Never use releases 0.69.4-0.69.6.
- The `.cursor/Dockerfile` template runs as root, which raises `DS-0002`. Add a non-root `USER` or accept it.
- It reads Dockerfiles, not built images.
  - **If** an image you build has OS packages → add a step after your build that runs the same pinned image with `image <your-image-ref>`.
- Results print in the job log. Security-tab upload (SARIF) is free on public repos only.

## Serena — symbol lookup

A local language server, wired as an MCP server, which agents use. It does not rewrite `CLAUDE.md` / `.claude/settings.json`. Reference: https://github.com/oraios/serena.

```bash
brew install uv
uv tool install -p 3.13 serena-agent
```

The PyPI name is `serena-agent`, and the CLI is `serena`. PyPI `serena` is an unrelated package.

- Set `project_name` and `typescript_version` in `.serena/project.yml`. `typescript_version` must match `package.json`, not Serena's bundled compiler.
  - **If** TypeScript is >= 7 → it ships no `tsserver`, so the language server fails to start (`Could not find a valid TypeScript installation`). Set `"5.9.3"`, Serena's bundled version and the last one with `tsserver`.
- Trust the project: add its path to `trusted_project_path_patterns` in `~/.serena/serena_config.yml`.
  - **If** the project is untrusted → Serena ignores all of `ls_specific_settings` (`typescript_version`, indexing waits), with only a log `WARNING`. Lookups still answer on the bundled defaults.
- Adapt `ignored_paths` to the repo. Index the code a change touches. Skip committed build output and byte-copied payloads, because each indexed copy answers every reference twice.
- `.mcp.json` (Claude Code) calls `scripts/serena/bkit-serena-mcp.sh`, which finds the binary when a GUI app has no login-shell `PATH`.
- Cursor's `.cursor/mcp.json` cannot use that wrapper. Point `command` at `${HOME}/.local/bin/serena`, and pass `--context ide`.
- Codex: in `.codex/config.toml`, add `[mcp_servers.serena]` with `command` set to the absolute path to `serena` and `args = ["start-mcp-server", "--context", "codex", "--project-from-cwd"]`. bkit writes no `.codex/config.toml`.
- OpenCode: in `.opencode/opencode.json`, set `mcp.serena` to `{ "type": "local", "command": ["<absolute path to serena>", "start-mcp-server", "--context", "ide", "--project-from-cwd"] }`. `bkit upgrade` keeps custom `mcp` entries.
- List `serena` in the `.agents/context.md` `mcp-servers` block, so every host runs its tools without a prompt, because workflow subagents cannot answer one.
- bkit code-reading subagents carry `mcp__serena__*` in `tools:`.
  - **If** Serena is not wired → Claude Code drops the entry, and the agent runs on text search.

`.gitignore`:

```
.serena/*
!.serena/project.yml
```

- Keep `read_only: true`, `added_modes: ["no-memories"]` and the full `excluded_tools` list from the example, so Serena stays lookup-only for agents.
  - The list excludes every tool that writes files / memories / project config, runs code or commands, or opens a browser.
  - Serena edits bypass the Edit / Write hooks.
  - Removing an entry hands that tool to every bkit agent.
- `--context codex` still lists the excluded tools, but refuses each call (`not active`).
- Serena line numbers are 0-based. Add 1 before citing `file:line`.
- A small or empty answer for an exported symbol means the query did not resolve, not "nothing uses it". Corroborate it with text search.
- pnpm monorepo: cross-package references need `composite` + `references` in the TypeScript project graph before the language server follows them.

## Issue forms — `.github/ISSUE_TEMPLATE/`

Issues are the first input every workflow reads. There is one form per way work starts, and each form's intro names its next command. The section names, syntax and machine-read lines are in `.bkit/trackers.md` § Issue shapes. The forms are for the GitHub tracker only, because Linear and Jira have their own templates. Reference: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms.

<!-- prettier-ignore -->
| Form | Use when | Next step | Asks for |
| --- | --- | --- | --- |
| `bkit-idea.yml` | How it should work is still open | `/bkit-design #N` | problem, outcome, success criteria, constraints and non-goals, decisions already made, open questions |
| `bkit-change.yml` | What to build and "done" are known | `/bkit-plan #N`, or `/bkit-build #N` / `build:lite` with no plan | the plan in short: narrative, success criteria, edge cases, test matrix, tasks with `DONE WHEN` + `TEST FIRST` as task group and task blocks showing every plan task field (`CREATE` / `READ` / `UPDATE` / `DELETE`, `DEPENDS ON`, `DONE WHEN`, `TEST FIRST`, `TEST EXCEPTION`), breaking changes and names, out of scope |
| `bkit-bug.yml` | Something does not work | a test or CI run already fails → `/bkit-debug #N`; nothing fails yet → `/bkit-debug #N [repro]` | failing test or CI run, what happened, what should, repro steps, how often, affected area, where and when, evidence |

- Every form ends with References. The change form shows the lines workflows read: `**Parent design:**` and `**Audit reports:**` (plan), and the blocked-by block (build). Other references are not fetched. Write exact paths, ledger `key`s and `#N — title`.
- A change issue is the plan's source when no design or audit report exists. Its narrative, success criteria, edge cases, test rows and tasks carry over verbatim.
  - `/bkit-build` with no plan first writes `{FID}-plan.md` from them (`@bkit-build-plan-convert`). Then it builds the tasks, and checks that each `TEST FIRST` test failed before its code.
  - An existing `{FID}-plan.md` wins, and the issue text is not read.
  - `build:lite` checks nothing.
  - Nothing ticks the boxes.
- Debug commits to the branch it runs on, so start it on the branch the fix lands on.
- Copy the folder and commit it on the default branch, because GitHub reads forms from there only. Blank issues stay enabled.
- `labels:` applies `enhancement` / `bug` only when the repo has them. Missing labels are skipped, never created.
- Never add `bkit:*` labels, because workflows own them.
- **If** the repo has existing forms → copy only the `bkit-*` files you want. The names never collide.

## graphify — map

graphify runs on demand only. It is not an installed skill or git hook. graphify ships an MCP server (`graphify-mcp`, stdio default). That server stays unwired, because its answers come from the `graph.json` snapshot, and build / debug agents invalidate the graph faster than it rebuilds. Serena, which has no index to go stale, owns the agent surface.

Two gates keep `docs/capabilities.md` current on dev: the pre-push block below, which blocks a stale push to dev, and a self-skipping CI step on every push. Agents read `docs/capabilities.md`. Audit templates that need the graph build it via `scripts/graphify/bkit-graphify.sh`. The only tracked output is `docs/capabilities.md`. The Mermaid views are `docs/graphify-out/reports/graph-packages.mmd` and `graph-modules.mmd`. Reference: https://github.com/Graphify-Labs/graphify.

```bash
uv tool install "$(bash scripts/graphify/bkit-graphify.sh spec)"
```

The PyPI name is `graphifyy`, and the CLI is `graphify`. `[sql]` adds `.sql` files to the corpus. One pinned release builds and judges the register: `GRAPHIFY_SPEC` in `bkit-graphify.sh` (`spec` prints it, and CI installs it). Another release draws different edges, so `check`, `check-at`, `rollup`, `register` and `refresh` refuse it. Renovate bumps the pin (the shipped `customManagers` scans `scripts/graphify/bkit-graphify.sh`). Refresh the register in the same change.

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

- Copy `scripts/graphify/bkit-graph-pre-push.sh`. The `.husky/pre-push` template runs it above the gates, so a stale register blocks in ~30s, not after the full gate. It is skipped while the script is absent, and on a min push.
  - **If** your hook lacks the `Capability register` block → paste it from the template, above the gates.
  - On a push to dev, it runs `check-at` on the pushed commit in a throwaway checkout, and blocks the push on a mismatch. Uncommitted edits, a concurrent session's included, cannot change the answer.
  - **If** graphify is not installed → it prints a loud "NOT checked" warning, and the push goes on. CI still checks.
  - On other branches, it prints a warn-only staleness note.
  - It reads `PUSH_DEV_SHA` from the bkit pre-push template's stdin loop. **If** your hook copy is older → re-copy that loop from `.bkit/templates/.husky/pre-push`.
- `.github/workflows/bkit-ci.yml` ships `Check Capability Register`. It installs the `spec` release and runs the pinned `check-at HEAD`, and a stale register fails CI. It self-skips without `scripts/graphify/bkit-graphify.sh`.
  - It runs on every push and pull request, on the checked-out commit. On a PR, that is GitHub's test merge into the base, so a branch behind its base syncs, refreshes and commits to clear a red.
- graphify's MCP server is opt-in. Install `graphifyy[mcp]` (`mcp` + `starlette`; the HTTP transport also needs `uvicorn`), and pass the graph path explicitly, because `graphify-mcp` defaults to `graphify-out/graph.json`, not the pinned `docs/graphify-out/graph.json`. Snapshot-dated answers suit audit / orientation, never build or debug.
- `.graphifyignore` merges `.gitignore`.
- Keep `package.json` in the corpus. Excluding it drops the workspace `name` fields that graphify resolves package imports with, and the graph still looks complete.
- Keep `tsconfig.json` out, because graphify reads `paths` regardless.
- Always run `scripts/graphify/bkit-graphify.sh`, which passes `--code-only` and `--no-label` and unsets API keys. There is no persistent LLM-off setting.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `pnpm graph` | Extract + cluster. Local. No API key. |
| `pnpm graph:clean` | Same, after deleting `docs/graphify-out/`. Required after any tsconfig `paths` change. `--force` does not invalidate the module-resolution cache. |
| `pnpm graph:update` | Re-extract changed files, then recluster. |
| `pnpm graph:rollup` | Package and module views, plus `docs/capabilities.md`. |
| `pnpm graph:check` | Rebuild and fail if `docs/capabilities.md` is not what this tree produces. Reads uncommitted edits. Shipped as a self-skipping CI step (every push and pull request; on a PR, GitHub's test merge into the base); enabled in bkit's own CI. |
| `bash scripts/graphify/bkit-graphify.sh check-at <rev>` | `check` in a throwaway checkout of `<rev>` (default HEAD); pre-push gate runs it on the commit pushed to dev. |
| `pnpm graph:refresh` | Rebuild register in a throwaway checkout of HEAD → copy over `docs/capabilities.md`. Fixes a red gate; commit result. |
| `pnpm graph:scoped [path]` | One subtree. Default `apps/web/src`. |
| `pnpm graph:graphml` | Opt-in GraphML for Gephi / yEd. |

- `docs/graphify-out/` holds the raw `graph.json`, and `docs/graphify-out/reports/` holds the derived views.
- Copy `.bkit/templates/docs/capabilities.md` → `docs/capabilities.md` before the first rollup, because the Overrides block must exist. `pnpm graph:rollup` rewrites it after that.
- To add a capability, add a rule in `bkit-graph-drift-rules.json`: lane, owner module, one literal marker. The shipped rules JSON has one example row. Replace it.
- The marker is a literal that only the owner should contain (a host, a header, a marker string). Never use the owner's exported function name, because every legitimate caller then reads as `bypassed`.

`MMD_MIN_WEIGHT` (default 12, set in `bkit-graphify.sh`) drops light edges from the Mermaid views (`.mmd` files and the diagrams in `docs/capabilities.md`).

- **If** the repo has one module per file → edges are thinner, so lower the default in your copy.
- An env override changes `docs/capabilities.md` per shell, and fails `pnpm graph:check`.

Iterate in mermaid.live, and render the internal-architecture diagram locally:

```bash
npx -y @mermaid-js/mermaid-cli -i docs/graphify-out/reports/graph-packages.mmd -o tmp/graph-packages.svg
```

- `bkit-graph-repair.py` runs between extract and cluster. It restores `.js` specifiers that point at `.tsx` files, and workspace subpaths through an `exports` map.
  - A bare `graphify update` drops that injection, and `pnpm graph:update` restores it.
  - `bkit-graph-eager.py` and `bkit-graphify-rollup.py` re-derive those imports from source, and warn with the count that graph.json lacks.
  - Two files that import each other keep one link after clustering, so that pair never reads as missing.
- `bkit-graph-surface.py` is the route layer. It assumes `apps/web` / `apps/mobile` page routes, `packages/api/src/v1.ts` and the workspace scope `@scope/services/`.
  - Replace `@scope` and the route globs, or the section stays empty.
  - Route reachability runs only when `scripts/ci/guards/assert-routes-reachable.mjs` exists. Otherwise it is skipped.
- `bkit-graph-imports.py` picks `react-native` vs `default` export conditions from the importer path (`apps/mobile` vs `apps/web`). Change the prefixes if your app roots differ.
- Source roots are hard-coded for an `apps/` + `packages/` monorepo:
  - `ROOTS` in `bkit-graph-drift.py` (the files the drift rules scan)
  - `ROOTS` in `bkit-graph-eager.py` and `DEFAULT_ROOTS` in `bkit-graph-imports.py` (the files those passes walk)
  - `by_package` / `by_module` in `bkit-graphify-rollup.py` (the diagram boxes)
- **If** the repo has another layout → adapt all five. Otherwise capabilities read `gap`, and the diagrams come out empty.
- **If** the repo has one flat source folder → `by_module` gives one node per file.
- **If** there are no web routes, or no imports between top-level folders → the route and package diagrams stay empty. That is the answer, not a fault.
- The extract warning `had syntax errors and may be partially extracted` can fire on valid code. The symbols after that line are then missing from the graph, so treat that file as unmapped.

Do not run:

<!-- prettier-ignore -->
| Command | Effect |
| --- | --- |
| `graphify claude install` | Writes `CLAUDE.md` and `.claude/settings.json`. Next `bkit install` clobbers both. |
| `graphify install --project` | Writes a skill. `/bkit-ship` removes skills not named in `.agents/skills.md`. |
| `graphify hook install` | Rebuilds on every commit. bkit commits many times per workflow run. |

- A code-graph answer confirms what is present. It does not prove what is absent, and a missing edge looks like a real gap.
- Ignore rules are load-bearing. A noise-only pattern can drop edges the tool needs, and the output still looks plausible, so re-measure after changing `.graphifyignore`.

## Secrets sync — one source, every store

The local gitignored env files are the source of truth. `bkit-secrets.mjs sync` makes every store match, and `drift` proves it. It needs Node >= 20 plus the CLI of each store used (`gh`, `eas`, `gcloud`). Vercel, Supabase and Cursor go through their REST APIs.

- Copy both files. Edit `bkit-secrets.config.mjs` only. `bkit-secrets.mjs` stays byte-identical across repos.
- The config has one row per secret, naming every store that holds a copy: `DATABASE_URL: ["vercel", "gcp"]`. The options per row are:
  - `from`: the env key differs from the store name
  - `derive`: `"${APP_URL}/path"`
  - `manual`: copies no API reaches
  - `"eas:secret"`: a per-store option
- Delete unused entries under `stores`. A store that no row names is skipped.
- `.gitignore`: `scripts/secrets/bkit-secrets-state.json`.
- The `.bkit/.env` overlay holds agent / bkit tooling secrets only. App and stack credentials stay in the app env files.
- Cursor store:
  - The option `environment` (name) or `environmentId` picks the Cloud Agents environment (ids from `GET /v1/environments`).
  - The token is `CURSOR_API_KEY` (or `BKIT_CURSOR_API_KEY`).
  - Secrets are write-only. `NAME: "cursor:environment_variable"` writes a non-secret env var instead of a Runtime Secret.
  - `build_secret` names exist only in the dashboard. They are never written or deleted.
- Cursor rows: list only the names the cloud workflow needs.
  - The minimal set is `BKIT_GH_TOKEN`, plus `BKIT_LINEAR_API_KEY` on Linear setups. `VERCEL_TOKEN` / `SUPABASE_ACCESS_TOKEN` are optional, for when the workflow reaches those stores.
  - A first sync against a populated environment deletes every live name that is not listed, so the `--dry-run` rule below the command table applies to it too.
  - API errors surface with their code: `feature_unavailable` (the environments API is not enabled for the key), `key_not_supported` (`grok_` keys), `secret_name_ambiguous` (one name, several repo-scoped versions; pre-checked, so remove the extra versions in the dashboard).
  - Team-scope 403s (`team_admin_required`) do not apply, because the adapter uses environment scope only.
- **If** you need a custom store → no upstream change is needed: `type: "custom"` + `module` loads a repo-local adapter (see below).

<!-- prettier-ignore -->
| Command (`node scripts/secrets/bkit-secrets.mjs …`) | Does |
| --- | --- |
| `sync --dry-run` | Writes and deletes it would make; no value printed. |
| `sync` | Writes values that differ or cannot be proven equal; deletes names not listed for a store, or empty in source. |
| `drift` | Read-only. Per store and environment: `missing`, `extra`, `differs`, `not-pushed`, `changed-elsewhere`. Exit 2 on drift. |
| `check [file]` | Local only: sources, env file vs example (exit 2 on a missing required key), every copy of every secret. |
| `--store <name>` | Narrow `sync` / `drift` / `list` to one store. Every run covers both environments; no per-environment option. |

`sync` deletes every live name that is not listed for that store, so ALWAYS run `--dry-run` before every sync. When no listed key resolves to a value, the deletes for that store are skipped.

How `drift` proves a value without printing it:

<!-- prettier-ignore -->
| Store | Read back | Proof |
| --- | --- | --- |
| Vercel (encrypted / plain) | per-variable API read (the list endpoint stays encrypted) | SHA-256 of live value vs source |
| GCP Secret Manager | latest version | SHA-256 of live value vs source |
| EAS (plaintext / sensitive) | `env:list --include-sensitive` | SHA-256 of live value vs source |
| GitHub Actions, Supabase, Cursor, Vercel sensitive, EAS `secret` | write-only | state-file fingerprint vs source (`not-pushed`); store's last-updated time after recorded push (`changed-elsewhere`) |

- **If** no push is recorded → the result is `unverified`, never `ok`. The first sync records one.
- `bkit-secrets-state.json` holds fingerprints and times only, per machine.
  - **If** a push came from another machine or by hand → the result is `changed-elsewhere` until the next sync here.
- `manual` copies are listed on every `check` / `drift`. Update them by hand on rotation.
- Vercel: branch-scoped preview vars are left alone. An entry shared across environments is split before a write.

A new store type goes in as an entry in `STORES` of the template's `bkit-secrets.mjs` (`open` → `list` / `write` / `remove`; the contract is above it), never in a copy only. A repo-local store needs no upstream change: `type: "custom"` + `module: "./stores/x.mjs"` (resolved against `scripts/secrets/`) loads a module whose default export carries `label` + `open` (optional `perEnv`, `protects`, `setOptions`). The engine validates the adapter at load, and its `open()` handle at run.

## Prettier tables — keep table diffs to the changed row

Prettier aligns markdown tables with no config toggle, so one edited cell re-pads every row. `bkit-insert-ignore.mjs` puts `<!-- prettier-ignore -->` directly above each table head (no blank line between), strips cell padding, and normalises separators to `---`. It is idempotent. It needs Node >= 20 and no dependencies.

<!-- prettier-ignore -->
| Command | Does |
| --- | --- |
| `node scripts/prettier/bkit-insert-ignore.mjs` | Rewrite `.agents/`, `docs/`, `README.md` (or the paths given). |
| `node scripts/prettier/bkit-insert-ignore.mjs --check` | Write nothing; exit 1 if any file would change. Gate form. |

- Walks skip `skills/` trees (vendored), and `docs/audits/` and `docs/plans/` (records, kept as written). A file named on the command line is always processed. New and edited records get it at commit, because § lint-staged names each staged file.
- It skips tables inside ``` / ~~~ fences, tables inside multi-line `<!-- -->` comments, and tables already wrapped. A comment opens on a line starting with `<!--`, and runs to the first line holding `-->`. A one-line comment hides nothing.
- A pipe inside an inline-code span is escaped to `\|` only when that restores the separator's column count. An existing `\|` stays literal.
- It exits 1 on damage it cannot repair, with or without `--check`:
  - `truncated-row`: more cells than the separator, and GFM drops the overflow.
  - `unrendered-table`: the header count != the separator count, and GFM renders raw text.
- A bare pipe in cell prose is indistinguishable from a delimiter. Escape it as `\|` by hand.
- Under `docs/audits/` and `docs/plans/`, the same damage prints as a `WARN` and exits 0, because records hold text quoted from elsewhere (issue comments, CI logs) that nobody can fix in place.

## tmp/ prune — old scratch files

Each push deletes scratch files that agents left in `tmp/` untouched for a week, then the folders that leaves empty. It needs Node >= 20 and no dependencies.

```bash
mkdir -p scripts/cleanup
cp .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs scripts/cleanup/
```

- Wiring:
  - The `tmp/ prune` block in the `.husky/pre-push` template runs it with `--days=7`, ahead of the gates. The block is skipped while `scripts/cleanup/bkit-tmp-prune.mjs` is absent.
  - **If** your `.husky/pre-push` lacks the block → paste it above the gates.
- It is not a gate: a failed prune prints a warning, and the push goes on.
- `--days=<n>` (n >= 1, default 7).
- Exit codes: 0 means swept or no `tmp/`; 1 means an entry could not be removed (each one named on stderr); 2 means bad arguments.
- Scope: `tmp/` at the top of the checkout the cwd sits in. Each worktree prunes its own, and `tmp/` itself stays.
- Age is the file mtime.
- Symlinks are never followed. A symlinked `tmp/` is skipped. A symlink inside is removed by its own age, and its target is untouched.
- A folder goes only when it is empty **and** either the sweep emptied it or its own mtime is past the cutoff. So a folder that another process just made stays.
- Hand run: `node scripts/cleanup/bkit-tmp-prune.mjs`. Files to keep belong outside `tmp/`.

## Disk prune — cleanup steps you own

`bkit disk prune` runs only the steps you list, and bkit itself deletes nothing. With no step file, nothing runs.

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

- Step list, default-exported: `{ name, mode, run, skip?, paths? }`.
  - `min` steps are stale and cheap. `max` covers all that comes back by itself, plus every `min` step.
  - `run` / `skip`: a shell command or a `({ cwd, log, note })` function. When `skip` exits 0 or returns a reason, the step is skipped.
  - `paths`: what `--dry-run` sizes, which is the most the step can free.
- Notes: `note(text)` records something found and left for a person.
  - Each sweep replaces its checkout's notes.
  - `bkit tips` prints them first (from a worktree, the main checkout's too), so every workflow close surfaces them.
  - With no sweep for 7 days, they are dropped.
- The example worktree step removes a `.worktrees/*` only when nothing is lost: it is clean, and every commit is on a remote or at a merged pull request's head (`gh`; squash merges). It removes it via `bkit worktrees remove`, or plain `git worktree remove` when no workflow made it.
  - Branches stay.
  - It keeps a locked worktree, or one committed to in 2 days, and notes the rest.
- Adapt: keep a step only when what it deletes comes back by itself. These are left out on purpose: named Docker volumes (local databases), runtimes and SDKs, and the whole pnpm store (`node_modules` hard-link into it).
- Wiring: it is the last block of each Husky template.
  - `pre-commit` → `--mode=min --auto`.
  - `pre-push` → `--mode=max --auto`, after every gate (workflow pushes too).
  - **If** the block is missing → paste it at the end of yours.
- `--auto`: runs detached, and always exits 0.
  - Each mode runs at most once a day per machine.
  - `max` runs at most hourly while free disk < `bkit.workflows.minFreeGb` (`package.json`, GB, default 40).
  - Log: `~/.cache/bkit/disk-prune.log` (`$XDG_CACHE_HOME/bkit/` when set).
- Worktrees:
  - **If** `bkit worktrees setup` creates or resumes a worktree under `bkit.workflows.minFreeGb` → it runs the `max` steps and waits.
  - **If** free disk is still under → it exits 12, and nothing is created. stderr lists what the `max` steps still cover.
  - With no step file, there is no check.
- One sweep runs per machine at a time (`disk-prune.lock` beside the log).
- A failed step is logged, and the next one runs.
- In CI / cloud, nothing runs.
- Hand run: `pnpm bkit disk prune --mode=max --dry-run` prints each step and its `paths` size. Without `--dry-run`, it runs now. Exit 1 means a step failed or a step file did not load.

## Local stack lock — one run at a time on a shared stack

Every worktree of a repo uses the same local services when their names and ports come from the repo's config (a Docker database, an emulator). A run that starts, resets or stops the stack, or tests against it, takes a machine-wide lock first. A second run waits, and prints who holds it. It needs bash and `/usr/bin/perl`, and no dependencies.

```bash
mkdir -p scripts/ci
cp .bkit/templates/scripts/ci/bkit-local-stack-lock.sh scripts/ci/
```

<!-- prettier-ignore -->
| Wire into | How | Holds the lock |
| --- | --- | --- |
| `package.json` scripts that start / reset / stop the stack | `"db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <reset command>"` | for the command; its exit status passes on |
| local runners that test against the stack | `. scripts/ci/bkit-local-stack-lock.sh`, then `take_local_stack_lock "<who>"` before the first stack command; non-zero → exit | until the runner exits or calls `release_local_stack_lock` |

- Functions (all safe under `set -e`):
  - `take_local_stack_lock` waits.
  - `try_local_stack_lock` returns 1 at once while another run holds the lock.
  - `release_local_stack_lock` frees it early.
  - `local_stack_lock_holder` prints the holder.
- Name: `BKIT_LOCAL_STACK` when set, else the main checkout's folder name (`git rev-parse --git-common-dir`), so every worktree finds the same lock.
  - A throwaway stack with its own names and ports sets its own `BKIT_LOCAL_STACK`, and never waits on the shared one.
  - **If** it runs outside a git checkout with no `BKIT_LOCAL_STACK` → it refuses, with exit 1.
- Lock file: `~/.cache/bkit/local-stack-lock/<name>.lock` (`$XDG_CACHE_HOME/bkit/` when set), outside every checkout.
- The lock is never stale, because a small perl process holds it (flock) and exits within a second of its caller, however the caller ends.
- Wait: up to `LOCAL_STACK_LOCK_WAIT_S` seconds (default 3600), with a note naming the holder once a minute, then exit 1 naming it.
  - A runner started by the holder (`LOCAL_STACK_LOCK_OWNER`) does not wait.
  - `CI=true` / `CI=1` makes it a no-op.
- Fix hints and docs name the locked scripts, never the raw command (`supabase db reset`, `docker compose down`), because the raw command skips the lock. See `.agents/rules.md` § Shared local stack.
