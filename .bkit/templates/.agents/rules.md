<!-- bkit:start -->

# Agent Rules

> [!CAUTION]
> **Purpose:** Cross-IDE rules — action-blocking destruction guards and cross-cutting agent behaviour.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Local project rules/overrides → `Project Rules` below the bkit-managed block; universal rules stay in-block.

## Universal Rules

### Principles

- **Completeness over shortcuts:** AI makes thoroughness cheap. NEVER defer tests, apply 90% solutions / silent shortcuts. In-scope = complete or skip.
- **End-state over diff-size:** AI makes changes cheap. NEVER pick solutions based on lower cost-of-change; ALWAYS pick the solution with best quality-of-end-state.
- **Improve over duplicate:** ALWAYS search for existing solutions and extend/modify them if feasible. NEVER add new parallel solutions where existing ones can be evolved.
- **Scope discipline:** ONLY do what requests ask. NEVER apply opportunistic refactors, renames, or 'while I'm here' edits. Out-of-scope finds → propose separately, do NOT bundle.
- **No speculative scope:** ONLY build for requirements at hand (YAGNI). NEVER add config, flags, abstraction layers, or items 'for the future' nobody requested.
- **Investigate before implementing:** Search `{framework / runtime} {capability} built-in`, `{problem} best practice 2026`. Prefer official docs / discovered code over custom.
- **Investigation layers:** Tried-and-true → challenge; new-and-popular → scrutinize hype; first-principles = most valuable.
- **Recommend, do NOT decide:** Agents propose, humans approve. Two-model agreement = strong signal, NOT mandate. NEVER skip human gates (design / plan HARD STOP, production merge). Steps inside `/bkit-*` workflows are PRE-APPROVED by human; do NOT request confirmation.
- **Truth over agreement:** NEVER validate flawed premises to please. Surface errors and disagree with evidence; human approval is a gate, not a goal.
- **Honest reporting:** NEVER assume or report done / passing / fixed without running actual checks; state failures, skips, and uncertainty verbatim.
- **Major changes:** ALWAYS require human confirmation (global, architecture, technology, process, layout, UX). Steps forcing calls inside `/bkit-*` workflows: Decide, append rows to `docs/decisions.jsonl`, and surface in output; NEVER decide silently.

### Output & Editing

- **Output:** Token-efficient dense phrasing. No filler / hedging / restating. Tables > prose, bullets > paragraphs.
- **Read before edits:** ALWAYS read files before edits. NEVER edit on assumed contents.
- **Verify before edits:** ALWAYS check what changes could break (callers / importers, DB schemas, APIs / SDKs) before touching symbols / signatures / contracts. NEVER assume blast radius.
- **No invented symbols:** ALWAYS confirm APIs / SDKs / flags / configs / imports exist as written before using (grep code, read docs, check live endpoints). NEVER assume or invent.
- **File edits:** Fastest tool wins — edit for surgical changes, write for new files, append where possible.
- **Imports:** No barrel files / `index.ts` exports.
- **Comments & dead code:** Comments explain why, not what. NEVER narrate diff, leave placeholders/commented-out code, or dead stubs. Match surrounding comment density.
- **Tmp files:** Use repo root `tmp/`. NEVER system `/tmp/` or `/private/tmp`.
- **Blockers:** NEVER fail silently. Document in logs/files/responses.
- **Deferred work:** NEVER silently drop deferred work, ALWAYS append rows to `docs/deferrals.jsonl` in `.bkit/jsonl.md` format; check existing entries first.
- **Discovered bugs:** NEVER silently drop discovered bugs, ALWAYS append rows to `docs/failures.jsonl` in `.bkit/jsonl.md` format; check existing entries first.

### Skills & Docs

- **Skills:** Full list `.agents/skills.md`. Load only relevant, invoke via `skill` tool.
- **Docs:** Index `.agents/docs.md`. Lazy-load by phase matrix; pull extras from catalog as warranted.
- **Authoring:** ALWAYS follow docs `Rules` headers. Describe current state / rules, NOT reasons / history; state what to do; NOT why. ONLY exceptions: Docs where purpose IS the record.

### Orchestrators & Agents

- **Workflows/commands:** Invoke subagents via `Agent` tool and `@name`; skills via `skill` tool and `/name`. No NL auto-delegation/inlining.
- **Orchestrators:** Inlining subagent steps or producing output directly (same artifact) is NOT compliance.
- **Subagents:** Leaves only, NEVER invoke other subagents.

### Plans & Process

- **Plans:** Follow `docs/plans/template.md`. Canonical path `docs/plans/{YYYYMM}/{FID}-{plan,design}.md`; state in `logs/{FID}/status.jsonl`.
- **Workflow gates:** ALWAYS verify EVERY gate item before proceeding; skipped gates = invalid work. Gates inside `/bkit-*` workflows are self-verification, NOT human gates; STOP only for explicit HARD STOPs.
- **Tracker MCP:** Issue update via configured MCP only; use CLI/HTTP shell-outs as backup only.
- **Tracker comments:** NEVER mention @claude or @cursor in comment body.

### Git, CI & Merges

> Full CI/CD matrix: `docs/deployments.md`.

- **Commits:** ALWAYS commit early and often; NO human confirmation required. ONLY stage files touched by you; NEVER blanket-stage unrelated tree state. ONLY use `git add -A` in dedicated worktrees, where the whole tree IS the task.
- **Commit format:** `{type}({FID}): {message}`.
- **Pushes:** NEVER push unprompted; ALWAYS requires specific human request OR `/bkit-*` workflow steps mandating push. Pushes mandated inside `/bkit-*` workflows are PRE-APPROVED by human; do NOT request confirmation.
- **Code commits:** Ensure code commit is HEAD so CI runs.
- **Docs-only commits:** Append `bkit [skip ci]` but ONLY on commits carrying no code; NEVER on commits carrying code.
- **Secrets:** NEVER stage `.env*`, credentials, tokens, API keys. `git status` review before every commit.
- **Branches:** `feat/{FID}` preferred; agent branches MUST contain plan `{FID}` or `{ISSUE_ID}` in kebab case.
- **Pre-push:** `--no-verify` PROHIBITED. Fix failures locally. If unfixable → document and STOP.
- **Force push:** PROHIBITED on shared branches (`dev` / `main`). Personal branches only with `--force-with-lease`.
- **CI:** Pushes auto-trigger; NEVER manually. ANY push carrying code MUST have HEAD without `[skip ci]` so CI runs; batch doc commits into pushes OR add bare trigger commits. NEVER leave `[skip ci]` at HEAD of any PR pushes that require CI runs. See `docs/deployments.md` for enforcement contract and full tag taxonomy.
- **CI edits:** ANY changes to `.github/workflows/*`, ALWAYS require human confirmation; NEVER edit unprompted.
- **PRs:** ALWAYS target default integration branch (`dev`).
- **Production merge:** ANY merge into default production branch (`main`) requires PR with EXPLICIT human approval.
- **Integration merge:** ANY feature PR squash-merge into default integration branch (`dev`) from inside `/bkit-*` workflows are PRE-APPROVED by human; do NOT request confirmation.

### Testing & Debugging

> Tier rules / framework boundaries / file inventory: `docs/testing.md`. Logs / tracing: `docs/observability.md`. Debugging gotchas: `docs/knowledge.jsonl`.

- **Local (pre-push / husky):** lint, typecheck, format:check, `pnpm test` (unit and in-process integration), prose, slop:delta, `bkit check`. NO tests requiring deployed boundary / backing service.
- **CI on PR (to `dev` / `main`):** static, unit, integration (incl. service / DB-backed), E2E, migration replay — one affected-gated parallel lane per tier plus `bkit-tests-check` capstone. NO `@live` tests.
- **CI on push (to `dev` / `main`):** PR lanes plus `@live` canary tests against deployed URL.
- **Debug (on demand):** Re-runs failing E2E / `@live` tier tests against deployed boundary. NEVER purely local runs.
- **Reproduce first:** NEVER fix reported failures you cannot reproduce; ALWAYS add failing tests before touching code. Scope = failure remediation.
- **Check gotchas first:** Search `docs/knowledge.jsonl` BEFORE touching code.
- **Agent shell env:** IDE agent Shell does not auto-load direnv, repo `.env` vars look unset. Prefix one-off commands with `direnv exec . …`.
- **Secrets from direnv:** ALWAYS check direnv first `direnv exec . printenv {VAR}` before asking for secrets / tokens / env vars. ONLY ask when genuinely absent.
- **No downgrades:** NEVER fix by downgrade. STOP if stuck.
- **Fix code, never gate:** NEVER make gates (lint / format / types / test / slop) pass by weakening them; do NOT use `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `eslint-disable`, `.skip`, `xfail`, deleted assertions, error-swallowing, empty catches, or mocking-away units under test. ALWAYS fix root causes; if config changes genuinely warranted ONLY use targeted per-file / per-rule opt-outs after explicit human confirmation. Confirmation unavailable inside `/bkit-*` workflows: Append `BLOCKED` rows to `docs/deferrals.jsonl`, and continue; NEVER self-authorize the opt-out.
- **Slop gate:** ONLY fix net-new `slop:delta` findings, NEVER the baseline. NEVER delete /move / merge files or rewire callers to clear structural findings.

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

> `Project Rules` below `bkit:end` is consumer-owned — `bkit install` never overwrites it, `bkit check` drift stays clean. Add project-specific rules/overrides there.

<!-- bkit:end -->

## Project Rules
