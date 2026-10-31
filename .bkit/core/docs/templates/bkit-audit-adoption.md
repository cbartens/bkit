<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# bkit Adoption Audit

> [!CAUTION]
> **Purpose:** Every file bkit ships — written and kept current (`core/`, `shared/`) or copy-and-own (`templates/`) — used, and used correctly; nothing missed.
>
> **Rules:**
>
> - NEVER print or copy a token, key or secret value. Record names and presence only.
> - Do not run `bkit install` / `bkit upgrade`.
> - Run only `bkit check` and `bkit doctor` among the bkit commands.
> - NEVER run a hook, script or tool that writes, commits, pushes or calls a remote write API.
> - Run hooks, scripts and tools only as syntax checks or in read-only modes.
> - Re-list every unadopted template on each run, with the previous verdict and its age, because no skip record exists.

## Universal Instructions

### Context & Goals

bkit ships three folders. A file's path inside its folder is the path it lands at in the repo.

<!-- prettier-ignore -->
| Package folder | Install does | Repo gets |
| --- | --- | --- |
| `.bkit/core/` | Writes its files and keeps them current. It never writes `engine/`, `workflows/` or `prompts/` as they are: workflows and prompts render to host agent and command copies | Whole files, managed blocks, hooks, reference docs in `.bkit/`, audit and plan templates |
| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`docs/*.md`, `.gitignore`, settings, tool-server config) |
| `.bkit/templates/` | Never writes them into the repo. It keeps a raw copy at `.bkit/templates/`, and `bkit upgrade` lists the changed paths | Nothing until you copy one and own it |

`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a written doc that holds only bkit's block, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` holds bkit's block and nothing else; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.

**Applies when:** `.bkit/version` is present. **If** it is absent → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass after `bkit upgrade`, after adopting or dropping a template, and after adding an agent host.

**Anchor Standards:** Record the bkit version and the date read.

- bkit, at the installed version: `.bkit/templates.md` (Contract, placeholders, Context-fetch blocks), `.bkit/README.md` § File ownership and § Ongoing CLI, `.bkit/install.md`, and the release notes since the pinned version.
- Config reference of each tool behind an adopted template (e.g., Husky, lint-staged, Vale, Prettier, Renovate, Dependabot, Trivy, GitHub Actions workflow syntax, direnv). Record the version read.

### Scope

- Inventory every file in the package's `core/`, `shared/` and `templates/` against `.bkit/version` `canonicalHashes` and against the repo's `.bkit/templates/` copy.
- Compare the pinned, installed and registry-latest versions.
- Read the `bkit check` drift.
- Read the `bkit doctor` advisories.
- Compare the agent hosts in use with the bkit hosts installed.
- Check the agent, command and hook copies for each host.
- Check that the managed blocks and owned keys in written files are untouched.
- Check that each file bkit shares with you carries your part.
- Check that each audit template was run within its cadence.
- Record whether each template is adopted, and why when it is not.
- Check that each adopted copy is filled, reconciled, merged after upgrade, wired and running.
- Check that there is one context-fetch block per context with a lane, and that each matches the lane it names.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Agent permissions, hooks firing, tool servers, parity across hosts — bkit-shipped gates included | The agent config sweep owns them | `bkit-audit-agents` |
| Whether a doc's content is true | The documentation sweep owns it | `bkit-audit-documentation` |
| Branch protection, required checks, hosted variables | The config sweep owns them | `bkit-audit-config` |
| CI token permissions, action pinning, secret rotation | The security sweep owns them | `bkit-audit-security` |
| Lint and scanner suppressions inside adopted configs | The slop sweep owns them | `bkit-audit-slop` |
| Whether a sweep here should become a gate | The gate sweep owns it | `bkit-audit-gates` |
| Copying, editing or merging a template; running `bkit install` / `bkit upgrade` | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Checkout:** Steps 2-11 — a repo with `.bkit/version`. Fallback: none. **If** it is absent → write one `N/A` row, then **STOP**.
- [ ] **Package:** Step 2 — the installed package root (e.g., `node_modules/@cbartens/bkit/.bkit/`, resolved through the package manager). Fallback: unpack the pinned version into a throwaway directory (e.g., `npm pack @cbartens/bkit@<pinnedVersion>`). **If** that fails → inventory from `.bkit/templates/` and `canonicalHashes` only, and mark the unwritten `core/` and `shared/` files `Not Checked`.
- [ ] **bkit CLI:** Steps 4, 5 — `bkit check` and `bkit doctor` (or `pnpm bkit …`). Fallback: hash the written files against `canonicalHashes` by hand, and mark the advisories `Not Checked`.
- [ ] **Registry:** Step 3 — the latest version and its release notes (e.g., `npm view @cbartens/bkit version`, the release page). Fallback: compare the pinned and installed versions only, and mark currency `Not Checked`.

#### Conditional

- [ ] **CI Host Read:** **If** the repo has CI → Steps 8, 9 — the workflow list, job names, recent runs and artifact names (e.g., `gh workflow list`, `gh run list`, `gh run view --json jobs`). Fallback: read the workflow files only, and mark lane matching `Not Checked`.
- [ ] **Template Tools:** **If** at least one template is adopted → Step 9 — the installed version of each tool behind one (e.g., `npx husky --version`, `vale --version`, `npx lint-staged --version`). Fallback: take the version from the lockfile, and mark runs `Not Checked`.
- [ ] **Machine Config:** **If** the audit runs on a developer machine → Step 9 — the local git config (e.g., `git config core.hooksPath`) and the direnv allow state. Fallback: check the repo level only, and mark machine wiring `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Carry each `Adoption` verdict forward with its age. **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Inventory:** List every file in the package's `core/`, `shared/` and `templates/`. A file's landing path is its path inside the folder. `core/engine/`, `core/workflows/` and `core/prompts/` have no landing path: workflows and prompts are checked as host copies in Step 5. For each file, join: the package file · landing path present · in `canonicalHashes` · the repo's `.bkit/templates/` copy matches the package's `templates/`. Give each file one kind: whole file / managed block / owned keys / template. Record these as findings: a `core/` or `shared/` file whose landing path is absent; a `canonicalHashes` entry the package no longer ships; and a repo `.bkit/templates/` that differs from the package. Group a folder into one row only when every file in it shares one verdict. **Done when:** `Inventory` holds one row per shipped file or uniform folder: folder · landing path · kind · present · recorded.
- [ ] **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
- [ ] **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
- [ ] **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`shared/docs/*.md`, `AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A doc that holds only bkit's block is unadopted. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
- [ ] **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
- [ ] **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
  - **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
  - Mark each file adopted (a copy at its landing path, or at the destination the Contract names) or not adopted.
  - Give each file not adopted one verdict: `gap` (it fits this stack, and nothing else does the job), `covered` (naming the tool that does) or `not applicable` (with evidence, e.g., no GitHub Actions or no markdown docs).
  - **If** two templates do one job (e.g., Renovate and Dependabot) → check that one is adopted, or that `bkit.dependencies.updater` is recorded.
  - For each context (`ci`, `diff`, `e2e`, `runtime`, `web`) that the repo has a lane or provider for, check for a context-fetch block below `bkit:end` in `.agents/context.md`, or a `<!-- context-fetch:none … -->` naming it.
  - **If** a provider is in use (a dependency, config or CI step), a shipped `templates/context/` file exists for it, **and** there is no block → `gap`.
  - Re-list every row on each run, and diff against the previous report: newly adopted, newly dropped, and unchanged with its age.

  **Done when:** `Adoption` holds one row per template file and per context: adopted · verdict · evidence · age.

- [ ] **Step 9 — Templates:** For each adopted template, check:
  - (a) Filled: no raw `{{…}}` placeholder is left, the default branch and runner are real, and no stub sentinel is left.
  - (b) Reconciled: run `diff .bkit/templates/<path> <path>`, and mark each difference adopt or reject (saying why). Placeholder lines differ by design.
  - (c) Merged:
    - **If** the package changed the template after the copy's last change (Step 3, `git log` on `.bkit/templates/<path>`) → mark it merged, rejected (saying why) or pending.
  - (d) Wired: the tool behind it is installed, and invoked where the template expects. For example, the hook manager is installed by a `prepare` script, the hooks are executable and `core.hooksPath` is set; `pre-commit` calls lint-staged; the prose linter's styles are synced and its config loads them; the scanner plugin path resolves; the tool-server snippet is merged into the host's server config; the secrets config names real stores; the cloud workflow waits on a workflow `name:` that exists; and the CI template's job names are the ones the repo requires.
  - (e) Runs: one read-only invocation, where one exists (e.g., `sh -n` on a hook, `prettier --check`, `vale` on one doc, `actionlint` on a workflow).
  - (f) Ignored: every repo-wide gate (formatter, prose linter, scanner, linter, type checker) skips `.bkit/templates/`.
  - For each context-fetch block, check that its job regex and artifact name match exactly the lane it names (CI Host Read). A widened regex that catches another lane is a finding.

  **Done when:** `Templates` holds one row per adopted template, with a verdict for each of (a)-(f).

- [ ] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per Contract row, one per context-fetch file and one per tool reference read, each marked checked (naming the step), not applicable (saying why) or finding. A key or option in an adopted config that its tool reference deprecates is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches bkit-written files, `.bkit/templates/`, adopted copies, `.agents/context.md` or `package.json` `bkit.*`. (b) In a bounded pass of about 30 minutes, note what a senior engineer adopting bkit would flag that no step asks about. Read what happened since the previous run (`bkit upgrade` output, new `docs/failures.jsonl` rows, `.bkit/friction.jsonl`), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No secrets:** no token, key, or secret value appears anywhere in the report.
- [ ] **Repo untouched:** no template was copied or edited, and no bkit-written file changed.
- [ ] **No install:** no `bkit install` / `bkit upgrade` was run.
- [ ] **No writing runs:** no hook or script that writes was run.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A secret value in a tracked adopted copy or a tracked `.bkit/.env`. Rotation goes to `bkit-audit-security` |
| `HIGH` | `bkit check` fails. Pinned != installed. A host in use with no bkit install. An adopted template whose tool is not installed or never invoked. A raw placeholder in an executed file (workflow, hook). A cloud workflow waiting on a workflow name that does not exist. A context-fetch block that matches the wrong lane |
| `MEDIUM` | A template `gap`. Edits inside a bkit managed block. An unaddressed `bkit doctor` advisory. A package change to an adopted template left unmerged. An unreviewed difference from the template. A written doc that holds only bkit's block. A `.bkit/.env` key unset. An audit that applies and was never run, or is overdue. A repo-wide gate that scans `.bkit/templates/`. A context with a lane and no block or opt-out. bkit behind with a relevant fix |
| `LOW` | bkit behind with no relevant fix. A shipped file missing from the Contract. Two updaters adopted, with one idle. Naming drift with no behaviour change |

Within a severity, list missing gates first, then unwired copies, then drift.

<!-- prettier-ignore -->
| ID | Severity | Folder | Location | Evidence | Expected |
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

### Version

PENDING

### Check and Doctor

PENDING

### Hosts

PENDING

### Written Files

PENDING

### Audits

PENDING

### Adoption

PENDING

### Templates

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
- [ ] **bkit version:** `Summary` gives the bkit version.
- [ ] **Hosts:** `Summary` names the hosts.
- [ ] **Template counts:** `Summary` gives the count of templates adopted / `gap` / `covered` / `not applicable`.
- [ ] **Series:** `Adoption` is diffed against the previous report's, or the run is marked baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** the throwaway package unpack is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
