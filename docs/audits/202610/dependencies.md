<!-- bkit:anchor
baseSha: 72baf71f9e5cb221e189e6e4f9378b95ceaa3e66
baseRef: dev
bkitVersion: 5.2.4
bkitLatest: 5.2.4
-->
<!-- Note: Report path `docs/audits/202610/dependencies.md` (template `docs/templates/bkit-audit-dependencies.md`, UTC month 202610, slug `dependencies`). Stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->

# Dependency Triage

> [!CAUTION]
> **Purpose:** Batch open dependency-update PRs for verification; judge supply-chain settings, advisories, licences, end of life, off-manifest CLIs.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - NEVER push, merge, label, close, or comment on a PR. NEVER commit onto the integration branch. Throwaway worktree = evidence; remove before report finishes.
> - never resolve a lockfile conflict as text, and never with `-X ours` / `-X theirs`. NEVER run a recursive update that rewrites ranges the PRs did not name.
> - A breaking major or a migration stays out of the batch even when green. This run records the plan; landing it is the next step.

## Universal Instructions

### Context & Goals

Every dependency PR rewrites the lockfile. Unbatched → PRs stale against each other, bot stops rebasing some, each separate merge = full CI. Batching is cheap; manual batching breaks CI: install rewrites manifest the commit omitted, recursive update rewrites bot-unproposed ranges, partial refresh leaves two copies of one tool. Breaking majors need a person; batch must not carry one. Target failure: **a batch that quietly carries a breaking major, or a lockfile that does not match its manifests**.

**Applies when:** a dependency bot opens update PRs, or the repo has manifests and a lockfile. None → one `N/A` row with evidence, never "clean".

**Cadence:** weekly after bot open window. Extra pass: security PR outside window, bot config change on default branch, or `bkit-audit-app-store` deadline forcing SDK / target-API upgrade.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

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

### Scope

- No dependency updater config is a CRITICAL finding. Examples: Renovate (`.github/renovate.json` or `.github/renovate.json5`) or Dependabot (`.github/dependabot.yml`). Copy one example and own it.
- Open dependency PRs: classify, batch, verify, and plan the landing.
- Bot config against best-practice and supply-chain settings, including which branch the bot actually reads.
- Lockfile-maintenance cooldown while the package-manager release-age gate is off or absent.
- Settings that multiply PRs and CI runs.
- Supply-chain screen of the batch diff.
- Advisories the bot does not see, fix latency, unmaintained, and deprecated packages, licences.
- Off-manifest CLIs: pin, distance from latest, bot coverage.
- Runtime and framework end of life.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Store submission deadlines | Store sweep | `bkit-audit-app-store` |
| Dependencies nothing uses | Dead-code sweep | `bkit-audit-dead-code` |
| Whether a vulnerable function is reachable, beyond naming the call | Security sweep | `bkit-audit-security` |
| Tool-server packages (e.g. MCP) | Agent config sweep | `bkit-audit-agents` |
| CLI outdated notices in CI logs | Annotations sweep | `bkit-audit-annotations` |
| Landing the batch, or labelling, closing, or commenting on PRs | Audit reports only | Plan from this report |

### Verdicts

One per PR. Class (A, B, or C) = evidence; below = outcomes. DECISION wins over IN BATCH: breaking major stays out even when green. Non-security PR still inside bot release age → EXCLUDED even when green.

- **IN BATCH:** green, or class A or B, and past the bot's release age. Goes in this run's batch.
- **EXCLUDED:** class C, dropped during batch build, or still inside bot release age. Report names labels and comment text; this run does not apply them.
- **DECISION:** a breaking major, a migration, or end of life inside 90 days. Listed for a person. Not a batch item.
- **OTHER:** fits none. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

Batch verdict, in `Summary`, not per PR. The landing push's CI is the next step's result, not this run's.

- **PASS:** drift check and every local verification command exited 0.
- **CONCERNS:** a PR was dropped during bisection.
- **FAIL:** drift, or a red no single PR explains.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [x] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
  - **Result:** `gh run list --limit 1`, `npm view`, `docker version`, WebFetch (docs.renovatebot.com) all returned. One call blocked by the API, not by a harness rule: `gh api user/installations` → `HTTP 403`. No allow rule clears it (endpoint needs a GitHub App user access token; a PAT gets 403). Recorded in `Not Checked` and `Process Improvements`.
- [x] **Git Host:** Steps 2, 3, 11, 12 — open PRs by head-ref prefix, CI runs, behind-count, e.g. `gh`, GitLab API. Fallback: none; PR steps `Not Checked`, batch verdict `FAIL`.
  - **Result:** `gh` 2.102.0, authenticated (`gh run list --limit 1` exit 0).
- [x] **Package Manager:** Steps 5, 8–10 — install, lockfile, registry metadata, e.g. pnpm, npm. Fallback: none; `Batch` and `Verification` `Not Checked`, batch verdict `FAIL`.
  - **Result:** pnpm 10.34.5 (Corepack, from `package.json:45` `packageManager`); 10.34.6 inside the batch worktree; node v24.16.0; registry metadata via `npm view <pkg> time --json`.
- [x] **Clean Worktree:** Steps 8–10 — detached worktree off the integration branch, removed before the report finishes. Fallback: none; do not build the batch in the main checkout.
  - **Result:** `git worktree add --detach tmp/audit-deps-wt 72baf71f` (batch) and `tmp/audit-deps-c` (class C repro); both removed with `git worktree remove --force`, exit 0; `git worktree list` has no `audit-deps` entry.
- [x] **Web:** Steps 13–15 — latest CLI releases, anchor standards, end-of-life dates, vendor support policy. Fallback: versions and days-left recorded as unread.
  - **Result:** WebFetch + WebSearch; GitHub releases via `gh api repos/<owner>/<repo>/releases/latest`; npm latest via `npm view <pkg> version`.

#### Conditional

Verify only when applicable.

- [x] **Bot Dashboard:** Bot publishes a dashboard → Step 3 — blocked and will-not-rebase entries. Fallback: open PRs only; stopped-rebase set `Not Checked`.
  - **Result:** Renovate Dependency Dashboard, issue #328, `gh issue view 328`.
- [x] **Config Validator:** Bot ships one → Step 3 — e.g. `renovate-config-validator`, on the config as the default branch has it. Fallback: read the files; validity `Not Checked`.
  - **Result:** `renovate-config-validator --strict` from `renovate@43.288.0` (the version the runner image resolved), via `npx`, on `origin/main:.github/renovate.json5` placed at `<scratch>/repo/.github/renovate.json5` with `RENOVATE_ALLOWED_ENV='PNPM_*'`.
- [x] **Vulnerability Scanner:** Lockfile, image, or requirements file → Step 13 — e.g. Trivy (`trivy fs --include-dev-deps`), OSV-Scanner, `npm audit`, host advisory API. Fallback: one source only; the missing source `Not Checked`.
  - **Result:** `pnpm audit --json` (pnpm 10.34.5); `node scripts/ci/check-dependency-audit.mjs`; Dependabot alerts API; Trivy 0.75.0 (`ghcr.io/aquasecurity/trivy:0.75.0@sha256:af6acf9a…`, docker 29.8.2) on a lockfile copy. OSV-Scanner and lockfile-lint not installed → fallbacks in `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [x] **Gaps named:** every missing item names its fallback and `Not Checked` entry. (Mend App install state: 403 → `Not Checked`; OSV-Scanner absent → Trivy + `pnpm audit` + Dependabot stand in; lockfile-lint absent → integrity / source checks by hand in `Batch`.)
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [x] **Step 2 — Inventory:** From previous report, list deferred PRs and why. Deferred major whose blocker cleared → first candidate. Select open PRs by head-ref prefix from updater config (`branchPrefix`, default `renovate/`; Dependabot `dependabot/`), never title or author. Token-authored PR on prefix = in scope; record author as evidence, not selector. Per PR: number, title, head ref, head SHA, mergeable, merge state, files, labels, commits behind integration branch, latest CI run (finished only; in-progress ≠ result). **Done when:** `Inventory` names prefix and config source, lists every open PR on prefix, or `none`.
- [x] **Step 3 — Bot Health:** No dependency updater config = CRITICAL. Examples: Renovate (`.github/renovate.json` or `.github/renovate.json5`; rules example `.bkit/templates/.github/renovate.json5`, self-hosted runner example `.bkit/templates/.github/workflows/bkit-renovate.yml`) or Dependabot (`.github/dependabot.yml`; example `.bkit/templates/.github/dependabot.yml`). See `docs/deployments.md` § Dependency updaters. Both configs = finding; keep one. Bot dashboard: gather-only (bot rewrites). Record blocked entries and will-not-auto-rebase notices → stale until person acts. Bot reads presets from default branch, not integration. Fence / group on integration branch inactive until release carries it. Base-config edits on integration apply only if bot merges base-branch config — option read from default branch. PR proposes what integration config blocks → read default-branch copy before debugging rule; promotion-lag when branches differ = signal. Validate configs as default branch has them. Dashboard + logs: config errors, PRs held by concurrency / hourly limits, awaiting approval, open config-migration PRs. Broken config ≈ quiet week. **Done when:** `Bot Health` holds blocked PRs, config read branch, validator result, held / awaiting-approval items.
- [x] **Step 4 — Supply Chain:** Read settings as default branch has them. Record each vs bot best-practice preset and package manager supply-chain page. Bot: minimum release age >= three days (e.g. Renovate `minimumReleaseAge` / `security:minimumReleaseAgeNpm` + `internalChecksFilter: "strict"`; Dependabot `cooldown`); actions / images digest-pinned; abandonment flagging (e.g. Renovate abandonments preset); config-migration PRs enabled, where bot offers them. Package manager, where offered (e.g. pnpm): trust policy no-downgrade, exotic subdeps blocked, explicit install-script allowlist, strict dependency builds; none offered → `N/A` with evidence. Release-age 0 on package manager = recorded trade-off where docs say so; re-deciding = person (`DECISION`). Gap: bot release age does not apply to lockfile-maintenance PRs (package manager makes changes; gate off → no cooldown) → batch with no cooldown; `Cooldown` stands in; `Screen` first. Missing / weaker setting → `Recommendations` row + line to add. **Done when:** `Supply Chain` row per setting: value · standard · verdict.
- [x] **Step 5 — Cooldown:** Package-manager cooldown off or absent → lockfile-maintenance PRs: no automerge; same age wait as other updates before land. Bot opens no lockfile-maintenance PRs (e.g. Dependabot) → those checks `N/A`. Check: lockfile-maintenance block + matching rules → no automerge; each merged lockfile-maintenance since previous run waited >= bot release age (e.g. Renovate `minimumReleaseAge`; newest version publish → merge); open younger → EXCLUDED + eligible date. Same wait on other open non-security PRs: release-age check pending (e.g. `renovate/stability-days`) or newest version younger than bot release age → EXCLUDED + eligible date. Security PRs bypass (Step 13). Lockfile-maintenance automerged or landed before release age = finding. **Done when:** `Cooldown` holds automerge, each merged PR wait, each open PR eligible date.
- [x] **Step 6 — Volume:** Each bot PR = lockfile rewrite + preview + CI; each rebase = another CI. Read on default branch; record what each setting would change; lines to add → project-owned bot config. Grouping: related packages one PR (`group:monorepos`, `group:allNonMajor`, or equivalent). List solo opens that should group + catching rule. Schedule: one window; note outside opens (non-security) + why. Limits: concurrent, hourly, branch-concurrent; record held-back PRs. Rebase policy: conflict-only rebases skip CI on every integration move; unset → record default + count rebase pushes since previous run. Lockfile PR conflicts with most dependency merges; lockfile maintenance own schedule, not every bot run. Automerge: low-risk groups passing CI via platform automerge; lockfile maintenance must not automerge while `Cooldown` off. Majors await dashboard approval; unset → major PR + CI before decision. Setting cutting PRs / CI → `Recommendations` + line + PRs saved this run. **Done when:** `Volume` row per setting: value · what it would change · PRs saved.
- [x] **Step 7 — Classify:** Every PR that is not green. Quote the evidence line from the log. When nothing matches, the class is C.
  - **A — infrastructure:** preview-deploy wait timeout, registry fetch failure, a cold service refusing, a cancelled runner. Confirm: the same job passed on a neighbouring run or a retry of the same commit.
  - **B — stale:** outdated lockfile, lockfile config mismatch, a merge conflict, merge state dirty, behind the integration branch. Confirm: behind-count. Being behind says nothing about the dependency itself.
  - **C — real:** the failure survives a clean rebase onto the integration branch. Confirm: reproduce it on the batch worktree. Only C keeps a PR out of the batch.

  Batch = green + A + B past bot release age. C → EXCLUDED → `Excluded`. Breaking major → DECISION even if IN BATCH. Non-security inside release age → EXCLUDED even if IN BATCH (Step 5). **Done when:** `Classes` row per non-green PR: class · behind-count · quoted evidence · verdict.

- [x] **Step 8 — Batch:** Detached worktree off integration branch; no new branch. Merge each IN BATCH PR (`git merge --no-edit`); do not push. Lockfile conflict: never text-resolve → integration copy + regenerate (`git checkout <integration> -- <lockfile>`, `git merge --continue` in worktree only). Manifest conflict between batch PRs: higher version wins if not breaking major; else drop lower, record `replaced by #N`. Higher = breaking major → DECISION out; keep lower line, record major not taken. Manifest vs integration (not another PR): higher version line by line. Other conflict → abort merge, drop PR, record why. Record merged commit; install; lockfile-only PRs → refresh exactly named packages. Traps: (1) install rewrites manifests + lockfile (e.g. pnpm catalog, root `package.json`) — uncommitted edits fail frozen CI, pass locally. (2) recursive update rewrites bot-unproposed ranges in big diff — refresh named packages only. (3) partial refresh → split workspace versions; red typecheck / build → clean integration worktree first; fix = one version everywhere incl. shared version catalog (e.g. pnpm catalog). Drift: every manifest byte-identical to merged commit; quote diff command, exit code, output. Do not commit integration branch; never skip-CI marker. Lockfile sources: integrity hash per entry; tarballs from configured registry over HTTPS; both searches empty — quote hits + pulling package. **Done when:** `Batch` holds worktree commit, PRs in/out + why, drift check, both source searches.
- [x] **Step 9 — Screen:** Batch lockfile diff vs integration — list: new packages (transitive incl.); new install scripts + allowlist prompts; versions published < bot release age before run (lockfile-maintenance first); publisher change or less provenance (trust policy refuses when set); names one edit away from a popular package. Worms via `postinstall` — read every new script. Package still inside release age = Cooldown miss → drop PR, rebuild. Other hits → verdict unchanged; `Recommendations` row + evidence for approver. **Done when:** `Screen` lists each hit, or `none`.
- [x] **Step 10 — Verify:** `git status --porcelain` empty first (trap (1) in dirty tree). Frozen install → static / unit / integration gate → local E2E per app (store build vs deployed env tests none of batch — use local-build substrate). Beyond green typecheck: framework dependency doctor, where the framework ships one (e.g. `expo-doctor`; SDK-out-of-range packages compile/typecheck then break native/app); single-version check for runtime packages in `Project Instructions` (two versions = trap (3) — report + one version everywhere). Red may be stale install — clear installed deps (e.g. `node_modules`, `.venv`, `target/`), frozen install, re-run before blaming bump. Red check → drop suspect PR, rebuild batch, re-run; no single PR explains → FAIL. **Done when:** `Verification` quotes every command and exit code; `Summary` has PASS, CONCERNS, or FAIL.
- [x] **Step 11 — Plan:** Report asks and stops — no push, merge, close, label. Direct-push integration branch → batch lands without feature-branch PR. Deployed-boundary checks on push only → landing push = batch meets external services. Never merge bot PRs one-by-one: N sequential → N integration runs + rebase per open PR after each; N one push → one integration run. `Plan` table columns: `Wave`, `PRs`, `Commits`, `Why together, or why apart`, `Pushes`, `CI runs`. Rules: (1) Default one wave — all IN BATCH in one push; commit series (not squash): non-major groups, then one commit per major each with install matching manifests; each commit revert/bisect point; CI once on push head — `Verify` head; earlier commits → frozen install + typecheck. (2) Second wave only for named reason — bisectability not enough; reason = production watch before next land (SDK / framework / native major, store build/submission, DB-client major); extra wave = +push, +integration run, rebase on open PRs — cost in row. (3) Order: security → non-majors → majors; within majors dependency before dependents (language before linter; UI lib + types together). (4) Unmerged automerge group → batch; self-merge first = separate push + rebases — fold in and close at push; merged pre-landing → rebase batch, drop from plan. (5) Close carried PRs right after push with `Excluded` comment → landing commit; bot auto-close next run only — until then may rebase + CI. (6) Land after bot weekly window, no mid-landing opens/rebases, no queued integration push. (7) List excluded/deferred PRs landing will rebase + CI cost; multi-cycle exclude → rebase each later push — recommend close + dashboard when wanted. (8) No skip-CI on dependency change; required checks test batch. Then ordered landing commands: push, close PRs + comments, labels for open. Cost one-by-one vs batch + CI already spent on branch PRs. Post-land watch: error-tracker release, error-rate / crash-free revert thresholds commit-by-commit — do not invent thresholds. **Done when:** `Plan` holds table, commands, both costs, watch.
- [x] **Step 12 — Excluded:** Report lists only — no label, comment, close. C-class + blocked stay open. Report supplies comment text (break + fix) and labels (deferred; major label on major). Comments start with marker in `Project Instructions`; next step finds marker and edits existing comment. Batch-carried PRs → close after land with batch pointer. Breaking major / migration = DECISION → `Recommendations`; real work → issue to open. DECISION evidence (not bare PR): migration guide, breaking changes vs codebase + hit counts, codemods, peer-dep matrix, rollback path. **Done when:** `Excluded` row per out-of-batch PR: verdict · labels · comment text or DECISION evidence.
- [x] **Step 13 — Unseen:** Bot-blind surfaces. (a) New advisories vs committed baseline — delta script: not in baseline + stale entries; batch fix → remove baseline entry same commit. Security PRs bypass release-age — confirm landing not queued; same as `bkit-audit-security`, do not duplicate. (b) Second vuln source — scanner on lockfile, language requirements, shipped images + host alerts; lockfile scanners reading first doc only → empty without fail — confirm full read. Classify each advisory shipped, server-only, or dev-only, and say whether the vulnerable function is reachable. Destination for an advisory: `bkit-audit-security`. (c) Fix latency — shipped deps: publication → integration land; CRITICAL ≤7d, HIGH ≤30d; breach = finding, list first. (d) Container installing from bot-bumped manifest covered; second install line bypassing manifest = gap, back. (e) Unused deps → `bkit-audit-dead-code`; unmaintained (no release >1y or archived) on new deps since last pass → `Recommendations`. (f) Deprecated / abandoned whole tree — dashboard abandoned + frozen-install warnings. (g) Licences — new deps since last pass; copyleft (GPL, AGPL) or missing in shipped → `Recommendations`. Production tree licence diff vs previous (BSL, SSPL, commercial upgrades too). Shipped app notices regenerated on dep change; bundled fonts/icons/images — licence + ship terms. (h) Off-manifest CLIs — bot reads manifests only. Sources: CI `run:` (global installs, `npx` / `pnpm dlx`, `curl | sh`, system packages), setup-action version inputs (e.g. `supabase/setup-cli` `version:`), build-service CLI pin (e.g. `eas.json` `cli.version`), Dockerfiles, build images, version files (e.g. `.tool-versions`), repo scripts, global-install setup docs. Per CLI: location · pin or `floating` (unpinned, `latest`, open range) · latest release, read live · majors behind · bot-watched (manifest entry or bot rule, e.g. Renovate `customManagers`) yes / no. Floating in CI / build image = finding (unreviewed version each run, bypasses release age). Major behind = finding; end of life → Step 14. Unwatched → `Recommendations`: move into manifest or add bot rule. **Done when:** `Unseen` holds advisories, latency, container install path, deprecated packages, licence diffs, row per off-manifest CLI.
- [x] **Step 14 — End of Life:** Compare versions in use with the end-of-life catalogue and each vendor's support policy. Record days left for the runtime, the framework, the native SDK, the package manager, the language, the database major, and container base images the project ships (sources in `Project Instructions`). An end of life inside 90 days is DECISION, and the report names the issue to open. **Done when:** `End of Life` row per runtime: version · days left · verdict.
- [x] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per bot preset, package-manager supply-chain setting, and Concise Guide rule → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [x] **Step 16 — Anything Else:** (a) Since previous report commit — dependency-touching changes (manifests, workspace file, bot configs, workflow `uses:`, Dockerfiles, requirements, runtime-version files, build-image, hosting runtime) → one-line verdict each. (b) ~30 min bounded pass — senior supply-chain gaps no step covers; since previous run: incidents, new `docs/failures.jsonl`, `bkit-audit-logs` reports, vendor status — what no step catches? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [x] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [x] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [x] **Batch local:** drift check quoted with exit code; no push; throwaway worktree removed; integration branch unchanged.
- [x] **No landing:** no PR merged, labelled, closed, or commented on.
- [x] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | No dependency updater config; shipped dependency with a known-bad install script or a publisher change the trust policy should have refused; lockfile entry with no integrity hash, or a tarball off the configured registry; CRITICAL advisory in a shipped dependency older than 7 days |
| `HIGH` | HIGH advisory in a shipped dependency older than 30 days; lockfile-maintenance update that automerged or landed inside the release-age window; copyleft or missing licence on a shipped dependency |
| `MEDIUM` | Updater config that does not exclude `.github/workflows/bkit-cloud.yml`; supply-chain setting missing or weaker than the standard; setting that multiplies PR or CI runs; unmaintained or deprecated shipped dependency; end of life inside 90 days; two versions of one runtime package; off-manifest CLI floating in CI / build image, or a major behind |
| `LOW` | Bot stopped rebasing a PR; grouping miss with no failure; shipped licence notice not regenerated; unwatched off-manifest CLI |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: shipped exposure first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| deps-1 | HIGH | finding | `.bkit/templates/.cursor/Dockerfile:54`, `.cursor/Dockerfile:54` | `RUN corepack enable && corepack prepare pnpm@10.34.4 --activate`; GHSA-c59q-g84q-2gj5 (CVE-2026-82392, HIGH, pnpm <10.34.5) published 2026-09-02 = 47 days. `package.json:45` moved to 10.34.5 in #455 (16b98bb3, 2026-10-13); this line did not, though `:53` says "corepack-pinned to match `packageManager`". Shipped template. No bot rule watches it (`Unseen` h). In-repo mitigation: Corepack honours `packageManager` inside the project dir. Tool: `git show 72baf71f:<file>`, GitHub Advisory Database | Pin = `packageManager` in both copies (as the `.bkit/shared/.claude/bkit-cloud.md` render does, `.claude/bkit-cloud.md:276` → 10.34.5), plus a bot rule |
| deps-2 | HIGH | finding | `.github/renovate.json5:67`, `:71-74`; no `pnpm-workspace.yaml` | Lockfile maintenance #393 merged 2026-08-04T07:09Z; newest version in it, nanoid@3.3.17, published 2026-08-03T10:39Z = 20.5 h — inside the release age then (`"1 day"`, `4cbe4267:.github/renovate.json5:93`) and now (`"7 days"`). Renovate's age check skips lockFileMaintenance (Renovate docs 44.167.5); pnpm 10.34.5 `minimumReleaseAge` absent (default 0) → lockfile-maintenance PRs have no cooldown. Tool: `gh pr view 393 --json mergedAt,commits`, `npm view nanoid time --json` | Lockfile-maintenance PRs wait >= bot release age before landing |
| deps-3 | MEDIUM | finding | `.github/renovate.json5:22-25`, `.bkit/templates/.github/renovate.json5` (same block) | `extends: ["config:recommended", ":dependencyDashboard"]`. Missing vs `config:best-practices`: `abandonments:recommended`, `:configMigration`, `docker:pinDigests`, `:pinDevDependencies`. Dashboard #328 has no abandoned-packages section. Shipped template. Tool: Read, Renovate presets docs | Extend `config:best-practices` |
| deps-4 | MEDIUM | finding | `.github/workflows/bkit-renovate.yml:68`, `.bkit/templates/.github/workflows/bkit-renovate.yml:68` | `renovatebot/github-action@dd5302ec… # v46.1.17`, no `renovate-version` → image `ghcr.io/renovatebot/renovate:43` floats inside major 43 (run 39121442307 resolved 43.288.0). Latest 44.167.5 = one major behind. `npx renovate@43.288.0` warns "Renovate versions older than the latest major version are unsupported". Shipped template. Tool: `gh run view 39121442307 --log`, `npm view renovate version` | Exact `renovate-version`, bumped by a bot rule |
| deps-5 | MEDIUM | finding | `.bkit/templates/.cursor/Dockerfile:23`, `:38-42`, `.cursor/Dockerfile` (same lines), `.bkit/shared/.claude/bkit-cloud.md:61-62` | Build images float off-manifest CLIs. Dockerfile: `RUN curl -fsSL --retry 3 --retry-all-errors https://deb.nodesource.com/setup_20.x \| bash -` — remote script run unpinned, installs latest Node 20.x; Node 20 end of life 2026-04-30 (−171 days) while the repo runs Node 24 (`.nvmrc`, `release.yml:33`); `gh` from the cli.github.com apt repo, no version. Cloud setup: `GH_VERSION=$(curl … "https://github.com/cli/cli/releases/latest" …)`. Shipped template + shipped cloud setup. Tool: `git show 72baf71f:<file>`, endoflife.date (read 2026-10-18) | Exact versions; Node major = `.nvmrc` |
| deps-6 | MEDIUM | finding | `.bkit/templates/.cursor/Dockerfile:46-51`, `.cursor/Dockerfile:46-51`, `.bkit/shared/.claude/bkit-cloud.md:47-53`, `:62`, `:72` | Downloads unpacked or installed with no checksum: Vale 3.9.1 tarball (Dockerfile, cloud setup), gh tarball (cloud setup `:62`), jq 1.7.1 binary (cloud setup `:72`). CI verifies the same Vale tarball: `bkit-ci.yml:478-484`, `bkit-cloud.yml:480-483` (`sha256sum -c`). Shipped template + shipped cloud setup. Tool: `grep -n` | sha256 check on every download (as `VALE_SHA256` in CI) |
| deps-7 | MEDIUM | DECISION | `package.json:42-44` | `"engines": { "node": ">=20" }` — floor is past end of life (−171 days); CI tests Node 24 only; `docs/technology.md:25` restates `>=20`. Published consumer contract. Tool: Read, endoflife.date | A person sets a supported floor |
| deps-8 | MEDIUM | finding | `.github/renovate.json5:84-90`, `.bkit/templates/.github/renovate.json5` (same block) | `ignorePaths` replaces `config:recommended`'s `:ignoreModulesAndTests` list and omits `docs/plans/**`. Dashboard #328 detects `tests/fixtures/heavy-customised-consumer/package.json`. #583 touches only 2 files under `docs/plans/202610/logs/504-example-project/spike/`; #544 only 3; #579 carries 2 hunks there. Shipped template. Tool: `gh pr view <n> --json files`, `gh issue view 328` | Archived evidence and test fixtures out of the scan |
| deps-9 | MEDIUM | finding | `.github/renovate.json5:141-145`, `.bkit/templates/.github/renovate.json5` (same rule) | Majors rule has no `dependencyDashboardApproval`; #583 (actions v4→v7, archived files) and #584 (vitest 5) opened and ran CI before any decision. Shipped template. Tool: `gh pr list`, `gh pr checks` | Majors wait for dashboard approval |
| deps-10 | MEDIUM | finding | `.github/renovate.json5:112-120`; `pnpm-lock.yaml` on #582 | Automerge group #582 (`automerge: true`, `platformAutomerge: true`; repo `allow_auto_merge: false` → Renovate merges itself after checks) regenerates the lockfile with transitives 0 days old at audit: rollup@4.64.10 + platform binaries (2026-10-18T14:48Z), postcss@8.5.31 (2026-10-18T19:39Z). `renovate/stability-days` passes — it ages the named packages only. Same root cause as deps-2. Tool: `git diff 72baf71f -- pnpm-lock.yaml` in worktree, `npm view <pkg> time --json` | Every version an automerge PR lands meets the release age |
| deps-11 | MEDIUM | finding | `package.json:45` (pnpm 10.34.5); no `pnpm-workspace.yaml`; no `.npmrc` | `trustPolicy`, `blockExoticSubdeps`, `allowBuilds` / `onlyBuiltDependencies`, `strictDepBuilds` unset (pnpm 10.x settings page). `pnpm install` prints "Ignored build scripts: esbuild@0.28.1, esbuild@0.28.2" — no explicit allow / deny. Tool: `ls`, `pnpm install` output | pnpm supply-chain settings set |
| deps-12 | MEDIUM | finding | `.github/workflows/bkit-ci.yml:676` | `run: npx --yes bats tests/*.bats` — floating: npm `bats` latest each run (1.13.0 today; bats-core 1.14.0), outside lockfile and release age. Recorded as a choice in `docs/technology.md:71`. bkit-repo-only lane. Tool: Read, `npm view bats version` | Exact pin the bot watches |
| deps-13 | LOW | finding | PR #450 `renovate/lock-file-maintenance` | Dashboard #328: "PR Edited (Blocked)"; Renovate notice 2026-10-13 after a manual commit 2026-08-28; 391 commits behind; `pnpm-lock.yaml` conflict at batch build. Tool: `gh issue view 328`, `git merge` in worktree | Bot rebases, or PR closed |
| deps-14 | LOW | finding | `.github/workflows/bkit-ci.yml:478` (Vale 3.9.1), `:525` (actionlint 1.7.12), `:573` (graphifyy 0.9.50); `.github/workflows/bkit-cloud.yml:545` (`@opencode/cli@2.0.26`); `.bkit/shared/.claude/bkit-cloud.md:72` (jq 1.7.1) | Pinned; no manifest entry, no `customManagers` rule. Latest: Vale 3.24.0, actionlint 1.7.12, graphifyy 0.9.92, @opencode/cli 2.0.32, jq 1.8.2. Tool: `gh api repos/<o>/<r>/releases/latest`, `npm view`, PyPI JSON | Bot rule signals new releases |
| deps-15 | LOW | finding | `.github/renovate.json5:112-129` | pnpm `packageManager` patch opens solo (#581, files: `package.json`); group rules match `devDependencies` / `dependencies` only. Tool: `gh pr view 581 --json files` | `packageManager` in the non-major group |

Empty and clean → one row `None`.

## Report

### Summary

- **Findings:** CRITICAL 0 · HIGH 2 · MEDIUM 10 · LOW 3.
- **Batch verdict: CONCERNS** — #582 dropped at `Screen` (transitives inside release age), #450 dropped at batch build (lockfile conflict). Final batch (#581) passed drift check and every local command, exit 0.
- **PRs:** open 8 · in batch 1 (#581) · excluded 4 (#582, #580, #579, #450) · decision 2 (#584, #583) · other 1 (#544).
- **Shipped exposure first:** the Cursor Dockerfile template pins pnpm 10.34.4 (HIGH advisory, 47 days) and installs end-of-life Node 20 through a floating `curl | bash`; the Renovate templates float the bot image one major behind, extend `config:recommended` not `config:best-practices`, and ask no approval before majors.
- **Cooldown:** nothing ages lockfile changes — neither lockfile maintenance (#393 landed a 20.5 h old version) nor the automerge group's transitives (#582: two 0-day packages).
- **No runtime dependencies shipped** (`package.json` has no `dependencies`); every advisory is dev-only.

### Previous Run

- **Baseline.** No prior report for slug `dependencies` (`ls docs/audits/*/` → only `202610/dependencies.md`, this report). Closure rate: n/a.
- Diff base for "since last pass" checks (Step 13 e/g, Step 16 a): last dependency batch commit `87b21dc9` (#451, 2026-08-28).
- Series opened this run: fix latency (`Unseen` c), end-of-life days (`End of Life`).

### Inventory

- **Prefix:** `renovate/` (Renovate default; `branchPrefix` unset in `.github/renovate.json5`).
- **Config source:** `origin/main:.github/renovate.json5`, with the `dev` copy layered on by `useBaseBranchConfig: "merge"` (`:36`); the two differ by one comment only (`git diff origin/main 72baf71f -- .github/renovate.json5` → 1 comment line split).
- **Deferred from previous report:** none (baseline).
- **Query:** `gh pr list --state open --limit 100 --json number,title,headRefName,headRefOid,mergeable,mergeStateStatus,labels,author,files`; behind-count `git rev-list --count <head>..72baf71f`; CI `gh pr checks <n>`. Author on every PR: `cbartens` (PAT-run self-hosted Renovate) — evidence only.

<!-- prettier-ignore -->
| PR | Title | Head ref | Head SHA | Merge state (at `72baf71f`) | Files | Labels | Behind | Latest finished CI |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| #584 | Update major vitest to v5 | `renovate/major-major-vitest` | `2ec4886ef1` | CLEAN | `package.json`, `pnpm-lock.yaml` | `dep-major` | 16 | green, run 39172820715 |
| #583 | Update github-actions to v7 | `renovate/major-github-actions` | `8581942b51` | CLEAN | 2 × `docs/plans/202610/logs/504-example-project/spike/**/bkit-ci.yml` | `dep-major` | 16 | green |
| #582 | Update non-major dependencies | `renovate/non-major-dependencies` | `d76f122030` | CLEAN | `pnpm-lock.yaml` | none | 16 | green, run 39172795883 |
| #581 | Update pnpm to v10.34.6 | `renovate/pnpm-10.x` | `ea387a18e3` | CLEAN | `package.json` | none | 16 | green, run 39172784399 |
| #580 | Update ubuntu:26.04 Docker digest to c098726 | `renovate/docker-images` | `4272539d5e` | UNSTABLE | `.cursor/Dockerfile` | none | 16 | red, run 39172768481 |
| #579 | Pin dependencies | `renovate/github-actions` | `d5e79fa472` | UNSTABLE | `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `release.yml` + 2 spike files | none | 16 | red, run 39172759597 |
| #544 | Update pnpm to v10.34.5 [SECURITY] | `renovate/npm-pnpm-vulnerability` | `520c818843` | CLEAN | 3 × `docs/plans/202610/logs/504-example-project/spike/**/package.json` | none | 16 | green, run 39172735460 |
| #450 | Lock file maintenance | `renovate/lock-file-maintenance` | `5293da7285` | UNKNOWN | `pnpm-lock.yaml` | `dependencies`, `deferred` | 391 | green 2026-08-28 (retired "CI" workflow) |

### Bot Health

- **Configs:** Renovate only (`.github/renovate.json5`). No `.github/dependabot.yml` (example lives at `.bkit/templates/.github/dependabot.yml` only). Dependabot alerts on (`gh api repos/cbartens/bkit/vulnerability-alerts` → 204); no Dependabot version updates. One bot → pass.
- **Runner:** self-hosted, `.github/workflows/bkit-renovate.yml` (`renovatebot/github-action` v46.1.17 → image `:43` → 43.288.0). Mend App: last `app/renovate`-authored PR #306 (2026-06-29); every later bot PR authored `cbartens` → App looks suspended as `docs/deployments.md` § Dependency updaters asks; install state `Not Checked` (403).
- **Config read branch:** `main` (default) for presets and `useBaseBranchConfig`; `dev` copy merged over it. Promotion lag: none that changes behaviour (one comment line).
- **Validator:** `RENOVATE_ALLOWED_ENV='PNPM_*' npx --yes --package renovate@43.288.0 -- renovate-config-validator --strict` on `origin/main:.github/renovate.json5` at `<scratch>/repo/.github/renovate.json5` → exit 0, "Config validated successfully". Same file passed bare → validated as global config, `allowedEnv` errors for `PNPM_*` (validator mode, not a config error).
- **Dashboard #328:** blocked: #450 "PR Edited (Blocked)" (manual commit 2026-08-28; Renovate edited/blocked notice 2026-10-13) → stale until a person acts (deps-13). No rate-limited, awaiting-approval, or config-migration sections. Detected-dependency list includes `tests/fixtures/heavy-customised-consumer/package.json` (deps-8).
- **Logs** (`gh run view 39121442307 --log`, attempt 2, 2026-10-18 22:32–22:34Z): no config error. `WARN` default git author `renovate@whitesourcesoftware.com` — `vars.RENOVATE_GIT_AUTHOR` unset (`bkit-renovate.yml:92`) → `Recommendations`. Pushed new commits to all 7 open PRs except #450.
- **Held / awaiting approval:** none held by limits; none awaiting approval (no approval rule, deps-9); no config-migration PR (preset off, deps-3).
- **Out-of-window opens:** #579–#584 created Sat 2026-10-17 11:28Z, outside `before 6am on Monday` (`:40`), 6 PRs in one run > `prHourlyLimit: 4` (`:94`). The run was a manual re-run (attempt 2) — consistent with dashboard-forced creation, which bypasses schedule and limits; the log does not say which.

### Supply Chain

Settings as `main` has them; bot docs Renovate 44.167.5; pnpm 10.x settings page.

<!-- prettier-ignore -->
| Setting | Value | Standard | Verdict |
| --- | --- | --- | --- |
| Base preset | `config:recommended` (`renovate.json5:22-25`) | `config:best-practices` | gap → deps-3 |
| Bot release age | `minimumReleaseAge: "7 days"` (`:67`) | >= 3 days (`security:minimumReleaseAgeNpm`) | pass |
| `internalChecksFilter` | unset → default `"strict"` | `"strict"` | pass |
| `minimumReleaseAgeBehaviour` | unset → default `"timestamp-required"` | — | pass; #579 check stays pending (no release timestamp for an action is the likely cause; `Cooldown`) |
| Lockfile-maintenance cooldown | none: Renovate's age check skips `lockFileMaintenance`; pnpm `minimumReleaseAge` absent | wait >= bot release age | gap → deps-2, deps-10 |
| Action digest pinning | github-actions rule `pinDigests: true` (`:193-200`); every `uses:` SHA-pinned | `helpers:pinGitHubActionDigests` | pass |
| Image digest pinning | `.cursor/Dockerfile:15` digest-pinned by hand; `docker:pinDigests` off | `docker:pinDigests` | gap → deps-3 (new images land unpinned) |
| Abandonment flagging | absent | `abandonments:recommended` | gap → deps-3 |
| Config-migration PRs | absent | `:configMigration` | gap → deps-3 |
| Bot runtime version | image `:43`, floating, one major behind | exact, current major | gap → deps-4 |
| Vulnerability PRs | `osvVulnerabilityAlerts: true` (`:45`) | — | pass |
| pnpm `minimumReleaseAge` | absent (pnpm 10 default 0) | recorded trade-off: `renovate.json5:57-61`, `docs/deployments.md:423` (§ Dependency updaters, "pnpm 11 on Mend's runner") | trade-off → DECISION (deps-2) |
| pnpm `trustPolicy` | absent | `no-downgrade` | gap → deps-11 |
| pnpm `blockExoticSubdeps` | absent (lockfile has 0 git / tarball sources today) | `true` | gap → deps-11 |
| pnpm `allowBuilds` / `onlyBuiltDependencies` | absent; esbuild scripts silently ignored | explicit allowlist | gap → deps-11 |
| pnpm `strictDepBuilds` | absent (default `false`) | `true` | gap → deps-11 |
| Registry provenance (own package) | `release.yml` OIDC trusted publishing + `npm publish --provenance`; `@cbartens/bkit@5.2.4` has SLSA provenance v1 (`npm view @cbartens/bkit@5.2.4 dist.attestations`) | npm provenance | pass |

### Cooldown

- **Package-manager cooldown:** off — pnpm 10.34.5, `minimumReleaseAge` absent, no `pnpm-workspace.yaml`. Bot release age `"7 days"` skips lockfile maintenance.
- **Lockfile-maintenance automerge:** `lockFileMaintenance` (`:71-74`) sets none; no automerge rule matches it (`matchUpdateTypes` minor / patch only) → pass.
- **Merged lockfile maintenance (baseline → last one):** #393 — newest version nanoid@3.3.17 published 2026-08-03T10:39Z → merged 2026-08-04T07:09Z = 20.5 h, under the `"1 day"` rule then in force → deps-2.
- **Manual lockfile changes since `87b21dc9`:** `29adc6ac` (2026-10-17): nanoid 3.3.20 (12 days old), source-map-js 1.2.2 (17 days) → past release age. yaml@2.9.1 add (published 2026-09-11, landed 2026-10-09/10) → past.

<!-- prettier-ignore -->
| PR | Kind | Release-age check | Newest version published | Eligible | Verdict |
| --- | --- | --- | --- | --- | --- |
| #584 | major | `renovate/stability-days` pass | past 7 days (check) | now | DECISION (major) |
| #583 | major | pass | past 7 days (check) | now | DECISION (major) |
| #582 | non-major group, automerge | pass — direct packages only | rollup@4.64.10 2026-10-18T14:48Z; postcss@8.5.31 2026-10-18T19:39Z (transitive) | 2026-10-25T19:39Z | EXCLUDED |
| #581 | packageManager patch | pass | past 7 days (check) | now | IN BATCH |
| #580 | docker digest | pending | digest pushed 2026-10-17T04:04Z | 2026-10-24T04:04Z | EXCLUDED (also class C) |
| #579 | actions pin / bump | pending | newest release 2026-10-09T19:49Z | when check passes (likely missing timestamp) | EXCLUDED (class C) |
| #544 | security | none posted | — | bypass (security) | OTHER |
| #450 | lockfile maintenance | none (age check skips it) | content from 2026-08-28 | after rebase + cooldown decision | EXCLUDED |

### Volume

<!-- prettier-ignore -->
| Setting | Value (`main`) | What it would change | PRs saved this run |
| --- | --- | --- | --- |
| Grouping | non-major npm group (`:112-163`) matches `devDependencies` / `dependencies`; `packageManager` not matched → #581 solo (deps-15) | add `"packageManager"` to `matchDepTypes` of the non-major group rule | 1 (#581) |
| Schedule | `before 6am on Monday`, UTC (`:40-41`) | none; 6 non-security opens Sat 2026-10-17 (see `Bot Health`) | 0 |
| `prConcurrentLimit` / `prHourlyLimit` | 10 / 4 (`:93-94`); `branchConcurrentLimit` unset → follows `prConcurrentLimit` | none; nothing held | 0 |
| `rebaseWhen` | unset → `auto`: behind-base-branch for automerge PRs (#582), conflicted otherwise. 15 bkit-ci runs on `renovate/*` in 30 days (`gh run list --workflow bkit-ci.yml --created '>=2026-09-18' --limit 500 --json headBranch` filtered on `renovate/`); run 39121442307 re-pushed 7 PRs | `rebaseWhen: "conflicted"` → #582 stops re-running CI on every `dev` move | 0 PRs; 1 CI run per bot run after each `dev` push |
| Lockfile-maintenance schedule | own block, same Monday slot (`:71-74`) | monthly slot (e.g. `["before 6am on the first day of the month"]`) → fewer lockfile conflicts with weekly merges | 0 (#450 blocked) |
| Automerge | non-major devDeps group `automerge: true`, `platformAutomerge: true` (`:112-120`); repo `allow_auto_merge: false` → Renovate self-merges after checks | keep; gate on deps-10 | 0 |
| Major approval | unset (`:141-145`) | `dependencyDashboardApproval: true` on the majors rule (deps-9) | 2 (#583, #584) + their CI |
| `ignorePaths` | `:84-90`, omits `docs/plans/**` and the `:ignoreModulesAndTests` entries (deps-8) | add `"docs/plans/**"`, `"**/tests/**"`, `"**/__fixtures__/**"` | 2 (#583, #544) + 2 hunks of #579 |

### Classes

<!-- prettier-ignore -->
| PR | Class | Behind | Evidence (quoted) | Verdict |
| --- | --- | --- | --- | --- |
| #580 | C | 16 | Reproduced on a clean worktree (`72baf71f` + PR head, `pnpm exec vitest run .bkit/core/engine/audits/repo/dogfood-templates.test.ts`): `FAIL … this repo adopts its own templates > .cursor/Dockerfile` — `AssertionError: expected '# Cursor Background Agents Dockerfile…' to be '# Cursor Background Agents Dockerfile…'`. PR bumps `.cursor/Dockerfile` only; template copy is on an ignored path | EXCLUDED |
| #579 | C | 16 | Same repro: dogfood-templates fails for `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`; `.bkit/core/engine/audits/templates/template-action-pins.test.ts`: `AssertionError: Renovate does not scan .bkit/templates/** — bump the template pin by hand alongside the repo one, or add it to HELD_BACK with a reason: expected [ …(9) ] to deeply equal []` | EXCLUDED |
| #450 | B | 391 | Dashboard #328 "PR Edited (Blocked)"; `git merge --no-edit origin/renovate/lock-file-maintenance` in batch worktree → `CONFLICT (content): Merge conflict in pnpm-lock.yaml` | EXCLUDED (dropped at batch build) |

### Batch

- **Worktree:** `git worktree add --detach tmp/audit-deps-wt 72baf71f` (`origin/dev` = `72baf71f` at build). No branch; no push.
- **First build:** #582 → `abf703fe`, #581 → `74cb5cb5`. #582 dropped at `Screen` (cooldown miss) → worktree removed and re-added at `72baf71f` (no `git reset`).
- **#450:** `CONFLICT` in `pnpm-lock.yaml` → `git merge --abort`. Integration copy + regenerate = empty merge plus a full refresh with no cooldown (trap 2) → dropped.
- **Final batch:** `git merge --no-edit origin/renovate/pnpm-10.x` → `202c499b40e7714c2e09b517b00bcf6810cb2537` (`72baf71f` + #581). No lockfile-only PR in batch → no named-package refresh.
- **Out:** #582, #450 (dropped); #580, #579 (class C); #584, #583 (DECISION); #544 (OTHER).
- **Install:** `pnpm install --frozen-lockfile` → exit 0, "Done in 1.1s using pnpm v10.34.6".
- **Drift:** `git status --porcelain` → empty; `git diff --exit-code 202c499b -- package.json pnpm-lock.yaml` → exit 0, no output.
- **Lockfile integrity:** `grep -c "resolution: {"` = 193; `grep -c "resolution: {integrity: sha512-"` = 193 → every entry hashed.
- **Lockfile sources:** `grep -nE "tarball:|git\+|codeload\.github|github:|https?://" pnpm-lock.yaml | grep -v registry.npmjs.org` → 0 hits; no `.npmrc` → default registry `https://registry.npmjs.org/`.

### Screen

First build (`72baf71f` + #582 + #581) lockfile diff vs integration; package keys from `packages:` in each `pnpm-lock.yaml`, `comm` on sorted lists.

<!-- prettier-ignore -->
| Check | Hit | Evidence |
| --- | --- | --- |
| New packages (incl. transitive) | none | added-name list empty; removed: duplicate esbuild 0.28.1 |
| Changed versions | 9 | @types/node 24.19.2, lint-staged 17.6.0, prettier 3.9.10, tsx 4.23.15, vite 6.4.4, tinyexec 1.3.1, undici-types 7.24.6, rollup 4.64.10 (+ platform binaries), postcss 8.5.31 |
| New install scripts / allowlist prompts | none | no new package; only esbuild carries `postinstall: node install.js` (already ignored, deps-11) |
| Published < release age | **2** | rollup@4.64.10 2026-10-18T14:48Z, postcss@8.5.31 2026-10-18T19:39Z (`npm view <pkg> time --json`) → cooldown miss → #582 dropped, batch rebuilt |
| Publisher change / less provenance | none | `npm view <pkg>@<new> _npmUser dist.attestations` vs old version for each changed package |
| One edit from a popular name | none | no new names |

Final batch (#581): `pnpm-lock.yaml` identical to integration (`git diff --quiet 72baf71f 202c499b -- pnpm-lock.yaml` → exit 0) → no hits.

### Verification

In the final batch worktree at `202c499b`:

<!-- prettier-ignore -->
| Command | Exit | Output |
| --- | --- | --- |
| `git status --porcelain` | 0 | empty |
| `pnpm install --frozen-lockfile` | 0 | "Done in 1.1s using pnpm v10.34.6" |
| `pnpm bkit:gate:install-static-unit-build` | 0 | typecheck ok; lint skipped (no eslint config); `format:check`, `format:tables:check` ok; `lint:prose` 155 files, 0 errors, 4 warnings; `slop:delta` net 0; `vitest run` 170 files / 5652 tests passed (unit + integration); `test:coverage:unit` 128 files / 4464 tests, branches 80.17%; bats `1..31` ok; build ok |
| `git status --porcelain` | 0 | empty (no manifest rewrite, trap 1) |
| `pnpm bkit check` | 0 | clean |

- **Local E2E:** none — CLI package, no app, no deployed substrate; bats shell tier ran inside the gate.
- **Framework doctor:** none shipped (no Expo / framework CLI) → N/A.
- **Single-version check:** no runtime packages (`package.json` has no `dependencies`) → N/A. Dev tree carries esbuild 0.28.1 + 0.28.2 (via vite / tsx), build-time only.
- **Verdict:** final batch PASS; batch verdict **CONCERNS** (two PRs dropped).

### Plan

`dev` has no branch protection (`gh api repos/cbartens/bkit/branches/dev/protection` → 404) → batch lands by direct push, no feature-branch PR.

<!-- prettier-ignore -->
| Wave | PRs | Commits | Why together, or why apart | Pushes | CI runs |
| --- | --- | --- | --- | --- | --- |
| 1 | #581 | 1 (merge of `renovate/pnpm-10.x`) | only IN BATCH PR | 1 | 1 bkit-ci + 1 bkit-trivy (push) |

Landing commands (after the Monday 2026-10-19 06:00 UTC bot window, no Renovate run in progress: `gh run list --workflow bkit-renovate.yml --limit 1`):

```bash
git fetch origin
git switch dev && git pull --ff-only
git merge --no-edit origin/renovate/pnpm-10.x
pnpm install --frozen-lockfile && git status --porcelain   # must print nothing
pnpm bkit:gate:static-unit && pnpm bkit check
git push origin dev                                         # no skip-CI marker
gh pr close 581 --comment "<!-- bkit:dependency-triage --> Landed on dev in <merge-sha> (docs/audits/202610/dependencies.md)."
```

- **Cost:** one-by-one = batch for N = 1 (1 push, 1 integration run). CI already spent on bot branches: 15 bkit-ci runs on `renovate/*` in 30 days.
- **Rebases the landing triggers:** #582 (automerge → behind-base-branch) +1 CI; #579, #580, #584, #583, #544 only on conflict (none expected: #581 touches `package.json:45` only); #450 blocked → 0.
- **Automerge risk:** #582 is green with `renovate/stability-days` passing → Renovate may self-merge it on its next run, landing the 0-day rollup / postcss before 2026-10-25T19:39Z. Holding it is a person's call (dashboard or a one-off `automerge: false`); this run does not act.
- **Multi-cycle excludes:** #450 open since 2026-08-27 → close + let the dashboard recreate it after the cooldown decision (deps-2).
- **Watch:** `bkit-tests-check` (sole required check) and `bkit-trivy` on the landing push. No error tracker or crash-free metric for a CLI package; no thresholds invented. `.cursor/Dockerfile:54` still pins 10.34.4 after landing (deps-1).

### Excluded

Comment text starts with the marker; edit the existing marker comment where one exists (#450 has one from 2026-08-27).

<!-- prettier-ignore -->
| PR | Verdict | Labels | Comment text or DECISION evidence |
| --- | --- | --- | --- |
| #582 | EXCLUDED (inside release age) | `deferred` | `<!-- bkit:dependency-triage -->` Held: the lockfile pulls rollup@4.64.10 (published 2026-10-18T14:48Z) and postcss@8.5.31 (2026-10-18T19:39Z), inside the 7-day release age. Eligible 2026-10-25T19:39Z. Fix: none in the PR; land after that date. |
| #580 | EXCLUDED (class C) | `deferred` | `<!-- bkit:dependency-triage -->` Break: `dogfood-templates.test.ts` — `.cursor/Dockerfile` no longer matches `.bkit/templates/.cursor/Dockerfile` (template path is in `ignorePaths`). Fix: apply digest `c098726…` to the template copy on this branch. Digest eligible 2026-10-24T04:04Z. |
| #579 | EXCLUDED (class C) | `deferred` | `<!-- bkit:dependency-triage -->` Break: `template-action-pins.test.ts` + `dogfood-templates.test.ts` — 9 pins changed in `.github/workflows/*` are not mirrored in `.bkit/templates/.github/workflows/*`. Fix: mirror the 9 pins into the template copies; drop the 2 hunks under `docs/plans/**` (archived evidence). |
| #450 | EXCLUDED (dropped, class B) | `deferred` (present) | `<!-- bkit:dependency-triage -->` Dropped: 391 commits behind, `pnpm-lock.yaml` conflict, Renovate stopped rebasing after a manual commit. Fix: close; the dashboard recreates it after the lockfile-cooldown decision. |
| #584 | DECISION (breaking major) | `dep-major` (present) | vitest 5 release notes / migration guide: needs Node >=22.12 (CI: 24) and Vite >=6.4 (`^6.4.2`); `clearMocks` defaults to `true`; json / junit reporter output changes. Hit counts (`grep -rn` over `.bkit/core/engine`, `scripts`, `tests`, configs): `sequential` 0, `clearMocks` 0, `toThrow("")` 0, removed `vitest/*` entry points 0, `VITEST_POOL_ID` 0, `expect.poll` 0, `bench` 0; `--reporter=json --outputFile` 5 files (incl. `bkit-ci.yml:668`, `:774`); `vi.mock` / `vi.hoisted` 9 files (call-count assertions exposed to the `clearMocks` default). Codemod: none. Peers: `@vitest/coverage-v8` moves in lockstep in the PR. CI on #584: green. Rollback: revert the merge commit. Issue to open: adopt vitest 5. |
| #583 | DECISION (major, no live target) | `dep-major` (present) | actions v4→v7 in 2 archived files under `docs/plans/202610/logs/504-example-project/spike/` only; no running workflow changes. `<!-- bkit:dependency-triage -->` Closing: touches archived evidence only; ignored once `docs/plans/**` joins `ignorePaths` (deps-8). |
| #544 | OTHER (security bump, archived files only) | none | `<!-- bkit:dependency-triage -->` Closing: the bump applies to 3 archived spike `package.json` files nothing installs; the live pin `package.json:45` is already 10.34.5 (#455). Ignored once `docs/plans/**` joins `ignorePaths` (deps-8). |

### Unseen

**(a) Advisories vs baseline.** `node scripts/ci/check-dependency-audit.mjs` → "[dependency-audit] 1 blocking advisory(ies), all accepted and in date", exit 0. Baseline `scripts/ci/accepted-advisories.json`: braces GHSA-vfj7-8cjw-p6xm, expires 2026-11-16 (28 days). Not in baseline: 0. Stale entries: 0. Batch fixes none → no baseline edit. Open security PR #544 targets archived files only (`Excluded`); the live pnpm pin landed in #455.

**(b) Second source.**

<!-- prettier-ignore -->
| Source | Read | Result |
| --- | --- | --- |
| `pnpm audit --json` | full lockfile | 1 high: braces GHSA-vfj7-8cjw-p6xm |
| Dependabot alerts API | `gh api repos/cbartens/bkit/dependabot/alerts --paginate` | 0 open; braces #10 `auto_dismissed` |
| Trivy 0.75.0, `fs` on a lockfile copy, dev deps included | 193 packages (full read) | 1: braces CVE-2026-93687 HIGH, no fixed version |
| CI Trivy (`bkit-trivy.yml:50-51`) | skips `pnpm-lock.yaml` when `scripts/ci/check-dependency-audit.mjs` exists | lockfile covered by the audit script only (by design, `:43-44`) |
| Shipped images | `.cursor/Dockerfile` not built or scanned | `Not Checked` |

- braces: dev-only — `slop-scan > globby > fast-glob > micromatch > braces` (baseline reason); called by `pnpm lint:slop` / `slop:delta` on repo-owned globs; no patched release (advisory published 2026-09-18). Reachability → `bkit-audit-security`.

**(c) Fix latency** (baseline series; `package.json` has no `dependencies` → nothing shipped, no latency finding on shipped code):

<!-- prettier-ignore -->
| Advisory | Package | Severity | Published | Landed | Days | Exposure |
| --- | --- | --- | --- | --- | --- | --- |
| GHSA-c59q-g84q-2gj5 | pnpm (`packageManager`) | HIGH | 2026-09-02 | 2026-10-13 (#455, `16b98bb3`) | 41 | tooling; shipped template line still open → deps-1 (47 days) |
| GHSA-2v37-7h3g-55p8 | nanoid | HIGH | 2026-07-29 | 2026-10-17 (`29adc6ac`) | 80 | dev-only |
| GHSA-68fv-2mgg-jv7q | source-map-js | HIGH | 2026-09-18 | 2026-10-17 (`29adc6ac`) | 29 | dev-only |
| GHSA-vfj7-8cjw-p6xm | braces | HIGH | 2026-09-18 | open, no fix; accepted to 2026-11-16 | 31+ | dev-only |

**(d) Container install path.** `.cursor/environment.json` `install: pnpm install --frozen-lockfile` → manifest-covered. Second install lines bypassing manifests: Node via nodesource script and gh via apt (deps-5), pnpm via Corepack 10.34.4 (deps-1), Vale tarball (deps-6). Cloud setup (`.bkit/shared/.claude/bkit-cloud.md`): pnpm derived from `packageManager`; gh `releases/latest` (deps-5); Vale, gh, jq unchecksummed (deps-6).

**(e) Unused / unmaintained.** Unused → `bkit-audit-dead-code`. New deps since `87b21dc9`: `yaml` ^2.9.1 (dev) — 2.9.1 published 2026-09-11, `eemeli/yaml` not archived, pushed 2026-09-23 → maintained; `bkit: link:.` (self-link). Not new but >1 year without a release: husky 9.1.7 (2024-11-18), dev-only → `Recommendations`.

**(f) Deprecated / abandoned.** `npm view <name>@<version> deprecated` over all 193 locked versions → 0 deprecated. Frozen install: no deprecation warning (only "Ignored build scripts: esbuild@0.28.1, esbuild@0.28.2"). Abandonment preset off (deps-3) → no dashboard signal.

**(g) Licences.** `pnpm licenses list --json`: dev tree MIT 79, ISC 6, BSD-3-Clause 4, Apache-2.0 2; production tree empty (`--prod`) → no diff, no copyleft. New since last pass: yaml (ISC). slop-scan: npm metadata has no `license` field; repo MIT with a LICENSE file (dev-only). bkit bundles no third-party code, fonts, or icons → no notices to regenerate.

**(h) Off-manifest CLIs** (latest read live 2026-10-18/19):

<!-- prettier-ignore -->
| CLI | Location | Pin | Latest | Majors behind | Bot-watched | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Renovate | `bkit-renovate.yml:68` (action default image) | `:43` floating | 44.167.5 | 1 | no | deps-4 |
| bats | `bkit-ci.yml:676` | floating (`npx --yes bats`) | npm 1.13.0; bats-core 1.14.0 | 0 | no | deps-12 |
| Node | `.cursor/Dockerfile:23` + template | floating 20.x (nodesource script) | repo runs 24 | end of life → `End of Life` | no | deps-5 |
| gh | `.cursor/Dockerfile:38-42` + template (apt); `bkit-cloud.md:61-62` (`releases/latest`) | floating | — | — | no | deps-5 |
| pnpm (Corepack) | `.cursor/Dockerfile:54` + template | 10.34.4 | 10.34.6 | 0 | no | deps-1 |
| pnpm (cloud setup) | `.bkit/shared/.claude/bkit-cloud.md` render (`.claude/bkit-cloud.md:276`) | from `packageManager` | — | 0 | via manifest | pass |
| Vale | `bkit-ci.yml:478`, `bkit-cloud.yml:479-483`, `.cursor/Dockerfile:46`, `bkit-cloud.md:47` | 3.9.1 | 3.24.0 (2026-10-01) | 0 | no | deps-14; checksum gap deps-6 |
| actionlint | `bkit-ci.yml:525` | 1.7.12 (SHA-pinned script) | 1.7.12 | 0 | no | deps-14 |
| graphifyy | `bkit-ci.yml:573` | 0.9.50 | 0.9.92 | 0 | no | deps-14 |
| @opencode/cli | `bkit-cloud.yml:545` | 2.0.26 | 2.0.32 | 0 | no (`:541` says no updater bumps it) | deps-14 |
| jq | `bkit-cloud.md:72` | 1.7.1 | 1.8.2 | 0 | no | deps-14 |
| uv | `bkit-ci.yml:567` (`setup-uv` `version:`) | 0.12.6 | 0.13.1 | 0 | yes (#579 bumps to 0.13.0) | pass |
| Trivy | `bkit-trivy.yml:63` (`docker://…:0.75.0@sha256`) | 0.75.0 + digest | 0.76.0 (2026-10-14) | 0 | yes — github-actions manager reads `docker://`; file landed in `72baf71f`, after the last bot run | pass |
| supabase CLI (commented example) | `.cursor/Dockerfile:63` + template | `releases/latest` if uncommented | — | — | no | `Recommendations` |
| serena-agent | `.claude/bkit-cloud.md:289` | 1.7.0 | 2.0.0 | 1 | — | out of scope (tool server → `bkit-audit-agents`) |

### End of Life

Sources: endoflife.date `nodejs` (updated 2026-10-15), `pnpm` (2026-10-16), `ubuntu` (2026-10-10), read 2026-10-18; vite.dev/releases. Days from 2026-10-18.

<!-- prettier-ignore -->
| Runtime | Version in use | Where | End of life | Days left | Verdict |
| --- | --- | --- | --- | --- | --- |
| Node | 24 | `.nvmrc`, CI, `release.yml:33` | 2028-04-30 (active support ends 2026-10-20) | 560 | pass |
| Node | 20 | `package.json:43` engines floor; `.cursor/Dockerfile:23` | 2026-04-30 | −171 | DECISION → deps-7 (floor), deps-5 (image) |
| pnpm | 10 | `package.json:45` | 2027-04-30 | 194 | pass; pnpm majors held (`renovate.json5:224`) → no bot PR will flag it |
| Ubuntu | 26.04 | `.cursor/Dockerfile:15` | 2031-05-29 | ~1684 | pass |
| Vite | 6.4 (dev build tool) | `package.json` devDeps + override | security patches only; no date published | — | watch; vite majors held (`renovate.json5:223`) |
| TypeScript | 7 | `package.json` devDeps | no fixed EOL policy | — | N/A |
| Database / framework / native SDK | none | — | — | — | N/A |

### Recommendations

Lines go in the repo copy and, where marked, the template copy under `.bkit/templates/` (dogfood test keeps them byte-identical).

<!-- prettier-ignore -->
| # | Area | Recommendation / line to add | Feeds |
| --- | --- | --- | --- |
| R1 | Cursor Dockerfile (+ template) | `RUN corepack enable && corepack prepare pnpm@10.34.5 --activate` (= `packageManager`), plus a `customManagers` regex rule so the bot moves it with `package.json:45` | deps-1 |
| R2 | Cursor Dockerfile (+ template) | Node from `.nvmrc` major (24): digest-pinned `node:24-<distro>` stage, or `ARG NODE_VERSION=24.x.y` + tarball verified against nodejs.org `SHASUMS256.txt`; gh via a pinned release tarball + sha256 instead of the floating apt package | deps-5 |
| R3 | Dockerfile + `.bkit/shared/.claude/bkit-cloud.md` | `echo "${VALE_SHA256}  vale_${VALE_VERSION}_Linux_64-bit.tar.gz" \| sha256sum -c -` (CI's value, `bkit-cloud.yml:480`); same for gh (`GH_VERSION` pinned) and jq | deps-5, deps-6 |
| R4 | `renovate.json5` (+ template) | `extends: ["config:best-practices", ":dependencyDashboard"]` | deps-3 |
| R5 | `bkit-renovate.yml` (+ template) | `with: renovate-version: "<exact 44.x>"` with a `# renovate: datasource=docker depName=ghcr.io/renovatebot/renovate` comment and a matching custom manager; run the validator on 44 first | deps-4 |
| R6 | `renovate.json5` (+ template) majors rule `:141-145` | `dependencyDashboardApproval: true` | deps-9 |
| R7 | `renovate.json5` (+ template) `ignorePaths` | add `"docs/plans/**"`, `"**/tests/**"`, `"**/__fixtures__/**"` | deps-8 |
| R8 | `renovate.json5` | `rebaseWhen: "conflicted"`; `lockFileMaintenance.schedule: ["before 6am on the first day of the month"]` | Volume |
| R9 | `renovate.json5` non-major group rule `:112-120` | `matchDepTypes: ["devDependencies", "packageManager"]` | deps-15 |
| R10 | new `pnpm-workspace.yaml` | `trustPolicy: no-downgrade`, `blockExoticSubdeps: true`, `strictDepBuilds: true`, and an explicit build decision for esbuild (`onlyBuiltDependencies: [esbuild]` or `ignoredBuiltDependencies: [esbuild]`) | deps-11 |
| R11 | DECISION: lockfile cooldown | Options: pnpm `minimumReleaseAge: 10080` (re-decides the recorded trade-off, `docs/deployments.md:423`); automerge off for the non-major group; manual hold of lockfile maintenance until its newest version is 7 days old | deps-2, deps-10 |
| R12 | DECISION: engines floor | `"node": ">=22"` or `">=24"`; update `docs/technology.md:25` in the same change | deps-7 |
| R13 | DECISION: #584 vitest 5 | open an issue to adopt it; evidence in `Excluded` | #584 |
| R14 | `bkit-ci.yml:676` | `bats` exact devDependency + `pnpm exec bats tests/*.bats`; update `docs/technology.md:71` | deps-12 |
| R15 | off-manifest pins | `customManagers` regex rules for `VALE_VERSION`, `GRAPHIFY_SPEC`, `@opencode/cli@`, jq; checksum-paired pins (Vale, actionlint) still need a hand-updated sha256 (`renovate.json5:209-212`) | deps-14 |
| R16 | Template mirror cost | every github-actions / docker PR is class C by design (`docs/deployments.md:503`); consider Renovate `postUpgradeTasks` that mirror into `.bkit/templates/` (needs global `allowedCommands` on the self-hosted runner) | #579, #580 |
| R17 | Repo variable (manual) | set `vars.RENOVATE_GIT_AUTHOR` (`bkit-renovate.yml:89-92`) — run log warns of the default `renovate@whitesourcesoftware.com` | Bot Health |
| R18 | PR hygiene (manual) | close #450; hold #582 until 2026-10-25T19:39Z; close #583 and #544 after R7 lands | deps-13, `Excluded` |
| R19 | OpenSSF Scorecard | no Scorecard workflow; adopt `ossf/scorecard-action` (SHA-pinned) on `main` | Standards |
| R20 | husky | last release 9.1.7 (2024-11-18); dev-only; watch via `abandonments:recommended` (R4) | Unseen e |
| R21 | Dockerfile example `:63` (+ template) | commented supabase line uses `releases/latest`; pin a version in the example | Unseen h |

### Checked

- Bot configs (Renovate on `main` + `dev`, Dependabot absence), runner workflow, validator, dashboard #328, Renovate run log 39121442307.
- All 8 open `renovate/*` PRs: files, labels, behind-count, CI, release-age check; class C repro for #579 / #580 in a clean worktree.
- Batch build, screen, frozen install, drift check, full local gate, `bkit check` in a throwaway worktree (removed).
- Lockfile integrity (193/193) and sources (0 off-registry).
- Advisories: baseline script, `pnpm audit`, Dependabot alerts, Trivy on the lockfile; fix latency for 4 advisories.
- Deprecation over all 193 locked versions; licences dev + prod trees; new dependency `yaml`.
- Off-manifest CLIs in CI workflows, Cursor Dockerfile (+ template), cloud setup source and render.
- End of life: Node, pnpm, Ubuntu, Vite.
- Dependency-touching commits `87b21dc9..72baf71f`.

### Not Checked

- **Mend Renovate App install state:** `gh api user/installations` → `HTTP 403`; the endpoint needs a GitHub App user access token, no allow rule clears it. Check repo Settings → Integrations → GitHub Apps by hand.
- **OSV-Scanner:** not installed → Trivy + `pnpm audit` + Dependabot stand in.
- **lockfile-lint:** not installed → integrity and source checks by `grep` (`Batch`).
- **Cursor image scan:** `.cursor/Dockerfile` not built or scanned (Cursor builds it).
- **Why #579–#584 opened outside the schedule:** run log does not record whether creation was dashboard-forced.
- **Why #579's release-age check stays pending:** not in the log; missing release timestamp is the likely cause.
- **Landing push CI:** next step's result, by design.
- **braces reachability beyond naming the call:** → `bkit-audit-security`.

### Standards Coverage

**Versions read** (baseline — no previous report to diff):

<!-- prettier-ignore -->
| Standard | Version / date read | Note |
| --- | --- | --- |
| Renovate docs + presets | 44.167.5, read 2026-10-18 | bot in use 43.288.0; docs banner says 44 was "accidentally released as major" |
| pnpm settings + supply-chain page | 10.x, read 2026-10-18 | — |
| npm provenance / trusted publishing | docs.npmjs.com, read 2026-10-18 | — |
| OpenSSF Scorecard | v5.6.0 (2026-10-12) | — |
| OpenSSF Concise Guide | revision 2025-04-23 | — |
| Vulnerability sources | GitHub Advisory Database (live), Trivy 0.75.0 DB, `pnpm audit` | OSV-Scanner not run |
| Lockfile linter | lockfile-lint not installed | checks by hand |
| endoflife.date | read 2026-10-18 | — |
| SPDX License List | 3.29.0 (2026-09-16) | — |
| Install-script attacks | Shai-Hulud (Sep 2025), Shai-Hulud 2.0 (Nov 2025) | worm spreads through `preinstall` / `postinstall`; defences mapped to deps-2, deps-10, deps-11 |

**Bot presets and package-manager settings:**

<!-- prettier-ignore -->
| Item | Status |
| --- | --- |
| `config:recommended` | checked (Step 4) — in use |
| `config:best-practices` | finding deps-3 → adopt |
| `docker:pinDigests` | finding deps-3 → adopt |
| `helpers:pinGitHubActionDigests` | checked (Step 4) — equivalent rule `renovate.json5:193-200` |
| `:configMigration` | finding deps-3 → adopt |
| `:pinDevDependencies` | finding deps-3 → adopt with the preset, or reject (lockfile already fixes versions) — person decides |
| `abandonments:recommended` | finding deps-3 → adopt |
| `security:minimumReleaseAgeNpm` | checked (Step 4) — superseded by `"7 days"` |
| `:maintainLockFilesWeekly` | checked (Step 5) — own `lockFileMaintenance` block; cooldown gap deps-2 |
| `:dependencyDashboard` | checked (Step 3) — in use |
| `internalChecksFilter: "strict"` | checked (Step 4) — default |
| Dependabot `cooldown` | not applicable — no Dependabot version updates here (template has it since `de57a728`) |
| pnpm `minimumReleaseAge` | DECISION deps-2 (recorded trade-off) |
| pnpm `trustPolicy: no-downgrade` | finding deps-11 |
| pnpm `blockExoticSubdeps` | finding deps-11 |
| pnpm `allowBuilds` / `onlyBuiltDependencies` | finding deps-11 |
| pnpm `strictDepBuilds` | finding deps-11 |
| npm provenance (own package) | checked (Step 4) — pass |
| Provenance of changed dependencies | checked (Step 9) — no downgrade |
| OpenSSF Scorecard workflow | not adopted → adopt (R19) |
| Lockfile-integrity linter | checked by hand (Step 8); adopt lockfile-lint in CI → reject: integrity + source greps are two lines; frozen install already fails on mismatch |

**Concise Guide rules** — subject: `yaml` ^2.9.1, the only new direct dependency since `87b21dc9` (dev-only, test YAML parsing):

<!-- prettier-ignore -->
| Rule | Status |
| --- | --- |
| Consider Necessity | checked (Step 13 e) — replaces python / ruby parsing in tests (`docs/technology.md:70`) |
| Verify Authenticity | checked — npm `yaml`, publisher `eemeli` = owner of `eemeli/yaml` |
| Activity Level | checked — repo pushed 2026-09-23 |
| Communication | checked — issue tracker open, 38 open issues |
| Maintainer Diversity | checked — 1 npm maintainer, 5+ contributors; single-publisher risk accepted for a dev-only parser |
| Release Recency | checked — 2.9.1 on 2026-09-11 |
| Version Stability | checked — 2.x since 2022-04-06, minor / patch only |
| Assessment Framework | not applicable — dev-only, not shipped |
| Best Practices Certification | not applicable — dev-only; OpenSSF badge not looked up |
| Dependency Management | checked — `yaml@2.9.1` has no dependencies |
| Repository Security | not applicable — dev-only |
| Security Audits | not applicable — dev-only |
| Security Development | not applicable — dev-only |
| Security Documentation | checked — no `SECURITY.md` (`gh api repos/eemeli/yaml/contents/SECURITY.md` → 404); dev-only → no finding |
| Security Response | checked (Step 13 a-b) — no advisory against `yaml` in any source |
| Security Scores | not applicable — dev-only; Scorecard not run per dependency |
| Testing Practices | checked — package `test` / `test:all` scripts (jest, type tests) |
| Vulnerability Status | checked (Step 13 b) — clean |
| Interface Design | not applicable — test-only use |
| Interface Stability | checked — semver 2.x |
| Secure Defaults | not applicable — parses repo-owned YAML in tests |
| Security Guidance | not applicable — dev-only |
| Vulnerability Reporting | checked — no `SECURITY.md`; dev-only → no finding |
| License Clarity | checked (Step 13 g) — ISC |
| Name Verification | checked (Step 9) — exact name, not one edit from another popular package |
| Adoption | checked — 1697 stars |
| Suitability | checked — YAML 1.2 parser used for workflow YAML |
| Behavior Testing | checked (Step 10) — gate green with it |
| Dependency Impact | checked — zero transitive dependencies |
| Code Completeness | not applicable — dev-only |
| Malicious Code Check | checked (Step 9) — no `preinstall` / `install` / `postinstall` script |
| Sandbox Testing | not applicable — no install script to sandbox |
| Security Implementations | not applicable — dev-only |
| Security Reviews | not applicable — dev-only |
| Static Analysis | not applicable — dev-only |
| Test Validation | checked (Step 10) — test suite exercises it |

### Beyond the Steps

**(a) Dependency-touching changes `87b21dc9..72baf71f`:**

- `package.json` — picomatch (runtime) + `@types/picomatch` removed → bkit now ships zero runtime dependencies (`docs/technology.md:46` matches); `bkit: link:.` added → self-link, no registry fetch; `yaml ^2.9.1` added → evaluated above; `packageManager` 10.34.4 → 10.34.5 (#455, `16b98bb3`) → security fix, Dockerfile line missed (deps-1).
- `pnpm-lock.yaml` — `8dc60537`, `ef1f09a7`, `f7879e34` (direct-dependency add / remove) → frozen install exit 0; `29adc6ac` manual advisory fix → versions past release age.
- `.github/renovate.json5` (+ template) — `de57a728` release age 1 day → 7 days → stronger; `9e15dae2`, `53447d4f`, `3b8d9468`, `6d1c82d7`, `cd795688`, `c1061167`, `72baf71f` → comment / layout; effective settings as in `Supply Chain`.
- `.bkit/templates/.github/dependabot.yml` — `de57a728` adds `cooldown` → stronger.
- `.cursor/Dockerfile` (+ template) — `10688043`, `6d1c82d7`, `cd795688` → still pnpm 10.34.4 and Node 20 (deps-1, deps-5).
- Workflow `uses:` — `17c83919`, `81c586bc`, `f6c7f0dd`, `f7879e34`, `7cef472f`, `6779c516` (drops the `@claude` workflow), `72baf71f` (adds `bkit-trivy.yml`, digest-pinned) → every `uses:` SHA- or digest-pinned.
- Release pipeline — `52e3e498`, `609b9ce8` → npm OIDC trusted publishing + `--provenance` → stronger.
- `.nvmrc` — unchanged (24).

**(b) Bounded pass:**

- Template parity tests turn every github-actions / docker bot PR into class C until a person mirrors the pin by hand (`docs/deployments.md:503`). Two PRs blocked this run; recurs every bump → R16.
- An automerge group can land on any bot run after `dev` moves: #582 is green with its release-age check passing while it carries 0-day transitives (Plan, deps-10).
- `docs/technology.md:25` (`>=20`) and `:71` (`npx --yes bats`) record two findings' current state; fixes must update them in the same change.
- New `docs/failures.jsonl` rows since `87b21dc9`: none dependency-related. No `bkit-audit-logs` report under `docs/audits/`. Vendor: Renovate 44 docs banner (accidental major) — the `:43` image is still past support per the npm notice (deps-4).

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Pin and checksum every install in the Cursor Dockerfile template and cloud setup (pnpm = `packageManager`, Node from `.nvmrc`, exact gh, sha256 for Vale / gh / jq) | deps-1, deps-5, deps-6 | HIGH | `/bkit-build` | change clear; target values already in `package.json:45`, `.nvmrc`, `bkit-cloud.yml:480` |
| 2 | Decide a cooldown for lockfile changes from lockfile maintenance and automerge groups | deps-2, deps-10 | HIGH | `/bkit-design` | options open and one re-decides a recorded trade-off (`docs/deployments.md:423`) |
| 3 | Harden the Renovate examples: `config:best-practices`, exact runner image, majors behind dashboard approval, `ignorePaths` for archived plans and tests | deps-3, deps-4, deps-8, deps-9 | MEDIUM | `/bkit-build` | change clear; lines in `Recommendations` R4–R7 |
| 4 | Add pnpm supply-chain settings in `pnpm-workspace.yaml` | deps-11 | MEDIUM | `/bkit-build` | settings and values named (R10) |
| 5 | Raise the `engines.node` floor off end-of-life Node 20 | deps-7 | MEDIUM | `/bkit-design` | consumer-facing contract; floor (22 vs 24) and release impact undecided |
| 6 | Pin bats in CI | deps-12 | MEDIUM | `/bkit-build` | change clear (R14) |
| 7 | Watch pinned off-manifest CLIs with Renovate custom managers and group `packageManager` updates | deps-14, deps-15 | LOW | `/bkit-build` | config lines named (R9, R15) |

### Process Improvements

**Universal** (proposed template changes; template untouched):

- `Findings` MEDIUM row "Updater config that does not exclude `.github/workflows/bkit-cloud.yml`" contradicts `docs/deployments.md:400` and the template Renovate comment (`.bkit/templates/.github/renovate.json5:79-83`): copied workflows are consumer-owned and stay out of `ignorePaths`. Replace with "Updater config that scans bkit-owned trees (`.bkit/templates/**`, `.agents/skills/**`)". Not raised this run.
- Step 5: Renovate's release-age check ages the named packages only; an automerge group that rewrites the lockfile pulls transitive versions with no gate. Add "automerge groups that rewrite the lockfile: newest transitive version vs bot release age" — this run caught it only at Step 9.
- Step 6: a repo-level `ignorePaths` replaces `config:recommended`'s `:ignoreModulesAndTests` list. Add "read the dashboard's detected-file list for archived evidence, fixtures, and test trees".
- Step 7: when a repo dogfoods templates on bot-ignored paths, every action / docker bump fails a parity test by design. Add "class C, fix = mirror into the template copy" as a named sub-case, counted in Step 16 for recurrence.
- Pre-Flight `Permissions`: an API 403 from an endpoint that needs another token type (e.g. `GET /user/installations`) is not a harness block — record it in `Not Checked`; no allow rule applies.

**Project** (applied below `bkit:end` in `docs/templates/bkit-audit-dependencies.md`):

- Filled the empty `## Project Instructions`, keyed by `Pre-Flight / Dependencies`, `Permissions`, `Bot Health`, `Inventory`, `Classify`, `Batch`, `Verification`, `Unseen`, `End of Life`, `Excluded`: exact commands that worked, validator recipe, template-twin surfaces and parity tests, comment marker, end-of-life sources, the 403 note; doctrine cited by `docs/deployments.md` section, not copied.

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [x] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [x] **Summary:** names count per severity, the batch verdict, and open / in-batch / excluded counts.
- [x] **Series:** security-fix latency and end-of-life days beside previous report's numbers, or marked baseline.
- [x] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed. (Plus the `docs/failures.jsonl` ledger append the audit process requires.)
- [x] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [x] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->
