<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

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

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Git Host:** Steps 2, 3, 11, 12 — open PRs by head-ref prefix, CI runs, behind-count, e.g. `gh`, GitLab API. Fallback: none; PR steps `Not Checked`, batch verdict `FAIL`.
- [ ] **Package Manager:** Steps 5, 8–10 — install, lockfile, registry metadata, e.g. pnpm, npm. Fallback: none; `Batch` and `Verification` `Not Checked`, batch verdict `FAIL`.
- [ ] **Clean Worktree:** Steps 8–10 — detached worktree off the integration branch, removed before the report finishes. Fallback: none; do not build the batch in the main checkout.
- [ ] **Web:** Steps 13–15 — latest CLI releases, anchor standards, end-of-life dates, vendor support policy. Fallback: versions and days-left recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Bot Dashboard:** Bot publishes a dashboard → Step 3 — blocked and will-not-rebase entries. Fallback: open PRs only; stopped-rebase set `Not Checked`.
- [ ] **Config Validator:** Bot ships one → Step 3 — e.g. `renovate-config-validator`, on the config as the default branch has it. Fallback: read the files; validity `Not Checked`.
- [ ] **Vulnerability Scanner:** Lockfile, image, or requirements file → Step 13 — e.g. Trivy (`trivy fs --include-dev-deps`), OSV-Scanner, `npm audit`, host advisory API. Fallback: one source only; the missing source `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** From previous report, list deferred PRs and why. Deferred major whose blocker cleared → first candidate. Select open PRs by head-ref prefix from updater config (`branchPrefix`, default `renovate/`; Dependabot `dependabot/`), never title or author. Token-authored PR on prefix = in scope; record author as evidence, not selector. Per PR: number, title, head ref, head SHA, mergeable, merge state, files, labels, commits behind integration branch, latest CI run (finished only; in-progress ≠ result). **Done when:** `Inventory` names prefix and config source, lists every open PR on prefix, or `none`.
- [ ] **Step 3 — Bot Health:** No dependency updater config = CRITICAL. Examples: Renovate (`.github/renovate.json` or `.github/renovate.json5`; rules example `.bkit/templates/.github/renovate.json5`, self-hosted runner example `.bkit/templates/.github/workflows/bkit-renovate.yml`) or Dependabot (`.github/dependabot.yml`; example `.bkit/templates/.github/dependabot.yml`). See `docs/deployments.md` § Dependency updaters. Both configs = finding; keep one. Bot dashboard: gather-only (bot rewrites). Record blocked entries and will-not-auto-rebase notices → stale until person acts. Bot reads presets from default branch, not integration. Fence / group on integration branch inactive until release carries it. Base-config edits on integration apply only if bot merges base-branch config — option read from default branch. PR proposes what integration config blocks → read default-branch copy before debugging rule; promotion-lag when branches differ = signal. Validate configs as default branch has them. Dashboard + logs: config errors, PRs held by concurrency / hourly limits, awaiting approval, open config-migration PRs. Broken config ≈ quiet week. **Done when:** `Bot Health` holds blocked PRs, config read branch, validator result, held / awaiting-approval items.
- [ ] **Step 4 — Supply Chain:** Read settings as default branch has them. Record each vs bot best-practice preset and package manager supply-chain page. Bot: minimum release age >= three days (e.g. Renovate `minimumReleaseAge` / `security:minimumReleaseAgeNpm` + `internalChecksFilter: "strict"`; Dependabot `cooldown`); actions / images digest-pinned; abandonment flagging (e.g. Renovate abandonments preset); config-migration PRs enabled, where bot offers them. Package manager, where offered (e.g. pnpm): trust policy no-downgrade, exotic subdeps blocked, explicit install-script allowlist, strict dependency builds; none offered → `N/A` with evidence. Release-age 0 on package manager = recorded trade-off where docs say so; re-deciding = person (`DECISION`). Gap: bot release age does not apply to lockfile-maintenance PRs (package manager makes changes; gate off → no cooldown) → batch with no cooldown; `Cooldown` stands in; `Screen` first. Missing / weaker setting → `Recommendations` row + line to add. **Done when:** `Supply Chain` row per setting: value · standard · verdict.
- [ ] **Step 5 — Cooldown:** Package-manager cooldown off or absent → lockfile-maintenance PRs: no automerge; same age wait as other updates before land. Bot opens no lockfile-maintenance PRs (e.g. Dependabot) → those checks `N/A`. Check: lockfile-maintenance block + matching rules → no automerge; each merged lockfile-maintenance since previous run waited >= bot release age (e.g. Renovate `minimumReleaseAge`; newest version publish → merge); open younger → EXCLUDED + eligible date. Same wait on other open non-security PRs: release-age check pending (e.g. `renovate/stability-days`) or newest version younger than bot release age → EXCLUDED + eligible date. Security PRs bypass (Step 13). Lockfile-maintenance automerged or landed before release age = finding. **Done when:** `Cooldown` holds automerge, each merged PR wait, each open PR eligible date.
- [ ] **Step 6 — Volume:** Each bot PR = lockfile rewrite + preview + CI; each rebase = another CI. Read on default branch; record what each setting would change; lines to add → project-owned bot config. Grouping: related packages one PR (`group:monorepos`, `group:allNonMajor`, or equivalent). List solo opens that should group + catching rule. Schedule: one window; note outside opens (non-security) + why. Limits: concurrent, hourly, branch-concurrent; record held-back PRs. Rebase policy: conflict-only rebases skip CI on every integration move; unset → record default + count rebase pushes since previous run. Lockfile PR conflicts with most dependency merges; lockfile maintenance own schedule, not every bot run. Automerge: low-risk groups passing CI via platform automerge; lockfile maintenance must not automerge while `Cooldown` off. Majors await dashboard approval; unset → major PR + CI before decision. Setting cutting PRs / CI → `Recommendations` + line + PRs saved this run. **Done when:** `Volume` row per setting: value · what it would change · PRs saved.
- [ ] **Step 7 — Classify:** Every PR that is not green. Quote the evidence line from the log. When nothing matches, the class is C.
  - **A — infrastructure:** preview-deploy wait timeout, registry fetch failure, a cold service refusing, a cancelled runner. Confirm: the same job passed on a neighbouring run or a retry of the same commit.
  - **B — stale:** outdated lockfile, lockfile config mismatch, a merge conflict, merge state dirty, behind the integration branch. Confirm: behind-count. Being behind says nothing about the dependency itself.
  - **C — real:** the failure survives a clean rebase onto the integration branch. Confirm: reproduce it on the batch worktree. Only C keeps a PR out of the batch.

  Batch = green + A + B past bot release age. C → EXCLUDED → `Excluded`. Breaking major → DECISION even if IN BATCH. Non-security inside release age → EXCLUDED even if IN BATCH (Step 5). **Done when:** `Classes` row per non-green PR: class · behind-count · quoted evidence · verdict.

- [ ] **Step 8 — Batch:** Detached worktree off integration branch; no new branch. Merge each IN BATCH PR (`git merge --no-edit`); do not push. Lockfile conflict: never text-resolve → integration copy + regenerate (`git checkout <integration> -- <lockfile>`, `git merge --continue` in worktree only). Manifest conflict between batch PRs: higher version wins if not breaking major; else drop lower, record `replaced by #N`. Higher = breaking major → DECISION out; keep lower line, record major not taken. Manifest vs integration (not another PR): higher version line by line. Other conflict → abort merge, drop PR, record why. Record merged commit; install; lockfile-only PRs → refresh exactly named packages. Traps: (1) install rewrites manifests + lockfile (e.g. pnpm catalog, root `package.json`) — uncommitted edits fail frozen CI, pass locally. (2) recursive update rewrites bot-unproposed ranges in big diff — refresh named packages only. (3) partial refresh → split workspace versions; red typecheck / build → clean integration worktree first; fix = one version everywhere incl. shared version catalog (e.g. pnpm catalog). Drift: every manifest byte-identical to merged commit; quote diff command, exit code, output. Do not commit integration branch; never skip-CI marker. Lockfile sources: integrity hash per entry; tarballs from configured registry over HTTPS; both searches empty — quote hits + pulling package. **Done when:** `Batch` holds worktree commit, PRs in/out + why, drift check, both source searches.
- [ ] **Step 9 — Screen:** Batch lockfile diff vs integration — list: new packages (transitive incl.); new install scripts + allowlist prompts; versions published < bot release age before run (lockfile-maintenance first); publisher change or less provenance (trust policy refuses when set); names one edit away from a popular package. Worms via `postinstall` — read every new script. Package still inside release age = Cooldown miss → drop PR, rebuild. Other hits → verdict unchanged; `Recommendations` row + evidence for approver. **Done when:** `Screen` lists each hit, or `none`.
- [ ] **Step 10 — Verify:** `git status --porcelain` empty first (trap (1) in dirty tree). Frozen install → static / unit / integration gate → local E2E per app (store build vs deployed env tests none of batch — use local-build substrate). Beyond green typecheck: framework dependency doctor, where the framework ships one (e.g. `expo-doctor`; SDK-out-of-range packages compile/typecheck then break native/app); single-version check for runtime packages in `Project Instructions` (two versions = trap (3) — report + one version everywhere). Red may be stale install — clear installed deps (e.g. `node_modules`, `.venv`, `target/`), frozen install, re-run before blaming bump. Red check → drop suspect PR, rebuild batch, re-run; no single PR explains → FAIL. **Done when:** `Verification` quotes every command and exit code; `Summary` has PASS, CONCERNS, or FAIL.
- [ ] **Step 11 — Plan:** Report asks and stops — no push, merge, close, label. Direct-push integration branch → batch lands without feature-branch PR. Deployed-boundary checks on push only → landing push = batch meets external services. Never merge bot PRs one-by-one: N sequential → N integration runs + rebase per open PR after each; N one push → one integration run. `Plan` table columns: `Wave`, `PRs`, `Commits`, `Why together, or why apart`, `Pushes`, `CI runs`. Rules: (1) Default one wave — all IN BATCH in one push; commit series (not squash): non-major groups, then one commit per major each with install matching manifests; each commit revert/bisect point; CI once on push head — `Verify` head; earlier commits → frozen install + typecheck. (2) Second wave only for named reason — bisectability not enough; reason = production watch before next land (SDK / framework / native major, store build/submission, DB-client major); extra wave = +push, +integration run, rebase on open PRs — cost in row. (3) Order: security → non-majors → majors; within majors dependency before dependents (language before linter; UI lib + types together). (4) Unmerged automerge group → batch; self-merge first = separate push + rebases — fold in and close at push; merged pre-landing → rebase batch, drop from plan. (5) Close carried PRs right after push with `Excluded` comment → landing commit; bot auto-close next run only — until then may rebase + CI. (6) Land after bot weekly window, no mid-landing opens/rebases, no queued integration push. (7) List excluded/deferred PRs landing will rebase + CI cost; multi-cycle exclude → rebase each later push — recommend close + dashboard when wanted. (8) No skip-CI on dependency change; required checks test batch. Then ordered landing commands: push, close PRs + comments, labels for open. Cost one-by-one vs batch + CI already spent on branch PRs. Post-land watch: error-tracker release, error-rate / crash-free revert thresholds commit-by-commit — do not invent thresholds. **Done when:** `Plan` holds table, commands, both costs, watch.
- [ ] **Step 12 — Excluded:** Report lists only — no label, comment, close. C-class + blocked stay open. Report supplies comment text (break + fix) and labels (deferred; major label on major). Comments start with marker in `Project Instructions`; next step finds marker and edits existing comment. Batch-carried PRs → close after land with batch pointer. Breaking major / migration = DECISION → `Recommendations`; real work → issue to open. DECISION evidence (not bare PR): migration guide, breaking changes vs codebase + hit counts, codemods, peer-dep matrix, rollback path. **Done when:** `Excluded` row per out-of-batch PR: verdict · labels · comment text or DECISION evidence.
- [ ] **Step 13 — Unseen:** Bot-blind surfaces. (a) New advisories vs committed baseline — delta script: not in baseline + stale entries; batch fix → remove baseline entry same commit. Security PRs bypass release-age — confirm landing not queued; same as `bkit-audit-security`, do not duplicate. (b) Second vuln source — scanner on lockfile, language requirements, shipped images + host alerts; lockfile scanners reading first doc only → empty without fail — confirm full read. Classify each advisory shipped, server-only, or dev-only, and say whether the vulnerable function is reachable. Destination for an advisory: `bkit-audit-security`. (c) Fix latency — shipped deps: publication → integration land; CRITICAL ≤7d, HIGH ≤30d; breach = finding, list first. (d) Container installing from bot-bumped manifest covered; second install line bypassing manifest = gap, back. (e) Unused deps → `bkit-audit-dead-code`; unmaintained (no release >1y or archived) on new deps since last pass → `Recommendations`. (f) Deprecated / abandoned whole tree — dashboard abandoned + frozen-install warnings. (g) Licences — new deps since last pass; copyleft (GPL, AGPL) or missing in shipped → `Recommendations`. Production tree licence diff vs previous (BSL, SSPL, commercial upgrades too). Shipped app notices regenerated on dep change; bundled fonts/icons/images — licence + ship terms. (h) Off-manifest CLIs — bot reads manifests only. Sources: CI `run:` (global installs, `npx` / `pnpm dlx`, `curl | sh`, system packages), setup-action version inputs (e.g. `supabase/setup-cli` `version:`), build-service CLI pin (e.g. `eas.json` `cli.version`), Dockerfiles, build images, version files (e.g. `.tool-versions`), repo scripts, global-install setup docs. Per CLI: location · pin or `floating` (unpinned, `latest`, open range) · latest release, read live · majors behind · bot-watched (manifest entry or bot rule, e.g. Renovate `customManagers`) yes / no. Floating in CI / build image = finding (unreviewed version each run, bypasses release age). Major behind = finding; end of life → Step 14. Unwatched → `Recommendations`: move into manifest or add bot rule. **Done when:** `Unseen` holds advisories, latency, container install path, deprecated packages, licence diffs, row per off-manifest CLI.
- [ ] **Step 14 — End of Life:** Compare versions in use with the end-of-life catalogue and each vendor's support policy. Record days left for the runtime, the framework, the native SDK, the package manager, the language, the database major, and container base images the project ships (sources in `Project Instructions`). An end of life inside 90 days is DECISION, and the report names the issue to open. **Done when:** `End of Life` row per runtime: version · days left · verdict.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per bot preset, package-manager supply-chain setting, and Concise Guide rule → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Since previous report commit — dependency-touching changes (manifests, workspace file, bot configs, workflow `uses:`, Dockerfiles, requirements, runtime-version files, build-image, hosting runtime) → one-line verdict each. (b) ~30 min bounded pass — senior supply-chain gaps no step covers; since previous run: incidents, new `docs/failures.jsonl`, `bkit-audit-logs` reports, vendor status — what no step catches? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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
| `MEDIUM` | Updater config that does not exclude `.github/workflows/bkit-cloud.yml`; supply-chain setting missing or weaker than the standard; setting that multiplies PR or CI runs; unmaintained or deprecated shipped dependency; end of life inside 90 days; two versions of one runtime package; off-manifest CLI floating in CI / build image, or a major behind |
| `LOW` | Bot stopped rebasing a PR; grouping miss with no failure; shipped licence notice not regenerated; unwatched off-manifest CLI |

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, the batch verdict, and open / in-batch / excluded counts.
- [ ] **Series:** security-fix latency and end-of-life days beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions

Doctrine: `docs/deployments.md` § Dependency updaters, § Renovate — fencing bkit's own footprint, § GitHub Actions pinning. Runtime-dependency rule: `docs/technology.md` § Build & Output.

### Pre-Flight / Dependencies

- Git host: `gh` against `cbartens/bkit`. Package manager: pnpm through Corepack from `package.json` `packageManager`.
- Vulnerability sources: `node scripts/ci/check-dependency-audit.mjs` (baseline `scripts/ci/accepted-advisories.json`); `pnpm audit --json`; `gh api repos/cbartens/bkit/dependabot/alerts --paginate`; Trivy `fs` via docker with dev deps included, image + digest from `.github/workflows/bkit-trivy.yml`, on a dir holding only a `pnpm-lock.yaml` copy. CI Trivy skips `pnpm-lock.yaml` while `scripts/ci/check-dependency-audit.mjs` exists, so the local Trivy run is the second lockfile source.
- Not installed: OSV-Scanner, lockfile-lint → `Batch` greps stand in.

### Permissions

- `gh api user/installations` → 403 with a PAT (endpoint needs a GitHub App user token); no allow rule clears it. Mend App state → repo Settings → Integrations → GitHub Apps, by hand.

### Bot Health

- Renovate, self-hosted: `.github/workflows/bkit-renovate.yml`. Dependency Dashboard = issue #328 (`gh issue view 328`). Logs: `gh run list --workflow bkit-renovate.yml --limit 5`, then `gh run view <id> --log`.
- Config read: `main` + `dev` layered (`useBaseBranchConfig: "merge"`); lag check `git diff origin/main <baseSha> -- .github/renovate.json5`.
- Validator: `git show origin/main:.github/renovate.json5 > <scratch>/repo/.github/renovate.json5`, then from `<scratch>/repo`: `RENOVATE_ALLOWED_ENV='PNPM_*' npx --yes --package renovate@<runner version> -- renovate-config-validator --strict`. A bare file path validates as global config and reports false `allowedEnv` errors.
- Bot PRs are authored by the PAT owner, not `app/renovate`; select by head-ref prefix only.

### Inventory

- `gh pr list --state open --limit 100 --json number,title,headRefName,headRefOid,mergeable,mergeStateStatus,labels,author,files`, filter `headRefName` on `renovate/`. Behind-count: `git rev-list --count <headSha>..<baseSha>`. CI: `gh pr checks <n>`.
- CI volume on bot branches: `gh run list --workflow bkit-ci.yml --created '>=<date>' --limit 500 --json headBranch`, filter on `renovate/`.

### Classify

- Root copies of templates (`.github/workflows/bkit-*.yml`, `.cursor/Dockerfile`) must stay byte-identical to `.bkit/templates/` twins, which sit in `ignorePaths`. A bot PR changing only the root copy fails `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` and `.bkit/core/engine/audits/templates/template-action-pins.test.ts` → class C, fix = mirror into the template copy. Repro: `pnpm exec vitest run <both files>` in the worktree.

### Batch

- Worktrees under `tmp/` (gitignored): `git worktree add --detach tmp/<name> <baseSha>`; rebuild = `git worktree remove --force tmp/<name>` + re-add.
- Lockfile checks: `grep -c "resolution: {"` must equal `grep -c "resolution: {integrity: sha512-"`; `grep -nE "tarball:|git\+|codeload\.github|github:|https?://" pnpm-lock.yaml | grep -v registry.npmjs.org` must be empty. No `.npmrc` → default npm registry.
- Screen: package keys = entries under `packages:` up to `snapshots:` in `pnpm-lock.yaml`; `comm` base vs batch; publish times `npm view <name> time --json`.

### Verification

- `git status --porcelain` → `pnpm install --frozen-lockfile` → `pnpm bkit:gate:install-static-unit-build` → `git status --porcelain` → `pnpm bkit check`.
- No framework doctor; no single-version runtime packages (no `dependencies`).

### Unseen

- Off-manifest CLI surfaces, root copy + `.bkit/templates/` twin each: `.github/workflows/bkit-ci.yml` (Vale `VALE_VERSION`, actionlint script, `setup-uv` `version:`, `GRAPHIFY_SPEC`, `npx --yes bats`), `bkit-cloud.yml` (Vale, `@opencode/cli`), `bkit-trivy.yml` (`docker://` Trivy), `bkit-renovate.yml` (Renovate image = action default unless `renovate-version`), `.cursor/Dockerfile` (base image, nodesource, gh apt, Vale, Corepack pnpm). Cloud setup source `.bkit/shared/.claude/bkit-cloud.md`, rendered to gitignored `.claude/bkit-cloud.md` (read the render for derived pins).
- serena-agent in the cloud setup = tool server → `bkit-audit-agents`.
- Deprecation: `npm view <name>@<version> deprecated` over every `packages:` key. Licences: `pnpm licenses list --json` and `--prod` inside an installed worktree.
- No prior report → "since last pass" base = last `chore(deps)` batch commit (`git log --grep 'chore(deps)' -1`).

### End of Life

- Sources: endoflife.date `nodejs`, `pnpm`, `ubuntu`; Vite → vite.dev/releases. Pins: `.nvmrc`, `package.json` `engines` + `packageManager`, `.cursor/Dockerfile` `FROM` + nodesource line. vite and pnpm majors are held by the bkit-only rules at the end of `.github/renovate.json5`, so no bot PR signals their end of life.

### Excluded

- Comment marker: `<!-- bkit:dependency-triage -->`. Labels: `deferred`; majors also `dep-major`.
