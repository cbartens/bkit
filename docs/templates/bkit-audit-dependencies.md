<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

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

- Dependency-bot best-practice and security presets (e.g. Renovate `config:best-practices`, and the presets it extends: `security:minimumReleaseAgeNpm`, `helpers:pinGitHubActionDigests`, `docker:pinDigests`, `abandonments:recommended`, `:configMigration`). Record the bot version.
- Package-manager supply-chain settings (e.g. pnpm `minimumReleaseAge`, `trustPolicy: no-downgrade`, `blockExoticSubdeps`, `allowBuilds`, `strictDepBuilds`).
- Registry provenance and trusted publishing (e.g. npm provenance).
- OpenSSF Scorecard; record version.
- OpenSSF Concise Guide for Evaluating Open Source Software; record revision date.
- Vulnerability scanner and advisory database (e.g. Trivy, OSV-Scanner, GitHub Advisory Database).
- Lockfile-integrity linter (e.g. lockfile-lint). Unreadable format → apply checks by hand.
- Runtime end-of-life catalogue (e.g. endoflife.date); record the date read.
- SPDX License List; record version.
- Install-script supply-chain attacks (e.g. Shai-Hulud, September 2025, and Shai-Hulud 2.0, November 2025).
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
| Tool-server packages (e.g. MCP) | The agent config sweep covers it | `bkit-audit-agents` |
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

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** **If** a call ran and the API refused it (e.g., HTTP 403 from an endpoint that needs another token type, such as GitHub `GET /user/installations`) → it is not a block. Record it in `Not Checked` only, with no allow rule.
- [ ] **Git Host:** Steps 2, 3, 11, 12 — open PRs by head-ref prefix, CI runs and behind-count (e.g., `gh`, GitLab API). Fallback: none. Mark the PR steps `Not Checked`, and set the batch verdict to `FAIL`.
- [ ] **Package Manager:** Steps 5, 8-10 — install, lockfile and registry metadata (e.g., pnpm, npm). Fallback: none. Mark `Batch` and `Verification` `Not Checked`, and set the batch verdict to `FAIL`.
- [ ] **Clean Worktree:** Steps 8-10 — a detached worktree off the audited commit (`bkit:anchor` `baseSha`), removed before the report finishes. **If** the local integration branch is ahead of the remote ref → the landing push carries those commits, so the batch builds on them. Fallback: none. Do not build the batch in the main checkout.
- [ ] **Web:** Steps 13-15 — latest CLI releases, the anchor standards, end-of-life dates and vendor support policy. Fallback: record the versions as unread, and the days left as well.

#### Conditional

- [ ] **Bot Dashboard:** **If** the bot publishes a dashboard → Step 3 — blocked and will-not-rebase entries. Fallback: read the open PRs only, and mark the stopped-rebase set `Not Checked`.
- [ ] **Config Validator:** **If** the bot ships one → Step 3 — e.g., `renovate-config-validator`, on the config as the default branch has it. Run it in the bot's read mode (repository, not global or self-hosted), with the runner's global options the config needs. **If** the mode is wrong **or** a runner option is missing → the validator reports errors the bot never hits. For example, Renovate validates a bare file argument as global config. Repository mode is `--no-global`, or no argument in a scratch checkout of the default-branch files, plus the runner's `allowedEnv` as `RENOVATE_ALLOWED_ENV`. Without that, `allowedEnv` errors are false. An error left in the bot's own mode is a finding, quoted with its command. Never waive it as validator-only. Fallback: read the files, and mark validity `Not Checked`.
- [ ] **Vulnerability Scanner:** **If** the project has a lockfile, an image or a requirements file → Step 13 — e.g., Trivy (`trivy fs --include-dev-deps`), OSV-Scanner, `npm audit`, the host advisory API and vendor repository advisories. Fallback: use one source only, and mark the missing source `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Inventory:** From the previous report, list the deferred PRs and why each was deferred. A deferred major whose blocker has cleared is the first candidate. Select open PRs by the head-ref prefix from the updater config (`branchPrefix`, default `renovate/`; Dependabot uses `dependabot/`), never by title or author. A token-authored PR on the prefix is in scope; record the author as evidence, not as the selector. For each PR, record the number, title, head ref, head SHA, mergeable, merge state, files, labels, commits behind the integration branch, and the latest CI run. Count finished runs only, because an in-progress run is not a result. **Done when:** `Inventory` names the prefix and the config source, and lists every open PR on the prefix, or says `none`.
- [ ] **Step 3 — Bot Health:** A missing dependency updater config is CRITICAL. Examples are Renovate (`.github/renovate.json` or `.github/renovate.json5`; rules example `.bkit/templates/.github/renovate.json5`, self-hosted runner example `.bkit/templates/.github/workflows/bkit-renovate.yml`) and Dependabot (`.github/dependabot.yml`; example `.bkit/templates/.github/dependabot.yml`). See `docs/deployments.md` § Dependency updaters. Two configs is a finding; keep one. Only read the bot dashboard, because the bot rewrites it. Record blocked entries and will-not-auto-rebase notices, because those PRs stay stale until a person acts. The bot reads presets from the default branch, not from the integration branch. A fence or group on the integration branch is inactive until a release carries it. Base-config edits on the integration branch apply only **if** the bot merges base-branch config, and it reads that option from the default branch. **If** a PR proposes what the integration config blocks → read the default-branch copy before debugging the rule. When the branches differ, that promotion lag is a signal. Validate the configs as the default branch has them, in the bot's repository mode (Pre-Flight). An error left there is a finding. Read the dashboard and logs for config errors, PRs held by concurrency or hourly limits, PRs awaiting approval, and open config-migration PRs. A broken config looks like a quiet week. **Done when:** `Bot Health` holds the blocked PRs, the branch the config is read from, the validator result, and the held and awaiting-approval items.
- [ ] **Step 4 — Supply Chain:** Read the settings as the default branch has them. Record each one against the bot's best-practice preset and the package manager's supply-chain page. For the bot, check: a minimum release age of at least three days (e.g., Renovate `minimumReleaseAge` / `security:minimumReleaseAgeNpm` with `internalChecksFilter: "strict"`, or Dependabot `cooldown`); actions and images pinned by digest; abandonment flagging (e.g., the Renovate abandonments preset); and config-migration PRs enabled, where the bot offers them. For the package manager, where it offers them (e.g., pnpm), check: trust policy no-downgrade, exotic subdependencies blocked, an explicit install-script allowlist, and strict dependency builds. **If** it offers none → write `N/A` with evidence. A release age of 0 on the package manager is a recorded trade-off where the docs say so. Record it, and leave re-deciding it to a person (`DECISION`). The gap is that the bot's release age does not apply to lockfile-maintenance PRs, because the package manager makes those changes. With the package-manager gate off, those PRs reach the batch with no cooldown. `Cooldown` checks what stands in for one, and `Screen` takes them first. **If** a setting is missing **or** weaker than the standard → add a `Recommendations` row with the line to add. **Done when:** `Supply Chain` has a row per setting: value · standard · verdict.
- [ ] **Step 5 — Cooldown:** **If** the package-manager cooldown is off or absent:
  - Lockfile-maintenance PRs must not automerge, and must wait the same age as other updates before they land.
  - **If** the bot opens no lockfile-maintenance PRs (e.g., Dependabot) → the two checks below are `N/A`.
  - Check that the lockfile-maintenance block and its matching rules do not automerge.
  - Check that each lockfile-maintenance PR merged since the previous run waited at least the bot's release age (e.g., Renovate `minimumReleaseAge`), measured from the newest version's publish to the merge. **If** an open one is younger → it is EXCLUDED, with its eligible date.

  For automerge groups that rewrite the lockfile, the bot's release-age check ages the named packages only. Compare the newest transitive version in the PR's lockfile diff with the bot's release age. **If** it is younger → it is EXCLUDED, with its eligible date. Automerge with the package-manager cooldown off is a finding. Apply the same wait to other open non-security PRs. **If** the release-age check is pending (e.g., `renovate/stability-days`) **or** the newest version is younger than the bot's release age → it is EXCLUDED, with its eligible date. Security PRs bypass this wait (Step 13). A lockfile-maintenance PR that automerged or landed before its release age is a finding.

  **Done when:** `Cooldown` holds the automerge setting, each merged PR's wait, and each open PR's eligible date.

- [ ] **Step 6 — Volume:** Each bot PR is a lockfile rewrite, a preview and a CI run, and each rebase is another CI run. Read the settings on the default branch, and record what each one would change. The lines to add go in the project-owned bot config. Grouping: check that related packages go in one PR (`group:monorepos`, `group:allNonMajor`, or an equivalent). List the solo PRs that should be grouped, and the rule that would catch them. Schedule: check that the bot opens PRs in one window. Note the non-security PRs opened outside it, and why. Limits: concurrent, hourly and branch-concurrent. Record the PRs held back. Rebase policy: check that the bot rebases only on conflict, which avoids a CI run on every integration move. **If** it is unset → record the default, and count the rebase pushes since the previous run. The lockfile PR conflicts with most dependency merges, so check that lockfile maintenance runs on its own schedule, not on every bot run. Automerge: check that low-risk groups that pass CI use platform automerge. Check that lockfile maintenance does not automerge while `Cooldown` is off. Check that majors wait for dashboard approval. **If** that is unset → a major opens a PR and runs CI before anyone decides. Scan scope: read the bot's detected-file list (e.g., the Renovate dashboard) for archived evidence, fixtures and test trees. A repo-level ignore list replaces the preset defaults (e.g., Renovate `ignorePaths` drops `:ignoreModulesAndTests`), so list those paths and the PRs that touch only them. **If** a setting would cut PRs or CI runs → add a `Recommendations` row with the line and the PRs it saves this run. **Done when:** `Volume` has a row per setting: value · what it would change · PRs saved.
- [ ] **Step 7 — Classify:** Classify every PR that is not green. Quote the evidence line from the log. When nothing matches, the class is C.
  - **A — infrastructure:** preview-deploy wait timeout, registry fetch failure, a cold service refusing, a cancelled runner. Confirm: the same job passed on a neighbouring run or a retry of the same commit.
  - **B — stale:** outdated lockfile, lockfile config mismatch, a merge conflict, merge state dirty, behind the integration branch. Confirm: behind-count. Being behind says nothing about the dependency itself.
  - **C — real:** the failure survives a clean rebase onto the integration branch. Confirm: reproduce it on the batch worktree before Step 10, calling the test binary directly (e.g., `node_modules/.bin/vitest`). **If** a PR bumps the package-manager pin (e.g., `packageManager`) → a wrapper exec (e.g., `pnpm exec`) fetches that version and installs, which dirties the worktree. Only C keeps a PR out of the batch.
    - **C, copy parity:** a test requires two copies of a file to stay identical, and the bot updates only the copy it scans, because the other copy is on an ignored path. It fails by design, and the fix is to mirror the change into the other copy. Count recurrences in Step 16.

  The batch is the green, A and B PRs that are past the bot's release age. A class C PR is EXCLUDED and goes in `Excluded`. A breaking major is DECISION, even when it would be IN BATCH. A non-security PR inside the release age is EXCLUDED, even when it would be IN BATCH (Step 5). **Done when:** `Classes` has a row per non-green PR: class · behind-count · quoted evidence · verdict.

- [ ] **Step 8 — Batch:** Make a detached worktree off the audited commit (`bkit:anchor` `baseSha`), not the remote integration ref. **If** the local branch is ahead → the landing push carries those commits, so the batch builds on them. Do not create a new branch. Merge each IN BATCH PR (`git merge --no-edit`), and do not push. On a lockfile conflict, never resolve it as text. Take the integration copy and regenerate it (`git checkout <integration> -- <lockfile>`, then `git merge --continue`, in the worktree only). On a manifest conflict between two batch PRs: **If** the higher version is not a breaking major → it wins, so drop the lower PR and record `replaced by #N`. **Else** → the major is DECISION and stays out, so keep the lower line and record that the major was not taken. On a manifest conflict with the integration branch rather than another PR, take the higher version line by line. On any other conflict, abort the merge, drop the PR, and record why. Record the merged commit, then install. For lockfile-only PRs, refresh exactly the named packages. Watch for three traps. Trap (1): an install rewrites manifests and the lockfile (e.g., the pnpm catalog or the root `package.json`), and the uncommitted edits fail frozen CI while passing locally. Trap (2): a recursive update rewrites ranges the bot never proposed, in a big diff, so refresh the named packages only. Trap (3): a partial refresh leaves split versions across the workspace. **If** typecheck or build is red → check a clean integration worktree first. The fix is one version everywhere, including the shared version catalog (e.g., the pnpm catalog). Drift check: every manifest is byte-identical to the merged commit. Quote the diff command, its exit code and its output. Do not commit to the integration branch, and never add a skip-CI marker. Lockfile sources: every entry has an integrity hash, and every tarball comes from the configured registry over HTTPS. Both searches should come back empty; quote any hits and the package that pulls them in. **Done when:** `Batch` holds the worktree commit, the PRs in and out with why, the drift check, and both source searches.
- [ ] **Step 9 — Screen:** Compare the batch lockfile diff with the integration branch, and list: new packages, transitive ones included; new install scripts and allowlist prompts; versions published less than the bot's release age before the run, with lockfile-maintenance PRs first; a publisher change or weaker provenance, which the trust policy refuses when it is set; names one edit away from a popular package; and the OpenSSF Scorecard score for each new package's source repo (e.g., via deps.dev). Write `no score` when there is no linked repo or it is unscored; that is not a finding by itself. Worms spread through `postinstall`, so read every new script. A package still inside its release age is a `Cooldown` miss: drop the PR and rebuild the batch. Other hits leave the verdict unchanged, and get a `Recommendations` row with evidence for the approver. **Done when:** `Screen` lists each hit, or says `none`, and gives a Scorecard score or `no score` for each new package.
- [ ] **Step 10 — Verify:** First confirm `git status --porcelain` is empty, because trap (1) shows up as a dirty tree. Run a frozen install, then the static, unit and integration gate, then local E2E for each app. A store build or a deployed environment tests none of the batch, so use the local-build substrate. Go beyond a green typecheck: run the framework's dependency doctor, where the framework ships one (e.g., `expo-doctor`), because packages outside the SDK's range compile and typecheck, then break the native app. Run a single-version check for the runtime packages named in `Project Instructions`. Two versions is trap (3): report it, and the fix is one version everywhere. A red can come from a stale install. Clear the installed dependencies (e.g., `node_modules`, `.venv`, `target/`), run a frozen install, and re-run before blaming the bump. Reproduce each red on the audited commit without the batch, in a clean worktree off `baseSha`. A red there is a baseline red: it goes in `Verification` as a finding, reported apart from the batch, and it is not a batch FAIL. Judge the batch on the remaining reds. **If** a red remains → drop the suspect PR, rebuild the batch, and re-run. **If** no single PR explains it → the batch is FAIL. **Done when:** `Verification` quotes every command and exit code, and each baseline red, and `Summary` has PASS, CONCERNS or FAIL.
- [ ] **Step 11 — Plan:** The report asks and stops. It does not push, merge, close or label. **If** the integration branch takes direct pushes → the batch lands without a feature-branch PR. **If** the deployed-boundary checks run on push only → the landing push is where the batch first meets external services. Never merge bot PRs one by one. N merges in sequence cost N integration runs, plus a rebase on every open PR after each one. N PRs in one push cost one integration run. The `Plan` table has the columns `Wave`, `PRs`, `Commits`, `Why together, or why apart`, `Pushes` and `CI runs`. Follow these rules. (1) Default to one wave, with every IN BATCH PR in one push. Make a series of commits, not a squash: the non-major groups first, then one commit per major, each with an install that matches its manifests. Each commit is a point to revert or bisect to. CI runs once on the push head, so `Verify` covers the head, and the earlier commits get a frozen install and a typecheck. (2) Add a second wave only for a named reason; being able to bisect is not enough. The reason is a production watch before the next land, e.g., for an SDK, framework or native major, a store build or submission, or a DB-client major. An extra wave costs another push, another integration run and a rebase on every open PR, so put that cost in the row. (3) Order security first, then non-majors, then majors. Within the majors, put a dependency before its dependents, e.g., the language before the linter, and a UI library together with its types. (4) Put an unmerged automerge group in the batch. Letting it merge itself first costs a separate push plus rebases, so fold it in, and close it at the push. **If** it merged before the landing → rebase the batch and drop it from the plan. (5) Close the carried PRs right after the push, with an `Excluded` comment pointing at the landing commit. The bot only closes them on its next run, and until then it may rebase them and run CI. (6) Land after the bot's weekly window, with no opens or rebases mid-landing, and no integration push queued. (7) List the excluded and deferred PRs the landing will rebase, with the CI cost. A PR excluded over several cycles is rebased on every later push, so recommend closing it and using the dashboard when it is wanted. (8) Never add skip-CI on a dependency change, so the required checks test the batch. Then give the landing commands in order: the push, closing the PRs with comments, and the labels for the PRs left open. Give the cost of landing one by one against the batch, plus the CI already spent on the branch PRs. For the post-land watch, name the error-tracker release and the error-rate and crash-free thresholds for reverting commit by commit. Do not invent thresholds. **Done when:** `Plan` holds the table, the commands, both costs, and the watch.
- [ ] **Step 12 — Excluded:** The report lists only. It does not label, comment or close. Class C and blocked PRs stay open. The report supplies the comment text (what broke and the fix) and the labels (deferred, plus the major label on a major). Comments start with the marker in `Project Instructions`, so the next step finds the marker and edits the existing comment. A PR the batch carries is closed after the landing, with a pointer to the batch. A breaking major or migration is DECISION and goes in `Recommendations`. **If** it is real work → name the issue to open. DECISION evidence is more than the bare PR: the migration guide, the breaking changes checked against the codebase with hit counts, codemods, the peer-dependency matrix, and the rollback path. **Done when:** `Excluded` has a row per out-of-batch PR: verdict · labels · comment text or DECISION evidence.
- [ ] **Step 13 — Unseen:** Check the surfaces the bot cannot see. (a) New advisories against the committed baseline. The delta script reports advisories not in the baseline, and stale baseline entries. **If** the batch fixes one → remove its baseline entry in the same commit. Security PRs bypass the release age, so confirm they are landing, not queued. `bkit-audit-security` asks the same question, so do not report it twice. (b) A second vulnerability source. Run the scanner over the lockfile, the language requirements files and the shipped images. Read the host's alerts, and the vendor repository advisories for each shipped framework (e.g., `gh api repos/<owner>/<repo>/security-advisories`). Global databases (e.g., `gh api advisories/<id>`, OSV) can lag vendor advisories by days. A vendor advisory missing from the global database is a finding, because the scanners and the CI gate are blind to it. **If** it is already there → count it once, with no lag finding. **If** there are no vendor advisories **or** no host API → use the global source only, and mark the other `Not Checked` with the reason. Some lockfile scanners read only the first document and come back empty without failing, so confirm the full file was read. Classify each advisory as shipped, server-only or dev-only, and say whether the vulnerable function is reachable. An advisory goes to `bkit-audit-security`. (c) Fix latency for shipped dependencies, from publication to landing on the integration branch: CRITICAL within 7 days, HIGH within 30 days. A breach is a finding, listed first. For each open `CRITICAL` or `HIGH`, the earliest date the bot can open a PR is the fixed version's publish date, plus the bot's release age (none for a security update, per (a)), plus the next bot run. Compare it with the deadline. A bot date past the deadline is a finding before the breach happens. **If** the bot is blind to the advisory (vendor-only) → there is no date, and the advisory itself is a finding. (d) A container that installs from a manifest the bot bumps is covered. A second install line that bypasses the manifest is a gap; report it. (e) Unused dependencies go to `bkit-audit-dead-code`. New dependencies since the last pass that are unmaintained (no release for over a year, or archived) go in `Recommendations`. (f) Deprecated and abandoned packages across the whole tree, from the dashboard's abandoned list and frozen-install warnings. (g) Licences for new dependencies since the last pass. A copyleft licence (GPL, AGPL) or a missing licence on a shipped dependency goes in `Recommendations`. Diff the production tree's licences against the previous run, including BSL, SSPL and commercial upgrades. Check that the shipped app's notices are regenerated when a dependency changes. For bundled fonts, icons and images, check the licence and the terms for shipping them. (h) Off-manifest CLIs, because the bot reads manifests only. Sources: CI `run:` lines (global installs, `npx` / `pnpm dlx`, `curl | sh`, system packages), setup-action version inputs (e.g., `supabase/setup-cli` `version:`), build-service CLI pins (e.g., `eas.json` `cli.version`), Dockerfiles, build images, version files (e.g., `.tool-versions`), repo scripts, and setup docs that install globally. For each CLI, record: location · pin, or `floating` (unpinned, `latest`, or an open range) · latest release, read live · majors behind · bot-watched (a manifest entry or a bot rule, e.g., Renovate `customManagers`) yes / no. A floating CLI in CI or a build image is a finding, because each run gets an unreviewed version that bypasses the release age. A major behind is a finding, and end of life goes to Step 14. An unwatched CLI gets a `Recommendations` row: move it into a manifest, or add a bot rule. **Done when:** `Unseen` holds the advisories, the vendor-advisory gaps, the latency and the earliest bot dates, the container install path, the deprecated packages, the licence diffs, and a row per off-manifest CLI.
- [ ] **Step 14 — End of Life:** Compare the versions in use with the end-of-life catalogue and each vendor's support policy. Record the days left for the runtime, the framework, the native SDK, the package manager, the language, the database major, and the container base images the project ships (sources in `Project Instructions`). An end of life inside 90 days is DECISION, and the report names the issue to open. **Done when:** `End of Life` has a row per runtime: version · days left · verdict.
- [ ] **Step 15 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per bot preset, package-manager supply-chain setting, and Concise Guide rule, marked checked (with the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 16 — Anything Else:** (a) List the dependency-touching changes since the previous report's commit (manifests, the workspace file, bot configs, workflow `uses:`, Dockerfiles, requirements, runtime-version files, the build image and the hosting runtime), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior supply-chain engineer would flag that no step asks about. Read what happened since the previous run: incidents, new `docs/failures.jsonl` rows, `bkit-audit-logs` reports and vendor status. Note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Batch local:** the drift check is quoted with its exit code.
- [ ] **No push:** nothing was pushed.
- [ ] **Worktree removed:** the throwaway worktree is removed.
- [ ] **Integration unchanged:** the integration branch is unchanged.
- [ ] **No landing:** no PR was merged, labelled, closed or commented on.
- [ ] **Gate 2 — Verified:** every item above holds.

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
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Inventory

PENDING

### Bot Health

PENDING

### Supply Chain

PENDING

### Cooldown

PENDING

### Volume

PENDING

### Classes

PENDING

### Batch

PENDING

### Screen

PENDING

### Verification

PENDING

### Plan

PENDING

### Excluded

PENDING

### Unseen

PENDING

### End of Life

PENDING

### Recommendations

PENDING

### Checked

PENDING

### Not Checked

PENDING

### Standards Coverage

PENDING

### Beyond the Steps

PENDING

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the batch verdict, and the open, in-batch and excluded counts.
- [ ] **Series:** the report shows security-fix latency and end-of-life days beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions

Doctrine: `docs/deployments.md` § Dependency updaters, § Renovate — fencing bkit's own footprint, § GitHub Actions pinning. Runtime-dependency rule: `docs/technology.md` § Build & Output.

### Pre-Flight / Dependencies

- Git host: `gh` against `cbartens/bkit`. Package manager: pnpm through Corepack from `package.json` `packageManager`.
- Vulnerability sources: `node scripts/ci/bkit-check-dependency-audit.mjs` (baseline `scripts/ci/bkit-accepted-advisories.json`); `pnpm audit --json`; `gh api repos/cbartens/bkit/dependabot/alerts --paginate`; Trivy `fs` via docker with dev deps included, image + digest from `.github/workflows/bkit-trivy.yml`, on a dir holding only a `pnpm-lock.yaml` copy. CI Trivy skips `pnpm-lock.yaml` while `scripts/ci/bkit-check-dependency-audit.mjs` exists, so the local Trivy run is the second lockfile source.
- Not installed: OSV-Scanner, lockfile-lint → `Batch` greps stand in.

### Permissions

- `gh api user/installations` → 403 with a PAT (endpoint needs a GitHub App user token); no allow rule clears it. Mend App state → repo Settings → Integrations → GitHub Apps, by hand.

### Bot Health

- Renovate, self-hosted: `.github/workflows/bkit-renovate.yml`. Dependency Dashboard = issue #328 (`gh issue view 328`). Logs: `gh run list --workflow bkit-renovate.yml --limit 5`, then `gh run view <id> --log`.
- Config read: `main` + `dev` layered (`useBaseBranchConfig: "merge"`); lag check `git diff origin/main <baseSha> -- .github/renovate.json5`.
- Validator: `git show origin/main:.github/renovate.json5 > <scratch>/repo/.github/renovate.json5`; `npm install --no-save --ignore-scripts --prefix <scratch>/rv renovate@<runner version>` (runner version = `renovate-version` in `bkit-renovate.yml`); then from `<scratch>/repo`: `RENOVATE_ALLOWED_ENV='PNPM_*' node <scratch>/rv/node_modules/renovate/dist/config-validator.js --strict`. `npx --yes --package renovate@<v> -- renovate-config-validator` exits 127 ("command not found"). A bare file path validates as global config and reports false `allowedEnv` errors.
- Bot PRs are authored by the PAT owner, not `app/renovate`; select by head-ref prefix only.
- Schedule vs wake: `gh run list --workflow bkit-renovate.yml --limit 40 --json createdAt,event` → compare start times (UTC) with `schedule` and `lockFileMaintenance.schedule` in `.github/renovate.json5`.
- Detected-file list on dashboard #328: a regex-managed file listed twice = double extraction; the run log's `"regex": {"fileCount": …}` line confirms.

### Inventory

- `gh pr list --state open --limit 100 --json number,title,headRefName,headRefOid,mergeable,mergeStateStatus,labels,author,files`, filter `headRefName` on `renovate/`. Behind-count: `git rev-list --count <headSha>..<baseSha>`. CI: `gh pr checks <n>`.
- CI volume on bot branches: `gh run list --workflow bkit-ci.yml --created '>=<date>' --limit 500 --json headBranch`, filter on `renovate/`.

### Classify

- Root copies of templates (`.github/workflows/bkit-*.yml`, `.cursor/Dockerfile`, `scripts/graphify/bkit-graphify.sh`) must stay byte-identical to `.bkit/templates/` twins, which sit in `ignorePaths`. A bot PR changing only the root copy fails `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` and `.bkit/core/engine/audits/templates/template-action-pins.test.ts` → class C, fix = mirror into the template copy. `.bkit/core/engine/install/cloud-env.test.ts` fails when a version + sha256 pin shared by `.bkit/shared/.claude/bkit-cloud.md` and the Cursor Dockerfile template differ.
- Repro: clean worktree off `<baseSha>`, `git switch --detach origin/renovate/<branch>`, then `node_modules/.bin/vitest run <the three files>` (not `pnpm exec`: a `packageManager` bump makes Corepack fetch and dirty the tree).
- Checksum repro for any PR bumping a `*_VERSION` paired with a `*_SHA256` (green CI is not evidence; jq is in the cloud setup only, which CI never runs): `gh release view <tag> -R <owner>/<repo> --json assets --jq '.assets[] | select(.name=="<asset>") | .digest'` vs the PR's hash; Node → `https://nodejs.org/dist/v<v>/SHASUMS256.txt` (linux-x64 tarball).

### Batch

- Worktrees under `tmp/` (gitignored): `git worktree add --detach tmp/<name> <baseSha>`; rebuild = `git worktree remove --force tmp/<name>` + re-add.
- Lockfile checks: `grep -c "resolution: {"` must equal `grep -c "resolution: {integrity: sha512-"`; `grep -nE "tarball:|git\+|codeload\.github|github:|https?://" pnpm-lock.yaml | grep -v registry.npmjs.org` must be empty. No `.npmrc` → default npm registry.
- Screen: package keys = entries under `packages:` up to `snapshots:` in `pnpm-lock.yaml`; `comm` base vs batch; publish times `npm view <name> time --json`.

### Verification

- `git status --porcelain` → `pnpm install --frozen-lockfile` → `pnpm bkit:gate:install-static-unit-build` → `git status --porcelain` → `pnpm bkit check`.
- Under high load average the unit tier can time out (`test-timeout-budget` line prints the load) or the gate can be killed (exit 143). Re-run the failing file alone: `node_modules/.bin/vitest run -c vitest.unit.config.ts <file>`; then `pnpm bkit:test:bats` and `pnpm build` separately; match the timeout against open `docs/failures.jsonl` rows before calling it a batch red.
- Override check: after the batch install, every `pnpm.overrides` entry in `package.json` that shadows an exact devDependency pin → `grep -n -A3 '^  <pkg>:' pnpm-lock.yaml` under `importers` shows `specifier` and `version`; a `version` below the manifest pin = override wins.
- The frozen install runs husky `prepare`; after removing the worktree confirm `git config core.hooksPath` in the main checkout still prints `.husky/_`.
- No framework doctor; no single-version runtime packages (no `dependencies`).

### Unseen

- Off-manifest CLI surfaces, root copy + `.bkit/templates/` twin each: `.github/workflows/bkit-ci.yml` (Vale `VALE_VERSION`, actionlint script, `setup-uv` `version:`, apt `zsh`), `bkit-cloud.yml` (Vale, `@opencode/cli`), `bkit-trivy.yml` (`docker://` Trivy + digest), `bkit-renovate.yml` (`renovate-version`), `scripts/graphify/bkit-graphify.sh` (`GRAPHIFY_SPEC`), `.cursor/Dockerfile` (`FROM` digest, `ARG NODE_VERSION` / `GH_VERSION` / `VALE_VERSION` + `*_SHA256`, `ARG PNPM_VERSION` via Corepack, apt lines, commented supabase example). bats = devDependency. Cloud setup source `.bkit/shared/.claude/bkit-cloud.md` (Node, Vale, gh, jq + sha256), rendered to gitignored `.claude/bkit-cloud.md` (read the render for derived pins).
- apt lines: `git grep -nE 'apt-get install' HEAD -- .cursor .github .bkit/templates .bkit/shared`.
- Latest releases: `gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name + " " + .published_at'`; npm `npm view <pkg> version time --json`; PyPI `curl -s https://pypi.org/pypi/<pkg>/json`; Node `https://nodejs.org/dist/index.json`.
- Vendor advisories: `gh api repos/<owner>/<repo>/security-advisories` for `pnpm/pnpm`, `vitejs/vite`, `vitest-dev/vitest`, `nodejs/node`, `cli/cli`. Global lookup per id: `gh api advisories/<GHSA>` and `curl -s https://api.osv.dev/v1/vulns/<GHSA>` (404 = not carried). Known-hit check: any GHSA that resolves in both.
- Scorecard per new package: `curl -s https://api.deps.dev/v3/projects/github.com%2F<owner>%2F<repo>` → `scorecard.overallScore` (absent = `no score`). Adoption: `curl -s https://api.npmjs.org/downloads/point/last-week/<pkg>`.
- serena-agent in the cloud setup = tool server → `bkit-audit-agents`.
- Deprecation: `npm view <name>@<version> deprecated` over every `packages:` key. Licences: `pnpm licenses list --json` and `--prod` inside an installed worktree.
- No prior report → "since last pass" base = last `chore(deps)` batch commit (`git log --grep 'chore(deps)' -1`).

### End of Life

- Sources: endoflife.date `nodejs`, `pnpm`, `ubuntu`; Vite → vite.dev/releases. Pins: `.nvmrc`, `package.json` `engines` + `packageManager`, `.cursor/Dockerfile` `FROM` + `ARG NODE_VERSION`, `.bkit/shared/.claude/bkit-cloud.md` `NODE_VERSION`. vite and pnpm majors are held by the bkit-only rules at the end of `.github/renovate.json5`, so no bot PR signals their end of life.

### Excluded

- Comment marker: `<!-- bkit:dependency-triage -->`. Labels: `deferred`; majors also `dep-major`.
