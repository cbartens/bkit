<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Repo Audit

> [!CAUTION]
> **Purpose:** Verdict on leftovers and layout — worktrees, branches, stashes, ignored files, placement, and repository posture against the standards.
>
> **Rules:**
>
> - NEVER delete, prune, push, drop a stash or rewrite history. Name the command in the finding, and leave it unrun.
> - NEVER copy a secret, token, key or personal-data value into the report. Name the file and line instead.
> - Name the machine.
> - Local leftovers that a fresh checkout does not have stay `Not Checked`.

## Universal Instructions

### Context & Goals

Every task leaves a worktree, branch, stash or scratch directory behind, and removing them is nothing's job. Stale copies look like live work, and search and agents read them. A leftover that something keeps producing is a bug in that producer. Worse, cleanup by age deletes the only copy of unpushed work. The goal is that every leftover is judged before anything is called removable, and that a producer which keeps writing leftovers is named as the bug.

**Applies when:** the project is a git checkout. **If** it is not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass after a burst of parallel agent work, because that is when worktrees and branches pile up fastest.

**Anchor Standards:**

- OpenSSF Scorecard checks; record the version run.
- OpenSSF OSPS Baseline, the version marked current.
- Host branch rulesets (e.g., GitHub rulesets, GitLab protected branches).
- Secret scanning push protection (e.g., GitHub secret scanning, GitLab secret push protection).
- Secret scanners (e.g., gitleaks, TruffleHog); record versions.
- Repository size tool (e.g., git-sizer); record version.
- Workspace dependency-version linter (e.g., sherif, syncpack); record version.
- RFC 9116 `security.txt`.

### Scope

- List worktrees, local and remote branches, stashes, tags and stale pull requests.
- List ignored and untracked leftovers, including scratch directories and files stranded at the root.
- Scan leftovers and history for secrets and personal data, and record names only.
- Check the tracked layout: size, history size, toolchain agreement, accidental publish, attributes, placement, naming and contribution scaffolding.
- Check the repository posture: a scorecard subset, branch protection, security settings, the disclosure route and accumulating installations.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Code or config nothing reaches | The dead-code sweep owns it | `bkit-audit-dead-code` |
| Whether a doc is true | The documentation sweep owns it | `bkit-audit-documentation` |
| Dependency-update bot branches | The dependency sweep owns them | `bkit-audit-dependencies` |
| Workflow token permissions, pinned actions, dangerous workflow | The security sweep owns them | `bkit-audit-security` |
| People, 2FA, deploy keys, long-lived tokens | The security sweep owns them | `bkit-audit-security` |
| Actions secrets and variables; settings versus docs | The config sweep owns them | `bkit-audit-config` |
| Personal-data lifecycle | The privacy sweep owns it | `bkit-audit-privacy` |
| Deleting, moving, pruning, or pushing | The audit only reports | A plan made from this report |

### Verdicts

- **REMOVE:** it is provably safe to remove: merged by ancestry, patch-equivalent on the integration branch (`git cherry` shows only `-`), its pull request merged, or a regenerable artefact (build output, cache, coverage, test results).
- **RESCUE:** it holds work that exists nowhere else (unpushed commits, uncommitted worktree edits, a stash whose changes are on no branch). Name what it holds and who would know. The next step is to push it, or to drop it on purpose. It is at least `HIGH`.
- **MOVE:** it is kept, but it sits in the wrong place or has a misleading name.
- **KEEP:** it is in use. Say what uses it.
- **ASK:** the evidence cannot tell. Name who would know.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

**Two traps:** A squash merge stays ahead of the integration branch by ancestry, so check the pull request and `git cherry`, never `git branch --merged` alone. A worktree whose branch is fully merged can still hold uncommitted edits, so run `git status --porcelain` before REMOVE.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Git:** Steps 2-7, 9 — the local checkout, worktrees, branches and stashes. Fallback: there is none. **If** there is no checkout → write `N/A`, then **STOP**.
- [ ] **Host API:** Steps 4, 8 — read-only host reads (e.g., `gh api`). Fallback: use local git only, and mark remote branches, pull requests and settings `Not Checked`.
- [ ] **Web:** Step 10 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Secret Scanners:** **If** there are leftovers or history → Steps 6-7 — secret scans (e.g., gitleaks, TruffleHog). Fallback: pattern search, and mark the verified-credential check `Not Checked`. Write the reports outside the repo.
- [ ] **Repo Sizer:** **If** history size is measured → Step 7 — history size (e.g., git-sizer). Fallback: read blob sizes with `git rev-list`.
- [ ] **Dependency Version Linter:** **If** the repo has workspaces → Step 7 — version drift across workspaces (e.g., sherif, syncpack). Fallback: diff the manifests by reading them.
- [ ] **Scorecard:** **If** the host exposes one → Step 8 — check scores (e.g., OpenSSF Scorecard, with a read-only token). Fallback: use the settings API only, and mark the scores `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Checkout:** Name the machine and the checkout. Worktrees, stashes and scratch directories are local, so a fresh cloud checkout sees none of them. Say so, rather than calling them clean. Remote branches and pull requests are shared, and every run checks them. **Done when:** `Checked` holds the machine, the checkout, and which surfaces are local-only.
- [ ] **Step 3 — Worktrees:** Run `git worktree list --porcelain`. For each worktree, record its branch, ahead/behind the integration branch, `git cherry`, pull-request state, uncommitted changes (`git status --porcelain`), last commit date and size (`du -sh`). **If** a worktree is locked, **or** has files modified in the last day → give it KEEP or ASK, never REMOVE, because an agent may still be running. Also run `git worktree prune --dry-run` for entries whose directory is gone. Never prune for real. **Done when:** `Worktrees` has one row per entry with its verdict, and the totals are in `Totals`.
- [ ] **Step 4 — Branches:** For local branches, list those merged by ancestry, those merged by squash (pull request merged, or `git cherry` all `-`), those whose upstream is gone, and agent-prefix branches with no worktree. For remote branches, list every branch other than integration, production and the dependency-update bot's, with its pull-request state. Record whether delete-on-merge is on. When it is off, a merged pull request leaves its branch behind. For an unmerged branch with no pull request, every commit is RESCUE until shown otherwise. List open pull requests with no activity for 30 days, and old drafts. List tags that no release or deploy uses. **Done when:** `Branches` has one row per item with its verdict, and the counts are in `Totals`.
- [ ] **Step 5 — Stashes:** Run `git stash list` with dates, then `git stash show --stat` for each stash. Check whether the changes already landed on the integration branch. For a stash that a commit hook created when it failed, the commit was usually retried, so verify before REMOVE. **Done when:** `Stashes` has one row per stash with its verdict.
- [ ] **Step 6 — Leftovers:** List untracked files (`git status --porcelain`) and ignored files (`git ls-files --others --ignored --exclude-standard --directory`), each with its size.
  - **If** an open issue or plan references a leftover → KEEP, whatever its group.
  - Sort the rest into groups:
    - Regenerable files (dependencies, task cache, coverage, test results, native build folders, tool caches) are safe to REMOVE, so report their size.
    - Group hand-made files (notes, plans, backups, logs, scripts in the scratch directory) by age and type.
  - For a file something produced and did not clean up, the leftover is REMOVE, and the producer is the finding.
  - For a file stranded at the root, find the writer.
  - **If** a tool defaults to the root → point it elsewhere.
  - In the ignore file, find rules that match nothing, and leftovers that are untracked because no rule covers them.
  - Scan for secrets and personal data before any MOVE or REMOVE on the scratch directory, the root or plan logs, and write the scanner reports outside the repo. Personal-data hits are only candidates, because test fixtures carry fake addresses.
  - A real hit in a tracked file is not fixed by removing the file, because it stays in history. Name the file and line, NEVER the value.
  - For hooks, check that the hooks path resolves to the hook directory, that each hook is executable, and that the install script installs them. A checkout where hooks silently do not run looks clean here while it skips every pre-commit control.

  **Done when:** `Leftovers` is grouped with verdicts, the scan result is named, and the sizes are in `Totals`.

- [ ] **Step 7 — Layout:** Read where tracked files belong, and find the misfits.
  - Size:
    - Find the largest blobs at `HEAD`. Committed generated output and logs are MOVE or REMOVE candidates.
    - Record the pack size as a series.
  - History size:
    - A deleted file still grows clones, so measure it with the repository sizer, or with blob sizes across all refs.
    - **If** images or logs are the cause → recommend large-file storage or an ignore rule.
    - A history rewrite is the owner's call (ASK).
  - Secrets in history:
    - Scan all refs, and list every sensitive file ever added (example env files are expected).
    - A verified live credential is `CRITICAL`, and rotation comes first, because a rewrite does not reach existing clones.
    - Name the file and commit, NEVER the value.
  - Toolchain agreement:
    - Compare the runtime pin, engine field, package-manager field, CI setup, host build image and native build config.
    - Run the workspace dependency-version linter for drift across workspaces or a catalog bypass.
    - Docs against files goes to the documentation audit, and this step compares files with each other.
  - Accidental publish: check that every workspace package not meant for a registry is marked unpublishable (e.g., npm `private: true`, Cargo `publish = false`), and that the root states the licence position.
  - Attributes: check end-of-line settings, linguist marks on generated files so review diffs collapse them, binary marks on images, and an editor config that agrees with the formatter.
  - Placement: find root files that belong to an app or package, finished one-off scripts, drafts beside the final doc, unlinked archive folders and near-empty packages.
  - Naming: find folders and files that break their neighbours' conventions.
  - Contribution scaffolding:
    - Check that the owners file, the pull-request and issue templates and the contributing note are present and true.
    - Whether the team needs them is the owner's call (ASK).
    - A template that describes a process nobody follows is MOVE or REMOVE.
  - Owners file:
    - Propose that paths which weaken a gate when edited require human review.
    - Once the file exists, the host's owners-errors API must return none.
  - An unimported file goes to the dead-code audit, and a doc that is wrong rather than misplaced goes to the documentation audit.

  **Done when:** `Layout` has its rows, and the pack size and largest history blobs are in `Totals`.

- [ ] **Step 8 — Posture:** The config audit compares settings with the docs, and this step compares them with the anchor standards.
  - Read that audit's latest report first, and do not duplicate its findings.
  - Every run checks shared settings, local or cloud.
  - Scorecard:
    - Record each check's score as a series.
    - Keep binary artifacts, branch protection, code review, dependency-update tool and security policy here.
    - Token permissions, pinned dependencies and dangerous workflow go to `bkit-audit-security`.
  - Branch protection (integration, production):
    - Check that a pull request is required, that a required check is required, that force-push and deletion are blocked, and that merges are squash-only or history is linear.
    - Read the bypass list, and compare it with the production-merge-requires-PR rule.
  - Security settings:
    - Check that secret scanning and push protection are on, and who may bypass push protection. Push protection blocks at the server, where a hook bypass does not reach.
    - On a private repo, push protection may need a paid secret-protection plan.
    - **If** the plan excludes it → say so.
    - Also check dependency alerts, private vulnerability reporting, a read-only default automation token, and that automation creating or approving pull requests is off.
  - Disclosure: check for a security policy or private vulnerability reporting, and for `/.well-known/security.txt` on the production web origin, with the RFC contact and expiry fields and the expiry still ahead.
  - People, 2FA, deploy keys and long-lived tokens go to the security audit, and automation secrets and variables go to the config audit.
  - Read their latest reports, and confirm that 2FA enforcement is recorded.
  - List accumulators the way branches are listed: installed apps and their permissions, webhooks and environments. An over-scoped app, or a webhook to an unused service, is REMOVE or ASK.

  **Done when:** `Posture` marks each setting met, finding or not applicable, and the scores are in `Totals`.

- [ ] **Step 9 — Verify:** Git state changes hourly.
  - Record when each check ran, and re-check every RESCUE and REMOVE at the end.
  - Give no finding without evidence someone can check again: the command and its output, or `file:line`.
  - Name each destination, and do not act on it. The one exception is the `docs/failures.jsonl` rows, which this run writes.
  - Destinations:
    - REMOVE → the exact command the next step would run, batched for one review.
    - RESCUE → what it holds, who would know, and the decision: push and open a pull request, or drop it on purpose.
    - MOVE → the move, and every reference to update.
    - ASK → who would know, and the question.
    - OTHER → why no verdict fits.
    - A leftover something keeps producing → a `docs/failures.jsonl` row against the producer.
    - A missing or stale ignore rule → the line to add or remove.
    - Code or config nothing reaches → `bkit-audit-dead-code`.
    - A doc that is wrong, not misplaced → `bkit-audit-documentation`.
    - A dependency-bot branch → `bkit-audit-dependencies`.
    - A secret in history, a log or a leftover → `bkit-audit-security`, with rotation first and the file and commit only.
    - Personal data in a log or leftover → `bkit-audit-privacy`.
    - A repository setting below the standard → the setting to change, for the owner.
    - A repository setting that drifted from its doc → `bkit-audit-config`.
    - A workflow-level scorecard failure → `bkit-audit-security`.
    - Toolchain versions that disagree → the file to change.
    - A host setting that disagrees → `bkit-audit-config`.
    - Dependency versions that disagree → `bkit-audit-dependencies`.

  **Done when:** every RESCUE and REMOVE is re-checked, with its time, verdict and destination.

- [ ] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per Scorecard check, and one per baseline control in the sets this audit touches (e.g., OSPS-AC, OSPS-BR-07, OSPS-GV, OSPS-LE, OSPS-VM), each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the repository itself: new top-level files and folders, workspaces, ignore and attribute files, hooks, branch and ruleset settings, host apps, webhooks, environments, and anything new that writes to the scratch directory or the root. (b) In a bounded pass of about 30 minutes, note what a senior platform engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No values:** no secret or personal-data value appears anywhere in the report.
- [ ] **Nothing removed:** no worktree, branch, stash, file or remote ref was deleted.
- [ ] **Nothing pushed:** nothing was pushed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A verified live credential in history, a log or a leftover. Rotation comes first, because a history rewrite does not reach existing clones |
| `HIGH` | RESCUE: work that one cleanup command would lose. Unverified secret material in history |
| `MEDIUM` | A leftover that a test or script keeps producing. Toolchain versions that disagree. A repository setting below the standard |
| `LOW` | A regenerable cache, reported by size. Naming drift. Contribution scaffolding the owner must decide on |

Within a severity, list live credentials first, then RESCUE, before REMOVE.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Machine:** `Summary` names the machine.
- [ ] **Checkout:** `Summary` names the checkout.
- [ ] **Series:** the report shows `Totals` beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
