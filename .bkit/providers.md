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
| Host | Tier | Subagent dir | Command dir | Settings | Hooks | Install |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | canonical | `.claude/agents/` | `.claude/commands/` | `.claude/settings.json` | `.claude/hooks/` (registered in settings) | always-on (`--full`) |
| Cursor | derived | `.cursor/agents/` | `.cursor/commands/` | `.cursor/settings.json` + `.cursor/environment.json` + `.cursor/Dockerfile` | `.cursor/hooks/` (registered in `.cursor/hooks.json`) | always-on (`--full`) |
| opencode | additive (opt-in) | `.opencode/agents/` | `.opencode/commands/` | `.opencode/opencode.json` | `.opencode/plugin/gateguard.js` (PreToolUse) | `bkit install --opencode=<provider>` |

**Additive host model:** claude and cursor are always-on (included in every `--full` install). opencode is opt-in and additive — it installs alongside claude/cursor, never replacing them. No `--claude` flag exists. Provider selection (`ollama-local`, `nvidia`, `openrouter`, `gemini`, etc.) is an install-time decision: `bkit install --opencode=<provider>`. Switch providers by re-running install. `bkit status` shows installed hosts + active providers; `bkit doctor` checks credentials + tool reachability.

**Single active provider:** bkit manages one provider block in `opencode.json` at a time. Running `bkit install --opencode=ollama-local` after `bkit install --opencode=nvidia` replaces the managed provider block (nvidia → ollama-local). If you need multiple providers simultaneously (e.g. ollama-local for local + nvidia for cloud), manually add the second provider block to `.opencode/opencode.json` — bkit's Tier-2 deep-merge reconverge preserves manually-added keys across upgrades.

**Local vs cloud Ollama:** `ollama-local` (`bkit install --opencode=ollama-local`) configures a local Ollama server via the npm `@ai-sdk/openai-compatible` driver — no API key required, points at `http://localhost:11434/v1`. Cloud-hosted Ollama (if/when supported) would be a separate provider key. Do not confuse the two: the opencode app's built-in "ollama" entry refers to the cloud service.

Future hosts (Codex, Windsurf, Kiro, etc.) — add row + `bkit/hosts/<name>.ts` config.

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
- Replace literal `` `Skill` tool `` with `` `Task` tool `` (slash-command invocation — Cursor's `Task` covers both subagent and slash-command surfaces; Claude splits them into `Agent` + `Skill`).
- Replace `using \`Skill\` tool`with`using \`Task\` tool`.
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
| Field | Claude | Cursor | opencode | Notes |
| --- | --- | --- | --- | --- |
| `name` | required | required | required | kebab-case, must match filename. Identical. |
| `description` | required | required | required | Identical. |
| `effort` | required (`low` / `medium` / `high` / `xhigh` / `max` — last two model-gated, Opus-only on current models) | not supported | mapped to `reasoningEffort` | Drop on Cursor. Maps to opencode `reasoningEffort` via `applyOpencodeAgent` transform: `low`→`none`, `medium`→`low`, `high`→`medium`, `xhigh`→`high`, `max`→`max`. |
| `tools` | required (e.g. `[Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch]`) | supported (allowlist) + `disallowedTools` denylist | not supported | Identity mapping on Cursor (BAR-113, verified). Dropped on opencode side. |
| `permissionMode` | required (`acceptEdits` standard) | not supported | not supported | Drop on Cursor and opencode. |
| `maxTurns` | required | not supported | not supported | Drop on Cursor and opencode. |
| `model` | required (explicit Claude model ID — see `prompts.md` § Frontmatter Conventions effort→model mapping) | required | required (provider-prefixed, e.g. `ollama-local/qwen3-coder:30b`) | Pinned per-agent. On Claude, locks to a specific model. On Cursor, drives runner via T3. On opencode, provider-prefixed format: `<provider>/<model-id>` (see `prompts.md` § Models, per-provider columns `Nvidia` / `Ollama (Local)` / …). |
| `readonly` | not supported (use `tools` allowlist) | optional boolean | not supported | Cursor: derive from `tools` (true if no `Edit`/`Write`/`Bash`). |
| `is_background` | not supported | optional boolean (Cursor 2.4+) | not supported | Default false. Reserve for future opt-in on parallelisable subagents. |
| `reasoningEffort` | not a frontmatter field (use `effort`) | not supported | `none` / `low` / `medium` / `high` / `max` | opencode-native field. Set by `applyOpencodeAgent` transform from `effort`. |

### Body

Identical across hosts. Process steps, verdict/findings blocks (`## Verdict` / `## Findings`), `Read:` / `Write:` paths, `> ⛔ STOP` markers — all unchanged. No transform.

Cursor model assignment per subagent: see § Models below — per-agent lookup, NOT effort-tier derived.

---

## Models

> **Effort vs model — different mechanisms.** Claude uses `effort: low|medium|high|xhigh` as thinking-budget knob layered on a pinned model; same model, different reasoning depth. Cursor uses explicit `model:` per agent; cross-family diversity (`bkit-design-brainstorm-ideate-1`/`-2`/`-3`, `bkit-plan-review-1`/`-2`/`-3`) is real model selection across Claude / GPT / Composer families, not single-family effort tier. **Per-agent model assignment is canonical**; derive Cursor `model` from `prompts.md` § Models, NOT from `effort` alone.

### Cursor model catalog

<!-- prettier-ignore -->
| Model ID | Tier | Typical use |
| --- | --- | --- |
| `composer-2.5` | $ | Fast cheap; build executors, summarizers, ship-summary, utilities |
| `claude-opus-4-8-thinking-high` | $$$ | Current Opus — high-thought review, audit, design synthesis, debug diagnose, ship docs |
| `claude-opus-4-8-thinking-high-fast` | $$$ | Faster 4.8 variant |
| `claude-opus-4-7-thinking-high` | $$$ | Previous-gen Opus — fallback / availability hedge |
| `claude-opus-4-7-thinking-high-fast` | $$$ | Faster 4.7 variant |
| `claude-4.6-opus-high-thinking` | $$$ | Legacy Opus (older ID word-order) — deep fallback |
| `claude-fable-5-thinking-high` | $$$$ | Fable 5 — tier above Opus. **Available, not adopted** (see `prompts.md` § Effort → Claude model mapping, #205). |
| `claude-fable-5-thinking-xhigh` | $$$$ | Fable 5, max-thinking variant. Available, not adopted. |
| `gpt-5.5-high` | $$ | Current GPT — cross-family diversity (plan generation, parallel-pair slot-2) |
| `gpt-5.5-high-fast` | $$ | Faster 5.5 variant |
| `gpt-5.4-high` | $$ | Previous-gen GPT — fallback |
| `gpt-5.4-high-fast` | $$ | Faster 5.4 variant |
| `gpt-5.3-codex-high` | $$ | Codex-tuned GPT |
| `gpt-5.3-codex-high-fast` | $$ | Faster codex variant |

Cloud Agents API catalog: `curl https://api.cursor.com/v0/models -u "$CURSOR_API_KEY:"` (use agent-specific API key — general account keys can return HTTP 500 on `POST /v0/agents`). **Verify before install — Cursor's available models churn.** Opus/GPT IDs above re-verified against the live `/v0/models` response on **2026-06-10** (issue [#205](https://github.com/cbartens/bkit/issues/205)). The API currently offers **no Sonnet model** — the former `claude-4.6-sonnet-thinking` pin is gone, so build/ship orchestrators use `composer-2.5`; Fable 5 (`claude-fable-5-thinking-high`/`-xhigh`) is now offered but not adopted.

> [!NOTE]
> **Subagent model IDs — corrected to the live API format (issue [#205](https://github.com/cbartens/bkit/issues/205)).** The prior pin `claude-4.7-opus-high-thinking` used a word-order the Cursor `/v0/models` API never listed (the API uses `claude-opus-4-N-thinking-high`; only the legacy 4.6 model kept the old order). That format mismatch is the likely root of the earlier "may not be in the subagent-allowed set" signal. The `Cursor model` column in `prompts.md` now pins `claude-opus-4-8-thinking-high` / `gpt-5.5-high`, both **confirmed present in the live `/v0/models` response on 2026-06-02**. Residual caveat: the IDE **subagent-runner** surface is technically distinct from the Cloud Agents API, and per-subagent dispatch of these IDs has not yet been empirically smoke-tested via the Cursor `Task` tool — confirm one dispatch per model ID lands before treating the Cursor side as fully validated.

### Per-subagent model assignment

**Lives in `.bkit/prompts.md`** (per-agent metadata co-located with agent descriptions, effort / maxTurns rationale, tool-set patterns).

`prompts.md` carries one row per agent: `name | Cursor model | Claude effort | role hint`. Canonical source for Cursor frontmatter rewrite (T3). `bkit/hosts/cursor.ts` mirrors it; CI drift gate enforces parity.

### Per-workflow (orchestrator) model

Model running orchestrator command itself, NOT subagents. On Cursor: set at workflow launch (Cursor Cloud Agent config / GH Action invocation); command files have no frontmatter. On Claude: inherits session model — set via `/model` before invoking slash command (Claude command frontmatter carries only `description:`, no `model:`). Subagent `model:` pins (see `prompts.md` § Frontmatter) are independent — Opus-tier subagents stay on Opus regardless of orchestrator model.

<!-- prettier-ignore -->
| Workflow | Cursor model | Claude model + reasoning | Notes |
| --- | --- | --- | --- |
| `/bkit-design` | `claude-opus-4-8-thinking-high` | `sonnet` / `medium` | Procedural orchestration; parallel review pair surfaces drift fast. |
| `/bkit-plan` | `gpt-5.5-high` | `sonnet` / `medium` | Many gates, each = verdict-extract + status.jsonl plumbing. |
| `/bkit-build` | `composer-2.5` | `opus` / `medium` → `sonnet` / `medium` once stable | Longest workflow, most gate loops, real code changes. |
| `/bkit-debug` | `claude-opus-4-8-thinking-high` | `opus` / `medium` → `sonnet` / `medium` once stable | Failure-diagnosis remediation loops have most variability. |
| `/bkit-ship` | `composer-2.5` | `sonnet` / `medium` | Short, fully procedural. |
| CI automations (`ci-pass`, `ci-fail`) | `composer-2.5` | n/a |  |

**Rationale:** orchestrator does sequential step execution, bash/`jq`/`git`, Linear MCP calls, verdict extraction from subagent files, gate verification. Hard reasoning is delegated to subagents (pinned `model:`, no inheritance from session). Sonnet 4.6 handles strict procedural execution.

**Reasoning depth — default `medium`** (both Sonnet and Opus orchestrators). Orchestration is procedural, not deep reasoning; `medium` thinking suffices for verdict extraction, worst-of-N verdict computation, gate verification, failure-path branching. Higher thinking budget on Sonnet tends to **worsen** inlining drift — deeper reflection surfaces "I could just do this myself" temptation. Correct escalation on observed drift is `sonnet/medium → opus/medium`, NOT `sonnet/medium → sonnet/high`. Reserve `high` thinking for one-off debugging of an orchestrator step that consistently mis-extracts verdicts or malforms `status.jsonl` — not as a default tier.

**Risk — inlining drift.** Sonnet slightly more prone than Opus to "helping" by doing a subagent's work itself when the work looks tractable (especially review / scope-check steps). `rules.md` § Orchestrators ("Inlining subagent steps or producing output directly is NOT compliance") + per-command CAUTION block mitigate. If observed → bump that command back to Opus (NOT to higher Sonnet reasoning).

**Suggested Claude rollout:** Sonnet first on `/bkit-plan`, `/bkit-design`, `/bkit-ship` — shorter, parallel fan-out, drift visible at verdict gates. Keep `/bkit-build` + `/bkit-debug` on Opus until clean Sonnet runs of others build confidence; downgrade after. All at `medium` reasoning.

Automation sessions (Cursor Cloud) use `composer-2.5` for metadata/API plumbing; the agent they LAUNCH runs the phase model from this table.

### Cursor model label IDs

Used by Cursor Cloud Agents UI for label-based routing.

> **Stale-risk (#205, 2026-06-02):** these are dashboard label-routing UUIDs — a surface distinct from the `/v0/models` API model IDs. They lag the current pins; there are no rows yet for `claude-opus-4-8-thinking-high` / `gpt-5.5-high`. Re-pull from the Cursor Cloud dashboard before relying on label routing. The per-subagent `model:` frontmatter does **not** use these UUIDs — it uses the API model-ID string.

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
- Everything else (Linear MCP calls, `git`, `gh`, `pnpm`, step structure, `Failure Path`, gates, status.jsonl/lock logic) is identical.

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

### GateGuard

GateGuard is a pre-edit advisory hook. On the first touch of a file per session it injects an investigation checklist; gate-config paths (tsconfig / eslint / prettier / vitest / vale / slop / lint-staged) get a "fix the code, don't weaken the gate" advisory instead. It is **fail-open**, **subagent-exempt** (skips when `agent_id` is present in the payload), and dedup'd per `(session, file)` via OS-temp state with a 24h TTL.

<!-- prettier-ignore -->
| Host | Implementation | File | Registration |
| --- | --- | --- | --- |
| Claude Code | `gateguard.cjs` (CJS) | `.claude/hooks/gateguard.cjs` | `.claude/settings.json` → `hooks.PreToolUse` on `Edit\|Write\|MultiEdit` |
| opencode | `gateguard.js` (ESM) | `.opencode/plugin/gateguard.js` | `.opencode/opencode.json` → `plugins` array (opencode plugin spec) |
| Cursor | **not supported** | n/a | Cursor has SessionStart/Stop + post-hoc `afterFileEdit` but no pre-edit event that injects model-visible context — faithful port impossible |

**Modes (env):** unset → advisory _[default]_; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny the first touch per file (checklist as the reason), then allow the retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses the gate-config advisory.

**Subagent exemption difference:** Claude's `gateguard.cjs` checks `agent_id` in the PreToolUse payload to detect subagents. opencode's `gateguard.js` uses a different subagent-detection mechanism (opencode plugin API); the exemption condition may differ — validate in the plugin spec if subagent suppression is required.

**Deny mode:** Claude `PreToolUse` can block via exit 2 / `permissionDecision: deny`. opencode plugin deny semantics may differ — check the opencode plugin spec for the return shape that blocks a tool call.

---

## Permissions / auto-approve

<!-- prettier-ignore -->
| Concern | Claude | Cursor |
| --- | --- | --- |
| File | `.claude/settings.json` → `permissions.{allow,deny,ask}` | `.cursor/settings.json` → `plugins.<name>.enabled` (per-plugin only); fine-grained file/bash gating not project-scoped — handled by Cursor UI/global config |
| Granularity | Per-tool glob: `Bash(*)`, `Read(./.env)`, `WebFetch(domain:github.com)`, `Bash(rm -rf /*)` | Coarse per-plugin enable/disable |
| Modes | `defaultMode: default \ | acceptEdits \ | plan \ | bypassPermissions` | Implicit per-mode (Composer / Agent / Background) |
| MCP server config | `.mcp.json` at repo root (`mcpServers.<name>.url`) | `.cursor/mcp.json` (same `mcpServers.<name>.url` shape) |

**Install behaviour:** template drops, host-specific. No transform — these files have no canonical form.

### MCP config asymmetry — GitHub tracker

Both hosts use the same `mcpServers` key shape, but the files differ:

<!-- prettier-ignore -->
| Host | File | Written by |
| --- | --- | --- |
| Claude Code | `.mcp.json` at repo root | `bkit install --tracker=github` seeds the `github` entry |
| Cursor | `.cursor/mcp.json` | `bkit install --tracker=github` seeds this file with the same `mcpServers.github` block |

Both use `"type": "http"` with `"url": "https://api.githubcopilot.com/mcp/"` and `"headers": { "Authorization": "Bearer ${GH_TOKEN}" }`. The `${GH_TOKEN}` substitution happens at session start — the variable must be set in the shell (local) or dashboard env vars (cloud). See `.bkit/cloud.md` § MCP issue-tracker integration for the full JSON snippet.

**Tracker switch is seed-only, not a rewrite.** `.mcp.json` / `.cursor/mcp.json` are Tier-3 seed-or-print: bkit writes the tracker-filtered content only when the file is _absent_. On an existing file it never overwrites — so switching trackers (e.g. `--tracker=linear` → `--tracker=github`) leaves the old tracker's `mcpServers` entry behind. Two advisories catch the divergence: `mcp-missing-server-<name>` when the file lacks a server the tracker needs, and `mcp-extra-server-<name>` when it carries a bkit-managed server the tracker no longer uses (remove that entry). Consumer-added (non-bkit) MCP servers are never flagged.

> Note: `mcpServers` inside `.claude/settings.json` is silently ignored by Claude Code for server definitions — only `.mcp.json` (project) or `claude mcp add` (user scope) take effect. Tool-permission `allow` entries in `.claude/settings.json` (`mcp__github__*`) are separate and remain there.

---

## Runtime environment (cloud agents)

> Setup recipe + alignment guarantees: `.bkit/cloud.md`. This section = host-diff matrix only.

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
| Reusable across repos | Yes — one env, many repos (snapshot is generic; per-repo install via bootstrap hook) | No — Dockerfile per repo (bkit Tier 3 keeps content byte-identical) |
| Secrets | Env vars in Claude app (plaintext; rotate PATs) | Cursor Cloud env vars (Settings → Background Agents → Environment Variables) |
| Linear preflight | `.claude/hooks/preflight.sh` (SessionStart, non-blocking — uses `additionalContext` HARD STOP) | `.cursor/hooks/preflight.sh` (`sessionStart`, `failClosed: true`, blocks on non-zero) |

**Install behaviour:** template drops; project-specific tokens substituted at install. Both clouds aligned via bkit on: vale 3.9.1, pnpm 10.33.0 (corepack-pinned), gh CLI. See `.bkit/cloud.md` for paste-in recipe + sharing-across-repos pattern.

---

## Models

### Per-provider live model lookup

The installed provider's model catalog changes over time. Look up available model IDs before pinning them in `.opencode/opencode.json`:

<!-- prettier-ignore -->
| Provider | Command | Notes |
| --- | --- | --- |
| Claude (Anthropic) | `curl https://api.anthropic.com/v1/models -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"` | Canonical `Claude` column source. No key in-shell → cross-check via the OpenRouter `anthropic/*` mirror. |
| Cursor | `curl https://api.cursor.com/v0/models -u "$CURSOR_API_KEY:"` | `Cursor` column source. Catalog churns — currently NO Sonnet (Fable 5 + Opus 4.7/4.8 + GPT-5.x + composer-2.5 only). |
| ollama-local | `curl http://localhost:11434/v1/models` | Local server; models vary by what you have pulled. |
| NVIDIA NIM | `curl https://integrate.api.nvidia.com/v1/models -H "Authorization: Bearer $NVIDIA_API_KEY"` | Hosted; catalog changes; verify before pinning. |
| OpenRouter | `curl https://openrouter.ai/api/v1/models -H "Authorization: Bearer $OPENROUTER_API_KEY"` | Aggregator; large catalog. |
| Gemini | `curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"` | Google; model IDs differ from OpenAI format. |

**Model ID format:** opencode uses provider-prefixed IDs in agent frontmatter: `<provider>/<model-id>` (e.g. `ollama-local/qwen3-coder:30b`, `nvidia/moonshotai/kimi-k2.6`). The per-agent pins are the single source of truth in `prompts.md` § Models — **one column per provider** (`Nvidia`, `Ollama (Local)`, …). `bkit install --opencode=<provider>` seeds `.opencode/agents/*.md` from the matching column; providers without a column install a single documented fallback. `ollama-local` is uniform (one model, memory-safe under `OLLAMA_MAX_LOADED_MODELS=1`); `nvidia` mirrors the Claude tier (opus→`moonshotai/kimi-k2.6`, sonnet→`qwen/qwen3-coder-480b-a35b-instruct`, haiku→`openai/gpt-oss-20b`) with `deepseek-ai/deepseek-v4-pro` swapped in for the convergent-reasoning agents. Tune any agent by editing its `model:` field (or the `prompts.md` column) and running `bkit check`.

**Consumer model overrides (upgrade-safe):** `.bkit/prompts.md` installs as a marker-managed file (like `rules.md`) — bkit refreshes everything inside `bkit:start`/`bkit:end` on `bkit upgrade`; the `## Model Overrides` section **below** `bkit:end` is consumer-owned and preserved. To pin a different model for a specific agent on a specific host/provider, add a row there — list ONLY the agents you want to change:

```
| Prompt | Provider | Model |
| --- | --- | --- |
| bkit-build-summary | nvidia | nvidia/moonshotai/kimi-k2.6 |
```

`Provider` is the host/install key (`cursor`, `nvidia`, `ollama-local`, …). At install, overrides merge over the defaults per agent×provider (override wins). Claude agents read their model from frontmatter and are not overridable via this table yet.

### Local Ollama memory-safety (server-side, not opencode.json)

opencode — whether the CLI or the desktop app — is only an HTTP client to Ollama at `localhost:11434`. It never launches or configures the Ollama server, so the memory-residency knobs live on the **Ollama server daemon**, INDEPENDENT of which opencode surface you use. They are **not** expressible in `opencode.json` (no field exists; opencode's per-model `limit.context` is informational client-side budgeting, not Ollama's `num_ctx`).

<!-- prettier-ignore -->
| Setting | Value | Effect |
| --- | --- | --- |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | Never hold 2+ model weight-sets resident → avoids swap thrash on model switch. The high-impact one on constrained machines. |
| `OLLAMA_NUM_PARALLEL` | `1` | Serialize concurrent requests against one model. bkit workflows dispatch subagents concurrently (spike-proven on opencode); with one local model that gives no speedup, and `>1` splits the KV cache across requests → more memory. `=1` makes the Ollama server run the fan-out one-at-a-time. |
| `OLLAMA_KEEP_ALIVE` | `2m` | Evict an idle model sooner (default 5m), freeing RAM. |
| `OLLAMA_CONTEXT_LENGTH` | `16384` | Caps `num_ctx`; KV cache scales linearly with it. (Or set `num_ctx` in a Modelfile.) |

These are **Ollama-local only** — remote providers (`nvidia`, `openrouter`, `gemini`, …) are stateless cloud APIs with their own concurrency and ignore them; leave their concurrency to the workflow's default parallel fan-out.

**Where to set them — depends only on how Ollama runs (not on opencode CLI vs app):**

- **macOS Ollama.app (menu-bar):** the app IS the server. `launchctl setenv OLLAMA_MAX_LOADED_MODELS 1` (and `OLLAMA_KEEP_ALIVE 2m`), then quit + reopen the app. Bare `launchctl setenv` is **not** persistent across reboot — re-run after restart, or add a `~/Library/LaunchAgents` plist that runs it at login.
- **`ollama serve` from a terminal (Homebrew/manual):** `export OLLAMA_MAX_LOADED_MODELS=1` / `export OLLAMA_KEEP_ALIVE=2m` in `~/.zshrc`, then launch the server from that shell. Persistent.
- **Linux (systemd):** `systemctl edit ollama.service` → under `[Service]` add `Environment="OLLAMA_MAX_LOADED_MODELS=1"` and `Environment="OLLAMA_KEEP_ALIVE=2m"` → `systemctl daemon-reload && systemctl restart ollama`. Persistent (canonical).

`bkit doctor` reads back `OLLAMA_MAX_LOADED_MODELS` / `OLLAMA_KEEP_ALIVE` and warns when unset or `>1` — read-only, it never mutates the server env.

---

## System-prompt / memory files

<!-- prettier-ignore -->
| Host | Reads automatically | Format |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (root + nearest ancestor) | Plain markdown |
| Cursor | `AGENTS.md` (root, AGENTS.md spec) + `.cursor/rules/*.mdc` (MDC: markdown + optional YAML frontmatter with `description`, `globs`, `alwaysApply`) | Plain markdown / MDC |
| Both (de-facto cross-host convention) | `AGENTS.md` increasingly read by all hosts incl. Claude Code, Codex, Cursor | Plain markdown |

**Current setup:** `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc` all contain a one-line redirect to `AGENTS.md`. AGENTS.md additionally carries cross-host workflow router (Linear-issue parsing → label-based command dispatch). All three files MUST exist after install.

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
| opencode | Concurrent `Task` dispatch (spike-proven: 3 distinct subagents run concurrently, wall-clock < serial sum). Real parallelism only when the backend serves requests concurrently — true for remote providers (nvidia/openrouter/gemini). On **ollama-local** one model serves the fan-out; set `OLLAMA_NUM_PARALLEL=1` so the server serializes it (no speedup from one model anyway; `>1` splits the KV cache). The workflow text is unchanged — concurrency is bounded at the Ollama server, not in the command files. |

**Implication:** workflow's parallel fan-outs (triplets `bkit-design-brainstorm-ideate-1`/`-2`/`-3`, `bkit-plan-review-1`/`-2`/`-3`; pairs `bkit-design-review-*`, `bkit-plan-scope-check-*`, `bkit-build-challenge-*`, `bkit-ship-update-docs`/`-summary`) get parallelism on Claude side via concurrent `Agent` tool calls in one turn; on Cursor side, opt-in via `is_background: true` (default off in canonical files; Cursor host config can flip selected subagents on at install time); on opencode side via concurrent `Task` dispatch — real on remote providers, serialized at the server on ollama-local via `OLLAMA_NUM_PARALLEL=1`.

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
