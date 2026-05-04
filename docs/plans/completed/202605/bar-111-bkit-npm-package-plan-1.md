# ⚠️ SUPERSEDED — see [`bar-111-bkit-npm-package-plan.md`](./bar-111-bkit-npm-package-plan.md)

> [!CAUTION]
> **This sub-plan is no longer the active runbook.** It has been folded (in trimmed form) into `bar-111-bkit-npm-package-plan.md`, which drops the vitest test matrix, eslint, tsup, turbo, and other gether-life-inherited scaffolding. Kept here for reference / audit only — do NOT execute as a runbook.
>
> Internal links below still reference `plan-v3-checked.md` / `plan-v4-*.md` filenames that do not exist on disk (workflow bug logged in `.agents/friction.md`). They have not been rewritten because this file is no longer load-bearing.

---

# bkit npm Package Extraction — Sub-plan A: Producer (BAR-111)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)
**Source plan:** [plan-v3-checked.md](./plan-v3-checked.md) (Phases 0–6)
**Sibling sub-plans:** [plan-v4-2.md](./plan-v4-2.md) (consumer), [plan-v4-3.md](./plan-v4-3.md) (smoke + upgrade)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Always read this file natively before executing steps. Source of truth is the literal `[x]` vs `[ ]` checkboxes here, not session memory.

## Context & Goals

Phase B of agent-stack consolidation (Phase A = BAR-110, in-repo migration + install script — assumed landed). This sub-plan covers the **producer side**: scaffold the new `bkit` repo at `~/Documents/GitHub/bkit` (https://github.com/cbartens/bkit), extract the canonical `.agents/` payload from `app-gether-life`, implement host transforms (Claude passthrough + Cursor T1/T2/T3), implement four CLI verbs (`init`, `install`, `upgrade`, `check`) with full Vitest unit + integration coverage, populate templates, and publish `@bartens/bkit@0.1.0` to npm.

**Success Criteria (this sub-plan):**

- `@bartens/bkit@0.1.0` published to npm registry; `npm view @bartens/bkit version` returns `0.1.0`.
- `pnpm dlx @bartens/bkit@0.1.0 --help` works from any cwd.
- Local `pnpm pack` smoke test (Task 4.8) passes Concrete Example Steps 1–5 by hand.
- All Vitest suites green; `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass in `bkit/`.

Successor sub-plan B consumes the published `0.1.0`.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> Human must read and confirm. Everything downstream is derived from this section.

### Spec — what good looks like

Per `docs/plans/template.md` § Acceptance Scenario Spec.

### Narrative _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested narrative: "As a maintainer, I run `pnpm dlx @bartens/bkit init` in a fresh repo and get a working `.agents/` + `.claude/` + `.cursor/` setup; running `install` again produces zero git diff; `upgrade` bumps the pinned version and reruns install with no manual cleanup."
The human MUST replace the `⚠️ MISSING` line above with confirmed Narrative copy before Gate 1 may pass.
-->

### Success Criteria _(design-missing fallback)_

⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds.

<!-- draft: reviewer note — not a substitute for human input
Suggested bullets:
- `pnpm dlx @bartens/bkit init` in an empty repo produces `.agents/`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc` with managed-block markers, and `.agents/.bkit-version` pin.
- `pnpm dlx @bartens/bkit install` regenerates `.claude/` and `.cursor/` from `.agents/`; re-run yields empty `git diff`.
- `pnpm dlx @bartens/bkit upgrade` bumps `.agents/.bkit-version`, merges new `agents/` payload preserving `## Project` in `rules.md`, and reruns `install`.
- `pnpm dlx @bartens/bkit check` exits non-zero when `.claude/`/`.cursor/` drift from pinned version's expected output.
- `app-gether-life` switches to `@bartens/bkit`; `git diff HEAD` after `install` is empty.
The human MUST replace the `⚠️ MISSING` line above with confirmed bullets before Gate 1 may pass.
-->

### Concrete Example _(plan expands)_

**Setup:** Maintainer on macOS, fresh empty git repo at `~/sandbox/test-repo`, has Node 20+ and pnpm 9+, `npm whoami` returns `bartens`.

**Steps:**

1. `cd ~/sandbox/test-repo && pnpm dlx @bartens/bkit init` → CLI creates `.agents/{rules,docs,workflows,IDEs,skills,friction}.md`, `.agents/{workflows,prompts,skills}/`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/00-shared-rules.mdc`, `.agents/.bkit-version` (= `0.1.0`), `.claude/`, `.cursor/`. CLI prints summary of files written.
2. `git status` → all bkit-managed files staged-as-untracked. Run `pnpm dlx @bartens/bkit install` → CLI regenerates `.claude/` and `.cursor/` from `.agents/`; `git status` shows no new diff vs Step 1.
3. Edit `.agents/rules.md` adding a project-specific bullet under `## Project Rules` (outside `<!-- bkit:start -->`/`<!-- bkit:end -->`). Run `pnpm dlx @bartens/bkit install` → bullet preserved; `.claude/` regenerated unchanged.
4. Bump local cached version (or publish `0.1.1`), run `pnpm dlx @bartens/bkit@0.1.1 upgrade` → `.agents/.bkit-version` = `0.1.1`, project-specific bullet preserved, managed-block contents updated.
5. `pnpm dlx @bartens/bkit check` → exit 0, prints `OK: pinned 0.1.1, no drift`.

**Outcome:** Test repo holds working agent-stack identical-shape to `app-gether-life`; managed block respects user edits outside it; CLI verbs idempotent.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `init` re-run on a repo that already has `.agents/` | Additive only — does NOT overwrite any existing file inside `.agents/`. Logs `[skip]`/`[add]` per file. Pin file refreshed. |
| `init` on repo with custom `## Project Rules` content in `rules.md` | Preserved verbatim; managed block regenerated only inside markers. |
| `install` when `.agents/` is missing | Fail with actionable error: "no `.agents/` found — run `bkit init` first". Non-zero exit. |
| `install` with user files outside generator paths (e.g., `.claude/skills/local/foo.md`) | Generator only touches its own paths. User files outside untouched. |
| `upgrade` when `.agents/.bkit-version` missing | Treat as fresh `init` → run init, seed cache, install. |
| `upgrade` when `.agents/.bkit-cache/{previousVersion}/` missing (cold start) | Conservative: treat every file as user-modified; preserve outside managed blocks; regen managed-block only; log `[skip cold-start, no cache for {previousVersion}] <path>`; seed `.bkit-cache/{newVersion}/`. No silent overwrites. |
| `upgrade` when payload contains a NEW canonical file the project lacks | File added (additive). |
| `upgrade` when payload REMOVES a file | Delete only if local copy byte-identical to previous-version-shipped copy; otherwise preserve + warn. |
| `check` when `.claude/`/`.cursor/` drift | Exit non-zero, print path-by-path diff summary; instruct `bkit install`. |
| `check` when `.agents/.bkit-version` missing/unreadable | Exit non-zero with `not initialized` message. |
| Offline `pnpm dlx` invocation | Use local pnpm store; CLI itself does not network beyond pnpm's resolution. |
| Cursor T3 transform encounters unknown agent name not in `prompts.md` lookup | Fail-fast with explicit "model lookup miss for {agent}"; do NOT default-substitute. |
| Concurrent `bkit install` invocations same repo | Last writer wins on generated files; `.agents/` not mutated. Operator error; no lock attempted. |

### Derived Test Matrix (this sub-plan owns ALL automated tests)

> Each row → one Agent Execution Runbook task in this sub-plan.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `init` on empty repo creates `.agents/` payload + redirect files + version pin | Integration (Vitest) | `bkit/cli/init.integration.test.ts` |
| `init` re-run on populated repo is additive (no overwrites) | Integration (Vitest) | `bkit/cli/init.integration.test.ts` |
| `install` regenerates `.claude/` byte-identical from canonical fixtures | Integration (Vitest) | `bkit/cli/install-claude.integration.test.ts` |
| `install` regenerates `.cursor/` with T1/T2/T3 transforms | Integration (Vitest) | `bkit/cli/install-cursor.integration.test.ts` |
| `install` preserves `## Project` outside managed block in `rules.md` | Integration (Vitest) | `bkit/cli/install-managed-block.integration.test.ts` |
| `install` is idempotent (twice → empty diff) | Integration (Vitest) | `bkit/cli/install-idempotent.integration.test.ts` |
| `upgrade` bumps pin + merges payload + preserves user edits | Integration (Vitest) | `bkit/cli/upgrade.integration.test.ts` |
| `upgrade` cold-start fallback (no previous-version cache → conservative preserve) | Integration (Vitest) | `bkit/cli/upgrade.integration.test.ts` |
| `init` and `install` seed `.agents/.bkit-cache/{currentVersion}/` from packaged payload | Integration (Vitest) | `bkit/cli/install-cache-seed.integration.test.ts` |
| `check` exits 0 in sync, non-zero with diff when drifted | Integration (Vitest) | `bkit/cli/check.integration.test.ts` |
| Cursor T3: per-agent `model:` lookup against canonical `prompts.md` | Unit (Vitest) | `bkit/hosts/cursor.test.ts` |
| Cursor T2: command-body `@`→`/` only inside `**Subagent:**`; npm scopes / emails unchanged | Unit (Vitest) | `bkit/hosts/cursor.test.ts` |
| Cursor T1: command frontmatter strip | Unit (Vitest) | `bkit/hosts/cursor.test.ts` |
| `parseManagedBlock` + `regenManagedBlock` round-trip; marker-absent append; nested-marker rejection | Unit (Vitest) | `bkit/cli/managed-block.test.ts` |
| `cursorModelByAgent` parity vs `agents/prompts.md` (drift gate) | Unit (Vitest) | `bkit/hosts/cursor.parity.test.ts` |
| CLI unknown verb → exit 1 with usage; recognised verb dispatch | Unit (Vitest) | `bkit/cli/bin.test.ts` |
| `upgrade` payload-removal: delete only when byte-identical to previous-version cache; else preserve + warn | Integration (Vitest) | `bkit/cli/upgrade.integration.test.ts` |
| `check` tempdir fallback chain: `<cwd>/tmp/` → `<cwd>/.bkit/tmp/`; never `os.tmpdir()` | Integration (Vitest) | `bkit/cli/check.integration.test.ts` |
| Templates byte-parity vs canonical fixture snapshot | Integration (Vitest) | `bkit/tests/template-parity.integration.test.ts` |

(Two manual smoke rows from v3 — `app-gether-life` post-install diff, second-repo onboarding — live in sibling sub-plans B and C.)

### 👤 ✅ Human Confirmation

- [ ] **Narrative replaced:** Narrative section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [ ] **Success Criteria replaced:** Success Criteria section above no longer contains `⚠️ MISSING`. Human edited in-place.
- [ ] **Acceptance Scenario confirmed:** Reviewed Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix.

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until ALL THREE checkboxes are `[x]` AND the literal string `⚠️ MISSING` is absent from this section.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

### Naming reconciliation vs Linear description

> [!IMPORTANT]
> The Linear description (plan-input.md) predates the canonical agents-stack rename and uses stale identifiers. This sub-plan adopts the **current source of truth** in `app-gether-life/.agents/`.

<!-- prettier-ignore -->
| Linear description (stale) | Canonical (this plan) | Source of truth |
| --- | --- | --- |
| `@bartens/bflow` | `@bartens/bkit` | plan-input.md comment override (2026-05-01) |
| `bflow/` (repo dir) | `bkit/` (`~/Documents/GitHub/bkit`) | plan-input.md comment override |
| `.bflow-version` | `.bkit-version` | plan-input.md comment override |
| `<!-- bflow:start -->` / `<!-- bflow:end -->` | `<!-- bkit:start -->` / `<!-- bkit:end -->` | already in `app-gether-life/.agents/` |
| `commands.md` | `workflows.md` | actual file in `app-gether-life/.agents/` |
| `subagents.md` | `prompts.md` | actual file in `app-gether-life/.agents/` |
| `commands/` | `workflows/` | actual dir in `app-gether-life/.agents/` |
| `subagents/` | `prompts/` | actual dir in `app-gether-life/.agents/` (verify Task 2.1) |

**Names:**

<!-- prettier-ignore -->
| Concern | Decision | Notes |
| --- | --- | --- |
| Package name | `@bartens/bkit` | Confirmed in plan-input.md. |
| Repo | `https://github.com/cbartens/bkit` (on disk `~/Documents/GitHub/bkit`) | Confirmed. |
| CLI binary | `bkit` | Matches package short name. |
| Version pin file | `.agents/.bkit-version` | Renamed from `.bflow-version`. |
| Managed-block markers | `<!-- bkit:start -->` / `<!-- bkit:end -->` | Already in `.agents/` files. |
| Top-level repo dirs | `agents/`, `hosts/`, `templates/<host>/`, `cli/`, `eval/` | Per plan-input.md § Repo shape. |
| Initial published version | `0.1.0` | Per plan-input.md § Migration Step 3. |

> [!IMPORTANT]
> **Breaking changes downstream of this sub-plan:** Producer-side breaking changes are limited to creating a new published artifact (`@bartens/bkit@0.1.0`). Consumer-side breaking changes (deletion of local install script in `app-gether-life`) are owned by sibling sub-plan B.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all naming and breaking-change decisions above.

> [!CAUTION]
> Agent: Do NOT pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

**Considered & rejected:**

- **Git submodule of `bkit` instead of npm package** — version pinning fiddly, no `dlx`-style ergonomics.
- **Monorepo: keep `bkit` as workspace package inside `app-gether-life`** — defeats central-source promise.
- **Vendoring** — explicit DoD says "forks rejected — central source promise".
- **Single combined `init` (no separate `install`/`upgrade`)** — different semantics; conflating creates footgun on re-runs.

**Future-phase (out of scope):**

- `bkit install --ci` flag.
- `bkit eval` / LLM-judge eval framework — placeholder dir only this phase.
- New hosts (Codex, Windsurf, Kiro) — recipe in `agents/IDEs.md`.

## Out of Scope (this sub-plan)

- Consumer migration (sibling sub-plan B).
- Second-repo smoke + upgrade smoke (sibling sub-plan C).
- `bkit install --ci`.
- New hosts beyond Claude + Cursor.
- Eval / `bkit test`.
- Setting up GitHub Actions CI in the new `bkit` repo (recommended; tracked in `app-gether-life/docs/pending.md` by sub-plan B).
- `cursorModelByAgent` auto-generation from `agents/prompts.md` (v0.1.0 ships hand-written + parity test).
- Template token substitution machinery (v0.1.0 literal templates).
- `.agents/.bkit-cache/{previousVersion}/` pruning policy (v0.1.0 retains all).
- Phase 9 real-registry `0.1.1` publish (sibling sub-plan C, gated).

## Merge Method

**Squash.** The bkit repo's first PR (or direct push to `main` for 0.1.0 scaffold per Task 1.5) is squashed. No commit-boundary preservation needed.

## Supersession Inventory

> Producer-side only. Consumer-side supersession (install script deletion) lives in sibling sub-plan B.

This sub-plan creates artifacts; it does not supersede any.

## Security & Privacy

- [ ] **New API route** — N/A. CLI only.
- [ ] **New DB table/column** — N/A.
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — CLI argv parsed (`init`, `install`, `upgrade`, `check`, optional flags). Use a small typed parser; reject unknown verbs explicitly.
- [ ] **PII** — N/A. CLI does not log user data.
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [x] **New secret/env var** — `NPM_TOKEN` for publishing. Stored in: human's local `~/.npmrc` (manual publish of 0.1.0). NEVER committed. Do NOT set in `app-gether-life`.

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `~/Documents/GitHub/bkit/package.json` will be created in Task 1.1. `pnpm-lock.yaml` will sync cleanly post-add.
- [ ] **Dependency Versions:** Once scaffolded, run `pnpm outdated` in `bkit/`; spot-check `node --version` ≥ 20, `pnpm --version` ≥ 9, `tsx --version`. Confirm `tsup` / `tsc` versions stable.
- [ ] **User Context:** Verify write access to `~/Documents/GitHub/bkit/` and `~/Documents/GitHub/app-gether-life/` (read-only for the payload copy in Phase 2). Verify `npm publish` rights to `@bartens` scope (`npm whoami` → `bartens`; `npm access list packages @bartens` shows ownership).
- [ ] **Pending Blockers:** Query Linear for open `blocker`-labelled issues touching agent stack / install script.
- [ ] **Project Context:** Re-read `app-gether-life/.agents/rules.md` (universal rules), `.agents/IDEs.md` (transform spec — load-bearing for hosts/cursor.ts), `.agents/workflows.md`, `.agents/skills.md`.
- [ ] **Testing & Quality:** `app-gether-life/docs/testing.md` is inapplicable as-is to standalone `bkit` repo (no DB, no UI). The `bkit` testing conventions: Vitest unit + integration only, file naming mirrors `*.test.ts` / `*.integration.test.ts`, no Playwright. Intentional delta.
- [ ] **Prerequisite Plans:** **BAR-110 must be merged.** Phase A = in-repo migration + install script. If BAR-110 not merged into `app-gether-life/main`, abort with Linear blocker comment.

### Conditional

- [x] **Secrets & Env Vars** _(npm publish)_: `NPM_TOKEN` available in publisher's local env / `~/.npmrc`. Confirm via `npm whoami`.
- [ ] **Schema State** — N/A.
- [x] **Architecture & UI** _(new repo)_: Topology defined below.
- [ ] **Observability** — N/A. CLI logs to stdout/stderr only.
- [ ] **Notifications** — N/A.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Narrative populated:** Acceptance Scenario § Narrative no longer contains `⚠️ MISSING`. Human-confirmation `Narrative replaced` is `[x]`.
- [ ] **Success Criteria populated:** Acceptance Scenario § Success Criteria no longer contains `⚠️ MISSING`. Human-confirmation `Success Criteria replaced` is `[x]`.
- [ ] **Acceptance Scenario confirmed:** Human checked the box.
- [ ] **Breaking Changes confirmed:** Human checked the box.
- [ ] **Gate 1 - Verified:** All Core checked. All applicable Conditional checked. **Specifically: BAR-110 confirmed merged.**

## Data Schema Integration

None.

## Architecture & Component Changes

### Repo: `~/Documents/GitHub/bkit/` (NEW)

Standalone npm package. Topology mirrors plan-input.md § Repo shape, `bflow/` namespace dropped:

```
bkit/
├── agents/                           # canonical .agents/ payload
│   ├── rules.md
│   ├── docs.md
│   ├── workflows.md
│   ├── IDEs.md
│   ├── skills.md
│   ├── friction.md                   # template only — empty/placeholder
│   ├── workflows/
│   │   ├── bkit-design.md
│   │   ├── bkit-plan.md
│   │   ├── bkit-build.md
│   │   ├── bkit-debug.md
│   │   ├── bkit-ship.md
│   │   ├── bkit-worktree-sync.md
│   │   └── bkit-worktree-prune.md
│   ├── prompts/
│   │   └── bkit-*.md                 # all subagents per current .agents/prompts/
│   └── skills/
├── hosts/
│   ├── claude.ts                     # passthrough — defines target paths
│   └── cursor.ts                     # T1/T2/T3 transforms; per-agent model lookup table
├── templates/
│   ├── claude/
│   │   ├── CLAUDE.md.tmpl
│   │   ├── settings.json.tmpl
│   │   └── hooks/preflight.sh
│   └── cursor/
│       ├── AGENTS.md.tmpl
│       ├── rules/00-shared-rules.mdc.tmpl
│       ├── Dockerfile
│       ├── environment.json.tmpl
│       ├── settings.json.tmpl
│       ├── hooks.json.tmpl
│       └── hooks/{preflight,postflight}.sh
├── cli/
│   ├── bin.ts                        # entry — verb dispatch
│   ├── init.ts
│   ├── install.ts
│   ├── upgrade.ts
│   ├── check.ts
│   └── managed-block.ts              # parse/regen helper for <!-- bkit:* --> markers
├── eval/
│   └── README.md                     # placeholder — single README only
├── tests/
│   ├── fixtures/
│   └── *.integration.test.ts
├── package.json                      # name=@bartens/bkit, bin.bkit, files=[dist, agents, templates]
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── README.md
├── LICENSE
├── .gitignore                        # MUST include `tmp/`
└── .npmignore
```

#### [NEW] `bkit/agents/` (entire tree)

- **Source:** Copy verbatim from `app-gether-life/.agents/` minus `friction.md` body content (keep header + markers, body empty).
- **Mutability:** Canonical payload. Future bkit versions evolve these files; consumers receive via `upgrade`.
- `agents/rules.md` shipped here has empty `## Project Rules` section (managed-block content only).

#### [NEW] `bkit/hosts/claude.ts`

- Pure data: maps canonical `agents/` paths → Claude target paths (`.claude/agents/`, `.claude/commands/`, `.claude/settings.json`, `.claude/hooks/`). No transforms.

#### [NEW] `bkit/hosts/cursor.ts`

- T1: frontmatter strip from commands.
- T2: command-body invocation transform — `Agent`→`Task`, `@<name>`→`/<name>` only inside `**Subagent:**` lines (per `IDEs.md` § Subagent invocation).
- T3: subagent frontmatter rewrite — drop `effort` / `permissionMode` / `maxTurns`; keep `name` / `description` / `tools` / `model`; resolve `model:` via per-agent lookup mirrored from `.agents/prompts.md`.
- Per-agent model lookup: literal TS map `cursorModelByAgent: Record<string, string>`. Drift gate via parity unit test.
- Tool name allowlist passthrough (`Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch`).
- `readonly:` NEVER emitted.

#### [NEW] `bkit/templates/claude/`, `bkit/templates/cursor/`

- Static template drops. Substitution tokens left literal in 0.1.0 unless any consumer needs them. Document deferral in `bkit/README.md`.

#### [NEW] `bkit/cli/bin.ts`

- Shebang `#!/usr/bin/env node`. Reads argv[2] as verb; switch over `init`/`install`/`upgrade`/`check`. Unknown verb → exit 1 with usage.
- No external argv-parser dep (or use `mri`). Avoid `commander`.

#### [NEW] `bkit/cli/init.ts`

- Walks packaged `agents/` tree; copies each to `<cwd>/.agents/<rel>` IF NOT EXISTS. Logs `[skip]`/`[add]`.
- Drops redirect files using managed-block markers:
  - `<cwd>/CLAUDE.md` (from `templates/claude/CLAUDE.md.tmpl`)
  - `<cwd>/AGENTS.md` (from `templates/cursor/AGENTS.md.tmpl`)
  - `<cwd>/.cursor/rules/00-shared-rules.mdc` (from `templates/cursor/rules/00-shared-rules.mdc.tmpl`)
  - File exists: regen ONLY bkit-managed block; preserve content outside markers. File exists without markers: append markers + block at EOF.
- Writes `<cwd>/.agents/.bkit-version` containing the running CLI's `package.json#version`.
- **Seeds `<cwd>/.agents/.bkit-cache/{currentVersion}/`** with verbatim copy of packaged `agents/`. Reference for `upgrade`'s user-modification detection.
- Calls `install.ts` at the end.

#### [NEW] `bkit/cli/install.ts`

- Reads `<cwd>/.agents/`. Generates:
  - `.claude/agents/<name>.md` ← `agents/prompts/<name>.md` byte-identical.
  - `.claude/commands/<name>.md` ← `agents/workflows/<name>.md` byte-identical.
  - `.claude/settings.json` ← template literal copy.
  - `.claude/hooks/*.sh` ← templates.
  - `.cursor/agents/<name>.md` ← `agents/prompts/<name>.md` after T3.
  - `.cursor/commands/<name>.md` ← `agents/workflows/<name>.md` after T1+T2.
  - `.cursor/rules/00-shared-rules.mdc` ← template (managed-block aware).
  - `.cursor/{settings.json, environment.json, Dockerfile, hooks.json, hooks/*.sh}` ← templates.
- ALWAYS overwrites generated files. Does NOT touch `.agents/` content.
- **Cache safety net:** if `<cwd>/.agents/.bkit-cache/{currentVersion}/` missing, seed from packaged payload at running CLI's version. Never overwrites existing cache for any version.
- If `.agents/` missing → exit 1 with `not initialized`.

#### [NEW] `bkit/cli/upgrade.ts`

- For each file in packaged `agents/`:
  - File exists at `<cwd>/.agents/<rel>` AND content equals previous-version-shipped copy → overwrite.
  - File exists AND content differs → user-modified; preserve, log `[skip user-modified] <path>`. Exception: `rules.md` — managed-block regenerated; `## Project Rules` outside preserved.
  - File does NOT exist → add.
- Determine "previous-version-shipped copy" via `.agents/.bkit-version` then `.agents/.bkit-cache/{previousVersion}/`. Cache seeded by `init`/`install` so `upgrade` always has a baseline.
- **Cache cold-start fallback:** if `.agents/.bkit-cache/{previousVersion}/` missing, treat every existing file as user-modified — preserve all outside managed blocks, regen managed-block content only, log `[skip cold-start, no cache for {previousVersion}] <path>`, seed cache from packaged payload at `{currentVersion}`. Do NOT silently overwrite. Conservative default chosen over re-fetching previous version from registry.
- Cache strategy: on-disk `.bkit-cache/` (Option a) — ~few hundred KB per pin, offline-friendly.
- After merge: bumps `.agents/.bkit-version` to running version, seeds `.agents/.bkit-cache/{newVersion}/`. Old caches retained.
- Calls `install.ts` at the end.

#### [NEW] `bkit/cli/check.ts`

- Reads `.agents/.bkit-version`. If missing → exit 1 with `not initialized`.
- Re-runs install logic into a **repo-local tempdir** under `<cwd>/tmp/check-{uuid}/` (creating `<cwd>/tmp/` if absent; if blocked, fall back to `<cwd>/.bkit/tmp/check-{uuid}/`). NEVER `os.tmpdir()`/`/tmp/` — per `.agents/rules.md` § Output & Editing.
- Diffs tempdir vs current `.claude/`/`.cursor/`. Empty → exit 0 prints `OK`. Non-empty → exit 1 with summary. Cleans tempdir on exit.

#### [NEW] `bkit/cli/managed-block.ts`

- Helpers: `parseManagedBlock(content, marker)` → `{ before, inside, after }`; `regenManagedBlock({ before, newInside, after })` → string. Default markers `<!-- bkit:start -->` / `<!-- bkit:end -->`.

#### [NEW] `bkit/package.json`

```jsonc
{
  "name": "@bartens/bkit",
  "version": "0.1.0",
  "type": "module",
  "bin": { "bkit": "./dist/bin.js" },
  "main": "./dist/bin.js",
  "files": ["dist", "agents", "templates", "README.md", "LICENSE"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "prepublishOnly": "pnpm build && pnpm typecheck && pnpm test",
  },
  "devDependencies": {
    /* tsup, typescript, vitest, eslint, @types/node — pin */
  },
  "dependencies": {
    /* mri (or none) — minimise */
  },
  "publishConfig": { "access": "public" },
}
```

#### [NEW] `bkit/.npmignore`

- Excludes `tests/`, `eval/`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `.eslintrc*`, `node_modules/`, `*.test.ts`. Whitelist via `package.json#files` is primary.

#### [NEW] `bkit/README.md`

- Documents: install (`pnpm dlx @bartens/bkit init`), four CLI verbs, managed-block convention, version-pin file, supported hosts, how to add a new host (link to `agents/IDEs.md`), eval status (placeholder).

#### [NEW] `bkit/tests/fixtures/`

- Canonical input/output snapshots:
  - `fixtures/agents-payload/` — small representative subset (1 workflow file, 2 subagent prompts, IDEs.md, rules.md).
  - `fixtures/expected-claude/` — expected Claude side.
  - `fixtures/expected-cursor/` — expected Cursor side post T1/T2/T3.
  - `fixtures/expected-templates/` — for `template-parity.integration.test.ts`.

### Database Migrations

None.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `bkit/README.md` (NEW) | Full CLI usage, four verbs, managed-block convention, supported hosts, link to `agents/IDEs.md` for host extension. |

(Documentation updates in `app-gether-life/docs/` are owned by sibling sub-plan B; pending.md entries also in B.)

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **bkit publish (0.1.0)** | `npm deprecate @bartens/bkit@0.1.0 "rolled back"` + publish `0.1.1` reverting changes. Within 72h: `npm unpublish @bartens/bkit@0.1.0`. | Consumers pin exact, so `0.1.0` stays usable until they bump. |
| **Code (bkit repo)** | `git revert {COMMIT}` per phase commit. | Code-only; `git revert` sufficient. |
| **Risk window** | Zero — no DB, no runtime in this sub-plan. | Tooling regression caught by `bkit check` failing in consumer CI (sibling B). |

## Agent Execution Runbook

> Chronological. Step Isolation. Continuous execution. Do not pause for user permission at any Gate.

**Phase 0: Validate Pre-Flight (already gated above; restated for runbook visibility).**

- [ ] **Task 0.1:** Confirm BAR-110 merged into `app-gether-life/main` (Linear MCP `get_issue("BAR-110")` → `state == "Done"` or PR merged). If not merged, abort and create Linear blocker comment on BAR-111.
- [ ] **Task 0.2:** Verify `~/Documents/GitHub/bkit/` exists and is a git repo with `origin` = `https://github.com/cbartens/bkit`. If not, run `gh repo clone cbartens/bkit ~/Documents/GitHub/bkit`.
- [ ] **Task 0.3:** Verify `npm whoami` returns `bartens`; `npm access list packages @bartens` does not error. _(2FA on publish: user must be ready to enter OTP.)_
- [ ] **Task 0.4:** In `app-gether-life`, grep for the install script: `rg -l 'install.*agents|\.agents/' package.json scripts/ .github/workflows/`. Record exact paths in plan log. (Findings consumed by sibling sub-plan B; this sub-plan only records.)

**Phase 1: Scaffold `bkit` repo.**

- [ ] **Task 1.1:** In `~/Documents/GitHub/bkit/`, run `pnpm init` → set `name=@bartens/bkit`, `version=0.1.0`, `type=module`, `engines.node>=20`, `publishConfig.access=public`. Edit per § package.json above.
- [ ] **Task 1.2:** Add devDeps: `tsup`, `typescript`, `vitest`, `@types/node`, `eslint`, `@typescript-eslint/{parser,eslint-plugin}` (or equivalent), `mri` (optional). Run `pnpm install`.
- [ ] **Task 1.3:** Add `tsconfig.json` (strict, ES2022, NodeNext, `outDir=dist`). Add `tsup.config.ts` (entry `cli/bin.ts`, format `esm`, target `node20`, `dts=false`, `shims=false`). Add `vitest.config.ts` (node env). Add `.eslintrc.cjs`, `.gitignore` (MUST include `tmp/`), `.npmignore`, `LICENSE` (MIT, copyright Christian Bartens), `README.md` (stub — full content in Task 8.1).
- [ ] **Task 1.4:** Verify build pipeline: stub `cli/bin.ts` (`console.log("bkit")`), run `pnpm build` → `dist/bin.js` exists. Run `node dist/bin.js` → prints "bkit". Delete stub content.
- [ ] **Task 1.5:** Commit: `feat(bkit): scaffold repo`. Push to `main` (bkit repo has no convention yet; recommend `main` direct for 0.1.0 work, switch to PR-based after).

**Phase 2: Copy canonical `.agents/` payload.**

- [ ] **Task 2.1:** `mkdir -p ~/Documents/GitHub/bkit/agents/{workflows,prompts,skills}`. Canonical names per § Naming reconciliation (decided facts; do NOT re-evaluate). Copy from `~/Documents/GitHub/app-gether-life/.agents/`:
  - `rules.md`, `docs.md`, `workflows.md`, `IDEs.md`, `skills.md`, `friction.md` → `bkit/agents/` (root).
  - `workflows/*.md` → `bkit/agents/workflows/`.
  - `prompts/*.md` → `bkit/agents/prompts/` (canonical name: `prompts/`, NOT `subagents/`).
  - `skills/` (if non-empty) → `bkit/agents/skills/`.
  - Existence check: `ls ~/Documents/GitHub/app-gether-life/.agents/prompts/` should list `*.md`. If `prompts/` absent in source, abort and escalate; do NOT silently fall back to `subagents/`.
- [ ] **Task 2.2:** Sanitise `agents/rules.md`: ensure `## Project Rules` section is empty / placeholder (`<!-- consumer-specific bullets here -->`). bkit-managed bullets stay inside `<!-- bkit:start -->` / `<!-- bkit:end -->`.
- [ ] **Task 2.3:** Sanitise `agents/friction.md`: keep header + markers; clear body entries.
- [ ] **Task 2.4:** Verify managed-block markers in every `.md` expected to have them — `rules.md`, `docs.md`, `skills.md`, `friction.md`. Use `grep -l 'bkit:start' agents/`.
- [ ] **Task 2.5:** Commit: `feat(bkit): copy canonical agents payload`.

**Phase 3: Implement hosts/ transforms.**

- [ ] **Task 3.1:** Implement `bkit/hosts/claude.ts` — pure path map. Export `claudeTargets: { agents, commands, settings, hooks }`. No transform fns.
- [ ] **Task 3.2:** Implement `bkit/hosts/cursor.ts`:
  - `stripCommandFrontmatter(content: string): string` (T1).
  - `transformCommandBody(content: string, agentNames: Set<string>): string` (T2) — `Agent`→`Task`; `@<name>`→`/<name>` only inside `**Subagent:**` lines.
  - `rewriteSubagentFrontmatter(content: string, opts: { model: string }): string` (T3) — drops `effort`/`permissionMode`/`maxTurns`; keeps `name`/`description`/`tools`/`model`; injects/replaces `model`; never emits `readonly`.
  - Export `cursorModelByAgent: Record<string, string>` — hand-written for v0.1.0 + parity test (Task 3.3a).
- [ ] **Task 3.3:** Add `bkit/hosts/cursor.test.ts` covering T1, T2 (positive: subagent line transformed; negative: npm scope `@bartens/bkit` left alone; negative: email `christian@bartens.biz` left alone), T3 (frontmatter shape, model injection, no `readonly`).
- [ ] **Task 3.3a:** Add `bkit/hosts/cursor.parity.test.ts` — drift gate. Parses `agents/prompts.md` to extract every agent name; asserts every name has a row in `cursorModelByAgent`. Fails on missing or extra rows.
- [ ] **Task 3.4:** Commit: `feat(bkit): implement claude + cursor host transforms`.

**Phase 4: Implement CLI verbs.**

- [ ] **Task 4.1:** Implement `cli/bin.ts` — verb dispatch (no logic; delegates to `init.ts`/`install.ts`/`upgrade.ts`/`check.ts`).
- [ ] **Task 4.1a:** Add `bkit/cli/bin.test.ts` — every recognised verb dispatches; **unknown verb exits 1 with usage**.
- [ ] **Task 4.2:** Implement `cli/managed-block.ts` (parse + regen helpers).
- [ ] **Task 4.2a:** Write `bkit/cli/managed-block.test.ts` — round-trip; marker-absent append; nested-marker rejection.
- [ ] **Task 4.3:** Implement `cli/install.ts`. Inputs: cwd, packaged `agents/` + `templates/` dirs (resolved via `import.meta.url`). Side-effects: `.claude/` + `.cursor/` regen; **seed `.agents/.bkit-cache/{currentVersion}/` if missing** (safety net).
- [ ] **Task 4.3a:** Write `bkit/cli/install-claude.integration.test.ts`.
- [ ] **Task 4.3b:** Write `bkit/cli/install-cursor.integration.test.ts`.
- [ ] **Task 4.3c:** Write `bkit/cli/install-managed-block.integration.test.ts`.
- [ ] **Task 4.3d:** Write `bkit/cli/install-idempotent.integration.test.ts`.
- [ ] **Task 4.3e:** Write `bkit/cli/install-cache-seed.integration.test.ts` — cache absent → seeded; cache present → untouched.
- [ ] **Task 4.4:** Implement `cli/init.ts`. Inputs: cwd. Side-effects: `.agents/` additive copy, redirect files, version pin, **seed `.agents/.bkit-cache/{currentVersion}/` from packaged payload**, then calls `install`. Tests: `cli/init.integration.test.ts` (empty repo + populated repo cases + cache-seeded assertion).
- [ ] **Task 4.5:** Implement `cli/upgrade.ts` with caching strategy from § Architecture (Option a — `.agents/.bkit-cache/{version}/`). Implement **cache cold-start fallback**.
- [ ] **Task 4.5a:** Write `bkit/cli/upgrade.integration.test.ts` covering: clean upgrade; user-modified file preserved; `## Project` preserved; payload addition; **payload removal of unmodified file → deleted; payload removal of user-modified file → preserved + warn**; cache cold-start fallback; post-upgrade cache contains `{newVersion}` payload.
- [ ] **Task 4.6:** Implement `cli/check.ts`.
- [ ] **Task 4.6a:** Write `bkit/cli/check.integration.test.ts` covering: in-sync → exit 0; drifted → non-zero with diff; **tempdir fallback chain** (`<cwd>/tmp/` present → used; absent → `<cwd>/.bkit/tmp/`; never `os.tmpdir()`).
- [ ] **Task 4.7:** Run `pnpm build && pnpm test && pnpm typecheck`. All green. **Verify `prepublishOnly` ordering hazard:** integration tests resolving packaged assets via `dist/` must run AFTER `pnpm build`; unit tests via tsx pass either way but sanity-check vs fresh `dist/`. Re-run `pnpm build && pnpm test` after wiping `dist/` once and confirm pass.
- [ ] **Task 4.8:** **Hard gate before Task 6.2 (publish).** Smoke local: `pnpm pack` → produces tarball; in `~/sandbox/test-repo` run `pnpm dlx file:/path/to/bartens-bkit-0.1.0.tgz init`. Verify Concrete Example Steps 1–5 pass by hand. If ANY step fails, fix in bkit and re-pack — do NOT proceed to Phase 6 publish.
- [ ] **Task 4.9:** Commit: `feat(bkit): implement init/install/upgrade/check`.

**Phase 5: Templates.**

- [ ] **Task 5.1:** Populate `templates/claude/` and `templates/cursor/` from current `app-gether-life/.claude/` and `.cursor/` static files (settings, hooks, Dockerfile, environment.json). Convert project-specific tokens to `{{TOKEN}}` placeholders if needed; otherwise ship literal — document deferral in README if any token exists.
- [ ] **Task 5.2:** Verify install with templates → produces output byte-identical to current `app-gether-life/.claude/`/`.cursor/`. Use `diff -r` against fresh checkout. (One-shot manual gate.)
- [ ] **Task 5.2a:** Write `bkit/tests/template-parity.integration.test.ts` — automated regression for the byte-identical claim. Compares packaged templates against fixture snapshot at `bkit/tests/fixtures/expected-templates/`.
- [ ] **Task 5.3:** Commit: `feat(bkit): add host templates`.

**Phase 6: Publish 0.1.0.**

- [ ] **Task 6.1:** Bump verify: `package.json` says `0.1.0`. Tag: `git tag v0.1.0 && git push origin v0.1.0`.
- [ ] **Task 6.2:** `pnpm publish --access public --no-git-checks` (manual; automation out of scope). Confirm 2FA OTP if prompted.
- [ ] **Task 6.3:** Verify: `npm view @bartens/bkit version` → `0.1.0`. `pnpm dlx @bartens/bkit@0.1.0 --help` works from any cwd.
- [ ] **Task 6.4:** Commit: `chore(bkit): publish 0.1.0` (tag commit, no code change).

### 🔒 Gate 2: Code Implementation Check

- [ ] **Phase 0–6 task completeness:** Every Phase 0–6 task above is `[x]`.
- [ ] **Gate 2 - Verified:** Independently verified.

> [!IMPORTANT]
> **Testing Strategy (this sub-plan):**
>
> - Vitest unit + integration only. No Playwright (no UI).
> - Integration tests use repo-local tempdirs at `bkit/tmp/{crypto.randomUUID()}/`. The bkit repo's `.gitignore` MUST list `tmp/`. **Do NOT use `os.tmpdir()` / `/tmp/` / `/private/tmp/`** — `.agents/rules.md` § Output & Editing prohibits system tmp paths. Same convention applies to `cli/check.ts`.
> - No real npm publish from tests; use `pnpm pack` + local tgz install pattern for end-to-end fidelity.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each row maps to a Phase 3 / Phase 4 / Phase 5 task above. Confirmed.
- [ ] **Update existing tests:** N/A — bkit repo is new.
- [ ] **Write new tests:** Per Phase 3 + Phase 4 + Phase 5 sub-tasks.
- [ ] **Verify observability:** N/A — CLI logs to stdout/stderr; no log drains.
- [ ] **Update documentation:** `bkit/README.md` populated per Task 8.1 (subsumed in Phase 5 / Task 5.x — see Documentation Updates table).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** `bkit/README.md` complete (CLI usage, four verbs, managed-block convention, supported hosts, host-extension recipe link).
- [ ] **Gate 3 - Verified:** All boxes above checked.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint (bkit):** `pnpm typecheck && pnpm lint` in `~/Documents/GitHub/bkit/`. Must pass.
- [ ] **Unit + Integration tests (bkit):** `pnpm test`. All Vitest suites green:
  - `bkit/hosts/cursor.test.ts`
  - `bkit/hosts/cursor.parity.test.ts`
  - `bkit/cli/bin.test.ts`
  - `bkit/cli/managed-block.test.ts`
  - `bkit/cli/init.integration.test.ts`
  - `bkit/cli/install-claude.integration.test.ts`
  - `bkit/cli/install-cursor.integration.test.ts`
  - `bkit/cli/install-managed-block.integration.test.ts`
  - `bkit/cli/install-idempotent.integration.test.ts`
  - `bkit/cli/install-cache-seed.integration.test.ts`
  - `bkit/cli/upgrade.integration.test.ts`
  - `bkit/cli/check.integration.test.ts`
  - `bkit/tests/template-parity.integration.test.ts`
- [ ] **Build verification (bkit):** `pnpm build` produces `dist/bin.js`. `node dist/bin.js --help` works.
- [ ] **Local pack smoke:** `pnpm pack` → tarball; `pnpm dlx file:./bartens-bkit-0.1.0.tgz init` in tempdir → outputs match fixtures.

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed (this sub-plan)

- [ ] **Gate 4 (sub-plan A) - Verified:** Every checkbox above checked. CLI outputs / test logs captured in plan log. Final cross-sub-plan Gate 4 lives in sibling C.

### Manual Verification

> Use `gh`, `npm`, `pnpm` CLIs. No dashboards.

- [ ] **Step 1:** `npm view @bartens/bkit version` → `0.1.0` (post-publish).
- [ ] **Step 2:** `npm view @bartens/bkit dist-tags` → has `latest`.
- [ ] **Step 3:** From `~/sandbox/test-repo` (empty), run `pnpm dlx @bartens/bkit init` → all expected files present per Concrete Example Step 1.
- [ ] **Step 4:** Re-run `pnpm dlx @bartens/bkit install` → `git status` shows no new diff.
- [ ] **Step 5:** Edit `.agents/rules.md` `## Project Rules`; run `install` → edit preserved.

(Manual Steps 6–8 — consumer post-migration verification, second-repo onboarding, upgrade smoke — live in sibling sub-plans B and C.)

---

## Plan Reviewer Notes — Concerns Flagged for Human

> [!IMPORTANT]
> Provisional decisions warranting explicit human attention before Build phase. Items marked **DEFERRED — HUMAN INPUT REQUIRED** block their dependent runbook step until resolved.
>
> 1. **DEFERRED — HUMAN INPUT REQUIRED:** Acceptance Scenario Narrative + Success Criteria are FALLBACK strings (no design doc for BAR-111). Suggested copy in HTML comments inside the section — NOT a substitute. Human MUST replace `⚠️ MISSING` lines in-place before Gate 1.
> 2. **Upgrade payload-caching strategy** picked Option (a) (`.agents/.bkit-cache/{version}/`) over (b) (re-download at upgrade time). Offline-friendly; ~few-hundred-KB per pin per pinned version.
> 3. **Cursor per-agent model lookup** chose hand-written TS map + parity unit test for v0.1.0. Generated-from-source cleaner; deferred. Tracked in `app-gether-life/docs/pending.md` (sibling B).
> 4. **Templates token substitution** deferred — v0.1.0 ships literal templates. If `app-gether-life/.cursor/environment.json` (or similar) contains repo-specific tokens, substitution machinery is needed in Phase 5. Build verifies via `diff -r` post-install (Task 5.2).
> 5. **`@bartens` npm scope ownership** assumed. If `npm whoami` is not `bartens` or scope unowned, Task 0.3 fails — buy / claim scope before publish.
