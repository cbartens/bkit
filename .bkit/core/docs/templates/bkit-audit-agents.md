<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Agent Config Audit

> [!CAUTION]
> **Purpose:** For each coding-agent host: instruction loading, permissions, hooks, tool servers, agent definitions and model pins — and the hosts agree, bkit-shipped gates included.
>
> **Rules:**
>
> - NEVER print or copy a token, key or secret value. Record names, scopes and presence only.
> - Do not run `bkit install` / `bkit upgrade`.
> - Do not call a tool-server tool. Only list its tools.
> - Name the machine the audit runs on.
> - **If** user-level or local-override config is absent because the checkout is fresh → mark it `Not Checked`.

## Universal Instructions

### Context & Goals

Each agent host reads its own permissions, hooks, tool servers and model picks, and nobody reviews them as config. A broad allow rule lands in a one-line diff, a local override lives on one laptop, and a tool server holds a write token nobody scoped. The failure this audit targets is an agent doing something that one host's config would have blocked, because the host it ran in was configured differently. Examples: force-push is denied in one host and allowed in another; a tool server holds an admin token where read access would do; a hook is wired, but its script is not executable, so it never fires; or an issue body tells an agent with push rights to push, and nothing but prompt text stops it.

**Applies when:** the repo carries config for at least one coding agent (e.g., `AGENTS.md`, `.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.mcp.json`), or anyone works on it with one. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass after adding an agent host or tool server, after a bkit upgrade, and after a change to a permission, hook or tool-server file.

**Anchor Standards:**

- OWASP Top 10 for Agentic Applications, 2026 (ASI01-ASI10).
- Tool-server specification authorization and security best practices (e.g. Model Context Protocol). Record the specification date read.
- OpenSSF Security-Focused Guide for AI Code Assistant Instructions.
- Each host's settings, permission, sandbox and hook reference (e.g. Claude Code, Cursor, Codex, opencode). Record the date read.
- bkit, when installed: `.bkit/README.md` § File ownership — the permissions and hooks bkit writes for each host.

### Scope

- List the hosts in use.
- For each host, list the config files it loads per layer (managed policy, user, repo, local override), and their precedence.
- List the instruction files each host loads.
- Check permissions: allow / ask / deny, the default approval mode, the sandbox and the fetch allowlist, and their parity across hosts.
- Check that hooks and guard scripts are wired and runnable, that they fire, and how they fail.
- Inventory the tool servers for each host: transport, pinning, credential source and scope, pre-approved writes, unused servers and tool-description changes.
- Check agent definitions, commands and skills: tool allowlists, model pins and sources.
- Check for secrets in agent config and in env files that agents load.
- Map untrusted input: text outsiders can write that each agent reads, what that agent can do in the same session, and what stops a planted instruction.
- **If** bkit is installed → check that its shipped permissions and hooks agree across hosts.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Instruction files that contradict each other; the size of always-loaded files | The documentation sweep owns them | `bkit-audit-documentation` |
| Model calls the product makes; tool servers the product exposes | The LLM sweep owns them | `bkit-audit-llm` |
| Whether product prompts are clear, well structured and fit their model | The prompt sweep owns it | `bkit-audit-prompts` |
| The product's model registry, deprecations and fallback chains | The model sweep owns them | `bkit-audit-models` |
| CI workflow token permissions and pinned actions; rotating a leaked secret | The security sweep owns them | `bkit-audit-security` |
| Worktrees, branches and stashes agents leave behind; version-control hooks | The repo sweep owns them | `bkit-audit-repo` |
| Hosted environment variables, dashboards, repository rulesets | The config sweep owns them | `bkit-audit-config` |
| Agent and model spend | The cost sweep owns it | `bkit-audit-cost` |
| Whether a sweep here should become a gate | The gate sweep owns it | `bkit-audit-gates` |
| bkit install state: version, `bkit check`, `bkit doctor`, hosts installed, managed blocks, templates adopted and wired | The bkit adoption sweep owns it | `bkit-audit-adoption` |
| Changing config, or running `bkit install` / `bkit upgrade` | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Checkout:** Steps 2-10 — the repo-level agent config. Fallback: none. **If** there is no checkout → write `N/A`, then **STOP**.
- [ ] **Effective Config:** Steps 2, 4, 6 — the host's merged-config view, where it offers one (e.g., `claude mcp list`, a host's permissions or MCP panel). Fallback: work out the effective state by hand from the files and the documented precedence, and treat it as a hypothesis.
- [ ] **Web:** Steps 7, 11 — the anchor standards, host references and live model catalogues. Fallback: record the versions as unread, and mark model pins `Not Checked`.

#### Conditional

- [ ] **Machine Config:** **If** the audit runs on a developer machine → Steps 2, 4, 6, 8 — the user-level and local-override files (e.g., `~/.claude/settings.json`, `.claude/settings.local.json`, `~/.cursor/mcp.json`, `~/.codex/config.toml`). Fallback: check the repo level only, and mark the machine layers `Not Checked`.
- [ ] **Managed Policy:** **If** the org manages agent policy → Step 2 — the policy file or admin console, read-only. Fallback: `Not Checked`, naming who holds it.
- [ ] **Token Scopes:** **If** tool servers or hooks use credentials → Step 6 — the scopes, NEVER printing the value (e.g., `gh auth status`, the `X-OAuth-Scopes` response header, provider token introspection). Fallback: mark scopes `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Hosts and Layers:** Name the machine and the checkout. List the hosts that have repo config or are in team use (e.g., Claude Code, Cursor, Codex, opencode). For each host, record the config file at each layer (managed policy, user, repo shared, repo local override, flags / env) and the documented precedence. Record these as findings: config for a host nobody uses; a host in use with no repo config; and a local-override file that is tracked or not ignored. **If** the checkout is a fresh cloud checkout with no user or local layer → say so, and do not call it clean. **Done when:** `Hosts` holds one row per host and layer: file · present · tracked / ignored · precedence.
- [ ] **Step 3 — Instructions:** For each host, list the instruction files it loads at session start (e.g., `AGENTS.md`, `CLAUDE.md`, always-applied IDE rule files, per-directory files, imports). Record these as findings: a host that reaches no shared rules; and a rule file or import that points to a missing path. Contradictions and size go to `bkit-audit-documentation`. **Done when:** `Instructions` holds one row per host: files loaded · shared rules reached yes / no.
- [ ] **Step 4 — Permissions:** For each host and layer, record allow / ask / deny, the default approval mode, the sandbox mode and the fetch / network allowlist. Record these as findings: a wildcard shell allow; an allow for an interpreter that runs arbitrary text (e.g., `bash -c`, `node -e`, `python -c`); a deny overridden by a broader allow with higher precedence; an approval-bypass mode in shared config outside a sandbox; and a fetch allowlist wider than needed under each host's matching rules (e.g., apex vs subdomain). Build the `Parity` matrix: for each action and host, name what blocks it — deny rule / hook / sandbox / prompt prose only / nothing. Cover at least these actions: force push, history rewrite, branch delete, hook skip (e.g., `--no-verify`), merge or push to a protected branch, publish / release, delete outside the working tree, credential-file read (e.g., `.env*`), fetch to an unlisted host, and a tool-server write to a shared or production system. Record these as findings: an action blocked in one host and open in another; and an action blocked by prompt prose only. **Done when:** `Permissions` holds one row per host and layer, and `Parity` has no empty cell.
- [ ] **Step 5 — Hooks:** For each host, record each wired hook's event, matcher and command. Check that the script exists, is executable and has its interpreter present. Fire test: send a synthetic tool-call payload on stdin, and record the exit code or decision. **If** a hook writes anything (telemetry, logs, state) → read it, and do not run it. Record these as findings: the sole blocker for a `Parity` row fails open on a crash, a timeout or a missing dependency; and a matcher misses a tool that does the same action (e.g., a tool server's shell tool). **Done when:** `Hooks` holds one row per hook: wired · runnable · fires on fixture · fail mode.
- [ ] **Step 6 — Tool Servers:** For each host, record each tool server (e.g., MCP): layer, transport (local command / remote URL), package pinned or floating (e.g., `npx -y pkg@latest`), publisher, credential source (env var name vs literal), credential scope vs need, toolsets enabled vs used, and write tools pre-approved. List its tools, and hash their names and descriptions. Record these as findings: a floating package; the same server set up differently across hosts (token, toolsets, URL); a server no workflow uses; and a hash that changed since the previous run with no version change. **Done when:** `Tool Servers` holds one row per server and host, with hashes recorded.
- [ ] **Step 7 — Agents and Models:** For each host, list the agent definitions, commands and skills / plugins. For each agent, compare its tool allowlist with its role, and its model pin with the provider's live catalogue. Never infer a pin's validity from version digits. For each skill or plugin, record its source, its pinned version and whether it ships scripts. Record these as findings: write tools on a read-only role; a dead pin; a floating alias; the same agent on different model classes across hosts, undocumented; and a skill of unknown source that ships scripts. **Done when:** `Agents` holds one row per agent and host, and skills are listed.
- [ ] **Step 8 — Secrets:** Read the agent config and the env files agents load (e.g., `.envrc`, tool-server env files, the agent-tooling env file). Record these as findings: a literal token in a tracked file (file and line, NEVER the value); an env file that is not ignored; and an app credential in the agent-tooling env. An agent's read of credential files goes to the Step 4 `Parity` matrix. **Done when:** `Secrets` holds one row per file.
- [ ] **Step 9 — Untrusted Input:** For each agent, command, skill and automated agent run (CI job, scheduled or comment-triggered session) from Step 7, record: (a) the text it reads that someone outside the team can write (e.g., issue / PR body and comments, fork commit messages, PR checkout files, CI logs, fetched pages, dependency READMEs and changelogs, tool-server results, inbound mail); (b) what it can do in the same session (shell, file write, push, merge, publish, tracker or tool-server write, outbound fetch), from Steps 4, 6, 7; (c) what stops a planted instruction: deny rule / hook / sandbox / human approval / read-only agent handing a summary to a separate writer / prompt prose only / nothing; and (d) who can start the run (e.g., issue label, `@`-mention, comment command, `pull_request_target`). Read how prompts fence and label untrusted text as data. Prose is defence in depth, never the stop. Exfiltration means the same session holds a secret or private data and reaches a host or surface an outsider reads (fetch allowlist, tracker comment, PR body, public commit). Record these as findings: (a) together with write, push or shell, where the stop is prompt prose only or nothing (ASI01, LLM01); (a) together with a secret or private data and an outbound path an outsider can read; and an outsider able to start a run that holds write credentials. Product model calls go to `bkit-audit-llm`. **Done when:** `Untrusted Input` holds one row per agent: untrusted sources · capabilities · who starts it · stop · verdict.
- [ ] **Step 10 — bkit Gates:** **If** `.bkit/version` is absent → skip the step explicitly, with evidence. **If** it is present → for each installed bkit host, check that every permission and hook bkit writes (`.bkit/README.md` § File ownership) appears in Steps 4-5 and in `Parity`. **If** the same bkit gate is enforced in one host and open in another → the fix is upstream in bkit. Version, drift, hosts with no bkit install, managed blocks and templates go to `bkit-audit-adoption`. **Done when:** `bkit` lists the bkit gates per host with a verdict, or records the skip with evidence.
- [ ] **Step 11 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per agentic risk (ASI01-ASI10), one per tool-server security best practice and one per assistant-instructions guide recommendation this audit touches, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 12 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches agent config: settings, hooks, tool-server files, agent definitions, skills, instruction load paths or the bkit version. (b) In a bounded pass of about 30 minutes, note what a senior platform engineer would flag that no step asks about. Read what happened since the previous run (agent incidents, new `docs/failures.jsonl` rows, friction logs), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No secrets:** no token, key, or secret value appears anywhere in the report.
- [ ] **Config untouched:** no agent config, hook, tool-server file, agent definition or bkit-managed file changed.
- [ ] **No install:** no `bkit install` / `bkit upgrade` was run.
- [ ] **No tool calls:** no tool-server tool was called.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A live credential in tracked agent config. An outsider can start an agent run that reads their text and holds write or push credentials, with no structural stop. An unprompted production write through a tool server in shared config. An approval-bypass mode in shared config outside a sandbox |
| `HIGH` | An action blocked in one host and open in another. An action blocked by prompt prose only. An agent reads untrusted text and can write, push or run shell, with no structural stop. An agent reads untrusted text, holds a secret or private data, and reaches a host an outsider can read. The sole blocking hook never fires or fails open. A tool-server credential with write or admin access where read would do. An allow for an arbitrary interpreter. A floating tool-server package |
| `MEDIUM` | An unused host config or tool server. A tool description changed with no version change. A dead model pin, or one inconsistent across hosts. A tracked local override. Agent tools beyond its role |
| `LOW` | Naming drift with no behaviour change. A doc that is wrong about agent config while the config is right |

Within a severity, list production writes first, then credentials, then parity gaps.

<!-- prettier-ignore -->
| ID | Severity | Host | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Hosts

PENDING

### Instructions

PENDING

### Permissions

PENDING

### Parity

PENDING

### Hooks

PENDING

### Tool Servers

PENDING

### Agents

PENDING

### Secrets

PENDING

### Untrusted Input

PENDING

### bkit

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
- [ ] **Summary:** `Summary` gives the count per severity, the machine and the hosts read.
- [ ] **Series:** `Parity` and the tool-server hashes are diffed against the previous report's, or the run is marked baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
