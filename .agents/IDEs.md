# IDE / Host Differences

> [!CAUTION]
> **Purpose:** Authoritative inventory of differences between supported IDE hosts. Drives install script's transform rules. Source-of-truth for "what has to change between IDE versions of commands and subagents".
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - One row per concern. Update when an IDE adds/changes a feature.
> - Anything not listed here = identical across hosts; install copies byte-identical.
> - Canonical format = Claude format. All transforms = Claude → other.

## Supported hosts

<!-- prettier-ignore -->
| Host | Tier | Subagent dir | Command dir | Settings | Hooks |
| --- | --- | --- | --- | --- | --- |
| Claude Code | canonical | `.claude/agents/` | `.claude/commands/` | `.claude/settings.json` | `.claude/hooks/` (registered in settings) |
| Cursor | derived | `.cursor/agents/` | `.cursor/commands/` | `.cursor/settings.json` + `.cursor/environment.json` + `.cursor/Dockerfile` | `.cursor/hooks/` (registered in `.cursor/hooks.json`) |

Future hosts (Codex, Windsurf, Kiro, etc.) — add row + `bkit/hosts/<name>.ts` config.

---

## Subagent invocation (tool + prefix)

<!-- prettier-ignore -->
| Host | Tool name | Prefix | Example |
| --- | --- | --- | --- |
| Claude | `Agent` | `@` | `@bkit-build-plan-execute` invoked via `Agent` tool |
| Cursor | `Task` | `/` | `/bkit-build-plan-execute` invoked via `Task` tool |

**Transform (Claude → Cursor, command bodies):**

- Replace literal `` `Agent` tool `` with `` `Task` tool ``.
- Replace `using \`Agent\` tool`with`using \`Task\` tool`.
- Replace `@<name>` with `/<name>` for kebab-case identifiers, **only inside `**Subagent:**` lines and the protocol description block**. Don't touch `@` elsewhere (markdown anchors, email addresses, npm scopes).
- Subagent body files do NOT contain invocation phrasing — no body transform needed.

---

## Subagent files

### Frontmatter

<!-- prettier-ignore -->
| Field | Claude | Cursor | Notes |
| --- | --- | --- | --- |
| `name` | required | required | kebab-case, must match filename. Identical. |
| `description` | required | required | Identical. |
| `effort` | required (`low` / `medium` / `high` / `xhigh` / `max` — last two model-gated, Opus-only on current models) | not supported | Drop on Cursor side. Used to derive `model`. |
| `tools` | required (e.g. `[Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch]`) | supported (allowlist) + `disallowedTools` denylist | **Identity mapping (BAR-113, verified)** — Cursor 2.4+ accepts the same names as Claude: `Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch`. T3 transform passes `tools:` through verbatim. Verified via Cursor 2.4 docs + main-agent probe (Cursor's main agent exposes both `WebFetch` and `WebSearch` natively, and per the docs subagent allowlists accept the same name set). If a runtime rejection ever surfaces for `WebFetch`/`WebSearch` in a Cursor subagent, only `bkit-design-review-1` and `bkit-design-review-2` are affected. |
| `permissionMode` | required (`acceptEdits` standard) | not supported | Drop on Cursor side. |
| `maxTurns` | required | not supported | Drop on Cursor side. |
| `model` | required (explicit Claude model ID — see `prompts.md` § Frontmatter Conventions effort→model mapping) | required | Pinned per-agent on both sides. On Claude, locks the agent to a specific model independent of session default. On Cursor, drives runner selection via T3 transform. |
| `readonly` | not supported (use `tools` allowlist) | optional boolean | Derive on Cursor side from `tools` (true if no `Edit`/`Write`/`Bash`). Semantics: blocks file writes; whether also blocks bash/terminal is **TBD** (Cursor docs unclear; verify). |
| `is_background` | not supported | optional boolean (Cursor 2.4+) | Default false. Reserve for future opt-in on parallelisable subagents (e.g. `bkit-design-brainstorm-ideate-1` and `-2`). |

### Body

Identical across hosts. Process steps, verdict/findings blocks (`## Verdict` / `## Findings`), `Read:` / `Write:` paths, `> ⛔ STOP` markers — all unchanged. No transform.

Cursor model assignment per subagent: see § Models below — per-agent lookup, NOT effort-tier derived.

---

## Models

> **Effort vs model — different mechanisms.** Claude uses `effort: low|medium|high` as thinking-budget knob within whichever Claude model is user's default; same model, different reasoning depth. Cursor uses explicit `model:` per agent; cross-family diversity (`bkit-design-brainstorm-ideate-1` vs `-2`, `bkit-plan-review-1` vs `-2`) is real model selection across Claude / GPT / Composer families, not single-family effort tier. **Per-agent model assignment is canonical**; derive Cursor `model` from lookup table below, NOT from `effort` alone.

### Cursor model catalog

<!-- prettier-ignore -->
| Model ID | Tier | Typical use |
| --- | --- | --- |
| `composer-2` | $ | Fast cheap; build executors, summarizers, ship-summary, utilities |
| `claude-4.7-opus-high-thinking` | $$$ | High-thought review, audit, design synthesis, debug diagnose, ship docs |
| `claude-4.6-opus-high-thinking` | $$$ | Previous-gen Opus — kept as fallback / availability hedge |
| `claude-4.6-opus-high-thinking-fast` | $$$ | Faster 4.6 variant |
| `claude-4.6-sonnet-thinking` | $$ | Mid-tier reasoning; orchestrator default for build/ship |
| `gpt-5.4-high` | $$ | Plan generation, parallel-pair slot-2 (cross-family diversity) |
| `gpt-5.4-high-fast` | $$ | — |
| `gpt-5.4-xhigh-fast` | $$ | — |
| `gpt-5.3-codex-high` | $$ | — |
| `gpt-5.3-codex-high-fast` | $$ | — |
| `gpt-5.3-codex-xhigh-fast` | $$ | — |

Cloud Agents API catalog: `curl https://api.cursor.com/v0/models -u "$CURSOR_API_KEY:"` (use agent-specific API key — general account keys can return HTTP 500 on `POST /v0/agents`). **Verify before install — Cursor's available models churn.**

> [!NOTE]
> **Subagent model whitelist — needs verification.** Cursor may restrict which models are valid as **subagent runners** (separate from main-agent / Cloud Agent model lists). A probe-time signal flagged that `claude-4.7-opus-high-thinking` may not be in the subagent-allowed set, and `composer-2-fast` / `gpt-5.4-medium` were referenced as examples of subagent-valid models. The `Cursor model` column in `prompts.md` is currently sourced from the Cloud Agent label catalog above — if Cursor substitutes / rejects on subagent dispatch, expect runtime failures across the 17 subagents pinned to `claude-4.7-opus-high-thinking`. Empirical probe required: dispatch one subagent per model ID via Cursor `Task` tool and confirm the model lands. Open follow-up; not BAR-113 scope.

### Per-subagent model assignment

**Lives in `.agents/prompts.md`** (per-agent metadata co-located with agent descriptions, effort / maxTurns rationale, tool-set patterns).

`prompts.md` carries one row per agent with columns: `name | Cursor model | Claude effort | role hint`. Canonical source for Cursor frontmatter rewrite (T3). `bkit/hosts/cursor.ts` mirrors it; CI drift gate enforces parity.

### Per-workflow (orchestrator) model

Model running orchestrator command itself, NOT subagents. Set at workflow launch (Cursor Cloud Agent config / GH Action invocation), NOT in command frontmatter (Cursor commands have no frontmatter):

<!-- prettier-ignore -->
| Workflow | Cursor model | Claude model |
| --- | --- | --- |
| `/bkit-design` | `claude-4.7-opus-high-thinking` | user default |
| `/bkit-plan` | `gpt-5.4-high` | user default |
| `/bkit-build` | `composer-2` | user default |
| `/bkit-debug` | `claude-4.7-opus-high-thinking` | user default |
| `/bkit-ship` | `composer-2` | user default |
| CI automations (`ci-pass`, `ci-fail`) | `composer-2` | n/a |

Automation sessions (Cursor Cloud) use `composer-2` for metadata/API plumbing; the agent they LAUNCH runs the phase model from this table.

### Cursor model label IDs

Used by Cursor Cloud Agents UI for label-based routing:

<!-- prettier-ignore -->
| Label | ID |
| --- | --- |
| composer-2 | `6daa407f-69d4-4bbd-bdc8-ad846611b668` |
| claude-4.7-opus-high-thinking | `6b77d100-7454-43d5-82f9-bf6a616c6b4b` |
| claude-4.6-opus-high-thinking | `41ecf3c1-1574-4226-a116-8d85235bdccf` |
| claude-4.6-opus-high-thinking-fast | `aaa2bccd-533c-4b73-8f0c-3f2ea469ab71` |
| gpt-5.4-high | `13b4f4e2-3cab-4a70-89bc-9623ff894373` |
| gpt-5.4-high-fast | `f6cc71eb-715e-4ceb-955f-d5ff1b12d89b` |
| gpt-5.4-xhigh-fast | `495b2e79-b62a-46b1-a575-c9993868191b` |
| gpt-5.3-codex-high | `67005fc3-4c02-4a05-8174-939d92f8fca1` |
| gpt-5.3-codex-high-fast | `57e86144-6029-4145-a90c-dd64f0b25141` |
| gpt-5.3-codex-xhigh-fast | `2d56fd4b-70b7-4b89-a26c-50fd3389a0d2` |

### Architectural note — `readonly` reconciled (BAR-114, Option 1)

**Decision:** Cursor side **never emits `readonly:`**. Subagents write directly on both hosts, matching the canonical Claude command shape. Safety net is the `tools:` allowlist (BAR-113 — pending; until verified, Cursor subagents have full tool access).

**Implementation:** T3 transform in `bkit-install.ts` emits only `name` / `description` / `model` — no `readonly:`. Generated `.cursor/agents/*.md` confirm zero `readonly:` lines.

**Trade-off accepted:** Cursor's per-agent runtime safety guarantee is replaced by tool-allowlist sandboxing once BAR-113 lands. Canonical command bodies are byte-identical-shape across hosts; outputs are identical.

**Discarded options** (record-only):

- Inject orchestrator-write logic into `.cursor/commands/` during T2 — high body-transform divergence per host.
- Keep `readonly: true` and document accepted runtime divergence — outputs match, mechanism differs, raises per-host debugging cost.

---

## Command files

### Frontmatter

<!-- prettier-ignore -->
| Host | Frontmatter | Notes |
| --- | --- | --- |
| Claude | `description:` (single field) | Surfaces in slash-command picker. |
| Cursor | **none** | Per current Cursor docs, command files are plain markdown. Frontmatter tolerated/ignored on legacy files but not part of spec. |

**Transform (Claude → Cursor, command files):** strip entire YAML frontmatter block (everything between leading `---` and closing `---`, plus trailing blank line).

### Body

- Subagent invocation phrasing differs — see § Subagent invocation transform above.
- Everything else (Linear MCP calls, `git`, `gh`, `pnpm`, step structure, `Failure Path`, gates, status.json/lock logic) is identical.

### Slash-command activation

Both hosts use `/<filename-without-ext>` to trigger commands (`/bkit-build`, `/bkit-plan`, etc.). Identical UX.

---

## Hooks

<!-- prettier-ignore -->
| Concern | Claude | Cursor |
| --- | --- | --- |
| Config file | `.claude/settings.json` → `hooks.SessionStart[].hooks[].command` | `.cursor/hooks.json` → `hooks.sessionStart[].command` (separate JSON file) |
| Script location | `.claude/hooks/*.sh` | `.cursor/hooks/*.sh` |
| Trigger names | `SessionStart`, `Stop`, others | `sessionStart`, `stop` (camelCase, lowercase first letter) |
| Stdin payload | `{ session_id, transcript_path, cwd, permission_mode }` | `{ session_id, is_background_agent, composer_mode }` (sessionStart); `{ status }` (stop) |
| Blocking | **Cannot block** — non-zero exit treated as non-blocking. Must inject `additionalContext` HARD STOP into prompt + write reason to stderr. | **Can block** via `failClosed: true`. Non-zero exit aborts session. |
| Output format (sessionStart) | JSON: `{ "hookSpecificOutput": { "hookEventName": "SessionStart", "additionalContext": "..." } }` | JSON: `{ "additional_context": "..." }` (snake_case) |
| Stop hook config | `Stop` array | `stop[].loop_limit` (controls iteration cap; `null` = unlimited) |
| Telemetry | Not part of host (custom in script) | Not part of host (custom in script — see `postflight.sh` log-drain pattern) |

**Install behaviour:** hook scripts are **template drops** (per-host, NOT generated from `.agents/`). Semantic differences above (blocking vs non-blocking, stdin shape, output JSON shape) make a single canonical script impossible. Maintain two parallel implementations under `bkit/templates/<host>/hooks/`. Keep them functionally equivalent.

---

## Permissions / auto-approve

<!-- prettier-ignore -->
| Concern | Claude | Cursor |
| --- | --- | --- |
| File | `.claude/settings.json` → `permissions.{allow,deny,ask}` | `.cursor/settings.json` → `plugins.<name>.enabled` (per-plugin only); fine-grained file/bash gating not project-scoped — handled by Cursor UI/global config |
| Granularity | Per-tool glob: `Bash(*)`, `Read(./.env)`, `WebFetch(domain:github.com)`, `Bash(rm -rf /*)` | Coarse per-plugin enable/disable |
| Modes | `defaultMode: default \ | acceptEdits \ | plan \ | bypassPermissions` | Implicit per-mode (Composer / Agent / Background) |
| MCP server config | `mcpServers.<name>.url` inline | `plugins.<name>.enabled` (Cursor auto-discovers from registry) |

**Install behaviour:** template drops, host-specific. No transform — these files have no canonical form.

---

## Runtime environment (cloud agents)

<!-- prettier-ignore -->
| Concern | Claude | Cursor |
| --- | --- | --- |
| Build env | (decommissioned in BAR-125; no GHA runtime) | `.cursor/Dockerfile` (Cursor Cloud builds custom image) |
| Install/start | n/a | `.cursor/environment.json` → `install`, `start`, `terminals[]`, `env`, `ports` |
| Port forwarding | n/a | `.cursor/environment.json` → `terminals[].ports` |
| Secrets | n/a | Cursor Cloud env vars |

**Install behaviour:** template drops; project-specific tokens (pnpm version, port number, dev command) substituted at install.

---

## System-prompt / memory files

<!-- prettier-ignore -->
| Host | Reads automatically | Format |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (root + nearest ancestor) | Plain markdown |
| Cursor | `AGENTS.md` (root, AGENTS.md spec) + `.cursor/rules/*.mdc` (MDC: markdown + optional YAML frontmatter with `description`, `globs`, `alwaysApply`) | Plain markdown / MDC |
| Both (de-facto cross-host convention) | `AGENTS.md` increasingly read by all hosts incl. Claude Code, Codex, Cursor | Plain markdown |

**Current setup:** `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc` all contain a one-line redirect to `.agents/rules.md`. AGENTS.md additionally carries cross-host workflow router (Linear-issue parsing → label-based command dispatch). All three files MUST exist after install.

**Transform:** generator manages these via **managed-block markers** (`<!-- bkit:start -->` … `<!-- bkit:end -->`). Content inside block is regenerated; content outside preserved.

---

## Skills

<!-- prettier-ignore -->
| Host | Mechanism | Location |
| --- | --- | --- |
| Claude Code | First-class `Skill` tool. Registered via `.claude/settings.json` → `permissions.allow: ["Skill(*)"]`. Discoverable via plugin marketplace. | `~/.claude/skills/` (user) + `.agents/skills/` (project) + plugin skill dirs |
| Cursor | Cursor 2.4+ Agent Skills (similar shape). | `.cursor/skills/` (per docs); `.agents/skills/` referenced via custom routing |

`.agents/skills/` is the **canonical project skill directory**. Both hosts read from it. No per-host transform. Skill list lives in `.agents/skills.md`.

---

## Background / async execution

<!-- prettier-ignore -->
| Host | Mechanism |
| --- | --- |
| Claude Code | Synchronous `Agent` tool calls; parallel calls in single turn = parallel execution within main agent. No first-class async/background concept. |
| Cursor | `is_background: true` on subagent → spawns Cursor Cloud Agent that runs detached; main agent continues. Async by design. |

**Implication:** workflow's "parallel" pairs (`bkit-design-brainstorm-ideate-1`/`-2`, `bkit-plan-review-1`/`-2`) get parallelism on Claude side via concurrent `Agent` tool calls in one turn; on Cursor side, opt-in via `is_background: true`. Default off in canonical files; Cursor host config can flip selected subagents on at install time.

---

## Tool name parity

Tool names referenced in subagent `tools:` fields and command bodies (`Bash`, `Edit`, `Read`, etc.) are Claude's spelling. Cursor's tool surface uses different identifiers in some places (`terminal`, `edit_file`, `read_file`, `apply_diff`). Whether passing Claude tool names through to Cursor's `tools:` allowlist works (tolerant alias) or rejects (strict spelling) is unverified. Mapping table belongs in `bkit/hosts/cursor.ts`.

---

## How to add a new host

1. Add row to § Supported hosts above.
2. Document deltas per concern (subagent invocation, frontmatter, hooks, permissions, runtime, etc.).
3. Implement transforms in `bkit/hosts/<name>.ts`. Each delta in this file maps to one transform rule.
4. Drop static template files into `bkit/templates/<name>/` (settings, hooks, runtime configs).
5. Add regression test: install into a fresh repo, verify the 5 phase commands plus 7 worktree utilities all execute end-to-end.
6. Update `AGENTS.md` routing table to include new host's command paths.

---

## Verify against current Cursor surface

Cursor's API and frontmatter spec churn — confirm before changes that depend on these:

- Cursor model IDs in § Cursor model catalog still exist and aren't superseded.
- Cursor `readonly: true` semantics — file writes only, or also bash/terminal.
- Cursor tool-name parity with Claude (`Bash` vs `terminal`, `Edit` vs `edit_file`, etc.).
- Cursor `Task` tool resolution: `/<name>` → `.cursor/agents/<name>.md` (mirrors Claude `Agent` tool resolving `@<name>` → `.claude/agents/<name>.md`).
- `AGENTS.md` adoption across hosts — when all hosts read it natively, redirect files (`CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`) can shrink further.
