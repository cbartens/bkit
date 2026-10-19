<!-- bkit:anchor
baseSha: 5f5a097cc9e4e6dd44cf46ad74457064a2a798c5
baseRef: dev
bkitVersion: 5.2.4
bkitLatest: 5.2.4
-->
<!-- Note: Report path `docs/audits/202610/duplication.md`; generated from `docs/templates/bkit-audit-duplication.md` by `@bkit-audit-generate`. Stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->

# Duplication Audit

> [!CAUTION]
> **Purpose:** Verdict on every behaviour with more than one implementation — inline rules, competing capability mechanisms, restated types, paired decisions, and merges that should not have happened.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Generated registers / graphs → verify-only mode or throwaway copy; never regenerate a tracked file.

## Universal Instructions

### Context & Goals

Identical-signature gates catch identical copies; divergent duplication hurts — one behaviour, N implementations drifted apart, each locally correct, review and tests pass. Three shapes, invisible to others' detectors: **rule** (one expression inlined at N sites then edited — expression is not a symbol → text / structural search, not language server), **capability** (one operation, N modules or mechanisms — register, reference search, literal-mechanism search), **paired decision** (two files must change together, each owning its half, nothing tying them — co-change history). Shared home existing ≠ every site calls it; documented convention does not stop drift. Until guard covers both altitudes, this sweep = prevention. Target failure: **copies of one piece of knowledge that silently disagree** — e.g. security control left `null` at call site remediation missed.

**Applies when:** source code spanning more than one module, package, or platform. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass when consolidation lands (re-check register row and call sites), new owner module or shared package lands, or production failure traces to divergent copies.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Clone taxonomy Type-1 to Type-4 and clone detector at version run (e.g. jscpd clone-types guide, PMD CPD).
- Structural search at version run (e.g. ast-grep, Semgrep).
- DRY as knowledge, not text (_The Pragmatic Programmer_, edition read).
- Rule of three and "The Wrong Abstraction" (Sandi Metz).
- Change coupling (e.g. code-maat).
- Package-manager dedupe at version run (e.g. `pnpm dedupe --check`, `npm dedupe`).
- AI-assisted code-quality research, latest year (e.g. GitClear duplicated-block prevalence).

### Scope

- Rule altitude: one business rule inlined at N sites — fallback chains, null vs falsy, formatting, predicates, defaults.
- Capability altitude: one operation with N implementations or mechanisms; capability register.
- Paired decisions: files that must change together with nothing tying them.
- Token and syntax-tree clones (Type-1 to Type-3), incl. cross-platform counterparts.
- Types and schemas restated by hand vs generated / source schema.
- Two libraries for one job; one package resolved at several versions.
- Non-code copies: SQL, shared config, i18n strings.
- Wrong abstractions: landed merges serving different knowledge.
- Prevention: next step = guard or sweep.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Single-call-site helpers | Not duplication | — |
| Capability with one implementation that is wrong | Gap, not duplication | Plan / `docs/failures.jsonl` |
| Unreachable modules beyond reference check | Dead-code sweep | `bkit-audit-dead-code` |
| One-off structural problems; module-graph shape | Architecture sweep | `bkit-audit-architecture` |
| Upgrading / removing dependencies | Dependency sweep | `bkit-audit-dependencies` |
| Mobile OS divergence (e.g. iOS vs Android) | Test-lane blind spot | `bkit-audit-testing` |
| Building the guard; CI wiring | Gate change | `bkit-audit-gates` |
| Consolidating copies | Audit reports only | Plan from this report |

### Verdicts

- **DUPLICATE:** one piece of knowledge; copies change for the same reason. Name the consolidation and its home.
- **COINCIDENTAL:** looks alike; changes for different reasons. Leave; record why.
- **RULE-OF-THREE-PENDING:** two copies of one piece of knowledge. Record and watch; consolidate at the third.
- **OTHER:** fits none; say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**Test:** same knowledge, same reason to change. A paired decision = one decision in two places → `DUPLICATE`; home = paired-owner check or gate.

**Confirm before `DUPLICATE`:**

- Duplicated name ≠ deliberate platform split (e.g. `.native.tsx` / `.web.tsx`) or local UI handler.
- Bypass is gratuitous, not a surface the owner cannot serve (e.g. framework-specific request context).
- Similar defaults are one decision — a least-privilege read default and a signup write default are not; forcing one value breaks a flow.
- "Dead" / "unwired" copy has no config-only or deployed consumer (explicit worker registries, deployed functions).
- Co-change history (`Coupling`) says one decision, or already diverged.

Carry `COINCIDENTAL` and `RULE-OF-THREE-PENDING` forward in `Carried Forward` — a two-site finding is neither consolidated early nor rediscovered every run.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [x] **Permissions:** One read-only probe per tool, none blocked: `git rev-parse HEAD` → `5f5a097c`; `rg --version` → 14.1.1; `npx --yes -p @ast-grep/cli ast-grep --version` → 0.51.0 (`npx --yes @ast-grep/cli --version` → `could not determine executable to run`; package ships two bins, `-p` form clears it); `npx --yes jscpd --version` → 5.4.1; `graphify --version` → 0.9.50; `pnpm --version` → 10.34.5; Serena `find_symbol removeOrphans` → hit; WebFetch `github.com/kucherenko/jscpd/releases` → ok. No credentialed CLI used (no direnv probe needed); no tracker read.
- [x] **Clean Tree:** `git status --porcelain=v1 --untracked-files=no` → 0 lines at `5f5a097c` (`dev`). Untracked: this report + `docs/audits/202610/security.md` + `docs/audits/202610/testing.md` (other agents' reports; docs only, not an audited surface).
- [x] **Text Search:** ripgrep 14.1.1 (`rg`), `git grep`.
- [x] **Structural Search:** ast-grep 0.51.0, ad hoc via `npx --yes -p @ast-grep/cli ast-grep run`; rules under `tmp/audit-duplication/`.
- [x] **Clone Detector:** jscpd 5.4.1, ad hoc via `npx --yes jscpd`; JSON reporter into `tmp/audit-duplication/`.
- [x] **Git History:** git 2.53.0; `git rev-parse --is-shallow-repository` → `false`; 1722 commits.
- [x] **Web:** WebFetch + WebSearch available (jscpd release page read 2026-10-17).

#### Conditional

Verify only when applicable.

- [x] **Language Server:** Serena MCP over the TypeScript language server (project `bkit`); `find_symbol` / `find_referencing_symbols` on `.bkit/core/engine/**`.
- [x] **Module Graph:** graphify 0.9.50; `docs/graphify-out/graph.json` (gitignored) `built_at_commit` `34119d388`, only `docs/capabilities.md` changed since; `pnpm graph:check` re-extracted it in place → 3336 nodes, 7875 edges. Duplicate-name scan reads it with `python3` (read-only).
- [x] **Capability Register:** `docs/capabilities.md` (generated by `pnpm graph:rollup` from `scripts/graphify/bkit-graph-drift-rules.json`). Verify-only: `pnpm graph:check` → `[graph] docs/capabilities.md matches a rebuild at 5f5a097c.` (throwaway copy; tracked file untouched).
- [x] **Cross-Platform Compare:** applicable — 4 host hook templates (`.bkit/core/{.claude,.cursor,.codex,.agents/plugins/bkit}/hooks/*.cjs`) + opencode plugin over shared `.bkit/core/hooks/*.js`; copy-and-own `.bkit/templates/scripts/**` vs adopted root `scripts/**`. Tool: jscpd 5.4.1 cross-folder pass + `diff` per counterpart pair.
- [x] **Package Manager:** pnpm 10.34.5, `pnpm-lock.yaml` v9.0. `pnpm dedupe --check` → exit 1 (`esbuild 0.28.1 → 0.28.2` under `vite@6.4.3`); `pnpm why esbuild|picomatch|typescript`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [x] **Gaps named:** No Core or applicable Conditional item missing. Partial gaps: code-maat absent → co-change computed with `git log --name-only` (`Not Checked`: code-maat entity-effort / coupling-strength metrics); graphify drops module-level initialiser calls and anonymous-callback callers (`Method`).
- [x] **Gate 1 - Verified:** All 7 Core items `[x]`; all 5 Conditional items applicable and `[x]`.

### Probe Steps

- [x] **Step 1 — Previous Run:** Baseline. `ls docs/audits/*/duplication.md` → this report only; no prior `bkit:anchor`. Seed = graphify name-collision pass 2026-10-09 (cbartens/bkit#473; untrusted, every item re-read at `5f5a097c`): 7/7 name duplicates now single definitions (closure 7/7); 2 seed capabilities re-open in a new shape (`duplication-5`, `duplication-9`). Rows → `Previous Run`.
- [x] **Step 2 — Detect:** Surface map, shared homes, register and gates → `Checked`. Applies: one package, 5 host targets over shared hook engines, copy-and-own templates with adopted root copies.
- [x] **Step 3 — Rule Altitude:** 7 rules; ast-grep 0.51.0 (R1) + `rg` (R2–R7); routed set from `rg -c` + Serena references; rules pasted → `Inline Rules`.
- [x] **Step 4 — Clones:** jscpd 5.4.1, three passes (strict / renamed / ast 0.85), JSON reporter, absolute paths; per-area % (python over jscpd JSON); growth = baseline; host counterpart matrix → `Clones`.
- [x] **Step 5 — Capability Altitude:** (a) literal-mechanism `rg` (`spawnSync("git"`, `spawnSync("pnpm"`, `getPkgRoot(), "package.json"`, `delete orphan`, `GATE_CONFIG_PATTERNS`, `segmentHead`); (b) owner references via Serena `find_referencing_symbols` + `rg`; (c) graphify duplicate-name check (callable nodes, 3+ non-test files → 11 names). Register verify-only (`pnpm graph:check` → match) → `Capabilities`.
- [x] **Step 6 — Restated Types:** No DB / IDL; schema source = ledger codec types in `.bkit/core/engine/ledgers/telemetry.ts` (+ `ledgers/status.ts`). 4 restated types diffed by hand → `Types`.
- [x] **Step 7 — Libraries:** 11 devDependencies, 0 runtime; `pnpm dedupe --check` + `pnpm why` → `Libraries`.
- [x] **Step 8 — Outside Code:** SQL absent (`git ls-files '*.sql'` → 0); i18n absent (`git ls-files '**/locales/**' '**/i18n/**' '*.po'` → 0); shared config: `tsconfig.test.json` extends `tsconfig.json`; template ↔ root config copies (`.vale.ini`, `.prettierignore`, `slop-scan.config.json` differ; `.lintstagedrc.json` identical) each carry an entry in `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` → `Checked`. No candidate survives.
- [x] **Step 9 — Wrong Abstractions:** Multiline `rg` over exported helpers with boolean / mode / options params in `shared/`, `commands/lib.ts`, `install/`, `ledgers/`, `render/`; 5 helpers reviewed → `Wrong Abstractions`.
- [x] **Step 10 — Coupling:** `git log --name-only --since=2026-10-10` (198 commits since the engine move to `.bkit/core/engine`); 14 candidate pairs + reverse detector (cross-folder, >50%, ≥5 shared, no import edge → 4 pairs); prose-tie `rg` → `Coupling`.
- [x] **Step 11 — Confidence:** Every count named with tool; 3 corrections recorded → `Method`.
- [x] **Step 12 — Prevention:** Next step = guard (extend existing drift-rule register + check in ast-grep rules) → `Prevention`.
- [x] **Step 13 — Verify:** Every candidate file opened (`sed -n` / Read); 16 survivors ranked in `Findings`; 17 non-findings carried with verdict in `Carried Forward`; homes named per row.
- [x] **Step 14 — Standards:** 7 anchor standards + Type-1..4 + 3 shapes → `Standards Coverage`.
- [x] **Step 15 — Anything Else:** (a) changes since the 2026-10-09 seed; (b) open `docs/failures.jsonl` rows (7 open, none on these surfaces) → `Beyond the Steps`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [x] **Steps complete:** 15/15 `[x]`; absent surfaces (SQL, i18n) recorded in Step 8 with `git ls-files` evidence.
- [x] **Evidence:** every `Findings` row cites `file:line` and the tool (`rg`, ast-grep, jscpd, Serena, `git log`, graphify, Read).
- [x] **Sites read:** every `DUPLICATE` `file:line` was opened this session (`sed -n` / Read), incl. re-reads after compaction.
- [x] **Tree clean:** clean of this run's writes — `git status --porcelain=v1 --untracked-files=no` lists only `docs/failures.jsonl` (+9 `audit-security-*` rows) and `docs/templates/bkit-audit-security.md`, both from a concurrent security audit; `docs/capabilities.md` and graph outputs unchanged (`git diff --stat`); `pnpm graph:check` used a throwaway copy.
- [x] **Gate 2 - Verified:** each box above re-checked against the repo.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Divergent copy disables a security / access control (e.g. rate limiter, auth, or tenancy check) or loses data; broken workflow with no workaround |
| `HIGH` | User-visible divergence between copies of one rule; hand-written type drifted from schema; paired decision out of step; `split` capability on a request path |
| `MEDIUM` | Copies consistent today (drift risk, no live bug); `bypassed` owner; register status ≠ measured; wrong abstraction; two libraries / versions for one job; SQL / config / i18n copies; clone growth outpacing consolidation |
| `LOW` | Cosmetic copies; test-only clones; stale register note changing no status |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: higher blast radius × divergence × user-visibility first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| `duplication-1` | `HIGH` | DUPLICATE | `.bkit/core/hooks/guardrails-shell.js:22` (`segmentHead`) vs `.bkit/core/hooks/guardrails-tiers.js:49` (`commandWords`), `:66` (`commandLines`) | Two parsers for "which program does this shell command run". `segmentHead` = whitespace split, no quotes, no `$(`/`(`/backtick strip, no `sh -c` recursion; feeds `usesFetch` (`guardrails-shell.js:34`) and `shellEditTargets` (`:53`; redirect regex `:63` runs over the raw command, quote-blind). deny / ask / secret tiers use quote-aware recursive `commandLines` (`guardrails-tiers.js:216`, `:248`, `:303`). `classifyShell` (`guardrails-tiers.js:349`) → `sh -c 'curl …'`, `echo $(curl …)`, `(curl …)` never reach tier `fetch`, which is `ask` on Cursor (`.bkit/core/.cursor/hooks/bkit-guardrails.cjs:77-81`) and Codex (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:75-78`). `commandLines` landed 3e306b5a (5.2.3) without touching `segmentHead`. Live: this run's Claude hook flagged a `>` inside a single-quoted `rg` pattern as a redirect edit. Static trace (Read + `rg`); hook not executed; cross-host table `.bkit/core/engine/install/modules/index.integration.test.ts` has no wrapped-fetch row. | One parser: `usesFetch` + `shellEditTargets` iterate `commandLines` / `commandWords`; `segmentHead` removed; wrapped-fetch and quoted-`>` rows added to the cross-host table. Reference check: `segmentHead` callers (`guardrails-shell.js` only). |
| `duplication-2` | `HIGH` | DUPLICATE | `.bkit/core/engine/commands/analysis.ts:28` (`OutcomeRow`) | Hand-restates `OutcomePayload` (`.bkit/core/engine/ledgers/telemetry.ts:338`; jscpd Type-1 `analysis.ts:31-44` ↔ `telemetry.ts:344-381`) and adds `counterSource?` (`analysis.ts:45`), a `CounterPayload` field (`telemetry.ts:420`). Writer sets `counterSource: "shell-bus"` on the counter row only (`.bkit/core/engine/commands/workflow/workflows.ts:763`; outcome row `:767`). `computeRegression` (`analysis.ts:203`) tallies outcome rows by it → `shellBusCount` always 0; `analysis.ts:459` labels every run "model-self-report (untrusted)". Tests restate the same shape (`analysis.test.ts:61`, `:475`). | Derive `OutcomeRow = TelemetryEnvelope & OutcomePayload` (as `commands/comply.ts:204` derives `ComplianceRow`); trust tier read from the counter row sharing `(repo, workflow, parentSha)` or the line dropped. `docs/failures.jsonl` row; fix ahead of refactor. |
| `duplication-3` | `HIGH` | DUPLICATE | `.bkit/core/engine/install/manifest.ts:226-230` (`bkit:gate:static`) vs `.bkit/templates/.github/workflows/bkit-ci.yml:35` (`bkit-tests-static`) | Paired decision tied by prose only ("Mirrors the bkit-tests-static CI job", `manifest.ts:226`). Gate = typecheck, `lint`, format:check, lint:prose, slop:delta. CI lane = typecheck, format:check, lint:prose, lint:slop, slop:delta, actionlint, `bkit check`, dependency audit — no `pnpm lint` step (`rg -n 'pnpm lint\b'` → only `lint:prose` / `lint:slop`); `bkit-ci.yml:65` names "lint … steps below" that do not exist. `templates-content.test.ts:579` ties gate scripts to the `templates.md` script list, not to CI. Co-change 2/8 since 2026-10-10. A consumer with an ESLint config lints on pre-push only; a push that skips hooks (cloud agent, `--no-verify`) reaches `dev` unlinted. | One decision: add the `pnpm lint` step to the template lane, or name the gate's local-only steps in the comment; tie with a test asserting each `bkit:gate:static` component has a CI step or a listed exemption. CI wiring → `bkit-audit-gates`. |
| `duplication-4` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/shared/protected-paths.ts:59` (+ generated `.claude/hooks/gate-paths.generated.cjs`) vs `.bkit/core/hooks/gateguard-engine.js:9` | Two `GATE_CONFIG_PATTERNS` tables, diverged: 13 vs 23 patterns (jest, ruff ×2, flake8, mypy, pylintrc, pytest, golangci, clippy, rustfmt added to the engine only at 0b619998, #518, 2026-10-11). `protected-paths.ts:54-56` claims sync "via the generated `.cjs` drift test"; `protected-paths.test.ts` compares generator ↔ `.cjs` only. The stale copy has no production importer (`commands/comply.ts:21` imports `isMirrorPath` only; the `.cjs` is required by its test only — `rg --hidden`). `docs/architecture.md:71`, `:174` name it the source of truth. Second "is bkit's own repo" check: `isDogfood` (`shared/package-roots.ts:159`) vs `isBkitRepo` (`gateguard-engine.js:41`). | One table: delete the gate half of `protected-paths.ts` + `.cjs` (route to `bkit-audit-dead-code`) or render the engine table from it; `docs/architecture.md:71,174` fixed in the same change. |
| `duplication-5` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/install/modules/opencode.ts:74-85`, `:110-121`; `.bkit/core/engine/install/modules/antigravity.ts:119-128`; owner `.bkit/core/engine/install/modules/core.ts:76` | Mirror orphan sweep: owner `removeOrphans` (allowlist guard `ORPHAN_PRUNE_DIRS`, `core.ts:69-74`) routed by `claude.ts:69`, `cursor.ts:57`, `:85`; re-implemented without the guard in 3 sweeps the owner can serve after an allowlist entry (opencode ×2; antigravity with no extension filter) and 3 it cannot (`codex.ts:111-121` `.toml`, `codex.ts:149-158` + `antigravity.ts:151-160` recursive skill dirs). Same root cause: frontmatter prologue (parse, require `name`, model lookup, `process.exit(1)`) ×4 in `.bkit/core/engine/render/hosts.ts:102`, `:210`, `:378`, `:475` (jscpd `hosts.ts:378-396` ↔ `:475-493`). Arrived with codex / antigravity (98c82c42, 2026-10-13). Dest dirs are constants → no live mis-deletion. | `removeOrphans` takes an extension and a dir mode; allowlist extended to `.opencode/{agents,commands}`, `.codex/agents`, `.agents/skills`, `.agents/plugins/bkit/{agents,skills}`; 6 sweeps route. One `requireSubagentModel(content, lookup, host)` in `render/hosts.ts`. Reference check on `removeOrphans` (4 callers) first. |
| `duplication-6` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/checks/before/index.ts:78-89`; owner `.bkit/core/engine/shared/settings.ts:46` | Consumer `package.json` `bkit` key: owner `readBkitConfig` (12 routed call sites) bypassed by 13 inline reads. Fields the owner serves: `issueTracker` at `checks/before/index.ts:78-89` (Type-1 clone of `checks/after/github.ts:75-86`), `commands/install/install.ts:300-315`, `commands/install/upgrade.ts:689-698`; `githubProject` at `checks/after/github.ts:159`, `:287-297` (6 gratuitous). Fields it lacks (7): `opencodeProvider(s)` (`install.ts:165`, `:206`, `install/modules/opencode.ts:175-185`), `cloudAgents` (`github.ts:329`), dep-updater opt-out (`checks/after/tools.ts:380`), explicit-field presence (`github.ts:141`, `:343`; Type-1 `github.ts:141-147` ↔ `tools.ts:380-386` ↔ `github.ts:343-349`). Consistent today (`parseIssueTracker ?? DEFAULT_ISSUE_TRACKER`; `opencode.ts:191` rejects an unknown provider like the `install.ts:173` allowlist). | `BkitConfig` gains `opencodeProvider(s)`, `cloudAgents`, dep-updater opt-out and an "explicitly set" view; 13 sites route through `readBkitConfig`. |
| `duplication-7` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/install/placeholders.ts:25`; `.bkit/core/engine/checks/after/managed.ts:31`; `.bkit/core/engine/install/modules/core.ts:308`, `:496`; `.bkit/core/engine/commands/install/install.ts:94`, `:563`; `.bkit/core/engine/checks/before/index.ts:115`; `.bkit/core/engine/commands/install/upgrade.ts:1005` | Installing-bkit-version read: 8 copies, no owner (`split`). 6 fall back to `"0.0.0"`, `core.ts:496` and `upgrade.ts:1005` throw on a garbled file. "Mirrors" comments point at wrong files (`placeholders.ts:22-23` → `install/modules/index.ts`, `checks/after/index.ts`; `managed.ts:28-29` → `install/modules/index.ts`). The "import cycle" reason is moot: `readPackageJson` (`shared/package-json.ts:16`) and `getPkgRoot` (`shared/package-roots.ts`) are leaves, and `checks/before/version.ts:31` already routes through `readPackageJson`. jscpd Type-1 `managed.ts:31-40` ↔ `placeholders.ts:25-34`. | One `readInstallingVersion()` in `shared/` over `readPackageJson(getPkgRoot())`; 8 sites route; one decision on throw vs `"0.0.0"`; register row "Installing bkit version". Reference check on the 4 named helpers (14 call sites) first. |
| `duplication-8` | `MEDIUM` | DUPLICATE | 48 sites in 22 files, e.g. `.bkit/core/engine/checks/after/github.ts` (8), `.bkit/core/engine/commands/install/install.ts` (7); owner `.bkit/core/engine/shared/json.ts:9` | Fail-open JSON parse: owner `parseJson` (23 call sites / 18 files; Serena and `rg -c` agree) bypassed by 48 `JSON.parse` calls inside `try` (ast-grep rule R1). All fail open today. 13 unguarded calls are not this rule: 5 deep clones, bkit-owned template parses, and `commands/install/uninstall.ts:719` (deliberate fail-closed teardown, comment `:714-715`). Overlaps `duplication-6` / `duplication-7` (their sites are a subset). | Route through `parseJson` / `readPackageJson`; R1 checked in as a structural rule with `shared/json.ts` ignored. |
| `duplication-9` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/commands/comply.ts:73`, `:90`; `.bkit/core/engine/checks/after/managed.ts:68` | Git spawn with hook vars scrubbed: owner `runGit` (`commands/lib.ts:335`, env `gitEnv()` from `ledgers/telemetry.ts:60`). 8 deliberate raw spawns keep `gitEnv()` (`commands/workflow/branches.ts:78`, `:92`, `:708`; `commands/workflow/ledgers.ts:88`, `:110`; `commands/workflow/worktrees.ts:75`; `ledgers/telemetry.ts:77`, `:98`). 3 spawn with the inherited env; `comply.ts` already imports `ledgers/telemetry.js` (`:22-27`); `managed.ts` runs in `bkit check` from `.husky/pre-push`. Same-repo `cwd` → no observed misfire. | Route through `runGit` / `git` or pass `env: gitEnv()`; literal-search guard on `"git"` spawns outside `commands/lib.ts` without `gitEnv`. |
| `duplication-10` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/shared/egress.ts:10` ↔ `:49` ↔ `.bkit/core/engine/render/models.ts:101` | opencode provider allowlist in 3 code places + 1 test literal (`render/models.test.ts:273`): `OPENCODE_PROVIDERS`, `OPENCODE_PROVIDER_DEFAULTS` keys, `GATEWAY_COLUMN`. Tied by prose ("Keep in sync", `egress.ts:7-8`; `docs/technology.md:61`); `install/cloud-env.test.ts:796` ties DEFAULTS ↔ egress rows only. Consistent today (4 providers). Co-change `egress.ts` ↔ `models.ts` 2/4. | Key `OPENCODE_PROVIDER_DEFAULTS` and `GATEWAY_COLUMN` as `Record<OpencodeProvider, …>` (a missing provider fails `tsc`), test derives from `OPENCODE_PROVIDERS`. |
| `duplication-11` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/commands/install/upgrade.ts:599`, `:611`, `:627` | Package manager: owner `PACKAGE_RUNNER` ("the one place that names the package manager", `shared/package-manager.ts:1-8`) routed by `shared/bkit-latest.ts:76`, `commands/workflow/branches.ts:867`, `commands/workflow/tests.ts:300`, `:460`; `upgrade.ts` spawns `"pnpm"` literally (`:611`, `:627`) and builds `addCmd` (`:599`). Advisory prose naming `pnpm` (~30 strings) and gate-script values written to consumer `package.json` (`install/manifest.ts:225-245`) are data, not mechanism. | `upgrade.ts` spawns `PACKAGE_RUNNER`; literal-search guard `spawnSync("pnpm"` with owner allowlist. |
| `duplication-12` | `MEDIUM` | DUPLICATE | `.bkit/core/engine/commands/workflow/branches.ts:49-51`; `.bkit/core/engine/commands/workflow/worktrees.ts:25` | Shared-branch rule: `const DEV = "dev"` twice; module-private `SHARED_BRANCHES` (`branches.ts:51`); inline predicates `runs.ts:312`, `prs.ts:246`, `worktrees.ts:106`, `:252`, `:371`, `checks/after/managed.ts:51` (`PROTECTED_BRANCHES`); 35 `"dev"` literals in 9 non-test files (`rg -c`). Consistent. Co-change `branches.ts` ↔ `worktrees.ts` 2/2. | Export `DEV`, `SHARED_BRANCHES`, `isSharedBranch()` from `commands/lib.ts`; sites route. |
| `duplication-13` | `LOW` | OTHER | `.bkit/core/engine/ledgers/status.ts:10-12` | Prose claims "bkit workflows execute an inline jq filter that mirrors `fold` exactly"; no jq fold remains (`rg` over `.bkit/core/workflows`, `.bkit/core/prompts` → none; workflows call `bkit counters` / `bkit status`). Stale tie to a copy that no longer exists. | Comment states the current readers. |
| `duplication-14` | `LOW` | OTHER | `docs/capabilities.md:17`, `:40`, `:80`, `:96`, `:140`, `:154`; source `.bkit/templates/scripts/graphify/bkit-graphify-rollup.py:771`, `:794` | Register prose cites app-stack guards and paths bkit does not have (`tooling/eslint/tests/owned-query-shape-guard.test.ts`, `hide-nodes-registry.test.ts` — both absent; Jest, Hono, `v1.ts`), hardcoded in the shipped rollup template and its adopted copy (`scripts/graphify/bkit-graphify-rollup.py:774`, `:797`, `:845`). Register row "Cursor API access" `bypassed` 1 of 2: the bypass is `scripts/secrets/bkit-secrets.mjs:27` (standalone copy-and-own script), note names no blocker. No status changes. | Rollup prose derived from the repo's own guards; register note names the deliberate bypass. |
| `duplication-15` | `LOW` | DUPLICATE | `.bkit/core/engine/commands/workflow/branches.ts:111`, `.bkit/core/engine/commands/workflow/prs.ts:147` | Current-branch read: 2 module-private helpers + 12 inline `git(…, ["branch", "--show-current"])` (`rg -n '"--show-current"'`), each choosing its own detached-HEAD fallback (`""`, `null`, `"HEAD"`, throw). Per-site fallbacks look deliberate. | `currentBranch(cwd)` returning `string \| null` in `commands/lib.ts`; callers keep their fallback. |
| `duplication-16` | `LOW` | DUPLICATE | `.bkit/core/engine/commands/install/upgrade.ts:148`; `.bkit/core/engine/commands/install/uninstall.ts:943` | Verb log prefix: owner `shared/log-prefix.ts:5` (`setLogPrefix`, imported by `cli.ts:9`, `render/models.ts:6`, `render/hosts.ts:5`, `commands/install/check.ts:9`, `uninstall.ts:56`). `upgrade.ts:148` exports its own `LOG_PREFIX = "[bkit-upgrade]"` beside `setLogPrefix("[bkit-upgrade]")` (`:632`); `uninstall.ts:943` shadows the import with a local `"[bkit-uninstall]"` beside `setLogPrefix` (`:1033`). Same strings today. | Both read the shared `LOG_PREFIX`; local constants removed. |

Empty and clean → one row `None`.

## Report

### Summary

- **Findings:** 16 — `CRITICAL` 0 · `HIGH` 3 · `MEDIUM` 9 · `LOW` 4.
- **Verdicts:** findings `DUPLICATE` 14 · `OTHER` 2; carried forward `COINCIDENTAL` 14 · `RULE-OF-THREE-PENDING` 3.
- **Highest risk:** `duplication-1` — the guardrails hook has two shell parsers; the naive one decides the `fetch` tier, so `sh -c 'curl …'` / `$(curl …)` skip the Cursor / Codex outbound-fetch prompt. `duplication-2` — analysis restates the outcome row type with a field the writer puts on the counter row, so the trust tally always reads 0 trusted runs. `duplication-3` — the local static gate and the shipped CI static lane disagree on `lint`.
- **Shape:** most `MEDIUM` rows are owners that landed (`parseJson`, `readBkitConfig`, `runGit` / `gitEnv`, `PACKAGE_RUNNER`, `removeOrphans`) with older or newer call sites never routed; new hosts (codex, antigravity, opencode) were added by copying the previous host module.
- **Clones:** Type-1 2.6% of 50,787 source lines outside the deliberate template ↔ root copies (baseline).
- **Guard or sweep:** **guard** — extend the existing drift-rule register (`scripts/graphify/bkit-graph-drift-rules.json`, 3 rules) with this run's mechanism markers and check in the R1 structural rule; a further sweep alone re-finds the same bypasses.

### Previous Run

Baseline — no prior `docs/audits/*/duplication.md`. Seed: graphify name-collision pass 2026-10-09 (cbartens/bkit#473, untrusted), re-checked at `5f5a097c`.

<!-- prettier-ignore -->
| Seed (#473) | Then | Now (`file:line`) | Status |
| --- | --- | --- | --- |
| `removeOrphans` | install vs modules copy; modules copy lacked the allowlist guard | one definition `.bkit/core/engine/install/modules/core.ts:76`, guard `ORPHAN_PRUNE_DIRS` `:69-74` | Fixed as a name duplicate; capability re-bypassed by 6 inline sweeps in newer host modules → `duplication-5` |
| `parseDotenv` | cloud-env vs launch; launch copy kept `export ` | one definition `.bkit/core/engine/install/cloud-env.ts:140`, strips `export` at `:146`; `launch.ts` / `doctor.ts` import it | Fixed; `bkit-secrets.mjs` copy = `COINCIDENTAL` (`Carried Forward`) |
| `detectMarkerStyle` | uninstall vs upgrade (line vs substring match) | one definition `.bkit/core/engine/install/managed-block.ts:134` | Fixed |
| `resolveRepoSlug` | telemetry vs tokens | one definition `.bkit/core/engine/ledgers/telemetry.ts:97` | Fixed |
| `installFile` / `listMdFiles` / `ensureDir` | install vs modules vs tiers | `install/modules/core.ts:41` / `:33`; `install/write.ts:270` | Fixed |
| `gitEnv` | telemetry vs tokens | one definition `ledgers/telemetry.ts:60` | Fixed as a name duplicate; 3 git spawns skip it → `duplication-9` |
| `dedupeById` | postinstall vs preflight | one definition `.bkit/core/engine/checks/before/index.ts:60` | Fixed |

Closure: 7/7 seeds fixed (100%); 2 re-opened in a new shape. Oldest open: none (baseline).

### Inline Rules

<!-- prettier-ignore -->
| Rule | Helper (owner) | Routed | Inline | Unmigrated | Verdict | Search rule |
| --- | --- | --- | --- | --- | --- | --- |
| R1 fail-open JSON parse | `shared/json.ts:9` `parseJson` | 23 call sites / 18 files (`rg -c 'parseJson\('`; Serena `find_referencing_symbols` → same 23) | 48 in `try` (22 files) + 13 unguarded | 48 | DUPLICATE `duplication-8` | ast-grep `r1-json-parse-in-try` / `r1b-json-parse-unguarded` (below) |
| R2 consumer `bkit` key | `shared/settings.ts:46` `readBkitConfig` | 12 | 13 reads | 13 (6 gratuitous, 7 owner gap) | DUPLICATE `duplication-6` | `rg -n 'bkit\?\.(issueTracker\|opencodeProvider\|cloudAgents\|githubProject)\|pkg\.bkit' .bkit/core/engine --glob '!*.test.ts'` — read sites only; writer sites `commands/install/install.ts:451-464`, `commands/install/uninstall.ts:720-721`, `:973-992`, `install/modules/cloud.ts:30-33` and owner `shared/settings.ts:49` excluded |
| R3 installing bkit version | none | 0 | 8 | 8 | DUPLICATE `duplication-7` | `rg -n 'getPkgRoot\(\), "package.json"\|PKG_ROOT, "package.json"' .bkit/core/engine --glob '!*.test.ts'` |
| R4 shared branch | `branches.ts:51` `SHARED_BRANCHES` (module-private) | 1 file | 6 predicates + `DEV` ×2 + 35 `"dev"` lines | 6 | DUPLICATE `duplication-12` | `rg -n '"dev" \|\| .*"main"\|=== DEV \|\|\|=== "dev" \|\|' .bkit/core/engine`; `rg -c '"dev"'` |
| R5 package runner | `shared/package-manager.ts:8` `PACKAGE_RUNNER` | 4 | 3 | 3 | DUPLICATE `duplication-11` | `rg -n '(spawn\|spawnSync\|execFileSync)\(\s*"(pnpm\|npm\|npx)"\|`pnpm \$\{' .bkit/core/engine --glob '!*.test.ts'` |
| R6 current branch | `branches.ts:111` / `prs.ts:147` (module-private) | 2 helpers | 12 | 12 | DUPLICATE `duplication-15` | `rg -n '"--show-current"\|"--abbrev-ref", "HEAD"' .bkit/core/engine --glob '!*.test.ts'` |
| R7 gate-config basenames | `hooks/gateguard-engine.js:9` | 5 host GateGuard hooks (rendered) | 1 table (`shared/protected-paths.ts:59`) | 1 | DUPLICATE `duplication-4` | `rg -n --hidden 'GATE_CONFIG_PATTERNS' .bkit .claude` |

R1 rules (`tmp/audit-duplication/rules/`, run `npx --yes -p @ast-grep/cli ast-grep scan --no-ignore hidden --rule <file> .bkit/core/engine --json=stream`):

```yaml
id: r1-json-parse-in-try
language: TypeScript
message: inline fail-open JSON.parse (owner shared/json.ts parseJson)
rule:
  pattern: JSON.parse($$$ARGS)
  inside:
    kind: try_statement
    stopBy: end
ignores:
  - "**/*.test.ts"
  - ".bkit/core/engine/shared/json.ts"
---
id: r1b-json-parse-unguarded
language: TypeScript
message: JSON.parse outside any try (throws on malformed input)
rule:
  pattern: JSON.parse($$$ARGS)
  not:
    inside:
      kind: try_statement
      stopBy: end
ignores:
  - "**/*.test.ts"
  - ".bkit/core/engine/shared/json.ts"
```

R1 inline per file: `checks/after/github.ts` 8 · `commands/install/install.ts` 7 · `install/modules/opencode.ts` 4 · `install/write.ts` 3 · `install/modules/core.ts` 3 · `commands/install/uninstall.ts` 3 · `install/modules/claude.ts`, `commands/install/doctor.ts`, `checks/before/index.ts`, `checks/after/ci-yml.ts` 2 each · 12 files 1 each.

### Clones

jscpd 5.4.1; roots `.bkit/core/engine`, `.bkit/core/hooks`, `.bkit/core/.{claude,cursor,codex,agents,opencode}`, `.bkit/templates/scripts`, `scripts`; formats ts / js / python / bash; tests, `dist`, `node_modules` ignored; `--min-tokens 50`.

<!-- prettier-ignore -->
| Pass | Flags | Clones | Duplicated | % |
| --- | --- | --- | --- | --- |
| Type-1 exact | `--mode strict` | 97 | 5181 / 50752 lines | 10.21% |
| Type-2 renamed | `--mode weak --ignore-identifiers --ignore-literals --kind renamed` | 434 | — | 15.69% |
| Type-3 near-miss | `--mode weak --similarity 0.85 --kind ast` | 4 | 70 lines | 0.14% |

Type-1 includes 23 clones / 4336 lines between `.bkit/templates/scripts/**` and adopted root `scripts/**` — deliberate copy-and-own, each guarded by `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`. Per area with those pairs excluded (union of cloned line ranges ÷ `git ls-files` line count; `tmp/audit-duplication/per_area.py`):

<!-- prettier-ignore -->
| Area | Type-1 % | Type-2 % | Previous |
| --- | --- | --- | --- |
| `core/hooks` | 2.6 | 3.5 | baseline |
| `core/host-hooks` | 12.2 | 14.8 | baseline |
| `engine/checks` | 3.6 | 23.5 | baseline |
| `engine/cli.ts` | 0.0 | 9.3 | baseline |
| `engine/commands` | 0.5 | 12.8 | baseline |
| `engine/install` | 8.0 | 17.9 | baseline |
| `engine/ledgers` | 2.7 | 7.3 | baseline |
| `engine/render` | 12.8 | 20.3 | baseline |
| `engine/shared` | 0.0 | 8.8 | baseline |
| `engine/tools` | 0.0 | 2.4 | baseline |
| `scripts` (root) | 0.3 | 7.6 | baseline |
| `templates/scripts` | 3.3 | 6.5 | baseline |
| **Total** | **2.6** (1331 / 50787) | **12.7** | baseline |

Type-2 runs high in `checks` / `install` / `render` because declarative finding and spec tables share token shape; not knowledge duplication. Type-3 clones: `render` ↔ `render` 45 lines, `checks` 11, host hooks 7, `commands` 7.

Engine Type-1 candidates (all opened in `Verify`): `install/modules/antigravity.ts:13-55` ↔ `codex.ts:7-33` (import lists — `COINCIDENTAL`); per-host orphan sweeps and `render/hosts.ts` frontmatter prologue (`duplication-5`); `checks/after/github.ts:75-97` ↔ `checks/before/index.ts:78-105` and `github.ts:141-147` ↔ `tools.ts:380-386` ↔ `github.ts:343-349` (`duplication-6`); `checks/after/managed.ts:31-40` ↔ `install/placeholders.ts:25-34` (`duplication-7`); `commands/analysis.ts:31-44` ↔ `ledgers/telemetry.ts:344-381` (`duplication-2`); `hooks/gateguard-engine.js:164-179` ↔ `hooks/readguard-engine.js:179-193` (`RULE-OF-THREE-PENDING`); host hook drivers outside `bkit:start` / `bkit:end` (consumer-owned per host — `COINCIDENTAL`).

**Growth:** baseline — no previous report commit to diff against; Type-1 at `5f5a097c` is the series start.

**Counterparts** (host hooks rendered from one shared engine; `render/parts.ts`):

<!-- prettier-ignore -->
| Shared engine | Claude | Cursor | Codex | Antigravity | opencode |
| --- | --- | --- | --- | --- | --- |
| GateGuard (`hooks/gateguard-engine.js`) | yes | yes | yes | yes | yes (plugin) |
| ReadGuard (`hooks/readguard-engine.js`) | yes | yes | yes | yes | yes (plugin) |
| Guardrails (`hooks/guardrails-shell.js` + `guardrails-tiers.js`) | yes | yes (+ `guardrails-read.js`) | yes | yes (+ `guardrails-read.js`) | none — `opencode.json` permission map; parity table `install/modules/index.integration.test.ts` |
| Linear preflight (`bkit-preflight.sh`) | yes | yes | none | none | none — documented `.bkit/core/.bkit/providers.md:463` |

No counterpart missing without a recorded reason.

### Capabilities

Register `docs/capabilities.md` (3 rules) verify-only: `pnpm graph:check` → "matches a rebuild at 5f5a097c". Rows below the register line are derived this run; register is not edited.

<!-- prettier-ignore -->
| Capability | Owner | Callers | Measured | Register | Verdict |
| --- | --- | --- | --- | --- | --- |
| Shell command head (guardrails) | none | `fetch` + `edit` tiers → `guardrails-shell.js:22`; `deny` / `ask` / `secret` → `guardrails-tiers.js:49`, `:66` | `split` (request path: every agent shell call) | absent | DUPLICATE `duplication-1` |
| Gate-config classification | `hooks/gateguard-engine.js:53` `isGateConfig` | 5 host GateGuard hooks | `split` — `shared/protected-paths.ts:86` diverged, 0 production importers | absent | DUPLICATE `duplication-4` |
| Mirror orphan sweep | `install/modules/core.ts:76` `removeOrphans` | `claude.ts:69`, `cursor.ts:57`, `:85` | `bypassed` — 6 inline sweeps (opencode ×2, codex ×2, antigravity ×2) | absent | DUPLICATE `duplication-5` |
| Consumer `bkit` config | `shared/settings.ts:46` `readBkitConfig` | 12 | `bypassed` — 13 inline reads | absent | DUPLICATE `duplication-6` |
| Installing bkit version | none (`install/modules/core.ts:308` exported) | — | `split` — 8 copies | absent | DUPLICATE `duplication-7` |
| JSON parse, fail-open | `shared/json.ts:9` `parseJson` | 23 sites / 18 files | `bypassed` — 48 inline | absent | DUPLICATE `duplication-8` |
| Git spawn, hook vars scrubbed | `commands/lib.ts:335` `runGit` + `ledgers/telemetry.ts:60` `gitEnv` | `git` / `runGit` callers; 8 raw spawns keep `gitEnv` | `bypassed` — 3 spawns without `gitEnv` | absent | DUPLICATE `duplication-9` |
| Package manager | `shared/package-manager.ts:8` `PACKAGE_RUNNER` | `shared/bkit-latest.ts:76`, `commands/workflow/branches.ts:867`, `tests.ts:300`, `:460` | `bypassed` — `upgrade.ts:599`, `:611`, `:627` | absent | DUPLICATE `duplication-11` |
| Verb log prefix | `shared/log-prefix.ts:5` | `cli.ts:9`, `render/models.ts:6`, `render/hosts.ts:5`, `commands/install/check.ts:9`, `uninstall.ts:56` | `bypassed` — `upgrade.ts:148`, `uninstall.ts:943` | absent | DUPLICATE `duplication-16` |
| Secret-file classification | `hooks/guardrails-tiers.js:261` `secretFileKind` | `guardrails-tiers.js:302`, `hooks/guardrails-read.js:12` | `one`; cross-host parity table `install/modules/index.integration.test.ts:538+` | absent | none |
| Status-log location | `commands/lib.ts:458` `statusLocation` | `workflows.ts:189`, `status.ts:259` | `one` | absent | none |
| Managed-version marker | `install/version-file.ts` | — | `one` (graph:check rebuild) | `one` | match |
| Tracker block substitution | `render/trackers.ts` | — | `one` | `one` | match |
| Cursor API access | `shared/egress.ts` | — | `bypassed` 1 of 2 — `scripts/secrets/bkit-secrets.mjs:27` (standalone copy-and-own script) | `bypassed` | match; note names no blocker → `duplication-14` |

Module-graph duplicate-name check (graphify `graph.json`, callable nodes, 3+ distinct non-test files): `main` ×14 (entry points), `emit` / `adviseOnce` / `agCallSignature` / `fromAntigravityPayload` / `bkitGateguard` (rendered `.agents/plugins/bkit/hooks/*.cjs` from one source), `shellWords` ×4 (2 sources: `COINCIDENTAL`), `currentBranch` ×3 (`duplication-15` + `COINCIDENTAL`), `fold` ×3 (`COINCIDENTAL` names; ledger fold pair `RULE-OF-THREE-PENDING`), `isGateConfig` ×3 (`duplication-4`). God nodes not re-ranked (no owner gone load-bearing among this run's owners — each has ≤ 23 call sites).

### Types

Schema source = ledger codec (`.bkit/core/engine/ledgers/telemetry.ts` payload types; `.bkit/jsonl.md` § Per-Kind Fields). No DB / IDL.

<!-- prettier-ignore -->
| Restated type | Source | Derived? | Drift | Verdict |
| --- | --- | --- | --- | --- |
| `commands/analysis.ts:28` `OutcomeRow` | `ledgers/telemetry.ts:338` `OutcomePayload` | no (hand interface) | adds `counterSource?` (a `CounterPayload` field, `telemetry.ts:420`) → live defect at `analysis.ts:203`, `:459` | DUPLICATE `duplication-2` |
| `commands/analysis.ts:48` `ComplianceRow` | `ledgers/telemetry.ts:317` `CompliancePayload`; derived twin `commands/comply.ts:204` (same name) | no | subset (drops `evidence?`, `workflow`); no foreign field | DUPLICATE (folds into the `duplication-2` fix) |
| `commands/analysis.ts:317` `DeferralRow` | `ledgers/telemetry.ts:457` `DeferralPayload` | no | subset with loosened types (`severity` / `reason` / `status` as `string`); no foreign field | DUPLICATE (folds into the `duplication-2` fix) |
| `checks/status-holes.ts:90` `StatusRow` (interface, named optional fields) | `ledgers/status.ts:118` `StatusRow = { type: string } & Record<string, unknown>` | no | compatible widening; no foreign field | `RULE-OF-THREE-PENDING` (`Carried Forward`) |

### Libraries

<!-- prettier-ignore -->
| Job / package | Versions or pair | Reason | Verdict |
| --- | --- | --- | --- |
| Same-job pairs | none — devDependencies `@types/node`, `@vitest/coverage-v8`, `husky`, `lint-staged`, `prettier`, `slop-scan`, `tsx`, `typescript`, `vite`, `vitest`, `yaml`; 0 runtime dependencies | — | none |
| `esbuild` | 0.28.1 / 0.28.2 | `pnpm dedupe --check` exit 1: `vite@6.4.3` resolves 0.28.1; override `esbuild: ^0.28.0` | `bkit-audit-dependencies` (dedupable) |
| `picomatch` | 2.3.2 / 4.0.7 | transitive majors (`pnpm why picomatch`) | `COINCIDENTAL` (not chosen here) |
| `typescript` | 5.9.3 / 7.0.2 | 5.9.3 pinned by `slop-scan`; 7.0.2 direct (`pnpm why typescript`) | `COINCIDENTAL` (tool-internal) |

### Wrong Abstractions

<!-- prettier-ignore -->
| Helper | Params | Callers | Knowledge | Verdict |
| --- | --- | --- | --- | --- |
| `commands/lib.ts:458` `statusLocation` | `opts` with `workflow`, `devPushes?` | 2 (`workflows.ts:189`, `status.ts:259`) | one rule — where a run's `status.jsonl` lives; branches on data (`ship`), not on caller | keep |
| `install/modules/core.ts:76` `removeOrphans` | `dryRun`, `prefix?` | 4 | one — prune generated mirror files | keep; widen per `duplication-5` (extension + dir mode), watch for >2 flags |
| `checks/after/index.ts:165` `renderAdvisoriesMarkdown` / `:229` `writeAdvisoriesArtifact` | `opts.mode` | 3 (`install.ts:332`, `:589`, `doctor.ts:168`) | one — the advisories artifact | keep |
| `install/write.ts:366` `writeTier2` | `markerStyle`, `dryRun` | 17 | one — managed-block write | keep |
| `shared/protected-paths.ts:86` `isGateConfig` | `dogfood` | 0 production | — | not a wrong abstraction; dead copy → `duplication-4` |

No landed merge serves different knowledge.

### Coupling

`git log --since=2026-10-10 --no-merges --name-only` (198 commits; history before the engine move sits under old paths); share = both ÷ min(a, b); `tmp/audit-duplication/cochange.py`.

<!-- prettier-ignore -->
| Pair | Co-change | Import edge | Verdict |
| --- | --- | --- | --- |
| `hooks/guardrails-shell.js` ↔ `hooks/guardrails-tiers.js` | 2/2 (100%) | none (concatenated into one hook script) | changed together, parsers still diverged at 3e306b5a → consolidate (`duplication-1`) |
| `install/manifest.ts` ↔ `.bkit/templates/.github/workflows/bkit-ci.yml` | 2/8 (25%) | none; prose tie `manifest.ts:226` | changed separately, already diverged (`lint`) → pick the right behaviour first (`duplication-3`) |
| `shared/protected-paths.ts` ↔ `hooks/gateguard-engine.js` | 2/2 (both moves) | none; prose tie `protected-paths.ts:54-56` | 0b619998 touched the engine only → diverged (`duplication-4`) |
| `install/placeholders.ts` ↔ `install/modules/core.ts` / `checks/after/managed.ts` | 4/4 / 2/4 | none for the version read; prose ties `placeholders.ts:22`, `managed.ts:28`, `core.ts:304` | one decision → consolidate (`duplication-7`) |
| `install/modules/core.ts` ↔ `commands/install/install.ts` | 10/17 (59%) | yes | install flow; version-read copies inside → `duplication-7` |
| `checks/after/github.ts` ↔ `checks/before/index.ts` | 3/6 (50%) | type-only (`PreflightFinding`) | consolidate (`duplication-6`) |
| `install/modules/opencode.ts` ↔ `commands/install/install.ts` | 4/7 (57%) | yes | provider read twice → `duplication-6` |
| `shared/egress.ts` ↔ `render/models.ts` | 2/4 (50%) | yes (`OPENCODE_PROVIDER_DEFAULTS`), not for `GATEWAY_COLUMN`; prose tie `egress.ts:7-8` | paired decision → `duplication-10` |
| `commands/analysis.ts` ↔ `ledgers/telemetry.ts` | 1/2 | yes (`foldFrom`), type restated | `duplication-2` |
| `commands/workflow/branches.ts` ↔ `worktrees.ts` | 2/2 | none for `DEV` | `duplication-12` |
| `shared/package-manager.ts` ↔ `commands/install/upgrade.ts` | 1/1 | none | `duplication-11` |
| `commands/lib.ts` ↔ `commands/comply.ts` | 2/3 | none (`comply.ts` imports `gitEnv`'s module, not `lib.ts`) | `duplication-9` |
| `ledgers/telemetry.ts` ↔ `commands/workflow/roadmap.ts` | 1/5 (20%) | yes (`compareTs`) | changed separately, still consistent → `RULE-OF-THREE-PENDING` |
| `hooks/gateguard-engine.js` ↔ `hooks/readguard-engine.js` (TTL GC) | — | none | `RULE-OF-THREE-PENDING` |

Reverse detector (cross-folder, >50%, ≥5 shared, no import edge): `commands/install/upgrade.ts` ↔ `install/modules/core.ts` 11/17 (transitive edge via `install/modules/index.ts`; version-read copies → `duplication-7`); `cli.ts` ↔ `install/modules/antigravity.ts` 5/7 (host-flag plumbing per feature commit — `COINCIDENTAL`); `checks/after/auth.ts` ↔ `install/modules/cloud.ts` 5/8 (shared refactor / feature commits — `COINCIDENTAL`); `commands/install/uninstall.ts` ↔ `install/modules/index.ts` 5/7 (install ↔ uninstall symmetry; tied by `commands/install/uninstall.integration.test.ts`).

Other prose ties read: `install/cloud-env.ts:310` (`provision` list = `bkit context list-blocks` — one function); `install/modules/opencode.ts:144` (derives from the same registry); `ledgers/telemetry.ts:439`, `:479` (field doc mirrors) — no second copy.

### Method

<!-- prettier-ignore -->
| Claim type | Grade | Tool / basis |
| --- | --- | --- |
| Second implementation exists (`duplication-1`..`-12`, `-15`) | high | every site opened (`sed -n` / Read) at `5f5a097c`; not taken from a match list |
| Live defect `duplication-2` | high | writer → fold → `computeRegression` → report line read end to end (`workflows.ts:755-775`, `analysis.ts:188-210`, `:418-429`, `:459`) |
| Fetch-tier bypass `duplication-1` | medium | static trace of `classifyShell` → `usesFetch` → `segmentHead`; hook not executed (`Not Checked`) |
| Call-site counts (R1 48, `parseJson` 23, `readBkitConfig` 12, `"dev"` 35, R6 12) | medium | ast-grep 0.51.0 JSON stream (R1, exact per match); `rg -c` (counts lines, not matches); `parseJson` 23 = Serena `find_referencing_symbols` = `rg -c` (agree → strongest) |
| "No production consumer" (`protected-paths.ts` gate half, `gate-paths.generated.cjs`) | medium | `rg --hidden` over repo + `commands/comply.ts:21` import read; no Serena (`.cjs` outside the TS project) |
| "Does not exist" (CI `lint` step, workflow jq fold, wrapped-fetch test row) | high within the named roots | `rg` over `.bkit/templates/.github/workflows/bkit-ci.yml`, `.bkit/core/workflows`, `.bkit/core/prompts`, `install/modules/index.integration.test.ts` |
| Clone % | medium | jscpd 5.4.1 JSON; per-area numerator = union of cloned line ranges, denominator = `git ls-files` line count (python) |
| Co-change shares | medium | `git log --name-only` since 2026-10-10 only (engine moved paths then; earlier history not followed) |
| Duplicate-name candidates | presence only | graphify 0.9.50 `graph.json`; misses module-level initialisers and anonymous callbacks; never used for absence |

Corrections this run: (1) R1 inline count 49 → 48 — first tally read off the stream output by eye; re-tallied by `awk` over `tmp/audit-duplication/r1.txt`. (2) `parseJson` routed 20 → 23 — first count by eye from `rg -n`; `rg -c` and Serena both give 23. (3) `protected-paths` consumer search from repo root returned only `dist/` and docs — `rg` skips the hidden `.bkit/`; re-run with `--hidden` found the 5 host GateGuard hooks and the test.

### Prevention

Guards in place and what each catches:

<!-- prettier-ignore -->
| Guard | Where | Catches | This run's findings caught |
| --- | --- | --- | --- |
| slop-scan `structure.duplicate-function-signatures` | `slop-scan.config.json`; `pnpm slop:delta` pre-push + CI | identical signatures only | 0 |
| Capability drift rules + `pnpm graph:check` | `scripts/graphify/bkit-graph-drift-rules.json` (3 rules); `.github/workflows/bkit-ci.yml:578` on `dev` pushes | a new site of a registered literal marker outside its owner | 0 — none of the 9 capabilities here is registered |
| `dogfood-templates.test.ts` | `.bkit/core/engine/audits/repo/` | template ↔ adopted root copy drift | n/a (no finding) |
| Cross-host verdict table | `install/modules/index.integration.test.ts` | host hooks disagreeing on a listed command | 0 — no wrapped-fetch row (`duplication-1`) |
| `protected-paths.test.ts` | `shared/` | generator ↔ committed `.cjs` | 0 — not engine ↔ table (`duplication-4`) |

Recorded decision `graphify-register-scripts-design` (`docs/decisions.jsonl`) chose literal-marker drift rules with an owner per capability; no decision on structural rules or a clone-detector gate. Evidence since: the mechanism works but is under-seeded (3 rules vs 9 measured capabilities) — it does not contradict the decision.

**Next step: guard.** Starting rules (do not build here):

- Drift rules (literal marker → owner): `spawnSync("pnpm"` → `shared/package-manager.ts`; `getPkgRoot(), "package.json"` → the `duplication-7` owner; `delete orphan` → `install/modules/core.ts`; `GATE_CONFIG_PATTERNS` → `hooks/gateguard-engine.js`; `pkg.bkit` (read scope) → `shared/settings.ts`; `"--show-current"` → `commands/lib.ts`; `spawnSync("git"` → `commands/lib.ts` with a budget of 8 for the deliberate raw spawns (a literal rule cannot see a missing `gitEnv`; pair it with a structural rule).
- Structural rules checked in (ast-grep `sgconfig.yml`): R1 `JSON.parse` inside `try` outside `shared/json.ts` (budget 48, ratchet down); `spawnSync("git", …)` / `execFileSync("git", …)` whose options lack `env` outside `commands/lib.ts`.
- Paired-decision checks: `OPENCODE_PROVIDER_DEFAULTS` / `GATEWAY_COLUMN` typed `Record<OpencodeProvider, …>`; a test tying `bkit:gate:static` components to `bkit-tests-static` steps; wrapped-command rows in the cross-host table.

### Carried Forward

<!-- prettier-ignore -->
| Pair / set | Verdict | Why | Re-check trigger |
| --- | --- | --- | --- |
| Ledger fold `ledgers/telemetry.ts:858` ↔ `commands/workflow/roadmap.ts:91-101` `project` | RULE-OF-THREE-PENDING | same last-write-wins by `key` (telemetry identity for `feature` = kind + repo + key, `:584-586`); both use `compareTs`; consistent | a third fold |
| Session-state TTL GC `hooks/gateguard-engine.js:162-173` ↔ `hooks/readguard-engine.js:178-188` | RULE-OF-THREE-PENDING | same 24h sweep; each engine renders into a separate host script | a third hook state dir |
| `StatusRow` `checks/status-holes.ts:90` ↔ `ledgers/status.ts:118` | RULE-OF-THREE-PENDING | compatible widening | a third restatement |
| `shellWords` `hooks/guardrails-tiers.js:15` vs `hooks/readguard-engine.js:21` | COINCIDENTAL | ReadGuard returns `null` on anything it does not model; guardrails tokenises best-effort | — |
| `currentBranch` `checks/after/managed.ts:61` vs workflow helpers | COINCIDENTAL | prefers CI `GITHUB_BASE_REF` / `GITHUB_REF_NAME` — gate target, not checkout | — |
| `fold` name ×3 (`ledgers/status.ts:72`, `commands/workflow/roadmap.ts:317`) | COINCIDENTAL | status-event reducer and a CLI handler share a name only | — |
| dotenv parse `.bkit/templates/scripts/secrets/bkit-secrets.mjs:43`, `:307` (+ root copy) vs `install/cloud-env.ts:140` | COINCIDENTAL | standalone copy-and-own script, cannot import the engine | — |
| `.envrc` export regex `install/cloud-env.ts:132` vs `parseDotenv` | COINCIDENTAL | different file format | — |
| Strict `JSON.parse` `commands/install/uninstall.ts:719` | COINCIDENTAL | deliberate fail-closed teardown (`:714-715`) | — |
| `JSON.parse(JSON.stringify(…))` ×5 (`uninstall.ts:157`, `:167`, `:232`; `install/modules/opencode.ts:444`, `:448`) | COINCIDENTAL | deep clone, not input parsing | — |
| Template ↔ root adopted copies (23 clones / 4336 lines) | COINCIDENTAL | copy-and-own by design; guarded | — |
| Host hook drivers outside `bkit:start` / `bkit:end` | COINCIDENTAL | consumer-owned per host | — |
| `install/modules/antigravity.ts:13-55` ↔ `codex.ts:7-33` | COINCIDENTAL | import lists | — |
| Rendered `.agents/plugins/bkit/hooks/*.cjs` names (`emit`, `adviseOnce`, …) | COINCIDENTAL | one source (`hooks/antigravity-hook.js`) | — |
| `picomatch` 2.3.2 / 4.0.7; `typescript` 5.9.3 / 7.0.2 | COINCIDENTAL | transitive / tool-internal | — |
| Co-change `cli.ts` ↔ `install/modules/antigravity.ts`; `checks/after/auth.ts` ↔ `install/modules/cloud.ts` | COINCIDENTAL | feature / refactor commits, no shared decision found | — |
| Type-2 token clones in `checks` / `install` / `render` spec tables | COINCIDENTAL | declarative data with shared shape | — |

### Checked

- **Surface map:** one package `@cbartens/bkit` (pnpm 10.34.5, no workspace). Source roots: engine `.bkit/core/engine/{audits,checks,commands,install,ledgers,render,shared,tools,cli.ts}`; hook engines `.bkit/core/hooks/*.js`; host hook templates `.bkit/core/{.claude,.cursor,.codex,.agents/plugins/bkit}/hooks/`, `.bkit/core/.opencode/plugin/`; copy-and-own `.bkit/templates/scripts/**` + adopted root `scripts/**`. Platforms: 5 host targets (Claude, Cursor, Codex, Antigravity, opencode).
- **Shared homes:** `shared/` (10 modules: `bkit-latest`, `egress`, `json`, `log-prefix`, `package-json`, `package-manager`, `package-roots`, `protected-paths`, `settings`, `timeouts`), `commands/lib.ts`, `install/modules/core.ts`, `install/write.ts`, `install/managed-block.ts`, `ledgers/telemetry.ts`.
- **Register:** `docs/capabilities.md` — 3 rules; `pnpm graph:check` matches.
- **Gates:** see `Prevention` (slop-scan identical-signature rule; drift rules + `graph:check`; `dogfood-templates.test.ts`; cross-host verdict table; `protected-paths.test.ts`; `install/cloud-env.test.ts:796`; `audits/templates/templates-content.test.ts:579`).
- **Absent surfaces:** SQL (`git ls-files '*.sql'` → 0), i18n (`git ls-files '**/locales/**' '**/i18n/**' '*.po'` → 0).
- **Shared config:** `tsconfig.test.json` extends `tsconfig.json`; root ↔ template configs entered in `dogfood-templates.test.ts`.
- **#473 seeds:** 7/7 re-read (`Previous Run`).

### Not Checked

- Runtime confirmation of `duplication-1` — guardrails hook not executed with `sh -c 'curl …'` / `$(curl …)` payloads (read-only audit; static trace only).
- code-maat coupling strength / entity effort — tool absent; `git log --name-only` shares used instead.
- Co-change before 2026-10-10 — the engine move to `.bkit/core/engine` breaks path continuity; `--follow` per pair not run.
- Test-only clones — tests excluded from jscpd roots.
- Markdown duplication across workflows / prompts / templates — jscpd format list excluded `markdown`; prose duplication belongs to the wording check (`tools/wording.ts`).
- Clone blame per introducer — baseline run, nothing to diff against.
- GitClear 2026 report read at search-result level only (primary page not fetched).

### Standards Coverage

<!-- prettier-ignore -->
| Standard / item | Version read | Status |
| --- | --- | --- |
| Clone detector — jscpd | 5.4.1 (release page read 2026-10-17) | checked (Step 4); `--kind renamed` / `--kind ast` used for Type-2 / Type-3 |
| Structural search — ast-grep | 0.51.0 (run 2026-10-17) | checked (Step 3); adopt: check rules into `sgconfig.yml` (`Prevention`) |
| DRY as knowledge (_The Pragmatic Programmer_, 20th anniversary ed., 2019) | 2nd ed. | checked — verdict test "same knowledge, same reason to change" applied per row (Step 13) |
| Rule of three / "The Wrong Abstraction" (Sandi Metz, 2016) | blog post 2016-01-20 | checked (Step 9, `RULE-OF-THREE-PENDING` rows) |
| Change coupling — code-maat | 1.0.1 (Clojars listing; not run) | partial — `git log` shares instead (Step 10); adopt code-maat when ≥2 paired decisions stay open |
| Package-manager dedupe — `pnpm dedupe --check` | pnpm 10.34.5 | checked (Step 7) → `esbuild` dedupable |
| AI-assisted code-quality research — GitClear | "Write-Only Mode: AI Code Quality in 2026" (search-result level) | checked — reports rising copy/paste; matches this run's "new host = copied module" pattern (`duplication-5`) |
| Type-1 exact | — | checked (Step 4) |
| Type-2 renamed | — | checked (Step 4) |
| Type-3 near-miss | — | checked (Step 4) |
| Type-4 semantic | — | checked via capability altitude (Step 5: literal-mechanism + duplicate-name) — no tool detects it directly |
| Shape: rule | — | checked (Step 3) → `duplication-6`, `-7`, `-8`, `-11`, `-12`, `-15`, `-16` |
| Shape: capability | — | checked (Step 5) → `duplication-1`, `-4`, `-5`, `-9` |
| Shape: paired decision | — | checked (Step 10) → `duplication-3`, `-10` |

### Beyond the Steps

(a) Changes since the 2026-10-09 seed that touch duplication:

- `shared/json.ts` (937506fb) — new owner; 48 inline sites not migrated → `duplication-8`.
- `shared/{package-json,package-manager,package-roots,settings,egress,protected-paths,timeouts}.ts`, `commands/lib.ts` (engine move 5e527e4a) — owners; bypasses → `duplication-4`, `-6`, `-9`, `-11`.
- `shared/log-prefix.ts` (d561683a) — owner of the verb log prefix; shadowed by `commands/install/upgrade.ts:148` (exported constant, same string as its `setLogPrefix` call at `:632`) and `commands/install/uninstall.ts:943` (local) → `duplication-16`.
- `shared/bkit-latest.ts` (c8caba09, 2026-10-17) — routes `parseJson`, `PACKAGE_RUNNER`, `readBkitVersion`; clean.
- `hooks/{gateguard-engine,guardrails-shell,guardrails-tiers,gateguard-edit-payload}.js` (3b8d9468) — `duplication-1`, `-4`.
- `hooks/{readguard-engine,readguard-payload,antigravity-hook}.js` (638138f3) — `shellWords` twin `COINCIDENTAL`; TTL GC `RULE-OF-THREE-PENDING`.
- `hooks/guardrails-read.js` (9432a33e) — routes `secretFileKind`; clean.
- Antigravity host (98c82c42, 3e426d72) — copied sweep and frontmatter prologue → `duplication-5`.
- `.bkit/core/hooks/gateguard-engine.js` patterns for other ecosystems (0b619998) — landed in one copy → `duplication-4`.
- Dependencies (`git diff 'HEAD@{2026-10-09}' HEAD -- package.json`): `picomatch` + `@types/picomatch` removed, `yaml` added (devDependency; no second YAML parser).

(b) Senior pass:

- `docs/architecture.md` lists 2 of the 10 `shared/` modules and names `protected-paths.ts` the grader's source of truth — doc drift beyond `duplication-4` → `bkit-audit-architecture`.
- The rollup template (`.bkit/templates/scripts/graphify/bkit-graphify-rollup.py`) hardcodes one consumer's guards and stack (`duplication-14`) — a shipped surface naming an app stack; the stack-independence check belongs to the templates / architecture sweep.
- Open `docs/failures.jsonl` rows at session start (7, folded by `key`): none names these surfaces. A concurrent security audit appended 9 `audit-security-*` rows during this run; none overlaps.
- No step asks whether "Mirrors X" / "kept in sync" comments still point at a live X: 3 of 5 version-reader "Mirrors" pointers name the wrong file (`duplication-7`), `ledgers/status.ts:10-12` points at a removed copy (`duplication-13`), `shared/protected-paths.ts:54-56` claims a sync test that does not compare the two copies (`duplication-4`). First run seeing the class → watch.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Route the guardrails `fetch` and `edit` tiers through `commandLines` / `commandWords` and drop `segmentHead` | `duplication-1` | `HIGH` | `/bkit-build` | owner parser already exists in `guardrails-tiers.js`; security surface rules out a shortcut |
| 2 | Derive the analysis row types from the ledger codec and fix the `counterSource` trust tally | `duplication-2` | `HIGH` | `/bkit-design` | open choice: join counter rows by `(repo, workflow, parentSha)` or retire the trust line |
| 3 | Make the local static gate and the shipped CI static lane one decision, tied by a test | `duplication-3` | `HIGH` | `/bkit-design` | open choice: add `pnpm lint` to the template lane or declare it local-only |
| 4 | Keep one gate-config pattern table | `duplication-4` | `MEDIUM` | `/bkit-design` | open choice: delete the unused `protected-paths.ts` half or render the hook table from it |
| 5 | Route host-module orphan sweeps through a widened `removeOrphans` and share the subagent frontmatter prologue | `duplication-5` | `MEDIUM` | `/bkit-plan` | approach settled; spans 4 host modules, `render/hosts.ts` and the allowlist |
| 6 | Route consumer and own `package.json` reads through `readBkitConfig`, one installing-version reader and `parseJson` | `duplication-6`, `duplication-7`, `duplication-8` | `MEDIUM` | `/bkit-plan` | approach settled; ~30 files across `checks`, `install`, `commands/install` |
| 7 | Route the remaining git and pnpm spawns through `runGit` / `gitEnv` and `PACKAGE_RUNNER` | `duplication-9`, `duplication-11` | `MEDIUM` | `shortcut:build` | 3 files, owners exist, no security or config surface |
| 8 | Key the opencode provider tables by the provider allowlist type | `duplication-10` | `MEDIUM` | `/bkit-build` | change clear; egress allowlist is config, so no shortcut |
| 9 | Export one shared-branch rule (`DEV`, `SHARED_BRANCHES`, `isSharedBranch`) from `commands/lib.ts` | `duplication-12` | `MEDIUM` | `/bkit-build` | change clear; 9-file refactor rules out a shortcut |
| 10 | Fix stale duplication prose and fold the small helper copies | `duplication-13`, `duplication-14`, `duplication-15`, `duplication-16` | `LOW` | `/bkit-build` | change clear; includes a shipped template edit |

### Process Improvements

- **Universal** (proposed; template untouched):
  - Pre-Flight `Text Search`: add "covers dot-directories (e.g. `rg --hidden`)". A repo whose source lives under a dot-dir (`.bkit/`) returns a false empty from root-level `rg`; this run's first consumer search for `protected-paths` missed every hook.
  - Gate 2 `Tree clean`: define it as "clean of this run's writes; other writers named". Parallel audits on one checkout share `docs/failures.jsonl` and template files; this run saw a concurrent security audit's 9 ledger rows and a template edit.
  - Step 10: watch the class "prose tie names a file or test that no longer holds the other copy" (3 instances this run); propose a step if a second run sees it.
- **Project** (applied below `bkit:end` in `docs/templates/bkit-audit-duplication.md`): `Permissions`, `Pre-Flight / Dependencies`, `Step 3`, `Step 4`, `Step 5`, `Step 10` instructions — tool invocations that worked, roots, and the hidden-dir and zsh workarounds.

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [x] **No placeholders:** `grep -n PENDING` over this report → only the verdict name `RULE-OF-THREE-PENDING` and template prose; Findings (16 rows) and every `Report` section filled.
- [x] **Summary:** severity counts `CRITICAL` 0 · `HIGH` 3 · `MEDIUM` 9 · `LOW` 4 match the Findings table (awk tally); verdicts `DUPLICATE` 14 · `OTHER` 2 match; carried forward `COINCIDENTAL` 14 · `RULE-OF-THREE-PENDING` 3 match `Carried Forward`; guard-or-sweep call = **guard**.
- [x] **Series:** per-area Type-1 / Type-3 % table in `Clones` (12 areas + total 2.6% of 50,787 lines), every row marked `baseline`; growth = baseline (no previous report).
- [x] **Writes:** `git status --porcelain=v1` → this report (untracked), template `Project Instructions` (one hunk at `@@ -264,0` below `bkit:end` at line 262), and the 12-row `docs/failures.jsonl` append (ledger step, not an audited surface; `git diff --numstat` 12 / 0). Other entries belong to concurrent audits: `docs/audits/202610/{dead-code,testing}.md`, `.worktrees/audit-testing-mutation`, and the security audit's commit `40059bed` (docs only: `docs/audits/202610/security.md`, `docs/failures.jsonl`, `docs/templates/bkit-audit-security.md`; no audited source changed since `5f5a097c`). No worktree or remote target created by this run.
- [x] **Process Improvements:** `Universal` = 3 proposals, template above `bkit:end` untouched (diff hunk starts below it); `Project` = edits applied below `bkit:end`.
- [x] **Suggested Issues:** every `MEDIUM`+ ID (`duplication-1` … `duplication-12`) appears in exactly one row (grep tally 1 each); `LOW` 13–16 batched in row 10; all 10 rows carry a `Next Step` and `Reason`.
- [x] **Gate 3 - Verified:** each box above checked against the file, `git status`, `git diff` and the ledger this session.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->
