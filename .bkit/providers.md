# IDE / Host Differences

> [!CAUTION]
> **Purpose:** Authoritative inventory of IDE host differences. Drives install script transform rules. Source-of-truth for "what changes between IDE versions of commands and subagents".
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
> - Ships to consumers: describe the CURRENT setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - One row per concern. Update when an IDE adds / changes a feature.
> - Unlisted = identical across hosts; install copies byte-identical.
> - Canonical format = Claude. All transforms = Claude → other.

## Supported hosts

<!-- prettier-ignore -->
| Host | Tier | Subagent dir | Command dir | Settings | Hooks | Install |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | canonical | `.claude/agents/` | `.claude/commands/` | `.claude/settings.json` | `.claude/hooks/` (registered in settings) | `bkit install --claude` |
| Cursor | derived | `.cursor/agents/` | `.cursor/commands/` | `.cursor/settings.json` + `.cursor/environment.json` + `.cursor/Dockerfile` | `.cursor/hooks/` (registered in `.cursor/hooks.json`) | `bkit install --cursor` |
| opencode | additive (opt-in) | `.opencode/agents/` | `.opencode/commands/` | `.opencode/opencode.json` | `.opencode/plugin/gateguard.js` (PreToolUse) | `bkit install --opencode=<provider>` |
| Codex CLI | additive (opt-in) | `.codex/agents/` (TOML) | none — skills (below) | none (`openai` = reserved built-in id) | `.codex/hooks/gateguard.cjs` + `.codex/hooks/guardrails.cjs` (PreToolUse `apply_patch` / `Bash`, via `.codex/hooks.json`) | `bkit install --codex` |

**Two axes — host != provider.** **Host** = program reading what bkit writes, identified by its dir (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`). **Provider** = gateway tokens are bought through. Model IDs are per-provider → `prompts.md` § Models = one column per PROVIDER (shared provider = one column, never two). Thinking depth is per-host (field name + ladder set by host config format: `effort:` claude/cursor, `reasoningEffort:` opencode, `model_reasoning_effort` codex) → § Effort = one column per HOST. Neither table grows as hosts x providers.

**One provider per host = POLICY, not capability.** Nothing technical forces it — Cursor reaches Claude models, so does anything behind OpenRouter. Pin follows cost: each host runs on the gateway whose subscription is already paid. Subscription spent → switch **host**, NOT provider (the cheap gateway hangs off a different host).

<!-- prettier-ignore -->
| Host | Provider | Why |
| --- | --- | --- |
| Claude Code | `anthropic` | Claude subscription = cheapest path to Claude models |
| Cursor | `cursor` | Cursor subscription covers its whole catalog |
| Codex CLI | `openai` | ChatGPT subscription |
| opencode | **pick one**: `openrouter`, `ollama`, `opencode-zen`, `opencode-go` | no subscription — BYO key, so the choice is yours |

Subscription-bearing host → pinned, nullary flag (`--claude`, `--codex`). BYO-key host → pluggable, flag names the provider (`--opencode=<provider>`). Per-model deviation → consumer `## Model Overrides` below `bkit:end`; NO provider override.

### Codex CLI — three deviations

<!-- prettier-ignore -->
| Concern | On Codex |
| --- | --- |
| Agent files | `.codex/agents/*.toml` (TOML, not markdown). Required: `name`, `description`, `developer_instructions`. Pin + rung: `model`, `model_reasoning_effort`. |
| Workflows = SKILLS, invoked `$bkit-design` | NO project-scoped command surface — custom prompts are `~/.codex/prompts` only, not repo-shared, deprecated for skills (upstream declined repo-scoped prompts). bkit renders `.agents/skills/bkit-<workflow>/SKILL.md`, on Codex's skill path (`$REPO_ROOT/.agents/skills`). `.agents/` is shared → visible to every host. |
| `tools:` NOT enforced | No per-agent tool allowlist upstream; `sandbox_mode` cannot substitute — every bkit agent is write-capable, so all would be `workspace-write`. Each agent gets the full built-in tool set regardless of declared `tools:`. GateGuard still gates, as everywhere. |

> **GateGuard needs the `.codex/` layer TRUSTED.** Codex loads project-local hooks only once trusted. Until then the hook is installed and never fires — present, proving nothing. Same for `guardrails.cjs`.
>
> **Codex cannot prompt.** It parses `permissionDecision: "ask"` but does not implement it — an ask is recorded as an error and the call proceeds. `guardrails.cjs` therefore blocks the `deny` tier for real and emits the `ask` tier as advisory `additionalContext`: the gate fires and informs, it cannot stop the command. Every ask-tier command is already PROHIBITED in all five workflow headers, so no bkit workflow reaches one. Asserted in `bkit-permissions-parity.integration.test.ts`.

**Explicit host axis (no implicit full):** `bkit install` requires ≥1 module flag — bare `bkit install` errors. Every host explicit; hosts compose: `bkit install --claude --cursor --opencode=opencode-zen` installs all three (+ implicit core). `--opencode` cannot render without `=<provider>` (strict allowlist). Switch providers: re-run install. All hosts render from `.bkit/`; run state in `status.jsonl` + plan docs + tracker (never host session) — phase/resumed run moves across hosts/providers mid-feature with identical gates + per-agent pins: hit limit on one, continue on another. `bkit status` → installed hosts + active providers; `bkit doctor` → credentials + tool reachability.

**Cheap models inside an IDE — no extension needed.** A host is its dir, NOT the window its process runs in. `bkit install --claude --cursor --opencode=openrouter` + opencode in the IDE's integrated terminal = every agent pin, GateGuard and the full workflow on OpenRouter while editing in Cursor. Supported path when the Claude subscription is spent.

> **Curated-column status (COMPLETE).** All four allowlisted providers (`openrouter`, `ollama`, `opencode-zen`, `opencode-go`) ship curated per-agent model pins in `prompts.md` § Models → install ready-to-run. Both OpenAI-compatible providers + both opencode gateways curated after live catalog probe + per-model tool-calling smoke (`tools:` chat/completions round-trip emitting `tool_calls`; `/models` alone != proof). **opencode catalogs = models.dev, NOT `/zen/v1/models`** — REST endpoint returns Zen-only; cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`, …); models.dev source of truth (`opencode` = Zen, `opencode-go` = Go). `opencode-go` curated from models.dev/Go endpoint; prefer pins within Go 5h window; `opencode-zen` existence-validated via models.dev. See § Models for live-probe recipe + tier rationale.

**Additive multi-provider install:** `bkit install --opencode=<provider>` additive — second provider ADDS block to `opencode.json`, keeps first. Agent frontmatter (`model:`) re-renders to last-installed (active) provider; other blocks stay for interactive switch/overrides. Installed providers → `bkit.opencodeProviders: string[]` in `package.json`; active → `bkit.opencodeProvider`. `bkit status` lists all, marks active; `bkit doctor` checks all credentials. Remove one: `bkit uninstall --opencode=<provider>` (surgical — block + array; if active removed, re-point via `bkit install --opencode=<new>` or `bkit upgrade`). `bkit uninstall --opencode` (bare) tears down entire opencode host.

New host — row above + `PROGRAM_GATEWAYS` (`bkit-cli.ts`) + `run<Host>Module` (`bkit-modules.ts`) + manifest block (`bkit-manifest.ts`) + `.bkit/templates/<dir>/` + GateGuard case in `bkit-gateguard-parity.integration.test.ts`. New provider ALSO needs `GATEWAY_COLUMN` (`bkit-install.ts`) + a curated `prompts.md` § Models column.

---

## macOS GUI-isolation — `bkit cursor` / `bkit opencode`

**Root cause:** macOS GUI apps (Dock/Finder/Spotlight) run under `launchd` — **do not** inherit login-shell env. `direnv` exports from `.bkit/.env` stay shell-only. Token placeholders (`${BKIT_GH_TOKEN}` in `.cursor/mcp.json`, `{env:BKIT_OPENCODE_API_KEY}` in `.opencode/opencode.json`) resolve empty → MCP auth failures.

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
| `model` | required (explicit Claude model ID — see `prompts.md` § Frontmatter Conventions effort→model mapping) | required | required (provider-prefixed, e.g. `openrouter/moonshotai/kimi-k3`) | Pinned per-agent. Claude locks model. Cursor drives runner via T3. opencode: `<provider>/<model-id>` (see `prompts.md` § Models, columns `OpenRouter` / `Ollama` / …). |
| `readonly` | not supported (use `tools` allowlist) | optional boolean | not supported | Cursor: derive from `tools` (true if no `Edit`/`Write`/`Bash`). |
| `is_background` | not supported | optional boolean (Cursor 2.4+) | not supported | Default false. Reserve for future opt-in on parallelisable subagents. |
| `reasoningEffort` | not a frontmatter field (use `effort`) | not supported | `none` / `low` / `medium` / `high` / `max` | opencode-native. Set by `applyOpencodeAgent` from `effort`. |

### Body

Identical across hosts. Process steps, verdict/findings (`## Verdict` / `## Findings`), `Read:` / `Write:` paths, `> ⛔ STOP` — unchanged. No transform.

Cursor model assignment: § Models below — per-agent lookup, NOT effort-tier derived.

---

## Models

> **Effort vs model — different mechanisms.** Claude: `effort: low|medium|high|xhigh` = thinking-budget on pinned model. Cursor: explicit `model:` per agent; native-pool diversity (`cursor-grok-4.5-high` / `composer-2.5` — no API-pool defaults). **Per-agent model assignment canonical**; derive Cursor `model` from `prompts.md` § Models, NOT `effort` alone.

### Cursor model catalog

**Pinned selections canonical in `prompts.md`** (§ Models `Cursor` column + § Orchestrators) — not here. Cursor set churns; use pull recipe below.

> **Default install = first-party pool only.** Shipped Cursor pins are **`cursor-grok-4.5-high`** + **`composer-2.5`** so workflows keep running when API credits are exhausted. API-pool models (Claude / GPT / Fable) are **opt-in** via `prompts.md` § Model Overrides — never default pins. **Have API credits and want Opus back?** Paste the ready-to-use Opus override block in `prompts.md` § Model Overrides (maps every Claude-opus-tier agent → `claude-opus-5-thinking-high`; `/v0/models` has no Opus 5.5 ID). Sonnet-tier override is `claude-sonnet-5-thinking-high` (Sonnet 5, not 5.5) or `gpt-5.6-sol-high`. Then `bkit install --cursor`. Shipped sonnet cells stay on the first-party ceiling: `grok-4.5` lands 2.9 under the sonnet target at a quarter of Claude's cost per task. **No `cursor-grok-4.7`.**

Tier guidance:

- **`composer-2.5`** ($) — **default.** Fast/cheap: build executors, summarizers, ship-summary, utilities, `/build` + `/ship` orchestrators. First-party pool.
- **`cursor-grok-4.5-high`** ($$) — **default.** Depth slots, synthesizers, parallel diversity (design/plan/debug orchestrators + former Opus-tier agents). First-party pool (Cursor + SpaceXAI); Coding Agent Index parity with GPT-5.5 at lower per-task cost. `-fast` variant exists.
- **`claude-opus-5-thinking-high`** ($$$) — **override only.** Deep review / audit / synthesis when API credits remain. `/v0/models` has Opus 5, not Opus 5.5 (`claude-opus-5-5` is the Claude pin). `-fast` exists. API pool — burns credits; pin via § Model Overrides, never as shipped default.
- **`claude-sonnet-5-thinking-high`/`-xhigh`** ($$$) — **override only.** Sonnet 5 on the API pool. Not a shipped default. No Sonnet 5.5 ID.
- **`gpt-5.*`** ($$$) — **override only.** API-pool diversity hedge (`gpt-5.6-sol-high`, …). Not pinned.
- **`claude-fable-5-thinking-high`/`-xhigh`** ($$$$) — **override only.** Fable 5. Available, not adopted as default (see `prompts.md` § Effort → Claude model mapping). No Fable 5.1 ID on `/v0/models`.

Cloud Agents API: `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"` (agent-specific API key — general keys can HTTP 500 on `POST /v0/agents`). **Verify before install — Cursor models churn.** Probed 2026-10-06: first-party `cursor-grok-4.5-high` + `composer-2.5`; no Grok 4.7; no Opus 5.5 / Sonnet 5.5. Sonnet 5 thinking IDs are present and stay opt-in. Build/ship orchestrators use `composer-2.5`.

> [!NOTE]
> **Native-default Cursor pins.** Defaults are first-party only (`cursor-grok-4.5-high` / `composer-2.5`) so zero API credits still runs the harness. API-pool IDs remain in the live `/v0/models` catalog for manual override. Residual: IDE **subagent-runner** ≠ Cloud Agents API; per-subagent dispatch via `Task` not empirically smoke-tested — confirm one dispatch per model ID before full validation.
>
> **Claude opus tier pins `claude-opus-5-5`.** Sonnet tier pins `claude-sonnet-5-5`. Both are 1M context, $4/$20 and $2/$10 per MTok. Haiku stays `claude-haiku-4-5-20251001`. The parity board still scores `claude-opus-5` at **65.2** and `claude-sonnet-5` at **59.4** — 5.5 is not on that CSV. Cursor's `/v0/models` catalog lists `claude-opus-5-thinking-high` / `-fast` and `claude-sonnet-5-thinking-high` / `-xhigh`, not the 5.5 IDs. Cursor defaults stay on native models per the native-only policy above.

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

**Transform (Claude → Cursor, command files):** replace the YAML frontmatter block with its `description:` value as a plain first line (Cursor shows a command file's literal first line as its picker/hover description, and does not read frontmatter). No `description:` key → plain strip.

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

Pre-edit advisory hook, on all three hosts. First file touch per session → investigation checklist; gate-config paths (tsconfig/eslint/prettier/vitest/vale/slop/lint-staged) → "fix code, don't weaken gate" advisory; new-file writes → reuse-over-duplicate nudge; `docs/**.md` (not `docs/plans/`) → density advisory appended. **fail-open**, **subagents included**, dedup `(session, file)` via OS-temp state, 24h TTL.

<!-- prettier-ignore -->
| Host | Implementation | File | Registration |
| --- | --- | --- | --- |
| Claude Code | `gateguard.cjs` (CJS) | `.claude/hooks/gateguard.cjs` | `.claude/settings.json` → `hooks.PreToolUse` on `Edit\|Write\|MultiEdit` |
| opencode | `gateguard.js` (ESM) | `.opencode/plugin/gateguard.js` | `.opencode/opencode.json` → `plugin` array (opencode plugin spec — the key is `plugin`, singular; `plugins` is silently ignored and disables GateGuard) |
| Cursor | `gateguard.cjs` (CJS) — managed block byte-identical to the Claude twin | `.cursor/hooks/gateguard.cjs` | `.cursor/hooks.json` → `preToolUse` (matcher `Write`), no `failClosed` — an advisory hook that fails closed would block the edit it only meant to comment on |
| Cursor | `guardrails.cjs` (CJS) — destructive-op / secret-exposure gates, the Cursor equivalent of Claude's `permissions` and opencode's `permission` map | `.cursor/hooks/guardrails.cjs` | `.cursor/hooks.json` → `beforeShellExecution` + `preToolUse` (`Read\|TabRead`), both `failClosed` |

**Ownership:** both GateGuard files — and Cursor's `guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as ONE JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`.

**Modes (env):** unset → advisory _[default]_; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny first touch (checklist as reason), allow retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses gate-config advisory.

**Subagents:** not exempt on any host. A subagent edit is an edit, and dedup is per (session, file) with a subagent carrying its own session id, so it gets its own checklist. Claude's `agent_id` short-circuit and opencode's `parentID` lookup were both removed; Cursor's payload carries no subagent marker at all.

**Deny mode, per host:** Claude `permissionDecision: "deny"` with the checklist as `permissionDecisionReason`; Cursor `permission: "deny"` with the checklist as `agent_message` (`user_message` goes to the human, not the model); opencode throws — `tool.execute.before` is block-or-allow only, so the throw path is the block and stderr is the advisory channel. Same behaviour, three delivery mechanisms; asserted uniformly in `.bkit/src/bkit-gateguard-parity.integration.test.ts`.

**Divergence budget:** the Claude and Cursor managed blocks are byte-identical (test-asserted). opencode's differs only where the runtime forces it — ES module rather than CJS, tool vocabulary `write`/`edit`/`patch` rather than `Edit`/`Write`/`MultiEdit` — and every advisory string, gate-config pattern and docs-path rule is identical across all three.

---

## Permissions / auto-approve

<!-- prettier-ignore -->
| Concern | Claude | Cursor | opencode |
| --- | --- | --- | --- |
| File / secrets | `.claude/settings.json` → `permissions.{allow,deny,ask}` (`Read(./**/*.pem)` deny; `.env` variants ask; `.env.example` allow) | `.cursor/hooks/guardrails.cjs` via `preToolUse` (`Read\|TabRead`) — same deny/ask policy | `.opencode/opencode.json` → `permission.read` map |
| Shell / destructive | `permissions.deny` / `ask` on force-push (not `--force-with-lease`), `rm -rf /*`, publish, destructive git/gh, etc. Shell `curl` / `wget` are NOT gated here — `permissions` cannot match a URL host, so only the `WebFetch` TOOL is allowlisted | `.cursor/hooks/guardrails.cjs` via `beforeShellExecution` — same deny/ask policy | `permission.bash` deny/ask map (same rules) |
| Network fetch | `WebSearch` + tooling `WebFetch(domain:…)`; install/upgrade enriches from the shipped egress registry union consumer `allowed-domains` in `.agents/context.md` (stack hosts never shipped), recording what it wrote so it can later prune it | `curl`/`wget` ask unless host ∈ `.cursor/allowlist.json` (tooling ∪ consumer domains) | `websearch` allow + `webfetch: "ask"`; `curl *` ask then `curl *{domain}*` allow from same allowlist (baked into `opencode.json`) |
| Granularity | Per-tool glob | Hook script (project-scoped, failClosed) | Per-path / per-command glob in `permission` |
| Modes | `defaultMode: default \| acceptEdits \| plan \| bypassPermissions` | Implicit per-mode (Composer / Agent / Background) | `opencode --auto` + permission defaults |
| MCP server config | `.mcp.json` at repo root (`mcpServers.<name>.url`) | `.cursor/mcp.json` (same `mcpServers.<name>.url` shape) | `.opencode/opencode.json` → `mcp` |
| MCP tool approval | `permissions.allow` `mcp__<s>__*` from consumer `mcp-servers` (§ MCP servers) | Generated `.cursor/cli.json` `Mcp(<s>:*)` | `permission` `"<s>_*": "allow"` |
| Local-only (not shipped) | `.claude/settings.local.json` (`additionalDirectories`, extra allows) | Cursor project/user settings / MCP as needed | `~/.config/opencode/opencode.json` → `permission.external_directory` |

**Install behaviour:** template drops, host-specific encoding of the **same** shared policy. No single canonical JSON — three native forms kept in lockstep. Machine-local paths stay out of templates.

### Network allowlist — one source, three encodings

**Source of truth:** bkit's own hosts come from the egress registry (`.bkit/src/bkit-registry.ts`) and must never be re-declared. Stack domains come from consumer `.agents/context.md` → `<!-- allowed-domains:start -->` **after** `<!-- bkit:end -->` (apex domains). Never ship Vercel/Supabase/Sentry/etc. into every consumer.

**`bkit install` / `bkit upgrade` apply that set differently per host** — same policy, native mechanics:

<!-- prettier-ignore -->
| Host | Where the allowlist lives | Why that shape |
| --- | --- | --- |
| **Claude** | `.claude/settings.json` `WebFetch(domain:…)` allow rules; shell fetches host-checked by `.claude/hooks/guardrails.cjs` (advisory) | Claude has a first-class settings permission model. No separate allowlist file. Shell `curl` is not domain-gated at all — Claude rules match a command prefix, not a URL host, so `curl` runs under `Bash(*)` with `deny` + the auto-mode classifier as backstops. Prefer `WebFetch` for allowlisted hosts; context-fetch uses `curl` / CLI under `Bash(*)`. |
| **OpenCode** | Baked into `.opencode/opencode.json` → `permission.bash`: `curl *` / `wget *` **ask**, then `curl *{domain}*` / `wget *{domain}*` **allow** (last-match-wins) | OpenCode `webfetch` is Action-only (`ask`\|`allow`\|`deny`) — cannot store a URL map. Domain exceptions for shell fetch live in `bash`. No separate allowlist file. |
| **Cursor** | Generated `.cursor/allowlist.json` read at **runtime** by `.cursor/hooks/guardrails.cjs` | Cursor has no project settings equivalent to Claude `permissions` / OpenCode `permission` for curl host globs. Parity is a **hook** (`beforeShellExecution`): ask on `curl`/`wget` unless the command contains a host from the allowlist. The JSON is Cursor-only by design (IDE-scoped artifact under `.cursor/`, not `.bkit/`). |

**Do not hand-edit** `.cursor/allowlist.json` — regenerate via install/upgrade after changing `allowed-domains`. Missing file ⇒ the hook resolves no hosts and every host reads as unknown; there is deliberately no list embedded in the hook, because a second copy drifts from the registry silently.

**Cloud egress (separate):** the derived registry union the same `allowed-domains` feed `.claude/cloud.md` / `.cursor/cloud.md` paste instructions for dashboard network Custom allowlists — that is proxy egress, not local agent permission files. See `.agents/context.md` § Allowed domains and `.bkit/cloud.md`.

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
| Claude Code | `.mcp.json` at repo root | `bkit install --tracker=github` seeds the `github` entry |
| Cursor | `.cursor/mcp.json` | `bkit install --tracker=github` seeds this file with the same `mcpServers.github` block |

Both: `"type": "http"`, `"url": "https://api.githubcopilot.com/mcp/"`, `"headers": { "Authorization": "Bearer ${BKIT_GH_TOKEN}" }`. `${BKIT_GH_TOKEN}` at session start — must be in shell (local) or dashboard env (cloud). See `.bkit/cloud.md` § MCP issue-tracker integration for full JSON.

**Tracker switch seed-only, not rewrite.** `.mcp.json` / `.cursor/mcp.json` Tier-3 seed-or-print: bkit writes tracker-filtered content only when absent. Existing file never overwritten — tracker switch (e.g. `--tracker=linear` → `--tracker=github`) leaves old entry. Advisories: `mcp-missing-server-<name>` (file lacks needed server), `mcp-extra-server-<name>` (bkit-managed server the configured tracker does not use). Consumer-added MCP servers never flagged.

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
| Claude (Anthropic) | `curl https://api.anthropic.com/v1/models -H "x-api-key: $BKIT_ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01"` | Canonical `Claude` column source. No key in-shell → cross-check via the OpenRouter `anthropic/*` mirror. |
| Cursor | `curl https://api.cursor.com/v0/models -u "$BKIT_CURSOR_API_KEY:"` | `Cursor` column source. Catalog churns. Probed 2026-10-06: `cursor-grok-4.5-high`, `composer-2.5`, `claude-opus-5-thinking-high`, `claude-sonnet-5-thinking-high`/`-xhigh`, `gpt-5.6-*`, Fable 5. No Grok 4.7. No Opus 5.5 / Sonnet 5.5. |
| OpenRouter | `curl https://openrouter.ai/api/v1/models` | **Public — no key.** Aggregator; `vendor/model` slugs (`:free` variants exist). Filter for tool-calling + coding models before pinning. |
| Ollama | `curl https://ollama.com/v1/models -H "Authorization: Bearer $BKIT_OLLAMA_API_KEY"` | Hosted Ollama; cloud-tagged models (e.g. `qwen3.5:397b`, `kimi-k2.7-code`). |
| OpenCode Zen / Go (opencode-native gateways) | `curl https://models.dev/api.json` — read providers `.opencode` (Zen) and `.["opencode-go"]` (Go) `.models` | **models.dev is the source of truth — NOT `/zen/v1/models`.** The REST catalog `curl https://opencode.ai/zen/v1/models` returns ONLY the Zen catalog and cannot see Go-only models (`minimax-m3`, `qwen3.7-plus`/`qwen3.7-max`, …), so it MUST NOT be used to curate the Go column. Two DISTINCT providers: `opencode` (name "OpenCode Zen", api `https://opencode.ai/zen/v1`) and `opencode-go` (name "OpenCode Go", api `https://opencode.ai/zen/**go**/v1` — nested under `/zen/`). Both auth via `BKIT_OPENCODE_API_KEY`. Tool-call smoke: `POST <api>/chat/completions` with a `tools:` payload (bare model id, e.g. `minimax-m3`). |

**Model ID format:** opencode provider-prefixed frontmatter: `<provider>/<model-id>` (e.g. `openrouter/moonshotai/kimi-k3`, `ollama/kimi-k2.7-code`). Pins = `prompts.md` § Models — **one column per provider** (`OpenRouter`, `Ollama`, `OpenCode Zen`, `OpenCode Go`). Gateways: `opencode/<id>` Zen, `opencode-go/<id>` Go. CLI keys `opencode-zen` / `opencode-go`.

**Lookup mechanic (install pin resolution).** `bkit install --opencode=<provider>` → `buildOpencodeModelLookup(promptsMdPath, provider)` (`.bkit/src/bkit-install.ts`):

1. Provider key → `prompts.md` column via `OPENCODE_PROVIDER_COLUMN` (`openrouter`→`OpenRouter`, `ollama`→`Ollama`, `opencode-zen`→`OpenCode Zen`, `opencode-go`→`OpenCode Go`).
2. Parse column → seed `.opencode/agents/<name>.md` `model:` verbatim.

**opencode-zen / opencode-go — two OpenCode built-in providers.** Both emit minimal `provider.<id>` with only `options.apiKey: "{env:BKIT_OPENCODE_API_KEY}"` (no npm driver, no baseURL). OpenCode resolves from models.dev — Go Qwen/MiniMax use Anthropic `/messages`, not openai-compatible `/chat/completions`. Zen keyed `opencode`; Go `opencode-go`. `bkit install --opencode=opencode-zen` (or `=opencode-go`) → `bkit.opencodeProvider` in `package.json`; legacy `opencode` → `opencode-zen` via `OPENCODE_PROVIDER_ALIASES`. Reinstall **replaces** seeded block (heals hijacked npm/baseURL). Set `BKIT_OPENCODE_API_KEY` in `.bkit/.env` (<https://opencode.ai/auth>). Columns from **models.dev**.

**All four providers ship curated columns.** Tier design — **per-tier quality target, cheapest sufficient pin**. A tier cell is NOT "the same rung of this provider's ladder": it is the cheapest model that **reaches that tier's Claude score**, and reaching means _approaching_ — it does not have to beat it. Targets are the LiveBench Agentic Coding scores on the board below (opus `claude-opus-5` **65.2**, sonnet `claude-sonnet-5` **59.4**, haiku ~35). Claude pins are `claude-opus-5-5` / `claude-sonnet-5-5`; those IDs are not on this CSV, so the targets stay the last measured generation. Where a provider's ceiling sits under the sonnet target, opus+sonnet **collapse onto that ceiling** — spreading them across two rungs buys nothing and costs quality on the sonnet half. Where a cheap model already clears the haiku target, the haiku cell **stays cheap** — a $5/task flagship serving a read-and-emit summariser is waste, not safety.

### Selecting pins

Re-pin **one provider column at a time**. Cells: `prompts.md` § Models. Board below = scores.

**Priority — do not invert.**

1. **Claude parity** — LiveBench Agentic Coding (pin score) + AA Intelligence Index. Miss the target → not a pin.
2. **Cost** — cheapest that clears (or the ceiling). AA $/task + LiveBench $/task, rescaled to the billed provider.
3. **Speed** — remaining ties: AA tok/s, TTFT, think→answer, E2E 500-token.

Filters (not above score): endpoint count; automatic prompt caching (bkit sends no `cache_control`). **Never pin Claude** on OpenRouter / Ollama / OpenCode. Convergent = distinct CoT family, not a fourth rung.

**Steps.**

1. Read `prompts.md` § Models + lineup below.
2. Pull every source; stamp the date. LiveBench `table_<date>.csv` name ≠ freshness.
3. Slug live? § Per-provider live model lookup. OpenRouter: also `GET /api/v1/models/{slug}/endpoints`.
4. Shortlist 1–2 / tier. Reject single-endpoint + `cache_control` hosts (Anthropic, Alibaba) unless no alternative.
5. Apply: `prompts.md` § Models + this board + `.bkit/src/bkit-install.test.ts` OpenRouter tests + `bkit install`. Stamp `prompts.md` § Live model-ID verification.

**Sources — check all.**

<!-- prettier-ignore -->
| Pri | Source | Decides | URL |
| --- | --- | --- | --- |
| 1 | LiveBench Agentic Coding | Pin score (JS / TS / PY mean) | https://livebench.ai/#/?cats=Agentic+Coding — CSV `https://raw.githubusercontent.com/LiveBench/new-livebench/main/public/table_2026_06_25.csv` |
| 1 | AA Intelligence Index | General intelligence | https://artificialanalysis.ai/leaderboards/models |
| 1 | DeepSWE | Long-horizon repo work — public board only | public DeepSWE listings |
| 1 | LMArena Code Arena — WebDev | Web-dev preference | https://lmarena.ai (Code / WebDev) |
| 1 | Design Arena — Code | Web-app preference | https://designarena.ai/leaderboard/code |
| 2–3 | AA cost / latency | $/task, tok/s, TTFT, E2E | same AA leaderboard |
| 2 | LiveBench cost table | Agentic $/task — rescale to billed provider | `cost_2026_06_25.csv` beside the LiveBench table |
| 2 | OpenRouter model page | List in/out + cache-read | https://openrouter.ai/models/{slug} |
| filter | OpenRouter endpoints | Host count; 1 = reject | `GET /api/v1/models/{slug}/endpoints` |
| filter | OpenRouter prompt-caching doc | Auto vs `cache_control`; ignore `supports_implicit_caching` | https://openrouter.ai/docs/features/prompt-caching |
| filter | Provider catalogs | Existence / context / plan gates | § Per-provider live model lookup |

**Do not pin from:** OpenRouter volume; BenchGecko; vendor-only Terminal-Bench / SWE; launch blogs.

### Agentic-coding parity board

Source: [LiveBench](https://livebench.ai/#/?cats=Agentic+Coding), release **2026-06-25** (`table_2026_06_25.csv` / `cost_2026_06_25.csv`, `LiveBench/new-livebench`). **Score** = mean of the category's three tasks (`javascript`, `typescript`, `python`), per `public/categories_<date>.json`. **$/task** = category dollars ÷ 72 questions, from LiveBench's own cost table. Process + sources: § Selecting pins. Artificial Analysis stays the source for price/latency and general capability; agentic-coding score decides a **pin**, because that is the workload every bkit agent runs.

**Re-probe on a schedule, never on a release stamp.** LiveBench appends newly released models to the **existing** `table_<date>.csv` — `RELEASES` in its `src/lib/constants.js` stays put while the file's contents move. The cited date is not a freshness signal, and a column can go stale with nothing here looking stale.

**$/task must be rescaled to the provider actually billed.** LiveBench's cost table assumes direct-vendor pricing; an OpenRouter pin is billed at OpenRouter's `pricing.prompt` / `pricing.completion`. The two diverge (LiveBench assumes `$3/$15` per Mtok for `claude-sonnet-5`; OpenRouter charges `$2/$10`). Solve LiveBench's dollar figure for implied input tokens, then re-price.

**Sub-scores are too coarse to pin on; use them to sanity-check, not to decide.** Question counts are JS 22 / TS 30 / PY 20, so one TypeScript question moves that sub-score 3.33 points (SE ≈ 9). TypeScript is the hardest of the three and every model scores below its own mean there — the Claude ladder is **not monotonic on TypeScript** (`claude-sonnet-5` 50.0 sits above `claude-opus-5` 43.3). Read the mean as the pin criterion; do not read it as a ranking of ability in any one language.

**Score is necessary, not sufficient — operational shape decides ties.** Two properties carry real weight once scores are within noise: **endpoint count** (`/api/v1/models/<slug>/endpoints`) and **whether prompt caching applies without client configuration**. A single-endpoint model cannot be routed around a slow or down host and inherits that one provider's rate limits — disqualifying for a column whose whole job is to absorb work when the Claude quota is spent. Caching is the dominant latency and cost term for bkit workloads: without it every turn of a long agentic loop re-prefills the whole growing transcript.

**Read caching from the provider docs, NOT from `supports_implicit_caching`.** That endpoint field is unreliable — it reports `false` on all 14 `kimi-k3` endpoints while OpenRouter's own [prompt-caching doc](https://openrouter.ai/docs/features/prompt-caching) states Moonshot caching is automated. The doc's per-provider sections are authoritative. Current contracts: **Moonshot, DeepSeek, Z.AI, Gemini 2.5+ cache automatically, no configuration**; **Anthropic, Alibaba Qwen require explicit `cache_control` breakpoints**, which bkit does not send — so an Alibaba-hosted pin gets no caching at all. Cache reads run ~0.03x-0.20x of input price; writes are free except on DeepSeek (charged at input price).

**Cache hits need the same endpoint twice — OpenRouter handles this with sticky routing.** After a cached request it pins the conversation to that provider, keyed by `session_id` / `prompt_cache_key` when sent, otherwise by hashing the first system message plus the first non-system message. Sticky sessions expire after **10 minutes of inactivity**, and sticky routing is disabled entirely when `provider.order` is set — do not pin a provider order on a cached model.

<!-- prettier-ignore -->
| Model | Score | $/task | Role in bkit |
| --- | --- | --- | --- |
| `deepseek-v4.1-flash` | **77.3** | $0.06 | `openrouter` opus+sonnet — 16+ endpoints, auto cache; clears 65.2 |
| `claude-opus-5` (max) | **65.2** | $5.34 | **opus target** |
| `deepseek-v4-flash-vision-exp` | 65.1 | $0.11 | **not pinned** — experimental; its own datasheet claims text parity with `deepseek-v4-flash-0731`, which measures 46.8. Score not trusted |
| `qwen3.8-max` | 64.6 | $1.75 | **not pinned** — single endpoint (Alibaba) and **no caching available**: Alibaba requires explicit breakpoints and this slug is absent from its supported list |
| `kimi-k3` | 62.2 | $1.76 | `openrouter` convergent — 17 endpoints, auto cache (reads 0.10x, writes free) |
| `claude-fable-5` (max) | 62.2 | $8.86 | not adopted — below Opus 5 at 1.7x the cost |
| `qwen3.8-27b` | 61.4 | $1.52 | **not pinned** — 3.57M input tokens/task; `$0.95` on LiveBench's assumed price, `$1.52` at OpenRouter's |
| `glm-5.3` | 60.9 | $1.60 | **not pinned** — 27 endpoints, auto cache; dominated by V4.1 Flash |
| `claude-sonnet-5` (xhigh) | **59.4** | $2.14 | **sonnet target** |
| `gemini-3.7-flash` | 58.3 | $0.42 | **not pinned** — under V4.1 Flash |
| `grok-4.6` | 57.0 | $1.79 | **not pinned** — under V4.1 Flash, higher cost |
| `glm-5.3-flash` | 56.8 | $0.11 | `openrouter` haiku — 27 endpoints, auto cache; cheapest sufficient |
| `grok-4.5` | 56.5 | $0.54 | `cursor` opus (ceiling; −2.9 vs sonnet target at a quarter the cost) |
| `deepseek-v4-pro-0813` | 54.9 | $0.22 | **not pinned** — dominated by V4.1 Flash |
| `claude-opus-4-8` (max) | 50.5 | $4.96 | superseded — shows the 4.8 → 5 generational jump (+14.7) |
| `kimi-k2.7-code` | 45.7 | $0.39 | `ollama`-cloud + `opencode-zen` opus+sonnet |
| `qwen3.7-max` | 43.6 | $0.80 | not pinned (anchor for the unmeasured `qwen3.7-plus`) |
| `deepseek-v4-pro` | 42.6 | $0.14 | convergent on `ollama` / both gateways; `opencode-go` opus+sonnet. **Frozen on the 0423 snapshot** — the undated slug does not float |
| `qwen3.6-plus` | 41.4 | $1.55 | **dropped** — strictly dominated by `kimi-k2.7-code` (lower score, 4x cost) |
| `minimax-m3` | 40.7 | $0.42 | **dropped** — `deepseek-v4-pro` scores higher at a third the cost |
| `deepseek-v4-flash` | 37.6 | **$0.03** | haiku on both opencode gateways — clears the haiku target at 1/180th of Opus 5 |
| `claude-haiku-4-5` (thinking) | **~35 †** | — | **haiku target** |
| `gpt-oss-120b` | ~10 † | — | **dropped everywhere** — below every target, haiku included |

† **Estimated, not measured.** Model absent from the 2026-06-25 release; value bridged from its 2026-01-08 score via the mean delta of the three nearest-scoring models present in both releases. Cross-release scores are NOT comparable directly (LiveBench rotates questions — overlapping models moved −1.4 to −31.5), so treat † as a bracket, not a number. **Unmeasured entirely** (no anchor in either release, do not infer): `composer-2.5`, `qwen3.5-397b`, `qwen3-coder`, `qwen3.7-plus`, `glm-4.5-air`, `gpt-oss-20b`, `qwen3-coder:30b`.

### Per-tier lineup across providers

Cells show pin · score · $/task. Deltas are against that column's target. Convergent (CoT lens for risk/diagnosis agents) rides the same board.

<!-- prettier-ignore -->
| Provider | opus — target 65.2 | sonnet — target 59.4 | haiku — target ~35 | convergent | Notes |
| --- | --- | --- | --- | --- | --- |
| `claude` | `claude-opus-5-5` **n/m** | `claude-sonnet-5-5` **n/m** | `claude-haiku-4-5` ~35 † | (opus) | Pins are 5.5 ($4/$20 opus, $2/$10 sonnet, 1M context). Scores on this board are the previous generation: `claude-opus-5` **65.2** · $5.34, `claude-sonnet-5` **59.4** · $2.14. Targets stay those scores until 5.5 is measured. |
| `openrouter` | `deepseek/deepseek-v4.1-flash` 77.3 · $0.06 (+12.1) | same (+17.9) | `z-ai/glm-5.3-flash` 56.8 · $0.11 | `moonshotai/kimi-k3` 62.2 · $1.76 | Aggregator; broad catalog to re-pin from. Opus+sonnet collapse on V4.1 Flash (clears 65.2). Haiku = GLM-5.3 Flash (cheapest sufficient). Convergent = Kimi K3 (distinct CoT). All three auto-cache. Never pin `anthropic/*` — column carries Claude-quota overflow. |
| `cursor` | `cursor-grok-4.5-high` 56.5 · $0.54 (−8.7) | `composer-2.5` **n/m** | `composer-2.5` **n/m** | (opus) | Ceiling is grok-4.5 — no Cursor model reaches the opus target, which is the correct outcome, not a gap. `composer-2.5` is the one unresolved cell in the matrix: vendor-claimed ≈ Opus 4.7 (which measures 50.7), never on LiveBench. Probe or override before relying on it for sonnet-tier work. |
| `ollama` (cloud) | `kimi-k2.7-code` 45.7 · $0.39 (−19.5) | `kimi-k2.7-code` (−13.7) | `deepseek-v4-pro` 42.6 · $0.14 | `deepseek-v4-pro` | **Whole column now needs a paid Ollama plan.** The free `qwen3.5:397b` / `gpt-oss:20b` pins it replaced were unmeasured or ~10 — free-tier users re-pin in `prompts.md` § Model Overrides and accept unverified quality. |
| `opencode-zen` | `opencode/kimi-k2.7-code` 45.7 · $0.39 (−19.5) | `opencode/kimi-k2.7-code` (−13.7) | `opencode/deepseek-v4-flash` 37.6 · **$0.03** | `opencode/deepseek-v4-pro` | Best value in the matrix: the haiku cell clears its target at 1/180th of Opus 5. Existence-validated via models.dev. |
| `opencode-go` | `opencode-go/deepseek-v4-pro` 42.6 · $0.14 (−22.6) | same (−16.8) | `opencode-go/deepseek-v4-flash` 37.6 · $0.03 | `opencode-go/deepseek-v4-pro` | Budget open-weight plan. `minimax-m3`/`qwen3.7-plus` dropped on the board. Prefer pins inside the Go 5h window. |

**n/m** = not measured on LiveBench (see the unmeasured list above) — the cell is a catalog/constraint choice, not a scored one.

**Hard-constraint escape hatch.** "Cheapest that reaches the target" is bounded by constraints that are not about quality: paid-plan gating (`ollama`), rate/quota/context walls when ~45 agents collapse onto one flagship. Deviate for those, and say so in the Notes cell — a constrained pin must never read as a tier judgement.

Cloud OpenAI-compatible cells tool-call-smoked (`tools:` round-trip `tool_calls`) — `/models` != proof (validate-with-real-tool). `opencode-zen` existence-validated via models.dev (Zen balance zero; smoke on Go endpoint). Re-pin: edit agent `model:`, add `prompts.md` § Model Overrides row, or change column + `bkit check`. Probe live catalog first (models.dev opencode; `/v1/models` table rest).

**Consumer model overrides (upgrade-safe):** `.bkit/prompts.md` marker-managed (`rules.md` pattern) — bkit refreshes `bkit:start`/`bkit:end` on upgrade; `## Model Overrides` below `bkit:end` consumer-owned. Pin different model per agent×host/provider:

```
| Prompt | Provider | Model |
| --- | --- | --- |
| bkit-build-summary | openrouter | openrouter/deepseek/deepseek-v4-pro |
```

`Provider` = host/install key (`cursor`, `openrouter`, `ollama`, …). Install merges overrides over defaults (override wins). Claude reads frontmatter; not overridable via table yet.

**Cursor API-credit restore:** when you have third-party / additional API credits and want Claude Opus on Cursor workflows, use the paste block in `prompts.md` § Model Overrides (Claude-opus-tier → `claude-opus-5-thinking-high`) — that is the only way to close the −8.7 opus gap on Cursor. Sonnet-tier agents stay on shipped Composer/Grok (correct under per-tier targeting, not a shortfall) unless you opt into `gpt-5.6-sol-high`. Orchestrators `/design` `/plan` `/debug` = session model (set at launch), not the override table.

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
| opencode | Concurrent `Task` dispatch (spike-proven: 3 distinct subagents run concurrently, wall-clock < serial sum). Real parallelism only when the backend serves requests concurrently — true for every provider (openrouter, ollama, opencode-zen, opencode-go). The workflow text is unchanged — concurrency is bounded at the Ollama server, not in the command files. |

**Implication:** parallel fan-outs (triplets `bkit-design-brainstorm-ideate-1`/`-2`/`-3`, `bkit-plan-review-1`/`-2`/`-3`; pairs `bkit-design-review-*`, `bkit-plan-scope-check-*`, `bkit-build-challenge-*`, `bkit-ship-update-docs`/`-summary`) — Claude: concurrent `Agent` in one turn; Cursor: opt-in `is_background: true` (default off; host config can flip at install); opencode: concurrent `Task` — real on every provider.

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
