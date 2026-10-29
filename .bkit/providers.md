# IDE / Host Differences

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** Authoritative inventory of IDE host differences. Drives install script transform rules. Source-of-truth for "what changes between IDE versions of commands and subagents".
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - One row per concern. Update when an IDE adds / changes a feature.
> - Unlisted = identical across hosts; install copies byte-identical.
> - Canonical format = Claude. All transforms = Claude → other.

## Supported hosts

<!-- prettier-ignore -->
| Host | Tier | Subagent dir | Command dir | Settings | Hooks | Install |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | canonical | `.claude/agents/` | `.claude/commands/` | `.claude/settings.json` | `.claude/hooks/` (registered in settings) | `bkit install --claude` |
| Cursor | derived | `.cursor/agents/` | `.cursor/commands/` | `.cursor/settings.json` + `.cursor/environment.json` + `.cursor/Dockerfile` (templates, `.bkit/templates.md`) | `.cursor/hooks/` (registered in `.cursor/hooks.json`) | `bkit install --cursor` |
| opencode | additive (opt-in) | `.opencode/agents/` | `.opencode/commands/` | `.opencode/opencode.json` | `.opencode/plugin/bkit-gateguard.js` + `.opencode/plugin/bkit-readguard.js` + `.opencode/plugin/bkit-rules.js` (tool execute hooks) | `bkit install --opencode=<provider>` |
| Codex CLI | additive (opt-in) | `.codex/agents/` (TOML) | none — skills (below) | none (`openai` = reserved built-in id) | `.codex/hooks/bkit-gateguard.cjs` + `.codex/hooks/bkit-guardrails.cjs` + `.codex/hooks/bkit-readguard.cjs` + `.codex/hooks/bkit-rules.cjs` (PreToolUse `apply_patch` / `Bash`, PreCompact, via `.codex/hooks.json`) | `bkit install --codex` |
| Google Antigravity | additive (opt-in) | `.agents/plugins/bkit/agents/` | none — skills (plugin, below) | `GEMINI.md` (workspace rule) | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` + `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` + `.agents/plugins/bkit/hooks/bkit-readguard.cjs` + `.agents/plugins/bkit/hooks/bkit-rules.cjs` (PreToolUse `write_to_file` / `replace_file_content` / `view_file` / `run_command`, via `.agents/plugins/bkit/hooks.json`) | `bkit install --antigravity` |

**Two axes — host != provider.** **Host** = program reading what bkit writes, identified by its dir (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`). **Provider** = gateway tokens are bought through. Model IDs are per-provider → `prompts.md` § Models = one column per provider (shared provider = one column, never two). Thinking depth is per-host (field name + ladder set by host config format: `effort:` claude / cursor, a `variant:` field opencode, `model_reasoning_effort` codex) → § Effort = one column per host. Neither table grows as hosts x providers.

**Spend order: subscriptions first, metered overflow second.**

1. **Subscriptions** — Claude Code, Codex, Antigravity, Cursor are paid up front → spend their included usage first; each agent gets the vendor model that buys the most work per included token (§ Selecting pins, First-party plan).
2. **Overflow** — a subscription's weekly usage runs out → switch to opencode on a metered gateway (default `openrouter`) until it resets. Claude is the yardstick there: cheapest model closest to the agent's Claude bar, inside a weekly cap (§ Budget band).

**One provider per host = policy, not capability.** Nothing technical forces it — Cursor reaches Claude models, so does anything behind OpenRouter. Pin follows cost: each host runs on the gateway whose subscription is already paid. Subscription spent → switch **host**, not provider (the overflow gateway hangs off opencode).

<!-- prettier-ignore -->
| Host | Provider | Why |
| --- | --- | --- |
| Claude Code | `anthropic` | Claude subscription = cheapest path to Claude models |
| Cursor | `cursor` | Cursor subscription covers its whole catalog |
| Codex CLI | `openai` | ChatGPT subscription |
| Google Antigravity | `google` | Antigravity free tier / Google subscription — cheapest path to Gemini |
| opencode | **pick one**: `openrouter`, `ollama`, `opencode-zen`, `opencode-go` | overflow host — metered BYO key, runs when subscription usage is spent |

Subscription-bearing host → pinned, nullary flag (`--claude`, `--codex`). BYO-key host → pluggable, flag names the provider (`--opencode=<provider>`). Per-model deviation → consumer `## Model Overrides` below `bkit:end`; no provider override.

### Codex CLI — three deviations

<!-- prettier-ignore -->
| Concern | On Codex |
| --- | --- |
| Agent files | `.codex/agents/*.toml` (TOML, not markdown). Required: `name`, `description`, `developer_instructions`. Pin + rung: `model`, `model_reasoning_effort`. |
| Workflows = skills, invoked `$bkit-design` | no project-scoped command surface — custom prompts are `~/.codex/prompts` only, not repo-shared, deprecated for skills (upstream declined repo-scoped prompts). bkit renders `.agents/skills/bkit-<workflow>/SKILL.md`, on Codex's skill path (`$REPO_ROOT/.agents/skills`). This path is Codex's; Antigravity ships its own skills in a plugin (`.agents/plugins/bkit/skills/`). |
| `tools:` not enforced | No per-agent tool allowlist upstream; `sandbox_mode` cannot substitute — every bkit agent is write-capable, so all would be `workspace-write`. Each agent gets the full built-in tool set regardless of declared `tools:`. GateGuard still gates, as everywhere. |

> **GateGuard needs the `.codex/` layer trusted.** Codex loads project-local hooks only once trusted. Until then the hook is installed and never fires — present, proving nothing. Same for `bkit-guardrails.cjs`.
>
> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it — an ask is recorded as an error and the call proceeds. `bkit-guardrails.cjs` therefore blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`: the gate fires and informs, it cannot stop the command. Every ask-tier command is already prohibited in all five workflow headers, so no bkit workflow reaches one. Asserted in `.bkit/core/engine/install/modules/index.integration.test.ts`.

### Google Antigravity — installs as a workspace plugin

<!-- prettier-ignore -->
| Concern | On Antigravity |
| --- | --- |
| Install layout | the whole host is a workspace **plugin** at `.agents/plugins/bkit/` (`plugin.json` + `skills/` + `agents/` + `hooks.json` + `hooks/`) — Antigravity's own packaging surface, activated per project. `.agents/` root stays the dedicated Codex install. |
| Workflows = skills at `.agents/plugins/bkit/skills/bkit-<workflow>/SKILL.md` | Antigravity auto-discovers a workspace plugin's `skills/`. Codex's workflow skills stay at `.agents/skills/bkit-*/`; with both hosts installed Antigravity's selector lists both sets (accepted; `antigravity-codex-skill-overlap` advisory names which to pick). |
| Prompt files + no native subagent tool | prompts at `.agents/plugins/bkit/agents/*.md` — frontmatter `name`/`description`, model pin from § Models `Google` column, `effort` from § Effort `Antigravity` column, `tools:` respelled to Antigravity tool names. The orchestrator loads each with `view_file` and runs it in-session; isolated runs use `run_command` (`agy`). `**Subagent:** @name` respells to `` `view_file` `.agents/plugins/bkit/agents/name.md` `` rather than a `/name` slash command. |

> **Antigravity tool names differ from Claude's.** `Read`→`view_file`, `Write`→`write_to_file`, `Edit`→`replace_file_content`, `Bash`→`run_command`, `Grep`→`grep_search`, `Glob`→`list_dir`, `WebSearch`→`search_web`, `WebFetch`→`read_url`. `mcp__<server>__<tool>` keeps its spelling. `applyAntigravityPrompt` / `antigravityToolsBlock` (`.bkit/core/engine/render/hosts.ts`) apply the map at render.
>
> **GateGuard + ReadGuard + guardrails wired from `.agents/plugins/bkit/hooks.json`** (PreToolUse on `write_to_file` / `replace_file_content` / `view_file` / `run_command`). Same fail-open engines as the other hosts on Antigravity's own contract, live-verified on the agy CLI: stdin `{ conversationId, toolCall: { name, args }, workspacePaths }`, stdout `{ decision, reason }`. Only a `deny`'s reason reaches the model, so every advisory denies the call once with the advisory as the reason and lets the identical retry through; the guardrails deny tier blocks every time; its ask tier is Antigravity's own `ask`. Guardrails also gates `view_file` secret reads (§ Permissions / auto-approve). A `PreInvocation` entry in `hooks.json` stops every hook in the file from firing — bkit registers none. Plugin hook commands run with the plugin dir (`.agents/plugins/bkit/`) as cwd, so each command tries `hooks/<file>` first, then `.agents/plugins/bkit/hooks/<file>`.

**Explicit host axis (no implicit full):** `bkit install` requires >=1 module flag or `--tracker=` — bare `bkit install` errors. `--tracker=` re-renders every installed host. Every host explicit; hosts compose: `bkit install --claude --cursor --opencode=opencode-zen` installs all three (+ implicit core). `--opencode` cannot render without `=<provider>` (strict allowlist). Switch providers: re-run install. All hosts render from `.bkit/`; run state in `status.jsonl` + plan docs + tracker (never host session) — phase / resumed run moves across hosts / providers mid-feature with identical gates + per-agent pins: hit limit on one, continue on another. `bkit status` → installed hosts + active providers; `bkit doctor` → credentials + tool reachability.

**Cheap models inside an IDE — no extension needed.** A host is its dir, not the window its process runs in. `bkit install --claude --cursor --opencode=openrouter` + opencode in the IDE's integrated terminal = every agent pin, GateGuard and the full workflow on OpenRouter while editing in Cursor. Supported path when the Claude subscription is spent.

> **Curated-column status (complete).** All four allowlisted providers (`openrouter`, `ollama`, `opencode-zen`, `opencode-go`) ship curated per-agent model pins in `prompts.md` § Models → install ready-to-run. Both OpenAI-compatible providers + both opencode gateways curated after live catalog probe + per-model tool-calling smoke (`tools:` chat/completions round-trip emitting `tool_calls`; `/models` alone != proof). **opencode catalogs = models.dev, not `/zen/v1/models`** — REST endpoint returns Zen-only; cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`, …); models.dev source of truth (`opencode` = Zen, `opencode-go` = Go). `opencode-go` curated from models.dev/Go endpoint; prefer pins within Go 5h window; `opencode-zen` existence-validated via models.dev. See § Provider models for live-probe recipe + tier rationale.

**Additive multi-provider install:** `bkit install --opencode=<provider>` additive — second provider adds block to `opencode.json`, keeps first. Agent frontmatter (`model:`) re-renders to last-installed (active) provider; other blocks stay for interactive switch/overrides. Installed providers → `bkit.providers.opencode.installed: string[]` in `package.json`; active → `bkit.providers.opencode.default`. `bkit status` lists all, marks active, and prints the `model:` pins read from `.opencode/agents/*.md`; `bkit doctor` checks all credentials. Remove one: `bkit uninstall --opencode=<provider>` (surgical — block + array; if active removed, the first remaining provider becomes active and agents / commands re-render to its pins, so `bkit check` stays green). `bkit uninstall --opencode` (bare) tears down entire opencode host.

New host — row above + `run<Host>Module` (`.bkit/core/engine/install/modules/<host>.ts`) + manifest block (`.bkit/core/engine/install/manifest.ts`) + `.bkit/core/.<host>/hooks/` (the host config JSON in `.bkit/shared/.<host>/`) + GateGuard case in `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` + ReadGuard case in `.bkit/core/engine/audits/hooks/readguard-parity.integration.test.ts`. New provider = entry in `OPENCODE_PROVIDERS` (`.bkit/core/engine/shared/egress.ts`); `tsc` then demands its `OPENCODE_PROVIDER_DEFAULTS` and `GATEWAY_COLUMN` (`.bkit/core/engine/render/models.ts`) entries. Also needs a curated `prompts.md` § Models column.

---

## macOS GUI-isolation — `bkit cursor` / `bkit opencode`

**Root cause:** macOS GUI apps (Dock/Finder/Spotlight) run under `launchd` — **do not** inherit login-shell env. `direnv` exports from `.bkit/.env` stay shell-only. Token placeholders (`${BKIT_GH_TOKEN}` in `.cursor/mcp.json`, `{env:BKIT_OPENCODE_API_KEY}` in `.opencode/opencode.json`) resolve empty → MCP auth failures.

**Shared service env (opencode):** `{env:…}` in `.opencode/opencode.json` resolves in OpenCode's background service — machine-global, one per user, env fixed at service start. Repo-local direnv `.env` is invisible (one repo's `apps/web/.env.local` never reaches another); service env = union of every repo's MCP tokens. Add / rotate a token → source it, then `opencode service restart`.

**Fix — launcher verbs:** `bkit cursor` / `bkit opencode` exec app binary with `.bkit/.env` merged into child env. Dynamic, per-repo, zero global state.

```
bkit cursor    # /Applications/Cursor.app/Contents/MacOS/Cursor
bkit opencode  # /Applications/opencode.app/Contents/MacOS/opencode
```

- **Quit first.** Running instance keeps launch-time env; re-exec required.
- **Binary override:** `BKIT_CURSOR_BIN=<path>` / `BKIT_OPENCODE_BIN=<path>` for non-standard paths.
- **Cursor:** passes repo `cwd` as positional arg.
- **opencode:** no positional arg; reads `opencode.json` from `cwd`.

**`bkit doctor` check:** reports `.bkit/.env` keys with non-empty file value but absent from `process.env` (= Dock / Finder session); advisory → `bkit cursor` / `bkit opencode`.

**launchctl fallback (opt-in, not recommended):** exposes key to every app in the login session (not only the intended one; not persistent across reboots). Manual re-run after restart + manual rotation / removal — prefer launcher verbs.

```bash
launchctl setenv BKIT_GH_TOKEN "$BKIT_GH_TOKEN"
launchctl setenv BKIT_OPENCODE_API_KEY "$BKIT_OPENCODE_API_KEY"
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
| Antigravity | `view_file` (in-session prompt load) | `.agents/plugins/bkit/agents/` | `view_file` `.agents/plugins/bkit/agents/bkit-build-plan-execute.md` |

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
| Field | Claude | Cursor | opencode | Notes |
| --- | --- | --- | --- | --- |
| `name` | required | required | required | kebab-case, must match filename. Identical. |
| `description` | required | required | required | Identical. |
| `effort` | required (`low` / `medium` / `high` / `xhigh` / `max` — last two model-gated, Opus-only on current models) | not supported | emitted as a separate `variant:` field | Drop on Cursor. `applyOpencodeAgent` reads the § Effort **OpenCode** column and writes it to `variant:` (not a `#`-suffix on the model — 1.x keeps the suffix in its model id and fails lookup); the OpenCode column ceilings out, so `medium` / `high` / `xhigh` / `max`→`max`, `low`→`none`, then `clampOpencodeVariant` clamps that to what the pinned model exposes on the gateway (`prompts.md` § Effort). The **ollama** gateway omits `variant:` entirely: its provider builds models with no variants, so any variant there is a hard 2.0 error. |
| `tools` | required (e.g. `[Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch]`) | supported (allowlist) + `disallowedTools` denylist | object map `{ <tool>: true }` | Identity mapping on Cursor (verified), not enforced by Cursor CLI 2026.10.01 (measured: a `tools: [Read]` subagent keeps `Shell` / `Write` / every MCP tool). opencode: built-ins lowercased; `mcp__<server>__<tool>` respelled `<server>_<tool>` (`mcp__serena__*` → `serena_*`). |
| `permissionMode` | required (`acceptEdits` standard) | not supported | not supported | Drop on Cursor and opencode. |
| `maxTurns` | required | not supported | not supported | Drop on Cursor and opencode. |
| `autoCompactWindow` | `300000` on every `bkit-*` agent | not supported | not supported | Drop on Cursor, opencode, Codex, Antigravity — § Context compaction. |
| `model` | required (explicit Claude model ID — see `prompts.md` § Frontmatter Conventions effort→model mapping) | required | required (provider-prefixed, e.g. `openrouter/moonshotai/kimi-k3`) | Pinned per-agent. Claude locks model. Cursor drives runner via T3. opencode: `<provider>/<model-id>` (see `prompts.md` § Models, columns `OpenRouter` / `Ollama` / …). |
| `readonly` | not supported (use `tools` allowlist) | optional boolean | not supported | Cursor: derive from `tools` (true if no `Edit`/`Write`/`Bash`). |
| `is_background` | not supported | optional boolean (Cursor 2.4+) | not supported | Default false. Reserve for future opt-in on parallelisable subagents. |
| `reasoningEffort` | not a frontmatter field (use `effort`) | not supported | not a field — OpenCode carries effort as a `variant:` field | `applyOpencodeAgent` emits `variant: <name>` (1.x reads it natively; 2.0 joins `model` + `variant` internally). A `#`-suffix on the `model` pin breaks 1.x and hard-errors on 2.0 when the model exposes no such variant. |

### Body

Identical across hosts. Process steps, verdict / findings (`## Verdict` / `## Findings`), `Read:` / `Write:` paths, `> ⛔ STOP` — unchanged. No transform.

Cursor model assignment: § Models below — per-agent lookup, not effort-tier derived.

---

## Models

> **Effort vs model — different mechanisms.** Claude: `effort: low|medium|high|xhigh` = thinking-budget on pinned model. Cursor: explicit `model:` per agent; native-pool diversity (`cursor-grok-4.5-high` / `composer-2.5` — no API-pool defaults). **Per-agent model assignment canonical**; derive Cursor `model` from `prompts.md` § Models, not `effort` alone.

### Cursor model catalog

**Pinned selections canonical in `prompts.md`** (§ Models `Cursor` column + § Orchestrators) — not here. Cursor set churns; use pull recipe below.

> **Default install = first-party pool only.** Shipped Cursor pins are **`cursor-grok-4.5-high`** + **`composer-2.5`** so workflows keep running when API credits are exhausted. API-pool models (Claude / GPT / Fable) are **opt-in** via `prompts.md` § Model Overrides — never default pins. **Have API credits and want Opus back?** Paste the ready-to-use Opus override block in `prompts.md` § Model Overrides (maps every Claude-opus-tier agent → `claude-opus-5-thinking-high`; `/v0/models` has no Opus 5.5 ID). Sonnet-tier override is `claude-sonnet-5-thinking-high` (Sonnet 5, not 5.5) or `gpt-5.6-sol-high`. Then `bkit install --cursor`. Shipped sonnet cells stay on the first-party ceiling: `grok-4.5` lands 2.9 under the sonnet target at a quarter of Claude's cost per task. **No `cursor-grok-4.7`.**

Tier guidance:

- **`composer-2.5`** ($) — **default.** Fast / cheap: build executors, utilities, `/build` + `/ship` orchestrators. First-party pool.
- **`cursor-grok-4.5-high`** ($$) — **default.** Depth slots, synthesizers, parallel diversity (design/plan/debug orchestrators + former Opus-tier agents). First-party pool (Cursor + SpaceXAI); Coding Agent Index parity with GPT-5.5 at lower per-task cost. `-fast` variant exists.
- **`claude-opus-5-thinking-high`** ($$$) — **override only.** Deep review / audit / synthesis when API credits remain. `/v0/models` has Opus 5, not Opus 5.5 (`claude-opus-5-5` is the Claude pin). `-fast` exists. API pool — burns credits; pin via § Model Overrides, never as shipped default.
- **`claude-sonnet-5-thinking-high`/`-xhigh`** ($$$) — **override only.** Sonnet 5 on the API pool. Not a shipped default. No Sonnet 5.5 ID.
- **`gpt-5.*`** ($$$) — **override only.** API-pool diversity hedge (`gpt-5.6-sol-high`, …). Not pinned.
- **`claude-fable-5-thinking-high`/`-xhigh`** ($$$$) — **override only.** Fable 5. Available, not adopted as default (see `prompts.md` § Effort → Claude model mapping). No Fable 5.1 ID on `/v0/models`.

Cloud Agents API: `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"` (agent-specific API key — general keys can HTTP 500 on `POST /v0/agents`). **Verify before install — Cursor models churn.** Probed 2026-10-06: first-party `cursor-grok-4.5-high` + `composer-2.5`; no Grok 4.7; no Opus 5.5 / Sonnet 5.5. Sonnet 5 thinking IDs are present and stay opt-in. Build / ship orchestrators use `composer-2.5`.

> [!NOTE]
> **Native-default Cursor pins.** Defaults are first-party only (`cursor-grok-4.5-high` / `composer-2.5`) so zero API credits still runs the harness. API-pool IDs remain in the live `/v0/models` catalog for manual override. Residual: IDE **subagent-runner** != Cloud Agents API; per-subagent dispatch via `Task` not empirically smoke-tested — confirm one dispatch per model ID before full validation.
>
> **Claude opus tier pins `claude-opus-5-5`.** Sonnet tier pins `claude-sonnet-5-5`. Both are 1M context, $4/$20 and $2/$10 per MTok. Haiku tier pins `claude-haiku-5-5` — 1M context, $0.10/$0.50 per MTok up to 100K-token prompts, $0.50/$2.50 above. The targets are the 5.5 scores on the 2.0 board — `claude-opus-5-5` **72.8** / `claude-sonnet-5-5` **63.4** — with no 5.0 bridging. Cursor's `/v0/models` catalog lists `claude-opus-5-thinking-high` / `-fast` and `claude-sonnet-5-thinking-high` / `-xhigh`, not the 5.5 IDs. Cursor defaults stay on native models per the native-only policy above.

### Per-subagent model assignment

**Lives in `.bkit/prompts.md`** (per-agent metadata with descriptions, effort / maxTurns rationale, tool patterns).

`prompts.md`: one row per agent: `name | Cursor model | Claude effort | role hint`. Canonical for Cursor frontmatter rewrite (T3); `.bkit/core/engine/audits/workflows/models-table-parity.test.ts` checks it against the prompt frontmatter.

### Per-workflow (orchestrator) model

Orchestrator model selection (per workflow, every provider) canonical in **`prompts.md` § Orchestrators** — not duplicated here. Orchestrators use **session model** (commands lack frontmatter): Claude → `/model` before invoke; Cursor → workflow launch (Cloud Agent config / GH Action). Subagent `model:` pins independent — Opus-tier subagents stay pinned regardless of orchestrator. Reasoning-depth (`medium` default) + inlining-drift escalation in `prompts.md` § Orchestrators.

### Cursor model label IDs

Dashboard label-based routing.

> **Stale-risk:** dashboard label-routing UUIDs — distinct from `/v0/models` API IDs; may lag pins. Re-pull from Cloud dashboard before label routing. Per-subagent `model:` frontmatter uses API model-ID string, not these UUIDs.

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

**Decision:** Cursor **never emits `readonly:`**. Subagents write directly on both hosts, matching canonical Claude command shape. Cursor subagents have full tool access: Cursor CLI 2026.10.01 ignores the `tools:` allowlist (measured).

**Implementation:** T3 in `.bkit/core/engine/render/hosts.ts` emits only `name` / `description` / `model` — no `readonly:`. Generated `.cursor/agents/*.md` confirm zero `readonly:` lines.

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
| Cursor | **none** | Per current Cursor docs, command files are plain markdown. Frontmatter tolerated / ignored on legacy files but not part of spec. |

**Transform (Claude → Cursor, command files):** replace the YAML frontmatter block with its `description:` value as a plain first line (Cursor shows a command file's literal first line as its picker / hover description, and does not read frontmatter). No `description:` key → plain strip.

### Body

- Subagent invocation phrasing — § Subagent invocation transform above.
- Else (tracker MCP, `git`, `gh`, `pnpm`, steps, `Failure Path`, gates, status.jsonl/lock) identical.

### Slash-command activation

Both hosts: `/<filename-without-ext>` (`/bkit-build`, `/bkit-plan`, etc.). Identical UX.

---

## Guardrails

Per-action gates, all five hosts, subagents included. Overview only; per-host encoding → § Hooks, § Permissions / auto-approve.

<!-- prettier-ignore -->
| Guard | Trigger | Effect | Enforcement |
| --- | --- | --- | --- |
| Destructive commands | Shell | deny: force-push (never `--force-with-lease`), `rm -rf` / `rm -fr` on `/`, `~`, `$HOME` or `${HOME}` (bare, `/`, `/*`; the hooks also catch `-Rf` and `-r -f`), `chmod -R 777 /`; ask: `git reset --hard`, forced `git clean`, whole-tree `git checkout` / `git restore`, `git rebase -i`, `git stash drop` / `git stash clear`, `git filter-branch`, `--no-verify`, publish, destructive `gh` | Claude / opencode permission rules; Cursor / Codex / Antigravity `bkit-guardrails` hook. Codex ask → advisory |
| Secret files | Read tool; shell reads on Cursor, Codex, Antigravity | Read tool: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*`. Shell reads of any of them: ask on Cursor and Antigravity, advisory on Codex, not gated on Claude and opencode (§ Permissions / auto-approve) | Codex shell → advisory |
| Network | `curl` / `wget`, fetch tool | ask unless host in allowlist (§ Network allowlist) | Advisory on Claude shell, Codex; Antigravity denies once, retry passes |
| Shell-as-edit-channel | `sed -i`, redirect into a source file | Advisory: edit skips pre-edit gates | All hosts except opencode |
| GateGuard | First edit per (session, agent, file) | Investigation checklist; gate-config path → fix-code advisory; new file → reuse nudge; `docs/**.md` → density advisory | Advisory; `BKIT_GATEGUARD=deny` denies first touch once |
| ReadGuard | Repeat read of an unchanged range | Use-earlier-output note | Advisory, never blocks |

- **Fail-open** everywhere: a hook that cannot read its payload allows. Cursor's `failClosed` on `bkit-guardrails.cjs` blocks only when the hook process itself crashes.
- **Tool allowlists:** per-agent `tools:` gives reviewers read tools only; Codex ignores `tools:` (§ Codex CLI).

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

**Install behaviour:** hook scripts are **generated at install** (per host, not from `.agents/`). Semantic differences (blocking, stdin, output JSON) prevent one script for every host, so each host keeps a small hook source (`.bkit/core/.<host>/hooks/`, `.bkit/core/.opencode/plugin/`) holding only its module syntax, payload adapter and output shape. Code every host shares lives once in `.bkit/core/hooks/`; install splices it in wherever a template line reads `// {{BKIT_PART <file>}}` / `# {{BKIT_PART <file>}}` (`.bkit/core/engine/render/parts.ts`). The generated file is plain JS / bash with no runtime call into bkit, so it works without `node_modules`.

<!-- prettier-ignore -->
| Part | Shared by | Holds |
| --- | --- | --- |
| `gateguard-engine.js` | Claude, Cursor, Codex, Google Antigravity, opencode `gateguard` | gate-config table, checklists, docs advisory, dedup state, `firstTouchAdvice` |
| `gateguard-edit-payload.js` | Claude, Cursor `gateguard` | `Edit` / `Write` / `MultiEdit` payload adapter `bkitGateguard(payload)` |
| `readguard-engine.js` | Claude, Cursor, Codex, Google Antigravity, opencode `readguard` | shell-read parser, line-range log per (session, agent), repeat-read note, `resetReadLog` |
| `readguard-payload.js` | Claude, Cursor, Codex, Google Antigravity `readguard` | read / shell payload adapter `bkitReadguard(payload)`; compaction event → reset |
| `antigravity-hook.js` | Google Antigravity `gateguard`, `guardrails`, `readguard` | Antigravity envelope → Claude-family shape (`fromAntigravityPayload`), call signature, deny-once advisory delivery (`adviseOnce`) |
| `guardrails-shell.js` | Claude, Cursor, Codex, Google Antigravity `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
| `guardrails-tiers.js` | Cursor, Codex, Google Antigravity `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
| `guardrails-read.js` | Cursor, Google Antigravity `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
| `preflight-linear.sh` | Claude, Cursor `preflight` | Linear key / issue checks, GraphQL query, `bkit:auto` + terminal-state guards |
| `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
| `session-rules-advisory.js` | opencode, Codex, Google Antigravity `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, per-user OS-temp state, 24h GC) |

Per host, outside the parts: Claude `gateguard` / `guardrails` — `require` + `hookSpecificOutput` driver, guardrails advisory-only; Cursor — `{ permission }` output, guardrails `Read|TabRead` path extraction, gateguard workspace-relative path resolve; Codex — `apply_patch` envelope parser, ask tier emitted as advisory; Google Antigravity — `antigravity-hook.js` envelope conversion + deny-once delivery, `{ decision, reason }` driver, `write_to_file` / `replace_file_content` edit tools (path `TargetFile`), `view_file` and `run_command` (`CommandLine`); opencode — ES module, `write` / `edit` / `patch` (`apply_patch`) vocabulary, every `*** Add|Update|Delete File:` / `*** Move to:` target of a `patchText` checked (deny mode blocks if any target is a first touch), checklist appended to the tool result in `execute.after` + throw from `execute.before` to block (2.0 exposes no pre-edit context hook, and stderr does not reach the model); `preflight` — trigger (Claude `LINEAR_ISSUE_ID`, Cursor `is_background_agent` + `.bkit/.runtime-cursor` marker), Claude-only Darwin brew check, `emit_context` shape.

### Rules-read advisory

The session-start nudge, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). One constant sentence names `.agents/rules.md` as required reading and never names `AGENTS.md`; it never blocks a session and never changes an exit code. Delivery rides each host's earliest event: `SessionStart` where the host has one (Claude Code, Cursor), the first tool call where it does not (opencode, Codex, Antigravity).

<!-- prettier-ignore -->
| Host | File | Registration | Delivery |
| --- | --- | --- | --- |
| Claude Code | `.claude/hooks/bkit-preflight.sh` | `.claude/settings.json` → `hooks.SessionStart` | spliced from the part `preflight-rules.sh`, merged into the one session-start JSON document: the advisory alone on an IDE session, the advisory plus the Linear guard result on a cloud session, from a `printf` path that needs no `python3` |
| Cursor | `.cursor/hooks/bkit-preflight.sh` | `.cursor/hooks.json` → `hooks.sessionStart` | same part, same one-document merge, in Cursor's `{ additional_context }` shape |
| opencode | `.opencode/plugin/bkit-rules.js` | `.opencode/opencode.json` → `plugin` array (spec `./plugin/bkit-rules.js`) | no session-start event: appended to the first tool result in `execute.after` |
| Codex | `.codex/hooks/bkit-rules.cjs` | `.codex/hooks.json` → `hooks.PreToolUse`, two single-value groups (`apply_patch`, `Bash`) | no session-start event: `additionalContext` once per session |
| Antigravity | `.agents/plugins/bkit/hooks/bkit-rules.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` (`write_to_file\|replace_file_content\|view_file\|run_command`) | no session-start event: deny the first call once with the advisory as `reason`, allow the identical retry |

**Codex registration:** two single-value `PreToolUse` groups (`apply_patch`, `Bash`) — the shape every shipped Codex matcher uses; alternation is unverified on that host, where a matcher that never fires installs and exits 0 silently. Project-local hooks load only once the `.codex/` layer is trusted (§ host table above).

**Dedup scope:** once per session. The two SessionStart hooks fire once per session and hold no state; the three first-tool-call hooks dedup by the host's session id (Codex `session_id`, Antigravity `conversationId`, opencode `sessionID`), state in the OS temp dir, GC'd after 24h; a payload with no session id falls back to one shared bucket. Codex reports the parent's `session_id` inside a subagent and no agent id, so a subagent can miss an advisory its parent already consumed — the same limit § GateGuard records; on opencode a subagent runs in its own session and gets its own advisory.

**Ownership:** as § GateGuard — bkit owns the advisory sentence and the once-per-session helper between the markers, the consumer owns the driver below them.

### GateGuard

Advisory hook, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). Claude / Cursor / Codex inject the checklist pre-edit (PreToolUse); Antigravity denies the first edit of a file once with the checklist as the reason (the only text its hooks deliver to the model) and allows the retry; opencode 2.0 exposes no pre-edit context hook, so it appends the checklist to the tool result in the post-execute hook — the first edit's result, not a pre-edit gate — and reserves the pre-execute hook for deny mode. First file touch per session → investigation checklist; gate-config paths (JS / TS: tsconfig/eslint/prettier/vitest/jest/vale/slop/lint-staged; Python: ruff.toml/.ruff.toml/.flake8/mypy.ini/.mypy.ini/pylintrc/.pylintrc/pytest.ini; Go: golangci; Rust: clippy.toml/.clippy.toml/rustfmt.toml/.rustfmt.toml; mixed-purpose manifests such as package.json, pyproject.toml, setup.cfg, tox.ini are not matched) → "fix code, don't weaken gate" advisory, except under a consumer's `.bkit/templates/` (reference copies; in bkit's own repo, package name `@cbartens/bkit`, that folder is the template source and stays guarded); new-file writes → reuse-over-duplicate nudge; `docs/**.md` (not `docs/plans/`) → density advisory appended. **fail-open**, **subagents included**, dedup `(session, agent, file)` via OS-temp state, 24h TTL.

<!-- prettier-ignore -->
| Host | Implementation | File | Registration |
| --- | --- | --- | --- |
| Claude Code | `bkit-gateguard.cjs` (CJS) | `.claude/hooks/bkit-gateguard.cjs` | `.claude/settings.json` → `hooks.PreToolUse` on `Edit\|Write\|MultiEdit` |
| opencode | `bkit-gateguard.js` (ESM) | `.opencode/plugin/bkit-gateguard.js` | `.opencode/opencode.json` → `plugin` array, spec `./plugin/bkit-gateguard.js` (config-file-relative; opencode 2.0 reads a bare `.opencode/…` spec as an npm package and fails to load — the plugin also auto-loads from `.opencode/plugin/`) |
| Cursor | `bkit-gateguard.cjs` (CJS) — managed block generated from the same parts as the Claude twin, so byte-identical | `.cursor/hooks/bkit-gateguard.cjs` | `.cursor/hooks.json` → `preToolUse` (matcher `Write`), no `failClosed` — an advisory hook that fails closed would block the edit it only meant to comment on |
| Codex | `bkit-gateguard.cjs` (CJS) — Claude's stdin / stdout contract; parses the `apply_patch` envelope for target paths | `.codex/hooks/bkit-gateguard.cjs` | `.codex/hooks.json` → `hooks.PreToolUse` on `apply_patch` |
| Antigravity | `bkit-gateguard.cjs` (CJS) — Antigravity's `{ toolCall, conversationId }` stdin / `{ decision, reason }` stdout; `write_to_file` / `replace_file_content` edit tools, path from `args.TargetFile` | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` on `write_to_file\|replace_file_content` |
| Cursor | `bkit-guardrails.cjs` (CJS) — destructive-op / secret-exposure gates, the Cursor equivalent of Claude's `permissions` and opencode's `permission` map | `.cursor/hooks/bkit-guardrails.cjs` | `.cursor/hooks.json` → `beforeShellExecution` + `preToolUse` (`Read\|TabRead`), both `failClosed` |

**Ownership:** both GateGuard files — and Cursor's `bkit-guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as one JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `bkit-guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`. The rules-read advisory hooks — `bkit-rules.cjs` on Codex and Antigravity, `bkit-rules.js` on opencode (§ Rules-read advisory) — follow the identical split.

**Modes (env):** unset → advisory [default]; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny first touch (checklist as reason), allow retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses gate-config advisory.

**Subagents:** not exempt on any host; dedup is per (session, agent, file) wherever the host names the agent. Claude Code — a subagent shares its parent's `session_id`; its `agent_id` keys its own dedup, so it gets its own checklist. opencode — a subagent runs in its own session. Codex — tool payloads carry the parent's `session_id` inside a subagent and no agent id; Cursor — no subagent marker; Antigravity — no native subagents (prompts run in-session; `agy` runs are their own conversation). On Codex and Cursor a subagent editing a file its parent already touched gets no checklist.

**Deny mode, per host:** Claude and Codex `permissionDecision: "deny"` with the checklist as `permissionDecisionReason`; Antigravity `decision: "deny"` with the checklist as `reason` — the same as its advisory mode; Cursor `permission: "deny"` with the checklist as `agent_message` (`user_message` goes to the human, not the model); opencode throws from `execute.before` — the only hook that can block — and appends the checklist to the tool result in `execute.after`, because 2.0 exposes no pre-edit context hook and stderr does not reach the model. Same behaviour, three delivery mechanisms across five hosts; asserted uniformly in `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`.

**Divergence budget:** every host's block carries `hooks/gateguard-engine.js` verbatim, and the Claude and Cursor blocks are byte-identical (both test-asserted on the generated hooks). opencode's differs only where the runtime forces it — ES module rather than CJS, tool vocabulary `write`/`edit`/`patch` rather than `Edit`/`Write`/`MultiEdit`, plus a `patchText` envelope parser for `patch`. Codex's differs only in its payload — every edit arrives as `apply_patch` with a V4A envelope and no file path, so its block carries the envelope parser (Add / Update / Delete / Move-to targets). Antigravity's differs in its tool vocabulary (`write_to_file` / `replace_file_content`), its `TargetFile` extraction and the `antigravity-hook.js` contract part. Every advisory string, gate-config pattern and docs-path rule is identical across all five.

### ReadGuard

Advisory repeat-read hook, on all five hosts. A read of a line range the same agent already read in this conversation, file unchanged since (same mtime + size), gets a note: use the earlier output; re-read only if it left context (summarised, or read by another agent). Tracks read-tool calls (`offset` / `limit`, `StartLine` / `EndLine`; no limit → first 2000 lines, opencode → whole file) and plain shell reads — `cat FILE`, `sed -n 'A,Bp' FILE`, `head` / `tail` with a line count; pipes, lists, redirects, substitutions, globs and other programs are not tracked. Ranges merge per file; a changed file starts a fresh log. **fail-open**, never blocks, log in per-user OS temp (`bkit-readguard-<uid>/`; kept in memory when that cannot be written), 24h TTL. `BKIT_READGUARD=off` → disabled.

<!-- prettier-ignore -->
| Host | File | Registration | Delivery | Log key | Reset on summary |
| --- | --- | --- | --- | --- | --- |
| Claude Code | `.claude/hooks/bkit-readguard.cjs` | `.claude/settings.json` → `PreToolUse` (`Read\|Bash`) + `PreCompact` | `additionalContext`, before the read | `session_id` + `agent_id` | `PreCompact` |
| Cursor | `.cursor/hooks/bkit-readguard.cjs` | `.cursor/hooks.json` → `preToolUse` (`Read\|Shell`) + `preCompact`, no `failClosed` | `additional_context` on an allow, before the read | `conversation_id` | `preCompact` |
| Codex | `.codex/hooks/bkit-readguard.cjs` | `.codex/hooks.json` → `PreToolUse` (`Bash`) + `PreCompact` | `additionalContext`, before the read | `session_id` | `PreCompact` |
| Antigravity | `.agents/plugins/bkit/hooks/bkit-readguard.cjs` | `.agents/plugins/bkit/hooks.json` → `PreToolUse` (`view_file\|run_command`) | deny once with the note as `reason`, before the read; the identical retry passes | `conversationId` | none — no compaction hook |
| opencode | `.opencode/plugin/bkit-readguard.js` | `.opencode/opencode.json` → `plugin` array | appended to the tool result in `execute.after`, after the read | `sessionID` | 1.x `session.compacted` event; 2.0 none — no event subscription for plugins |

**Gaps:** Codex has no read tool, so shell reads only. Codex, Cursor and Antigravity tool payloads carry no subagent id, and Codex subagents share the parent `session_id`, so a subagent can be told about its parent's read — the note's re-read clause covers it. Antigravity and opencode 2.0 never reset on a summary — same clause. opencode's note arrives with the repeated read, not before it; Antigravity's costs one extra call (the retry). Shared code: `readguard-engine.js` everywhere, `readguard-payload.js` on the four CJS hosts plus `antigravity-hook.js` on Antigravity; the Claude, Cursor and Codex managed blocks are byte-identical (test-asserted in `.bkit/core/engine/audits/hooks/readguard-parity.integration.test.ts`). Ownership as § GateGuard.

---

## Permissions / auto-approve

<!-- prettier-ignore -->
| Concern | Claude | Cursor | opencode | Codex | Antigravity |
| --- | --- | --- | --- | --- | --- |
| File / secrets — read tool | `.claude/settings.json` → `permissions` `Read(...)`: `*.pem` / `*.p12` / `id_rsa` deny; `.env` / `.env.*` ask — `.env.example` too: its `allow` row never fires, `ask` is evaluated before `allow` | `.cursor/hooks/bkit-guardrails.cjs` via `preToolUse` (`Read\|TabRead`) — key deny; `.env` / `.env.*` ask; `.env.example` allowed | `.opencode/opencode.json` → `permission.read` map — key deny; `.env` / `.env.*` ask; `.env.example` allowed | **none** — no file-read tool | `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` via `PreToolUse` (`view_file`, path `AbsolutePath`) — key deny; `.env` / `.env.*` ask (Antigravity's own `ask`); `.env.example` allowed |
| File / secrets — shell (`cat .bkit/.env`) | **not gated** — no `Bash(...)` rows: a command-text glob cannot tell `cat .env` from `cp .env.example .env`, a grep pattern or a commit message, and an ask stalls autonomous and cloud runs. A file command Claude recognises (`cat`, `head`, `tail`, `sed`, `tee`) on a key file still hits the `Read(...)` deny, which Claude applies to those commands | `beforeShellExecution` ask on any program reading `.env`, `.env.*` (not `.env.example`), `*.pem`, `*.p12` or `id_rsa` (args, `< file`, `--opt=file`, `@file`, `rev:file`, copy sources, `sh -c` scripts); redirect targets, copy destinations, grep / rg patterns, comments and `ls` / `stat` / `test` / `touch` / `rm` / `mv` / `ln` / `chmod` / `echo` pass | **not gated** — no `permission.bash` rows, same reason as Claude | same detection as Cursor via `PreToolUse` (`Bash`) — advisory `additionalContext`, command runs | same detection as Cursor via `PreToolUse` (`run_command`) — Antigravity's own `ask` |
| Shell / destructive | `permissions.deny` globs on force-push in any argument position — `--force`, `-f` / `-f…` cluster, `+refspec`, never `--force-with-lease` — plus `rm -rf` / `rm -fr` on `/*`, `~`, `~/*`, `$HOME`, `$HOME/*`, `${HOME}`, `${HOME}/*`, `chmod -R 777 /`; `permissions.ask` globs on publish, destructive gh, and destructive git in common flag orders (`git reset … --hard`, forced `git clean` (`-…f…`), whole-tree `git checkout` / `git restore`, `git rebase … -i`, `git stash drop` / `git stash clear`, `git filter-branch`), `--no-verify` on any git subcommand, `git commit -n`. Force-push and `reset --hard` globs also cover git global options before the subcommand (`git -C dir push --force`, `git -c k=v push origin +ref`, `git -C dir reset --hard`) and `f` second in a cluster (`-uf`, `-vf`). Globs match the command text, so `f` later in a cluster (`-uvf`) is not matched; the parsed hosts catch it. Shell `curl` / `wget` are not gated here — `permissions` cannot match a URL host, so only the `WebFetch` tool is allowlisted | `.cursor/hooks/bkit-guardrails.cjs` via `beforeShellExecution` — same tiers, classified on the parsed command: git subcommand after global options (`-C`, `-c`, `--git-dir`, …), flags in any order, short clusters expanded, option values never read as flags; every `&&` / `;` / `\|` segment, `sh -c` script and `$(…)` substitution. `git clean -n` / `--dry-run` and `git restore --staged .` pass | `permission.bash` deny / ask globs, last match wins — same globs and gap as Claude | `.codex/hooks/bkit-guardrails.cjs` via `PreToolUse` (`Bash`) — Cursor's parsed tiers; deny blocks; ask emitted as advisory `additionalContext`, command runs (Codex cannot prompt) | same hook via `PreToolUse` (`run_command`) — Cursor's parsed tiers; deny blocks every time; ask = Antigravity's own `ask` |
| Network fetch | `WebSearch` + tooling `WebFetch(domain:…)`; install / upgrade enriches from the shipped egress registry union consumer `allowed-domains` in `.agents/context.md` (stack hosts never shipped), recording what it wrote so it can later prune it | `curl`/`wget` ask unless host in `.bkit/allowlist.json` (tooling and consumer domains) | `websearch` allow; `webfetch` URL map (`"*": ask` → `*{domain}*: allow`) for the fetch tool **and** `curl *`/`wget *` ask → `curl *{domain}*`/`wget *{domain}*` allow for shell, from the same allowlist (baked into `opencode.json`) | `curl`/`wget` off `.bkit/allowlist.json` → advisory `additionalContext`, command runs | `curl`/`wget` off `.bkit/allowlist.json` → denied once with the advisory, retry passes; `read_url` / `search_web` ungated |
| Granularity | Per-tool glob | Hook script (project-scoped, fail-open; `failClosed` blocks only a crashed hook) | Per-path / per-command glob in `permission` | Hook script (project-scoped, fail-open; fires only once `.codex/` is trusted) | Hook script (workspace plugin, fail-open) |
| Modes | `defaultMode: default \| acceptEdits \| plan \| bypassPermissions` | Implicit per-mode (Composer / Agent / Background) | `opencode --auto` + permission defaults | host defaults — bkit writes no `.codex/config.toml` | host defaults — bkit ships none |
| MCP server config | `.mcp.json` at repo root (`mcpServers.<name>.url`) | `.cursor/mcp.json` (same `mcpServers.<name>.url` shape) | `.opencode/opencode.json` → `mcp` | none written | none written |
| MCP tool approval | `permissions.allow` `mcp__<s>__*` from consumer `mcp-servers` (§ MCP servers) | Generated `.cursor/cli.json` `Mcp(<s>:*)` | `permission` `"<s>_*": "allow"` | none — no project-level MCP approval file | none written |
| Local-only (not shipped) | `.claude/settings.local.json` (`additionalDirectories`, extra allows) | Cursor project / user settings / MCP as needed | `~/.config/opencode/opencode.json` → `permission.external_directory` | `~/.codex/config.toml` | user-level settings |

**Install behaviour:** template drops, host-specific encoding of the **same** shared policy. No single canonical JSON — each host's native form kept in lockstep; asserted in `.bkit/core/engine/install/modules/index.integration.test.ts` § permissions-parity. Machine-local paths stay out of templates.

### Network allowlist — one source, five hosts

**Source of truth:** bkit's own hosts come from the egress registry (`.bkit/core/engine/shared/egress.ts`) and must never be re-declared. Stack domains come from consumer `.agents/context.md` → `<!-- allowed-domains:start -->` **after** `<!-- bkit:end -->` (apex domains). Never ship Vercel/Supabase/Sentry/etc. into every consumer.

**`bkit install` / `bkit upgrade` apply that set differently per host** — same policy, native mechanics:

<!-- prettier-ignore -->
| Host | Where the allowlist lives | Why that shape |
| --- | --- | --- |
| **Claude** | `.claude/settings.json` `WebFetch(domain:…)` allow rules; shell fetches host-checked against `.bkit/allowlist.json` by `.claude/hooks/bkit-guardrails.cjs` (advisory) | Claude has a first-class settings permission model for the fetch tool. Shell `curl` is not domain-gated at all — Claude rules match a command prefix, not a URL host, so `curl` runs under `Bash(*)` with `deny` + the auto-mode classifier as backstops. Prefer `WebFetch` for allowlisted hosts; context-fetch uses `curl` / CLI under `Bash(*)`. |
| **OpenCode** | Baked into `.opencode/opencode.json`: `permission.webfetch` URL map (`"*": "ask"` then `*{domain}*: allow`) for the fetch tool, and `permission.bash` `curl *`/`wget *` **ask** then `curl *{domain}*`/`wget *{domain}*` **allow** for shell fetch (last-match-wins on both) | Both fetch surfaces are domain-gated, so an allowlisted host does not prompt whichever path the agent takes. `webfetch` matches the resource against the requested URL, `bash` against the command string. **Looser than Claude's `domain:`:** OpenCode globs match the whole string (`*` → `.*`, crossing `/` `?` `@`), so `*{domain}*` allows the domain anywhere in the URL or command — apex and every subdomain, but also `https://evil.tld/?x={domain}`. Accepted risk: no OpenCode glob covers subdomains without it. No separate allowlist file. |
| **Cursor** | Generated `.bkit/allowlist.json` read at **runtime** by `.cursor/hooks/bkit-guardrails.cjs` | Cursor has no project settings equivalent to Claude `permissions` / OpenCode `permission` for curl host globs. Parity is a **hook** (`beforeShellExecution`): ask on `curl`/`wget` unless every URL host is on the allowlist. |
| **Codex** | Reads the same `.bkit/allowlist.json` at runtime via `.codex/hooks/bkit-guardrails.cjs` | Codex has no project-level permission file. The hook host-parses `curl`/`wget` and emits an advisory `ask` — Codex cannot prompt, so the allowlist informs rather than enforces. |
| **Antigravity** | Reads the same `.bkit/allowlist.json` at runtime via `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` | Antigravity has no project-level permission file. The hook host-parses `curl`/`wget` on the `run_command` matcher and denies a non-allowlisted fetch once with the advisory as the reason; the retry passes. |

**`.bkit/allowlist.json`** — core-owned, written on every install / upgrade whatever the host set, removed by full uninstall. **Do not hand-edit** — install / upgrade rewrites it whole; change `allowed-domains` instead. `bkit check` fails when it is missing or stale. The hook finds it from the payload's repo dirs (`workspace_roots`, `cwd`, Antigravity `workspacePaths`) then its own cwd, walking up to the `.git` root — Antigravity runs plugin hooks from the plugin dir. Missing file => every host reads as unknown; the hook embeds no list, because a second copy drifts from the registry silently.

**Cloud egress (separate):** the derived registry union the same `allowed-domains` feed `.claude/bkit-cloud.md` / `.cursor/bkit-cloud.md` / `.codex/bkit-cloud.md` paste instructions for dashboard network Custom allowlists — that is proxy egress, not local agent permission files. See `.agents/context.md` § Allowed domains and `.bkit/cloud.md`.

### MCP servers — one source, three encodings

**Source of truth:** consumer `.agents/context.md` → `<!-- mcp-servers:start -->` **after** `<!-- bkit:end -->`, one server name per line. Every tool on a listed server (reads and writes) runs without a prompt on every host; an unlisted server keeps each host's default. bkit ships no server names — only what the consumer lists.

<!-- prettier-ignore -->
| Host | Where the allows live | Rule per server `<s>` |
| --- | --- | --- |
| **Claude** | `.claude/settings.json` `permissions.allow`, recorded in `.bkit/version` `claudeAllowDerived` so a server dropped from the block is pruned | `mcp__<s>__*` (`.mcp.json` servers; claude.ai connectors in cloud sessions) + `mcp__claude_ai_<s>__*` (claude.ai connectors in the local CLI) |
| **Cursor** | Generated `.cursor/cli.json` `permissions.allow` — Cursor CLI + cloud agents. The IDE agent's MCP auto-run list is user-level only | `Mcp(<s>:*)` |
| **OpenCode** | Baked into `.opencode/opencode.json` → `permission` | `"<s>_*": "allow"` — opencode names MCP tools `<s>_<tool>` |

**Spelling is per host:** a name matches a tool id verbatim — list each spelling a host uses (`sentry` for a `.mcp.json` server, `Sentry` for the claude.ai connector). **Do not hand-edit** `.cursor/cli.json` — it is regenerated whole on install/upgrade. Codex: no project-level MCP approval file — out of scope.

### MCP config asymmetry — GitHub tracker

Both hosts: same `mcpServers` shape; files differ:

<!-- prettier-ignore -->
| Host | File | Written by |
| --- | --- | --- |
| Claude Code | `.mcp.json` at repo root | `bkit install --tracker=github` writes the `github` entry |
| Cursor | `.cursor/mcp.json` | `bkit install --tracker=github` writes the same `mcpServers.github` block |

Both: `"type": "http"`, `"url": "https://api.githubcopilot.com/mcp/"`, `"headers": { "Authorization": "Bearer ${BKIT_GH_TOKEN}", "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects,actions" }`. `${BKIT_GH_TOKEN}` at session start — must be in shell (local) or dashboard env (cloud). See `.bkit/cloud.md` § MCP issue-tracker integration for full JSON.

**bkit owns one entry per file.** In `.mcp.json` / `.cursor/mcp.json` bkit owns only `mcpServers.<tracker>`: an absent file gets the tracker-filtered render; in an existing file install and upgrade reset the keys the template sets in that entry and keep every other key, in its order (malformed JSON stops the install). Inside the entry, extra keys and headers stay the consumer's, and `X-MCP-Toolsets` keeps the consumer's list and gains any template toolset it lacks, so a repo can enable more toolsets without drift. The same rule covers `mcp.<tracker>` in `.opencode/opencode.json`. `bkit check` reports a pending reset. Tracker `none` owns no entry. A tracker switch (e.g. `--tracker=linear` → `--tracker=github`) adds the new entry and removes the old tracker's `linear` entry from all three files while it still equals the template; an entry the consumer edited stays, named in a warning (and in `mcp-extra-server-linear`). `github` stays on every switch. Uninstall removes bkit's entry while it still equals the template. Advisories: `mcp-missing-server-<name>` (file lacks the configured tracker's server; `none` needs none), `mcp-extra-server-<name>` (`linear` entry while the configured tracker is not `linear`; also checked in `.opencode/opencode.json` `mcp`). `github` never flagged as extra: every phase workflow's gh MCP fallback (PR / CI / merge when `gh` is unavailable) calls it — under `linear` / `none`, add it by hand to keep that fallback. Consumer-added MCP servers never flagged.

> Note: `mcpServers` in `.claude/settings.json` silently ignored for server defs — only `.mcp.json` (project) or `claude mcp add` (user) take effect. Tool-permission `allow` (`mcp__github__*`) remain in settings.

---

## Context compaction

bkit ships `autoCompactWindow: 300000` in the frontmatter of every `bkit-*` Claude Code subagent: the agent summarises at 300,000 tokens at the latest. Safety net, not the cap (group size, the 160k handover and `maxTurns` stop an agent first). It only lowers the window: a lower repo / user setting or `CLAUDE_CODE_AUTO_COMPACT_WINDOW` still wins. Needs Claude Code v2.1.296+; plain integer only (`300k` reads as 300, out of range, ignored). Main sessions on every host stay consumer settings (tips below); each host auto-summarises near the model's full window by default. Effective threshold = min(setting, model window).
<!-- prettier-ignore -->
| Host | Per agent (bkit ships) | Project-wide setting (tip) | Notes |
| --- | --- | --- | --- |
| Claude Code | `autoCompactWindow: 300000` frontmatter on every `bkit-*` agent (integer 100,000-1,000,000; source: code.claude.com/docs/en/sub-agents.md § Set the auto-compact window for one subagent) | `.claude/settings.json` → `"autoCompactWindow": 300000` (or `"auto"`) — install / upgrade keep keys bkit does not own; also changes the main session | per person: `.claude/settings.local.json`; env `CLAUDE_CODE_AUTO_COMPACT_WINDOW` beats every settings file and agent frontmatter |
| Codex CLI | none — a role file parses `model_auto_compact_token_limit` but Codex discards it when applying the role (openai/codex `core/src/agent/role.rs:37-48`); subagents copy the parent's value (`core/src/agent/child_config.rs:132-141`) | `.codex/config.toml` → `model_auto_compact_token_limit = 300000`, above the first `[table]` header (below one, the key belongs to that table and does nothing); also changes the main session | read only once the project is trusted; one run: `codex -c model_auto_compact_token_limit=N`; above 90% of the model window, Codex uses 90% |
| opencode | none — no agent field (sst/opencode `packages/schema/src/config/agent.ts`) | none — no absolute-count trigger. Auto-compaction fires at the model's input (else context) limit minus `compaction.buffer` (default 15%, at least 16,000 tokens); a buffer larger than the window is ignored | per model: `providers.<id>.models.<alias>` = `{modelID: "<real>", limit: {input: N}}` with the agent pinned to `<id>/<alias>`, `N` ~ target + buffer (~353,000 for 300k); one entry per model per provider, catalog models only, untested end to end. Not `compaction.buffer`: one global buffer large enough for a 1M model compacts too early on 128k-200k models |
| Cursor | none — no compaction setting (cursor.com/docs/subagents.md § Model parameters) | none — trigger fixed server-side | `model: <id>[context=N]` shrinks the agent's whole window, not only where it summarises; valid values per model undocumented. Manual `/summarize` |
| Google Antigravity | none — bkit agents run in the main session (`view_file`), no separate agent context | none — threshold internal (~135k), no setting / env reaches it (ai.google.dev/gemini-api/docs/antigravity-agent) | manual `/compact` |

**Floor:** keep the window well above the largest single tool result plus the recent turns kept after a summary. Claude Code ends an agent whose context refills to the limit within 3 turns of a summary, 3 times in a row (`Autocompact is thrashing`).

**Compression proxies:** bkit ships none (caveman, Headroom). On 456 real Claude Code transcripts they saved ~1-3% of token cost: both keep the prompt cache intact, so each tool result is compressed once on arrival and reused, and tool results >= 2 KB are 27% of cost. Headroom's Kompress text model rewrote code (`=> void` → `void`). Method, results, scripts to measure own sessions: [comparison](https://github.com/cbartens/bkit/blob/main/tests/compression/bkit-caveman-headroom-compression-proxy-comparison.md). bkit cuts reading instead, losslessly: § ReadGuard + `Code reads` / `Narrow text search first` in `.agents/rules.md`.

## MCP project scope

A remote MCP server that can see a whole account makes agents look up account and project IDs before every task. Lock its URL to one project and those lookup tools disappear; calls default to that project. Lock it in every host file that declares the server (`.mcp.json`, `.cursor/mcp.json`, `.opencode/opencode.json`, `.codex/config.toml`).

<!-- prettier-ignore -->
| Service | Locked URL | Effect |
| --- | --- | --- |
| Sentry | `https://mcp.sentry.dev/mcp/<org>/<project>` | `find_organizations` / `find_projects` hidden |
| Supabase | `https://mcp.supabase.com/mcp?project_ref=<ref>&read_only=true` | `list_projects` hidden; `read_only` runs SQL as a read-only database user |
| Vercel | `https://mcp.vercel.com/<team>/<project>` | calls default to that team and project |

Only servers in the repo's own files lock this way; claude.ai connectors cannot be locked per repo (§ claude.ai connectors). The `mcp-scope` setup tip fires on an unlocked URL for a service in this table.

## claude.ai connectors

Claude Code loads every connector on the person's claude.ai account in every repo, and re-sends their tool names on every request whether used or not. `"disableClaudeAiConnectors": true` in `.claude/settings.json` stops that for the repo.

<!-- prettier-ignore -->
| Aspect | Detail |
| --- | --- |
| Stops | claude.ai connectors in Claude Code sessions for this repo — terminal and desktop app |
| Keeps | the repo's `.mcp.json` servers (bkit's tracker server included), `claude mcp add` servers, and the connectors themselves in claude.ai / desktop-app chats and cloud routines |
| Before | move anything agents reach through a connector onto `.mcp.json` (§ MCP project scope), a context-fetch block or the provider CLI |
| Per person | `false` in `.claude/settings.local.json` turns connectors back on |
| Verify | `/context` before and after |

bkit ships no default: the setting also hides each person's own connectors (mail, drive, …), and install / upgrade keep keys bkit does not own, so a shipped `true` could not be turned off in `.claude/settings.json`. The `claude-connectors` setup tip fires on a Claude Code repo that sets neither value.

---

## Runtime environment (cloud agents)

> Setup recipe + alignment: `.bkit/cloud.md`. This section = host-diff matrix only.

<!-- prettier-ignore -->
| Concern | Claude Code on the web | Cursor Background Agents | Codex Cloud |
| --- | --- | --- | --- |
| Where env config lives | Claude app (per-environment), not in repo | In repo (`.cursor/`) | ChatGPT **Settings > Codex Cloud > Environments** (per-environment), not in repo |
| Custom base image | Not supported — setup script layers on top of Anthropic-managed Ubuntu 24.04 | Supported — `.cursor/Dockerfile` | Not used — install script layers on Codex's image |
| Cold-start cache | Snapshot keyed by setup-script body hash (~7d TTL) | Docker image layers | Not documented |
| Per-snapshot install | `.claude/hooks/bkit-cloud-bootstrap.sh` (SessionStart, fires when `CLAUDE_CODE_REMOTE=true`) | `.cursor/environment.json` → `install` | Install script tail (`pnpm install`, `vale sync`, `gh auth login`) |
| Build env | Setup script (paste-in via Claude app UI) | `.cursor/Dockerfile` (Cursor Cloud builds custom image) | **Install script** (paste-in from `.codex/bkit-cloud.md`) |
| Install / start | n/a (handled by bootstrap hook) | `.cursor/environment.json` → `install`, `start`, `terminals[]`, `env`, `ports` | Install script |
| Port forwarding | n/a | `.cursor/environment.json` → `terminals[].ports` | n/a |
| Cloud-session detection | `CLAUDE_CODE_REMOTE=true` (env var) | `is_background_agent === true` (stdin JSON) | None — bkit ships no Codex cloud hook |
| Default network | `Trusted` allowlist (npm, GitHub, PyPI, Docker Hub, vale tarball) | Outbound open in the sandbox | **Internet access**: package-manager domains + **Additional allowed domains** (`*.` entries untested), or all public internet |
| Reusable across repos | Setup script yes (generic snapshot); environment no — one per repo (secrets / PAT scope are per-repo) | No — Dockerfile per repo (copied from the bkit template and owned by the repo) | Install script yes; environment one per repo; **Personal vault** shares chosen secrets |
| Secrets | Env vars in Claude app (plaintext; rotate PATs) | Cursor Cloud env vars (Settings → Background Agents → Environment Variables) | **Environment variables**; **Network secrets** = proxy-substituted, HTTP-only |
| Linear preflight + rules advisory | `.claude/hooks/bkit-preflight.sh` (SessionStart, non-blocking — one document carrying the rules-read advisory always, plus the guard's `additionalContext` HARD STOP when a tracker issue id is set) | `.cursor/hooks/bkit-preflight.sh` (`sessionStart`, `failClosed: true`, blocks on non-zero; the same advisory + guard document) | `.codex/hooks/bkit-rules.cjs` advisory — unproven in cloud tasks |

**Install behaviour:** template drops; project tokens at install. All clouds aligned via bkit: vale 3.9.1, pnpm (corepack-pinned `package.json#packageManager`), gh CLI. See `.bkit/cloud.md` for paste-in recipe + sharing pattern.

---

## Provider models

### Per-provider live model lookup

Installed provider catalog changes. Look up model IDs before pinning in `.opencode/opencode.json`:

<!-- prettier-ignore -->
| Provider | Command | Notes |
| --- | --- | --- |
| Claude (Anthropic) | `curl https://api.anthropic.com/v1/models -H "x-api-key: $BKIT_ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"` | Canonical `Claude` column source. No key in-shell → cross-check via the OpenRouter `anthropic/*` mirror. |
| Cursor | `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"` | `Cursor` column source. Catalog churns. Probed 2026-10-28: `composer-2.5`, `cursor-grok-4.5-high` (+`-fast`), `claude-opus-5-thinking-high` (+`-fast`), `claude-fable-5-thinking-high`/`-xhigh`, `claude-sonnet-5-thinking-high`/`-xhigh`, `gpt-5.6-sol-high`/`-xhigh` (+`-fast`), `gpt-5.6-luna-high`, `gemini-3.7-flash-high`. **Still no Grok 4.6 or 4.7; no Opus 5.5 / Sonnet 5.5.** Cursor's first-party pins are therefore unmeasured on 2.0 and stay as inherited. |
| OpenRouter | `curl https://openrouter.ai/api/v1/models` | **Public — no key.** Aggregator; `vendor/model` slugs (`:free` variants exist). Filter for tool-calling + coding models before pinning. |
| Ollama | `curl https://ollama.com/v1/models -H "Authorization: Bearer $BKIT_OLLAMA_API_KEY"` | Hosted Ollama; cloud-tagged models (e.g. `qwen3.5:397b`, `kimi-k3`). |
| OpenCode Zen / Go (opencode-native gateways) | `curl https://models.dev/api.json` — read providers `.opencode` (Zen) and `.["opencode-go"]` (Go) `.models` | **models.dev is the source of truth — not `/zen/v1/models`.** The REST catalog `curl https://opencode.ai/zen/v1/models` returns only the Zen catalog and cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`/`qwen3.7-max`, …), so it must not be used to curate the Go column. Two distinct providers: `opencode` (name "OpenCode Zen", api `https://opencode.ai/zen/v1`) and `opencode-go` (name "OpenCode Go", api `https://opencode.ai/zen/**go**/v1` — nested under `/zen/`). Both auth via `BKIT_OPENCODE_API_KEY`. Tool-call smoke: `POST <api>/chat/completions` with a `tools:` payload (bare model id, e.g. `minimax-m3`). |

**Model ID format:** opencode provider-prefixed frontmatter: `<provider>/<model-id>` (e.g. `openrouter/moonshotai/kimi-k3`, `ollama/deepseek-v4.1-flash:1017`). Pins = `prompts.md` § Models — **one column per provider** (`OpenRouter`, `Ollama`, `OpenCode Zen`, `OpenCode Go`). Gateways: `opencode/<id>` Zen, `opencode-go/<id>` Go. CLI keys `opencode-zen` / `opencode-go`.

**Lookup mechanic (install pin resolution).** `bkit install --opencode=<provider>` → `buildOpencodeModelLookup(promptsMdPath, provider)` (`.bkit/core/engine/render/models.ts`):

1. Provider key → `prompts.md` column via `OPENCODE_PROVIDER_COLUMN` (`openrouter`→`OpenRouter`, `ollama`→`Ollama`, `opencode-zen`→`OpenCode Zen`, `opencode-go`→`OpenCode Go`).
2. Parse column → seed `.opencode/agents/<name>.md` `model:` verbatim.

**opencode-zen / opencode-go — two OpenCode built-in providers.** Both emit minimal `provider.<id>` with only `options.apiKey: "{env:BKIT_OPENCODE_API_KEY}"` (no npm driver, no baseURL). OpenCode resolves from models.dev — Go Qwen / MiniMax use Anthropic `/messages`, not openai-compatible `/chat/completions`. Zen keyed `opencode`; Go `opencode-go`. `bkit install --opencode=opencode-zen` (or `=opencode-go`) → `bkit.providers.opencode.default` in `package.json`; legacy `opencode` → `opencode-zen` via `OPENCODE_PROVIDER_ALIASES`. Reinstall **replaces** seeded block (heals hijacked npm / baseURL). Set `BKIT_OPENCODE_API_KEY` in `.bkit/.env` (<https://opencode.ai/auth>). Columns from **models.dev**.

**All four opencode providers ship curated columns.** Tier design — **per-tier quality target, cheapest sufficient pin**. A tier cell is not "the same rung of this provider's ladder": it is the cheapest model that **reaches that tier's Claude score**, and reaching means approaching — it does not have to beat it. Targets are the LiveBench 2.0 Long Agentic scores (§ LiveBench 2.0 board): opus `claude-opus-5-5` **72.8**, sonnet `claude-sonnet-5-5` **63.4**, haiku `claude-haiku-5-5` **40.0**. Where a provider's ceiling sits under the sonnet target, opus+sonnet **collapse onto that ceiling** — spreading them across two rungs buys nothing and costs quality on the sonnet half. Where a cheap model already clears the haiku target, the haiku cell **stays cheap** — a $5/task flagship serving a read-and-emit summariser is waste, not safety.

### Selecting pins

Re-pin **one provider column at a time**. Cells: `prompts.md` § Models. Board below = scores.

**Priority — do not invert.**

0. **Budget band** — hard ceiling on what an opencode column may bill over a 2-day subscription gap: **A$70/week** default, **A$140/week** opt-in (§ Budget band). A pin that pushes its column past the cap is disqualified at any score.
1. **Claude parity** — LiveBench Long Agentic (pin score) + AA Intelligence Index. Inside the band, closest to the bar wins; a column whose best in-band model misses the bar records the gap.
2. **Cost** — inside the band, cheapest that reaches the bar; ties fall through to price. AA $/task + LiveBench $/task, rescaled to the billed provider.
3. **Speed** — remaining ties: AA tok/s, TTFT, think→answer, E2E 500-token.

Filters (not above score): endpoint count; automatic prompt caching (bkit sends no `cache_control`). **Any vendor may pin on an opencode column** — the budget band, not a vendor list, is what keeps the costliest models off.

**Steps.**

1. Read `prompts.md` § Models + lineup below.
2. Pull every source; stamp the date. LiveBench `table_<date>.csv` name != freshness.
3. Slug live? § Per-provider live model lookup. OpenRouter: also `GET /api/v1/models/{slug}/endpoints`.
4. Shortlist 1-2 / tier. Reject single-endpoint + `cache_control` hosts (Anthropic, Alibaba) unless no alternative.
5. Apply: `prompts.md` § Models + this board + `.bkit/core/engine/render/models.test.ts` OpenRouter tests + `bkit install`. Stamp `prompts.md` § Live model-ID verification.

**Sources — check all.**

<!-- prettier-ignore -->
| Pri | Source | Decides | URL |
| --- | --- | --- | --- |
| 1 | LiveBench 2.0 | Pin score — **Long Agentic** | `https://livebench.ai/data/<YYYYMMDD>/table.csv`, beside it `categories.json` (category → columns + `_overall_weights`), `cost.csv`, `breakdown.json`. Releases `20261014`, `20261025` (latest `20261025`). **The v1 path is dead:** `raw.githubusercontent.com/LiveBench/new-livebench/…/public/table_<date>.csv` 404s for 2.0 and stops at `2026-06-25` |
| 1 | AA Intelligence Index | General intelligence | https://artificialanalysis.ai/leaderboards/models |
| 1 | DeepSWE | Long-horizon repo work — public board only | https://deepswe.datacurve.ai |
| 1 | LMArena Code Arena — WebDev | Web-dev preference | https://lmarena.ai (Code / WebDev) |
| 1 | Design Arena — Code | Web-app preference | https://designarena.ai/leaderboard/code |
| 1 | CursorBench | Agentic coding at **every effort level** (`low` → `max`) with $/task — the source for choosing an agent's `effort:`; cross-checks LiveBench. Cursor's own `composer-*` rows count as vendor-only | https://cursor.com/cursorbench |
| 2-3 | AA cost / latency | $/task, tok/s, TTFT, E2E | same AA leaderboard |
| 2 | LiveBench cost table | $/task per category — `out_<category>` = dollars per successful task; rescale to billed provider | `https://livebench.ai/data/<YYYYMMDD>/cost.csv` |
| 2 | OpenRouter model page | List in / out + cache-read | https://openrouter.ai/models/{slug} |
| filter | OpenRouter endpoints | Host count; 1 = reject | `GET /api/v1/models/{slug}/endpoints` |
| filter | OpenRouter prompt-caching doc | Auto vs `cache_control`; ignore `supports_implicit_caching` | https://openrouter.ai/docs/features/prompt-caching |
| filter | Provider catalogs | Existence / context / plan gates | § Per-provider live model lookup |

**Do not pin from:** OpenRouter volume; BenchGecko; vendor-only Terminal-Bench / SWE; launch blogs.

**Four column classes — each answers a different question.**

<!-- prettier-ignore -->
| Class | Columns | What the pin answers |
| --- | --- | --- |
| First-party plan | `Anthropic` (Claude Code), `OpenAI` (Codex), `Google` (Antigravity) | The best model for each subagent **from that vendor's own ladder**, spending the plan's included usage where it buys the most. A Codex pin is the best OpenAI model for the job, never an imitation of Claude; no cross-vendor parity target. |
| Metered gateway | `Ollama`, `OpenCode Zen`, `OpenCode Go` | **Claude is the yardstick:** the cheapest model in that gateway's catalog closest to the agent's Claude tier bar, inside the budget band. Any vendor qualifies. |
| Overflow default | `OpenRouter` Option 1 | OpenRouter runs on the days the OpenAI, Anthropic and Google credits are spent. Same yardstick; the default spends the A$70 cap on `gpt-6.1-sol` for the four key gates and runs every other agent on `deepseek-v4.1-flash-1017`. |
| Overflow opt-in | `OpenRouter` Option 2 | Doubles the weekly cap to A$140 — nine judges on `gpt-6.1-sol`. |

**The question is per subagent, not per column.** Every pin answers "what is the best model for this agent's job", judged on the board's Long Agentic score with the agent's role in mind: judges, reviewers, verifiers and escalators need the strongest model the class allows (see the reviewer rule below), while mechanical writers and summarisers should not pay flagship prices. Matching cells across columns are a catalog coincidence, never an objective.

### Budget band — the gap between subscription resets

**Usage intent.** An opencode column runs between subscription resets: after the week's Claude and OpenAI credits are gone, until they return. Days, not a month. A pin that would burn a month's worth of cost inside such a gap fails its purpose however well it scores, so **cost is a ceiling checked before parity, not a tie-break after it**.

**The band is a cache-read ceiling, because cache reads are the bill.** Measured across 21 days of real agent work (Claude Code transcripts, deduped by message): a normal day carries **~1.0-1.2B cache-read tokens**, ~20M cache writes, ~1.6-2.4M output and ~0 fresh input — roughly **600 cache-read tokens per output token**, so cache reads exceed 95% of what a gap costs. Cache-read price spans ~170x across the board while input price spans ~13x, so an input / output band cannot predict what a gap costs.

**Measured on opencode itself** (`bkit harvest scan`, 2026-10-25 → 10-28, 166 chats on `deepseek-v4.1-flash`): a heavy day carries **27.8M fresh input, 1.04B cache read and 2.08M output**, and the fresh input is what the Claude profile misses — Claude Code caches almost all of it away, opencode does not. Per heavy day at list prices: **DeepSeek $8.6**, Gemini 4 Argon or GPT-6.1 Sol **$180.8**, Claude Opus 5.5 **$361.5**. Input price therefore matters on this profile: the Gemini / GPT tier spends $56 of its $181 on fresh input alone.

**What the A$70 cap buys on that day** (A$0.703/USD, 2-day gap, day cost split evenly over 39 agents): `gpt-6.1-sol` costs about **A$13.16** per agent per gap, `deepseek-v4.1-flash-1017` **A$0.62**. All 39 on DeepSeek: A$24. Four on sol, the rest DeepSeek: **A$74**, A$4 over, accepted. A$140 buys **nine** on sol (A$137); all twelve judges land at A$175 and breach it.

<!-- prettier-ignore -->
| Cache-read ceiling (per Mtok) | Normal day | 2-day gap | Models that survive |
| --- | --- | --- | --- |
| <= `$0.005` | ~$8 | ~$30 | `deepseek-v4.1-flash-1017` ($0.003) |
| <= `$0.015` | ~$17 | ~$60 | + `minimax-m3.1-flash` ($0.015) |
| <= `$0.04` | ~$47 | ~$150 | + `glm-5.3-flash` ($0.03) |
| <= `$0.10` | ~$105 | ~$240 | + `gemini-4-argon` ($0.10), `gpt-6.1-sol` ($0.10) |
| <= `$0.20` | ~$200 | ~$500 | + `kimi-k3.1-pro` ($0.20), `kimi-k3` ($0.19) |

`grok-4.7` ($0.50 cache read) fails every row. **No single ceiling binds the column:** the cap is spent as a mix — the `$0.005` row on most agents, the `$0.10` row on as many judges as the remaining cap carries (§ LiveBench 2.0 board, Two presets).

Cache-read prices on the current pins: `deepseek-v4.1-flash` $0.003, `glm-5.3-flash` $0.03 (haiku), `gpt-6.1-sol` and `gemini-4-argon` $0.10 (key gates).

### LiveBench 2.0 board — 2026-10-25

Re-probed `https://livebench.ai/data/20261025/table.csv` + `cost.csv` (§ Selecting pins § Sources). **Pin score = Long Agentic** — 2.0's headline category, weighted 2x in the overall, and the multi-turn long-horizon work every agent runs. **Coding = sanity check**, never the criterion. 2.0 replaced v1's single Agentic Coding category with seven, each its own task set: **v1 and 2.0 scores do not convert** — never carry a v1 number forward or bridge across the gap.

**Bars (Claude, 2.0):** opus `claude-opus-5.5` **72.8** · sonnet `claude-sonnet-5.5` **63.4** · haiku `claude-haiku-5.5` **40.0**. All three are measured on this release — no bridging, no held-over 5.0 rows.

<!-- prettier-ignore -->
| Model | Long Agentic (pin) | Coding | Overall | LA $/task | OR endpoints | Pinnable on |
| --- | --- | --- | --- | --- | --- | --- |
| `claude-fable-5.1` | **77.9** | 97.7 | 85.7 | $928.31 | — | — (Claude) |
| `gpt-6-astra` | **77.5** | 93.7 | 85.6 | $690.82 | 7 | or · zen |
| `claude-opus-5.5` | **72.8** | 96.3 | 85.1 | $684.16 | — | **opus bar** |
| `gpt-6.1-sol` | **68.7** | 96.0 | 84.1 | $116.78 | 8 | or · zen |
| `claude-sonnet-5.5` | **63.4** | 94.7 | 80.0 | $630.21 | — | **sonnet bar** |
| `gemini-4-argon` | **61.2** | 89.7 | 79.3 | $249.15 | 6 | or · zen · go |
| `muse-wonder-1.0` | **52.6** | 86.2 | 74.2 | $249.07 | — | or · zen |
| `gpt-6.1-terra` | **48.6** | 94.3 | 77.8 | $116.42 | 4 | or |
| `grok-4.7` | **46.1** | 84.5 | 70.1 | $337.79 | 5 | or · zen · go |
| `deepseek-v4.1-flash-1017` | **40.9** | 96.0 | 74.0 | $25.96 | 36 | or · ollama |
| `claude-haiku-5.5` | **40.0** | 91.4 | 69.8 | $188.84 | — | **haiku bar** |
| `kimi-k3.1-pro` | **39.1** | 81.8 | 71.3 | $133.67 | 2 | or · go |
| `mimo-v2.6-pro` | **35.2** | 81.5 | 68.5 | $21.86 | 5 | or · go |
| `gpt-5.6-terra` | **33.1** | 86.2 | 67.8 | $211.62 | 7 | or |
| `gpt-6-luna` | **30.9** | 84.5 | 64.6 | $17.42 | 7 | or · zen · go |
| `qwen3.8-max` | **29.9** | 60.3 | 61.6 | $268.74 | 2 | or · zen · go |
| `minimax-m3.1-flash` | **28.8** | 83.9 | 66.9 | $19.50 | 12 | or · go · ollama |
| `grok-4.6` | **28.0** | 89.1 | 67.8 | $184.39 | 6 | or · zen |
| `kimi-k3` | **26.4** | 59.3 | 64.6 | $323.83 | 30 | or · zen · go · ollama |
| `muse-spark-1.3` | **25.5** | 90.2 | 63.0 | $160.10 | — | or · zen |
| `qwen3.8-27b` | **20.6** | 86.8 | 58.4 | $111.08 | — | or |
| `step-5-preview` | **19.4** | 85.6 | 58.6 | $162.98 | 3 | or · go |
| `glm-5.3-flash` | **19.0** | 80.6 | 62.1 | $29.32 | 38 | or · zen · go · ollama |
| `gemini-3.8-flash` | **16.5** | 82.2 | 59.2 | $126.70 | 7 | or · zen |

**`gpt-6.1-sol` is the only model over the sonnet bar the cap carries.** It pins the four key gates on `openrouter` and `opencode-zen`. `gpt-6-astra` (77.5) bills ~6x sol per task ($690.82) and stays on the `OpenAI`/Codex judges; the Claude rows bill more still.

**One release is a weak signal.** `kimi-k3` read 42.8 on `20261014` and 26.4 on `20261025` for the same category, so a re-pin takes a second release as corroboration unless the gap exceeds the bar's margin. `$` is LiveBench's own direct-vendor basis; a gateway pin is billed at the gateway's price (Zen `deepseek-v4.1-flash` $0.30/$1.20, Go $0.15/$0.60, `gemini-4-argon` $2/$10 on both gateways).

**Unmeasured on 2.0 — keep their v1 basis, do not re-derive:** `composer-2.5` and `cursor-grok-4.5-high` (Cursor), `gemini-3.8-pro` (Google / Antigravity).

**Two presets, one budget.** Judges = the 12 reviewers, verifiers and escalators (`prompts.md` § Models, Judges note); builders = the other 27. Key gates = the 4 judges where a miss passes downstream unchecked. The overflow column is capped against a Max subscription, A$300/month, about A$70/week, using the 2-day gap as the binding case. Option 1, the shipped default (A$74 per gap), runs `gpt-6.1-sol` on the four key gates and `deepseek-v4.1-flash-1017` everywhere else; Option 2 (A$137) runs sol on nine judges. Reviewers must out-rank builders wherever the budget allows — that rule binds Option 2 and any consumer who raises the cap. Preset tables, the per-agent matrix, the unpriced costs and the Option 2 copy-paste block: `prompts.md` § Model Presets.

**FX:** A$0.703/USD on 2026-10-27. The caps are weekly; a 2-day gap is the binding case at the measured profile.

**Why the presets sit above `bkit:end`:** a consumer's § Model Overrides below it is preserved by install and upgrade, so text placed there would never reach an existing install. That consumer region stays deliberately thin: a usage line and the empty table.

### Agentic-coding parity board

**v1 generation — superseded by the 2.0 board above; kept as the v1 basis for models 2.0 has not measured.** LiveBench closed v1 at `2026-06-25`. 2.0 restarted the categories and weights, so the scores below do not convert to 2.0 — read them only against each other.

Source: [LiveBench](https://livebench.ai/#/?cats=Agentic+Coding), release **2026-06-25** (`table_2026_06_25.csv` / `cost_2026_06_25.csv`, `LiveBench/new-livebench`). **Score** = mean of the category's three tasks (`javascript`, `typescript`, `python`), per `public/categories_<date>.json`. **$/task** = category dollars / 72 questions, from LiveBench's own cost table. Process + sources: § Selecting pins. Artificial Analysis stays the source for price / latency and general capability; agentic-coding score decides a **pin**, because that is the workload every bkit agent runs.

**Re-probe on a schedule, never on a release stamp.** LiveBench appends newly released models to the **existing** `table_<date>.csv` — `RELEASES` in its `src/lib/constants.js` stays put while the file's contents move. The cited date is not a freshness signal, and a column can go stale with nothing here looking stale.

**$/task must be rescaled to the provider actually billed.** LiveBench's cost table assumes direct-vendor pricing; an OpenRouter pin is billed at OpenRouter's `pricing.prompt` / `pricing.completion`. The two diverge (LiveBench assumes `$3/$15` per Mtok for `claude-sonnet-5`; OpenRouter charges `$2/$10`). Solve LiveBench's dollar figure for implied input tokens, then re-price.

**Sub-scores are too coarse to pin on; use them to sanity-check, not to decide.** Question counts are JS 22 / TS 30 / PY 20, so one TypeScript question moves that sub-score 3.33 points (SE ~ 9). TypeScript is the hardest of the three and every model scores below its own mean there — the Claude ladder is **not monotonic on TypeScript** (`claude-sonnet-5` 50.0 sits above `claude-opus-5` 43.3). Read the mean as the pin criterion; do not read it as a ranking of ability in any one language.

**Score is necessary, not sufficient — operational shape decides ties.** Two properties carry real weight once scores are within noise: **endpoint count** (`/api/v1/models/<slug>/endpoints`) and **whether prompt caching applies without client configuration**. A single-endpoint model cannot be routed around a slow or down host and inherits that one provider's rate limits — disqualifying for a column whose whole job is to absorb work when the Claude quota is spent. Caching is the dominant latency and cost term for bkit workloads: without it every turn of a long agentic loop re-prefills the whole growing transcript.

**Read caching from the provider docs, not from `supports_implicit_caching`.** That endpoint field is unreliable — it reports `false` on all 14 `kimi-k3` endpoints while OpenRouter's own [prompt-caching doc](https://openrouter.ai/docs/features/prompt-caching) states Moonshot caching is automated. The doc's per-provider sections are authoritative. Current contracts: **Moonshot, DeepSeek, Z.AI, Gemini 2.5+ cache automatically, no configuration**; **Anthropic, Alibaba Qwen require explicit `cache_control` breakpoints**, which bkit does not send — so an Alibaba-hosted pin gets no caching at all. Cache reads run ~0.03x-0.20x of input price; writes are free except on DeepSeek (charged at input price).

**Cache hits need the same endpoint twice — OpenRouter handles this with sticky routing.** After a cached request it pins the conversation to that provider, keyed by `session_id` / `prompt_cache_key` when sent, otherwise by hashing the first system message plus the first non-system message. Sticky sessions expire after **10 minutes of inactivity**, and sticky routing is disabled entirely when `provider.order` is set — do not pin a provider order on a cached model.

<!-- prettier-ignore -->
| Model | Score | $/task | Role in bkit |
| --- | --- | --- | --- |
| `deepseek-v4.1-flash` | **77.3** | $0.06 | every opencode column's opus+sonnet — dated `1017` snapshot on `openrouter` (35 endpoints) + `ollama` (`deepseek-v4.1-flash:1017`); the undated 2026-09-10 slug on both gateways; auto cache; 2.0: `1017` 40.9, 31.9 under the opus bar. Haiku on `ollama` + `opencode-go` |
| `claude-opus-5-5` (max) | 71.7 | $4.48 | Claude opus pin at `max` |
| `claude-opus-5-5` (xhigh) | 65.4 | $1.40 | Claude opus pin at `xhigh` — level with the opus target at about a quarter of the cost |
| `claude-opus-5` (max) | **65.2** | $5.34 | **opus target** |
| `deepseek-v4-flash-vision-exp` | 65.1 | $0.11 | **not pinned** — experimental; its own datasheet claims text parity with `deepseek-v4-flash-0731`, which measures 46.8. Score not trusted |
| `qwen3.8-max` | 64.6 | $1.75 | **not pinned** — single endpoint (Alibaba) and **no caching available**: Alibaba requires explicit breakpoints and this slug is absent from its supported list |
| `kimi-k3` | 62.2 | $1.76 | **not pinned** — its $0.19 cache read breached every cap (§ Budget band); 17 OpenRouter endpoints, auto cache (reads 0.10x, writes free); both gateways bill $3/$15 per Mtok |
| `claude-fable-5` (max) | 62.2 | $8.86 | not adopted — below Opus 5 at 1.7x the cost |
| `qwen3.8-27b` | 61.4 | $1.52 | **not pinned** — 3.57M input tokens/task; `$0.95` on LiveBench's assumed price, `$1.52` at OpenRouter's |
| `glm-5.3` | 60.9 | $1.60 | **not pinned** — 27 endpoints, auto cache; dominated by V4.1 Flash |
| `claude-sonnet-5` (xhigh) | **59.4** | $2.14 | **sonnet target** |
| `gemini-3.7-flash` | 58.3 | $0.42 | **not pinned** — under V4.1 Flash |
| `claude-haiku-5-5` (max) | 57.2 | $0.21 | Claude haiku pin at `max` |
| `grok-4.6` | 57.0 | $1.79 | **not pinned** — under V4.1 Flash, higher cost |
| `glm-5.3-flash` | 56.8 | $0.11 | `openrouter` + `opencode-zen` haiku — 27 endpoints, auto cache; 2.0: 19.0, 21.0 under the haiku bar |
| `grok-4.5` | 56.5 | $0.54 | `cursor` opus (ceiling; -2.9 vs sonnet target at a quarter the cost) |
| `claude-sonnet-5-5` (max) | 56.3 | $5.57 | Claude sonnet pin at `max`. Python 35.0 at both efforts (n=20) |
| `deepseek-v4-pro-0813` | 54.9 | $0.22 | **not pinned** — dominated by V4.1 Flash |
| `claude-haiku-5-5` (xhigh) | **51.4** | $0.07 | **haiku target** — closest measured rung to bkit's `high` (CursorBench: `high` 42.3%, `xhigh` 44.3%) |
| `gpt-6-luna` | 51.2 | $0.03 | `OpenAI` (Codex) catalog — unused until a haiku tier exists; 2.0: 30.9 |
| `claude-opus-4-8` (max) | 50.5 | $4.96 | superseded — shows the 4.8 → 5 generational jump (+14.7) |
| `kimi-k2.7-code` | 45.7 | $0.39 | **not pinned** — dominated by `deepseek-v4.1-flash` (77.3 · $0.06) on every column that carries both |
| `qwen3.7-max` | 43.6 | $0.80 | not pinned (anchor for the unmeasured `qwen3.7-plus`) |
| `deepseek-v4-pro` | 42.6 | $0.14 | **not pinned** — dominated by V4.1 Flash. **Frozen on the 0423 snapshot** — the undated slug does not float |
| `qwen3.6-plus` | 41.4 | $1.55 | **not pinned** — strictly dominated by `kimi-k2.7-code` (lower score, 4x cost) |
| `minimax-m3` | 40.7 | $0.42 | **not pinned** — `deepseek-v4-pro` scores higher at a third the cost |
| `claude-sonnet-5-5` (xhigh) | 39.3 | $0.50 | **not read as a target** — Anthropic recalibrated effort on 5.5, and this run wrote about half Sonnet 5's output tokens before stopping. CursorBench, Artificial Analysis and Anthropic all put 5.5 above 5 at every effort |
| `deepseek-v4-flash` | 37.6 | **$0.03** | **not pinned** — under the ~51 haiku target |
| `claude-haiku-4-5` (thinking) | ~35 † | — | not pinned — under the ~51 haiku target |
| `gpt-oss-120b` | ~10 † | — | **pinned nowhere** — below every target, haiku included |

† **Estimated, not measured.** Model absent from the 2026-06-25 release; value bridged from its 2026-01-08 score via the mean delta of the three nearest-scoring models present in both releases. Cross-release scores are not comparable directly (LiveBench rotates questions — overlapping models moved -1.4 to -31.5), so treat † as a bracket, not a number. **Unmeasured entirely** (no anchor in either release, do not infer): `composer-2.5`, `qwen3.5-397b`, `qwen3-coder`, `qwen3.7-plus`, `glm-4.5-air`, `gpt-oss-20b`, `qwen3-coder:30b`.

### Per-tier lineup across providers

Cells show pin · score · $/task. Deltas are against that column's target. Key gates (the 4 judges named in `prompts.md` § Models) ride the same board.

<!-- prettier-ignore -->
| Provider | opus — target 72.8 | sonnet — target 63.4 | haiku — target 40.0 | key gates | Notes |
| --- | --- | --- | --- | --- | --- |
| `claude` | `claude-opus-5-5` 72.8 — the bar | `claude-sonnet-5-5` 63.4 — the bar | `claude-haiku-5-5` 40.0 — the bar | (opus) | Pins are 5.5 ($4/$20 opus, $2/$10 sonnet, $0.10/$0.50 haiku, 1M context). Targets are the 5.5 scores on the 2.0 board: `claude-opus-5-5` **72.8**, `claude-sonnet-5-5` **63.4**, `claude-haiku-5-5` **40.0**. |
| `openrouter` | `deepseek/deepseek-v4.1-flash-1017` 40.9 · $25.96 (-31.9) | same (-22.5) | `z-ai/glm-5.3-flash` 19.0 · $29.32 (-21.0) | `openai/gpt-6.1-sol` 68.7 · $116.78 (-4.1) | Aggregator; broad catalog to re-pin from. Opus+sonnet collapse on V4.1 Flash (the 40.9 workhorse sits 31.9 under the 72.8 opus bar). **Dated `1017` snapshot pinned** — the undated alias is frozen on the 2026-09-10 snapshot and does not float. Haiku = GLM-5.3 Flash — 21.0 under the bar and dearer per task than V4.1 Flash ($29.32 vs $25.96); no agent runs the haiku tier. Key gates = GPT-6.1 Sol, the only model over the sonnet bar the cap carries (§ Budget band). V4.1 Flash and GLM-5.3 Flash auto-cache. |
| `cursor` | `cursor-grok-4.5-high` **n/m** | `composer-2.5` **n/m** | `composer-2.5` **n/m** | (opus) | Ceiling is grok-4.5 — no Cursor model reaches the opus target, which is the correct outcome, not a gap. `composer-2.5` is the one unresolved cell in the matrix: vendor-claimed ~ Opus 4.7 (v1 50.7, unmeasured on 2.0), never on LiveBench. Probe or override before relying on it for sonnet-tier work. Haiku stays `composer-2.5` too: the only first-party model measured over the v1 haiku bar is `cursor-grok-4.5-high` (v1 56.5, unmeasured on 2.0), at about 8x the cost. |
| `ollama` (cloud) | `deepseek-v4.1-flash:1017` 40.9 · $25.96 (-31.9) | same (-22.5) | `deepseek-v4.1-flash:1017` 40.9 · $25.96 (+0.9) | `deepseek-v4.1-flash:1017` 40.9 · $25.96 (-31.9) | **Whole column needs a paid Ollama plan.** **No model variants** — the ollama provider builds catalog entries with none, so bkit omits `variant:` on this column (2.0 would reject it); agents run at opencode's default reasoning. Every tier and the key gates collapse on V4.1 Flash (the 40.9 workhorse sits 31.9 under the 72.8 opus bar) — nothing stronger in the catalog. The free `qwen3.5:397b` / `gpt-oss:20b` are unmeasured — free-tier users re-pin in `prompts.md` § Model Overrides and accept unverified quality. |
| `opencode-zen` | `opencode/deepseek-v4.1-flash` **n/m** | same | `opencode/glm-5.3-flash` 19.0 · $29.32 (-21.0) | `opencode/gpt-6.1-sol` 68.7 · $116.78 (-4.1) | Opus+sonnet skip `kimi-k2.7-code` (unmeasured on 2.0): OpenCode 2.0 hard-errors on a `variant:` the model does not expose, and `kimi-k2.7-code` exposes none. The undated V4.1 Flash slug is the 2026-09-10 snapshot (models.dev `release_date`), not the `1017` refresh the 40.9 board row measures. It carries variants (`low/high/max`); **Zen bills it at $0.30/$1.20**. Haiku = GLM-5.3 Flash. Key gates = GPT-6.1 Sol. Existence-validated via models.dev. |
| `opencode-go` | `opencode-go/deepseek-v4.1-flash` **n/m** | same | `opencode-go/deepseek-v4.1-flash` **n/m** | `opencode-go/gemini-4-argon` 61.2 · $249.15 (-11.6) | Budget open-weight plan. V4.1 Flash is the undated 2026-09-10 snapshot, as on Zen. Key gates = Gemini 4 Argon — Go serves no GPT-6.1 Sol; Argon is its strongest model under the cap. `minimax-m3`/`qwen3.7-plus` not pinned (see the board). Prefer pins inside the Go 5h window. DeepSeek models need the workspace privacy setting on "Global regions". |

**n/m** = not measured on LiveBench (see the unmeasured list above) — the cell is a catalog / constraint choice, not a scored one.

**Hard-constraint escape hatch.** "Cheapest that reaches the target" is bounded by constraints that are not about quality: paid-plan gating (`ollama`), rate/quota/context walls when 39 agents collapse onto one flagship. Deviate for those, and say so in the Notes cell — a constrained pin must never read as a tier judgement.

Cloud OpenAI-compatible cells tool-call-smoked (`tools:` round-trip `tool_calls`) — `/models` != proof (validate-with-real-tool). `opencode-zen` existence-validated via models.dev (Zen balance zero; smoke on Go endpoint). Re-pin: edit agent `model:`, add `prompts.md` § Model Overrides row, or change column + `bkit check`. Probe live catalog first (models.dev opencode; `/v1/models` table rest).

**Consumer model overrides (upgrade-safe):** `.bkit/prompts.md` marker-managed (`rules.md` pattern) — bkit refreshes `bkit:start`/`bkit:end` on upgrade; `## Model Overrides` below `bkit:end` consumer-owned. Pin different model per agentxhost/provider:

```
| Prompt | Provider | Model |
| --- | --- | --- |
| bkit-plan-review-2 | openrouter | openai/gpt-6.1-sol |
```

`Provider` = host / install key (`cursor`, `openrouter`, `ollama`, …). Install merges overrides over defaults (override wins). Claude reads frontmatter; not overridable via table yet.

**Cursor API-credit restore:** when you have third-party / additional API credits and want Claude Opus on Cursor workflows, use the paste block in `prompts.md` § Model Overrides (Claude-opus-tier → `claude-opus-5-thinking-high`) — that is the only way to put a Claude opus-tier model on Cursor (the first-party pins are unmeasured on 2.0, so the gap is not quantified). Sonnet-tier agents stay on shipped Composer / Grok (correct under per-tier targeting, not a shortfall) unless you opt into `gpt-5.6-sol-high`. Orchestrators `/design` `/plan` `/debug` = session model (set at launch), not the override table.

---

## System-prompt / memory files

<!-- prettier-ignore -->
| Host | Reads automatically | Format |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` (root + nearest ancestor) | Plain markdown |
| Cursor | `AGENTS.md` (root, AGENTS.md spec) + `.cursor/rules/*.mdc` (MDC: markdown + optional YAML frontmatter with `description`, `globs`, `alwaysApply`) | Plain markdown / MDC |
| Both (de-facto cross-host convention) | `AGENTS.md` increasingly read by all hosts incl. Claude Code, Codex, Cursor | Plain markdown |

**Current setup:** `CLAUDE.md` + `.cursor/rules/bkit-rules.mdc` redirect to `.agents/rules.md`. `AGENTS.md` = cross-host entry, read by every host: rules pointer, memory hygiene (memories hold pointers to docs, never copies) + workflow gate — prompt contains `bkit-{command}` → `.bkit/router.md` (command → each host's command file; bare `bkit-auto` → phase from the issue's labels); any other prompt → normal work under `.agents/rules.md`. **Host-scoped ownership:** `CLAUDE.md` ships `--claude` (Claude analog of `.cursor/rules/bkit-rules.mdc`, `--cursor`); `AGENTS.md` core (always). Each host brings redirect — no rule all three coexist. `--cursor`-only: no `CLAUDE.md`; `--claude`-only: no `.cursor/rules/`.

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
| Claude Code | Synchronous `Agent` tool calls; parallel calls in single turn = parallel execution within main agent. No first-class async / background concept. |
| Cursor | `is_background: true` on subagent → spawns Cursor Cloud Agent that runs detached; main agent continues. Async by design. |
| opencode | Concurrent `Task` dispatch (spike-proven: 3 distinct subagents run concurrently, wall-clock < serial sum). Real parallelism only when the backend serves requests concurrently — true for every provider (openrouter, ollama, opencode-zen, opencode-go). The workflow text is unchanged — concurrency is bounded at the Ollama server, not in the command files. |

**Implication:** parallel fan-outs (triplet `bkit-design-brainstorm-ideate-1`/`-2`/`-3`; `bkit-plan-review-1`/`-2` + `bkit-plan-scope-check`; pairs `bkit-design-review-*`, `bkit-build-challenge-*`) — Claude: concurrent `Agent` in one turn; Cursor: opt-in `is_background: true` (default off; host config can flip at install); opencode: concurrent `Task` — real on every provider.

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

Cursor API / frontmatter churn — confirm before dependent changes:

- Cursor model IDs in § Cursor model catalog still exist, not superseded.
- Cursor `readonly: true` semantics — file writes only, or bash / terminal too.
- Cursor tool-name parity (`Bash` vs `terminal`, `Edit` vs `edit_file`, etc.).
- Cursor `Task` resolution: `/<name>` → `.cursor/agents/<name>.md` (mirrors Claude `Agent` `@<name>` → `.claude/agents/<name>.md`).
- `AGENTS.md` adoption — when all hosts read natively, redirects (`CLAUDE.md`, `.cursor/rules/bkit-rules.mdc`) can shrink.
