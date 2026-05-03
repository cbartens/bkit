<!-- bkit:start -->

# Agent Rules

> [!CAUTION]
> **Purpose:** Cross-IDE rules — action-blocking destruction guards and cross-cutting agent behaviour.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Universal rules only inside the bkit block. Project-specific overrides go in `## Project` below the block.

## Universal Rules

### Principles

- **Completeness over shortcuts:** AI makes thoroughness cheap. No deferred tests, no 90% solutions. In-scope = complete or skip; out-of-scope → `docs/pending.md`. NEVER silent shortcuts.
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

- **Plans:** Follow `docs/plans/template.md`.
- **Gates:** STOP at every gate. Verify all steps BEFORE proceeding.
- **Process:** `plans/drafts/` design/plan → `active/` build/debug → `completed/YYYYMM/` post-ship archive (immutable).

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
- **CI:** NEVER manually trigger; pushes auto-trigger.
- **PRs:** ALWAYS target default integration branch (`dev`).
- **Production merge:** ANY merge into default production branch (`main`) requires PR with EXPLICIT human approval.

### Testing & Debugging

> Tier rules / framework boundaries / file inventory: `docs/testing.md`. Logs / tracing: `docs/observability.md`. Debugging gotchas: `docs/knowledge.md`.

- **Pre-PR:** lint, typecheck, format:check, and unit only (`pnpm turbo lint typecheck format:check test`).
- **Integration and E2E:** Debug workflow only (post-PR).
- **Reproduce first:** NEVER fix what you cannot reproduce. Add failing tests BEFORE touching code.
- **Check gotaches first:** Search `docs/knowledge.md` BEFORE touching code.
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
