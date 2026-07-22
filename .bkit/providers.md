# IDE / Host Differences

> [!CAUTION]
> **Purpose:** Authoritative inventory of IDE host differences. Drives install script transform rules. Source-of-truth for "what changes between IDE versions of commands and subagents".
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - One row per concern. Update when an IDE adds/changes a feature.
> - Unlisted = identical across hosts; install copies byte-identical.
> - Canonical format = Claude. All transforms = Claude → other.

## Supported hosts

<!-- prettier-ignore -->
| Host | Tier | Subagent dir | Command dir | Settings | Hooks | Install |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | canonical | `.claude/agents/` | `.claude/commands/` | `.claude/settings.json` | `.claude/hooks/` (registered in settings) | `bkit install --claude` |
| Cursor | derived | `.cursor/agents/` | `.cursor/commands/` | `.cursor/settings.json` + `.cursor/environment.json` + `.cursor/Dockerfile` | `.cursor/hooks/` (registered in `.cursor/hooks.json`) | `bkit install --cursor` |
| opencode | additive (opt-in) | `.opencode/agents/` | `.opencode/commands/` | `.opencode/opencode.json` | `.opencode/plugin/gateguard.js` (PreToolUse) | `bkit install --opencode=<provider>` |

**Explicit host axis (no implicit full):** `bkit install` requires ≥1 module flag — bare `bkit install` errors. Every host explicit; hosts compose: `bkit install --claude --cursor --opencode=opencode-zen` installs all three (+ implicit core). Host axis = **nullary vs unary**: claude/cursor nullary (one rendering each — claude = canonical Anthropic, cursor = derived catalog); `--opencode` unary (provider-pluggable; cannot render without `=<provider>`). Provider selection (`ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama` (cloud), opencode-native `opencode-zen` + `opencode-go` — strict allowlist) is part of flag: `bkit install --opencode=<provider>`. Switch providers: re-run install. All hosts render from `.bkit/`; run state in `status.jsonl` + plan docs + tracker (never host session) — phase/resumed run moves across hosts/providers mid-feature with identical gates + per-agent pins: hit limit on one, continue on another. `bkit status` → installed hosts + active providers; `bkit doctor` → credentials + tool reachability.

> **Curated-column status (COMPLETE).** All eight allowlisted providers (`ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama` (cloud), `opencode-zen`, `opencode-go`) ship curated per-agent model pins in `prompts.md` § Models → install ready-to-run. Six OpenAI-compatible + both opencode gateways curated after live catalog probe + per-model tool-calling smoke (`tools:` chat/completions round-trip emitting `tool_calls`; `/models` alone ≠ proof). **opencode catalogs = models.dev, NOT `/zen/v1/models`** — REST endpoint returns Zen-only; cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`, …); models.dev source of truth (`opencode` = Zen, `opencode-go` = Go). `opencode-go` curated from models.dev/Go endpoint; prefer pins within Go 5h window; `opencode-zen` existence-validated via models.dev. `<provider>/set-model-id` = safety net for future allowlisted provider pre-column. See § Models for live-probe recipe + tier rationale.

**Additive multi-provider install:** `bkit install --opencode=<provider>` additive — second provider ADDS block to `opencode.json`, keeps first. Agent frontmatter (`model:`) re-renders to last-installed (active) provider; other blocks stay for interactive switch/overrides. Installed providers → `bkit.opencodeProviders: string[]` in `package.json`; active → `bkit.opencodeProvider`. `bkit status` lists all, marks active; `bkit doctor` checks all credentials. Remove one: `bkit uninstall --opencode=<provider>` (surgical — block + array; if active removed, re-point via `bkit install --opencode=<new>` or `bkit upgrade`). `bkit uninstall --opencode` (bare) tears down entire opencode host.

**Local vs cloud Ollama — two distinct provider keys:** `ollama-local` (`bkit install --opencode=ollama-local`) → local Ollama via `@ai-sdk/openai-compatible` — **no API key**, `http://localhost:11434/v1`. `ollama` (`bkit install --opencode=ollama`) → **cloud Ollama** (ollama.com) — needs `OLLAMA_API_KEY`, `https://ollama.com/v1`, same driver. Do not confuse: opencode built-in "ollama" = cloud; bkit cloud key = bare `ollama`; local = `-local` suffix.

Future hosts (Codex, Windsurf, Kiro, etc.) — add row + `bkit/hosts/<name>.ts`.

---

## macOS GUI-isolation — `bkit cursor` / `bkit opencode`

**Root cause:** macOS GUI apps (Dock/Finder/Spotlight) run under `launchd` — **do not** inherit login-shell env. `direnv` exports from `.bkit/.env` stay shell-only. Token placeholders (`${GH_BKIT_TOKEN}` in `.cursor/mcp.json`, `{env:NVIDIA_API_KEY}` in `.opencode/opencode.json`) resolve empty → MCP auth failures.

**Fix — launcher verbs:** `bkit cursor` / `bkit opencode` exec app binary with `.bkit/.env` merged into child env. Dynamic, per-repo, zero global state.

```
bkit cursor    # /Applications/Cursor.app/Contents/MacOS/Cursor
bkit opencode  # /Applications/opencode.app/Contents/MacOS/opencode
```

- **Quit first.** Running instance keeps launch-time env; re-exec required.
- **Binary override:** `BKIT_CURSOR_BIN=<path>` / `BKIT_OPENCODE_BIN=<path>` for non-standard paths.
- **Cursor:** passes repo `cwd` as positional arg.
- **opencode:** no positional arg; reads `opencode.json` from `cwd`.

**`bkit doctor` check:** reports `.bkit/.env` keys with non-empty file value but absent from `process.env` (= Dock/Finder session); advisory → `bkit cursor` / `bkit opencode`.

**launchctl fallback (opt-in, not recommended):** exposes key to launchd apps current session only (not persistent across reboots). Manual re-run after restart + manual rotation — prefer launcher verbs.

```bash
launchctl setenv GH_BKIT_TOKEN "$GH_BKIT_TOKEN"
launchctl setenv NVIDIA_API_KEY "$NVIDIA_API_KEY"
# then relaunch from Dock — values survive until next reboot
```

Persistent variant: `RunAtLoad` LaunchAgent plist (`~/Library/LaunchAgents/`) with one `setenv` per token. Same rotation caveat.

---

## Subagent invocation (tool + prefix)

<!-- prettier-ignore -->
| Host | Tool name | Prefix | Example |
| --- | --- | --- | --- |
| Claude | `Agent` | `@` | `@bkit-build-plan-execute` invoked via `Agent` tool |
| Cursor | `Task` | `/` | `/bkit-build-plan-execute` invoked via `Task` tool |
| opencode | `/` (slash command) | `/` | `/bkit-build-plan-execute` invoked via opencode slash command |

**Transform (Claude → Cursor, command bodies):**

- Replace literal `` `Agent` tool `` with `` `Task` tool ``.
- Replace `using \`Agent\` tool`with`using \`Task\` tool`.
- Replace literal `` `Skill` tool `` with `` `Task` tool `` (slash-command — Cursor `Task` covers subagent + slash; Claude splits `Agent` + `Skill`).
- Replace `using \`Skill\` tool`with`using \`Task\` tool`.
- Replace `@<name>` with `/<name>` for kebab-case identifiers, **only inside `**Subagent:**` lines and protocol description block**. Don't touch `@` elsewhere (anchors, email, npm scopes).
- Subagent body files lack invocation phrasing — no body transform.

---

## Subagent files

### Frontmatter

<!-- prettier-ignore -->
| Field | Claude | Cursor | Notes |
| --- | --- | --- | --- |
| `name` | required | required | kebab-case, must match filename. Identical. |
| `description` | required | required | Identical. |
| Field | Claude | Cursor | opencode | Notes |
| --- | --- | --- | --- | --- |
| `name` | required | required | required | kebab-case, must match filename. Identical. |
| `description` | required | required | required | Identical. |
| `effort` | required (`low` / `medium` / `high` / `xhigh` / `max` — last two model-gated, Opus-only on current models) | not supported | mapped to `reasoningEffort` | Drop on Cursor. Maps to opencode `reasoningEffort` via `applyOpencodeAgent`: `low`→`none`, `medium`→`low`, `high`→`medium`, `xhigh`→`high`, `max`→`max`. |
| `tools` | required (e.g. `[Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch]`) | supported (allowlist) + `disallowedTools` denylist | not supported | Identity mapping on Cursor (verified). Dropped on opencode. |
| `permissionMode` | required (`acceptEdits` standard) | not supported | not supported | Drop on Cursor and opencode. |
| `maxTurns` | required | not supported | not supported | Drop on Cursor and opencode. |
| `model` | required (explicit Claude model ID — see `prompts.md` § Frontmatter Conventions effort→model mapping) | required | required (provider-prefixed, e.g. `ollama-local/qwen3-coder:30b`) | Pinned per-agent. Claude locks model. Cursor drives runner via T3. opencode: `<provider>/<model-id>` (see `prompts.md` § Models, columns `Nvidia` / `Ollama (Local)` / …). |
| `readonly` | not supported (use `tools` allowlist) | optional boolean | not supported | Cursor: derive from `tools` (true if no `Edit`/`Write`/`Bash`). |
| `is_background` | not supported | optional boolean (Cursor 2.4+) | not supported | Default false. Reserve for future opt-in on parallelisable subagents. |
| `reasoningEffort` | not a frontmatter field (use `effort`) | not supported | `none` / `low` / `medium` / `high` / `max` | opencode-native. Set by `applyOpencodeAgent` from `effort`. |

### Body

Identical across hosts. Process steps, verdict/findings (`## Verdict` / `## Findings`), `Read:` / `Write:` paths, `> ⛔ STOP` — unchanged. No transform.

Cursor model assignment: § Models below — per-agent lookup, NOT effort-tier derived.

---

## Models

> **Effort vs model — different mechanisms.** Claude: `effort: low|medium|high|xhigh` = thinking-budget on pinned model. Cursor: explicit `model:` per agent; cross-family diversity (`bkit-design-brainstorm-ideate-1`/`-2`/`-3`, `bkit-plan-review-1`/`-2`/`-3`) = real model selection, not single-family effort. **Per-agent model assignment canonical**; derive Cursor `model` from `prompts.md` § Models, NOT `effort` alone.

### Cursor model catalog

**Pinned selections canonical in `prompts.md`** (§ Models `Cursor` column + § Orchestrators) — not here. Cursor set churns; use pull recipe below. Tier guidance:

- **`composer-2.5`** ($) — fast/cheap: build executors, summarizers, ship-summary, utilities, orchestrator plumbing. First-party pool.
- **`cursor-grok-4.5-high`** ($$) — cross-family diversity (plan generation, parallel-pair slot-2). First-party pool (Cursor + SpaceXAI); Coding Agent Index parity with GPT-5.5 at lower per-task cost. `-fast` variant exists. GPT-5.x (`gpt-5.6-sol-high`, …) on API pool as diversity hedge — not currently pinned.
- **`claude-opus-*-thinking-high`** ($$$) — deep review, audit, design synthesis, debug diagnosis, ship docs. Current `claude-opus-4-8-thinking-high`; `-fast` + prior-gen (`claude-opus-4-7-thinking-high`, legacy `claude-4.6-opus-high-thinking`) = availability hedges. API pool.
- **`claude-fable-5-thinking-high`/`-xhigh`** ($$$$) — Fable 5, tier above Opus. **Available, not adopted** (see `prompts.md` § Effort → Claude model mapping).
- **No Sonnet** on Cursor — never pin `claude-*-sonnet-*` ID.

Cloud Agents API: `curl https://api.cursor.com/v0/models -u "$CURSOR_API_KEY:"` (agent-specific API key — general keys can HTTP 500 on `POST /v0/agents`). **Verify before install — Cursor models churn.** API currently **no Sonnet** — former `claude-4.6-sonnet-thinking` pin gone; build/ship orchestrators use `composer-2.5`; Fable 5 (`claude-fable-5-thinking-high`/`-xhigh`) offered but not adopted.

> [!NOTE]
> **Subagent model IDs — corrected to live API format.** Prior pin `claude-4.7-opus-high-thinking` used word-order API never listed (`claude-opus-4-N-thinking-high`; legacy 4.6 kept old order) — likely root of "may not be in subagent-allowed set". `prompts.md` `Cursor model` column now pins `claude-opus-4-8-thinking-high` / `cursor-grok-4.5-high` / `composer-2.5`, confirmed in live `/v0/models` (2026-07-21). Residual: IDE **subagent-runner** ≠ Cloud Agents API; per-subagent dispatch via `Task` not empirically smoke-tested — confirm one dispatch per model ID before full validation.

### Per-subagent model assignment

**Lives in `.bkit/prompts.md`** (per-agent metadata with descriptions, effort/maxTurns rationale, tool patterns).

`prompts.md`: one row per agent: `name | Cursor model | Claude effort | role hint`. Canonical for Cursor frontmatter rewrite (T3). `bkit/hosts/cursor.ts` mirrors; CI drift gate enforces parity.

### Per-workflow (orchestrator) model

Orchestrator model selection (per workflow, every provider) canonical in **`prompts.md` § Orchestrators** — not duplicated here. Orchestrators use **session model** (commands lack frontmatter): Claude → `/model` before invoke; Cursor → workflow launch (Cloud Agent config / GH Action). Subagent `model:` pins independent — Opus-tier subagents stay pinned regardless of orchestrator. Reasoning-depth (`medium` default) + inlining-drift escalation in `prompts.md` § Orchestrators.

### Cursor model label IDs

Dashboard label-based routing.

> **Stale-risk:** dashboard label-routing UUIDs — distinct from `/v0/models` API IDs; may lag pins. Re-pull from Cloud dashboard before label routing. Per-subagent `model:` frontmatter uses API model-ID string, NOT these UUIDs.

<!-- prettier-ignore -->
| Label | ID |
| --- | --- |
| composer-2.5 | `6daa407f-69d4-4bbd-bdc8-ad846611b668` |
| claude-4.7-opus-high-thinking | `6b77d100-7454-43d5-82f9-bf6a616c6b4b` |
| claude-4.6-opus-high-thinking | `41ecf3c1-1574-4226-a116-8d85235bdccf` |
| claude-4.6-opus-high-thinking-fast | `aaa2bccd-533c-4b73-8f0c-3f2ea469ab71` |
| gpt-5.4-high | `13b4f4e2-3cab-4a70-89bc-9623ff894373` |
| gpt-5.4-high-fast | `f6cc71eb-715e-4ceb-955f-d5ff1b12d89b` |
| gpt-5.4-xhigh-fast | `495b2e79-b62a-46b1-a575-c9993868191b` |
| gpt-5.3-codex-high | `67005fc3-4c02-4a05-8174-939d92f8fca1` |
| gpt-5.3-codex-high-fast | `57e86144-6029-4145-a90c-dd64f0b25141` |
| gpt-5.3-codex-xhigh-fast | `2d56fd4b-70b7-4b89-a26c-50fd3389a0d2` |

### Architectural note — `readonly` reconciled

**Decision:** Cursor **never emits `readonly:`**. Subagents write directly on both hosts, matching canonical Claude command shape. Safety net = `tools:` allowlist (pending verification; until then, Cursor subagents have full tool access).

**Implementation:** T3 in `bkit-install.ts` emits only `name` / `description` / `model` — no `readonly:`. Generated `.cursor/agents/*.md` confirm zero `readonly:` lines.

**Trade-off accepted:** Cursor per-agent runtime safety → tool-allowlist sandboxing once `tools:` lands. Canonical command bodies byte-identical-shape; outputs identical.

**Discarded options** (record-only):

- Inject orchestrator-write logic into `.cursor/commands/` during T2 — high body-transform divergence.
- Keep `readonly: true`, document runtime divergence — outputs match, mechanism differs, per-host debugging cost.

---

## Command files

### Frontmatter

<!-- prettier-ignore -->
| Host | Frontmatter | Notes |
| --- | --- | --- |
| Claude | `description:` (single field) | Surfaces in slash-command picker. |
| Cursor | **none** | Per current Cursor docs, command files are plain markdown. Frontmatter tolerated/ignored on legacy files but not part of spec. |

**Transform (Claude → Cursor, command files):** strip entire YAML frontmatter block (leading `---` to closing `---` + trailing blank line).

### Body

- Subagent invocation phrasing — § Subagent invocation transform above.
- Else (Linear MCP, `git`, `gh`, `pnpm`, steps, `Failure Path`, gates, status.jsonl/lock) identical.

### Slash-command activation

Both hosts: `/<filename-without-ext>` (`/bkit-build`, `/bkit-plan`, etc.). Identical UX.

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

**Install behaviour:** hook scripts = **template drops** (per-host, NOT from `.agents/`). Semantic differences (blocking, stdin, output JSON) prevent single canonical script. Two parallel implementations under `bkit/templates/<host>/hooks/`. Functionally equivalent.

### GateGuard

Pre-edit advisory hook. First file touch per session → investigation checklist; gate-config paths (tsconfig/eslint/prettier/vitest/vale/slop/lint-staged) → "fix code, don't weaken gate" advisory. **fail-open**, **subagent-exempt** (skips when `agent_id` in payload), dedup `(session, file)` via OS-temp state, 24h TTL.

<!-- prettier-ignore -->
| Host | Implementation | File | Registration |
| --- | --- | --- | --- |
| Claude Code | `gateguard.cjs` (CJS) | `.claude/hooks/gateguard.cjs` | `.claude/settings.json` → `hooks.PreToolUse` on `Edit\|Write\|MultiEdit` |
| opencode | `gateguard.js` (ESM) | `.opencode/plugin/gateguard.js` | `.opencode/opencode.json` → `plugin` array (opencode plugin spec — the key is `plugin`, singular; `plugins` is silently ignored and disables GateGuard) |
| Cursor | **not supported** | n/a | Cursor has SessionStart/Stop + post-hoc `afterFileEdit` but no pre-edit event that injects model-visible context — faithful port impossible |

**Modes (env):** unset → advisory _[default]_; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny first touch (checklist as reason), allow retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses gate-config advisory.

**Subagent exemption difference:** Claude `gateguard.cjs` checks `agent_id` in PreToolUse payload. opencode `gateguard.js` uses different subagent detection (plugin API); exemption may differ — validate in plugin spec.

**Deny mode:** Claude `PreToolUse` blocks via exit 2 / `permissionDecision: deny`. opencode plugin deny semantics may differ — check plugin spec for block return shape.

---

## Permissions / auto-approve

<!-- prettier-ignore -->
| Concern | Claude | Cursor |
| --- | --- | --- |
| File | `.claude/settings.json` → `permissions.{allow,deny,ask}` | `.cursor/settings.json` → `plugins.<name>.enabled` (per-plugin only); fine-grained file/bash gating not project-scoped — handled by Cursor UI/global config |
| Granularity | Per-tool glob: `Bash(*)`, `Read(./.env)`, `WebFetch(domain:github.com)`, `Bash(rm -rf /*)` | Coarse per-plugin enable/disable |
| Modes | `defaultMode: default \| acceptEdits \| plan \| bypassPermissions` | Implicit per-mode (Composer / Agent / Background) |
| MCP server config | `.mcp.json` at repo root (`mcpServers.<name>.url`) | `.cursor/mcp.json` (same `mcpServers.<name>.url` shape) |

**Install behaviour:** template drops, host-specific. No transform — no canonical form.

### MCP config asymmetry — GitHub tracker

Both hosts: same `mcpServers` shape; files differ:

<!-- prettier-ignore -->
| Host | File | Written by |
| --- | --- | --- |
| Claude Code | `.mcp.json` at repo root | `bkit install --tracker=github` seeds the `github` entry |
| Cursor | `.cursor/mcp.json` | `bkit install --tracker=github` seeds this file with the same `mcpServers.github` block |

Both: `"type": "http"`, `"url": "https://api.githubcopilot.com/mcp/"`, `"headers": { "Authorization": "Bearer ${GH_BKIT_TOKEN}" }`. `${GH_BKIT_TOKEN}` at session start — must be in shell (local) or dashboard env (cloud). See `.bkit/cloud.md` § MCP issue-tracker integration for full JSON.

**Tracker switch seed-only, not rewrite.** `.mcp.json` / `.cursor/mcp.json` Tier-3 seed-or-print: bkit writes tracker-filtered content only when absent. Existing file never overwritten — tracker switch (e.g. `--tracker=linear` → `--tracker=github`) leaves old entry. Advisories: `mcp-missing-server-<name>` (file lacks needed server), `mcp-extra-server-<name>` (bkit-managed server tracker no longer uses). Consumer-added MCP servers never flagged.

> Note: `mcpServers` in `.claude/settings.json` silently ignored for server defs — only `.mcp.json` (project) or `claude mcp add` (user) take effect. Tool-permission `allow` (`mcp__github__*`) remain in settings.

---

## Runtime environment (cloud agents)

> Setup recipe + alignment: `.bkit/cloud.md`. This section = host-diff matrix only.

<!-- prettier-ignore -->
| Concern | Claude Code on the web | Cursor Background Agents |
| --- | --- | --- |
| Where env config lives | Claude app (per-environment), NOT in repo | In repo (`.cursor/`) |
| Custom base image | Not supported — setup script layers on top of Anthropic-managed Ubuntu 24.04 | Supported — `.cursor/Dockerfile` |
| Cold-start cache | Snapshot keyed by setup-script body hash (~7d TTL) | Docker image layers |
| Per-snapshot install | `.claude/hooks/cloud-bootstrap.sh` (SessionStart, fires when `CLAUDE_CODE_REMOTE=true`) | `.cursor/environment.json` → `install` |
| Build env | Setup script (paste-in via Claude app UI) | `.cursor/Dockerfile` (Cursor Cloud builds custom image) |
| Install/start | n/a (handled by bootstrap hook) | `.cursor/environment.json` → `install`, `start`, `terminals[]`, `env`, `ports` |
| Port forwarding | n/a | `.cursor/environment.json` → `terminals[].ports` |
| Cloud-session detection | `CLAUDE_CODE_REMOTE=true` (env var) | `is_background_agent === true` (stdin JSON) |
| Default network | `Trusted` allowlist (npm, GitHub, PyPI, Docker Hub, vale tarball) | Outbound open in the sandbox |
| Reusable across repos | Setup script yes (generic snapshot); environment no — one per repo (secrets / PAT scope are per-repo) | No — Dockerfile per repo (bkit Tier 3 keeps content byte-identical) |
| Secrets | Env vars in Claude app (plaintext; rotate PATs) | Cursor Cloud env vars (Settings → Background Agents → Environment Variables) |
| Linear preflight | `.claude/hooks/preflight.sh` (SessionStart, non-blocking — uses `additionalContext` HARD STOP) | `.cursor/hooks/preflight.sh` (`sessionStart`, `failClosed: true`, blocks on non-zero) |

**Install behaviour:** template drops; project tokens at install. Both clouds aligned via bkit: vale 3.9.1, pnpm (corepack-pinned `package.json#packageManager`), gh CLI. See `.bkit/cloud.md` for paste-in recipe + sharing pattern.

---

## Models

### Per-provider live model lookup

Installed provider catalog changes. Look up model IDs before pinning in `.opencode/opencode.json`:

<!-- prettier-ignore -->
| Provider | Command | Notes |
| --- | --- | --- |
| Claude (Anthropic) | `curl https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"` | Canonical `Claude` column source. No key in-shell → cross-check via the OpenRouter `anthropic/*` mirror. |
| Cursor | `curl https://api.cursor.com/v0/models -u "$CURSOR_API_KEY:"` | `Cursor` column source. Catalog churns — currently NO Sonnet (Fable 5 + Opus 4.7/4.8 + GPT-5.x + Grok 4.5 + composer-2.5). |
| ollama-local | `curl http://localhost:11434/v1/models` | Local server; models vary by what you have pulled. |
| NVIDIA NIM | `curl https://integrate.api.nvidia.com/v1/models -H "Authorization: Bearer $NVIDIA_API_KEY"` | Hosted; catalog changes; verify before pinning. |
| Groq | `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"` | Hosted; small catalog. Coding/tool-calling set: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.6-27b`, `llama-3.3-70b-versatile` (no Kimi / Qwen3-Coder-480B; `qwen3-32b` was removed). Confirm tool-calling per model. |
| Cerebras | `curl https://api.cerebras.ai/v1/models -H "Authorization: Bearer $CEREBRAS_API_KEY"` | Hosted; tiny catalog: only `zai-glm-4.7` + `gpt-oss-120b`. |
| OpenRouter | `curl https://openrouter.ai/api/v1/models` | **Public — no key.** Aggregator; `vendor/model` slugs (`:free` variants exist). Filter for tool-calling + coding models before pinning. |
| Ollama (Cloud) | `curl https://ollama.com/v1/models -H "Authorization: Bearer $OLLAMA_API_KEY"` | Hosted Ollama; cloud-tagged models (e.g. `qwen3.5:397b`, `kimi-k2.7-code`). Distinct from `ollama-local`. |
| OpenCode Zen / Go (opencode-native gateways) | `curl https://models.dev/api.json` — read providers `.opencode` (Zen) and `.["opencode-go"]` (Go) `.models` | **models.dev is the source of truth — NOT `/zen/v1/models`.** The REST catalog `curl https://opencode.ai/zen/v1/models` returns ONLY the Zen catalog and cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`/`qwen3.7-max`, …), so it MUST NOT be used to curate the Go column. Two DISTINCT providers: `opencode` (name "OpenCode Zen", api `https://opencode.ai/zen/v1`) and `opencode-go` (name "OpenCode Go", api `https://opencode.ai/zen/**go**/v1` — nested under `/zen/`). Both auth via `OPENCODE_API_KEY`. Tool-call smoke: `POST <api>/chat/completions` with a `tools:` payload (bare model id, e.g. `minimax-m3`). |

**Model ID format:** opencode provider-prefixed frontmatter: `<provider>/<model-id>` (e.g. `ollama-local/qwen3-coder:30b`, `nvidia/moonshotai/kimi-k2.6`). Pins = `prompts.md` § Models — **one column per provider** (`Nvidia`, `Ollama (Local)`, `Groq`, `Cerebras`, `OpenRouter`, `Ollama (Cloud)`, `OpenCode Zen`, `OpenCode Go`). Gateways: `opencode/<id>` Zen, `opencode-go/<id>` Go. CLI keys `opencode-zen` / `opencode-go`.

**Lookup mechanic (install pin resolution).** `bkit install --opencode=<provider>` → `buildOpencodeModelLookup(promptsMdPath, provider)` (`.bkit/src/bkit-install.ts`):

1. Provider key → `prompts.md` column via `OPENCODE_PROVIDER_COLUMN` (`ollama-local`→`Ollama (Local)`, `nvidia`→`Nvidia`, `groq`→`Groq`, `cerebras`→`Cerebras`, `openrouter`→`OpenRouter`, `ollama`→`Ollama (Cloud)`, `opencode-zen`→`OpenCode Zen`, `opencode-go`→`OpenCode Go`).
2. Parse column → seed `.opencode/agents/<name>.md` `model:` verbatim.
3. No column → `<opencode-provider-id>/set-model-id` sentinel. Prefix = opencode-side id, not bkit key.

**opencode-zen / opencode-go — two OpenCode built-in providers.** Both emit minimal `provider.<id>` with only `options.apiKey: "{env:OPENCODE_API_KEY}"` (no npm driver, no baseURL). OpenCode resolves from models.dev — Go Qwen/MiniMax use Anthropic `/messages`, not openai-compatible `/chat/completions`. Zen keyed `opencode`; Go `opencode-go`. `bkit install --opencode=opencode-zen` (or `=opencode-go`) → `bkit.opencodeProvider` in `package.json`; legacy `opencode` → `opencode-zen` via `OPENCODE_PROVIDER_ALIASES`. Reinstall **replaces** seeded block (heals hijacked npm/baseURL). Set `OPENCODE_API_KEY` in `.bkit/.env` (<https://opencode.ai/auth>). Columns from **models.dev**.

**All eight providers ship curated columns.** Tier design — opus→top coder, sonnet→mid, haiku→small/fast, convergent→CoT — each pins **newest catalog entry in tier family** (aggressive-latest):

<!-- prettier-ignore -->
| Provider | opus | sonnet | haiku | convergent | Notes |
| --- | --- | --- | --- | --- | --- |
| `ollama-local` | `qwen3-coder:30b` (uniform — all tiers) |  |  |  | One model, memory-safe under `OLLAMA_MAX_LOADED_MODELS=1`; tiers differ only by `reasoningEffort`. |
| `nvidia` | `moonshotai/kimi-k2.6` | `qwen/qwen3.5-397b-a17b` | `openai/gpt-oss-20b` | `deepseek-ai/deepseek-v4-pro` | Full tier; hosted NIM. NIM dropped `qwen3-coder-480b-a35b-instruct` → sonnet uses flagship general `qwen3.5-397b-a17b`; `kimi-k2.6` is still NIM's newest Kimi. |
| `openrouter` | `moonshotai/kimi-k3` | `qwen/qwen3-coder` | `openai/gpt-oss-20b` | `deepseek/deepseek-v4-pro` | Aggregator ahead of NIM: opus `kimi-k3`, convergent `deepseek-v4-pro` (both newly listed 2026-07, superseding `kimi-k2.6`/`deepseek-v3.2`). |
| `ollama` (cloud) | `kimi-k2.7-code` | `qwen3.5:397b` | `gpt-oss:20b` | `deepseek-v4-pro` | opus bumped to `kimi-k2.7-code`; `qwen3-coder:480b` removed → sonnet `qwen3.5:397b`. **opus+convergent (`kimi-k2.7-code`/`deepseek-v4-pro`) need a paid Ollama plan; sonnet+haiku validated free.** |
| `groq` | `openai/gpt-oss-120b` | `qwen/qwen3.6-27b` | `openai/gpt-oss-20b` | `openai/gpt-oss-120b` | No Kimi/Qwen3-Coder in catalog → opus+convergent collapse onto `gpt-oss-120b`; `qwen3-32b` removed → sonnet `qwen3.6-27b`. |
| `cerebras` | `zai-glm-4.7` | `gpt-oss-120b` | `gpt-oss-120b` | `zai-glm-4.7` | Two-model catalog → opus+convergent `glm-4.7`, sonnet+haiku `gpt-oss-120b`. |
| `opencode-zen` | `opencode/kimi-k2.7-code` | `opencode/qwen3.6-plus` | `opencode/deepseek-v4-flash` | `opencode/deepseek-v4-pro` | Full Zen gateway (built-in id `opencode`). No Qwen3-Coder/gpt-oss in catalog → sonnet top Qwen (`qwen3.6-plus`), haiku fast open model (`deepseek-v4-flash`). Existence-validated via models.dev. |
| `opencode-go` | `opencode-go/minimax-m3` | `opencode-go/qwen3.7-plus` | `opencode-go/deepseek-v4-flash` | `opencode-go/deepseek-v4-pro` | Budget open-weight-only plan: opus `minimax-m3`, sonnet `qwen3.7-plus`; prefer pins that stay within the Go 5h usage window. Built-in (no npm/baseURL) so Anthropic-protocol Qwen/MiniMax route correctly. |

Cloud OpenAI-compatible cells (incl. four `opencode-go`) tool-call-smoked (`tools:` round-trip `tool_calls`) — `/models` ≠ proof (validate-with-real-tool). `opencode-zen` existence-validated via models.dev (Zen balance zero; smoke on Go endpoint). Re-pin: edit agent `model:`, add `prompts.md` § Model Overrides row, or change column + `bkit check`. Probe live catalog first (models.dev opencode; `/v1/models` table rest).

**Consumer model overrides (upgrade-safe):** `.bkit/prompts.md` marker-managed (`rules.md` pattern) — bkit refreshes `bkit:start`/`bkit:end` on upgrade; `## Model Overrides` below `bkit:end` consumer-owned. Pin different model per agent×host/provider:

```
| Prompt | Provider | Model |
| --- | --- | --- |
| bkit-build-summary | nvidia | nvidia/moonshotai/kimi-k2.6 |
```

`Provider` = host/install key (`cursor`, `nvidia`, `ollama-local`, …). Install merges overrides over defaults (override wins). Claude reads frontmatter; not overridable via table yet.

### Local Ollama memory-safety (server-side, not opencode.json)

opencode (CLI or app) = HTTP client to Ollama `localhost:11434`. Never launches/configures Ollama server — memory knobs on **Ollama daemon**, INDEPENDENT of opencode surface. **Not** in `opencode.json` (no field; opencode `limit.context` = client budgeting, not Ollama `num_ctx`).

<!-- prettier-ignore -->
| Setting | Value | Effect |
| --- | --- | --- |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | Never hold 2+ model weight-sets resident → avoids swap thrash on model switch. The high-impact one on constrained machines. |
| `OLLAMA_NUM_PARALLEL` | `1` | Serialize concurrent requests against one model. bkit workflows dispatch subagents concurrently (spike-proven on opencode); with one local model that gives no speedup, and `>1` splits the KV cache across requests → more memory. `=1` makes the Ollama server run the fan-out one-at-a-time. |
| `OLLAMA_KEEP_ALIVE` | `2m` | Evict an idle model sooner (default 5m), freeing RAM. |
| `OLLAMA_CONTEXT_LENGTH` | `16384` | Caps `num_ctx`; KV cache scales linearly with it. (Or set `num_ctx` in a Modelfile.) |

**Ollama-local only** — remote (`nvidia`) stateless; ignore; leave concurrency to workflow fan-out.

**Where to set — Ollama runtime only (not opencode CLI vs app):**

- **macOS Ollama.app:** app IS server. `launchctl setenv OLLAMA_MAX_LOADED_MODELS 1` (+ `OLLAMA_KEEP_ALIVE 2m`), quit + reopen. Bare `launchctl setenv` **not** persistent — re-run after restart or LaunchAgents plist at login.
- **`ollama serve` terminal:** export in `~/.zshrc`, launch from shell. Persistent.
- **Linux systemd:** `systemctl edit ollama.service` → `Environment="OLLAMA_MAX_LOADED_MODELS=1"` + `Environment="OLLAMA_KEEP_ALIVE=2m"` → `daemon-reload && restart`. Persistent (canonical).

`bkit doctor` reads `OLLAMA_MAX_LOADED_MODELS` / `OLLAMA_KEEP_ALIVE`, warns unset or `>1` — read-only, never mutates server.

---

## System-prompt / memory files

<!-- prettier-ignore -->
| Host | Reads automatically | Format |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (root + nearest ancestor) | Plain markdown |
| Cursor | `AGENTS.md` (root, AGENTS.md spec) + `.cursor/rules/*.mdc` (MDC: markdown + optional YAML frontmatter with `description`, `globs`, `alwaysApply`) | Plain markdown / MDC |
| Both (de-facto cross-host convention) | `AGENTS.md` increasingly read by all hosts incl. Claude Code, Codex, Cursor | Plain markdown |

**Current setup:** `CLAUDE.md` + `.cursor/rules/00-shared-rules.mdc` redirect to `.agents/rules.md`. `AGENTS.md` = cross-host dispatch spine (workflow router: Linear-issue → label command dispatch), read by every host. **Host-scoped ownership:** `CLAUDE.md` ships `--claude` (Claude analog of `.cursor/rules/00-shared-rules.mdc`, `--cursor`); `AGENTS.md` core (always). Each host brings redirect — no rule all three coexist. `--cursor`-only: no `CLAUDE.md`; `--claude`-only: no `.cursor/rules/`.

**Transform:** managed-block markers (`<!-- bkit:start -->` … `<!-- bkit:end -->`). Inside regenerated; outside preserved.

---

## Skills

<!-- prettier-ignore -->
| Host | Mechanism | Location |
| --- | --- | --- |
| Claude Code | First-class `Skill` tool. Registered via `.claude/settings.json` → `permissions.allow: ["Skill(*)"]`. Discoverable via plugin marketplace. | `~/.claude/skills/` (user) + `.agents/skills/` (project) + plugin skill dirs |
| Cursor | Cursor 2.4+ Agent Skills (similar shape). | `.cursor/skills/` (per docs); `.agents/skills/` referenced via custom routing |

`.agents/skills/` = **canonical project skill directory**. Both hosts read. No per-host transform. List in `.agents/skills.md`.

---

## Background / async execution

<!-- prettier-ignore -->
| Host | Mechanism |
| --- | --- |
| Claude Code | Synchronous `Agent` tool calls; parallel calls in single turn = parallel execution within main agent. No first-class async/background concept. |
| Cursor | `is_background: true` on subagent → spawns Cursor Cloud Agent that runs detached; main agent continues. Async by design. |
| opencode | Concurrent `Task` dispatch (spike-proven: 3 distinct subagents run concurrently, wall-clock < serial sum). Real parallelism only when the backend serves requests concurrently — true for all the remote providers (nvidia, groq, cerebras, openrouter, ollama-cloud). On **ollama-local** one model serves the fan-out; set `OLLAMA_NUM_PARALLEL=1` so the server serializes it (no speedup from one model anyway; `>1` splits the KV cache). The workflow text is unchanged — concurrency is bounded at the Ollama server, not in the command files. |

**Implication:** parallel fan-outs (triplets `bkit-design-brainstorm-ideate-1`/`-2`/`-3`, `bkit-plan-review-1`/`-2`/`-3`; pairs `bkit-design-review-*`, `bkit-plan-scope-check-*`, `bkit-build-challenge-*`, `bkit-ship-update-docs`/`-summary`) — Claude: concurrent `Agent` in one turn; Cursor: opt-in `is_background: true` (default off; host config can flip at install); opencode: concurrent `Task` — real on remote, serialized ollama-local via `OLLAMA_NUM_PARALLEL=1`.

---

## Tool name parity

Claude spelling in subagent `tools:` and command bodies (`Bash`, `Edit`, `Read`, etc.). Cursor uses different identifiers (`terminal`, `edit_file`, `read_file`, `apply_diff`). Claude names → Cursor `tools:` allowlist (alias vs strict) unverified. Mapping in `bkit/hosts/cursor.ts`.

---

## How to add a new host

1. Add row to § Supported hosts above.
2. Document deltas per concern (subagent invocation, frontmatter, hooks, permissions, runtime, etc.).
3. Implement transforms in `bkit/hosts/<name>.ts`. Each delta = one transform rule.
4. Drop static templates in `bkit/templates/<name>/` (settings, hooks, runtime).
5. Regression test: fresh-repo install; verify 5 phase commands + 7 worktree utilities E2E.
6. Update `AGENTS.md` routing table with new host command paths.

---

## Verify against current Cursor surface

Cursor API/frontmatter churn — confirm before dependent changes:

- Cursor model IDs in § Cursor model catalog still exist, not superseded.
- Cursor `readonly: true` semantics — file writes only, or bash/terminal too.
- Cursor tool-name parity (`Bash` vs `terminal`, `Edit` vs `edit_file`, etc.).
- Cursor `Task` resolution: `/<name>` → `.cursor/agents/<name>.md` (mirrors Claude `Agent` `@<name>` → `.claude/agents/<name>.md`).
- `AGENTS.md` adoption — when all hosts read natively, redirects (`CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`) can shrink.
