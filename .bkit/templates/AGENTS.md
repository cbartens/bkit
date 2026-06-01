# AGENTS.md

<!-- bkit:start -->

> [!CAUTION]
> Canonical cross-IDE agent file: **workflow router + universal rules**. Edit this
> file only inside the `.bkit/` source of truth — never the generated mirrors.

## Workflow Routing

> [!CAUTION]
> This section is a **workflow router only**. It does NOT execute workflows.

### Step 1 — Extract from prompt XML (NOT MCP)

**If** prompt contains `<LINEAR_ISSUE>` XML block (Linear integration):

- `ISSUE_ID` ← `<id>` tag value (e.g. `LIN-123` or team-specific prefix)
- `DESCRIPTION` ← `<description>` tag content
- `LABELS` ← all `<label name="...">` values in `<labels>` block
- `COMMENTS` ← all `<comment>` entries from `<comment_thread>` + `<other_comment_threads>`, sorted newest-first by `created` attribute

**Else** scan entire prompt for issue ID — try patterns in order, first match wins:

1. `#\d+` → GitHub issue number (e.g. `#123`); strip `#`, set `ISSUE_ID` = `123`
2. `[A-Z]+-\d+` → prefixed issue ID (e.g. `LIN-123`, `ISSUE-123`, or team-specific prefix)
3. bare `\d+` → numeric fallback (GitHub provider only; ambiguous — prefer `#\d+`)

Set `LABELS`, `DESCRIPTION`, `COMMENTS` = empty.

**If** no `ISSUE_ID` → **STOP** with `No issue ID provided.`

### Step 2 — Route from user message

In the bottom-most `USER:` entry in `# Message history` scan for commands (case-insensitive: Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Steps 3–4.

### Step 3 — Route from XML labels

Scan `LABELS` for commands (Ship, Debug, Build, Plan, Design) → first match → `COMMAND`. **If** matched → skip Step 4.

### Step 4 — MCP fallback (labels only)

Only if Steps 2–3 yield no `COMMAND`: read current issue labels via the configured tracker MCP (GitHub: `mcp__github__issue_read({ method: "get_labels", ... })`; Linear: `mcp__linear__get_issue({ id: "{ISSUE_ID}" })`) → scan returned labels → first match → `COMMAND`. Update `LABELS`, `DESCRIPTION`.

### Step 5 — No match

Emit: `Workflow not found for issue {ISSUE_ID}. Valid commands: Design / Plan / Build / Debug / Ship.` → **STOP**. (Do not post a tracker comment — the router does not know which tracker MCP to call at this point.)

### Step 6 — Execute command

Read and execute the matched command file for the current IDE.

**Cursor** (`.cursor/commands/`):

<!-- prettier-ignore -->
| Label | Command |
| --- | --- |
| `Ship` | `.cursor/commands/bkit-ship.md` |
| `Debug` | `.cursor/commands/bkit-debug.md` |
| `Build` | `.cursor/commands/bkit-build.md` |
| `Plan` | `.cursor/commands/bkit-plan.md` |
| `Design` | `.cursor/commands/bkit-design.md` |

**Claude Code** (`.claude/commands/`):

<!-- prettier-ignore -->
| Label | Command |
| --- | --- |
| `Ship` | `.claude/commands/bkit-ship.md` |
| `Debug` | `.claude/commands/bkit-debug.md` |
| `Build` | `.claude/commands/bkit-build.md` |
| `Plan` | `.claude/commands/bkit-plan.md` |
| `Design` | `.claude/commands/bkit-design.md` |

## Agent Rules

> [!CAUTION]
> **Purpose:** Cross-IDE rules — action-blocking destruction guards and cross-cutting agent behaviour.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Universal rules only inside the bkit block. Project-specific overrides go in `## Project Rules` below the block.

### Principles

- **Completeness over shortcuts:** AI makes thoroughness cheap. NEVER defer tests, apply 90% solutions / silent shortcuts. In-scope = complete or skip.
- **End-state over diff-size:** AI makes changes cheap. NEVER pick solutions based on lower cost-of-change; ALWAYS pick the solution with best quality-of-end-state.
- **Investigate before implementing:** Search `{framework/runtime} {capability} built-in`, `{problem} best practice 2026`. Prefer official docs / discovered code over custom.
- **Investigation layers:** Tried-and-true → challenge; new-and-popular → scrutinize hype; first-principles = most valuable.
- **Recommend, do NOT decide:** Agents propose, humans approve. Two-model agreement = strong signal, not mandate. NEVER skip human gates.
- **Major changes:** ALWAYS require human confirmation — global, architecture, technology, process, layout, UX.

### Output & Editing

- **Output:** Token-efficient dense phrasing. No filler/hedging/restating. Tables > prose, bullets > paragraphs.
- **Read before edit:** ALWAYS read a file before editing. NEVER edit on assumed contents.
- **File edits:** Fastest tool wins — edit for surgical changes, write for new files, append where possible.
- **Imports:** No barrel files / `index.ts` exports.
- **Tmp files:** Use repo root `tmp/`. NEVER system `/tmp/` or `/private/tmp`.
- **Blockers:** NEVER fail silently. Document in logs/files/responses.

### Skills & Docs

- **Skills:** Full list `.agents/skills.md`. Load only relevant, invoke via `skill` tool.
- **Docs:** Index `.agents/docs.md`. Lazy-load by phase matrix; pull extras from catalog as warranted.

### Orchestrators & Agents

- **Workflows/commands:** Invoke subagents via tool and `/name`. No NL auto-delegation/inlining.
- **Orchestrators:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
- **Subagents:** Leaves only, NEVER invoke other subagents.

### Plans & Process

- **Plans:** Follow `docs/plans/template.md`. Canonical path `docs/plans/{YYYYMM}/{FID}-{plan,design}.md`; state in `logs/{FID}/status.json`.
- **Gates:** STOP at every gate. Verify all steps BEFORE proceeding.
- **Tracker MCP:** Issue update via configured MCP only; NO CLI/HTTP shell-outs.
- **Tracker comments:** NEVER mention @claude or @cursor in comment body.

### Git, CI & Merges

> Full CI/CD matrix: `docs/deployments.md`.

- **Commits/pushes:** NEVER commit/push unprompted; requires specific request.
- **Commits:** `{type}({FID}): {message}` format.
- **Code commits:** Ensure code commit is HEAD so CI runs.
- **Docs-only commits:** Append `[skip build] [skip ci]`. Do NOT push alone — batch with next code push.
- **Secrets:** NEVER stage `.env*`, credentials, tokens, API keys. `git status` review before every commit.
- **Branches:** `feat/{FID}` preferred; agent branches MUST contain plan `{FID}` or `{ISSUE_ID}` in kebab case.
- **Pre-push:** `--no-verify` PROHIBITED. Fix failures locally. If unfixable → document and STOP.
- **Force push:** PROHIBITED on shared branches (`dev`/`main`). Personal branches only with `--force-with-lease`.
- **CI:** Pushes auto-trigger; NEVER manually. Final push to PR / `dev` → HEAD commit should NEVER contain `[skip ci]`. See `docs/deployments.md` for enforcement contract and full tag taxonomy.
- **CI edits:** ANY changes to `.github/workflows/*`, ALWAYS require human confirmation; NEVER edit unprompted.
- **PRs:** ALWAYS target default integration branch (`dev`).
- **Production merge:** ANY merge into default production branch (`main`) requires PR with EXPLICIT human approval.

### Testing & Debugging

> Tier rules / framework boundaries / file inventory: `docs/testing.md`. Logs / tracing: `docs/observability.md`. Debugging gotchas: `docs/knowledge.md`.

- **Pre-PR:** lint, typecheck, format:check, and unit only (`pnpm turbo lint typecheck format:check test`).
- **Integration and E2E:** Debug workflow only (post-PR).
- **Reproduce first:** NEVER fix what you cannot reproduce. Add failing tests BEFORE touching code.
- **Check gotchas first:** Search `docs/knowledge.md` BEFORE touching code.
- **No downgrades:** NEVER fix by downgrade. STOP if stuck.

### Security & Data

> Mechanics: `docs/security.md` (auth, RLS, validation, secrets, PII). Schema: `docs/data-schema.md`.

- **RLS:** Strict deny-by-default. NEVER leak tenancy-scope columns.
- **DB:** NEVER manually `db push` remote. Prefer soft delete (`deleted_at`).
- **PII:** NEVER log raw PII.

### Naming Conventions

- **Server actions/SDK:** `{crud}{TableName}{FieldName}` camel case.
- **Inngest events:** `{domain}/{event-name}` slash-separated lowercase kebab case.
- **Migrations:** `YYYYMMDDHHMMSS_{description}.sql` lowercase snake case.
- **Tests:** `*.test.ts` Vitest unit, `*.integration.test.ts` Vitest integration, `*.spec.ts` Playwright E2E.
- **Logs:** `console.error("[{Context}] {Message}", {payload})` — `[]` around `{Context}` = load-bearing for log-drain regex.

## Project Rules

<!-- bkit:end -->
