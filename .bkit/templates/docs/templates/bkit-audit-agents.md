<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Agent Config Audit

> [!CAUTION]
> **Purpose:** Per coding-agent host: instruction loading, permissions, hooks, tool servers, agent definitions, model pins — hosts agree; bkit, when installed, correct and current.
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
> - NEVER print or copy a token, key, or secret value; names, scopes, and presence only.
> - NEVER run `bkit install` / `bkit upgrade`; bkit commands = `bkit check`, `bkit doctor` only.
> - NEVER call a tool-server tool; listing its tools only.
> - Name the machine. User-level / local-override config absent on a fresh checkout → `Not Checked`.

## Universal Instructions

### Context & Goals

Each agent host reads its own permissions, hooks, tool servers, model picks; nobody reviews them as config. Broad allow rule lands in a one-line diff; local override lives on one laptop; tool server holds a write token nobody scoped. Target failure: **an agent does something one host's config would have blocked, because the host it ran in was configured differently** — e.g. force-push denied in one host, allowed in another; tool server with admin token where read suffices; hook wired but script not executable, never fires; workflow kit three releases behind with hand edits inside managed blocks.

**Applies when:** repo carries config for ≥1 coding agent (e.g. `AGENTS.md`, `.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.mcp.json`), or anyone works on it with one. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after new agent host or tool server, bkit upgrade, or permission / hook / tool-server file change.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- OWASP Top 10 for Agentic Applications, 2026 (ASI01–ASI10).
- Tool-server specification authorization and security best practices (e.g. Model Context Protocol); record the specification date read.
- OpenSSF Security-Focused Guide for AI Code Assistant Instructions.
- Each host's settings, permission, sandbox, and hook reference (e.g. Claude Code, Cursor, Codex, opencode); record date read.
- bkit, when installed: `.bkit/README.md` § Three-tier file ownership and § Ongoing CLI; release notes since pinned version.

### Scope

- Hosts in use; config files each loads per layer (managed policy, user, repo, local override); precedence.
- Instruction files each host loads.
- Permissions: allow / ask / deny, default approval mode, sandbox, fetch allowlist; parity across hosts.
- Hooks and guard scripts: wired, runnable, fire, fail mode.
- Tool servers: inventory per host, transport, pinning, credential source and scope, pre-approved writes, unused servers, tool-description changes.
- Agent definitions, commands, skills: tool allowlists, model pins, sources.
- Secrets in agent config and env files agents load.
- bkit, when installed: version current, `bkit check` drift, `bkit doctor` advisories, host mirrors, managed blocks untouched, seed-or-print diffs.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Instruction files contradicting each other; always-loaded size | Documentation sweep | `bkit-audit-documentation` |
| Model calls the product makes; tool servers the product exposes | LLM sweep | `bkit-audit-llm` |
| Product model registry, deprecation, fallback chains | Model sweep | `bkit-audit-models` |
| CI workflow token permissions, pinned actions; rotating a leaked secret | Security sweep | `bkit-audit-security` |
| Worktrees, branches, stashes agents leave behind; version-control hooks | Repo sweep | `bkit-audit-repo` |
| Hosted environment variables, dashboards, repository rulesets | Config sweep | `bkit-audit-config` |
| Agent and model spend | Cost sweep | `bkit-audit-cost` |
| Whether a sweep here should become a gate | Gate sweep | `bkit-audit-gates` |
| Changing config, or running `bkit install` / `bkit upgrade` | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Checkout:** Steps 2–9 — repo-level agent config. Fallback: none; no checkout → `N/A` and STOP.
- [ ] **Effective Config:** Steps 2, 4, 6 — host's merged-config view where offered (e.g. `claude mcp list`, a host's permissions or MCP panel). Fallback: files + documented precedence by hand; effective state = hypothesis.
- [ ] **Web:** Steps 7, 10 — anchor standards, host references, live model catalogues. Fallback: versions recorded as unread; model pins `Not Checked`.

#### Conditional

Verify only when applicable.

- [ ] **Machine Config:** Audit runs on a developer machine → Steps 2, 4, 6, 8 — user-level and local-override files (e.g. `~/.claude/settings.json`, `.claude/settings.local.json`, `~/.cursor/mcp.json`, `~/.codex/config.toml`). Fallback: repo-level only; machine layers `Not Checked`.
- [ ] **Managed Policy:** Org-managed agent policy → Step 2 — policy file or admin console, read-only. Fallback: `Not Checked`; name who holds it.
- [ ] **Token Scopes:** Tool servers or hooks use credentials → Step 6 — scopes, value never printed (e.g. `gh auth status`, the `X-OAuth-Scopes` response header, provider token introspection). Fallback: scopes `Not Checked`.
- [ ] **bkit CLI:** `.bkit/version` present → Step 9 — `bkit check`, `bkit doctor` (or `pnpm bkit …`), registry read (e.g. `npm view @cbartens/bkit version`). Fallback: read `.bkit/version` `pinnedVersion` vs installed package; drift, advisories `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Hosts and Layers:** Name machine and checkout. Hosts with repo config or in team use (e.g. Claude Code, Cursor, Codex, opencode). Per host: config file per layer (managed policy, user, repo shared, repo local override, flags / env); documented precedence. Findings: config for unused host; host in use with no repo config; local-override file tracked or not ignored. Fresh cloud checkout: no user / local layer → say so, not clean. **Done when:** `Hosts` row per host × layer: file, present, tracked / ignored, precedence.
- [ ] **Step 3 — Instructions:** Per host: instruction files loaded at session start (e.g. `AGENTS.md`, `CLAUDE.md`, always-applied IDE rule files, per-directory files, imports). Findings: host reaching no shared rules; rule file / import → missing path. Contradictions, size → `bkit-audit-documentation`. **Done when:** `Instructions` row per host: files loaded, shared rules reached yes / no.
- [ ] **Step 4 — Permissions:** Per host × layer: allow / ask / deny, default approval mode, sandbox mode, fetch / network allowlist. Findings: wildcard shell allow; arbitrary-text interpreter allow (e.g. `bash -c`, `node -e`, `python -c`); deny overridden by broader higher-precedence allow; approval-bypass mode in shared config outside a sandbox; fetch allowlist wider than needed per host matching rules (e.g. apex vs subdomain). `Parity` matrix: action × host → blocker: deny rule / hook / sandbox / prompt prose only / nothing. Minimum actions: force push, history rewrite, branch delete, hook skip (e.g. `--no-verify`), merge or push to protected branch, publish / release, delete outside the working tree, credential-file read (e.g. `.env*`), fetch to unlisted host, tool-server write to a shared or production system. Findings: blocked in one host, open in another; blocked by prompt prose only. **Done when:** `Permissions` row per host × layer; `Parity` matrix with no empty cell.
- [ ] **Step 5 — Hooks:** Per host, each wired hook: event, matcher, command. Script exists, executable, interpreter present. Fire test: synthetic tool-call payload on stdin → record exit code / decision. Hook writing anything (telemetry, logs, state) → read, do NOT run. Findings: sole blocker for a `Parity` row fails open on crash / timeout / missing dependency; matcher misses a tool doing the same action (e.g. a tool server's shell tool). **Done when:** `Hooks` row per hook: wired, runnable, fires on fixture, fail mode.
- [ ] **Step 6 — Tool Servers:** Per host, each tool server (e.g. MCP): layer, transport (local command / remote URL), package pinned or floating (e.g. `npx -y pkg@latest`), publisher, credential source (env var name vs literal), credential scope vs need, toolsets enabled vs used, write tools pre-approved. List tools → hash names + descriptions. Findings: floating package; same server differing across hosts (token, toolsets, URL); server no workflow uses; hash changed since previous run with no version change. **Done when:** `Tool Servers` row per server × host, hashes recorded.
- [ ] **Step 7 — Agents and Models:** Per host: agent definitions, commands, skills / plugins. Per agent: tool allowlist vs role; model pin vs provider's live catalogue (NEVER inferred from version digits). Per skill / plugin: source, pinned version, ships scripts. Findings: write tools on read-only role; dead pin; floating alias; same agent on different model classes across hosts, undocumented; unknown-source skill with scripts. **Done when:** `Agents` row per agent × host; skills listed.
- [ ] **Step 8 — Secrets:** Agent config + env files agents load (e.g. `.envrc`, tool-server env files, agent-tooling env file). Findings: literal token in tracked file (file and line, never value); env file not ignored; app credential in agent-tooling env. Agent read of credential files → Step 4 `Parity`. **Done when:** `Secrets` row per file.
- [ ] **Step 9 — bkit:** `.bkit/version` absent → explicit skip with evidence. Else: (a) Version: `pinnedVersion` vs installed package vs registry latest; pinned ≠ installed = package bumped without `bkit upgrade`. Behind → release count + release-note fixes touching this repo. (b) `bkit check`: exit code, each drift line. (c) `bkit doctor`: each advisory → adopt / reject (why) / not applicable. (d) Hosts: bkit hosts installed vs Step 2 hosts in use; agent + command mirrors per host. (e) Managed blocks: edits inside `bkit:start` / `bkit:end` → move below `bkit:end` / `Project Instructions`; bkit-shipped defect → upstream bkit fix. (f) Seed-or-print: each diff `bkit check` prints → adopt / reject (why). (g) Gate parity: bkit-shipped permissions and hooks agree across hosts in `Parity`; gap → upstream bkit fix. **Done when:** `bkit` section answers (a)–(g), or skip with evidence.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per agentic risk (ASI01–ASI10), per tool-server security best practice, and per assistant-instructions guide recommendation this audit touches → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching agent config (settings, hooks, tool-server files, agent definitions, skills, instruction load paths, bkit version) → one-line verdict each. (b) Bounded ~30 min pass: what a senior platform engineer flags that no step asks; read what happened since previous run (agent incidents, new `docs/failures.jsonl` rows, friction logs) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No secrets:** no token, key, or secret value anywhere in the report.
- [ ] **Config untouched:** no agent config, hook, tool-server file, agent definition, or bkit-managed file changed; no `bkit install` / `bkit upgrade` run; no tool-server tool called.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Live credential in tracked agent config; unprompted production write via tool server in shared config; approval-bypass mode in shared config outside a sandbox |
| `HIGH` | Action blocked in one host, open in another; blocked by prompt prose only; sole blocking hook never fires or fails open; tool-server credential write / admin where read suffices; arbitrary-interpreter allow; floating tool-server package; `bkit check` failing; pinned ≠ installed |
| `MEDIUM` | Unused host config or tool server; tool description changed, no version change; dead or cross-host-inconsistent model pin; tracked local override; agent tools beyond role; edits inside bkit managed block; unaddressed `bkit doctor` advisory; unapplied seed-or-print diff; bkit behind with relevant fix |
| `LOW` | bkit behind, no relevant fix; naming drift, no behaviour change; doc wrong about agent config while config right |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: production writes, credentials, then parity gaps.

<!-- prettier-ignore -->
| ID | Severity | Host | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, machine, and hosts read.
- [ ] **Series:** `Parity` and tool-server hashes diffed against previous report's, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
