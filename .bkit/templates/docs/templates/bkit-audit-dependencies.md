<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Dependency Triage

> [!CAUTION]
> **Purpose:** Sort open dependency-update PRs into one verified batch, and judge supply-chain settings, advisories, licences, and end of life.
>
> **Rules:**
>
> - Read-only audit; NEVER edit code, config, or data.
> - `Universal Instructions` apply to ALL projects; `Project Instructions` apply ONLY to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document ONCE at session start; do NOT trust session memory; do NOT re-read on every loop iteration.
> - NEVER push, merge, label, close, or comment on a PR. NEVER commit onto the integration branch. The throwaway worktree is evidence; remove it before the report finishes.
> - NEVER resolve a lockfile conflict as text, and NEVER with `-X ours` / `-X theirs`. NEVER run a recursive update that rewrites ranges the PRs did not name.
> - A breaking major or a migration stays out of the batch even when green. This run records the plan; landing it is the next step.

## Universal Instructions

### Context & Goals

Every dependency PR rewrites the lockfile. Left alone, the PRs go stale against each other, the bot stops rebasing some of them, and each one merged separately costs a full CI run. Batching is the cheap path. Batching by hand breaks CI in known ways: the install rewrites a manifest the commit did not include, a recursive update rewrites ranges the bot never proposed, a partial refresh leaves two copies of one tool. Deciding a breaking major needs a person. A batch must not carry one through. Target failure: **a batch that quietly carries a breaking major, or a lockfile that does not match its manifests**.

**Applies when:** a dependency bot opens update PRs, or the repo has manifests and a lockfile. None → one `N/A` row with evidence, never "clean".

**Cadence:** weekly, after the bot's open window. Extra pass when a security PR opens outside that window, when bot config changes on the default branch, or when `bkit-audit-app-store` reports a deadline that forces an SDK or target-API upgrade.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Dependency-bot best-practice and security presets (e.g. Renovate `config:best-practices`, and the presets it extends: `security:minimumReleaseAgeNpm`, `helpers:pinGitHubActionDigests`, `docker:pinDigests`, `abandonments:recommended`, `:configMigration`). Record the bot version.
- Package-manager supply-chain settings (e.g. pnpm `minimumReleaseAge`, `trustPolicy: no-downgrade`, `blockExoticSubdeps`, `allowBuilds`, `strictDepBuilds`).
- Registry provenance and trusted publishing (e.g. npm provenance).
- OpenSSF Scorecard; record version.
- OpenSSF Concise Guide for Evaluating Open Source Software; record revision date.
- Vulnerability scanner and advisory database (e.g. OSV-Scanner, GitHub Advisory Database).
- Lockfile-integrity linter (e.g. lockfile-lint). Where it cannot read the lockfile format, apply its checks by hand.
- Runtime end-of-life catalogue (e.g. endoflife.date); record the date read.
- SPDX License List; record version.
- Install-script supply-chain attacks (e.g. Shai-Hulud, September 2025, and Shai-Hulud 2.0, November 2025).

### Scope

- No dependency updater config is a CRITICAL finding. Examples: Renovate (`.github/renovate.json` or `.github/renovate.json5`) or Dependabot (`.github/dependabot.yml`). Copy one example and own it.
- Open dependency PRs: classify, batch, verify, and plan the landing.
- Bot config against best-practice and supply-chain settings, including which branch the bot actually reads.
- Lockfile-maintenance cooldown while the package-manager release-age gate is off.
- Settings that multiply PRs and CI runs.
- Supply-chain screen of the batch diff.
- Advisories the bot does not see, fix latency, unmaintained, and deprecated packages, licences.
- Runtime and framework end of life.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Store submission deadlines | Store sweep | `bkit-audit-app-store` |
| Dependencies nothing uses | Dead-code sweep | `bkit-audit-dead-code` |
| Whether a vulnerable function is reachable, beyond naming the call | Security sweep | `bkit-audit-security` |
| Landing the batch, or labelling, closing, or commenting on PRs | Audit reports only | Plan from this report |

### Verdicts

One per PR. Class (A, B, or C) is the evidence; these are the outcomes. DECISION wins over IN BATCH: a breaking major stays out even when green. A non-security PR still inside the bot's release age is EXCLUDED even when green.

- **IN BATCH:** green, or class A or B, and past the bot's release age. Goes in this run's batch.
- **EXCLUDED:** class C, dropped while the batch was built, or still inside the bot's release age. The report names the labels and the comment text. This run does not apply them.
- **DECISION:** a breaking major, a migration, or end of life inside 90 days. Listed for a person. Not a batch item.
- **OTHER:** fits none. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

Batch verdict, in `Summary`, not per PR. The landing push's CI is the next step's result, not this run's.

- **PASS:** drift check and every local verification command exited 0.
- **CONCERNS:** a PR was dropped during bisection.
- **FAIL:** drift, or a red no single PR explains.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Git Host:** Steps 2, 3, 11, 12 — open PRs by head-ref prefix, CI runs, behind-count, e.g. `gh`, GitLab API. Fallback: none; PR steps `Not Checked`, batch verdict `FAIL`.
- [ ] **Package Manager:** Steps 5, 8–10 — install, lockfile, registry metadata, e.g. pnpm, npm. Fallback: none; `Batch` and `Verification` `Not Checked`, batch verdict `FAIL`.
- [ ] **Clean Worktree:** Steps 8–10 — detached worktree off the integration branch, removed before the report finishes. Fallback: none; do not build the batch in the main checkout.
- [ ] **Web:** Steps 14, 15 — anchor standards, end-of-life dates, vendor support policy. Fallback: versions and days-left recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Bot Dashboard:** Bot publishes a dashboard → Step 3 — blocked and will-not-rebase entries. Fallback: open PRs only; stopped-rebase set `Not Checked`.
- [ ] **Config Validator:** Bot ships one → Step 3 — e.g. `renovate-config-validator`, on the config as the default branch has it. Fallback: read the files; validity `Not Checked`.
- [ ] **Vulnerability Scanner:** Lockfile, image, or requirements file → Step 13 — e.g. OSV-Scanner, `npm audit`, host advisory API. Fallback: one source only; the missing source `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** From the previous report, list deferred PRs and why. A deferred major whose blocker has since cleared is the first candidate. Select open PRs by head-ref prefix read from the updater config (`branchPrefix`, default `renovate/`; Dependabot `dependabot/`), never by title and never by author. A token-authored PR on that prefix is in scope. Record the author; it is evidence, not the selector. Per PR: number, title, head ref, head SHA, mergeable, merge state, files, labels, commits behind the integration branch, and the latest CI run. Read a run only once it has finished. An in-progress run is not a result. **Done when:** `Inventory` names the prefix and the config it was read from, and lists every open PR on that prefix, or `none`.
- [ ] **Step 3 — Bot Health:** No dependency updater config is CRITICAL. Examples: Renovate (`.github/renovate.json` or `.github/renovate.json5`; rules example `.bkit/templates/.github/renovate.json5`, self-hosted runner example `.bkit/templates/.github/workflows/renovate.yml`) or Dependabot (`.github/dependabot.yml`; example `.bkit/templates/.github/dependabot.yml`). See `docs/deployments.md` § Dependency updaters. Both configs present is a finding; keep one. `.github/workflows/bkit-cloud.yml` exists and the updater config does not name that path is a finding: Renovate lists it in `ignorePaths` (`enabled: false` on a package rule does not stop the digest pin); Dependabot sets `exclude-paths` on the `github-actions` block (version updates only; security-update PRs for that file can still open). Read the bot dashboard (gather-only; the bot rewrites it). Record every blocked entry and every will-not-auto-rebase notice. Those PRs stay stale until a person acts. The bot reads presets from the default branch, not the integration branch. A fence or group added on the integration branch does nothing until a release carries it. Edits to the bot's base config on the integration branch apply only when the bot is set to merge base-branch config, and that option is itself read from the default branch. When a PR proposes something the integration branch's config already blocks, read the default-branch copy before debugging the rule. A promotion-lag check that warns when the two branches differ is the signal. Validate the config files as the default branch has them. From the dashboard and the bot logs, record config errors, PRs held by concurrency or hourly limits, items awaiting approval, and open config-migration PRs. A broken config looks exactly like a quiet week. **Done when:** `Bot Health` holds blocked PRs, the branch the config was read from, validator result, and held / awaiting-approval items.
- [ ] **Step 4 — Supply Chain:** Read settings as the default branch has them. Record each against the bot best-practice preset and the package manager's supply-chain page. Bot: an npm release-age floor of at least the three days `security:minimumReleaseAgeNpm` sets, with `internalChecksFilter: "strict"`; actions and images pinned by digest; abandonments preset; config-migration PRs enabled. Package manager: trust policy no-downgrade, exotic subdependencies blocked, an explicit install-script allowlist, strict dependency builds. A release-age of 0 on the package manager is a recorded trade-off where the docs say so. Record it. Re-deciding it is a person's call (`DECISION`). The gap: the bot does not apply its release age to lockfile-maintenance PRs, because the package manager makes those changes, and with the package-manager gate off nothing else does. Those PRs reach the batch with no cooldown. `Cooldown` checks what stands in for one. `Screen` takes them first. A setting missing or weaker than the standard → row in `Recommendations`, with the line to add. **Done when:** `Supply Chain` row per setting: value · standard · verdict.
- [ ] **Step 5 — Cooldown:** While the package-manager cooldown is off, lockfile-maintenance PRs must not automerge, and they wait the same age as other updates before they land. Check: the lockfile-maintenance block, and every rule that could match it, sets no automerge; every lockfile-maintenance PR merged since the previous run waited at least the bot's `minimumReleaseAge` (publish time of the newest version it brought in, to merge time); each open one whose version is younger than that age is EXCLUDED, with the date it becomes eligible. The same wait applies to every other open non-security PR: the bot's release-age check (e.g. `renovate/stability-days`) is pending, or the newest version it brings in is younger than `minimumReleaseAge` → EXCLUDED, with the date it becomes eligible. Security PRs bypass this wait (Step 13). A lockfile-maintenance PR that automerged, or landed before the release age, = finding. **Done when:** `Cooldown` holds automerge, each merged PR's wait, and each open PR's eligible date.
- [ ] **Step 6 — Volume:** Every bot PR is a lockfile rewrite, a preview, and a CI run. Every rebase of an open PR is another CI run. Read these on the default branch and record what each would change. A line to add goes in the bot config the project owns. Grouping: related packages land in one PR (`group:monorepos`, `group:allNonMajor`, or equivalent shared group names). List every PR this run that opened alone and should have been grouped, with the rule that would have caught it. Schedule: PRs open in one window. Note any PR that opened outside it other than a security PR, and why. Limits: concurrent, hourly, and branch-concurrent. Record any PRs the limits held back. Rebase policy: rebasing only when conflicted avoids a CI run on every integration-branch move. Unset → record the default that applies, and count bot rebase pushes since the previous run. A lockfile PR conflicts with almost any other dependency merge. Lockfile maintenance has its own schedule, so it lands on that cadence, not on every bot run. Automerge: only low-risk groups that pass CI, via platform automerge so the host merges once required checks pass. Lockfile maintenance must not automerge while `Cooldown` is off. Majors wait for approval on the dashboard. Unset → each major opens a PR and runs CI before anyone has decided to take it. A setting that would cut PRs or CI runs → `Recommendations`, with the line to add and the PRs it would have saved this run. **Done when:** `Volume` row per setting: value · what it would change · PRs saved.
- [ ] **Step 7 — Classify:** Every PR that is not green. Quote the evidence line from the log. When nothing matches, the class is C.
  - **A — infrastructure:** preview-deploy wait timeout, registry fetch failure, a cold service refusing, a cancelled runner. Confirm: the same job passed on a neighbouring run or a retry of the same commit.
  - **B — stale:** outdated lockfile, lockfile config mismatch, a merge conflict, merge state dirty, behind the integration branch. Confirm: behind-count. Being behind says nothing about the dependency itself.
  - **C — real:** the failure survives a clean rebase onto the integration branch. Confirm: reproduce it on the batch worktree. Only C keeps a PR out of the batch.

  The batch is every green PR plus every A and B, once past the bot's release age. C is EXCLUDED and goes to `Excluded`. A breaking major is DECISION even when it would otherwise be IN BATCH. A non-security PR still inside the release age is EXCLUDED even when it would otherwise be IN BATCH (Step 5). **Done when:** `Classes` row per non-green PR: class · behind-count · quoted evidence · verdict.

- [ ] **Step 8 — Batch:** Detached worktree off the integration branch. No new branch. Merge each IN BATCH PR (`git merge --no-edit`). Do not push. A conflict in the lockfile: never resolve it as text. Take the integration branch's copy and regenerate below (`git checkout <integration> -- <lockfile>`, then `git merge --continue` inside the worktree only). A conflict in a manifest between two batch PRs: the higher version wins only when it is not a breaking major. Drop the lower PR and record `replaced by #N`. When the higher side is a breaking major, it stays DECISION and out; keep the lower line and record that the major was not taken. A manifest conflict against the integration branch that is not another PR: take the higher version, line by line. Any other conflict: abort that merge, drop that PR, record why. Record the merged commit. Install. Then, for each PR that changed only the lockfile, refresh exactly the packages it names. Three traps: (1) The install rewrites the catalog and the root manifest as well as the lockfile. Leaving those uncommitted fails the frozen install on CI and passes locally, because the uncommitted edits are still in the tree. (2) A recursive update of every package rewrites ranges and floors the bot never proposed, hidden inside a large lockfile diff. Refresh only the packages the PRs name. (3) A partial refresh leaves some workspaces on the new version and some on the old. If typecheck goes red, first run it on a clean integration-branch worktree to confirm the red is yours. The fix is one version everywhere, catalog change included. Then prove nothing drifted. Every manifest must be byte-identical to the merged commit. Quote the diff command, its exit code, and its output. Do not commit onto the integration branch. Never add a skip-CI marker. Then the lockfile's sources. Every entry needs an integrity hash. Any tarball must come from the configured registry over HTTPS. Both searches must print nothing. Quote each hit with the package that pulls it in. **Done when:** `Batch` holds the worktree commit, PRs in, PRs dropped and why, the drift check, and both source searches.
- [ ] **Step 9 — Screen:** From the batch's lockfile diff against the integration branch, list: packages new to the tree, transitive included; packages that gained an install script, and any new allowlist prompt during install; versions published less than the bot's release age before this run (lockfile-maintenance PRs first); a changed publisher, or less provenance than the version before (the trust policy refuses the second when it is set); names one edit away from a popular package. Install-script worms spread through `postinstall`. Read every new script. A named package still inside the bot's release age is a Cooldown miss: drop that PR and rebuild. Every other hit does not change the PR's verdict. Row in `Recommendations`, with the evidence, for the person approving the batch. **Done when:** `Screen` lists each hit, or `none`.
- [ ] **Step 10 — Verify:** `git status --porcelain` empty first; trap (1) hides in a dirty tree. Then frozen install, the project's static / unit / integration gate, and local end-to-end for each app. A default native run that installs the last store build against a deployed environment tests none of the batch — use the local-build substrate. Then two checks a green typecheck misses: the app framework's dependency doctor (a managed package outside the SDK range compiles and typechecks, then breaks the native build or the app), and a single-version check for the runtime packages named in `Project Instructions`. Two versions is trap (3) before it goes red: report it, with the fix (one version everywhere). A red that looks like the batch may be a stale install. Repeated installs in one worktree can leave a broken link. Delete every `node_modules`, run the frozen install again, and re-run before blaming a bump. If a check is red: drop the suspect PR, rebuild the batch, and re-run. If no single PR explains it, stop and report FAIL. **Done when:** `Verification` quotes every command and exit code, and `Summary` has PASS, CONCERNS, or FAIL.
- [ ] **Step 11 — Plan:** The report asks, and stops. It does not push, merge, close, or label. Where the integration branch accepts direct pushes, the batch lands without a feature-branch PR. Deployed-boundary checks run only on a push, so the landing push is the only place the batch meets external services. Never merge the bot PRs one at a time. N one-by-one → N integration-branch runs, plus a rebase run on every PR still open after each merge. The same N in one push → one integration-branch run. `Plan` holds a table with columns `Wave`, `PRs`, `Commits`, `Why together, or why apart`, `Pushes`, `CI runs`. Build it by these rules. (1) One wave by default. Every IN BATCH PR lands in one push. The push is a series of commits, not one squashed commit: one for all non-major groups, then one per major, each with its own install so its lockfile matches its manifests. Each commit is a clean point to revert or bisect locally. CI still runs once, on the push's head. Run `Verify` on the head. Each earlier commit needs only a frozen install and a typecheck. (2) A second wave only for a reason the report names. Separate commits already make a revert exact, so being bisectable is not a reason. A reason is an update that needs its own watch in production before the next one lands: an SDK, framework, or native major, a change that needs a new store build or submission, or a database-client major. Each extra wave costs one more push, one more integration-branch run, and a rebase run on every PR still open. Put the cost in the row. (3) Order: security fixes, then non-majors, then majors. Within majors, a dependency before what depends on it (the language before its linter; a UI library together with its type package). (4) An automerge group that has not merged yet goes into the batch. If it merges on its own first, that is a separate push plus the rebases it triggers. Fold it in, and close it at the push like any other carried PR. If it merged before the landing, rebase the batch onto the integration branch and drop it from the plan. (5) Close what the push carries, straight after the push, with the `Excluded` comment pointing at the landing commit. The bot closes a PR whose update is already on the integration branch, but only on its next run, and until then it can still rebase and spend a CI run. (6) Land after the bot's weekly window, so no PR opens or rebases mid-landing, and when no other push to the integration branch is queued. (7) List the excluded and deferred PRs the landing push will make the bot rebase, and the CI runs that costs. A PR that stays excluded for more than one cycle costs a rebase run on every later push. Recommend closing it and taking it from the dashboard when it is wanted. (8) No skip-CI marker on a dependency change. The required checks are the test of the batch. Then the landing commands in order: the push, the PRs to close with their comment, and the labels for what stays open. Cost both ways, plus the CI runs these PRs have already spent on their own branches since they opened. Name the watch after landing: the error-tracker release the batch ships in, and the error-rate and crash-free thresholds that would trigger reverting it, commit by commit. Do not invent thresholds. **Done when:** `Plan` holds the table, the commands, both costs, and the watch.
- [ ] **Step 12 — Excluded:** The report lists these. It does not label, comment, or close. C-class and blocked PRs stay open. The report gives the comment text (what broke, what the fix would take) and the labels to add (deferred, plus a major label on a major). Every such comment starts with the marker in `Project Instructions`. The next step searches for that marker and edits the existing comment. PRs the batch would carry: the report says to close them, with a pointer at the batch, once the batch has landed. A breaking major or a migration is DECISION, not a batch item. List it under `Recommendations`. If the work is real, the report names the issue to open. Give each DECISION its evidence, not a bare PR link: the migration guide read, each breaking change searched against the codebase with its hit count, the codemods available, the peer-dependency matrix, and the rollback path. **Done when:** `Excluded` row per PR not in the batch: verdict · labels · comment text or DECISION evidence.
- [ ] **Step 13 — Unseen:** What the bot does not see. (a) New security advisories against the committed baseline. The delta script reports advisories not in the baseline, and stale baseline entries. If the batch fixes a baseline entry, the plan removes it in the same commit. Security PRs bypass the bot's release-age wait, so check they are landing, not queued. Same question as `bkit-audit-security`; do not file it twice. (b) A second vulnerability source. Run the scanner over the lockfile, language-requirements files, and shipped images, and read the host's open alerts. A scanner that reads only the first document of a lockfile reports no dependencies and no vulnerabilities, without failing. Confirm it read both. Classify each advisory as shipped, server-only, or dev-only, and say whether the vulnerable function is reachable. Destination for an advisory: `bkit-audit-security`. (c) Security-fix latency. Per advisory in a shipped dependency, days from publication to the fix landing on the integration branch. Targets: a CRITICAL fix within 7 days, a HIGH fix within 30. A breach = finding. List breaches first. (d) A container that installs from a manifest the bot bumps is covered. A second install line that bypasses the manifest is the gap, back. (e) Dependencies nothing uses → `bkit-audit-dead-code`. A dependency nobody maintains (no release in over a year, or an archived repository): check every dependency added since the last pass; list hits in `Recommendations`. (f) Deprecated and abandoned packages across the whole tree, not only new ones: the dashboard's abandoned section, and every deprecated warning from the frozen install. (g) Licences. Per dependency added since the last pass, record its licence. Copyleft (GPL, AGPL) in anything shipped, or no licence at all → `Recommendations` for a person. Diff the whole production tree against the previous run, not only new dependencies: a licence that changed on upgrade (to BSL, SSPL, or a commercial licence) as well as new copyleft or missing licences. Notices in the shipped apps: they show third-party notices, and they were regenerated when shipped dependencies changed. Fonts, icons, and images: record the licence of each bundled source, and check its terms allow how it ships. **Done when:** `Unseen` holds advisories, latency, the container install path, deprecated packages, and licence diffs.
- [ ] **Step 14 — End of Life:** Compare versions in use with the end-of-life catalogue and each vendor's support policy. Record days left for the runtime, the framework, the native SDK, the package manager, the language, the database major, and container base images the project ships (sources in `Project Instructions`). An end of life inside 90 days is DECISION, and the report names the issue to open. **Done when:** `End of Life` row per runtime: version · days left · verdict.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per bot preset, package-manager supply-chain setting, and Concise Guide rule → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching dependencies (every manifest, the workspace file, bot configs, workflow `uses:` lines, Dockerfiles, and requirements files, runtime-version files, build-image, and hosting runtime settings) → one-line verdict each. (b) Bounded ~30 min pass: what a senior supply-chain engineer flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows, log-audit reports under `bkit-audit-logs`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Batch local:** drift check quoted with exit code; no push; throwaway worktree removed; integration branch unchanged.
- [ ] **No landing:** no PR merged, labelled, closed, or commented on.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | No dependency updater config; shipped dependency with a known-bad install script or a publisher change the trust policy should have refused; lockfile entry with no integrity hash, or a tarball off the configured registry; CRITICAL advisory in a shipped dependency older than 7 days |
| `HIGH` | HIGH advisory in a shipped dependency older than 30 days; lockfile-maintenance update that automerged or landed inside the release-age window; copyleft or missing licence on a shipped dependency |
| `MEDIUM` | Updater config that does not exclude `.github/workflows/bkit-cloud.yml`; supply-chain setting missing or weaker than the standard; setting that multiplies PR or CI runs; unmaintained or deprecated shipped dependency; end of life inside 90 days; two versions of one runtime package |
| `LOW` | Bot stopped rebasing a PR; grouping miss with no failure; shipped licence notice not regenerated |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: shipped exposure first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, the batch verdict, and open / in-batch / excluded counts.
- [ ] **Series:** security-fix latency and end-of-life days beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
