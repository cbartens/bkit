<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.0.2 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Repo Audit

> [!CAUTION]
> **Purpose:** Verdict on leftovers and layout — worktrees, branches, stashes, ignored files, placement, and repository posture against the standards.
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
> - NEVER delete, prune, push, drop a stash, or rewrite history; name the command, do not run it.
> - NEVER copy a secret or personal-data value into the report; name the file and line.
> - Name the machine. Local leftovers absent on a fresh checkout stay `Not Checked`.

## Universal Instructions

### Context & Goals

Every task leaves a worktree, branch, stash, or scratch directory; nothing's job is to remove them. Stale copies look like live work — search and agents read them; a leftover something keeps producing is a bug in that producer. Worse: cleanup by age deletes the only copy of unpushed work. Target: **every leftover judged before anything is called removable**, and a producer that keeps writing leftovers named as the bug.

**Applies when:** a git checkout. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after a burst of parallel agent work (worktrees and branches pile up fastest).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- OpenSSF Scorecard checks; record the version run.
- OpenSSF OSPS Baseline, the version marked current.
- Host branch rulesets (e.g. GitHub rulesets, GitLab protected branches).
- Secret scanning push protection (e.g. GitHub secret scanning, GitLab secret push protection).
- Secret scanners (e.g. gitleaks, TruffleHog); record versions.
- Repository size tool (e.g. git-sizer); record version.
- Workspace dependency-version linter (e.g. sherif, syncpack); record version.
- RFC 9116 `security.txt`.

### Scope

- Worktrees, local, and remote branches, stashes, tags, stale pull requests.
- Ignored and untracked leftovers, including scratch directories and files stranded at the root.
- Secret and personal-data scan of leftovers and of history (names only).
- Tracked layout: size, history size, toolchain agreement, accidental publish, attributes, placement, naming, contribution scaffolding.
- Repository posture: scorecard subset, branch protection, security settings, disclosure route, accumulating installations.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Code or config nothing reaches | Dead-code sweep | `bkit-audit-dead-code` |
| Whether a doc is true | Documentation sweep | `bkit-audit-documentation` |
| Dependency-update bot branches | Dependency sweep | `bkit-audit-dependencies` |
| Workflow token permissions, pinned actions, dangerous workflow | Security sweep | `bkit-audit-security` |
| People, 2FA, deploy keys, long-lived tokens | Security sweep | `bkit-audit-security` |
| Actions secrets and variables; settings versus docs | Config sweep | `bkit-audit-config` |
| Personal-data lifecycle | Privacy sweep | `bkit-audit-privacy` |
| Deleting, moving, pruning, or pushing | Audit reports only | Plan from this report |

### Verdicts

- **REMOVE:** provably safe. Merged by ancestry, patch-equivalent on the integration branch (`git cherry` shows only `-`), its pull request merged, or a regenerable artefact (build output, cache, coverage, test results).
- **RESCUE:** holds work that exists nowhere else (unpushed commits, uncommitted worktree edits, a stash whose changes are on no branch). Name what it holds and who would know. Pushing it, or dropping it on purpose, is the next step. At least `HIGH`.
- **MOVE:** kept, but in the wrong place or under a misleading name.
- **KEEP:** in use. Say what uses it.
- **ASK:** cannot tell from the evidence. Name who would know.
- **OTHER:** fits none. Say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**Two traps.** Squash merge stays ahead of the integration branch by ancestry: check the pull request and `git cherry`, never `git branch --merged` alone. A worktree whose branch is fully merged can still hold uncommitted edits: `git status --porcelain` before REMOVE.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Git:** Steps 2–7, 9 — local checkout, worktrees, branches, stashes. Fallback: none; no checkout → `N/A` and STOP.
- [ ] **Host API:** Steps 4, 8 — read-only, e.g. `gh api`. Fallback: local git only; remote branches, pull requests, and settings `Not Checked`.
- [ ] **Web:** Step 10 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Secret Scanners:** Leftovers or history → Steps 6–7 — e.g. gitleaks, TruffleHog. Fallback: pattern search; verified-credential check `Not Checked`. Reports outside the repo.
- [ ] **Repo Sizer:** History size → Step 7 — e.g. git-sizer. Fallback: `git rev-list` blob sizes.
- [ ] **Dependency Version Linter:** Workspaces → Step 7 — e.g. sherif, syncpack. Fallback: diff manifests by reading.
- [ ] **Scorecard:** Host exposes one → Step 8 — e.g. OpenSSF Scorecard, read-only token. Fallback: settings API only; scores `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Checkout:** Name machine and checkout. Worktrees, stashes, scratch directories are local — fresh cloud checkout sees none; say so, not clean. Remote branches and pull requests are shared; every run checks those. **Done when:** machine, checkout, and which surfaces are local-only in `Checked`.
- [ ] **Step 3 — Worktrees:** `git worktree list --porcelain`. Per worktree: branch, ahead/behind integration branch, `git cherry`, pull-request state, uncommitted changes (`git status --porcelain`), last commit date, size (`du -sh`). Locked or files modified in the last day → KEEP or ASK, never REMOVE (agent may still be running). Also `git worktree prune --dry-run` for entries whose directory is gone. Never prune for real. **Done when:** `Worktrees` row per entry with verdict; totals in `Totals`.
- [ ] **Step 4 — Branches:** Local: merged by ancestry, merged by squash (pull request merged, or `git cherry` all `-`), upstream gone, agent-prefix branches with no worktree. Remote: branches other than integration, production, dependency-update bot's, with pull-request state. Record delete-on-merge; when off, merged pull request leaves its branch. Unmerged with no pull request: every commit is RESCUE until shown otherwise. Open pull requests with no activity for 30 days, and old drafts. Tags no release or deploy uses. **Done when:** `Branches` row per item with verdict; counts in `Totals`.
- [ ] **Step 5 — Stashes:** `git stash list` with dates, then `git stash show --stat` for each. Check whether changes already landed on integration branch. Stashes a commit hook creates when it fails: usually commit was retried — verify before REMOVE. **Done when:** `Stashes` row per stash with verdict.
- [ ] **Step 6 — Leftovers:** Untracked (`git status --porcelain`) and ignored (`git ls-files --others --ignored --exclude-standard --directory`), each sized. Sort: regenerable (dependencies, task cache, coverage, test results, native build folders, tool caches) — REMOVE is safe, report the size; hand-made (notes, plans, backups, logs, scripts in the scratch directory) — group by age and type; open issue or plan references → KEEP; produced and not cleaned up — leftover REMOVE, producer is finding; stranded at root — find writer; tool defaulting to root → point elsewhere. Ignore file: rules matching nothing; leftovers untracked because no rule covers them. Scan secrets and personal data before any MOVE or REMOVE on scratch, root, or plan logs; scanner reports outside repo. Personal-data hits are candidates: test fixtures carry fake addresses. A real hit in a tracked file is not fixed by removing the file — it stays in history. Name the file and line, never the value. Hooks: hooks path resolves at the hook directory, each hook executable, and the install script installs them. A checkout where hooks silently do not run looks clean here while skipping every pre-commit control. **Done when:** `Leftovers` grouped with verdicts; scan result named; sizes in `Totals`.
- [ ] **Step 7 — Layout:** Read where tracked files belong; find misfits. Size: largest blobs at `HEAD`. Committed generated output/logs → MOVE or REMOVE candidates. Record pack size as series. History size: deleted file still grows clones — repository sizer or blob sizes across all refs. Images/logs → recommend large-file storage or ignore; history rewrite owner's call (ASK). Secrets in history: scan all refs; list every sensitive file ever added (example env files expected). Verified live credential → `CRITICAL`: rotation first (rewrite does not reach existing clones). Name file and commit, never value. Toolchain agreement: runtime pin, engine field, package-manager field, CI setup, host build image, native build config; workspace dependency-version linter for cross-workspace drift or catalog bypass. Docs-versus-files → documentation audit; this step files versus each other. Accidental publish: every workspace package not meant for a registry is marked unpublishable (e.g. npm `private: true`, Cargo `publish = false`), and the root states the licence position. Attributes: end-of-line, generated-file linguist marks so review diffs collapse them, binary marks on images, and an editor config that agrees with the formatter. Placement: root files belonging to app/package, finished one-off scripts, drafts beside final doc, unlinked archive folders, near-empty packages. Naming: folders/files breaking neighbour conventions. Contribution scaffolding: owners file, pull-request and issue templates, contributing note — present and true; whether team needs them → owner (ASK). Template describing unfollowed process → MOVE or REMOVE. Owners file: propose paths that weaken a gate when edited → required human review; once exists, host owners-errors API must return none. Unimported file → dead-code audit; misplaced-but-wrong doc → documentation audit. **Done when:** `Layout` rows; pack size and largest history blobs in `Totals`.
- [ ] **Step 8 — Posture:** Config audit asks settings vs docs; this step asks vs anchor standards. Read that audit's latest report first; do not duplicate findings. Shared settings: every run checks (local or cloud). Scorecard: each check's score as series. Keep binary artifacts, branch protection, code review, dependency-update tool, security policy here; token permissions, pinned dependencies, dangerous workflow → `bkit-audit-security`. Branch protection (integration, production): pull request required, required check required, force-push and deletion blocked, squash-only or linear history, bypass list — compare with production-merge-requires-PR rule. Security settings: secret scanning and push protection on; who may bypass push protection. Private repo: push protection may need paid secret-protection plan — say so if plan excludes it. Push protection blocks at server (hook bypass does not reach). Also dependency alerts, private vulnerability reporting, default automation token read-only, automation creating/approving pull requests off. Disclosure: security policy or private vulnerability reporting, and `/.well-known/security.txt` on production web origin with RFC contact/expiry fields and expiry ahead. People, 2FA, deploy keys, long-lived tokens → security audit; automation secrets/variables → config audit. Read their latest reports; confirm 2FA enforcement recorded. List accumulators like branches: installed apps and permissions, webhooks, environments. App over-scoped or webhook to unused service → REMOVE or ASK. **Done when:** `Posture` holds each setting met / finding / not applicable; scores in `Totals`.
- [ ] **Step 9 — Verify:** Git state changes hourly. Record when each check ran; re-check every RESCUE and REMOVE at end. No finding without re-checkable evidence: command and output, or `file:line`. Destinations (name; do not act): REMOVE → exact command next step would run, batched for one review; RESCUE → what it holds, who would know, decision (push and open pull request, or drop on purpose); MOVE → move and every reference to update; ASK → who would know and question; OTHER → why no verdict fits; leftover something keeps producing → `docs/failures.jsonl` row against producer (report; do not write ledger); missing/stale ignore rule → line to add or remove; code or config nothing reaches → `bkit-audit-dead-code`; a doc that is wrong, not misplaced → `bkit-audit-documentation`; dependency-bot branch → `bkit-audit-dependencies`; secret in history, log, or leftover → `bkit-audit-security`, rotation first, file and commit only; personal data in log or leftover → `bkit-audit-privacy`; repository setting below standard → setting to change for owner, doc drift → `bkit-audit-config`; workflow-level scorecard failure → `bkit-audit-security`; toolchain versions disagree → file to change; host setting → `bkit-audit-config`; dependency versions → `bkit-audit-dependencies`. **Done when:** every RESCUE and REMOVE re-checked, with time, verdict, and destination.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Scorecard check and per baseline control in sets this audit touches (e.g. OSPS-AC, OSPS-BR-07, OSPS-GV, OSPS-LE, OSPS-VM) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching the repository itself (new top-level files and folders, workspaces, ignore, and attribute files, hooks, branch, and ruleset settings, host apps, webhooks, environments, anything new that writes to the scratch directory or the root) → one-line verdict each. (b) Bounded ~30 min pass: what a senior platform engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No values:** no secret or personal-data value anywhere in the report.
- [ ] **Nothing removed:** no worktree, branch, stash, file, or remote ref deleted or pushed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Verified live credential in history, a log, or a leftover. Rotation first; a history rewrite does not reach existing clones |
| `HIGH` | RESCUE — work one cleanup command would lose; unverified secret material in history |
| `MEDIUM` | Leftover a test or script keeps producing; toolchain versions disagree; repository setting below the standard |
| `LOW` | Regenerable cache, reported by size; naming drift; contribution scaffolding the owner must decide |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: live credentials, then RESCUE, before REMOVE.

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

### Totals

PENDING

### Worktrees

PENDING

### Branches

PENDING

### Stashes

PENDING

### Leftovers

PENDING

### Layout

PENDING

### Posture

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, the machine, and the checkout.
- [ ] **Series:** `Totals` beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
