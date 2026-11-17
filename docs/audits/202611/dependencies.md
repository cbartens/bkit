<!-- bkit:anchor
baseSha: bcd1b8fc3fae7ec6e8f61fcd39ac0bd67802e1cc
baseRef: dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
<!-- bkit:start -->

<!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: Report path `docs/audits/202611/dependencies.md` (template `docs/templates/bkit-audit-dependencies.md`, UTC month 202611, slug `dependencies`; no earlier `dependencies` report exists this month). Stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

# Dependency Triage

> [!CAUTION]
> **Purpose:** A verified batch of the open dependency-update PRs, and a judgement on supply-chain settings, advisories, licences, end of life and off-manifest CLIs.
>
> **Rules:**
>
> - NEVER push, merge, label, close or comment on a PR.
> - NEVER commit onto the integration branch.
> - Treat the throwaway worktree as evidence only, and remove it before the report finishes.
> - Never resolve a lockfile conflict as text, or with `-X ours` / `-X theirs`.
> - Do not run a recursive update that rewrites ranges the PRs did not name.
> - Keep a breaking major or a migration out of the batch, even when it is green.
> - Record the plan only. Landing it is the next step.

## Universal Instructions

### Context & Goals

Every dependency PR rewrites the lockfile. Left unbatched, the PRs go stale against each other, the bot stops rebasing some of them, and each separate merge costs a full CI run. Batching is cheap, but batching by hand breaks CI in three ways: an install rewrites a manifest the commit left out, a recursive update rewrites ranges the bot never proposed, and a partial refresh leaves two copies of one tool. A breaking major needs a person, so the batch must not carry one. The failure this audit targets is a batch that quietly carries a breaking major, or a lockfile that does not match its manifests.

**Applies when:** a dependency bot opens update PRs, **or** the repo has manifests and a lockfile. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a week, after the bot's open window. Run an extra pass when a security PR opens outside the window, when the bot config changes on the default branch, or when a `bkit-audit-app-store` deadline forces an SDK or target-API upgrade.

**Anchor Standards:**

- Dependency-bot best-practice and security presets (e.g., Renovate `config:best-practices`, and the presets it extends: `security:minimumReleaseAgeNpm`, `helpers:pinGitHubActionDigests`, `docker:pinDigests`, `abandonments:recommended`, `:configMigration`). Record the bot version.
- Package-manager supply-chain settings (e.g., pnpm `minimumReleaseAge`, `trustPolicy: no-downgrade`, `blockExoticSubdeps`, `allowBuilds`, `strictDepBuilds`). Read the package manager's defaults from the release notes of the pinned major, not the latest docs.
- Registry provenance and trusted publishing (e.g., npm provenance).
- OpenSSF Scorecard; record version.
- OpenSSF Concise Guide for Evaluating Open Source Software; record revision date.
- Vulnerability scanner and advisory database (e.g., Trivy, OSV-Scanner, GitHub Advisory Database).
- Lockfile-integrity linter (e.g., lockfile-lint). Unreadable format → apply checks by hand.
- Runtime end-of-life catalogue (e.g., endoflife.date); record the date read.
- SPDX License List; record version.
- Install-script supply-chain attacks (e.g., Shai-Hulud, September 2025, and Shai-Hulud 2.0, November 2025).
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Dependency updaters; § Manual CVE handling (when an alert fires)

### Scope

- Report a missing dependency updater config as a CRITICAL finding. Examples are Renovate (`.github/renovate.json` or `.github/renovate.json5`) and Dependabot (`.github/dependabot.yml`). The project copies one example and owns it.
- Classify the open dependency PRs, batch them, verify the batch, and plan the landing.
- Check the bot config against the best-practice and supply-chain settings, including which branch the bot actually reads.
- Check the lockfile-maintenance cooldown while the package-manager release-age gate is off or absent.
- Find settings that multiply PRs and CI runs.
- Screen the batch diff for supply-chain risk.
- Find what the bot does not see: advisories, fix latency, unmaintained and deprecated packages, and licences.
- Check off-manifest CLIs: the pin, the distance from latest, and bot coverage.
- Check runtime and framework end of life.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Store submission deadlines | The store sweep covers it | `bkit-audit-app-store` |
| Dependencies nothing uses | The dead-code sweep covers it | `bkit-audit-dead-code` |
| Whether a vulnerable function is reachable, beyond naming the call | The security sweep covers it | `bkit-audit-security` |
| Tool-server packages (e.g., MCP) | The agent config sweep covers it | `bkit-audit-agents` |
| CLI outdated notices in CI logs | The annotations sweep covers it | `bkit-audit-annotations` |
| Landing the batch, or labelling, closing, or commenting on PRs | The audit only reports | A plan made from this report |

### Verdicts

Give each PR one verdict. The class (A, B or C) is the evidence, and the verdicts below are the outcomes. DECISION wins over IN BATCH, so a breaking major stays out even when it is green. A non-security PR still inside the bot's release age is EXCLUDED, even when it is green.

- **IN BATCH:** the PR is green, or class A or B, and past the bot's release age. It goes in this run's batch.
- **EXCLUDED:** the PR is class C, was dropped during the batch build, or is still inside the bot's release age. The report names the labels and the comment text, and this run does not apply them.
- **DECISION:** the PR is a breaking major, a migration, or reaches end of life inside 90 days. It is listed for a person, and is not a batch item.
- **OTHER:** it fits no other verdict. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

The batch verdict goes in `Summary`, not on each PR. The CI result of the landing push belongs to the next step, not to this run.

- **PASS:** the drift check and every local verification command exited 0, apart from baseline reds (Step 10).
- **CONCERNS:** a PR was dropped during bisection.
- **FAIL:** the batch drifts, or it has a red that no single PR explains and the audited commit does not show.
- **UNVERIFIED:** permissions stopped the batch from assembling (Step 8), so nothing was verified. Name the permission it needs.

### Pre-Flight / Dependencies

#### Core

- [x] **Permissions:** **If** a call ran and the API refused it (e.g., HTTP 403 from an endpoint that needs another token type, such as GitHub `GET /user/installations`) → it is not a block. Record it in `Not Checked` only, with no allow rule.
  - **Result:** one cheap read per tool before the probes: `gh run list --limit 1` → run 43518336683; `pnpm --version` → 10.34.7; `npm view` → ok; `curl` to endoflife.date, api.osv.dev, api.deps.dev, pypi.org → ok (the bkit guardrail printed "outbound fetch to a host that is not on this repo's network allowlist", advisory only, call allowed); WebFetch vite.dev → ok; GitHub MCP `search_issues` → 3 items; `docker --version` → 29.8.2. `gh api user/installations` → HTTP 403 ("You must authenticate with an access token authorized to a GitHub App"), an API refusal → `Not Checked` only. One call was refused by a built-in harness safety check, not by a permission rule → recorded in `Not Checked` and `Process Improvements`.
- [x] **Git Host:** Steps 2, 3, 11, 12 — open PRs by head-ref prefix, CI runs and behind-count (e.g., `gh`, GitLab API). Fallback: none. Mark the PR steps `Not Checked`, and set the batch verdict to `FAIL`.
  - **Result:** `gh` 2.102.0 (2026-09-30) against `cbartens/bkit`; `git fetch origin` done before the inventory.
- [x] **Package Manager:** Steps 5, 8-10 — install, lockfile and registry metadata (e.g., pnpm, npm). Fallback: none. Mark `Batch` and `Verification` `Not Checked`, and set the batch verdict to `FAIL`.
  - **Result:** pnpm 10.34.7 (= `package.json:46` `packageManager`), Node v24.16.0 locally, npm registry metadata via `npm view`.
- [x] **Clean Worktree:** Steps 8-10 — a detached worktree off the audited commit (`bkit:anchor` `baseSha`), removed before the report finishes. **If** the local integration branch is ahead of the remote ref → the landing push carries those commits, so the batch builds on them. Fallback: none. Do not build the batch in the main checkout.
  - **Result:** `git worktree add --detach tmp/audit-deps-20261114 bcd1b8fc3` (local `dev` is 6 ahead of and 1 behind `origin/dev`: `git rev-list --left-right --count HEAD...origin/dev` → `6 1`; the 1 is `b783cbe83`, a docs-only plan commit). Removed before the report gate.
- [x] **Web:** Steps 13-15 — latest CLI releases, the anchor standards, end-of-life dates and vendor support policy. Fallback: record the versions as unread, and the days left as well.
  - **Result:** `gh api repos/<r>/releases/latest`, `npm view`, PyPI JSON, endoflife.date API v1, vite.dev/releases (WebFetch), Renovate docs fetched raw from `renovatebot/renovate` at tags `44.176.2`, `44.221.6` and `44.239.1`.

#### Conditional

- [x] **Bot Dashboard:** **If** the bot publishes a dashboard → Step 3 — blocked and will-not-rebase entries. Fallback: read the open PRs only, and mark the stopped-rebase set `Not Checked`.
  - **Result:** Dependency Dashboard issue #328 read with `gh issue view 328` (updated 2026-11-13T14:35:44Z).
- [x] **Config Validator:** **If** the bot ships one → Step 3 — e.g., `renovate-config-validator`, on the config as the default branch has it. Run it in the bot's read mode (repository, not global or self-hosted), with the runner's global options the config needs. **If** the mode is wrong **or** a runner option is missing → the validator reports errors the bot never hits. For example, Renovate validates a bare file argument as global config. Repository mode is `--no-global`, or no argument in a scratch checkout of the default-branch files, plus the runner's `allowedEnv` as `RENOVATE_ALLOWED_ENV`. Without that, `allowedEnv` errors are false. An error left in the bot's own mode is a finding, quoted with its command. Never waive it as validator-only. Fallback: read the files, and mark validity `Not Checked`.
  - **Result:** `renovate@44.176.2` (the runner's `renovate-version`, `.github/workflows/bkit-renovate.yml:88`) installed with `npm install --no-save --ignore-scripts` into a scratch prefix, run in repository mode from a scratch checkout holding `origin/main:.github/renovate.json5`, with `RENOVATE_ALLOWED_ENV='PNPM_*'`.
- [x] **Vulnerability Scanner:** **If** the project has a lockfile, an image or a requirements file → Step 13 — e.g., Trivy (`trivy fs --include-dev-deps`), OSV-Scanner, `npm audit`, the host advisory API and vendor repository advisories. Fallback: use one source only, and mark the missing source `Not Checked`.
  - **Result:** `node scripts/ci/bkit-check-dependency-audit.mjs`, `pnpm audit --json`, Dependabot alerts API, OSV `querybatch` over all 184 locked packages, and vendor advisories for 7 repos. Trivy local run unavailable: `docker run …` → "Cannot connect to the Docker daemon at unix:///Users/christian/.orbstack/run/docker.sock" → OSV `querybatch` stands in as the second lockfile source; Trivy local is `Not Checked`. OSV-Scanner and lockfile-lint not installed (`command not found`) → greps and OSV API stand in.

### 🔒 Gate 1: Prerequisites Check

- [x] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [x] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [x] **Step 2 — Inventory:** From the previous report, list the deferred PRs and why each was deferred. A deferred major whose blocker has cleared is the first candidate. Select open PRs by the head-ref prefix from the updater config (`branchPrefix`, default `renovate/`; Dependabot uses `dependabot/`), never by title or author. A token-authored PR on the prefix is in scope; record the author as evidence, not as the selector. For each PR, record the number, title, head ref, head SHA, mergeable, merge state, files, labels, commits behind the integration branch, and the latest CI run. Count finished runs only, because an in-progress run is not a result. **Done when:** `Inventory` names the prefix and the config source, and lists every open PR on the prefix, or says `none`.
- [x] **Step 3 — Bot Health:** A missing dependency updater config is CRITICAL.
  - Examples are Renovate (`.github/renovate.json` or `.github/renovate.json5`; rules example `.bkit/templates/.github/renovate.json5`, self-hosted runner example `.bkit/templates/.github/workflows/bkit-renovate.yml`) and Dependabot (`.github/dependabot.yml`; example `.bkit/templates/.github/dependabot.yml`). See `docs/deployments.md` § Dependency updaters.
  - Two configs is a finding; keep one.
  - Only read the bot dashboard, because the bot rewrites it.
  - Record blocked entries and will-not-auto-rebase notices, because those PRs stay stale until a person acts.
  - The bot reads presets from the default branch, not from the integration branch. A fence or group on the integration branch is inactive until a release carries it.
  - Base-config edits on the integration branch apply only when the bot merges base-branch config, and it reads that option from the default branch.
  - **If** a PR proposes what the integration config blocks → read the default-branch copy before debugging the rule. When the branches differ, that promotion lag is a signal.
  - Validate the configs as the default branch has them, in the bot's repository mode (Pre-Flight). An error left there is a finding.
  - Read the dashboard and logs for config errors, PRs held by concurrency or hourly limits, PRs awaiting approval, and open config-migration PRs. A broken config looks like a quiet week.

  **Done when:** `Bot Health` holds the blocked PRs, the branch the config is read from, the validator result, and the held and awaiting-approval items.

- [x] **Step 4 — Supply Chain:** Read the settings as the default branch has them.
  - Record each one against the bot's best-practice preset and the package manager's supply-chain page.
  - For the bot, check:
    - a minimum release age of at least three days (e.g., Renovate `minimumReleaseAge` / `security:minimumReleaseAgeNpm` with `internalChecksFilter: "strict"`, or Dependabot `cooldown`)
    - actions and images pinned by digest
    - abandonment flagging (e.g., the Renovate abandonments preset)
    - config-migration PRs enabled, where the bot offers them
  - For the package manager, where it offers them (e.g., pnpm), check:
    - trust policy no-downgrade
    - exotic subdependencies blocked
    - an explicit install-script allowlist
    - strict dependency builds
  - **If** the package manager offers none → write `N/A` with evidence.
  - A release age of 0 on the package manager is a recorded trade-off where the docs say so. Record it, and leave re-deciding it to a person (`DECISION`).
  - The gap is that the bot's release age does not apply to lockfile-maintenance PRs, because the package manager makes those changes. With the package-manager gate off, those PRs reach the batch with no cooldown. `Cooldown` checks what stands in for one, and `Screen` takes them first.
  - **If** a setting is missing **or** weaker than the standard → add a `Recommendations` row with the line to add.

  **Done when:** `Supply Chain` has a row per setting: value · standard · verdict.

- [x] **Step 5 — Cooldown:** **If** the package-manager cooldown is off or absent:
  - Lockfile-maintenance PRs must not automerge, and must wait the same age as other updates before they land.
  - **If** the bot opens no lockfile-maintenance PRs (e.g., Dependabot) → the two checks below are `N/A`.
  - Check that the lockfile-maintenance block and its matching rules do not automerge.
  - Check that each lockfile-maintenance PR merged since the previous run waited at least the bot's release age (e.g., Renovate `minimumReleaseAge`), measured from the newest version's publish to the merge. **If** an open one is younger → it is EXCLUDED, with its eligible date.

  For automerge groups that rewrite the lockfile, the bot's release-age check ages the named packages only. Compare the newest transitive version in the PR's lockfile diff with the bot's release age. **If** it is younger → it is EXCLUDED, with its eligible date. Automerge with the package-manager cooldown off is a finding. Apply the same wait to other open non-security PRs. **If** the release-age check is pending (e.g., `renovate/stability-days`) **or** the newest version is younger than the bot's release age → it is EXCLUDED, with its eligible date. Security PRs bypass this wait (Step 13). A lockfile-maintenance PR that automerged or landed before its release age is a finding.

  **Done when:** `Cooldown` holds the automerge setting, each merged PR's wait, and each open PR's eligible date.

- [x] **Step 6 — Volume:** Each bot PR is a lockfile rewrite, a preview and a CI run, and each rebase is another CI run.
  - Read the settings on the default branch, and record what each one would change. The lines to add go in the project-owned bot config.
  - Grouping:
    - Check that related packages go in one PR (`group:monorepos`, `group:allNonMajor`, or an equivalent).
    - List the solo PRs that should be grouped, and the rule that would catch them.
  - Schedule:
    - Check that the bot opens PRs in one window.
    - Compare the bot's actual run start times (e.g., workflow run history) with the configured window. A window that no run lands in means routine PRs never open.
    - **If** no dependency bot is configured → record an explicit skip.
    - Note the non-security PRs opened outside it, and why.
  - Limits: record the PRs held back by the concurrent, hourly and branch-concurrent limits.
  - Rebase policy:
    - Check that the bot rebases only on conflict, which avoids a CI run on every integration move.
    - **If** it is unset → record the default, and count the rebase pushes since the previous run.
    - The lockfile PR conflicts with most dependency merges, so check that lockfile maintenance runs on its own schedule, not on every bot run.
  - Automerge:
    - Check that low-risk groups that pass CI use platform automerge.
    - Check that lockfile maintenance does not automerge while `Cooldown` is off.
    - Check that majors wait for dashboard approval. Without it, a major opens a PR and runs CI before anyone decides.
  - Scan scope:
    - Read the bot's detected-file list (e.g., the Renovate dashboard) for archived evidence, fixtures and test trees.
    - A repo-level ignore list replaces the preset defaults (e.g., Renovate `ignorePaths` drops `:ignoreModulesAndTests`), so list those paths and the PRs that touch only them.
  - **If** a setting would cut PRs or CI runs → add a `Recommendations` row with the line and the PRs it saves this run.

  **Done when:** `Volume` has a row per setting: value · what it would change · PRs saved.

- [x] **Step 7 — Classify:** Classify every PR that is not green, and every green PR that bumps a version pinned beside a checksum. Quote the evidence line from the log. When nothing matches, the class is C.
  - **A — infrastructure:** preview-deploy wait timeout, registry fetch failure, a cold service refusing, a cancelled runner. Confirm: the same job passed on a neighbouring run or a retry of the same commit.
  - **B — stale:** outdated lockfile, lockfile config mismatch, a merge conflict, merge state dirty, behind the integration branch. Confirm: behind-count. Being behind says nothing about the dependency itself.
  - **C — real:** the failure survives a clean rebase onto the integration branch. Confirm: reproduce it on the batch worktree before Step 10, calling the test binary directly (e.g., `node_modules/.bin/vitest`). **If** a PR bumps the package-manager pin (e.g., `packageManager`) → a wrapper exec (e.g., `pnpm exec`) fetches that version and installs, which dirties the worktree. Only C keeps a PR out of the batch.
    - **C, copy parity:** a test requires two copies of a file to stay identical, and the bot updates only the copy it scans, because the other copy is on an ignored path. It fails by design, and the fix is to mirror the change into the other copy. Count recurrences in Step 16.
    - **C, checksum:** the PR bumps a version pinned beside a checksum (e.g., a download URL and its SHA-256), and the checksum does not match the new version. A green PR can be C here, because a stale checksum fails only where the download runs.

  The batch is the green, A and B PRs that are past the bot's release age. A class C PR is EXCLUDED and goes in `Excluded`. A breaking major is DECISION, even when it would be IN BATCH. A non-security PR inside the release age is EXCLUDED, even when it would be IN BATCH (Step 5). **Done when:** `Classes` has a row per classified PR (every non-green PR, and every green PR that bumps a version pinned beside a checksum): class · behind-count · quoted evidence · verdict.

- [x] **Step 8 — Batch:** Make a detached worktree off the audited commit (`bkit:anchor` `baseSha`), not the remote integration ref.
  - **If** the local branch is ahead → the landing push carries those commits, so the batch builds on them.
  - Do not create a new branch.
  - Merge each IN BATCH PR (`git merge --no-edit`), and NEVER push.
  - **If** the lockfile conflicts:
    - Never resolve it as text.
    - Take the integration copy and regenerate it (`git checkout <integration> -- <lockfile>`, then `git merge --continue`, in the worktree only).
  - **If** two batch PRs conflict on a manifest:
    - **If** the higher version is not a breaking major → it wins, so drop the lower PR and record `replaced by #N`.
    - **Else** → the major is DECISION and stays out, so keep the lower line and record that the major was not taken.
  - **If** a manifest conflicts with the integration branch rather than another PR → take the higher version line by line.
  - **If** any other conflict happens → abort the merge, drop the PR, and record why.
  - **If** permissions stop the batch from assembling (e.g., a refused merge, fetch or install) → the batch verdict is `UNVERIFIED`, not FAIL, and Step 10 does not run.
  - Record the merged commit, then install.
  - After the install, record the resolved version of each changed package per workspace, from the lockfile.
  - Check each package-manager override against the exact direct pin it shadows. **If** the manifest has no overrides → record `none`.
  - For lockfile-only PRs, refresh exactly the named packages.
  - Watch for three traps:
    - Trap (1): an install rewrites manifests and the lockfile (e.g., the pnpm catalog or the root `package.json`), and the uncommitted edits fail frozen CI while passing locally.
    - Trap (2): a recursive update rewrites ranges the bot never proposed, in a big diff, so refresh the named packages only.
    - Trap (3): a partial refresh leaves split versions across the workspace.
  - **If** typecheck or build is red → check a clean integration worktree first. The fix is one version everywhere, including the shared version catalog (e.g., the pnpm catalog).
  - Drift check: every manifest is byte-identical to the merged commit. Quote the diff command, its exit code and its output.
  - Do not commit to the integration branch, and never add a skip-CI marker.
  - Lockfile sources: every entry has an integrity hash, and every tarball comes from the configured registry over HTTPS. Both searches should come back empty; quote any hits and the package that pulls them in.

  **Done when:** `Batch` holds the worktree commit, the PRs in and out with why, the drift check, and both source searches.

- [x] **Step 9 — Screen:** Compare the batch lockfile diff with the integration branch, and list: new packages, transitive ones included; new install scripts and allowlist prompts; versions published less than the bot's release age before the run, with lockfile-maintenance PRs first; a publisher change or weaker provenance, which the trust policy refuses when it is set; names one edit away from a popular package; and the OpenSSF Scorecard score for each new package's source repo (e.g., via deps.dev). Write `no score` when there is no linked repo or it is unscored; that is not a finding by itself. Worms spread through `postinstall`, so read every new script. A package still inside its release age is a `Cooldown` miss: drop the PR and rebuild the batch. Other hits leave the verdict unchanged, and get a `Recommendations` row with evidence for the approver. **Done when:** `Screen` lists each hit, or says `none`, and gives a Scorecard score or `no score` for each new package.
- [x] **Step 10 — Verify:** First confirm `git status --porcelain` is empty, because trap (1) shows up as a dirty tree.
  - Run a frozen install, then the static, unit and integration gate, then local E2E for each app. A store build or a deployed environment tests none of the batch, so use the local-build substrate.
  - Go beyond a green typecheck: run the framework's dependency doctor, where the framework ships one (e.g., `expo-doctor`), because packages outside the SDK's range compile and typecheck, then break the native app.
  - Run a single-version check for the runtime packages named in `Project Instructions`. Two versions is trap (3): report it, and the fix is one version everywhere.
  - **If** a red is a timeout under heavy load (e.g., exit 143) → re-run that file alone and record the load average before blaming the batch.
  - A red can come from a stale install. Clear the installed dependencies (e.g., `node_modules`, `.venv`, `target/`), run a frozen install, and re-run before blaming the bump.
  - Reproduce each red on the audited commit without the batch, in a clean worktree off `baseSha`. A red there is a baseline red: it goes in `Verification` as a finding, reported apart from the batch, and it is not a batch FAIL.
  - Judge the batch on the remaining reds.
  - **If** a red remains → drop the suspect PR, rebuild the batch, and re-run.
  - **If** no single PR explains it → the batch is FAIL.

  **Done when:** `Verification` quotes every command and exit code, and each baseline red, and `Summary` has PASS, CONCERNS, FAIL or UNVERIFIED.

- [x] **Step 11 — Plan:** The report asks and stops. It does not push, merge, close or label.
  - **If** the integration branch takes direct pushes → the batch lands without a feature-branch PR.
  - **If** the deployed-boundary checks run on push only → the landing push is where the batch first meets external services.
  - Never merge bot PRs one by one. N merges in sequence cost N integration runs, plus a rebase on every open PR after each one. N PRs in one push cost one integration run.
  - The `Plan` table has the columns `Wave`, `PRs`, `Commits`, `Why together, or why apart`, `Pushes` and `CI runs`.
  - Follow these rules:
    - (1) Default to one wave, with every IN BATCH PR in one push.
      - Make a series of commits, not a squash: the non-major groups first, then one commit per major, each with an install that matches its manifests. Each commit is a point to revert or bisect to.
      - CI runs once on the push head, so `Verify` covers the head, and the earlier commits get a frozen install and a typecheck.
    - (2) Add a second wave only for a named reason; being able to bisect is not enough.
      - The reason is a production watch before the next land, e.g., for an SDK, framework or native major, a store build or submission, or a DB-client major.
      - An extra wave costs another push, another integration run and a rebase on every open PR, so put that cost in the row.
    - (3) Order security first, then non-majors, then majors.
      - Within the majors, put a dependency before its dependents, e.g., the language before the linter, and a UI library together with its types.
    - (4) Put an unmerged automerge group in the batch. Letting it merge itself first costs a separate push plus rebases, so fold it in, and close it at the push.
      - **If** it merged before the landing → rebase the batch and drop it from the plan.
    - (5) Close the carried PRs right after the push, with an `Excluded` comment pointing at the landing commit. The bot only closes them on its next run, and until then it may rebase them and run CI.
    - (6) Land after the bot's weekly window, with no opens or rebases mid-landing, and no integration push queued.
    - (7) List the excluded and deferred PRs the landing will rebase, with the CI cost. A PR excluded over several cycles is rebased on every later push, so recommend closing it and using the dashboard when it is wanted.
    - (8) Never add skip-CI on a dependency change, so the required checks test the batch.
  - Then give the landing commands in order: the push, closing the PRs with comments, and the labels for the PRs left open.
  - Give the cost of landing one by one against the batch, plus the CI already spent on the branch PRs.
  - For the post-land watch, name the error-tracker release and the error-rate and crash-free thresholds for reverting commit by commit.
  - Do not invent thresholds.

  **Done when:** `Plan` holds the table, the commands, both costs, and the watch.

- [x] **Step 12 — Excluded:** The report lists only. It does not label, comment or close. Class C and blocked PRs stay open. The report supplies the comment text (what broke and the fix) and the labels (deferred, plus the major label on a major). Comments start with the marker in `Project Instructions`, so the next step finds the marker and edits the existing comment. A PR the batch carries is closed after the landing, with a pointer to the batch. A breaking major or migration is DECISION and goes in `Recommendations`. **If** it is real work → name the issue to open. DECISION evidence is more than the bare PR: the migration guide, the breaking changes checked against the codebase with hit counts, codemods, the peer-dependency matrix, and the rollback path. **Done when:** `Excluded` has a row per out-of-batch PR: verdict · labels · comment text or DECISION evidence.
- [x] **Step 13 — Unseen:** Check the surfaces the bot cannot see.
  - (a) New advisories against the committed baseline. The delta script reports advisories not in the baseline, and stale baseline entries.
    - **If** the batch fixes one → remove its baseline entry in the same commit.
    - Security PRs bypass the release age, so confirm they are landing, not queued. `bkit-audit-security` asks the same question, so do not report it twice.
  - (b) A second vulnerability source.
    - Run the scanner over the lockfile, the language requirements files and the shipped images.
    - Some lockfile scanners read only the first document and come back empty without failing, so confirm the full file was read.
    - Read the host's alerts, and the vendor repository advisories for each shipped framework (e.g., `gh api repos/<owner>/<repo>/security-advisories`).
    - Global databases (e.g., `gh api advisories/<id>`, OSV) can lag vendor advisories by days. A vendor advisory missing from the global database is a finding, because the scanners and the CI gate are blind to it.
    - **If** the vendor advisory is already in the global database → count it once, with no lag finding.
    - **If** there are no vendor advisories **or** no host API → use the global source only, and mark the other `Not Checked` with the reason.
    - Classify each advisory as shipped, server-only or dev-only, and say whether the vulnerable function is reachable. An advisory goes to `bkit-audit-security`.
  - (c) Fix latency for shipped dependencies, from publication to landing on the integration branch: CRITICAL within 7 days, HIGH within 30 days.
    - A breach is a finding, listed first.
    - For each open `CRITICAL` or `HIGH`, the earliest date the bot can open a PR is the fixed version's publish date, plus the bot's release age (none for a security update, per (a)), plus the next bot run. Compare it with the deadline.
    - A bot date past the deadline is a finding before the breach happens.
    - **If** the bot is blind to the advisory (vendor-only) → there is no date, and the advisory itself is a finding.
  - (d) A container that installs from a manifest the bot bumps is covered. A second install line that bypasses the manifest is a gap; report it.
  - (e) Unused dependencies go to `bkit-audit-dead-code`. New dependencies since the last pass that are unmaintained (no release for over a year, or archived) go in `Recommendations`.
  - (f) Deprecated and abandoned packages across the whole tree, from the dashboard's abandoned list and frozen-install warnings.
  - (g) Licences for new dependencies since the last pass.
    - Judge each licence by shipping scope (deployed or distributed), not by membership of the dependency graph.
    - A copyleft licence (GPL, AGPL) or a missing licence on a shipped dependency goes in `Recommendations`.
    - Diff the production tree's licences against the previous run, including BSL, SSPL and commercial upgrades.
    - Check that the shipped app's notices are regenerated when a dependency changes.
    - For bundled fonts, icons and images, check the licence and the terms for shipping them.
  - (h) Off-manifest CLIs, because the bot reads manifests only.
    - Sources: CI `run:` lines (global installs, `npx` / `pnpm dlx`, `curl | sh`, system packages), setup-action version inputs (e.g., `supabase/setup-cli` `version:`), build-service CLI pins (e.g., `eas.json` `cli.version`), Dockerfiles, build images, version files (e.g., `.tool-versions`), repo scripts, and setup docs that install globally.
    - For each CLI, record: location · pin, or `floating` (unpinned, `latest`, or an open range) · latest release, read live · majors behind · bot-watched (a manifest entry or a bot rule, e.g., Renovate `customManagers`) yes / no.
    - A floating CLI in CI or a build image is a finding, because each run gets an unreviewed version that bypasses the release age.
    - A major behind is a finding, and end of life goes to Step 14.
    - An unwatched CLI gets a `Recommendations` row: move it into a manifest, or add a bot rule.

  **Done when:** `Unseen` holds the advisories, the vendor-advisory gaps, the latency and the earliest bot dates, the container install path, the deprecated packages, the licence diffs, and a row per off-manifest CLI.

- [x] **Step 14 — End of Life:** Compare the versions in use with the end-of-life catalogue and each vendor's support policy. Record the days left for the runtime, the framework, the native SDK, the package manager, the language, the database major, and the container base images the project ships (sources in `Project Instructions`). An end of life inside 90 days is DECISION, and the report names the issue to open. **Done when:** `End of Life` has a row per runtime: version · days left · verdict.
- [x] **Step 15 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per bot preset, package-manager supply-chain setting, and Concise Guide rule, marked checked (with the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [x] **Step 16 — Anything Else:** (a) List the dependency-touching changes since the previous report's commit (manifests, the workspace file, bot configs, workflow `uses:`, Dockerfiles, requirements, runtime-version files, the build image and the hosting runtime), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior supply-chain engineer would flag that no step asks about. Read what happened since the previous run: incidents, new `docs/failures.jsonl` rows, `bkit-audit-logs` reports and vendor status. Note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [x] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [x] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [x] **Batch local:** the drift check is quoted with its exit code.
- [x] **No push:** nothing was pushed.
- [x] **Worktree removed:** the throwaway worktree is removed.
- [x] **Integration unchanged:** the integration branch is unchanged.
- [x] **No landing:** no PR was merged, labelled, closed or commented on.
- [x] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | There is no dependency updater config. A shipped dependency has a known-bad install script, or a publisher change the trust policy should have refused. A lockfile entry has no integrity hash, or a tarball comes from off the configured registry. A CRITICAL advisory in a shipped dependency is older than 7 days. |
| `HIGH` | A HIGH advisory in a shipped dependency is older than 30 days. A lockfile-maintenance update automerged or landed inside the release-age window. A shipped dependency has a copyleft or missing licence. |
| `MEDIUM` | The updater config scans bkit-owned trees (`.bkit/templates/**`, `.agents/skills/**`). A supply-chain setting is missing or weaker than the standard. A setting multiplies PR or CI runs. A shipped dependency is unmaintained or deprecated. An end of life falls inside 90 days. A runtime package has two versions. An off-manifest CLI floats in CI or a build image, or is a major behind. |
| `LOW` | The bot stopped rebasing a PR. A grouping miss caused no failure. The shipped licence notice was not regenerated. An off-manifest CLI is unwatched. |

Within a severity, list shipped exposure first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| dependencies-5 | MEDIUM | finding | `package.json:246-247` (`"cross-spawn": "7.0.6"`); `pnpm-lock.yaml:754`, `:1476-1480`; added in `0309001d3` (2026-11-03) | The first runtime `dependencies` entry since the previous run, so it ships to every consumer (`docs/technology.md` § Build & Output). `npm view cross-spawn time` → 7.0.6 published 2024-11-18, still the latest = 726 days with no release (the Step 13 (e) test is "no release for over a year"). Its shipped transitives are older: `which@2.0.2` 2019-11-18, `path-key@3.1.1` 2019-11-22, `shebang-command@2.0.0` 2019-09-06, `shebang-regex@3.0.0` 2019-04-27, `isexe@2.0.0` 2017-03-23. OpenSSF Scorecard 3.2 (deps.dev, 2026-08-24). Repo `moxystudio/node-cross-spawn` not archived, pushed 2026-11-01 (`gh api repos/…`). `docs/decisions.jsonl` has 0 lines that mention `cross-spawn` (`grep -c`). OSV: 0 advisories. Licences MIT / ISC. Shipped. Tool: `npm view`, `gh api`, deps.dev API, `grep` | A recorded decision to keep it (why the package is fine with no releases), or a replacement |
| dependencies-3 | MEDIUM | finding | `.github/renovate.json5:45-49` (`schedule: ["* * * * 1"]`, no `updateNotScheduled`); `.bkit/templates/.github/renovate.json5` (same lines; `diff` shows only the bkit-repo block differs) | Renovate's default `updateNotScheduled: true` lets it push to existing PR branches every day, outside the Monday window. Since the 2026-11-02 Monday window opened #832–#834: `renovate/pinned-tools` 12 `bkit-ci` runs on 12 head SHAs (daily 11-02 → 11-13), `renovate/github-actions` 9, `renovate/non-major-dependencies` 5, `renovate/docker-images` 1 → 27 `bkit-ci` runs plus their `bkit-trivy` twins for 4 PRs (`gh run list --workflow bkit-ci.yml --created '>=2026-10-29'`). Run 43443372663 (Fri 2026-11-13) logged "Branch updated" for `renovate/non-major-dependencies` and `renovate/pinned-tools`. Renovate docs (44.239.1 `configuration-options.md` § `schedule`): "You should configure `updateNotScheduled=false` if you want the schedule more strictly enforced so that _updates_ to existing branches are not pushed out of schedule." Shipped template. Tool: `gh run list`, `gh run view --log`, Read | Branch updates wait for the Monday window (`updateNotScheduled: false`), as the schedule comment at `:45-47` intends |
| dependencies-4 | MEDIUM | finding | vite (devDependency, `package.json:119` `6.4.5`; `pnpm-lock.yaml:60-62`); vendor advisory GHSA-p4f5-76q4-ffq7 | Vendor advisory, severity critical, published 2026-11-10T01:35:55Z: "Remote code execution using `__vite-browser-external` virtual module", range `>= 4.0.0,<=6.4.5`, patched `6.4.6` (`gh api repos/vitejs/vite/security-advisories/GHSA-p4f5-76q4-ffq7`). The installed 6.4.5 is in range. `gh api advisories/GHSA-p4f5-76q4-ffq7` → HTTP 404 and OSV `GET /v1/vulns/GHSA-p4f5-76q4-ffq7` → 404, 4 days later; known-hit check GHSA-c59q-g84q-2gj5 resolves in both. So `pnpm audit`, the OSV batch, `bkit-check-dependency-audit.mjs` and Renovate `osvVulnerabilityAlerts` cannot see it, and no security PR will open. Dev-only: vite runs only as vitest's engine, and the advisory needs a dev server exposed with `--host` / `server.host` → not reachable (reachability → `bkit-audit-security`). vite 6.4.6 was published 2026-11-09T11:06:50Z, so the 7-day gates clear 2026-11-16T11:06Z. Tool: `gh api`, `curl` OSV | Track vendor advisories until the global database carries them, and land 6.4.6 as soon as it clears the release age |
| dependencies-2 | MEDIUM | finding | `.github/renovate.json5:113` (`.bkit/templates/**` ignored), `:316-324` (Dockerfile `pnpm` joins the automerge group); `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`; `.bkit/core/engine/audits/templates/template-action-pins.test.ts` | All 4 open non-lockfile bot PRs fail the copy-parity tests after a clean merge onto `bcd1b8fc3` (`Classes`): the bot edits a root copy and never its ignored `.bkit/templates/` twin. Third run in a row (9 of 11 last run, 2 of 8 the run before). New this run: the Dockerfile `PNPM_VERSION` now rides in the non-major automerge group (previous R4), so #833 — the one PR set to automerge — is red on `.cursor/Dockerfile` parity alone and can never automerge while pnpm moves. With dependencies-3, each daily push re-runs a CI that is red by design. Repo only (consumers have no twin test). Tool: `git merge` + `node_modules/.bin/vitest run` in the worktree, `gh run view --log-failed` | Bot PRs that touch a templated root file carry the matching template edit, or are kept out of the automerge group |
| dependencies-1 | MEDIUM | baseline red | `.bkit/core/engine/commands/workflow/tracker.test.ts:720` ("bounded nonfatal publication > reserves new comment opportunity within total delivery budget"); open ledger row `tracker-new-comment-budget-shell-observation-flake` | The local gate on `bcd1b8fc3` with no batch (`LOCAL_STACK_LOCK_WAIT_S=2400 pnpm bkit:gate:install-static-unit-build`, exit 1) failed this one case: "AssertionError: expected { Object (done, action, ...) } to match object { done: true }" at `tracker.test.ts:335` (`Tests 1 failed \| 7708 passed \| 2 skipped (7711)`, load average 10.2 on 10 cores). Run alone (`node_modules/.bin/vitest run -c vitest.unit.config.ts …/tracker.test.ts`, load 11.42) → `Tests 104 passed (104)`, exit 0. Same test and same symptom as the open ledger row (`MEDIUM`), which records the same pass-alone, fail-in-suite pattern. Not a dependency defect; reported apart from the batch. Tool: local gate, vitest | The case passes in the full unit run, not only alone |
| dependencies-6 | LOW | finding | `.github/renovate.json5:75` (`minimumReleaseAge: "7 days"`), `:81-84` (`lockFileMaintenance`); PRs #735, #898 | `renovate/stability-days` has stayed `pending` on #735 (lock file maintenance) since 2026-10-29 (16 days; last push 2026-10-29T12:57Z; the 2026-11-01 window did not refresh it: run 41310455217 has no "Branch updated" line) and on #898 (ubuntu digest, since 2026-11-09). The dashboard now offers digest `065aa86` while #898 still holds `6a06111`. The previous run saw the ubuntu digest pending as well. Neither update carries a release timestamp. Renovate docs 44.239.1: without `minimumReleaseAgePackageManagerSync`, "lock file maintenance waits for `minimumReleaseAge` like any other update without a release timestamp"; the default `minimumReleaseAgeBehaviour` is `timestamp-required`. That option is absent from the 44.176.2 and 44.221.6 docs, and the 44.176.2 table says `lockFileMaintenance` does not support `minimumReleaseAge`, so the cause at the runner's version is not confirmed. Tool: `gh pr checks`, `gh run view --log`, Renovate docs at tags | Updates with no release timestamp either clear the release-age check or are exempt from it |
| dependencies-7 | LOW | finding | `.github/workflows/bkit-trivy.yml:64` (`docker://ghcr.io/aquasecurity/trivy:0.75.0@sha256:af6acf9a…`) (+ template) | Dashboard #328 shows "Updates: `0.76.2`" for this pin, but no PR carries it: #832 (github-actions) leaves it out and it is not under "Pending Status Checks". Second run (previous R10, 0.76.1 then). Latest Trivy is v0.76.2 (2026-11-05). ghcr.io tags carry no publish date, the same reason `renovate.json5:165-170` gives for the Renovate image, so the pin is detected but never bumped. Shipped template. Tool: `gh issue view 328`, `gh api repos/aquasecurity/trivy/releases/latest` | The scanner pin reaches a PR like the other pinned tools (e.g. read through `github-releases` with a `# renovate:` annotation) |

## Report

### Summary

- **Findings:** CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 2.
- **PRs:** open 5 · in batch 0 · excluded 5 · decision 0.
- **Batch verdict:** PASS (empty batch). Nothing can land this week: the four content PRs (#832, #833, #834, #898) fail copy parity because Renovate edits root files and never their `.bkit/templates/` twins (dependencies-2), and #834 also carries three stale checksums. #735 and #898 wait on a release-age check that undated updates never clear (dependencies-6).
- **Top risks:** bkit now ships its first runtime dependency, `cross-spawn` 7.0.6, which has had no release for 726 days and has no recorded decision (dependencies-5). The dev-only vite 6.4.5 is in range of a critical vendor-only advisory that no scanner here can see; 6.4.6 clears the release age on 2026-11-16 (dependencies-4). Renovate pushes to the open PRs daily outside its Monday window, which cost 27 red `bkit-ci` runs and their Trivy twins since 2026-11-02 (dependencies-3).
- **Series vs previous run (2026-10-29):** previous findings closed 7 of 7 (100%); oldest open none. Vendor-advisory lag: GHSA-8g5g 8 days (fixed) → GHSA-p4f5 4 days and counting. End-of-life days: Node 24 549 → 533, pnpm 10 183 → 167, Ubuntu 26.04 1673 → 1657. CI runs on bot branches: 39 since 2026-10-29.

### Previous Run

- **Previous report:** `docs/audits/202610/dependencies-20261029T013827Z.md`, `bkit:anchor` `baseSha` `5bb26e7c` (`dev`). 539 commits to `bcd1b8fc3` (`git log --oneline 5bb26e7c..bcd1b8fc3 | wc -l`). History is complete (`git rev-parse --is-shallow-repository` → `false`).
- **Closure:** 7 findings → fixed or accepted 7, still open 0 → 100%. Oldest open: none. No finding open after 2 runs. All 19 `audit-dependencies-*` ledger keys are `CLOSED` (`bkit ledgers query --ledger=failures`, 2 pages, coverage `clean`, 346 lines).

<!-- prettier-ignore -->
| Prev ID | Status | Evidence at `bcd1b8fc3` |
| --- | --- | --- |
| deps-1 schedule misses the daily wake | fixed | `renovate.json5:48` `schedule: ["* * * * 1"]`, `:83` `["* * 1 * *"]` (`a137b3048`); Monday runs 41474415394 (2026-11-02T15:43Z) opened #832–#834 and 42652150846 (2026-11-09T16:11Z) opened #898 |
| deps-2 jq checksum unchecked | fixed | `bkit-ci.yml:501-504` `Check Pinned Checksums` covers `.bkit/shared/.claude/bkit-cloud.md` (`10f5da34f`); this run's `bkit ci pins` → `JQ 1.8.2 … ok` |
| deps-3 apt packages float | accepted | decision `738-apt-packages-float-in-pinned-base` (`676f7e318`) |
| deps-4 regex-manager updates ungrouped | fixed | `renovate.json5:311-324`; #834 "Update pinned tools" carries 7 tools; #833 carries the Dockerfile `PNPM_VERSION` with `packageManager` |
| deps-5 vite override masks the pin | fixed | `package.json:125` `"vite": "$vite"` (`6763ab558`); lockfile `specifier: 6.4.5` / `version: 6.4.5` |
| deps-6 vite vendor advisory not in global DB | fixed | vite 6.4.5 installed; GHSA-8g5g-mxqh-grgj now in the GitHub database (published there 2026-10-29T16:39:56Z) and OSV (HTTP 200) |
| deps-7 custom managers extracted twice | accepted | still happens (run 43443372663: `"regex": {"fileCount": 12, "depCount": 32}` for 6 files), now documented as the known cost of `useBaseBranchConfig: "merge"` at `renovate.json5:38-41` and `docs/deployments.md` § Dependency updaters (`f25ca2ffc`) |

- **Series:** fix latency and end-of-life days beside the previous numbers in `Unseen` (c) and `End of Life`.
- **Anchor versions:** Renovate 44.192.2 → 44.239.1 (`config:best-practices` and the security preset unchanged between 44.176.2, 44.192.2 and 44.239.1; new since: `minimumReleaseAgePackageManagerSync`, read for dependencies-6); Concise Guide 2025-12-22 → 2026-11-05 (`7eb7a721`, a spelling fix only); Scorecard v5.6.0 and SPDX 3.29.0 unchanged.

### Inventory

- **Prefix:** `renovate/` (Renovate default; `branchPrefix` unset in `.github/renovate.json5`).
- **Config source:** `origin/main:.github/renovate.json5` with `dev` layered on (`useBaseBranchConfig: "merge"`, `:43`). `git diff origin/main HEAD -- .github/renovate.json5` → no output: no promotion lag.
- **Deferred from the previous report:** #735 (release-age check pending) is still open and still pending. #725–#734 were landed by hand in one push on 2026-10-29 (merge commits `cfd574bb3` … `2ca1e0cfe`, mirror fix `2042365ea`). No deferred major is waiting: the dashboard's only majors are Node 26 (`renovate/node-26.x`, `renovate/major-pinned-tools`), held under "Pending Approval".
- **Query:** `gh pr list --state open --limit 100 --json number,title,headRefName,headRefOid,mergeable,mergeStateStatus,labels,author,files` filtered on `renovate/`; behind-count `git rev-list --count <headSha>..bcd1b8fc3`; CI `gh pr checks <n>` and `gh run list --branch <ref>`. Author on every PR: `cbartens` (PAT-run self-hosted Renovate), recorded as evidence only. The one other open PR (#925, `feat/860-…`) is off-prefix.

<!-- prettier-ignore -->
| PR | Title | Head ref | Head SHA | Mergeable / state | Files | Labels | Behind | Latest finished CI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #898 | Update ubuntu:26.04 Docker digest to 6a06111 | `renovate/docker-images` | `732b399c71` | MERGEABLE / UNSTABLE | `.cursor/Dockerfile` | none | 193 | 42652485394 red: `bkit-tests-unit`; `renovate/stability-days` pending |
| #834 | Update pinned tools | `renovate/pinned-tools` | `7549869404` | MERGEABLE / UNSTABLE | `.bkit/shared/.claude/bkit-cloud.md`, `.cursor/Dockerfile`, `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `scripts/graphify/bkit-graphify.sh` | none | 10 | 43443805123 red: `bkit-tests-static`, `-unit`, `-integration` |
| #833 | Update non-major dependencies | `renovate/non-major-dependencies` | `2ebfce8840` | MERGEABLE / UNSTABLE | `.cursor/Dockerfile`, `package.json`, `pnpm-lock.yaml` | none | 10 | 43443726172 red: `bkit-tests-unit`, `-integration` |
| #832 | Update github-actions | `renovate/github-actions` | `fdb327fd54` | MERGEABLE / UNSTABLE | `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `release.yml` | none | 160 | 43037051564 red: `bkit-tests-unit`, `-integration` (apt) |
| #735 | Lock file maintenance | `renovate/lock-file-maintenance` | `5f2aa602d1` | MERGEABLE / UNSTABLE | `pnpm-lock.yaml` | none | 485 | 40877659941 green; `renovate/stability-days` pending |

### Bot Health

- **Configs:** Renovate only: `.github/renovate.json5`; `package.json:239-240` `bkit.dependencies.updater: "renovate"`. No `.github/dependabot.yml`, no other Renovate file (`ls`). Dependabot alerts on (`gh api repos/cbartens/bkit/vulnerability-alerts -i` → `204`). One updater → pass.
- **Runner:** self-hosted `.github/workflows/bkit-renovate.yml`, cron `17 6 * * *` (`:36`), `renovate-version: "44.176.2"` (`:88`); latest Renovate 44.239.1 (2026-11-13), same major. Mend App: install state `Not Checked` (HTTP 403).
- **Config read branch:** `main` (default) for presets and `useBaseBranchConfig`; `dev` merged over it; identical files.
- **Validator:** repository mode, `renovate@44.176.2`, `RENOVATE_ALLOWED_ENV='PNPM_*' node <scratch>/rv/node_modules/renovate/dist/config-validator.js --strict` → exit 0, "Config validated successfully against 1 file(s)". (A `re2` load stack trace printed first because `--ignore-scripts` skips its native build; it does not change the result.)
- **Dashboard #328:** Abandoned: bats (last release 2025-11-07) and husky (2024-11-18). Pending Approval: Node 26 for `node` + `@types/node`, and Node 26 in the pinned tools — the majors gate works. Pending Status Checks: ubuntu digest `065aa86` (#898, dependencies-6). No blocked, edited or rate-limited entries; no config-migration PR.
- **Logs** (run 43443372663, 2026-11-13T14:30Z): no config error. `WARN: Using the default gitAuthor email address, renovate@whitesourcesoftware.com` (`vars.RENOVATE_GIT_AUTHOR` unset, `bkit-renovate.yml:100`; third run) → `Recommendations`. "Cannot find replaceString" ×10, the documented double extraction (deps-7, accepted). "Branch updated" on a Friday for #833 and #834 (dependencies-3).
- **Held / awaiting approval:** none held by `prConcurrentLimit: 10` / `prHourlyLimit: 4` (`:118-119`); 4 PRs opened on 2026-11-02 in one run, 1 on 2026-11-09. Awaiting approval: the two Node 26 entries.
- **Stopped updating:** #735 pending since 2026-10-29 and #898 pending since 2026-11-09 (dependencies-6).

### Supply Chain

Settings as `main` has them; Renovate docs 44.239.1 and the presets at the runner's 44.176.2; pnpm 10.x settings.

<!-- prettier-ignore -->
| Setting | Value | Standard | Verdict |
| --- | --- | --- | --- |
| Base preset | `config:best-practices` (`renovate.json5:25-28`) | `config:best-practices` | pass |
| Bot release age | root `"7 days"` (`:75`) + npm rule `"7 days"` (`:160-163`) | >= 3 days | pass |
| `internalChecksFilter` | `"strict"` (from `security.preset.ts:90` at 44.176.2) | `"strict"` | pass |
| `minimumReleaseAgeBehaviour` | unset → `timestamp-required` | — | pass for dated updates; undated updates never clear (dependencies-6) |
| Lockfile cooldown | pnpm `minimumReleaseAge: 10080` (`pnpm-workspace.yaml:1`) | wait >= bot release age | pass |
| Action digest pinning | preset + `pinDigests: true` (`:281`); every `uses:` on the dashboard SHA-pinned | `helpers:pinGitHubActionDigests` | pass |
| Image digest pinning | preset `docker:pinDigests`; `.cursor/Dockerfile:16`, `bkit-trivy.yml:64` digest-pinned | `docker:pinDigests` | pass |
| Abandonment flagging | preset `abandonments:recommended`; dashboard flags bats and husky | `abandonments:recommended` | pass |
| Config-migration PRs | preset `:configMigration` | `:configMigration` | pass |
| Bot runtime version | exact 44.176.2; latest 44.239.1, major 44 | exact, current major | pass |
| Vulnerability PRs | `osvVulnerabilityAlerts: true` (`:53`) | — | pass; blind to vendor-only advisories (dependencies-4) |
| pnpm `trustPolicy` | `no-downgrade` (`pnpm-workspace.yaml:2`) | `no-downgrade` | pass |
| pnpm `blockExoticSubdeps` | `true` (`:3`) | `true` | pass |
| pnpm build allowlist | `onlyBuiltDependencies: [esbuild]` (`:5-6`) | explicit allowlist | pass |
| pnpm `strictDepBuilds` | `true` (`:4`) | `true` | pass |
| Registry provenance (own package) | `npm view @cbartens/bkit@6.1.1 dist.attestations.provenance.predicateType` → `https://slsa.dev/provenance/v1` | npm provenance | pass |
| Override pins fenced | `vite: "$vite"` follows the pin; `esbuild: "^0.28.0"` shadows no direct pin | `docs/deployments.md` § Dependency updaters, "Fence a `pnpm.overrides` pin" | pass |
| Patched dependency fenced | `pnpm.patchedDependencies` `bats@1.13.0` (added `3415f750b`, 2026-11-14); no Renovate rule holds bats | same reasoning as the override fence: a bump leaves the patch keyed to the old version | gap → `Recommendations` R5 |

### Cooldown

- **Package-manager cooldown:** on — pnpm 10.34.7, `minimumReleaseAge: 10080` (7 days). The conditional checks in Step 5 still ran.
- **Lockfile-maintenance automerge:** `lockFileMaintenance` (`:81-84`) sets none; the automerge rules match `matchManagers: ["npm"]` minor / patch and `custom.regex` pnpm → lockfile maintenance does not automerge → pass.
- **Merged lockfile maintenance since the previous run:** none (`gh pr list --state closed --head renovate/lock-file-maintenance` → newest #450, closed unmerged 2026-10-18). The hand landing of #728 on 2026-10-29 carried versions all past 7 days (previous report `Cooldown`).

<!-- prettier-ignore -->
| PR | Kind | Release-age check | Newest version published | Eligible | Verdict |
| --- | --- | --- | --- | --- | --- |
| #898 | docker digest | `renovate/stability-days` pending | digest, no timestamp | never, while undated digests need a timestamp (dependencies-6) | EXCLUDED |
| #834 | pinned tools (regex) | pass | renovate 44.221.6, codex 0.167.0, opencode 2.2.5, vale 3.26.0, gh 2.103.3, node 24.22.2, graphifyy 0.9.103 | now | EXCLUDED (class C) |
| #833 | non-major group, automerge | pass | oxlint 1.92.0, 2026-11-06T12:29:01Z (newest named; the lockfile diff adds only new versions of names already locked) | now (7 days at 2026-11-13T12:29Z) | EXCLUDED (class C) |
| #832 | github-actions | pass | `anthropics/claude-code-action` v1.0.268 and others | now | EXCLUDED (class C) |
| #735 | lockfile maintenance | `renovate/stability-days` pending | content regenerated 2026-10-29; every version past 7 days by 2026-11-05 at the latest | when the check passes; it has not in 16 days (dependencies-6) | EXCLUDED |

Held correctly by the release age, not yet in any PR: vite 6.4.6 (2026-11-09T11:06:50Z → eligible 2026-11-16T11:06Z) and prettier 3.10.1 (2026-11-12T07:06:22Z → eligible 2026-11-19T07:06Z) (`npm view <pkg> time`).

### Volume

<!-- prettier-ignore -->
| Setting | Value (`main`) | What it would change | PRs / CI runs saved |
| --- | --- | --- | --- |
| Grouping | non-major group incl. `packageManager` and the Dockerfile `pnpm` (`:193-211`, `:316-324`); `pinned tools` group (`:311-315`); `github-actions` (`:277-284`); `docker images` (`:299-303`) | none; 4 PRs this window, no solo PR | 0 |
| Schedule | `["* * * * 1"]` UTC (`:48`); Monday runs started 15:43Z (11-02) and 16:11Z (11-09) and opened PRs → window fits the wake | none | 0 |
| Branch updates outside the schedule | `updateNotScheduled` unset → `true`; 27 `bkit-ci` + 27 `bkit-trivy` runs on 4 PRs since 2026-11-02 (dependencies-3) | `updateNotScheduled: false` → branches update only inside the Monday window; security PRs still open at once | about 23 `bkit-ci` + 23 `bkit-trivy` runs this window |
| `prConcurrentLimit` / `prHourlyLimit` | 10 / 4 (`:118-119`) | none; nothing held | 0 |
| `rebaseWhen` | `"conflicted"` (`:88`); the daily pushes are content updates, not rebases | none | 0 |
| Lockfile-maintenance schedule | monthly, `["* * 1 * *"]` (`:83`) | none; but #735 never clears its check (dependencies-6) | 0 |
| Automerge | non-major group `automerge: true`, `platformAutomerge: true`; `allow_auto_merge: false` on the repo → Renovate merges itself after checks | none in config; #833 cannot automerge while the Dockerfile copy parity reds it (dependencies-2) | 0 |
| Major approval | `dependencyDashboardApproval: true` (`:227`) | none; Node 26 held with no PR or CI | 2 PRs held |
| Scan scope | `ignorePaths` (`:101-115`); detected-file list holds no archive, fixture or test path | none | 0 |

### Classes

All reproduced in the clean worktree: `git switch --detach bcd1b8fc3`, `git merge --no-edit origin/renovate/<b>` (every merge clean), then `node_modules/.bin/vitest run` on `dogfood-templates.test.ts`, `template-action-pins.test.ts` and `cloud-env.test.ts`. Baseline `bcd1b8fc3`: `Tests 186 passed (186)`.

<!-- prettier-ignore -->
| PR | Class | Behind | Evidence (quoted) | Verdict |
| --- | --- | --- | --- | --- |
| #898 | C, copy parity | 193 | `FAIL .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > .cursor/Dockerfile` (`Tests 1 failed \| 185 passed`) | EXCLUDED (also release-age pending) |
| #834 | C, copy parity + checksum | 10 | dogfood ×5 (`.cursor/Dockerfile`, `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-graphify.sh`); `cloud-env.test.ts`: "GH_VERSION: expected '2.103.3' to be '2.103.0'"; CI static: "sha256sum: WARNING: 1 computed checksum did NOT match" / "vale.tar.gz: FAILED"; `bkit ci pins` on the merge → `FAIL VALE 3.26.0`, `FAIL GH 2.103.3`, `FAIL NODE 24.22.2` (`NODE_SHA256`, `GH_SHA256`, `VALE_SHA256` not bumped). CI's `tools.test.ts`, `journal.integration.test.ts` and `core.integration.test.ts` reds are class B: the same tests failed on `dev` at the PR's merge base `0bf7db750` (run 43427471613) and pass on `dev` at `2d510c6669` (run 43518336672) | EXCLUDED |
| #833 | C, copy parity | 10 | `FAIL … dogfood-templates.test.ts > … > .cursor/Dockerfile` (`ARG PNPM_VERSION=10.34.9` in the root copy only); its `tools.test.ts` / integration reds are the same class B baseline as #834 | EXCLUDED |
| #832 | C, copy parity (latest run class A) | 160 | dogfood ×3 (`bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`); `template-action-pins.test.ts`: "Renovate does not scan .bkit/templates/** — bump the template pin by hand alongside the repo one, or add it to HELD_BACK with a reason: expected [ …(11) ] to deeply equal []". Its latest CI red is class A: "E: Failed to fetch https://security.ubuntu.com/ubuntu/pool/main/z/zsh/zsh-common_5.9-8ubuntu3_all.deb  Temporary failure resolving 'security.ubuntu.com'" (exit 100); the previous run on the branch (42838286137) shows the class C lines above | EXCLUDED |

#735 is green: no class, but EXCLUDED by the pending release-age check (`Cooldown`).

### Batch

- **Worktree:** `git worktree add --detach tmp/audit-deps-20261114 bcd1b8fc3`. Local `dev` = `bcd1b8fc3`, 6 commits ahead of `origin/dev`, so the batch builds on those. No branch; no push.
- **Merged:** none. No PR is IN BATCH: #832, #833, #834, #898 are class C, #735 and #898 have a pending release-age check. The worktree stays at `bcd1b8fc3`; the per-PR repro merges (`Classes`) were detached throwaways, and the worktree was switched back to `bcd1b8fc3` after them.
- **Install:** `pnpm install --frozen-lockfile` → exit 0, "Done in 2.4s using pnpm v10.34.7". No lockfile-only PR in the batch → no named-package refresh.
- **Resolved versions of changed packages:** none changed.
- **Overrides:** `vite: "$vite"` → `specifier: 6.4.5` / `version: 6.4.5(…)` (`pnpm-lock.yaml:60-62`) = the direct pin; `esbuild: "^0.28.0"` → `esbuild@0.28.2` (`:761`), no direct pin to shadow.
- **Drift:** `git status --porcelain` → empty; `git diff --exit-code HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml` → exit 0, no output.
- **Lockfile integrity:** `grep -c "resolution: {"` = 184; `grep -c "resolution: {integrity: sha512-"` = 184.
- **Lockfile sources:** `grep -nE "tarball:|git\+|codeload\.github|github:|https?://" pnpm-lock.yaml | grep -v registry.npmjs.org` → no lines (exit 1). Known-hit check of the pattern on `resolution: {tarball: https://evil.example/x.tgz}` → 1. No `.npmrc` → default registry.

### Screen

The batch adds nothing, so its lockfile diff against `bcd1b8fc3` is empty: **none**. No new package → no Scorecard row.

For the approver of the next landing (not a batch verdict): the clean merge of #833 adds 33 new versions, all of names already locked (`comm` of `packages:` keys: base 184, merge 184, no new name). The merge of #735 swaps versions of names already locked (e.g. `@rollup/*` 4.62.4 → 4.65.0, `@babel/parser` 7.29.8 → 7.29.9). The one new package since the previous pass, `cross-spawn` (and its 5 transitives), came in by hand in `0309001d3`, not through a bot PR: no install script (`npm view cross-spawn@7.0.6 scripts` → only `lint`, `test`, `release`, `prerelease`, `postrelease`), publisher `satazor`, no SLSA provenance (`dist.attestations` absent), Scorecard 3.2 (dependencies-5).

### Verification

The batch is empty, so every command below ran on `bcd1b8fc3` alone, in `tmp/audit-deps-20261114`. Any red here is a baseline red.

<!-- prettier-ignore -->
| # | Command | Exit | Result |
| --- | --- | --- | --- |
| 1 | `git status --porcelain` | 0 | empty |
| 2 | `pnpm install --frozen-lockfile` | 0 | "Done in 2.4s using pnpm v10.34.7"; re-run "Already up to date", no deprecation warning |
| 3 | `pnpm bkit:gate:install-static-unit-build` | 75 | first try: the machine tests lock was held by another agent's worktree; no test ran |
| 4 | `LOCAL_STACK_LOCK_WAIT_S=2400 pnpm bkit:gate:install-static-unit-build` | 1 | install and all static steps (typecheck, test typecheck, lint, format, tables, prose, slop delta) passed; unit: `Test Files 1 failed \| 177 passed (178)`, `Tests 1 failed \| 7708 passed \| 2 skipped (7711)`; load "10.2 on 10 cores" (`test-timeout-budget`); the gate stopped before `pnpm build` |
| 5 | `node_modules/.bin/vitest run -c vitest.unit.config.ts .bkit/core/engine/commands/workflow/tracker.test.ts` | 0 | `Tests 104 passed (104)` at load 11.42 → the red is the known flake (dependencies-1) |
| 6 | `pnpm build` | 0 | `tsc && chmod +x dist/cli.js` |
| 7 | `LOCAL_STACK_LOCK_WAIT_S=1200 pnpm bkit:test:bats` | 0 | `1..40`, 40 `ok`, 0 `not ok` |
| 8 | `git status --porcelain` | 0 | empty |
| 9 | `pnpm bkit check` | 0 | "0 write(s) would occur."; 15 advisories, all about the worktree (no `.bkit/.env`, Vale styles not synced) |
| 10 | single-version check: `grep '^  cross-spawn@' pnpm-lock.yaml \| sort -u` | 0 | one version, `cross-spawn@7.0.6` |
| 11 | override check: `grep -n -A3 '^      vite:' pnpm-lock.yaml` (importers) | 0 | `specifier: 6.4.5`, `version: 6.4.5(…)` = the pin |
| 12 | `git worktree remove --force tmp/audit-deps-20261114`; `git config core.hooksPath` | 0 | worktree gone (`git worktree list`); `.husky/_` |

- **Baseline red:** `tracker.test.ts` "reserves new comment opportunity within total delivery budget" fails in the full unit run and passes alone → dependencies-1, the open ledger row `tracker-new-comment-budget-shell-observation-flake`. It is not a batch FAIL.
- **Not run:** the integration tier (the project gate is static + unit + build) and local E2E (bkit has none). No framework doctor exists for this stack.
- **Batch verdict:** PASS (empty batch: nothing to land, and the base is green apart from the known flake).

### Plan

The batch is empty, so nothing lands from this run. The report asks and stops.

<!-- prettier-ignore -->
| Wave | PRs | Commits | Why together, or why apart | Pushes | CI runs |
| --- | --- | --- | --- | --- | --- |
| none | — | — | No PR is IN BATCH: #832, #833, #834, #898 are class C (copy parity, plus checksums on #834); #735 and #898 wait on `renovate/stability-days` | 0 | 0 |

- **Landing route:** `dev` takes direct pushes (`gh api repos/cbartens/bkit/branches/dev/protection` → `404 Branch not protected`), so a later batch lands as commits on `dev`, no feature-branch PR. `allow_auto_merge: false` (`gh api repos/cbartens/bkit --jq .allow_auto_merge`).
- **Next landing (advisory, for the next run or a hand landing after the fixes):** one wave, one push to `dev`, after the Monday 2026-11-16 window — commits in this order: (1) non-major group #833 with vite 6.4.6 folded in once it clears 2026-11-16T11:06Z (dependencies-4), each with the `.bkit/templates/.cursor/Dockerfile` twin edit; (2) github-actions #832 with its 11 template pins; (3) pinned tools #834 with the template twins and the three new `*_SHA256` values (`gh release view` / `SHASUMS256.txt`, `Project Instructions` § Classify); (4) the ubuntu digest from #898 or its successor; (5) lockfile maintenance #735 regenerated, as the release age allows. One push, one `bkit-ci` + `bkit-trivy` run. Never add `[skip ci]`.
- **Commands for this run:** none to push. For the PRs left open, apply the labels and comments in `Excluded` (the caller or a human does it; this audit does not).
- **Cost:** landing one by one = 5 pushes, 5 `bkit-ci` runs plus a rebase of every other open PR after each (up to 4 + 3 + 2 + 1 = 10 more runs) → about 15 runs; one batch = 1 run. Already spent on the branch PRs since 2026-10-29: 39 `bkit-ci` runs (27 since the 2026-11-02 window) plus their `bkit-trivy` twins (`Volume`).
- **Rebased by a landing:** every open bot PR (`rebaseWhen: "conflicted"` rebases only on a conflict, but `updateNotScheduled` pushes daily anyway; dependencies-3). #735 has been excluded for 2 runs: recommend closing it and asking for lockfile maintenance from the dashboard checkbox once dependencies-6 is fixed.
- **Post-land watch:** bkit is a published CLI with no error tracker (`git grep -n -i -E "sentry|error track" bcd1b8fc3 -- docs/observability.md` → no hit), so the watch is the landing push's `bkit-ci` run, the next `release.yml` publish, and `npm view @cbartens/bkit dist.attestations` on the next release. No error-rate or crash-free threshold exists; none is invented.

### Excluded

Comments start with `<!-- bkit:dependency-triage -->` (`Project Instructions` § Excluded). No PR is a major, so none gets `dep-major`. The report lists only; nothing was labelled or commented.

<!-- prettier-ignore -->
| PR | Verdict | Labels | Comment text |
| --- | --- | --- | --- |
| #898 | EXCLUDED (release age pending; class C) | `deferred` | `<!-- bkit:dependency-triage -->` Excluded from the 2026-11-14 batch. `renovate/stability-days` has been pending since 2026-11-09 because a digest update carries no release timestamp, and the root `.cursor/Dockerfile` no longer matches `.bkit/templates/.cursor/Dockerfile` (`dogfood-templates.test.ts`). Fix: make the same digest edit in the template copy; see dependencies-6 for the release-age check. The dashboard already offers a newer digest (`065aa86`). |
| #834 | EXCLUDED (class C, copy parity + checksum) | `deferred` | `<!-- bkit:dependency-triage -->` Excluded from the 2026-11-14 batch. Renovate bumped the root copies only, so `dogfood-templates.test.ts` fails for `.cursor/Dockerfile`, `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `scripts/graphify/bkit-graphify.sh`, and `cloud-env.test.ts` fails ("GH_VERSION: expected '2.103.3' to be '2.103.0'"). The `*_SHA256` beside Vale 3.26.0, gh 2.103.3 and Node 24.22.2 were not bumped (`bkit ci pins` fails all three; CI: "vale.tar.gz: FAILED"). Fix: mirror each edit into `.bkit/templates/` and `.bkit/shared/.claude/bkit-cloud.md`, and set the three hashes from the release assets. |
| #833 | EXCLUDED (class C, copy parity) | `deferred` | `<!-- bkit:dependency-triage -->` Excluded from the 2026-11-14 batch. `ARG PNPM_VERSION=10.34.9` changed in the root `.cursor/Dockerfile` only, so `dogfood-templates.test.ts` fails and this automerge group can never merge itself. The `tools.test.ts` and integration reds on this branch are a `dev` baseline red at the PR's merge base, fixed on `dev` since. Fix: make the same edit in `.bkit/templates/.cursor/Dockerfile`. |
| #832 | EXCLUDED (class C, copy parity) | `deferred` | `<!-- bkit:dependency-triage -->` Excluded from the 2026-11-14 batch. The action pins changed in the root workflows only: `dogfood-templates.test.ts` fails for `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, and `template-action-pins.test.ts` lists 11 template pins left behind. The latest CI red is an apt mirror DNS failure (`security.ubuntu.com`), not this change. Fix: bump the same pins in `.bkit/templates/.github/workflows/`. |
| #735 | EXCLUDED (release age pending) | `deferred` | `<!-- bkit:dependency-triage -->` Excluded from the 2026-11-14 batch, the second batch in a row. CI is green, but `renovate/stability-days` has been pending since 2026-10-29 and lock file maintenance has no release timestamp to clear it (dependencies-6). Recommend closing this PR and requesting lockfile maintenance from the Dependency Dashboard once the release-age setting is fixed. |

### Unseen

**(a) Baseline delta** — `node scripts/ci/bkit-check-dependency-audit.mjs` → exit 0, "0 blocking advisory(ies), all accepted and in date"; `scripts/ci/bkit-accepted-advisories.json` `accepted: []`, so no stale entry. No security PR is queued (none on the dashboard).

**(b) Second sources**

<!-- prettier-ignore -->
| Source | Command | Result |
| --- | --- | --- |
| pnpm audit | `pnpm audit --json` | 0 advisories, 185 dependencies |
| Dependabot (host) | `gh api repos/cbartens/bkit/dependabot/alerts --paginate` | 8 alerts (#1–3, #6–9, #11), all `fixed`; 0 open |
| OSV (stand-in for local Trivy; Docker daemon down) | `POST https://api.osv.dev/v1/querybatch` over all 184 `packages:` keys | 0 of 184 with a vuln; known-hit `lodash@4.17.15` → 5 |
| Vendor: `vitejs/vite` | `gh api repos/vitejs/vite/security-advisories` | GHSA-p4f5-76q4-ffq7, critical, 2026-11-10, `<=6.4.5` → 6.4.6; global DB 404, OSV 404 → dependencies-4 (dev-only, not reachable) |
| Vendor: `pnpm/pnpm` | same | GHSA-w8f5-6m3h-r453, medium, 2026-10-30, affects `@pnpm/exe` `<10.34.8` (standalone build with embedded Node); global DB 404, OSV 404. Not applicable: bkit runs pnpm through Corepack / `pnpm/action-setup` from `packageManager`, and `git grep -n "@pnpm/exe\|get.pnpm.io" bcd1b8fc3` → no hits. No finding; #833 carries pnpm 10.34.9 anyway |
| Vendor: `vitest-dev/vitest`, `cli/cli`, `moxystudio/node-cross-spawn`, `oxc-project/oxc` | same | nothing published since 2026-10-20 |
| Vendor: `nodejs/node` | same | `[]` — Node publishes advisories on nodejs.org, not as repository advisories → `Not Checked` |
| Known-hit check | `gh api advisories/GHSA-c59q-g84q-2gj5`; `curl -s https://api.osv.dev/v1/vulns/GHSA-c59q-g84q-2gj5` | resolves in both → the 404s above are real |

**(c) Fix latency (shipped)** — shipped tree = `cross-spawn` and its 5 transitives (`pnpm licenses list --prod`). No open CRITICAL or HIGH in it → no breach, no earliest-bot-date row. Series: previous run GHSA-8g5g-mxqh-grgj (vite, dev-only) global-DB lag 8 days, fixed (6.4.5 landed 2026-10-29); this run GHSA-p4f5-76q4-ffq7 (vite, dev-only) lag 4 days and counting, fix 6.4.6 eligible 2026-11-16 (dependencies-4).

**(d) Container install path** — `.cursor/environment.json` `install`: `pnpm install --frozen-lockfile && vale sync && pnpm exec bkit context provision` → manifest-covered. Off-manifest installs in the image are the version + sha256 pins (Renovate-watched) and the apt lines (`.cursor/Dockerfile:25`, `:44`; accepted by decision `738-apt-packages-float-in-pinned-base`). No bypassing install line.

**(e) Unmaintained new dependencies** — `cross-spawn@7.0.6` (last release 2024-11-18) and its transitives (newest 2019) → dependencies-5. No dead-code check here (→ `bkit-audit-dead-code`).

**(f) Deprecated / abandoned** — dashboard abandoned list: `bats` (last release 2025-11-07, devDependency, now also patched), `husky` (2024-11-18, devDependency). Frozen install printed no deprecation warning. Both dev-only → `Recommendations` R7.

**(g) Licences** — `pnpm licenses list --json` in the worktree: dev MIT 80 · ISC 6 · Apache-2.0 3 · BSD-3-Clause 1 (previous 76 · 4 · 3 · 1). `--prod` (new; previous run had no production tree): MIT `cross-spawn`, `path-key`, `shebang-command`, `shebang-regex`; ISC `isexe`, `which`. No copyleft, none missing. bkit ships no app notice file and no bundled fonts, icons or images → notices not applicable.

**(h) Off-manifest CLIs** (latest read live 2026-11-14: `gh api repos/<o>/<r>/releases/latest`, `npm view <pkg> version`, `nodejs.org/dist/index.json`, PyPI JSON)

<!-- prettier-ignore -->
| CLI | Location | Pin | Latest | Majors behind | Bot-watched |
| --- | --- | --- | --- | --- | --- |
| Renovate | `bkit-renovate.yml:88` | 44.176.2 | 44.239.1 | 0 | yes (#834 → 44.221.6) |
| Node | `.cursor/Dockerfile:30-31`, `bkit-cloud.md:43` | 24.22.1 + sha256 | 24.22.3 | 0 | yes (#834 → 24.22.2) |
| gh | `.cursor/Dockerfile:50-51`, `bkit-cloud.md:68` | 2.103.0 + sha256 | v2.104.0 | 0 | yes (#834 → 2.103.3) |
| Vale | `bkit-ci.yml:441`, `bkit-cloud.yml:716`, `:857`, Dockerfile `:60-61`, `bkit-cloud.md:57` | 3.24.0 + sha256 | v3.27.0 | 0 | yes (#834 → 3.26.0) |
| jq | `bkit-cloud.md:82` | 1.8.2 + sha256 | 1.8.2 | 0 | yes |
| actionlint | `bkit-ci.yml:488`, `:614` | 1.7.12 | 1.7.12 | 0 | yes (`:487` annotation) |
| uv | `bkit-ci.yml:544` | 0.13.4 | 0.13.8 | 0 | yes (#832 → 0.13.7) |
| Trivy | `bkit-trivy.yml:64` | 0.75.0 + digest | v0.76.2 | 0 | detected, never proposed (dependencies-7) |
| `@opencode/cli` | `bkit-cloud.yml:801` | 2.1.2 | 2.3.0 | 0 | yes (#834 → 2.2.5) |
| `@openai/codex` | `bkit-cloud.yml:899` (new, `8638b680a`) | 0.165.0 | 0.169.0 | 0 | yes (`:898` annotation; #834 → 0.167.0) |
| graphifyy | `scripts/graphify/bkit-graphify.sh` `GRAPHIFY_SPEC` | 0.9.93 | 0.9.108 | 0 | yes (#834 → 0.9.103) |
| pnpm | `package.json:46`, Dockerfile `:71` | 10.34.7 | 10.34.9 (12.20.0 held) | 0 within 10.x; major held by the bkit rule `renovate.json5:329-330` | yes (#833) |
| apt `zsh`, image apt packages | `bkit-ci.yml:605`, `:693`; Dockerfile `:25`, `:44` | floating | — | — | no; accepted by decision 738 |
| supabase CLI (example) | Dockerfile `:81`, commented out | `releases/latest` | — | — | not active → R9 |

No floating CLI runs in CI or the build image outside the accepted apt lines; none is a major behind.

### End of Life

Sources read 2026-11-14: `https://endoflife.date/api/nodejs.json`, `pnpm.json`, `ubuntu.json`; `https://vite.dev/releases`. Days left from 2026-11-14.

<!-- prettier-ignore -->
| Runtime | Version in use | End of life | Days left (previous) | Verdict |
| --- | --- | --- | --- | --- |
| Node.js | 24 (`engines >=24`, Dockerfile 24.22.1) | 2028-04-30 | 533 (549) | pass |
| pnpm | 10.34.7 | 2027-04-30 | 167 (183) | pass; the bkit rule holds the 12.x major, so no bot PR will signal this end of life — plan the move before ~2027-01-30 (90-day line) |
| Ubuntu (Cursor image base) | 26.04 | 2031-05-29 | 1657 (1673) | pass |
| Vite | 6.4 (dev-only, vitest engine) | supported: vite.dev "Security patches are also backported to `vite@6.4` and `vite@8.1`." | — | pass |
| TypeScript | 7.0.2 | not in the catalogue | — | not applicable |
| Native SDK, database major | — | — | — | not applicable: bkit is a Node CLI with no native app and no database |

Node 26 (awaiting approval on the dashboard): end of life 2029-04-30, 898 days.

### Recommendations

<!-- prettier-ignore -->
| ID | Recommendation | Evidence | Finding |
| --- | --- | --- | --- |
| R1 | Record a decision for `cross-spawn` in `docs/decisions.jsonl`: keep 7.0.6 (stable API, 345,733,635 weekly downloads per `api.npmjs.org/downloads/point/last-week/cross-spawn`, repo pushed 2026-11-01) with a review date, or replace it with Node's own `child_process` handling of Windows `.cmd` shims | `Unseen` (e) | dependencies-5 |
| R2 | Add `updateNotScheduled: false` beside `schedule` in `.github/renovate.json5` and `.bkit/templates/.github/renovate.json5`; vulnerability PRs keep their own schedule | `Volume` | dependencies-3 |
| R3 | Track GHSA-p4f5-76q4-ffq7 by hand until GitHub's database carries it; land vite 6.4.6 in the next batch after 2026-11-16T11:06Z (the `"vite": "$vite"` override follows) | `Unseen` (b) | dependencies-4 |
| R4 | Mirror bot edits into the `.bkit/templates/` twins automatically (Renovate `postUpgradeTasks` running a copy script, allowed by `allowedCommands` on the self-hosted runner), or keep templated root files out of the non-major automerge group so #833-type PRs can still merge themselves; the previous run's R9 asked the same | `Classes` | dependencies-2 |
| R5 | Fence the patched dev dependency: a `packageRules` entry `{ matchPackageNames: ["bats"], enabled: false }` with a comment naming `patches/bats@1.13.0.patch`, or a note in `docs/deployments.md` beside "Fence a `pnpm.overrides` pin" that a `patchedDependencies` key needs the same fence | `Supply Chain` | — |
| R6 | After upgrading the runner to >= 44.239.1, set `minimumReleaseAgePackageManagerSync` (or scope `minimumReleaseAgeBehaviour: "timestamp-optional"` to `lockFileMaintenance` and digest updates); first confirm the cause at 44.176.2 | `Cooldown` | dependencies-6 |
| R7 | Replace the Trivy `docker://` tag lookup with a `# renovate: datasource=github-releases depName=aquasecurity/trivy` annotation, as `docs/deployments.md:486` already does for `renovate-version` | `Unseen` (h) | dependencies-7 |
| R8 | Set the Actions variable `RENOVATE_GIT_AUTHOR` (manual, repo settings); the default-gitAuthor WARN is in every run log, third run | `Bot Health` | — |
| R9 | Pin the commented supabase example at `.cursor/Dockerfile:81` (and its template) to a version with a `# renovate:` line, so a consumer who uncomments it does not get `releases/latest` | `Unseen` (h) | — |
| R10 | Adopt the OpenSSF Scorecard action (`ossf/scorecard-action`) on `main`; second run with no Scorecard for this repo | `Standards Coverage` | — |
| R11 | bats and husky are flagged abandoned (dev-only); bats now also carries a local patch. No action needed now; revisit if either gets an advisory | `Unseen` (f) | — |
| R12 | Add `api.osv.dev`, `api.deps.dev`, `endoflife.date` and `pypi.org` to the allowed domains in `.agents/context.md`, so the next run's lookups need no new grant | Pre-Flight | — |

### Checked

- Updater config, runner, validator, dashboard and run logs (Steps 3, 6); the default branch's supply-chain settings and pnpm settings (Step 4).
- Every open `renovate/*` PR: inventory, release-age status, class, with a clean merge onto `bcd1b8fc3` and the three copy-parity test files run on each (Steps 2, 5, 7).
- Batch worktree at `bcd1b8fc3`: frozen install, drift check, lockfile integrity and sources, overrides, single-version check, local gate (Steps 8, 10).
- Pinned checksums on #834's merge (`bkit ci pins`) (Step 7).
- Advisories: baseline delta, `pnpm audit`, Dependabot alerts, OSV querybatch, vendor advisories for vite, pnpm, vitest, gh, cross-spawn, oxc (Step 13).
- Off-manifest CLIs (13 surfaces), licences (dev and prod), deprecations, the container install path (Step 13).
- End of life for Node, pnpm, Ubuntu, Vite (Step 14); anchor standards (Step 15); dependency-touching commits `5bb26e7c..bcd1b8fc3` (Step 16).

### Not Checked

- **Mend App install state:** `gh api user/installations` → HTTP 403 (needs a GitHub App user token; no allow rule clears it). Check by hand: repo Settings → Integrations → GitHub Apps.
- **Local Trivy scan:** the Docker daemon (OrbStack socket) is not running, so `docker run` of the pinned Trivy image could not start. The OSV `querybatch` API stood in as the second lockfile source; image and IaC scanning were not run locally.
- **OSV-Scanner, lockfile-lint:** not installed; the `Batch` greps and the OSV API stood in.
- **The Cursor image:** `.cursor/Dockerfile` was not built, so its installs were read, not run.
- **Cause of dependencies-6 at Renovate 44.176.2:** the docs at that tag say `lockFileMaintenance` does not support `minimumReleaseAge`, yet the check stays pending; the cause needs a debug run with `LOG_LEVEL=debug`.
- **Built-in safety-check block:** a loop using zsh nested parameter expansion around `npm view` was denied verbatim: "Permission for this command was denied by a built-in Claude Code safety check… What was flagged: This command could not be checked for dangerous rm operations: the shell may read it differently than it was parsed." No allow rule clears a built-in check; the lookups were re-run with plain expansions, so no data is missing.
- **Landing push CI:** nothing was landed, so no `dev` push ran against the batch.
- **Integration tier and E2E:** the local gate the project names (`bkit:gate:install-static-unit-build`) runs static, unit and build only; the integration tier was not run locally, and bkit has no local E2E. The batch is empty, so no change was left untested.
- **vite reachability:** the dev-only verdict for GHSA-p4f5-76q4-ffq7 rests on how vite is used here (vitest only, no exposed dev server); a reachability review belongs to `bkit-audit-security`.
- **Node.js advisories:** `gh api repos/nodejs/node/security-advisories` → `[]`, because Node publishes on nodejs.org; the nodejs.org security releases page was not read.
- **Changes after `baseSha`:** `e2fef117a` (Renovate and Dependabot rebase settings) and `237d95e3e` landed on `dev` after `bcd1b8fc3` and were not audited.
- **Paths changed by another writer, audited at the audited commit `bcd1b8fc3` only** (`git status --short` before the report gate): `docs/decisions.jsonl`, `docs/plans/202611/887-review-doc-starters-plan.md`, `docs/plans/202611/logs/887-review-doc-starters/status.jsonl`, `docs/plans/202611/logs/887-review-doc-starters/plan-answers-2.md`.

### Standards Coverage

Versions read this run (2026-11-14):

- Renovate 44.239.1 (`npm view renovate version`); docs and presets read at tags 44.176.2, 44.221.6 and 44.239.1 through `gh api repos/renovatebot/renovate/contents/<path>?ref=<tag>`. Changed since 44.192.2 and relevant: `minimumReleaseAgePackageManagerSync` (new in 44.239.1); `config:best-practices` includes `:maintainLockFilesWeekly` and the same presets in all three tags.
- pnpm 10.x settings (pnpm.io `settings`); pnpm 10.34.9 latest in 10.x.
- OpenSSF Scorecard v5.6.0 (`gh api repos/ossf/scorecard/releases/latest`), unchanged.
- OpenSSF Concise Guide: newest commit `7eb7a721` (2026-11-05), "systemically → systematically", wording only.
- SPDX License List 3.29.0 (2026-09-16), unchanged. endoflife.date, GitHub Advisory Database and OSV API read 2026-11-14.

<!-- prettier-ignore -->
| Standard / rule | Status | Where |
| --- | --- | --- |
| Renovate `config:best-practices` | checked | Step 4 |
| `security:minimumReleaseAgeNpm` (+ repo rule 7 days, `internalChecksFilter: "strict"`) | checked | Steps 4, 5 |
| `minimumReleaseAgeBehaviour` / `minimumReleaseAgePackageManagerSync` | finding | dependencies-6 |
| `helpers:pinGitHubActionDigests` | checked | Step 4 |
| `docker:pinDigests` | checked | Step 4; digest update stuck (dependencies-6) |
| `abandonments:recommended` | checked | Steps 3, 13 (f) — bats, husky |
| `:configMigration` | checked | Step 3; no migration PR |
| `:maintainLockFilesWeekly` (from the preset) vs repo monthly `lockFileMaintenance.schedule` | checked | Step 6; the repo override at `:81-84` wins, recorded in its comment |
| Renovate `schedule` vs runner cron | checked | Step 6; window fits the wake |
| Renovate `updateNotScheduled` | finding | dependencies-3 |
| Renovate grouping | checked | Step 6; all 4 PRs grouped |
| Renovate `customManagers` | checked; double extraction accepted | Step 3 (deps-7, `renovate.json5:38-41`) |
| Renovate `osvVulnerabilityAlerts` | checked | Step 4; blind to vendor-only advisories (dependencies-4) |
| pnpm `minimumReleaseAge` | checked | Steps 4, 5 |
| pnpm `trustPolicy: no-downgrade` | checked | Steps 4, 9 |
| pnpm `blockExoticSubdeps` | checked | Step 4 |
| pnpm `onlyBuiltDependencies` | checked | Steps 4, 9 |
| pnpm `strictDepBuilds` | checked | Step 4 |
| pnpm `allowBuilds` | not applicable | the allowlist is `onlyBuiltDependencies` (`pnpm-workspace.yaml:5-6`) |
| pnpm `patchedDependencies` | finding (no fence) | `Supply Chain`, R5 |
| npm provenance / trusted publishing | checked | own package SLSA v1; cross-spawn has none (Step 9) |
| Concise Guide — can you avoid adding it | finding | dependencies-5: `cross-spawn` added as the first runtime dependency with no decision row |
| Concise Guide — authenticity | checked | Step 8 integrity and sources; Step 9 publisher `satazor` |
| Concise Guide — maintenance and sustainability | finding | dependencies-5 (last release 2024-11-18) |
| Concise Guide — security practices | checked | Scorecard 3.2 for cross-spawn (deps.dev); no SLSA provenance |
| Concise Guide — adoption | checked | 345,733,635 weekly downloads |
| Concise Guide — suitability | checked | used by `scripts/ci/bkit-test-awake.mjs` to spawn on all platforms (`0309001d3`) |
| Concise Guide — licence | checked | Step 13 (g), MIT / ISC |
| Concise Guide — practical testing / code evaluation | checked | Steps 7, 10 |
| OpenSSF Scorecard on this repo | not adopted → adopt | R10 |
| Trivy / OSV / GitHub Advisory Database | checked; Trivy local not run | Step 13 (b); OSV stood in |
| lockfile-lint, OSV-Scanner | not installed → manual checks | Step 8 |
| endoflife.date | checked | Step 14 |
| SPDX License List | checked | Step 13 (g) |
| Install-script attacks (Shai-Hulud class) | checked | Step 9: no new install script; `strictDepBuilds` + allowlist |
| `docs/deployments.md:435` "Pair with an updater" | followed | `Bot Health` |
| `:446` "Gate on known advisories" | followed | Step 13 (a) |
| `:460` "Scan beyond the pnpm lockfile" | followed | `bkit-trivy.yml` |
| `:462` "Hands off bkit-owned trees" | followed | `ignorePaths` (`renovate.json5:101-115`) |
| `:478` "Pins outside package files" (sha256 by hand) | followed by CI, not by the bot | #834 is red on 3 hashes, as designed; `bkit ci pins` catches it |
| `:480` "One source per tool" | finding | the Dockerfile `PNPM_VERSION` is still a typed copy of `packageManager`; grouped now, but it is what makes #833 red (dependencies-2) |
| `:486` self-hosted cron, dated `renovate-version` lookup | followed for Renovate; not applied to Trivy | dependencies-7 |
| `:506` `RENOVATE_GIT_AUTHOR` | not set | R8 |
| `:510` "Fence a `pnpm.overrides` pin" | followed | `vite: "$vite"` follows the pin |
| `:526` Manual CVE handling | not applicable | no open alert; vite advisory is vendor-only (dependencies-4) |
| `:590` bkit-repo "Renovate — fencing bkit's own footprint" | followed, at a cost | hand mirroring is the documented step; dependencies-2 |
| `docs/technology.md` § Build & Output (runtime dependencies) | finding | dependencies-5 |
| `.bkit/trackers.md` § Issue shapes | followed | `Suggested Issues` |

Unapplied recommended practice: Renovate `postUpgradeTasks` to mirror template copies → adopt (R4); OpenSSF Scorecard action → adopt (R10).

### Beyond the Steps

**(a) Dependency-touching changes `5bb26e7c..bcd1b8fc3`** (`git log --no-merges` on manifests, workspace, bot configs, workflows, Dockerfile, cloud setup, `patches/`)

<!-- prettier-ignore -->
| Commit | Change | Verdict |
| --- | --- | --- |
| `49f5d0bab` … `3dcb93ca3` (10 `chore(deps)` commits, 2026-10-29) | the previous batch: pnpm 10.34.7, github-actions, non-major (vitest 5.0.5, vite 6.4.5, oxlint 1.89.0), opencode 2.1.2, gh 2.103.0, Vale 3.24.0, jq 1.8.2, Renovate 44.176.2, Node 24.22.1 | ok; all past 7 days at landing |
| `6763ab558` | `pnpm.overrides.vite` → `"$vite"` | ok; closes deps-5 |
| `2042365ea` | template mirror + checksums for the pinned tools | ok |
| `a137b3048` | Renovate windows widened, pinned tools grouped | ok; closes deps-1, deps-4 |
| `f25ca2ffc`, `676f7e318` | double extraction documented; apt float decision 738 | ok |
| `10f5da34f` | `bkit ci pins` checksum gate in CI | ok; caught #834 this run |
| `0309001d3` (2026-11-03) | `dependencies: { "cross-spawn": "7.0.6" }` — first runtime dependency | dependencies-5 |
| `8638b680a` | `openai/codex-action` (SHA-pinned) + `codex-version: "0.165.0"` with a `# renovate:` line | ok; watched |
| `3415f750b` (2026-11-14) | `pnpm.patchedDependencies` `bats@1.13.0` + `patches/bats@1.13.0.patch` | R5 (no Renovate fence) |
| `0b0a53041`, `20b00c4bd`, `7cc81ccce`, `36f0d55bb`, `7d63b8d15`, others | workflow and script renames, `bkit` config keys in `package.json` | no dependency change |

**(b) Senior pass**

- The bot pushes to 4 PRs daily, every push is red by design (copy parity), and none can land without a human. 27 `bkit-ci` + 27 `bkit-trivy` runs bought no merge this window. dependencies-3 and dependencies-2 together are the cost; either fix alone halves it.
- Renovate's runner is 63 minor releases behind (44.176.2 vs 44.239.1). #834 offers 44.221.6, still short of the release that adds `minimumReleaseAgePackageManagerSync`, and it cannot land until its mirror and checksums are fixed. The fix for dependencies-6 therefore waits on dependencies-2.
- The vite advisory GHSA-p4f5-76q4-ffq7 is the second vendor-only vite advisory in two runs (GHSA-8g5g lagged 8 days). Every automated gate in this repo reads the global database, so vendor-only advisories need a person.
- The Renovate run log echoes a `##[error]Can't store NODE_OPTIONS …` annotation from the comment at `bkit-ci.yml:336-339`; it is log noise for `bkit-audit-annotations`, not a dependency issue.
- #832's latest red is an Ubuntu mirror DNS failure on `apt-get install zsh` (class A). The apt float is accepted (decision 738), but the same lines also make CI depend on `security.ubuntu.com` being reachable.
- `docs/failures.jsonl` since `5bb26e7c`: 260 new lines (`git diff 5bb26e7c bcd1b8fc3 -- docs/failures.jsonl`). A `jq` filter on `renovate|lockfile|pnpm-lock|advisor|vite|cross-spawn|dependabot|supply` matches 18 keys: the previous run's 5 `audit-dependencies-*` rows (all `CLOSED`) and 13 test, gate and rebase rows that match the words only incidentally (e.g. `vitest`); none is a dependency incident. No `bkit-audit-logs` report exists for 2026-10 or 2026-11 (`ls docs/audits/202610/ docs/audits/202611/`).
- After `baseSha`, `e2fef117a` "fix(617-renovate-example-hardening): stop Renovate and Dependabot rebasing open PRs by themselves" landed on `dev`; it was not audited (`Not Checked`) and may overlap R2.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Record a decision to keep `cross-spawn` 7.0.6 with a review date, or replace it | dependencies-5 | MEDIUM | /bkit-design | Keep or replace is an open trade-off for bkit's only runtime dependency |
| 2 | Set `updateNotScheduled: false` in `.github/renovate.json5` and its `.bkit/templates/` copy | dependencies-3 | MEDIUM | /bkit-build | The change is one setting in two files, quoted from the Renovate docs |
| 3 | Land vite 6.4.6 once it clears the release age on 2026-11-16, and track GHSA-p4f5-76q4-ffq7 until the global database carries it | dependencies-4 | MEDIUM | /bkit-build | The fixed version and its eligible date are known |
| 4 | Mirror Renovate's root-copy edits into the `.bkit/templates/` twins automatically, or keep templated files out of the automerge group | dependencies-2 | MEDIUM | /bkit-design | Two approaches (`postUpgradeTasks` or a regrouping) are open |
| 5 | Make the tracker test "reserves new comment opportunity within total delivery budget" pass in the full unit run | dependencies-1 | MEDIUM | /bkit-debug | The test fails under load and passes alone, and the cause is not known |
| 6 | Make updates with no release timestamp (lockfile maintenance, image digests, the ghcr Trivy tag) clear the release-age check | dependencies-6, dependencies-7 | LOW | /bkit-debug | The cause at the runner's Renovate 44.176.2 is not confirmed |

### Process Improvements

**Universal** (proposed template step changes; the template above `<!-- bkit:end -->` is untouched):

- Step 7 — Classify: reproduce each red on the PR merged onto `baseSha` (`git merge --no-edit`), not only on the PR branch, so a red that a rebase would clear is not called class C; and match each bot-PR red against the integration branch's CI at the PR's merge base, so a red already on that branch is called B, not C.
- Step 6 — Volume: count the CI runs on bot branches that fall outside the `schedule` window (`updateNotScheduled`), not only the PRs opened, because daily branch updates cost CI with no new PR.
- Step 13 (b) — Second source: when the local scanner cannot run (no container daemon), name a no-install fallback such as the OSV `querybatch` API over the lockfile's package keys, with a known-hit check.
- New step (copy parity, seen on 3 runs in a row): for a repo whose updater ignores a template tree, list every bot PR that edits a file with a template twin, and the twin edit it lacks, before classifying.

**Project** (applied below `<!-- bkit:end -->` in `docs/templates/bkit-audit-dependencies.md`):

- `Permissions`: added the built-in safety-check block on zsh nested parameter expansion, and the workaround.
- `Classify`: merge onto `baseSha` instead of switching to the branch; compare reds with `dev` CI at the merge base.
- `Batch`: `LOCAL_STACK_LOCK_WAIT_S=2400` for the gate when other agents hold the machine tests lock.
- `Verification`: replaced the wrong "no `dependencies`" line with the `cross-spawn` single-version check.
- `Unseen`: added `moxystudio/node-cross-spawn` to the vendor-advisory repos, `codex-version` to the off-manifest list, the OSV `querybatch` fallback, and the Docker daemon prerequisite for Trivy.
- `Inventory`: CI volume counted from the last Monday window.

### 🔒 Gate 3: Report Check

- [x] **No placeholders:** no `PENDING` is left.
- [x] **Summary:** `Summary` gives the count per severity.
- [x] **Batch verdict:** `Summary` gives the batch verdict.
- [x] **Counts:** `Summary` gives the open, in-batch and excluded counts.
- [x] **Series:** the report shows security-fix latency and end-of-life days beside the previous report's numbers, or marks the run as baseline.
- [x] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [x] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [x] **Process Improvements:** `Universal` and `Project` are both filled.
- [x] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [x] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [x] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->
